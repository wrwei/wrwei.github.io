"""Asymptotic decay does not require monotone Euclidean norm decay."""
import numpy as np
cases = [
    ("symmetric stable", np.diag([0.5, -0.8]), np.array([1., 1.])),
    ("unstable excited", np.diag([1.2, 0.5]), np.array([1., 1.])),
    ("unstable but unexcited mode", np.diag([1.2, 0.5]), np.array([0., 1.])),
    ("defective stable transient", np.array([[0.5, 3.], [0., 0.5]]), np.array([0., 1.])),
    ("unit defective growth", np.array([[1., 1.], [0., 1.]]), np.array([0., 1.])),
    ("rotation unit modulus", np.array([[0., -1.], [1., 0.]]), np.array([1., 0.])),
]
for label, B, initial in cases:
    radius = max(abs(np.linalg.eigvals(B)))
    print(label, "spectral radius:", float(radius))
    for step in [0, 1, 2, 5, 10, 20]:
        value = np.linalg.matrix_power(B, step)@initial
        print(" k / vector / norm:", step, [round(float(v), 9) for v in value], format(np.linalg.norm(value), ".6e"))
    if label == "defective stable transient":
        assert np.linalg.norm(B@initial) > np.linalg.norm(initial)
        assert np.linalg.norm(np.linalg.matrix_power(B, 20)@initial) < 0.001
    if label == "unit defective growth":
        assert np.allclose(np.linalg.matrix_power(B, 20)@initial, [20, 1])
print("Global asymptotic decay concerns every initial state, not one unexcited trajectory.")
