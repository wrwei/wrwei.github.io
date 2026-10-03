# Figure 5.29: decision flow for choosing a family; leaves carry Section 13's first baselines.
#   python fig-05-29.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
l = lang()
EN = dict(yes="yes", no="no", base="first baseline: ",
          groups=[("Is the data a graph|or mesh?", GREEN, F_GREEN,
                   [("GNN", "", "hand-made graph features, or the obvious structural rule")]),
                  ("Is there a governing|equation?", PURPLE, F_PURPLE,
                   [("PINN", "sparse data, inverse problem", "a classical solver wrapped in a least-squares fit"),
                    ("Neural operator", "many solver runs, many queries", "a Gaussian-process or POD surrogate, and the solver itself")]),
                  ("Do you need|to generate?", ORANGE, F_ORANGE,
                   [("Diffusion", "quality, conditioning", "a GAN or VAE"),
                    ("GAN", "speed", "diffusion distilled to a few steps"),
                    ("VAE", "latent space", "PCA plus a Gaussian")]),
                  ("Are labels|scarce?", BLUE, F_SKY,
                   [("Contrastive or masked pretraining", "", "spectral or engineered features; PCA"),
                    ("Autoencoder", "compress, denoise, detect anomalies", "PCA and its Q statistic")]),
                  ("Need capacity at|fixed compute?", AMBER, F_AMBER,
                   [("Mixture of experts", "", "a dense model of the same active size")])])
ZH = dict(yes="是", no="否", base="首个基线：",
          groups=[("数据是图|或网格吗？", GREEN, F_GREEN,
                   [("GNN", "", "手工图特征，或显而易见的结构规则")]),
                  ("有控制|方程吗？", PURPLE, F_PURPLE,
                   [("PINN", "数据稀疏、反问题", "经典求解器加最小二乘拟合"),
                    ("神经算子", "求解器运行多、查询多", "高斯过程或 POD 代理模型，以及求解器本身")]),
                  ("需要|生成吗？", ORANGE, F_ORANGE,
                   [("扩散模型", "质量、条件生成", "GAN 或 VAE"),
                    ("GAN", "速度", "蒸馏到少数几步的扩散模型"),
                    ("VAE", "潜空间", "PCA 加高斯分布")]),
                  ("标签|稀缺吗？", BLUE, F_SKY,
                   [("对比或掩码预训练", "", "频谱或工程特征；PCA"),
                    ("自编码器", "压缩、去噪、检测异常", "PCA 及其 Q 统计量")]),
                  ("需要在固定计算量下|增加容量？", AMBER, F_AMBER,
                   [("混合专家", "", "活跃参数规模相同的稠密模型")])])
T = EN if l == "en" else ZH
LH, LG = 40, 4
GAPS = [14, 14, 14, 14]       # gap after each group           # leaf height, gap between leaves, gap between groups
QX, QW, QH = 12, 172, 42
BUS, LX, LW = 228, 244, 484
tot = sum(len(g[3]) * LH + (len(g[3]) - 1) * LG for g in T["groups"]) + sum(GAPS)
H = int(tot + 24)
P = open_svg(740, H, l)
y = 12
prev = None
for qi, (q, col, fill, leaves) in enumerate(T["groups"]):
    gh = len(leaves) * LH + (len(leaves) - 1) * LG
    qc = y + gh / 2
    P.append(rect(QX, qc - QH / 2, QW, QH, "#FFFFFF", NAVY, 1.6, 8))
    q1, q2 = q.split("|")
    P.append(text(QX + QW / 2, qc - 3, q1, 13, "middle", NAVY, "700"))
    P.append(text(QX + QW / 2, qc + 13, q2, 13, "middle", NAVY, "700"))
    if prev is not None:
        P.append(line(QX + 30, prev + QH / 2, QX + 30, qc - QH / 2 - 1, SLATE, 1.6, "ah"))
        P.append(text(QX + 38, (prev + qc) / 2 + 4, T["no"], 12, "start", SLATE))
    # yes: fork to the leaves
    cys = [y + LH / 2 + k * (LH + LG) for k in range(len(leaves))]
    P.append(line(QX + QW, qc, BUS, qc, col, 1.6))
    P.append(text((QX + QW + BUS) / 2, qc - 6, T["yes"], 12, "middle", col, "600"))
    if len(leaves) > 1:
        P.append(line(BUS, cys[0], BUS, cys[-1], col, 1.6))
    for k, (name, cond, base) in enumerate(leaves):
        cy = cys[k]
        if len(leaves) > 1 or abs(cy - qc) > 0.1:
            P.append(line(BUS, cy, LX - 1, cy, col, 1.6))
        P.append(f'<path d="M{LX-8},{cy-4} L{LX},{cy} L{LX-8},{cy+4} z" fill="{col}"/>')
        P.append(rect(LX, cy - LH / 2, LW, LH, fill, col, 1.5, 8))
        head = f'<tspan font-weight="700" fill="{col}">{name}</tspan>'
        if cond:
            head += f'<tspan fill="{NAVY}">  ({cond})</tspan>'
        P.append(text(LX + 12, cy - 3, head, 13, "start", NAVY))
        P.append(text(LX + 12, cy + 14, T["base"] + base, 11.5, "start", SLATE))
    prev = qc
    y += gh + (GAPS[qi] if qi < len(GAPS) else 0)
write(P, "fig-05-29", l)
