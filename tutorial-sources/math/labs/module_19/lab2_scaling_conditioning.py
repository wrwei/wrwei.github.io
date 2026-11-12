"""A coordinate change changes curvature and the effective gradient metric."""
import numpy as np
A = np.diag([1.0,100.0])
start = np.array([1.0,1.0])
print("Raw curvature eigenvalues / condition number:", np.diag(A), np.linalg.cond(A))
print("eta      steps      endpoint                norm")
for eta, steps in [(0.01,200), (2/101,200), (0.1,10)]:
    x = start.copy()
    for _ in range(steps):
        x -= eta*(A@x)
    print(eta, steps, x, np.linalg.norm(x))
    if eta == 0.1:
        assert np.linalg.norm(x) > 1e9
    else:
        assert np.linalg.norm(x) < np.linalg.norm(start)

# z=S*x, so x=S^-1*z; preserve the mathematical objective under this change.
S = np.diag([1.0,10.0])
inverse_S = np.diag([1.0,0.1])
transformed_A = inverse_S.T@A@inverse_S
z = S@start
assert np.allclose(transformed_A, np.eye(2))
z -= transformed_A@z  # eta_z=1 on identity curvature.
recovered = inverse_S@z
print("Transformed curvature / condition number:", transformed_A, np.linalg.cond(transformed_A))
print("One transformed-coordinate step, mapped back:", recovered)
assert np.allclose(recovered, 0, atol=1e-12)
preconditioned = start-inverse_S@inverse_S.T@(A@start)
assert np.allclose(preconditioned, recovered)
print("Same objective, different coordinate geometry; the equivalent raw update uses a matrix preconditioner.")
