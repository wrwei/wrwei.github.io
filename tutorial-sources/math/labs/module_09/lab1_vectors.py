"""Loop-based vector calculations checked against NumPy on small real coordinates."""
from math import sqrt
import numpy as np

def dot(u, v):
    if len(u) != len(v):
        raise ValueError("Coordinate lengths must agree")
    return sum(a * b for a, b in zip(u, v))

def norm(u, kind):
    if kind == 1:
        return sum(abs(x) for x in u)
    if kind == 2:
        return sqrt(dot(u, u))
    if kind == "inf":
        return max((abs(x) for x in u), default=0)
    raise ValueError("This lab supports norms 1, 2, inf")

u, v = (3, 4), (4, -3)
print("u, v:", u, v)
print("Loop / NumPy dot:", dot(u, v), float(np.array(u) @ np.array(v)))
for kind in (1, 2, "inf"):
    reference = np.linalg.norm(np.array(u, dtype=float), ord=np.inf if kind == "inf" else kind)
    assert np.isclose(norm(u, kind), reference, rtol=1e-12, atol=1e-12)
    print("Norm", kind, ":", norm(u, kind), "; NumPy:", float(reference))
p, q = (1, 2), (4, 6)
displacement = tuple(b - a for a, b in zip(p, q))
print("Displacement q-p / Euclidean distance:", displacement, norm(displacement, 2))
unit = tuple(x / norm(u, 2) for x in u)
assert np.isclose(norm(unit, 2), 1, rtol=1e-12, atol=1e-12)
print("Unit direction of u:", unit)
direction = (1, 0)
projection = tuple(dot((2, 3), direction) * x for x in direction)
print("Component of (2,3) along the first unit axis:", projection)
try:
    dot([1, 2], [3])
except ValueError as error:
    print("Rejected:", error)
print("Tolerances compare numerical values; the length check prevents silent zip truncation.")
