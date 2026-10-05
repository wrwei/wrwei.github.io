"""A unique fitted vector may have an affine family of minimising weights."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)
x = np.array([0., 1., 2.])
X = np.column_stack((np.ones(3), x))
y = np.array([1., 2., 2.])
Q, R = np.linalg.qr(X, mode="reduced")
w_qr = np.linalg.solve(R, Q.T@y)
w_library, returned_residuals, rank, values = np.linalg.lstsq(X, y, rcond=None)
residual = y-X@w_qr
assert np.allclose(w_qr, [7/6, 1/2]) and np.allclose(w_qr, w_library)
assert np.allclose(X.T@residual, 0)
print("X / Q / R shapes:", X.shape, Q.shape, R.shape)
print("QR / library weights:", w_qr, w_library)
print("Fitted values / residual:", X@w_qr, residual)
print("Residual sum of squares:", residual@residual)
print("Normal-equation check:", np.allclose(X.T@residual, 0))

duplicate = np.column_stack((np.ones(3), x, x))
w_min, library_residuals, duplicate_rank, _ = np.linalg.lstsq(duplicate, y, rcond=None)
null = np.array([0., -1., 1.])
alternative = w_min + 2*null
assert np.allclose(w_min, [7/6, 1/4, 1/4])
assert np.allclose(duplicate@alternative, duplicate@w_min)
assert np.isclose(w_min@null, 0)
assert np.allclose(np.linalg.pinv(duplicate)@y, w_min)
print("Duplicate design rank / minimum-norm weights:", duplicate_rank, w_min)
print("Alternative weights / same fit:", alternative, np.allclose(duplicate@alternative, duplicate@w_min))
print("Squared norms:", w_min@w_min, alternative@alternative)
print("Rank-deficient returned residuals:", library_residuals.tolist())
print("Explicit rank-deficient SSE:", np.linalg.norm(y-duplicate@w_min)**2)
assert library_residuals.size == 0 and np.linalg.norm(y-duplicate@w_min) > 0
print("An empty library residual array does not assert a zero actual residual.")
