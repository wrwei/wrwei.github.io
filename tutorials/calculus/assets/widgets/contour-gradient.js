/* contour-gradient (Module 17): the contour map of f(x, y); a point chosen by clicking the map or with two sliders;
 * the gradient there (red, drawn at a stated fraction of its length) and a unit vector u at a chosen angle (green).
 * The readout gives ∇f, ‖∇f‖ and the directional derivative Dᵤf = ∇f · u, with a note when u points along ∇f
 * (largest), against it (smallest) or along the level curve through the point (zero). The gradient is computed
 * numerically (api.num.grad, central differences), so its values are shown with ≈. */
CalcWidgets.register('contour-gradient', function (root, api) {
  var t = api.t, h = api.h
  var EXP = Math.exp
  // Views [xmin, xmax, ymin, ymax]; the plot keeps equal scales, so that right angles look right.
  var PRESETS = [
    { value: 'bowl', label: 'x² + y²', src: 'x^2 + y^2', f: function (x, y) { return x * x + y * y }, view: [-3, 3, -2, 2], p: [1, 0.5] },
    { value: 'saddle', label: 'x² − y²', src: 'x^2 - y^2', f: function (x, y) { return x * x - y * y }, view: [-3, 3, -2, 2], p: [1, 0.5] },
    { value: 'bump', label: 'x·e^(−x²−y²)', src: 'x e^(-x^2 - y^2)', f: function (x, y) { return x * EXP(-x * x - y * y) }, view: [-2.4, 2.4, -1.6, 1.6], p: [0.5, 0.5] },
    { value: 'wave', label: 'sin x · cos y', src: 'sin(x) cos(y)', f: function (x, y) { return Math.sin(x) * Math.cos(y) }, view: [-4.5, 4.5, -3, 3], p: [1, 0.5] },
    { value: 'peaks', label: '(x² + 3y²)·e^(1−x²−y²)', src: '(x^2 + 3y^2) e^(1 - x^2 - y^2)', f: function (x, y) { return (x * x + 3 * y * y) * EXP(1 - x * x - y * y) }, view: [-3, 3, -2, 2], p: [0.5, 0.5] },
  ]
  var OWN = 'own'
  var TOL = 0.5                 // degrees: within this of a special direction, the readout says so
  var state = { preset: PRESETS[0], f: PRESETS[0].f, view: PRESETS[0].view.slice(), x: 1, y: 0.5, ang: 0, levels: [], colors: [], scale: 1, big: 1, gtyp: 1 }

  function minus(s) { return String(s).replace(/-/g, '−') }
  function num2(v) { return minus(String(Math.round(v * 100) / 100)) }
  function snap(v) { return Math.round(v * 20) / 20 }
  function fmt(v, sig) { return api.num.fmt(v, sig || 4) }
  // "=" when the number shown is the value itself, "≈" when it is rounded
  function eq(v, sig) { return isFinite(v) && Number(v.toPrecision(sig || 4)) === v ? '= ' : '≈ ' }
  function value(x, y) { var v; try { v = state.f(x, y) } catch (e) { v = NaN } return typeof v === 'number' ? v : NaN }
  function safe(f) { return function (x, y) { var v; try { v = f(x, y) } catch (e) { v = NaN } return typeof v === 'number' && isFinite(v) ? v : NaN } }
  // For the smooth presets, suppress tiny residuals at their stationary points. A typed formula can have
  // components on very different scales: do not discard one just because another is much larger.
  function noise() { return 1e-7 * (state.gtyp > 0 ? state.gtyp : 1) }
  function gradAt(x, y, raw) {
    var g = api.num.grad(value, x, y)
    if (!isFinite(g[0]) || !isFinite(g[1])) return null
    return raw || !state.preset ? g : g.map(function (c) { return Math.abs(c) < noise() ? 0 : c })
  }

  // ------------------------------------------------------------------ levels, colours and the arrow's scale
  // About ten equally spaced levels between the 2nd and 98th percentiles of the values on a grid (so that a few
  // huge values, near a singularity of a typed formula, do not squash the rest), at a "nice" step: 1, 2, 2.5 or 5
  // times a power of ten. Colours run from light blue (low) to dark blue (high).
  function niceStep(raw) {
    var p = Math.pow(10, Math.floor(Math.log10(raw))), best = p, bestD = Infinity
    ;[1, 2, 2.5, 5, 10].forEach(function (m) { var d = Math.abs(Math.log(m * p / raw)); if (d < bestD) { bestD = d; best = m * p } })
    return best
  }
  function percentile(sorted, q) { return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))))] }
  function setup() {
    var v = state.view, vals = [], grads = [], nx = 48, ny = 36, i, j
    for (j = 0; j <= ny; j++) for (i = 0; i <= nx; i++) {
      var x = v[0] + (v[1] - v[0]) * i / nx, y = v[2] + (v[3] - v[2]) * j / ny, z = value(x, y)
      if (isFinite(z)) vals.push(z)
      if (i % 2 === 0 && j % 2 === 0) { var g = gradAt(x, y, true); if (g) grads.push(Math.hypot(g[0], g[1])) }
    }
    state.levels = []; state.colors = []
    vals.sort(function (a, b) { return a - b })
    if (vals.length > 10) {
      var lo = percentile(vals, 0.02), hi = percentile(vals, 0.98)
      if (hi - lo > 1e-9 * Math.max(Math.abs(lo), Math.abs(hi))) {
        var step = niceStep((hi - lo) / 10), k
        while ((hi - lo) / step > 14) step = niceStep(step * 2.2)
        for (k = Math.ceil(lo / step - 1e-9); k * step < hi - 1e-9 * step; k++) state.levels.push(Number((k * step).toPrecision(12)))
      }
    }
    var n = state.levels.length, A = [96, 165, 250], B = [30, 58, 138]       // #60A5FA (low) to #1E3A8A (high)
    state.colors = state.levels.map(function (L, idx) {
      var s = n > 1 ? idx / (n - 1) : 0.5
      return 'rgb(' + A.map(function (c, m) { return Math.round(c + (B[m] - c) * s) }).join(',') + ')'
    })
    // The gradient is drawn at a nice fraction of its length: a typical gradient (the median on the grid) becomes
    // an arrow about a quarter of the width of the map.
    grads.sort(function (a, b) { return a - b })
    var G = grads.length ? percentile(grads, 0.5) : 0, raw = G > 0 ? 0.25 * (v[1] - v[0]) / G : 1
    state.gtyp = G
    var p10 = Math.pow(10, Math.floor(Math.log10(raw)))
    state.scale = [5, 2.5, 2, 1].map(function (m) { return m * p10 }).filter(function (s) { return s <= raw * (1 + 1e-9) })[0]
    state.big = 0.45 * (v[1] - v[0])                                       // longest arrow drawn
  }

  // ------------------------------------------------------------------ controls
  var sel = api.select({
    label: t('Function', '函数'), value: 'bowl',
    options: PRESETS.map(function (p) { return { value: p.value, label: 'f = ' + p.label } })
      .concat([{ value: OWN, label: t('Your own (type it)', '自己输入') }]),
    onchange: function (v) {
      if (v === OWN) { field.input.focus(); fromField(field.get()); return }
      usePreset(PRESETS.filter(function (p) { return p.value === v })[0])
    },
  })
  var field = api.field({ label: 'f(x, y) =', value: PRESETS[0].src, size: 20, placeholder: 'x e^y',
    onchange: function (v) { sel.set(OWN); fromField(v) } })
  var xSl = api.slider({ label: 'x', min: -3, max: 3, step: 0.05, value: 1, fmt: num2, oninput: function (v) { state.x = v; update() } })
  var ySl = api.slider({ label: 'y', min: -2, max: 2, step: 0.05, value: 0.5, fmt: num2, oninput: function (v) { state.y = v; update() } })
  var aSl = api.slider({ label: t('angle of u', 'u 的方向角'), min: 0, max: 359, step: 1, value: 0, fmt: function (v) { return v + '°' },
    oninput: function (v) { state.ang = v; update() } })
  var plotBox = h('div', { class: 'cg-plot' })
  var legend = h('div', { class: 'cg-legend', 'aria-label': t('Levels of the contour map', '等高线的值') })
  var key = h('div', { class: 'cg-key' })
  var out = api.readout()
  out.classList.add('cg-readout')
  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(plotBox)
  root.appendChild(legend)
  root.appendChild(key)
  root.appendChild(h('div', { class: 'cg-sliders' }, xSl.el, ySl.el, aSl.el))
  root.appendChild(out)
  api.css('contour-gradient', [
    '.cg-legend{display:flex;flex-wrap:wrap;align-items:center;gap:.15rem .7rem;font:.78rem var(--font-mono);color:var(--slate);margin:.35rem 0 .1rem}',
    '.cg-legend .cg-lev{display:inline-flex;align-items:center;gap:.25rem;white-space:nowrap}',
    '.cg-legend .cg-sw{display:inline-block;width:1.1rem;height:0;border-top:3px solid;border-radius:2px}',
    '.cg-legend .cg-title{font-family:var(--font-body, sans-serif);font-weight:600;color:var(--navy)}',
    '.cg-key{font-size:.8rem;color:var(--slate);margin:.2rem 0 .3rem}',
    '.cg-key b.cg-red{color:#DC2626}.cg-key b.cg-green{color:#15803D}.cg-key b.cg-purple{color:var(--purple)}',
    '.cg-sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.35rem 1rem;margin:.45rem 0}',
    '.cg-readout div{white-space:pre-wrap}',
    '.cg-readout .cg-big{font-weight:700}',
    '.cg-readout .cg-note{color:#166534}',
    '.cg-readout .cg-warn{color:#991B1B}',
  ].join(''))

  // ------------------------------------------------------------------ the picture
  var P = api.plot(plotBox, {
    view: state.view, equal: true, label: t('Contour map of f, with the gradient and the unit vector u at the chosen point', 'f 的等高线图，以及所选点处的梯度和单位向量 u'),
    draw: function (P) {
      P.axes()
      if (!state.f) return
      if (state.levels.length) P.contour(value, state.levels, { colors: state.colors, n: 72, width: 1.5 }).setAttribute('class', 'cg-contours')
      var x = state.x, y = state.y, fv = value(x, y)
      if (isFinite(fv)) P.contour(value, [fv], { color: 'var(--purple)', width: 2.6, n: 96 }).setAttribute('class', 'cg-level')
      var a = state.ang * Math.PI / 180
      P.arrow(x, y, x + Math.cos(a), y + Math.sin(a), { color: '#15803D', width: 2.6, head: 10 }).setAttribute('class', 'cg-u')
      var g = isFinite(fv) ? gradAt(x, y) : null
      if (g) {
        var len = Math.hypot(g[0], g[1])
        if (len > noise()) {
          var s = Math.min(state.scale, state.big / len)
          P.arrow(x, y, x + s * g[0], y + s * g[1], { color: '#DC2626', width: 2.8, head: 11 }).setAttribute('class', 'cg-grad')
        }
      }
      P.point(x, y, { color: 'var(--navy)', r: 5 }).setAttribute('class', 'cg-point')
    },
  })
  P.onDrag(function (x, y, phase) {
    if (phase === 'end') return
    var v = state.view
    setPoint(snap(Math.min(Math.max(x, v[0]), v[1])), snap(Math.min(Math.max(y, v[2]), v[3])))
    update()
  })

  // ------------------------------------------------------------------ the readout
  function line(cls, text) { return h('div', { class: cls || null }, text) }
  function readout() {
    while (out.firstChild) out.removeChild(out.firstChild)
    if (!state.f) {
      out.appendChild(line('cg-warn', t('Type a formula in x and y, such as x e^y or x^2 - 2y^2.', '请输入关于 x 和 y 的公式，例如 x e^y 或 x^2 - 2y^2。')))
      return
    }
    var x = state.x, y = state.y, fv = value(x, y)
    var pt = '(' + num2(x) + ', ' + num2(y) + ')'
    if (!isFinite(fv)) {
      out.appendChild(line('cg-warn', t('f is not defined at the point ' + pt + ': pick another point.', 'f 在点 ' + pt + ' 处没有定义：请换一个点。')))
      return
    }
    var nb = function (str) { return str.replace(/ /g, '\u00a0') }        // keep "f(x, y) = 1.25" on one line
    out.appendChild(line(null, nb(t('Point ', '点 ') + '(x, y) = ' + pt) + '    ' + nb('f(x, y) ' + eq(fv) + fmt(fv))))
    var g = gradAt(x, y)
    if (!g) {
      out.appendChild(line('cg-warn', t('The gradient cannot be computed here (f is not defined on both sides of the point).', '这里无法计算梯度（f 在该点两侧没有定义）。')))
      return
    }
    if (!state.preset) out.appendChild(line(null, t('Central-difference estimates: use a function differentiable near this point. Numerical differences alone do not establish differentiability.',
      '中心差分估计：请使用在该点附近可微的函数。仅凭数值差分不能确定可微性。')))
    var len = Math.hypot(g[0], g[1]), a = state.ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a)
    if (Math.abs(ux) < 1e-15) ux = 0
    if (Math.abs(uy) < 1e-15) uy = 0
    var D = g[0] * ux + g[1] * uy
    var short = len > noise() && state.scale * len > state.big
    out.appendChild(line('cg-big', '∇f ≈ ⟨' + fmt(g[0]) + ', ' + fmt(g[1]) + '⟩    ‖∇f‖ ≈ ' + fmt(len) +
      (short ? t('  (arrow shortened to fit)', '（箭头已缩短）') : '')))
    out.appendChild(line(null, 'u = ⟨cos ' + state.ang + '°, sin ' + state.ang + '°⟩ ' + (eq(ux) === '= ' && eq(uy) === '= ' ? '= ' : '≈ ') + '⟨' + fmt(ux) + ', ' + fmt(uy) + '⟩'))
    out.appendChild(line('cg-big', 'Dᵤf = ∇f · u ≈ ' + fmt(D)))
    if (len <= noise()) {
      out.appendChild(line('cg-note', state.preset ? t('∇f ≈ 0 here: f is level to first order, and Dᵤf ≈ 0 in every direction. This is a critical point (Module 18).',
        '这里 ∇f ≈ 0：f 在一阶近似下是平的，各个方向的 Dᵤf ≈ 0。这是一个临界点（第 18 单元）。')
        : t('The estimated gradient is small on this map. This alone does not establish a critical point (Module 18).',
          '估计的梯度在此图的尺度下很小。仅凭这一点不能确定这是一个临界点（第 18 单元）。')))
      return
    }
    var cos = Math.max(-1, Math.min(1, D / len)), th = Math.acos(cos) * 180 / Math.PI
    out.appendChild(line(null, t('angle θ between u and ∇f ≈ ', 'u 与 ∇f 的夹角 θ ≈ ') + minus(String(Math.round(th * 10) / 10)) + '°'))
    var note
    if (th <= TOL + 1e-9) note = t('u points nearly along ∇f (to within 0.5°): Dᵤf is close to its largest value, ‖∇f‖ ≈ ' + fmt(len) + '.',
      'u 几乎沿 ∇f 的方向（误差在 0.5° 以内）：Dᵤf 接近最大值 ‖∇f‖ ≈ ' + fmt(len) + '。')
    else if (th >= 180 - TOL - 1e-9) note = t('u points nearly against ∇f (to within 0.5°): Dᵤf is close to its smallest value, −‖∇f‖ ≈ ' + fmt(-len) + ', the steepest descent.',
      'u 几乎与 ∇f 方向相反（误差在 0.5° 以内）：Dᵤf 接近最小值 −‖∇f‖ ≈ ' + fmt(-len) + '，即最速下降的变化率。')
    else if (Math.abs(th - 90) <= TOL + 1e-9) note = t('u points nearly along the level curve (to within 0.5° of a right angle to ∇f): Dᵤf is small compared with ‖∇f‖.',
      'u 几乎沿等高线方向（与 ∇f 的夹角距直角不超过 0.5°）：Dᵤf 相对于 ‖∇f‖ 很小。')
    out.appendChild(line(note ? 'cg-note' : null, note || t('Dᵤf = ‖∇f‖ cos θ: largest along ∇f, smallest against it, 0 along the level curve. Turn u to see.',
      'Dᵤf = ‖∇f‖ cos θ：沿 ∇f 最大，逆 ∇f 最小，沿等高线为 0。转动 u 看看。')))
  }
  function drawLegend() {
    while (legend.firstChild) legend.removeChild(legend.firstChild)
    if (!state.f || !state.levels.length) return
    legend.appendChild(h('span', { class: 'cg-title' }, t('Levels:', '等高线：')))
    state.levels.forEach(function (L, i) {
      legend.appendChild(h('span', { class: 'cg-lev' }, h('i', { class: 'cg-sw', style: 'border-color:' + state.colors[i] }), fmt(L)))
    })
  }
  function drawKey() {
    while (key.firstChild) key.removeChild(key.firstChild)
    if (!state.f) return
    var sc = fmt(state.scale)
    key.appendChild(h('b', { class: 'cg-red' }, t('Red: ', '红色：')))
    key.appendChild(document.createTextNode(state.scale === 1 ? t('∇f, at its estimated length. ', '∇f，按估计长度画出。')
      : t('∇f, drawn at ' + sc + ' times its estimated length. ', '∇f，按估计长度的 ' + sc + ' 倍画出。')))
    key.appendChild(h('b', { class: 'cg-green' }, t('Green: ', '绿色：')))
    key.appendChild(document.createTextNode(t('the unit vector u. ', '单位向量 u。')))
    key.appendChild(h('b', { class: 'cg-purple' }, t('Purple: ', '紫色：')))
    key.appendChild(document.createTextNode(t('the level curve through the point. Lighter contours are lower, darker ones higher. Click the map to move the point.',
      '过该点的等高线。颜色浅的等高线低，深的高。点击图可以移动该点。')))
  }

  // ------------------------------------------------------------------ state changes
  function setPoint(x, y) { state.x = x; state.y = y; xSl.set(x); ySl.set(y) }
  function setRanges() {
    var v = state.view
    xSl.input.min = v[0]; xSl.input.max = v[1]
    ySl.input.min = v[2]; ySl.input.max = v[3]
  }
  function newFunction() { setup(); drawLegend(); drawKey() }
  function usePreset(p) {
    state.preset = p; state.f = p.f; state.view = p.view.slice()
    field.set(p.src); field.error('')
    setRanges(); setPoint(p.p[0], p.p[1])
    P.view = state.view.slice()
    newFunction()
    update()
  }
  function fromField(src) {
    state.preset = null
    var res = api.Expr.parse(src, ['x', 'y'])
    if (!res.ok) { field.error(res.error); state.f = null; newFunction(); update(); return }
    field.error('')
    state.f = safe(res.f)
    newFunction()
    update()
  }
  function update() {
    aSl.input.setAttribute('aria-valuetext', state.ang + '°')
    readout()
    P.redraw()
  }
  setRanges()
  newFunction()
  update()
})
