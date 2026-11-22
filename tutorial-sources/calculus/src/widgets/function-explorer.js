/* function-explorer (Module 1): pick a function f and transform it into y = a·f(b(x − c)) + d.
 * The original graph stays visible (dashed) so that each slider's effect can be seen. */
CalcWidgets.register('function-explorer', function (root, api) {
  var t = api.t, h = api.h
  var FUNCS = [
    { value: 'sq', label: 'x²', text: 'x²', f: function (x) { return x * x }, view: [-6, 6, -4, 8] },
    { value: 'cube', label: 'x³', text: 'x³', f: function (x) { return x * x * x }, view: [-6, 6, -6, 6] },
    { value: 'sqrt', label: '√x', text: '√x', f: Math.sqrt, view: [-6, 8, -4, 6] },
    { value: 'recip', label: '1/x', text: '1/x', f: function (x) { return 1 / x }, view: [-6, 6, -5, 5] },
    { value: 'abs', label: '|x|', text: '|x|', f: Math.abs, view: [-6, 6, -4, 8] },
    { value: 'exp', label: 'eˣ', text: 'e^x', f: Math.exp, view: [-6, 6, -4, 8] },
    { value: 'ln', label: 'ln x', text: 'ln x', f: Math.log, view: [-6, 8, -5, 5] },
    { value: 'sin', label: 'sin x', text: 'sin x', f: Math.sin, view: [-7, 7, -4, 4] },
    { value: 'cos', label: 'cos x', text: 'cos x', f: Math.cos, view: [-7, 7, -4, 4] },
  ]
  var state = { fn: FUNCS[0], a: 1, b: 1, c: 0, d: 0 }

  function num(v) { return String(Math.round(v * 100) / 100).replace('-', '−') }
  // A stretch factor, exactly: as a decimal when two decimals hold it (1.5), else as a fraction with a
  // small denominator (1/0.75 = 4/3: the sliders move in steps of 0.25), else marked as approximate.
  function factor(v) {
    if (Math.abs(Math.round(v * 100) / 100 - v) < 1e-12) return num(v)
    for (var q = 2; q <= 12; q++) {
      var p = Math.round(v * q)
      if (Math.abs(v * q - p) < 1e-9) return p + '/' + q
    }
    return '≈ ' + num(v)
  }
  // The formula of a·f(b(x − c)) + d, leaving out what does nothing (a = 1, b = 1, c = 0, d = 0).
  function inner() {
    var b = state.b, c = state.c
    var shift = c === 0 ? 'x' : c > 0 ? 'x − ' + num(c) : 'x + ' + num(-c)
    if (b === 1) return shift
    var bs = b === -1 ? '−' : num(b)
    return c === 0 ? bs + 'x' : bs + '(' + shift + ')'
  }
  function formula() {
    var f = state.fn, arg = inner(), body
    if (f.value === 'sq') body = arg === 'x' ? 'x²' : '(' + arg + ')²'
    else if (f.value === 'cube') body = arg === 'x' ? 'x³' : '(' + arg + ')³'
    else if (f.value === 'sqrt') body = '√(' + arg + ')'
    else if (f.value === 'recip') body = '1/(' + arg + ')'
    else if (f.value === 'abs') body = '|' + arg + '|'
    else if (f.value === 'exp') body = 'e^(' + arg + ')'
    else body = f.text.split(' ')[0] + '(' + arg + ')'
    if (arg === 'x' && (f.value === 'sqrt' || f.value === 'recip' || f.value === 'exp' || f.value === 'ln' || f.value === 'sin' || f.value === 'cos')) body = f.text
    var a = state.a, s = a === 1 ? body : a === -1 ? '−' + body : num(a) + '·' + body
    if (state.d > 0) s += ' + ' + num(state.d)
    if (state.d < 0) s += ' − ' + num(-state.d)
    return 'y = ' + s
  }
  function describe() {
    var out = [], a = state.a, b = state.b, c = state.c, d = state.d
    // Factors are the geometric ones, at least 1: a = 0.5 squashes by a factor of 2, as b = 2 does.
    if (a < 0) out.push(t('reflected in the x-axis', '关于 x 轴翻折'))
    if (a === 0) out.push(t('flattened onto the x-axis', '压扁到 x 轴上'))
    else if (Math.abs(a) !== 1) out.push(Math.abs(a) > 1 ? t('stretched vertically by a factor of ' + factor(Math.abs(a)), '竖直方向拉伸为原来的 ' + factor(Math.abs(a)) + ' 倍') : t('squashed vertically by a factor of ' + factor(1 / Math.abs(a)), '竖直方向压缩为原来的 ' + factor(Math.abs(a)) + ' 倍'))
    if (b < 0) out.push(t('reflected in the y-axis', '关于 y 轴翻折'))
    if (Math.abs(b) !== 1) out.push(Math.abs(b) > 1 ? t('squashed horizontally by a factor of ' + factor(Math.abs(b)), '水平方向压缩为原来的 ' + factor(1 / Math.abs(b)) + ' 倍') : t('stretched horizontally by a factor of ' + factor(1 / Math.abs(b)), '水平方向拉伸为原来的 ' + factor(1 / Math.abs(b)) + ' 倍'))
    if (c !== 0) out.push(c > 0 ? t('shifted ' + num(c) + ' to the right', '向右平移 ' + num(c)) : t('shifted ' + num(-c) + ' to the left', '向左平移 ' + num(-c)))
    if (d !== 0) out.push(d > 0 ? t('shifted ' + num(d) + ' up', '向上平移 ' + num(d)) : t('shifted ' + num(-d) + ' down', '向下平移 ' + num(-d)))
    if (!out.length) return t('The graph of f itself: move a slider.', '这就是 f 本身的图像：拖动滑块试试。')
    return t('The graph of f, ', 'f 的图像') + out.join(t(', then ', '，然后')) + t('.', '。')
  }
  function g(x) { return state.a * state.fn.f(state.b * (x - state.c)) + state.d }

  var sel = api.select({ label: t('Function f(x)', '函数 f(x)'), value: 'sq', options: FUNCS.map(function (f) { return { value: f.value, label: f.label } }),
    onchange: function (v) { state.fn = FUNCS.filter(function (f) { return f.value === v })[0]; P.setView(state.fn.view); update() } })
  function mk(key, label, min, max, step) {
    return api.slider({ label: label, min: min, max: max, step: step, value: state[key], fmt: num,
      oninput: function (v) {
        if (key === 'b' && v === 0) { v = state.b > 0 ? -0.25 : 0.25; S.b.set(v) }
        state[key] = v; update()
      } })
  }
  var S = { a: mk('a', 'a', -3, 3, 0.25), b: mk('b', 'b', -3, 3, 0.25), c: mk('c', 'c', -5, 5, 0.25), d: mk('d', 'd', -5, 5, 0.25) }
  var formulaEl = h('div', { class: 'fe-formula' })
  var words = api.readout()
  var reset = api.button(t('Reset', '复位'), function () { ['a', 'b', 'c', 'd'].forEach(function (k) { state[k] = k === 'a' || k === 'b' ? 1 : 0; S[k].set(state[k]) }); update() })
  var plotBox = h('div', { class: 'fe-plot' })
  root.appendChild(api.row(sel.el, reset))
  root.appendChild(formulaEl)
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'fe-key' }, t('Dashed: the graph of y = f(x). Solid: the transformed graph.', '虚线：y = f(x) 的图像。实线：变换后的图像。')))
  root.appendChild(h('div', { class: 'fe-sliders' }, S.a.el, S.b.el, S.c.el, S.d.el))
  root.appendChild(words)
  api.css('function-explorer', [
    '.fe-formula{font:600 1.05rem var(--font-mono);color:var(--blue);margin:.4rem 0 .5rem;overflow-x:auto;white-space:nowrap}',
    '.fe-sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.35rem 1rem;margin:.5rem 0}',
    '.fe-key{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
  ].join(''))
  var P = api.plot(plotBox, {
    view: state.fn.view, aspect: 0.6, label: t('Graph of f and of the transformed function', 'f 与变换后函数的图像'),
    draw: function (P) {
      P.axes()
      P.curve(state.fn.f, { color: 'var(--muted)', width: 2, dash: true })
      P.curve(g, { color: 'var(--blue)', width: 2.6 })
    },
  })
  function update() { formulaEl.textContent = formula(); words.textContent = describe(); P.redraw() }
  update()
})
