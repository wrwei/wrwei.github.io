"""Euclidean projections with feasibility and variational checks; NumPy only."""
import numpy as np


def simplex_projection(v):
    v = np.asarray(v, dtype=float)
    if v.ndim != 1 or len(v) == 0 or not np.all(np.isfinite(v)):
        raise ValueError("a nonempty finite vector is required")
    ordered = np.sort(v)[::-1]
    thresholds = (np.cumsum(ordered) - 1.0) / np.arange(1, len(v) + 1)
    eligible = np.flatnonzero(ordered - thresholds > 0)
    theta = thresholds[eligible[-1]]
    return np.maximum(v - theta, 0.0), theta


if __name__ == "__main__":
    np.set_printoptions(precision=8, suppress=True)
    v = np.array([1.2, 0.4, -0.2])
    lower, upper = np.zeros(3), np.ones(3)
    box = np.clip(v, lower, upper)
    simplex, theta = simplex_projection(v)
    clip_then_normalise = box / box.sum()
    print("input:", v)
    print("box projection:", box)
    print("simplex projection:", simplex, "threshold:", f"{theta:.8f}")
    print("clip then normalise:", clip_then_normalise)
    print("squared distances: projection=%.8f shortcut=%.8f" % (
        np.sum((simplex-v)**2), np.sum((clip_then_normalise-v)**2)))
    assert np.all(simplex >= 0) and abs(simplex.sum()-1) < 1e-12
    assert np.sum((simplex-v)**2) < np.sum((clip_then_normalise-v)**2)
    vertices = np.eye(3)
    variational = (vertices-simplex) @ (v-simplex)
    print("(v-projection) dot (vertex-projection):", variational)
    assert np.max(variational) < 1e-12
    for vector in [np.array([-3., -2., -1.]), np.zeros(3), np.array([2., 2., 2.])]:
        p, t = simplex_projection(vector)
        print("input", vector, "->", p, "threshold", f"{t:.8f}")
        assert np.all(p >= 0) and abs(p.sum()-1) < 1e-12
    print("PASS: feasible nearest points; normalisation shortcut is not projection")
