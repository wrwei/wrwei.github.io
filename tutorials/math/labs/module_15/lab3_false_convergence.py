"""A small update, missed narrow feature, or rounded fixed value is not a proof."""
center, width = 0.123456789, 1e-6
def bump(x):
    return max(0.0, 1-abs(x-center)/width)
grid = [i/10000 for i in range(10001)]
sample_max = max(map(bump, grid))
assert sample_max == 0 and bump(center) == 1
print("Grid maximum / actual centre value:", sample_max, bump(center))

# F(x)=x+0.1(100-x) has fixed point 100, but an artificially tiny relaxation
# makes the update test pass far from that fixed point.
def F(x):
    return x+0.1*(100-x)
step_size, tolerance, x = 1e-10, 1e-6, 0.0
next_x = x+step_size*(F(x)-x)
update = abs(next_x-x)
residual = abs(F(next_x)-next_x)
error = abs(next_x-100)
print("Relaxed update / stopping tolerance:", update, tolerance)
print("Naive update-only stops:", update < tolerance)
print("Actual fixed-point residual / error:", residual, error)
assert update < tolerance and residual > 9 and error > 99

q = 0.9
certified_bound = residual/(1-q)
print("Contraction residual bound for original F:", certified_bound)
assert abs(error-certified_bound) < 1e-10
floating = 1e16
rounded_next = floating+1.0
print("Floating stagnation / real intended increment:", rounded_next == floating, 1)
assert rounded_next == floating
print("Check the original problem residual and the theorem assumptions; finite equality can be rounding.")
