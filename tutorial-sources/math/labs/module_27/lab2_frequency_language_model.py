"""A tiny categorical unigram model evaluated on a fixed held-out token list."""
import collections
import math


if __name__ == "__main__":
    alphabet = ("a", "b", "c")
    training = list("aaaaaabbbc")
    test = list("abcac")
    counts = collections.Counter(training)
    # Alphabet and additive smoothing are specified before examining test tokens.
    alpha = 1.
    models = {"uniform": {t:1/3 for t in alphabet},
              "training-only smoothed unigram": {t:(counts[t]+alpha)/(len(training)+alpha*len(alphabet)) for t in alphabet}}
    print(f"Fixed alphabet={alphabet}; training counts={dict(counts)}; test tokens={test}; smoothing alpha=1")
    for name, model in models.items():
        losses = [-math.log(model[t]) for t in test]
        nll = math.fsum(losses)
        average = nll/len(test)
        bits = average/math.log(2)
        print(f"{name}: probabilities={[round(model[t],6) for t in alphabet]}")
        print(f"  held-out total NLL={nll:.6f}, mean nats/token={average:.6f}, bits/token={bits:.6f}, perplexity={math.exp(average):.6f}")
    print("This fixed unigram approximation ignores order and context. Its poor held-out result cannot be repaired by fitting test counts.")
    sequence_probability = .5*.8*.6
    print(f"Conditional sequence example: .5*.8*.6={sequence_probability:.6f}; chain NLL={-math.log(sequence_probability):.6f}")
    print("The chain factorisation uses conditional probabilities; it does not require independent tokens.")
