"""Base conversion and fixed-width signed interpretation."""
def binary(value, width=8):
    if not 0 <= value < 2 ** width:
        raise ValueError("value does not fit unsigned width")
    bits = []
    for _ in range(width):
        bits.append(str(value % 2))
        value //= 2
    return "".join(reversed(bits))

for value in [0, 13, 127, 128, 255]:
    bits = binary(value)
    signed = value if value < 128 else value - 256
    assert int(bits, 2) == value
    print(f"{bits}: unsigned={value:3}, signed={signed:4}, hex={value:02x}")
try:
    binary(256)
except ValueError:
    print("256 rejected at width 8")
else:
    raise AssertionError("overflow must be rejected")
