"""A dependent square relation with near-zero sample covariance; SVG scatter."""
import argparse
from pathlib import Path
import random


def moments(pairs):
    n = len(pairs)
    mx = sum(x for x, y in pairs)/n
    my = sum(y for x, y in pairs)/n
    vx = sum((x-mx)**2 for x, y in pairs)/n
    vy = sum((y-my)**2 for x, y in pairs)/n
    cov = sum((x-mx)*(y-my) for x, y in pairs)/n
    return mx, my, vx, vy, cov


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output")
    args = parser.parse_args()
    generator = random.Random(23023)
    xs = [generator.uniform(-1, 1) for _ in range(20000)]
    dependent = [(x, x*x) for x in xs]
    independent = [(x, generator.random()) for x in xs]
    print("AI continuous population: X uniform(-1,1), Y=X^2")
    print("exact E(X)=0 E(Y)=1/3 Cov(X,Y)=0; Y is determined by X")
    for name, pairs in (("dependent square", dependent), ("independent reference", independent)):
        mx, my, vx, vy, cov = moments(pairs)
        print("%s: meanX=%.6f meanY=%.6f covariance=%.6f correlation=%.6f" % (
            name, mx, my, cov, cov/(vx*vy)**.5))
    residual = max(abs(y-x*x) for x, y in dependent)
    print("square-relation maximum residual:", residual)
    assert residual == 0
    # CS counterpart uses three equiprobable values, no integration prerequisite.
    discrete = [(-1., 1.), (0., 0.), (1., 1.)]
    print("CS discrete counterpart X=-1,0,1 equally likely: covariance=%.1f" % moments(discrete)[4])
    if args.output:
        drawing = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 390" role="img" aria-label="Dependent square relation and independent reference scatter plots">',
                   '<rect width="760" height="390" fill="white"/>',
                   '<g font-family="system-ui,sans-serif" fill="#1a2e4a">']
        for offset, name, pairs in ((0, "Y=X^2: dependent", dependent), (380, "Independent reference", independent)):
            drawing.append('<text x="%d" y="30" font-size="21" text-anchor="middle">%s</text>' % (offset+190, name))
            drawing.append('<path d="M%d,65V320H%d" fill="none" stroke="#94a3b8"/>' % (offset+55, offset+330))
            for x, y in pairs[::50]:
                px, py = offset+55+(x+1)*137.5, 320-y*250
                drawing.append('<circle cx="%.3f" cy="%.3f" r="2.1" fill="#2563eb" opacity=".55"/>' % (px, py))
            for t in (-1, 0, 1):
                drawing.append('<text x="%.1f" y="348" text-anchor="middle" font-size="16">%d</text>' % (offset+55+(t+1)*137.5, t))
        drawing.append('<text x="380" y="378" text-anchor="middle" font-size="18">Small covariance does not exclude a deterministic nonlinear relation.</text></g></svg>')
        Path(args.output).write_text("\n".join(drawing), encoding="utf8")
        print("Scatter figure written; its dependent sample obeys the square relation exactly.")
