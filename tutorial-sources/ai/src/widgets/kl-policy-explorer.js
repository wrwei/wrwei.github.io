AIW.register('kl-policy-explorer', function (el) {
  'use strict'
  var h = AIW.h, t = AIW.t, C = AIW.C, fmt = AIW.fmt
  var initialP = [0.30, 0.20, 0.15, 0.12, 0.10, 0.06, 0.04, 0.03]
  var initialR = [0, 0.5, 1, 0.2, -0.5, 1.5, 0.8, 2]
  var st = { beta: 1, p: initialP.slice(), r: initialR.slice(), proxy: false,
    winner: 7, loser: 5 }, result, frontier = [], frame = 0
  var controls = h('div', { class: 'w-controls' }), probabilityInputs = []
  var rewardSliders = [], readout = h('div', { class: 'w-readout', 'aria-live': 'polite' })
  var barWrap = h('div'), frontierWrap = h('div'), table = h('table', { class: 'w-table' })
  var pair = h('p', { class: 'w-readout' }), charts = []
  function solve(beta) {
    var total = st.p.reduce(function (a, b) { return a + b }, 0)
    var p = st.p.map(function (x) { return x / total })
    var r = st.r.slice(), truth = st.r.slice()
    if (st.proxy) { r[7] = 2; truth[7] = -1 }
    var logits = r.map(function (x, i) { return Math.log(p[i]) + x / beta })
    var max = Math.max.apply(null, logits)
    var logZ = max + Math.log(logits.reduce(function (sum, x) {
      return sum + Math.exp(x - max)
    }, 0))
    // Keep log probabilities even where exponentiation underflows.
    var logq = logits.map(function (x) { return x - logZ })
    var q = logq.map(Math.exp), kl = 0, reward = 0, trueReward = 0, entropy = 0
    var baseline = 0, trueBaseline = 0
    q.forEach(function (x, i) {
      kl += x * (logq[i] - Math.log(p[i])); reward += x * r[i]
      trueReward += x * truth[i]; entropy -= x * logq[i]
      baseline += p[i] * r[i]; trueBaseline += p[i] * truth[i]
    })
    return { p: p, q: q, logq: logq, r: r, truth: truth, beta: beta,
      kl: Math.max(0, kl), reward: reward, trueReward: trueReward,
      baseline: baseline, trueBaseline: trueBaseline, entropy: entropy,
      objective: reward - beta * kl, betaLogZ: beta * logZ,
      implicit: logq.map(function (x, i) { return beta * (x - Math.log(p[i])) }) }
  }
  function stop() { if (frame) cancelAnimationFrame(frame); frame = 0 }
  function change(key, v) { stop(); st[key] = v; update() }
  var betaSlider = AIW.slider({ label: t('Beta β', '正则化系数 β'),
    min: 0.02, max: 20, value: 1, log: true,
    onInput: function (v) { change('beta', v) } })
  controls.appendChild(betaSlider)
  controls.appendChild(AIW.select({ label: t('Reference preset', '参考策略预设'),
    options: [['default', t('Default', '默认')], ['uniform', t('Uniform', '均匀')],
      ['rare', t('Best response is rare', '最优回答很罕见')]], value: 'default',
    onChange: function (v) {
      stop(); st.p = v === 'uniform' ? Array(8).fill(0.125) : initialP.slice()
      if (v === 'rare') st.p[7] = 0.0001
      probabilityInputs.forEach(function (input, i) { input.value = st.p[i] })
      update()
    } }))
  controls.appendChild(AIW.checkbox(t('Proxy error on response 8', '回答 8 的代理奖励有误'),
    false, function (v) { change('proxy', v) }))
  controls.appendChild(AIW.button(t('Sweep beta (4 seconds)', '扫描 β（4 秒）'), function () {
    stop(); var start = performance.now()
    function tick(now) {
      var progress = Math.min(1, (now - start) / 4000)
      st.beta = 20 * Math.pow(0.001, progress); betaSlider.set(st.beta); update()
      if (progress < 1 && el.isConnected) frame = requestAnimationFrame(tick)
      else frame = 0
    }
    frame = requestAnimationFrame(tick)
  }))
  initialR.forEach(function (r, i) {
    var slider = AIW.slider({ label: t('Reward ', '奖励 ') + 'r' + (i + 1),
      min: -3, max: 3, step: 0.1, value: r, onInput: function (v) {
        stop(); st.r[i] = v; update()
      } })
    rewardSliders.push(slider); controls.appendChild(slider)
    var input = h('input', { type: 'number', min: 0.000001, max: 1, step: 0.01,
      value: st.p[i], style: { width: '10ch', maxWidth: '100%' }, oninput: function () {
        var value = Number(input.value)
        if (!Number.isFinite(value)) return
        stop(); st.p[i] = Math.max(1e-6, Math.min(1, value)); update()
      } })
    probabilityInputs.push(input)
    controls.appendChild(h('label', { class: 'w-ctl' },
      t('Reference weight ', '参考权重 ') + 'y' + (i + 1), input))
  })
  ;[['winner', t('Pair: winner', '比较：胜者')], ['loser', t('Pair: loser', '比较：败者')]]
    .forEach(function (item) {
      controls.appendChild(AIW.select({ label: item[1], value: String(st[item[0]]),
        options: initialR.map(function (_, i) { return [String(i), 'y' + (i + 1)] }),
        onChange: function (v) { change(item[0], Number(v)) } }))
    })
  el.appendChild(controls); el.appendChild(readout)
  el.appendChild(h('p', { class: 'w-note' }, t(
    'Blue: optimum; outlined grey: reference. Input weights are normalised; proxy mode forces r8 = 2 and true r8 = −1.',
    '蓝色：最优策略；灰色空心柱：参考策略。输入权重会归一化；代理模式固定 r8 = 2、真实 r8 = −1。')))
  el.appendChild(barWrap)
  el.appendChild(h('p', { class: 'w-note' }, t(
    'Frontier: blue is the optimised reward; orange is true reward in proxy mode. The dot marks current beta.',
    '前沿：蓝线为优化使用的奖励；代理模式的橙线为真实奖励。圆点表示当前 β。')))
  el.appendChild(frontierWrap); el.appendChild(table); el.appendChild(pair)
  function drawBars(ctx, w, height) {
    if (!result) return
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 0, x1: 9, y0: 0, y1: 1,
      xlabel: t('Response', '回答'), ylabel: t('Probability', '概率'),
      xticks: 9, xfmt: function (x) { return x >= 1 && x <= 8 ? 'y' + x : '' } })
    var width = (axes.X(2) - axes.X(1)) * 0.3
    result.q.forEach(function (x, i) {
      var px = axes.X(i + 1)
      ctx.strokeStyle = C.slate; ctx.lineWidth = 2
      ctx.strokeRect(px - width, axes.Y(result.p[i]), width, axes.Y(0) - axes.Y(result.p[i]))
      ctx.fillStyle = C.blue
      ctx.fillRect(px + 2, axes.Y(x), width, axes.Y(0) - axes.Y(x))
    })
  }
  function drawFrontier(ctx, w, height) {
    if (!result) return
    var rewards = frontier.map(function (x) { return x.reward })
    if (st.proxy) rewards = rewards.concat(frontier.map(function (x) { return x.trueReward }))
    var min = Math.min.apply(null, rewards), max = Math.max.apply(null, rewards)
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 0,
      x1: Math.max(0.1, frontier[frontier.length - 1].kl * 1.05),
      y0: min - 0.1, y1: Math.max(min + 0.1, max) + 0.1,
      xlabel: t('KL (nats)', 'KL（纳特）'), ylabel: t('Expected reward', '期望奖励') })
    function line(key, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath()
      frontier.forEach(function (x, i) {
        if (i) ctx.lineTo(axes.X(x.kl), axes.Y(x[key]))
        else ctx.moveTo(axes.X(x.kl), axes.Y(x[key]))
      }); ctx.stroke()
      ctx.fillStyle = color; ctx.beginPath()
      ctx.arc(axes.X(result.kl), axes.Y(result[key]), 4, 0, Math.PI * 2); ctx.fill()
    }
    line('reward', C.blue); if (st.proxy) line('trueReward', C.orange)
  }
  function update() {
    result = solve(st.beta)
    frontier = Array.from({ length: 200 }, function (_, i) {
      return solve(20 * Math.pow(0.001, i / 199))
    })
    el._result = result
    readout.textContent = t('KL / entropy: ', 'KL / 熵：') + fmt(result.kl) + ' / '
      + fmt(result.entropy) + t(' nats; reward / reference: ', ' 纳特；奖励 / 参考奖励：')
      + fmt(result.reward) + ' / ' + fmt(result.baseline)
      + t('; J / β log Z: ', '；J / β log Z：') + fmt(result.objective) + ' / '
      + fmt(result.betaLogZ) + (st.proxy ? t('; true / reference true: ', '；真实 / 参考真实奖励：')
        + fmt(result.trueReward) + ' / ' + fmt(result.trueBaseline) : '')
    table.textContent = ''
    table.appendChild(h('tr', null, h('th', null, t('Response', '回答')),
      h('th', null, 'r'), h('th', null, t('Implicit reward', '隐式奖励')),
      h('th', null, 'r − β log Z')))
    result.implicit.forEach(function (value, i) {
      table.appendChild(h('tr', null, h('td', null, 'y' + (i + 1)),
        h('td', null, fmt(result.r[i])), h('td', null, fmt(value)),
        h('td', null, fmt(result.r[i] - result.betaLogZ))))
    })
    var delta = result.r[st.winner] - result.r[st.loser]
    pair.textContent = t('Pair Δr / implicit margin / win probability: ', '比较 Δr / 隐式间隔 / 胜出概率：')
      + fmt(delta) + ' / ' + fmt(result.implicit[st.winner] - result.implicit[st.loser])
      + ' / ' + fmt(1 / (1 + Math.exp(-delta)))
    charts.forEach(function (chart) { chart.redraw() })
  }
  charts.push(AIW.canvas(barWrap, { aspect: 0.6, maxHeight: 340 }, drawBars))
  charts.push(AIW.canvas(frontierWrap, { aspect: 0.65, maxHeight: 360 }, drawFrontier))
  update()
})
