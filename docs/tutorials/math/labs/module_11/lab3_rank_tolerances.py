"""An exact nonzero determinant and two numerical rank policies can coexist."""
from fractions import Fraction
import numpy as np

delta = Fraction("0.000000000001")
exact = [[Fraction(1), Fraction(1)], [Fraction(1), 1+delta]]
determinant = exact[0][0]*exact[1][1] - exact[0][1]*exact[1][0]
assert determinant == delta and determinant != 0
print("Exact determinant:", str(determinant), "exact rank: 2")
A = np.array([[1., 1.], [1., 1.+float(delta)]])
singular_values = np.linalg.svd(A, compute_uv=False)
print("Singular values:", [format(v, ".6e") for v in singular_values])
for tolerance in [1e-14, 1e-10]:
    rank = int(np.linalg.matrix_rank(A, tol=tolerance))
    print("Absolute tolerance / numerical rank:", tolerance, rank)
assert np.linalg.matrix_rank(A, tol=1e-14) == 2
assert np.linalg.matrix_rank(A, tol=1e-10) == 1
scaled = 1e6*A
print("Scaling by one million at absolute tolerance 1e-10:", np.linalg.matrix_rank(scaled, tol=1e-10))
assert np.linalg.matrix_rank(scaled, tol=1e-10) == 2
for label, matrix in [("A", A), ("scaled A", scaled)]:
    s = np.linalg.svd(matrix, compute_uv=False)
    relative_cutoff = 1e-10*s[0]
    print("Relative cutoff policy / rank:", label, int(np.linalg.matrix_rank(matrix, tol=relative_cutoff)))
    assert np.linalg.matrix_rank(matrix, tol=relative_cutoff) == 1
print("The cutoff is a numerical resolution policy, not an exact dependence proof.")
