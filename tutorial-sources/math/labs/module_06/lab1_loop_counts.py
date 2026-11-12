"""Charge one operation per body entry, not elapsed time or every instruction."""


def counts(n):
    rectangular = triangular = doubling = 0
    for _ in range(n):
        for _ in range(n):
            rectangular += 1
    for i in range(n):
        for _ in range(i):
            triangular += 1
    i = 1
    while i <= n:
        doubling += 1
        i *= 2
    assert rectangular == n * n
    assert triangular == n * (n - 1) // 2
    assert doubling == n.bit_length()
    return rectangular, triangular, doubling


def main():
    print("n | rectangular body | triangular body | doubling body")
    for n in (0, 1, 4, 8, 16):
        print(n, "|", " | ".join(map(str, counts(n))))
    print("Body-entry counts exclude loop guards and integer-operation bit costs.")


if __name__ == "__main__":
    main()
