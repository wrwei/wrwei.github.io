"""Deliberate rate, correlation, nonlinear preconditioning and selection faults."""
import math


if __name__ == "__main__":
    curvature, start = 10.,1.
    for eta in (.1,.25):
        w = start
        for _ in range(10):
            w -= eta*curvature*w
        print(f"F=.5*10*w^2, eta={eta:.2f}: factor={1-eta*curvature:.2f}, w after10={w:.6f}, loss={.5*curvature*w*w:.6f}")
    gradients = [-2.,0.,2.,0.]
    mean = sum(gradients)/4
    variance = sum((g-mean)**2 for g in gradients)/4
    print(f"Two IID gradient indices: mean variance={variance/2:.6f}; one index copied twice: variance={variance:.6f}")
    w, g, lam, eta, eps = 2., .1, .5, .01, 1e-8
    coupled_gradient = g+lam*w
    # Adam first step, zero-initialised moments with both bias corrections.
    coupled = w-eta*coupled_gradient/(abs(coupled_gradient)+eps)
    decoupled = (1-eta*lam)*w-eta*g/(abs(g)+eps)
    sgd_coupled = w-eta*(g+lam*w)
    sgd_decay = (1-eta*lam)*w-eta*g
    assert math.isclose(sgd_coupled,sgd_decay,abs_tol=1e-15)
    print(f"SGD L2-gradient={sgd_coupled:.9f}, decoupled decay={sgd_decay:.9f} (equal under this convention)")
    print(f"Bias-corrected Adam first step: coupled L2={coupled:.9f}, decoupled decay={decoupled:.9f} (different)")
    grad_values = [-2.,1.]
    clipped = [max(-1.,min(1.,x)) for x in grad_values]
    print(f"Unclipped mean={sum(grad_values)/2:.6f}; clipped mean={sum(clipped)/2:.6f} (clipping can change expectation)")
    # Illustrative input scores, not measured model runs.
    print("Illustrative score arrays demonstrate the selection rule, not a model benchmark.")
    validation = [.30,.26,.25,.27,.29]
    test = [.31,.29,.28,.24,.26]
    chosen = min(range(len(validation)),key=validation.__getitem__)
    invalid = min(range(len(test)),key=test.__getitem__)
    print(f"Predeclared validation stopping chooses epoch{chosen+1}; corresponding one-time test={test[chosen]:.2f}")
    print(f"Test-based stopping chooses epoch{invalid+1}, reported={test[invalid]:.2f}; this is selection, not an untouched final test.")
