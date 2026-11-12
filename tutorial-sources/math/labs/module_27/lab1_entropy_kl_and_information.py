"""Finite information measures in bits, with explicit support conventions."""
import math


def validate(p):
    if not p or any(not math.isfinite(x) or x < 0 for x in p) or not math.isclose(math.fsum(p), 1., abs_tol=1e-12, rel_tol=0.):
        raise ValueError("probabilities must be finite, nonnegative, and sum to one")


def entropy(p):
    validate(p)
    return -math.fsum(x*math.log2(x) for x in p if x > 0)


def cross_entropy(p, q):
    validate(p)
    validate(q)
    if len(p) != len(q):
        raise ValueError("same ordered alphabet required")
    if any(x > 0 and y == 0 for x, y in zip(p, q)):
        return math.inf
    return -math.fsum(x*math.log2(y) for x, y in zip(p, q) if x > 0)


def kl(p, q):
    return cross_entropy(p, q)-entropy(p)


if __name__ == "__main__":
    p, q = [.5, .3, .2], [.25, .5, .25]
    print(f"p={p}; q={q}; same ordered alphabet; units=bits")
    print(f"H(p)={entropy(p):.6f}; H(p,q)={cross_entropy(p,q):.6f}; KL(p||q)={kl(p,q):.6f}; KL(q||p)={kl(q,p):.6f}")
    assert abs(cross_entropy(p,q)-entropy(p)-kl(p,q)) < 1e-12
    print(f"KL([1,0]||[.5,.5])={kl([1.,0.],[.5,.5]):.6f}; reverse={kl([.5,.5],[1.,0.])}")
    joint = [.45, .05, .05, .45]
    independent = [.25]*4
    mi = kl(joint, independent)
    print(f"Fair binary input, independent flip probability.1: MI={mi:.6f}; H(Y|X)={entropy([.1,.9]):.6f}")
    print(f"H(X,Y)={entropy(joint):.6f}; H(X)+H(Y)-H(X,Y)={2-entropy(joint):.6f}")
    assert abs(mi-(1-entropy([.1,.9]))) < 1e-12
    code_p, lengths = [.5,.25,.25], [1,2,2]
    expected = math.fsum(x*l for x,l in zip(code_p,lengths))
    print(f"Prefix code0/10/11: expected length={expected:.6f}; entropy={entropy(code_p):.6f}")
