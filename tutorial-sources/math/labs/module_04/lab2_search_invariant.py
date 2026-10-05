"""First-match search with assertions at the loop head and a separate variant."""


def first_match(items, target):
    n, i = len(items), 0
    while i < n:
        invariant = 0 <= i <= n and all(value != target for value in items[:i])
        assert invariant
        print(f"  head: i={i}, prefix={items[:i]}, invariant={invariant}, variant={n-i}")
        if items[i] == target:
            assert all(value != target for value in items[:i])
            return i
        previous_variant = n - i
        i += 1
        assert n - i < previous_variant
    assert i == n and all(value != target for value in items)
    print(f"  exit: i={i}, invariant=True, variant=0")
    return -1


def main():
    cases = [([2, 5, 2, 7], 7, 3), ([2, 5, 2, 7], 3, -1), ([4, 9, 4], 4, 0), ([], 9, -1)]
    for items, target, expected in cases:
        print("items=", items, "target=", target)
        result = first_match(items, target)
        assert result == expected
        print("  result=", result)
    print("Assertions check these executions; the lesson proves the general obligations.")


if __name__ == "__main__":
    main()
