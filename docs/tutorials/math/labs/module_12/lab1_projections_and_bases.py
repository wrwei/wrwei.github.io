"""Projection depends on the inner product; orthonormalisation preserves span."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)

y = np.array([3., 2.])
u = np.array([1., 1.])
coefficient = (u@y)/(u@u)
projection = coefficient*u
residual = y-projection
assert np.allclose(projection, [2.5, 2.5]) and np.isclose(u@residual, 0)
print("Euclidean coefficient / projection / residual:", coefficient, projection, residual)
weights = np.array([4., 1.])
weighted_coefficient = (u@(weights*y))/(u@(weights*u))
weighted_residual = y-weighted_coefficient*u
print("Weighted coefficient / residual:", weighted_coefficient, weighted_residual)
print("Weighted / Euclidean residual dot:", u@(weights*weighted_residual), u@weighted_residual)
assert np.isclose(weighted_coefficient, 2.8) and np.isclose(u@(weights*weighted_residual), 0)

def modified_gram_schmidt(A, tolerance=1e-12):
    Q = np.zeros_like(A, dtype=float)
    R = np.zeros((A.shape[1], A.shape[1]))
    for j in range(A.shape[1]):
        remaining = A[:, j].astype(float).copy()
        for i in range(j):
            R[i, j] = Q[:, i]@remaining
            remaining -= R[i, j]*Q[:, i]
        R[j, j] = np.linalg.norm(remaining)
        if R[j, j] <= tolerance:
            raise ValueError("Dependent or unresolved column: do not normalise zero")
        Q[:, j] = remaining/R[j, j]
    return Q, R

A = np.array([[1., 1.], [1., 0.], [0., 1.]])
Q, R = modified_gram_schmidt(A)
print("Q:", Q.tolist())
print("R:", R.tolist())
print("Orthogonality / reconstruction checks:", np.allclose(Q.T@Q, np.eye(2)), np.allclose(Q@R, A))
assert np.allclose(Q.T@Q, np.eye(2)) and np.allclose(Q@R, A)
try:
    modified_gram_schmidt(np.ones((3, 2)))
except ValueError as error:
    print("Duplicate-column guard:", error)
else:
    raise AssertionError("A zero remainder must not be normalised")
