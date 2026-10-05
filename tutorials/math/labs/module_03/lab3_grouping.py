"""Equality of a declared key is an equivalence; shared keywords need not be."""


def main():
    records = (("r1", "Ada"), ("r2", " ADA "), ("r3", "Lin"), ("r4", "LIN"))
    groups = {}
    for identifier, name in records:
        key = name.strip().casefold()
        groups.setdefault(key, []).append(identifier)
    print("Groups by stripped, case-folded name:", groups)
    print("This key defines equality of labels, not proof of personal identity.")
    keywords = {"a": {"python"}, "b": {"python", "ai"}, "c": {"ai"}}

    def related(x, y):
        return bool(keywords[x] & keywords[y])

    print("a~b:", related("a", "b"), "b~c:", related("b", "c"), "a~c:", related("a", "c"))
    assert related("a", "b") and related("b", "c") and not related("a", "c")

    def greedy(order):
        result = []
        for item in order:
            for group in result:
                if related(item, group[0]):
                    group.append(item)
                    break
            else:
                result.append([item])
        return result

    print("Representative grouping, order a,b,c:", greedy(("a", "b", "c")))
    print("Representative grouping, order b,a,c:", greedy(("b", "a", "c")))
    print("Repair: use an explicit equivalence key or declare a different clustering objective.")


if __name__ == "__main__":
    main()
