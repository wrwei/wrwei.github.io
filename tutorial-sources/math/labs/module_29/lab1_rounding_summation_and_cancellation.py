"""CPU rounding experiments; Decimal references the actual binary inputs."""
import math
from decimal import Decimal, localcontext
import numpy as np

print('NumPy', np.__version__, '; rounding to nearest on the tested CPU')
for dtype in (np.float16, np.float32, np.float64):
    info = np.finfo(dtype)
    large = dtype(2 ** (info.nmant + 1))
    terms = [large, dtype(1), -large]
    total = dtype(0)
    for term in terms:
        total = dtype(total + term)
    print(f'{dtype.__name__}: eps={info.eps:.9e}; spacing(large)={np.spacing(large):g}; sequential={total:g}; exact=1')
    assert total == 0
terms = [1e16, 1., -1e16]
with localcontext() as ctx:
    ctx.prec = 80
    exact = sum(map(Decimal.from_float, terms))
print('binary64 sequential:', sum(terms), '; fsum:', math.fsum(terms), '; binary-input Decimal reference:', exact)
assert math.fsum(terms) == float(exact) == 1
x = 1e-16
naive = math.sqrt(1+x)-1
stable = x/(math.sqrt(1+x)+1)
print(f'sqrt(1+x)-1 at x={x:g}: naive={naive:.9e}; rationalised={stable:.9e}')
assert naive == 0 and stable > 0
print('0.1+0.2:', repr(.1+.2), '; difference from float(0.3):', (.1+.2)-.3)
print('Subnormal != normal minimum:', np.finfo(np.float64).smallest_subnormal < np.finfo(np.float64).tiny)
