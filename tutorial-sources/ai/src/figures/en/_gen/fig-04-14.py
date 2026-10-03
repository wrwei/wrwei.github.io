# Figure 4.14: monitoring pipeline and the signature of each fault type. Usage: fig-04-14.py en|zh
import random, math
from _common import *
l = lang()
T = {
 "en": dict(sensor="Sensor stream", fc="Forecaster", res="Residual", d1="point test", d1b="|r| > 4σ", d2="rolling RMS", d2b="50 samples", d3="rolling std", d3b="below a floor",
            alarm="Alarm log", f=["Spike", "Sustained offset", "Increased excitation", "Stuck sensor"],
            rt="residual rₜ", s=["|rₜ| vs 4σ", "|rₜ| vs 4σ", "rolling RMS", "rolling std"], fault="fault", thr=["4σ", "4σ", "limit", "floor"],
            note="Schematic sketches, not Lab 3 output."),
 "zh": dict(sensor="传感器数据流", fc="预测器", res="残差", d1="点检验", d1b="|r| > 4σ", d2="滚动 RMS", d2b="50 个采样", d3="滚动标准差", d3b="低于下限",
            alarm="告警日志", f=["尖峰", "持续偏移", "激励加大", "传感器卡死"],
            rt="残差 rₜ", s=["|rₜ| 与 4σ", "|rₜ| 与 4σ", "滚动 RMS", "滚动标准差"], fault="故障", thr=["4σ", "4σ", "上限", "下限"],
            note="示意草图，并非实验 3 的输出。"),
}[l]
W, H = 720, 392
p = open_svg(W, H, l)
def box(x, y, w, h, lines, fill="#FFFFFF", stroke=NAVY):
    p.append(rect(x, y, w, h, fill, stroke))
    n = len(lines)
    for i, s in enumerate(lines):
        yy = y + h/2 + (i - (n-1)/2) * 15 + 4.5
        p.append(text(x + w/2, yy, s, 13 if i == 0 else 12, "middle", NAVY if i == 0 else SLATE))
# pipeline
cy = 70
box(4, cy-22, 100, 44, [T["sensor"]], F_SKY, SKY)
box(130, cy-22, 100, 44, [T["fc"]], F_BLUE, BLUE)
box(256, cy-22, 92, 44, [T["res"], "rₜ"], F_AMBER, AMBER)
dets = [(T["d1"], T["d1b"]), (T["d2"], T["d2b"]), (T["d3"], T["d3b"])]
dy = [14, 52+4, 90+8]
for (a, b), y in zip(dets, [10, 54, 98]):
    box(392, y, 200, 40, [a + ": " + b], "#FFFFFF", GREEN) if False else box(392, y, 200, 40, [a, b], F_GREEN, GREEN)
box(628, cy-22, 88, 44, [T["alarm"]], F_RED, RED)
p.append(line(104, cy, 128, cy, SLATE, 1.6, "ah")); p.append(line(230, cy, 254, cy, SLATE, 1.6, "ah"))
p.append(line(348, cy, 370, cy, SLATE, 1.6))
p.append(line(370, 30, 370, 118, SLATE, 1.6))
for y in (30, 74, 118):
    p.append(line(370, y, 390, y, SLATE, 1.6, "ah"))
    p.append(line(592, y, 610, y, SLATE, 1.6))
p.append(line(610, 30, 610, 118, SLATE, 1.6)); p.append(line(610, cy, 626, cy, SLATE, 1.6, "ah"))
p.append(line(8, 154, 712, 154, BORDER, 1))
# panels
random.seed(7)
PW, GAP, X0 = 160, 24, 4
def poly(xs, ys):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in zip(xs, ys))
def roll(v, n, f):
    return [f(v[max(0, i-n+1):i+1]) for i in range(len(v))]
rms = lambda w: math.sqrt(sum(a*a for a in w)/len(w))
std = lambda w: math.sqrt(sum((a-sum(w)/len(w))**2 for a in w)/len(w))
N = 64
def noise(s=1.0): return [random.gauss(0, s) for _ in range(N)]
fa, fb = 36, 50   # fault interval (samples) [fa, fb)
series = []
r = noise(0.3); r[fa+4] = 3.4; series.append(r)                        # spike
r = noise(0.3)
for i in (fa, fa+1, fa+2): r[i] += 2.2*(1 if i == fa else 0.9 if i == fa+1 else 0.8)
for i in (fb, fb+1, fb+2): r[i] -= 2.0
series.append(r)                                                      # offset: bursts at start and end
r = noise(0.3)
for i in range(fa, fb): r[i] = random.gauss(0, 0.8)
series.append(r)                                                      # doubled excitation
r = noise(0.3)
for i in range(fa, N): r[i] = 0.0 + random.gauss(0, 0.004)
series.append(r)                                                      # stuck
for k in range(4):
    x0 = X0 + k*(PW+GAP)
    p.append(text(x0 + PW/2, 176, T["f"][k], 13, "middle", NAVY, "700"))
    r = series[k]
    ia, ib = (fa, fb) if k != 3 else (fa, N)
    sx = lambda i: x0 + 4 + (PW-8) * i / (N-1)
    # strip 1: residual
    top, hh = 190, 62
    p.append(f'<rect x="{x0}" y="{top}" width="{PW}" height="{hh}" fill="#FFFFFF" stroke="{BORDER}"/>')
    p.append(f'<rect x="{sx(ia):.1f}" y="{top}" width="{sx(ib)-sx(ia):.1f}" height="{hh}" fill="{F_RED}"/>')
    mid = top + hh/2; sc = 11.0
    p.append(line(x0, mid, x0+PW, mid, BORDER, 1))
    p.append(f'<polyline points="{poly([sx(i) for i in range(N)], [mid - max(-2.7, min(2.7, v))*sc for v in r])}" fill="none" stroke="{SLATE}" stroke-width="1.2"/>')
    p.append(text(x0+4, top+hh+14, T["rt"], 12, "start", SLATE))
    # strip 2: statistic
    top2, h2 = 286, 62
    p.append(f'<rect x="{x0}" y="{top2}" width="{PW}" height="{h2}" fill="#FFFFFF" stroke="{BORDER}"/>')
    p.append(f'<rect x="{sx(ia):.1f}" y="{top2}" width="{sx(ib)-sx(ia):.1f}" height="{h2}" fill="{F_RED}"/>')
    base = top2 + h2 - 6
    if k in (0, 1):
        st = [abs(v) for v in r]; ymax = 3.6; thr = 4*0.3*1.0   # 4σ with sigma = 0.3 in sketch units
        sy = lambda v: base - min(v, ymax)/ymax*(h2-12)
    elif k == 2:
        st = roll(r, 10, rms); ymax = 1.0; thr = 1.1*max(st[12:fa])
        sy = lambda v: base - v/ymax*(h2-12)
    else:
        st = roll(r, 10, std); ymax = 0.4; thr = 0.5*min(st[12:fa])
        sy = lambda v: base - v/ymax*(h2-12)
    # point test sketch: threshold is 4 sigma, sigma=0.3 -> 1.2; scale so spike sits well above
    i0 = 9 if k >= 2 else 0
    p.append(f'<polyline points="{poly([sx(i) for i in range(i0, N)], [sy(st[i]) for i in range(i0, N)])}" fill="none" stroke="{BLUE}" stroke-width="1.6"/>')
    p.append(line(x0+2, sy(thr), x0+PW-2, sy(thr), RED, 1.4, dash="5 3"))
    p.append(text(x0+PW-4, sy(thr)-4, T["thr"][k], 12, "end", RED, halo=True))
    p.append(text(x0+4, top2+h2+14, T["s"][k], 12, "start", BLUE))
p.append(text(W-4, H-4, T["note"], 11, "end", SLATE))
write(p, "fig-04-14", l)
