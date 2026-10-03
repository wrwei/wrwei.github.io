## Lab 1 — Autoencoders, a VAE and an anomaly detector on 8x8 digits {#lab1}

**Goal.** You build the three tools of [Section 2](#s2) and [Section 3](#s3) on 8×8 images of
handwritten digits and measure each against a baseline. First a nonlinear autoencoder is compared
with PCA at the same code size. Then the variational autoencoder of [Section 3](#s3) is trained,
its two-dimensional latent space is plotted, and its decoder is used to sample and to interpolate.
Next posterior collapse is caused on purpose, by raising the KL weight, so that you recognise its
numbers when they appear by accident. Last, a reconstruction-error anomaly detector is built with
a threshold chosen on held-out normal data, and its detection rate is measured honestly against
the classical PCA monitor. The data ship inside scikit-learn, so there is no download, and the
lab runs in about two minutes on a laptop CPU. You need NumPy, scikit-learn, PyTorch and
matplotlib. Printed numbers may differ from yours in the last digits.

### Step 1: load the digits and split them

The `load_digits` set has 1,797 images of 8×8 pixels with integer values 0 to 16. Dividing by 16
puts the pixels in $[0, 1]$, which is what a sigmoid output and a Bernoulli likelihood expect.
The split is stratified, so each digit keeps its share in both parts, and the test set is not
touched until a model is finished.

```python
import time

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

np.random.seed(0)
torch.manual_seed(0)

X, y = load_digits(return_X_y=True)
X = (X / 16.0).astype(np.float32)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
print(X_tr.shape, X_te.shape)
print(f"pixel range {X.min():.1f} to {X.max():.1f}, mean pixel {X_tr.mean():.3f}")

# A model that outputs the mean training image for every input: the floor to beat.
mean_img = X_tr.mean(axis=0)
print(f"MSE per pixel of the mean image on the test set: {((X_te - mean_img) ** 2).mean():.4f}")
Xtr_t, Xte_t = torch.from_numpy(X_tr), torch.from_numpy(X_te)
```

```output
(1437, 64) (360, 64)
pixel range 0.0 to 1.0, mean pixel 0.305
MSE per pixel of the mean image on the test set: 0.0740
```

The last line is the zero-component reconstruction: the error of a model that has learned nothing
about any particular image. Every model below must beat it, and the comparison tells you how much
of the pixel variance each one explains. Two PCA components will turn out to remove 28% of that
error ($1 - 0.0532/0.0740$) and eight about two thirds.

### Step 2: the PCA baseline

PCA with $d_z$ components is the optimal linear autoencoder ([Section 2](#s2)), so it is the
baseline any nonlinear model has to beat at the same code size. It is fitted on the training set
and scored on the test set: the reconstruction is `inverse_transform(transform(X))`, and the error
is the mean squared difference per pixel.

```python
def mse_per_pixel(a, b):
    return float(((a - b) ** 2).mean())


pca_mse = {}
for d_z in (2, 8):
    pca = PCA(n_components=d_z).fit(X_tr)
    recon = pca.inverse_transform(pca.transform(X_te))
    pca_mse[d_z] = mse_per_pixel(recon, X_te)
    print(f"PCA d_z={d_z}: test MSE per pixel {pca_mse[d_z]:.4f}")
```

```output
PCA d_z=2: test MSE per pixel 0.0532
PCA d_z=8: test MSE per pixel 0.0246
```

Two components remove 28% of the error of the mean image and eight remove 67%. The remaining
error is pixel detail that no flat subspace of that size captures.

### Step 3: an undercomplete autoencoder

The autoencoder of Figure 5.2 has one hidden layer of 128 units on each side of the code. Both
models share a `train()` helper: Adam at learning rate $10^{-3}$, batches of 64, 200 epochs, and a
seeded `torch.Generator` that fixes the shuffling, so that a rerun gives the same numbers. The
helper takes the loss as a function, because the VAE of the next step needs a different one.

```python
def train(model, data, loss_fn, epochs=200, batch=64, lr=1e-3, seed=0):
    """Adam training with seeded shuffling. loss_fn(model, xb) returns a scalar."""
    gen = torch.Generator().manual_seed(seed)
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    n = len(data)
    for _ in range(epochs):
        order = torch.randperm(n, generator=gen)
        for start in range(0, n, batch):
            xb = data[order[start:start + batch]]
            loss = loss_fn(model, xb)
            opt.zero_grad()
            loss.backward()
            opt.step()
    return model


class AutoEncoder(nn.Module):
    def __init__(self, d_in=64, d_z=2, h=128):
        super().__init__()
        self.enc = nn.Sequential(nn.Linear(d_in, h), nn.GELU(), nn.Linear(h, d_z))
        self.dec = nn.Sequential(nn.Linear(d_z, h), nn.GELU(), nn.Linear(h, d_in), nn.Sigmoid())

    def forward(self, x):
        return self.dec(self.enc(x))


def ae_loss(model, xb):
    return F.mse_loss(model(xb), xb)


aes = {}
for d_z in (2, 8):
    torch.manual_seed(0)
    t0 = time.time()
    aes[d_z] = train(AutoEncoder(d_z=d_z), Xtr_t, ae_loss)
    with torch.no_grad():
        test_mse = mse_per_pixel(aes[d_z](Xte_t).numpy(), X_te)
    print(f"AE d_z={d_z}: test MSE per pixel {test_mse:.4f} "
          f"(PCA {pca_mse[d_z]:.4f}), {time.time() - t0:.0f} s")
```

```output
AE d_z=2: test MSE per pixel 0.0368 (PCA 0.0532), 8 s
AE d_z=8: test MSE per pixel 0.0110 (PCA 0.0246), 6 s
```

The autoencoder beats PCA at both sizes. Digits lie on a curved, low-dimensional surface in pixel
space, and a nonlinear decoder can follow it where a flat subspace cannot. The sigmoid on the
output keeps reconstructions in $[0, 1]$. Do not read the gap as a general law: on data that are
nearly linear, PCA is as good and costs nothing.

### Step 4: the variational autoencoder

The VAE is the class of [Section 3](#s3) with three changes. The decoder outputs **Bernoulli
logits**, so the reconstruction term is the binary cross-entropy summed over the 64 pixels. The
KL term is kept **per latent dimension**, so that collapse can be diagnosed dimension by
dimension. And a `beta` attribute multiplies the KL, which gives the beta-VAE; $\beta = 1$ is the
ELBO itself. Both terms are in nats per image, averaged over the batch, so the loss is the
negative ELBO.

A report function gives the four numbers that matter: the negative ELBO, its two parts, and the KL
per dimension. The reconstruction term uses one sample of $\mathbf{z}$ per image, drawn with a
fixed seed.

```python
class VAE(nn.Module):
    def __init__(self, d_in=64, d_z=2, h=128, beta=1.0, gaussian=False):
        super().__init__()
        self.enc = nn.Sequential(nn.Linear(d_in, h), nn.GELU(), nn.Linear(h, 2 * d_z))
        self.dec = nn.Sequential(nn.Linear(d_z, h), nn.GELU(), nn.Linear(h, d_in))
        self.beta = beta          # KL weight; 1 gives the ELBO itself
        self.gaussian = gaussian  # True: summed squared error, i.e. sigma_x^2 = 1/2

    def encode(self, x):
        mu, logvar = self.enc(x).chunk(2, dim=-1)
        return mu, logvar

    def terms(self, x):
        """Reconstruction (nats) and KL per dimension, both averaged over the batch."""
        mu, logvar = self.encode(x)
        z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)  # reparameterisation
        out = self.dec(z)
        if self.gaussian:
            recon = F.mse_loss(out, x, reduction="sum") / len(x)
        else:  # Bernoulli decoder: out holds logits
            recon = F.binary_cross_entropy_with_logits(out, x, reduction="sum") / len(x)
        kl_dim = (-0.5 * (1 + logvar - mu**2 - logvar.exp())).mean(0)  # closed form, per dim
        return recon, kl_dim


def vae_loss(model, xb):
    recon, kl_dim = model.terms(xb)
    return recon + model.beta * kl_dim.sum()


def vae_report(model, data):
    """Negative ELBO, reconstruction, total KL and KL per dimension on `data`."""
    torch.manual_seed(1)
    with torch.no_grad():
        recon, kl_dim = model.terms(data)
    return float(recon + kl_dim.sum()), float(recon), float(kl_dim.sum()), kl_dim.numpy()


torch.manual_seed(0)
vae2 = train(VAE(d_z=2), Xtr_t, vae_loss)
neg_elbo, recon, kl, kl_dim = vae_report(vae2, Xte_t)
print(f"test -ELBO {neg_elbo:.1f} = reconstruction {recon:.1f} + KL {kl:.1f} nats")
print("KL per dimension:", np.round(kl_dim, 2))
```

```output
test -ELBO 24.9 = reconstruction 22.6 + KL 2.3 nats
KL per dimension: [1.09 1.18]
```

Read the numbers as information. The KL is the average information the code carries about an
image, in nats; divide by $\ln 2$ for bits. Here 2.3 nats is 3.3 bits, which is the information in
a choice among ten equally likely things ($\ln 10 = 2.30$): about what a class label carries, and
no more. The reconstruction term is what the decoder still cannot predict from that code. Both
dimensions are in use, with similar KL. A dimension at 0.00 would be collapsed.

### Step 5: the latent spaces side by side

A latent space is judged by what it keeps and by what lies between its points. The first test is
**separability by neighbours**: fit a 5-nearest-neighbour classifier on the training-set codes and
score it on the test-set codes. For the VAE the code is the mean $\boldsymbol{\mu}(\mathbf{x})$.
The raw 64 pixels give the ceiling. The second test is visual: decode a 10 × 10 grid of codes. For
the VAE the grid covers $[-2.5, 2.5]^2$, where the prior puts nearly all of its mass. The plain
autoencoder has no prior, so its grid covers the bounding box of its own training codes.

```python
def codes_ae(model, data):
    with torch.no_grad():
        return model.enc(data).numpy()


def codes_vae(model, data):
    with torch.no_grad():
        return model.encode(data)[0].numpy()


pca2 = PCA(n_components=2).fit(X_tr)
code_sets = {
    "PCA-2": (pca2.transform(X_tr), pca2.transform(X_te)),
    "AE-2": (codes_ae(aes[2], Xtr_t), codes_ae(aes[2], Xte_t)),
    "VAE-2": (codes_vae(vae2, Xtr_t), codes_vae(vae2, Xte_t)),
}
for name, (c_tr, c_te) in code_sets.items():
    knn = KNeighborsClassifier(5).fit(c_tr, y_tr)
    print(f"{name}: 5-NN test accuracy {knn.score(c_te, y_te):.3f}")
raw = KNeighborsClassifier(5).fit(X_tr, y_tr)
print(f"raw 64 pixels: {raw.score(X_te, y_te):.3f}  (reference)")


def tile(images, n_rows, n_cols):
    """Arrange n_rows * n_cols 8x8 images in one mosaic, row by row."""
    imgs = images.reshape(n_rows, n_cols, 8, 8)
    return imgs.transpose(0, 2, 1, 3).reshape(n_rows * 8, n_cols * 8)


def decode_grid(decode, lo, hi, n=10):
    """Decode an n x n grid of 2D codes; the top row has the largest second coordinate."""
    g1 = np.linspace(lo[0], hi[0], n)
    g2 = np.linspace(hi[1], lo[1], n)
    zz = np.array([[a, b] for b in g2 for a in g1], dtype=np.float32)
    with torch.no_grad():
        return decode(torch.from_numpy(zz)).numpy()


ae_codes = code_sets["AE-2"][0]
ae_grid = decode_grid(aes[2].dec, ae_codes.min(0), ae_codes.max(0))
vae_grid = decode_grid(lambda z: torch.sigmoid(vae2.dec(z)), (-2.5, -2.5), (2.5, 2.5))

fig, axes = plt.subplots(2, 2, figsize=(10, 10))
for ax, name in zip(axes[0], ("AE-2", "VAE-2")):
    c = code_sets[name][1]
    sc = ax.scatter(c[:, 0], c[:, 1], c=y_te, cmap="tab10", s=12)
    ax.set_title(f"{name}: test-set codes coloured by digit")
    ax.set_xlabel("code dimension 1")
    ax.set_ylabel("code dimension 2")
fig.colorbar(sc, ax=axes[0], label="digit", ticks=range(10))
axes[1][0].imshow(tile(ae_grid, 10, 10), cmap="gray_r")
axes[1][0].set_title("AE: decoded grid over the box of its training codes")
axes[1][1].imshow(tile(vae_grid, 10, 10), cmap="gray_r")
axes[1][1].set_title("VAE: decoded grid over $[-2.5, 2.5]^2$")
for ax in axes[1]:
    ax.set_xticks([])
    ax.set_yticks([])
plt.show()
```

```output
PCA-2: 5-NN test accuracy 0.617
AE-2: 5-NN test accuracy 0.839
VAE-2: 5-NN test accuracy 0.750
raw 64 pixels: 0.978  (reference)
```

The autoencoder separates the digits best. The two-dimensional PCA codes are the worst, because a
flat projection folds several classes on top of one another. The VAE sits between them, and the
scatter shows why: the KL term pulls every cloud toward the origin and toward unit width, so the
clusters touch. The decoded grids show what the clusters buy. Every cell of the VAE grid is a
plausible digit, and the digits change smoothly across the plane. The autoencoder's grid has
sharper digits near the clusters and smudges or implausible shapes in the gaps, because nothing
ever asked the decoder to be sensible there. Neither two-dimensional code comes near the raw
pixels: ten classes do not fit in two numbers without loss.

### Step 6: samples and an interpolation

Generation from a VAE is two lines: draw $\mathbf{z} \sim \mathcal{N}(0, \mathbf{I})$ from the prior
and decode. An interpolation takes the latent means of two real test images, a '1' and a '7', and
decodes eight points on the straight line between them. Because the KL term has made the
aggregate posterior close to the prior, the line stays in a region the decoder knows.

```python
torch.manual_seed(3)
z = torch.randn(16, 2)
with torch.no_grad():
    samples = torch.sigmoid(vae2.dec(z)).numpy()

i_one = int(np.where(y_te == 1)[0][0])
i_seven = int(np.where(y_te == 7)[0][0])
mu_ends = codes_vae(vae2, Xte_t[[i_one, i_seven]])
alphas = np.linspace(0, 1, 8, dtype=np.float32)[:, None]
z_path = torch.from_numpy((1 - alphas) * mu_ends[0] + alphas * mu_ends[1])
with torch.no_grad():
    path = torch.sigmoid(vae2.dec(z_path)).numpy()
print("latent means of the two ends:", np.round(mu_ends.astype(float), 2).tolist())

fig, axes = plt.subplots(1, 2, figsize=(11, 3.6), gridspec_kw={"width_ratios": [1, 2]})
axes[0].imshow(tile(samples, 4, 4), cmap="gray_r")
axes[0].set_title("16 samples, $z \\sim N(0, I)$")
axes[1].imshow(tile(path, 1, 8), cmap="gray_r")
axes[1].set_title("interpolation from a test '1' to a test '7' (8 steps)")
for ax in axes:
    ax.set_xticks([])
    ax.set_yticks([])
plt.show()
```

```output
latent means of the two ends: [[-2.09, -0.77], [0.24, -0.33]]
```

At 8×8 pixels the samples are coarse, and all are soft: the decoder outputs the average of the
images consistent with a code ([Section 3](#s3), blurry samples). Look for digit-like strokes
rather than noise; some samples are ambiguous blends of two classes, as the overlap in the scatter
predicts. The interpolation changes shape step by step instead of fading one image out and the
other in. A pixel-space blend of a '1' and a '7' would be two faint images superimposed. This is
the practical meaning of a smooth latent space.

### Step 7: causing posterior collapse on purpose

Now the code size is $d_z = 8$, and the KL weight is varied: $\beta = 0.5$, 1 and 4. For each
model the lab prints the total KL, the KL per dimension, the reconstruction term and the number of
**active units**, the dimensions $j$ for which the variance over the test set of the mean code
$\mu_j(\mathbf{x})$ exceeds 0.01. A fourth model uses the loss of the compact class in
[Section 3](#s3), a summed squared error, which is a Gaussian decoder with $\sigma_x^2 = 1/2$. Its
reconstruction term is on another scale, so only its KL and its active units are comparable with
the others.

```python
def active_units(model, data, threshold=0.01):
    with torch.no_grad():
        mu = model.encode(data)[0]
    return int((mu.var(0) > threshold).sum())


runs = {}
settings = [("beta=0.5", 0.5, False), ("beta=1", 1.0, False), ("beta=4", 4.0, False),
            ("beta=1, squared error", 1.0, True)]
for name, beta, gaussian in settings:
    torch.manual_seed(0)
    model = train(VAE(d_z=8, beta=beta, gaussian=gaussian), Xtr_t, vae_loss)
    _, recon, kl, kl_dim = vae_report(model, Xte_t)
    runs[name] = (model, kl_dim)
    print(f"{name:22s} KL {kl:5.2f}  active {active_units(model, Xte_t)}  "
          f"reconstruction {recon:5.1f}")
    print(f"{'':22s} KL per dim {np.round(kl_dim, 2)}")

fig, axes = plt.subplots(1, 4, figsize=(13, 3.2), sharey=True)
for ax, (name, (model, kl_dim)) in zip(axes, runs.items()):
    ax.bar(range(8), kl_dim)
    ax.set_title(name)
    ax.set_xlabel("latent dimension")
axes[0].set_ylabel("KL per dimension (nats)")
plt.show()
```

```output
beta=0.5               KL  6.51  active 8  reconstruction  18.9
                       KL per dim [1.21 0.9  0.46 1.25 0.42 0.38 0.69 1.2 ]
beta=1                 KL  3.57  active 6  reconstruction  21.0
                       KL per dim [0.84 0.53 0.   0.91 0.   0.01 0.37 0.9 ]
beta=4                 KL  0.00  active 0  reconstruction  27.2
                       KL per dim [0. 0. 0. 0. 0. 0. 0. 0.]
beta=1, squared error  KL  0.48  active 3  reconstruction   4.3
                       KL per dim [0.1  0.   0.   0.21 0.16 0.   0.   0.  ]
```

The KL weight sets how much information the code may carry. At $\beta = 0.5$ the code carries
6.5 nats and all eight dimensions are used. At $\beta = 1$, the true ELBO, it carries 3.6 nats
and four dimensions hold nearly all of it; the other four sit near the prior, and two of them
still vary a little with the input, which is why six units count as active. At $\beta = 4$ every dimension has a KL of zero: the encoder outputs the
prior for every image and the decoder produces one average digit, whatever $\mathbf{z}$ is. This is
posterior collapse, and here it is not a training accident. The objective itself prefers it: the
reconstruction gain from using the code is smaller than four times its KL cost
([Section 3](#s3) works through the numbers). The squared-error loss collapses most of the
dimensions for the same reason in a milder form, because $\sigma_x^2 = 1/2$ makes reconstruction
cheap to give up.

Diagnose collapse from the KL per dimension, as above, and not from the loss: a collapsed model
has a perfectly steady loss.

### Step 8: an anomaly detector with an honest threshold

The last task is the use of [Section 2](#s2). The detector is trained only on **normal** data,
the digits 0 to 8, and the 9s play the part of an unforeseen fault. The training digits are split
again: 80% to fit the autoencoder and 20% held out as a validation set of normal data, from which
the threshold is read. The threshold is the 95th percentile of the validation errors, so the
false-alarm rate on normal data should be close to 5% by construction. The detection rate on the
9s is not set by anything; it is measured. The test set is used once, at the end.

The baseline is the monitor an engineer would build first: PCA with 8 components fitted on the
same normal data, scored by the **Q statistic**, the squared reconstruction error, with its own
95th-percentile threshold from the same validation set.

```python
normal_tr = y_tr <= 8
X_norm = X_tr[normal_tr]
X_fit, X_val = train_test_split(X_norm, test_size=0.2, random_state=0)
X_test_normal = X_te[y_te <= 8]
X_test_nine = X_te[y_te == 9]
print(f"fit {len(X_fit)}, validation {len(X_val)}, test normal {len(X_test_normal)}, "
      f"test nines {len(X_test_nine)}")

torch.manual_seed(0)
ae_norm = train(AutoEncoder(d_z=8), torch.from_numpy(X_fit), ae_loss)
pca_norm = PCA(n_components=8).fit(X_fit)


def error_ae(data):
    with torch.no_grad():
        t = torch.from_numpy(data)
        return ((ae_norm(t) - t) ** 2).mean(1).numpy()


def error_pca(data):
    return ((pca_norm.inverse_transform(pca_norm.transform(data)) - data) ** 2).mean(1)


results = {}
for name, score in (("autoencoder", error_ae), ("PCA Q statistic", error_pca)):
    threshold = np.percentile(score(X_val), 95)
    e_norm, e_nine = score(X_test_normal), score(X_test_nine)
    auc = roc_auc_score(np.r_[np.zeros(len(e_norm)), np.ones(len(e_nine))],
                        np.r_[e_norm, e_nine])
    results[name] = (e_norm, e_nine, threshold)
    print(f"{name:16s} threshold {threshold:.4f}  false alarms {np.mean(e_norm > threshold):.3f}"
          f"  9s detected {np.mean(e_nine > threshold):.3f}  AUC {auc:.3f}")

fig, axes = plt.subplots(1, 2, figsize=(11, 3.8), sharey=True)
for ax, (name, (e_norm, e_nine, threshold)) in zip(axes, results.items()):
    bins = np.linspace(0, max(e_norm.max(), e_nine.max()), 40)
    ax.hist(e_norm, bins=bins, alpha=0.6, label="normal test digits 0-8")
    ax.hist(e_nine, bins=bins, alpha=0.6, label="test 9s (anomalies)")
    ax.axvline(threshold, color="k", linestyle="--", label="95th-percentile threshold")
    ax.set_title(name)
    ax.set_xlabel("reconstruction error (MSE per pixel)")
axes[0].set_ylabel("number of test images")
axes[0].legend()
plt.show()
```

```output
fit 1034, validation 259, test normal 324, test nines 36
autoencoder      threshold 0.0261  false alarms 0.040  9s detected 0.583  AUC 0.952
PCA Q statistic  threshold 0.0395  false alarms 0.077  9s detected 0.222  AUC 0.791
```

Three things are read from this table, in order. The false-alarm rate on normal test digits is
close to the 5% the threshold was set for, which confirms that the validation split did its job
(with only 324 normal test images a gap of a point or two is noise). The detection rate is a
property of the anomaly, not of the threshold: only about 58% of the 9s are caught, even though the
AUC is 0.95. An AUC averages over every threshold, including ones nobody would run, and says
nothing about the one you chose. And the PCA monitor is clearly worse, which is the comparison
that justifies the network. The histogram shows the overlap that causes the misses: many 9s have
errors inside the normal range because they resemble digits the model reconstructs well.

If you had chosen the threshold on the test errors, to catch more 9s, the reported detection rate
would be an artefact of the choice. Choose on validation data, report on test data.

### What you should see

- The autoencoder beats PCA at equal code size, by about 30% at $d_z = 2$ and by more than a factor of two at $d_z = 8$, because digits lie on a curved manifold.
- The VAE's two-dimensional codes overlap more than the autoencoder's (5-NN accuracy about 0.75 against 0.84), because the KL term pulls every code toward $\mathcal{N}(0, \mathbf{I})$. In exchange every point of the VAE's grid decodes to a plausible digit, while the autoencoder's grid has implausible regions between clusters.
- The KL weight controls collapse. At $\beta = 4$ every dimension has a KL of 0.00 and the decoder outputs an average digit. The summed-squared-error loss, with $\sigma_x^2 = 1/2$, leaves only about three of eight dimensions active.
- An AUC of 0.95 does not mean 95% detection. At a threshold that gives about 5% false alarms, about 58% of the 9s are caught. The PCA monitor is worse on both counts.

### Try this

1. **KL warm-up.** Ramp $\beta$ linearly from 0 to 1 over the first 50 epochs in the $d_z = 8$ VAE and count active units: expect them to rise from 6 to 8, the two extra carrying little KL. Ramp to $\beta = 4$ instead and the model still collapses. Warm-up repairs collapse that comes from the path of optimisation, not collapse that is the optimum of the objective.
2. **Clusters in two dimensions.** Generate 3,000 points from three 2D Gaussian clusters with means $(-2, 0)$, $(2, 0)$, $(0, 2.5)$ and standard deviation 0.3. Train the VAE with $d_x = 2$, $d_z = 2$ and a Gaussian decoder, and plot the latent means coloured by cluster. Then set $d_z = 1$ and see whether the clusters stay apart.
3. **Another anomaly.** Hold out the digit 8 instead of 9, then the digit 0, with the same threshold rule. Detection rises sharply for one of them. Which digits are hard anomalies for this model, and why does it depend on which digits remain in the normal class?

## Lab 2 — A diffusion model on two moons, with classifier-free guidance {#lab2}

**Goal.** You implement the pieces of [Section 5](#s5) and [Section 6](#s6) on data small enough to
look at: the forward noising process with a cosine schedule, a noise-prediction network trained
with the simple loss, ancestral sampling from the reverse process, classifier-free guidance, and
the deterministic DDIM sampler with fewer steps. The data are the two interleaved moons of
`make_moons`, a 2D distribution whose quality can be measured with nearest-neighbour distances
instead of judged by eye. You will see the structure of a sample appear late in the reverse
process, see guidance trade diversity for fidelity, and see quality fall as steps are removed.
The data are synthetic, there is no download, and the lab runs in about two to three minutes on a
laptop CPU: the network has 37,858 parameters, and training is a minute or so of that. Set
`QUICK = True` in the first block to train for 8,000 steps instead of 20,000 and finish in about
a minute. Printed numbers may differ from
yours in the last digits.

### Step 1: the noise schedule, and why it is capped

The forward process of [Section 5](#s5) turns data into noise in $T$ steps. With
$\alpha_t = 1 - \beta_t$ and $\bar\alpha_t = \prod_{s \le t}\alpha_s$, a noised point is
$\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1 - \bar\alpha_t}\,\boldsymbol\epsilon$.
The schedule is the cosine schedule of Nichol and Dhariwal: $\bar\alpha_t$ is proportional to
$\cos^2\!\big(\tfrac{t/T + s}{1 + s}\cdot\tfrac{\pi}{2}\big)$ with $s = 0.008$, normalised so that
$\bar\alpha_0 = 1$, and each $\beta_t = 1 - \bar\alpha_t/\bar\alpha_{t-1}$. This lab uses
$T = 200$, not the 1,000 of the paper, because two moons need far less.

The one change from the paper is a cap: $\beta_t \le 0.5$ instead of 0.999. The uncapped schedule
ends with $\beta_T = 1$ and $\bar\alpha_T = 0$. The reverse step divides by $\sqrt{\alpha_t}$, so
the last step, where $\alpha_T = 1 - \beta_T$ is tiny, multiplies whatever error the network made
by $1/\sqrt{\alpha_T}$. With $\beta_T = 0.999$ that is 31.6, with the cap 1.41. The first block
prints the factor for both so that you can see the size of the effect. The cap leaves
$\bar\alpha_T$ at a small positive number, and the sampler starts from $\mathcal{N}(0, \mathbf{I})$,
which is then a very slightly wrong starting distribution; for this data the error is invisible.

```python
import time

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import make_moons
from sklearn.neighbors import KNeighborsClassifier, NearestNeighbors

np.random.seed(0)
torch.manual_seed(0)
torch.set_num_threads(2)

QUICK = False  # True: 8,000 training steps instead of 20,000
T = 200


def cosine_alpha_bar(T, s=0.008):
    """alpha-bar_t for t = 0..T from the cosine schedule, with alpha-bar_0 = 1."""
    t = np.arange(T + 1) / T
    f = np.cos((t + s) / (1 + s) * np.pi / 2) ** 2
    return f / f[0]


ab_cos = cosine_alpha_bar(T)
beta_uncapped = 1 - ab_cos[1:] / ab_cos[:-1]  # entry t-1 is beta_t
beta = np.minimum(beta_uncapped, 0.5)  # the cap
alpha = 1 - beta
alpha_bar = np.concatenate([[1.0], np.cumprod(alpha)])  # alpha_bar[t] for t = 0..T

print(f"alpha_bar_1 {alpha_bar[1]:.5f}  alpha_bar_100 {alpha_bar[100]:.4f}  "
      f"alpha_bar_200 {alpha_bar[200]:.2e}")
print("last three uncapped betas:", np.round(beta_uncapped[-3:], 4))
print(f"error factor 1/sqrt(alpha_T): capped {1 / np.sqrt(alpha[-1]):.2f}, "
      f"beta_T = 0.999 gives {1 / np.sqrt(1 - 0.999):.1f}")

plt.figure(figsize=(6, 3.5))
plt.plot(np.arange(T + 1), alpha_bar)
plt.xlabel("step t")
plt.ylabel(r"$\bar\alpha_t$ (fraction of signal variance left)")
plt.title("Cosine noise schedule, T = 200, beta capped at 0.5")
plt.show()
```

```output
alpha_bar_1 0.99975  alpha_bar_100 0.4938  alpha_bar_200 6.83e-05
last three uncapped betas: [0.5555 0.75   1.    ]
error factor 1/sqrt(alpha_T): capped 1.41, beta_T = 0.999 gives 31.6
```

The signal falls slowly at first and faster later: 0.85 of its variance is left at $t = 50$, half
at $t = 100$ and 0.14 at $t = 150$, and the last fifty steps take the rest to nearly zero. The
cosine schedule is chosen for this shape, which spends many steps at moderate noise levels, where
the structure of the data is partly visible, instead of burning through them. Training and sampling
below use the capped values throughout, so the forward and reverse processes agree with each
other.

### Step 2: the forward process, drawn

The closed form lets you jump straight to any step. One fixed noise draw $\boldsymbol\epsilon$ per
point is reused at every $t$, so that each point slides along a single straight line from its
origin toward noise and the panels are comparable. The data are standardised first, to zero mean
and unit variance in each coordinate, so that the end state $\mathcal{N}(0, \mathbf{I})$ has the
same scale as the data. Standardisation uses the mean and standard deviation of the training set
itself; the same numbers will be applied to the evaluation set.

```python
X_raw, y_raw = make_moons(n_samples=10000, noise=0.05, random_state=0)
mean, std = X_raw.mean(0), X_raw.std(0)
data = torch.tensor((X_raw - mean) / std, dtype=torch.float32)
labels = torch.tensor(y_raw)
X_ref_raw, y_ref = make_moons(n_samples=5000, noise=0.05, random_state=1)
X_ref = ((X_ref_raw - mean) / std).astype(np.float32)  # reference set for evaluation
print("standardised data: mean", np.round(data.mean(0).numpy(), 3),
      " std", np.round(data.std(0).numpy(), 3))

ab = torch.tensor(alpha_bar, dtype=torch.float32)


def noise_to(x0, t, eps):
    """Closed-form forward process: x_t from x_0 in one step (t is a tensor of step indices)."""
    a = ab[t][:, None]
    return a.sqrt() * x0 + (1 - a).sqrt() * eps


eps_fixed = torch.randn(1500, 2)
x0_show, y_show = data[:1500], labels[:1500].numpy()
steps = (0, 50, 100, 150, 175, 200)
fig, axes = plt.subplots(1, 6, figsize=(16, 2.9), sharex=True, sharey=True)
for ax, t in zip(axes, steps):
    xt = noise_to(x0_show, torch.full((1500,), t), eps_fixed).numpy()
    ax.scatter(xt[:, 0], xt[:, 1], c=y_show, cmap="coolwarm", s=3)
    ax.set_title(f"t = {t}, $\\bar\\alpha_t$ = {alpha_bar[t]:.3f}")
    ax.set_xlabel("$x_1$")
axes[0].set_ylabel("$x_2$")
plt.show()
```

```output
standardised data: mean [-0. -0.]  std [1. 1.]
```

By $t = 50$ the thin crescents have already become two broad overlapping clouds, one per moon. By
$t = 100$ they are two heavily overlapping blobs, and from $t = 150$ on the two classes are mixed
and only a Gaussian cloud remains. The fine geometry of the data, the curve of the crescents, is
destroyed early in the forward process. The reverse process must put it back, which is the first
hint of the late-structure observation of Step 5.

### Step 3: the denoising network

The network $\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c)$ predicts the noise that was added. It
needs to know the step $t$, because the right answer depends on how noisy the input is, and the
condition $c$: the moon label 0 or 1, or a third value, **null**, standing for "no condition". The
null value is what makes classifier-free guidance possible in Step 6, because the same network
then gives both a conditional and an unconditional prediction.

The step is encoded as a 32-dimensional sinusoidal embedding, as in the transformer, and the
condition by a learned 32-dimensional embedding of three entries. The two embeddings are added,
and the sum is concatenated to the 2 coordinates of $\mathbf{x}_t$. Three hidden layers of 128 units
with SiLU activations and a linear output of 2 numbers follow. The parameter count is
$34 \cdot 128 + 128 + 2(128 \cdot 128 + 128) + 128 \cdot 2 + 2 + 3 \cdot 32 = 37{,}858$.

```python
def time_embedding(t, dim=32):
    """Sinusoidal embedding of the step index, shape (B, dim)."""
    freqs = torch.exp(-np.log(10000.0) * torch.arange(dim // 2) / (dim // 2))
    angles = t.float()[:, None] * freqs[None, :]
    return torch.cat([angles.sin(), angles.cos()], dim=-1)


NULL = 2  # condition index meaning "no condition"


class Denoiser(nn.Module):
    def __init__(self, hidden=128, d_emb=32):
        super().__init__()
        self.cond_emb = nn.Embedding(3, d_emb)  # moon 0, moon 1, null
        self.net = nn.Sequential(
            nn.Linear(2 + d_emb, hidden), nn.SiLU(),
            nn.Linear(hidden, hidden), nn.SiLU(),
            nn.Linear(hidden, hidden), nn.SiLU(),
            nn.Linear(hidden, 2),
        )

    def forward(self, x, t, c):
        emb = time_embedding(t) + self.cond_emb(c)
        return self.net(torch.cat([x, emb], dim=-1))


model = Denoiser()
print("parameters:", sum(p.numel() for p in model.parameters()))
```

```output
parameters: 37858
```

### Step 4: training with the simple loss

Each training step draws a batch of 512 clean points, a step $t$ uniform on $\{1, \dots, 200\}$ for
each, and noise $\boldsymbol\epsilon$; forms $\mathbf{x}_t$; and minimises the mean squared error
between $\boldsymbol\epsilon$ and $\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c)$. This is the
objective of [Section 5](#s5), a plain regression. With probability 0.2 the condition is replaced by
`NULL`, so that one network learns both the conditional and the unconditional noise. Adam with
learning rate $10^{-3}$ and cosine decay to zero finishes the run.

The loss does not fall to zero and should not: the noise is random, and the network can only
predict the part of it that $\mathbf{x}_t$ and $t$ reveal. At small $t$, $\mathbf{x}_t$ is nearly
$\mathbf{x}_0$ and the noise is almost unrecoverable from one point. At large $t$ the noise is
almost all there is of $\mathbf{x}_t$, and the task is easy. The printed loss is therefore an average
over very different difficulties, and a flat curve says little about sample quality.

```python
n_steps = 8000 if QUICK else 20000
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=n_steps)
torch.manual_seed(0)
t0 = time.time()
fifth = n_steps // 5
running = []
for step in range(1, n_steps + 1):
    idx = torch.randint(0, len(data), (512,))
    x0, c = data[idx], labels[idx].clone()
    c[torch.rand(512) < 0.2] = NULL  # condition dropout for classifier-free guidance
    t = torch.randint(1, T + 1, (512,))
    eps = torch.randn(512, 2)
    loss = F.mse_loss(model(noise_to(x0, t, eps), t, c), eps)
    opt.zero_grad()
    loss.backward()
    opt.step()
    sched.step()
    running.append(loss.item())
    if step % fifth == 0:
        print(f"step {step:6d}  mean loss over the last {fifth} steps "
              f"{np.mean(running[-fifth:]):.4f}")
print(f"training time {time.time() - t0:.0f} s")
```

```output
step   4000  mean loss over the last 4000 steps 0.3646
step   8000  mean loss over the last 4000 steps 0.3324
step  12000  mean loss over the last 4000 steps 0.3294
step  16000  mean loss over the last 4000 steps 0.3277
step  20000  mean loss over the last 4000 steps 0.3260
training time 70 s
```

The loss is 0.36 over the first fifth and settles near 0.33 afterwards. That is an average over
all noise levels of an error that cannot go below the noise floor, so the curve is nearly flat
long before the samples stop improving. A loss of 0.33 does not say whether the moons will be
sharp; the nearest-neighbour measurements of the next steps do. The training time depends on the
machine, and on a busy one it can be twice the minute and a half of a quiet laptop.

### Step 5: ancestral sampling, and what it produces

Sampling starts from $\mathbf{x}_T \sim \mathcal{N}(0, \mathbf{I})$ and applies, for
$t = T, \dots, 1$, the update of Ho et al. (Algorithm 2):

$$
\mathbf{x}_{t-1} = \frac{1}{\sqrt{\alpha_t}}\Big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1 - \bar\alpha_t}}\,\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c)\Big) + \sqrt{\beta_t}\,\mathbf{z},
\qquad \mathbf{z} \sim \mathcal{N}(0, \mathbf{I}),
$$

with $\mathbf{z} = 0$ at the last step. The first factor removes the predicted noise and rescales; the
second adds back a smaller amount of fresh noise, with variance $\beta_t$, which keeps the chain a
proper sample from the reverse process rather than a deterministic slide. The function below takes
a condition and a **guidance scale** $w$; this step uses the null condition, so $w$ plays no role,
and Step 6 uses both.

Samples are scored with nearest-neighbour distances, in standardised units. The mean distance from
each **sample** to its nearest point of a 5,000-point reference set is a precision-like quantity:
small when samples lie on the moons. The mean distance from each **reference** point to its
nearest sample is a recall-like quantity: small when the samples cover every part of the moons.
Two yardsticks calibrate them: 2,000 fresh draws from the true distribution, which is the best any
sampler could do, and 2,000 draws from $\mathcal{N}(0, \mathbf{I})$, which is the starting point.

```python
@torch.no_grad()
def eps_hat(x, t_int, c, w):
    """Noise prediction; with a condition c in {0, 1}, classifier-free guidance of scale w."""
    t = torch.full((len(x),), t_int, dtype=torch.long)
    e_null = model(x, t, torch.full((len(x),), NULL))
    if c == NULL:
        return e_null
    e_cond = model(x, t, torch.full((len(x),), c))
    return e_null + w * (e_cond - e_null)


beta_t, alpha_t, ab_t = (torch.tensor(a, dtype=torch.float32) for a in (beta, alpha, alpha_bar))


@torch.no_grad()
def ancestral(n, c=NULL, w=0.0, seed=0, snapshots=()):
    """Ho et al. Algorithm 2. Returns x_0 and {t: x_t before the update at step t}."""
    gen = torch.Generator().manual_seed(seed)
    x = torch.randn(n, 2, generator=gen)
    snaps = {}
    for t in range(T, 0, -1):
        if t in snapshots:
            snaps[t] = x.clone().numpy()
        e = eps_hat(x, t, c, w)
        x = (x - beta_t[t - 1] / (1 - ab_t[t]).sqrt() * e) / alpha_t[t - 1].sqrt()
        if t > 1:
            x = x + beta_t[t - 1].sqrt() * torch.randn(n, 2, generator=gen)
    return x.numpy(), snaps


def nn_dist(a, b):
    """Mean distance from each row of a to its nearest row of b."""
    return float(NearestNeighbors(n_neighbors=1).fit(b).kneighbors(a)[0].mean())


fresh_raw, _ = make_moons(n_samples=2000, noise=0.05, random_state=2)
fresh = ((fresh_raw - mean) / std).astype(np.float32)
noise_pts = np.random.default_rng(0).standard_normal((2000, 2)).astype(np.float32)
for name, pts in (("fresh data", fresh), ("N(0, I) noise", noise_pts)):
    print(f"{name:14s} precision-like {nn_dist(pts, X_ref):.3f}   "
          f"recall-like {nn_dist(X_ref, pts):.3f}")

t0 = time.time()
snap_steps = (200, 150, 100, 50, 20, 5)
x_gen, snaps = ancestral(2000, snapshots=snap_steps)
print(f"unconditional samples  precision-like {nn_dist(x_gen, X_ref):.3f}   "
      f"recall-like {nn_dist(X_ref, x_gen):.3f}   ({time.time() - t0:.1f} s)")
print("precision-like distance of x_t at t =", snap_steps, ":",
      [round(nn_dist(snaps[t], X_ref), 3) for t in snap_steps])

fig, axes = plt.subplots(1, 7, figsize=(18, 2.8), sharex=True, sharey=True)
for ax, t in zip(axes, snap_steps):
    ax.scatter(snaps[t][:, 0], snaps[t][:, 1], s=2)
    ax.set_title(f"$x_t$ at t = {t}")
    ax.set_xlabel("$x_1$")
axes[-1].scatter(x_gen[:, 0], x_gen[:, 1], s=2, color="tab:green")
axes[-1].set_title("final sample $x_0$")
axes[-1].set_xlabel("$x_1$")
axes[0].set_ylabel("$x_2$")
plt.show()
```

```output
fresh data     precision-like 0.013   recall-like 0.021
N(0, I) noise  precision-like 0.242   recall-like 0.051
unconditional samples  precision-like 0.022   recall-like 0.022   (0.6 s)
precision-like distance of x_t at t = (200, 150, 100, 50, 20, 5) : [0.246, 0.234, 0.212, 0.134, 0.057, 0.027]
```

Read the two yardsticks first. Fresh data sit at about 0.013 from the reference set and the
reference is about 0.021 from them, which are the floors set by sample size and by the noise of the
moons: no sampler can beat them. Noise sits at 0.24 and 0.05. The model's samples land close to the
floor on both counts: they are on the moons, and they cover both of them. The six snapshots show
where this happens. The precision-like distance of $\mathbf{x}_t$ is still about 0.25 at $t = 200$,
as for pure noise, falls only slowly until $t = 100$ (0.212), is 0.134 at $t = 50$, and drops to
the final 0.022 within the last fifty steps. Structure appears late: the snapshots at $t = 100$
and $t = 50$ are shapeless blobs with a hint of the two moons, and the crescents sharpen only
between $t = 50$ and $t = 5$. That is why the last steps matter most for quality, and why
removing steps is costly in Step 7.

With `QUICK = True` expect a precision-like distance of about 0.04 and a recall-like distance of
about 0.025: visibly fuzzier moons, with stray points near the moons. The model has been trained for fewer steps, and every step it
takes in the reverse chain compounds its error.

### Step 6: classifier-free guidance

A conditional model samples from $p(\mathbf{x} \mid c)$. Guidance sharpens it. The noise prediction
used in the update is

$$
\tilde{\boldsymbol\epsilon} = \boldsymbol\epsilon_\theta(\mathbf{x}_t, t, \varnothing) + w\,\big(\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c) - \boldsymbol\epsilon_\theta(\mathbf{x}_t, t, \varnothing)\big),
$$

where $\varnothing$ is the null condition. With $w = 0$ it is the unconditional model; with
$w = 1$ it is the conditional model; with $w > 1$ it moves further along the direction from
"anything" to "class $c$" than the conditional model alone does. The scale is written here as in
the code, $w = 1$ for the plain conditional model. Ho and Salimans write the same thing with
$(1 + w)$, so their $w = 0$ is this lab's $w = 1$.

The block samples 1,000 points of class 0 for $w = 0, 1, 3, 7$. A 15-nearest-neighbour classifier
fitted on the labelled reference set says which moon each sample landed on; the fraction on moon 0
measures how well the condition was obeyed. The precision-like distance uses all reference points.
The recall-like distance uses only the reference points of class 0, because that is the
distribution being sampled.

```python
knn = KNeighborsClassifier(15).fit(X_ref, y_ref)
ref_class0 = X_ref[y_ref == 0]
guided = {}
for w in (0, 1, 3, 7):
    x_w, _ = ancestral(1000, c=0, w=float(w), seed=10 + w)
    guided[w] = x_w
    frac = float((knn.predict(x_w) == 0).mean())
    print(f"w = {w}: fraction on moon 0 {frac:.2f}   precision-like {nn_dist(x_w, X_ref):.3f}"
          f"   recall-like (class-0 points) {nn_dist(ref_class0, x_w):.3f}")

fig, axes = plt.subplots(1, 4, figsize=(15, 3.4), sharex=True, sharey=True)
for ax, w in zip(axes, guided):
    ax.scatter(X_ref[:, 0], X_ref[:, 1], s=1, color="lightgrey")
    ax.scatter(guided[w][:, 0], guided[w][:, 1], s=3, color="tab:red")
    ax.set_title(f"class 0, guidance w = {w}")
    ax.set_xlabel("$x_1$")
axes[0].set_ylabel("$x_2$")
plt.show()
```

```output
w = 0: fraction on moon 0 0.50   precision-like 0.023   recall-like (class-0 points) 0.032
w = 1: fraction on moon 0 1.00   precision-like 0.014   recall-like (class-0 points) 0.021
w = 3: fraction on moon 0 1.00   precision-like 0.013   recall-like (class-0 points) 0.029
w = 7: fraction on moon 0 1.00   precision-like 0.020   recall-like (class-0 points) 0.043
```

With $w = 0$ the condition is ignored and half the samples fall on each moon: the unconditional
model. Its recall-like distance to the class-0 points is high (0.032) because only half of its
samples are near them. At $w = 1$ every sample is on the requested moon and the recall-like
distance is at its best, 0.021. The fraction on the moon cannot improve beyond 1.00, but the other
numbers keep moving. The recall-like distance grows with $w$ (0.029 at $w = 3$, 0.043 at $w = 7$),
because the samples concentrate on the densest part of the moon and its two tips go unvisited, as
the figure shows. At $w = 7$ the precision-like distance has grown too (0.020 against 0.013 at
$w = 3$), because the stronger push overshoots: some samples leave the moon past its upper left
end. This is the trade-off of guidance in its purest
form. Fidelity to the condition is bought with diversity, and past some scale it is bought
with a worse fit as well.

### Step 7: DDIM and the cost of steps

Ancestral sampling takes 200 network evaluations per sample. DDIM (Song et al.) reuses the same
trained network with a deterministic update that may skip steps. At each step it first estimates
the clean point from the noise prediction,

$$
\hat{\mathbf{x}}_0 = \frac{\mathbf{x}_t - \sqrt{1 - \bar\alpha_t}\,\boldsymbol\epsilon_\theta}{\sqrt{\bar\alpha_t}},
$$

which inverts the forward formula, and then re-noises it to the next, lower noise level $t'$ with
the *same* predicted noise:

$$
\mathbf{x}_{t'} = \sqrt{\bar\alpha_{t'}}\,\hat{\mathbf{x}}_0 + \sqrt{1 - \bar\alpha_{t'}}\,\boldsymbol\epsilon_\theta .
$$

No fresh noise is injected, so the map from $\mathbf{x}_T$ to $\mathbf{x}_0$ is deterministic.
Because the update only needs $\bar\alpha_t$ and $\bar\alpha_{t'}$, $t'$ need not be $t - 1$: $K$ evenly
spaced steps from 200 to 0 give a $K$-step sampler with no retraining. The block measures
unconditional samples for $K = 200, 50, 20, 10, 5, 2, 1$, with the time each takes. The $K = 1$ row
is $\hat{\mathbf{x}}_0$ from one evaluation at $t = 200$.

```python
@torch.no_grad()
def ddim(n, K, seed=0):
    gen = torch.Generator().manual_seed(seed)
    x = torch.randn(n, 2, generator=gen)
    ts = np.round(np.linspace(T, 0, K + 1)).astype(int)
    for t, t_next in zip(ts[:-1], ts[1:]):
        e = eps_hat(x, int(t), NULL, 0.0)
        x0_hat = (x - (1 - ab_t[t]).sqrt() * e) / ab_t[t].sqrt()
        x = ab_t[t_next].sqrt() * x0_hat + (1 - ab_t[t_next]).sqrt() * e
    return x.numpy()


print("   K  precision-like  recall-like  seconds")
ddim_samples = {}
for K in (200, 50, 20, 10, 5, 2, 1):
    t0 = time.time()
    xs = ddim(2000, K)
    ddim_samples[K] = xs
    print(f"{K:4d}  {nn_dist(xs, X_ref):13.3f}  {nn_dist(X_ref, xs):11.3f}  {time.time() - t0:7.2f}")

fig, axes = plt.subplots(1, 4, figsize=(14, 3.3), sharex=True, sharey=True)
for ax, K in zip(axes, (50, 10, 5, 1)):
    xs = ddim_samples[K]
    outside = int((np.abs(xs).max(1) > 3).sum())
    ax.scatter(xs[:, 0], xs[:, 1], s=2)
    ax.set_xlim(-3, 3)
    ax.set_ylim(-3, 3)
    ax.set_title(f"DDIM, K = {K} steps ({outside} of 2000 outside the box)")
    ax.set_xlabel("$x_1$")
axes[0].set_ylabel("$x_2$")
plt.show()
```

```output
   K  precision-like  recall-like  seconds
 200          0.022        0.023     0.56
  50          0.022        0.024     0.15
  20          0.025        0.029     0.07
  10          0.035        0.042     0.04
   5          0.046        0.067     0.02
   2          0.152        0.120     0.02
   1          1.714        0.142     0.01
```

Twenty to fifty DDIM steps give samples close to the 200-step ancestral sampler's, at a fifth to
a tenth of the cost; the time column falls almost in proportion to $K$. Below about ten steps
quality falls quickly. One step is a different kind of failure. At $t = 200$ the signal weight is
$\sqrt{\bar\alpha_{200}} = 0.008$, so the estimate $\hat{\mathbf{x}}_0$ divides the network's output
by 0.008, a factor of 121, and any error in $\boldsymbol\epsilon_\theta$ is blown up by that
factor. The one-step samples therefore scatter far outside the data, a precision-like distance of
well over 1, even though their recall-like distance is only 0.14: the data region is covered, by a
cloud that also covers a great deal more. The cost of diffusion is its number of steps, and what the
steps buy is the gradual commitment to structure that you saw in Step 5.

### What you should see

- Structure appears late in the reverse process. The intermediate samples are shapeless until about $t = 50$ (precision-like distance 0.134, against 0.246 for noise), and the crescents form between $t = 50$ and $t = 5$.
- The unconditional samples are almost as close to the data as fresh data are (about 0.022 against 0.013) and cover both moons (recall-like distance 0.022 against 0.021).
- Guidance trades diversity for fidelity. $w = 1$ already puts every sample on the requested moon. $w = 3$ and $w = 7$ squeeze the samples toward the densest part of the moon, the recall-like distance doubling by $w = 7$, and at $w = 7$ the precision-like distance starts to worsen as samples overshoot.
- DDIM with 20 to 50 steps is close to the 200-step ancestral sampler. Below about 10 steps quality falls quickly, and a single step returns a smeared estimate far from the data.
- The cap on $\beta_t$ matters. With the paper's cap of 0.999 the first reverse step multiplies the network's error by 31.6; in a prototype run this made the $w = 7$ samples diverge (a precision-like distance of 1.34). The cap at 0.5 keeps the factor at 1.41.

### Try this

1. **Restore the cap.** Set the cap to 0.999 and repeat Step 6. Then keep the 0.999 cap but compute $\hat{\mathbf{x}}_0$, clip it to $[-3, 3]$, and use the posterior-mean update $\tilde\mu_t$ from $\hat{\mathbf{x}}_0$ instead. This is how the original implementations survive the uncapped schedule.
2. **A GAN on the same data.** Train the non-saturating GAN of [Section 4](#s4) (generator and discriminator: MLPs with three hidden layers of 128, Adam with learning rate $10^{-3}$ and $\beta = (0.5, 0.999)$) on the same standardised moons for 6,000 steps. Compare its precision-like and recall-like distances with the diffusion model's. It needs one forward pass per sample; the diffusion model needs 200.
3. **The linear schedule.** Replace the schedule by the linear range of Ho et al., $\beta_t$ from $10^{-4}$ to 0.02, kept at $T = 200$, which ends at $\bar\alpha_T = 0.13$ (a prototype run gave a precision-like distance of 0.021 and a recall-like distance of 0.022). On these 2D standardised data the damage is small. Explain why two-dimensional standardised data hide a problem that matters for images: what does $\bar\alpha_T = 0.13$ leave in the starting sample?

## Lab 3 — A graph convolutional network from scratch: single points of failure in fault trees {#lab3}

**Goal.** You build message passing from the edge list up, in about thirty lines, and use it on a
task whose answer is known exactly: finding the **single points of failure** of a fault tree, the
basic events whose failure alone brings down the top event. You write a generator for random fault
trees and a labeller for the ground truth, measure two baselines that the models must beat, train
graph convolutional networks ([Section 7](#s7)) of increasing depth, and watch the depth limits
of [Section 8](#s8) happen: accuracy by distance from the top, over-smoothing measured without any
training, and the repair by residual connections. Last, you replace the symmetric adjacency by a
direction-aware layer, which uses the one piece of structure the plain GCN throws away. The data
are synthetic and the lab uses no graph library; it runs in about two minutes on a laptop CPU, and
needs NumPy, PyTorch and matplotlib. The accuracies in the nineties move by a point or two with the
thread count and the PyTorch version, so read them as phenomena, not as digits.

### Step 1: a fault-tree generator and its labels

A fault tree has **gates** (OR: the output fails if any input fails; AND: only if all inputs
fail) and **basic events**, the leaves. A basic event is a single point of failure if every gate on
its path to the top event is an OR: then its failure alone propagates all the way up. One AND gate
anywhere on the path means the other inputs of that gate must fail too.

The generator follows a fixed recipe. The top event is a gate, OR with probability 0.6 and AND
otherwise. Every gate has two to four inputs, uniformly. An input of a gate at depth 0 or 1 is
itself a gate with probability 0.6, at depth 2 with probability 0.35, and a gate at depth 3 has
only basic events as inputs, so no tree is deeper than four levels below the top. Every non-top
gate is an OR with probability 0.6. Each node has four features: a one-hot encoding of its type
(OR, AND, basic event) and a flag that marks the top event. Gates are not scored; the label of a
basic event is 1 for a single point of failure.

The lab generates 300 trees from one seeded generator, uses 200 for training and 100 for testing,
and splits **by tree**, so that the test trees are new graphs, never nodes of a training tree.
Engineering models are used on new models, not on new nodes of an old one
([Section 7](#s7)).

```python
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

np.random.seed(0)
torch.manual_seed(0)

OR, AND, BASIC = 0, 1, 2


def make_tree(rng):
    """One random fault tree as arrays: node type, parent index (-1 for the top), depth."""
    types, parent, depth = [], [], []

    def add(kind, par, d):
        types.append(kind)
        parent.append(par)
        depth.append(d)
        return len(types) - 1

    top = add(OR if rng.random() < 0.6 else AND, -1, 0)
    open_gates = [top]
    while open_gates:
        g = open_gates.pop()
        d = depth[g]
        p_gate = 0.6 if d <= 1 else (0.35 if d == 2 else 0.0)
        for _ in range(rng.integers(2, 5)):  # 2 to 4 inputs
            if rng.random() < p_gate:
                open_gates.append(add(OR if rng.random() < 0.6 else AND, g, d + 1))
            else:
                add(BASIC, g, d + 1)
    return {"type": np.array(types), "parent": np.array(parent), "depth": np.array(depth)}


def label_tree(tree):
    """1 for a basic event whose gates up to the top are all OR, 0 for the other basic
    events, -1 for gates (not scored)."""
    label = np.full(len(tree["type"]), -1)
    for v in np.where(tree["type"] == BASIC)[0]:
        label[v], u = 1, tree["parent"][v]
        while u != -1:
            if tree["type"][u] == AND:
                label[v] = 0
            u = tree["parent"][u]
    return label


rng = np.random.default_rng(0)
trees = [make_tree(rng) for _ in range(300)]
for tree in trees:
    tree["label"] = label_tree(tree)
train_trees, test_trees = trees[:200], trees[200:]

sizes = [len(t["type"]) for t in trees]
print(f"nodes per tree: mean {np.mean(sizes):.1f}, min {min(sizes)}, max {max(sizes)}")
for name, group in (("train", train_trees), ("test", test_trees)):
    n_nodes = sum(len(t["type"]) for t in group)
    lab = np.concatenate([t["label"] for t in group])
    dep = np.concatenate([t["depth"] for t in group])
    basic = lab >= 0
    counts = {d: int(((dep == d) & basic).sum()) for d in (1, 2, 3, 4)}
    print(f"{name}: {n_nodes} nodes, {basic.sum()} basic events, "
          f"{lab[basic].mean():.1%} single points of failure; by depth {counts}")
```

```output
nodes per tree: mean 28.1, min 3, max 92
train: 5579 nodes, 3766 basic events, 22.1% single points of failure; by depth {1: 252, 2: 400, 3: 1169, 4: 1945}
test: 2850 nodes, 1934 basic events, 21.9% single points of failure; by depth {1: 123, 2: 193, 3: 640, 4: 978}
```

Roughly one basic event in five is a single point of failure, in the training and the test trees
alike, so a model that never predicts one is right about four times in five: that is the baseline
to beat. Most basic events lie three or four levels below the top, and those are the ones that need
the most information to label. Another seed or another draw order gives somewhat different counts
(the shares move by a point or two), so do not expect to match these digits from a different
generator.

### Step 2: check the labeller on a tree you can verify by hand

A labeller that nobody has checked is the commonest source of a wrong benchmark. The cooling-system
tree of [Section 8](#s8) has twelve nodes, and its answer can be read off the diagram. The top
event, loss of cooling, is an OR of three inputs: the gate G1, "all pumps fail" (an AND of three
pumps), the gate G2, "flow path blocked" (an OR of a valve, a pipe and a gate G3, "both controllers
fail", an AND of two controllers), and the basic event E1, the power supply. The single points of
failure are therefore E1 directly, and the valve E5 and the pipe E6 through the OR gate G2. The
pumps and controllers sit under an AND.

```python
NAMES = ["TOP", "G1", "G2", "E1", "E2", "E3", "E4", "E5", "E6", "G3", "E7", "E8"]
cooling = {
    "type": np.array([OR, AND, OR, BASIC, BASIC, BASIC, BASIC, BASIC, BASIC, AND, BASIC, BASIC]),
    "parent": np.array([-1, 0, 0, 0, 1, 1, 1, 2, 2, 2, 9, 9]),
}
cooling["depth"] = np.array([0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3])
cooling["label"] = label_tree(cooling)

found = [NAMES[v] for v in np.where(cooling["label"] == 1)[0]]
print("single points of failure found by the labeller:", found)
assert found == ["E1", "E5", "E6"], "the labeller disagrees with the hand answer"
```

```output
single points of failure found by the labeller: ['E1', 'E5', 'E6']
```

The assertion is the point of the step. If it failed, nothing that follows could be believed.

### Step 3: two baselines

The accuracy of a model on the test basic events means nothing without the accuracy of something
trivial. There are two trivial predictors. **Majority class**: say "not a single point of failure"
for every event. And a rule that sounds right, **"the event's own gate is an OR"**: if the gate
directly above is an OR, the event looks like a single point of failure. The rule is wrong exactly
when an AND gate sits somewhere higher up. Both are computed on the test basic events.

```python
def basic_events(group):
    """Concatenate trees; return labels, own-gate types and depths of the basic events."""
    lab = np.concatenate([t["label"] for t in group])
    own_gate = np.concatenate([t["type"][np.maximum(t["parent"], 0)] for t in group])
    dep = np.concatenate([t["depth"] for t in group])
    m = lab >= 0
    return lab[m], own_gate[m], dep[m]


lab_te, gate_te, dep_te = basic_events(test_trees)
majority = np.mean(lab_te == 0)
own_gate_or = np.mean((gate_te == OR).astype(int) == lab_te)
print(f"majority class (never a single point of failure): {majority:.3f}")
print(f"'own gate is OR' rule:                            {own_gate_or:.3f}")
```

```output
majority class (never a single point of failure): 0.781
'own gate is OR' rule:                            0.616
```

The plausible rule is worse than predicting the majority class. Many events whose own gate is an
OR have an AND gate higher up, so the rule raises many false alarms. Every model below has to beat
both numbers, and a model that beats only the rule has learned nothing about single points of
failure.

### Step 4: message passing on an edge list

Messages are sent along edges, and the whole layer is one scatter-add. A graph is stored as an edge
list: two arrays $i$ and $j$ such that there is an edge from $j$ to $i$ (a message sent from $j$
to $i$). The GCN's propagation matrix is
$\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A} + \mathbf{I})\tilde{\mathbf{D}}^{-1/2}$,
so the edge list holds both directions of each tree edge and a self-loop for every node, each with
weight $1/\sqrt{\tilde d_i \tilde d_j}$, where $\tilde d$ counts the node's neighbours plus itself.
Propagating the features $\mathbf{H}$ is then

```text
out[i] = sum over edges (i, j) of  w_ij * H[j]
```

which `index_add_` computes in $O(|\mathcal{E}|\,d)$ time without ever forming an $n \times n$
matrix. The code builds a `Graph` for any list of trees (the trees are joined into one big graph
with no edges between them) and checks the edge-list propagation against the dense formula on the
twelve-node tree.

```python
class Graph:
    """A batch of trees as one disconnected graph, with everything a model needs."""

    def __init__(self, group):
        offset, parts = 0, []
        for t in group:
            n = len(t["type"])
            par = np.where(t["parent"] >= 0, t["parent"] + offset, -1)
            parts.append((t["type"], par, t["depth"], t["label"]))
            offset += n
        types = np.concatenate([p[0] for p in parts])
        parent = np.concatenate([p[1] for p in parts])
        self.n = len(types)
        onehot = np.eye(3, dtype=np.float32)[types]
        top_flag = (parent == -1).astype(np.float32)[:, None]
        self.x = torch.from_numpy(np.concatenate([onehot, top_flag], axis=1))
        self.y = torch.from_numpy(np.concatenate([p[3] for p in parts]))
        self.depth = np.concatenate([p[2] for p in parts])
        self.basic = self.y >= 0
        # directed edges child -> parent, used by the direction-aware layer of Step 7
        child_idx = np.where(parent >= 0)[0]
        self.child = torch.from_numpy(child_idx)
        self.par = torch.from_numpy(parent[child_idx])
        n_children = np.bincount(parent[child_idx], minlength=self.n)
        self.n_children = torch.from_numpy(np.maximum(n_children, 1).astype(np.float32))
        # symmetric edge list with self-loops and GCN weights
        loops = np.arange(self.n)
        self.i = torch.from_numpy(np.concatenate([child_idx, parent[child_idx], loops]))
        self.j = torch.from_numpy(np.concatenate([parent[child_idx], child_idx, loops]))
        deg = np.bincount(self.i.numpy(), minlength=self.n).astype(np.float32)  # includes loop
        self.w = torch.from_numpy(1 / np.sqrt(deg[self.i.numpy()] * deg[self.j.numpy()]))


def propagate(g, H):
    """A_hat @ H from the edge list: one scatter-add."""
    return torch.zeros_like(H).index_add_(0, g.i, g.w[:, None] * H[g.j])


g_cool = Graph([cooling])
n = g_cool.n
A = torch.zeros(n, n)
A[g_cool.child, g_cool.par] = 1.0
A = A + A.T + torch.eye(n)  # A + I
d_inv_sqrt = A.sum(1).pow(-0.5)
A_hat_dense = d_inv_sqrt[:, None] * A * d_inv_sqrt[None, :]

H = torch.randn(n, 5)
diff = (propagate(g_cool, H) - A_hat_dense @ H).abs().max().item()
print(f"edge-list propagation against the dense matrix: max abs difference {diff:.1e}")
print("row sums of A_hat on the cooling tree (not 1: it is not a mean):",
      np.round(A_hat_dense.sum(1).numpy()[:4], 3))

g_train, g_test = Graph(train_trees), Graph(test_trees)
```

```output
edge-list propagation against the dense matrix: max abs difference 1.2e-07
row sums of A_hat on the cooling tree (not 1: it is not a mean): [1.051 1.372 1.28  0.854]
```

The two agree to float32 rounding. The row sums are not 1, because the symmetric normalisation
weights an edge by both degrees, not by the receiver's alone; this is what keeps repeated
propagation from exploding or shrinking the features ([Section 7](#s7)).

### Step 5: GCNs of increasing depth

The model is the GCN of [Section 7](#s7). A linear layer maps the four features to 32 numbers; $L$
layers each compute $\mathbf{H} \leftarrow \mathrm{ReLU}(\hat{\mathbf{A}}\mathbf{H}\mathbf{W})$ with
its own $32 \times 32$ matrix; a linear layer maps each node to two class scores. Training is
full-batch, because the whole training set is one graph of a few thousand nodes: Adam with learning
rate $10^{-2}$, weight decay $5 \cdot 10^{-4}$, 200 epochs, and a cross-entropy loss over the
training **basic events only**, since gates have no label. The same `fit` helper trains every model
in this lab. The table shows test accuracy overall and by depth of the event, for
$L = 1, 2, 3, 4, 6, 8, 12, 16$.

```python
def accuracy_by_depth(pred, g):
    """Accuracy on the basic events, overall and for each depth 1-4."""
    ok = (pred == g.y).numpy()
    out = [ok[g.basic.numpy()].mean()]
    for d in (1, 2, 3, 4):
        out.append(ok[g.basic.numpy() & (g.depth == d)].mean())
    return np.array(out)


def fit(model, g, epochs=200, lr=1e-2, weight_decay=5e-4):
    opt = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    for _ in range(epochs):
        loss = F.cross_entropy(model(g)[g.basic], g.y[g.basic])
        opt.zero_grad()
        loss.backward()
        opt.step()
    return model


def evaluate(model, g):
    model.eval()
    with torch.no_grad():
        pred = model(g).argmax(1)
    return accuracy_by_depth(pred, g)


class GCN(nn.Module):
    def __init__(self, L, hidden=32, residual=False):
        super().__init__()
        self.inp = nn.Linear(4, hidden)
        self.layers = nn.ModuleList(nn.Linear(hidden, hidden, bias=False) for _ in range(L))
        self.out = nn.Linear(hidden, 2)
        self.residual = residual

    def forward(self, g):
        h = self.inp(g.x)
        for lin in self.layers:
            m = torch.relu(propagate(g, lin(h)))  # ReLU(A_hat H W)
            h = h + m if self.residual else m
        return self.out(h)


gcn_acc = {}
print("  L   overall   depth1   depth2   depth3   depth4")
for L in (1, 2, 3, 4, 6, 8, 12, 16):
    torch.manual_seed(0)
    gcn_acc[L] = evaluate(fit(GCN(L), g_train), g_test)
    print(f"{L:3d}   " + "   ".join(f"{a:.3f} " for a in gcn_acc[L]))
```

```output
  L   overall   depth1   depth2   depth3   depth4
  1   0.810    1.000    0.663    0.769    0.843
  2   0.835    1.000    0.886    0.775    0.843
  3   0.896    1.000    0.979    0.909    0.858
  4   0.943    1.000    0.979    0.945    0.926
  6   0.964    1.000    0.974    0.966    0.956
  8   0.955    0.984    0.959    0.953    0.952
 12   0.781    0.537    0.663    0.769    0.843
 16   0.781    0.537    0.663    0.769    0.843
```

Read the table by columns first. Depth-1 events are labelled correctly by every model with
at least one layer, and each extra layer unlocks the next depth: the $L = 1$ model is already
perfect at depth 1 but near the majority rate at depths 3 and 4, and at $L = 4$ every depth is
above 0.92. This is the receptive field. A basic event at depth $d$ has the gates at depths
$0, \dots, d-1$ above it, the topmost $d$ hops away, so a model with $L$ layers cannot see enough
to label events deeper than $L$ exactly.

Then read the rows. Accuracy keeps rising past $L = 4$, because the symmetric layers mix siblings
and gates together and extra layers help to separate them again, and then it falls off a cliff. The
12- and 16-layer models score the majority-class accuracy at every depth: they predict "not a
single point of failure" for every event. That is not overfitting, and the next step looks at
why.

### Step 6: over-smoothing, measured without training

Repeated propagation by $\hat{\mathbf{A}}$ makes the features of connected nodes more and more
alike ([Section 8](#s8)). To see this without any network, apply $\hat{\mathbf{A}}^k$ to the raw
features of the largest test tree and measure the mean cosine similarity over all pairs of nodes:
1 means every node points the same way. No weights are involved, so this is a property of the
graph and the normalisation alone.

The remedy tried here is the one from deep networks in general ([Module 03](module_03_EN.html)): a
residual connection, $\mathbf{H} \leftarrow \mathbf{H} + \mathrm{ReLU}(\hat{\mathbf{A}}\mathbf{H}\mathbf{W})$,
so that each node keeps its own features alongside the smoothed ones and the gradient has a direct
path through 16 layers.

```python
sizes_test = [len(t["type"]) for t in test_trees]
biggest = Graph([test_trees[int(np.argmax(sizes_test))]])
Z = biggest.x.clone()
print(f"largest test tree: {biggest.n} nodes")
curve_k, curve_cos = [], []
for k in range(1, 65):
    Z = propagate(biggest, Z)
    U = F.normalize(Z, dim=1)
    cos = float(((U @ U.T).sum() - biggest.n) / (biggest.n * (biggest.n - 1)))
    curve_k.append(k)
    curve_cos.append(cos)
    if k in (1, 2, 4, 8, 16, 32, 64):
        print(f"k = {k:2d}: mean pairwise cosine similarity of A_hat^k X = {cos:.3f}")

# Is the 16-layer failure underfitting? Compare train and test accuracy, with and without
# residual connections.
for name, residual in (("plain", False), ("residual", True)):
    torch.manual_seed(0)
    model16 = fit(GCN(16, residual=residual), g_train)
    tr_acc, te_acc = evaluate(model16, g_train)[0], evaluate(model16, g_test)[0]
    print(f"16 layers, {name:8s}: train accuracy {tr_acc:.3f}, test accuracy {te_acc:.3f}")

plt.figure(figsize=(6, 3.8))
plt.semilogx(curve_k, curve_cos, marker=".")
plt.xlabel("propagation steps k")
plt.ylabel("mean pairwise cosine similarity")
plt.title("Over-smoothing: node features of one 72-node tree under $\\hat{A}^k X$")
plt.show()
```

```output
largest test tree: 69 nodes
k =  1: mean pairwise cosine similarity of A_hat^k X = 0.840
k =  2: mean pairwise cosine similarity of A_hat^k X = 0.906
k =  4: mean pairwise cosine similarity of A_hat^k X = 0.932
k =  8: mean pairwise cosine similarity of A_hat^k X = 0.957
k = 16: mean pairwise cosine similarity of A_hat^k X = 0.976
k = 32: mean pairwise cosine similarity of A_hat^k X = 0.990
k = 64: mean pairwise cosine similarity of A_hat^k X = 0.997
16 layers, plain   : train accuracy 0.779, test accuracy 0.781
16 layers, residual: train accuracy 0.962, test accuracy 0.956
```

The similarity starts high, because the four-number features of different nodes are already
alike, and climbs toward 1: after 16 steps the rows of $\hat{\mathbf{A}}^k\mathbf{X}$ are nearly
parallel. Only the degree of a node, through the factor $\sqrt{	ilde d_i}$ of the dominant
eigenvector, still differs, and the type of the node has been averaged away. Over-smoothing is a
property of the graph and the normalisation, and no weights can undo it entirely.

The train accuracy of the plain 16-layer model equals its test accuracy, and both equal the
majority rate: it has not learned the training set. It is an optimisation failure. Signal that has
been averaged through many layers with ReLUs and weight decay leaves a gradient that points
nowhere useful, and training stays on the plateau where every event is called negative. Residual
connections give each node a direct path for its own features and the gradient a direct path
through the stack, and the same 16 layers then train and reach the accuracy of the best shallow
models. Depth was not the problem. Smoothing without a path for the node's own features was.

### Step 7: a direction-aware layer

The GCN's symmetric adjacency treats a node's gate, its siblings and its inputs alike. The
property being learned does not: it depends only on the gates *above* the event. A layer that
keeps the two directions apart can express "every gate above me is an OR" directly. The
direction-aware layer has three weight matrices:

$$
\mathbf{h}_v \leftarrow \mathrm{ReLU}\Big(\mathbf{W}_s\mathbf{h}_v + \mathbf{W}_p\,\mathbf{h}_{\text{gate}(v)} + \mathbf{W}_c\,\frac{1}{|\text{inputs}(v)|}\sum_{u \in \text{inputs}(v)}\mathbf{h}_u\Big),
$$

one for the node itself, one for the message from the node's gate (its parent; zero for the top
event) and one for the mean of the messages from its inputs (its children; zero for a basic event).
It is two `index_add_` calls on the directed edge list. After $L$ layers, information about
the gate $L$ levels above has reached a node through $\mathbf{W}_p$ only, with nothing diluted by
siblings.

```python
class DirGNN(nn.Module):
    def __init__(self, L, hidden=32):
        super().__init__()
        self.inp = nn.Linear(4, hidden)
        self.Ws = nn.ModuleList(nn.Linear(hidden, hidden) for _ in range(L))
        self.Wp = nn.ModuleList(nn.Linear(hidden, hidden, bias=False) for _ in range(L))
        self.Wc = nn.ModuleList(nn.Linear(hidden, hidden, bias=False) for _ in range(L))
        self.out = nn.Linear(hidden, 2)

    def forward(self, g):
        h = self.inp(g.x)
        for Ws, Wp, Wc in zip(self.Ws, self.Wp, self.Wc):
            from_gate = torch.zeros_like(h).index_add_(0, g.child, h[g.par])
            from_inputs = torch.zeros_like(h).index_add_(0, g.par, h[g.child])
            from_inputs = from_inputs / g.n_children[:, None]
            h = torch.relu(Ws(h) + Wp(from_gate) + Wc(from_inputs))
        return self.out(h)


dir_acc = {}
print("direction-aware model")
print("  L   overall   depth1   depth2   depth3   depth4")
for L in (2, 3, 4):
    torch.manual_seed(0)
    dir_model = fit(DirGNN(L), g_train)
    dir_acc[L] = evaluate(dir_model, g_test)
    print(f"{L:3d}   " + "   ".join(f"{a:.3f} " for a in dir_acc[L]))
dir4 = dir_model

depths = [1, 2, 3, 4]
plt.figure(figsize=(7, 4))
for L in (1, 2, 4):
    plt.plot(depths, gcn_acc[L][1:], marker="o", label=f"GCN, L = {L}")
plt.plot(depths, dir_acc[4][1:], marker="s", color="k", label="direction-aware, L = 4")
plt.axhline(majority, color="grey", linestyle=":", label="majority class")
plt.xticks(depths)
plt.xlabel("depth of the basic event below the top event")
plt.ylabel("test accuracy")
plt.title("Accuracy by depth: receptive field and direction")
plt.legend(loc="lower left")
plt.show()
```

```output
direction-aware model
  L   overall   depth1   depth2   depth3   depth4
  2   0.853    1.000    1.000    0.797    0.843
  3   0.941    1.000    1.000    1.000    0.882
  4   1.000    1.000    1.000    1.000    1.000
```

At $L = 2$ the direction-aware model is better than the GCN of the same depth, and its accuracy is
perfect for exactly those events its receptive field reaches: events at depth 1 and 2, whose gates
are one and two hops up. At $L = 3$ it is perfect up to depth 3, and at $L = 4$ it labels every
basic event correctly. This is what an architecture with the right inductive bias does: the
network's capacity is not spent learning that direction matters, and its limits are the ones the
receptive field predicts.

### Step 8: apply the model to the cooling system

The trained $L = 4$ direction-aware model has never seen the hand-built tree. Applying it is the last
check: it must find E1, E5 and E6, the answer of Step 2. The block also draws the tree, using the
layout of [Section 8](#s8), with the predicted single points of failure marked.

```python
dir4.eval()
with torch.no_grad():
    pred_cool = dir4(g_cool).argmax(1).numpy()
predicted = [NAMES[v] for v in np.where((pred_cool == 1) & (cooling["type"] == BASIC))[0]]
print("single points of failure predicted for the cooling system:", predicted)

pos = {0: (340, 40), 1: (130, 130), 2: (530, 130), 3: (340, 130), 4: (50, 230), 5: (130, 230),
       6: (210, 230), 7: (450, 230), 8: (530, 230), 9: (610, 230), 10: (570, 320),
       11: (650, 320)}
fig, ax = plt.subplots(figsize=(8, 4.2))
for v, p in enumerate(cooling["parent"]):
    if p >= 0:
        ax.plot([pos[v][0], pos[p][0]], [-pos[v][1], -pos[p][1]], color="grey", zorder=1)
for v, (px, py) in pos.items():
    kind = ["OR", "AND", "event"][cooling["type"][v]]
    hit = pred_cool[v] == 1 and cooling["type"][v] == BASIC
    ax.scatter(px, -py, s=900, zorder=2, marker="s" if kind != "event" else "o",
               color="tab:red" if hit else ("white" if kind == "event" else "lightgrey"),
               edgecolor="k")
    ax.text(px, -py, f"{NAMES[v]}\n{kind}" if kind != "event" else NAMES[v],
            ha="center", va="center", fontsize=8, zorder=3)
ax.set_title("Cooling-system fault tree: predicted single points of failure in red")
ax.set_xlabel("layout position (arbitrary units)")
ax.set_ylabel("level (top at the top)")
ax.set_yticks([])
plt.show()
```

```output
single points of failure predicted for the cooling system: ['E1', 'E5', 'E6']
```

The model names E1, E5 and E6 and nothing else. A small tree being correct is not strong evidence
on its own. The test set is the evidence, and this tree is a sanity check that the generator's
trees and the hand-drawn one follow the same rules.

### What you should see

- Accuracy by depth shows the receptive field: an $L$-layer model is reliable only for events at most $L$ hops below the top. The direction-aware model makes this exact: accuracy 1.0 at every depth up to $L$.
- The undirected GCN improves up to about 4 layers. The plain 8- and 16-layer models then predict the majority class for every event. Their node features are nearly identical (the untrained $\hat{\mathbf{A}}^k\mathbf{X}$ similarity climbs toward 1), and with no residual path a deep stack also trains poorly. Residual connections restore it.
- A symmetric adjacency gives each event a mixture of its gate, its siblings and, two hops away, their gate's other inputs. The property depends only on the gates above. Separate parent and child weights let the network compute "every gate above is OR" exactly.
- The rule that sounds right ("its gate is OR") is worse than the majority class. Every model must be compared with both.

### Try this

1. **Split by node.** Instead of splitting by tree, take a random 70/30 split over all nodes of all 300 trees (all nodes visible in one graph, only the labels hidden) and compare the accuracies. Explain why a per-node split flatters a model that will be used on new trees.
2. **A depth feature.** Add each node's depth as a fifth feature and retrain the undirected GCN with $L = 4$. Does it close the gap to the direction-aware model? What does the answer say about what the symmetric layers were missing?
3. **Predict which nodes are basic events.** Train a 2-layer GCN to predict whether a node is a basic event, and compare it with the baseline you named in [Exercise 9](#e9). What has the GCN learned? This one is best tried after the exercise.
