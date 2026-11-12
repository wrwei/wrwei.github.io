"""Distinguish named positions from repeated labels and preserve sampling weights."""
from collections import Counter
from fractions import Fraction
from itertools import combinations, permutations
from math import factorial


def main():
    labels = ("A", "A", "B")
    raw = list(permutations(labels))
    unique = sorted({"".join(outcome) for outcome in raw})
    assert len(raw) == 6 and len(unique) == factorial(3) // factorial(2)
    print("Named-position permutations:", len(raw))
    print("Distinct label strings:", unique, "count=", len(unique))
    selected = Counter("".join(sorted(pair)) for pair in combinations(labels, 2))
    print("Uniform pair of named positions; label multiplicities:", dict(sorted(selected.items())))
    total = sum(selected.values())
    for outcome, count in sorted(selected.items()):
        print(" ", outcome, "probability=", Fraction(count, total))
    print("Two possible label outcomes are not automatically equally likely.")
    print("Repair the count by defining whether positions, records, or labels are distinct.")


if __name__ == "__main__":
    main()
