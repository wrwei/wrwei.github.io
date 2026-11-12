"""Shape-checked matrix multiplication and an explicitly batched affine map."""
import numpy as np

def shape(matrix):
    if not matrix or not matrix[0] or any(len(row) != len(matrix[0]) for row in matrix):
        raise ValueError("Require a nonempty rectangular matrix")
    return len(matrix), len(matrix[0])

def multiply(a, b):
    rows, inner = shape(a)
    other_inner, cols = shape(b)
    if inner != other_inner:
        raise ValueError("Inner dimensions must agree")
    return [[sum(a[i][k] * b[k][j] for k in range(inner)) for j in range(cols)] for i in range(rows)]

scale, shear = [[2, 0], [0, 1]], [[1, 1], [0, 1]]
for name, a, b in [("S H (shear first)", scale, shear), ("H S (scale first)", shear, scale)]:
    product = multiply(a, b)
    assert np.array_equal(np.array(product), np.array(a) @ np.array(b))
    print(name + ":", product, "; image of (1,1):", multiply(product, [[1], [1]]))
x, weights, bias = [[1, 0], [0, 1], [2, -1]], [[1, 2], [-1, 3]], [0.5, -0.5]
linear = multiply(x, weights)
affine = [[value + bias[j] for j, value in enumerate(row)] for row in linear]
reference = np.array(x) @ np.array(weights) + np.array(bias)
assert reference.shape == (3, 2) and np.array_equal(reference, np.array(affine))
print("Shapes X / W / bias / output:", shape(x), shape(weights), (len(bias),), shape(affine))
print("XW:", linear)
print("XW + bias:", affine)
for a, b in [([[1, 2]], [[1, 2]]), ([[1, 2], [3]], [[1], [2]])]:
    try:
        multiply(a, b)
    except ValueError as error:
        print("Rejected:", error)
