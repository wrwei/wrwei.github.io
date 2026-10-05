"""Check all KKT residuals, a dual bound, and qualifications; NumPy only."""
import numpy as np

a = np.array([1.2, .4, -.2])


def report(label, x, lam, nu):
    gradient = x-a
    stationarity = gradient + lam - nu
    equality = abs(x.sum()-1)
    inequality = max(0.0, -float(x.min()))
    dual_feasibility = max(0.0, -float(nu.min()))
    complementarity = np.max(np.abs(nu*x))
    f = .5*np.sum((x-a)**2)
    q = lam*(a.sum()-1)-nu@a-.5*np.sum((lam-nu)**2)
    print(label)
    print("  residuals: equality=%.3e inequality=%.3e dual=%.3e stationarity=%.3e complementarity=%.3e" % (
        equality, inequality, dual_feasibility, np.linalg.norm(stationarity), complementarity))
    print("  objective=%.8f dual=%.8f candidate difference=%.8f" % (f, q, f-q))
    valid_dual = dual_feasibility == 0
    feasible = equality < 1e-12 and inequality == 0
    print("  dual bound valid:", valid_dual, "candidate feasible:", feasible)
    return feasible and valid_dual and max(np.linalg.norm(stationarity), complementarity) < 1e-12


if __name__ == "__main__":
    np.set_printoptions(precision=8, suppress=True)
    assert report("correct certificate", np.array([.9, .1, 0]), .3, np.array([0., 0., .5]))
    assert not report("infeasible despite matching stationarity", np.array([1., .2, 0]), .2, np.array([0., 0., .4]))
    assert not report("negative lower-bound multiplier", np.array([.9, .1, 0]), .3, np.array([0., 0., -.5]))
    print("qualification failure: minimise x subject to x^2=0")
    print("  only feasible x=0; constraint gradient=0; stationarity 1+lambda*0 cannot vanish")
    print("  q(lambda)=-1/(4*lambda) for lambda>0; supremum 0, never attained")
    for lam in (1., 10., 100.):
        print("  lambda=%.0f dual bound=%.8f" % (lam, -1/(4*lam)))
    print("nonconvex KKT false certificate: minimise -x^2 subject to -1<=x<=1")
    print("  x=0, multipliers=0 pass KKT; f=0, but x=1 gives f=-1")
    print("  on R, every Lagrangian remains a downward quadratic: dual value=-infinity")
    for rho in (1., 10., 100.):
        # f=.5*(x-2)^2, equality x=0; squared penalty rho*x^2/2.
        x = 2/(1+rho)
        print("squared penalty rho=%.0f minimiser=%.8f equality violation=%.8f" % (rho, x, abs(x)))
        assert x > 0
    print("PASS: stationarity alone fails; qualification, convexity and feasibility matter")
