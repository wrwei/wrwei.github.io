# Excess training loss of SGD variants on Lab 1's regression (reproduces lab1.py blocks 1, 2, 7).
import sys
sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="update number t", y="excess training loss", full="full batch, η = 0.1", b32="B = 32, η = 0.1",
                b1="B = 1, η = 0.1", dec="B = 1, η", fl="predicted floor"),
     "zh": dict(x="更新次数 t", y="超额训练损失", full="全批量，η = 0.1", b32="B = 32，η = 0.1",
                b1="B = 1，η = 0.1", dec="B = 1，η", fl="预测的底限")}[LANG]
rng = np.random.default_rng(0)
N = 200
w_true = np.array([1.5, -2.0, 0.5]); b_true = 0.7; sigma = 0.1
X = rng.normal(size=(N, 3))
y = X @ w_true + b_true + sigma * rng.normal(size=N)
Xb = np.hstack([X, np.ones((N, 1))])
w_lstsq, *_ = np.linalg.lstsq(Xb, y, rcond=None)
H = (2 / N) * Xb.T @ Xb
lam = np.linalg.eigvalsh(H)
def sgd(B, eta, epochs=50, tau=None, seed=1):
    gen = np.random.default_rng(seed)
    w = np.zeros(4); ex = []; t = 0
    for _ in range(epochs):
        perm = gen.permutation(N)
        for s in range(0, N, B):
            idx = perm[s:s + B]
            grad = (2 / len(idx)) * Xb[idx].T @ (Xb[idx] @ w - y[idx])
            w = w - (eta if tau is None else eta / (1 + t / tau)) * grad
            d = w - w_lstsq
            ex.append(0.5 * d @ H @ d); t += 1
    return np.array(ex)
floor = lambda B, eta: np.sum(eta * 0.01 * lam / (B * (2 - eta * lam)))
fig, ax = figstyle.figure(width=7.2, height=4.4, lang=LANG)
spec = [((200, 0.1, None), T["full"], figstyle.BLUE),
        ((32, 0.1, None), T["b32"], figstyle.ORANGE),
        ((1, 0.1, None), T["b1"], figstyle.RED),
        ((1, 0.1, 200), T["dec"] + "ₜ = 0.1/(1 + t/200)", figstyle.GREEN)]
for (B, eta, tau), lab, c in spec:
    ex = sgd(B, eta, tau=tau)
    ax.loglog(np.arange(1, len(ex) + 1), np.maximum(ex, 1e-12), color=c, lw=1.1, alpha=0.95, label=lab)
for (B, eta), c in [((32, 0.1), figstyle.ORANGE), ((1, 0.1), figstyle.RED)]:
    fv = floor(B, eta)
    ax.axhline(fv, color=c, ls="--", lw=1.2)
    mant, ex_ = f"{fv:.1e}".split("e")
    ax.text(1.15, fv * 0.8, f"{T['fl']} {mant}×10{str(int(ex_)).replace('-', '⁻').replace('4','⁴').replace('3','³')}", color=c, fontsize=10, va="top")
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"])
ax.set_xlim(1, 10500); ax.set_ylim(1e-8, 3)
ax.legend(loc="lower left", fontsize=10)
figstyle.save(fig, "fig-01-6", lang=LANG)
