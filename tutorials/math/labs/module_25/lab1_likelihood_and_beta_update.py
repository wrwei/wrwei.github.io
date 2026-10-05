"""CPU-only: likelihood estimates and an integer-parameter beta posterior."""
import math


def beta_cdf(x, a, b):
    """For positive integer a,b, I_x(a,b) is a binomial upper tail."""
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    n = a + b - 1
    return math.fsum(math.comb(n, j) * x**j * (1-x)**(n-j)
                     for j in range(a, n + 1))


def beta_quantile(u, a, b):
    lo, hi = 0.0, 1.0
    for _ in range(70):
        mid = (lo + hi) / 2
        if beta_cdf(mid, a, b) < u:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


if __name__ == "__main__":
    n, k, a, b = 10, 8, 2, 2
    post_a, post_b = a+k, b+n-k
    mle, mean = k/n, post_a/(post_a+post_b)
    mode = (post_a-1)/(post_a+post_b-2)
    print("Ordered Bernoulli likelihood: p^8(1-p)^2; count factor cancels for p fitting")
    for p in (.2, .5, .7, .8, .9):
        print(f"p={p:.1f}: likelihood={p**k*(1-p)**(n-k):.9f}")
    low, high = (beta_quantile(u, post_a, post_b) for u in (.025, .975))
    assert abs(beta_cdf(high, post_a, post_b)-beta_cdf(low, post_a, post_b)-.95) < 1e-12
    print(f"MLE={mle:.6f}; posterior Beta({post_a},{post_b})")
    print(f"posterior mean / next-trial predictive={mean:.6f}; posterior mode={mode:.6f}")
    print(f"equal-tail 95% credible interval=[{low:.6f}, {high:.6f}] (numerical inversion)")
    xs = [1., 2., 4.]
    mu = math.fsum(xs)/len(xs)
    rss = math.fsum((x-mu)**2 for x in xs)
    print(f"Gaussian data {xs}: mean MLE={mu:.6f}; variance MLE={rss/3:.6f}; unbiased variance={rss/2:.6f}")
    print("All failures: Bernoulli MLE=0; Beta(2,12) mean=1/7, mode=1/12")
