"""Repeated independent datasets compare specified frequentist risks."""
import math
import random


def summarize(values, truth):
    avg = math.fsum(values)/len(values)
    var = math.fsum((v-avg)**2 for v in values)/len(values)
    mse = math.fsum((v-truth)**2 for v in values)/len(values)
    assert abs(mse-var-(avg-truth)**2) < 1e-12
    return avg-truth, var, mse


if __name__ == "__main__":
    rng = random.Random(25025)
    n, replications = 10, 6000
    print(f"seed=25025; independent synthetic datasets={replications}; n={n}; Beta(2,2) fixed before draws")
    for p in (.3, .95):
        counts = [sum(rng.random() < p for _ in range(n)) for _ in range(replications)]
        estimates = {"MLE": [k/n for k in counts], "posterior mean": [(k+2)/(n+4) for k in counts]}
        for name, values in estimates.items():
            bias, var, mse = summarize(values, p)
            model_bias = 0. if name == "MLE" else (2-4*p)/(n+4)
            model_var = p*(1-p)/n if name == "MLE" else n*p*(1-p)/(n+4)**2
            print(f"p={p:.2f}, {name}: empirical bias={bias:.6f}, variance={var:.6f}, MSE={mse:.6f}")
            print(f"  exact sampling bias={model_bias:.6f}, variance={model_var:.6f}, MSE={model_var+model_bias**2:.6f}")
    print("A posterior mean can be assessed by repeated-sample risk; its Bayesian interpretation does not guarantee lower risk at every fixed p.")
