"""Finite samples suggest behaviour; exact formulas supply the arguments."""
from fractions import Fraction

for n in [1, 2, 10, 100]:
    print("n / 1/n / alternating / geometric:", n, str(Fraction(1, n)), (-1)**n, format(0.5**n, ".6e"))
for terms in [1, 2, 4, 10]:
    partial = sum((Fraction(1, 2)**k for k in range(terms)), Fraction(0))
    remainder = 2*Fraction(1, 2)**terms
    assert partial == 2-remainder
    print("Geometric terms / partial / exact tail:", terms, str(partial), str(remainder))

prefix_end = 100
def candidate_zero(n):
    return Fraction(1, n)
def candidate_two(n):
    return Fraction(1, n) if n <= prefix_end else Fraction(2)
def candidate_oscillation(n):
    return Fraction(1, n) if n <= prefix_end else Fraction((-1)**n)
assert all(candidate_zero(n) == candidate_two(n) == candidate_oscillation(n) for n in range(1, 101))
print("Three sequences share their first 100 terms.")
for n in [100, 101, 102]:
    print("n / true-zero / delayed-two / delayed-oscillation:", n, str(candidate_zero(n)), str(candidate_two(n)), str(candidate_oscillation(n)))
print("The shared finite prefix cannot establish a common infinite-time limit.")
