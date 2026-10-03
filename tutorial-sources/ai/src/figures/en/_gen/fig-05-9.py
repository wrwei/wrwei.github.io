# Figure 5.9: mode collapse on a ring of eight Gaussians, an ILLUSTRATIVE SCHEMATIC (not data),
# after Metz et al. (2017). The sample clouds are drawn by hand-chosen rules, not by training a GAN.
#   python fig-05-9.py en|zh
import sys, os; sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle

lang = sys.argv[1] if len(sys.argv) > 1 else "en"
L = {"en": dict(snap="GAN, snapshot {k}", diff="diffusion", note="Illustrative schematic, not data (after Metz et al. 2017)",
                modes="GAN snapshots in training order, left to right  ·  grey circles: the eight data modes", cov="covers {n} of 8 modes"),
     "zh": dict(snap="GAN，快照 {k}", diff="扩散模型", note="示意图，并非实验数据（参照 Metz 等，2017）",
                modes="GAN 快照按训练顺序从左到右  ·  灰圈：数据的八个模式", cov="覆盖 {n}/8 个模式")}[lang]

rng = np.random.default_rng(5)
R, sd = 2.0, 0.12
centres = np.array([[R * np.cos(k * np.pi / 4), R * np.sin(k * np.pi / 4)] for k in range(8)])
gan = [[0], [2, 3], [5], [6, 7]]          # modes visited at each snapshot: one or two, changing
n = 160

fig, axes = figstyle.figure(7.2, 2.45, ncols=5, lang=lang)
for i, ax in enumerate(axes):
    for c in centres:
        ax.add_patch(__import__("matplotlib").patches.Circle(c, 2.2 * sd, fill=False, ec=figstyle.MUTED, lw=1.1))
    if i < 4:
        ms = gan[i]
        lab = rng.choice(ms, n)
        pts = centres[lab] + rng.normal(0, sd * 0.8, (n, 2))
        col, title = figstyle.ORANGE, L["snap"].format(k=i + 1)
        cov = len(ms)
    else:
        lab = rng.integers(0, 8, n)
        pts = centres[lab] + rng.normal(0, sd, (n, 2))
        col, title = figstyle.BLUE, L["diff"]
        cov = 8
    ax.scatter(pts[:, 0], pts[:, 1], s=5, color=col, alpha=0.75, lw=0)
    ax.set_title(title, fontsize=11, color=col)
    ax.set_xlabel(L["cov"].format(n=cov), fontsize=10, color=figstyle.SLATE)
    ax.set_xlim(-2.7, 2.7); ax.set_ylim(-2.7, 2.7); ax.set_aspect("equal")
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(True); s.set_color(figstyle.BORDER)
    ax.grid(False)
fig.suptitle(L["note"], fontsize=11.5, color=figstyle.NAVY, fontweight="bold")
fig.supxlabel(L["modes"], fontsize=10, color=figstyle.SLATE)
figstyle.save(fig, "fig-05-9", lang)
