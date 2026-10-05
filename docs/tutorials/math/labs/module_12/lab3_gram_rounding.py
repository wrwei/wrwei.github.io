"""Forming a Gram matrix can erase a weak direction; QR cannot cure noisy data."""
import numpy as np
np.set_printoptions(precision=9, suppress=True)
delta = 1e-8
X = np.array([[1., 1.], [1., 1.+delta], [1., 1.-delta]])
truth = np.array([1., 2.])
y = X@truth
gram = X.T@X
Q, R = np.linalg.qr(X, mode="reduced")
w_qr = np.linalg.solve(R, Q.T@y)
w_library, _, rank, _ = np.linalg.lstsq(X, y, rcond=None)
print("Rounded Gram matrix:", gram.tolist())
print("QR / library weights:", w_qr, w_library)
print("Library rank / condition number of X:", rank, format(np.linalg.cond(X), ".6e"))
assert rank == 2 and np.allclose(w_qr, truth, atol=1e-6)
try:
    w_normal = np.linalg.solve(gram, X.T@y)
except np.linalg.LinAlgError:
    print("Normal equations: singular after Gram rounding")
else:
    print("Normal-equation weights / coefficient error:", w_normal, np.linalg.norm(w_normal-truth))
perturbed = y + np.array([0., delta, -delta])
changed = np.linalg.solve(R, Q.T@perturbed)
print("Target perturbation norm:", format(np.linalg.norm(perturbed-y), ".6e"))
print("QR weights after target perturbation:", changed)
print("Weight change norm:", format(np.linalg.norm(changed-w_qr), ".6e"))
print("Perturbed residual norm:", format(np.linalg.norm(perturbed-X@changed), ".6e"))
assert np.linalg.norm(changed-w_qr) > 1
assert np.linalg.norm(perturbed-X@changed) < 1e-12
print("A stable algorithm avoids avoidable Gram damage; a tiny residual does not guarantee insensitive coefficients.")
