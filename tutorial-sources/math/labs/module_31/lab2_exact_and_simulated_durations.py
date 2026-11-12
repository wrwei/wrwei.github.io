"""Exact finite diamond law and simulation of the SAME duration models."""
import argparse
from collections import Counter
from fractions import Fraction
from itertools import product
import math
from pathlib import Path
import random

# A and D last one unit; B,C last one or three with equal marginal probability.
independent = Counter()
for b,c in product((1,3),repeat=2):
    independent[1+max(b,c)+1] += Fraction(1,4)
shared = {3:Fraction(1,2),5:Fraction(1,2)}
def moments(pmf):
    mean = sum(t*p for t,p in pmf.items())
    return mean, sum(p*(t-mean)**2 for t,p in pmf.items())
N = 20000
print('exact independent PMF:', dict(sorted(independent.items())))
print('exact shared-delay PMF:', shared)
for name, pmf, seed in [('independent',independent,31031),('shared',shared,31032)]:
    mean, variance = moments(pmf)
    rng = random.Random(seed)
    observed = []
    for _ in range(N):
        b = rng.choice((1,3))
        c = rng.choice((1,3)) if name == 'independent' else b
        observed.append(1+max(b,c)+1)
    estimate = sum(observed)/N
    se = math.sqrt(float(variance)/N)
    radius = 2*math.sqrt(math.log(2/.05)/(2*N)) # range 5-3, IID simulation replicates
    print(f'{name}: exact mean={mean}; variance={variance}; MC mean={estimate:.6f}; known-law SE={se:.6f}; Hoeffding 95% radius={radius:.6f}; seed={seed}')
    assert abs(estimate-float(mean)) < radius
print('recurrence at marginal means:', 1+max(2,2)+1, '; expected independent completion:', moments(independent)[0])
parser = argparse.ArgumentParser()
parser.add_argument('--output')
args = parser.parse_args()
if args.output:
    drawing = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 340" role="img" aria-label="Exact independent and shared duration masses at completion times three and five"><rect width="760" height="340" fill="white"/><g font-family="system-ui" fill="#1a2e4a"><text x="380" y="30" text-anchor="middle" font-size="20">Exact completion PMF / 精确完成时间质量</text><path d="M70,70V270H700" fill="none" stroke="#64748b"/>'
    for i,t in enumerate((3,5)):
        x = 180+i*300
        for offset,pmf,colour,label in [(0,independent,'#0284c7','independent / 独立'),(65,shared,'#7e22ce','shared / 共享')]:
            mass = float(pmf[t])
            drawing += f'<rect x="{x+offset}" y="{270-220*mass}" width="50" height="{220*mass}" fill="{colour}"/><text x="{x+offset+25}" y="{255-220*mass}" text-anchor="middle" font-size="18">{mass:g}</text>'
        drawing += f'<text x="{x+55}" y="300" text-anchor="middle" font-size="20">T={t}</text>'
    drawing += '<text x="380" y="333" text-anchor="middle" font-size="17">Blue: independent / 独立; purple: shared / 共享</text></g></svg>'
    Path(args.output).write_text(drawing,encoding='utf-8')
