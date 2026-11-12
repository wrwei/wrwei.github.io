"""Earliest-finish interval scheduling, checked against exhaustive search."""
from itertools import combinations
def compatible(intervals):
    ordered = sorted(intervals)
    return all(a[1] <= b[0] for a, b in zip(ordered, ordered[1:]))
def schedule(intervals):
    result, end = [], float("-inf")
    for start, finish in sorted(intervals, key=lambda item: item[1]):
        if start >= finish:
            raise ValueError("nonempty intervals required")
        if start >= end:
            result.append((start, finish)); end = finish
    return result

jobs = [(0, 4), (1, 2), (2, 3), (3, 5), (4, 6)]
chosen = schedule(jobs)
optimal = max(len(subset) for size in range(len(jobs)+1) for subset in combinations(jobs, size) if compatible(subset))
print("chosen:", chosen, "optimal count:", optimal)
assert len(chosen) == optimal == 3
assert schedule([]) == []
