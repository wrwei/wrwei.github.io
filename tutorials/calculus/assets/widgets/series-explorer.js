/* series-explorer (Module 14): the partial sums S_1, ..., S_N of a chosen series, drawn as dots, and its terms,
 * drawn as bars. The sum is drawn as a dashed line where theory gives it (1/(1 − r), π²/6, ln 2, e), and the
 * verdict (converges or diverges, and which theorem shows it) comes from the theory of Module 14, never from the
 * numbers. Where the terms are rational (every series here except p-series with p not a whole number), S_N is
 * computed exactly with BigInt fractions, so the readout says "=" only when the value shown is exact, and its
 * digits are correctly rounded. The gap e − S_N of Σ 1/n! is summed from its tail with BigInt fractions too: in
 * floating point it is lost to rounding error. */
CalcWidgets.register('series-explorer', function (root, api) {
  var t = api.t, h = api.h
  var SUB = '₀₁₂₃₄₅₆₇₈₉'
  function sub(n) { return String(n).split('').map(function (c) { return SUB[+c] }).join('') }
  function minus(s) { return String(s).replace(/-/g, '−') }
  function two(v) { return minus(String(Math.round(v * 100) / 100)) }          // slider values r and p
  function approx(x, sig) { return api.num.fmt(x, sig || 7, true) }
  // Bounds rounded outwards to 6 decimals, so that a bound shown is still a bound.
  function down(x) { return minus((Math.floor(x * 1e6 - 1e-6) / 1e6).toFixed(6)) }
  function up(x) { return minus((Math.ceil(x * 1e6 + 1e-6) / 1e6).toFixed(6)) }

  // ------------------------------------------------------------------ exact fractions (BigInt)
  var B0 = BigInt(0), B1 = BigInt(1), B2 = BigInt(2), B10 = BigInt(10)
  function babs(a) { return a < B0 ? -a : a }
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { var q = a % b; a = b; b = q } return a }
  function add(x, y) {          // x, y: [numerator, denominator > 0]
    var p = x[0] * y[1] + y[0] * x[1], q = x[1] * y[1], g = bgcd(p, q)
    return g > B1 ? [p / g, q / g] : [p, q]
  }
  function pow10(k) { var r = B1; for (var i = 0; i < k; i++) r *= B10; return r }
  // p/q rounded to sig significant digits: { text, exact }, exactly (half up), in the style of api.num.fmt.
  function ratText(p, q, sig) {
    if (p === B0) return { text: '0', exact: true }
    var neg = p < B0, a = babs(p), e = a.toString().length - q.toString().length
    function ge(e) { return e >= 0 ? a >= q * pow10(e) : a * pow10(-e) >= q }       // a/q >= 10^e
    while (!ge(e)) e--
    while (ge(e + 1)) e++
    var k = sig - 1 - e, num = k >= 0 ? a * pow10(k) : a, den = k >= 0 ? q : q * pow10(-k)
    var d = num / den, rem = num - d * den
    if (B2 * rem >= den) d += B1
    if (d === pow10(sig)) { d = pow10(sig - 1); k -= 1; e += 1 }
    var digits = d.toString(), text
    if (e >= 6 || e < -4) {
      var m = digits.charAt(0) + (sig > 1 ? '.' + digits.slice(1) : '')
      m = m.replace(/\.?0+$/, '')
      var expo = String(e).replace(/-/, '⁻').replace(/\d/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] })
      text = m + ' × 10' + expo
    } else if (k <= 0) {
      text = digits + '0'.repeat(-k)
    } else {
      var s = digits.length > k ? digits.slice(0, digits.length - k) + '.' + digits.slice(digits.length - k)
        : '0.' + '0'.repeat(k - digits.length) + digits
      text = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
    }
    return { text: minus((neg ? '-' : '') + text), exact: rem === B0 }
  }

  // ------------------------------------------------------------------ the series
  var state = { key: 'geom', r: 0.5, p: 2, N: 10 }
  function rInt() { return Math.round(state.r * 100) }        // r = k/100 exactly
  function pInt() { var k = Math.round(state.p * 100); return k % 100 === 0 ? k / 100 : null }
  var SERIES = [
    { value: 'geom', first: 0, label: t('Geometric', '几何级数'), formula: t('Σ rⁿ = 1 + r + r² + r³ + ⋯, from n = 0', 'Σ rⁿ = 1 + r + r² + r³ + ⋯，n 从 0 起'),
      term: function (n) { return Math.pow(rInt() / 100, n) },
      exact: function (n) { var k = BigInt(rInt()), c = BigInt(100); return [k ** BigInt(n), c ** BigInt(n)] } },
    { value: 'harm', first: 1, label: t('Harmonic', '调和级数'), formula: t('Σ 1/n = 1 + 1/2 + 1/3 + 1/4 + ⋯, from n = 1', 'Σ 1/n = 1 + 1/2 + 1/3 + 1/4 + ⋯，n 从 1 起'),
      term: function (n) { return 1 / n }, exact: function (n) { return [B1, BigInt(n)] } },
    { value: 'p', first: 1, label: t('p-series', 'p 级数'), formula: t('Σ 1/nᵖ = 1 + 1/2ᵖ + 1/3ᵖ + ⋯, from n = 1', 'Σ 1/nᵖ = 1 + 1/2ᵖ + 1/3ᵖ + ⋯，n 从 1 起'),
      term: function (n) { return Math.pow(n, -Math.round(state.p * 100) / 100) },
      exact: function (n) { var q = pInt(); return q === null ? null : [B1, BigInt(n) ** BigInt(q)] } },
    { value: 'alt', first: 1, label: t('Alternating harmonic', '交错调和级数'), formula: t('Σ (−1)ⁿ⁻¹/n = 1 − 1/2 + 1/3 − 1/4 + ⋯, from n = 1', 'Σ (−1)ⁿ⁻¹/n = 1 − 1/2 + 1/3 − 1/4 + ⋯，n 从 1 起'),
      term: function (n) { return (n % 2 ? 1 : -1) / n }, exact: function (n) { return [n % 2 ? B1 : -B1, BigInt(n)] } },
    { value: 'fact', first: 0, label: 'Σ 1/n!', formula: t('Σ 1/n! = 1 + 1 + 1/2 + 1/6 + 1/24 + ⋯, from n = 0', 'Σ 1/n! = 1 + 1 + 1/2 + 1/6 + 1/24 + ⋯，n 从 0 起'),
      term: function (n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return 1 / f },
      exact: function (n) { var f = B1; for (var i = 2; i <= n; i++) f *= BigInt(i); return [B1, f] } },
    { value: 'osc', first: 0, label: 'Σ (−1)ⁿ', formula: t('Σ (−1)ⁿ = 1 − 1 + 1 − 1 + ⋯, from n = 0', 'Σ (−1)ⁿ = 1 − 1 + 1 − 1 + ⋯，n 从 0 起'),
      term: function (n) { return n % 2 ? -1 : 1 }, exact: function (n) { return [n % 2 ? -B1 : B1, B1] } },
  ]
  function series() { return SERIES.filter(function (s) { return s.value === state.key })[0] }

  // What the theorems of Module 14 say. sum: the exact sum (a number) or null; name: its symbol for the plot.
  function theory() {
    var key = state.key, o = { sum: null, name: '', sumText: '', verdict: '' }
    var NO = t('No sum: the series diverges.', '没有和：级数发散。')
    if (key === 'geom') {
      var k = rInt()
      if (Math.abs(k) < 100) {
        var den = 100 - k, g = Math.abs(gcdN(100, den)), P = 100 / g, Q = den / g
        o.sum = 100 / den
        o.name = '1/(1 − r)'
        o.sumText = t('Sum: ', '和：') + '1/(1 − r) = ' + (Q === 1 ? String(P) : P + '/' + Q + ' ≈ ' + approx(o.sum))
        o.verdict = t('Converges: a geometric series with |r| < 1.', '收敛：公比满足 |r| < 1 的几何级数。')
      } else {
        o.sumText = NO
        if (k === 100) o.verdict = t('Diverges: r = 1, so the partial sums 1, 2, 3, … grow without bound (the terms do not tend to 0).', '发散：r = 1，部分和 1, 2, 3, … 无限增大（各项不趋于 0）。')
        else if (k === -100) o.verdict = t('Diverges: r = −1. The terms ±1 do not tend to 0 (divergence test); the partial sums alternate between 1 and 0.', '发散：r = −1。各项 ±1 不趋于 0（发散判别法），部分和在 1 与 0 之间交替。')
        else o.verdict = t('Diverges: |r| > 1, so the terms rⁿ do not tend to 0 (divergence test).', '发散：|r| > 1，各项 rⁿ 不趋于 0（发散判别法）。')
      }
    } else if (key === 'harm' || (key === 'p' && pInt() === 1)) {
      o.sumText = NO
      o.verdict = key === 'harm'
        ? t('Diverges: the harmonic series (the grouping proof, or the integral test). Its terms tend to 0, but that is not enough.', '发散：调和级数（分组证明，或积分判别法）。各项趋于 0，但这还不够。')
        : t('Diverges: with p = 1 this is the harmonic series (integral test).', '发散：p = 1 时就是调和级数（积分判别法）。')
    } else if (key === 'p') {
      var p = Math.round(state.p * 100) / 100
      if (p > 1) {
        o.verdict = t('Converges: a p-series with p > 1 (integral test).', '收敛：p > 1 的 p 级数（积分判别法）。')
        if (p === 2) { o.sum = Math.PI * Math.PI / 6; o.name = 'π²/6'; o.sumText = t('Sum: ', '和：') + 'π²/6 ≈ ' + approx(o.sum) }
        else o.sumText = t('Sum: no simple formula is known; the integral test bounds it (below).', '和：没有已知的简单公式；积分判别法给出它的范围（见下）。')
      } else {
        o.sumText = NO
        o.verdict = t('Diverges: a p-series with p ≤ 1 (integral test). Its terms tend to 0, but that is not enough.', '发散：p ≤ 1 的 p 级数（积分判别法）。各项趋于 0，但这还不够。')
      }
    } else if (key === 'alt') {
      o.sum = Math.LN2; o.name = 'ln 2'
      o.sumText = t('Sum: ', '和：') + 'ln 2 ≈ ' + approx(o.sum) + t(' (proved in Module 15)', '（第 15 模块证明）')
      o.verdict = t('Converges, but only conditionally: alternating series test; Σ 1/n diverges.', '收敛，但只是条件收敛：交错级数判别法；Σ 1/n 发散。')
    } else if (key === 'fact') {
      o.sum = Math.E; o.name = 'e'
      o.sumText = t('Sum: ', '和：') + 'e ≈ ' + approx(o.sum) + t(' (proved in Module 15)', '（第 15 模块证明）')
      o.verdict = t('Converges: ratio test, aₙ₊₁/aₙ = 1/(n + 1) → 0.', '收敛：比值判别法，aₙ₊₁/aₙ = 1/(n + 1) → 0。')
    } else {
      o.sumText = NO
      o.verdict = t('Diverges: the terms ±1 do not tend to 0 (divergence test); the partial sums are 1, 0, 1, 0, …', '发散：各项 ±1 不趋于 0（发散判别法）；部分和为 1, 0, 1, 0, …')
    }
    return o
  }
  function gcdN(a, b) { while (b) { var q = a % b; a = b; b = q } return a }

  // ------------------------------------------------------------------ controls and layout
  var sel = api.select({ label: t('Series', '级数'), value: state.key,
    options: SERIES.map(function (s) { return { value: s.value, label: s.label } }),
    onchange: function (v) { state.key = v; update() } })
  var rS = api.slider({ label: 'r', min: -1.2, max: 1.2, step: 0.01, value: state.r, fmt: two,
    oninput: function (v) { state.r = Math.round(v * 100) / 100; update() } })
  var pS = api.slider({ label: 'p', min: 0.5, max: 3, step: 0.05, value: state.p, fmt: two,
    oninput: function (v) { state.p = Math.round(v * 100) / 100; update() } })
  var nS = api.slider({ label: 'N', min: 1, max: 200, step: 1, value: state.N, fmt: function (v) { return String(Math.round(v)) },
    oninput: function (v) { state.N = Math.round(v); update() } })
  var sumsBox = h('div', { class: 'se-plot' }), termsBox = h('div', { class: 'se-plot se-terms' })
  var lines = { sn: h('div', { class: 'se-sn' }), sum: h('div', { class: 'se-sum' }), err: h('div', { class: 'se-err' }),
    verdict: h('div', { class: 'se-verdict' }) }
  var out = api.readout()
  out.appendChild(lines.sn); out.appendChild(lines.sum); out.appendChild(lines.err); out.appendChild(lines.verdict)
  var formulaEl = h('div', { class: 'se-formula' })
  root.appendChild(h('div', { class: 'cw-row se-top' }, sel.el))
  root.appendChild(formulaEl)
  root.appendChild(h('div', { class: 'se-sliders' }, rS.el, pS.el, nS.el))
  root.appendChild(sumsBox)
  root.appendChild(termsBox)
  root.appendChild(h('div', { class: 'se-key' }, t('Dots: the partial sums; the dot above N is the sum of the first N terms. Dashed: the sum, where theory gives it. Bars: the terms; the k-th bar is the k-th term.',
    '圆点：部分和；N 上方的圆点是前 N 项之和。虚线：理论给出的和。竖条：各项，第 k 条是第 k 项。')))
  root.appendChild(out)
  api.css('series-explorer', [
    '.se-top .cw-field{min-width:0;max-width:100%}.se-top .cw-select{max-width:100%}',
    '.se-formula{font:600 .95rem var(--font-mono);color:var(--blue);margin:.2rem 0 .4rem;overflow-wrap:anywhere}',
    '.se-sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.35rem 1rem;margin:.4rem 0}',
    '.se-plot{margin:.3rem 0}',
    '.se-key{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.se-verdict{font-weight:700;margin-top:.25rem}',
    '.se-err:empty{display:none}',
  ].join(''))

  var data = { S: [], a: [], th: null }
  var P1 = api.plot(sumsBox, { view: [0, 11, 0, 2.2], aspect: 0.5, xlabel: 'N', ylabel: t('partial sums', '部分和'),
    label: t('The partial sums of the series', '级数的部分和'), draw: drawSums })
  var P2 = api.plot(termsBox, { view: [0, 11, -0.1, 1.1], aspect: 0.32, xlabel: 'k', ylabel: t('terms', '各项'),
    label: t('The terms of the series', '级数的各项'), draw: drawTerms })

  // The y-range of the values, with room below (tick labels of an axis at the bottom) and above (the axis name).
  function range(vals, extra, below, above) {
    var lo = Infinity, hi = -Infinity
    vals.concat(extra).forEach(function (v) { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v) } })
    if (!isFinite(lo)) { lo = -1; hi = 1 }
    if (hi - lo < 1e-9) { lo -= 0.5; hi += 0.5 }
    var span = hi - lo
    return [lo - below * span, hi + above * span]
  }
  // The x-range: 40 px left of x = 0 for the tick labels of the y-axis, 30 px right of N + 1 for the axis name.
  function xrange(P, N) {
    var s = (P.W - 16 - 70) / (N + 1)
    return [-40 / s, N + 1 + 30 / s]
  }
  function drawSums(P) {
    var N = data.S.length, x = xrange(P, N), y = range(data.S, data.th && data.th.sum !== null ? [data.th.sum] : [], 0.22, 0.22)
    P.view = [x[0], x[1], y[0], y[1]]
    P.axes()
    if (data.th && data.th.sum !== null) {
      P.line(0, data.th.sum, x[1], data.th.sum, { color: 'var(--green)', width: 1.6, dash: '7 5' })
      P.text(x[1], data.th.sum, data.th.name, { anchor: 'end', dx: -6, dy: data.th.sum > (y[0] + y[1]) / 2 ? 16 : -7, color: 'var(--green)' })
    }
    var rad = N > 120 ? 2 : N > 50 ? 2.8 : 4
    for (var k = 1; k <= N; k++) P.point(k, data.S[k - 1], { r: rad, color: 'var(--blue)' })
  }
  function drawTerms(P) {
    var N = data.a.length, x = xrange(P, N), y = range(data.a, [0], 0.3, 0.35)
    P.view = [x[0], x[1], y[0], y[1]]
    P.axes()
    var w = N > 120 ? 1 : N > 50 ? 1.6 : 2.6
    for (var k = 1; k <= N; k++) P.line(k, 0, k, data.a[k - 1], { color: 'var(--orange)', width: w, layer: 'front' })
  }

  // ------------------------------------------------------------------ update
  function update() {
    var s = series(), N = state.N
    formulaEl.textContent = s.formula
    rS.el.hidden = state.key !== 'geom'
    pS.el.hidden = state.key !== 'p'
    data.a = []; data.S = []
    var run = 0
    for (var k = 0; k < N; k++) { var v = s.term(s.first + k); data.a.push(v); run += v; data.S.push(run) }
    data.th = theory()
    // S_N: exactly where the terms are rational, else in floating point.
    var exact = null
    if (s.exact(s.first) !== null) {
      exact = [B0, B1]
      for (k = 0; k < N; k++) exact = add(exact, s.exact(s.first + k))
    }
    var SN = data.S[N - 1], label = 'S' + sub(N)
    if (exact) { var rt = ratText(exact[0], exact[1], 7); lines.sn.textContent = label + (rt.exact ? ' = ' : ' ≈ ') + rt.text }
    else lines.sn.textContent = label + (N === 1 ? ' = 1' : ' ≈ ' + approx(SN))
    lines.sum.textContent = data.th.sumText
    var err = ''
    if (data.th.sum !== null) {
      if (state.key === 'alt') err = '|ln 2 − ' + label + '| ≈ ' + approx(Math.abs(Math.LN2 - SN), 4) + ' ≤ 1/(N + 1) ≈ ' + approx(1 / (N + 1), 4) + t(' (alternating series bound)', '（交错级数误差界）')
      else if (state.key === 'geom' && exact) {     // 1/(1 − r) − S_N, exactly
        var gap = add([BigInt(100), BigInt(100 - rInt())], [-exact[0], exact[1]]), gt = ratText(gap[0], gap[1], 4)
        err = t('Sum − ', '和 − ') + label + (gt.exact ? ' = ' : ' ≈ ') + gt.text
      } else if (state.key === 'fact') {
        // e − S_N = 1/N! + 1/(N + 1)! + ⋯ (S_N ends at 1/(N − 1)!). In floating point, e − S_N is lost to rounding
        // once N passes about 15, so add the first 40 terms of the tail exactly; the rest is below 10⁻⁴⁹ of it.
        var fct = B1, tail = [B0, B1]
        for (var i = 2; i <= N; i++) fct *= BigInt(i)
        for (var j = N; j < N + 40; j++) { tail = add(tail, [B1, fct]); fct *= BigInt(j + 1) }
        err = t('Sum − ', '和 − ') + label + ' ≈ ' + ratText(tail[0], tail[1], 4).text
      } else err = t('Sum − ', '和 − ') + label + ' ≈ ' + approx(data.th.sum - SN, 4)
    } else if (state.key === 'harm' || (state.key === 'p' && pInt() === 1)) {
      var hiText = N === 1 ? ' = 1' : ' ≈ ' + up(1 + Math.log(N))          // 1 + ln 1 = 1 exactly
      err = 'ln(N + 1) ≈ ' + down(Math.log(N + 1)) + ' ≤ ' + label + ' ≤ 1 + ln N' + hiText + t(' (integral test)', '（积分判别法）')
    } else if (state.key === 'p' && state.p > 1) {
      var p = Math.round(state.p * 100) / 100
      var lo = SN + 1 / ((p - 1) * Math.pow(N + 1, p - 1)), hi = SN + 1 / ((p - 1) * Math.pow(N, p - 1))
      err = t('Integral test: ', '积分判别法：') + down(lo) + ' ≤ ' + t('sum', '和') + ' ≤ ' + up(hi)
    }
    lines.err.textContent = err
    lines.verdict.textContent = data.th.verdict
    P1.redraw(); P2.redraw()
  }
  update()
})
