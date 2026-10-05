"""Exact rational pivots and four spaces; no floating-point zero decisions."""
from fractions import Fraction

def rref(matrix):
    if not matrix or not matrix[0] or any(len(r) != len(matrix[0]) for r in matrix):
        raise ValueError("Need a nonempty rectangular matrix")
    rows = [[Fraction(v) for v in row] for row in matrix]
    pivots, active = [], 0
    for column in range(len(rows[0])):
        selected = next((i for i in range(active, len(rows)) if rows[i][column]), None)
        if selected is None:
            continue
        rows[active], rows[selected] = rows[selected], rows[active]
        pivot = rows[active][column]
        rows[active] = [v / pivot for v in rows[active]]
        for i in range(len(rows)):
            if i != active:
                factor = rows[i][column]
                rows[i] = [a - factor * b for a, b in zip(rows[i], rows[active])]
        pivots.append(column)
        active += 1
        if active == len(rows):
            break
    return rows, pivots

def null_basis(matrix):
    rows, pivots = rref(matrix)
    free = [j for j in range(len(rows[0])) if j not in pivots]
    basis = []
    for j in free:
        vector = [Fraction(0)] * len(rows[0])
        vector[j] = 1
        for i, p in enumerate(pivots):
            vector[p] = -rows[i][j]
        basis.append(vector)
    return basis

def matvec(matrix, vector):
    return [sum(a * b for a, b in zip(row, vector)) for row in matrix]

if __name__ == "__main__":
    A = [[1, 0, 1], [0, 1, 1], [1, 1, 2]]
    reduced, pivots = rref(A)
    column_basis = [[row[j] for row in A] for j in pivots]
    row_basis = reduced[:len(pivots)]
    kernel = null_basis(A)
    transpose = [list(col) for col in zip(*A)]
    left_kernel = null_basis(transpose)
    strings = lambda rows: [[str(v) for v in row] for row in rows]
    print("RREF:", strings(reduced))
    print("Original pivot columns:", column_basis)
    print("Row-space basis:", strings(row_basis))
    print("Null / left-null bases:", strings(kernel), strings(left_kernel))
    assert all(matvec(A, v) == [0, 0, 0] for v in kernel)
    assert all(matvec(transpose, v) == [0, 0, 0] for v in left_kernel)
    assert len(pivots) == 2 and len(kernel) == 1
    print("Rank / nullity / left nullity:", len(pivots), len(kernel), len(left_kernel))
    for target in [[2, 3, 5], [2, 3, 6]]:
        certificate = sum(a*b for a, b in zip(left_kernel[0], target))
        print("Target / left-null certificate:", target, str(certificate), "consistent" if certificate == 0 else "inconsistent")
    for matrix in [[[0, 0], [0, 0]], [[1, 0], [0, 1]], [[1, 2], [2, 4]]]:
        _, p = rref(matrix)
        assert len(p) + len(null_basis(matrix)) == len(matrix[0])
    print("Zero, identity, and dependent cases satisfy exact rank-nullity.")
