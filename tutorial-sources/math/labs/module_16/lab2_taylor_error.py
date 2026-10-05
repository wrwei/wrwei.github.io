"""Finite log Taylor polynomials with a theorem-based error certificate."""
import math

def log_taylor(x, centre, order):
    displacement = x-centre
    return math.log1p(centre)+sum(
        (-1)**(k-1)*displacement**k/(k*(1+centre)**k)
        for k in range(1, order+1)
    )

print("ln(1+x): polynomial and Lagrange bound on the centre-to-input interval")
print("centre x     order   actual error      certified bound")
for centre, x in [(0.0, 0.2), (0.0, -0.2), (0.5, 0.7), (0.5, -0.2)]:
    for order in [1, 2, 3, 5]:
        approximation = log_taylor(x, centre, order)
        error = abs(math.log1p(x)-approximation)
        # |f^(n+1)| <= n!/(1+min(centre,x))^(n+1).
        denominator = 1+min(centre, x)
        bound = abs(x-centre)**(order+1)/((order+1)*denominator**(order+1))
        print(f"{centre:4.1f} {x:4.1f} {order:5d} {error:16.8e} {bound:16.8e}")
        assert error <= bound+1e-14

try:
    math.log1p(-1.0)
except ValueError:
    print("x=-1 is outside the real log domain; Taylor formulas do not repair that boundary.")
print("A valid bound may be conservative, especially far from the centre.")
