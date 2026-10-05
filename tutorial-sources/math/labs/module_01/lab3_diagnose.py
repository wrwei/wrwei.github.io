"""Find counterexamples and repair a contract, an index range, and an identity."""
import math


def bad_odd_sum(n):
    return sum(2 * i + 1 for i in range(1, n))


def odd_sum(n):
    if isinstance(n, bool) or not isinstance(n, int) or n < 0:
        raise ValueError('n must be a nonnegative integer')
    return sum(2 * i + 1 for i in range(n))


def shifted_log(x):
    if x <= 1:
        raise ValueError('ln(x-1) requires x > 1')
    return math.log(x - 1)


if __name__ == '__main__':
    n = 4
    print(f'off-by-one: n={n}, faulty={bad_odd_sum(n)}, repaired={odd_sum(n)}, expected={n*n}')
    assert bad_odd_sum(n) != n * n and odd_sum(n) == n * n
    f = lambda x: x * x
    a, b = 2, 3
    print(f'non-additive square: f(a+b)={f(a+b)}, f(a)+f(b)={f(a)+f(b)}')
    assert f(a + b) != f(a) + f(b)
    lhs, rhs = math.log(a + b), math.log(a) + math.log(b)
    print(f'false log identity: ln(a+b)={lhs:.6f}, ln(a)+ln(b)={rhs:.6f}')
    assert not math.isclose(lhs, rhs)
    assert math.isclose(math.log(a * b), rhs)
    print(f'correct product identity: ln(a*b)={math.log(a*b):.6f}')
    for x in (1, 2):
        try:
            print(f'shifted_log({x})={shifted_log(x):.6f}')
        except ValueError as error:
            print(f'shifted_log({x}) rejected: {error}')
    for invalid in (-1, 2.5, True):
        try:
            odd_sum(invalid)
        except ValueError:
            print(f'odd_sum({invalid!r}) rejected')
        else:
            raise AssertionError('invalid input accepted')
    print('Repairs preserve the stated domains; counterexamples refute the false claims.')
