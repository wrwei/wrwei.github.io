"""Finite-event Monte Carlo; optional continuous integration requires Module17."""
from math import sqrt, log
import random

if __name__ == "__main__":
    generator = random.Random(24242)
    hits = 0
    sum_square = 0.0
    for n in range(1, 10001):
        # A weighted finite event with total mass .3, represented by a threshold.
        hits += generator.random() < .3
        u = generator.random()
        sum_square += u*u
        if n in (100, 1000, 10000):
            estimate = hits/n
            plugin_se = sqrt(estimate*(1-estimate)/n)
            known_se = sqrt(.3*.7/n)
            radius = sqrt(log(2/.05)/(2*n))
            print("CS finite event N=%5d estimate=%.6f exact=.3 estimatedSE=%.6f modelSE=%.6f Hoeffding95%%radius=%.6f" % (
                n, estimate, plugin_se, known_se, radius))
            integral = sum_square/n
            print("AI integral x^2 on[0,1] N=%5d estimate=%.6f exact=1/3 modelSE=%.6f" % (
                n, integral, sqrt((4/45)/n)))
    print("Quadrupling N halves the IID standard error, not necessarily one realised error.")
    print("Monte Carlo sampling error differs from deterministic quadrature truncation error.")
