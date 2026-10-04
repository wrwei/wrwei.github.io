"""Exact finite probability, conditional probability and a summation identity."""
from fractions import Fraction
outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]
event = [(a, b) for a, b in outcomes if a + b == 7]
condition = [(a, b) for a, b in outcomes if a == 1]
joint = [x for x in condition if sum(x) == 7]
print("P(sum=7):", Fraction(len(event), len(outcomes)))
print("P(sum=7 | first=1):", Fraction(len(joint), len(condition)))
for n in [0, 1, 5, 10]:
    total = sum(range(1, n + 1))
    assert total == n * (n + 1) // 2
    print("n:", n, "sum:", total)
