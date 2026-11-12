"""Enumerate finite cases to check logical equivalence and set operations."""
from itertools import product
for p, q in product([False, True], repeat=2):
    implication = (not p) or q
    contrapositive = q or (not p)  # (not q) implies (not p)
    assert implication == contrapositive
    assert (not (p and q)) == ((not p) or (not q))
    print(int(p), int(q), "implies:", int(implication))
available = {1, 2, 3}
requested = {2, 3, 4}
print("intersection:", sorted(available & requested))
print("union:", sorted(available | requested))
print("missing:", sorted(requested - available))
