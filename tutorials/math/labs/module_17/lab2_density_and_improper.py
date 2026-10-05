"""Normalisation is an integral condition, distinct from density height."""
import math

def trapezoid(f, a, b, n):
    h = (b-a)/n
    return h*(0.5*(f(a)+f(b))+sum(f(a+i*h) for i in range(1, n)))

for coefficient in [-2.0, 2.0, 3.0]:
    mass = trapezoid(lambda x: coefficient*x, 0, 1, 1000)
    # For this known linear family, c>=0 establishes nonnegativity on [0,1].
    valid = coefficient >= 0 and abs(mass-1) < 1e-12
    print("c / integrated mass / normalised nonnegative candidate:", coefficient, mass, valid)
    assert valid == (coefficient == 2)

mean = trapezoid(lambda x: x*2*x, 0, 1, 1000)
interval_mass = trapezoid(lambda x: 2*x, 0.25, 0.75, 1000)
print("p(1)=2 is a height, not a point probability:", 2.0)
print("Integral x*p(x) / exact weighted mean:", mean, 2/3)
print("Mass on [0.25,0.75] / exact:", interval_mass, 0.5)
assert abs(mean-2/3) < 4e-7 and abs(interval_mass-0.5) < 1e-12

print("epsilon    integral 1/x from epsilon to 1    integral 1/sqrt(x)")
for epsilon in [1e-1, 1e-2, 1e-4, 1e-8]:
    divergent = -math.log(epsilon)
    convergent = 2*(1-math.sqrt(epsilon))
    print(f"{epsilon:.0e} {divergent:32.10f} {convergent:24.10f}")
print("Each cutoff integral is finite; only the limit decides improper convergence.")
