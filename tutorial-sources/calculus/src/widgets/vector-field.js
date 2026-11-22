/* vector-field (Module 20): Green's theorem by numbers. Choose a vector field F = ⟨P, Q⟩ (rotation, source, constant,
 * shear, the gradient field ∇(½(x² + y²)) = ⟨x, y⟩ drawn with level curves of its potential, sink) or type P and Q;
 * its arrows are drawn with P.field. A circle with centre (x₀, y₀) and radius r is set with three sliders or by dragging
 * on the plot. The readout compares the circulation ∮ F · dr round the circle (anticlockwise) with the double integral
 * of ∂Q/∂x − ∂P/∂y over the disc, and the outward flux ∮ F · n ds with the double integral of ∂P/∂x + ∂Q/∂y: Green's
 * theorem in both forms. All four numbers are numerical, so all are shown with ≈:
 *  - the line integrals: api.num.integrate (adaptive Simpson) over 16 arcs of the parametrised circle;
 *  - the double integrals: polar coordinates about the centre, dA = ρ dρ dθ, with Gauss–Legendre nodes in ρ and the
 *    trapezoidal rule in θ (very accurate for a smooth periodic integrand), at two resolutions (and a third if they
 *    disagree), so that a result that has not settled can be reported;
 *  - the partial derivatives: central differences with steps h and h/2; where the two disagree, F is not smooth there
 *    (for example, it blows up), and the double integrals are reported as not existing as ordinary integrals. */
CalcWidgets.register('vector-field', function (root, api) {
  var t = api.t, h = api.h
  function minus(s) { return String(s).replace(/-/g, '−') }
  function num2(v) { return minus(String(Math.round(v * 100) / 100)) }
  function snap(v) { return Math.round(v * 20) / 20 }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)) }

  // ------------------------------------------------------------------ the fields
  var PRESETS = [
    { value: 'rotation', label: t('rotation ⟨−y, x⟩', '旋转场 ⟨−y, x⟩'), text: 'F = ⟨−y, x⟩', P: '-y', Q: 'x', F: function (x, y) { return [-y, x] } },
    { value: 'source', label: t('source ⟨x, y⟩', '源 ⟨x, y⟩'), text: 'F = ⟨x, y⟩', P: 'x', Q: 'y', F: function (x, y) { return [x, y] } },
    { value: 'constant', label: t('constant ⟨1, 0.5⟩', '常向量场 ⟨1, 0.5⟩'), text: 'F = ⟨1, 0.5⟩', P: '1', Q: '0.5', F: function () { return [1, 0.5] } },
    { value: 'shear', label: t('shear ⟨y, 0⟩', '剪切场 ⟨y, 0⟩'), text: 'F = ⟨y, 0⟩', P: 'y', Q: '0', F: function (x, y) { return [y, 0] } },
    { value: 'gradient', label: t('gradient ∇(½(x² + y²))', '梯度场 ∇(½(x² + y²))'), text: 'F = ∇(½(x² + y²)) = ⟨x, y⟩', P: 'x', Q: 'y',
      F: function (x, y) { return [x, y] }, f: function (x, y) { return (x * x + y * y) / 2 }, levels: [0.5, 2, 4.5, 8] },
    { value: 'sink', label: t('sink ⟨−x, −y⟩', '汇 ⟨−x, −y⟩'), text: 'F = ⟨−x, −y⟩', P: '-x', Q: '-y', F: function (x, y) { return [-x, -y] } },
  ]
  var OWN = 'own'
  var VIEW = [-3.6, 3.6, -2.4, 2.4]
  var state = { preset: PRESETS[0], F: PRESETS[0].F, x0: 1, y0: 0.5, r: 1, cap: Infinity }

  // ------------------------------------------------------------------ controls
  var sel = api.select({
    label: t('Field F', '向量场 F'), value: 'rotation',
    options: PRESETS.map(function (p) { return { value: p.value, label: p.label } })
      .concat([{ value: OWN, label: t('your own: type P and Q', '自定义：输入 P 和 Q') }]),
    onchange: function (v) {
      if (v === OWN) { fieldP.input.focus(); fromFields(); return }
      usePreset(PRESETS.filter(function (p) { return p.value === v })[0])
    },
  })
  var fieldP = api.field({ label: 'P(x, y) =', value: '-y', size: 13, placeholder: '-y/(x^2+y^2)', onchange: function () { sel.set(OWN); fromFields() } })
  var fieldQ = api.field({ label: 'Q(x, y) =', value: 'x', size: 13, placeholder: 'x/(x^2+y^2)', onchange: function () { sel.set(OWN); fromFields() } })
  var sx = api.slider({ label: t('centre x₀', '圆心 x₀'), min: -3, max: 3, step: 0.05, value: state.x0, fmt: num2, oninput: function (v) { state.x0 = v; update() } })
  var sy = api.slider({ label: t('centre y₀', '圆心 y₀'), min: -2, max: 2, step: 0.05, value: state.y0, fmt: num2, oninput: function (v) { state.y0 = v; update() } })
  var sr = api.slider({ label: t('radius r', '半径 r'), min: 0.2, max: 2.4, step: 0.05, value: state.r, fmt: num2, oninput: function (v) { state.r = v; update() } })
  var plotBox = h('div', { class: 'vf-plot' })
  var key = h('div', { class: 'vf-key' })
  var out = api.readout()
  out.classList.add('vf-readout')
  root.appendChild(api.row(sel.el))
  root.appendChild(h('div', { class: 'vf-fields' }, fieldP.el, fieldQ.el))
  root.appendChild(plotBox)
  root.appendChild(key)
  root.appendChild(h('div', { class: 'vf-sliders' }, sx.el, sy.el, sr.el))
  root.appendChild(out)
  api.css('vector-field', [
    '.vf-fields{display:flex;flex-wrap:wrap;gap:.35rem 1rem;margin:.3rem 0 .5rem}',
    '.vf-key{font-size:.8rem;color:var(--slate);margin:.3rem 0 .2rem}',
    '.vf-sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.35rem 1rem;margin:.45rem 0}',
    '.vf-readout div{white-space:pre-wrap}',
    '.vf-readout .vf-head{font-weight:700;margin-top:.35rem}',
    '.vf-readout .vf-head:first-child{margin-top:0}',
    '.vf-readout .vf-yes{color:#166534;margin-top:.35rem}',
    '.vf-readout .vf-warn{color:#9A3412;margin-top:.35rem}',
  ].join(''))

  // ------------------------------------------------------------------ numbers
  function safe(F) {
    return function (x, y) {
      var w
      try { w = F(x, y) } catch (e) { return [NaN, NaN] }
      return w && w.length === 2 ? [+w[0], +w[1]] : [NaN, NaN]
    }
  }
  // Gauss–Legendre nodes and weights on [−1, 1] (Newton's method on the Legendre polynomial).
  function gaussLegendre(n) {
    var xs = [], ws = []
    for (var i = 1; i <= n; i++) {
      var z = Math.cos(Math.PI * (i - 0.25) / (n + 0.5)), dp = 1
      for (var it = 0; it < 100; it++) {
        var p1 = 1, p2 = 0
        for (var j = 1; j <= n; j++) { var p3 = p2; p2 = p1; p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j }
        dp = n * (z * p1 - p2) / (z * z - 1)
        var z1 = z
        z = z1 - p1 / dp
        if (Math.abs(z - z1) < 1e-15) break
      }
      xs.push(z); ws.push(2 / ((1 - z * z) * dp * dp))
    }
    return { x: xs, w: ws }
  }
  var LEVELS = [[gaussLegendre(24), 96], [gaussLegendre(48), 192], [gaussLegendre(96), 384]]
  var ARCS = 16

  // The circulation and the outward flux round the circle: r(θ) = c + r⟨cos θ, sin θ⟩, so F · r′ dθ = r(−P sin θ + Q cos θ) dθ
  // and F · n ds = r(P cos θ + Q sin θ) dθ; each integral is split into 16 arcs.
  function lineIntegrals(F, x0, y0, R) {
    var circ = 0, flux = 0
    for (var k = 0; k < ARCS; k++) {
      var a = 2 * Math.PI * k / ARCS, b = 2 * Math.PI * (k + 1) / ARCS
      circ += api.num.integrate(function (th) { var c = Math.cos(th), s = Math.sin(th), w = F(x0 + R * c, y0 + R * s); return R * (-w[0] * s + w[1] * c) }, a, b, 1e-11, 20000)
      flux += api.num.integrate(function (th) { var c = Math.cos(th), s = Math.sin(th), w = F(x0 + R * c, y0 + R * s); return R * (w[0] * c + w[1] * s) }, a, b, 1e-11, 20000)
    }
    return [circ, flux]
  }
  // ∂Q/∂x − ∂P/∂y and ∂P/∂x + ∂Q/∂y at (x, y), from central differences with steps h and h/2; null where they disagree
  // (F is not smooth there) or are not numbers.
  function diffs(F, x, y, hx, hy) {
    var e = F(x + hx, y), w = F(x - hx, y), n = F(x, y + hy), s = F(x, y - hy)
    return [(e[0] - w[0]) / (2 * hx), (n[0] - s[0]) / (2 * hy), (e[1] - w[1]) / (2 * hx), (n[1] - s[1]) / (2 * hy)]   // Px, Py, Qx, Qy
  }
  function curlDiv(F, x, y) {
    var hx = 1e-6 * (1 + Math.abs(x)), hy = 1e-6 * (1 + Math.abs(y))
    var d1 = diffs(F, x, y, hx, hy), d2 = diffs(F, x, y, hx / 2, hy / 2)
    for (var i = 0; i < 4; i++) {
      if (!isFinite(d1[i]) || !isFinite(d2[i]) || Math.abs(d1[i] - d2[i]) > 1e-4 * (1 + Math.abs(d2[i]))) return null
    }
    return [d2[2] - d2[1], d2[0] + d2[3]]
  }
  // ∬ over the disc of (curl, div), in polar coordinates: Gauss–Legendre in ρ on [0, R], trapezoidal rule in θ.
  function discIntegrals(F, x0, y0, R, level) {
    var gl = LEVELS[level][0], M = LEVELS[level][1], cu = 0, di = 0
    for (var k = 0; k < M; k++) {
      var th = 2 * Math.PI * k / M, c = Math.cos(th), s = Math.sin(th)
      for (var j = 0; j < gl.x.length; j++) {
        var rho = R * (1 + gl.x[j]) / 2, d = curlDiv(F, x0 + rho * c, y0 + rho * s)
        if (!d) return null
        cu += gl.w[j] * d[0] * rho
        di += gl.w[j] * d[1] * rho
      }
    }
    var factor = (R / 2) * (2 * Math.PI / M)
    return [cu * factor, di * factor]
  }
  function compute() {
    var F = safe(state.F), x0 = state.x0, y0 = state.y0, R = state.r
    var li = lineIntegrals(F, x0, y0, R)
    // The size of F on the circle times the circumference: what "0" and "equal" are measured against.
    var big = 0
    for (var k = 0; k < 128; k++) {
      var th = 2 * Math.PI * k / 128, w = F(x0 + R * Math.cos(th), y0 + R * Math.sin(th))
      if (isFinite(w[0]) && isFinite(w[1])) big = Math.max(big, Math.hypot(w[0], w[1]))
    }
    var scale = Math.max(big * 2 * Math.PI * R, 1e-300)
    var res = { circ: li[0], flux: li[1], curl: NaN, div: NaN, scale: scale, singular: false, settled: true }
    var prev = discIntegrals(F, x0, y0, R, 0)
    if (!prev) { res.singular = true; return res }
    for (var lev = 1; lev < LEVELS.length; lev++) {
      var next = discIntegrals(F, x0, y0, R, lev)
      if (!next) { res.singular = true; return res }
      var tol = 1e-7 * Math.max(1, Math.abs(next[0]), Math.abs(next[1]), scale)
      res.curl = next[0]; res.div = next[1]
      if (Math.abs(next[0] - prev[0]) <= tol && Math.abs(next[1] - prev[1]) <= tol) return res
      prev = next
    }
    res.settled = false
    return res
  }

  // ------------------------------------------------------------------ the picture
  var P = api.plot(plotBox, {
    view: VIEW, equal: true, label: t('A vector field and a circle; the readout compares both sides of Green’s theorem', '向量场与一个圆；读数比较格林定理的两边'),
    draw: function (P) {
      P.axes()
      var x0 = state.x0, y0 = state.y0, R = state.r
      var cx = function (s) { return x0 + R * Math.cos(s) }, cy = function (s) { return y0 + R * Math.sin(s) }
      P.param(cx, cy, 0, 2 * Math.PI, { color: 'none', width: 0, fill: 'rgba(37, 99, 235, 0.07)', samples: 120 }).setAttribute('class', 'vf-disc')
      if (state.preset && state.preset.f) {
        var lv = P.contour(state.preset.f, state.preset.levels, { color: 'var(--orange)', width: 1.5, n: 90 })
        lv.setAttribute('class', 'vf-levels')
        lv.setAttribute('opacity', '0.75')
      }
      if (state.F) {
        var nx = Math.max(11, Math.min(19, Math.round(P.W / 40))), Fs = safe(state.F), cap = state.cap
        var drawn = isFinite(cap) ? function (x, y) { var w = Fs(x, y), L = Math.hypot(w[0], w[1]); return L > cap ? [w[0] * cap / L, w[1] * cap / L] : w } : Fs
        P.field(drawn, { n: nx, color: 'var(--slate)', width: 1.4 }).setAttribute('class', 'vf-field')
      }
      P.param(cx, cy, 0, 2 * Math.PI, { color: 'var(--blue)', width: 2.6, samples: 240 }).setAttribute('class', 'vf-circle')
      var d = Math.min(0.5, 0.3 / R)                   // the arrowheads: anticlockwise, at the top and the bottom
      ;[Math.PI / 2, 3 * Math.PI / 2].forEach(function (a) {
        P.arrow(cx(a - d), cy(a - d), cx(a + d), cy(a + d), { color: 'var(--blue)', width: 2.6, head: 11, layer: 'main' }).setAttribute('class', 'vf-orient')
      })
      P.point(x0, y0, { color: 'var(--navy)', r: 5, layer: 'main' }).setAttribute('class', 'vf-centre')
    },
  })
  P.onDrag(function (x, y, phase) {
    if (phase === 'end') return
    state.x0 = clamp(snap(x), -3, 3); state.y0 = clamp(snap(y), -2, 2)
    sx.set(state.x0); sy.set(state.y0)
    update()
  })

  // ------------------------------------------------------------------ the readout
  // All four numbers with the same number of decimals: five significant digits of the largest of them (or of the size
  // of F round the circle, when all four are 0), so that rounding noise such as 10⁻¹⁶ shows as 0.
  function formatter(vals, scale) {
    var ref = 0
    vals.forEach(function (v) { if (isFinite(v)) ref = Math.max(ref, Math.abs(v)) })
    if (ref < 1e-8 * scale) ref = scale
    var dec = clamp(4 - Math.floor(Math.log10(ref)), 0, 12)
    return function (v) {
      if (!isFinite(v)) return ' —'
      var s = v.toFixed(dec)
      if (Number(s) === 0) return ' ≈ 0'
      return ' ≈ ' + minus(s)
    }
  }
  function line(cls, text) { return h('div', { class: cls || null }, text) }
  function readout() {
    while (out.firstChild) out.removeChild(out.firstChild)
    if (!state.F) {
      out.appendChild(line('vf-warn', t('Type formulas in x and y for P and Q, such as -y^3 and x^3.', '请为 P 和 Q 输入关于 x 和 y 的公式，例如 -y^3 和 x^3。')))
      return
    }
    var r = compute(), f = formatter([r.circ, r.flux, r.curl, r.div], r.scale)
    out.appendChild(line('vf-formula', state.preset ? state.preset.text : 'F = ⟨' + fieldP.get().trim() + ', ' + fieldQ.get().trim() + '⟩'))
    out.appendChild(line('vf-head', t('Circulation, anticlockwise round the circle', '沿圆周（逆时针）的环量')))
    out.appendChild(line('vf-circ', '∮ F · dr' + f(r.circ)))
    out.appendChild(line('vf-curl', '∬ (∂Q/∂x − ∂P/∂y) dA' + f(r.curl)))
    out.appendChild(line('vf-head', t('Outward flux across the circle', '穿过圆周向外的通量')))
    out.appendChild(line('vf-flux', '∮ F · n ds' + f(r.flux)))
    out.appendChild(line('vf-div', '∬ (∂P/∂x + ∂Q/∂y) dA' + f(r.div)))
    var verdict, cls = 'vf-warn vf-verdict'
    if (!isFinite(r.circ) || !isFinite(r.flux)) {
      verdict = t('F is not defined at some point of the circle, so the line integrals do not exist.', 'F 在圆周的某些点上没有定义，因此线积分不存在。')
    } else if (r.singular) {
      verdict = t('F is not defined, or not differentiable, at some point inside the circle: the double integrals do not exist as ordinary integrals, and Green’s theorem does not apply.',
        'F 在圆内某点没有定义或不可微：这两个二重积分不是普通意义下的积分，格林定理不适用。')
    } else {
      var tol = 1e-6 * Math.max(1, r.scale, Math.abs(r.circ), Math.abs(r.flux))
      var okC = Math.abs(r.circ - r.curl) <= tol, okD = Math.abs(r.flux - r.div) <= tol
      if (okC && okD) {
        verdict = t('Both pairs agree, as Green’s theorem says: each line integral round the circle equals the double integral over the disc.',
          '两组数值都相等，正如格林定理所说：沿圆周的线积分等于圆盘上的二重积分。')
        cls = 'vf-yes vf-verdict'
      } else if (!r.settled) {
        verdict = t('The double integrals did not settle: F changes very fast, or blows up, somewhere in the disc, so their last digits may be wrong.',
          '二重积分的数值没有稳定下来：F 在圆盘内某处变化极快或趋于无穷，因此末几位数字可能不对。')
      } else {
        verdict = (okC ? '' : t('The circulation and the integral of ∂Q/∂x − ∂P/∂y differ. ', '环量与 ∂Q/∂x − ∂P/∂y 的积分不相等。')) +
          (okD ? '' : t('The flux and the integral of ∂P/∂x + ∂Q/∂y differ. ', '通量与 ∂P/∂x + ∂Q/∂y 的积分不相等。')) +
          t('Green’s theorem needs P and Q to have continuous partial derivatives on the whole disc: is F undefined somewhere inside the circle?',
            '格林定理要求 P 和 Q 在整个圆盘上有连续的偏导数：F 是否在圆内某处没有定义？')
      }
    }
    out.appendChild(line(cls, verdict))
  }
  // Arrows more than four times the typical (median) length are cut short, so that a field that blows up somewhere does
  // not shrink all its other arrows to dots; the key says so when it happens.
  function setCap() {
    state.cap = Infinity
    if (!state.F) return
    var F = safe(state.F), lens = [], v = VIEW
    for (var i = 0; i < 24; i++) for (var j = 0; j < 16; j++) {
      var w = F(v[0] + (i + 0.5) * (v[1] - v[0]) / 24, v[2] + (j + 0.5) * (v[3] - v[2]) / 16), L = Math.hypot(w[0], w[1])
      if (isFinite(L)) lens.push(L)
    }
    if (!lens.length) return
    lens.sort(function (a, b) { return a - b })
    var med = lens[Math.floor(lens.length / 2)]
    if (med > 0 && lens[lens.length - 1] > 4 * med) state.cap = 4 * med
  }
  function setKey() {
    key.textContent = t('Grey arrows: the field F, all shortened by the same factor. Blue: the circle, traced anticlockwise; drag on the picture to move its centre.',
      '灰色箭头：向量场 F，按同一比例缩短。蓝色：逆时针绕行的圆；在图上拖动可以移动圆心。') +
      (isFinite(state.cap) ? t(' Arrows more than four times the typical length are cut short.', ' 长度超过典型长度四倍的箭头被截短显示。') : '') +
      (state.preset && state.preset.f ? t(' Orange: level curves of the potential ½(x² + y²).', ' 橙色：势函数 ½(x² + y²) 的等值线。') : '')
  }

  // ------------------------------------------------------------------ state changes
  function usePreset(p) {
    state.preset = p; state.F = p.F
    fieldP.set(p.P); fieldQ.set(p.Q); fieldP.error(''); fieldQ.error('')
    setCap()
    update()
  }
  function fromFields() {
    var a = api.Expr.parse(fieldP.get(), ['x', 'y']), b = api.Expr.parse(fieldQ.get(), ['x', 'y'])
    fieldP.error(a.ok ? '' : a.error); fieldQ.error(b.ok ? '' : b.error)
    state.preset = null
    if (!a.ok || !b.ok) { state.F = null; setCap(); update(); return }
    var fp = a.f, fq = b.f
    state.F = function (x, y) { return [fp(x, y), fq(x, y)] }
    setCap()
    update()
  }
  function update() {
    setKey()
    readout()
    P.redraw()
  }
  update()
})
