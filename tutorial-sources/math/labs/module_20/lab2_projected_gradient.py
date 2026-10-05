"""A convex simplex QP: feasible iterates and a projected-gradient residual."""
import numpy as np
from lab1_box_and_simplex import simplex_projection

if __name__ == "__main__":
    np.set_printoptions(precision=8, suppress=True)
    a = np.array([1.2, .4, -.2])
    target, _ = simplex_projection(a)
    x = np.ones(3) / 3
    eta = .5  # L=1; eta<=1/L supports the stated convex gap bound.
    objective = lambda z: .5 * np.sum((z-a)**2)
    previous = objective(x)
    print("analytic optimum:", target, "objective:", f"{objective(target):.8f}")
    for k in range(1, 31):
        proposed = x-eta*(x-a)
        updated, _ = simplex_projection(proposed)
        projected_residual = np.linalg.norm(x-updated) / eta
        assert np.min(updated) >= 0 and abs(updated.sum()-1) < 1e-12
        current = objective(updated)
        assert current <= previous+1e-14
        x, previous = updated, current
        if k in (1, 2, 5, 10, 30):
            print("k=%2d x=%s objective=%.10f step-mapping-norm=%.3e" % (
                k, x, current, projected_residual))
    at_optimum, _ = simplex_projection(target-eta*(target-a))
    print("ordinary gradient at optimum:", target-a)
    print("projected-gradient mapping at optimum:", (target-at_optimum)/eta)
    print("unconstrained update from optimum:", target-eta*(target-a))
    assert np.linalg.norm(x-target) < 1e-8
    assert np.linalg.norm(target-at_optimum) < 1e-12
    print("PASS: feasible descent; boundary optimum need not have zero ordinary gradient")
