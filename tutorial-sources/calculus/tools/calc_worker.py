"""Worker process of tools/calc.py: runs one job given as JSON on stdin, answers JSON on stdout.

    {"mode": "session", "blocks": [{"code": ..., "fails": bool, "label": ...}]}
        Runs the python blocks of one compute box (or solution) in one namespace, in order, as a
        script would. For each block: what it printed, what it wrote to stderr, and the error it
        raised (the last line of the traceback, as Python prints it).

    {"mode": "checks", "blocks": [{"code": ..., "label": ...}], "tables": [{"spec": [...], "label": ...}]}
        Runs a page's check blocks in one namespace (sympy, the helpers of calccheck.py and common
        symbols) and computes its value tables. For each check block: the number of checks it made,
        the failure or error, the time it took. For each table: the computed rows, or an error.
"""
import contextlib
import io
import json
import sys
import time
import traceback
import warnings


def run_session(job):
    ns = {'__name__': '__main__'}
    results = []
    uses_mpl = any('matplotlib' in b['code'] for b in job['blocks'])
    if uses_mpl:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        plt.show = lambda *a, **k: None   # a reader sees a window; here nothing is shown
    for b in job['blocks']:
        out, err = io.StringIO(), io.StringIO()
        error = None
        with warnings.catch_warnings():
            warnings.simplefilter('default')
            with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
                try:
                    code = compile(b['code'], b['label'], 'exec')
                    exec(code, ns)
                except SystemExit:
                    error = 'SystemExit'
                except BaseException as e:   # noqa: BLE001 - every error is reported to the author
                    error = traceback.format_exception_only(type(e), e)[-1].strip()
                    if not b.get('fails'):
                        tb = traceback.format_exc().strip().splitlines()
                        error = error + '\n' + '\n'.join(tb[-8:])
        results.append({'stdout': out.getvalue(), 'stderr': err.getvalue(), 'error': error})
    return {'results': results}


# ---------------------------------------------------------------- checks and value tables

def check_namespace():
    import sympy
    import calccheck
    ns = {'__name__': '__checks__'}
    exec('from sympy import *', ns)
    exec('from sympy.calculus.util import function_range, continuous_domain, periodicity, minimum, maximum', ns)
    for k in calccheck.__all__:
        ns[k] = getattr(calccheck, k)
    names = 'x y z t u v w r s h k m n a b c theta'
    for name, sym in zip(names.split(), sympy.symbols(names)):
        ns[name] = sym
    return ns


def run_checks(job):
    import calccheck
    ns = check_namespace()
    results = []
    for b in job['blocks']:
        before = calccheck.COUNT[0]
        t0 = time.time()
        failure = None
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(compile(b['code'], b['label'], 'exec'), ns)
        except calccheck.CheckFailed as e:
            failure = str(e)
        except BaseException as e:   # noqa: BLE001
            tb = traceback.format_exc().strip().splitlines()
            failure = 'error: ' + traceback.format_exception_only(type(e), e)[-1].strip() + '\n' + '\n'.join('      ' + l for l in tb[-6:])
        results.append({'checks': calccheck.COUNT[0] - before, 'failure': failure, 'seconds': round(time.time() - t0, 2)})
    tables = []
    for tb in job.get('tables', []):
        try:
            tables.append({'rows': compute_table(tb['spec'])})
        except Exception as e:   # noqa: BLE001
            tables.append({'error': f'{type(e).__name__}: {e}'})
    return {'results': results, 'tables': tables}


def split_top(s):
    """Split on commas that are not inside brackets."""
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([{':
            depth += 1
        elif ch in ')]}':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur.strip())
            cur = ''
        else:
            cur += ch
    if cur.strip():
        parts.append(cur.strip())
    return parts


def fmt_number(v, digits=6, decimals=None, sci=None):
    """A number (a SymPy Float computed to 40 digits) as LaTeX: exact when it is a short decimal,
    else rounded to `digits` significant digits (or to `decimals` places)."""
    import sympy as sp
    from decimal import Decimal, ROUND_HALF_UP, localcontext
    with localcontext() as ctx:
        ctx.prec = 60
        d = Decimal(str(sp.N(v, 40)))
        if d.is_zero():
            return '0'
        if decimals is not None:
            q = d.quantize(Decimal(1).scaleb(-int(decimals)), rounding=ROUND_HALF_UP)
            return format(q, 'f')
        exp = d.adjusted()
        use_sci = (exp < -4 or exp >= 6) if sci is None else (sci == 'yes')
        # A short exact decimal (1.9, 0.25, 2): the 40-digit value has nothing after its first few digits.
        short = d.quantize(Decimal(1).scaleb(exp - digits + 1), rounding=ROUND_HALF_UP)
        exact = abs(short - d) <= abs(d) * Decimal(10) ** -36
        r = short.normalize() if exact else short
        if not exact and r.adjusted() != exp:   # rounding carried into a new digit (9.9999995 -> 10.0000)
            r = d.quantize(Decimal(1).scaleb(r.adjusted() - digits + 1), rounding=ROUND_HALF_UP)
        if not use_sci:
            return format(r, 'f')
        e = r.adjusted()
        return f'{format(r.scaleb(-e), "f")}\\times10^{{{e}}}'


def compute_table(spec):
    import sympy as sp
    lines = [l for l in spec if l.strip()]
    opts = {'digits': 6, 'decimals': None, 'layout': 'rows', 'sci': None}
    var_line, cols = None, []
    for l in lines:
        s = l.strip()
        key = s.split('=')[0].strip()
        if key in ('digits', 'decimals', 'layout', 'sci') and '=' in s:
            v = s.split('=', 1)[1].strip()
            opts[key] = int(v) if key in ('digits', 'decimals') else v
        elif s.startswith('$'):
            end = s.index('$', 1)
            header = s[1:end]
            rest = s[end + 1:].strip()
            if not rest.startswith('='):
                raise ValueError(f'a column line needs "$LATEX$ = EXPRESSION": {s}')
            cols.append((header, rest[1:].strip()))
        elif var_line is None and '=' in s:
            var_line = s
        else:
            raise ValueError(f'cannot read the line: {s}')
    if var_line is None or not cols:
        raise ValueError('a value table needs a line "x = values" and at least one column "$LATEX$ = expression"')
    name, values = var_line.split('=', 1)
    name = name.strip()
    var = sp.Symbol(name)
    loc = {name: var}
    header = [sp.latex(var)] + [h for h, _ in cols]
    exprs = [sp.sympify(e, locals=loc) for _, e in cols]
    rows = [header]
    for vs in split_top(values):
        if __import__('re').fullmatch(r'-?\d+(\.\d+)?([eE]-?\d+)?', vs):
            val = sp.nsimplify(vs, rational=True)
            shown = vs if 'e' not in vs.lower() else sp.latex(sp.Float(vs))
        else:
            val = sp.sympify(vs, locals=loc)
            shown = sp.latex(val)
        row = [shown]
        for e in exprs:
            try:
                y = e.evalf(40, subs={var: val})
            except (ZeroDivisionError, ValueError):
                row.append('undefined')
                continue
            if y.has(sp.zoo, sp.nan, sp.oo, -sp.oo) or not y.is_number or y.is_real is False:
                row.append('undefined')
                continue
            if y.is_real is None:
                y = sp.re(y) if abs(sp.im(y)) < 1e-30 else y
            row.append(fmt_number(y, opts['digits'], opts['decimals'], opts['sci']))
        rows.append(row)
    return rows


def main():
    job = json.loads(sys.stdin.read())
    if job['mode'] == 'session':
        res = run_session(job)
    else:
        sys.path.insert(0, job['tools'])
        res = run_checks(job)
    sys.stdout.write(json.dumps(res))


if __name__ == '__main__':
    main()
