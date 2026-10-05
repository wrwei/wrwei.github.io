"""Measured scope, a borderline recurrence, and aggregate doubling-array costs."""
from fractions import Fraction
from time import perf_counter_ns


def measure(call):
    best = None
    for _ in range(7):
        start = perf_counter_ns()
        call()
        elapsed = perf_counter_ns() - start
        best = elapsed if best is None else min(best, elapsed)
    return best


def append_cost(m):
    storage, size, copies, writes = [None], 0, 0, 0
    for value in range(m):
        if size == len(storage):
            larger = [None] * (2 * len(storage))
            for i in range(size):
                larger[i] = storage[i]
                copies += 1
            storage = larger
        storage[size] = value
        writes += 1
        size += 1
    assert storage[:size] == list(range(m))
    assert m == 0 or copies + writes < 3 * m
    return copies, writes


def main():
    print("Timing scope: the query reads the first entry; setup creates n entries.")
    for n in (1000, 4000):
        items = list(range(n))
        query_only = measure(lambda: items[0] == 0)
        with_setup = measure(lambda: list(range(n))[0] == 0)
        print(f"n={n}: one comparison; query-only best={query_only} ns; including setup best={with_setup} ns")
    print("Times vary by run/machine; no asymptotic claim follows from these four measurements.")
    print("Borderline: T(2^h)=2*T(2^(h-1))+2^h/h, T(1)=1")
    total, harmonic = Fraction(1), Fraction(0)
    for h in range(1, 6):
        n = 2 ** h
        total = 2 * total + Fraction(n, h)
        harmonic += Fraction(1, h)
        assert total == n * (1 + harmonic)
        print(f"h={h}, n={n}: T/n={total/n}; exact=1+H_h")
    print("The basic balanced f(n)=Theta(n) case does not apply to n/log2(n).")
    for m in (0, 1, 2, 3, 4, 5, 8, 9, 16, 17):
        copies, writes = append_cost(m)
        print(f"appends={m}: copies={copies}, writes={writes}, charged total={copies+writes}")
    print("Charge model counts copies+writes, excluding allocation/initialisation costs.")


if __name__ == "__main__":
    main()
