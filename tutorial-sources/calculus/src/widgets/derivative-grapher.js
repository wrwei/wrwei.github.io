/* derivative-grapher (Module 5): type a function f, or choose one; the top graph shows f with its
 * tangent line at x = a, the bottom graph f′ (computed numerically, by central differences) with the
 * point (a, f′(a)). A dashed vertical line at x = a links the two graphs. The readout gives f(a), f′(a)
 * and whether f is rising, falling or flat at a: where f is flat, f′ meets zero. */
CalcWidgets.register('derivative-grapher', function (root, api) {
  var t = api.t, h = api.h, num = api.num
  var EXAMPLES = [
    { value: 'cubic', label: 'x³ − 3x', src: 'x^3 - 3x', view: [-2.2, 2.2], a: 1.5 },
    { value: 'sin', label: 'sin(x)', src: 'sin(x)', view: [-7, 7], a: 0.5 },
    { value: 'xsin', label: 'x·sin(x)', src: 'x sin(x)', view: [-7, 7], a: 1 },
    { value: 'x2cos', label: 'x²·cos(x)', src: 'x^2 cos(x)', view: [-5, 5], a: 1 },
    { value: 'witch', label: '1/(1 + x²)', src: '1/(1 + x^2)', view: [-4, 4], a: 1 },
    { value: 'sinsq', label: 'sin(x²)', src: 'sin(x^2)', view: [-3, 3], a: 1 },
    { value: 'abs', label: '|x|', src: '|x|', view: [-3, 3], a: 1 },
  ]
  var STEP = 0.01
  var state = { fn: null, view: EXAMPLES[0].view.slice(), a: EXAMPLES[0].a }

  function two(v) { return String(Math.round(v * 100) / 100).replace('-', '−') }
  function clampA(v) {
    v = Math.round(v / STEP) * STEP
    v = Math.min(state.view[1], Math.max(state.view[0], v))
    return Math.round(v * 100) / 100
  }
  // "= v" when the shown digits are the value itself, "≈ v" when they are rounded.
  function eq(v) {
    var s = num.fmt(v, 5)
    return (Number(s.replace(/−/g, '-')) === v ? '= ' : '≈ ') + s
  }

  // The slope at a, numerically (api.num.deriv, a central difference), with checks that a slope exists,
  // made with the left and right difference quotients at two steps, h and h/10. At a corner the left and
  // right slopes differ by an amount that does not shrink with the step (for a smooth function the
  // difference is about h·f″(a), so it shrinks tenfold); at a vertical tangent or a jump the central
  // differences at the two steps disagree.
  function slope(f, a) {
    var h = 1e-5 * (1 + Math.abs(a)), fa = f(a)
    function lr(s) { return [(fa - f(a - s)) / s, (f(a + s) - fa) / s] }
    var p = lr(h), q = lr(h / 10)
    if (!p.concat(q).every(isFinite)) return { kind: 'side' }
    var gap1 = Math.abs(p[1] - p[0]), gap2 = Math.abs(q[1] - q[0])
    if (gap1 > 1e-3 * (1 + Math.abs(p[0]) + Math.abs(p[1])) && gap2 > 0.5 * gap1) return { kind: 'corner', L: q[0], R: q[1] }
    var d1 = (p[0] + p[1]) / 2, d2 = (q[0] + q[1]) / 2
    if (Math.abs(d1 - d2) > 1e-2 * (1 + Math.abs(d2))) return { kind: 'unsettled' }
    return { kind: 'ok', d: num.deriv(f, a) }
  }

  // A y-range for the values of g over the x-range: the middle 96% of the values, padded, with 0 in it
  // when asked (the graph of f′ must show where it meets zero) or when 0 is close.
  function yRange(g, withZero) {
    var vs = [], v0 = state.view[0], v1 = state.view[1], i, y
    for (i = 0; i <= 300; i++) {
      try { y = g(v0 + (v1 - v0) * i / 300) } catch (e) { y = NaN }
      if (isFinite(y)) vs.push(y)
    }
    if (!vs.length) return [-1, 1]
    vs.sort(function (p, q) { return p - q })
    var lo = vs[Math.floor(0.02 * (vs.length - 1))], hi = vs[Math.ceil(0.98 * (vs.length - 1))]
    if (hi - lo < 1e-9) { lo -= 1; hi += 1 }
    var span = hi - lo
    if (withZero || (lo > 0 && lo < span)) lo = Math.min(lo, 0)
    if (withZero || (hi < 0 && -hi < span)) hi = Math.max(hi, 0)
    span = hi - lo
    return [lo - 0.12 * span, hi + 0.12 * span]
  }
  function dfun(x) { return num.deriv(state.fn, x) }
  // A curve, broken where it is undefined, off the scale, or jumps by more than a quarter of the
  // plot's height between neighbouring samples (so that a jump in f′ is not drawn as a vertical line).
  function curve(P, g, color) {
    var v = P.view, n = Math.max(400, P.W * 2), span = v[3] - v[2], run = [], prev = null, i, x, y
    function flush() { if (run.length > 1) P.poly(run, { color: color, width: 2.4 }); run = [] }
    for (i = 0; i <= n; i++) {
      x = v[0] + (v[1] - v[0]) * i / n
      try { y = g(x) } catch (e) { y = NaN }
      if (!isFinite(y) || Math.abs(P.Y(y)) > 1e5) { flush(); prev = null; continue }
      if (prev !== null && Math.abs(y - prev) > 0.25 * span) flush()
      run.push([x, y]); prev = y
    }
    flush()
  }

  var sel = api.select({
    label: t('Example', '例子'), value: 'cubic',
    options: EXAMPLES.map(function (e) { return { value: e.value, label: e.label } }).concat([{ value: 'own', label: t('your own', '自定义') }]),
    onchange: function (v) {
      var ex = EXAMPLES.filter(function (e) { return e.value === v })[0]
      if (!ex) return
      field.set(ex.src)
      setFunction(ex.src)
      setView(ex.view, ex.a)
    },
  })
  var field = api.field({ label: 'f(x) =', value: EXAMPLES[0].src, size: 22, onchange: function (src) {
    if (!setFunction(src)) return
    var ex = EXAMPLES.filter(function (e) { return e.src === src.trim() })[0]
    sel.set(ex ? ex.value : 'own')
    redraw()
  } })
  var slider = api.slider({ label: t('Point a', '点 a'), min: state.view[0], max: state.view[1], step: STEP, value: state.a, fmt: two,
    oninput: function (v) { state.a = clampA(v); redraw() } })
  var readout = api.readout()
  var topBox = h('div', { class: 'dg-plot dg-fplot' }), botBox = h('div', { class: 'dg-plot dg-dplot' })
  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(h('div', { class: 'dg-plots' }, topBox, botBox))
  root.appendChild(h('div', { class: 'dg-key' }, t('Top: y = f(x) (blue) and its tangent line at x = a (orange). Bottom: y = f′(x) (green), computed numerically, and the point (a, f′(a)).',
    '上图：y = f(x)（蓝色）及其在 x = a 处的切线（橙色）。下图：y = f′(x)（绿色，数值计算）和点 (a, f′(a))。')))
  root.appendChild(slider.el)
  root.appendChild(readout)
  api.css('derivative-grapher', [
    '.dg-plots{display:flex;flex-direction:column;gap:4px;margin:.4rem 0}',
    '.dg-key{font-size:.8rem;color:var(--slate);margin:.25rem 0 .4rem}',
    '.cw-field .cw-input{min-width:0}',
  ].join(''))

  var fy = [-1, 1], dy = [-1, 1]
  var Pf = api.plot(topBox, {
    view: [state.view[0], state.view[1], -1, 1], aspect: 0.42, ylabel: 'f(x)',
    label: t('Graph of f with its tangent line at x = a', 'f 的图像及其在 x = a 处的切线'),
    draw: function (P) {
      P.axes()
      if (!state.fn) return
      curve(P, state.fn, 'var(--blue)')
      P.vline(state.a, { color: 'var(--slate)' })
      var fa = state.fn(state.a), s = slope(state.fn, state.a)
      if (!isFinite(fa)) return
      if (s.kind === 'ok') {
        var ln = P.infline(state.a, fa, s.d, { color: 'var(--orange)', width: 2 })
        ln.setAttribute('class', 'dg-tangent')
      }
      P.point(state.a, fa, { color: 'var(--navy)' })
    },
  })
  var Pd = api.plot(botBox, {
    view: [state.view[0], state.view[1], -1, 1], aspect: 0.42, ylabel: 'f′(x)',
    label: t('Graph of the derivative f′, computed numerically', '导数 f′ 的图像（数值计算）'),
    draw: function (P) {
      P.axes()
      if (!state.fn) return
      curve(P, dfun, 'var(--green)')
      P.vline(state.a, { color: 'var(--slate)' })
      var s = slope(state.fn, state.a)
      if (isFinite(state.fn(state.a)) && s.kind === 'ok') P.point(state.a, s.d, { color: 'var(--orange)' })
    },
  })
  function pick(x) { state.a = clampA(x); slider.set(state.a); redraw() }
  Pf.onDrag(function (x) { pick(x) })
  Pd.onDrag(function (x) { pick(x) })

  function setFunction(src) {
    var r = api.Expr.parse(src, ['x'])
    if (!r.ok) { field.error(r.error); return false }
    field.error('')
    state.fn = function (x) { return r.f(x) }
    fy = yRange(state.fn, false)
    dy = yRange(dfun, true)
    return true
  }
  function setView(v, a) {
    state.view = v.slice()
    slider.input.min = v[0]; slider.input.max = v[1]
    state.a = clampA(a)
    slider.set(state.a)
    fy = yRange(state.fn, false)
    dy = yRange(dfun, true)
    redraw()
  }

  function describe() {
    var a = state.a, f = state.fn, fa = f(a)
    var lines = ['a = ' + two(a)]
    if (!isFinite(fa)) {
      lines.push(t('f is not defined at a.', 'f 在 a 处没有定义。'))
      return lines.join('\n')
    }
    lines.push('f(a) ' + eq(fa))
    var s = slope(f, a)
    if (s.kind === 'side') {
      lines.push(t('f′(a) cannot be found: f is not defined on both sides of a.', '无法求 f′(a)：f 在 a 的两侧并非都有定义。'))
    } else if (s.kind === 'corner') {
      lines.push(t('f does not seem to be differentiable at a: the slope from the left (≈ ' + num.fmt(s.L, 4) + ') and from the right (≈ ' + num.fmt(s.R, 4) + ') differ.',
        'f 在 a 处似乎不可导：左侧斜率（≈ ' + num.fmt(s.L, 4) + '）与右侧斜率（≈ ' + num.fmt(s.R, 4) + '）不同。'))
    } else if (s.kind === 'unsettled') {
      lines.push(t('f does not seem to be differentiable at a: the numerical slope does not settle as the step shrinks.',
        'f 在 a 处似乎不可导：步长缩小时，数值斜率不趋于稳定。'))
    } else if (Math.abs(s.d) < 5e-4) {
      lines.push(t('f′(a) ≈ 0 (numerical)', 'f′(a) ≈ 0（数值计算）'))
      lines.push(t('Flat: the tangent is horizontal, and the graph of f′ meets zero here.', '平坦：切线水平，f′ 的图像在这里与零相交。'))
    } else {
      lines.push(t('f′(a) ≈ ' + num.fmt(s.d, 4) + ' (numerical)', 'f′(a) ≈ ' + num.fmt(s.d, 4) + '（数值计算）'))
      lines.push(s.d > 0 ? t('Rising: f′(a) > 0, so the tangent slopes upwards.', '上升：f′(a) > 0，切线向上倾斜。')
        : t('Falling: f′(a) < 0, so the tangent slopes downwards.', '下降：f′(a) < 0，切线向下倾斜。'))
    }
    return lines.join('\n')
  }

  function redraw() {
    Pf.view = [state.view[0], state.view[1], fy[0], fy[1]]
    Pd.view = [state.view[0], state.view[1], dy[0], dy[1]]
    Pf.redraw(); Pd.redraw()
    readout.textContent = state.fn ? describe() : ''
  }
  setFunction(EXAMPLES[0].src)
  setView(EXAMPLES[0].view, EXAMPLES[0].a)
})
