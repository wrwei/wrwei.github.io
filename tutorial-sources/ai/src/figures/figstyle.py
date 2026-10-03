"""Shared matplotlib style for the AI series' data figures.

    import sys; sys.path.insert(0, "src/figures")   # run from the series root
    import figstyle
    fig, ax = figstyle.figure(width=7.2, height=3.4)     # inches; 7.2 in = 720 px at 100 dpi
    ax.plot(x, y, color=figstyle.BLUE, label="train")
    figstyle.save(fig, "fig-01-7")                          # -> src/figures/en/fig-01-7.svg
    figstyle.save(fig, "fig-01-7", lang="zh")               # after relabelling in Chinese

Text stays as real SVG text (svg.fonttype = "none") so the page fonts apply and a translator can
edit the labels. Metadata and the white background are stripped; the page's figure card is white.
"""
import os
import re

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))

NAVY, SLATE, MUTED, BORDER = "#1A2E4A", "#475569", "#94A3B8", "#E2E8F0"
BLUE, SKY, GREEN, ORANGE, RED, PURPLE, AMBER = "#2563EB", "#0EA5E9", "#15803D", "#C2410C", "#DC2626", "#7E22CE", "#B45309"
SERIES = [BLUE, ORANGE, GREEN, PURPLE, SKY, AMBER, RED, SLATE]
FILLS = {"blue": "#DBEAFE", "sky": "#F0F9FF", "green": "#F0FDF4", "orange": "#FFF7ED", "red": "#FEF2F2", "purple": "#FAF5FF", "amber": "#FFFBEB"}

FONT_EN = ["DM Sans", "Segoe UI", "Helvetica", "Arial", "DejaVu Sans"]
FONT_ZH = ["Microsoft YaHei", "PingFang SC", "Noto Sans SC", "SimHei", "DejaVu Sans"]


def apply(lang="en"):
    plt.rcParams.update({
        "svg.fonttype": "none",
        "svg.hashsalt": "ai-series",   # fixed ids, so regenerating a figure gives the same file
        "font.family": "sans-serif",
        "font.sans-serif": FONT_EN if lang == "en" else FONT_ZH + FONT_EN,
        "axes.unicode_minus": False,
        "font.size": 11,
        "axes.titlesize": 12,
        "axes.labelsize": 11,
        "axes.edgecolor": MUTED,
        "axes.labelcolor": NAVY,
        "axes.titlecolor": NAVY,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.grid": True,
        "grid.color": BORDER,
        "grid.linewidth": 0.8,
        "xtick.color": SLATE,
        "ytick.color": SLATE,
        "legend.frameon": False,
        "legend.fontsize": 10,
        "lines.linewidth": 2.0,
        "axes.prop_cycle": matplotlib.cycler(color=SERIES),
        "figure.dpi": 100,
        "savefig.transparent": True,
    })


def figure(width=7.2, height=3.6, ncols=1, nrows=1, lang="en", **kw):
    apply(lang)
    return plt.subplots(nrows, ncols, figsize=(width, height), constrained_layout=True, **kw)


def save(fig, fig_id, lang="en"):
    out_dir = os.path.join(HERE, lang)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"{fig_id}.svg")
    fig.savefig(path, format="svg", metadata={"Date": None, "Creator": None})
    plt.close(fig)
    svg = open(path, encoding="utf-8").read()
    svg = re.sub(r"<\?xml[^>]*\?>\s*", "", svg)
    svg = re.sub(r"<!DOCTYPE[^>]*>\s*", "", svg)
    svg = re.sub(r"<metadata>.*?</metadata>\s*", "", svg, flags=re.S)
    # the page treats "$" as maths; matplotlib never needs it in an SVG
    svg = svg.replace("$", "")
    open(path, "w", encoding="utf-8").write(svg)
    return path
