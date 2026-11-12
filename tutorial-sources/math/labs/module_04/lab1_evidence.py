"""Successful finite checks support debugging; one valid counterexample refutes."""
from math import isqrt


def prime(n):
    return n >= 2 and all(n % divisor for divisor in range(2, isqrt(n) + 1))


def main():
    for n in range(9):
        actual = sum(range(n + 1))
        expected = n * (n + 1) // 2
        assert actual == expected
        print(f"n={n}: sum={actual}, formula={expected}")
    first_failure = next(n for n in range(51) if not prime(n * n + n + 41))
    value = first_failure * first_failure + first_failure + 41
    assert first_failure == 40 and value == 41 * 41
    print("Polynomial prime claim passes n=0 through 39.")
    print(f"Counterexample n={first_failure}: value={value}=41*41")
    print("The sum checks cover n=0..8; its general proof is separate.")


if __name__ == "__main__":
    main()
