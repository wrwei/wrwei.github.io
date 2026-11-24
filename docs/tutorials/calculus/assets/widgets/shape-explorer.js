/* shape-explorer (Module 8): where a graph rises, falls and bends.
 * The curve is blue where f′ > 0 (f increasing) and orange where f′ < 0 (decreasing); the background is
 * green where f″ > 0 (concave up) and purple where f″ < 0 (concave down). Everything is numerical:
 * f′ and f″ are central differences (api.num.deriv, deriv2) on a grid of 1000 cells across the window.
 * A critical number is found where f′ changes sign between grid points (refined by bisection), or where
 * |f′| touches 0 without changing sign (refined by golden-section search); an inflection point where f″
 * changes sign. A point where f is undefined or not continuous (an asymptote, a jump) is a break, never an
 * extremum or an inflection point. Two sign charts under the graph give the signs of f′ and f″, and a
 * slider moves a point along the curve, reading off f(x), f′(x) and f″(x). */
CalcWidgets.register('shape-explorer', function (root, api) {
  var t = api.t, h = api.h, num = api.num
  var EXAMPLES = [
    { value: 'cubic', label: 'x³ − 3x', src: 'x^3 - 3x', view: [-2.5, 2.5], x: 1.5 },
    { value: 'quartic', label: 'x⁴ − 4x³', src: 'x^4 - 4x^3', view: [-1.5, 4.5], x: 1 },
    { value: 'witch', label: 'x/(1 + x²)', src: 'x/(1 + x^2)', view: [-5, 5], x: 0.5 },
    { value: 'xexp', label: 'x·e^(−x)', src: 'x e^(-x)', view: [-0.5, 6], x: 0.5 },
    { value: 'sin', label: 'sin x + x/2', src: 'sin(x) + x/2', view: [-7, 7], x: 1 },
  ]
  var N = 1000                    // grid cells across the window
  var state = { f: null, view: EXAMPLES[0].view.slice(), x: EXAMPLES[0].x, A: null }

  // ------------------------------------------------------------------ numbers
  function val(f, x) { var y; try { y = f(x) } catch (e) { y = NaN } return typeof y === 'number' && isFinite(y) ? y : NaN }
  function d1(x) { var v = num.deriv(state.f, x); return isFinite(v) ? v : NaN }
  function d2(x) { var v = num.deriv2(state.f, x); return isFinite(v) ? v : NaN }
  // Values this close to 0 count as 0: they are below the rounding error of the difference quotients.
  function tol1(fx) { return 1e-8 * (1 + Math.abs(fx)) }
  function tol2(fx) { return 1e-6 * (1 + Math.abs(fx)) }
  function sgn(v, tol) { return !isFinite(v) ? NaN : Math.abs(v) <= tol ? 0 : v > 0 ? 1 : -1 }
  function minus(s) { return String(s).replace(/-/g, '−') }
  function span() { return state.view[1] - state.view[0] }
  // x-values found numerically, shown to 4 significant digits (a value within a hair of 0 is 0).
  function fx(c) { return num.fmt(Math.abs(c) < 1e-7 * span() ? 0 : c, 4) }
  // "= v" when the digits shown are the value itself, "≈ v" when they are rounded.
  function eq(v) { var s = num.fmt(v, 5); return (Number(s.replace(/−/g, '-')) === v ? '= ' : '≈ ') + s }

  // Bisection between a and b, where g has opposite signs; returns the point where the sign changes.
  function bisect(g, a, b) {
    var ga = g(a)
    for (var k = 0; k < 80; k++) {
      var m = a + (b - a) / 2
      if (m <= a || m >= b) break
      var gm = g(m)
      if (!isFinite(gm)) return m
      if ((gm > 0) === (ga > 0)) { a = m; ga = gm } else b = m
    }
    return a + (b - a) / 2
  }
  // The minimum of a function on [a, b], by golden-section search.
  function golden(g, a, b) {
    var r = (Math.sqrt(5) - 1) / 2, c = b - r * (b - a), d = a + r * (b - a), gc = g(c), gd = g(d)
    for (var k = 0; k < 70; k++) {
      if (gc < gd) { b = d; d = c; gd = gc; c = b - r * (b - a); gc = g(c) } else { a = c; c = d; gc = gd; d = a + r * (b - a); gd = g(d) }
    }
    return (a + b) / 2
  }
  // f is continuous at c if it is defined there and its change over a step e shrinks as e shrinks;
  // at a jump it stays the same, and at an asymptote it grows.
  function continuousAt(c) {
    var f = state.f, fc = val(f, c)
    if (!isFinite(fc)) return false
    var s = 1 + Math.abs(c)
    function gap(e) { var l = val(f, c - e), r = val(f, c + e); return isFinite(l) && isFinite(r) ? Math.max(Math.abs(l - fc), Math.abs(r - fc)) : Infinity }
    var g1 = gap(1e-5 * s), g2 = gap(1e-8 * s)
    if (!isFinite(g1) || !isFinite(g2)) return false
    return g2 <= 1e-9 * (1 + Math.abs(fc)) || g2 < 0.5 * g1
  }
  // The point of [a, b] where f changes most abruptly (halving towards the larger change), if f is not
  // continuous there; null if f is continuous on [a, b].
  function jumpIn(a, b) {
    var f = state.f
    for (var k = 0; k < 70; k++) {
      var m = a + (b - a) / 2
      if (m <= a || m >= b) break
      var fa = val(f, a), fm = val(f, m), fb = val(f, b)
      if (!isFinite(fm)) return m
      if (Math.abs(fm - fa) >= Math.abs(fb - fm)) b = m; else a = m
    }
    var c = a + (b - a) / 2
    return continuousAt(c) ? null : c
  }
  // At a critical number c found from a change of sign of f′: does f′(c) exist? Near a smooth critical number
  // |f′| shrinks in proportion to the distance from c; at a corner it does not shrink, at a cusp it grows.
  function smoothCrit(c) {
    var s = span()
    function m(d) { return Math.max(Math.abs(d1(c - d)), Math.abs(d1(c + d))) }
    var m1 = m(1e-3 * s), m2 = m(1e-5 * s)
    return isFinite(m1) && isFinite(m2) && m2 <= 0.1 * m1 + 1e-9
  }
  // Does f′(c) exist? Compare the slopes from the left and from the right (a corner or a cusp has different ones).
  function smoothAt(c) {
    var f = state.f, e = 1e-6 * (1 + Math.abs(c)), fc = val(f, c)
    var qL = (fc - val(f, c - e)) / e, qR = (val(f, c + e) - fc) / e
    return isFinite(qL) && isFinite(qR) && Math.abs(qR - qL) <= 1e-2 * (1 + Math.abs(qL) + Math.abs(qR))
  }

  // ------------------------------------------------------------------ the analysis of f in the window
  function analyse() {
    var f = state.f, v = state.view, dx = (v[1] - v[0]) / N, i
    var X = [], F = [], D1 = [], D2 = [], S1 = [], S2 = []
    for (i = 0; i <= N; i++) {
      var x = v[0] + i * dx, y = val(f, x)
      X.push(x); F.push(y)
      D1.push(isFinite(y) ? d1(x) : NaN); D2.push(isFinite(y) ? d2(x) : NaN)
      S1.push(isFinite(y) ? sgn(D1[i], tol1(y)) : NaN); S2.push(isFinite(y) ? sgn(D2[i], tol2(y)) : NaN)
    }
    var crit = [], infl = [], breaks = [], gaps = []
    function near(list, c, d) { return list.some(function (p) { return Math.abs(p.x - c) < (d || 2 * dx) }) }
    function addBreak(c) { if (!near(breaks, c)) breaks.push({ x: c }) }
    function hasBreak(a, b) { return breaks.some(function (p) { return p.x >= a - dx && p.x <= b + dx }) }

    // Runs of grid points where f is undefined: a short run is a point break (an asymptote met exactly),
    // a long one an interval where f is undefined.
    for (i = 0; i <= N; i++) {
      if (isFinite(F[i])) continue
      var j = i
      while (j + 1 <= N && !isFinite(F[j + 1])) j++
      if (j - i < 3 && i > 0 && j < N) addBreak((X[i] + X[j]) / 2)
      else gaps.push([X[Math.max(i - 1, 0)], X[Math.min(j + 1, N)]])
      i = j
    }
    // Jumps and asymptotes: a change between neighbours much larger than the slopes there predict.
    var ys = F.filter(isFinite).slice().sort(function (p, q) { return p - q })
    var yspan = ys.length ? ys[Math.floor(0.98 * (ys.length - 1))] - ys[Math.floor(0.02 * (ys.length - 1))] : 1
    for (i = 0; i < N; i++) {
      if (!isFinite(F[i]) || !isFinite(F[i + 1])) continue
      var dF = Math.abs(F[i + 1] - F[i]), slope = Math.max(Math.abs(D1[i]), Math.abs(D1[i + 1]))
      if (!isFinite(slope) || dF < 0.02 * (yspan || 1) || dF < 4 * slope * dx) continue   // (no slope: the edge of the domain)
      var cj = jumpIn(X[i], X[i + 1])
      if (cj !== null) addBreak(cj)
    }
    // Sign changes of f′ or f″ between grid points with only zeros between them. A change across a point where
    // f is not continuous (an asymptote) is a break, not a critical number or an inflection point.
    function changes(S) {
      var out = [], last = -1, lastS = 0
      for (var k = 0; k <= N; k++) {
        var s = S[k]
        if (isNaN(s)) { last = -1; lastS = 0; continue }
        if (s === 0) continue
        if (lastS !== 0 && s !== lastS) out.push([last, k, lastS, s])
        last = k; lastS = s
      }
      return out.filter(function (q) {
        if (hasBreak(X[q[0]], X[q[1]])) return false
        var cj = jumpIn(X[q[0]], X[q[1]])
        if (cj !== null) { addBreak(cj); return false }
        return true
      })
    }
    // A change of sign must persist two grid cells away: near a cusp the difference quotients straddle the
    // cusp and can flip sign over a stretch shorter than their step, which is not a change of f′ or f″.
    function persists(g, c) { var l = g(c - 2 * dx), r = g(c + 2 * dx); return !(isFinite(l) && isFinite(r) && (l > 0) === (r > 0)) }
    changes(S1).forEach(function (q) {
      var c = bisect(d1, X[q[0]], X[q[1]])
      if (persists(d1, c)) crit.push({ x: c, kind: q[2] > 0 ? 'max' : 'min', smooth: smoothCrit(c) })
    })
    changes(S2).forEach(function (q) {
      var c = bisect(d2, X[q[0]], X[q[1]])
      if (persists(d2, c)) infl.push({ x: c })
    })
    // Points where |f′| touches 0 without a change of sign: critical numbers that are not extrema.
    var maxD1 = 0
    D1.forEach(function (d) { if (isFinite(d)) maxD1 = Math.max(maxD1, Math.abs(d)) })
    for (i = 3; i <= N - 3; i++) {
      var a0 = Math.abs(D1[i]), L = D1[i - 3], R = D1[i + 3]
      if (!isFinite(a0) || !isFinite(L) || !isFinite(R)) continue
      if (!(a0 <= Math.abs(D1[i - 1]) && a0 <= Math.abs(D1[i + 1]))) continue
      if (S1[i - 3] === 0 || S1[i + 3] === 0 || S1[i - 3] !== S1[i + 3] || hasBreak(X[i - 3], X[i + 3])) continue
      var c2 = golden(function (z) { return Math.abs(d1(z)) }, X[i - 1], X[i + 1])
      if (Math.abs(d1(c2)) <= 1e-8 * (1 + maxD1) && !near(crit, c2) && continuousAt(c2)) crit.push({ x: c2, kind: 'flat', smooth: true })
    }
    crit.sort(function (p, q) { return p.x - q.x }); infl.sort(function (p, q) { return p.x - q.x }); breaks.sort(function (p, q) { return p.x - q.x })
    return { X: X, F: F, D1: D1, D2: D2, S1: S1, S2: S2, crit: crit, infl: infl, breaks: breaks, gaps: gaps, dx: dx, y: yRange(F, crit.concat(infl), breaks.length > 0) }
  }

  // A y-range for the plot: all the values, or, when f has breaks (asymptotes), the middle 96% of them;
  // padded, and with every marked point.
  function yRange(F, pts, cut) {
    var vs = F.filter(isFinite).slice().sort(function (p, q) { return p - q })
    if (!vs.length) return [-1, 1]
    var q = cut ? 0.02 : 0, lo = vs[Math.floor(q * (vs.length - 1))], hi = vs[Math.ceil((1 - q) * (vs.length - 1))]
    pts.forEach(function (p) { var y = val(state.f, p.x); if (isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y) } })
    if (hi - lo < 1e-9) { lo -= 1; hi += 1 }
    var s = hi - lo
    if (lo > 0 && lo < 0.25 * s) lo = 0
    if (hi < 0 && -hi < 0.25 * s) hi = 0
    s = hi - lo
    return [lo - 0.1 * s, hi + 0.12 * s]
  }

  // The intervals between the cuts of a sign chart, each with the sign that most of its grid points have.
  function chart(S, cuts) {
    var A = state.A, v = state.view, xs = [v[0]].concat(cuts.map(function (p) { return p.x }), [v[1]])
    var out = []
    for (var k = 0; k + 1 < xs.length; k++) {
      var a = xs[k], b = xs[k + 1], cnt = { 1: 0, '-1': 0, 0: 0 }, fin = 0, tot = 0
      for (var i = 0; i <= N; i++) {
        var x = A.X[i]
        if (x <= a + 2 * A.dx || x >= b - 2 * A.dx) continue
        tot++
        if (isNaN(S[i])) continue
        fin++; cnt[S[i]]++
      }
      var s = !tot ? null : fin < tot / 2 ? 'undef' : cnt[1] >= cnt[-1] && cnt[1] > cnt[0] ? '+' : cnt[-1] > cnt[1] && cnt[-1] > cnt[0] ? '−' : '0'
      if (s) out.push({ a: a, b: b, s: s })
    }
    return out
  }
  function cutsFor(which) {
    var A = state.A, cuts = A.breaks.map(function (p) { return { x: p.x, kind: 'break' } })
    A.gaps.forEach(function (g) { cuts.push({ x: g[0], kind: 'gap' }, { x: g[1], kind: 'gap' }) })
    if (which === 1) A.crit.forEach(function (p) { cuts.push({ x: p.x, kind: 'crit' }) })
    else {
      A.infl.forEach(function (p) { cuts.push({ x: p.x, kind: 'infl' }) })
      A.crit.forEach(function (p) { if (!p.smooth) cuts.push({ x: p.x, kind: 'corner' }) })   // f″ does not exist there either
    }
    cuts.sort(function (p, q) { return p.x - q.x })
    return cuts.filter(function (p, k) { return k === 0 || p.x - cuts[k - 1].x > 1e-9 * span() })
  }

  // ------------------------------------------------------------------ controls and layout
  var sel = api.select({
    label: t('Function', '函数'), value: 'cubic',
    options: EXAMPLES.map(function (e) { return { value: e.value, label: e.label } }).concat([{ value: 'own', label: t('your own', '自定义') }]),
    onchange: function (v) {
      var ex = EXAMPLES.filter(function (e) { return e.value === v })[0]
      if (!ex) return
      field.set(ex.src)
      if (setFunction(ex.src)) setView(ex.view, ex.x)
    },
  })
  var field = api.field({ label: 'f(x) =', value: EXAMPLES[0].src, size: 20, onchange: function (src) {
    if (!setFunction(src)) return
    var ex = EXAMPLES.filter(function (e) { return e.src === src.trim() })[0]
    sel.set(ex ? ex.value : 'own')
    setView(state.view, state.x)
  } })
  var slider = api.slider({ label: t('Point x', '点 x'), min: state.view[0], max: state.view[1], step: 0.01, value: state.x,
    fmt: function (v) { return minus(+v.toFixed(6)) },
    oninput: function (v) { state.x = v; redrawPoint() } })
  var zoomIn = api.button(t('Zoom in', '放大'), function () { zoom(0.5) })
  var zoomOut = api.button(t('Zoom out', '缩小'), function () { zoom(2) })
  var pointOut = h('div', { class: 'cw-readout se-point', 'aria-live': 'polite' })
  var summary = h('div', { class: 'cw-readout se-summary', 'aria-live': 'polite' })
  var mainBox = h('div', { class: 'se-main' }), c1Box = h('div', { class: 'se-chart se-chart1' }), c2Box = h('div', { class: 'se-chart se-chart2' })
  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(mainBox)
  root.appendChild(h('div', { class: 'se-label' }, t('Sign of f′(x): where f increases (+) and decreases (−)', 'f′(x) 的符号：f 递增（+）与递减（−）')))
  root.appendChild(c1Box)
  root.appendChild(h('div', { class: 'se-label' }, t('Sign of f″(x): where the graph is concave up (+) and concave down (−)', 'f″(x) 的符号：图像上凹（+）与下凹（−）')))
  root.appendChild(c2Box)
  root.appendChild(h('div', { class: 'se-key' }, t('Blue: f increasing. Orange: f decreasing. Green background: concave up. Purple: concave down. Dots: critical numbers (grey: not an extremum). Squares: inflection points. Dashed lines: f undefined or not continuous. All found numerically, so approximate.',
    '蓝色：f 递增。橙色：f 递减。绿色背景：上凹。紫色背景：下凹。圆点：临界点（灰色：不是极值点）。方块：拐点。虚线：f 无定义或不连续。均为数值计算所得，是近似值。')))
  root.appendChild(api.row(slider.el, zoomOut, zoomIn))
  root.appendChild(pointOut)
  root.appendChild(summary)
  api.css('shape-explorer', [
    '.se-label{font-size:.78rem;color:var(--slate);margin:.3rem 0 .1rem}',
    '.se-key{font-size:.8rem;color:var(--slate);margin:.4rem 0}',
    '.se-main{margin:.4rem 0 0}',
    '.cw-field .cw-input{min-width:0}',
    '.se-chart .cw-plot{background:var(--white)}',
  ].join(''))

  var COL = { up: 'var(--blue)', down: 'var(--orange)', flat: 'var(--slate)', cu: 'var(--green)', cd: 'var(--purple)' }

  function curveRuns(P) {
    var A = state.A, v = P.view, ysp = v[3] - v[2], run = [], runS = null
    function flush() {
      if (run.length > 1) {
        var el = P.poly(run, { color: runS > 0 ? COL.up : runS < 0 ? COL.down : COL.flat, width: 2.6 })
        el.setAttribute('class', runS > 0 ? 'se-up' : runS < 0 ? 'se-down' : 'se-flat')
      }
      run = []
    }
    var breakXs = A.breaks.map(function (p) { return p.x })
    for (var i = 0; i <= A.X.length - 1; i++) {
      var x = A.X[i], y = A.F[i], s = A.S1[i]
      if (!isFinite(y) || Math.abs(P.Y(y)) > 1e5) { flush(); runS = null; continue }
      var prev = run.length ? run[run.length - 1] : null
      if (prev && (Math.abs(y - prev[1]) > 0.5 * ysp || breakXs.some(function (b) { return prev[0] < b && x > b }))) { flush(); runS = null; prev = null }
      if (s === 0 && runS !== null) s = runS                 // a single flat point continues its run
      if (runS !== null && s !== runS) { var last = run[run.length - 1]; flush(); run = [last] }
      runS = s
      run.push([x, y])
    }
    flush()
  }

  var P = api.plot(mainBox, {
    view: [-2.5, 2.5, -1, 1], aspect: 0.56,
    label: t('Graph of f, coloured where it increases and decreases, with its concavity shaded', 'f 的图像：按递增、递减着色，并以底色标出凹向'),
    draw: function (P) {
      var A = state.A
      if (!A) { P.axes(); return }
      var v = P.view
      chart(A.S2, cutsFor(2)).forEach(function (seg) {
        if (seg.s !== '+' && seg.s !== '−') return
        var r = P.rect(seg.a, v[2], seg.b, v[3], { fill: seg.s === '+' ? COL.cu : COL.cd, opacity: 0.1, color: 'none', width: 0 })
        r.setAttribute('class', seg.s === '+' ? 'se-cu' : 'se-cd')
      })
      P.axes()
      A.breaks.forEach(function (p) { P.vline(p.x, { color: 'var(--muted)', width: 1.3 }).setAttribute('class', 'se-break') })
      curveRuns(P)
      var sx = (v[1] - v[0]) / (P.W - 16), sy = (v[3] - v[2]) / (P.H - 16)
      A.crit.forEach(function (p) {
        var c = P.point(p.x, val(state.f, p.x), { color: p.kind === 'flat' ? 'var(--slate)' : 'var(--navy)', r: 5 })
        c.setAttribute('class', 'se-crit se-' + p.kind)
      })
      A.infl.forEach(function (p) {
        var y = val(state.f, p.x), d = 4.5
        var sq = P.poly([[p.x - d * sx, y - d * sy], [p.x + d * sx, y - d * sy], [p.x + d * sx, y + d * sy], [p.x - d * sx, y + d * sy]],
          { closed: true, fill: 'var(--purple)', opacity: 1, color: 'var(--white)', width: 1.2, layer: 'front' })
        sq.setAttribute('class', 'se-infl')
      })
      drawMarker(P)
    },
  })
  function drawMarker(P) {
    var x = state.x, y = val(state.f, x)
    var vl = P.vline(x, { color: 'var(--orange)', width: 1.2 })
    vl.setAttribute('class', 'se-marker')
    if (!isFinite(y)) return
    var m = d1(x), L = 0.08 * span()
    if (isFinite(m) && smoothAt(x)) P.line(x - L, y - L * m, x + L, y + L * m, { color: 'var(--navy)', width: 1.6 }).setAttribute('class', 'se-tangent')
    P.point(x, y, { color: 'var(--orange)', r: 5 }).setAttribute('class', 'se-pt')
  }
  function chartPlot(box, which, name) {
    var opts = {
      view: [-2.5, 2.5, 0, 1], grid: false, label: name,
      draw: function (P) {
        var A = state.A
        if (!A) return
        var cuts = cutsFor(which)
        chart(which === 1 ? A.S1 : A.S2, cuts).forEach(function (seg) {
          var col = seg.s === '+' ? (which === 1 ? COL.up : COL.cu) : seg.s === '−' ? (which === 1 ? COL.down : COL.cd) : seg.s === '0' ? COL.flat : 'var(--muted)'
          var r = P.rect(seg.a, 0.2, seg.b, 0.85, { fill: col, opacity: seg.s === 'undef' ? 0.12 : 0.28, color: col, width: 1 })
          r.setAttribute('class', 'se-seg')
          r.setAttribute('data-sign', seg.s)
          if (P.X(seg.b) - P.X(seg.a) >= 14 && seg.s !== 'undef') P.text((seg.a + seg.b) / 2, 0.52, seg.s, { anchor: 'middle', dy: 6, color: 'var(--navy)' }).setAttribute('style', 'font-size:17px;font-weight:700')
        })
        cuts.forEach(function (p) {
          P.line(p.x, 0.05, p.x, 1, { color: p.kind === 'break' || p.kind === 'gap' ? 'var(--muted)' : 'var(--navy)', width: 1.4, dash: p.kind === 'break' || p.kind === 'gap' ? '3 3' : null })
        })
        P.line(state.x, 0, state.x, 1, { color: 'var(--orange)', width: 1.4 })
      },
    }
    // A chart about 46 px high at every width (the plot reads its aspect ratio each time it is sized).
    Object.defineProperty(opts, 'aspect', { get: function () { return 46 / Math.max(280, Math.min(760, box.clientWidth || 600)) } })
    return api.plot(box, opts)
  }
  var C1 = chartPlot(c1Box, 1, t('Sign chart of f′', 'f′ 的符号表'))
  var C2 = chartPlot(c2Box, 2, t('Sign chart of f″', 'f″ 的符号表'))

  // ------------------------------------------------------------------ state changes
  function setFunction(src) {
    var r = api.Expr.parse(src, ['x'])
    if (!r.ok) { field.error(r.error); return false }
    field.error('')
    state.f = function (x) { return r.f(x) }
    return true
  }
  function setView(v, x) {
    state.view = v.slice()
    var sp = v[1] - v[0], step = Math.pow(10, Math.floor(Math.log10(sp / 500)))
    slider.input.min = v[0]; slider.input.max = v[1]; slider.input.step = step
    state.x = Math.min(v[1], Math.max(v[0], Math.round(x / step) * step))
    state.x = +state.x.toFixed(10)
    slider.set(state.x)
    state.A = analyse()
    P.view = [v[0], v[1], state.A.y[0], state.A.y[1]]
    C1.view = [v[0], v[1], 0, 1]; C2.view = [v[0], v[1], 0, 1]
    P.redraw(); C1.redraw(); C2.redraw()
    summary.textContent = describe()
    pointOut.textContent = describePoint()
  }
  function zoom(k) {
    var v = state.view, c = state.x, half = (v[1] - v[0]) * k / 2
    if (half > 500 || half < 1e-3) return
    var a = +(c - half).toPrecision(6), b = +(c + half).toPrecision(6)
    setView([a, b], c)
  }
  function redrawPoint() { P.redraw(); C1.redraw(); C2.redraw(); pointOut.textContent = describePoint() }
  P.onDrag(function (x) {
    var v = state.view, step = +slider.input.step
    state.x = +Math.min(v[1], Math.max(v[0], Math.round(x / step) * step)).toFixed(10)
    slider.set(state.x)
    redrawPoint()
  })

  // ------------------------------------------------------------------ words
  function describePoint() {
    var x = state.x, y = val(state.f, x), lines = ['x = ' + minus(+x.toFixed(6))]
    if (!isFinite(y)) { lines.push(t('f is not defined here.', 'f 在此处没有定义。')); return lines.join('\n') }
    lines.push('f(x) ' + eq(y))
    var m = d1(x), k = d2(x)
    if (!smoothAt(x)) lines.push(t('f′(x) does not seem to exist here: the slopes from the left and from the right differ.', 'f′(x) 在此处似乎不存在：左右两侧的斜率不同。'))
    else if (!isFinite(m)) lines.push(t('f′(x) cannot be computed here.', '此处无法计算 f′(x)。'))
    else {
      var s1 = sgn(m, tol1(y))
      // "≈ 3.75 > 0: …", but "≈ 0: …" with no space before the colon
      lines.push('f′(x) ≈ ' + num.fmt(s1 === 0 ? 0 : m, 4) + (s1 > 0 ? ' ' + t('> 0: f is increasing here', '> 0：f 在此处递增') : s1 < 0 ? ' ' + t('< 0: f is decreasing here', '< 0：f 在此处递减') : t(': a horizontal tangent', '：切线水平')))
      if (isFinite(k)) {
        var s2 = sgn(k, tol2(y))
        lines.push('f″(x) ≈ ' + num.fmt(s2 === 0 ? 0 : k, 4) + (s2 > 0 ? ' ' + t('> 0: concave up here', '> 0：此处上凹') : s2 < 0 ? ' ' + t('< 0: concave down here', '< 0：此处下凹') : t(': no information about the bend', '：无法判断凹向')))
      }
    }
    lines.push(t('(f′ and f″ are computed numerically.)', '（f′ 与 f″ 为数值计算。）'))
    return lines.join('\n')
  }
  function describe() {
    var A = state.A, v = state.view
    var lines = [t('In the window ' + minus(num.fmt(v[0], 6)) + ' ≤ x ≤ ' + minus(num.fmt(v[1], 6)) + ' (numerical, approximate):',
      '在窗口 ' + minus(num.fmt(v[0], 6)) + ' ≤ x ≤ ' + minus(num.fmt(v[1], 6)) + ' 内（数值计算，近似值）：')]
    var names = { max: t('local maximum', '极大值'), min: t('local minimum', '极小值'), flat: t('f′ = 0 but f′ does not change sign: no extremum', 'f′ = 0 但 f′ 不变号：不是极值') }
    var cr = A.crit.map(function (p) {
      return 'x ≈ ' + fx(p.x) + ' (' + names[p.kind] + (p.smooth ? '' : t('; f′ does not exist there', '；该处 f′ 不存在')) + ')'
    })
    lines.push(t('Critical numbers: ', '临界点：') + (cr.length ? cr.join(', ') : t('none', '无')))
    var inf = A.infl.map(function (p) { return 'x ≈ ' + fx(p.x) })
    lines.push(t('Inflection points: ', '拐点：') + (inf.length ? inf.join(', ') : t('none', '无')))
    if (A.breaks.length) lines.push(t('Not defined or not continuous at: ', '无定义或不连续之处：') + A.breaks.map(function (p) { return 'x ≈ ' + fx(p.x) }).join(', ') + t(' (no extremum or inflection point can be there)', '（这些点不可能是极值点或拐点）'))
    if (A.gaps.length) lines.push(t('Undefined on part of the window.', '在窗口的一部分上无定义。'))
    return lines.join('\n')
  }

  setFunction(EXAMPLES[0].src)
  setView(EXAMPLES[0].view, EXAMPLES[0].x)
})
