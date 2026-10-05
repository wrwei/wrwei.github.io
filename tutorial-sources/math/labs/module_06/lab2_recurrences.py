"""Exact recurrences for powers of two; the multiplier counts identical children."""
from functools import cache


@cache
def cost(n, branches):
    if n == 1:
        return 1
    return branches * cost(n // 2, branches) + n


def main():
    print("n | T1(n) | T2(n) | T4(n)")
    for exponent in range(7):
        n = 2 ** exponent
        values = [cost(n, branches) for branches in (1, 2, 4)]
        assert values == [2 * n - 1, n * (exponent + 1), 2 * n * n - n]
        print(n, "|", " | ".join(map(str, values)))
    print("All bases T(1)=1, all non-leaf work=n, all child sizes=n/2.")
    print("Caching computes the numerical model; it is not the runtime of a real recursive algorithm.")


if __name__ == "__main__":
    main()
