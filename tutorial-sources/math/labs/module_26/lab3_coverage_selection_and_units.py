"""Coverage enumeration and deliberately invalid selection/unit shortcuts."""
import math
import random


def coverage(n, p, method):
    total = 0.
    for k in range(n+1):
        estimate = k/n
        radius = math.sqrt(math.log(40)/(2*n)) if method == "Hoeffding" else 1.959963984540054*math.sqrt(estimate*(1-estimate)/n)
        if estimate-radius <= p <= estimate+radius:
            total += math.comb(n, k)*p**k*(1-p)**(n-k)
    return total


if __name__ == "__main__":
    for p in (.5, .01):
        for method in ("Wald plug-in", "Hoeffding"):
            print(f"Exact model coverage n=20, p={p:.2f}, {method} nominal95%: {coverage(20,p,method):.6f}")
    rng = random.Random(26028)
    candidates, n_val, n_test = 50, 100, 2000
    val = [sum(rng.random() < .5 for _ in range(n_val))/n_val for _ in range(candidates)]
    winner = max(range(candidates), key=val.__getitem__)
    test = sum(rng.random() < .5 for _ in range(n_test))/n_test
    print(f"50 identical population-accuracy .5 candidates: selected validation={val[winner]:.6f}; independent untouched test={test:.6f}")
    print("Calling selected validation a final test is invalid. Repeatedly selecting on the final test creates the same problem.")
    clusters, copies, p = 100, 10, .3
    print(f"Benchmark with {clusters} independent Bernoulli subjects, {copies} copied rows each:")
    print(f"wrong row SE={math.sqrt(p*(1-p)/(clusters*copies)):.6f}; correct subject SE={math.sqrt(p*(1-p)/clusters):.6f}")
    print("Repair: keep subject groups intact in splitting/resampling, use the subject as the independent unit, and predefine the comparison.")
    observed_difference, n, sigma = .01, 1000000, 1.
    z = observed_difference*math.sqrt(n)/sigma
    print(f"Known-sigma Gaussian mean test: effect={observed_difference:.3f}, n={n}, z={z:.1f}, two-sided p={math.erfc(abs(z)/math.sqrt(2)):.3e}")
    print("A small p-value does not make this .01-unit effect practically large or establish causality.")
