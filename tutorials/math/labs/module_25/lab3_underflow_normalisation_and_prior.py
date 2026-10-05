"""Diagnose probability underflow, parameter-dependent factors, and reused data."""
import math


def bernoulli_log_likelihood(p, k, n):
    if not 0 <= p <= 1 or not 0 <= k <= n:
        raise ValueError("invalid model or count")
    if (p == 0 and k > 0) or (p == 1 and n-k > 0):
        return -math.inf
    return (k*math.log(p) if k else 0.) + ((n-k)*math.log1p(-p) if n-k else 0.)


if __name__ == "__main__":
    n, k = 10000, 8000
    ll = [bernoulli_log_likelihood(p, k, n) for p in (.79, .8)]
    print(f"n={n}, k={k}: raw likelihoods={[math.exp(x) for x in ll]}")
    print(f"log likelihoods={ll[0]:.6f}, {ll[1]:.6f}; relative L(.79)/L(.8)={math.exp(ll[0]-ll[1]):.6f}")
    assert ll[1] > ll[0] and all(math.exp(x) == 0 for x in ll)
    for sigma in (1., 2.):
        full = -2*math.log(sigma)-math.log(2*math.pi)
        print(f"two zero residuals, sigma={sigma:.0f}: Gaussian full logL={full:.6f}; omitted-scale expression=0")
    a, b, k, n = 2, 2, 8, 10
    correct = (a+k)/(a+b+n)
    doubled = (a+2*k)/(a+b+2*n)
    print(f"One update: Beta(10,4), mean={correct:.6f}")
    print(f"Same data reused as new evidence: Beta(18,6), mean={doubled:.6f} (invalid independent-evidence claim)")
    sigma2, tau2, n, observed_mean = 1., 4., 4, 3.
    lam = sigma2/tau2
    map_mean = n*observed_mean/(n+lam)
    print(f"Gaussian mean, prior N(0,4), known noise variance1: MAP={map_mean:.6f}; sum-SSE penalty coefficient={lam:.6f}")
    print(f"For average-SSE convention the matching coefficient is lambda/n={lam/n:.6f}.")
