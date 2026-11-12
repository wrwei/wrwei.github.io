"""A predeclared finite null class; each true classification accuracy is .5.

X contains independent fair bits and Y is an independent fair bit; h_j(X)=X_j.
Validation error counts are independent Binomial(n,.5) under this model.
The count sampler implements that exact distribution without storing all rows.
"""
import math
import numpy as np

rng = np.random.default_rng(30030)
repeats, n, ntest = 1000, 100, 2000
for candidates in (1, 20, 200):
    validation = rng.binomial(n, .5, size=(repeats, candidates))/n
    winner = validation.max(axis=1)
    # Every selected candidate still has population accuracy .5; fresh test is independent.
    test = rng.binomial(ntest, .5, size=repeats)/ntest
    epsilon = math.sqrt(math.log(2*candidates/.05)/(2*n))
    print(f'M={candidates}; mean selected validation={winner.mean():.6f}; mean independent test={test.mean():.6f}; uniform radius={epsilon:.6f}')
print('The repeat average is an experiment summary; the bound is for one IID sample and all fixed candidates.')
