"""Training-only scaling and stated ridge/lasso coefficient conventions."""
import numpy as np


if __name__ == "__main__":
    rng = np.random.default_rng(28029)
    latent = rng.normal(size=(240,2))
    features = latent*np.array([1.,100.])
    response = 2*latent[:,0]-.5*latent[:,1]+rng.normal(0,.5,240)
    train, validation, test = np.arange(144), np.arange(144,192), np.arange(192,240)
    center, scale = features[train].mean(axis=0), features[train].std(axis=0)
    scaled = (features-center)/scale
    response_center = response[train].mean()
    print("NumPy1.26.4; seed28029; fixed144/48/48 split; transformations fitted on training only")
    print(f"raw Hessian condition={np.linalg.cond(features[train].T@features[train]):.6f}; scaled condition={np.linalg.cond(scaled[train].T@scaled[train]):.6f}")
    candidates = [0., .01, .1, 1.]
    fitted = []
    for lam in candidates:
        a = scaled[train]
        # Mean half-SSE + lambda/2||w||^2; intercept response_center is not penalised.
        w = np.linalg.solve(a.T@a/len(train)+lam*np.eye(2),a.T@(response[train]-response_center)/len(train))
        val_mse = np.mean((response_center+scaled[validation]@w-response[validation])**2)
        fitted.append((val_mse,lam,w))
        print(f"lambda={lam:.2f}, standardised coefficients={w.round(6).tolist()}, validation MSE={val_mse:.6f}")
    _, selected, weights = min(fitted,key=lambda row:row[0])
    test_mse = np.mean((response_center+scaled[test]@weights-response[test])**2)
    print(f"Frozen validation-selected lambda={selected:.2f}; final test MSE={test_mse:.6f}")
    a, lam = .8, 1.
    ridge = a/(1+lam)
    lasso = np.sign(a)*max(abs(a)-lam,0.)
    print(f"Scalar .5(w-a)^2: a={a}, lambda={lam}; ridge lambda/2*w^2 solution={ridge:.6f}; lasso lambda*|w| solution={lasso:.6f}")
    print("Standardised-coordinate penalties define different prior geometry from penalties on raw units; scaling is not permission to reuse the same probabilistic interpretation.")
