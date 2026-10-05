"""Seeded discrete/continuous samples with exact CDF references; standard library."""
from bisect import bisect_right
from math import log1p, exp
import random


def geometric_trials(u, p):
    if not 0 < p <= 1 or not 0 <= u < 1:
        raise ValueError("require 0<p<=1 and0<=u<1")
    if p == 1:
        return 1
    # First k with 1-(1-p)^k >= u.
    import math
    return max(1, math.ceil(log1p(-u)/log1p(-p)))


if __name__ == "__main__":
    generator = random.Random(22022)
    N = 20000
    # The finite generator can return0: assign that endpoint to the first trial.
    geometric = sorted(geometric_trials(generator.random(), .25) for _ in range(N))
    print("CS branch: geometric trials, p=.25, N=20000")
    for t in (1, 3, 5, 10):
        empirical = bisect_right(geometric, t)/N
        exact = 1-.75**t
        print("t=%2d empirical CDF=%.6f exact=%.6f" % (t, empirical, exact))
    # AI branch uses Module17 integration to derive these analytic CDFs.
    exponential = sorted(-log1p(-generator.random())/2 for _ in range(N))
    normal = sorted(generator.gauss(0, 1) for _ in range(N))
    print("AI continuous branch: exponential rate2 and standard Gaussian")
    for t in (.25, .5, 1.):
        print("exponential t=%.2f empirical CDF=%.6f exact=%.6f" % (
            t, bisect_right(exponential, t)/N, 1-exp(-2*t)))
    from math import erf, sqrt
    for t in (-1., 0., 1.):
        print("Gaussian t=%+.1f empirical CDF=%.6f exact=%.6f" % (
            t, bisect_right(normal, t)/N, .5*(1+erf(t/sqrt(2)))))
    print("ECDF uses <= via bisect_right; a single trace is not an error theorem.")
