"""Exact denominators, selected populations, and a Simpson reversal."""
from fractions import Fraction as F
from itertools import product

if __name__ == "__main__":
    # Model masses represented by expected counts in a synthetic population.
    tp, fp, fn, tn = 900, 4950, 100, 94050
    sensitivity = F(tp, tp+fn)
    posterior = F(tp, tp+fp)
    print("P(+|D)=%s P(D|+)=%s" % (sensitivity, posterior))
    print("positive-only sample disease fraction:", posterior)
    print("population disease fraction:", F(tp+fn, tp+fp+fn+tn))
    assert posterior != sensitivity
    omega = list(product((0, 1), repeat=2))
    selected = [w for w in omega if w[0] or w[1]]
    pa = F(sum(w[0] for w in selected), len(selected))
    pb = F(sum(w[1] for w in selected), len(selected))
    joint = F(sum(w[0] and w[1] for w in selected), len(selected))
    print("independent source fair bits; keep A or B")
    print("selected P(A)=%s P(B)=%s P(A and B)=%s product=%s" % (pa, pb, joint, pa*pb))
    assert joint != pa*pb
    table = {"A": {"easy": (9, 10), "hard": (30, 100)},
             "B": {"easy": (80, 100), "hard": (2, 10)}}
    for name, groups in table.items():
        easy = F(*groups["easy"])
        hard = F(*groups["hard"])
        pooled = F(sum(r[0] for r in groups.values()), sum(r[1] for r in groups.values()))
        standardised = (easy+hard)/2
        print("system %s: easy=%s hard=%s pooled=%s common-half-mixture=%s" % (
            name, easy, hard, pooled, standardised))
    print("A is better in each stratum, worse pooled; the evaluation mixtures differ.")
    print("PASS: conditioning changes denominators and selection changes the target population")
