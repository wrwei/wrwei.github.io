/* bisection (Module 3): step the bisection method on a function and an interval [a, b].
 * Row n of the table is the bracket [a_n, b_n] after n steps, with its midpoint m_n, the value f(m_n)
 * and the width (b - a)/2^n; the readout states the guaranteed error (b - a)/2^(n+1) of the midpoint.
 * The method needs f(a) and f(b) of opposite signs; the widget explains when it cannot start, stops at
 * an exact root or when the bracket cannot be halved in floating point, and warns when the values at
 * the ends grow (a sign that f is not continuous). */
CalcWidgets.register('bisection', function (root, api) {
  var t = api.t, h = api.h
  var MAX_STEPS = 200

  var PRESETS = [
    { value: 'sqrt2', label: 'x² − 2', src: 'x^2 - 2', a: '1', b: '2' },
    { value: 'cubic', label: 'x³ − 2x − 5', src: 'x^3 - 2x - 5', a: '2', b: '3' },
    { value: 'cos', label: 'cos x − x', src: 'cos(x) - x', a: '0', b: '1' },
    { value: 'three', label: t('x³ − x (three roots)', 'x³ − x（三个根）'), src: 'x^3 - x', a: '-2', b: '3' },
    { value: 'tan', label: 'tan x', src: 'tan(x)', a: '1', b: '2' },
    { value: 'own', label: t('your own formula', '自定义公式'), src: null },
  ]

  // ---------------------------------------------------------------- numbers as text
  var SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  var SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' }
  function sup(n) { return String(n).split('').map(function (c) { return SUP[c] }).join('') }
  function sub(n) { return String(n).split('').map(function (c) { return SUB[c] }).join('') }
  function minus(s) { return s.replace(/-/g, '−') }
  // x to `sig` significant digits (powers of ten for very large or small x); "0" only for 0 itself.
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
  // Enough digits to tell the ends of a bracket apart (at least 10, at most 17).
  function digits(a, b) {
    var w = b - a, big = Math.max(Math.abs(a), Math.abs(b), 1e-300)
    var need = w > 0 ? Math.ceil(Math.log10(big / w)) + 2 : 17
    return Math.min(17, Math.max(10, need))
  }

  // ---------------------------------------------------------------- state
  // rows[n] = { a, b, fa, fb, m, fm }: the bracket after n steps, f at its ends, its midpoint, f there.
  var S = { f: null, a0: 1, b0: 2, sa: -1, rows: [], status: 'error', msg: '', warn: false, zoom: false }
  function last() { return S.rows[S.rows.length - 1] }
  function at(x) { var y; try { y = S.f(x) } catch (e) { y = NaN } return y }
  function row(a, b, fa, fb) { var m = (a + b) / 2; return { a: a, b: b, fa: fa, fb: fb, m: m, fm: at(m) } }
  function constant(field) {
    var p = api.Expr.parse(field.get(), [])
    if (!p.ok) { field.error(p.error); return null }
    var v = p.f()
    if (!isFinite(v)) { field.error(t('Not a number', '不是一个数')); return null }
    field.error('')
    return v
  }

  // The status after a new row: can the method go on?
  function settle() {
    var r = last()
    if (!isFinite(r.fm)) S.status = 'undefined'
    else if (r.fm === 0) S.status = 'root'
    else if (S.rows.length > MAX_STEPS) S.status = 'max'
    else if (!(r.a < r.m && r.m < r.b)) S.status = 'stuck'
    else S.status = 'ready'
    // Growing values at both ends of a small bracket: probably a jump or an asymptote, not a root.
    var r0 = S.rows[0], big0 = Math.max(Math.abs(r0.fa), Math.abs(r0.fb))
    S.warn = S.rows.length > 5 && Math.min(Math.abs(r.fa), Math.abs(r.fb)) > 10 * big0
  }

  function reset() {
    S.rows = []; S.warn = false; S.status = 'error'; S.msg = ''; S.f = null
    var p = api.Expr.parse(fField.get(), ['x'])
    fField.error(p.ok ? '' : p.error)
    var A = constant(aField), B = constant(bField)
    if (p.ok) S.f = p.f
    if (!p.ok) S.msg = t('Correct the formula for f(x).', '请改正 f(x) 的公式。')
    else if (A === null || B === null) S.msg = t('Type a number for a and for b, such as 1 or pi/2.', '请为 a 和 b 各输入一个数，例如 1 或 pi/2。')
    else if (!(A < B)) S.msg = t('Choose a less than b.', '请让 a 小于 b。')
    else {
      S.a0 = A; S.b0 = B
      var fa = at(A), fb = at(B)
      if (!isFinite(fa)) S.msg = t('f is not defined at a = ' + num(A, 10) + '.', 'f 在 a = ' + num(A, 10) + ' 处没有定义。')
      else if (!isFinite(fb)) S.msg = t('f is not defined at b = ' + num(B, 10) + '.', 'f 在 b = ' + num(B, 10) + ' 处没有定义。')
      else if (fa === 0 || fb === 0) {
        var c = fa === 0 ? A : B
        S.status = 'endroot'
        S.msg = t('f(' + num(c, 10) + ') = 0: ' + (fa === 0 ? 'a' : 'b') + ' is itself a root, so there is nothing to search for.',
          'f(' + num(c, 10) + ') = 0：' + (fa === 0 ? 'a' : 'b') + ' 本身就是根，无需再找。')
      } else if ((fa > 0) === (fb > 0)) {
        S.msg = t('f(' + num(A, 10) + ') ' + eq(fa, 5) + ' and f(' + num(B, 10) + ') ' + eq(fb, 5) + ' have the same sign, so the bisection method cannot start: it needs f(a) and f(b) of opposite signs. (f may still have roots in [a, b]: an even number of them, or one where the graph touches the axis without crossing it.)',
          'f(' + num(A, 10) + ') ' + eq(fa, 5) + ' 与 f(' + num(B, 10) + ') ' + eq(fb, 5) + ' 同号，二分法无法开始：它要求 f(a) 与 f(b) 异号。（[a, b] 中仍可能有根：偶数个根，或图像只碰到 x 轴而不穿过的根。）')
      } else {
        S.sa = fa > 0 ? 1 : -1
        S.rows = [row(A, B, fa, fb)]
        settle()
      }
    }
    setView()
    update()
  }

  function step() {
    if (S.status !== 'ready') return
    var r = last()
    // f(m) has the sign of f at the left end: the sign change, and the root, is in [m, b].
    var right = (r.fm > 0 ? 1 : -1) === S.sa
    S.rows.push(right ? row(r.m, r.b, r.fm, r.fb) : row(r.a, r.m, r.fa, r.fm))
    settle()
  }

  // ---------------------------------------------------------------- controls
  var sel = api.select({ label: t('Function', '函数'), value: 'sqrt2', options: PRESETS.map(function (p) { return { value: p.value, label: p.label } }),
    onchange: function (v) {
      var p = PRESETS.filter(function (q) { return q.value === v })[0]
      if (!p || !p.src) return
      fField.set(p.src); aField.set(p.a); bField.set(p.b)
      reset()
    } })
  var fField = api.field({ label: 'f(x) =', value: PRESETS[0].src, size: 16, onchange: function () { sel.set('own'); reset() } })
  var aField = api.field({ label: 'a =', value: PRESETS[0].a, size: 6, onchange: reset })
  var bField = api.field({ label: 'b =', value: PRESETS[0].b, size: 6, onchange: reset })
  fField.input.classList.add('bi-f'); aField.input.classList.add('bi-a'); bField.input.classList.add('bi-b')
  var stepBtn = api.button(t('Step', '下一步'), function () { step(); if (S.zoom) setView(); update() }, { primary: true })
  var runBtn = api.button(t('Run 10 steps', '连走 10 步'), function () { for (var i = 0; i < 10 && S.status === 'ready'; i++) step(); if (S.zoom) setView(); update() })
  var resetBtn = api.button(t('Reset', '复位'), reset)
  var zoomBtn = api.button(t('Zoom in', '放大'), function () { S.zoom = !S.zoom; setView(); update() })
  zoomBtn.setAttribute('aria-pressed', 'false')
  var readout = api.readout()
  var warnEl = h('div', { class: 'bi-warn', 'aria-live': 'polite' })
  var plotBox = h('div', { class: 'bi-plot' })
  var tbody = h('tbody')
  var table = h('table', { class: 'cw-table bi-table' },
    h('thead', {}, h('tr', {}, ['n', 'aₙ', 'bₙ', t('midpoint mₙ', '中点 mₙ'), 'f(mₙ)', t('width bₙ − aₙ', '宽度 bₙ − aₙ')].map(function (s) { return h('th', { scope: 'col' }, s) }))),
    tbody)
  var tableBox = h('div', { class: 'bi-scroll', tabindex: '0', role: 'region', 'aria-label': t('Steps of the bisection method', '二分法的各步') }, table)

  root.appendChild(api.row(sel.el, fField.el))
  root.appendChild(api.row(aField.el, bField.el, stepBtn, runBtn, resetBtn, zoomBtn))
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'bi-key' }, t('Shaded: the current bracket [aₙ, bₙ]; hollow dot: its midpoint mₙ.', '阴影：当前区间 [aₙ, bₙ]；空心点：它的中点 mₙ。')))
  root.appendChild(readout)
  root.appendChild(warnEl)
  root.appendChild(tableBox)
  var tableKey = h('div', { class: 'bi-key' }, t('Row n is the bracket after n steps. aₙ, bₙ and mₙ are rounded to as many digits as it takes to tell them apart, f(mₙ) to 4 significant digits and the width to 7.',
    '第 n 行是 n 步之后的区间。aₙ、bₙ、mₙ 四舍五入到足以区分的位数，f(mₙ) 保留 4 位有效数字，宽度保留 7 位。'))
  root.appendChild(tableKey)

  api.css('bisection', [
    '.bi-scroll{max-height:15rem;overflow:auto;border:1px solid var(--border);border-radius:8px;margin:.3rem 0}',
    '.bi-table{width:100%;border-style:hidden}',
    '.bi-table th{position:sticky;top:0;z-index:1;color:var(--navy);background:var(--bg);white-space:nowrap}',
    '.bi-table td{white-space:nowrap}',
    '.bi-table tr.bi-last td{background:rgba(14,165,233,.12);font-weight:600}',
    '.bi-key{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.bi-warn{font-size:.85rem;color:var(--red);margin:.2rem 0}',
    '.bi-warn:empty{display:none}',
  ].join(''))

  // ---------------------------------------------------------------- the graph
  function setView() {
    var lo, hi
    if (S.zoom && S.rows.length) {
      // Not narrower than 1% of the size of m: the axes' tick labels (4 significant digits) stay distinct.
      var r = last(), w = Math.max(r.b - r.a, 0.004 * Math.max(1, Math.abs(r.m)))
      lo = r.m - 1.25 * w; hi = r.m + 1.25 * w
    } else {
      var L = (S.b0 > S.a0) ? S.b0 - S.a0 : 2
      lo = S.a0 - 0.12 * L; hi = (S.b0 > S.a0 ? S.b0 : S.a0 + 2) + 0.12 * L
    }
    var ys = []
    if (S.f) for (var i = 0; i <= 240; i++) { var y = at(lo + (hi - lo) * i / 240); if (isFinite(y)) ys.push(y) }
    var ylo = -1, yhi = 1
    if (ys.length) {
      ys.sort(function (p, q) { return p - q })
      ylo = Math.min(0, ys[Math.floor(0.04 * (ys.length - 1))]); yhi = Math.max(0, ys[Math.ceil(0.96 * (ys.length - 1))])
    }
    if (!(yhi - ylo > 1e-300)) { ylo -= 1; yhi += 1 }
    var pad = 0.14 * (yhi - ylo)
    P.view = [lo, hi, ylo - pad, yhi + pad]
  }

  var P = api.plot(plotBox, {
    view: [0.88, 2.12, -1.5, 2.5], aspect: 0.58, label: t('Graph of f with the current bracket shaded', 'f 的图像，阴影为当前区间'),
    draw: function (P) {
      P.axes()
      if (!S.f) return
      var v = P.view, r = S.rows.length ? last() : null
      if (r) P.rect(r.a, v[2], r.b, v[3], { fill: 'var(--sky)', opacity: 0.18, color: 'var(--sky)', width: 1 })
      P.curve(S.f, { color: 'var(--blue)', width: 2.4 })
      if (!r) {
        if (S.b0 > S.a0) [S.a0, S.b0].forEach(function (x) { var y = at(x); if (isFinite(y)) P.point(x, y, { color: 'var(--slate)', r: 4.5 }) })
        return
      }
      var n = S.rows.length - 1
      P.line(r.a, 0, r.b, 0, { color: 'var(--orange)', width: 5 })
      ;[[r.a, r.fa], [r.b, r.fb]].forEach(function (q) {
        if (q[1] > v[2] && q[1] < v[3]) { P.line(q[0], 0, q[0], q[1], { color: 'var(--slate)', width: 1.2, dash: '4 3' }); P.point(q[0], q[1], { color: 'var(--navy)', r: 4 }) }
        P.point(q[0], 0, { color: 'var(--navy)', r: 4.5 })
      })
      if (S.status === 'ready' || S.status === 'root') P.point(r.m, 0, { color: 'var(--orange)', hollow: true, r: 5 })
      if (P.X(r.b) - P.X(r.a) > 44) {
        var below = P.Y(0) + 44 < P.H ? 34 : -12           // below the tick labels, or above the axis
        P.text(r.a, 0, 'a' + sub(n), { anchor: 'middle', dy: below, color: 'var(--navy)' })
        P.text(r.b, 0, 'b' + sub(n), { anchor: 'middle', dy: below, color: 'var(--navy)' })
      }
    },
  })

  // ---------------------------------------------------------------- text
  function describe() {
    var n = S.rows.length - 1
    if (S.status === 'error' || S.status === 'endroot') return S.msg
    var r = last(), d = digits(r.a, r.b), L = S.b0 - S.a0, A = num(S.a0, 10), B = num(S.b0, 10)
    var lines = []
    if (n === 0) {
      lines.push(t('f(' + A + ') ' + eq(r.fa, 5) + ' and f(' + B + ') ' + eq(r.fb, 5) + ' have opposite signs: if f is continuous on [' + A + ', ' + B + '], a root lies in it. Press Step to halve the bracket.',
        'f(' + A + ') ' + eq(r.fa, 5) + ' 与 f(' + B + ') ' + eq(r.fb, 5) + ' 异号：若 f 在 [' + A + ', ' + B + '] 上连续，则其中有根。按“下一步”把区间对半分。'))
    } else {
      var W = L / Math.pow(2, n), E = W / 2
      var br = '[' + num(r.a, d) + ', ' + num(r.b, d) + ']', exact = shown(r.a, d).exact && shown(r.b, d).exact
      lines.push(t('After ' + n + (n === 1 ? ' step' : ' steps') + ' the bracket is ' + (exact ? '' : 'approximately ') + br + ', of width (b\u00a0−\u00a0a)/2' + sup(n) + ' = ' + num(L, 10) + '/2' + sup(n) + ' ' + eq(W, 5) + '.',
        n + ' 步之后，区间' + (exact ? '为 ' : '约为 ') + br + '，宽度 (b\u00a0−\u00a0a)/2' + sup(n) + ' = ' + num(L, 10) + '/2' + sup(n) + ' ' + eq(W, 5) + '。'))
      if (S.status !== 'undefined') lines.push(t('If f is continuous, a root r lies in the bracket, and its midpoint m' + sub(n) + ' ' + eq(r.m, d) + ' is within (b\u00a0−\u00a0a)/2' + sup(n + 1) + ' ' + eq(E, 5) + ' of r.',
        '若 f 连续，则区间内有根 r，中点 m' + sub(n) + ' ' + eq(r.m, d) + ' 与 r 的距离不超过 (b\u00a0−\u00a0a)/2' + sup(n + 1) + ' ' + eq(E, 5) + '。'))
    }
    if (S.status === 'root') lines.push(t('f(m' + sub(n) + ') = 0, as the computer calculates it: m' + sub(n) + ' ' + eq(r.m, d) + ' is a root, and the method stops.',
      '按计算机的算法 f(m' + sub(n) + ') = 0：m' + sub(n) + ' ' + eq(r.m, d) + ' 就是根，方法到此结束。'))
    if (S.status === 'undefined') lines.push(t('f is not defined at the midpoint m' + sub(n) + ' ' + eq(r.m, d) + ', so f is not continuous on [a, b], and the method stops.',
      'f 在中点 m' + sub(n) + ' ' + eq(r.m, d) + ' 处没有定义，所以 f 在 [a, b] 上不连续，方法到此结束。'))
    if (S.status === 'stuck') lines.push(t('The ends of the bracket are now neighbouring floating-point numbers: the bracket cannot be halved any further.',
      '区间的两端已是相邻的浮点数：区间不能再对半分了。'))
    if (S.status === 'max') lines.push(t('That is enough steps: press Reset to start again.', '步数已够多：按“复位”重新开始。'))
    return lines.join('\n')
  }

  function update() {
    readout.textContent = describe()
    warnEl.textContent = S.warn ? t('Warning: the values of f at the ends of the bracket are growing, not shrinking towards 0. Is f continuous on [a, b]? At a jump or a vertical asymptote the bracket closes in on the break, not on a root.',
      '注意：f 在区间两端的值越来越大，而不是趋于 0。f 在 [a, b] 上连续吗？遇到跳跃或竖直渐近线时，区间收缩到间断处，而不是根。') : ''
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild)
    var L = S.b0 - S.a0
    S.rows.forEach(function (r, n) {
      var d = digits(r.a, r.b)
      tbody.appendChild(h('tr', { class: n === S.rows.length - 1 ? 'bi-last' : null },
        h('td', {}, String(n)), h('td', {}, num(r.a, d)), h('td', {}, num(r.b, d)), h('td', {}, num(r.m, d)),
        h('td', {}, num(r.fm, 4)), h('td', {}, num(L / Math.pow(2, n), 7))))
    })
    tableBox.style.display = tableKey.style.display = S.rows.length ? '' : 'none'
    tableBox.scrollTop = tableBox.scrollHeight
    var ok = S.status === 'ready'
    stepBtn.disabled = !ok; runBtn.disabled = !ok
    zoomBtn.disabled = !S.rows.length
    zoomBtn.textContent = S.zoom ? t('Zoom out', '缩小') : t('Zoom in', '放大')
    zoomBtn.setAttribute('aria-pressed', S.zoom ? 'true' : 'false')
    P.redraw()
  }

  reset()
})
