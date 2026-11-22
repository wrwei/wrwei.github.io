/* exp-slope (Module 6): change the base a of y = aˣ until its slope at x = 0 is 1, and so find e.
 * The slopes are estimated with a central difference quotient (shown with ≈); ln a appears only when
 * the reader asks for it. "Show e" sets a = e, where the slope at 0 is exactly 1 by the definition of e. */
CalcWidgets.register('exp-slope', function (root, api) {
  var t = api.t, h = api.h
  var MIN = 1.5, MAX = 4, H = 1e-5
  var state = { a: 2, isE: false, showLn: false }

  // Central difference quotient of aˣ at x: (a^(x+H) − a^(x−H)) / (2H).
  function slope(a, x) { return (Math.pow(a, x + H) - Math.pow(a, x - H)) / (2 * H) }
  function dec(v, k) { return v.toFixed(k).replace('-', '−') }
  function showA(v) { return String(Number(v.toFixed(6))) }      // 2, 2.5, 2.718, 2.71828

  var sl = api.slider({ label: t('Base a', '底数 a'), min: MIN, max: MAX, step: 0.001, value: state.a, fmt: showA,
    oninput: function (v) { state.a = v; state.isE = false; field.set(''); field.error(''); update() } })
  var outEl = sl.el.querySelector('output')
  var field = api.field({ label: t('or type a value of a', '或输入 a 的值'), placeholder: t('e.g. 2.7', '例如 2.7'), size: 9,
    onchange: function (src) {
      if (!String(src).trim()) { field.error(''); return }
      var p = api.Expr.parse(src, [])
      if (!p.ok) { field.error(p.error); return }
      var v = p.f()
      if (!isFinite(v) || v < MIN || v > MAX) { field.error(t('Type a number from 1.5 to 4', '请输入 1.5 到 4 之间的数')); return }
      field.error('')
      setBase(v, v === Math.E)
    } })
  var lnBtn = api.button(t('Show ln a', '显示 ln a'), function () { state.showLn = !state.showLn; update() })
  var eBtn = api.button(t('Show e', '显示 e'), function () {
    state.showLn = true; field.set('e'); field.error(''); setBase(Math.E, true)
  }, { primary: true })

  function setBase(v, isE) {
    state.a = v; state.isE = isE
    sl.set(v)                                   // the slider moves to the nearest step of 0.001
    outEl.textContent = isE ? 'e' : showA(v)    // but shows the base itself
    update()
  }

  var words = api.readout()
  var plotBox = h('div', { class: 'es-plot' })
  root.appendChild(h('div', { class: 'es-slider' }, sl.el))
  root.appendChild(api.row(field.el, lnBtn, eBtn))
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'es-key' }, t(
    'Blue: y = aˣ. Orange: its tangent line at x = 0. Dashed: the line y = 1 + x, of slope 1. Green: the tangent line at x = 1. ' +
    'The slopes are estimated with the central difference quotient, h = 0.00001.',
    '蓝色：y = aˣ。橙色：它在 x = 0 处的切线。虚线：斜率为 1 的直线 y = 1 + x。绿色：x = 1 处的切线。斜率用中心差商估计，h = 0.00001。')))
  root.appendChild(words)
  api.css('exp-slope', [
    '.es-slider .cw-slider{width:100%}',
    '.es-slider .cw-slider input[type=range]{flex:1 1 160px}',
    '.es-key{font-size:.8rem;color:var(--slate);margin:.3rem 0}',
  ].join(''))

  var P = api.plot(plotBox, {
    view: [-2.2, 2.2, -0.8, 4.6], aspect: 0.62,
    label: t('Graph of y = aˣ with its tangent lines at x = 0 and at x = 1', 'y = aˣ 的图像及其在 x = 0 和 x = 1 处的切线'),
    draw: function (P) {
      var a = state.a, m0 = slope(a, 0), m1 = slope(a, 1)
      P.axes()
      P.infline(0, 1, 1, { color: 'var(--muted)', dash: true, width: 1.6 })
      P.curve(function (x) { return Math.pow(a, x) }, { color: 'var(--blue)', width: 2.6 })
      P.infline(0, 1, m0, { color: 'var(--orange)', width: 2.2 })
      P.line(0.4, a - 0.6 * m1, 1.6, a + 0.6 * m1, { color: 'var(--green)', width: 2.2 })
      P.point(0, 1, { color: 'var(--orange)' })
      P.point(1, a, { color: 'var(--green)' })
      P.text(-2.1, 4.25, state.isE ? 'y = eˣ' : 'y = aˣ', { color: 'var(--blue)', bold: true })
    },
  })

  function update() {
    var a = state.a, m0 = slope(a, 0), m1 = slope(a, 1), lines = []
    if (state.isE) {
      lines.push('a = e ≈ ' + dec(Math.E, 6))
      lines.push(t('slope of y = eˣ at x = 0 = 1 exactly: that is the definition of e (the difference quotient gives ≈ ',
        'y = eˣ 在 x = 0 处的斜率恰好是 1：这正是 e 的定义（差商给出 ≈ ') + dec(m0, 5) + t(')', '）'))
      lines.push(t('slope at x = 1 = e × (slope at 0) = e ≈ ', '在 x = 1 处的斜率 = e × (x = 0 处的斜率) = e ≈ ') + dec(Math.E, 5))
      lines.push(t('ln e = 1: for every base a, the slope at 0 is ln a.', 'ln e = 1：对每个底数 a，x = 0 处的斜率都等于 ln a。'))
    } else {
      lines.push('a = ' + showA(a))
      lines.push(t('slope of y = aˣ at x = 0 ≈ ', 'y = aˣ 在 x = 0 处的斜率 ≈ ') + dec(m0, 5))
      lines.push(t('slope at x = 1 ≈ ', '在 x = 1 处的斜率 ≈ ') + dec(m1, 5) + t(';  a¹ × (slope at 0) ≈ ', '；a¹ × (x = 0 处的斜率) ≈ ') + dec(a * m0, 5))
      if (Math.abs(m0 - 1) < 0.001) lines.push(t('The slope at 0 is within 0.001 of 1: this base is close to e. Press “Show e”.',
        'x = 0 处的斜率与 1 相差不到 0.001：这个底数已接近 e。点击“显示 e”。'))
      else if (m0 < 1) lines.push(t('The slope at 0 is less than 1: make a larger.', 'x = 0 处的斜率小于 1：把 a 调大。'))
      else lines.push(t('The slope at 0 is greater than 1: make a smaller.', 'x = 0 处的斜率大于 1：把 a 调小。'))
      if (state.showLn) lines.push(t('ln a ≈ ', 'ln a ≈ ') + dec(Math.log(a), 5) + t(': the same number as the slope at 0.', '：与 x = 0 处的斜率相同。'))
    }
    words.textContent = lines.join('\n')
    lnBtn.textContent = state.showLn ? t('Hide ln a', '隐藏 ln a') : t('Show ln a', '显示 ln a')
    P.redraw()
  }
  update()
})
