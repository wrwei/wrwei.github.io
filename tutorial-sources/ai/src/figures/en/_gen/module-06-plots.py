"""Computed Module 06 figures. Run from the series root: python ... en|zh.

Figure 8 reads measured Lab 6 maps captured by fig-06-8-capture.py; Figure 25
reads the recorded full Lab 5 run. Other figures evaluate the stated equations.
"""
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / "src/figures"))
import figstyle as fs

def heatmap(ax, values, aspect="equal", origin="upper", **kwargs):
    """Keep cells as vector paths, with imshow-compatible integer centres."""
    assert origin == "upper"
    values = np.ma.asarray(values)
    rows, columns = values.shape
    mesh = ax.pcolormesh(np.arange(columns+1)-.5, np.arange(rows+1)-.5,
                         values, shading="flat", rasterized=False,
                         edgecolors="face", linewidth=.25, **kwargs)
    ax.set_xlim(-.5, columns-.5)
    ax.set_ylim(rows-.5, -.5)
    ax.set_aspect(aspect)
    return mesh

def colourbar(fig, mesh, **kwargs):
    bar = fig.colorbar(mesh, **kwargs)
    # Matplotlib otherwise rasterises a colourbar with many colour levels.
    bar.solids.set_rasterized(False)
    bar.solids.set_edgecolor("face")
    bar.solids.set_linewidth(.25)
    return bar

LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
assert LANG in ("en", "zh")


def t(en, zh):
    return zh if LANG == "zh" else en


def figure(*args, height=4.8, **kwargs):
    return fs.figure(*args, width=10, height=height, lang=LANG, **kwargs)


def save(fig, number):
    path = Path(fs.save(fig, f"fig-06-{number}", lang=LANG))
    # Matplotlib uses points; the viewBox is already 720 units wide.
    text = path.read_text(encoding="utf-8")
    text = text.replace('width="720pt"', 'width="720"')
    import re
    text = re.sub(r'height="([\d.]+)pt"', r'height="\1"', text, count=1)
    path.write_text(text, encoding="utf-8")


def softmax(x):
    ex = np.exp(x - x.max(axis=-1, keepdims=True))
    return ex / ex.sum(axis=-1, keepdims=True)


# 4: exactly the independent random streams and dimensions used by Lab 1.
rng = np.random.default_rng(0)
dots = {}
for d in (2, 16, 64, 128):
    q, k = rng.standard_normal((100_000, d)), rng.standard_normal((100_000, d))
    dots[d] = (q * k).sum(axis=1)
rng = np.random.default_rng(0)
q = rng.standard_normal((5000, 128))
k = rng.standard_normal((5000, 16, 128))
raw = np.einsum("nd,nkd->nk", q, k)
fig, axes = figure(ncols=2)
for d, colour in zip((2, 16, 128), fs.SERIES):
    axes[0].hist(dots[d], bins=np.linspace(-40, 40, 81), density=True,
                 alpha=0.5, color=colour, label=f"dₖ = {d}: σ = {dots[d].std():.1f}")
axes[0].set(xlabel=t("Raw score q · k", "原始分数 q · k"),
            ylabel=t("Density", "密度"), xlim=(-40, 40))
axes[0].legend()
for scores, label, colour in ((raw, t("Unscaled", "未缩放"), fs.ORANGE),
                              (raw / np.sqrt(128), t("Scaled", "已缩放"), fs.BLUE)):
    largest = softmax(scores).max(axis=1)
    axes[1].hist(largest, bins=np.linspace(0, 1, 41), alpha=0.6, color=colour,
                 label=f"{label}: {t('median', '中位数')} {np.median(largest):.3f}")
axes[1].set(xlabel=t("Largest weight (16 keys)", "最大权重（16 个键）"),
            ylabel=t("Draws", "次数"), xlim=(0, 1))
axes[1].legend(loc="upper center")
save(fig, 4)

# 5: causal scores, probabilities and their actual convex combinations.
q = np.array([[1., 0.], [0., 1.], [1., 1.]])
v = np.array([[1., 0.], [0., 2.], [3., 3.]])
s = np.where(np.tri(3, dtype=bool), q @ q.T / np.sqrt(2), -np.inf)
p = softmax(s)
o = p @ v
fig, axes = figure(ncols=3, height=4.4)
for ax, data, title in ((axes[0], s, t("Scaled scores", "缩放分数")),
                         (axes[1], p, t("Causal weights", "因果权重"))):
    masked = np.ma.masked_invalid(data)
    cmap = fs.plt.get_cmap("Blues").copy()
    cmap.set_bad("#F1F5F9")
    heatmap(ax, masked, cmap=cmap, vmin=0, vmax=1.5 if ax is axes[0] else 1)
    for i in range(3):
        for j in range(3):
            label = "−∞" if not np.isfinite(data[i, j]) else f"{data[i, j]:.3f}"
            ax.text(j, i, label, ha="center", va="center",
                    color="white" if data[i, j] > 0.8 else fs.NAVY, fontsize=11)
    ax.set(xticks=range(3), yticks=range(3), xticklabels=["k₁", "k₂", "k₃"],
           yticklabels=["q₁", "q₂", "q₃"], title=title)
    ax.grid(False)
ax = axes[2]
ax.plot(*np.vstack((v, v[0])).T, color=fs.BORDER)
for j in range(3):
    ax.plot([v[j, 0], o[2, 0]], [v[j, 1], o[2, 1]],
            color=fs.SKY, linewidth=1 + 4 * p[2, j], alpha=0.55)
ax.scatter(*v.T, color=fs.NAVY, zorder=3)
ax.scatter(*o.T, facecolors="none", edgecolors=fs.ORANGE, s=65, zorder=4)
for j in range(3):
    ax.annotate(f"v{j + 1}", v[j], xytext=(5, -12), textcoords="offset points")
    ax.annotate(f"o{j + 1}", o[j], xytext=(5, 6), textcoords="offset points",
                color=fs.ORANGE)
ax.set(xlim=(-0.5, 3.5), ylim=(-0.5, 3.5), xlabel=t("Component 1", "分量 1"),
       ylabel=t("Component 2", "分量 2"), title=t("Weighted outputs", "加权输出"))
ax.set_aspect("equal")
save(fig, 5)

# 8: measured trained heads, not a hand-drawn induction pattern.
data = json.loads((ROOT / "labs/module_06/lab6-head-maps.json").read_text())
fig, axes = figure(ncols=2, height=5.5)
for ax, values, title, head in zip(axes, data["maps"],
        (t("Previous-token head", "前一 token 头"), t("Induction head", "归纳头")),
        (data["previous_head"], data["induction_head"])):
    im = heatmap(ax, values, vmin=0, vmax=1, cmap="Blues", origin="upper")
    ax.set(xlabel=t("Key position", "键位置"), ylabel=t("Query position", "查询位置"),
           title=f"{title} {head}; n = {data['segment_length']}")
    ax.grid(False)
    colourbar(fig, im, ax=ax, fraction=0.04, label=t("Weight", "权重"))
fig.supxlabel(t("… A B … A → B: look up the successor of an earlier A",
                "… A B … A → B：查找前一个 A 的后继 token "), fontsize=12)
save(fig, 8)

# 11: paired sinusoidal features.
positions = np.arange(128)[:, None]
freq = 10000.0 ** (-np.arange(0, 64, 2) / 64)
pe = np.empty((128, 64))
pe[:, 0::2], pe[:, 1::2] = np.sin(positions * freq), np.cos(positions * freq)
fig, ax = figure(height=4.8)
im = heatmap(ax, pe, aspect="auto", vmin=-1, vmax=1, cmap="RdBu_r")
ax.set(xlabel=t("Dimension j (fast → slow)", "维度 j（快 → 慢）"),
       ylabel=t("Position t", "位置 t"))
ax.grid(False)
colourbar(fig, im, ax=ax, label="PE(t, j)")
save(fig, 11)

# 13: all-one RoPE dot product, averaged across 64 pairs.
delta = np.unique(np.geomspace(1, 16384, 4000).astype(int))
fig, ax = figure(height=4.6)
for base, colour, style in ((10000, fs.BLUE, "-"), (500000, fs.ORANGE, "--")):
    freq = base ** (-np.arange(0, 128, 2) / 128)
    score = np.cos(delta[:, None] * freq).mean(axis=1)
    ax.plot(delta, score, style, color=colour, label=f"b = {base:,}", linewidth=1.3)
ax.axhline(0, color=fs.MUTED, linewidth=1)
ax.set(xscale="log", xlim=(1, 16384), ylim=(-0.3, 1),
       xlabel=t("Offset Δ (tokens)", "偏移 Δ（ token）"),
       ylabel=t("Dot product / 128", "点积 / 128"))
ax.legend()
save(fig, 13)

# 14: exact linear ALiBi penalties and a masked bias matrix.
fig, axes = figure(ncols=2)
distance = np.arange(12)[:, None] - np.arange(12)[None, :]
bias = np.ma.masked_where(distance < 0, -0.5 * distance)
im = heatmap(axes[0], bias, cmap="Blues_r", vmin=-5.5, vmax=0)
axes[0].grid(False)
axes[0].set(xlabel=t("Key position", "键位置"), ylabel=t("Query position", "查询位置"),
            title=t("Slope m = 1/2; upper triangle masked", "斜率 m = 1/2；上三角被掩蔽"))
colourbar(fig, im, ax=axes[0], fraction=0.04)
distance = np.arange(101)
for i in range(1, 9):
    axes[1].plot(distance, -distance / 2**i, label=f"1/{2**i}",
                 color=fs.SERIES[i - 1])
axes[1].set(xlabel=t("Distance t − s", "距离 t − s"), ylabel=t("Bias", "偏置"),
            ylim=(-50, 1))
axes[1].legend(ncols=2, title="m")
save(fig, 14)

# 15: wavelength calculations, including the exact NTK-aware base.
i = np.arange(64)
original = 2 * np.pi / 10000.0 ** (-2 * i / 128)
ntk_base = 10000 * 4 ** (128 / 126)
ntk = 2 * np.pi / ntk_base ** (-2 * i / 128)
fig, ax = figure(height=5)
ax.bar(i, np.log10(original), color=fs.BORDER, width=0.75)
for values, label, colour, marker in ((original, t("Original", "原始"), fs.BLUE, "o"),
        (4 * original, t("Interpolation κ = 4", "位置插值 κ = 4"), fs.ORANGE, "x"),
        (ntk, t("NTK-aware base", "NTK 感知底数"), fs.GREEN, ".")):
    ax.plot(i, np.log10(values), marker, markersize=4, color=colour, label=label)
for level, label, colour in ((4096, t("Trained: 4096", "训练：4096"), fs.NAVY),
        (16384, t("Target: 16384", "目标：16384"), fs.PURPLE)):
    ax.axhline(np.log10(level), color=colour, linestyle="--", label=label)
ax.set(xlabel=t("Pair i (fast → slow)", "维度对 i（快 → 慢）"),
       ylabel=t("log₁₀ wavelength (tokens)", "log₁₀ 波长（ token）"), xlim=(-1, 64))
ax.legend(ncols=2)
save(fig, 15)

# 23: independent itemised counts using the same five configurations as Lab 4.
configs = [
    ("GPT-2 small", 50257, 768, 12, 12, 12, 3072, True, False, "all", 1024, True),
    ("SmolLM2-135M", 49152, 576, 30, 9, 3, 1536, True, True, "none", 0, False),
    ("Qwen2.5-0.5B", 151936, 896, 24, 14, 2, 4864, True, True, "qkv", 0, False),
    ("Llama-2-7B", 32000, 4096, 32, 32, 32, 11008, False, True, "none", 0, False),
    ("Llama-3-8B", 128256, 4096, 32, 32, 8, 14336, False, True, "none", 0, False),
]
counts = []
for name, vocab, d, layers, heads, kv, ff, tied, glu, bias, pos, ln in configs:
    att = 2 * d * d + 2 * d * kv * (d // heads)
    if bias in ("qkv", "all"):
        att += d + 2 * kv * (d // heads)
    if bias == "all":
        att += d
    mlp = (3 if glu else 2) * d * ff + (ff + d if bias == "all" else 0)
    norm = (2 * layers + 1) * d * (2 if ln else 1)
    counts.append([vocab * d * (1 if tied else 2) + pos * d,
                   layers * att, layers * mlp, norm])
counts = np.array(counts)
shares = counts / counts.sum(axis=1, keepdims=True) * 100
fig, ax = figure(height=4.4)
left = np.zeros(5)
for j, label in enumerate((t("Vocabulary / positions", "词表 / 位置"),
        t("Attention", "注意力"), t("FFN", "前馈网络"), t("Norms", "归一化"))):
    ax.barh(np.arange(5), shares[:, j], left=left, color=fs.SERIES[j], label=label)
    left += shares[:, j]
ax.set(yticks=range(5), yticklabels=[c[0] for c in configs], xlim=(0, 100),
       xlabel=t("Share of total parameters (%)", "总参数占比（%）"))
ax.invert_yaxis(); ax.legend(ncols=2, loc="upper center", bbox_to_anchor=(0.5, -0.2))
save(fig, 23)

# 24: lookup embedding excluded, as in the Module 06 FLOP convention.
llama_total = int(counts[3].sum())
n_matmul = llama_total - 32000 * 4096
context = np.geomspace(128, 131072, 300)
fig, ax = figure(height=4.6)
ax.axhline(2 * n_matmul / 1e9, color=fs.NAVY, label=t("Weight products", "权重矩阵乘法"))
ax.plot(context, 4 * 32 * 4096 * context / 1e9, color=fs.BLUE,
        label=t("One token: 4Ldt", "单 token：4Ldt"))
ax.plot(context, 2 * 32 * 4096 * context / 1e9, color=fs.ORANGE,
        label=t("Causal average: 2LdT", "因果平均：2LdT"))
for cross in (n_matmul / (2 * 32 * 4096), n_matmul / (32 * 4096)):
    ax.axvline(cross, color=fs.MUTED, linestyle=":")
    ax.annotate(f"{cross:,.0f}", (cross, 2 * n_matmul / 1e9),
                xytext=(-12, 12), textcoords="offset points", ha="right")
ax.set(xscale="log", xlabel=t("Visible context / sequence length", "可见上下文 / 序列长度"),
       ylabel=t("Forward GFLOP per token", "每 token 前向 GFLOP"), ylim=(0, 72))
ax.legend()
save(fig, 24)

# 25: recorded full run and separately measured prefix-only scoring.
data = json.loads((ROOT / "labs/module_06/lab5-full-metrics.json").read_text())
fig, axes = figure(ncols=2, height=4.8)
for key, label, colour in (("causal_curve", t("Causal", "因果"), fs.BLUE),
                          ("unmasked_curve", t("Unmasked", "无掩码"), fs.ORANGE)):
    values = np.array(data[key])
    axes[0].plot(values[:, 0], values[:, 2], color=colour, label=label)
for key, label, colour in (("no_copy_floor", t("No-copy reference", "无复制参照"), fs.MUTED),
                          ("true_floor", t("Source entropy", "源熵"), fs.GREEN)):
    axes[0].axhline(data[key], linestyle="--", color=colour, label=label)
axes[0].set(xlabel=t("Training step", "训练步数"),
            ylabel=t("Validation nats / character", "验证损失（奈特 / 字符）"),
            yscale="log", ylim=(0.01, 5))
axes[0].legend()
x = np.arange(2)
axes[1].bar(x - 0.17, [data['causal_curve'][-1][2], data['unmasked_curve'][-1][2]],
            width=0.34, color=fs.BLUE, label=t("Window", "窗口"))
axes[1].bar(x + 0.17, [data['causal_prefix'], data['unmasked_prefix']], width=0.34,
            color=fs.ORANGE, label=t("Prefix only", "仅前缀"))
axes[1].set(xticks=x, xticklabels=[t("Causal", "因果"), t("Unmasked", "无掩码")],
            ylabel=t("Nats / character", "奈特 / 字符"), ylim=(0, 1.45))
axes[1].legend()
save(fig, 25)

# Matplotlib emits spaces before SVG path newlines; keep generated assets clean.
for _svg in (ROOT / f"src/figures/{LANG}").glob("fig-06-*.svg"):
    _svg.write_text("\n".join(line.rstrip() for line in _svg.read_text(encoding="utf8").splitlines()).rstrip() + "\n", encoding="utf8")
