/* slope-field (Module 13): the direction field of y′ = F(t, y); a start point (t₀, y₀), chosen by clicking the
 * plot or with two sliders; the solution through it, computed accurately with RK4 and small steps; and Euler's
 * method with step h from t₀ to the end time T = t₀ + L, where L is a whole number, so that every step size on
 * the slider (a power of 1/2) lands exactly on T. The readout compares Euler's value at T with the accurate one
 * and shows the error and the error divided by h: each halving of h roughly halves the error. */
CalcWidgets.register('slope-field', function (root, api) {
  var t = api.t, h = api.h
  var SUB = '₀₁₂₃₄₅₆₇₈₉'
  function sub(n) { return String(n).split('').map(function (c) { return SUB[+c] }).join('') }
  function minus(s) { return String(s).replace(/-/g, '−') }
  function num2(v) { return minus(String(Math.round(v * 100) / 100)) }      // times and heights: at most 2 decimals
  function snap(v) { return Math.round(v * 20) / 20 }                        // to the nearest 0.05
  function fmt(v, sig) { return api.num.fmt(v, sig || 6) }
  // "=" when the number shown is the value itself, "≈" when it is rounded
  function eq(v, sig) { return isFinite(v) && Number(v.toPrecision(sig || 6)) === v ? ' = ' : ' ≈ ' }

  // Views [tmin, tmax, ymin, ymax]: where possible a unit of t and a unit of y have about the same length on the
  // screen (y-range / t-range close to the plot's aspect), so that the direction field's grid is square.
  // span: the length L of the interval [t₀, T] on which Euler's method runs, at most.
  var PRESETS = [
    { value: 'exp', label: 'y′ = y', src: 'y', f: function (T, Y) { return Y }, view: [-3, 2.6, -0.5, 3], t0: 0, y0: 1, span: 1 },
    { value: 'lin', label: 'y′ = t − y', src: 't - y', f: function (T, Y) { return T - Y }, view: [-1, 4.6, -1, 2.5], t0: 0, y0: 1, span: 2 },
    { value: 'logistic', label: 'y′ = y(1 − y)', src: 'y(1 - y)', f: function (T, Y) { return Y * (1 - Y) }, view: [-1.5, 3.5, -0.5, 1.5], t0: -1, y0: 0.1, span: 2 },
    { value: 'riccati', label: 'y′ = t − y²', src: 't - y^2', f: function (T, Y) { return T - Y * Y }, view: [-1.6, 4.4, -2, 2], t0: 0, y0: 0, span: 2 },
    { value: 'bell', label: 'y′ = −2ty', src: '-2ty', f: function (T, Y) { return -2 * T * Y }, view: [-2.6, 2.6, -1.6, 1.6], t0: -1, y0: 0.45, span: 2 },
  ]
  var OWN = 'own'
  var HS = [1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 1]                        // the step sizes: each notch halves h
  var state = { preset: PRESETS[1], F: PRESETS[1].f, view: PRESETS[1].view, span: 2, t0: 0, y0: 1, hi: 4, msg: '' }

  function safe(f) { return function (T, Y) { var v; try { v = f(T, Y) } catch (e) { v = NaN } return typeof v === 'number' ? v : NaN } }

  // ------------------------------------------------------------------ controls
  var sel = api.select({
    label: t('Equation', '方程'), value: 'lin',
    options: PRESETS.map(function (p) { return { value: p.value, label: p.label } })
      .concat([{ value: OWN, label: t('Your own (type it)', '自己输入') }]),
    onchange: function (v) {
      if (v === OWN) { field.input.focus(); fromField(field.get()); return }
      usePreset(PRESETS.filter(function (p) { return p.value === v })[0])
    },
  })
  var field = api.field({ label: 'y′ =', value: PRESETS[1].src, size: 14, placeholder: 't - y^2',
    onchange: function (v) { sel.set(OWN); fromField(v) } })
  var tSl = api.slider({ label: t('start t₀', '起点 t₀'), min: -1, max: 3.6, step: 0.05, value: 0, fmt: num2,
    oninput: function (v) { state.t0 = v; update() } })
  var ySl = api.slider({ label: t('start y₀', '起点 y₀'), min: -1, max: 2.5, step: 0.05, value: 1, fmt: num2,
    oninput: function (v) { state.y0 = v; update() } })
  var hSl = api.slider({ label: t('step h', '步长 h'), min: 0, max: HS.length - 1, step: 1, value: state.hi,
    fmt: function (i) { return String(HS[i]) },
    oninput: function (i) { state.hi = i; update() } })
  hSl.input.setAttribute('aria-valuetext', 'h = ' + HS[state.hi])

  var plotBox = h('div', { class: 'sf-plot' })
  var key = h('div', { class: 'sf-key' },
    t('Grey: the direction field. Blue: the solution through the start point, computed accurately (RK4 with small steps). Orange: Euler’s method, one dot per step, up to the end time T (dashed). Click the plot to move the start point.',
      '灰色：方向场。蓝色：过起点的解，用小步长的四阶龙格–库塔法（RK4）精确计算。橙色：欧拉法，每一步一个点，直到终止时刻 T（虚线）。点击图像可以移动起点。'))
  var out = api.readout()
  out.classList.add('sf-readout')
  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(plotBox)
  root.appendChild(key)
  root.appendChild(h('div', { class: 'sf-sliders' }, tSl.el, ySl.el, hSl.el))
  root.appendChild(out)
  api.css('slope-field', [
    '.sf-key{font-size:.8rem;color:var(--slate);margin:.3rem 0 .2rem}',
    '.sf-sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.35rem 1rem;margin:.45rem 0}',
    '.sf-readout div{white-space:pre-wrap}',
    '.sf-readout .sf-big{font-weight:700;color:var(--navy)}',
    '.sf-readout .sf-warn{color:#991B1B}',
    '.sf-dot{fill:var(--orange);stroke:var(--white);stroke-width:1}',
  ].join(''))

  // ------------------------------------------------------------------ numbers
  // The end time: t₀ plus the largest whole number L ≤ span that keeps T inside the picture (at least 1).
  function endTime() { var v = state.view; return state.t0 + Math.max(1, Math.min(state.span, Math.floor(v[1] - state.t0 + 1e-9))) }
  // The accurate value y(T): RK4 with about 1000 steps per unit of time. NaN if the solution blows up or leaves
  // the domain of F before T (then there is no value to compare with).
  function accurate(F, t0, y0, T) {
    var n = Math.max(500, Math.round((T - t0) * 1000)), pts = api.num.rk4(F, t0, y0, (T - t0) / n, n)
    for (var i = 0; i < pts.length; i++) if (!isFinite(pts[i][1]) || Math.abs(pts[i][1]) > 1e12) return NaN
    return pts[pts.length - 1][1]
  }
  // The solution curve for drawing: RK4 in steps of about 0.01 from t₀ to t1 (forwards or backwards), stopped
  // where it leaves the picture by far or stops being a number.
  function trajectory(F, t0, y0, t1) {
    var v = state.view, n = Math.max(1, Math.ceil(Math.abs(t1 - t0) / 0.01)), pts = api.num.rk4(F, t0, y0, (t1 - t0) / n, n)
    var mid = (v[2] + v[3]) / 2, far = 3 * (v[3] - v[2]), res = []
    for (var i = 0; i < pts.length; i++) { if (!isFinite(pts[i][1]) || Math.abs(pts[i][1] - mid) > far) break; res.push(pts[i]) }
    return res
  }
  function compute() {
    var F = state.F, hh = HS[state.hi], T = endTime(), n = Math.round((T - state.t0) / hh)
    var pts = F ? api.num.euler(F, state.t0, state.y0, hh, n) : []
    return { h: hh, T: T, n: n, euler: pts, yE: pts.length ? pts[pts.length - 1][1] : NaN, yA: F ? accurate(F, state.t0, state.y0, T) : NaN }
  }

  // ------------------------------------------------------------------ the picture
  var last = null
  var P = api.plot(plotBox, {
    view: state.view, aspect: 0.62, xlabel: 't', ylabel: 'y',
    label: t('Direction field, the solution through the start point, and Euler’s method', '方向场、过起点的解与欧拉法'),
    draw: function (P) {
      P.axes()
      var F = state.F
      if (!F) return
      var v = state.view, nx = Math.max(10, Math.min(22, Math.round(P.W / 32)))
      var g = P.field(function (T, Y) { return [1, F(T, Y)] }, { segments: true, n: nx, color: 'var(--muted)', width: 1.3 })
      g.setAttribute('class', 'sf-field')
      g.setAttribute('opacity', '0.75')
      var r = last || compute()
      P.vline(r.T, { color: 'var(--slate)', dash: '5 4', width: 1.3 })
      var nearRight = P.X(r.T) > P.W - 64
      P.text(r.T, v[3], 'T = ' + num2(r.T), { dx: nearRight ? -5 : 5, dy: 14, color: 'var(--slate)', anchor: nearRight ? 'end' : 'start' })
      var back = trajectory(F, state.t0, state.y0, v[0]).reverse(), fwd = trajectory(F, state.t0, state.y0, v[1])
      var curve = back.concat(fwd.slice(1))
      if (curve.length > 1) P.poly(curve, { color: 'var(--blue)', width: 2.6 }).setAttribute('class', 'sf-solution')
      var shown = [], far = 3 * (v[3] - v[2]), mid = (v[2] + v[3]) / 2
      for (var i = 0; i < r.euler.length; i++) { var q = r.euler[i]; if (!isFinite(q[1]) || Math.abs(q[1] - mid) > far) break; shown.push(q) }
      if (shown.length > 1) P.poly(shown, { color: 'var(--orange)', width: 2 }).setAttribute('class', 'sf-euler')
      var rad = r.n > 40 ? 2.6 : 3.6
      shown.forEach(function (q) { P.point(q[0], q[1], { color: 'var(--orange)', r: rad, layer: 'main' }).setAttribute('class', 'sf-dot') })
      P.point(state.t0, state.y0, { color: 'var(--navy)', r: 5.5 }).setAttribute('class', 'sf-start')
    },
  })
  P.onDrag(function (x, y, phase) {
    if (phase === 'end') return
    var v = state.view
    setStart(snap(Math.min(Math.max(x, v[0]), v[1] - 1)), snap(Math.min(Math.max(y, v[2]), v[3])))
    update()
  })

  // ------------------------------------------------------------------ state changes
  function setStart(t0, y0) { state.t0 = t0; state.y0 = y0; tSl.set(t0); ySl.set(y0) }
  function setRanges() {
    var v = state.view
    tSl.input.min = v[0]; tSl.input.max = v[1] - 1
    ySl.input.min = v[2]; ySl.input.max = v[3]
  }
  function usePreset(p) {
    state.preset = p; state.F = p.f; state.view = p.view.slice(); state.span = p.span; state.msg = ''
    field.set(p.src); field.error('')
    setRanges(); setStart(p.t0, p.y0)
    P.view = state.view.slice()
    update()
  }
  function fromField(src) {
    var res = api.Expr.parse(src, ['t', 'y'])
    if (!res.ok) { field.error(res.error); state.F = null; update(); return }
    field.error('')
    state.F = safe(res.f)
    update()
  }

  function line(cls, text) { return h('div', { class: cls || null }, text) }
  function readout(r) {
    while (out.firstChild) out.removeChild(out.firstChild)
    if (!state.F) {
      out.appendChild(line('sf-warn', t('Type a formula in t and y, such as t - y^2 or y(1 - y).', '请输入关于 t 和 y 的公式，例如 t - y^2 或 y(1 - y)。')))
      return
    }
    var T = num2(r.T), steps = r.n === 1 ? t('1 step', '1 步') : t(r.n + ' steps', '共 ' + r.n + ' 步')
    out.appendChild(line(null, t('From t₀ = ' + num2(state.t0) + ' to T = ' + T + ': ' + steps + ' of h = ' + r.h,
      '从 t₀ = ' + num2(state.t0) + ' 到 T = ' + T + '：步长 h = ' + r.h + '，' + steps)))
    var yn = 'y' + sub(r.n)
    out.appendChild(line('sf-big', isFinite(r.yE)
      ? t('Euler’s method: ', '欧拉法：') + yn + eq(r.yE) + fmt(r.yE)
      : isNaN(r.yE)
        ? t('Euler’s method: ' + yn + ' cannot be computed, because F is not defined at one of the steps', '欧拉法：无法计算 ' + yn + '，因为 F 在某一步的点上没有定义')
        : t('Euler’s method: ' + yn + ' is too large to compute', '欧拉法：' + yn + ' 太大，无法计算')))
    if (!isFinite(r.yA)) {
      out.appendChild(line('sf-warn', t('The solution through the start point blows up, or leaves the region where F is defined, before T: there is no value y(' + T + ') to compare with.',
        '过起点的解在 T 之前趋于无穷，或离开了 F 的定义域：没有 y(' + T + ') 的值可以比较。')))
      return
    }
    out.appendChild(line('sf-big', t('accurate value: ', '精确值：') + 'y(' + T + ') ≈ ' + fmt(r.yA)))
    if (isFinite(r.yE)) {
      var err = r.yA - r.yE
      out.appendChild(line(null, t('error = accurate − Euler ≈ ', '误差 = 精确值 − 欧拉值 ≈ ') + fmt(err, 5) + '    ' + t('error ÷ h ≈ ', '误差 ÷ h ≈ ') + fmt(err / r.h, 5)))
    }
  }
  function update() {
    last = compute()
    hSl.input.setAttribute('aria-valuetext', 'h = ' + HS[state.hi])
    readout(last)
    P.redraw()
    last = null
  }
  setRanges()
  update()
})
