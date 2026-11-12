"""Prediction equivalence can be structural or restricted to observed records."""
import numpy as np

np.set_printoptions(precision=6, suppress=True)
celsius = np.array([0., 10., 20.])
X = np.column_stack((np.ones(3), celsius, 1.8*celsius + 32))
w = np.array([5., 2., -1.])
n = np.array([-32., -1.8, 1.])
alternative = w + 0.5*n
assert np.allclose(X@n, 0) and np.allclose(X@w, X@alternative)
print("Temperature weights / alternative:", w, alternative)
print("Training predictions:", X@w, X@alternative)
new = np.array([1., 30., 86.])
print("New valid temperature prediction:", new@w, new@alternative)
assert np.allclose(new@w, new@alternative)

categorical = np.column_stack((np.ones(3), np.eye(3)))
categorical_null = np.array([-1., 1., 1., 1.])
assert np.allclose(categorical@categorical_null, 0)
print("Intercept plus all one-hot columns rank:", np.linalg.matrix_rank(categorical), "of", categorical.shape[1])
print("One-hot null direction:", categorical_null)
assert np.linalg.matrix_rank(categorical[:, :3]) == 3

training = np.array([[1., 0., 0.], [1., 1., 1.]])
training_null = np.array([0., -1., 1.])
assert np.allclose(training@training_null, 0)
unseen = np.array([1., 2., 4.])
print("x and x squared: training change / unseen x=2 change:", training@training_null, unseen@training_null)
assert unseen@training_null == 2
print("A structural temperature identity generalises; a training-only polynomial coincidence does not.")
