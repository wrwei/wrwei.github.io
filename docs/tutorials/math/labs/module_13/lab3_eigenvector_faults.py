"""Signs and repeated eigenspaces are ambiguous; symmetry is a real contract."""
import numpy as np
A = np.array([[2., 1.], [1., 2.]])
values, vectors = np.linalg.eigh(A)
flipped = vectors.copy()
flipped[:, 0] *= -1
print("Direct vector equality after sign flip:", np.allclose(vectors, flipped))
print("First eigenspace projector equality:", np.allclose(np.outer(vectors[:, 0], vectors[:, 0]), np.outer(flipped[:, 0], flipped[:, 0])))
assert np.allclose(A@flipped, flipped*values)

J = np.array([[1., 1.], [0., 1.]])
j_values, j_vectors = np.linalg.eig(J)
print("Defective eigenvalues:", j_values.tolist())
print("Reported vector-matrix rank at tolerance 1e-12:", np.linalg.matrix_rank(j_vectors, tol=1e-12))
print("Exact eigenspace constraint from (J-I)v=0: v2=0; dimension one")
assert np.linalg.matrix_rank(j_vectors, tol=1e-12) == 1
assert np.array_equal(J-np.eye(2), [[0., 1.], [0., 0.]])
wrong_values, wrong_vectors = np.linalg.eigh(J)
wrong_residual = np.linalg.norm(J@wrong_vectors-wrong_vectors*wrong_values)
print("Misused eigh eigenpair residual on original J:", wrong_residual)
assert wrong_residual > 0.5
print("Symmetry guard:", np.array_equal(J, J.T))
assert not np.array_equal(J, J.T)

rotation = np.array([[0., -1.], [1., 0.]])
r_values, r_vectors = np.linalg.eig(rotation)
print("Rotation eigenvalues:", [str(v) for v in r_values])
assert np.allclose(rotation@r_vectors, r_vectors*r_values)
assert np.allclose(np.abs(r_values), 1)
print("No real eigenbasis for a quarter-turn; complex eigenpairs are valid, not a solver failure.")
