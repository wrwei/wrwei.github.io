# Std of pre-activations over 20 layers of width 256, six init schemes; inset: layer-10 outputs of the two tanh nets.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="layer index", y="standard deviation of the pre-activations z",
                he="ReLU + He", inv="ReLU + 1/n", small="ReLU + N(0, 0.01²)", pt="ReLU + PyTorch default",
                t1="tanh + N(0, 1)", tinv="tanh + 1/n", sat="saturated: 87% of |h| > 0.99",
                ins="layer-10 outputs h", xh="h"),
     "zh": dict(x="层序号", y="预激活 z 的标准差",
                he="ReLU + He", inv="ReLU + 1/n", small="ReLU + N(0, 0.01²)", pt="ReLU + PyTorch 默认",
                t1="tanh + N(0, 1)", tinv="tanh + 1/n", sat="已饱和：87% 的 |h| > 0.99",
                ins="第 10 层的输出 h", xh="h")}[lang]
n, L = 256, 20
def run(act, wstd, bias=False, seed=0):
    r = np.random.default_rng(seed); h = r.standard_normal((1000, n)); out = []; h10 = None
    for l in range(1, L + 1):
        z = h @ (r.standard_normal((n, n)) * wstd)
        if bias: z = z + r.uniform(-1 / np.sqrt(n), 1 / np.sqrt(n), n)
        out.append(z.std()); h = act(z)
        if l == 10: h10 = h.copy()
    return np.array(out), h10
relu = lambda z: np.maximum(z, 0)
S = {"he": run(relu, np.sqrt(2 / n)), "inv": run(relu, np.sqrt(1 / n)), "small": run(relu, 0.01),
     "pt": run(relu, np.sqrt(1 / (3 * n)), True), "t1": run(np.tanh, 1.0), "tinv": run(np.tanh, np.sqrt(1 / n))}
frac = (abs(S["t1"][1]) > 0.99).mean(); print("saturated fraction", round(frac, 3), {k: v[0][[0, 1, 4, 9, 19]].round(4).tolist() for k, v in S.items()})
assert round(frac, 2) == 0.87
cols = {"he": figstyle.GREEN, "inv": figstyle.BLUE, "small": figstyle.RED, "pt": figstyle.AMBER, "t1": figstyle.PURPLE, "tinv": figstyle.SKY}
fig, ax = figstyle.figure(7.2, 4.6, lang=lang)
layers = np.arange(1, L + 1)
for k in ["he", "inv", "small", "pt", "t1", "tinv"]:
    ax.plot(layers, S[k][0], "o-" if k != "small" else "o-", color=cols[k], ms=3.5, lw=1.8, clip_on=True)
    s = S[k][0]
    if k == "small":
        ax.annotate(T[k], (layers[4], s[4]), textcoords="offset points", xytext=(10, 0), fontsize=10, color=cols[k], va="center")
    else:
        ax.annotate(T[k], (L, s[-1]), textcoords="offset points", xytext=(7, 0), fontsize=10, color=cols[k], va="center")
ax.set_yscale("log"); ax.set_ylim(1e-10, 1e2); ax.set_xlim(0.5, 27.5)
ax.set_yticks([1e-10, 1e-8, 1e-6, 1e-4, 1e-2, 1, 1e2]); ax.set_xticks([1, 5, 10, 15, 20])
ax.minorticks_off()
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"])
ax.annotate(T["sat"], (10, 16), textcoords="offset points", xytext=(0, 14), ha="center", fontsize=10, color=figstyle.PURPLE)
ax.annotate("1.41", (3, 1.414), textcoords="offset points", xytext=(0, 7), fontsize=9.5, color=figstyle.GREEN, ha="center")
bins = np.linspace(-1, 1, 41)
for i, (k, ttl) in enumerate([("t1", T["t1"]), ("tinv", T["tinv"])]):
    ins = ax.inset_axes([0.50 + 0.2 * i, 0.07, 0.17, 0.2])
    ins.hist(S[k][1].ravel(), bins=bins, color=figstyle.FILLS["purple" if k == "t1" else "sky"], edgecolor=cols[k], lw=0.6)
    ins.set_xlim(-1.05, 1.05); ins.set_xticks([-1, 0, 1]); ins.set_yticks([]); ins.grid(False)
    ins.tick_params(labelsize=8.5); ins.spines["left"].set_visible(False)
    ins.set_title(ttl, fontsize=8.5, color=cols[k], pad=2)
    ins.patch.set_alpha(0)
ax.text(0.685, 0.31, T["ins"], transform=ax.transAxes, ha="center", fontsize=9.5, color=figstyle.SLATE)
figstyle.save(fig, "fig-02-10", lang)
