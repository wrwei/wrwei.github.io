"""Seeded synthetic positive-result model; frequencies are not medical advice."""
from fractions import Fraction as F
import random

if __name__ == "__main__":
    prevalence, sensitivity, false_positive = F(1, 100), F(9, 10), F(1, 20)
    positive_mass = prevalence*sensitivity+(1-prevalence)*false_positive
    posterior = prevalence*sensitivity/positive_mass
    print("synthetic model: P(D)=1/100 P(+|D)=9/10 P(+|not D)=1/20")
    print("exact P(+)=%s P(D|+)=%s = %.8f" % (positive_mass, posterior, float(posterior)))
    generator = random.Random(20261004)
    tp = fp = fn = tn = 0
    checkpoints = {1000, 10000, 100000, 1000000}
    for n in range(1, max(checkpoints)+1):
        d = generator.random() < float(prevalence)
        positive = generator.random() < float(sensitivity if d else false_positive)
        if d and positive:
            tp += 1
        elif d:
            fn += 1
        elif positive:
            fp += 1
        else:
            tn += 1
        if n in checkpoints:
            estimate = tp/(tp+fp) if tp+fp else None
            sensitivity_estimate = tp/(tp+fn) if tp+fn else None
            print("N=%7d TP=%5d FP=%5d FN=%4d TN=%6d posterior=%s sensitivity=%s" % (
                n, tp, fp, fn, tn,
                "undefined" if estimate is None else "%.6f" % estimate,
                "undefined" if sensitivity_estimate is None else "%.6f" % sensitivity_estimate))
            assert tp+fp+fn+tn == n
    print("absolute posterior error:", "%.8f" % abs(estimate-float(posterior)))
    print("One seeded trace is a model illustration, not a convergence proof or fitted parameter claim.")
