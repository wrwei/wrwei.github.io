/* riemann-sums (Modules 9 and 11): approximate the integral of f over [a, b] with n subintervals by the left,
 * right, midpoint, trapezoid or Simpson rule, see the rectangles (trapezoids, parabolic strips) that the rule
 * adds up, and compare the result with the integral itself, computed accurately by adaptive Simpson
 * quadrature (api.num.integrate). The error is the integral minus the approximation, as in the modules.
 * A table keeps the error at the last few values of n, with the ratio of
 * successive errors when n has doubled: about 2 for the left and right sums (4 when f(a) = f(b)), 4 for the
 * midpoint and trapezoid rules and 16 for Simpson's rule, for a smooth f. */
CalcWidgets.register('riemann-sums', function (root, api) {
  var t = api.t, h = api.h
  var NMAX = 200, ROWS = 6

  var FUNCS = [
    { value: 'sq', label: 'x²', f: function (x) { return x * x }, a: '0', b: '1' },
    { value: 'sin', label: 'sin x', f: Math.sin, a: '0', b: 'pi' },
    { value: 'exp', label: 'eˣ', f: Math.exp, a: '0', b: '1' },
    { value: 'recip', label: '1/x', f: function (x) { return 1 / x }, a: '1', b: '2' },
    { value: 'sqrt', label: '√x', f: Math.sqrt, a: '0', b: '1' },
    { value: 'custom', label: t('type your own', '自己输入'), a: '0', b: '2' },
  ]
  var RULES = [
    { value: 'left', label: t('left', '左端点'), name: t('Left sum', '左和'), of: t('the left sum', '左和'), sym: 'L', factor: 2 },
    { value: 'right', label: t('right', '右端点'), name: t('Right sum', '右和'), of: t('the right sum', '右和'), sym: 'R', factor: 2 },
    { value: 'mid', label: t('midpoint', '中点'), name: t('Midpoint sum', '中点和'), of: t('the midpoint sum', '中点和'), sym: 'M', factor: 4 },
    { value: 'trap', label: t('trapezoid', '梯形'), name: t('Trapezoidal rule', '梯形法则'), of: t('the trapezoidal rule', '梯形法则'), sym: 'T', factor: 4 },
    { value: 'simp', label: t('Simpson', '辛普森'), name: t("Simpson's rule", '辛普森法则'), of: t("Simpson's rule", '辛普森法则'), sym: 'S', factor: 16 },
  ]

  // ---------------------------------------------------------------- numbers as text
  var SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  var SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' }
  function sup(n) { return String(n).split('').map(function (c) { return SUP[c] }).join('') }
  function sub(n) { return String(n).split('').map(function (c) { return SUB[c] }).join('') }
  function minus(s) { return s.replace(/-/g, '−') }
  // x to `sig` significant digits (powers of ten for very large or small x); exact: the text is the number itself.
  function shown(x, sig) {
    if (x === 0) return { s: '0', exact: true }
    if (!isFinite(x)) return { s: '—', exact: false }
    var ax = Math.abs(x)
    if (ax >= 1e6 || ax < 1e-4) {
      var p = x.toExponential(sig - 1).split('e')
      var mant = p[0].indexOf('.') >= 0 ? p[0].replace(/0+$/, '').replace(/\.$/, '') : p[0]
      return { s: minus(mant) + ' × 10' + sup(parseInt(p[1], 10)), exact: Number(x.toExponential(sig - 1)) === x }
    }
    var r = Number(x.toPrecision(sig))
    return { s: minus(String(r)), exact: r === x }
  }
  function num(x, sig) { return shown(x, sig).s }
  function eq(x, sig) { var r = shown(x, sig); return (r.exact ? '= ' : '≈ ') + r.s }

  // ---------------------------------------------------------------- state
  var S = { fn: FUNCS[0], typed: null, a: 0, b: 1, rule: RULES[0], n: 4, hist: [], note: '' }
  var cache = { key: null }
  function fcur() { return S.fn.value === 'custom' ? (S.typed && S.typed.f) : S.fn.f }
  // The scan and the integral depend only on f, a and b: compute them once for each choice.
  function fkey() { return (S.fn.value === 'custom' ? 'c:' + (S.typed ? S.typed.src : '') : S.fn.value) + '|' + S.a + '|' + S.b }
  function safe(f, x) { try { var y = f(x); return typeof y === 'number' ? y : NaN } catch (e) { return NaN } }
  function constant(field) {
    var p = api.Expr.parse(field.get(), [])
    if (!p.ok) { field.error(p.error); return null }
    var v = p.f()
    if (!isFinite(v)) { field.error(t('Not a number', '不是一个数')); return null }
    field.error('')
    return v
  }

  // f on a fine grid of [a, b]: is it finite everywhere, and does it look bounded? A pole between two grid
  // points shows up as a huge value, or as huge values of opposite signs side by side.
  function scan(f, a, b) {
    var N = 2000, ys = [], k, x, y
    for (k = 0; k <= N; k++) {
      x = a + (b - a) * k / N
      y = safe(f, x)
      if (!isFinite(y)) return { bad: x }
      ys.push(y)
    }
    var abs = ys.map(Math.abs).sort(function (p, q) { return p - q })
    var typical = Math.max(abs[Math.floor(0.9 * N)], 1e-9), top = abs[N]
    var pole = null
    for (k = 0; k < N && pole === null; k++) {
      var p0 = Math.abs(ys[k]), p1 = Math.abs(ys[k + 1])
      if (ys[k] * ys[k + 1] < 0 && Math.min(p0, p1) > 50 * typical && Math.min(p0, p1) > 100) pole = a + (b - a) * (k + 0.5) / N
    }
    if (pole === null && top > 1e4 * typical && top > 1e3) pole = a + (b - a) * ys.map(Math.abs).indexOf(top) / N
    var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys)
    return { lo: lo, hi: hi, top: top, pole: pole }
  }

  // Start on short, slightly unequal panels to reduce aliasing with periodic functions.
  // Each panel uses adaptive Simpson, with a single evaluation budget shared by all panels.
  function integral(f, a, b, top) {
    var panels = 128, width = b - a, count = 0, total = 0, lo = a
    var tol = 1e-13 * Math.max(width * top, 1e-300) / panels
    var g = function (x) { if (++count > 400000) throw new Error('budget'); return f(x) }
    try {
      for (var k = 1; k <= panels; k++) {
        var u = k / panels
        var hi = k === panels ? b : a + width * (u + u * (1 - u) / panels)
        var piece = api.num.integrate(g, lo, hi, tol)
        if (!isFinite(piece)) return NaN
        total += piece
        lo = hi
      }
      return total
    } catch (e) {
      return NaN
    }
  }
  function analyse(f, a, b) {
    var key = fkey()
    if (cache.key !== key) {
      var sc = scan(f, a, b)
      cache = { key: key, scan: sc, exact: sc.bad === undefined && sc.pole === null ? integral(f, a, b, sc.top) : NaN }
    }
    return cache
  }

  // The sample points of the rule and the approximation.
  function compute() {
    var out = { n: S.n }, f = fcur(), a = S.a, b = S.b
    if (!f) { out.msg = t('Correct the formula above to see its sums.', '请先改正上面的公式，才能看到它的和。'); return out }
    if (!isFinite(a) || !isFinite(b)) { out.msg = t('Correct the ends of the interval.', '请改正区间的端点。'); return out }
    if (!(a < b)) { out.msg = t('Choose a < b.', '请使 a < b。'); return out }
    var an = analyse(f, a, b), sc = an.scan
    if (sc.bad !== undefined) {
      out.msg = t('f(x) is not a finite number at x ≈ ' + num(sc.bad, 4) + ', inside [a, b], so its Riemann sums are not defined. Choose an interval where f is defined.',
        'f(x) 在 [a, b] 内的 x ≈ ' + num(sc.bad, 4) + ' 处不是有限的数，所以它的黎曼和没有定义。请选择 f 有定义的区间。')
      return out
    }
    if (sc.pole !== null) {
      out.msg = t('f seems to have a vertical asymptote near x ≈ ' + num(sc.pole, 4) + ': it is not bounded on [a, b], so it is not integrable there, and its sums approach no number.',
        'f 在 x ≈ ' + num(sc.pole, 4) + ' 附近似乎有竖直渐近线：它在 [a, b] 上无界，因而不可积，它的和不趋于任何数。')
      return out
    }
    out.scan = sc
    var n = S.n, dx = (b - a) / n, rule = S.rule.value, i
    out.dx = dx
    out.nodes = []
    for (i = 0; i <= n; i++) out.nodes.push(a + i * dx)
    if (rule === 'simp') out.approx = api.num.simpson(f, a, b, n)
    else out.approx = api.num.riemann(f, a, b, n, rule)
    out.exact = an.exact
    if (!isFinite(out.exact)) out.msg = t('The integral could not be computed accurately for this f.', '无法精确计算这个 f 的积分。')
    out.err = out.exact - out.approx
    // Numbers below this size, relative to the scale (b − a)·max|f| of the sums, are lost in the rounding of
    // the arithmetic itself: an integral of 0 comes out as ±10⁻¹⁷ or so, and is shown as ≈ 0.
    out.noise = 5e-13 * (b - a) * sc.top
    out.tiny = Math.abs(out.err) <= out.noise
    return out
  }

  // ---------------------------------------------------------------- controls
  var sel = api.select({ label: t('Function f(x)', '函数 f(x)'), value: 'sq', options: FUNCS.map(function (q) { return { value: q.value, label: q.label } }),
    onchange: function (v) { setFunction(v) } })
  var field = api.field({ label: t('Your f(x)', '你的 f(x)'), value: 'x^3 - x', placeholder: 'x^3 - x', onchange: function (src) { readTyped(src); restart() } })
  field.el.classList.add('rs-field')
  field.el.hidden = true
  var fa = api.field({ label: 'a', value: '0', size: 6, onchange: function () { readInterval(); restart() } })
  var fb = api.field({ label: 'b', value: '1', size: 6, onchange: function () { readInterval(); restart() } })
  fa.el.classList.add('rs-a'); fb.el.classList.add('rs-b')
  var ruleSel = api.select({ label: t('Rule', '方法'), value: 'left', options: RULES.map(function (q) { return { value: q.value, label: q.label } }),
    onchange: function (v) { S.rule = RULES.filter(function (q) { return q.value === v })[0]; snapN(); restart() } })
  var N = api.slider({ label: 'n', min: 1, max: NMAX, step: 1, value: S.n, fmt: function (v) { return String(Math.round(v)) },
    oninput: function (v) { S.n = Math.round(v); snapN(); update() } })
  N.input.addEventListener('change', function () { commit(); update() })
  N.el.classList.add('rs-n')
  var dbl = api.button(t('Double n', 'n 加倍'), function () {
    if (2 * S.n > NMAX) return
    S.n = 2 * S.n
    snapN()
    commit()
    update()
  }, { primary: true })

  function row(cls, label) {
    var k = h('span', { class: 'rs-key' }, label), v = h('span', { class: 'rs-val' })
    return { el: h('div', { class: 'rs-row ' + cls }, k, v), k: k, v: v }
  }
  var R = {
    dx: row('rs-dx', 'Δx = (b − a)/n'),
    approx: row('rs-approx', ''),
    exact: row('rs-int', t('Integral (accurate numerical value)', '积分（高精度数值）')),
    err: row('rs-err', t('Error = integral − approximation', '误差 = 积分 − 近似值')),
  }
  var readout = h('div', { class: 'rs-readout', 'aria-live': 'polite' }, R.dx.el, R.approx.el, R.exact.el, R.err.el)
  var msg = h('div', { class: 'rs-msg', 'aria-live': 'polite' })
  var note = h('div', { class: 'rs-note' })
  var tbody = h('tbody')
  var table = h('table', { class: 'cw-table rs-table' },
    h('caption', {}, t('Errors at the last few n', '最近几个 n 的误差')),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'n'), h('th', { scope: 'col' }, t('error', '误差')),
      h('th', { scope: 'col' }, t('ratio', '比值')))),
    tbody)
  var factorNote = h('div', { class: 'rs-factor' })
  var plotBox = h('div', { class: 'rs-plot' })

  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(api.row(fa.el, fb.el, ruleSel.el))
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'rs-key-line' }, t('Blue: the graph of f. Shaded: the rectangles, trapezoids or parabolic strips that the rule adds up; orange ones lie below the axis and count as negative. Purple (Simpson): the parabolas.',
    '蓝线：f 的图像。阴影：该方法相加的矩形、梯形或抛物线条；橙色的在横轴下方，按负值计。紫线（辛普森法则）：抛物线。')))
  root.appendChild(api.row(N.el, dbl))
  root.appendChild(readout)
  root.appendChild(msg)
  root.appendChild(note)
  root.appendChild(h('div', { class: 'cw-scroll' }, table))
  root.appendChild(factorNote)
  api.css('riemann-sums', [
    '.rs-n{flex:1 1 260px}',
    '.rs-a .cw-input,.rs-b .cw-input{width:6.5em}',
    '.rs-field .cw-input{min-width:9em}',
    '.rs-field[hidden]{display:none}',
    '.rs-key-line{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.rs-readout{font-family:var(--font-mono);font-size:.82rem;color:var(--navy);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.45rem .7rem;margin:.5rem 0}',
    '.rs-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.1rem 1rem;padding:.15rem 0}',
    '.rs-row+.rs-row{border-top:1px solid var(--border)}',
    '.rs-key{color:var(--slate)}',
    '.rs-val{font-weight:600;white-space:nowrap}',
    '.rs-msg{font-size:.85rem;color:var(--orange);margin:.3rem 0}',
    '.rs-msg:empty,.rs-note:empty{display:none}',
    '.rs-note,.rs-factor{font-size:.8rem;color:var(--slate);margin:.3rem 0}',
    '.rs-table caption{text-align:left;font:600 .8rem var(--font-body, sans-serif);color:var(--slate);padding:.2rem 0}',
    '.rs-table td,.rs-table th{white-space:nowrap;min-width:3.5em}',
  ].join(''))

  function setFunction(v) {
    S.fn = FUNCS.filter(function (q) { return q.value === v })[0]
    field.el.hidden = v !== 'custom'
    if (v === 'custom') readTyped(field.get())
    fa.set(S.fn.a); fb.set(S.fn.b)
    readInterval()
    restart()
  }
  function readTyped(src) {
    var p = api.Expr.parse(src, ['x'])
    if (p.ok) { S.typed = p; field.error('') } else { S.typed = null; field.error(p.error) }
  }
  function readInterval() {
    var a = constant(fa), b = constant(fb)
    S.a = a === null ? NaN : a
    S.b = b === null ? NaN : b
  }
  // Simpson's rule pairs the subintervals, so it needs an even n.
  function snapN() {
    S.note = ''
    if (S.rule.value === 'simp' && S.n % 2) {
      S.n = Math.min(NMAX, S.n + 1)
      S.note = t("Simpson's rule pairs the subintervals, so it needs an even n: n is now " + S.n + '.',
        '辛普森法则把子区间两两配对，所以需要偶数 n：n 现在是 ' + S.n + '。')
    }
    N.set(S.n)
  }
  // A new function, interval or rule starts a new table of errors.
  function restart() { S.hist = []; commit(); update() }
  function commit() {
    var c = compute()
    if (!isFinite(c.approx) || !isFinite(c.exact)) return
    var last = S.hist[S.hist.length - 1]
    if (last && last.n === c.n) return
    S.hist.push({ n: c.n, approx: c.approx, err: c.err, tiny: c.tiny })
    if (S.hist.length > 50) S.hist.shift()
  }

  // ---------------------------------------------------------------- the picture
  function view(c) {
    var a = S.a, b = S.b, w = b - a
    if (!c.scan) return isFinite(w) && w > 0 ? [a - 0.1 * w, b + 0.1 * w, -1, 1] : [-1, 3, -1, 1]
    var lo = Math.min(0, c.scan.lo), hi = Math.max(0, c.scan.hi)
    if (hi - lo < 1e-9) { lo -= 1; hi += 1 }
    var pad = 0.12 * (hi - lo)
    return [a - 0.08 * w, b + 0.08 * w, lo - (lo < 0 ? pad : 0.06 * (hi - lo)), hi + (hi > 0 ? pad : 0.06 * (hi - lo))]
  }
  function piece(P, pts, y, cls) {
    var neg = y < 0
    var el = P.poly(pts, { closed: true, fill: neg ? 'var(--orange)' : 'var(--sky)', opacity: neg ? 0.3 : 0.35, color: neg ? 'var(--orange)' : 'var(--sky)', width: 1 })
    el.setAttribute('class', 'rs-piece' + (cls ? ' ' + cls : ''))
    return el
  }
  var P = api.plot(plotBox, {
    view: [-0.1, 1.1, -0.1, 1.1], aspect: 0.6, label: t('Graph of f with the pieces of the chosen sum', 'f 的图像与所选和的各个小块'),
    draw: function (P) {
      var c = compute(), f = fcur()
      P.axes()
      if (!f) return
      if (c.dx) {
        var rule = S.rule.value, nodes = c.nodes, i, x0, x1, y0, y1
        var dots = c.n <= 60
        if (rule === 'simp') {
          for (i = 0; i + 2 <= c.n; i += 2) {
            var p0 = nodes[i], p1 = nodes[i + 1], p2 = nodes[i + 2]
            var q0 = f(p0), q1 = f(p1), q2 = f(p2)
            var par = (function (p0, p1, p2, q0, q1, q2) {
              return function (x) {
                return q0 * (x - p1) * (x - p2) / ((p0 - p1) * (p0 - p2)) + q1 * (x - p0) * (x - p2) / ((p1 - p0) * (p1 - p2)) + q2 * (x - p0) * (x - p1) / ((p2 - p0) * (p2 - p1))
              }
            })(p0, p1, p2, q0, q1, q2)
            var pts = [[p0, 0]], arc = [], k
            for (k = 0; k <= 16; k++) { var xx = p0 + (p2 - p0) * k / 16, yy = par(xx); pts.push([xx, yy]); arc.push([xx, yy]) }
            pts.push([p2, 0])
            piece(P, pts, (q0 + 4 * q1 + q2) / 6)
            P.poly(arc, { color: 'var(--purple)', width: 1.6 }).setAttribute('class', 'rs-arc')
          }
        } else {
          for (i = 0; i < c.n; i++) {
            x0 = nodes[i]; x1 = nodes[i + 1]
            if (rule === 'trap') {
              y0 = f(x0); y1 = f(x1)
              piece(P, [[x0, 0], [x0, y0], [x1, y1], [x1, 0]], (y0 + y1) / 2)
            } else {
              var xs = rule === 'left' ? x0 : rule === 'right' ? x1 : (x0 + x1) / 2, ys = f(xs)
              piece(P, [[x0, 0], [x0, ys], [x1, ys], [x1, 0]], ys)
            }
          }
        }
        if (dots) {
          var pts2 = []
          if (rule === 'left' || rule === 'right' || rule === 'mid') {
            for (i = 0; i < c.n; i++) pts2.push(rule === 'left' ? nodes[i] : rule === 'right' ? nodes[i + 1] : (nodes[i] + nodes[i + 1]) / 2)
          } else pts2 = nodes
          pts2.forEach(function (x) { P.point(x, f(x), { color: 'var(--navy)', r: c.n <= 20 ? 3.5 : 2.5 }) })
        }
      }
      P.curve(f, { color: 'var(--blue)', width: 2.6 })
    },
  })

  // ---------------------------------------------------------------- the readout and the table
  function renderTable() {
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild)
    var start = Math.max(0, S.hist.length - ROWS)
    for (var k = start; k < S.hist.length; k++) {
      var e = S.hist[k], prev = k > 0 ? S.hist[k - 1] : null, ratio = '—'
      if (prev && e.n === 2 * prev.n && !e.tiny && !prev.tiny && e.err !== 0) ratio = num(prev.err / e.err, 3)
      tbody.appendChild(h('tr', {}, h('td', {}, String(e.n)), h('td', {}, e.tiny ? '≈ 0' : num(e.err, 3)), h('td', {}, ratio)))
    }
    table.hidden = !S.hist.length
  }
  function update() {
    var c = compute()
    P.view = view(c)
    dbl.disabled = 2 * S.n > NMAX
    R.approx.k.textContent = S.rule.name + ' ' + S.rule.sym + sub(S.n)
    if (c.dx) {
      R.dx.v.textContent = eq(c.dx, 7)
      R.approx.v.textContent = Math.abs(c.approx) <= c.noise ? '≈ 0' : eq(c.approx, 10)
      R.exact.v.textContent = !isFinite(c.exact) ? '—' : Math.abs(c.exact) <= c.noise ? '≈ 0' : '≈ ' + num(c.exact, 10)
      R.err.v.textContent = !isFinite(c.err) ? '—' : c.tiny ? t('≈ 0 (below rounding error)', '≈ 0（小于舍入误差）') : '≈ ' + num(c.err, 3)
    } else {
      R.dx.v.textContent = R.approx.v.textContent = R.exact.v.textContent = R.err.v.textContent = '—'
    }
    msg.textContent = c.msg || ''
    note.textContent = S.note
    renderTable()
    // When f(a) = f(b), the left and right sums are equal (they differ by Δx·(f(b) − f(a))), and both equal the
    // trapezoidal rule: for a smooth f their error falls like 1/n², not 1/n (sin x on [0, π], for example).
    var endsEqual = false
    if (c.scan && (S.rule.value === 'left' || S.rule.value === 'right')) {
      var fe = fcur(), ya = safe(fe, S.a), yb = safe(fe, S.b)
      endsEqual = Math.abs(ya - yb) <= 1e-12 * Math.max(c.scan.top, 1e-300)
    }
    factorNote.textContent = endsEqual
      ? t('Ratio: the previous error divided by this one, shown when n has doubled. Here f(a) = f(b), so the left and right sums are equal, and for a smooth f doubling n divides their error by about 4, not 2.',
        '比值：上一个误差除以这一个，在 n 加倍时显示。这里 f(a) = f(b)，所以左和与右和相等；对光滑的 f，n 加倍时它们的误差约缩小为原来的 1/4，而不是 1/2。')
      : t('Ratio: the previous error divided by this one, shown when n has doubled. For a smooth f, doubling n divides the error of ' + S.rule.of + ' by about ' + S.rule.factor + '.',
        '比值：上一个误差除以这一个，在 n 加倍时显示。对光滑的 f，n 加倍时' + S.rule.name + '的误差约缩小为原来的 1/' + S.rule.factor + '。')
    P.redraw()
  }

  setFunction('sq')
})
