"""Enumerate Boolean valuations; establish only the displayed equivalences."""
from itertools import product


def implies(p, q):
    return (not p) or q


def main():
    print("p q | not p | p and q | p or q | p -> q | q -> p")
    for p, q in product((False, True), repeat=2):
        values = (p, q, not p, p and q, p or q, implies(p, q), implies(q, p))
        print(" ".join(str(int(v)) for v in values))
        assert implies(p, q) == implies(not q, not p)
        assert (not (p and q)) == ((not p) or (not q))
        assert (not (p or q)) == ((not p) and (not q))
    print("Contrapositive and both De Morgan laws: all 4 valuations agree.")
    print("Converse mismatch at p=False, q=True:", implies(False, True), implies(True, False))
    print("Python non-Boolean example: 'ready' or '' =", repr("ready" or ""))


if __name__ == "__main__":
    main()
