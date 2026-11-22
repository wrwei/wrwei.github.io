/* newton-method (Module 7): step Newton's method x(n+1) = x(n) − f(x(n))/f′(x(n)) from a starting point x0.
 * Each step draws the tangent at the current point down to the x-axis, where the next point is. A table lists
 * the iterates, f at each, and the number of correct decimal places against a reference root found by
 * bisection to double precision, so the reader sees the correct digits roughly double. Failures (f′ = 0,
 * leaving the domain, cycling, running away) stop the method with a message. */
CalcWidgets.register('newton-method', function (root, api) {
  var t = api.t, h = api.h
  var SUB = '₀₁₂₃₄₅₆₇₈₉'
  function sub(n) { return String(n).split('').map(function (c) { return SUB[+c] }).join('') }
  function minus(s) { return String(s).replace(/-/g, '−') }

  var PRESETS = [
    { value: 'sq', label: 'x² − 2', src: 'x^2 - 2', x0: 1, xr: [-3, 3],
      f: function (x) { return x * x - 2 }, df: function (x) { return 2 * x }, dtext: 'f′(x) = 2x' },
    { value: 'cos', label: 'cos x − x', src: 'cos(x) - x', x0: 1, xr: [-2, 3],
      f: function (x) { return Math.cos(x) - x }, df: function (x) { return -Math.sin(x) - 1 }, dtext: 'f′(x) = −sin x − 1' },
    { value: 'cubic', label: 'x³ − 2x − 5', src: 'x^3 - 2x - 5', x0: 3, xr: [-1, 3.5],
      f: function (x) { return x * x * x - 2 * x - 5 }, df: function (x) { return 3 * x * x - 2 }, dtext: 'f′(x) = 3x² − 2' },
    { value: 'cycle', label: 'x³ − 2x + 2', src: 'x^3 - 2x + 2', x0: 0, xr: [-2.5, 2],
      f: function (x) { return x * x * x - 2 * x + 2 }, df: function (x) { return 3 * x * x - 2 }, dtext: 'f′(x) = 3x² − 2' },
    { value: 'cbrt', label: '∛x', src: 'x^(1/3)', x0: 1, xr: [-5, 5],
      f: Math.cbrt, df: function (x) { var c = Math.cbrt(x); return 1 / (3 * c * c) }, dtext: 'f′(x) = 1/(3x^(2/3))',
      // x − ∛x/(1/(3x^(2/3))) = x − 3x = −2x: computed exactly, without the rounding of the general formula
      step: function (x) { return -2 * x } },
  ]
  var OWN = 'own'
  var MAX_STEPS = 60

  // f′ of a typed function: central differences with Richardson extrapolation (error about 1e-12 relative).
  function nderiv(f) {
    return function (x) {
      var hh = 1e-3 * Math.max(1, Math.abs(x))
      function D(s) { return (f(x + s) - f(x - s)) / (2 * s) }
      return (4 * D(hh / 2) - D(hh)) / 3
    }
  }
  function safe(f) { return function (x) { var y; try { y = f(x) } catch (e) { y = NaN } return typeof y === 'number' ? y : NaN } }
  function ulp(x) { var a = Math.abs(x); if (a === 0 || !isFinite(a)) return 5e-324; return Math.pow(2, Math.floor(Math.log2(a)) - 52) }

  // ------------------------------------------------------------------ the reference root
  // Bisection on [a, b] (f(a), f(b) of opposite signs) until the interval cannot be halved in double precision.
  function bisect(f, a, b) {
    var fa = f(a)
    for (var k = 0; k < 2200; k++) {
      var m = a + (b - a) / 2
      if (m <= a || m >= b) break
      var fm = f(m)
      if (fm === 0) return m
      if (!isFinite(fm)) return null
      if ((fm < 0) === (fa < 0)) { a = m; fa = fm } else b = m
    }
    return Math.abs(f(a)) <= Math.abs(f(b)) ? a : b
  }
  // A root close to c, confirmed by a change of sign and pinned down by bisection; null if f does not change sign.
  function bracketNear(f, c) {
    for (var k = 0; k <= 15; k++) {
      var d = Math.max(1, Math.abs(c)) * 1e-15 * Math.pow(10, k)
      var a = c - d, b = c + d, fa = f(a), fb = f(b)
      if (!isFinite(fa) || !isFinite(fb)) continue
      if (fa === 0) return a
      if (fb === 0) return b
      if ((fa < 0) !== (fb < 0)) return bisect(f, a, b)
    }
    return null
  }
  // The roots of f on [lo, hi]: sign changes on a grid, each refined by bisection.
  function scan(f, lo, hi) {
    var N = 2000, out = [], xp = lo, fp = f(lo)
    if (fp === 0) out.push(lo)
    for (var i = 1; i <= N; i++) {
      var xq = lo + (hi - lo) * i / N, fq = f(xq)
      if (fq === 0) out.push(xq)
      else if (isFinite(fp) && isFinite(fq) && fp !== 0 && (fp < 0) !== (fq < 0)) {
        var r = bisect(f, xp, xq)
        if (r !== null && Math.abs(f(r)) < 1e-6) out.push(r)      // not a jump such as tan x at π/2
      }
      xp = xq; fp = fq
    }
    return out
  }
  // The root the iterates head for: run Newton's method to double precision, then confirm by bisection.
  // If Newton's method does not converge, the root of f nearest to x0 in the picture (by bisection).
  function reference(fn, x0, xr) {
    var f = fn.f, df = fn.df, x = x0, conv = null, small = 0
    for (var k = 0; k < 300; k++) {
      var fx = f(x)
      if (!isFinite(fx)) break
      if (fx === 0) { conv = x; break }
      var d = df(x)
      if (!isFinite(d) || d === 0) break
      var nx = fn.step ? fn.step(x) : x - fx / d
      if (!isFinite(nx) || Math.abs(nx) > 1e12) break
      if (nx === x) { conv = x; break }
      small = Math.abs(nx - x) <= 4 * ulp(x) ? small + 1 : 0
      if (small >= 3) { conv = nx; break }    // only the last binary digits still change
      x = nx
    }
    if (conv !== null) {
      var b = bracketNear(f, conv)
      return b !== null ? { r: b, how: 'bisect' } : { r: conv, how: 'newton' }
    }
    var lo = Math.min(xr[0], x0), hi = Math.max(xr[1], x0), roots = scan(f, lo, hi)
    if (!roots.length) return null
    roots.sort(function (p, q) { return Math.abs(p - x0) - Math.abs(q - x0) })
    return { r: roots[0], how: 'nearest' }
  }

  // x(n) is correct to d decimal places when |x(n) − r| < 0.5 × 10^(−d); at most what double precision can tell.
  // At 0.5 or more from r it has no correct decimals at all: −1, shown as "none".
  function decimals(x, r) {
    if (r === null || !isFinite(x)) return null
    var cap = Math.max(0, Math.min(20, Math.floor(-Math.log10(2 * ulp(r)))))
    var err = Math.abs(x - r)
    if (err === 0) return cap
    if (2 * err >= 1) return -1
    return Math.max(0, Math.min(cap, Math.floor(-Math.log10(2 * err))))
  }

  // ------------------------------------------------------------------ numbers as text
  function fmtX(x) {
    if (!isFinite(x)) return '—'
    if (x === 0) return '0'
    var a = Math.abs(x)
    if (a !== 0 && (a >= 1e6 || a < 1e-4)) return fmtSci(x, 10)
    return minus(x.toPrecision(16))
  }
  function fmtSci(v, sig) {
    if (v === 0) return '0'
    if (!isFinite(v)) return t('undefined', '无定义')
    var s = v.toExponential(sig - 1), parts = s.split('e'), e = parseInt(parts[1], 10)
    if (e === 0) return minus(parts[0])
    var sup = String(e).replace(/-/, '⁻').replace(/\d/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] })
    return minus(parts[0]) + ' × 10' + sup
  }

  // ------------------------------------------------------------------ state
  var state = { preset: PRESETS[0], fn: null, x0: 1, it: [], done: false, msg: '', kind: '', ref: null, view: null }

  function fnFromPreset(p) { return { f: p.f, df: p.df, step: p.step, exact: true, dtext: p.dtext, xr: p.xr } }

  var sel = api.select({
    label: t('Function', '函数'), value: 'sq',
    options: PRESETS.map(function (p) { return { value: p.value, label: 'f(x) = ' + p.label } })
      .concat([{ value: OWN, label: t('Your own (type it below)', '自己输入（在下面输入）') }]),
    onchange: function (v) {
      if (v === OWN) { field.input.focus(); fromField(field.get()); return }
      var p = PRESETS.filter(function (q) { return q.value === v })[0]
      state.preset = p
      field.set(p.src); field.error('')
      state.fn = fnFromPreset(p)
      setX0(p.x0)
      reset()
    },
  })
  var field = api.field({ label: 'f(x) =', value: PRESETS[0].src, size: 16, onchange: function (v) { sel.set(OWN); fromField(v) } })
  function fromField(src) {
    var res = api.Expr.parse(src, ['x'])
    if (!res.ok) {
      field.error(res.error)
      state.fn = null
      reset()
      return
    }
    field.error('')
    var f = safe(res.f)
    state.fn = { f: f, df: nderiv(f), exact: false, xr: [-4, 4] }
    reset()
  }
  var slider = api.slider({
    label: t('Starting point x₀', '初始点 x₀'), min: -4, max: 4, step: 0.05, value: 1,
    fmt: function (v) { return minus(String(Math.round(v * 100) / 100)) },
    oninput: function (v) { state.x0 = v; reset() },
  })
  function setX0(v) { state.x0 = v; slider.set(v) }
  var stepBtn = api.button(t('Step', '迭代一步'), function () { step() }, { primary: true })
  var resetBtn = api.button(t('Reset', '复位'), function () { reset() })
  var formulaEl = h('div', { class: 'nm-formula' })
  var plotBox = h('div', { class: 'nm-plot' })
  var key = h('div', { class: 'nm-key' }, t('Orange: the tangent at each point, down to the x-axis, where the next point is. Green circle: the reference root r.',
    '橙色：每一点处的切线，一直延伸到 x 轴，交点就是下一个点。绿色圆圈：参考根 r。'))
  var msgEl = api.readout()
  msgEl.classList.add('nm-msg')
  var refEl = h('div', { class: 'nm-ref' })
  var tbody = h('tbody')
  var table = h('table', { class: 'cw-table nm-table' },
    h('thead', {}, h('tr', {}, h('th', { text: 'n' }), h('th', { text: 'xₙ' }), h('th', { text: t('correct', '正确位数') }),
      h('th', { text: 'f(xₙ)' }))), tbody)
  var tableBox = h('div', { class: 'cw-scroll nm-scroll', tabindex: '0', role: 'region', 'aria-label': t('Table of iterates', '迭代值表') }, table)
  var note = h('div', { class: 'nm-note' }, t('correct: the number of correct decimal places of xₙ. xₙ is correct to d decimal places when |xₙ − r| < 0.5 × 10⁻ᵈ, and has none when |xₙ − r| ≥ 0.5.',
    '正确位数：xₙ 正确的小数位数。当 |xₙ − r| < 0.5 × 10⁻ᵈ 时，称 xₙ 精确到小数点后 d 位；当 |xₙ − r| ≥ 0.5 时，没有正确的小数位（显示“无”）。'))

  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(api.row(h('div', { class: 'nm-x0' }, slider.el), stepBtn, resetBtn))
  root.appendChild(formulaEl)
  root.appendChild(plotBox)
  root.appendChild(key)
  root.appendChild(msgEl)
  root.appendChild(refEl)
  root.appendChild(tableBox)
  root.appendChild(note)
  api.css('newton-method', [
    '.nm-x0{flex:1 1 260px;min-width:0}',
    '.nm-x0 .cw-slider{width:100%}',
    '.nm-formula{font:600 .95rem var(--font-mono);color:var(--blue);margin:.35rem 0}',
    '.nm-formula span{display:inline-block;margin-right:1.4rem;white-space:nowrap}',
    '.nm-key,.nm-note{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.nm-ref{font-size:.85rem;color:var(--navy);margin:.3rem 0 .4rem;overflow-wrap:anywhere}',
    '.nm-ref b{font-family:var(--font-mono);font-weight:600}',
    '.nm-scroll{max-height:15.5rem;overflow:auto;border:1px solid var(--border);border-radius:8px}',
    '.nm-table{width:100%}',
    '.nm-table th,.nm-table td{white-space:nowrap}',
    '@media (max-width:520px){.nm-table{font-size:.7rem}.nm-table th,.nm-table td{padding:.22rem .32rem}}',
    '.nm-table th{position:sticky;top:0;z-index:1;color:var(--navy);text-align:right}',
    '.nm-table td:nth-child(2){font-variant-numeric:tabular-nums}',
    '.nm-table tr.nm-new td{background:#F0F9FF}',
    '.nm-msg:empty{display:none}',
    '.nm-msg.nm-bad{border-color:var(--red);color:#991B1B;background:#FEF2F2}',
    '.nm-msg.nm-good{border-color:var(--green);color:#14532D;background:#F0FDF4}',
  ].join(''))

  // ------------------------------------------------------------------ the picture
  // The view: x0, every iterate and the reference root, with a margin (at least 2 units wide);
  // y from the graph over that range, ignoring the most extreme 2% of values at each end.
  function fitView() {
    var fn = state.fn, pts = [state.x0]
    state.it.forEach(function (p) { if (isFinite(p.x) && Math.abs(p.x) < 1e7) pts.push(p.x) })
    if (state.ref) pts.push(state.ref.r)
    var lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts)
    var pad = Math.max((hi - lo) * 0.3, (2 - (hi - lo)) / 2, 0)
    lo -= pad; hi += pad
    var ys = []
    if (fn) for (var i = 0; i <= 300; i++) { var y = fn.f(lo + (hi - lo) * i / 300); if (isFinite(y)) ys.push(y) }
    ys.sort(function (p, q) { return p - q })
    var ylo = ys.length ? ys[Math.floor(ys.length * 0.02)] : -1, yhi = ys.length ? ys[Math.min(ys.length - 1, Math.ceil(ys.length * 0.98))] : 1
    state.it.forEach(function (p) { if (isFinite(p.fx) && Math.abs(p.fx) < 1e7) { ylo = Math.min(ylo, p.fx); yhi = Math.max(yhi, p.fx) } })
    ylo = Math.min(ylo, 0); yhi = Math.max(yhi, 0)
    if (yhi - ylo < 1e-9) { ylo -= 1; yhi += 1 }
    var yp = (yhi - ylo) * 0.12
    return [lo, hi, ylo - yp, yhi + yp]
  }
  var P = api.plot(plotBox, {
    view: [-3, 3, -3, 3], aspect: 0.58, label: t("Newton's method: the graph of f, the tangent lines and the iterates", '牛顿法：f 的图像、切线和迭代点'),
    draw: function (P) {
      P.axes()
      var fn = state.fn
      if (!fn) return
      P.curve(fn.f, { color: 'var(--blue)', width: 2.4 })
      if (state.ref) P.point(state.ref.r, 0, { color: 'var(--green)', hollow: true, r: 6 })
      var it = state.it, labels = []
      for (var k = 0; k + 1 < it.length; k++) {
        var a = it[k], b = it[k + 1], last = k + 2 === it.length
        if (!isFinite(b.x)) continue
        var ln = P.line(a.x, a.fx, b.x, 0, { color: 'var(--orange)', width: last ? 2.2 : 1.6, opacity: last ? 1 : 0.55 })
        ln.setAttribute('class', 'nm-tangent')
        if (isFinite(b.fx)) P.line(b.x, 0, b.x, b.fx, { color: 'var(--slate)', width: 1.1, dash: '4 3' })
      }
      it.forEach(function (p, k) {
        if (!isFinite(p.x)) return
        if (isFinite(p.fx)) P.point(p.x, p.fx, { color: 'var(--navy)', r: 4 })
        P.point(p.x, 0, { color: 'var(--orange)', r: 3.5 })
        var px = P.X(p.x)
        if (k < 8 && labels.every(function (q) { return Math.abs(q - px) > 22 })) {
          labels.push(px)
          P.text(p.x, 0, 'x' + sub(k), { anchor: 'middle', dy: p.fx > 0 ? 31 : -10 })   // below the tick labels, or above the axis
        }
      })
    },
  })

  // ------------------------------------------------------------------ the method
  function say(text, kind) {
    state.msg = text; state.kind = kind || ''
    msgEl.textContent = text
    msgEl.classList.toggle('nm-bad', kind === 'bad')
    msgEl.classList.toggle('nm-good', kind === 'good')
  }
  function stop(text, kind) { state.done = true; say(text, kind) }

  function reset() {
    state.it = []; state.done = false; say('')
    var fn = state.fn
    if (!fn) {
      state.ref = null
      stop(t('Fix the formula to continue.', '请先改正公式。'), 'bad')
      render(); return
    }
    var fx = fn.f(state.x0)
    state.it.push({ x: state.x0, fx: fx })
    state.ref = reference(fn, state.x0, fn.xr)
    if (!isFinite(fx)) stop(t('f is not defined at x₀ = ' + minus(state.x0) + ': choose another starting point.',
      'f 在 x₀ = ' + minus(state.x0) + ' 处无定义：请换一个初始点。'), 'bad')
    else if (fx === 0) stop(t('f(x₀) = 0: x₀ is already a root.', 'f(x₀) = 0：x₀ 本身就是根。'), 'good')
    render()
  }

  function step() {
    if (state.done || !state.fn) return
    var fn = state.fn, it = state.it, n = it.length - 1, cur = it[n]
    var d = fn.df(cur.x), N = 'x' + sub(n), N1 = 'x' + sub(n + 1)
    if (d === 0) {
      stop(t('f′(' + N + ') = 0: the tangent is horizontal and never meets the x-axis, so there is no next point. Choose another x₀.',
        'f′(' + N + ') = 0：切线是水平的，与 x 轴不相交，所以没有下一个点。请换一个 x₀。'), 'bad')
      render(); return
    }
    if (isFinite(d) && Math.abs(cur.fx / d) > 1e12) {
      stop(t('f′(' + N + ') is almost 0: the tangent is almost horizontal, and it meets the x-axis more than 10¹² units away. Choose another x₀.',
        'f′(' + N + ') 几乎为 0：切线几乎是水平的，它与 x 轴的交点在 10¹² 个单位以外。请换一个 x₀。'), 'bad')
      render(); return
    }
    if (!isFinite(d)) {
      stop(t('f′(' + N + ') could not be computed (f is not differentiable there, or not defined on both sides): the method cannot continue.',
        '无法计算 f′(' + N + ')（f 在该点不可导，或在两侧没有定义）：方法无法继续。'), 'bad')
      render(); return
    }
    var nx = fn.step ? fn.step(cur.x) : cur.x - cur.fx / d
    var fnx = fn.f(nx)
    it.push({ x: nx, fx: fnx })
    if (!isFinite(nx)) { stop(t('The next point is not a finite number: the method cannot continue.', '下一个点不是有限数：方法无法继续。'), 'bad'); render(); return }
    if (!isFinite(fnx)) {
      stop(t(N1 + ' = ' + fmtX(nx) + ' is outside the domain of f, so f(' + N1 + ') is not defined: Newton\'s method has left the domain and cannot continue.',
        N1 + ' = ' + fmtX(nx) + ' 不在 f 的定义域内，f(' + N1 + ') 无定义：牛顿法离开了定义域，无法继续。'), 'bad')
      render(); return
    }
    if (fnx === 0) {
      stop(t('f(' + N1 + ') = 0 in double precision: ' + N1 + ' is a root, and further steps change nothing.',
        '在双精度下 f(' + N1 + ') = 0：' + N1 + ' 就是根，再迭代也不会改变。'), 'good')
      render(); return
    }
    if (nx === cur.x) {
      stop(t(N1 + ' = ' + N + ' in double precision: the method has converged, and further steps change nothing.',
        '在双精度下 ' + N1 + ' = ' + N + '：方法已经收敛，再迭代也不会改变。'), 'good')
      render(); return
    }
    if (Math.abs(nx - cur.x) <= 2 * ulp(cur.x)) {
      stop(t(N1 + ' and ' + N + ' differ only in their last binary digit: the method has converged as far as double precision allows.',
        N1 + ' 与 ' + N + ' 只在最后一位二进制数字上不同：在双精度允许的范围内，方法已经收敛。'), 'good')
      render(); return
    }
    for (var k = 0; k < n; k++) {
      if (it[k].x === nx) {
        stop(t(N1 + ' = x' + sub(k) + ': the iterates repeat, so Newton\'s method goes round this cycle for ever and never reaches a root.',
          N1 + ' = x' + sub(k) + '：迭代值重复出现，牛顿法会永远在这个循环里打转，到不了根。'), 'bad')
        render(); return
      }
    }
    if (Math.abs(nx) > 1e6) {
      stop(t('|' + N1 + '| is larger than a million: the iterates have run away from the root.', '|' + N1 + '| 已超过一百万：迭代值跑离了根。'), 'bad')
      render(); return
    }
    if (n + 1 >= MAX_STEPS) { stop(t('Stopped after ' + MAX_STEPS + ' steps. Press Reset to start again.', '已迭代 ' + MAX_STEPS + ' 步，停止。按“复位”重新开始。')); render(); return }
    // Running away: three steps in a row, each longer than the one before, with |f| growing.
    var m = it.length - 1
    if (m >= 3) {
      var s1 = Math.abs(it[m].x - it[m - 1].x), s2 = Math.abs(it[m - 1].x - it[m - 2].x), s3 = Math.abs(it[m - 2].x - it[m - 3].x)
      if (s1 > s2 && s2 > s3 && Math.abs(it[m].fx) > Math.abs(it[m - 1].fx) && Math.abs(it[m - 1].fx) > Math.abs(it[m - 2].fx)) {
        say(t('Each step is longer than the one before and |f(xₙ)| keeps growing: the iterates are running away from the root.',
          '每一步都比前一步长，|f(xₙ)| 也不断增大：迭代值正在跑离根。'), 'bad')
        render(); return
      }
    }
    say('')
    render()
  }

  function render() {
    var fn = state.fn
    var head = fn ? (fn.exact ? state.preset.dtext : t('f′(x) is estimated numerically (central differences)', 'f′(x) 用数值方法估计（中心差分）')) : ''
    formulaEl.textContent = ''
    if (fn) { formulaEl.appendChild(h('span', { text: 'xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)' })); formulaEl.appendChild(h('span', { text: head })) }
    if (fn && state.ref) {
      refEl.textContent = ''
      var words = state.ref.how === 'bisect' ? t(', found by bisection to double precision.', '，由二分法求得（双精度）。')
        : state.ref.how === 'newton' ? t(', found by running Newton\'s method until it stops changing (f does not change sign there, so bisection cannot be used).', '，由牛顿法迭代到不再变化求得（f 在该处不变号，无法用二分法）。')
          : t(', the root nearest to x₀ (found by bisection to double precision); these iterates do not reach it.', '，离 x₀ 最近的根（由二分法求得，双精度）；这些迭代值到不了它。')
      refEl.appendChild(document.createTextNode(t('Reference root r ≈ ', '参考根 r ≈ ')))
      refEl.appendChild(h('b', { text: fmtX(state.ref.r) }))
      refEl.appendChild(document.createTextNode(words))
    } else refEl.textContent = fn ? t('No root of f was found near x₀, so correct decimals are not shown.', '在 x₀ 附近没有找到 f 的根，因此不显示正确的小数位数。') : ''
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild)
    state.it.forEach(function (p, k) {
      var d = state.ref ? decimals(p.x, state.ref.r) : null
      tbody.appendChild(h('tr', { class: 'nm-row' + (k === state.it.length - 1 && k > 0 ? ' nm-new' : '') },
        h('td', { text: String(k) }), h('td', { text: fmtX(p.x) }), h('td', { text: d === null ? '—' : d < 0 ? t('none', '无') : String(d) }),
        h('td', { text: fmtSci(p.fx, 3) })))
    })
    tableBox.scrollTop = tableBox.scrollHeight
    stepBtn.disabled = state.done
    P.setView(fitView())
  }

  state.fn = fnFromPreset(PRESETS[0])
  reset()
})
