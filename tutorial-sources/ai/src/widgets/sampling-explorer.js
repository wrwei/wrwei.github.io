/* Module 07: temperature and sequential support filters over twelve saved logits. */
AIW.register('sampling-explorer', function (el) {
  'use strict'
  var h = AIW.h, tr = AIW.t, C = AIW.C
  var presets = [
    { context: 'After the test, the engineer reported that the valve was',
      tokens: ['not', 'leaking', 'working', 'in', 'operating', 'still',
        'failing', '"', 'functioning', 'defective', 'too', 'open'],
      logits: [25.702, 25.316, 25.124, 24.617, 24.426, 24.379,
        24.278, 24.235, 24.152, 24.045, 23.971, 23.905] },
    { context: 'The safety case argues that the system is acceptably',
      tokens: ['safe', 'secure', 'robust', 'reliable', 'good', 'stable',
        'well', 'effective', 'clean', 'designed', 'simple', 'low'],
      logits: [27.664, 24.510, 24.286, 24.007, 23.536, 23.348,
        22.975, 22.792, 22.789, 22.778, 22.728, 22.695] }
  ]
  var st = { preset: 0, tau: 1, greedy: false, k: 0, p: 1, minp: 0, seed: 1 }
  var random, samples = [], current, chart, curve
  function reseed() {
    var a = st.seed >>> 0
    random = function () {
      a = (a + 0x6D2B79F5) | 0
      var x = Math.imul(a ^ a >>> 15, a | 1)
      x ^= x + Math.imul(x ^ x >>> 7, x | 61)
      return ((x ^ x >>> 14) >>> 0) / 4294967296
    }
  }
  function entropy(p) {
    return -p.reduce(function (sum, x) { return sum + (x ? x * Math.log2(x) : 0) }, 0)
  }
  function probabilities(tau) {
    return AIW.softmax(presets[st.preset].logits.map(function (z) { return z / tau }))
  }
  function distribution() {
    var q = probabilities(st.tau), kept = q.map(function () { return true })
    var removed = q.map(function () { return '' })
    if (st.greedy) q = q.map(function (_, i) { return i === 0 ? 1 : 0 })
    function drop(i, cause) { kept[i] = false; removed[i] = cause }
    function renormalise() {
      var mass = q.reduce(function (sum, x, i) { return sum + (kept[i] ? x : 0) }, 0)
      return q.map(function (x, i) { return kept[i] ? x / mass : 0 })
    }
    if (st.greedy) {
      for (var i = 1; i < q.length; i++) drop(i, tr('greedy', '贪心'))
    }
    if (st.k > 0) {
      var boundary = q.slice().sort(function (a, b) { return b - a })[st.k - 1]
      q.forEach(function (x, i) {
        if (kept[i] && x < boundary) drop(i, 'top-k')
      })
    }
    if (st.p < 1) {
      var r = renormalise(), total = 0
      var order = r.map(function (_, i) { return i }).filter(function (i) {
        return kept[i]
      }).sort(function (a, b) { return r[b] - r[a] || a - b })
      order.forEach(function (i, j) {
        if (j > 0 && total >= st.p) drop(i, 'top-p')
        total += r[i]
      })
    }
    if (st.minp > 0) {
      var filtered = renormalise(), limit = st.minp * Math.max.apply(null, filtered)
      filtered.forEach(function (x, i) {
        if (kept[i] && x < limit) drop(i, 'min-p')
      })
    }
    if (!kept.some(Boolean)) kept[0] = true
    return { q: q, final: renormalise(), removed: removed,
      count: kept.filter(Boolean).length,
      mass: q.reduce(function (sum, x, i) { return sum + (kept[i] ? x : 0) }, 0) }
  }
  var controls = h('div', { class: 'w-controls' })
  function change(key, value) { st[key] = value; samples = []; update() }
  var preset = AIW.select({ label: tr('Saved distribution', '保存的分布'),
    options: [['0', tr('A: broad', 'A：较平坦')], ['1', tr('B: peaked', 'B：较集中')]],
    value: 0, onChange: function (v) { change('preset', Number(v)) } })
  var tau = AIW.slider({ label: tr('Temperature τ', '温度 τ'), min: 0.05, max: 5,
    log: true, value: 1, fmt: function (v) { return v.toFixed(2) },
    onInput: function (v) { change('tau', v) } })
  var greedy = AIW.checkbox(tr('Greedy (τ → 0)', '贪心（τ → 0）'), false,
    function (v) { change('greedy', v) })
  var k = AIW.slider({ label: tr('Top-k (0 = off)', 'Top-k（0 = 关闭）'),
    min: 0, max: 12, step: 1, value: 0, fmt: String,
    onInput: function (v) { change('k', v) } })
  var p = AIW.slider({ label: tr('Top-p (1 = off)', 'Top-p（1 = 关闭）'),
    min: 0.05, max: 1, step: 0.01, value: 1,
    onInput: function (v) { change('p', v) } })
  var minp = AIW.slider({ label: tr('Min-p (0 = off)', 'Min-p（0 = 关闭）'),
    min: 0, max: 0.5, step: 0.01, value: 0,
    onInput: function (v) { change('minp', v) } })
  var seed = h('input', { type: 'number', value: 1, step: 1,
    oninput: function () {
      st.seed = Math.trunc(Number(seed.value) || 0); reseed(); samples = []; update()
    } })
  var sample = AIW.button(tr('Sample 20', '采样 20 次'), function () {
    samples = []
    for (var i = 0; i < 20; i++) {
      var u = random(), sum = 0, index = current.final.length - 1
      for (var j = 0; j < current.final.length; j++) {
        sum += current.final[j]
        if (u < sum) { index = j; break }
      }
      samples.push(index)
    }
    update()
  })
  var reset = AIW.button(tr('Reset', '重置'), function () {
    st = { preset: 0, tau: 1, greedy: false, k: 0, p: 1, minp: 0, seed: 1 }
    preset.querySelector('select').value = '0'
    tau.set(1); k.set(0); p.set(1); minp.set(0)
    greedy.querySelector('input').checked = false
    seed.value = 1; samples = []; reseed(); update()
  }, true)
  ;[preset, tau, greedy, k, p, minp,
    h('label', { class: 'w-ctl' }, tr('Seed', '随机种子'), seed), sample, reset]
    .forEach(function (control) { controls.appendChild(control) })
  var context = h('p', { class: 'w-note' })
  var readout = h('div', { class: 'w-readout', 'aria-live': 'polite' })
  var chartWrap = h('div'), curveWrap = h('div')
  var table = h('table', { class: 'w-table', style: { width: '100%' } })
  var sampleList = h('ol', { style: { overflowWrap: 'anywhere' } })
  el.appendChild(controls); el.appendChild(context); el.appendChild(readout)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'SmolLM2-135M saved logits; probabilities are renormalised over these twelve candidates. '
      + 'Pale = temperature only; blue = final; hatched = removed. Token order is fixed.',
    '使用 SmolLM2-135M 保存的 logits；概率仅在这十二个候选词之间重新归一化。'
      + '浅色表示仅调温度，蓝色表示最终分布，斜线表示被移除。词的顺序固定。')))
  el.appendChild(chartWrap); el.appendChild(curveWrap); el.appendChild(table)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Try top-k = 3, then compare presets with top-p = 0.9 or min-p = 0.1. '
      + 'Each sample click continues the seeded random stream; a setting change clears the sample.',
    '先尝试 top-k = 3，再用 top-p = 0.9 或 min-p = 0.1 比较两个预设。'
      + '每次点击采样都延续随机数流；改变设置会清空样本。')))
  el.appendChild(sampleList)
  function hatch(ctx, x, y, w, height) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, height); ctx.clip()
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1
    for (var a = -height; a < w; a += 7) {
      ctx.beginPath(); ctx.moveTo(x + a, y + height)
      ctx.lineTo(x + a + height, y); ctx.stroke()
    }
    ctx.restore()
  }
  chart = AIW.canvas(chartWrap, { aspect: 1.8, maxHeight: 450 }, function (ctx, w) {
    if (!current) return
    var left = 86, right = 8, scale = (w - left - right) / 1
    ctx.font = '12px system-ui'; ctx.textBaseline = 'middle'
    for (var i = 0; i < 12; i++) {
      var y = 17 + i * 34
      ctx.fillStyle = C.navy; ctx.textAlign = 'right'
      ctx.fillText(presets[st.preset].tokens[i], left - 8, y + 8)
      ctx.fillStyle = C.skyLight
      ctx.fillRect(left, y, scale * current.q[i], 18)
      ctx.fillStyle = C.blue
      ctx.fillRect(left, y + 5, scale * current.final[i], 8)
      if (current.removed[i]) hatch(ctx, left, y, scale * current.q[i], 18)
    }
    ctx.fillStyle = C.slate; ctx.textAlign = 'left'
    ctx.fillText(tr('Probability: 0 → 1', '概率：0 → 1'), left, 436)
  })
  curve = AIW.canvas(curveWrap, { aspect: 0.62, maxHeight: 220 }, function (ctx, w, height) {
    var axes = AIW.axes(ctx, { w: w, h: height, x0: Math.log10(0.05),
      x1: Math.log10(5), y0: 0, y1: Math.log2(12),
      xlabel: tr('Temperature τ (log axis)', '温度 τ（对数轴）'),
      ylabel: tr('Unfiltered entropy (bits)', '未截断熵（比特）'),
      xfmt: function (x) { return Math.pow(10, x).toFixed(2) } })
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath()
    for (var i = 0; i <= 120; i++) {
      var x = Math.log10(0.05) + 2 * i / 120
      var y = entropy(probabilities(Math.pow(10, x)))
      if (i === 0) ctx.moveTo(axes.X(x), axes.Y(y))
      else ctx.lineTo(axes.X(x), axes.Y(y))
    }
    ctx.stroke(); ctx.fillStyle = C.orange; ctx.beginPath()
    ctx.arc(axes.X(Math.log10(st.tau)), axes.Y(entropy(probabilities(st.tau))),
      4, 0, Math.PI * 2); ctx.fill()
  })
  function update() {
    current = distribution()
    context.textContent = presets[st.preset].context + ' …'
    readout.textContent = tr('Entropy: final ', '熵：最终 ')
      + entropy(current.final).toFixed(3) + tr(' bits; temperature only ', ' 比特；仅温度 ')
      + entropy(current.q).toFixed(3) + tr(' bits; maximum 3.585 bits. Kept ',
        ' 比特；最大 3.585 比特。保留 ')
      + current.count + '/12' + tr('; retained mass ', '；保留概率质量 ')
      + current.mass.toFixed(3)
    table.textContent = ''
    table.appendChild(h('tr', null, h('th', null, tr('Token', '候选词')),
      h('th', null, tr('Before → final', '截断前 → 最终')),
      h('th', null, tr('Draws / expected', '次数 / 期望'))))
    var tally = current.final.map(function () { return 0 })
    samples.forEach(function (i) { tally[i]++ })
    current.final.forEach(function (p, i) {
      table.appendChild(h('tr', null, h('td', null, presets[st.preset].tokens[i]),
        h('td', null, current.q[i].toFixed(3) + ' → ' + p.toFixed(3)
          + (current.removed[i] ? ' (' + current.removed[i] + ')' : '')),
        h('td', null, (samples.length ? String(tally[i]) : '—')
          + ' / ' + (20 * p).toFixed(2))))
    })
    sampleList.textContent = ''
    samples.forEach(function (i) {
      sampleList.appendChild(h('li', null,
        presets[st.preset].context + ' ' + presets[st.preset].tokens[i]))
    })
    chart.redraw(); curve.redraw()
  }
  reseed(); update()
})
