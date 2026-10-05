"""Exhaustive checks over one small universe, not a general set-theoretic proof."""
from itertools import combinations, product


def subsets(items):
    return [set(part) for k in range(len(items) + 1) for part in combinations(items, k)]


def main():
    universe = {0, 1, 2}
    choices = subsets(sorted(universe))
    print("Power set:", [sorted(s) for s in choices])
    checks = 0
    for a, b, c in product(choices, repeat=3):
        assert a & (b | c) == (a & b) | (a & c)
        assert universe - (a | b) == (universe - a) & (universe - b)
        checks += 1
    print("Distributivity and De Morgan agree for", checks, "triples in this universe.")
    a, b = {0, 1}, {1, 2}
    print("A union B:", sorted(a | b), "intersection:", sorted(a & b))
    print("A minus B:", sorted(a - b), "B minus A:", sorted(b - a))
    print("{} is a dict; set() is an empty set.")
    print("General identities still require a proof for arbitrary membership.")


if __name__ == "__main__":
    main()
