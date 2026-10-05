AIW.register('serving-calculator', function (el) {
  'use strict'
  var h = AIW.h, t = AIW.t, C = AIW.C
  var models = {
    case: [9.550729216, 8.927875072, 36, 4096, 8, 128],
    mha: [6.7, 6.61, 32, 4096, 32, 128],
    gqa: [7.6, 7.07, 28, 3584, 4, 128],
    smol: [.361821120, .361821120, 32, 960, 5, 64]
  }
  var devices = { consumer: [24, 1, 165], l4: [24, .30, 121], l40: [48, .864, 362],
    a100: [80, 2.039, 312], h100: [80, 3.35, 989], laptop: [16, .09, .5] }
  var state = { model: 'case', n: models.case[0], mat: models.case[1], layers: 36, d: 4096,
    kv: 8, head: 128, precision: '4', bits: 4.125, cache: 2, prompt: 4000, output: 2000, batch: 18,
    device: 'consumer', memory: 24, bw: 1, peak: 165, overhead: 2.5, mfu: .5, fraction: 1 }
  var controls = h('div', { class: 'w-controls' }), fields = {}
  var modelSelect, deviceSelect, customBits
  function number(key, en, zh, min, max, step) {
    var input = h('input', { type: 'number', min: min, max: max, step: step || 'any', value: state[key],
      'aria-label': t(en, zh), style: { width: '100%', minWidth: '0', boxSizing: 'border-box' } })
    input.addEventListener('input', function () {
      var value = Number(input.value)
      if (!Number.isFinite(value) || input.value === '') return
      state[key] = Math.max(min, Math.min(max, value))
      if (['layers', 'd', 'kv', 'head'].indexOf(key) >= 0) {
        state[key] = Math.round(state[key]); input.value = state[key]
      }
      if (['n', 'mat', 'layers', 'd', 'kv', 'head'].indexOf(key) >= 0) {
        state.model = 'custom'; modelSelect.querySelector('select').value = 'custom'
      }
      if (['memory', 'bw', 'peak'].indexOf(key) >= 0) {
        state.device = 'custom'; deviceSelect.querySelector('select').value = 'custom'
      }
      if (key === 'n' && state.mat > state.n) { state.mat = state.n; fields.mat.value = state.mat }
      if (key === 'mat' && state.mat > state.n) { state.mat = state.n; input.value = state.mat }
      render()
    })
    fields[key] = input
    return h('label', { class: 'w-ctl' }, h('span', { text: t(en, zh) }), input)
  }
  modelSelect = AIW.select({ label: t('Model preset', '模型预设'), value: 'case', options: [
    ['case', t('Case study 9.5B', '案例模型 9.5B')], ['mha', t('7B multi-head example', '7B 多头示例')],
    ['gqa', t('7B GQA example', '7B GQA 示例')], ['smol', 'SmolLM2-360M'], ['custom', t('Custom', '自定义')]],
    onChange: function (value) {
      state.model = value
      if (models[value]) ['n', 'mat', 'layers', 'd', 'kv', 'head'].forEach(function (key, i) {
        state[key] = models[value][i]; fields[key].value = state[key]
      })
      render()
    } })
  controls.appendChild(modelSelect)
  ;[['n', 'Total parameters (billions)', '总参数（十亿）', .1, 1000],
    ['mat', 'Matrix-FLOP parameters (billions)', '矩阵 FLOP 参数（十亿）', .001, 1000],
    ['layers', 'Layers L', '层数 L', 1, 200, 1], ['d', 'Model width d', '模型宽度 d', 256, 32768, 1],
    ['kv', 'KV heads', 'KV 头数', 1, 128, 1], ['head', 'Head dimension', '头维度', 32, 256, 1]]
    .forEach(function (args) { controls.appendChild(number.apply(null, args)) })
  controls.appendChild(AIW.select({ label: t('Weight storage', '权重存储'), value: '4', options: [
    ['16', 'bf16'], ['8', 'int8'], ['4', t('Int4 + group-128 scales', 'int4 + 分组 128 缩放因子')],
    ['custom', t('Custom bits/weight', '自定义每权重位数')]], onChange: function (v) { state.precision = v; render() } }))
  customBits = number('bits', 'Custom bits/weight', '自定义每权重位数', 2, 32)
  controls.appendChild(customBits)
  controls.appendChild(AIW.select({ label: t('Cache value storage', 'KV cache 值存储'), value: '2',
    options: [['2', t('bf16 · 2 bytes', 'bf16 · 2 字节')], ['1', t('One-byte · metadata excluded', '一字节 · 不含元数据')]],
    onChange: function (v) { state.cache = Number(v); render() } }))
  ;[['prompt', 'Prompt tokens', '提示 token 数', 128, 131072], ['output', 'Output tokens', '输出 token 数', 16, 32768],
    ['batch', 'Concurrent sequences B', '并发序列 B', 1, 512]].forEach(function (a) {
    controls.appendChild(AIW.slider({ label: t(a[1], a[2]), min: a[3], max: a[4], value: state[a[0]], log: true,
      fmt: function (v) { return String(Math.round(v)) }, onInput: function (v) { state[a[0]] = Math.round(v); render() } }))
  })
  deviceSelect = AIW.select({ label: t('Accelerator profile', '加速器配置'), value: 'consumer', options: [
    ['consumer', t('24 GB · 1.0 TB/s · 165 TFLOP/s', '24 GB · 1.0 TB/s · 165 TFLOP/s')],
    ['l4', 'L4 · 24 GB · 0.30 TB/s'], ['l40', 'L40S · 48 GB · 0.864 TB/s'],
    ['a100', 'A100 · 80 GB · 2.039 TB/s'], ['h100', 'H100 · 80 GB · 3.35 TB/s'],
    ['laptop', t('Laptop example · assumed compute', '笔记本示例 · 假设计算性能')], ['custom', t('Custom', '自定义')]],
    onChange: function (v) { state.device = v; if (devices[v]) ['memory', 'bw', 'peak'].forEach(function (key, i) {
      state[key] = devices[v][i]; fields[key].value = state[key]
    }); render() } })
  controls.appendChild(deviceSelect)
  ;[['memory', 'Capacity (decimal GB)', '容量（十进制 GB）', 1, 2000],
    ['bw', 'Bandwidth (TB/s)', '带宽（TB/s）', .001, 100], ['peak', 'Dense compute (TFLOP/s)', '稠密计算（TFLOP/s）', .01, 10000],
    ['overhead', 'Runtime allowance (GB)', '运行时预留（GB）', 0, 2000],
    ['mfu', 'Prefill MFU assumption', '预填充 MFU 假设', .1, 1],
    ['fraction', 'Achieved bandwidth fraction', '实际带宽占峰值比例', .3, 1]].forEach(function (a) { controls.appendChild(number.apply(null, a)) })
  var readout = h('div', { class: 'w-readout', 'aria-live': 'polite', style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } })
  var memoryPlot = h('div'), chart = h('div'), note = h('p', { class: 'w-note' }, t(
    'Decimal units. GPU profiles are dated examples; efficiency and overhead are assumptions. Editing model/device fields selects Custom. Cache scale metadata, prefix sharing, embedding-read refinement and prefill interference are excluded.',
    '使用十进制单位。GPU 配置是有日期的示例；效率和开销为假设。编辑模型或设备字段会切换为自定义。不计 KV cache 缩放元数据、前缀共享、嵌入查表修正和预填充干扰。'))
  el.appendChild(controls); el.appendChild(memoryPlot); el.appendChild(readout); el.appendChild(chart); el.appendChild(note)
  var result
  function calculate() {
    var bits = state.precision === 'custom' ? state.bits : (state.precision === '4' ? 4.125 : Number(state.precision))
    var weights = state.model === 'case' && state.precision === '4' ? 5.5e9 : state.n * 1e9 * bits / 8
    var kv = 2 * state.layers * state.kv * state.head * state.cache
    var free = state.memory * 1e9 - weights - state.overhead * 1e9
    var cacheSequence = kv * (state.prompt + state.output)
    var maximum = Math.max(0, Math.floor(free / cacheSequence))
    var mean = state.prompt + state.output / 2
    var ttft = (2 * state.mat * 1e9 * state.prompt + 2 * state.layers * state.d * state.prompt * state.prompt) /
      (state.mfu * state.peak * 1e12)
    function step(b) {
      var memory = (weights + b * kv * mean) / (state.bw * 1e12 * state.fraction)
      var compute = (2 * state.mat * 1e9 * b + 4 * state.layers * state.d * mean * b) / (state.peak * 1e12)
      return { seconds: Math.max(memory, compute), bound: memory >= compute ? 'memory' : 'compute' }
    }
    var current = step(state.batch)
    return { weights: weights, kv: kv, free: free, cacheSequence: cacheSequence, maximum: maximum,
      ttft: ttft, seconds: current.seconds, bound: current.bound, solo: 1 / current.seconds,
      aggregate: state.batch / current.seconds, fits: state.batch <= maximum, step: step }
  }
  var bar = AIW.canvas(memoryPlot, { aspect: .30, maxHeight: 85 }, function (ctx, w, height) {
    if (!result) return
    var total = state.memory * 1e9, x = 8, usable = w - 16
    var amounts = [result.weights, state.overhead * 1e9, state.batch * result.cacheSequence]
    var colours = [C.blue, C.orange, result.fits ? C.green : C.red]
    amounts.forEach(function (a, i) { var width = Math.max(0, Math.min(a / total * usable, w - 8 - x)); ctx.fillStyle = colours[i]; ctx.fillRect(x, 10, width, 22); x += width })
    ctx.strokeStyle = C.muted; ctx.strokeRect(8, 10, usable, 22)
    ctx.font = '12px system-ui'; ctx.fillStyle = C.navy
    ctx.fillText(t('Weights | runtime | requested cache', '权重 | 运行时 | 所需 KV cache'), 8, 52)
  })
  var plot = AIW.canvas(chart, { aspect: .60, maxHeight: 340 }, function (ctx, w, height) {
    if (!result || result.maximum === 0) {
      ctx.fillStyle = C.red; ctx.font = '13px system-ui'; ctx.fillText(t('No full request fits this budget.', '该预算无法容纳完整请求。'), 12, 35); return
    }
    var values = [], max = 1, min = Infinity
    for (var i = 0; i <= 100; i++) {
      var b = Math.pow(512, i / 100), sec = result.step(b).seconds
      values.push([b, 1 / sec, b / sec]); max = Math.max(max, b / sec); min = Math.min(min, 1 / sec)
    }
    var a = AIW.axes(ctx, { w: w, h: height, x0: 0, x1: Math.log10(512), y0: min * .7, y1: max * 1.4,
      logY: true, xlabel: t('B (log scale)', 'B（对数刻度）'), ylabel: t('tokens/s', 'token/s'), xfmt: function (v) { return Math.round(Math.pow(10, v)) } })
    if (result.maximum < 512) {
      ctx.fillStyle = 'rgba(220,38,38,.07)'; var boundary = a.X(Math.log10(result.maximum))
      ctx.fillRect(boundary, 12, a.X(Math.log10(512)) - boundary, height - 46)
      ctx.strokeStyle = C.red; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(boundary, 12); ctx.lineTo(boundary, height - 34); ctx.stroke(); ctx.setLineDash([])
    }
    ;[1, 2].forEach(function (column) {
      ctx.strokeStyle = column === 1 ? C.blue : C.green; ctx.lineWidth = 2; ctx.beginPath()
      values.forEach(function (v, i) { var x = a.X(Math.log10(v[0])), y = a.Y(v[column]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y) }); ctx.stroke()
      ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(a.X(Math.log10(state.batch)), a.Y(column === 1 ? result.solo : result.aggregate), 4, 0, 2 * Math.PI); ctx.fill()
    })
    ctx.font = '12px system-ui'; ctx.fillStyle = C.blue; ctx.fillText(t('Per sequence', '每序列'), 58, 27)
    ctx.fillStyle = C.green; ctx.fillText(t('Aggregate', '总吞吐量'), 58, 45)
  })
  function render() {
    result = calculate(); fields.bits.disabled = state.precision !== 'custom'
    var needed = (result.weights + state.overhead * 1e9 + state.batch * result.cacheSequence) / 1e9
    readout.style.color = result.fits ? C.navy : C.orange
    readout.textContent = [t('Weights: ', '权重：') + AIW.fmt(result.weights / 1e9, 3) + ' GB',
      t('KV per token: ', '每 token KV cache：') + result.kv + ' B (' + AIW.fmt(result.kv / 1000, 3) + ' kB)',
      t('KV per full sequence: ', '每个完整序列 KV cache：') + AIW.fmt(result.cacheSequence / 1e9, 3) + ' GB',
      t('Maximum concurrent sequences: ', '最大并发序列数：') + result.maximum,
      t('Prefill / TTFT bound: ', '预填充 / TTFT 估算：') + AIW.fmt(result.ttft, 3) + ' s',
      t('Decode step: ', '解码步：') + AIW.fmt(result.seconds * 1000, 2) + ' ms · ' + (result.bound === 'memory' ? t('bandwidth-bound', '带宽受限') : t('compute-bound', '计算受限')),
      t('Per sequence / aggregate: ', '每序列 / 总吞吐量：') + AIW.fmt(result.solo, 1) + ' / ' + AIW.fmt(result.aggregate, 1) + ' tokens/s',
      t('Decode budget (output × step): ', '解码预算（输出数 × 步长）：') + AIW.fmt(state.output * result.seconds, 2) + ' s',
      result.fits ? t('Fits the stated memory budget.', '符合所设内存预算。') : t('Does not fit: needs ', '无法容纳：需要 ') + AIW.fmt(needed, 2) + ' GB; ' + t('available ', '可用 ') + state.memory + ' GB',
      result.free <= 0 ? t('Weights and runtime exceed capacity.', '权重和运行时已超过容量。') : ''
    ].join('\n')
    el._result = Object.assign({}, result, { step: undefined }); bar.redraw(); plot.redraw()
  }
  render()
})
