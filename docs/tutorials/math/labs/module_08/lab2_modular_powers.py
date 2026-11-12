"""Repeated squaring with exact integer arithmetic and an explicit operation count."""
def power_mod(base, exponent, modulus):
    if exponent < 0 or modulus < 2:
        raise ValueError("Require exponent >= 0 and modulus >= 2")
    original_base, original_exponent = base, exponent
    result, base = 1, base % modulus
    steps, multiplications, trace = 0, 0, []
    while exponent:
        trace.append((result, base, exponent))
        if exponent % 2:
            result = result * base % modulus
            multiplications += 1
        base = base * base % modulus  # Also counted in the final iteration.
        multiplications += 1
        exponent //= 2
        steps += 1
    assert result == pow(original_base, original_exponent, modulus)
    return result, steps, multiplications, trace

for base, exponent, modulus in [(3, 13, 7), (5, 0, 11), (0, 0, 7), (-2, 9, 13), (17, 1_000_000, 97)]:
    value, steps, multiplications, trace = power_mod(base, exponent, modulus)
    assert steps == exponent.bit_length()
    print(f"({base})^{exponent} mod {modulus} = {value}; iterations={steps}, multiplications={multiplications}")
    if (base, exponent, modulus) == (3, 13, 7):
        print("Loop-head (result, base, exponent):", trace)
print("At most two modular multiplications per iteration; their bit cost is not constant in general.")
for base, exponent, modulus in [(3, -1, 7), (3, 5, 1)]:
    try:
        power_mod(base, exponent, modulus)
    except ValueError as error:
        print("Rejected:", (base, exponent, modulus), str(error))
