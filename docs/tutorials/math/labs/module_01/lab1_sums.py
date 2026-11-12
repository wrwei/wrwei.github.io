"""Read finite sums and products. Run with Python 3.11+; no packages needed."""
from math import prod


def odd_sum(n):
    """Sum the first n positive odd integers; n must be a nonnegative int."""
    if isinstance(n, bool) or not isinstance(n, int) or n < 0:
        raise ValueError("n must be a nonnegative integer")
    terms = [2 * i + 1 for i in range(n)]
    return terms, sum(terms)


def rectangular_sum(rows, columns):
    """Sum 10*i+j for mathematical indices 1..rows and 1..columns."""
    return [[10 * i + j for j in range(1, columns + 1)]
            for i in range(1, rows + 1)]


if __name__ == "__main__":
    for n in (0, 1, 4, 6):
        terms, total = odd_sum(n)
        assert total == n * n
        print(f"n={n}: terms={terms}, sum={total}, n*n={n*n}")
    grid = rectangular_sum(2, 3)
    total = sum(sum(row) for row in grid)
    assert total == 102
    print(f"grid={grid}, double_sum={total}")
    assert sum([]) == 0 and prod([]) == 1
    print(f"empty_sum={sum([])}, empty_product={prod([])}")
    print("Checks passed on these inputs; examples alone are not a general proof.")
