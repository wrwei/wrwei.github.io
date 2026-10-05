"""Expose a missing induction base and a non-decreasing recursive measure."""


def main():
    print("Proposed identity: sum of first n odd numbers = n^2 + 1")
    for n in range(4):
        actual = sum(2 * i + 1 for i in range(n))
        candidate = n * n + 1
        step_matches = candidate + 2 * n + 1 == (n + 1) ** 2 + 1
        print(f"n={n}: actual={actual}, candidate={candidate}, proposed step consistent={step_matches}")
    print("Base at n=0 fails: 0 != 1. A valid algebraic step does not supply a base.")
    faulty_trace = [5] * 5
    correct_trace = list(range(5, -1, -1))
    print("Bounded illustration of faulty calls countdown(n):", faulty_trace)
    print("Correct calls countdown(n-1):", correct_trace)
    faulty_decreases = all(b < a for a, b in zip(faulty_trace, faulty_trace[1:]))
    correct_decreases = all(b < a for a, b in zip(correct_trace, correct_trace[1:]))
    assert not faulty_decreases and correct_decreases
    print("Natural-number measure strictly decreases:", faulty_decreases, correct_decreases)
    print("Five displayed faulty calls are a trace limit, not termination of that recursion.")


if __name__ == "__main__":
    main()
