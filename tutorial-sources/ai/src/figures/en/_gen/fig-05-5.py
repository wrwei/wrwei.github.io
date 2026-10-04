# Figure 5.5: the exact example p(z)=N(0,1), p(x|z)=N(z,1), x=2.  python fig-05-5.py en|zh
# Left: prior and true posterior N(1, 0.5) on z in [-3, 4]. Right: log p(x) = ELBO + gap for two q's.
import sys, os; sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle

lang = sys.argv[1] if len(sys.argv) > 1 else "en"
L = {"en": dict(z="z", dens="density", prior="prior  p(z) = N(0, 1)", post="true posterior  p(z | x = 2) = N(1, 0.5)",
                y="nats", qpost="q = posterior\nN(1, 0.5)", qprior="q = prior\nN(0, 1)", logp="log p(x)\n= {v:.2f}",
                elbo="ELBO {v:.2f}", gap="gap {v:.2f}", gap0="gap 0", leg_e="ELBO", ttl="log p(x) = ELBO + KL(q ‖ posterior)"),
     "zh": dict(z="z", dens="密度", prior="先验  p(z) = N(0, 1)", post="真实后验  p(z | x = 2) = N(1, 0.5)",
                y="奈特", qpost="q = 后验\nN(1, 0.5)", qprior="q = 先验\nN(0, 1)", logp="log p(x)\n= {v:.2f}",
                elbo="ELBO {v:.2f}", gap="差距 {v:.2f}", gap0="差距 0", leg_e="ELBO", ttl="log p(x) = ELBO + KL(q ‖ 后验)")}[lang]

x = 2.0
def npdf(z, m, v): return np.exp(-(z - m) ** 2 / (2 * v)) / np.sqrt(2 * np.pi * v)
logp = -0.5 * np.log(2 * np.pi * 2) - x ** 2 / (2 * 2)            # p(x) = N(0, 2)
pm, pv = x / 2, 0.5                                               # posterior N(1, 1/2)
def elbo(m, v):
    recon = -0.5 * np.log(2 * np.pi) - 0.5 * ((x - m) ** 2 + v)
    kl = 0.5 * (v + m ** 2 - np.log(v) - 1)
    return recon - kl
def kl(m1, v1, m2, v2): return 0.5 * (np.log(v2 / v1) + (v1 + (m1 - m2) ** 2) / v2 - 1)
cases = [(L["qpost"], elbo(pm, pv)), (L["qprior"], elbo(0, 1))]
print("log p(x)", logp, "ELBOs", [c[1] for c in cases], "gap", logp - cases[1][1], "KL(N(0,1)||post)", kl(0, 1, pm, pv))

fig, (a1, a2) = figstyle.figure(7.2, 3.5, ncols=2, lang=lang, gridspec_kw=dict(width_ratios=[1.45, 1]))
z = np.linspace(-3, 4, 500)
a1.plot(z, npdf(z, 0, 1), color=figstyle.SLATE, label=L["prior"])
a1.fill_between(z, npdf(z, 0, 1), color=figstyle.SLATE, alpha=0.08)
a1.plot(z, npdf(z, pm, pv), color=figstyle.ORANGE, label=L["post"])
a1.fill_between(z, npdf(z, pm, pv), color=figstyle.ORANGE, alpha=0.10)
a1.set_xlim(-3, 4); a1.set_ylim(0, 0.72)
a1.set_xlabel(L["z"], fontstyle="italic"); a1.set_ylabel(L["dens"])
a1.legend(loc="upper left", fontsize=10)

# right: waterfall. ELBO bar from 0 down to ELBO, gap bar from ELBO up to log p(x).
bw, sep = 0.3, 1.2
for i, (lab, e) in enumerate(cases):
    xc = i * sep
    a2.bar(xc - bw / 2, e, bw, color=figstyle.FILLS["blue"], edgecolor=figstyle.BLUE, lw=1.5)
    a2.text(xc - bw / 2, e / 2, L["elbo"].format(v=e).replace("-", "−"), color=figstyle.BLUE, fontsize=11, ha="center", va="center", rotation=90)
    g = logp - e
    if g > 1e-6:
        a2.bar(xc + bw / 2, g, bw, bottom=e, color=figstyle.FILLS["red"], edgecolor=figstyle.RED, lw=1.5, hatch="///")
        a2.text(xc + bw + 0.05, e + g / 2, L["gap"].format(v=g), color=figstyle.RED, fontsize=11, ha="left", va="center")
    else:
        a2.plot([xc, xc + bw], [logp, logp], color=figstyle.RED, lw=3, solid_capstyle="butt")
        a2.text(xc + 0.02, logp - 0.12, L["gap0"], color=figstyle.RED, fontsize=11, ha="left", va="top")
a2.axhline(logp, color=figstyle.NAVY, lw=1.3, ls="--", zorder=0)
a2.text(0.5 * sep - 0.05, logp + 0.1, L["logp"].format(v=logp).replace("-", "−"), color=figstyle.NAVY, fontsize=11, ha="center", va="bottom")
a2.axhline(0, color=figstyle.MUTED, lw=1)
a2.set_xticks([0, sep]); a2.set_xticklabels([cases[0][0], cases[1][0]])
a2.set_xlim(-0.55, 2.2); a2.set_ylim(-3.9, 0.15)
a2.set_ylabel(L["y"])
a2.set_title(L["ttl"], fontsize=11, color=figstyle.NAVY)
a2.grid(axis="x", visible=False)
out = figstyle.save(fig, "fig-05-5", lang)
if lang == "zh":                                                  # root font stack with Chinese fonts
    s = open(out, encoding="utf-8").read()
    s = s.replace("<svg ", '<svg font-family="DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif" ', 1)
    open(out, "w", encoding="utf-8").write(s)
