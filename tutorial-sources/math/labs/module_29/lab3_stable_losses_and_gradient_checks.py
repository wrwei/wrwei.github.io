"""Repair overflow and audit a smooth central-difference gradient check."""
import numpy as np

def sigmoid(z):
    z = np.asarray(z, dtype=np.float64)
    out = np.empty_like(z)
    positive = z >= 0
    out[positive] = 1/(1+np.exp(-z[positive]))
    e = np.exp(z[~positive])
    out[~positive] = e/(1+e)
    return out

logits = np.array([1000., 1001., 1002.])
with np.errstate(over='ignore', invalid='ignore'):
    broken = np.exp(logits)/np.exp(logits).sum()
shifted = logits-logits.max()
softmax = np.exp(shifted)/np.exp(shifted).sum()
loss = np.log(np.exp(shifted).sum())-shifted[0]
print('raw softmax finite:', bool(np.isfinite(broken).all()))
print('shifted softmax:', softmax, '; class-0 NLL:', f'{loss:.9f}')
assert np.isfinite(softmax).all() and np.isclose(softmax.sum(), 1)
extreme = np.array([-1000., 1000.])
labels = np.array([1., 0.])
losses = np.maximum(extreme, 0)-labels*extreme+np.log1p(np.exp(-np.abs(extreme)))
print('stable sigmoid:', sigmoid(extreme), '; stable Bernoulli losses:', losses)
assert np.all(losses == 1000)
X = np.array([[1., .2], [1., -1.], [1., 2.]])
y = np.array([1., 0., 1.])
w = np.array([.3, -.4])
def objective(v):
    z = X@v
    return np.mean(np.logaddexp(0, z)-y*z)
analytic = X.T@(sigmoid(X@w)-y)/len(y)
for step in (1e-2, 1e-5, 1e-16):
    numeric = np.array([(objective(w+step*np.eye(2)[j])-objective(w-step*np.eye(2)[j]))/(2*step) for j in range(2)])
    error = np.linalg.norm(numeric-analytic)
    print(f'h={step:.0e}; numerical={numeric}; error={error:.6e}')
    if step == 1e-5:
        assert error < 1e-9
print('missing mean factor discrepancy:', np.linalg.norm(3*analytic-analytic))
print('abs at zero: central difference=0 while derivative does not exist; a symmetric slope is not a differentiability certificate.')
