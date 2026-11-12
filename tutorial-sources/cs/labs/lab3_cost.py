"""Module 01, Lab 3: count comparisons instead of timing the computer."""


def search_with_cost(items, target):
    comparisons = 0
    for index, item in enumerate(items):
        comparisons += 1
        if item == target:
            return index, comparisons
    return -1, comparisons


for size in [0, 1, 4, 8, 16]:
    items = list(range(size))
    missing_index, missing_cost = search_with_cost(items, -1)
    first_index, first_cost = search_with_cost(items, 0)
    print(f"n={size:2}: absent={missing_cost:2}, first={first_cost:2}")
    assert missing_index == -1 and missing_cost == size
    assert first_index == (0 if size else -1)
    assert first_cost == (1 if size else 0)
