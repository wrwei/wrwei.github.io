# Figure 5.11: alpha-bar and SNR (dB) against t for the linear and cosine schedules, T = 1000.  python fig-05-11.py en|zh
import sys, os; sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
L = {"en": dict(x="step  t", yl="ᾱₜ  (solid, linear scale)", yr="SNR in dB  (dashed)", lin="linear", cos="cosine",
                ab="ᾱₜ", snr="SNR", thr="ᾱ = 0.01  (SNR ≈ −20 dB)", shade="linear schedule\nbelow ᾱ = 0.01:\nt > 674, 33% of steps",
                c_lin="t = 674", c_cos="t = 936"),
     "zh": dict(x="步  t", yl="ᾱₜ（实线，线性刻度）", yr="SNR，dB（虚线）", lin="线性", cos="余弦",
                ab="ᾱₜ", snr="SNR", thr="ᾱ = 0.01（SNR ≈ −20 dB）", shade="线性调度\n低于 ᾱ = 0.01：\nt > 674，占 33% 的步",
                c_lin="t = 674", c_cos="t = 936")}[lang]
T = 1000
t = np.arange(1, T + 1)
lin = np.cumprod(1 - np.linspace(1e-4, 0.02, T))
s = 0.008
f = np.cos((np.arange(T + 1) / T + s) / (1 + s) * np.pi / 2) ** 2
abar = f / f[0]
cos = np.cumprod(1 - np.clip(1 - abar[1:] / abar[:-1], 0, 0.999))
db = lambda a: 10 * np.log10(a / (1 - a))
t_lin = int(np.argmax(lin < 0.01)) + 1
t_cos = int(np.argmax(cos < 0.01)) + 1
print("crossings", t_lin, t_cos, "t=500", lin[499], cos[499], db(lin[499]), db(cos[499]), "end", lin[-1], cos[-1])
assert (t_lin, t_cos) == (674, 936)

fig, ax = figstyle.figure(7.2, 3.9, lang=lang)
ax2 = ax.twinx()
ax2.spines["right"].set_visible(True); ax2.spines["top"].set_visible(False); ax2.grid(False)
ax2.axvspan(t_lin, T, color=figstyle.FILLS["blue"], alpha=0.7, lw=0, zorder=0)
ax.axhline(0.01, color=figstyle.RED, lw=1.3, ls=(0, (5, 3)), zorder=2)
ax.plot(t, lin, color=figstyle.BLUE, lw=2.2, zorder=4)
ax.plot(t, cos, color=figstyle.ORANGE, lw=2.2, zorder=4)
ax2.plot(t, db(lin), color=figstyle.BLUE, lw=1.6, ls=(0, (4, 2.5)))
ax2.plot(t, db(cos), color=figstyle.ORANGE, lw=1.6, ls=(0, (4, 2.5)))
for tc, col in ((t_lin, figstyle.BLUE), (t_cos, figstyle.ORANGE)):
    ax.plot([tc], [0.01], "o", color=col, ms=6, zorder=6, mec="white", mew=1)
ax.annotate(L["c_lin"], (t_lin, 0.01), xytext=(t_lin - 18, 0.12), color=figstyle.BLUE, fontsize=10.5, ha="right",
            arrowprops=dict(arrowstyle="-", color=figstyle.BLUE, lw=0.9))
ax.annotate(L["c_cos"], (t_cos, 0.01), xytext=(t_cos - 18, 0.12), color=figstyle.ORANGE, fontsize=10.5, ha="right",
            arrowprops=dict(arrowstyle="-", color=figstyle.ORANGE, lw=0.9))
ax.text(20, 0.035, L["thr"], color=figstyle.RED, fontsize=10.5, ha="left", va="bottom")
ax.text(t_lin + 12, 0.93, L["shade"], color=figstyle.BLUE, fontsize=10.5, ha="left", va="top")
# direct labels on the solid curves
ax.text(205, lin[204] - 0.03, L["lin"] + " " + L["ab"], color=figstyle.BLUE, fontsize=11, ha="right", va="top")
ax.text(338, cos[337] + 0.04, L["cos"] + " " + L["ab"], color=figstyle.ORANGE, fontsize=11, ha="left", va="bottom")
ax.set_xlim(0, T); ax.set_ylim(-0.04, 1.04)
ax2.set_ylim(-95, 55)
ax.set_xlabel(L["x"]); ax.set_ylabel(L["yl"]); ax2.set_ylabel(L["yr"], color=figstyle.NAVY)
ax2.tick_params(axis="y", colors=figstyle.SLATE)
ax.set_xticks([0, 200, 400, 600, 800, 1000])
ax.set_zorder(ax2.get_zorder() + 1); ax.patch.set_visible(False)
# direct labels on the dashed SNR curves (right axis)
ax2.text(560, db(lin[559]) - 4, L["lin"] + " " + L["snr"], color=figstyle.BLUE, fontsize=10.5, ha="right", va="top")
ax2.text(830, db(cos[829]) + 4, L["cos"] + " " + L["snr"], color=figstyle.ORANGE, fontsize=10.5, ha="left", va="bottom")
figstyle.save(fig, "fig-05-11", lang)
