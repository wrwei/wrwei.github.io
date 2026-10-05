"""OLS and logistic fitting on specified independent synthetic data; NumPy 1.26.4."""
import numpy as np


def sigmoid(z):
    z = np.asarray(z)
    out = np.empty_like(z, dtype=float)
    positive = z >= 0
    out[positive] = 1/(1+np.exp(-z[positive]))
    exp_z = np.exp(z[~positive])
    out[~positive] = exp_z/(1+exp_z)
    return out


if __name__ == "__main__":
    rng = np.random.default_rng(26027)
    x = rng.uniform(-2, 2, 240)
    design = np.column_stack([np.ones(len(x)), x])
    y = 1+2*x+rng.normal(0, .5, len(x))
    train, test = np.arange(160), np.arange(160, 240)
    fitted, _, rank, _ = np.linalg.lstsq(design[train], y[train], rcond=None)
    residual = y[train]-design[train]@fitted
    sigma2 = residual@residual/(len(train)-2)
    covariance = sigma2*np.linalg.solve(design[train].T@design[train], np.eye(2))
    print("NumPy baseline1.26.4; seed26027; fixed160 training /80 test observations")
    print(f"OLS rank={rank}; intercept={fitted[0]:.6f}; slope={fitted[1]:.6f}")
    print(f"estimated coefficient SEs={np.sqrt(np.diag(covariance)).round(6).tolist()}; residual variance={sigma2:.6f}")
    print(f"normal equation residual max={np.max(np.abs(design[train].T@residual)):.3e}; held-out MSE={np.mean((y[test]-design[test]@fitted)**2):.6f}")
    probabilities = sigmoid(-.3+1.2*x)
    labels = (rng.random(len(x)) < probabilities).astype(float)
    weights = np.zeros(2)
    for _ in range(2500):
        p = sigmoid(design[train]@weights)
        gradient = design[train].T@(p-labels[train])/len(train)
        weights -= .2*gradient
    logits = design[test]@weights
    predictions = sigmoid(logits)
    nll = np.mean(np.logaddexp(0, logits)-labels[test]*logits)
    brier = np.mean((predictions-labels[test])**2)
    print(f"Logistic intercept={weights[0]:.6f}; slope={weights[1]:.6f}; final train gradient norm={np.linalg.norm(gradient):.3e}")
    print(f"Held-out NLL={nll:.6f}; Brier score={brier:.6f}")
    for lo, hi in ((0., .25), (.25, .5), (.5, .75), (.75, 1.)):
        mask = (predictions >= lo) & (predictions < hi)
        if np.any(mask):
            print(f"Calibration bin[{lo:.2f},{hi:.2f}): n={mask.sum()}, mean prediction={predictions[mask].mean():.6f}, success fraction={labels[test][mask].mean():.6f}")
    print("Bins are finite diagnostics, not proof of population calibration; OLS SE formula assumes the stated independent homoscedastic model.")
