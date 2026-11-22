/* limit-explorer (Module 2): the ε–δ game. Pick a function and its point a; the slider ε draws the band
 * L − ε < y < L + ε and the slider δ the strip a − δ < x < a + δ. The widget samples the graph at 4000
 * points x with 0 < |x − a| < δ (none at a itself), says whether every value lies in the band, and names the
 * sampled point that lies farthest outside it when one does not. For the two functions with no limit at 0
 * the reader tries candidate values of L; the readout says for which ε no δ can win, and why. */
CalcWidgets.register('limit-explorer', function (root, api) {
  var t = api.t, h = api.h, fmt = api.num.fmt
  // The values the ε and δ sliders step through (exact decimals, so every number shown is exact).
  var VALUES = [0.001, 0.002, 0.005, 0.01, 0.02, 0.03, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.5, 2]
  var PER_SIDE = 2000              // sample points on each side of a
  var ZOOM_MIN = 0.25, ZOOM_MAX = 256
  var FUNCS = [
    { value: 'hole', label: t('(x² − 1)/(x − 1), a = 1', '(x² − 1)/(x − 1)，a = 1'), text: '(x² − 1)/(x − 1)',
      a: 1, L: 2, wx: 2, wy: 2, holes: [[1, 2]], f: function (x) { return (x * x - 1) / (x - 1) } },
    { value: 'sinc', label: t('sin(x)/x, a = 0', 'sin(x)/x，a = 0'), text: 'sin(x)/x',
      a: 0, L: 1, wx: 10, wy: 1.5, holes: [[0, 1]], f: function (x) { return Math.sin(x) / x } },
    { value: 'xsin', label: t('x·sin(1/x), a = 0', 'x·sin(1/x)，a = 0'), text: 'x·sin(1/x)',
      a: 0, L: 0, wx: 0.5, wy: 0.5, holes: [[0, 0]], dense: true, guides: true, f: function (x) { return x * Math.sin(1 / x) } },
    { value: 'jump', label: t('|x|/x, a = 0 (a jump)', '|x|/x，a = 0（跳跃）'), text: '|x|/x',
      a: 0, L: null, cands: [-1, 0, 1], cand: 1, wx: 2, wy: 2.5, holes: [[0, -1], [0, 1]], breaks: [0], f: function (x) { return Math.abs(x) / x } },
    { value: 'osc', label: t('sin(1/x), a = 0 (oscillates)', 'sin(1/x)，a = 0（振荡）'), text: 'sin(1/x)',
      a: 0, L: null, cands: [-1, -0.5, 0, 0.5, 1], cand: 0, wx: 0.5, wy: 1.5, holes: [], dense: true, f: function (x) { return Math.sin(1 / x) } },
  ]
  var state = { fn: FUNCS[0], iE: VALUES.indexOf(0.5), iD: VALUES.indexOf(1), zoom: 1 }

  function dec(v) { return String(Number(v.toPrecision(12))).replace('-', '−') }   // an exact short decimal
  // Never broken across lines: no-break spaces, and a word joiner after each bar (a line may break after "|").
  function nb(s) { return s.replace(/ /g, '\u00a0').replace(/\|/g, '|\u2060') }
  function curL() { return state.fn.L !== null ? state.fn.L : state.fn.cand }
  function view() {
    var F = state.fn, L = curL(), z = state.zoom
    return [F.a - F.wx / z, F.a + F.wx / z, L - F.wy / z, L + F.wy / z]
  }
  function xcond(d) { return nb(state.fn.a === 0 ? '0 < |x| < ' + d : '0 < |x − ' + dec(state.fn.a) + '| < ' + d) }

  // sin(1/x) is exactly 1 at x = 2/((4k + 1)π) and exactly −1 at x = 2/((4k + 3)π). The largest such points
  // inside (0, δ), and their mirror images, are tested as well as the samples: samples rarely land on a peak.
  function peak(d, r) {
    var k = Math.max(0, Math.floor((2 / (Math.PI * d) - r) / 4))
    while (2 / ((4 * k + r) * Math.PI) >= d) k++
    return 2 / ((4 * k + r) * Math.PI)
  }
  FUNCS[4].peaks = function (d) { var p = peak(d, 1), q = peak(d, 3); return [p, q, -p, -q] }

  // Test the graph over 0 < |x − a| < δ: the tested point farthest outside the band, or null. The band is open,
  // so a value within rounding error (10⁻¹²) of its edge counts as outside. Among points equally far outside
  // (all of one side, for |x|/x), the one nearest the middle of its half of the strip is kept, so that its dot
  // does not hide behind the y-axis.
  function test() {
    var F = state.fn, L = curL(), eps = VALUES[state.iE], d = VALUES[state.iD], worst = null, n = 0
    function look(x) {
      var y = F.f(x)
      if (!isFinite(y)) return false
      var dev = Math.abs(y - L)
      if (dev < eps - 1e-12) return true
      var mid = Math.abs(Math.abs(x - F.a) - d / 2)
      if (!worst || dev > worst.dev + 1e-12 || (dev > worst.dev - 1e-12 && mid < worst.mid)) worst = { x: x, y: y, dev: dev, mid: mid }
      return true
    }
    for (var side = -1; side <= 1; side += 2) {
      for (var i = 1; i <= PER_SIDE; i++) if (look(F.a + side * d * (i - 0.5) / PER_SIDE)) n++
    }
    if (F.peaks) F.peaks(d).forEach(look)
    return { n: n, worst: worst }
  }

  // ------------------------------------------------------------------ controls
  var sel = api.select({ label: t('Function', '函数'), value: 'hole',
    options: FUNCS.map(function (F) { return { value: F.value, label: F.label } }),
    onchange: function (v) { state.fn = FUNCS.filter(function (F) { return F.value === v })[0]; state.zoom = 1; fillCands(); update() } })
  var candSel = api.select({ label: t('Candidate L', '候选的 L'), value: '', options: [],
    onchange: function (v) { state.fn.cand = Number(v); update() } })
  function fillCands() {
    var F = state.fn, s = candSel.input
    while (s.firstChild) s.removeChild(s.firstChild)
    candSel.el.style.display = F.L === null ? '' : 'none'
    if (F.L !== null) return
    F.cands.forEach(function (c) { s.appendChild(h('option', { value: String(c), selected: c === F.cand }, dec(c))) })
    s.value = String(F.cand)
  }
  function mk(key, label) {
    return api.slider({ label: label, min: 0, max: VALUES.length - 1, step: 1, value: state[key],
      fmt: function (i) { return String(VALUES[i]) }, oninput: function (i) { state[key] = i; update() } })
  }
  var sE = mk('iE', 'ε'), sD = mk('iD', 'δ')
  var zoomOut = h('span', { class: 'le-zoom', 'aria-live': 'polite' })
  function zoomBy(k) { state.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, state.zoom * k)); update() }
  var bIn = api.button(t('Zoom in', '放大'), function () { zoomBy(2) })
  var bOut = api.button(t('Zoom out', '缩小'), function () { zoomBy(0.5) })
  var bReset = api.button(t('Reset view', '复原视图'), function () { state.zoom = 1; update() })
  var formulaEl = h('div', { class: 'le-formula' })
  var plotBox = h('div', { class: 'le-plot' })
  var words = api.readout()

  var topRow = api.row(sel.el, candSel.el)
  topRow.classList.add('le-top')
  root.appendChild(topRow)
  root.appendChild(formulaEl)
  root.appendChild(plotBox)
  root.appendChild(h('div', { class: 'le-key' }, t(
    'Orange band: L − ε < y < L + ε. Green strip: a − δ < x < a + δ. Over the strip the graph is green where it stays in the band and red where it escapes; the red dot is the sampled point farthest outside.',
    '橙色带：L − ε < y < L + ε。绿色带：a − δ < x < a + δ。在绿色带上方，图像留在橙色带内的部分画成绿色，跑出去的部分画成红色；红点是采样点中离橙色带最远的一个。')))
  root.appendChild(h('div', { class: 'le-sliders' }, sE.el, sD.el))
  root.appendChild(api.row(bIn, bOut, bReset, zoomOut))
  root.appendChild(words)
  api.css('limit-explorer', [
    '.le-formula{font:600 1rem var(--font-mono);color:var(--blue);margin:.4rem 0 .5rem}',
    '.le-top .cw-field{min-width:0;max-width:100%}',
    '.le-top .cw-select{min-width:0;max-width:100%}',
    '.le-key{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.le-sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.35rem 1rem;margin:.5rem 0}',
    '.le-zoom{font-family:var(--font-mono);font-size:.82rem;color:var(--slate)}',
  ].join(''))

  // ------------------------------------------------------------------ the picture
  var result = null
  var P = api.plot(plotBox, {
    view: view(), aspect: 0.62, label: t('The graph near x = a, with the ε band and the δ strip', 'x = a 附近的图像，以及 ε 带和 δ 带'),
    draw: function (P) {
      var F = state.fn, L = curL(), eps = VALUES[state.iE], d = VALUES[state.iD], v = P.view
      P.svg.setAttribute('data-view', v.map(function (q) { return String(Number(q.toPrecision(12))) }).join(' '))   // for tests
      P.axes()
      P.rect(v[0], L - eps, v[1], L + eps, { fill: 'var(--orange)', opacity: 0.13, color: 'none' })
      P.rect(F.a - d, v[2], F.a + d, v[3], { fill: 'var(--green)', opacity: 0.11, color: 'none' })
      P.hline(L - eps, { color: 'var(--orange)', dash: false, width: 1.2 })
      P.hline(L + eps, { color: 'var(--orange)', dash: false, width: 1.2 })
      P.vline(F.a - d, { color: 'var(--green)', dash: false, width: 1.2 })
      P.vline(F.a + d, { color: 'var(--green)', dash: false, width: 1.2 })
      if (F.guides) {
        P.curve(function (x) { return Math.abs(x) }, { color: 'var(--muted)', width: 1.4, dash: true })
        P.curve(function (x) { return -Math.abs(x) }, { color: 'var(--muted)', width: 1.4, dash: true })
      }
      P.curve(F.f, { color: 'var(--blue)', width: F.dense ? 1.3 : 2.2, samples: F.dense ? 6000 : 1500, breaks: F.breaks })
      var o = { from: F.a - d, to: F.a + d, width: F.dense ? 2 : 3.4, samples: F.dense ? 6000 : 1500, breaks: F.breaks }
      P.curve(function (x) { var y = F.f(x); return Math.abs(y - L) < eps ? y : NaN }, Object.assign({ color: 'var(--green)' }, o))
      P.curve(function (x) { var y = F.f(x); return Math.abs(y - L) >= eps ? y : NaN }, Object.assign({ color: 'var(--red)' }, o))
      F.holes.forEach(function (q) { P.point(q[0], q[1], { hollow: true, r: 4.5, layer: 'main' }) })
      if (L - eps > v[2] && L + eps < v[3] && P.Y(L - eps) - P.Y(L + eps) > 34) {   // labels only when the band fits
        P.text(v[1], L + eps, 'L + ε', { anchor: 'end', dx: -6, dy: -5, color: 'var(--orange)' })
        P.text(v[1], L - eps, 'L − ε', { anchor: 'end', dx: -6, dy: 15, color: 'var(--orange)' })
      }
      if (result && result.worst) {
        P.point(result.worst.x, result.worst.y, { color: 'var(--red)', r: 5.5, layer: 'main' }).setAttribute('class', 'le-escape')
      }
    },
  })

  // ------------------------------------------------------------------ words
  function describe() {
    var F = state.fn, L = curL(), eps = VALUES[state.iE], d = VALUES[state.iD], w = result.worst, lines = []
    var band = nb(dec(L - eps) + ' < y < ' + dec(L + eps))
    lines.push(t(nb('ε = ' + eps) + ': the band ' + band + '.   ' + nb('δ = ' + d) + ': the x with ' + xcond(d) + '.',
      nb('ε = ' + eps) + '：带 ' + band + '。' + nb('δ = ' + d) + '：满足 ' + xcond(d) + ' 的 x。'))
    if (!w) {
      lines.push(t('Inside: at all ' + result.n + ' sample points with ' + xcond(d) + ', f(x) lies in the band. This δ wins against this ε.',
        '在带内：在满足 ' + xcond(d) + ' 的全部 ' + result.n + ' 个采样点上，f(x) 都落在带里。对这个 ε，这个 δ 获胜。'))
    } else {
      var ax = nb('x ≈ ' + fmt(w.x, 5)), ay = nb('f(x) ≈ ' + fmt(w.y, 5)), dev = nb('|f(x) − L| ≈ ' + fmt(w.dev, 4) + ' ≥ ε')
      lines.push(t('Escapes: at ' + ax + ', ' + ay + ', which is outside the band (' + dev + ').' + (F.L !== null ? ' Try a smaller δ.' : ''),
        '跑出带外：在 ' + ax + '，' + ay + ' 处，图像在带外（' + dev + '）。' + (F.L !== null ? '试试更小的 δ。' : '')))
    }
    if (F.L === null) {
      // On every interval around 0 the graph takes the values 1 and −1 exactly; the one farther from L decides.
      var far = L > 0 ? -1 : 1, T = 1 + Math.abs(L)
      var cL = nb('L = ' + dec(L)), cE = nb('ε ≤ ' + dec(T))
      if (L === 0) {
        lines.push(t('With ' + cL + ', no δ wins once ' + cE + ': every interval around 0, however small, contains x with ' + nb('f(x) = 1') + ' and x with ' + nb('f(x) = −1') + ', both 1 away from L.',
          '取 ' + cL + ' 时，只要 ' + cE + '，任何 δ 都不能获胜：0 附近无论多小的区间里，都既有使 ' + nb('f(x) = 1') + ' 的 x，也有使 ' + nb('f(x) = −1') + ' 的 x，它们与 L 都相距 1。'))
      } else {
        lines.push(t('With ' + cL + ', no δ wins once ' + cE + ': every interval around 0, however small, contains x with ' + nb('f(x) = ' + dec(far)) + ', which is ' + dec(T) + ' away from L.',
          '取 ' + cL + ' 时，只要 ' + cE + '，任何 δ 都不能获胜：0 附近无论多小的区间里，都有使 ' + nb('f(x) = ' + dec(far)) + ' 的 x，它与 L 相距 ' + dec(T) + '。'))
      }
      lines.push(t('Every L loses once ' + nb('ε ≤ 1') + ', so f has no limit at 0.', '任何 L 在 ' + nb('ε ≤ 1') + ' 时都会失败，所以 f 在 0 处没有极限。'))
    }
    return lines.join('\n')
  }
  function update() {
    var F = state.fn
    // The line may wrap between its parts, never inside one.
    var fx = nb('f(x) = ' + F.text), fa = nb('a = ' + F.a)
    formulaEl.textContent = F.L !== null
      ? t(fx + ', ' + fa + ', ' + nb('L = ' + F.L), fx + '，' + fa + '，' + nb('L = ' + F.L))
      : t(fx + ', ' + fa + ': ' + nb('no limit') + '; ' + nb('candidate L = ' + dec(F.cand)), fx + '，' + fa + '：没有极限；' + nb('候选 L = ' + dec(F.cand)))
    zoomOut.textContent = t('zoom ', '放大倍数 ') + (state.zoom >= 1 ? '×' + state.zoom : '×1/' + (1 / state.zoom))
    bIn.disabled = state.zoom >= ZOOM_MAX
    bOut.disabled = state.zoom <= ZOOM_MIN
    result = test()
    words.textContent = describe()
    P.setView(view())
  }
  fillCands()
  update()
})
