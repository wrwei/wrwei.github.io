"""Many-to-one discrete transforms, Jacobian correction, and support diagnostics."""
from fractions import Fraction as F
from math import sqrt, exp

if __name__ == "__main__":
    masses = {-2: F(1, 4), -1: F(1, 4), 1: F(1, 4), 2: F(1, 4)}
    transformed = {}
    for x, mass in masses.items():
        transformed[x*x] = transformed.get(x*x, F(0)) + mass
    print("CS branch X masses:", {x: str(p) for x, p in masses.items()})
    print("Y=X^2 masses (sum every preimage):", {y: str(p) for y, p in transformed.items()})
    assert sum(transformed.values()) == 1
    print("support diagnosis: waiting trials cannot be0; geometric failures can be0")
    print("Poisson counts include0; Gaussian counts can be negative/noninteger, so are not a count model")
    print("AI continuous branch requires Module17: X uniform(0,1), Y=2X")
    print("wrong density1 on(0,2): total mass=2; corrected density1/2: total mass=1")
    print("nonmonotone example X uniform(-1,1), Y=X^2")
    for y in (.04, .25, .81):
        cdf = sqrt(y)
        density = 1/(2*sqrt(y))
        print("y=%.2f CDF=%.6f density=%.6f" % (y, cdf, density))
    eps = 1e-4
    corrected_mass = 1-sqrt(eps)  # integral eps..1 of 1/(2sqrt(y))
    omitted_branch_mass = corrected_mass/2
    print("mass eps..1: both branches=%.6f one branch only=%.6f omitted0..eps=%.6f" % (
        corrected_mass, omitted_branch_mass, sqrt(eps)))
    assert abs(corrected_mass+sqrt(eps)-1) < 1e-12
    print("exponential rate2: density at0=2, P(X=0)=0, P(0<X<=.1)=%.8f" % (1-exp(-.2)))
    print("PASS: discrete preimages add; continuous inverse branches need absolute Jacobians")
