"""Joint moments and conditional expectation/variance with exact fractions."""
from fractions import Fraction as F

if __name__ == "__main__":
    joint = {(0, 0): F(1, 2), (0, 2): F(1, 4), (1, 0): F(1, 8), (1, 2): F(1, 8)}
    ex = sum((x*p for (x, y), p in joint.items()), F(0))
    ey = sum((y*p for (x, y), p in joint.items()), F(0))
    vx = sum(((x-ex)**2*p for (x, y), p in joint.items()), F(0))
    vy = sum(((y-ey)**2*p for (x, y), p in joint.items()), F(0))
    cov = sum(((x-ex)*(y-ey)*p for (x, y), p in joint.items()), F(0))
    vsum = sum(((x+y-ex-ey)**2*p for (x, y), p in joint.items()), F(0))
    assert sum(joint.values()) == 1
    print("joint:", {xy: str(p) for xy, p in joint.items()})
    print("E(X)=%s E(Y)=%s Var(X)=%s Var(Y)=%s Cov=%s" % (ex, ey, vx, vy, cov))
    print("Var(X+Y)=%s independent shortcut=%s" % (vsum, vx+vy))
    assert vsum == vx+vy+2*cov
    cases = []
    for y in (0, 2):
        py = sum((p for (x, yy), p in joint.items() if yy == y), F(0))
        conditional = sum((x*p/py for (x, yy), p in joint.items() if yy == y), F(0))
        conditional_var = sum(((x-conditional)**2*p/py for (x, yy), p in joint.items() if yy == y), F(0))
        cases.append((py, conditional, conditional_var))
        print("Y=%d: probability=%s E(X|Y)=%s Var(X|Y)=%s" % (y, py, conditional, conditional_var))
    total_mean = sum((py*mean for py, mean, var in cases), F(0))
    within = sum((py*var for py, mean, var in cases), F(0))
    between = sum((py*(mean-ex)**2 for py, mean, var in cases), F(0))
    print("total expectation=%s; within variance=%s between variance=%s total=%s" % (
        total_mean, within, between, within+between))
    assert total_mean == ex and within+between == vx
    positions = {1: F(1, 2), 2: F(1, 4), 3: F(1, 8), 4: F(1, 8)}
    cost = sum(k*p for k, p in positions.items())
    print("specified search-position model E(comparisons)=%s uniform alternative=5/2" % cost)
    print("PASS: linearity requires no independence; covariance and conditional mixtures matter")
