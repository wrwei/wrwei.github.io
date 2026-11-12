/* Module 08: model-compute budget and the published parametric scaling fit. */
AIW.register('compute-budget-planner', function (el) {
  'use strict'
  var h = AIW.h, tr = AIW.t, C = AIW.C
  var st = { N: 9550729216, D: 2e12, gpu: '989', custom: 989, count: 80,
    mfu: 0.4, rule: true, embedding: 622854144, L: 36, T: 8192, d: 4096, price: '' }
  var controls = h('div', { class: 'w-controls' }), readout = h('div', {
    class: 'w-readout', 'aria-live': 'polite' }), payback = h('p', { class: 'w-note' })
  var chartWrap = h('div'), chart, result
  function fmt(v) { return v.toPrecision(3).replace('e+', 'e') }
  function law(N, D) { return 1.69 + 406.4 / Math.pow(N, 0.34)
    + 410.7 / Math.pow(D, 0.28) }
  function optimum(budget) {
    var N = Math.pow(0.34 * 406.4 / (0.28 * 410.7), 1 / 0.62)
      * Math.pow(budget / 6, 0.28 / 0.62)
    return { N: N, D: budget / (6 * N) }
  }
  function change(key, value) { st[key] = value; update() }
  function slider(key, label, min, max, step, log, format) {
    var control = AIW.slider({ label: label, min: min, max: max, step: step,
      log: log, value: st[key], fmt: format || fmt,
      onInput: function (v) { change(key, v) } })
    controls.appendChild(control); return control
  }
  function number(key, label, min, max) {
    var input = h('input', { type: 'number', min: min, max: max, value: st[key],
      style: { width: '14ch', maxWidth: '100%' },
      oninput: function () {
        change(key, Math.max(min, Math.min(max, Number(input.value) || min)))
      } })
    controls.appendChild(h('label', { class: 'w-ctl' }, label, input))
    return input
  }
  var nSlider = slider('N', tr('Parameters N', '参数量 N'), 1e8, 1e12, null, true)
  var dSlider = slider('D', tr('Training tokens D', '训练 token 数 D'), 1e9, 1e14, null, true)
  controls.appendChild(AIW.select({ label: tr('Assumed dense bf16 peak', '假定稠密 bf16 峰值'),
    options: [['312', 'A100 80 GB: 312 TFLOP/s'], ['989', 'H100 SXM: 989 TFLOP/s'],
      ['h200', 'H200: 989 TFLOP/s'], ['custom', tr('Custom', '自定义')]],
    value: st.gpu, onChange: function (v) { change('gpu', v) } }))
  var custom = number('custom', tr('Custom peak (TFLOP/s)', '自定义峰值（TFLOP/s）'), 1, 100000)
  number('count', tr('GPU count', 'GPU 数量'), 1, 100000)
  slider('mfu', tr('Model FLOP utilisation', '模型 FLOP 利用率'), 0.1, 0.6, 0.01, false,
    function (v) { return (100 * v).toFixed(0) + '%' })
  controls.appendChild(AIW.checkbox(tr('Use Module 06 FLOP rule', '使用模块 06 的 FLOP 规则'),
    st.rule, function (v) { change('rule', v) }))
  number('embedding', tr('Input lookup parameters Vd', '输入查表参数 Vd'), 0, 5e11)
  number('L', tr('Layers L', '层数 L'), 1, 512)
  number('T', tr('Sequence length T', '序列长度 T'), 1, 1000000)
  number('d', tr('Width d', '宽度 d'), 1, 100000)
  var price = h('input', { type: 'number', min: 0, step: 0.01, placeholder: '2.50',
    oninput: function () { st.price = price.value; update() } })
  controls.appendChild(h('label', { class: 'w-ctl' },
    tr('Assumed USD / GPU-hour (optional)', '假定 USD / GPU 小时（可选）'), price))
  function setAllocation(target) {
    if (target.N < 1e8 || target.N > 1e12 || target.D < 1e9 || target.D > 1e14) return
    st.N = target.N; st.D = target.D
    nSlider.set(st.N); dSlider.set(st.D); update()
  }
  var twentyButton = AIW.button(tr('Set 20 tokens / parameter at fixed 6ND',
    '固定 6ND，设为每参数 20 个 token '), function () { setAllocation(result.twenty) })
  var optimumButton = AIW.button(tr('Set fitted minimum at fixed 6ND',
    '固定 6ND，设为拟合最优点'), function () { setAllocation(result.optimal) })
  controls.appendChild(twentyButton); controls.appendChild(optimumButton)
  el.appendChild(controls); el.appendChild(readout); el.appendChild(chartWrap)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Curve: L = 1.69 + 406.4/N^0.34 + 410.7/D^0.28, with C₆ = 6ND fixed. '
      + 'Shaded regions extrapolate outside N = 70M–16B or D = 5B–500B. '
      + 'The cost readout uses the selected FLOP rule; the curve and payback use 6ND.',
    '曲线：L = 1.69 + 406.4/N^0.34 + 410.7/D^0.28，固定 C₆ = 6ND。'
      + '阴影区域表示超出 N = 7000 万–160 亿或 D = 50 亿–5000 亿的外推。'
      + '成本读数采用所选 FLOP 规则；曲线和回本计算采用 6ND。')))
  el.appendChild(payback)
  function calculate() {
    var budget6 = 6 * st.N * st.D, embedding = Math.min(st.embedding, st.N / 2)
    var perToken = st.rule ? 6 * (st.N - embedding) + 6 * st.L * st.T * st.d : 6 * st.N
    var compute = perToken * st.D
    var peak = st.gpu === 'custom' ? st.custom : st.gpu === 'h200' ? 989 : Number(st.gpu)
    var hours = compute / (peak * 1e12 * st.mfu) / 3600
    var N20 = Math.sqrt(budget6 / 120)
    return { compute: compute, budget6: budget6, hours: hours,
      days: hours / st.count / 24, loss: law(st.N, st.D),
      forwardWeight: 2 * (st.rule ? st.N - embedding : st.N),
      twenty: { N: N20, D: 20 * N20 }, optimal: optimum(budget6) }
  }
  chart = AIW.canvas(chartWrap, { aspect: 0.8, maxHeight: 350 }, function (ctx, w, height) {
    if (!result) return
    var points = [], ymin = Infinity, ymax = 0
    for (var i = 0; i <= 200; i++) {
      var x = 7 + 6 * i / 200, N = Math.pow(10, x), D = result.budget6 / (6 * N)
      if (D < 1e8) continue
      var loss = law(N, D); ymin = Math.min(ymin, loss); ymax = Math.max(ymax, loss)
      points.push({ x: x, y: loss, N: N, D: D })
    }
    var padding = Math.max(0.01, (ymax - ymin) * 0.08)
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 7, x1: 13,
      y0: ymin - padding, y1: ymax + padding, xticks: 6,
      xlabel: tr('Parameters N (log axis)', '参数量 N（对数轴）'),
      ylabel: tr('Predicted nats /token', '预测损失（奈特 /token ）'),
      xfmt: function (v) { return '1e' + v.toFixed(0) } })
    ctx.save(); ctx.beginPath(); ctx.rect(axes.X(7), axes.Y(ymax + padding),
      axes.X(13) - axes.X(7), axes.Y(ymin - padding) - axes.Y(ymax + padding)); ctx.clip()
    points.forEach(function (point) {
      if (point.N < 7e7 || point.N > 1.6e10 || point.D < 5e9 || point.D > 5e11) {
        ctx.fillStyle = 'rgba(148,163,184,0.18)'
        ctx.fillRect(axes.X(point.x), axes.Y(ymax + padding),
          axes.X(point.x + 0.03) - axes.X(point.x), axes.Y(ymin - padding))
      }
    })
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath()
    points.forEach(function (point, i) {
      if (i === 0) ctx.moveTo(axes.X(point.x), axes.Y(point.y))
      else ctx.lineTo(axes.X(point.x), axes.Y(point.y))
    }); ctx.stroke()
    ;[{ N: st.N, D: st.D, colour: C.orange },
      { N: result.twenty.N, D: result.twenty.D, colour: C.purple },
      { N: result.optimal.N, D: result.optimal.D, colour: C.green }].forEach(function (point) {
        ctx.fillStyle = point.colour; ctx.beginPath()
        ctx.arc(axes.X(Math.log10(point.N)), axes.Y(law(point.N, point.D)), 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    ctx.restore()
  })
  function pointText(label, point) {
    return label + ': N ' + fmt(point.N) + ', D ' + fmt(point.D)
      + ', L ' + law(point.N, point.D).toFixed(4)
  }
  function update() {
    result = calculate(); custom.disabled = st.gpu !== 'custom'
    readout.textContent = 'C = ' + fmt(result.compute) + ' FLOP; '
      + fmt(result.hours) + tr(' GPU-hours; ', ' GPU 小时；')
      + result.days.toFixed(1) + tr(' days; D/N = ', ' 天；D/N = ')
      + (st.D / st.N).toFixed(1) + '; L = ' + result.loss.toFixed(4)
      + tr('; forward weight FLOP/token = ', '；每 token 前向权重 FLOP = ')
      + fmt(result.forwardWeight) + (st.rule ? '' : tr(' (quick estimate)', '（快速估计）'))
      + (st.price !== '' && Number(st.price) >= 0 ? tr('; assumed cost USD ', '；假定成本 USD ')
        + (result.hours * Number(st.price)).toFixed(2) : '')
    var low = 15, high = 28
    for (var i = 0; i < 60; i++) {
      var middle = (low + high) / 2, point = optimum(Math.pow(10, middle))
      if (law(point.N, point.D) > result.loss) low = middle
      else high = middle
    }
    var equalBudget = Math.pow(10, (low + high) / 2), equal = optimum(equalBudget)
    payback.textContent = pointText(tr('Green: fitted minimum', '绿色：拟合最优点'), result.optimal)
      + '\n' + pointText(tr('Purple: 20-token point', '紫色：20 token 点'), result.twenty)
      + '\n' + pointText(tr('Equal-loss optimum', '等损失最优点'), equal)
      + '; C′ = ' + fmt(equalBudget) + '. '
      + (st.N < equal.N * (1 - 1e-8) ? tr('Served-token break-even S* = ', '服务 token 回本点 S* = ')
        + fmt((result.budget6 - equalBudget) / (2 * (equal.N - st.N)))
        : st.N > equal.N * (1 + 1e-8) ? tr(
          'This model costs more to train and serve than the equal-loss optimum.',
          '本模型训练和服务成本均高于等损失最优点。') : tr(
          'Already at the equal-loss optimum.', '已在等损失最优点。'))
      + '\n' + tr('These are fitted predictions and hardware/price assumptions, not measured '
        + 'quality or elapsed time. Inference attention, extra overhead and time variation are omitted.',
        '这些是拟合预测以及硬件和价格假设，并非实测质量或耗时。未计入推理注意力、额外开销和耗时波动。')
      + (result.days > 60 ? '\n' + tr('Calendar estimate: ', '日历耗时估计：')
        + (result.days / 30.44).toFixed(1) + tr(' months (30.44 days each).', ' 个月（每月 30.44 天）。') : '')
    payback.style.whiteSpace = 'pre-line'
    ;[[twentyButton, result.twenty], [optimumButton, result.optimal]].forEach(function (pair) {
      pair[0].disabled = pair[1].N < 1e8 || pair[1].N > 1e12
        || pair[1].D < 1e9 || pair[1].D > 1e14
    })
    chart.redraw()
  }
  update()
})
