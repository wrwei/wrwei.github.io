AIW.register('speculative-speedup', function (el) {
  'use strict'
  var h = AIW.h, t = AIW.t, C = AIW.C
  var state = { alpha: .8, gamma: 4, cost: .05, verification: 1 }
  var p = [.5, .3, .15, .05], q = [.4, .4, .1, .1], empirical = null
  var controls = h('div', { class: 'w-controls' })
  ;[['alpha', 'Acceptance α', '接受率 α', 0, .99, .01], ['gamma', 'Draft length γ', '草稿长度 γ', 1, 16, 1],
    ['cost', 'Draft cost ratio c', '草稿成本比 c', 0, 1, .01], ['verification', 'Verification cost v', '验证成本 v', 1, 3, .1]].forEach(function (a) {
    controls.appendChild(AIW.slider({ label: t(a[1], a[2]), min: a[3], max: a[4], step: a[5], value: state[a[0]],
      onInput: function (v) { state[a[0]] = v; render() } }))
  })
  var readout = h('div', { class: 'w-readout', 'aria-live': 'polite', style: { whiteSpace: 'pre-wrap' } }), chart = h('div'), histogram = h('div')
  el.appendChild(h('p', { class: 'w-note' }, t('A. Independent acceptance and constant per-draft cost model', 'A．独立接受事件与固定单步草稿成本模型')))
  el.appendChild(controls); el.appendChild(readout); el.appendChild(histogram); el.appendChild(chart)
  var distributions = h('div'), distributionReadout = h('div', { class: 'w-readout', 'aria-live': 'polite', style: { whiteSpace: 'pre-wrap' } })
  el.appendChild(h('p', { class: 'w-note' }, t('B. One-position acceptance/residual theorem. Edit a value or drag a bar; the other values rescale.', 'B．单位置接受与残差定理。编辑数值或拖动条形；其余值按比例缩放。')))
  var inputRows = h('div', { class: 'w-controls' }), fields = []
  function edit(array, index, value) {
    var v = Math.max(0, Math.min(1, value)), rest = 1 - array[index]
    for (var j = 0; j < 4; j++) if (j !== index) array[j] = rest > 1e-14 ? array[j] / rest * (1 - v) : (1 - v) / 3
    array[index] = v; empirical = null; render()
  }
  ;[p, q].forEach(function (array, row) {
    fields[row] = []
    array.forEach(function (value, index) {
      var label = (row === 0 ? t('Target p', '目标 p') : t('Draft q', '草稿 q')) + ' · ' + (index + 1)
      var input = h('input', { type: 'number', min: 0, max: 1, step: .01, value: value, 'aria-label': label,
        style: { width: '100%', minWidth: '0', boxSizing: 'border-box' } })
      input.addEventListener('input', function () { if (input.value !== '' && Number.isFinite(Number(input.value))) edit(array, index, Number(input.value)) })
      fields[row][index] = input; inputRows.appendChild(h('label', { class: 'w-ctl' }, h('span', { text: label }), input))
    })
  })
  el.appendChild(inputRows); el.appendChild(distributions); el.appendChild(distributionReadout)
  var simulate = AIW.button(t('Simulate 10,000 steps', '模拟 10,000 步'), function () {
    var rng = AIW.rng(1), counts = [0, 0, 0, 0], r = theorem().residual
    function draw(dist) { var u = rng(), sum = 0; for (var j = 0; j < 4; j++) { sum += dist[j]; if (u < sum) return j } return 3 }
    for (var i = 0; i < 10000; i++) { var token = draw(q); if (rng() >= Math.min(1, p[token] / q[token])) token = draw(r); counts[token]++ }
    empirical = counts.map(function (v) { return v / 10000 }); render()
  })
  el.appendChild(simulate)
  var proof = h('div'); el.appendChild(proof)
  function expected(g) { var sum = 1; for (var i = 1; i <= g; i++) sum += Math.pow(state.alpha, i); return sum }
  function speed(g) { return expected(g) / (g * state.cost + state.verification) }
  function theorem() {
    var overlap = p.map(function (v, i) { return Math.min(v, q[i]) }), alpha = overlap.reduce(function (a, b) { return a + b }, 0)
    var residual = alpha >= 1 - 1e-12 ? [0, 0, 0, 0] : p.map(function (v, i) { return (v - overlap[i]) / (1 - alpha) })
    return { overlap: overlap, alpha: alpha, residual: residual, output: overlap.map(function (v, i) { return v + (1 - alpha) * residual[i] }) }
  }
  var plot = AIW.canvas(chart, { aspect: .58, maxHeight: 300 }, function (ctx, w, height) {
    var values = [], ymax = 1.5
    for (var g = 1; g <= 16; g++) { values.push(speed(g)); ymax = Math.max(ymax, speed(g) * 1.15) }
    var a = AIW.axes(ctx, { w: w, h: height, x0: 1, x1: 16, y0: 0, y1: ymax,
      xlabel: t('Draft length γ', '草稿长度 γ'), ylabel: t('Speed-up', '加速比') })
    ctx.strokeStyle = C.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(a.X(1), a.Y(1)); ctx.lineTo(a.X(16), a.Y(1)); ctx.stroke(); ctx.setLineDash([])
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath()
    values.forEach(function (v, i) { if (i) ctx.lineTo(a.X(i + 1), a.Y(v)); else ctx.moveTo(a.X(i + 1), a.Y(v)) }); ctx.stroke()
    var best = values.indexOf(Math.max.apply(null, values)) + 1
    ;[[state.gamma, C.orange], [best, C.green]].forEach(function (v) { ctx.fillStyle = v[1]; ctx.beginPath(); ctx.arc(a.X(v[0]), a.Y(speed(v[0])), 5, 0, Math.PI * 2); ctx.fill() })
  })
  var hist = AIW.canvas(histogram, { aspect: .38, maxHeight: 210 }, function (ctx, w, height) {
    var g = state.gamma, probs = []
    for (var k = 1; k <= g; k++) probs.push(Math.pow(state.alpha, k - 1) * (1 - state.alpha))
    probs.push(Math.pow(state.alpha, g))
    var a = AIW.axes(ctx, { w: w, h: height, x0: .5, x1: g + 1.5, y0: 0, y1: 1,
      xlabel: t('Committed tokens per iteration', '每次迭代提交 token 数'), ylabel: t('Probability', '概率') })
    ctx.fillStyle = C.blue
    probs.forEach(function (v, i) { ctx.fillRect(a.X(i + .7), a.Y(v), a.X(i + 1.3) - a.X(i + .7), a.Y(0) - a.Y(v)) })
    ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.moveTo(a.X(expected(g)), a.Y(1)); ctx.lineTo(a.X(expected(g)), a.Y(0)); ctx.stroke()
  })
  var bars = AIW.canvas(distributions, { aspect: .62, maxHeight: 320 }, function (ctx, w, height) {
    var a = AIW.axes(ctx, { w: w, h: height, x0: .5, x1: 4.5, y0: 0, y1: 1,
      xlabel: t('Vocabulary entry', '词表项'), ylabel: t('Probability', '概率') })
    ;[p, q].forEach(function (dist, row) { ctx.fillStyle = row === 0 ? C.blue : C.orange
      dist.forEach(function (v, i) { var x = i + 1 + (row === 0 ? -.23 : .02); ctx.fillRect(a.X(x), a.Y(v), a.X(x + .2) - a.X(x), a.Y(0) - a.Y(v)) }) })
    if (empirical) { ctx.fillStyle = C.green; empirical.forEach(function (v, i) { ctx.beginPath(); ctx.arc(a.X(i + 1), a.Y(v), 4, 0, Math.PI * 2); ctx.fill() }) }
    ctx.font = '12px system-ui'; ctx.fillStyle = C.blue; ctx.fillText(t('Target p', '目标 p'), 58, 25)
    ctx.fillStyle = C.orange; ctx.fillText(t('Draft q', '草稿 q'), 58, 44)
    if (empirical) { ctx.fillStyle = C.green; ctx.fillText(t('Empirical output', '经验输出'), 58, 63) }
    bars.geometry = a
  })
  var dragging = null
  var proofPlot = AIW.canvas(proof, { aspect: .48, maxHeight: 270 }, function (ctx, w, height) {
    var detail = theorem()
    var a = AIW.axes(ctx, { w: w, h: height, x0: .5, x1: 4.5, y0: 0, y1: 1,
      xlabel: t('Vocabulary entry', '词表项'), ylabel: t('Probability', '概率') })
    detail.output.forEach(function (v, i) {
      var x = i + .78, width = a.X(x + .2) - a.X(x)
      ctx.fillStyle = C.blue; ctx.fillRect(a.X(x), a.Y(v), width, a.Y(0) - a.Y(v))
      ctx.fillStyle = C.green; ctx.fillRect(a.X(x), a.Y(detail.overlap[i]), width, a.Y(0) - a.Y(detail.overlap[i]))
      ctx.fillStyle = C.orange; ctx.fillRect(a.X(i + 1.04), a.Y(detail.residual[i]), width, a.Y(0) - a.Y(detail.residual[i]))
    })
    ctx.font = '12px system-ui'; ctx.fillStyle = C.green; ctx.fillText(t('Overlap (green) + correction (blue) = p', '重叠（绿）+ 校正（蓝）= p'), 58, 25)
    ctx.fillStyle = C.orange; ctx.fillText(t('Conditional residual (orange)', '条件残差分布（橙）'), 58, 44)
  })
  bars.cv.style.touchAction = 'none'
  bars.cv.addEventListener('pointerdown', function (event) {
    var rect = bars.cv.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top, a = bars.geometry
    if (!a) return
    for (var i = 0; i < 4; i++) for (var row = 0; row < 2; row++) {
      var xx = i + 1 + (row === 0 ? -.23 : .02)
      if (x >= a.X(xx) && x <= a.X(xx + .2) && y >= 12 && y <= bars.h - 34) dragging = [row, i]
    }
    if (dragging) { bars.cv.setPointerCapture(event.pointerId); move(event) }
  })
  function move(event) {
    if (!dragging) return
    var rect = bars.cv.getBoundingClientRect(), y = event.clientY - rect.top
    edit(dragging[0] === 0 ? p : q, dragging[1], (bars.h - 34 - y) / (bars.h - 46))
  }
  bars.cv.addEventListener('pointermove', move)
  bars.cv.addEventListener('pointerup', function () { dragging = null })
  bars.cv.addEventListener('pointercancel', function () { dragging = null })
  function render() {
    var best = 1
    for (var g = 2; g <= 16; g++) if (speed(g) > speed(best) + 1e-12) best = g
    var e = expected(state.gamma), detail = theorem()
    readout.textContent = t('Expected tokens: ', '期望 token 数：') + AIW.fmt(e, 4) + ' · ' + t('Speed-up: ', '加速比：') + AIW.fmt(speed(state.gamma), 3) + '×\n' +
      t('Best length: ', '最佳长度：') + best + ' (' + AIW.fmt(speed(best), 3) + '×) · ' + t('Wasted proposals: ', '浪费提议数：') + AIW.fmt(state.gamma - (e - 1), 3)
    ;[p, q].forEach(function (dist, row) { dist.forEach(function (v, i) { fields[row][i].value = v.toFixed(5) }) })
    var format = function (array) { return array.map(function (v) { return AIW.fmt(v, 4) }).join(', ') }
    distributionReadout.textContent = 'α = ' + AIW.fmt(detail.alpha, 4) + ' · TV = ' + AIW.fmt(1 - detail.alpha, 4) + '\n' +
      t('Overlap: ', '重叠质量：') + format(detail.overlap) + '\n' +
      (detail.alpha >= 1 - 1e-12 ? t('No residual needed.', '无需残差分布。') : t('Residual: ', '残差分布：') + format(detail.residual)) + '\n' +
      t('Restored output: ', '恢复后的输出：') + format(detail.output) + (empirical ? '\n' + t('Empirical TV to p: ', '经验分布与 p 的 TV：') + AIW.fmt(empirical.reduce(function (sum, v, i) { return sum + Math.abs(v - p[i]) / 2 }, 0), 4) : '')
    el._result = { expected: e, speedup: speed(state.gamma), best: best, wasted: state.gamma - e + 1,
      p: p.slice(), q: q.slice(), alpha: detail.alpha, residual: detail.residual, restored: detail.output, empirical: empirical }
    plot.redraw(); hist.redraw(); bars.redraw(); proofPlot.redraw()
  }
  render()
})
