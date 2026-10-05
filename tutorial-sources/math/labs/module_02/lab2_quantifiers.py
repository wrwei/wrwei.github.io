"""Witnesses over an explicitly finite catalogue, including empty domains."""


def investigate(xs, ys):
    predicate = lambda x, y: y == x + 1
    per_x = {x: [y for y in ys if predicate(x, y)] for x in xs}
    common = [y for y in ys if all(predicate(x, y) for x in xs)]
    every_has_some = all(any(predicate(x, y) for y in ys) for x in xs)
    some_for_every = any(all(predicate(x, y) for x in xs) for y in ys)
    negation = any(all(not predicate(x, y) for y in ys) for x in xs)
    assert negation == (not every_has_some)
    return per_x, common, every_has_some, some_for_every


def main():
    xs = (-1, 0, 1)
    for ys in ((-2, -1, 0, 1, 2), (-1, 0, 1)):
        witnesses, common, forall_exists, exists_forall = investigate(xs, ys)
        print("X =", xs, "Y =", ys)
        print("Per-input witnesses:", witnesses)
        print("Common witnesses:", common)
        print("forall x exists y:", forall_exists, "exists y forall x:", exists_forall)
    for xs, ys in (((), (0,)), ((0,), ()), ((), ())):
        result = investigate(xs, ys)
        print("Empty case X =", xs, "Y =", ys, "results:", result[2:])
    print("These checks concern these catalogues, not all integers.")


if __name__ == "__main__":
    main()
