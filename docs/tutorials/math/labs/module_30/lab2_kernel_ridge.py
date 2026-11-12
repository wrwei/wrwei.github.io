"""RBF kernel ridge, mean-loss convention; choose only on validation."""
import numpy as np

rng = np.random.default_rng(30031)
x = rng.uniform(-2, 2, 90)
y = np.sin(3*x)+rng.normal(0, .15, 90)
train, val, test = np.arange(40), np.arange(40,65), np.arange(65,90)
offset = y[train].mean()  # Fixed training-only offset, not a separately optimised intercept.
def kernel(a, b, length):
    return np.exp(-((a[:,None]-b[None,:])**2)/(2*length**2))
records = []
for length in (.2, .6, 1.5):
    K = kernel(x[train], x[train], length)
    assert np.linalg.eigvalsh(K).min() > -1e-10
    for penalty in (.0001, .01, .1):
        alpha = np.linalg.solve(K+len(train)*penalty*np.eye(len(train)), y[train]-offset)
        prediction = offset+kernel(x[val], x[train], length)@alpha
        mse = np.mean((prediction-y[val])**2)
        records.append((mse, length, penalty, alpha))
        print(f'length={length:.1f}; lambda={penalty:g}; validation MSE={mse:.6f}')
_, length, penalty, alpha = min(records, key=lambda row: row[0])
prediction = offset+kernel(x[test],x[train],length)@alpha
print(f'frozen choice: length={length}; lambda={penalty}; test MSE={np.mean((prediction-y[test])**2):.6f}')
print(f'training-mean baseline test MSE={np.mean((offset-y[test])**2):.6f}')
print('40/25/25 independent rows; raw x units; fixed training-only offset; no final-test selection.')
