"""Uniform independent bucket choices: exact enumeration and a seeded sample."""
from fractions import Fraction
from itertools import product
from random import Random


def main():
    buckets, items = 4, 3
    outcomes = list(product(range(buckets), repeat=items))
    collisions = sum(len(set(outcome)) < items for outcome in outcomes)
    exact = Fraction(collisions, len(outcomes))
    no_collision_count = buckets * (buckets - 1) * (buckets - 2)
    assert exact == 1 - Fraction(no_collision_count, buckets ** items)
    print("Model: 3 named items choose independently and uniformly among 4 buckets.")
    print("Total outcomes:", len(outcomes), "collision outcomes:", collisions)
    print("Exact probability:", exact, "=", float(exact))
    rng = Random(2026)
    trials = 10000
    observed = 0
    for _ in range(trials):
        outcome = [rng.randrange(buckets) for _ in range(items)]
        observed += len(set(outcome)) < items
    estimate = observed / trials
    print(f"Seed=2026, trials={trials}, observed collision fraction={estimate:.4f}")
    print("A sampled fraction is not the exact probability or a collision guarantee.")


if __name__ == "__main__":
    main()
