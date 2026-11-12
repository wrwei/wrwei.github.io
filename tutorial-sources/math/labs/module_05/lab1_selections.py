"""Count ordered, unordered, and repeated choices over small explicit domains."""
from itertools import combinations, permutations, product
from math import comb, factorial


def main():
    binary = ["".join(bits) for bits in product("01", repeat=4)]
    assert len(binary) == 2 ** 4
    print("Length-four binary strings:", len(binary))
    print("Ordered two from ABC:", ["".join(p) for p in permutations("ABC", 2)])
    print("Unordered two from ABC:", ["".join(p) for p in combinations("ABC", 2)])
    for n, r in ((3, 2), (5, 0), (5, 3), (10, 3)):
        ordered = len(list(permutations(range(n), r)))
        unordered = len(list(combinations(range(n), r)))
        assert ordered == factorial(n) // factorial(n - r)
        assert unordered == comb(n, r)
        print(f"n={n}, r={r}: ordered={ordered}, unordered={unordered}")
    allocations = [(a, b, 5 - a - b) for a in range(6) for b in range(6 - a)]
    assert len(allocations) == comb(7, 2)
    print("Five identical tasks across three named workers:", len(allocations))
    print("First five allocations:", allocations[:5])


if __name__ == "__main__":
    main()
