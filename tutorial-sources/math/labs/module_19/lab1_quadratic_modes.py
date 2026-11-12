"""Eigenmodes determine the full constant-step interval of a quadratic."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)
A = np.array([[3.0,1.0], [1.0,3.0]])
b = np.array([2.0,-1.0])
optimum = np.linalg.solve(A, b)
eigenvalues = np.linalg.eigvalsh(A)
def objective(x):
    return 0.5*x@A@x-b@x
start = np.array([3.0,2.0])
print("Eigenvalues / unique optimum / optimal objective:", eigenvalues, optimum, objective(optimum))
print("eta      mode factors           error after 30      objective after 30")
for eta in [0.2, 1/3, 0.5, 0.55]:
    x = start.copy()
    history = [objective(x)]
    for _ in range(30):
        x -= eta*(A@x-b)
        history.append(objective(x))
    factors = 1-eta*eigenvalues
    error = np.linalg.norm(x-optimum)
    print(f"{eta:.6f}", factors, f"{error:.10e}", f"{objective(x):.10f}")
    if np.max(np.abs(factors)) < 1:
        assert error < 1e-5
        assert all(next_value <= value+1e-12 for value, next_value in zip(history, history[1:]))
    else:
        assert error > 1
print("Strict interval: 0 < eta < 2/lambda_max =", 2/eigenvalues[-1])
newton = start-np.linalg.solve(A, A@start-b)
print("Exact quadratic Newton result:", newton)
assert np.allclose(newton, optimum, atol=1e-12, rtol=0)
