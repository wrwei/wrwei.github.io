## Lab 4 — Digits, honestly: a complete PyTorch training run {#lab4}

**Goal.** You train an MLP on handwritten digits and, this time, you do everything around the
training that a careful engineer does. Before training you look at the data, find the pixels that
break standardisation, and check the initial loss. You prove that the model and the loop can learn
by overfitting one batch. You train with AdamW, a cosine schedule and early stopping on a
validation set, watch per-layer statistics through hooks, touch the test set exactly once, and
report its standard error. Finally you repeat the whole procedure over five seeds, so that you can
tell a difference that means something from one that is noise. The model is written as an
`nn.Module` subclass, the form that [Module 03](module_03_EN.html) builds on. The lab needs
PyTorch, NumPy and scikit-learn, no download and about fifteen seconds of CPU time.

### Step 1: load, split, and the pixels that break standardisation

`load_digits` ships inside scikit-learn: 1,797 grey-level images of $8 \times 8$ pixels with
values from 0 to 16, ten classes of about 180 images each. The split is 60/20/20 into training,
validation and test, stratified so that every split has the same class proportions, with a fixed
`random_state`. Only the training split is used to compute anything about the data. This is the
rule of [Module 01, Section 10](module_01_EN.html#s10): statistics are fitted on the training set and applied
unchanged to the others.

Standardisation subtracts the per-pixel mean and divides by the per-pixel standard deviation.
That fails for a pixel that is constant on the training set, because the division is by zero. In
this data set some border pixels (the top-left corner and the middle of the left and right edges) are almost always blank. The block below finds them, shows what
naive standardisation does to the validation set, and applies the usual guard: a zero standard
deviation is replaced by 1, so that a constant pixel becomes a constant zero.

```python
import copy
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

np.random.seed(0)
torch.manual_seed(0)

digits = load_digits()
X_all, y_all = digits.data, digits.target
X_train, X_rest, y_train, y_rest = train_test_split(
    X_all, y_all, test_size=0.4, stratify=y_all, random_state=0)
X_val, X_test, y_val, y_test = train_test_split(
    X_rest, y_rest, test_size=0.5, stratify=y_rest, random_state=0)
print("split sizes (train/val/test):", len(X_train), len(X_val), len(X_test))
print("class counts in the whole set:", np.bincount(y_all).min(), "to", np.bincount(y_all).max())

mean = X_train.mean(axis=0)
std = X_train.std(axis=0)
constant = np.flatnonzero(std == 0)
print("pixels with zero standard deviation on the training set:", constant.tolist())

with np.errstate(divide="ignore", invalid="ignore"):
    naive = (X_val - mean) / std
print("non-finite values after naive standardisation of the validation set:",
      int((~np.isfinite(naive)).sum()))

std_safe = np.where(std == 0, 1.0, std)          # constant pixels become constant zeros


def prepare(X):
    return torch.tensor((X - mean) / std_safe, dtype=torch.float32)


Xtr, Xva, Xte = prepare(X_train), prepare(X_val), prepare(X_test)
ytr, yva, yte = (torch.tensor(y, dtype=torch.long) for y in (y_train, y_val, y_test))
print(f"standardised training set: mean {Xtr.mean():.3f}, std {Xtr.std():.3f}")
```

```output
split sizes (train/val/test): 1078 359 360
class counts in the whole set: 174 to 183
pixels with zero standard deviation on the training set: [0, 24, 32, 39]
non-finite values after naive standardisation of the validation set: 1436
standardised training set: mean 0.000, std 0.968
```

Four pixels never light up in the training set. In the validation set they are blank too, so the
naive formula computes $0/0$ for each of the $4 \times 359 = 1{,}436$ entries and returns `nan`
(a nonzero pixel in some other split would give `inf`). A `nan` would poison the first
matrix product and, through it, every weight. A network does not raise an error for this; the loss
simply becomes `nan`. The guard costs one line and the check costs one print. The overall standard
deviation of the standardised training set is a little below 1 because the constant pixels
contribute zeros.

### Step 2: the model as an `nn.Module`, and the initial loss

The model is $64 \to 128 \to 128 \to 10$ with ReLU activations. Layers are created in
`__init__` and composed in `forward`. The two ReLUs are stored as submodules with names, so that
a forward hook can be attached to each of them in Step 5; a call to `F.relu` inside `forward`
would leave nothing to attach a hook to. The `Dropout` slot is there for the extension and has
probability 0 for now, so it does nothing.

Two numbers are checked before any training. The parameter count must match what you compute by
hand: $64 \cdot 128 + 128 + 128 \cdot 128 + 128 + 128 \cdot 10 + 10 = 26{,}122$. And the loss of
the untrained network must be close to $\ln 10 = 2.303$, the loss of a uniform prediction over ten
classes ([Section 14](#s14)). A value far from it would mean that the output layer is too large,
that the targets are wrong, or that the loss is applied to the wrong tensor.

```python
class MLP(nn.Module):
    def __init__(self, d_in=64, d_hidden=128, n_classes=10, p_drop=0.0):
        super().__init__()
        self.fc1 = nn.Linear(d_in, d_hidden)
        self.act1 = nn.ReLU()
        self.drop1 = nn.Dropout(p_drop)
        self.fc2 = nn.Linear(d_hidden, d_hidden)
        self.act2 = nn.ReLU()
        self.drop2 = nn.Dropout(p_drop)
        self.fc3 = nn.Linear(d_hidden, n_classes)

    def forward(self, x):
        x = self.drop1(self.act1(self.fc1(x)))
        x = self.drop2(self.act2(self.fc2(x)))
        return self.fc3(x)                       # logits; the softmax lives in the loss


torch.manual_seed(0)
model = MLP()
n_params = sum(p.numel() for p in model.parameters())
print("parameters:", n_params)

with torch.no_grad():
    initial_loss = F.cross_entropy(model(Xtr), ytr).item()
print(f"initial training loss: {initial_loss:.3f}   ln(10) = {np.log(10):.3f}")
```

```output
parameters: 26122
initial training loss: 2.309   ln(10) = 2.303
```

The count agrees with the hand calculation, and the initial loss is within a
few thousandths of $\ln 10$. The small excess is the random logits' spread: the network starts almost, but not
exactly, at the uniform prediction. Note that the model returns logits. The loss function applies
the softmax internally, in the stable form of [Section 12](#s12); applying a softmax in
`forward` as well is the bug of Lab 5's script A.

### Step 3: overfit one batch

The cheapest test that a model, a loss and an optimiser are wired correctly: take one small batch
and see whether the loss can be driven to nearly zero. Thirty-two images are far fewer than the
model's 26,122 parameters, so a working loop must memorise them. If it cannot, no amount of
training on the full set will help; the bug is in the code, not in the data or the
hyperparameters. The optimiser is AdamW at $\eta = 10^{-3}$ with no weight decay, because
weight decay works against memorisation.

```python
torch.manual_seed(0)
model = MLP()
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.0)
xb, yb = Xtr[:32], ytr[:32]
for step in range(201):
    loss = F.cross_entropy(model(xb), yb)
    if step in (0, 50, 100, 200):
        print(f"step {step:3d}: loss {loss.item():.4f}")
    opt.zero_grad()
    loss.backward()
    opt.step()
```

```output
step   0: loss 2.3085
step  50: loss 0.0463
step 100: loss 0.0037
step 200: loss 0.0012
```

The loss falls by three orders of magnitude in 200 steps. That is the signature of a healthy
set-up: the gradient flows to every layer, the optimiser updates the right parameters, and the
labels match the inputs. It says nothing yet about generalisation.

### Step 4: train with a validation set and early stopping

Now the real run. The pieces are the ones of [Section 13](#s13): mini-batches of 64 reshuffled
each epoch, AdamW with $\eta = 10^{-3}$ and a weight decay of $10^{-2}$, a cosine schedule that
brings the learning rate to zero over 100 epochs (`T_max` counts scheduler steps, so the
scheduler is stepped once per epoch), and early stopping: after every epoch the validation loss is
computed in evaluation mode, the best state of the model is kept with `copy.deepcopy`, and
training stops when the validation loss has not improved for 15 epochs.

The function is written once and used again in Steps 5 and 7. It takes a seed (which sets the
initial weights and the shuffling), a dropout probability and a set of epochs at which to record
monitoring statistics. The monitoring code is shown in Step 5; here the argument is empty. The
training loss it reports is the mean over all mini-batches of the epoch, not the loss of the last
mini-batch.

```python
def evaluate(model, X, y):
    """Mean loss, accuracy and logits in evaluation mode, without gradients."""
    model.eval()
    with torch.no_grad():
        logits = model(X)
    return F.cross_entropy(logits, y).item(), (logits.argmax(1) == y).float().mean().item(), logits


def fit(seed, p_drop=0.0, epochs=100, patience=15, batch=64, lr=1e-3, wd=1e-2,
        monitor_epochs=(), verbose=False):
    torch.manual_seed(seed)
    model = MLP(p_drop=p_drop)
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=wd)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
    history = []
    best = {"val_loss": float("inf"), "epoch": 0, "state": None}
    monitor = {}
    for epoch in range(1, epochs + 1):
        model.train()
        order = torch.randperm(len(Xtr))
        total, last_batch = 0.0, None
        for start in range(0, len(Xtr), batch):
            idx = order[start:start + batch]
            loss = F.cross_entropy(model(Xtr[idx]), ytr[idx])
            opt.zero_grad()
            loss.backward()
            before = [p.detach().clone() for p in model.parameters()]
            opt.step()
            total += loss.item() * len(idx)
            last_batch = before
        sched.step()
        train_loss = total / len(Xtr)
        val_loss, val_acc, _ = evaluate(model, Xva, yva)
        history.append((train_loss, val_loss, val_acc))
        if epoch in monitor_epochs:
            monitor[epoch] = collect_statistics(model, last_batch)
        if val_loss < best["val_loss"]:
            best = {"val_loss": val_loss, "epoch": epoch,
                    "state": copy.deepcopy(model.state_dict())}
        if verbose and epoch % 10 == 0:
            print(f"epoch {epoch:3d}: train loss {train_loss:.4f}  "
                  f"val loss {val_loss:.4f}  val acc {val_acc:.3f}")
        if epoch - best["epoch"] >= patience:
            if verbose:
                print(f"early stop at epoch {epoch}; best epoch {best['epoch']} "
                      f"(val loss {best['val_loss']:.4f})")
            break
    model.load_state_dict(best["state"])
    return model, history, best, monitor


def collect_statistics(model, weights_before_last_step):
    return None                                  # replaced by the real version in Step 5


model, history, best, _ = fit(seed=0, verbose=True)
```

```output
epoch  10: train loss 0.0489  val loss 0.1412  val acc 0.964
epoch  20: train loss 0.0096  val loss 0.1218  val acc 0.969
epoch  30: train loss 0.0039  val loss 0.1168  val acc 0.967
epoch  40: train loss 0.0022  val loss 0.1162  val acc 0.964
early stop at epoch 49; best epoch 34 (val loss 0.1159)
```

The training loss keeps falling to a few thousandths, while the validation loss reaches its
minimum around epoch 34 and then flattens. The gap between the two is overfitting, and
the validation accuracy does not improve with it. Early stopping picks the epoch with the lowest
validation loss and restores that state. The loss, not the accuracy, is the better stopping
criterion because it is smooth and keeps responding to confidence, whereas accuracy over 359
images moves in steps of 0.28 percentage points. Note also that when training stops the cosine schedule is still at about half its initial
learning rate: stopping early and annealing to zero are two separate mechanisms.

### Step 5: look inside with hooks

A falling loss does not show whether the layers are healthy. [Section 14](#s14) lists four
per-layer statistics, and this step measures them at three points in training (epochs 1, 10 and
30):

- the standard deviation of each hidden layer's activations, measured with a **forward hook**,
  a function that PyTorch calls with the output of a module every time the module runs;
- the fraction of dead units, those whose ReLU output is zero for every image in the training set;
- the gradient norm of each weight matrix, from the gradients of the last step of the epoch;
- the update-to-weight ratio of that last step, $\|\Delta\mathbf{W}\| / \|\mathbf{W}\|$, which needs
  a copy of the weights from before the step (the loop of Step 4 already keeps one).

The monitoring pass is a full-batch forward pass over the training set under `torch.no_grad()`,
in training mode, so that dropout, once switched on, would be measured as it acts in training;
with dropout set to 0 the mode changes nothing. The block redefines
`collect_statistics`, which `fit` calls, and trains again with the same seed, so the training
itself is identical to Step 4.

```python
def collect_statistics(model, weights_before_last_step):
    captured = {}
    hooks = [m.register_forward_hook(lambda mod, inp, out, name=name: captured.update({name: out}))
             for name, m in (("act1", model.act1), ("act2", model.act2))]
    model.train()
    with torch.no_grad():
        model(Xtr)
    for h in hooks:
        h.remove()
    weights = [(n, p) for n, p in model.named_parameters() if n.endswith("weight")]
    named_before = dict(zip([n for n, _ in model.named_parameters()], weights_before_last_step))
    stats = {
        "act_std": [captured[k].std().item() for k in ("act1", "act2")],
        "dead": [(captured[k] == 0).all(dim=0).float().mean().item() for k in ("act1", "act2")],
        "grad_norm": [p.grad.norm().item() for _, p in weights],
        "update_ratio": [((p.detach() - named_before[n]).norm() / p.detach().norm()).item()
                         for n, p in weights],
    }
    return stats


model, history, best, monitor = fit(seed=0, monitor_epochs=(1, 10, 30))
print("epoch | activation std (L1/L2) | dead units (L1/L2) | grad norms (W1/W2/W3)"
      " | update ratios")
for epoch, s in monitor.items():
    print(f"{epoch:5d} | {s['act_std'][0]:.2f} / {s['act_std'][1]:.2f}"
          f"            | {s['dead'][0]:.3f} / {s['dead'][1]:.3f}"
          f"      | {s['grad_norm'][0]:.3f} / {s['grad_norm'][1]:.3f} / {s['grad_norm'][2]:.3f}"
          f" | {s['update_ratio'][0]:.1e} / {s['update_ratio'][1]:.1e} / {s['update_ratio'][2]:.1e}")
```

```output
epoch | activation std (L1/L2) | dead units (L1/L2) | grad norms (W1/W2/W3) | update ratios
    1 | 0.37 / 0.22            | 0.000 / 0.008      | 0.293 / 0.350 / 0.427 | 8.7e-03 / 1.2e-02 / 1.3e-02
   10 | 0.62 / 1.02            | 0.000 / 0.016      | 0.119 / 0.082 / 0.162 | 1.5e-03 / 1.8e-03 / 1.6e-03
   30 | 0.68 / 1.25            | 0.000 / 0.016      | 0.015 / 0.010 / 0.020 | 2.3e-04 / 2.6e-04 / 2.3e-04
```

Read the table as a healthy run's fingerprint. The activations grow from the initial scale but
stay of order one, so nothing saturates or vanishes. Dead units remain a small fraction of the
layer. The gradient norms fall by a factor of twenty to thirty-five from epoch 1 to epoch 30 as the
loss approaches zero, and the three matrices stay within a factor of two of each other. The update-to-weight ratio
falls from about $10^{-2}$ to a few $10^{-4}$ as the cosine schedule and the shrinking gradient
reduce Adam's steps; the rule of thumb of [Section 14](#s14) puts a healthy value near $10^{-3}$,
and at the end of a run a smaller value only says that the run has converged. Nothing here needs
action, and that is the point: when something is wrong, one of these columns usually leaves its
band.

### Step 6: the test set, once

The model restored by early stopping is the one to report. The test set is used now, once, for the
number that goes into the report. Choices (the architecture, the weight decay, the patience) were
all made on the validation set. The accuracy of 360 images is a proportion $\hat p$, and its
standard error is $\sqrt{\hat p (1 - \hat p)/n}$ ([Module 01, Section 10](module_01_EN.html#s10)). The confusion
matrix and the list of mistakes are what you read next: they say which digits are confused,
which is the information a single accuracy hides.

```python
test_loss, test_acc, test_logits = evaluate(model, Xte, yte)
se = (test_acc * (1 - test_acc) / len(Xte)) ** 0.5
print(f"test accuracy {test_acc:.4f} +- {se:.4f} (standard error), test loss {test_loss:.4f}")

pred = test_logits.argmax(1)
confusion = torch.zeros(10, 10, dtype=torch.long)
for t, p_ in zip(yte, pred):
    confusion[t, p_] += 1
print("confusion matrix (rows: true class, columns: predicted class)")
print("     " + " ".join(f"{c:2d}" for c in range(10)))
for c in range(10):
    print(f"{c:3d}: " + " ".join(f"{v:2d}" if v else " ." for v in confusion[c].tolist()))

wrong = (pred != yte).nonzero().flatten().tolist()
print(f"{len(wrong)} misclassified test images (true, predicted):",
      [(int(yte[i]), int(pred[i])) for i in wrong])
```

```output
test accuracy 0.9694 +- 0.0091 (standard error), test loss 0.1481
confusion matrix (rows: true class, columns: predicted class)
      0  1  2  3  4  5  6  7  8  9
  0: 35  .  .  .  .  .  .  .  .  .
  1:  . 36  .  .  .  .  .  .  1  .
  2:  .  1 33  .  .  .  .  .  1  .
  3:  .  .  . 36  .  .  .  1  .  .
  4:  .  .  1  . 33  .  .  1  1  .
  5:  .  .  .  .  1 35  1  .  .  .
  6:  .  .  .  .  .  . 36  .  .  .
  7:  .  .  .  .  .  .  . 36  .  .
  8:  .  1  .  .  .  .  .  . 34  .
  9:  .  .  .  .  .  1  .  .  . 35
11 misclassified test images (true, predicted): [(8, 1), (1, 8), (5, 4), (5, 6), (4, 8), (4, 7), (9, 5), (3, 7), (2, 8), (4, 2), (2, 1)]
```

The standard error is close to one percentage point. That is the resolution of this test set: a
difference of 0.5 points between two models, measured on these 360 images, is well inside the
noise. The mistakes are scattered among visually similar digits and not concentrated in one
class.

### Step 7: five seeds

One run is one draw of the initial weights and of the shuffling order. The loop below repeats
Steps 4 and 6 for seeds 0 to 4, on the same split, and reports the test accuracy of each run and
their mean and standard deviation. This is the seed spread: the part of the uncertainty that comes
from the training procedure, as distinct from the standard error of Step 6, which comes from the
finite test set. They are different sources of variation and both bound what a comparison can
show.

```python
accuracies = []
for seed in range(5):
    m, _, b, _ = fit(seed=seed)
    _, acc, _ = evaluate(m, Xte, yte)
    accuracies.append(acc)
    print(f"seed {seed}: best epoch {b['epoch']:3d}, test accuracy {acc:.4f}")
accuracies = np.array(accuracies)
print(f"test accuracy over 5 seeds: {100 * accuracies.mean():.2f}% "
      f"+- {100 * accuracies.std(ddof=1):.2f} (standard deviation)")
```

```output
seed 0: best epoch  34, test accuracy 0.9694
seed 1: best epoch  37, test accuracy 0.9722
seed 2: best epoch  21, test accuracy 0.9750
seed 3: best epoch  22, test accuracy 0.9694
seed 4: best epoch  37, test accuracy 0.9778
test accuracy over 5 seeds: 97.28% +- 0.36 (standard deviation)
```

The seed spread is a few tenths of a percentage point, smaller than the standard error of a
single test evaluation. A report of this experiment gives the mean, the standard deviation over
seeds and the test-set size, and does not claim a 0.3-point improvement as an effect.

### What you should see

- Two sanity checks catch real problems before any training: constant pixels break naive
  standardisation (the 1,436 non-finite values come from 4 pixels times 359 images), and the
  initial loss confirms that the initialisation is sensible.
- Overfitting one batch drives the loss to nearly zero, so the loop is wired correctly.
- The training loss keeps falling after the validation loss has flattened. The gap is
  overfitting, and early stopping picks the epoch before it grows.
- Hidden activations stay of order one and dead units stay few: nothing in the monitoring needs
  action, which is what a healthy run looks like.
- The standard error of the test accuracy is more than twice the seed spread. Both bound what
  any comparison on this data can show.
- An MLP sees the $8 \times 8$ image as 64 unrelated numbers. [Module 03](module_03_EN.html)
  builds in the structure it ignores.

### Try this

1. Set the dropout slots to $p = 0.2$ (`fit(seed, p_drop=0.2)`) and compare the validation loss,
   the best epoch and the test accuracy over the same five seeds. Does the validation loss
   improve, and is the change larger than the seed spread?
2. Calibration ([Section 11](#s11)): fit a temperature $T$ on the validation logits by a grid
   search over $[0.05, 5]$ that minimises the negative log-likelihood of `logits / T`, and compare
   the test NLL and the expected calibration error ([Module 01, Section 7](module_01_EN.html#s7)) before and
   after. Then retrain with `F.cross_entropy(..., label_smoothing=0.1)` and repeat: the
   smoothed model is underconfident, and its fitted temperature should be below 1.
3. Replace AdamW by `torch.optim.SGD(lr=0.05, momentum=0.9)` and compare the best epoch and the
   test accuracy.
4. Train on 25%, 50% and 100% of the training split and plot the test accuracy against the
   training set size: "more data", measured.

## Lab 5 — Debugging clinic: four broken training scripts {#lab5}

**Goal.** You are given four training scripts that run without raising an error and are wrong.
Each one is a healthy script, on Lab 4's data and network, with one realistic bug. You diagnose each from its log
alone, using the symptoms and the checklist of [Section 14](#s14), then fix it and confirm that
the log returns to the shape of the healthy one. One bug is visible in the first printed
number; one hides behind a good accuracy; one is a gradient that grows; one makes the evaluation itself unreliable. The lab uses
`load_digits`, split and standardised exactly as in Lab 4, needs no download and takes about
ten seconds of CPU time.

### Step 1: data, the shared harness and the healthy baseline

Every script uses the same data, the same model and the same harness, and prints the same fields:
the initial loss, then per epoch the mean training loss, the validation loss and accuracy
(computed by one shared `evaluate` function, which is correct), the global gradient norm of the
last step and the fraction of dead units in layer 1. A bug is then a difference between two logs
of the same shape. The first block repeats Lab 4's data preparation in compact form (the
explanation is in [Lab 4, Step 1](#lab4)) and defines the model and the harness. The harness takes
the pieces that the bugs change as arguments: how the loss is computed, whether gradients are
zeroed, how the weights are initialised, and which model to use.

The baseline is Lab 4's model trained for 20 epochs with Adam at $\eta = 10^{-3}$, batches of 64
and no early stopping. Its log is what a healthy run looks like; keep it in view for the rest of
the lab.

```python
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

np.random.seed(0)
torch.manual_seed(0)

digits = load_digits()
X_train, X_rest, y_train, y_rest = train_test_split(
    digits.data, digits.target, test_size=0.4, stratify=digits.target, random_state=0)
X_val, X_test, y_val, y_test = train_test_split(
    X_rest, y_rest, test_size=0.5, stratify=y_rest, random_state=0)
mean, std = X_train.mean(axis=0), X_train.std(axis=0)
std = np.where(std == 0, 1.0, std)                # guard the constant pixels
Xtr, Xva = (torch.tensor((a - mean) / std, dtype=torch.float32) for a in (X_train, X_val))
ytr, yva = torch.tensor(y_train), torch.tensor(y_val)


def make_mlp():
    return nn.Sequential(nn.Linear(64, 128), nn.ReLU(), nn.Linear(128, 128), nn.ReLU(),
                         nn.Linear(128, 10))


def evaluate(model, X, y, batch=None):
    """Correct evaluation: eval mode, no gradients; loss and accuracy."""
    model.eval()
    with torch.no_grad():
        if batch is None:
            logits = model(X)
        else:
            logits = torch.cat([model(X[i:i + batch]) for i in range(0, len(X), batch)])
    model.train()
    return F.cross_entropy(logits, y).item(), (logits.argmax(1) == y).float().mean().item()


def dead_fraction(model):
    """Fraction of layer-1 units whose ReLU output is zero for every training image."""
    with torch.no_grad():
        was_training = model.training
        model.eval()
        first_layer = model[0]                    # the first nn.Linear
        h = torch.relu(first_layer(Xtr))
        model.train(was_training)
    return (h == 0).all(dim=0).float().mean().item()


def run(name, model, loss_fn=None, zero_grad=True, epochs=20, lr=1e-3, seed=0, log=(1, 5, 10, 20)):
    """Train with Adam; print one line per logged epoch. Returns the final validation accuracy."""
    loss_fn = loss_fn or (lambda logits, y: F.cross_entropy(logits, y))
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    g = torch.Generator().manual_seed(seed)
    with torch.no_grad():
        initial = loss_fn(model(Xtr), ytr).item()
    print(f"[{name}] initial loss {initial:.3f}")
    model.train()
    for epoch in range(1, epochs + 1):
        order = torch.randperm(len(Xtr), generator=g)
        total, grad_norm = 0.0, 0.0
        for start in range(0, len(Xtr), 64):
            idx = order[start:start + 64]
            loss = loss_fn(model(Xtr[idx]), ytr[idx])
            if zero_grad:
                opt.zero_grad()
            loss.backward()
            grad_norm = torch.sqrt(sum((p.grad ** 2).sum() for p in model.parameters())).item()
            opt.step()
            total += loss.item() * len(idx)
        if epoch in log:
            val_loss, val_acc = evaluate(model, Xva, yva)
            print(f"[{name}] epoch {epoch:2d}: train loss {total / len(Xtr):8.3f}  "
                  f"val loss {val_loss:8.3f}  val acc {val_acc:.3f}  "
                  f"grad norm {grad_norm:8.3f}  dead {dead_fraction(model):.3f}")
    return val_acc


torch.manual_seed(0)
baseline_acc = run("baseline", make_mlp())
```

```output
[baseline] initial loss 2.309
[baseline] epoch  1: train loss    2.083  val loss    1.766  val acc 0.763  grad norm    0.693  dead 0.000
[baseline] epoch  5: train loss    0.191  val loss    0.245  val acc 0.928  grad norm    0.559  dead 0.000
[baseline] epoch 10: train loss    0.049  val loss    0.150  val acc 0.964  grad norm    0.377  dead 0.000
[baseline] epoch 20: train loss    0.009  val loss    0.121  val acc 0.969  grad norm    0.064  dead 0.000
```

This is the reference. The initial loss is near $\ln 10$; the training loss falls from about 2
in the first epoch to a few hundredths by epoch 10; the validation accuracy climbs to about 0.97;
the gradient norm falls steadily as the loss falls; no unit is dead. Every bug below is a
departure from one of these five facts.

### Step 2: script A, the loss that does not fall below 1.46

The first script looks innocent. It has one changed line: the loss is computed as
`F.cross_entropy(F.softmax(logits, 1), y)`. The author wanted probabilities, so applied a
softmax, and forgot that `cross_entropy` applies one itself. Run it and read the log before
reading the explanation.

```python
torch.manual_seed(0)
acc_a = run("A", make_mlp(), loss_fn=lambda logits, y: F.cross_entropy(F.softmax(logits, 1), y))
```

```output
[A] initial loss 2.303
[A] epoch  1: train loss    2.274  val loss    1.755  val acc 0.708  grad norm    0.132  dead 0.000
[A] epoch  5: train loss    1.611  val loss    0.542  val acc 0.836  grad norm    0.189  dead 0.000
[A] epoch 10: train loss    1.491  val loss    0.166  val acc 0.955  grad norm    0.151  dead 0.000
[A] epoch 20: train loss    1.469  val loss    0.151  val acc 0.967  grad norm    0.031  dead 0.000
```

The accuracy is fine. The loss is not: it stops near 1.47, just above the floor derived below, and the
gradient norm is two to five times smaller than the baseline's. Both facts have a single cause. The softmax output $\hat p$ lies in
$[0, 1]$, and `cross_entropy` treats it as logits, so it computes a second softmax of values that
differ by at most 1. Even a perfect, fully confident prediction, with $\hat p = (1, 0, \ldots, 0)$,
gives the loss
$$-\ln\frac{e^{1}}{e^{1} + 9 e^{0}} = \ln\frac{e + 9}{e} = 1.461,$$
which is the floor the training loss approaches. The accuracy is unaffected because the
arg-max of a softmax is the arg-max of its input, so the classifier still learns. The gradients
are damped because the loss surface is nearly flat in the logits: the second softmax cannot
distinguish a confident prediction from an unconfident one by more than a factor of $e$. The
lesson is that accuracy can hide a bug that a loss value cannot, and that a loss floor has an
arithmetic explanation worth computing. The fix is to pass the logits.

```python
print(f"floor of the loss for a perfect prediction: {np.log((np.e + 9) / np.e):.3f}")
torch.manual_seed(0)
acc_a_fixed = run("A fixed", make_mlp())
```

```output
floor of the loss for a perfect prediction: 1.461
[A fixed] initial loss 2.309
[A fixed] epoch  1: train loss    2.083  val loss    1.766  val acc 0.763  grad norm    0.693  dead 0.000
[A fixed] epoch  5: train loss    0.191  val loss    0.245  val acc 0.928  grad norm    0.559  dead 0.000
[A fixed] epoch 10: train loss    0.049  val loss    0.150  val acc 0.964  grad norm    0.377  dead 0.000
[A fixed] epoch 20: train loss    0.009  val loss    0.121  val acc 0.969  grad norm    0.064  dead 0.000
```

### Step 3: script B, the gradient that accumulates

The second script omits one line: `opt.zero_grad()`. PyTorch accumulates into `.grad` by design (the
reason is gradient accumulation over several mini-batches), so without the reset every step uses
the sum of all gradients since the start of training. Predict the symptoms before running it.

```python
torch.manual_seed(0)
acc_b = run("B", make_mlp(), zero_grad=False)
```

```output
[B] initial loss 2.309
[B] epoch  1: train loss    2.060  val loss    1.688  val acc 0.752  grad norm    6.983  dead 0.000
[B] epoch  5: train loss    0.326  val loss    0.955  val acc 0.883  grad norm   23.178  dead 0.000
[B] epoch 10: train loss    1.806  val loss    4.092  val acc 0.833  grad norm  146.211  dead 0.000
[B] epoch 20: train loss    1.552  val loss    1.455  val acc 0.799  grad norm  194.745  dead 0.000
```

The loss falls at first, because early on the accumulated gradient still points downhill, and
then rises and wanders: the update has become a sum over hundreds of past gradients, most of them
stale, which behaves like a momentum with coefficient 1 and no damping. The tell is the printed
gradient norm. It should fall as the loss falls, and instead it grows from epoch to epoch,
because `.grad` is a running sum. The validation accuracy peaks and then decays. A rising
gradient norm during a loss that should be falling is the most direct signature of this bug
([Section 4](#s4)). The fix is one line: call `opt.zero_grad()` before `loss.backward()` on
every step.

```python
torch.manual_seed(0)
acc_b_fixed = run("B fixed", make_mlp())
```

```output
[B fixed] initial loss 2.309
[B fixed] epoch  1: train loss    2.083  val loss    1.766  val acc 0.763  grad norm    0.693  dead 0.000
[B fixed] epoch  5: train loss    0.191  val loss    0.245  val acc 0.928  grad norm    0.559  dead 0.000
[B fixed] epoch 10: train loss    0.049  val loss    0.150  val acc 0.964  grad norm    0.377  dead 0.000
[B fixed] epoch 20: train loss    0.009  val loss    0.121  val acc 0.969  grad norm    0.064  dead 0.000
```

### Step 4: script C, the initial loss of 677

In the third script every linear layer is initialised with `nn.init.normal_(w)`, which draws from
$\mathcal{N}(0, 1)$. The author wanted "random weights" and did not think about their scale. The
first number the harness prints already condemns it.

```python
def make_bad_init_mlp():
    model = make_mlp()
    for m in model:
        if isinstance(m, nn.Linear):
            nn.init.normal_(m.weight)             # standard deviation 1, not 1/sqrt(fan_in)
    return model


torch.manual_seed(0)
acc_c = run("C", make_bad_init_mlp())
```

```output
[C] initial loss 676.599
[C] epoch  1: train loss  576.259  val loss  478.250  val acc 0.217  grad norm  207.911  dead 0.000
[C] epoch  5: train loss  136.451  val loss  132.021  val acc 0.557  grad norm  184.543  dead 0.000
[C] epoch 10: train loss   43.317  val loss   66.271  val acc 0.710  grad norm   97.042  dead 0.000
[C] epoch 20: train loss    8.583  val loss   44.075  val acc 0.797  grad norm   34.758  dead 0.000
```

The initial loss is in the hundreds, where a sensible network gives about 2.3. The reason is
[Section 6](#s6): each layer multiplies the standard deviation of the signal by about
$\sqrt{n_{\text{in}}\, \sigma_w^2}$, which for $\sigma_w = 1$ and 128 inputs is about 11 per layer
(slightly less for ReLU). Three layers later the logits are hundreds of units in size, the
softmax is saturated, and the network is confidently wrong on almost every example, with a loss
equal to the gap between the largest logit and the correct one. Training recovers slowly, because
Adam rescales the steps, but after 20 epochs the validation loss is still large and the accuracy
well below the baseline. The mistake was visible before the first update, with one forward pass,
which is why step 4 of the checklist is "check the initial loss". The fix is to delete the custom
initialisation (PyTorch's default is a scaled uniform distribution with variance $1/(3 n_{\text{in}})$) or
to use He initialisation with zero biases (which starts a little higher, near 2.9, because the
last layer is also scaled for a ReLU).

```python
torch.manual_seed(1)                              # a different draw from the baseline's
acc_c_fixed = run("C fixed", make_mlp())              # PyTorch's default initialisation
```

```output
[C fixed] initial loss 2.318
[C fixed] epoch  1: train loss    2.119  val loss    1.826  val acc 0.794  grad norm    0.675  dead 0.000
[C fixed] epoch  5: train loss    0.197  val loss    0.244  val acc 0.933  grad norm    0.478  dead 0.000
[C fixed] epoch 10: train loss    0.054  val loss    0.148  val acc 0.964  grad norm    0.350  dead 0.000
[C fixed] epoch 20: train loss    0.009  val loss    0.115  val acc 0.972  grad norm    0.090  dead 0.000
```

### Step 5: script D, the evaluation that does not repeat

The fourth script is a different kind of bug. Training is correct. The model contains
`BatchNorm1d` and `Dropout(0.5)`, and the evaluation function never calls `model.eval()`, so
dropout masks and batch statistics are active while the model is scored. The symptom is not in the
loss curve at all but in the evaluation: the same weights, evaluated twice, give different
answers, and the answer depends on the batch size. The block trains the model, then evaluates it
four ways: twice in training mode on the full validation set, in training mode in batches of 8,
and in evaluation mode.

```python
def make_dropout_bn_mlp():
    return nn.Sequential(nn.Linear(64, 128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.5),
                         nn.Linear(128, 128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.5),
                         nn.Linear(128, 10))


def evaluate_wrong(model, X, y, batch=None):
    """BUG: no model.eval(); dropout and batch statistics stay active."""
    model.train()
    with torch.no_grad():
        if batch is None:
            logits = model(X)
        else:
            logits = torch.cat([model(X[i:i + batch]) for i in range(0, len(X), batch)])
    return (logits.argmax(1) == y).float().mean().item()


torch.manual_seed(0)
model_d = make_dropout_bn_mlp()
run("D", model_d, log=(20,))
print(f"wrong evaluation, full set, first call:   {evaluate_wrong(model_d, Xva, yva):.3f}")
print(f"wrong evaluation, full set, second call:  {evaluate_wrong(model_d, Xva, yva):.3f}")
print(f"wrong evaluation, batches of 8:           {evaluate_wrong(model_d, Xva, yva, 8):.3f}")
print(f"evaluation with model.eval():             {evaluate(model_d, Xva, yva)[1]:.3f}")
print(f"evaluation with model.eval(), batches of 8: {evaluate(model_d, Xva, yva, 8)[1]:.3f}")
```

```output
[D] initial loss 2.437
[D] epoch 20: train loss    0.176  val loss    0.128  val acc 0.967  grad norm    1.426  dead 0.000
wrong evaluation, full set, first call:   0.942
wrong evaluation, full set, second call:  0.936
wrong evaluation, batches of 8:           0.855
evaluation with model.eval():             0.969
evaluation with model.eval(), batches of 8: 0.969
```

Two things are wrong in the training-mode evaluation. Dropout zeroes a random half of the hidden
units on every call, so two calls on the same data disagree: the evaluation is a noisy sample,
and a metric that is sampled cannot be compared between runs. Batch normalisation computes its
statistics from the current batch, so with batches of 8 the estimates are poor, and the result
depends on how the validation set happens to be batched. In evaluation mode dropout is the
identity (with the inverted scaling applied during training, [Section 11](#s11)) and batch
normalisation uses its running averages, so the answer is deterministic and independent of
the batch size. Note that the harness's own `evaluate` is the correct one, which is why the
training log of script D itself looks plausible. The fix is `model.eval()` and `torch.no_grad()`
inside the evaluation function, and `model.train()` again before the next epoch, which is what
the shared function does.

### Step 6: the diagnoses in one line each, and the checklist

A diagnosis is useful only if it is short enough to write down: *symptom → cause → fix*. The block
collects the four, together with the accuracies that the fixed scripts reached, so that you can
confirm that each repaired log has the baseline's shape. Then it runs the two items of the
[Section 14](#s14) checklist that need only one forward pass, the output shape and the initial
loss (items 3 and 4), on the untrained baseline, script C and the fixed model, to show that the
initial-loss check stops script C at step 0: if the initial loss differs from $\ln K$ by more than
10%, nothing else is worth running.

```python
diagnoses = [
    ("A", "loss floors at 1.46, grad norm small, accuracy fine",
     "softmax applied before cross_entropy", "pass the logits"),
    ("B", "grad norm grows each epoch, loss rises, accuracy decays",
     "no opt.zero_grad(): gradients accumulate", "zero the gradients every step"),
    ("C", "initial loss in the hundreds",
     "weights drawn from N(0, 1): logits of order 100", "default or He initialisation"),
    ("D", "repeated evaluations differ, depend on batch size",
     "evaluating in training mode (dropout, batch statistics)", "model.eval() + no_grad()"),
]
for tag, symptom, cause, fix in diagnoses:
    print(f"{tag}: {symptom}\n   -> {cause}\n   -> fix: {fix}")

print()
print(f"baseline {baseline_acc:.3f} | A fixed {acc_a_fixed:.3f} | B fixed {acc_b_fixed:.3f} "
      f"| C fixed {acc_c_fixed:.3f}")


def pre_training_checklist(model, name, n_classes=10):
    """Items 3 and 4 of the checklist: the output shape and the initial loss."""
    with torch.no_grad():
        logits = model(Xtr[:64])
    assert logits.shape == (64, n_classes), f"shape {tuple(logits.shape)}"
    initial = F.cross_entropy(logits, ytr[:64]).item()
    expected = np.log(n_classes)
    verdict = "OK" if abs(initial - expected) < 0.1 * expected else "STOP: investigate before training"
    print(f"{name:10s} initial loss {initial:9.3f} (expected about {expected:.3f}) -> {verdict}")


torch.manual_seed(0)
pre_training_checklist(make_mlp(), "baseline")
torch.manual_seed(0)
pre_training_checklist(make_bad_init_mlp(), "script C")
torch.manual_seed(1)
pre_training_checklist(make_mlp(), "C, fixed")
```

```output
A: loss floors at 1.46, grad norm small, accuracy fine
   -> softmax applied before cross_entropy
   -> fix: pass the logits
B: grad norm grows each epoch, loss rises, accuracy decays
   -> no opt.zero_grad(): gradients accumulate
   -> fix: zero the gradients every step
C: initial loss in the hundreds
   -> weights drawn from N(0, 1): logits of order 100
   -> fix: default or He initialisation
D: repeated evaluations differ, depend on batch size
   -> evaluating in training mode (dropout, batch statistics)
   -> fix: model.eval() + no_grad()

baseline 0.969 | A fixed 0.969 | B fixed 0.969 | C fixed 0.972
baseline   initial loss     2.303 (expected about 2.303) -> OK
script C   initial loss   616.959 (expected about 2.303) -> STOP: investigate before training
C, fixed   initial loss     2.293 (expected about 2.303) -> OK
```

Script C is stopped at step 0 by a check that costs one forward pass; the other three are not.
Script A passes the initial-loss check, because a second softmax of near-uniform outputs is
still near-uniform, and script B passes it, because nothing is wrong until the second step. They are found by
the training log: a floor, a growing gradient norm. D is found by evaluating twice. No single
check finds every bug, which is why the checklist has ten items.

### What you should see

- None of the four scripts raises an error. Each has a numeric signature that is readable within
  the first minute: a floor at 1.46, a gradient norm that grows, an absurd initial loss,
  evaluations that do not repeat.
- Accuracy alone can hide a bug: script A reaches a validation accuracy close to the baseline's
  while its training loss is meaningless.
- Logging the initial loss and the gradient norm costs one line each and diagnoses two of the
  four bugs (C and B); D is found by evaluating twice, and A by its loss floor of 1.46.
- After the fix, each log has the baseline's shape: a falling loss, a falling gradient norm, a
  validation accuracy near 0.97.

### Try this

1. Script E: Adam at $\eta = 0.1$. Predict the symptom (the training loss rises above its initial
   value) and diagnose it with a learning-rate range test in the style of [Lab 3](#lab3).
2. Script F: a regression version of [Lab 1](#lab1)'s $y = \sin 3x$ in PyTorch, with targets of
   shape `(B,)` and predictions of shape `(B, 1)`. Find PyTorch's broadcasting warning, and the
   loss stuck at the variance of the targets, then fix the shapes ([Section 2](#s2)).
3. Script G: compute the standardisation statistics on all 1,797 images rather than on the
   training split only. Measure how much the test accuracy changes, and explain why leakage of
   this kind is small here and can be large elsewhere ([Module 01, Section 10](module_01_EN.html#s10)).
4. Write a bug of your own, hand the script to a colleague with the log only, and see how long the
   diagnosis takes.
