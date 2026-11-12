"""Read array shapes before the vector labs. Tested with NumPy 1.26.4."""
import numpy as np

items = [1, 2, 3]
vector = np.array(items, dtype=float)
row = vector[None, :]
column = vector[:, None]
print("NumPy:", np.__version__)
print("Python list + itself:", items + items)
print("Array + itself:", (vector + vector).tolist())
print("Shapes vector / row / column:", vector.shape, row.shape, column.shape)
print("Array dimensions / entries:", vector.ndim, vector.size)
table = np.array([[1, 2, 3], [4, 5, 6]], dtype=float)
print("Table shape:", table.shape)
print("Second row / first column:", table[1, :].tolist(), table[:, 0].tolist())
print("Row sums / column sums:", table.sum(axis=1).tolist(), table.sum(axis=0).tolist())
wrong = column + vector
assert wrong.shape == (3, 3)
print("Column + flat vector broadcasts to:", wrong.shape)
paired = column + vector[:, None]
assert paired.shape == (3, 1)
print("Paired column addition:", paired.shape, paired[:, 0].tolist())
print("Flat transpose keeps shape:", vector.T.shape)
print("Elementwise product:", (vector * vector).tolist())
print("Dot product scalar:", float(vector @ vector))
assert float(vector @ vector) == sum(x * x for x in items)
try:
    table + np.array([10.0, 20.0])
except ValueError:
    print("Rejected incompatible addition: (2,3) with (2,)")
print("Use dtype=float deliberately; floating calculations may need tolerances.")
