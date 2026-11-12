"""Exact binomial/geometric tables; numerical Poisson partial sums."""
from fractions import Fraction as F
from math import comb, exp, factorial

if __name__ == "__main__":
    n, p = 5, F(2, 5)
    masses = [F(comb(n, k))*p**k*(1-p)**(n-k) for k in range(n+1)]
    cumulative = F(0)
    for k, mass in enumerate(masses):
        cumulative += mass
        print("binomial k=%d pmf=%s cdf=%s" % (k, mass, cumulative))
    assert cumulative == 1
    print("binomial P(X>=3)=%s = %.8f" % (sum(masses[3:]), float(sum(masses[3:]))))
    p = F(1, 4)
    K = 10
    partial = sum((p*(1-p)**(k-1) for k in range(1, K+1)), F(0))
    tail = (1-p)**K
    print("geometric trials support starts at1: sum1..10=%s remaining=%s" % (partial, tail))
    assert partial+tail == 1
    print("geometric P(X>3)=%s" % ((1-p)**3))
    rate = 2.0
    for K in (5, 10, 20):
        partial = sum(exp(-rate)*rate**k/factorial(k) for k in range(K+1))
        print("Poisson lambda=2 sum0..%d=%.12f remainder=%.3e" % (K, partial, 1-partial))
    print("PASS: finite normalisation exact; an infinite table needs an explicit tail")
