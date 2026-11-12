"""Composite quadrature on smooth functions with analytic integrals."""
import math

def trapezoid(f, a, b, n):
    if not isinstance(n, int) or n <= 0:
        raise ValueError("n must be a positive integer")
    h = (b-a)/n
    return h*(0.5*(f(a)+f(b))+sum(f(a+i*h) for i in range(1, n)))

def simpson(f, a, b, n):
    if not isinstance(n, int) or n <= 0 or n % 2:
        raise ValueError("n must be a positive even integer")
    h = (b-a)/n
    return h/3*(f(a)+f(b)+sum((4 if i % 2 else 2)*f(a+i*h) for i in range(1, n)))

print("x^4 on [0,1]: exact integral 0.2")
print("n      trapezoid error      Simpson error      trap bound h^2      Simpson bound")
previous = None
for n in [10, 20, 40, 80]:
    h = 1/n
    trap_error = abs(trapezoid(lambda x: x**4, 0, 1, n)-0.2)
    simp_error = abs(simpson(lambda x: x**4, 0, 1, n)-0.2)
    trap_bound, simp_bound = h*h, 24*h**4/180
    print(f"{n:3d} {trap_error:20.10e} {simp_error:18.10e} {trap_bound:18.10e} {simp_bound:18.10e}")
    assert trap_error <= trap_bound+1e-14 and simp_error <= simp_bound+1e-14
    if previous:
        assert trap_error < previous[0] and simp_error < previous[1]
    previous = trap_error, simp_error
print("sin on [0,pi], n=100 Simpson:", simpson(math.sin, 0, math.pi, 100))
assert abs(simpson(math.sin, 0, math.pi, 100)-2) < 2e-8
try:
    simpson(math.sin, 0, math.pi, 9)
except ValueError as error:
    print("Rejected invalid mesh:", error)
