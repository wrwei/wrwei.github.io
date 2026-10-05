"""Challenge units, invalid PMFs, zero support, and per-token comparisons."""
import math
def validate(p):
    if not p or any(not math.isfinite(x) or x < 0 for x in p) or not math.isclose(math.fsum(p), 1., abs_tol=1e-12, rel_tol=0.):
        raise ValueError("probabilities must be finite, nonnegative, and sum to one")


def cross_entropy(p, q):
    validate(p)
    validate(q)
    if len(p) != len(q):
        raise ValueError("same ordered alphabet required")
    if any(x > 0 and y == 0 for x, y in zip(p, q)):
        return math.inf
    return -math.fsum(x*math.log2(y) for x, y in zip(p, q) if x > 0)


if __name__ == "__main__":
    for bad in ([.8,.4], [-.1,1.1], [math.nan,1.], [0.,0.]):
        try:
            validate(bad)
        except ValueError:
            print(f"Rejected invalid probability list: {bad}")
    bits = 1.
    print(f"One bit loss: wrong exp(bits)={math.exp(bits):.6f}; correct 2**bits={2**bits:.6f}")
    print(f"Nats conversion={bits*math.log(2):.6f}; exp(nats)={math.exp(bits*math.log(2)):.6f}")
    print(f"Required support missing: cross-entropy([.5,.5],[1,0])={cross_entropy([.5,.5],[1.,0.])}")
    # Artificial joint models assign the same probability to the same raw string.
    probability = 1/16
    nll = -math.log(probability)
    for tokens in (2,4):
        ppl = math.exp(nll/tokens)
        print(f"Same raw-string probability1/16, {tokens} scored tokens: mean nats={nll/tokens:.6f}, perplexity={ppl:.6f}")
    print("A smaller token perplexity here reflects a different unit count, not a better raw-string probability.")
    p = .25
    print(f"Density preview: Uniform(0,.25) density=4, differential entropy nats={math.log(p):.6f}; exact-point probability=0")
    print("Differential entropy can be negative and changes with coordinate units; discrete entropy's nonnegativity does not transfer.")
