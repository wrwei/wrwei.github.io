/* accumulation (Module 10): the area function A(x) = ∫ from a to x of f(t) dt, and its slope.
 * Top: y = f(t) with the area between a and x shaded, blue where it counts positive in A(x) and orange
 * where it counts negative. When x > a that is where f > 0 and f < 0; when x < a the integral runs
 * backwards and the colours swap. Bottom: the graph of A over the whole range, computed numerically with
 * api.num.integrate, the point (x, A(x)) and the tangent line there. The readout gives A(x) and the slope
 * of A at x, measured from A itself, next to the height f(x): Part 1 of the Fundamental Theorem. */
CalcWidgets.register('accumulation', function (root, api) {
  var t = api.t, h = api.h, num = api.num
  var PRESETS = [
    { value: 'sin', label: 'sin x', src: 'sin(x)', view: [-6.5, 6.5], a: 0, x: 2 },
    { value: 'quad', label: 'x² − 1', src: 'x^2 - 1', view: [-2.5, 2.5], a: 0, x: 2 },
    { value: 'exp', label: 'eˣ/4', src: 'e^x/4', view: [-4, 3], a: 0, x: 1 },
    { value: 'witch', label: '1/(1 + x²)', src: '1/(1 + x^2)', view: [-5, 5], a: 0, x: 1 },
    { value: 'cos', label: 'cos x + 0.5', src: 'cos(x) + 0.5', view: [-6.5, 6.5], a: 0, x: 3 },
  ]
  var BIG = 1e8          // a value of f beyond this counts as "too large": A is not computed through it
  var GRID = 200         // segments of the graph of A
  var state = { f: null, view: PRESETS[0].view.slice(), a: PRESETS[0].a, x: PRESETS[0].x, curve: null, fy: [-1, 1], Ay: [-1, 1] }

  function two(v) { return String(Math.round(v * 100) / 100).replace('-', '−') }
  function snap(v, step) {
    v = Math.round(v / step) * step
    v = Math.min(state.view[1], Math.max(state.view[0], v))
    return Math.round(v * 100) / 100
  }
  // "= v" when the digits shown are the value itself, "≈ v" when they are rounded.
  function eq(v, sig) {
    var s = num.fmt(v, sig || 4)
    return (Number(s.replace(/−/g, '-')) === v ? '= ' : '≈ ') + s
  }
  // A numerical result: rounding noise below 1e-7 is shown as 0.
  function approx(v, sig) { return Math.abs(v) < 1e-7 ? '0' : num.fmt(v, sig || 4) }

  // The integral of f from p to q (either order), or NaN when f is undefined or beyond BIG on the way.
  function integral(p, q) {
    if (p === q) return 0
    var bad = false
    var g = function (s) {
      var y
      try { y = state.f(s) } catch (e) { y = NaN }
      if (!isFinite(y) || Math.abs(y) > BIG) { bad = true; return 0 }
      return y
    }
    var r = num.integrate(g, p, q, 1e-11)
    return bad || !isFinite(r) ? NaN : r
  }

  // The graph of A: from a outwards in both directions, segment by segment; past a point where f is
  // undefined (or too large) A is not defined.
  function computeCurve() {
    var v = state.view, xs = [], As = [], i, s
    for (i = 0; i <= GRID; i++) { xs.push(v[0] + (v[1] - v[0]) * i / GRID); As.push(NaN) }
    var prev = state.a, acc = 0, ok = true
    for (i = 0; i <= GRID; i++) {
      if (xs[i] < state.a) continue
      if (ok) { s = integral(prev, xs[i]); if (isFinite(s)) { acc += s; prev = xs[i] } else ok = false }
      if (ok) As[i] = acc
    }
    prev = state.a; acc = 0; ok = true
    for (i = GRID; i >= 0; i--) {
      if (xs[i] >= state.a) continue
      if (ok) { s = integral(prev, xs[i]); if (isFinite(s)) { acc += s; prev = xs[i] } else ok = false }
      if (ok) As[i] = acc
    }
    state.curve = { xs: xs, As: As }
  }

  // A y-range for the values of f over the view: the middle 96% of the values, padded, with 0 in it.
  function fRange() {
    var vs = [], v0 = state.view[0], v1 = state.view[1], i, y
    for (i = 0; i <= 400; i++) {
      try { y = state.f(v0 + (v1 - v0) * i / 400) } catch (e) { y = NaN }
      if (isFinite(y) && Math.abs(y) <= BIG) vs.push(y)
    }
    if (!vs.length) return [-1, 1]
    vs.sort(function (p, q) { return p - q })
    var lo = Math.min(0, vs[Math.floor(0.02 * (vs.length - 1))]), hi = Math.max(0, vs[Math.ceil(0.98 * (vs.length - 1))])
    if (hi - lo < 1e-9) { lo -= 1; hi += 1 }
    var pad = 0.12 * (hi - lo)
    return [lo - pad, hi + pad]
  }
  // A y-range for A that stays the same while a moves, so that moving a visibly shifts the graph of A
  // up or down. With F the integral from the left end of the view, A(x) = F(x) − F(a), so every value
  // lies between min F − max F and max F − min F.
  function ARange() {
    var keep = state.a
    state.a = state.view[0]
    computeCurve()
    var F = state.curve.As.filter(isFinite)
    state.a = keep
    if (F.length < 2) return [-1, 1]
    var span = Math.max.apply(null, F) - Math.min.apply(null, F)
    if (span < 1e-9) span = 1
    return [-1.1 * span, 1.1 * span]
  }

  // The slope of A at x, measured from A: the left and right difference quotients of A at two steps.
  // For a continuous f they agree (both are averages of f over shrinking intervals); where f jumps they
  // differ by the size of the jump, however small the step.
  function slope(x) {
    var s = 1e-4 * (1 + Math.abs(x))
    function lr(d) { return [integral(x - d, x) / d, integral(x, x + d) / d] }
    var p = lr(s), q = lr(s / 10)
    if (!p.concat(q).every(isFinite)) return { kind: 'side' }
    var gap1 = Math.abs(p[1] - p[0]), gap2 = Math.abs(q[1] - q[0])
    if (gap1 > 1e-3 * (1 + Math.abs(p[0]) + Math.abs(p[1])) && gap2 > 0.5 * gap1) return { kind: 'corner', L: q[0], R: q[1] }
    return { kind: 'ok', d: (p[0] + p[1]) / 2 }
  }

  // ------------------------------------------------------------ controls
  var sel = api.select({
    label: t('Function', '函数'), value: 'sin',
    options: PRESETS.map(function (p) { return { value: p.value, label: 'f(x) = ' + p.label } }).concat([{ value: 'own', label: t('your own', '自定义') }]),
    onchange: function (val) {
      var p = PRESETS.filter(function (q) { return q.value === val })[0]
      if (!p) { field.input.focus(); return }
      field.set(p.src)
      field.error('')
      if (setFunction(p.src)) setView(p.view, p.a, p.x)
    },
  })
  var field = api.field({ label: 'f(x) =', value: PRESETS[0].src, size: 18, onchange: function (src) {
    if (!setFunction(src)) { redraw(); return }
    var p = PRESETS.filter(function (q) { return q.src === src.trim() })[0]
    sel.set(p ? p.value : 'own')
    newCurve()
    redraw()
  } })
  var aSlider = api.slider({ label: t('Lower limit a', '下限 a'), min: state.view[0], max: state.view[1], step: 0.05, value: state.a, fmt: two,
    oninput: function (v) { state.a = snap(v, 0.05); computeCurve(); redraw() } })
  var xSlider = api.slider({ label: t('Upper limit x', '上限 x'), min: state.view[0], max: state.view[1], step: 0.01, value: state.x, fmt: two,
    oninput: function (v) { state.x = snap(v, 0.01); redraw() } })
  var readout = api.readout()
  var topBox = h('div', { class: 'acc-plot acc-fplot' }), botBox = h('div', { class: 'acc-plot acc-aplot' })
  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(h('div', { class: 'acc-plots' }, topBox, botBox))
  root.appendChild(h('div', { class: 'acc-key' }, t(
    'Top: y = f(t) and the area from a to x; blue counts as positive in A(x), orange as negative (when x is left of a, the integral runs backwards and the colours swap). Bottom: y = A(x), computed numerically, with its tangent line at x. Purple: the height f(x) above, and the tangent below, whose slope is f(x).',
    '上图：y = f(t) 以及从 a 到 x 的面积；蓝色在 A(x) 中计为正，橙色计为负（x 在 a 左边时积分反向，两种颜色互换）。下图：y = A(x)（数值计算）及其在 x 处的切线。紫色：上图中的高度 f(x)，以及下图中斜率为 f(x) 的切线。')))
  root.appendChild(h('div', { class: 'acc-sliders' }, aSlider.el, xSlider.el))
  root.appendChild(readout)
  api.css('accumulation', [
    '.acc-plots{display:flex;flex-direction:column;gap:4px;margin:.4rem 0}',
    '.acc-key{font-size:.8rem;color:var(--slate);margin:.25rem 0 .4rem}',
    '.acc-sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:.35rem 1rem;margin:.4rem 0}',
  ].join(''))

  // ------------------------------------------------------------ the two graphs
  function clampY(y, P) { var v = P.view, m = 4 * (v[3] - v[2]); return Math.max(v[2] - m, Math.min(v[3] + m, y)) }
  function shadeArea(P) {
    var lo = Math.min(state.a, state.x), hi = Math.max(state.a, state.x)
    if (hi - lo < 1e-12 || !isFinite(integral(lo, hi))) return
    var n = 240, plus = [], minus = [], i, s, y
    var backwards = state.x < state.a
    for (i = 0; i <= n; i++) {
      s = lo + (hi - lo) * i / n
      try { y = state.f(s) } catch (e) { y = 0 }
      if (!isFinite(y)) y = 0
      y = clampY(y, P)
      plus.push([s, Math.max(y, 0)]); minus.push([s, Math.min(y, 0)])
    }
    // Where f > 0 the region counts positive when x > a and negative when x < a; where f < 0, the reverse.
    var parts = [[plus, backwards ? 'minus' : 'plus'], [minus, backwards ? 'plus' : 'minus']]
    parts.forEach(function (pr) {
      var pts = pr[0]
      if (!pts.some(function (q) { return Math.abs(q[1]) > 1e-12 })) return
      var poly = pts.concat([[hi, 0], [lo, 0]])
      var el = P.poly(poly, { fill: pr[1] === 'plus' ? 'var(--blue)' : 'var(--orange)', opacity: 0.3, color: 'none', width: 0, closed: true })
      el.setAttribute('class', 'acc-' + pr[1])
    })
  }
  var Pf = api.plot(topBox, {
    view: [state.view[0], state.view[1], -1, 1], aspect: 0.42, xlabel: 't', ylabel: 'f(t)',
    label: t('Graph of f with the signed area from a to x shaded', 'f 的图像，阴影为从 a 到 x 的有向面积'),
    draw: function (P) {
      P.axes()
      if (!state.f) return
      shadeArea(P)
      P.curve(state.f, { color: 'var(--navy)', width: 2.4 })
      var v = P.view, fx
      P.line(state.a, v[2], state.a, v[3], { color: 'var(--slate)', width: 1.2, dash: true })
      P.text(state.a, v[2], 'a', { dx: 4, dy: -6, color: 'var(--slate)' })
      try { fx = state.f(state.x) } catch (e) { fx = NaN }
      if (isFinite(fx)) {
        var bar = P.line(state.x, 0, state.x, clampY(fx, P), { color: 'var(--purple)', width: 3.2 })
        bar.setAttribute('class', 'acc-height')
        P.point(state.x, clampY(fx, P), { color: 'var(--purple)', r: 4.5 })
      }
      P.text(state.x, v[2], 'x', { dx: 4, dy: -6, color: 'var(--purple)', bold: true })
    },
  })
  var Pa = api.plot(botBox, {
    view: [state.view[0], state.view[1], -1, 1], aspect: 0.42, xlabel: 'x', ylabel: t('A(x) (numerical)', 'A(x)（数值）'),
    label: t('Graph of the area function A, computed numerically, with its tangent line at x', '面积函数 A 的图像（数值计算）及其在 x 处的切线'),
    draw: function (P) {
      P.axes()
      if (!state.f || !state.curve) return
      var xs = state.curve.xs, As = state.curve.As, run = [], i
      function flush() { if (run.length > 1) P.poly(run, { color: 'var(--green)', width: 2.6 }).setAttribute('class', 'acc-Acurve'); run = [] }
      for (i = 0; i < xs.length; i++) {
        if (isFinite(As[i])) run.push([xs[i], clampY(As[i], P)])
        else flush()
      }
      flush()
      P.point(state.a, 0, { color: 'var(--slate)', r: 3.5 })
      var Ax = integral(state.a, state.x)
      if (!isFinite(Ax)) return
      var s = slope(state.x)
      if (s.kind === 'ok') {
        var w = 0.14 * (P.view[1] - P.view[0])
        var tl = P.line(state.x - w, Ax - s.d * w, state.x + w, Ax + s.d * w, { color: 'var(--purple)', width: 2.2 })
        tl.setAttribute('class', 'acc-tangent')
      }
      P.point(state.x, Ax, { color: 'var(--navy)' })
    },
  })
  function pick(x) { state.x = snap(x, 0.01); xSlider.set(state.x); redraw() }
  Pf.onDrag(function (x) { pick(x) })
  Pa.onDrag(function (x) { pick(x) })

  // ------------------------------------------------------------ state changes
  function setFunction(src) {
    var r = api.Expr.parse(src, ['x'])
    if (!r.ok) { field.error(r.error); return false }
    field.error('')
    state.f = function (s) { return r.f(s) }
    return true
  }
  function newCurve() {
    state.fy = fRange()
    state.Ay = ARange()
    computeCurve()
  }
  function setView(v, a, x) {
    state.view = v.slice()
    ;[aSlider, xSlider].forEach(function (sl) { sl.input.min = v[0]; sl.input.max = v[1] })
    state.a = snap(a, 0.05); state.x = snap(x, 0.01)
    aSlider.set(state.a); xSlider.set(state.x)
    newCurve()
    redraw()
  }

  function describe() {
    var a = state.a, x = state.x
    var lines = ['a = ' + two(a) + ', x = ' + two(x)]
    var Ax = integral(a, x)
    if (!isFinite(Ax)) {
      lines.push(t('A(x) is not defined: f is undefined, or larger than 10⁸, somewhere between a and x.',
        'A(x) 没有定义：在 a 与 x 之间，f 在某处无定义或大于 10⁸。'))
      return lines.join('\n')
    }
    if (x === a) lines.push(t('A(x) = 0   (x = a: no area yet)', 'A(x) = 0   （x = a：还没有面积）'))
    else lines.push(t('A(x) ≈ ' + approx(Ax, 5) + '   (signed area from a to x, computed numerically' + (x < a ? '; x < a, so it runs backwards)' : ')'),
      'A(x) ≈ ' + approx(Ax, 5) + '   （从 a 到 x 的有向面积，数值计算' + (x < a ? '；x < a，积分反向）' : '）')))
    var fx
    try { fx = state.f(x) } catch (e) { fx = NaN }
    var s = slope(x)
    if (s.kind === 'side' || !isFinite(fx)) {
      lines.push(t('The slope of A at x cannot be measured: f is not defined on both sides of x.', '无法测量 A 在 x 处的斜率：f 在 x 的两侧并非都有定义。'))
    } else if (s.kind === 'corner') {
      lines.push(t('f jumps at x, and A has a corner: its slope from the left is ≈ ' + approx(s.L) + ', from the right ≈ ' + approx(s.R) + '.',
        'f 在 x 处跳跃，A 在这里有一个尖角：左侧斜率 ≈ ' + approx(s.L) + '，右侧斜率 ≈ ' + approx(s.R) + '。'))
      lines.push(t('Part 1 of the Fundamental Theorem needs f to be continuous at x.', '微积分基本定理第一部分要求 f 在 x 处连续。'))
    } else {
      lines.push(t('slope of A at x ≈ ' + approx(s.d) + ' = f(x) ' + eq(fx), 'A 在 x 处的斜率 ≈ ' + approx(s.d) + ' = f(x) ' + eq(fx)))
    }
    return lines.join('\n')
  }

  function redraw() {
    Pf.view = [state.view[0], state.view[1], state.fy[0], state.fy[1]]
    Pa.view = [state.view[0], state.view[1], state.Ay[0], state.Ay[1]]
    Pf.redraw(); Pa.redraw()
    readout.textContent = state.f ? describe() : ''
  }

  setFunction(PRESETS[0].src)
  setView(PRESETS[0].view, PRESETS[0].a, PRESETS[0].x)
})
