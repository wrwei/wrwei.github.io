"""Return one explicit witness for each failed property on a finite domain."""
from itertools import product


def failures(domain, relation):
    pairs = list(product(domain, repeat=2))
    triples = product(domain, repeat=3)
    return {
        "reflexive": next(((x, x) for x in domain if (x, x) not in relation), None),
        "symmetric": next(((x, y) for x, y in pairs if (x, y) in relation and (y, x) not in relation), None),
        "antisymmetric": next(((x, y) for x, y in pairs if x != y and (x, y) in relation and (y, x) in relation), None),
        "transitive": next(((x, y, z) for x, y, z in triples if (x, y) in relation and (y, z) in relation and (x, z) not in relation), None),
    }


def main():
    domain = (0, 1, 2)
    rules = {
        "same parity": lambda x, y: x % 2 == y % 2,
        "distance at most one": lambda x, y: abs(x - y) <= 1,
        "less than or equal": lambda x, y: x <= y,
        "strictly less": lambda x, y: x < y,
    }
    for name, rule in rules.items():
        relation = {(x, y) for x, y in product(domain, repeat=2) if rule(x, y)}
        result = failures(domain, relation)
        print(name)
        for property_name, witness in result.items():
            print(" ", property_name + ":", "holds" if witness is None else f"fails at {witness}")
    identity = {(x, x) for x in domain}
    assert all(witness is None for witness in failures(domain, identity).values())
    print("Identity is both symmetric and antisymmetric.")


if __name__ == "__main__":
    main()
