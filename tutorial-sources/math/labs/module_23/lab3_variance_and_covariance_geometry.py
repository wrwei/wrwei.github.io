"""Repair an independence variance shortcut; optional AI covariance/PCA geometry."""
from fractions import Fraction as F
from math import sqrt

if __name__ == "__main__":
    p = F(3, 10)
    vx = p*(1-p)
    cov = vx  # Y=X, not an independent copy.
    correct = vx+vx+2*cov
    print("CS: X Bernoulli(.3), Y=X")
    print("Var(X)=%s Cov(X,Y)=%s Var(X+Y)=%s wrong independent sum=%s" % (
        vx, cov, correct, 2*vx))
    assert correct == F(21, 25)
    data = [(-2., -1.), (-1., -.5), (1., .5), (2., 1.)]
    n = len(data)
    mean = [sum(row[i] for row in data)/n for i in range(2)]
    centered = [[row[i]-mean[i] for i in range(2)] for row in data]
    covariance = [[sum(row[i]*row[j] for row in centered)/n for j in range(2)] for i in range(2)]
    principal, orthogonal = [2/sqrt(5), 1/sqrt(5)], [-1/sqrt(5), 2/sqrt(5)]
    print("AI geometry (Modules12/14): covariance uses denominator N, training mean only")
    print("mean:", mean, "covariance:", covariance)
    for name, direction, eigenvalue in (("principal", principal, 3.125), ("orthogonal", orthogonal, 0.)):
        scores = [sum(row[i]*direction[i] for i in range(2)) for row in centered]
        variance = sum(s*s for s in scores)/n
        matrix_product = [sum(covariance[i][j]*direction[j] for j in range(2)) for i in range(2)]
        assert max(abs(matrix_product[i]-eigenvalue*direction[i]) for i in range(2)) < 1e-12
        assert abs(variance-eigenvalue) < 1e-12
        print("%s direction=(%.6f,%.6f) projected variance=%.6f eigenvalue=%.6f" % (
            name, *direction, variance, eigenvalue))
    sample_covariance = [[v*n/(n-1) for v in row] for row in covariance]
    print("denominator N-1 covariance:", sample_covariance)
    print("Direction unchanged by common scaling; target covariance and estimator convention differ.")
    print("PASS: dependence contributes twice its covariance; PSD covariance can be singular")
