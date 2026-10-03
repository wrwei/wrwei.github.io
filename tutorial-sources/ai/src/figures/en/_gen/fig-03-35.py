import sys, os, math, itertools; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
import numpy as np, contourpy
from scipy.ndimage import gaussian_filter
L = lang()
T = {"en": dict(t1="Disc of radius 8 (2D)", t2="Sphere (3D), cut away", stair="pixel-edge boundary: 64", cont="contour of the blurred mask (σ = 0.9 px): 50.2",
                circ="true circle 2πr: 50.3", vox="voxelised", mesh="marching-cubes mesh", icons="The 15 marching-cubes base cases (corners inside the surface filled)"),
     "zh": dict(t1="半径为 8 的圆盘（二维）", t2="球（三维），剖开", stair="像素边界：64", cont="模糊掩膜（σ = 0.9 像素）的等值线：50.2",
                circ="真实圆周 2πr：50.3", vox="体素化", mesh="移动立方体网格", icons="移动立方体算法的 15 种基本情形（填充的角点在曲面内部）")}[L]
W, H = 720, 530
o = open_svg(W, H, L)
# ---------------- 2D disc
n = 24
yy, xx = np.mgrid[0:n, 0:n]
cx0 = cy0 = 11.3
m = ((xx - cx0) ** 2 + (yy - cy0) ** 2 <= 64)
assert m.sum() == 201
blur = gaussian_filter(m.astype(float), 0.9)
cell, gx, gy = 10, 78, 52
lo = 2          # first displayed pixel
X = lambda x: gx + (x - lo + 0.5) * cell
Y = lambda y: gy + (y - lo + 0.5) * cell
o.append(text(gx + 100, 26, T["t1"], 14, "middle", NAVY, 600))
for j in range(lo, lo + 20):
    for i in range(lo, lo + 20):
        f = F_BLUE if m[j, i] else "#FFFFFF"
        o.append(f'<rect x="{X(i-0.5):.1f}" y="{Y(j-0.5):.1f}" width="{cell}" height="{cell}" fill="{f}" stroke="{BORDER}" stroke-width="0.7"/>')
per = 0
for j in range(n):
    for i in range(n):
        if not m[j, i]: continue
        for di, dj, seg in ((1, 0, (0.5, -0.5, 0.5, 0.5)), (-1, 0, (-0.5, -0.5, -0.5, 0.5)), (0, 1, (-0.5, 0.5, 0.5, 0.5)), (0, -1, (-0.5, -0.5, 0.5, -0.5))):
            if not m[j + dj, i + di]:
                per += 1
                o.append(line(X(i + seg[0]), Y(j + seg[1]), X(i + seg[2]), Y(j + seg[3]), RED, 2.4, extra=' stroke-linecap="square"'))
assert per == 64
g = contourpy.contour_generator(xx.astype(float), yy.astype(float), blur)
tot = 0
for l in g.lines(0.5):
    tot += float(np.sum(np.hypot(*np.diff(l, axis=0).T)))
    pts = " ".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in l)
    o.append(f'<polyline points="{pts}" fill="none" stroke="{BLUE}" stroke-width="2.2" stroke-linejoin="round"/>')
assert abs(tot - 50.2) < 0.06, tot
o.append(f'<circle cx="{X(cx0):.1f}" cy="{Y(cy0):.1f}" r="{8*cell}" fill="none" stroke="{GREEN}" stroke-width="2" stroke-dasharray="6 4"/>')
ly = gy + 20 * cell + 24
for i, (col, dash, lab) in enumerate(((RED, None, T["stair"]), (BLUE, None, T["cont"]), (GREEN, "6 4", T["circ"]))):
    o.append(line(18, ly + 18 * i - 4, 48, ly + 18 * i - 4, col, 2.4, dash=dash))
    o.append(text(56, ly + 18 * i, lab, 12.5, "start", NAVY))
# ---------------- 3D
o.append(text(535, 26, T["t2"], 14, "middle", NAVY, 600))
ca, sa = math.cos(math.radians(30)), 0.5
def proj(p, s, ox, oy):
    x, y, z = p
    return (ox + (x - y) * ca * s, oy + (x + y) * sa * s - z * s)
def shade(c, k):
    c = c.lstrip("#"); r, g_, b = (int(c[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02X%02X%02X" % tuple(int(255 - (255 - v) * k) for v in (r, g_, b))
# voxel sphere
s = 11.5
ox, oy = 452, 160
cells = []
R = 4.5
for i in range(-5, 5):
    for j in range(-5, 5):
        for k in range(-5, 5):
            c = (i + .5, j + .5, k + .5)
            if sum(v * v for v in c) <= R * R and not (c[0] > 0 and c[1] > 0 and c[2] > 0):
                cells.append((i, j, k))
cells.sort(key=lambda t: t[0] + t[1] + t[2])
def P(x, y, z): return proj((x, y, z), s, ox, oy)
for i, j, k in cells:
    faces = [([(i, j, k + 1), (i + 1, j, k + 1), (i + 1, j + 1, k + 1), (i, j + 1, k + 1)], "#DBEAFE"),
             ([(i + 1, j, k), (i + 1, j + 1, k), (i + 1, j + 1, k + 1), (i + 1, j, k + 1)], "#93C5FD"),
             ([(i, j + 1, k), (i + 1, j + 1, k), (i + 1, j + 1, k + 1), (i, j + 1, k + 1)], "#60A5FA")]
    for pts, col in faces:
        o.append('<polygon points="' + " ".join("%.1f,%.1f" % P(*p) for p in pts) + f'" fill="{col}" stroke="#1D4ED8" stroke-width="0.5" stroke-linejoin="round"/>')
o.append(text(ox, 262, T["vox"], 13, "middle", SLATE, 600))
# marching tetrahedra isosurface of the blurred sphere
N = 14
g3 = np.mgrid[0:N, 0:N, 0:N].astype(float) - (N - 1) / 2
vol = gaussian_filter(((g3 ** 2).sum(0) <= R * R).astype(float), 0.7)
tets = [(0, 1, 3, 7), (0, 1, 5, 7), (0, 2, 3, 7), (0, 2, 6, 7), (0, 4, 5, 7), (0, 4, 6, 7)]
cor = [(a, b, c) for a in (0, 1) for b in (0, 1) for c in (0, 1)]
tris = []
def interp(p, q, vp, vq):
    t = (0.5 - vp) / (vq - vp)
    return tuple(np.array(p) + t * (np.array(q) - np.array(p)))
for i in range(N - 1):
    for j in range(N - 1):
        for k in range(N - 1):
            vs = [vol[i + a, j + b, k + c] for a, b, c in cor]
            if min(vs) > 0.5 or max(vs) < 0.5: continue
            ps = [(i + a - (N - 1) / 2, j + b - (N - 1) / 2, k + c - (N - 1) / 2) for a, b, c in cor]
            for t in tets:
                ins = [q for q in t if vs[q] > 0.5]; out = [q for q in t if vs[q] <= 0.5]
                if len(ins) in (0, 4): continue
                if len(ins) == 1 or len(out) == 1:
                    a, b = (ins, out) if len(ins) == 1 else (out, ins)
                    tris.append([interp(ps[a[0]], ps[q], vs[a[0]], vs[q]) for q in b])
                else:
                    a0, a1 = ins; b0, b1 = out
                    p00, p01, p10, p11 = (interp(ps[a], ps[b], vs[a], vs[b]) for a in (a0, a1) for b in (b0, b1))
                    tris.append([p00, p01, p11]); tris.append([p00, p11, p10])
ox2 = 620
tl = []
for t in tris:
    c = np.mean(t, axis=0)
    if c[0] > 0 and c[1] > 0 and c[2] > 0: continue
    nrm = np.cross(np.array(t[1]) - t[0], np.array(t[2]) - t[0])
    if np.linalg.norm(nrm) < 1e-9: continue
    nrm = nrm / np.linalg.norm(nrm)
    outward = np.dot(nrm, c) >= 0
    nrm = nrm if outward else -nrm
    tl.append((c[0] + c[1] + c[2], t, nrm, c))
tl.sort(key=lambda e: e[0])
light = np.array([0.3, 0.5, 0.8]); light /= np.linalg.norm(light)
view = np.array([1, 1, 1]) / math.sqrt(3)
for dpt, t, nrm, c in tl:
    facing = np.dot(nrm, view) > 0
    k = 0.35 + 0.65 * max(0, np.dot(nrm, light)) if facing else 0.45
    col = shade("#0284C7" if facing else "#075985", k)
    o.append('<polygon points="' + " ".join("%.1f,%.1f" % proj(p, s, ox2, oy) for p in t) + f'" fill="{col}" stroke="#0C4A6E" stroke-opacity="0.2" stroke-width="0.4" stroke-linejoin="round"/>')
o.append(text(ox2, 262, T["mesh"], 13, "middle", SLATE, 600))
# ---------------- the 15 base cases
verts = [(a, b, c) for a in (0, 1) for b in (0, 1) for c in (0, 1)]
idx = {v: i for i, v in enumerate(verts)}
syms = []
for perm in itertools.permutations(range(3)):
    sgn = -1 if sum(perm[a] > perm[b] for a in range(3) for b in range(a + 1, 3)) % 2 else 1
    for flip in itertools.product((0, 1), repeat=3):
        if sgn * (-1) ** sum(flip) != 1: continue   # rotations only: reflections would merge the two mirror cases
        syms.append([idx[tuple((v[perm[d]] ^ flip[d]) for d in range(3))] for v in verts])
def canon(mask):
    best = 1 << 9
    for inv in (0, 1):
        mk = mask ^ (255 if inv else 0)
        for sy in syms:
            r = sum(1 << sy[b] for b in range(8) if mk >> b & 1)
            best = min(best, r)
    return best
classes = {}
for mk in range(256):
    classes.setdefault(canon(mk), []).append(mk)
assert len(classes) == 15
reps = []
for key, mem in classes.items():
    mem.sort(key=lambda m_: (bin(m_).count("1"), m_))
    reps.append(mem[0])
reps.sort(key=lambda m_: (bin(m_).count("1"), m_))
o.append(text(W / 2, 356, T["icons"], 13, "middle", NAVY, 600))
cs_ = 26
for n_, mk in enumerate(reps):
    cxi = 76 + (n_ % 8) * 80
    cyi = 376 + (n_ // 8) * 72
    pr = {v: proj(v, cs_, cxi, cyi + 0.5 * cs_) for v in verts}
    for a, b in itertools.combinations(verts, 2):
        if sum(x != y for x, y in zip(a, b)) == 1:
            o.append(line(pr[a][0], pr[a][1], pr[b][0], pr[b][1], MUTED, 1.2))
    for v in sorted(verts, key=lambda q: q[0] + q[1] + q[2]):
        inside = mk >> idx[v] & 1
        o.append(circle(round(pr[v][0], 1), round(pr[v][1], 1), 3.6 if inside else 2.8, BLUE if inside else "#FFFFFF", BLUE if inside else MUTED, 1.3))
write(o, "fig-03-35", L)
