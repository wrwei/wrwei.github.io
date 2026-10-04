/* Module 08: explicit component estimates, not an allocator peak prediction. */
AIW.register('memory-planner', function (el) {
  'use strict'
  var h = AIW.h, tr = AIW.t, C = AIW.C
  var st = { L: 36, d: 4096, heads: 32, kv: 8, ff: 15360, V: 152064,
    tied: false, power: 13, batch: 1, ranks: 8, tp: 1, scheme: '16',
    checkpoint: 'none', flash: true, memory: 80 }
  var controls = h('div', { class: 'w-controls' }), readout = h('div', {
    class: 'w-readout', 'aria-live': 'polite' }), note = h('p', { class: 'w-note' })
  var chartWrap = h('div'), table = h('table', { class: 'w-table' }), chart, result
  function change(key, value) { st[key] = value; update() }
  function slider(key, label, min, max, step, format) {
    controls.appendChild(AIW.slider({ label: label, min: min, max: max, step: step,
      value: st[key], fmt: format, onInput: function (v) { change(key, v) } }))
  }
  function number(key, label, min, max) {
    var input = h('input', { type: 'number', min: min, max: max, step: 1,
      style: { width: '14ch', maxWidth: '100%' },
      value: st[key], oninput: function () {
        change(key, Math.max(min, Math.min(max, Math.round(Number(input.value) || min))))
      } })
    controls.appendChild(h('label', { class: 'w-ctl' }, label, input))
  }
  function select(key, label, options) {
    controls.appendChild(AIW.select({ label: label, options: options, value: st[key],
      onChange: function (v) { change(key, v) } }))
  }
  slider('L', tr('Layers L', '层数 L'), 2, 128, 1, String)
  slider('d', tr('Width d', '宽度 d'), 256, 16384, 128, String)
  number('heads', tr('Query heads', '查询头数'), 1, 256)
  number('kv', tr('KV heads', 'KV 头数'), 1, 256)
  number('ff', tr('FFN width', '前馈网络宽度'), 128, 262144)
  number('V', tr('Vocabulary V', '词表大小 V'), 1, 1000000)
  controls.appendChild(AIW.checkbox(tr('Tied embeddings', '绑定嵌入'), st.tied,
    function (v) { change('tied', v) }))
  slider('power', tr('Sequence length T', '序列长度 T'), 9, 17, 1,
    function (v) { return String(Math.pow(2, v)) })
  slider('batch', tr('Micro-batch per GPU', '每 GPU 微批量'), 1, 32, 1, String)
  number('ranks', tr('Sharding degree', '分片度'), 1, 1024)
  select('tp', tr('Tensor parallelism (sequence parallel)', '张量并行（含序列并行）'),
    [1, 2, 4, 8].map(function (v) { return [String(v), String(v)] }))
  select('scheme', tr('State precision', '模型状态精度'), [
    ['16', tr('bf16 + fp32 master + Adam: 16 B', 'bf16 + fp32 主权重 + Adam：16 B')],
    ['18', tr('fp32 gradients: 18 B', 'fp32 梯度：18 B')],
    ['10', tr('8-bit Adam states: 10 B', '8 位 Adam 状态：10 B')]])
  select('checkpoint', tr('Activation checkpointing', '激活检查点'), [
    ['none', tr('None', '无')], ['selective', tr('Selective', '选择性')],
    ['full', tr('Full', '完整')]])
  controls.appendChild(AIW.checkbox(tr('FlashAttention', 'FlashAttention'), st.flash,
    function (v) { change('flash', v) }))
  select('memory', tr('GPU allocation (decimal GB)', 'GPU 容量（十进制 GB）'),
    [24, 40, 80, 141, 192].map(function (v) { return [String(v), v + ' GB'] }))
  el.appendChild(controls); el.appendChild(readout); el.appendChild(chartWrap)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Blue: weights; orange: gradients; green: optimiser; purple: activations; sky: fp32 logits. '
      + 'Hatching marks the subtotal above capacity. Long bars are capped at 3× capacity.',
    '蓝色：权重；橙色：梯度；绿色：优化器；紫色：激活；浅蓝色：fp32 logits。'
      + '斜线表示超过容量的部分；过长的柱最多显示到容量的 3 倍。')))
  el.appendChild(table); el.appendChild(note)
  function calculate() {
    var T = Math.pow(2, st.power), dh = Math.round(st.d / st.heads)
    var kvWidth = st.kv * dh, queryWidth = st.heads * dh
    var N = st.L * (2 * st.d * queryWidth + 2 * st.d * kvWidth
      + 3 * st.d * st.ff + 2 * st.d) + st.V * st.d * (st.tied ? 1 : 2) + st.d
    var P = N / Number(st.tp), g = st.scheme === '18' ? 4 : 2
    var optimiser = st.scheme === '10' ? 6 : 12
    var A = (12 * st.d + 4 * kvWidth + 6 * st.ff) / Number(st.tp)
    var activation = st.checkpoint === 'full'
      ? 2 * st.d * st.batch * T * st.L / Number(st.tp) + A * st.batch * T
      : A * st.batch * T * st.L
    if (!st.flash && st.checkpoint === 'none') {
      activation += 2 * st.heads * T * T * st.batch * st.L / Number(st.tp)
    }
    var logits = 4 * st.batch * T * st.V / Number(st.tp)
    var states = [[2 * P, g * P, optimiser * P],
      [2 * P, g * P, optimiser * P / st.ranks],
      [2 * P, g * P / st.ranks, optimiser * P / st.ranks],
      [2 * P / st.ranks, g * P / st.ranks, optimiser * P / st.ranks]]
    var bars = states.map(function (parts) {
      return parts.concat([activation, logits]).map(function (bytes) { return bytes / 1e9 })
    })
    var extra = st.checkpoint === 'full' ? 1 / 3 : st.checkpoint === 'selective'
      ? 2 * st.L * T * st.d / (6 * N + 6 * st.L * T * st.d) : 0
    return { N: N, dh: dh, A: A, bars: bars, extra: extra,
      communication: st.ranks === 1 ? [0, 0, 0, 0]
        : [4 * P / 1e9, 4 * P / 1e9, 4 * P / 1e9, 6 * P / 1e9] }
  }
  function gb(value) { return value >= 1000 ? (value / 1000).toFixed(2) + ' TB'
    : value.toFixed(1) + ' GB' }
  chart = AIW.canvas(chartWrap, { aspect: 1.05, maxHeight: 360 }, function (ctx, w, height) {
    if (!result) return
    var capacity = Number(st.memory), max = 3 * capacity
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 0, x1: 4, y0: 0, y1: max,
      ylabel: tr('GB per GPU', '每 GPU 的 GB'),
      xticks: 4, xfmt: function () { return '' },
      yfmt: function (v) { return String(Math.round(v)) },
      pad: { l: 48, r: 8, t: 28, b: 36 } })
    var colours = [C.blue, C.orange, C.green, C.purple, C.sky]
    result.bars.forEach(function (parts, i) {
      var total = parts.reduce(function (sum, x) { return sum + x }, 0)
      var x = axes.X(i + 0.18), bw = axes.X(i + 0.82) - x, base = 0
      parts.forEach(function (value, j) {
        var top = Math.min(max, base + value), bottom = Math.min(max, base)
        ctx.fillStyle = colours[j]
        ctx.fillRect(x, axes.Y(top), bw, axes.Y(bottom) - axes.Y(top)); base += value
      })
      if (total > capacity) {
        ctx.save(); ctx.beginPath(); ctx.rect(x, axes.Y(Math.min(max, total)), bw,
          axes.Y(capacity) - axes.Y(Math.min(max, total))); ctx.clip()
        ctx.strokeStyle = C.navy; ctx.lineWidth = 1
        for (var y = 0; y < height + bw; y += 8) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + bw, y - bw); ctx.stroke()
        }
        ctx.restore()
      }
      ctx.fillStyle = C.navy; ctx.font = '11px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(gb(total), x + bw / 2, Math.max(16, axes.Y(Math.min(total, max)) - 7))
      ctx.fillText(i === 0 ? 'DP' : 'ZeRO-' + i, x + bw / 2, height - 12)
    })
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(axes.X(0), axes.Y(capacity))
    ctx.lineTo(axes.X(4), axes.Y(capacity)); ctx.stroke(); ctx.setLineDash([])
  })
  function update() {
    result = calculate()
    readout.textContent = 'N = ' + result.N.toLocaleString('en-GB')
      + '; dₕ = ' + result.dh + '; d_ff/d = ' + (st.ff / st.d).toFixed(2)
      + tr('; activation bytes/token/layer = ', '；每 token 每层激活字节 = ')
      + result.A.toFixed(0) + tr('; state B/parameter = ', '；每参数状态字节 = ')
      + st.scheme + tr('; recomputation estimate +', '；重计算估计 +')
      + (100 * result.extra).toFixed(1) + '%'
    table.textContent = ''
    table.appendChild(h('tr', null, h('th', null, tr('Strategy', '策略')),
      h('th', null, tr('Subtotal', '小计')), h('th', null, tr('Capacity', '容量'))))
    result.bars.forEach(function (parts, i) {
      var total = parts.reduce(function (sum, x) { return sum + x }, 0)
      table.appendChild(h('tr', null, h('td', null, i === 0 ? 'DP' : 'ZeRO-' + i),
        h('td', null, gb(total)), h('td', null, total <= Number(st.memory)
          ? tr('Within subtotal', '小计在容量内') : tr('Does not fit', '无法容纳'))))
      var labels = [tr('Weights ', '权重 '), tr('gradients ', '梯度 '),
        tr('optimiser ', '优化器 '), tr('activations ', '激活 '), 'logits ']
      table.appendChild(h('tr', null, h('td', { colspan: 3 },
        parts.map(function (value, j) { return labels[j] + gb(value) }).join('; '))))
      table.appendChild(h('tr', null, h('td', { colspan: 3 },
        tr('Approx. bf16 communication: ', '近似 bf16 通信量：')
        + gb(result.communication[i]) + (i === 3 ? tr(' / micro-batch', ' / 微批量')
          : tr(' / optimiser step', ' / 优化器步')))))
    })
    var warning = st.d % st.heads || st.heads % st.kv || st.kv > st.heads
    note.textContent = (warning ? tr(
      'Warning: heads do not divide the requested shape; dₕ is rounded for this illustration. ',
      '警告：头数不能整除所选形状；本示例对 dₕ 取整。') : '') + tr(
      'These component estimates omit peak gathered weights, communication buffers, allocator '
        + 'overhead and uneven tensor partitions. Measure the peak before claiming a run fits.',
      '这些分项估计未包含权重聚集峰值、通信缓冲区、分配器开销和不均匀张量分片。'
        + '判断能否运行前需要实测峰值。')
    chart.redraw()
  }
  update()
})
