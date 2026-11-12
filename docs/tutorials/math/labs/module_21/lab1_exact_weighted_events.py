"""Exact finite probability models and pairwise versus mutual independence."""
from fractions import Fraction as F
from itertools import product

if __name__ == "__main__":
    weights = {"HH": 1, "HT": 2, "TH": 3, "TT": 4}
    total = sum(weights.values())
    probability = lambda event: sum((F(weights[w], total) for w in event), F(0))
    A = {w for w in weights if w[0] == "H"}
    B = {w for w in weights if w[1] == "H"}
    print("normalised masses:", {w: str(F(n, total)) for w, n in weights.items()})
    print("P(A)=%s P(B)=%s P(intersection)=%s P(union)=%s" % (
        probability(A), probability(B), probability(A & B), probability(A | B)))
    print("P(A|B)=%s P(B|A)=%s" % (
        probability(A & B)/probability(B), probability(A & B)/probability(A)))
    assert probability(A | B) == probability(A)+probability(B)-probability(A & B)
    print("independent:", probability(A & B) == probability(A)*probability(B))
    omega = list(product((0, 1), repeat=2))
    events = [set(w for w in omega if w[0] == 1),
              set(w for w in omega if w[1] == 1),
              set(w for w in omega if w[0] ^ w[1] == 1)]
    p = lambda event: F(len(event), len(omega))
    for i, j in ((0, 1), (0, 2), (1, 2)):
        joint, factor = p(events[i] & events[j]), p(events[i])*p(events[j])
        print("pair %d,%d: joint=%s product=%s" % (i+1, j+1, joint, factor))
        assert joint == factor
    triple = p(events[0] & events[1] & events[2])
    factor = p(events[0])*p(events[1])*p(events[2])
    print("triple: joint=%s product=%s" % (triple, factor))
    assert triple != factor
    print("PASS: weighting matters; pairwise independence is not mutual independence")
