"""Check every two-layer tanh-network parameter and expose shape/scaling faults."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)
X = np.array([[0.2,-0.3], [0.5,0.7], [-0.4,0.1]])
Y = np.array([[0.1], [0.8], [-0.2]])
parameters = {
    "W1": np.array([[0.3,-0.2,0.1], [0.4,0.2,-0.5]]),
    "b1": np.array([0.1,-0.1,0.05]),
    "W2": np.array([[0.5], [-0.3], [0.2]]),
    "b2": np.array([0.02]),
}

def forward(p):
    H = np.tanh(X@p["W1"]+p["b1"])
    prediction = H@p["W2"]+p["b2"]
    residual = prediction-Y
    return np.mean(residual*residual), H, prediction, residual

loss, H, prediction, residual = forward(parameters)
# Mean of B*o entries, here B=3 and o=1; the exact denominator is explicit.
G = 2*residual/residual.size
D = (G@parameters["W2"].T)*(1-H*H)
gradients = {"W2": H.T@G, "b2": G.sum(axis=0), "W1": X.T@D, "b1": D.sum(axis=0)}
print("Loss / prediction:", loss, prediction.ravel())
print("Batch / input / hidden / output shapes:", X.shape, parameters["W1"].shape, H.shape, prediction.shape)
h = 1e-6
for name, array in parameters.items():
    numerical = np.zeros_like(array)
    for index in np.ndindex(array.shape):
        saved = array[index]
        array[index] = saved+h
        plus = forward(parameters)[0]
        array[index] = saved-h
        minus = forward(parameters)[0]
        array[index] = saved
        numerical[index] = (plus-minus)/(2*h)
    error = np.max(np.abs(numerical-gradients[name]))
    print(name, "shape", gradients[name].shape, "maximum derivative error", error)
    assert gradients[name].shape == array.shape and error < 1e-9

try:
    G@parameters["W2"]  # Missing transpose: (3,1) cannot multiply (3,1).
except ValueError:
    print("Missing transpose rejected by incompatible derivative shapes.")
wrong_bias = D[-1]  # Overwrite rather than accumulate contributions from all rows.
wrong_sum_scaling = 2*residual  # This differentiates a sum, not the stated mean.
print("Bias overwrite maximum error:", np.max(np.abs(wrong_bias-gradients["b1"])))
print("Missing mean factor scales output adjoint by:", residual.size)
assert not np.allclose(wrong_bias, gradients["b1"])
assert np.allclose(wrong_sum_scaling, residual.size*G)
print("Shape, shared contributions, and loss reduction are separate parts of the backward contract.")
