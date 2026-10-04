"""Separate text from bytes, and approximate numbers from decimal arithmetic."""
from decimal import Decimal
from math import isclose

text = "A中"
encoded = text.encode("utf-8")
print("code points:", len(text), "bytes:", len(encoded), "hex:", encoded.hex())
assert encoded.decode("utf-8") == text
print("float:", 0.1 + 0.2, "exact equality:", 0.1 + 0.2 == 0.3)
assert isclose(0.1 + 0.2, 0.3, rel_tol=1e-12, abs_tol=1e-12)
exact = Decimal("0.1") + Decimal("0.2")
print("decimal:", exact)
assert exact == Decimal("0.3")
try:
    encoded[:2].decode("utf-8")
except UnicodeDecodeError:
    print("truncated UTF-8 rejected")
