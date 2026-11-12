"""Direct solves, singular RHS distinctions, and sensitivity despite a nonzero determinant."""
import numpy as np

a = np.array([[3.0, 1.0], [1.0, 2.0]])
b = np.array([9.0, 8.0])
direct = np.linalg.solve(a, b)
via_inverse = np.linalg.inv(a) @ b
assert direct.shape == (2,) and via_inverse.shape == (2,)
assert np.allclose(direct, [2, 3], rtol=1e-12, atol=1e-12)
assert np.allclose(via_inverse, direct, rtol=1e-12, atol=1e-12)
print("Direct solve:", direct.round(6).tolist())
print("Inverse times RHS:", via_inverse.round(6).tolist())
print("Residual norms:", float(np.linalg.norm(a @ direct - b)), float(np.linalg.norm(a @ via_inverse - b)))
print("Both agree here; forming an inverse is unnecessary for solving one RHS.")

singular = np.array([[1.0, 2.0], [2.0, 4.0]])
for rhs in [np.array([3.0, 6.0]), np.array([3.0, 7.0])]:
    try:
        np.linalg.solve(singular, rhs)
    except np.linalg.LinAlgError:
        kind = "infinitely many: x+2y=3" if rhs[1] == 2 * rhs[0] else "inconsistent: second RHS is not twice first"
        print("Singular solve rejected:", rhs.tolist(), ";", kind)

sensitive = np.diag([1.0, 1e-12])
baseline_rhs = np.array([1.0, 1e-12])
changed_rhs = np.array([1.0, 1e-12 + 1e-9])
baseline, changed = np.linalg.solve(sensitive, baseline_rhs), np.linalg.solve(sensitive, changed_rhs)
assert np.allclose(baseline, [1, 1], rtol=1e-12, atol=1e-12)
assert np.allclose(changed, [1, 1001], rtol=1e-12, atol=1e-12)
print("Nonzero determinant:", float(np.linalg.det(sensitive)))
print("Baseline / perturbed solution:", baseline.round(6).tolist(), changed.round(6).tolist())
print("Small RHS change:", float(np.linalg.norm(changed_rhs - baseline_rhs)))
print("Changed-system residual:", float(np.linalg.norm(sensitive @ changed - changed_rhs)))
print("Invertibility and small residual do not guarantee insensitivity of the solution.")
