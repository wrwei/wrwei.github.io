"""Repair a successful wrong broadcast and define the zero-vector policy explicitly."""
import numpy as np

predicted = np.array([1.0, 2.0, 3.0])
observed = np.array([[1.0], [2.0], [4.0]])
wrong = predicted - observed
paired = predicted[:, None] - observed
assert wrong.shape == (3, 3) and paired.shape == (3, 1)
print("Wrong broadcast shape / mean squared difference:", wrong.shape, round(float(np.mean(wrong**2)), 6))
print("Paired shape / mean squared difference:", paired.shape, round(float(np.mean(paired**2)), 6))
assert np.isclose(np.mean(paired**2), 1 / 3, rtol=1e-12, atol=1e-12)

def cosine(u, v):
    u, v = np.asarray(u, dtype=float), np.asarray(v, dtype=float)
    if u.ndim != 1 or v.ndim != 1 or u.shape != v.shape:
        raise ValueError("Require matching flat vector shapes")
    length_u, length_v = np.linalg.norm(u), np.linalg.norm(v)
    if length_u == 0 or length_v == 0:
        raise ValueError("Cosine is undefined for a zero vector")
    return float((u @ v) / (length_u * length_v))

zero, other = np.array([0.0, 0.0]), np.array([1.0, 2.0])
with np.errstate(invalid="ignore", divide="ignore"):
    bad = (zero @ other) / (np.linalg.norm(zero) * np.linalg.norm(other))
print("Unchecked zero-vector cosine:", float(bad))
assert np.isnan(bad)
for u, v in [([3, 4], [4, -3]), ([1, 0], [-1, 0]), ([0, 0], [1, 2]), ([1, 2], [1])]:
    try:
        print("Cosine:", u, v, "=", cosine(u, v))
    except ValueError as error:
        print("Rejected:", u, v, str(error))
print("Scope: small finite coordinates. Extreme floating magnitudes need further numerical handling.")
