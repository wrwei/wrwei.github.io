"""Finite differences check stated analytic vector derivatives at smooth points."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)

def F(z):
    x, y = z
    return np.array([x*x*y, np.sin(x)+y*y])

point = np.array([0.7, -0.4])
x, y = point
J = np.array([[2*x*y, x*x], [np.cos(x), 2*y]])
h = 1e-5
basis = np.eye(2)
numerical_J = np.column_stack([(F(point+h*e)-F(point-h*e))/(2*h) for e in basis])
print("Point / function value:", point, F(point))
print("Analytic Jacobian (outputs by inputs):\n", J)
print("Finite-difference Jacobian:\n", numerical_J)
print("Jacobian maximum error:", np.max(np.abs(J-numerical_J)))
assert J.shape == (2, 2) and np.allclose(J, numerical_J, atol=1e-9, rtol=0)

direction = np.array([0.6, 0.8])
directional = (F(point+h*direction)-F(point-h*direction))/(2*h)
print("JVP / directional difference:", J@direction, directional)
assert np.allclose(J@direction, directional, atol=1e-9, rtol=0)

def loss(z):
    return z[0]**2*z[1]+np.exp(z[1])
def grad(z):
    return np.array([2*z[0]*z[1], z[0]**2+np.exp(z[1])])
H = np.array([[2*y, 2*x], [2*x, np.exp(y)]])
numerical_grad = np.array([(loss(point+h*e)-loss(point-h*e))/(2*h) for e in basis])
numerical_H = np.column_stack([(grad(point+h*e)-grad(point-h*e))/(2*h) for e in basis])
print("Scalar gradient:", grad(point))
print("Hessian:\n", H)
print("Gradient / Hessian maximum errors:", np.max(np.abs(grad(point)-numerical_grad)), np.max(np.abs(H-numerical_H)))
assert np.allclose(grad(point), numerical_grad, atol=1e-9, rtol=0)
assert np.allclose(H, numerical_H, atol=1e-9, rtol=0)

# Axis partials alone do not imply continuity, hence do not imply differentiability.
def bad(z):
    a, b = z
    return a*b/(a*a+b*b) if a*a+b*b else 0.0
print("Origin axis samples / diagonal samples:")
for t in [1e-1, 1e-3, 1e-6]:
    print(t, bad([t, 0]), bad([0, t]), bad([t, t]))
    assert bad([t, 0]) == 0 and bad([0, t]) == 0 and bad([t, t]) == 0.5
print("Smooth derivative checks illustrate the analytic claims; axis samples cannot certify total differentiability.")
