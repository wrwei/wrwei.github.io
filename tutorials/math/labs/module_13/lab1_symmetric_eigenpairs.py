"""Check eigenpairs and subspaces rather than demanding one vector sign."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)
A = np.array([[2., 1.], [1., 2.]])
values, vectors = np.linalg.eigh(A)
hand = np.array([[1., 1.], [-1., 1.]])/np.sqrt(2)
assert np.allclose(values, [1., 3.])
assert np.allclose(A@vectors, vectors*values)
assert np.allclose(vectors.T@vectors, np.eye(2))
assert np.allclose(vectors@np.diag(values)@vectors.T, A)
print("Eigenvalues:", values)
print("Unit eigenvectors in columns:", vectors.tolist())
print("Absolute alignment with hand basis:", np.abs(hand.T@vectors).tolist())
for label, vector in [("difference", np.array([1., -1.])), ("sum", np.array([1., 1.]))]:
    quotient = vector@A@vector/(vector@vector)
    print("Rayleigh quotient:", label, quotient)
    assert quotient == (1 if label == "difference" else 3)
angle = np.pi/5
rotation = np.array([[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]])
identity = np.eye(2)
assert np.allclose(identity@rotation, rotation)
assert np.allclose(rotation.T@rotation, np.eye(2))
print("Repeated eigenvalue identity admits the rotated orthonormal basis:", True)
print("Positive-definite condition ratio:", values[-1]/values[0])
