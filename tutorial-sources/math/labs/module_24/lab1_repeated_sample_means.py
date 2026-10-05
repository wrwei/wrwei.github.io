"""Repeated IID Bernoulli means: exact variance, finite-sample discreteness."""
from math import sqrt
import random

if __name__ == "__main__":
    generator = random.Random(24024)
    repeats = 3000
    for p in (.5, .01):
        for n in (20, 1000):
            means = [sum(generator.random() < p for _ in range(n))/n for _ in range(repeats)]
            empirical_mean = sum(means)/repeats
            empirical_sd = sqrt(sum((x-empirical_mean)**2 for x in means)/(repeats-1))
            exact_sd = sqrt(p*(1-p)/n)
            zeros = sum(x == 0 for x in means)/repeats
            within = sum(abs(x-p) <= 1.96*exact_sd for x in means)/repeats
            print("p=%.2f n=%4d mean=%.6f empiricalSD=%.6f exactSD=%.6f zeroFraction=%.6f exactPzero=%.6f" % (
                p, n, empirical_mean, empirical_sd, exact_sd, zeros, (1-p)**n))
            print("  fraction within1.96 known SD: %.6f (a finite check, not guaranteed95%%)" % within)
    print("Original observations stay Bernoulli; CLT concerns standardised sample means.")
    print("Rare p=.01,n20 is mostly zero and poorly represented by a smooth Gaussian.")
