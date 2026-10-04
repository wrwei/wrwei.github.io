AIW.register('grpo-group-explorer', function (el) {
  'use strict'
  var h = AIW.h, t = AIW.t, C = AIW.C, fmt = AIW.fmt
  var st = { G: 8, rewards: [1, 0, 0, 0, 0, 0, 0, 0],
    lengths: Array(8).fill(200), partial: false, standardise: true,
    sample: true, p: 0.5, seed: 1 }, result, charts = []
  var controls = h('div', { class: 'w-controls' }), cells = h('div', { class: 'w-controls' })
  var readout = h('div', { class: 'w-readout', 'aria-live': 'polite' })
  var bars = h('div'), signal = h('div'), table = h('table', {
    class: 'w-table', style: { whiteSpace: 'nowrap' } })
  function change(key, value, rebuild) { st[key] = value; if (rebuild) makeCells(); update() }
  controls.appendChild(AIW.slider({ label: t('Group size G', '组大小 G'),
    min: 2, max: 16, step: 1, value: 8, fmt: String, onInput: function (v) {
      st.G = v
      while (st.rewards.length < v) { st.rewards.push(0); st.lengths.push(200) }
      st.rewards.length = v; st.lengths.length = v; makeCells(); update()
    } }))
  controls.appendChild(AIW.checkbox(t('Partial-credit rewards', '部分得分奖励'), false,
    function (v) {
      if (!v) st.rewards = st.rewards.map(function (x) { return x >= 0.5 ? 1 : 0 })
      change('partial', v, true)
    }))
  controls.appendChild(AIW.checkbox(t('Divide by standard deviation', '除以标准差'), true,
    function (v) { change('standardise', v) }))
  controls.appendChild(AIW.checkbox(t('Sample variance (G − 1)', '样本方差（G − 1）'), true,
    function (v) { change('sample', v) }))
  controls.appendChild(AIW.slider({ label: t('Binary pass probability p', '二元通过概率 p'),
    min: 0, max: 1, step: 0.01, value: 0.5, onInput: function (v) { change('p', v) } }))
  controls.appendChild(AIW.button(t('Resample binary group', '重新采样二元奖励组'), function () {
    var rand = AIW.rng(st.seed++)
    st.rewards = Array.from({ length: st.G }, function () { return rand() < st.p ? 1 : 0 })
    makeCells(); update()
  }))
  function makeCells() {
    cells.textContent = ''
    st.rewards.forEach(function (value, i) {
      var column = h('div', { class: 'w-col' })
      if (st.partial) column.appendChild(AIW.slider({
        label: t('Reward ', '奖励 ') + (i + 1), min: 0, max: 1,
        step: 0.1, value: value, onInput: function (v) { st.rewards[i] = v; update() } }))
      else column.appendChild(AIW.button(t('Reward ', '奖励 ') + (i + 1) + ': ' + value,
        function () { st.rewards[i] = st.rewards[i] >= 0.5 ? 0 : 1; makeCells(); update() }, true))
      var input = h('input', { type: 'number', min: 1, max: 100000, step: 1,
        value: st.lengths[i], style: { width: '9ch', maxWidth: '100%' }, oninput: function () {
          var value = Number(input.value)
          if (!Number.isFinite(value)) return
          st.lengths[i] = Math.max(1, Math.min(100000, Math.round(value))); update()
        } })
      column.appendChild(h('label', { class: 'w-ctl' }, t('Tokens ', 'token 数 ') + (i + 1), input))
      cells.appendChild(column)
    })
  }
  function calculate() {
    var mean = st.rewards.reduce(function (a, b) { return a + b }, 0) / st.G
    var sumSquares = st.rewards.reduce(function (sum, x) { return sum + Math.pow(x - mean, 2) }, 0)
    var std = Math.sqrt(sumSquares / (st.sample ? st.G - 1 : st.G))
    var advantages = st.rewards.map(function (x) {
      return std < 1e-12 ? 0 : (x - mean) / (st.standardise ? std + 1e-6 : 1)
    })
    var maxLength = Math.max.apply(null, st.lengths)
    return { mean: mean, std: std, advantages: advantages,
      sum: advantages.reduce(function (a, b) { return a + b }, 0),
      nonzero: advantages.filter(function (x) { return Math.abs(x) > 1e-12 }).length,
      perToken: advantages.map(function (x, i) { return x / st.lengths[i] }),
      constant: advantages.map(function (x) { return x / maxLength }),
      loo: st.rewards.map(function (x) { return x - (st.G * mean - x) / (st.G - 1) }),
      signal: 1 - Math.pow(st.p, st.G) - Math.pow(1 - st.p, st.G) }
  }
  function drawBars(ctx, w, height) {
    if (!result) return
    var max = Math.max(1, Math.max.apply(null, result.advantages.map(Math.abs)))
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 0, x1: st.G + 1,
      y0: -max * 1.1, y1: max * 1.1, xticks: st.G + 1,
      xfmt: function (x) { return x >= 1 && x <= st.G ? String(x) : '' },
      xlabel: t('Sample', '样本'), ylabel: t('Advantage', '优势') })
    var width = (axes.X(2) - axes.X(1)) * 0.55
    result.advantages.forEach(function (a, i) {
      ctx.fillStyle = a > 0 ? C.blue : C.orange
      ctx.fillRect(axes.X(i + 1) - width / 2, axes.Y(Math.max(0, a)),
        width, Math.max(1, Math.abs(axes.Y(a) - axes.Y(0))))
    })
  }
  function drawSignal(ctx, w, height) {
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 0, x1: 1, y0: 0, y1: 1,
      xlabel: t('Binary pass probability p', '二元通过概率 p'),
      ylabel: t('Task-signal probability', '任务信号概率') })
    ;[4, 16, st.G].forEach(function (G, line) {
      ctx.strokeStyle = line === 2 ? C.blue : C.muted
      ctx.lineWidth = line === 2 ? 2.5 : 1
      ctx.beginPath()
      for (var i = 0; i <= 100; i++) {
        var p = i / 100, y = 1 - Math.pow(p, G) - Math.pow(1 - p, G)
        if (i) ctx.lineTo(axes.X(p), axes.Y(y)); else ctx.moveTo(axes.X(p), axes.Y(y))
      } ctx.stroke()
    })
    ctx.fillStyle = C.orange; ctx.beginPath()
    ctx.arc(axes.X(st.p), axes.Y(result.signal), 4, 0, Math.PI * 2); ctx.fill()
  }
  function update() {
    result = calculate(); el._result = result
    readout.textContent = t('Mean / standard deviation: ', '均值 / 标准差：')
      + fmt(result.mean) + ' / ' + fmt(result.std)
      + t('; sum / nonzero advantages: ', '；优势之和 / 非零优势数：')
      + fmt(result.sum) + ' / ' + result.nonzero
      + t('; task signal: ', '；任务信号概率：') + fmt(result.signal)
      + t('; next seed: ', '；下一采样种子：') + st.seed
      + (result.nonzero ? '' : t('; zero task advantages; a separate KL term can still update.',
        '；任务优势为零；单独的 KL 项仍可更新策略。'))
    table.textContent = ''
    table.appendChild(h('tr', null, h('th', null, 'i'), h('th', null, 'A'),
      h('th', null, 'A / |y|'), h('th', null, 'A / max |y|'),
      h('th', null, t('LOO difference', '留一法差值'))))
    result.advantages.forEach(function (a, i) {
      table.appendChild(h('tr', null, h('td', null, i + 1), h('td', null, fmt(a)),
        h('td', null, fmt(result.perToken[i], 5)), h('td', null, fmt(result.constant[i], 5)),
        h('td', null, fmt(result.loo[i]))))
    })
    charts.forEach(function (chart) { chart.redraw() })
  }
  el.appendChild(controls); el.appendChild(cells); el.appendChild(readout); el.appendChild(bars)
  el.appendChild(h('p', { class: 'w-note' }, t(
    'The table compares response-length and constant-length weighting. Centred reward equals (G − 1)/G times the LOO difference. Removing std alone does not implement every Dr. GRPO change.',
    '表格比较回答长度和固定长度归一化。中心化奖励等于留一法差值的 (G − 1)/G 倍。仅移除标准差并未实现 Dr. GRPO 的全部修改。')))
  el.appendChild(h('div', { style: { overflowX: 'auto', maxWidth: '100%' } }, table))
  el.appendChild(signal)
  el.appendChild(h('p', { class: 'w-note' }, t(
    'Blue: current G; grey: G = 4 and 16; orange dot: current p. This curve applies to independent binary rewards, including in partial-credit mode.',
    '蓝线：当前 G；灰线：G = 4 和 16；橙点：当前 p。该曲线针对独立二元奖励，即使界面切换为部分得分也不改变其含义。')))
  makeCells()
  charts.push(AIW.canvas(bars, { aspect: 0.65, maxHeight: 350 }, drawBars))
  charts.push(AIW.canvas(signal, { aspect: 0.65, maxHeight: 350 }, drawSignal))
  update()
})
