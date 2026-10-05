"""Fixed finite objective: exact gradient moments and equal evaluation budgets."""
import itertools
import numpy as np


if __name__ == "__main__":
    records = np.array([[-2.,0.],[0.,2.],[2.,0.],[0.,-2.]])
    w = np.array([3.,-2.])
    gradients = w-records
    print("Objective F(w)=mean(.5*||w-a_i||^2); four fixed records; minimiser=(0,0)")
    print(f"Full gradient={gradients.mean(axis=0).tolist()}; single-index gradient covariance={np.cov(gradients.T,bias=True).tolist()}")
    for replacement in (True,False):
        batches = list(itertools.product(range(4),repeat=2)) if replacement else list(itertools.combinations(range(4),2))
        means = np.array([gradients[list(batch)].mean(axis=0) for batch in batches])
        print(f"b=2, replacement={replacement}: exact average={means.mean(axis=0).tolist()}, coordinate variance={means.var(axis=0).round(6).tolist()}")
    budget = 2400
    for batch in (1,2,4):
        rng = np.random.default_rng(28028+batch)
        weights = np.array([3.,-2.])
        updates = budget//batch
        for t in range(updates):
            indices = np.arange(4) if batch==4 else rng.integers(0,4,batch)
            g = (weights-records[indices]).mean(axis=0)
            eta = .4/(1+t/50)
            weights -= eta*g
        gap = .5*(weights@weights)
        print(f"batch={batch}: evaluations={updates*batch}, updates={updates}, final w={weights.round(6).tolist()}, objective gap={gap:.9f}")
    print("The schedule is indexed by updates; equal evaluation budgets do not imply identical schedules or wall-clock costs.")
