"""A stable continuous decay can have an unstable or negative Euler trace."""
import math

rate = 2.0
print("x'=-2x, x(0)=1; exact x(t)=exp(-2t)")
print("h     Euler factor    x_20          exact at t=20h     behaviour")
for h in [0.1, 0.8, 1.0, 1.1]:
    factor = 1-rate*h
    x = 1.0
    for _ in range(20):
        x += h*(-rate*x)
    behaviour = "decays" if abs(factor) < 1 else "neutral oscillation" if abs(factor) == 1 else "unstable"
    print(f"{h:3.1f} {factor:12.4f} {x:13.7f} {math.exp(-rate*20*h):18.8e} {behaviour}")
    assert abs(x-factor**20) < 1e-10
    if abs(factor) < 1:
        assert abs(x) < 1
    elif abs(factor) > 1:
        assert abs(x) > 1
print("h=0.8 first iterate:", 1-rate*0.8, "(negative despite positive continuous solution)")

print("Fixed final time T=1: n, Euler endpoint, exact endpoint, absolute error")
previous_error = float("inf")
for n in [10, 20, 40, 80]:
    h, x = 1/n, 1.0
    for _ in range(n):
        x += h*(-rate*x)
    exact = math.exp(-rate)
    error = abs(x-exact)
    print(n, f"{x:.10f}", f"{exact:.10f}", f"{error:.10f}")
    assert error < previous_error
    previous_error = error
print("Long-time stability, nonnegativity, and finite-time accuracy are separate checks.")
