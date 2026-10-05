"""Counterexamples to universal modular division and checksum uniqueness."""
from math import gcd

def inverse(a, modulus):
    if modulus < 2:
        raise ValueError("Require modulus >= 2")
    if gcd(a, modulus) != 1:
        raise ValueError("Residue is not invertible")
    return pow(a, -1, modulus)

for a, modulus in [(3, 7), (2, 6), (5, 6), (0, 7)]:
    try:
        inv = inverse(a, modulus)
        assert a * inv % modulus == 1
        print(f"Inverse of {a} mod {modulus}: {inv}")
    except ValueError as error:
        print(f"Inverse of {a} mod {modulus}: rejected ({error})")
for a, b, modulus in [(4, 2, 6), (2, 1, 6)]:
    solutions = [x for x in range(modulus) if (a * x - b) % modulus == 0]
    assert bool(solutions) == (b % gcd(a, modulus) == 0)
    print(f"{a}x = {b} mod {modulus}: solutions {solutions}")
print("Illegal cancellation:", "2*1 mod 6 =", 2 * 1 % 6, "; 2*4 mod 6 =", 2 * 4 % 6)
assert (2 * 1 - 2 * 4) % 6 == 0 and (1 - 4) % 6 != 0

def checksum(values):
    if any(not isinstance(v, int) or v < 0 or v > 255 for v in values):
        raise ValueError("Values must be bytes")
    return sum(values) % 7

pairs = [([1, 2], [0, 3]), ([1, 2], [2, 1]), ([1, 2], [8, 2])]
for left, right in pairs:
    assert left != right and checksum(left) == checksum(right)
    print("Collision:", left, right, "; checksum =", checksum(left))
print("Different checksum proves a difference; equal checksum does not prove equal input or security.")
