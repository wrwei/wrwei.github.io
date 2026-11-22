/* taylor-explorer (Module 15): the Taylor polynomial T_n of a chosen function f about a chosen centre a,
 * drawn with f. The coefficients come from exact formulas for each function's derivatives (no numerical
 * differentiation). For the functions whose series has a finite radius, the interval of convergence is
 * shaded. A probe point x0 shows f(x0), T_n(x0) and the error; inside the radius of convergence the error
 * is summed from the tail of the series, so that it stays accurate when it is far below rounding level. */
CalcWidgets.register('taylor-explorer', function (root, api) {
  var t = api.t, h = api.h, fmt = api.num.fmt
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
  var SUB = '₀₁₂₃₄₅₆₇₈₉'
  function sup(n) { return String(n).split('').map(function (c) { return SUP[c] }).join('') }
  function sub(n) { return String(n).split('').map(function (c) { return SUB[+c] }).join('') }
  function minus(s) { return String(s).replace(/-/g, '−') }
  // A number with at most 6 decimals, without floating-point noise (the centre and the endpoints).
  function num(v) { return minus(String(Math.round(v * 1e6) / 1e6)) }
  var FACT = [1]
  for (var i = 1; i <= 25; i++) FACT.push(FACT[i - 1] * i)
  // (1/2 choose k) for k = 0..20, as exact fractions [numerator, denominator]
  var HALF = [[1, 1], [1, 2], [-1, 8], [1, 16], [-5, 128], [7, 256], [-21, 1024], [33, 2048], [-429, 32768], [715, 65536],
    [-2431, 262144], [4199, 524288], [-29393, 4194304], [52003, 8388608], [-185725, 33554432], [334305, 67108864],
    [-9694845, 2147483648], [17678835, 4294967296], [-64822395, 17179869184], [119409675, 34359738368], [-883631595, 274877906944]]

  // Each function: f, the coefficient c_k of (x - a)^k from exact derivative formulas, the radius of
  // convergence, whether the series converges at the left and right ends, and how to show the terms at a = 0.
  var FUNCS = [
    { value: 'exp', label: 'eˣ', f: Math.exp, aMin: -3, aMax: 3, view: [-5, 5, -3, 12], x0: 1, entire: true,
      d: function (a, k) { return Math.exp(a) },                                   // f^(k)(a)
      rule: t('cₖ = eᵃ/k!, since every derivative of eˣ is eˣ', 'cₖ = eᵃ/k!，因为 eˣ 的各阶导数都是 eˣ'),
      term0: function (k) { return [1, k === 0 ? '1' : k === 1 ? 'x' : 'x' + sup(k) + '/' + k + '!'] } },
    { value: 'sin', label: 'sin x', f: Math.sin, aMin: -4, aMax: 4, view: [-10, 10, -3, 3], x0: 2, entire: true,
      d: function (a, k) { return [Math.sin(a), Math.cos(a), -Math.sin(a), -Math.cos(a)][k % 4] },
      rule: t('cₖ = sin⁽ᵏ⁾(a)/k!: the derivatives sin a, cos a, −sin a, −cos a repeat', 'cₖ = sin⁽ᵏ⁾(a)/k!：各阶导数 sin a、cos a、−sin a、−cos a 循环出现'),
      term0: function (k) { return k % 2 ? [(k - 1) / 2 % 2 ? -1 : 1, k === 1 ? 'x' : 'x' + sup(k) + '/' + k + '!'] : null } },
    { value: 'cos', label: 'cos x', f: Math.cos, aMin: -4, aMax: 4, view: [-10, 10, -3, 3], x0: 2, entire: true,
      d: function (a, k) { return [Math.cos(a), -Math.sin(a), -Math.cos(a), Math.sin(a)][k % 4] },
      rule: t('cₖ = cos⁽ᵏ⁾(a)/k!: the derivatives cos a, −sin a, −cos a, sin a repeat', 'cₖ = cos⁽ᵏ⁾(a)/k!：各阶导数 cos a、−sin a、−cos a、sin a 循环出现'),
      term0: function (k) { return k % 2 ? null : [k / 2 % 2 ? -1 : 1, k === 0 ? '1' : 'x' + sup(k) + '/' + k + '!'] } },
    { value: 'ln', label: 'ln(1 + x)', f: Math.log1p, aMin: -0.9, aMax: 2, view: [-1.6, 5.6, -3.5, 3], x0: 0.5,
      defined: function (x) { return x > -1 },
      R: function (a) { return 1 + a }, Rtext: function (a) { return a === 0 ? '1' : '1 + a = ' + num(1 + a) },
      ends: [false, true],
      // c_0 = ln(1 + a); c_k R^k = (-1)^(k-1)/k with R = 1 + a
      c0: function (a) { return Math.log1p(a) }, cR: function (a, k) { return (k % 2 ? 1 : -1) / k },
      rule: t('c₀ = ln(1 + a), cₖ = (−1)ᵏ⁻¹/(k(1 + a)ᵏ), from f⁽ᵏ⁾(x) = (−1)ᵏ⁻¹(k − 1)!/(1 + x)ᵏ', 'c₀ = ln(1 + a)，cₖ = (−1)ᵏ⁻¹/(k(1 + a)ᵏ)，由 f⁽ᵏ⁾(x) = (−1)ᵏ⁻¹(k − 1)!/(1 + x)ᵏ 得到'),
      term0: function (k) { return k === 0 ? null : [k % 2 ? 1 : -1, k === 1 ? 'x' : 'x' + sup(k) + '/' + k] } },
    { value: 'geo', label: '1/(1 − x)', f: function (x) { return 1 / (1 - x) }, aMin: -3, aMax: 0.8, view: [-4.5, 2.5, -3, 6], x0: 0.5,
      defined: function (x) { return x !== 1 }, breaks: [1],
      R: function (a) { return 1 - a }, Rtext: function (a) { return a === 0 ? '1' : '1 − a = ' + num(1 - a) },
      ends: [false, false],
      c0: function (a) { return 1 / (1 - a) }, cR: function (a, k) { return 1 / (1 - a) },
      rule: t('cₖ = 1/(1 − a)ᵏ⁺¹, from f⁽ᵏ⁾(x) = k!/(1 − x)ᵏ⁺¹', 'cₖ = 1/(1 − a)ᵏ⁺¹，由 f⁽ᵏ⁾(x) = k!/(1 − x)ᵏ⁺¹ 得到'),
      term0: function (k) { return [1, k === 0 ? '1' : k === 1 ? 'x' : 'x' + sup(k)] } },
    { value: 'atan', label: 'arctan x', f: Math.atan, aMin: -3, aMax: 3, view: [-6, 6, -2.5, 2.5], x0: 0.5,
      R: function (a) { return Math.sqrt(1 + a * a) },
      Rtext: function (a) { return a === 0 ? '1' : '√(1 + a²) ≈ ' + fmt(Math.sqrt(1 + a * a), 10) },
      ends: [true, true],
      // 1/(1 + x^2) = (1/(2i))(1/(x - i) - 1/(x + i)); about a its coefficients are (-1)^m sin((m+1)ψ)/R^(m+1),
      // with a + i = R e^(iψ); integrating, c_k R^k = (-1)^(k-1) sin(kψ)/k for k >= 1.
      c0: function (a) { return Math.atan(a) },
      cR: function (a, k) { var psi = Math.PI / 2 - Math.atan(a); return (k % 2 ? 1 : -1) * Math.sin(k * psi) / k },
      rule: t('c₀ = arctan a; for k ≥ 1, cₖ = (−1)ᵏ⁻¹ sin(kψ)/(k(1 + a²)ᵏᐟ²), where ψ = π/2 − arctan a, from (arctan x)′ = 1/(1 + x²)',
        'c₀ = arctan a；k ≥ 1 时 cₖ = (−1)ᵏ⁻¹ sin(kψ)/(k(1 + a²)ᵏᐟ²)，其中 ψ = π/2 − arctan a，由 (arctan x)′ = 1/(1 + x²) 得到'),
      term0: function (k) { return k % 2 ? [(k - 1) / 2 % 2 ? -1 : 1, k === 1 ? 'x' : 'x' + sup(k) + '/' + k] : null } },
    { value: 'sqrt', label: '√(1 + x)', f: function (x) { return Math.sqrt(1 + x) }, aMin: -0.9, aMax: 2.5, view: [-1.6, 6.6, -1.5, 3.5], x0: 0.5,
      defined: function (x) { return x >= -1 },
      R: function (a) { return 1 + a }, Rtext: function (a) { return a === 0 ? '1' : '1 + a = ' + num(1 + a) },
      ends: [true, true],
      c0: function (a) { return Math.sqrt(1 + a) },
      // c_k R^k = (1/2 choose k) √(1 + a), with R = 1 + a
      cR: null,
      rule: t('cₖ = (½ choose k)(1 + a)^(½ − k), from f⁽ᵏ⁾(x) = ½(½ − 1)⋯(½ − k + 1)(1 + x)^(½ − k)', 'cₖ = (½ 选 k)(1 + a)^(½ − k)，由 f⁽ᵏ⁾(x) = ½(½ − 1)⋯(½ − k + 1)(1 + x)^(½ − k) 得到'),
      term0: function (k) {
        var q = HALF[k], s = q[0] < 0 ? -1 : 1, p = Math.abs(q[0]), xs = k === 0 ? '' : k === 1 ? 'x' : 'x' + sup(k)
        if (k === 0) return [1, '1']
        return [s, (p === 1 ? xs : p + xs) + '/' + q[1]]
      } },
  ]
  function byValue(v) { return FUNCS.filter(function (q) { return q.value === v })[0] }

  var state = { fn: FUNCS[0], a: 0, n: 1, x0: 1 }

  // (1/2 choose k) as a number, for any k (by the recurrence C(k+1) = C(k)(1/2 - k)/(k + 1)).
  function half(k) { var c = 1; for (var j = 0; j < k; j++) c *= (0.5 - j) / (j + 1); return c }
  // The coefficient c_k of (x - a)^k, for k <= 20.
  function coef(F, a, k) {
    if (F.entire) return F.d(a, k) / FACT[k]
    if (k === 0) return F.c0(a)
    var R = F.R(a)
    if (F.value === 'sqrt') return half(k) * Math.sqrt(1 + a) / Math.pow(R, k)
    return F.cR(a, k) / Math.pow(R, k)
  }
  function coefs() {
    var out = []
    for (var k = 0; k <= state.n; k++) out.push(coef(state.fn, state.a, k))
    return out
  }
  function Tn(cs, x) {   // Horner's rule in powers of x - a
    var u = x - state.a, s = 0
    for (var k = cs.length - 1; k >= 0; k--) s = s * u + cs[k]
    return s
  }
  function fdefined(F, x) { return F.defined ? F.defined(x) : true }

  // The error f(x0) - T_n(x0) as the sum of the terms of the series after degree n, when that sum
  // converges fast; null otherwise (then the caller subtracts directly).
  function tail(F, a, n, hh) {
    if (hh === 0) return 0
    var S = 0, k
    if (F.entire) {
      var p = 1                                      // p = |h|^k/k!, kept with its sign
      for (k = 1; k <= n + 1; k++) p *= hh / k
      var dmax = Math.max(Math.abs(F.d(a, 0)), Math.abs(F.d(a, 1)))
      for (k = n + 1; k < n + 2000; k++) {
        S += F.d(a, k) * p
        if (k > 2 * Math.abs(hh) + 2 && Math.abs(p) * dmax <= 1e-18 * Math.abs(S)) break
        if (p === 0) break
        p *= hh / (k + 1)
      }
      return S
    }
    var R = F.R(a), q = hh / R
    if (Math.abs(q) > 0.9) return null
    var C = F.value === 'sqrt' ? half(n + 1) : 0
    for (k = n + 1; k < n + 4000; k++) {
      var c = F.value === 'sqrt' ? C * Math.sqrt(1 + a) : F.cR(a, k)
      var term = c * Math.pow(q, k)
      S += term
      if (Math.pow(Math.abs(q), k) / (1 - Math.abs(q)) <= 1e-18 * Math.abs(S)) break
      if (F.value === 'sqrt') C *= (0.5 - k) / (k + 1)
    }
    return S
  }

  // Where x0 lies: 'all' (infinite radius), 'inside', 'end-in', 'end-out', 'outside'.
  function where(F, a, x0) {
    if (F.entire) return 'all'
    var R = F.R(a), d = Math.abs(x0 - a)
    if (Math.abs(d - R) <= 1e-9) return F.ends[x0 < a ? 0 : 1] ? 'end-in' : 'end-out'
    return d < R ? 'inside' : 'outside'
  }

  // ---------------------------------------------------------------- the formula of T_n
  function polyText(cs) {
    var F = state.fn, a = state.a, n = state.n, terms = [], k
    var lead = 'T' + sub(n) + '(x) '
    if (a === 0) {
      for (k = 0; k <= n; k++) { var tk = F.term0(k); if (tk) terms.push(tk) }
      if (!terms.length) return lead + '= 0'
      var shown = terms.length <= 5 ? terms : terms.slice(0, 4).concat([null], terms.slice(-1))
      var s = ''
      shown.forEach(function (q, i) {
        if (q === null) s += ' + ⋯'
        else if (i === 0) s += (q[0] < 0 ? '−' : '') + q[1]
        else s += (q[0] < 0 ? ' − ' : ' + ') + q[1]
      })
      return lead + '= ' + s
    }
    var u = a > 0 ? '(x − ' + num(a) + ')' : '(x + ' + num(-a) + ')'
    var parts = []
    for (k = 0; k <= Math.min(n, 3); k++) {
      var c = cs[k]
      if (c === 0) continue
      var body = k === 0 ? fmt(Math.abs(c), 4) : (fmt(Math.abs(c), 4) + u + (k > 1 ? sup(k) : ''))
      parts.push((c < 0 ? (parts.length ? ' − ' : '−') : (parts.length ? ' + ' : '')) + body)
    }
    var out = lead + '≈ ' + (parts.join('') || '0')
    if (n > 3) out += ' + ⋯'
    return out
  }

  // ---------------------------------------------------------------- controls
  var sel = api.select({ label: t('Function f(x)', '函数 f(x)'), value: 'exp', options: FUNCS.map(function (q) { return { value: q.value, label: q.label } }),
    onchange: function (v) { setFunction(v) } })
  var A = api.slider({ label: t('Centre a', '中心 a'), min: -3, max: 3, step: 0.1, value: 0, fmt: function (v) { return fmt(v, 3) },
    oninput: function (v) { state.a = Math.round(v * 10) / 10; update() } })
  var N = api.slider({ label: t('Degree n', '次数 n'), min: 0, max: 20, step: 1, value: 1, fmt: function (v) { return String(Math.round(v)) },
    oninput: function (v) { state.n = Math.round(v); update() } })
  var X = api.slider({ label: t('Probe x₀', '观察点 x₀'), min: -5, max: 5, step: 0.05, value: 1, fmt: function (v) { return fmt(Math.round(v * 100) / 100, 4) },
    oninput: function (v) { state.x0 = Math.round(v * 100) / 100; update() } })
  A.el.classList.add('te-a'); N.el.classList.add('te-n'); X.el.classList.add('te-x0')

  function row(cls, label) {
    var k = h('span', { class: 'te-key' }, label), v = h('span', { class: 'te-val' })
    return { el: h('div', { class: 'te-row ' + cls }, k, v), k: k, v: v }
  }
  var Rw = {
    R: row('te-R', t('Radius of convergence R', '收敛半径 R')),
    I: row('te-I', t('Interval of convergence', '收敛区间')),
    f: row('te-f', 'f(x₀)'),
    T: row('te-T', 'Tₙ(x₀)'),
    err: row('te-err', t('Error f(x₀) − Tₙ(x₀)', '误差 f(x₀) − Tₙ(x₀)')),
  }
  var formula = h('div', { class: 'te-formula', 'aria-live': 'polite' })
  var rule = h('div', { class: 'te-rule' })
  var readout = h('div', { class: 'te-readout', 'aria-live': 'polite' }, Rw.R.el, Rw.I.el, Rw.f.el, Rw.T.el, Rw.err.el)
  var msg = h('p', { class: 'te-msg', 'aria-live': 'polite' })
  var plotBox = h('div', { class: 'te-plot' })

  root.appendChild(api.row(sel.el))
  root.appendChild(formula)
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'te-key-line' }, t('Blue: f. Orange: the Taylor polynomial Tₙ about the centre a (navy dot). Green band: the interval of convergence. Red: the error at x₀.',
    '蓝线：f。橙线：以 a 为中心（深蓝点）的泰勒多项式 Tₙ。绿色带：收敛区间。红线：x₀ 处的误差。')))
  root.appendChild(h('div', { class: 'te-controls' }, A.el, N.el, X.el))
  root.appendChild(readout)
  root.appendChild(msg)
  root.appendChild(rule)
  api.css('taylor-explorer', [
    '.te-formula{font:600 .95rem var(--font-mono);color:var(--orange);margin:.4rem 0 .5rem;overflow-wrap:anywhere;line-height:1.5}',
    '.te-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.35rem 1rem;margin:.5rem 0}',
    '.te-key-line{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.te-readout{font-family:var(--font-mono);font-size:.82rem;color:var(--navy);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.45rem .7rem;margin:.5rem 0}',
    '.te-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.1rem 1rem;padding:.15rem 0}',
    '.te-row+.te-row{border-top:1px solid var(--border)}',
    '.te-key{color:var(--slate)}',
    '.te-val{font-weight:600;overflow-wrap:anywhere}',
    '.te-msg{font-size:.85rem;color:var(--navy);margin:.3rem 0}',
    '.te-msg.te-bad{color:var(--red)}',
    '.te-msg:empty,.te-rule:empty{display:none}',
    '.te-rule{font-size:.8rem;color:var(--slate);margin:.3rem 0}',
  ].join(''))

  function setFunction(v) {
    var F = byValue(v)
    state.fn = F
    state.a = 0
    state.x0 = F.x0
    A.input.min = F.aMin; A.input.max = F.aMax; A.set(0)
    X.input.min = F.view[0]; X.input.max = F.view[1]; X.set(F.x0)
    update()
  }

  var P = api.plot(plotBox, {
    view: state.fn.view, aspect: 0.62, label: t('Graph of f and of its Taylor polynomial', 'f 及其泰勒多项式的图像'),
    draw: function (P) {
      var F = state.fn, a = state.a, v = P.view, cs = coefs()
      if (!F.entire) {
        var R = F.R(a), lo = a - R, hi = a + R
        var band = P.rect(Math.max(lo, v[0]), v[2], Math.min(hi, v[1]), v[3], { layer: 'back', fill: 'var(--green)', opacity: 0.12, color: 'none', width: 0 })
        band.setAttribute('class', 'te-band')
        band.setAttribute('data-lo', String(lo)); band.setAttribute('data-hi', String(hi))
        if (lo >= v[0]) P.line(lo, v[2], lo, v[3], { color: 'var(--green)', width: 1.2, dash: '5 4', layer: 'back' })
        if (hi <= v[1]) P.line(hi, v[2], hi, v[3], { color: 'var(--green)', width: 1.2, dash: '5 4', layer: 'back' })
      }
      P.axes()
      P.curve(F.f, { color: 'var(--blue)', width: 2.6, breaks: F.breaks })
      var tp = P.curve(function (x) { return Tn(cs, x) }, { color: 'var(--orange)', width: 2.2 })
      tp.setAttribute('class', 'te-poly')
      var x0 = state.x0, inView = function (x, y) { return x >= v[0] && x <= v[1] && y >= v[2] && y <= v[3] }
      var T0 = Tn(cs, x0), f0 = fdefined(F, x0) ? F.f(x0) : NaN
      if (isFinite(f0) && isFinite(T0)) {
        var yl = Math.max(Math.min(f0, T0), v[2]), yh = Math.min(Math.max(f0, T0), v[3])
        if (yl < yh) P.line(x0, yl, x0, yh, { color: 'var(--red)', width: 2, dash: '4 3' })
      }
      if (isFinite(f0) && inView(x0, f0)) P.point(x0, f0, { color: 'var(--blue)', r: 4.5 })
      if (inView(x0, T0)) P.point(x0, T0, { color: 'var(--orange)', r: 4.5 })
      var fa = F.f(a)
      if (inView(a, fa)) P.point(a, fa, { color: 'var(--navy)', r: 5.5 })
    },
  })

  function show(v, sig, keepTiny) { return isFinite(v) ? '≈ ' + fmt(v, sig || 10, keepTiny) : '—' }

  function update() {
    var F = state.fn, a = state.a, n = state.n, x0 = state.x0, cs = coefs()
    P.view = F.view.slice()
    formula.textContent = polyText(cs)
    rule.textContent = t('Coefficients: ', '系数：') + F.rule
    Rw.T.k.textContent = 'T' + sub(n) + '(x₀)'
    Rw.err.k.textContent = t('Error f(x₀) − T', '误差 f(x₀) − T') + sub(n) + '(x₀)'
    if (F.entire) { Rw.R.v.textContent = '∞'; Rw.I.v.textContent = t('all x', '全体实数 x') }
    else {
      Rw.R.v.textContent = '= ' + F.Rtext(a)
      var R = F.R(a)
      if (F.value === 'ln') Rw.I.v.textContent = '(−1, ' + num(2 * a + 1) + ']'
      else if (F.value === 'geo') Rw.I.v.textContent = '(' + num(2 * a - 1) + ', 1)'
      else if (F.value === 'sqrt') Rw.I.v.textContent = '[−1, ' + num(2 * a + 1) + ']'
      else Rw.I.v.textContent = a === 0 ? '[−1, 1]' : '≈ [' + fmt(a - R, 7) + ', ' + fmt(a + R, 7) + ']'
    }
    var T0 = Tn(cs, x0), w = where(F, a, x0)
    Rw.T.v.textContent = show(T0)
    msg.classList.remove('te-bad')
    if (!fdefined(F, x0)) {
      Rw.f.v.textContent = t('not defined', '无定义')
      Rw.err.v.textContent = '—'
      msg.textContent = t('f is not defined at x₀, although the polynomial Tₙ is: outside the interval of convergence the series says nothing about f.',
        'f 在 x₀ 处无定义，而多项式 Tₙ 有定义：在收敛区间之外，级数对 f 什么也说明不了。')
      msg.classList.add('te-bad')
    } else {
      var f0 = F.f(x0)
      Rw.f.v.textContent = show(f0)
      var e = (w === 'all' || w === 'inside') ? tail(F, a, n, x0 - a) : null
      if (e === null) e = f0 - T0
      Rw.err.v.textContent = e === 0 ? '= 0' : show(e, 7, true)
      if (x0 === a) msg.textContent = t('At the centre, Tₙ(a) = f(a) for every n.', '在中心处，对每个 n 都有 Tₙ(a) = f(a)。')
      else if (w === 'all') msg.textContent = t('This series converges to f(x) for every x: raise n and the error at any x₀ tends to 0.', '这个级数对每个 x 都收敛到 f(x)：增大 n，任意 x₀ 处的误差都趋于 0。')
      else if (w === 'inside') msg.textContent = t('x₀ is inside the interval of convergence: as n grows, the error tends to 0.', 'x₀ 在收敛区间之内：随着 n 增大，误差趋于 0。')
      else if (w === 'end-in') msg.textContent = t('x₀ is an end of the interval where the series converges, slowly, to f(x₀) (Abel\'s theorem).', 'x₀ 是收敛区间的端点，级数在这里缓慢地收敛到 f(x₀)（阿贝尔定理）。')
      else if (w === 'end-out') msg.textContent = t('x₀ is an end of the interval where the series diverges: its terms do not tend to 0.', 'x₀ 是收敛区间的端点，级数在这里发散：它的项不趋于 0。')
      else { msg.textContent = t('x₀ is outside the interval of convergence: as n grows, the error grows.', 'x₀ 在收敛区间之外：随着 n 增大，误差越来越大。'); msg.classList.add('te-bad') }
    }
    P.redraw()
  }
  setFunction('exp')
})
