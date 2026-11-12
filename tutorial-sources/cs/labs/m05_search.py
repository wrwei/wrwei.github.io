"""Binary search maintains a half-open candidate interval [lo, hi)."""
def binary_search(items, target):
    lo, hi, probes = 0, len(items), 0
    while lo < hi:
        mid = (lo + hi) // 2
        probes += 1
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    found = lo if lo < len(items) and items[lo] == target else -1
    return found, probes

for size in [0, 1, 8, 16, 32]:
    items = list(range(size))
    found, probes = binary_search(items, size)
    assert found == -1
    print(f"n={size:2}, absent insertion point={size:2}, probes={probes}")
assert binary_search([1, 2, 2, 4], 2)[0] == 1
assert binary_search([], 1) == (-1, 0)
print("duplicate case returns first match")
