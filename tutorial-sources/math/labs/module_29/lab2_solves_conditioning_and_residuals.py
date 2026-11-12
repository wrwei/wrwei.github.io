"""Small deterministic systems: residual, sensitivity and solver choice."""
import numpy as np

epsilon = 1e-8
A = np.array([[1., 1.], [1., 1.+epsilon]])
truth = np.ones(2)
b = A @ truth
delta = np.array([0., 1e-8])
x = np.linalg.solve(A, b+delta)
relative_input = np.linalg.norm(delta)/np.linalg.norm(b)
relative_error = np.linalg.norm(x-truth)/np.linalg.norm(truth)
print(f'cond2(A)={np.linalg.cond(A):.6e}; relative RHS perturbation={relative_input:.6e}; relative solution change={relative_error:.6e}')
wrong = np.array([0., 2.])
print(f'wrong x relative residual={np.linalg.norm(A@wrong-b)/np.linalg.norm(b):.6e}; relative error={np.linalg.norm(wrong-truth)/np.linalg.norm(truth):.6e}')
assert relative_input < 1e-8 and relative_error > .9
t = np.linspace(-1, 1, 30)
X = np.column_stack([np.ones_like(t), t, t+1e-7*t*t])
beta = np.array([1., 2., -1.])
y = X @ beta
Q, R = np.linalg.qr(X, mode='reduced')
qr = np.linalg.solve(R, Q.T@y)
svd, _, rank, singular = np.linalg.lstsq(X, y, rcond=None)
print(f'X rank={rank}; cond2(X)={singular[0]/singular[-1]:.6e}; computed cond2(Gram)={np.linalg.cond(X.T@X):.6e}')
for label, estimate in [('QR', qr), ('lstsq', svd)]:
    print(f'{label}: coefficient error={np.linalg.norm(estimate-beta):.6e}; residual={np.linalg.norm(X@estimate-y):.6e}')
    assert np.linalg.norm(estimate-beta) < 1e-6
try:
    normal = np.linalg.solve(X.T@X, X.T@y)
    print(f'normal equations: coefficient error={np.linalg.norm(normal-beta):.6e}; residual={np.linalg.norm(X@normal-y):.6e}')
except np.linalg.LinAlgError:
    print('normal equations: rounded Gram reported singular')
print('Exact full-column-rank identity: cond2(Gram)=cond2(X)^2; computed Gram may have lost its smallest mode.')
H = np.diag([1., 100.])
for rate in (.01, .03):
    w = np.ones(2)
    for _ in range(20):
        w -= rate * (H@w)
    print(f'quadratic eta={rate:.2f}; w20={w}; stable={0 < rate < 2/100}')
