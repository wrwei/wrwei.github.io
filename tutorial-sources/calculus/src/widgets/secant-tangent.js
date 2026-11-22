/* secant-tangent (Module 4): the secant through (a, f(a)) and (a + h, f(a + h)) turns into the tangent at a
 * as h shrinks. The readout compares the difference quotient with f′(a), exact for the built-in functions
 * and estimated (≈) for a function the reader types. */
CalcWidgets.register('secant-tangent', function (root, api) {
  var t = api.t, h = api.h, fmt = api.num.fmt
  var SQRT_NOTE = t('No derivative at 0: √x is not defined to the left of 0, and from the right the difference quotient 1/√h grows without bound. The graph is vertical there (dashed).',
    '在 0 处没有导数：√x 在 0 的左边没有定义；从右边看，差商 1/√h 无限增大。图像在这里是竖直的（虚线）。')
  // Built-in functions: the difference quotient in a form that does not lose digits, and the exact derivative.
  var FUNCS = [
    { value: 'sq', label: 'x²', f: function (x) { return x * x }, view: [-3.3, 3.3, -1.5, 9.5], range: [-2, 2],
      dq: function (a, d) { return 2 * a + d }, der: function (a) { return 2 * a }, dtext: '2a' },
    { value: 'cube', label: 'x³', f: function (x) { return x * x * x }, view: [-2.6, 2.6, -10, 10], range: [-1.5, 1.5],
      dq: function (a, d) { return 3 * a * a + 3 * a * d + d * d }, der: function (a) { return 3 * a * a }, dtext: '3a²' },
    { value: 'sqrt', label: '√x', f: Math.sqrt, view: [-0.7, 5.5, -0.9, 2.8], range: [0, 4],
      dq: function (a, d) { return 1 / (Math.sqrt(a + d) + Math.sqrt(a)) }, der: function (a) { return a > 0 ? 1 / (2 * Math.sqrt(a)) : NaN }, dtext: '1/(2√a)' },
    { value: 'sin', label: 'sin x', f: Math.sin, view: [-4.4, 4.4, -1.9, 1.9], range: [-3, 3],
      dq: function (a, d) { return 2 * Math.cos(a + d / 2) * Math.sin(d / 2) / d }, der: Math.cos, dtext: 'cos a',
      note: t('The formula f′(a) = cos a is proved in Module 5.', 'f′(a) = cos a 这个公式将在模块 5 中证明。') },
    { value: 'exp', label: 'eˣ', f: Math.exp, view: [-3.3, 3.3, -1, 9], range: [-2, 2],
      dq: function (a, d) { return Math.exp(a) * Math.expm1(d) / d }, der: Math.exp, dtext: 'eᵃ',
      note: t('The formula f′(a) = eᵃ is proved in Module 6.', 'f′(a) = eᵃ 这个公式将在模块 6 中证明。') },
    { value: 'custom', label: t('type your own', '自己输入'), range: [-3, 3] },
  ]
  var HMIN = 0.001
  var state = { fn: FUNCS[0], typed: null, a: 1, habs: 1, sign: 1 }

  function num(v, sig) { return fmt(v, sig || 7) }
  // "= 2.5" when the decimal shown is the value itself, "≈ 2.001953" when it is rounded.
  function show(v, approx) {
    if (!isFinite(v)) return '—'
    var r = Number(v.toPrecision(7))
    var exact = !approx && Math.abs(r - v) <= 1e-12 * Math.abs(v)
    return (exact ? '= ' : '≈ ') + num(v)
  }
  function hval() { return state.sign * state.habs }
  function fcur() { return state.fn.value === 'custom' ? (state.typed && state.typed.f) : state.fn.f }
  function safe(f, x) { try { var y = f(x); return typeof y === 'number' ? y : NaN } catch (e) { return NaN } }

  // A typed function: one-sided quotients at two small steps tell a derivative from a corner or a blow-up.
  function numericDerivative(f, a) {
    var d = 1e-6 * (1 + Math.abs(a)), fa = safe(f, a)
    var R1 = (safe(f, a + d) - fa) / d, L1 = (fa - safe(f, a - d)) / d
    var R2 = (safe(f, a + d / 100) - fa) / (d / 100), L2 = (fa - safe(f, a - d / 100)) / (d / 100)
    if (![R1, L1, R2, L2].every(isFinite)) return { kind: 'sides' }
    var big = Math.max(Math.abs(R2), Math.abs(L2))
    if (big > 50 && (Math.abs(R2 - R1) > 0.5 * Math.abs(R1) || Math.abs(L2 - L1) > 0.5 * Math.abs(L1))) return { kind: 'grows' }
    if (Math.abs(R2 - L2) > 1e-3 * (1 + Math.abs(R2) + Math.abs(L2))) return { kind: 'corner', L: L2, R: R2 }
    return { kind: 'ok', d: api.num.deriv(f, a) }
  }

  // Everything the plot and the readout need, for the current settings.
  function compute() {
    var f = fcur(), a = state.a, d = hval(), out = { a: a, h: d }
    if (!f) { out.msg = t('Correct the formula above to see its secant and tangent.', '请先改正上面的公式，才能看到割线与切线。'); return out }
    out.fa = safe(f, a)
    out.fah = safe(f, a + d)
    if (!isFinite(out.fa)) { out.msg = t('f(a) is not defined: move a.', 'f(a) 没有定义：请移动 a。'); return out }
    var builtin = state.fn.value !== 'custom'
    if (!isFinite(out.fah)) out.msg = t('a + h is outside the domain of f, so this secant does not exist: change h or its sign.', 'a + h 不在 f 的定义域内，这条割线不存在：请改变 h 或它的符号。')
    else out.dq = builtin ? state.fn.dq(a, d) : (out.fah - out.fa) / d
    if (builtin) {
      out.der = state.fn.der(a)
      if (!isFinite(out.der)) { out.none = true; out.vertical = true; out.msg = SQRT_NOTE }
      else { out.dtext = state.fn.dtext; out.note = state.fn.note }
    } else {
      var nd = numericDerivative(f, a)
      // A central difference is good to about 10⁻⁹ here (Section 4.7): keep 8 decimals, so that 0 shows as 0.
      if (nd.kind === 'ok') { out.der = Math.round(nd.d * 1e8) / 1e8; out.approx = true; out.note = t('f′(a) is estimated with a central difference, step 10⁻⁵(1 + |a|) (Section 4.7).', 'f′(a) 由中心差分估计，步长为 10⁻⁵(1 + |a|)（见第 4.7 节）。') }
      else {
        out.none = true
        if (nd.kind === 'corner') out.msg = t('f seems to have no derivative at a: the slopes from the left (≈ ' + num(nd.L, 4) + ') and from the right (≈ ' + num(nd.R, 4) + ') differ.',
          'f 在 a 处似乎没有导数：左侧斜率（≈ ' + num(nd.L, 4) + '）与右侧斜率（≈ ' + num(nd.R, 4) + '）不同。')
        else if (nd.kind === 'grows') out.msg = t('f seems to have no derivative at a: the difference quotients grow without bound as h shrinks.', 'f 在 a 处似乎没有导数：h 缩小时差商无限增大。')
        else out.msg = t('f is not defined on both sides of a, so f′(a) is not defined.', 'f 在 a 的两侧并非都有定义，所以 f′(a) 没有定义。')
      }
    }
    return out
  }

  // ---------------------------------------------------------------- controls
  var sel = api.select({ label: t('Function f(x)', '函数 f(x)'), value: 'sq', options: FUNCS.map(function (q) { return { value: q.value, label: q.label } }),
    onchange: function (v) { setFunction(v) } })
  var field = api.field({ label: t('Your f(x)', '你的 f(x)'), value: 'x^3 - 3x', placeholder: 'x^3 - 3x', onchange: function (src) { readTyped(src); update() } })
  field.el.classList.add('st-field')
  field.el.hidden = true
  var A = api.slider({ label: 'a', min: -2, max: 2, step: 0.1, value: state.a, fmt: function (v) { return fmt(v, 3) },
    oninput: function (v) { state.a = Math.round(v * 10) / 10; update() } })
  var H = api.slider({ label: '|h|', min: -3, max: 0, step: 0.05, value: 0,
    oninput: function (v) { state.habs = Number(Math.pow(10, v).toPrecision(3)); update() } })
  var signSel = api.select({ label: t('Sign of h', 'h 的符号'), value: '+', options: [{ value: '+', label: 'h > 0' }, { value: '-', label: 'h < 0' }],
    onchange: function (v) { state.sign = v === '-' ? -1 : 1; update() } })
  var halve = api.button(t('Halve h', 'h 减半'), function () {
    if (state.habs / 2 < HMIN - 1e-12) return
    state.habs = state.habs / 2
    H.set(Math.log10(state.habs))
    update()
  }, { primary: true })
  var hOut = H.el.querySelector('output')
  A.el.classList.add('st-a'); H.el.classList.add('st-h')

  function row(cls, label) {
    var v = h('span', { class: 'st-val' })
    return { el: h('div', { class: 'st-row ' + cls }, h('span', { class: 'st-key' }, label), v), v: v }
  }
  var R = {
    h: row('st-hval', t('Step h', '步长 h')),
    dq: row('st-dq', t('Difference quotient [f(a + h) − f(a)]/h', '差商 [f(a + h) − f(a)]/h')),
    der: row('st-der', t('Derivative f′(a)', '导数 f′(a)')),
    gap: row('st-gap', t('Quotient − derivative', '差商 − 导数')),
  }
  var readout = h('div', { class: 'st-readout', 'aria-live': 'polite' }, R.h.el, R.dq.el, R.der.el, R.gap.el)
  var msg = h('p', { class: 'st-msg', 'aria-live': 'polite' })
  var note = h('p', { class: 'st-note' })
  var plotBox = h('div', { class: 'st-plot' })

  root.appendChild(api.row(sel.el, field.el))
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'st-key-line' }, t('Purple: the secant through (a, f(a)) and (a + h, f(a + h)); dotted: its run h and rise f(a + h) − f(a). Dashed orange: the tangent at a.',
    '紫线：过 (a, f(a)) 与 (a + h, f(a + h)) 的割线；点线：水平增量 h 与竖直增量 f(a + h) − f(a)。橙色虚线：a 处的切线。')))
  root.appendChild(h('div', { class: 'st-controls' }, A.el, H.el))
  root.appendChild(api.row(signSel.el, halve))
  root.appendChild(readout)
  root.appendChild(msg)
  root.appendChild(note)
  api.css('secant-tangent', [
    '.st-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.35rem 1rem;margin:.5rem 0}',
    '.st-key-line{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.st-readout{font-family:var(--font-mono);font-size:.82rem;color:var(--navy);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.45rem .7rem;margin:.5rem 0}',
    '.st-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.1rem 1rem;padding:.15rem 0}',
    '.st-row+.st-row{border-top:1px solid var(--border)}',
    '.st-key{color:var(--slate)}',
    '.st-val{font-weight:600;white-space:nowrap}',
    '.st-msg{font-size:.85rem;color:var(--orange);margin:.3rem 0;min-height:0}',
    '.st-msg:empty,.st-note:empty{display:none}',
    '.st-note{font-size:.8rem;color:var(--slate);margin:.3rem 0}',
    '.st-field .cw-input{min-width:9em}',
    '.st-field[hidden]{display:none}',
  ].join(''))

  function setFunction(v) {
    state.fn = FUNCS.filter(function (q) { return q.value === v })[0]
    field.el.hidden = v !== 'custom'
    if (v === 'custom') readTyped(field.get())
    var r = state.fn.range
    A.input.min = r[0]; A.input.max = r[1]
    state.a = Math.min(r[1], Math.max(r[0], state.a))
    A.set(state.a)
    update()
  }
  function readTyped(src) {
    var p = api.Expr.parse(src, ['x'])
    if (p.ok) { state.typed = p; field.error('') } else { state.typed = null; field.error(p.error) }
  }
  // The view for a typed function: x from −4.4 to 4.4, y from its values there (cut off at ±12).
  function typedView() {
    var f = fcur(), ys = []
    if (f) for (var i = 0; i <= 240; i++) { var y = safe(f, -4.4 + 8.8 * i / 240); if (isFinite(y)) ys.push(y) }
    if (!ys.length) return [-4.4, 4.4, -5, 5]
    var lo = Math.max(-12, Math.min.apply(null, ys)), hi = Math.min(12, Math.max.apply(null, ys))
    if (lo > 0 && lo < 0.6 * (hi - lo)) lo = 0
    if (hi < 0 && -hi < 0.6 * (hi - lo)) hi = 0
    if (hi - lo < 2) { var mid = (hi + lo) / 2; lo = mid - 1; hi = mid + 1 }
    var pad = 0.1 * (hi - lo)
    return [-4.4, 4.4, lo - pad, hi + pad]
  }

  var P = api.plot(plotBox, {
    view: state.fn.view, aspect: 0.62, label: t('Graph of f with a secant line and the tangent line at a', 'f 的图像，以及割线和 a 处的切线'),
    draw: function (P) {
      var c = compute(), f = fcur(), v = P.view
      P.axes()
      if (!f) return
      P.curve(f, { color: 'var(--blue)', width: 2.6 })
      if (!isFinite(c.fa)) return
      var inView = function (x, y) { return x >= v[0] && x <= v[1] && y >= v[2] && y <= v[3] }
      if (isFinite(c.dq)) {
        var run = P.line(c.a, c.fa, c.a + c.h, c.fa, { color: 'var(--slate)', width: 1.2, dash: '3 3' })
        var rise = P.line(c.a + c.h, c.fa, c.a + c.h, c.fah, { color: 'var(--slate)', width: 1.2, dash: '3 3' })
        run.setAttribute('class', 'st-run'); rise.setAttribute('class', 'st-rise')
        var sec = P.infline(c.a, c.fa, c.dq, { color: 'var(--purple)', width: 2.2 })
        sec.setAttribute('class', 'st-secant')
        sec.setAttribute('data-slope', String(c.dq))
      }
      var tan = null
      if (c.vertical) tan = P.vline(c.a, { color: 'var(--orange)', width: 2.2, dash: '7 5' })
      else if (isFinite(c.der)) tan = P.infline(c.a, c.fa, c.der, { color: 'var(--orange)', width: 2.2, dash: '7 5' })
      if (tan) { tan.setAttribute('class', 'st-tangent'); tan.setAttribute('data-slope', c.vertical ? 'vertical' : String(c.der)) }
      if (isFinite(c.dq) && inView(c.a + c.h, c.fah)) P.point(c.a + c.h, c.fah, { color: 'var(--purple)', r: 5 })
      if (inView(c.a, c.fa)) P.point(c.a, c.fa, { color: 'var(--navy)', r: 5.5 })
    },
  })

  function update() {
    if (state.fn.value === 'custom') P.view = typedView()
    else P.view = state.fn.view.slice()
    var c = compute()
    hOut.textContent = fmt(state.habs, 10)
    R.h.v.textContent = show(hval())
    halve.disabled = state.habs / 2 < HMIN - 1e-12
    R.dq.v.textContent = show(c.dq)
    if (c.none) R.der.v.textContent = t('does not exist', '不存在')
    else if (!isFinite(c.der)) R.der.v.textContent = '—'
    else if (c.approx) R.der.v.textContent = show(c.der, true) + t(' (numerical)', '（数值估计）')
    else R.der.v.textContent = '= ' + c.dtext + ' ' + show(c.der)
    var gap = c.dq - c.der
    if (c.approx && isFinite(gap) && Math.abs(gap) < 1e-8 * (1 + Math.abs(c.der))) R.gap.v.textContent = '≈ 0'
    else R.gap.v.textContent = isFinite(gap) && !c.none ? show(gap, c.approx) : '—'
    msg.textContent = c.msg || ''
    note.textContent = c.note || ''
    P.redraw()
  }
  update()
})
