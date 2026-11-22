/* lagrange (Module 18): Lagrange multipliers by eye. Choose an objective f(x, y) and a constraint curve g(x, y) = c;
 * a slider moves a point along the curve through the curve's parameter. The plot shows level curves of f with their
 * values, the constraint curve, the level curve of f through the point, and the gradients ∇f and ∇g at the point,
 * drawn at one common scale (so when ∇f = λ∇g the arrow of ∇f is |λ| times as long). The readout gives the point,
 * f there, the angle between the gradients and, when they are parallel, the candidate's λ = ±|∇f|/|∇g|.
 * Gradients are computed from their formulas, not numerically. */
CalcWidgets.register('lagrange', function (root, api) {
  var t = api.t, h = api.h

  // ------------------------------------------------------------------ the choices
  var OBJ = [
    { value: 'sum', label: 'x + y', f: function (x, y) { return x + y }, grad: function () { return [1, 1] }, levels: [-3, -2, -1, 1, 2, 3], line: false,
      why: ['x + y = 1 at every point of the line x + y = 1: there is nothing to optimise', '在直线 x + y = 1 上处处有 x + y = 1：没有什么可优化的'] },
    { value: 'prod', label: 'xy', f: function (x, y) { return x * y }, grad: function (x, y) { return [y, x] }, levels: [-2, -1, -0.5, 0.5, 1, 2], line: true },
    { value: 'quad', label: 'x² + 2y²', f: function (x, y) { return x * x + 2 * y * y }, grad: function (x, y) { return [2 * x, 4 * y] }, levels: [1, 2, 4, 6, 8], line: true },
    { value: 'lin', label: '2x + y', f: function (x, y) { return 2 * x + y }, grad: function () { return [2, 1] }, levels: [-4, -3, -2, -1, 1, 2, 3, 4], line: false,
      why: ['on the line x + y = 1, 2x + y = x + 1 has no maximum and no minimum', '在直线 x + y = 1 上 2x + y = x + 1，既没有最大值也没有最小值'] },
  ]
  // r(s): the point at parameter s; dr(s): its velocity (the direction in which s increases); grad: ∇g.
  // Circle and ellipse: s is an angle t in degrees. Line: s is the x-coordinate.
  var CON = [
    { value: 'circle', label: 'x² + y² = 1', angle: true, where: '(cos t, sin t)',
      r: function (s) { return [Math.cos(s), Math.sin(s)] }, dr: function (s) { return [-Math.sin(s), Math.cos(s)] },
      grad: function (x, y) { return [2 * x, 2 * y] } },
    { value: 'ellipse', label: 'x²/4 + y² = 1', angle: true, where: '(2 cos t, sin t)',
      r: function (s) { return [2 * Math.cos(s), Math.sin(s)] }, dr: function (s) { return [-2 * Math.sin(s), Math.cos(s)] },
      grad: function (x, y) { return [x / 2, 2 * y] } },
    { value: 'line', label: 'x + y = 1', angle: false, where: '(x, 1 − x)', min: -0.25, max: 2, step: 0.01,
      r: function (s) { return [s, 1 - s] }, dr: function () { return [1, -1] }, grad: function () { return [1, 1] } },
  ]
  var VIEW = [-3.2, 3.2, -2.2, 2.2]
  var PARALLEL = 0.5                     // degrees: "parallel" means an angle within 0.5° of 0° or 180°
  var state = { obj: OBJ[1], con: CON[1], s: 20, note: '' }

  function byValue(list, v) { return list.filter(function (o) { return o.value === v })[0] }
  function minus(s) { return String(s).replace(/-/g, '−') }
  function fmt(v) { return api.num.fmt(v, 5) }
  // " = " when the number shown is the value itself (up to rounding noise), " ≈ " when it is rounded
  function eq(v) { var r = Number(v.toPrecision(5)); return Math.abs(r - v) <= 1e-12 * Math.max(1, Math.abs(v)) ? ' = ' : ' ≈ ' }
  function num(v) { return eq(v) + fmt(v) }
  function vec(v) { return '⟨' + fmt(v[0]) + ', ' + fmt(v[1]) + '⟩' }
  function exactVec(v) { return eq(v[0]) === ' = ' && eq(v[1]) === ' = ' ? ' = ' : ' ≈ ' }
  function sText(s) { return state.con.angle ? 't = ' + minus(String(s)) + '°' : 'x = ' + minus(String(s)) }

  // ------------------------------------------------------------------ controls
  var objSel = api.select({ label: t('Objective f(x, y)', '目标函数 f(x, y)'), value: 'prod',
    options: OBJ.map(function (o) { return { value: o.value, label: o.label } }),
    onchange: function (v) { setObjective(byValue(OBJ, v)) } })
  var conSel = api.select({ label: t('Constraint', '约束'), value: 'ellipse',
    options: CON.map(function (c) { return { value: c.value, label: c.label } }),
    onchange: function (v) { setConstraint(byValue(CON, v)) } })
  var slider = api.slider({ label: t('position', '位置'), min: 0, max: 360, step: 0.5, value: state.s,
    fmt: function (v) { return state.con.angle ? minus(String(v)) + '°' : 'x = ' + minus(String(v)) },
    oninput: function (v) { state.s = v; state.note = ''; update() } })
  var plotBox = h('div', { class: 'lg-plot' })
  var key = h('div', { class: 'lg-key' })
  var out = api.readout()
  out.classList.add('lg-readout')
  root.appendChild(api.row(objSel.el, conSel.el))
  root.appendChild(plotBox)
  root.appendChild(key)
  root.appendChild(h('div', { class: 'lg-slider' }, slider.el))
  root.appendChild(out)
  api.css('lagrange', [
    '.lg-key{font-size:.8rem;color:var(--slate);margin:.3rem 0 .2rem}',
    '.lg-key b{font-weight:600}',
    '.lg-slider{margin:.45rem 0}',
    '.lg-slider .cw-slider input[type=range]{flex:1 1 200px}',
    '.lg-readout div{white-space:pre-wrap}',
    '.lg-readout .lg-yes{font-weight:700;color:#166534}',
    '.lg-readout .lg-no{color:var(--slate)}',
    '.lg-readout .lg-note{color:#9A3412}',
  ].join(''))

  // ------------------------------------------------------------------ numbers at the point
  function compute() {
    var c = state.con, o = state.obj, s = c.angle ? state.s * Math.PI / 180 : state.s
    var p = c.r(s), x = p[0], y = p[1]
    var gf = o.grad(x, y), gg = c.grad(x, y), d = c.dr(s)
    var nf = Math.hypot(gf[0], gf[1]), ng = Math.hypot(gg[0], gg[1])
    var dot = gf[0] * gg[0] + gf[1] * gg[1], cross = gf[0] * gg[1] - gf[1] * gg[0]
    var angle = Math.atan2(Math.abs(cross), dot) * 180 / Math.PI           // between 0° and 180°
    var along = gf[0] * d[0] + gf[1] * d[1]                                // d/ds of f along the curve
    return { x: x, y: y, f: o.f(x, y), gf: gf, gg: gg, nf: nf, ng: ng, angle: angle, along: along,
      parallel: angle < PARALLEL || angle > 180 - PARALLEL, same: dot > 0 }
  }

  // ------------------------------------------------------------------ the picture
  // One scale for both arrows, so that their lengths compare as |∇f| and |∇g| do: the longer arrow is 0.95 long, or
  // shorter where that would bring a tip within 0.15 of the edge of the view (on the line, near the ends of its range).
  function arrowScale(r) {
    var big = Math.max(r.nf, r.ng), k = big > 0 ? 0.95 / big : 0, e = 0.15, v = VIEW, gs = [r.gf, r.gg]
    for (var i = 0; i < 2; i++) {
      var g = gs[i]
      if (g[0] > 0) k = Math.min(k, (v[1] - e - r.x) / g[0])
      if (g[0] < 0) k = Math.min(k, (v[0] + e - r.x) / g[0])
      if (g[1] > 0) k = Math.min(k, (v[3] - e - r.y) / g[1])
      if (g[1] < 0) k = Math.min(k, (v[2] + e - r.y) / g[1])
    }
    return Math.max(k, 0)
  }

  // A label point for the level curve f = L: the first place where the curve crosses the edge of the view (inset a
  // little), going round from the top left; for a closed curve inside the view, a point on the ray from the origin
  // towards the upper left.
  function labelPoint(f, L) {
    var v = VIEW, m = 0.5, x0 = v[0] + m, x1 = v[1] - m, y0 = v[2] + m, y1 = v[3] - m
    var path = [[x0, y1], [x1, y1], [x1, y0], [x0, y0], [x0, y1]], prev = null, pv = null
    for (var k = 0; k < 4; k++) {
      for (var i = 0; i <= 200; i++) {
        var q = [path[k][0] + (path[k + 1][0] - path[k][0]) * i / 200, path[k][1] + (path[k + 1][1] - path[k][1]) * i / 200]
        var val = f(q[0], q[1]) - L
        if (prev && isFinite(val) && isFinite(pv) && (val === 0 || (val > 0) !== (pv > 0))) {
          var a = prev, b = q, fa = pv
          for (var j = 0; j < 40; j++) {
            var mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], fm = f(mid[0], mid[1]) - L
            if ((fm > 0) === (fa > 0)) { a = mid; fa = fm } else b = mid
          }
          return a
        }
        prev = q; pv = val
      }
    }
    var dir = [Math.cos(2.2), Math.sin(2.2)], lo = 0, hi = 6                // a ray towards the upper left
    if ((f(0, 0) - L) * (f(hi * dir[0], hi * dir[1]) - L) > 0) return null
    for (var n = 0; n < 50; n++) { var r = (lo + hi) / 2; if ((f(r * dir[0], r * dir[1]) - L) * (f(0, 0) - L) > 0) lo = r; else hi = r }
    return [lo * dir[0], lo * dir[1]]
  }

  var P = api.plot(plotBox, {
    view: VIEW, equal: true, label: t('Level curves of f, the constraint curve, and the gradients of f and g at a point of the curve',
      'f 的等高线、约束曲线，以及曲线上一点处 f 与 g 的梯度'),
    draw: function (P) {
      P.axes()
      var o = state.obj, c = state.con, r = compute()
      var g = P.contour(o.f, o.levels, { color: 'var(--muted)', width: 1.1, n: 90 })
      g.setAttribute('class', 'lg-levels')
      var placed = []                                    // labels already drawn: [x, y, half-width] in pixels
      o.levels.forEach(function (L) {
        var q = labelPoint(o.f, L)
        if (!q) return
        var txt = minus(String(L)), px = P.X(q[0]), py = P.Y(q[1]), hw = 3.5 * txt.length + 2
        if (placed.some(function (b) { return Math.abs(b[0] - px) < b[2] + hw + 3 && Math.abs(b[1] - py) < 15 })) return
        placed.push([px, py, hw])
        P.text(q[0], q[1], txt, { anchor: 'middle', dy: 4, color: 'var(--slate)', size: 11 }).setAttribute('class', 'cw-label lg-value')
      })
      var curve = c.angle ? P.param(function (s) { return c.r(s)[0] }, function (s) { return c.r(s)[1] }, 0, 2 * Math.PI, { color: 'var(--green)', width: 3 })
        : P.param(function (s) { return c.r(s)[0] }, function (s) { return c.r(s)[1] }, VIEW[0] - 1, VIEW[1] + 1, { color: 'var(--green)', width: 3 })
      curve.setAttribute('class', 'lg-constraint')
      var lev = P.contour(o.f, [r.f], { color: 'var(--orange)', width: 2.2, n: 120 })
      lev.setAttribute('class', 'lg-level')
      // The point first and the arrows over it, so that a short arrow stays visible; a short arrow gets a smaller head.
      P.point(r.x, r.y, { color: 'var(--navy)', r: 5.5, layer: 'main' }).setAttribute('class', 'lg-point')
      var k = arrowScale(r), px = P.X(1) - P.X(0)
      var head = function (n, most) { return Math.max(5, Math.min(most, 0.6 * k * n * px)) }
      var ag = P.arrow(r.x, r.y, r.x + k * r.gg[0], r.y + k * r.gg[1], { color: 'var(--green)', width: 5, head: head(r.ng, 13), layer: 'main' })
      ag.setAttribute('class', 'lg-grad-g'); ag.setAttribute('opacity', '0.55')
      var af = P.arrow(r.x, r.y, r.x + k * r.gf[0], r.y + k * r.gf[1], { color: 'var(--orange)', width: 2.2, head: head(r.nf, 10), layer: 'main' })
      af.setAttribute('class', 'lg-grad-f')
    },
  })

  // ------------------------------------------------------------------ the readout
  function update() {
    var r = compute(), o = state.obj, c = state.con
    key.innerHTML = ''
    key.appendChild(document.createTextNode(t(
      'Grey: level curves of f with their values. Orange: the level curve of f through the point, and ∇f. Green: the constraint curve ' + c.label + ', traced by ' + c.where + ', and ∇g. The arrows are drawn at the same scale.',
      '灰色：f 的等高线及其取值。橙色：过该点的 f 的等高线，以及 ∇f。绿色：约束曲线 ' + c.label + '（由 ' + c.where + ' 描出），以及 ∇g。两个箭头按同一比例绘制。')))
    var lines = []
    lines.push([sText(state.s) + t(': the point (x, y)', '：点 (x, y)') + exactVec([r.x, r.y]) + '(' + fmt(r.x) + ', ' + fmt(r.y) + ')'])
    lines.push(['f(x, y) = ' + o.label + num(r.f)])
    lines.push(['∇f' + exactVec(r.gf) + vec(r.gf) + ',  ∇g' + exactVec(r.gg) + vec(r.gg)])
    var ang = r.angle < 1e-9 ? ' = 0°' : Math.abs(r.angle - 180) < 1e-9 ? ' = 180°' : ' ≈ ' + r.angle.toFixed(1) + '°'
    lines.push([t('angle between ∇f and ∇g', '∇f 与 ∇g 的夹角') + ang])
    if (r.parallel) {
      var lam = (r.same ? 1 : -1) * r.nf / r.ng
      lines.push([t('Parallel: a candidate for an extremum. ', '平行：这是极值的候选点。') +
        (r.same ? 'λ = |∇f| / |∇g|' : 'λ = −|∇f| / |∇g|') + num(lam) +
        (r.same ? t(' (∇f and ∇g point the same way)', '（∇f 与 ∇g 同向）') : t(' (∇f and ∇g point in opposite directions)', '（∇f 与 ∇g 反向）')), 'lg-yes'])
    } else {
      var dir = r.along > 0 ? t('increases', '增大') : t('decreases', '减小')
      var what = c.angle ? 't' : 'x'
      lines.push([t('Not parallel: ∇f has a part along the curve, so f ' + dir + ' as ' + what + ' increases. No extremum here.',
        '不平行：∇f 有沿曲线方向的分量，所以 ' + what + ' 增大时 f ' + dir + '。这里不是极值点。'), 'lg-no'])
    }
    if (state.note) lines.push([state.note, 'lg-note'])
    out.innerHTML = ''
    lines.forEach(function (l) { out.appendChild(h('div', { class: l[1] || null }, l[0])) })
    P.redraw()
  }

  // ------------------------------------------------------------------ changing the choices
  function setSlider(c) {
    var inp = slider.input
    if (c.angle) { inp.min = 0; inp.max = 360; inp.step = 0.5 } else { inp.min = c.min; inp.max = c.max; inp.step = c.step }
    inp.setAttribute('aria-label', c.angle ? t('parameter t in degrees', '参数 t（度）') : t('x-coordinate of the point', '点的 x 坐标'))
  }
  function setConstraint(c) {
    if (c.value === 'line' && !state.obj.line) {      // the line goes with xy and x² + 2y² only
      conSel.set(state.con.value)
      state.note = t('The line goes with xy and x² + 2y² only: ' + state.obj.why[0] + '.', '直线只与 xy 和 x² + 2y² 搭配：' + state.obj.why[1] + '。')
      update()
      return
    }
    var wasAngle = state.con.angle
    state.con = c
    setSlider(c)
    if (c.angle !== wasAngle) state.s = c.angle ? 20 : 0.2
    slider.set(state.s)
    state.note = ''
    update()
  }
  function setObjective(o) {
    state.obj = o
    state.note = ''
    Array.prototype.forEach.call(conSel.input.options, function (op) { if (op.value === 'line') op.disabled = !o.line })
    if (state.con.value === 'line' && !o.line) {
      state.con = CON[0]; conSel.set('circle'); setSlider(CON[0]); state.s = 20; slider.set(20)
      state.note = t('The constraint is now the circle: ' + o.why[0] + '.', '约束已改为圆：' + o.why[1] + '。')
    }
    update()
  }
  setSlider(state.con)
  update()
})
