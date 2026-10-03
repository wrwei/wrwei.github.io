# Six activation functions and their derivatives over z in [-5, 5]; saturated regions, dead side, minima of GELU and SiLU.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
from scipy.special import erf
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(sat="saturated", dead="dead side", minl="min", row1="φ(z)", row2="φ′(z)", x="z", leaky_in="a = 0.1", leaky="leaky ReLU (a = 0.01)"),
     "zh": dict(sat="饱和", dead="死亡侧", minl="最小值", row1="φ(z)", row2="φ′(z)", x="z", leaky_in="a = 0.1", leaky="leaky ReLU (a = 0.01)")}[lang]
z = np.linspace(-5, 5, 2001)
sig = 1 / (1 + np.exp(-z)); a = 0.01
Phi = 0.5 * (1 + erf(z / np.sqrt(2))); phi = np.exp(-z ** 2 / 2) / np.sqrt(2 * np.pi)
F = {
 "sigmoid": (sig, sig * (1 - sig)), "tanh": (np.tanh(z), 1 - np.tanh(z) ** 2),
 "ReLU": (np.maximum(z, 0), (z > 0) * 1.0), "leaky ReLU": (np.where(z > 0, z, a * z), np.where(z > 0, 1.0, a)),
 "GELU": (z * Phi, Phi + z * phi), "SiLU": (z * sig, sig * (1 + z * (1 - sig))),
}
names = list(F)
ylim1 = {"sigmoid": (-0.1, 1.1), "tanh": (-1.2, 1.2), "ReLU": (-0.5, 5.2), "leaky ReLU": (-1.0, 5.2), "GELU": (-0.8, 5.2), "SiLU": (-0.8, 5.2)}
ylim2 = {"sigmoid": (-0.02, 0.3), "tanh": (-0.1, 1.25), "ReLU": (-0.1, 1.25), "leaky ReLU": (-0.1, 1.25), "GELU": (-0.3, 1.3), "SiLU": (-0.3, 1.3)}
fig, axs = figstyle.figure(7.6, 4.5, ncols=6, nrows=2, lang=lang)
for j, nm in enumerate(names):
    f, d = F[nm]
    for r, (y, yl) in enumerate([(f, ylim1[nm]), (d, ylim2[nm])]):
        ax = axs[r, j]
        ax.plot(z, y, color=figstyle.BLUE if r == 0 else figstyle.ORANGE, lw=1.8)
        ax.set_xlim(-5, 5); ax.set_ylim(*yl); ax.set_xticks([-4, 0, 4])
        ax.tick_params(labelsize=8, length=2.5, pad=1.5)
        ax.axhline(0, color=figstyle.MUTED, lw=0.8); ax.axvline(0, color=figstyle.MUTED, lw=0.8)
        if r == 0: ax.set_title(T["leaky"] if False else nm, fontsize=9.5, pad=4)
        else: ax.set_xlabel(T["x"], fontsize=9, labelpad=1)
    ax = axs[1, j]
    if nm in ("sigmoid", "tanh"):
        zc = 4.6 if nm == "sigmoid" else 3.0
        assert abs(d[np.argmin(abs(z - zc))]) < 0.0105 and d[np.argmin(abs(z - (zc - 0.15)))] > 0.01
        for lo, hi in [(-5, -zc), (zc, 5)]:
            ax.axvspan(lo, hi, color=figstyle.FILLS["red"], zorder=0); ax.axvline(hi if lo < 0 else lo, color=figstyle.RED, lw=0.8, ls=":")
        ax.text(-3.7 if nm == "sigmoid" else -4.0, 0.14 if nm == "sigmoid" else 0.55, T["sat"], fontsize=8, color=figstyle.RED, ha="center", va="center", rotation=90)
    if nm == "ReLU":
        ax.axvspan(-5, 0, color=figstyle.FILLS["orange"], zorder=0)
        ax.text(-2.5, 0.55, T["dead"], fontsize=8, color=figstyle.ORANGE, ha="center", va="center")
    if nm in ("GELU", "SiLU"):
        from scipy.optimize import minimize_scalar
        fn = (lambda t: t * 0.5 * (1 + erf(t / np.sqrt(2)))) if nm == "GELU" else (lambda t: t / (1 + np.exp(-t)))
        zm = minimize_scalar(fn, bounds=(-3, 0), method="bounded", options=dict(xatol=1e-10)).x; fm = fn(zm); print(nm, round(zm, 3), round(fm, 3))
        ax0 = axs[0, j]
        ax0.plot([zm], [fm], "o", color=figstyle.RED, ms=4.5, zorder=5)
        ax0.annotate(f"{T['minl']}\n({zm:.3f},\n{fm:.3f})".replace("-", "−"), (zm, fm), xytext=(-4.8, 1.2), fontsize=8, color=figstyle.RED,
                     ha="left", va="bottom", arrowprops=dict(arrowstyle="-", color=figstyle.RED, lw=0.8, shrinkA=1, shrinkB=2))
    if nm == "leaky ReLU":
        ins = axs[0, j].inset_axes([0.04, 0.5, 0.42, 0.42])
        zi = np.linspace(-5, 2, 50); ins.plot(zi, np.where(zi > 0, zi, 0.1 * zi), color=figstyle.PURPLE, lw=1.5)
        ins.set_xlim(-5, 2); ins.set_ylim(-0.6, 1.0); ins.set_xticks([]); ins.set_yticks([]); ins.grid(False)
        ins.axhline(0, color=figstyle.MUTED, lw=0.6)
        ins.set_title(T["leaky_in"], fontsize=8, color=figstyle.PURPLE, pad=1)
        for s in ins.spines.values(): s.set_visible(True); s.set_color(figstyle.MUTED)
        ins.patch.set_facecolor("white")
axs[0, 0].set_ylabel(T["row1"], fontsize=10); axs[1, 0].set_ylabel(T["row2"], fontsize=10)
figstyle.save(fig, "fig-02-9", lang)
