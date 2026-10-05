"""Find all counterexamples to a changed parenthesisation of an access rule."""
from itertools import product


def intended(admin, owner, approved):
    return admin or (owner and approved)


def faulty(admin, owner, approved):
    return (admin or owner) and approved


def main():
    print("Rule: admin OR (owner AND approved)")
    mismatches = []
    for admin, owner, approved in product((False, True), repeat=3):
        want = intended(admin, owner, approved)
        got = faulty(admin, owner, approved)
        if want != got:
            mismatches.append((admin, owner, approved))
            print(f"admin={admin}, owner={owner}, approved={approved}: expected={want}, faulty={got}")
        repaired = admin or (owner and approved)
        assert repaired == want
    assert mismatches == [(True, False, False), (True, True, False)]
    print("Repair agrees on all 8 Boolean valuations.")
    requests = ("r1", "r2")
    reviewers = ("a", "b")
    approved_pairs = {("r1", "a"), ("r2", "b")}
    per_request = all(any((r, v) in approved_pairs for v in reviewers) for r in requests)
    one_for_all = any(all((r, v) in approved_pairs for r in requests) for v in reviewers)
    print("Every request has a reviewer:", per_request)
    print("One reviewer covers all requests:", one_for_all)


if __name__ == "__main__":
    main()
