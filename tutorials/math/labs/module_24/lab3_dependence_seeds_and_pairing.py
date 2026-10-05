"""Copied streams, clustered observations, zero estimated SE and common random numbers."""
from math import sqrt, log
import random

if __name__ == "__main__":
    n, repeats, p = 1000, 30, .3
    means = []
    for _ in range(repeats):
        generator = random.Random(24)  # Intentional fault: identical stream each time.
        means.append(sum(generator.random() < p for _ in range(n))/n)
    print("copied-seed blocks: unique means=%d mean=%.6f" % (len(set(means)), means[0]))
    print("wrong R*N independence SE=%.6f actual copied-block model SE=%.6f" % (
        sqrt(p*(1-p)/(repeats*n)), sqrt(p*(1-p)/n)))
    assert len(set(means)) == 1
    generator = random.Random(24343)
    clusters, copies = 100, 10
    distinct = [int(generator.random() < p) for _ in range(clusters)]
    records = [x for x in distinct for _ in range(copies)]
    print("cluster copies: nominalN=%d independentClusters=%d mean=%.6f" % (
        len(records), clusters, sum(records)/len(records)))
    print("wrong row SE=%.6f correct cluster model SE=%.6f" % (
        sqrt(p*(1-p)/len(records)), sqrt(p*(1-p)/clusters)))
    N = 100
    print("rare-event all-zero dataset: estimatedSE=0; model p=.001 gives P(all0)=%.6f" % (.999**N))
    print("bounded independent Hoeffding95%%radius=%.6f despite zero plug-in SE" % sqrt(log(40)/(2*N)))
    a, b = .6, .55
    paired_variance = (a-b)*(1-a+b)
    independent_variance = a*(1-a)+b*(1-b)
    paired, separate = [], []
    for _ in range(10000):
        u = generator.random()
        paired.append(int(u<a)-int(u<b))
        separate.append(int(generator.random()<a)-int(generator.random()<b))
    print("common-random-number difference mean=%.6f independent difference mean=%.6f target=.05" % (
        sum(paired)/len(paired), sum(separate)/len(separate)))
    print("exact per-pair variance: common=%.6f independent=%.6f" % (paired_variance, independent_variance))
    print("exact N10000 SE: common=%.6f independent=%.6f" % (
        sqrt(paired_variance/10000), sqrt(independent_variance/10000)))
    print("PASS: replication is not new information; pairing helps here through positive covariance")
