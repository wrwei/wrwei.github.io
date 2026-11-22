"""Helpers for the check blocks of the Calculus series (notes/AUTHORING.md, section 6).

A check block runs in a namespace that starts with `from sympy import *`, these helpers, and the
symbols x y z t u v w r s h k m n a b c theta (no assumptions). Each helper raises CheckFailed with
a readable message when the mathematics on the page is wrong.

    same(a, b)            a and b are equal: numbers, expressions, matrices, sets, lists/tuples
    same_set(a, b)        the same elements in any order (e.g. the solutions of an equation)
    antideriv(F, f, x)    F is an antiderivative of f with respect to x  (d/dx F = f)
    rounds(value, '2.718')  value rounded to the digits shown is exactly the text shown
    near(a, b, tol)       |a - b| <= tol (numerical results)
    holds(condition)      a true statement: a bool, or a SymPy relation such as 2 < pi
    steps(e1, e2, ...)    every step of a chain of equalities e1 = e2 = ... is right
    limit_is(f, x, a, L, dir='+-')   the limit of f as x -> a (from dir) is L
"""
from decimal import Decimal, ROUND_HALF_UP, localcontext

import sympy as sp

COUNT = [0]


class CheckFailed(AssertionError):
    pass


def _show(e):
    s = str(e)
    return s if len(s) < 300 else s[:300] + ' ...'


def _is_seq(a):
    return isinstance(a, (list, tuple)) or (isinstance(a, sp.Tuple))


def _eq(a, b):
    if _is_seq(a) and _is_seq(b):
        return len(a) == len(b) and all(_eq(p, q) for p, q in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return set(a) == set(b) and all(_eq(a[k], b[k]) for k in a)
    if isinstance(a, (set, frozenset)) and isinstance(b, (set, frozenset)):
        return _set_eq(list(a), list(b))
    if isinstance(a, bool) or isinstance(b, bool):
        return bool(a) is bool(b) if isinstance(a, bool) and isinstance(b, bool) else sp.sympify(a) == sp.sympify(b)
    a, b = sp.sympify(a), sp.sympify(b)
    if isinstance(a, sp.MatrixBase) or isinstance(b, sp.MatrixBase):
        if not (isinstance(a, sp.MatrixBase) and isinstance(b, sp.MatrixBase)) or a.shape != b.shape:
            return False
        return all(_eq(p, q) for p, q in zip(a, b))
    if isinstance(a, sp.Set) or isinstance(b, sp.Set):
        if not (isinstance(a, sp.Set) and isinstance(b, sp.Set)):
            return False
        if a == b:
            return True
        try:
            return bool(sp.simplify(a.symmetric_difference(b)) == sp.S.EmptySet)
        except Exception:
            return False
    if isinstance(a, sp.logic.boolalg.Boolean) and not isinstance(a, sp.Expr) or \
       isinstance(b, sp.logic.boolalg.Boolean) and not isinstance(b, sp.Expr):
        if a == b:
            return True
        try:
            return bool(sp.simplify(sp.Equivalent(a, b)) == sp.true)
        except Exception:
            return False
    if a == b:
        return True
    # Lines of an indefinite integration are equal up to a constant: their derivatives agree.
    d = a - b
    indefinite = [i for i in d.atoms(sp.Integral) if any(len(lim) == 1 for lim in i.limits)]
    if indefinite:
        vs = {lim[0] for i in indefinite for lim in i.limits}
        try:
            if all(_eq(sp.diff(d, v_), 0) for v_ in vs):
                return True
        except Exception:
            pass
    # Unevaluated integrals, derivatives, limits and sums: compare their values.
    if a.has(sp.Integral, sp.Derivative, sp.Limit, sp.Sum, sp.Product) or b.has(sp.Integral, sp.Derivative, sp.Limit, sp.Sum, sp.Product):
        try:
            ae, be = a.doit(), b.doit()
            if (ae, be) != (a, b) and _eq(ae, be):
                return True
        except Exception:
            pass
    if a.has(sp.oo, -sp.oo, sp.zoo, sp.nan) or b.has(sp.oo, -sp.oo, sp.zoo, sp.nan):
        return False
    try:
        if sp.simplify(a - b) == 0:
            return True
    except Exception:
        pass
    try:
        if sp.expand(sp.simplify(sp.expand_log(sp.expand_trig(a - b), force=False))) == 0:
            return True
    except Exception:
        pass
    try:
        return a.equals(b) is True
    except Exception:
        return False


def _set_eq(a, b):
    rest = list(b)
    for p in a:
        for i, q in enumerate(rest):
            if _eq(p, q):
                del rest[i]
                break
        else:
            return False
    return not rest


def same(a, b, msg=None):
    """a and b are mathematically equal."""
    COUNT[0] += 1
    if not _eq(a, b):
        raise CheckFailed((msg + ': ' if msg else '') + f'not equal:\n      {_show(a)}\n    and\n      {_show(b)}')


def same_set(a, b, msg=None):
    """The same elements, in any order."""
    COUNT[0] += 1
    a, b = list(a), list(b)
    if not _set_eq(a, b):
        raise CheckFailed((msg + ': ' if msg else '') + f'not the same elements:\n      {_show(a)}\n    and\n      {_show(b)}')


def antideriv(F, f, var, msg=None):
    """F is an antiderivative of f: dF/dvar = f."""
    COUNT[0] += 1
    d = sp.diff(sp.sympify(F), var)
    if not _eq(d, f):
        raise CheckFailed((msg + ': ' if msg else '') + f'the derivative of\n      {_show(F)}\n    is\n      {_show(sp.simplify(d))}\n    not\n      {_show(f)}')


def rounds(value, text, msg=None):
    """value, rounded to as many decimal places as text shows, is text ('2.718', '-0.50', '1.67e-6')."""
    COUNT[0] += 1
    t = str(text).replace('−', '-').replace(',', '').replace(' ', '')
    try:
        target = Decimal(t)
    except Exception:
        raise CheckFailed(f'rounds: cannot read the number {text!r}')
    v = sp.N(sp.sympify(value), 60)
    if not v.is_real or not v.is_finite:
        raise CheckFailed((msg + ': ' if msg else '') + f'rounds: {_show(value)} is not a finite real number ({_show(v)})')
    with localcontext() as ctx:
        ctx.prec = 80
        exact = Decimal(str(v))
        got = exact.quantize(target, rounding=ROUND_HALF_UP)
    if got != target:
        raise CheckFailed((msg + ': ' if msg else '') + f'{_show(value)} = {sp.N(v, 15)} rounds to {got}, not {text}')


def near(a, b, tol=1e-9, msg=None):
    """|a - b| <= tol."""
    COUNT[0] += 1
    d = abs(sp.N(sp.sympify(a) - sp.sympify(b), 30))
    if not (d <= tol):
        raise CheckFailed((msg + ': ' if msg else '') + f'{_show(a)} and {_show(b)} differ by {sp.N(d, 6)} (tolerance {tol})')


def holds(cond, msg=None):
    """A true statement: a Python bool or a SymPy relation/boolean without free symbols."""
    COUNT[0] += 1
    c = cond
    if not isinstance(c, bool):
        c = sp.sympify(c)
        if c not in (sp.true, sp.false):
            c = sp.simplify(c)
        c = (c == sp.true) or c is True
    if not c:
        raise CheckFailed((msg + ': ' if msg else '') + f'does not hold: {_show(cond)}')


def steps(*exprs, msg=None):
    """Every consecutive pair in a chain of equalities is equal."""
    COUNT[0] += 1
    if len(exprs) < 2:
        raise CheckFailed('steps needs at least two expressions')
    for i in range(len(exprs) - 1):
        if not _eq(exprs[i], exprs[i + 1]):
            raise CheckFailed((msg + ': ' if msg else '') + f'step {i + 1} -> {i + 2} is wrong:\n      {_show(exprs[i])}\n    is not\n      {_show(exprs[i + 1])}')


def limit_is(f, var, point, value, dir='+-', msg=None):
    """The limit of f as var -> point (dir '+', '-' or '+-') is value."""
    COUNT[0] += 1
    L = sp.limit(sp.sympify(f), var, point, dir)
    if not _eq(L, value):
        raise CheckFailed((msg + ': ' if msg else '') + f'the limit of {_show(f)} as {var} -> {point} ({dir}) is {_show(L)}, not {_show(value)}')


__all__ = ['same', 'same_set', 'antideriv', 'rounds', 'near', 'holds', 'steps', 'limit_is', 'CheckFailed']
