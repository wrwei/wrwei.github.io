"""Euclid and extended Euclid for nonnegative integer inputs."""
from math import gcd

def euclid_trace(a, b):
    if a < 0 or b < 0:
        raise ValueError("This lab uses nonnegative integers")
    rows = []
    while b:
        q, r = divmod(a, b)
        rows.append((a, b, q, r))
        a, b = b, r
    return a, rows

def extended_gcd(a, b):
    if a < 0 or b < 0:
        raise ValueError("This lab uses nonnegative integers")
    old_r, r = a, b
    old_x, x, old_y, y = 1, 0, 0, 1
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_x, x = x, old_x - q * x
        old_y, y = y, old_y - q * y
    return old_r, old_x, old_y

value, rows = euclid_trace(252, 105)
for a, b, q, r in rows:
    print(f"{a} = {q}*{b} + {r}")
print("Last nonzero remainder / gcd:", value)
for a, b in [(252, 105), (12, 18), (0, 7), (9, 0), (0, 0)]:
    d, x, y = extended_gcd(a, b)
    assert d == gcd(a, b) and a * x + b * y == d
    print(f"a={a}, b={b}: gcd={d}, x={x}, y={y}; a*x+b*y={a*x+b*y}")
print("The (0,0) gcd is zero by software convention; it has no positive greatest common divisor.")
