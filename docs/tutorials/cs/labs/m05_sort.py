"""Insertion sort counts key comparisons, not elapsed seconds."""
def insertion_sort(values):
    result = values.copy()
    comparisons = 0
    for i in range(1, len(result)):
        key, j = result[i], i - 1
        while j >= 0:
            comparisons += 1
            if result[j] <= key:
                break
            result[j + 1] = result[j]
            j -= 1
        result[j + 1] = key
    return result, comparisons

for values in [[], [1], [1, 2, 3, 4], [4, 3, 2, 1], [2, 1, 2]]:
    result, count = insertion_sort(values)
    assert result == sorted(values)
    print(values, "->", result, "comparisons:", count)
