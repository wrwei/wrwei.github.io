"""Actual floating inputs matter when sampling a removable singularity."""
def punctured(x):
    if x == 1:
        raise ValueError("Original quotient is undefined at x=1")
    return (x*x-1)/(x-1)

for exponent in [1, 4, 8, 12, 16]:
    nominal = 10.0**(-exponent)
    for sign in [-1, 1]:
        x = 1+sign*nominal
        try:
            direct = format(punctured(x), ".12g")
        except ValueError:
            direct = "undefined: floating input equals 1"
        print("Nominal h / actual x-1 / quotient / continuous extension:", format(sign*nominal, ".1e"), format(x-1, ".6e"), direct, format(x+1, ".12g"))
print("Symbolic factorisation gives x+1 only for the punctured original domain; its limit is 2.")

for h in [0.1, 0.001, 0.000001]:
    left_threshold, right_threshold = 0, 1
    print("h / threshold left-right / reciprocal left-right:", h, (left_threshold, right_threshold), (-1/h, 1/h))
print("Threshold has unequal finite one-sided limits; reciprocal has opposite unbounded one-sided behaviour.")
