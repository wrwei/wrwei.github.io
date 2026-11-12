"""Exact rational elimination with pivot selection and all three system classes."""
from fractions import Fraction

def echelon(coefficients, rhs):
    rows, cols = len(coefficients), len(coefficients[0])
    if len(rhs) != rows or any(len(row) != cols for row in coefficients):
        raise ValueError("Require rectangular coefficients and one RHS per row")
    augmented = [[Fraction(x) for x in row] + [Fraction(b)] for row, b in zip(coefficients, rhs)]
    pivot_row, pivots, events = 0, [], []
    for column in range(cols):
        if pivot_row == rows:
            break
        chosen = max(range(pivot_row, rows), key=lambda i: abs(augmented[i][column]))
        if augmented[chosen][column] == 0:
            continue  # No pivot in this column; it can be free.
        if chosen != pivot_row:
            augmented[chosen], augmented[pivot_row] = augmented[pivot_row], augmented[chosen]
            events.append(f"swap rows {pivot_row} and {chosen}")
        pivot = augmented[pivot_row][column]
        augmented[pivot_row] = [value / pivot for value in augmented[pivot_row]]
        for i in range(pivot_row + 1, rows):
            factor = augmented[i][column]
            augmented[i] = [a - factor * b for a, b in zip(augmented[i], augmented[pivot_row])]
        pivots.append(column)
        events.append(f"pivot row {pivot_row}, column {column}")
        pivot_row += 1
    inconsistent = any(all(value == 0 for value in row[:cols]) and row[cols] != 0 for row in augmented)
    status = "inconsistent" if inconsistent else "unique" if len(pivots) == cols else "underdetermined"
    return augmented, pivots, events, status

def solve_unique(rows, pivots):
    cols = len(rows[0]) - 1
    answer = [Fraction(0)] * cols
    for row_index in range(len(pivots) - 1, -1, -1):
        column = pivots[row_index]
        row = rows[row_index]
        answer[column] = row[-1] - sum(row[j] * answer[j] for j in range(column + 1, cols))
    return answer

cases = [
    ("pivoted unique", [[0, 2, 1], [1, -2, -3], [2, 3, 1]], [3, 0, 7]),
    ("inconsistent", [[1, 1], [2, 2]], [3, 7]),
    ("underdetermined", [[1, 1], [2, 2]], [3, 6]),
]
for name, coefficients, rhs in cases:
    rows, pivots, events, status = echelon(coefficients, rhs)
    print(name + ":", status)
    print("Events:", events)
    print("Echelon augmented rows:", [[str(value) for value in row] for row in rows])
    print("Pivot / free columns (zero based):", pivots, [j for j in range(len(coefficients[0])) if j not in pivots])
    if status == "unique":
        answer = solve_unique(rows, pivots)
        assert all(sum(Fraction(a) * x for a, x in zip(row, answer)) == b for row, b in zip(coefficients, rhs))
        assert answer == [1, 2, -1]
        print("Solution:", [str(x) for x in answer])
    assert status == ("unique" if name == "pivoted unique" else name)
print("All row operations used exact Fractions; a zero RHS row differs from a contradiction row.")
