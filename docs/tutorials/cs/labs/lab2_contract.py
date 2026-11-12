"""Module 01, Lab 2: make a contract executable with examples."""


def find_first(items, target):
    """Return the first matching index, or -1 if target is absent."""
    for index, item in enumerate(items):
        if item == target:
            return index
    return -1


cases = [
    ([], "Dune", -1),
    (["Dune"], "Dune", 0),
    (["Dune"], "Solaris", -1),
    (["Dune", "Solaris"], "Solaris", 1),
    (["Dune", "Solaris", "Dune"], "Dune", 0),
]

for items, target, expected in cases:
    actual = find_first(items, target)
    assert actual == expected, (items, target, expected, actual)
    print(f"{items!r}, {target!r} -> {actual}")

print("5 cases passed")
