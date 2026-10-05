"""Compare exact scalar derivatives with two finite-difference formulas."""
import math

def f(x):
    return math.exp(x*x)

x = 0.7
analytic = 2*x*f(x)
print(f"exp(x*x), x={x}, analytic derivative={analytic:.12f}")
print("h          forward          central          forward error     central error")
for h in [1e-1, 1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12, 1e-16]:
    forward = (f(x+h)-f(x))/h
    central = (f(x+h)-f(x-h))/(2*h)
    print(f"{h:.0e} {forward:16.10f} {central:16.10f} {abs(forward-analytic):16.8e} {abs(central-analytic):16.8e}")
    if h == 1e-4:
        assert abs(central-analytic) < 1e-6
        assert abs(central-analytic) < abs(forward-analytic)

# A constant offset leaves the real derivative unchanged but can make the
# output difference impossible to resolve in binary floating point.
offset = 1e16
shifted = ((offset+f(x+1e-4))-(offset+f(x-1e-4)))/(2e-4)
print("Derivative estimate after adding 1e16:", shifted)
assert shifted == 0.0 and analytic > 2
print("Inspect a range of h; neither smaller steps nor unchanged formulas guarantee accuracy.")
