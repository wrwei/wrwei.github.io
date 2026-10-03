# Figure 5.13: Lab 2's reverse process (two moons, capped cosine schedule, T = 200), 2,000 samples at
# t = 200, 150, 100, 50, 20, 5, 0, each with the mean nearest-neighbour distance to the reference data.
# The training and sampling code is Lab 2's (blocks 1-5), with the same seeds; the samples are cached in
# fig-05-13.npz next to this script (delete it to retrain, about 1.5 minutes).   python fig-05-13.py en|zh
import sys, os; sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
L = {"en": dict(t="t = {}", t0="t = 0 (final sample)", d="NN distance {:.3f}", x="x₁", y="x₂", fresh="fresh data (reference)"),
     "zh": dict(t="t = {}", t0="t = 0（最终样本）", d="最近邻距离 {:.3f}", x="x₁", y="x₂", fresh="新鲜数据（参照）")}[lang]
STEPS = (200, 150, 100, 50, 20, 5)
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fig-05-13.npz")


def run_lab2():
    """Lab 2, blocks 1-5, without the plots (they draw no random numbers)."""
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from sklearn.datasets import make_moons
    np.random.seed(0)
    torch.manual_seed(0)
    torch.set_num_threads(2)
    T = 200
    t_ = np.arange(T + 1) / T
    f = np.cos((t_ + 0.008) / (1 + 0.008) * np.pi / 2) ** 2
    ab_cos = f / f[0]
    beta = np.minimum(1 - ab_cos[1:] / ab_cos[:-1], 0.5)
    alpha = 1 - beta
    alpha_bar = np.concatenate([[1.0], np.cumprod(alpha)])
    X_raw, y_raw = make_moons(n_samples=10000, noise=0.05, random_state=0)
    mean, std = X_raw.mean(0), X_raw.std(0)
    data = torch.tensor((X_raw - mean) / std, dtype=torch.float32)
    labels = torch.tensor(y_raw)
    X_ref_raw, _ = make_moons(n_samples=5000, noise=0.05, random_state=1)
    X_ref = ((X_ref_raw - mean) / std).astype(np.float32)
    ab = torch.tensor(alpha_bar, dtype=torch.float32)

    def noise_to(x0, t, eps):
        a = ab[t][:, None]
        return a.sqrt() * x0 + (1 - a).sqrt() * eps
    torch.randn(1500, 2)  # Lab 2's eps_fixed for the forward-process plot: keeps the torch RNG in step

    def time_embedding(t, dim=32):
        freqs = torch.exp(-np.log(10000.0) * torch.arange(dim // 2) / (dim // 2))
        angles = t.float()[:, None] * freqs[None, :]
        return torch.cat([angles.sin(), angles.cos()], dim=-1)
    NULL = 2

    class Denoiser(nn.Module):
        def __init__(self, hidden=128, d_emb=32):
            super().__init__()
            self.cond_emb = nn.Embedding(3, d_emb)
            self.net = nn.Sequential(nn.Linear(2 + d_emb, hidden), nn.SiLU(), nn.Linear(hidden, hidden), nn.SiLU(),
                                     nn.Linear(hidden, hidden), nn.SiLU(), nn.Linear(hidden, 2))

        def forward(self, x, t, c):
            return self.net(torch.cat([x, time_embedding(t) + self.cond_emb(c)], dim=-1))
    model = Denoiser()
    n_steps = 20000
    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=n_steps)
    torch.manual_seed(0)
    running = []
    for step in range(1, n_steps + 1):
        idx = torch.randint(0, len(data), (512,))
        x0, c = data[idx], labels[idx].clone()
        c[torch.rand(512) < 0.2] = NULL
        t = torch.randint(1, T + 1, (512,))
        eps = torch.randn(512, 2)
        loss = F.mse_loss(model(noise_to(x0, t, eps), t, c), eps)
        opt.zero_grad(); loss.backward(); opt.step(); sched.step()
        running.append(loss.item())
        if step % 4000 == 0:
            print(f"step {step:6d}  mean loss {np.mean(running[-4000:]):.4f}")
    beta_t, alpha_t, ab_t = (torch.tensor(a, dtype=torch.float32) for a in (beta, alpha, alpha_bar))
    with torch.no_grad():
        gen = torch.Generator().manual_seed(0)
        x = torch.randn(2000, 2, generator=gen)
        snaps = {}
        for t in range(T, 0, -1):
            if t in STEPS:
                snaps[t] = x.clone().numpy()
            e = model(x, torch.full((2000,), t, dtype=torch.long), torch.full((2000,), NULL))
            x = (x - beta_t[t - 1] / (1 - ab_t[t]).sqrt() * e) / alpha_t[t - 1].sqrt()
            if t > 1:
                x = x + beta_t[t - 1].sqrt() * torch.randn(2000, 2, generator=gen)
    out = {f"x{t}": snaps[t] for t in STEPS}
    out["x0"] = x.numpy()
    out["ref"] = X_ref
    np.savez_compressed(CACHE, **out)


if not os.path.exists(CACHE):
    run_lab2()
z = np.load(CACHE)
from sklearn.neighbors import NearestNeighbors
X_ref = z["ref"]
nn_dist = lambda a, b: float(NearestNeighbors(n_neighbors=1).fit(b).kneighbors(a)[0].mean())
panels = [(t, z[f"x{t}"]) for t in STEPS] + [(0, z["x0"])]
dists = [nn_dist(x, X_ref) for _, x in panels]
print("NN distance to the data:", [(t, round(d, 3)) for (t, _), d in zip(panels, dists)])

# an eighth panel for scale: 2,000 fresh draws from the data distribution (Lab 2's "fresh data" yardstick)
from sklearn.datasets import make_moons
X_raw, _ = make_moons(n_samples=10000, noise=0.05, random_state=0)
mean, std = X_raw.mean(0), X_raw.std(0)
fresh = ((make_moons(n_samples=2000, noise=0.05, random_state=2)[0] - mean) / std).astype(np.float32)
d_fresh = nn_dist(fresh, X_ref)
print(f"fresh data {d_fresh:.3f}")


def dots(ax, x, color, lw):
    """2,000 points as one path of zero-length round-capped segments (about 30 kB a panel instead of 600 kB of markers)."""
    xs = np.c_[x[:, 0], x[:, 0], np.full(len(x), np.nan)].ravel()
    ys = np.c_[x[:, 1], x[:, 1], np.full(len(x), np.nan)].ravel()
    ln, = ax.plot(xs, ys, color=color, lw=lw, solid_capstyle="round", alpha=0.8, zorder=2)
    ln.get_path().should_simplify = False


fig, axes = figstyle.figure(7.6, 4.3, ncols=4, nrows=2, lang=lang, sharex=True, sharey=True)
import matplotlib.pyplot as plt
plt.rcParams["path.simplify"] = False
axes = axes.ravel()
for ax, (t, x), d in zip(axes, panels + [(None, fresh)], dists + [d_fresh]):
    col = figstyle.BLUE if t else (figstyle.GREEN if t == 0 else figstyle.MUTED)
    dots(ax, x, col, 2.0)
    head = L["t"].format(t) if t else (L["t0"] if t == 0 else L["fresh"])
    ax.set_title(head + "\n" + L["d"].format(d), fontsize=11, linespacing=1.35, ma="center",
                 color=figstyle.SLATE if t is None else figstyle.NAVY)
    ax.set_xlim(-3.1, 3.1); ax.set_ylim(-3.1, 3.1); ax.set_aspect("equal")
    ax.set_xticks([-2, 0, 2]); ax.set_yticks([-2, 0, 2])
for ax in axes[4:]:
    ax.set_xlabel(L["x"])
axes[0].set_ylabel(L["y"]); axes[4].set_ylabel(L["y"])
path = figstyle.save(fig, "fig-05-13", lang)
# shorten the 16,000 dots: coordinates to 0.1 px and each zero-length segment "M x y L x y" to "Mx yh0"
import re
svg = open(path, encoding="utf-8").read()
def shorten(m):
    d = re.sub(r"(\d+\.\d)\d+", r"\1", m.group(0))
    return re.sub(r"M ([-\d.]+) ([-\d.]+) \nL \1 \2 \n", r"M\1 \2h0", d)
svg = re.sub(r'd="[^"]*"', shorten, svg)
open(path, "w", encoding="utf-8").write(svg)
