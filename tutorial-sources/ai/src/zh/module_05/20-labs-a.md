## 实验 1 — 在 8x8 数字图像上实现自编码器、VAE 和异常检测器 {#lab1}

**目标**。你在 8×8 的手写数字图像上构建[第 2 节](#s2)和[第 3 节](#s3)的三种工具，并把每一种都与一个基线比较。首先，在相同的编码维数下，把一个非线性自编码器与主成分分析（PCA）比较。然后训练[第 3 节](#s3)的变分自编码器，画出它的二维潜在空间，并用它的解码器采样和插值。接着故意提高 KL 权重，制造后验坍塌，这样当它意外出现时，你就能认出它的数字特征。最后，构建一个基于重构误差的异常检测器，其阈值在留出的正常数据上选定，并诚实地把它的检出率与经典的 PCA 监测器比较。数据随 scikit-learn 提供，无需下载，本实验在笔记本电脑 CPU 上约需两分钟。你需要 NumPy、scikit-learn、PyTorch 和 matplotlib。打印出的数字可能与你的结果在最后几位上不同。

### 步骤 1：加载数字图像并划分

`load_digits` 数据集有 1,797 张 8×8 像素的图像，取值为 0 到 16 的整数。除以 16 后像素落在 $[0, 1]$ 内，这正是 sigmoid 输出和伯努利似然所要求的。划分是分层的，所以每个数字在两部分中都保持各自的占比；在模型完成之前，测试集不会被动用。

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

最后一行是零个成分的重构：一个对任何具体图像都一无所知的模型的误差。下面的每个模型都必须胜过它，而这一比较告诉你每个模型解释了多少像素方差。后面会看到，两个 PCA 成分能消除这一误差的 28%（$1 - 0.0532/0.0740$），八个成分能消除约三分之二。

### 步骤 2：PCA 基线

有 $d_z$ 个成分的 PCA 是最优的线性自编码器（[第 2 节](#s2)），所以它是任何非线性模型在相同编码维数下必须胜过的基线。它在训练集上拟合、在测试集上评分：重构是 `inverse_transform(transform(X))`，误差是每像素的均方差。

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

两个成分消除了均值图像误差的 28%，八个成分消除了 67%。剩下的误差是像素细节，这么大的平坦子空间捕捉不到它们。

### 步骤 3：欠完备自编码器

图 5.2 的自编码器在编码两侧各有一个 128 个单元的隐藏层。两个模型共用一个 `train()` 辅助函数：Adam，学习率 $10^{-3}$，batch 大小为 64，200 个轮次，以及一个设定了种子、固定打乱顺序的 `torch.Generator`，这样重新运行会得到相同的数字。辅助函数以函数的形式接收损失，因为下一步的 VAE 需要另一种损失。

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
    ae = train(AutoEncoder(d_z=d_z), Xtr_t, ae_loss)
    aes[d_z] = ae
    with torch.no_grad():
        test_mse = mse_per_pixel(ae(Xte_t).numpy(), X_te)
    print(f"AE d_z={d_z}: test MSE per pixel {test_mse:.4f} "
          f"(PCA {pca_mse[d_z]:.4f}), {time.time() - t0:.0f} s")
```

```output
AE d_z=2: test MSE per pixel 0.0368 (PCA 0.0532), 12 s
AE d_z=8: test MSE per pixel 0.0110 (PCA 0.0246), 10 s
```

自编码器在两种维数下都胜过 PCA。数字图像位于像素空间中一个弯曲的低维曲面上，非线性解码器能沿着它走，而平坦子空间做不到。输出上的 sigmoid 把重构保持在 $[0, 1]$ 内。不要把这个差距当作普遍规律：在近似线性的数据上，PCA 一样好，而且几乎没有代价。

### 步骤 4：变分自编码器

这里的 VAE 就是[第 3 节](#s3)的那个类，只有三处改动。解码器输出**伯努利 logits**，所以重构项是 64 个像素上的二元交叉熵之和。KL 项**按潜在维度**保留，这样就能逐维诊断坍塌。一个 `beta` 属性乘在 KL 上，由此得到 beta-VAE；$\beta = 1$ 就是证据下界（ELBO）本身。两项都以每张图像的奈特数计，在 batch 上取平均，所以损失就是负 ELBO。

一个报告函数给出关键的四个数：负 ELBO、它的两个组成部分，以及每个维度的 KL。重构项对每张图像用一个 $\mathbf{z}$ 样本，以固定的种子抽取。

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

把这些数字当作信息量来读。KL 是编码平均携带的关于一张图像的信息，以奈特计；除以 $\ln 2$ 就得到比特数。这里的 2.3 奈特就是 3.3 比特，相当于在十个等可能的选项中做一次选择所含的信息（$\ln 10 = 2.30$）：大约是一个类别标签所携带的信息，不多不少。重构项是解码器从这个编码仍然无法预测的部分。两个维度都在使用，KL 相近。KL 为 0.00 的维度就是坍塌了。

### 步骤 5：并排比较潜在空间

评判一个潜在空间，要看它保留了什么，以及它的点与点之间是什么。第一个检验是**近邻可分性**：在训练集的编码上拟合一个 5 近邻分类器，在测试集的编码上评分。对 VAE，编码取均值 $\boldsymbol{\mu}(\mathbf{x})$。原始的 64 个像素给出上限。第二个检验是可视化的：解码一个 10 × 10 的编码网格。对 VAE，网格覆盖 $[-2.5, 2.5]^2$，先验几乎把全部概率质量都放在这里。普通自编码器没有先验，所以它的网格覆盖它自己训练编码的包围盒。

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

自编码器把各个数字分得最开。二维 PCA 编码最差，因为平坦的投影会把几个类别叠在一起。VAE 介于两者之间，散点图说明了原因：KL 项把每一团点都拉向原点、拉向单位宽度，于是各个簇彼此相接。解码网格说明了这些簇换来了什么。VAE 网格的每一格都是一个像样的数字，数字在平面上平滑地变化。自编码器的网格在簇附近数字更清晰，而在簇之间的空隙里则是污迹或不合理的形状，因为从来没有任何东西要求解码器在那里给出合理的输出。两种二维编码都远不及原始像素：十个类别无法无损地装进两个数里。

### 步骤 6：采样与插值

从 VAE 生成只需两行：从先验抽取 $\mathbf{z} \sim \mathcal{N}(0, \mathbf{I})$，然后解码。插值取两张真实测试图像（一个“1”和一个“7”）的潜在均值，解码二者连线上的八个点。由于 KL 项已使聚合后验接近先验，这条直线始终位于解码器熟悉的区域。

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

在 8×8 像素下，样本很粗糙，而且都是模糊的：解码器输出的是与一个编码相容的所有图像的平均（[第 3 节](#s3)，样本模糊）。要找的是像数字的笔画，而不是噪声；有些样本是两个类别的含糊混合，正如散点图中的重叠所预示的。插值一步一步地改变形状，而不是让一张图像淡出、另一张淡入。在像素空间中混合“1”和“7”，得到的会是两张叠在一起的淡图像。这就是平滑潜在空间的实际含义。

### 步骤 7：故意制造后验坍塌

现在编码维数取 $d_z = 8$，并改变 KL 权重：$\beta = 0.5$、1 和 4。对每个模型，实验打印总 KL、每个维度的 KL、重构项以及**活跃单元**（active units）的数目，即测试集上均值编码 $\mu_j(\mathbf{x})$ 的方差超过 0.01 的维度 $j$。第四个模型使用[第 3 节](#s3)那个精简类的损失，即平方误差之和，它相当于 $\sigma_x^2 = 1/2$ 的高斯解码器。它的重构项处在另一个尺度上，所以只有它的 KL 和活跃单元能与其他模型比较。

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

KL 权重决定了编码可以携带多少信息。$\beta = 0.5$ 时，编码携带 6.5 奈特，八个维度全都在用。$\beta = 1$ 时，也就是真正的 ELBO，编码携带 3.6 奈特，其中几乎全部由五个维度承担（3.57 奈特中的 3.55）；另外三个维度停在先验附近，其中一个仍随输入略有变化，这就是为什么有六个单元算作活跃。$\beta = 4$ 时，每个维度的 KL 都是零：编码器对每张图像都输出先验，解码器无论 $\mathbf{z}$ 是什么都产生同一个平均数字。这就是后验坍塌，而在这里它不是训练中的意外。是目标函数本身偏好它：使用编码带来的重构收益小于其 KL 代价的四倍（[第 3 节](#s3)给出了具体数字）。平方误差损失出于同样的原因、以较温和的形式让大多数维度坍塌，因为 $\sigma_x^2 = 1/2$ 使得放弃重构的代价很小。

要根据每个维度的 KL 来诊断坍塌，如上所示，而不是根据损失：坍塌的模型损失非常平稳。

### 步骤 8：阈值选得诚实的异常检测器

最后一项任务是[第 2 节](#s2)中的用途。检测器只在**正常**数据（数字 0 到 8）上训练，数字 9 扮演一个未曾预料的故障。训练用的数字再划分一次：80% 用来拟合自编码器，20% 留出作为正常数据的验证集，阈值就从验证集读出。阈值取验证误差的第 95 百分位数，所以按照构造，正常数据上的误报率应当接近 5%。数字 9 上的检出率不由任何东西设定，而是测出来的。测试集只在最后使用一次。

基线是工程师首先会构建的那种监测器：在同样的正常数据上拟合 8 个成分的 PCA，用 **Q 统计量**（即平方重构误差）评分，并用同一验证集上它自己的第 95 百分位数作为阈值。

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

这张表要按顺序读出三点。正常测试数字上的误报率接近阈值所设定的 5%，这证实验证集划分起了作用（正常测试图像只有 324 张，差一两个百分点只是噪声）。检出率是异常本身的性质，而不是阈值的性质：尽管 AUC 为 0.95，数字 9 也只有约 58% 被捕获。AUC 是在所有阈值上的平均，包括那些没人会用的阈值，它对你选定的那个阈值什么也没说。而 PCA 监测器明显更差，这正是证明网络有其价值的比较。直方图显示了造成漏检的重叠：许多 9 的误差落在正常范围之内，因为它们与模型能重构得很好的数字相似。

如果你在测试误差上选阈值以捕获更多的 9，报告的检出率就只是这一选择的产物。在验证数据上选择，在测试数据上报告。

### 你应该看到什么

- 在相同编码维数下，自编码器胜过 PCA：$d_z = 2$ 时约好 30%，$d_z = 8$ 时好一倍以上，因为数字图像位于一个弯曲的流形上。
- VAE 的二维编码比自编码器的重叠更多（5 近邻准确率约 0.75，对比 0.84），因为 KL 项把每个编码都拉向 $\mathcal{N}(0, \mathbf{I})$。作为交换，VAE 网格的每一点都解码为一个像样的数字，而自编码器的网格在簇与簇之间有不合理的区域。
- KL 权重控制坍塌。$\beta = 4$ 时每个维度的 KL 都是 0.00，解码器输出一个平均数字。平方误差之和的损失（$\sigma_x^2 = 1/2$）只让八个维度中约三个保持活跃。
- AUC 为 0.95 并不意味着 95% 的检出率。在误报约 5% 的阈值下，约 58% 的 9 被捕获。PCA 监测器在这两方面都更差。

### 动手试试

1. **KL 预热**。在 $d_z = 8$ 的 VAE 中，让 $\beta$ 在前 50 个轮次内从 0 线性升到 1，并统计活跃单元：预计会从 6 个升到 8 个，多出的两个只携带很少的 KL（这一扩展的一次运行得到 8 个活跃单元，KL 为 3.48 奈特，两个新维度分别为 0.01 和 0.04）。若改为升到 $\beta = 4$，模型仍然坍塌（KL 0.01，没有活跃单元）。预热能修复由优化路径造成的坍塌，却修复不了作为目标函数最优解的坍塌。
2. **二维中的簇**。从三个二维高斯簇生成 3,000 个点，均值为 $(-2, 0)$、$(2, 0)$、$(0, 2.5)$，标准差为 0.3。用 $d_x = 2$、$d_z = 2$ 和高斯解码器训练 VAE，画出按簇着色的潜在均值。然后设 $d_z = 1$，看各个簇是否仍然分开。
3. **另一种异常**。改为留出数字 8 而不是 9，再改为留出数字 0，阈值规则不变。其中一个的检出率会急剧上升。对这个模型来说，哪些数字是难以检出的异常？为什么这取决于正常类中剩下了哪些数字？

## 实验 2 — 双月数据上的扩散模型与无分类器引导 {#lab2}

**目标**。你在小到可以直接观察的数据上实现[第 5 节](#s5)和[第 6 节](#s6)的各个部件：采用余弦调度的前向加噪过程、用简化损失训练的噪声预测网络、从反向过程进行的祖先采样（ancestral sampling）、无分类器引导，以及步数更少的确定性 DDIM 采样器。数据是 `make_moons` 生成的两个交错的月牙，这是一个二维分布，其质量可以用最近邻距离来测量，而不必靠肉眼判断。你会看到样本的结构在反向过程的后期才出现，看到引导以多样性换取保真度，看到步数减少时质量下降。数据是合成的，无需下载，本实验在笔记本电脑 CPU 上约需两分钟（所示运行用了 105 秒）：网络有 37,858 个参数，其中训练占 95 秒。在第一个代码块中设 `QUICK = True`，就只训练 8,000 步而不是 20,000 步，约一分钟即可完成。打印出的数字可能与你的结果在最后几位上不同。

### 步骤 1：噪声调度，以及为什么要给它设上限

[第 5 节](#s5)的前向过程在 $T$ 步内把数据变成噪声。记 $\alpha_t = 1 - \beta_t$、$\bar\alpha_t = \prod_{s \le t}\alpha_s$，加噪后的点为
$\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1 - \bar\alpha_t}\,\boldsymbol\epsilon$。
调度采用 Nichol 和 Dhariwal 的余弦调度：$\bar\alpha_t$ 正比于
$\cos^2\!\big(\tfrac{t/T + s}{1 + s}\cdot\tfrac{\pi}{2}\big)$，其中 $s = 0.008$，并归一化使
$\bar\alpha_0 = 1$，每个 $\beta_t = 1 - \bar\alpha_t/\bar\alpha_{t-1}$。本实验用
$T = 200$，而不是论文中的 1,000，因为双月数据需要的步数少得多。

与论文唯一的不同是一个上限：$\beta_t \le 0.5$，而不是 0.999。不设上限的调度以 $\beta_T = 1$ 和 $\bar\alpha_T = 0$ 结束。反向步要除以 $\sqrt{\alpha_t}$，所以在最后一步，$\alpha_T = 1 - \beta_T$ 极小，网络犯下的任何误差都会被乘以 $1/\sqrt{\alpha_T}$。$\beta_T = 0.999$ 时这个因子是 31.6，有上限时是 1.41。第一个代码块打印了两种情况下的因子，让你看到这一影响有多大。上限使 $\bar\alpha_T$ 停在一个很小的正数上，而采样器从 $\mathcal{N}(0, \mathbf{I})$ 出发，这样起始分布就有了极其微小的偏差；对这份数据，这一误差看不出来。

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

信号起初下降得慢，后来下降得快：$t = 50$ 时还剩 0.85 的方差，$t = 100$ 时剩一半，$t = 150$ 时剩 0.14，最后五十步把剩下的部分降到几乎为零。选用余弦调度正是为了这种形状：它在中等噪声水平上花很多步，此时数据的结构部分可见，而不是一冲而过。下面的训练和采样始终使用设了上限的值，所以前向过程与反向过程彼此一致。

### 步骤 2：画出前向过程

闭式解让你可以直接跳到任意一步。每个点用一次固定的噪声抽样 $\boldsymbol\epsilon$，并在每个 $t$ 上重复使用，这样每个点都沿着一条直线从原处滑向噪声，各个子图之间也可以比较。数据先做标准化，使每个坐标的均值为零、方差为一，这样终态 $\mathcal{N}(0, \mathbf{I})$ 与数据的尺度相同。标准化使用训练集自身的均值和标准差；同样的数值也会用于评估集。

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

到 $t = 50$ 时，细细的月牙已经变成两团宽大且相互重叠的云，每个月牙一团。到 $t = 100$ 时，它们是两团严重重叠的斑块；从 $t = 150$ 起，两个类别混在一起，只剩下一团高斯云。数据的精细几何，也就是月牙的弧线，在前向过程的早期就被破坏了。反向过程必须把它重建出来，这是步骤 5 中“结构后期才出现”这一观察的第一个提示。

### 步骤 3：去噪网络

网络 $\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c)$ 预测被加入的噪声。它需要知道步数 $t$，因为正确答案取决于输入有多嘈杂；它还需要知道条件 $c$：月牙标签 0 或 1，或者第三个值 **null**，表示“无条件”。null 值使步骤 6 中的无分类器引导成为可能，因为同一个网络于是既给出条件预测，也给出无条件预测。

步数编码为 32 维的正弦嵌入，与 Transformer 中一样；条件由一个有三个条目的可学习 32 维嵌入编码。两个嵌入相加，其和与 $\mathbf{x}_t$ 的 2 个坐标拼接。随后是三个 128 单元、使用 SiLU 激活的隐藏层，以及输出 2 个数的线性层。参数量为
$34 \cdot 128 + 128 + 2(128 \cdot 128 + 128) + 128 \cdot 2 + 2 + 3 \cdot 32 = 37{,}858$。

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

### 步骤 4：用简化损失训练

每个训练步抽取一个 batch 的 512 个干净点，为每个点抽取在 $\{1, \dots, 200\}$ 上均匀分布的步数 $t$ 和噪声 $\boldsymbol\epsilon$；构造 $\mathbf{x}_t$；并最小化 $\boldsymbol\epsilon$ 与 $\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c)$ 之间的均方误差。这就是[第 5 节](#s5)的目标函数，一个普通的回归。条件以 0.2 的概率被替换为 `NULL`，使同一个网络同时学会条件噪声和无条件噪声。使用 Adam，学习率 $10^{-3}$，余弦衰减到零，完成整个训练。

损失不会降到零，也不应该降到零：噪声是随机的，网络只能预测其中能由 $\mathbf{x}_t$ 和 $t$ 揭示的那部分。$t$ 很小时，$\mathbf{x}_t$ 几乎就是 $\mathbf{x}_0$，噪声几乎无法从单个点中恢复。$t$ 很大时，$\mathbf{x}_t$ 几乎全是噪声，任务就容易了。因此打印出的损失是在难度差别极大的情形上的平均，一条平坦的曲线对样本质量说明不了多少。

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
training time 95 s
```

损失在前五分之一为 0.36，之后稳定在 0.33 附近。这是一个无法低于噪声下限的误差在所有噪声水平上的平均，所以早在样本停止改进之前，曲线就几乎平了。0.33 的损失并不能说明月牙是否清晰；接下来几步的最近邻测量才能说明。训练时间取决于机器，在繁忙的机器上可能是安静的笔记本电脑上一分半钟的两倍。

### 步骤 5：祖先采样，以及它产生了什么

采样从 $\mathbf{x}_T \sim \mathcal{N}(0, \mathbf{I})$ 开始，对
$t = T, \dots, 1$ 应用 Ho 等人的更新（算法 2）：

$$
\mathbf{x}_{t-1} = \frac{1}{\sqrt{\alpha_t}}\Big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1 - \bar\alpha_t}}\,\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c)\Big) + \sqrt{\beta_t}\,\mathbf{z},
\qquad \mathbf{z} \sim \mathcal{N}(0, \mathbf{I}),
$$

最后一步取 $\mathbf{z} = 0$。第一项去掉预测的噪声并重新缩放；第二项加回少量新的噪声，方差为 $\beta_t$，这使链条成为从反向过程中抽取的真正样本，而不是一次确定性的滑动。下面的函数接收一个条件和一个**引导强度**（guidance scale）$w$；这一步使用 null 条件，所以 $w$ 不起作用，步骤 6 会同时用到两者。

样本用最近邻距离评分，单位是标准化后的单位。从每个**样本**到 5,000 点参考集中最近点的平均距离是一个类似精确率的量：样本落在月牙上时它就小。从每个**参考**点到最近样本的平均距离是一个类似召回率的量：样本覆盖了月牙的每一部分时它就小。两把标尺为它们提供校准：从真实分布新抽取的 2,000 个点，代表任何采样器所能达到的最好结果；以及从 $\mathcal{N}(0, \mathbf{I})$ 抽取的 2,000 个点，即起点。

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
unconditional samples  precision-like 0.022   recall-like 0.022   (0.5 s)
precision-like distance of x_t at t = (200, 150, 100, 50, 20, 5) : [0.246, 0.234, 0.212, 0.134, 0.057, 0.027]
```

先读两把标尺。新抽取的数据到参考集的距离约为 0.013，参考集到它们的距离约为 0.021，这是由样本量和月牙本身的噪声决定的下限：没有哪个采样器能低于它们。噪声的两个距离为 0.24 和 0.05。模型的样本在两项上都接近下限：它们落在月牙上，并且覆盖了两个月牙。六张快照显示了这是在哪里发生的。$\mathbf{x}_t$ 的类精确率距离在 $t = 200$ 时仍约为 0.25，与纯噪声相同，直到 $t = 100$ 只缓慢下降（0.212），$t = 50$ 时为 0.134，并在最后五十步内降到最终的 0.022。结构在后期才出现：$t = 100$ 和 $t = 50$ 的快照是没有形状的斑块，只隐约可见两个月牙，月牙只在 $t = 50$ 到 $t = 5$ 之间才变清晰。这就是最后几步对质量最重要的原因，也是步骤 7 中减少步数代价高昂的原因。

设 `QUICK = True` 时，预计类精确率距离约为 0.04，类召回率距离约为 0.025（一次 `QUICK = True` 的运行得到 0.039 和 0.025）：月牙明显更模糊，月牙附近有零散的点。模型训练的步数更少，而它在反向链条中走的每一步都会累积它的误差。

### 步骤 6：无分类器引导

条件模型从 $p(\mathbf{x} \mid c)$ 中采样。引导使它更集中。更新中使用的噪声预测为

$$
\tilde{\boldsymbol\epsilon} = \boldsymbol\epsilon_\theta(\mathbf{x}_t, t, \varnothing) + w\,\big(\boldsymbol\epsilon_\theta(\mathbf{x}_t, t, c) - \boldsymbol\epsilon_\theta(\mathbf{x}_t, t, \varnothing)\big),
$$

其中 $\varnothing$ 是 null 条件。$w = 0$ 时它就是无条件模型；$w = 1$ 时它就是条件模型；$w > 1$ 时，它沿着从“任意”指向“类别 $c$”的方向走得比单独的条件模型更远。这里引导强度的写法与代码一致，$w = 1$ 表示普通的条件模型。Ho 和 Salimans 用 $(1 + w)$ 写同一件事，所以他们的 $w = 0$ 就是本实验的 $w = 1$。

代码块对 $w = 0, 1, 3, 7$ 各采样 1,000 个类别 0 的点。一个在带标签参考集上拟合的 15 近邻分类器判断每个样本落在哪个月牙上；落在月牙 0 上的比例衡量条件被遵守的程度。类精确率距离使用所有参考点。类召回率距离只使用类别 0 的参考点，因为被采样的正是这个分布。

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

$w = 0$ 时条件被忽略，一半样本落在每个月牙上：这就是无条件模型。它到类别 0 各点的类召回率距离较高（0.032），因为它只有一半样本靠近这些点。$w = 1$ 时，每个样本都落在所要求的月牙上，类召回率距离也达到最好，为 0.021。落在月牙上的比例不可能超过 1.00，但其他数字还在变化。类召回率距离随 $w$ 增大（$w = 3$ 时为 0.029，$w = 7$ 时为 0.043），因为样本集中到月牙最密的部分，它的两端无人问津，如图所示。$w = 7$ 时类精确率距离也变大了（0.020，而 $w = 3$ 时为 0.013），因为更强的推力冲过了头：有些样本越过月牙的左上端，离开了月牙。这是引导最纯粹形式的权衡。对条件的保真度是用多样性换来的，而超过某个强度后，代价还包括更差的拟合。

### 步骤 7：DDIM 与步数的代价

祖先采样每个样本需要 200 次网络计算。DDIM（Song 等人）复用同一个训练好的网络，采用一种可以跳步的确定性更新。每一步它先由噪声预测估计干净的点，

$$
\hat{\mathbf{x}}_0 = \frac{\mathbf{x}_t - \sqrt{1 - \bar\alpha_t}\,\boldsymbol\epsilon_\theta}{\sqrt{\bar\alpha_t}},
$$

这是前向公式的逆，然后用*同一个*预测噪声把它重新加噪到下一个更低的噪声水平 $t'$：

$$
\mathbf{x}_{t'} = \sqrt{\bar\alpha_{t'}}\,\hat{\mathbf{x}}_0 + \sqrt{1 - \bar\alpha_{t'}}\,\boldsymbol\epsilon_\theta .
$$

这里不注入新的噪声，所以从 $\mathbf{x}_T$ 到 $\mathbf{x}_0$ 的映射是确定性的。
由于更新只需要 $\bar\alpha_t$ 和 $\bar\alpha_{t'}$，$t'$ 不必是 $t - 1$：从 200 到 0 均匀取 $K$ 步，就得到一个无需重新训练的 $K$ 步采样器。代码块对 $K = 200, 50, 20, 10, 5, 2, 1$ 测量无条件样本，以及每种情况所用的时间。$K = 1$ 那一行是在 $t = 200$ 处只做一次计算得到的 $\hat{\mathbf{x}}_0$。

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
 200          0.022        0.023     0.84
  50          0.022        0.024     0.21
  20          0.025        0.029     0.12
  10          0.035        0.042     0.07
   5          0.046        0.067     0.03
   2          0.152        0.120     0.02
   1          1.714        0.142     0.02
```

二十到五十步 DDIM 给出的样本接近 200 步祖先采样器的样本，而网络计算次数只有它的四分之一到十分之一；时间一列几乎与 $K$ 成正比地下降。少于约十步时，质量迅速下降。一步则是另一种失败。在 $t = 200$ 处信号权重为
$\sqrt{\bar\alpha_{200}} = 0.008$，所以估计 $\hat{\mathbf{x}}_0$ 要把网络的输出除以 0.008，即放大 121 倍，$\boldsymbol\epsilon_\theta$ 中的任何误差都会被放大这么多倍。因此一步得到的样本散布在远离数据的地方，类精确率距离远大于 1，尽管它们的类召回率距离只有 0.14：数据区域确实被覆盖了，但覆盖它的那团云还覆盖了大得多的范围。扩散的代价在于它的步数，而这些步数换来的，正是你在步骤 5 中看到的对结构的逐步确定。

### 你应该看到什么

- 结构在反向过程的后期才出现。中间样本直到约 $t = 50$ 都没有形状（类精确率距离 0.134，而噪声为 0.246），月牙在 $t = 50$ 到 $t = 5$ 之间形成。
- 无条件样本与数据的接近程度几乎与新抽取的数据相当（约 0.022，对比 0.013），并覆盖了两个月牙（类召回率距离 0.022，对比 0.021）。
- 引导以多样性换取保真度。$w = 1$ 已经让每个样本都落在所要求的月牙上。$w = 3$ 和 $w = 7$ 把样本挤向月牙最密的部分，到 $w = 7$ 时类召回率距离翻了一倍；$w = 7$ 时，由于样本冲过了头，类精确率距离开始变差。
- 20 到 50 步的 DDIM 接近 200 步的祖先采样器。少于约 10 步时质量迅速下降，而单步只返回一个远离数据、被抹开的估计。
- $\beta_t$ 的上限是一道保险。按论文的上限 0.999，第一个反向步会把网络的误差乘以 31.6，而上限为 0.5 时只乘以 1.41。这是否造成损害取决于具体的运行：在规划本模块时做的一个原型中，$w = 7$ 的样本发散了（类精确率距离 1.34），而在当前环境中用 0.999 上限重新训练的本实验副本，在 $w = 7$ 时得到 0.019，与设了上限的模型一样好。上限以零代价消除了这一风险。

### 动手试试

1. **恢复原上限**。把上限设为 0.999，重复步骤 6。然后保持 0.999 的上限，但计算 $\hat{\mathbf{x}}_0$，把它裁剪到 $[-3, 3]$，再改用由 $\hat{\mathbf{x}}_0$ 得到的后验均值更新 $\tilde\mu_t$。最初的实现正是这样在不设上限的调度下存活下来的。
2. **同一数据上的 GAN**。在同样标准化的月牙数据上，把[第 4 节](#s4)的非饱和 GAN（生成器和判别器：三个 128 单元隐藏层的多层感知机，Adam，学习率 $10^{-3}$，$\beta = (0.5, 0.999)$）训练 6,000 步。把它的类精确率和类召回率距离与扩散模型比较。它每个样本只需一次前向传播；扩散模型需要 200 次。
3. **线性调度**。把调度换成 Ho 等人的线性范围，$\beta_t$ 从 $10^{-4}$ 到 0.02，仍取 $T = 200$，它结束于 $\bar\alpha_T = 0.13$（用它重新训练的本实验副本得到类精确率距离 0.020、类召回率距离 0.022）。在这些二维标准化数据上，损害很小。解释为什么二维标准化数据掩盖了一个对图像很重要的问题：$\bar\alpha_T = 0.13$ 在起始样本中留下了什么？

## 实验 3 — 从零实现图卷积网络：故障树中的单点故障 {#lab3}

**目标**。你从边列表出发，用约三十行代码构建消息传递，并把它用于一个答案精确已知的任务：找出故障树的**单点故障**，即仅凭自身失效就能导致顶事件发生的底事件。你编写一个随机故障树生成器和一个给出真实标签的标注器，测量模型必须胜过的两个基线，训练深度逐渐增加的图卷积网络（[第 7 节](#s7)），并亲眼看到[第 8 节](#s8)所说的深度限制：按距顶事件的距离统计的准确率、无需任何训练即可测量的过平滑，以及用残差连接进行的修复。最后，你把对称邻接换成一个方向感知层，它利用了朴素 GCN 丢掉的那一点结构。数据是合成的，本实验不使用任何图神经网络库；它在笔记本电脑 CPU 上约需三分钟（所示运行用了 168 秒），需要 NumPy、PyTorch 和 matplotlib。它让 PyTorch 在单线程上运行：在多线程上，消息传递中的 scatter-add 求和顺序每次运行都会变，准确率也随之而变。即使在单线程上，准确率也会随 PyTorch 版本变动一两个百分点，所以要把它们当作现象来读，而不是当作确切的数字。

### 步骤 1：故障树生成器及其标签

故障树由**门**（或门 OR：任一输入失效则输出失效；与门 AND：只有全部输入失效时才失效）和**底事件**（即叶节点）组成。如果一个底事件到顶事件路径上的每个门都是或门，它就是单点故障：此时它自身的失效会一路向上传播。路径上任何地方只要有一个与门，就意味着该门的其他输入也必须失效。

生成器遵循固定的配方。顶事件是一个门，以 0.6 的概率为或门，否则为与门。每个门有两到四个输入，均匀抽取。深度为 0 或 1 的门，其输入本身以 0.6 的概率是一个门；深度为 2 时概率为 0.35；深度为 3 的门只以底事件为输入，所以没有哪棵树在顶事件之下深于四层。每个非顶层的门以 0.6 的概率为或门。每个节点有四个特征：其类型（或门、与门、底事件）的独热编码，以及一个标记顶事件的标志位。门不参与评分；底事件的标签为 1 表示单点故障。

实验用一个设定了种子的生成器生成 300 棵树，200 棵用于训练、100 棵用于测试，并且**按树**划分，使测试树是新的图，而不是某棵训练树中的节点。工程模型要用在新的模型上，而不是旧模型的新节点上（[第 7 节](#s7)）。

```python
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

np.random.seed(0)
torch.manual_seed(0)
torch.set_num_threads(1)    # scatter-adds sum in a fixed order only on one thread

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

在训练树和测试树中，大约每五个底事件中就有一个是单点故障，所以一个从不预测单点故障的模型大约五次中能对四次：这就是要胜过的基线。大多数底事件位于顶事件之下三到四层，而它们恰恰需要最多的信息才能标注。换一个种子或换一种抽取顺序，计数会有些不同（各项比例变动一两个百分点），所以不要指望用不同的生成器得到这些数字。

### 步骤 2：在一棵可以手工验证的树上检验标注器

没人检验过的标注器，是错误基准最常见的来源。[第 8 节](#s8)的冷却系统故障树有十二个节点，它的答案可以直接从图上读出。顶事件“失去冷却”是三个输入的或门：门 G1“所有泵失效”（三个泵的与门）；门 G2“流道堵塞”（一个阀门、一根管道和门 G3“两个控制器都失效”的或门，G3 是两个控制器的与门）；以及底事件 E1，即电源。因此单点故障是直接相连的 E1，以及经由或门 G2 的阀门 E5 和管道 E6。泵和控制器都位于与门之下。

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

这个断言就是这一步的意义所在。如果它失败了，后面的一切都不可信。

### 步骤 3：两个基线

模型在测试底事件上的准确率，若没有某个平凡方法的准确率作对照，就毫无意义。这里有两个平凡的预测器。**多数类**：对每个事件都说“不是单点故障”。以及一条听起来正确的规则，**“事件自己的门是或门”**：如果正上方的门是或门，这个事件看起来就像单点故障。恰好在更高处某个地方有与门时，这条规则就错了。两者都在测试底事件上计算。

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

这条看似合理的规则比预测多数类还差。许多自己的门是或门的事件，在更高处有一个与门，所以这条规则会产生大量误报。下面的每个模型都必须胜过这两个数字，一个只胜过这条规则的模型，对单点故障什么也没学到。

### 步骤 4：边列表上的消息传递

消息沿边发送，整个层就是一次 scatter-add。图存储为边列表：两个数组 $i$ 和 $j$，表示存在一条从 $j$ 到 $i$ 的边（一条从 $j$ 发送到 $i$ 的消息）。GCN 的传播矩阵是
$\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A} + \mathbf{I})\tilde{\mathbf{D}}^{-1/2}$，
所以边列表包含每条树边的两个方向，以及每个节点的一个自环，每条边的权重为 $1/\sqrt{\tilde d_i \tilde d_j}$，其中 $\tilde d$ 是节点的邻居数加上它自己。于是传播特征 $\mathbf{H}$ 就是

```text
out[i] = sum over edges (i, j) of  w_ij * H[j]
```

`index_add_` 在 $O(|\mathcal{E}|\,d)$ 时间内算出它，从不构造 $n \times n$ 矩阵。代码为任意一组树构建一个 `Graph`（这些树合并成一张大图，树与树之间没有边），并在十二节点的树上把边列表传播与稠密公式相核对。

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

两者吻合到 float32 的舍入误差。行和不是 1，因为对称归一化按两端的度来给边加权，而不是只按接收方的度；正是这一点使反复传播不会让特征爆炸或缩小（[第 7 节](#s7)）。

### 步骤 5：深度逐渐增加的 GCN

模型是[第 7 节](#s7)的 GCN。一个线性层把四个特征映射为 32 个数；$L$ 个层各自用自己的 $32 \times 32$ 矩阵计算 $\mathbf{H} \leftarrow \mathrm{ReLU}(\hat{\mathbf{A}}\mathbf{H}\mathbf{W})$；一个线性层把每个节点映射为两个类别得分。训练采用全 batch 方式，因为整个训练集就是一张几千个节点的图：Adam，学习率 $10^{-2}$，权重衰减 $5 \cdot 10^{-4}$，200 个轮次，交叉熵损失**只在训练底事件上**计算，因为门没有标签。同一个 `fit` 辅助函数训练本实验中的每个模型。表格给出
$L = 1, 2, 3, 4, 6, 8, 12, 16$ 时的总体测试准确率以及按事件深度统计的准确率。

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
  2   0.832    1.000    0.886    0.769    0.843
  3   0.897    1.000    0.969    0.920    0.854
  4   0.938    1.000    0.964    0.933    0.929
  6   0.937    1.000    0.938    0.923    0.939
  8   0.959    0.984    0.959    0.958    0.956
 12   0.781    0.537    0.663    0.769    0.843
 16   0.781    0.537    0.663    0.769    0.843
```

先按列读这张表。至少有一层的模型都能正确标注深度 1 的事件，而每多一层就解锁下一个深度：$L = 1$ 的模型在深度 1 上已经完美，但在深度 3 和 4 上接近多数类的比率；到 $L = 4$ 时，每个深度都在 0.92 以上。这就是感受野。深度为 $d$ 的底事件上方有深度为 $0, \dots, d-1$ 的门，最顶上的门在 $d$ 跳之外，所以有 $L$ 层的模型看不到足够的信息，无法准确标注深于 $L$ 的事件。

再按行读。准确率在 $L = 4$ 和 6 时保持在 0.94 附近，在 $L = 8$ 时最好（0.959），因为对称层把兄弟节点和门混在一起，额外的层有助于把它们重新分开；然后准确率就断崖式下跌。12 层和 16 层的模型在每个深度上都得到多数类的准确率：它们对每个事件都预测“不是单点故障”。这不是过拟合，下一步会探究原因。

### 步骤 6：无需训练即可测量的过平滑

用 $\hat{\mathbf{A}}$ 反复传播，会让相连节点的特征越来越相似（[第 8 节](#s8)）。要在没有任何网络的情况下看到这一点，就把 $\hat{\mathbf{A}}^k$ 作用于最大那棵测试树的原始特征，并测量所有节点对之间的平均余弦相似度：1 表示每个节点都指向同一个方向。这里不涉及任何权重，所以这只是图和归一化本身的性质。

这里尝试的补救方法来自一般的深度网络（[模块 03 第 8 节](module_03_ZH.html#s8)）：残差连接，$\mathbf{H} \leftarrow \mathbf{H} + \mathrm{ReLU}(\hat{\mathbf{A}}\mathbf{H}\mathbf{W})$，
使每个节点在平滑后的特征之外还保留自己的特征，梯度也有一条穿过 16 层的直接通路。

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
plt.title(f"Over-smoothing: node features of one {biggest.n}-node tree under $\\hat{{A}}^k X$")
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
16 layers, residual: train accuracy 0.967, test accuracy 0.948
```

相似度起点就很高，因为不同节点的四维特征本来就相似，然后它向 1 攀升：16 步之后，$\hat{\mathbf{A}}^k\mathbf{X}$ 的各行几乎平行。只有节点的度还有差别，它通过主特征向量中的因子 $\sqrt{\tilde d_i}$ 体现，而节点的类型已经被平均掉了。过平滑是图和归一化的性质，任何权重都无法完全消除它。

朴素 16 层模型的训练准确率等于其测试准确率，两者都等于多数类比率：它没有学会训练集。这是一次优化失败。经过许多带 ReLU 和权重衰减的层平均之后，信号留下的梯度指向毫无用处的方向，训练就停留在把每个事件都判为负类的平台上。残差连接给每个节点的自身特征一条直接通路，也给梯度一条穿过整个堆叠的直接通路，于是同样的 16 层就能训练起来，达到 0.948，介于 4 层和 8 层的朴素模型之间（0.938 和 0.959）。问题不在于深度，而在于平滑时没有为节点自身的特征留出通路。

### 步骤 7：方向感知层

GCN 的对称邻接对一个节点的门、它的兄弟节点和它的输入一视同仁。而要学习的性质并非如此：它只取决于事件*之上*的门。一个把两个方向分开的层，可以直接表达“我上方的每个门都是或门”。方向感知层有三个权重矩阵：

$$
\mathbf{h}_v \leftarrow \mathrm{ReLU}\Big(\mathbf{W}_s\mathbf{h}_v + \mathbf{W}_p\,\mathbf{h}_{\text{门}(v)} + \mathbf{W}_c\,\frac{1}{|\text{输入}(v)|}\sum_{u \in \text{输入}(v)}\mathbf{h}_u\Big),
$$

一个用于节点自身，一个用于来自节点所在门（它的父节点；顶事件为零）的消息，一个用于来自其输入（它的子节点；底事件为零）的消息的均值。它就是在有向边列表上的两次 `index_add_` 调用。经过 $L$ 层之后，关于上方 $L$ 层那个门的信息只通过 $\mathbf{W}_p$ 到达节点，丝毫没有被兄弟节点稀释。

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

$L = 2$ 时，方向感知模型优于同样深度的 GCN，而且恰好在其感受野所及的那些事件上准确率完美：深度 1 和 2 的事件，它们的门在上方一跳和两跳处。$L = 3$ 时它在深度 3 以内都完美，$L = 4$ 时它正确标注了每一个底事件。这就是具有正确归纳偏置的架构的表现：网络的容量不必花在学习“方向很重要”上，它的极限正是感受野所预言的那些。

### 步骤 8：把模型用于冷却系统

训练好的 $L = 4$ 方向感知模型从未见过这棵手工构建的树。应用它是最后一项检验：它必须找出 E1、E5 和 E6，即步骤 2 的答案。代码块还按[第 8 节](#s8)的布局画出这棵树，并标出预测的单点故障。

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

模型指出了 E1、E5 和 E6，别无其他。一棵小树判断正确，本身并不是有力的证据。证据是测试集，这棵树只是一次合理性检查，确认生成器生成的树与手绘的树遵循同样的规则。

### 你应该看到什么

- 按深度统计的准确率显示了感受野：$L$ 层模型只对位于顶事件之下至多 $L$ 跳的事件可靠。方向感知模型把这一点变得精确：在深度不超过 $L$ 的每个深度上准确率都是 1.0。
- 无向 GCN 一直改进到约 4 层（0.938），在 8 层时达到峰值（0.959）。随后朴素的 12 层和 16 层模型对每个事件都预测多数类。它们的节点特征几乎完全相同（未经训练的 $\hat{\mathbf{A}}^k\mathbf{X}$ 相似度向 1 攀升），而且没有残差通路，深的堆叠也很难训练。残差连接使它恢复。
- 对称邻接给每个事件的是它的门、它的兄弟节点以及两跳之外它的门的其他输入的混合。而这一性质只取决于上方的门。分开的父节点权重和子节点权重让网络能精确计算“上方的每个门都是或门”。
- 听起来正确的规则（“它的门是或门”）比多数类还差。每个模型都必须与这两者比较。

### 动手试试

1. **按节点划分**。不按树划分，而是对全部 300 棵树的所有节点做随机的 70/30 划分（所有节点在一张图中都可见，只隐藏标签），并比较准确率。解释为什么按节点划分会美化一个将被用于新树的模型。
2. **深度特征**。把每个节点的深度作为第五个特征加入，用 $L = 4$ 重新训练无向 GCN。它能弥补与方向感知模型之间的差距吗？这个答案说明对称层缺少了什么？
3. **预测哪些节点是底事件**。训练一个 2 层 GCN 来预测一个节点是否为底事件，并与你在[练习 9](#e9) 中给出的基线比较。GCN 学到了什么？这一题最好在做完该练习之后再尝试。
