/* region-slicer (Module 19): set up a double integral over a region D by slicing it, with vertical lines
 * (order dy dx: the inner limits are the lower and upper boundary curves, as functions of x) or with
 * horizontal lines (order dx dy: the inner limits are the left and right boundary curves, as functions of
 * y). A slider moves the slice across D; the readout shows the iterated integral with its limits as
 * formulas, the ends of the current slice as numbers, and the area of D computed both ways by integrating
 * the length of the slice numerically (api.num.integrate), next to the exact area. Every limit in REGIONS
 * is written exactly, as on the page (Section 19.3). */
CalcWidgets.register('region-slicer', function (root, api) {
  var t = api.t, h = api.h

  // Each region: its description in both orders (outer limits a, b and inner limits lo(s), hi(s), as
  // functions and as text), its boundary curves (drawn and labelled, with the label that suits each order),
  // its exact area and a view (equal scales on both axes).
  var REGIONS = [
    {
      value: 'parab', label: t('between y = x² and y = x', 'y = x² 与 y = x 之间'),
      view: [-0.35, 1.85, -0.22, 1.25], ticks: [[0.5, 1], [0.5, 1]], exact: '1/6', exactVal: 1 / 6,
      dydx: { a: 0, b: 1, as: '0', bs: '1', lo: function (x) { return x * x }, los: 'x²', hi: function (x) { return x }, his: 'x', len: 'x − x²' },
      dxdy: { a: 0, b: 1, as: '0', bs: '1', lo: function (y) { return y }, los: 'y', hi: Math.sqrt, his: '√y', len: '√y − y' },
      curves: [
        { pts: graph(function (x) { return x * x }, 0, 1), names: ['y = x²', 'x = √y'], at: [0.72, 0.4], anchor: 'start' },
        { pts: graph(function (x) { return x }, 0, 1), names: ['y = x', 'x = y'], at: [0.42, 0.64], anchor: 'end' },
      ],
    },
    {
      value: 'tri', label: t('triangle 0 ≤ y ≤ x ≤ 1', '三角形 0 ≤ y ≤ x ≤ 1'),
      view: [-0.35, 1.85, -0.22, 1.25], ticks: [[0.5, 1], [0.5, 1]], exact: '1/2', exactVal: 1 / 2,
      dydx: { a: 0, b: 1, as: '0', bs: '1', lo: function () { return 0 }, los: '0', hi: function (x) { return x }, his: 'x', len: 'x' },
      dxdy: { a: 0, b: 1, as: '0', bs: '1', lo: function (y) { return y }, los: 'y', hi: function () { return 1 }, his: '1', len: '1 − y' },
      curves: [
        { pts: [[0, 0], [1, 0]], names: ['y = 0', 'y = 0'], at: [0.2, 0], dy: 17, anchor: 'middle' },
        { pts: [[0, 0], [1, 1]], names: ['y = x', 'x = y'], at: [0.42, 0.62], anchor: 'end' },
        { pts: [[1, 0], [1, 1]], names: ['x = 1', 'x = 1'], at: [1.05, 0.8], anchor: 'start' },
      ],
    },
    {
      value: 'disc', label: t('quarter disc x² + y² ≤ 1, x, y ≥ 0', '四分之一圆盘 x² + y² ≤ 1，x, y ≥ 0'),
      view: [-0.35, 1.85, -0.22, 1.25], ticks: [[0.5, 1], [0.5, 1]], exact: 'π/4', exactVal: Math.PI / 4,
      dydx: { a: 0, b: 1, as: '0', bs: '1', lo: function () { return 0 }, los: '0', hi: function (x) { return Math.sqrt(Math.max(0, 1 - x * x)) }, his: '√(1 − x²)', len: '√(1 − x²)' },
      dxdy: { a: 0, b: 1, as: '0', bs: '1', lo: function () { return 0 }, los: '0', hi: function (y) { return Math.sqrt(Math.max(0, 1 - y * y)) }, his: '√(1 − y²)', len: '√(1 − y²)' },
      curves: [
        { pts: arc(1, 0, Math.PI / 2), names: ['y = √(1 − x²)', 'x = √(1 − y²)'], at: [0.76, 0.8], anchor: 'start' },
        { pts: [[0, 0], [1, 0]], names: ['y = 0', 'y = 0'], at: [0.2, 0], dy: 17, anchor: 'middle' },
        { pts: [[0, 0], [0, 1]], names: ['x = 0', 'x = 0'], at: [0, 0.25], dx: -6, anchor: 'end' },
      ],
    },
    {
      value: 'sqrt', label: t('between y = √x and y = x/2', 'y = √x 与 y = x/2 之间'),
      view: [-0.5, 5.6, -0.4, 2.55], ticks: [[1, 2, 3, 4], [1, 2]], exact: '4/3', exactVal: 4 / 3,
      dydx: { a: 0, b: 4, as: '0', bs: '4', lo: function (x) { return x / 2 }, los: 'x/2', hi: Math.sqrt, his: '√x', len: '√x − x/2' },
      dxdy: { a: 0, b: 2, as: '0', bs: '2', lo: function (y) { return y * y }, los: 'y²', hi: function (y) { return 2 * y }, his: '2y', len: '2y − y²' },
      curves: [
        { pts: graph(Math.sqrt, 0, 4), names: ['y = √x', 'x = y²'], at: [1.9, 1.72], anchor: 'end' },
        { pts: graph(function (x) { return x / 2 }, 0, 4), names: ['y = x/2', 'x = 2y'], at: [2.7, 0.95], anchor: 'start' },
      ],
    },
  ]
  var ORDERS = [
    { value: 'dydx', label: t('dy dx: vertical slices', 'dy dx：竖直切片') },
    { value: 'dxdy', label: t('dx dy: horizontal slices', 'dx dy：水平切片') },
  ]
  var STEPS = 100        // positions of the slider across the outer range

  function graph(f, a, b) { var pts = [], k; for (k = 0; k <= 200; k++) { var x = a + (b - a) * k / 200; pts.push([x, f(x)]) } return pts }
  function arc(r, t0, t1) { var pts = [], k; for (k = 0; k <= 120; k++) { var s = t0 + (t1 - t0) * k / 120; pts.push([r * Math.cos(s), r * Math.sin(s)]) } return pts }

  // ---------------------------------------------------------------- numbers as text
  function minus(s) { return String(s).replace(/-/g, '−') }
  // v to at most `dec` decimal places, and whether those digits are v itself (then "=", else "≈").
  function shown(v, dec) {
    dec = dec == null ? 4 : dec
    var p = Math.pow(10, dec), r = Math.round(v * p) / p
    if (Object.is(r, -0)) r = 0
    return { s: minus(r), exact: Math.abs(r - v) <= 1e-12 * Math.max(1, Math.abs(v)) }
  }
  function eqs(v, dec) { var q = shown(v, dec); return (q.exact ? '= ' : '≈ ') + q.s }
  function coord(v) { return shown(v, 4).s }
  function sig(v, n) { return minus(Number(v.toPrecision(n))) }
  // A sum or difference goes in brackets before dx or dy; a single term does not.
  function bracket(s) {
    var depth = 0, i
    for (i = 0; i < s.length; i++) {
      if (s[i] === '(') depth++
      else if (s[i] === ')') depth--
      else if (depth === 0 && (s[i] === '−' || s[i] === '+') && i > 0) return '(' + s + ')'
    }
    return s
  }

  // ---------------------------------------------------------------- state
  var S = { region: REGIONS[0], order: 'dydx', pos: 0.5 }
  function desc() { return S.region[S.order] }
  // The area both ways, computed once per region: the integral of the length of the slice.
  var areas = {}
  function areaOf(r, order) {
    var key = r.value + '|' + order
    if (areas[key] === undefined) {
      var d = r[order]
      areas[key] = api.num.integrate(function (s) { return d.hi(s) - d.lo(s) }, d.a, d.b, 1e-12)
    }
    return areas[key]
  }

  // ---------------------------------------------------------------- controls
  var regionSel = api.select({ label: t('Region D', '区域 D'), value: 'parab', options: REGIONS.map(function (r) { return { value: r.value, label: r.label } }),
    onchange: function (v) { S.region = REGIONS.filter(function (r) { return r.value === v })[0]; P.setView(S.region.view); resetSlider(); update() } })
  var orderSel = api.select({ label: t('Order', '次序'), value: 'dydx', options: ORDERS, onchange: function (v) { S.order = v; resetSlider(); update() } })
  var slider = api.slider({ label: 'x', min: 0, max: 1, step: 0.01, value: 0.5, fmt: coord,
    oninput: function (v) { S.pos = v; update() } })
  slider.el.classList.add('rsl-pos')
  regionSel.el.classList.add('rsl-choice')
  orderSel.el.classList.add('rsl-choice')
  var sliderLabel = slider.el.querySelector('label')

  function resetSlider() {
    var d = desc(), inp = slider.input
    inp.min = d.a
    inp.max = d.b
    inp.step = (d.b - d.a) / STEPS
    S.pos = (d.a + d.b) / 2
    slider.set(S.pos)
    sliderLabel.textContent = S.order === 'dydx' ? t('Slice at x', '切片位置 x') : t('Slice at y', '切片位置 y')
  }
  // Snap a position to the slider's steps, inside the outer range.
  function snap(s) {
    var d = desc(), st = (d.b - d.a) / STEPS
    var k = Math.round((s - d.a) / st)
    k = Math.max(0, Math.min(STEPS, k))
    return Math.round((d.a + k * st) * 1e9) / 1e9
  }

  // ---------------------------------------------------------------- the readout
  // An integral sign with its limits stacked beside it.
  function integralSign(lo, hi, cls) {
    return h('span', { class: 'rsl-int' + (cls ? ' ' + cls : '') }, h('span', { class: 'rsl-sign', 'aria-hidden': 'true' }, '∫'),
      h('span', { class: 'rsl-lims' }, h('span', { class: 'rsl-hi' }, hi), h('span', { class: 'rsl-lo' }, lo)))
  }
  var setup = h('div', { class: 'rsl-setup' })
  var sliceLine = h('div', { class: 'rsl-slice' })
  var areaV = h('div', { class: 'rsl-area rsl-area-v' })
  var areaH = h('div', { class: 'rsl-area rsl-area-h' })
  var exactLine = h('div', { class: 'rsl-exact' })
  var readout = h('div', { class: 'rsl-readout', 'aria-live': 'polite' }, setup, sliceLine, areaV, areaH, exactLine)
  var plotBox = h('div', { class: 'rsl-plot' })

  root.appendChild(api.row(regionSel.el, orderSel.el))
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'rsl-key' }, t('Shaded: the region D. Orange: the slice at the chosen position, from where it enters D to where it leaves. Drag across the picture, or use the slider.',
    '阴影：区域 D。橙色：所选位置处的切片，从它进入 D 的地方到离开 D 的地方。可在图上拖动，或使用滑块。')))
  root.appendChild(api.row(slider.el))
  root.appendChild(readout)
  api.css('region-slicer', [
    '.rsl-plot{max-width:600px;margin:0 auto}',
    '.rsl-choice{min-width:0;max-width:100%}',
    '.rsl-choice .cw-select{min-width:0;max-width:100%;text-overflow:ellipsis}',
    '.rsl-pos{flex:1 1 280px}',
    '.rsl-key{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.rsl-readout{font-size:.88rem;color:var(--navy);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.45rem .7rem;margin:.5rem 0;overflow-x:auto}',
    '.rsl-readout>div{padding:.2rem 0}',
    '.rsl-readout>div+div{border-top:1px solid var(--border)}',
    '.rsl-setup{font:1.02rem Georgia,"Times New Roman",serif;white-space:nowrap;display:flex;align-items:center;gap:.1em;flex-wrap:nowrap}',
    '.rsl-int{display:inline-flex;align-items:stretch;margin:0 .08em}',
    '.rsl-sign{font:italic 1.75em/1 Georgia,"Times New Roman",serif;padding-right:.04em}',
    '.rsl-lims{display:inline-flex;flex-direction:column;justify-content:space-between;font-size:.72em;line-height:1.05;min-width:.6em;padding:.05em 0}',
    '.rsl-hi{align-self:flex-start;margin-left:.15em}',
    '.rsl-lo{align-self:flex-start}',
    '.rsl-area{display:flex;flex-wrap:wrap;align-items:center;gap:.15em .5em}',
    '.rsl-area .rsl-what{color:var(--slate);font-size:.84rem}',
    '.rsl-area .rsl-formula{font-family:Georgia,"Times New Roman",serif;display:inline-flex;align-items:center;white-space:nowrap}',
    '.rsl-num{font:600 .84rem var(--font-mono);white-space:nowrap}',
    '.rsl-on .rsl-what{color:var(--navy);font-weight:600}',
    '.rsl-slice b{font-weight:600}',
    '.rsl-val{font-family:var(--font-mono);font-size:.84rem;font-weight:600;white-space:nowrap}',
    '.rsl-exact{font-size:.84rem;color:var(--slate)}',
  ].join(''))

  // ---------------------------------------------------------------- the picture
  // Axes with a few fixed ticks, so that the labels of the boundary curves never meet tick labels.
  function axes(P, ticks) {
    var v = P.view
    ticks[0].forEach(function (x) { P.line(x, v[2], x, v[3], { color: '#E8EDF3', width: 1, layer: 'back' }) })
    ticks[1].forEach(function (y) { P.line(v[0], y, v[1], y, { color: '#E8EDF3', width: 1, layer: 'back' }) })
    P.line(v[0], 0, v[1], 0, { color: 'var(--navy)', width: 1.2, layer: 'back' })
    P.line(0, v[2], 0, v[3], { color: 'var(--navy)', width: 1.2, layer: 'back' })
    ticks[0].forEach(function (x) { P.text(x, 0, String(x), { anchor: 'middle', dy: 16 }).setAttribute('class', 'cw-tick') })
    ticks[1].forEach(function (y) { P.text(0, y, String(y), { anchor: 'end', dx: -6, dy: 4 }).setAttribute('class', 'cw-tick') })
    P.text(v[1], 0, 'x', { anchor: 'end', dx: -4, dy: -7 }).setAttribute('class', 'cw-axlabel')
    P.text(0, v[3], 'y', { dx: 7, dy: 13 }).setAttribute('class', 'cw-axlabel')
  }
  var P = api.plot(plotBox, {
    view: S.region.view, equal: true, label: t('The region D and one slice of it', '区域 D 及其中的一个切片'),
    draw: function (P) {
      var r = S.region, d = desc(), dv = r.dydx, k = S.order === 'dydx' ? 0 : 1
      axes(P, r.ticks)
      P.area(dv.hi, dv.a, dv.b, { g: dv.lo, fill: 'var(--sky)', opacity: 0.3 })
      r.curves.forEach(function (c) {
        P.poly(c.pts, { color: 'var(--blue)', width: 2.2 }).setAttribute('class', 'rsl-curve')
        P.text(c.at[0], c.at[1], c.names[k], { color: 'var(--blue)', anchor: c.anchor, dx: c.dx || 0, dy: c.dy != null ? c.dy : 4 }).setAttribute('class', 'cw-label rsl-curve-label')
      })
      var s = S.pos, lo = d.lo(s), hi = d.hi(s), seg
      if (S.order === 'dydx') {
        P.vline(s, { color: 'var(--muted)', width: 1 })
        seg = P.line(s, lo, s, hi, { color: 'var(--orange)', width: 5 })
        P.point(s, lo, { color: 'var(--orange)', r: 4 }); P.point(s, hi, { color: 'var(--orange)', r: 4 })
      } else {
        P.hline(s, { color: 'var(--muted)', width: 1 })
        seg = P.line(lo, s, hi, s, { color: 'var(--orange)', width: 5 })
        P.point(lo, s, { color: 'var(--orange)', r: 4 }); P.point(hi, s, { color: 'var(--orange)', r: 4 })
      }
      seg.setAttribute('class', 'rsl-slice-seg')
    },
  })
  P.onDrag(function (x, y) {
    S.pos = snap(S.order === 'dydx' ? x : y)
    slider.set(S.pos)
    update()
  })

  function update() {
    var r = S.region, d = desc(), dydx = S.order === 'dydx', s = S.pos
    var inner = dydx ? 'y' : 'x', outer = dydx ? 'x' : 'y'
    // The iterated integral, with its limits as formulas.
    while (setup.firstChild) setup.removeChild(setup.firstChild)
    setup.appendChild(h('span', {}, '∬', h('sub', {}, 'D'), ' f(x, y) dA = '))
    setup.appendChild(integralSign(d.as, d.bs, 'rsl-outer'))
    setup.appendChild(integralSign(d.los, d.his, 'rsl-inner'))
    setup.appendChild(h('span', {}, dydx ? ' f(x, y) dy dx' : ' f(x, y) dx dy'))
    setup.setAttribute('aria-label', t('The double integral over D equals the integral from ' + d.as + ' to ' + d.bs + ' of the integral from ' + d.los + ' to ' + d.his + ' of f(x, y) ' + (dydx ? 'dy dx' : 'dx dy'),
      'D 上的二重积分等于从 ' + d.as + ' 到 ' + d.bs + ' 的积分，内层从 ' + d.los + ' 到 ' + d.his + '，被积函数 f(x, y)，' + (dydx ? 'dy dx' : 'dx dy')))
    // The slice at the current position.
    var lo = d.lo(s), hi = d.hi(s)
    while (sliceLine.firstChild) sliceLine.removeChild(sliceLine.firstChild)
    // A limit that is a formula is followed by its value here; a constant limit is its own value.
    function end(formula, v, cls) {
      var constant = /^[0-9.]+$/.test(formula)
      if (!constant) sliceLine.appendChild(h('span', {}, formula + ' '))
      sliceLine.appendChild(h('span', { class: 'rsl-val ' + cls }, constant ? formula : eqs(v)))
    }
    sliceLine.appendChild(h('span', {}, (dydx ? t('Vertical slice at ', '竖直切片 ') : t('Horizontal slice at ', '水平切片 ')) + outer + ' = ' + coord(s) + t(': ', '：') + inner + t(' runs from ', ' 从 ')))
    end(d.los, lo, 'rsl-from')
    sliceLine.appendChild(h('span', {}, t(' to ', ' 到 ')))
    end(d.his, hi, 'rsl-to')
    sliceLine.appendChild(h('span', {}, t(' (length ', '（长度 ')))
    sliceLine.appendChild(h('span', { class: 'rsl-val rsl-len' }, eqs(hi - lo).replace(/^= /, '')))
    sliceLine.appendChild(h('span', {}, t(').', '）。')))
    // The area both ways.
    ;[['dydx', areaV, t('Area with vertical slices:', '用竖直切片求面积：')], ['dxdy', areaH, t('Area with horizontal slices:', '用水平切片求面积：')]].forEach(function (q) {
      var dd = r[q[0]], el = q[1]
      while (el.firstChild) el.removeChild(el.firstChild)
      el.classList.toggle('rsl-on', q[0] === S.order)
      el.appendChild(h('span', { class: 'rsl-what' }, q[2]))
      el.appendChild(h('span', { class: 'rsl-formula' }, integralSign(dd.as, dd.bs), bracket(dd.len) + ' ' + (q[0] === 'dydx' ? 'dx' : 'dy')))
      el.appendChild(h('span', { class: 'rsl-num' }, '≈ ' + sig(areaOf(r, q[0]), 7)))
    })
    exactLine.textContent = t('Exact area: ' + r.exact + ' ≈ ' + sig(r.exactVal, 7) + '. Both orders give the same area, as Fubini\'s theorem says they must.',
      '精确面积：' + r.exact + ' ≈ ' + sig(r.exactVal, 7) + '。两种次序给出相同的面积，正如富比尼定理所说。')
    slider.input.setAttribute('aria-valuetext', outer + ' = ' + coord(s))
    P.redraw()
  }

  resetSlider()
  update()
})
