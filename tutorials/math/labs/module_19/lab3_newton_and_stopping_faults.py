"""Singular or indefinite curvature and small gradients need qualified handling."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)

H = np.diag([2.0,0.0])
b = np.array([2.0,0.0])
x = np.array([0.0,5.0])
gradient = H@x-b
try:
    np.linalg.solve(H, -gradient)
except np.linalg.LinAlgError:
    print("Singular Newton system: direct solve has no unique direction.")
direction, *_ = np.linalg.lstsq(H, -gradient, rcond=1e-12)
next_x = x+direction
print("Minimum-norm direction / resulting minimiser:", direction, next_x)
assert np.allclose(next_x, [1,5])  # Flat coordinate is preserved, not forced to zero.
print("Nonunique minima: first coordinate one, any second coordinate.")

def f(t):
    return t**4-3*t*t
t = 0.1
g, curvature = 4*t**3-6*t, 12*t*t-6
newton_direction = -g/curvature
print("Nonconvex Newton direction / gradient-dot-direction:", newton_direction, g*newton_direction)
print("Objective before / raw Newton step:", f(t), f(t+newton_direction))
assert g*newton_direction > 0 and f(t+newton_direction) > f(t)
# Replace a non-descent direction by -gradient; backtrack with explicit Armijo c.
descent, alpha, c = -g, 1.0, 1e-4
for _ in range(50):
    if f(t+alpha*descent) <= f(t)+c*alpha*g*descent:
        break
    alpha *= 0.5
else:
    raise RuntimeError("No accepted finite backtracking step")
print("Safeguarded step / objective:", alpha, f(t+alpha*descent))
assert f(t+alpha*descent) < f(t)

# Zero gradient is not sufficient for a nonconvex minimum.
print("Saddle x^2-y^2 at zero: gradient zero, value along (0,0.1) =", -0.1**2)
assert -0.1**2 < 0

coefficient, location, target = 1e-12, 0.0, 100.0
small_gradient = 2*coefficient*(location-target)
mu = 2*coefficient
gradient_tolerance = 1e-6
print("Scaled objective gradient / tolerance:", small_gradient, gradient_tolerance)
print("Naive gradient test passes / solution error:", abs(small_gradient)<gradient_tolerance, abs(location-target))
print("Strong-convexity error certificate ||gradient||/mu:", abs(small_gradient)/mu)
assert abs(small_gradient) < gradient_tolerance and abs(location-target) == 100
print("For distance tolerance 0.01, sufficient gradient threshold:", mu*0.01)
print("State which quantity termination certifies; objective scaling changes gradient thresholds.")
