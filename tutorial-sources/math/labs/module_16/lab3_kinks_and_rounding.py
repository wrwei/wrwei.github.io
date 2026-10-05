"""A symmetric average at a kink and a vanishing input perturbation."""
import math

functions = [("absolute value", abs), ("ReLU", lambda x: max(0.0, x))]
for name, f in functions:
    print(name, "at zero: h, left quotient, right quotient, central estimate")
    for h in [0.1, 0.001, 1e-6]:
        left = (f(-h)-f(0.0))/(-h)
        right = (f(h)-f(0.0))/h
        central = (f(h)-f(-h))/(2*h)
        print(h, left, right, central)
        assert left != right
        assert central == (left+right)/2
print("A stable central estimate at zero does not create a derivative at a kink.")

x, h = 1.0, 1e-16
stored = x+h
forward = (stored*stored-x*x)/h
print("Nominal / actual positive input step:", h, stored-x)
print("Square forward estimate / analytic derivative:", forward, 2*x)
assert stored == x and forward == 0.0
reasonable = 1e-4
central = ((x+reasonable)**2-(x-reasonable)**2)/(2*reasonable)
assert abs(central-2) < 1e-10
print("Square central estimate with h=1e-4:", central)

# Interior stationarity is not sufficient to establish a minimum.
print("Stationary examples at zero: x^2 minimum, -x^2 maximum, x^3 neither.")
assert (-0.1)**3 < 0 < 0.1**3
