"""IID two-group percentile bootstrap and an exact exchangeability test."""
import itertools
import math
import random


def mean(xs):
    return math.fsum(xs)/len(xs)


def quantile(xs, u):
    ordered = sorted(xs)
    index = (len(xs)-1)*u
    lo = int(index)
    hi = min(lo+1, len(xs)-1)
    return ordered[lo]+(index-lo)*(ordered[hi]-ordered[lo])


if __name__ == "__main__":
    a, b = [2., 3., 4., 5.], [0., 1., 2., 3.]
    observed = mean(a)-mean(b)
    rng, replicates = random.Random(26026), 5000
    boot = [mean([rng.choice(a) for _ in a])-mean([rng.choice(b) for _ in b]) for _ in range(replicates)]
    lo, hi = quantile(boot, .025), quantile(boot, .975)
    print(f"IID groups: A={a}, B={b}; difference={observed:.6f}")
    print(f"seed=26026; percentile bootstrap B={replicates}, approximate interval=[{lo:.6f}, {hi:.6f}]")
    combined = a+b
    stats = []
    for indices in itertools.combinations(range(8), 4):
        chosen = set(indices)
        stats.append(mean([combined[i] for i in chosen])-mean([combined[i] for i in range(8) if i not in chosen]))
    extreme = sum(abs(t) >= abs(observed)-1e-12 for t in stats)
    print(f"Exact label permutations={len(stats)}; inclusive two-sided extreme={extreme}; p={extreme/len(stats):.6f}")
    print("Null: the two groups share an exchangeable distribution, or random assignment with a sharp no-effect null.")
    print("Equal means alone with unequal distributions do not justify unrestricted label exchangeability.")
    print("A small percentile bootstrap sample has no automatic exact 95% coverage guarantee.")
