/* ssm-kernel-explorer — Module 04, Section 13: a linear time-invariant recurrence and a convolution with
 * its impulse response are the same map; the eigenvalue's modulus sets the memory and its angle the
 * oscillation; an input-dependent step (Mamba-style selectivity) removes the fixed kernel.
 *
 * Discrete view: lambda = r e^{i theta}, bbar = 1, c = 1.
 * Continuous view: s = -alpha + i omega, lambda = e^{s Delta} (zero-order hold),
 *   bbar = (e^{s Delta} - 1)/s (complex division; Delta(1 + s Delta/2) when |s Delta| < 1e-6), c = 1.
 * Recurrence:  h_0 = 0; h = lambda h + bbar x_t; y_t = Re(h).
 * Convolution: K_k = Re(c lambda^k bbar) (lambda^k by repeated multiplication), y_t = sum_{k<=t} K_k x_{t-k}.
 * Selective:   real state, Delta_t = softplus(w x_t + c), a_t = exp(-alpha Delta_t), b_t = Delta_t,
 *   h_t = a_t h_{t-1} + b_t x_t. With w = 0 the step is constant, so a fixed kernel K_k = a^k b returns. */
AIW.register('ssm-kernel-explorer', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h, C = AIW.C
  var PI = Math.PI
  var NMAX = 400

  var S = {
    r: t('modulus |λ| = r', '模 |λ| = r'),
    th: t('angle θ', '角 θ'),
    sig: t('input signal', '输入信号'),
    T: t('sequence length T', '序列长度 T'),
    cont: t('continuous-time view (pole s, step Δ)', '连续时间视图（极点 s，步长 Δ）'),
    sel: t('selective step (Mamba-style)', '选择性步长（Mamba 式）'),
    alpha: t('pole decay α (s = −α + iω)', '极点衰减率 α（s = −α + iω）'),
    omega: t('pole frequency ω', '极点频率 ω'),
    delta: t('step Δ', '步长 Δ'),
    w: t('weight w (Δ_t = softplus(w·x_t + c))', '权重 w（Δ_t = softplus(w·x_t + c)）'),
    c: t('bias c', '偏置 c'),
    alphaS: t('decay rate α (a_t = exp(−α Δ_t))', '衰减率 α（a_t = exp(−α Δ_t)）'),
    thIgnored: t('θ is ignored in the selective view', '选择性视图中忽略 θ'),
    kernelTitle: t('Impulse response (kernel) K_k = Re(c λ^k b̄)', '脉冲响应（卷积核）K_k = Re(c λ^k b̄)'),
    signalTitle: t('Input and output', '输入与输出'),
    retTitle: t('Retention a_t = exp(−α Δ_t) (1 = keep the state, 0 = reset it)', '保留系数 a_t = exp(−α Δ_t)（1 = 保持状态，0 = 重置状态）'),
    noKernel: t('no fixed kernel: the step depends on the input', '没有固定的卷积核：步长取决于输入'),
    lagK: t('lag k (steps)', '滞后 k（步）'),
    timeT: t('t (steps)', 't（步）'),
    legX: t('input x_t', '输入 x_t'), legRec: t('output by recurrence', '递推输出'),
    legConv: t('output by convolution (dots)', '卷积输出（圆点）'), legEnv: t('envelope ±|c b̄| r^k', '包络 ±|c b̄| r^k'),
    legKer: t('kernel K_k', '卷积核 K_k'), legRet: t('retention a_t', '保留系数 a_t'),
    note: t('One complex mode with a real output is equivalent to a real two-state system: a damped oscillator. The recurrence is the way to run it; the kernel is the way to train it (as one parallel convolution).',
      '一个复模态加实数输出，等价于一个实二维状态系统：阻尼振荡器。递推是运行它的方式；卷积核是训练它的方式（一次并行卷积）。'),
    tip: t('One complex mode with a real output is equivalent to a real two-state system, a damped oscillator.',
      '一个复模态加实数输出，等价于一个实二维状态系统，即阻尼振荡器。'),
    noteSel: t('Selective mode: the state is real and the step Δ_t is a gate. A large Δ_t resets the state (a_t → 0) and writes the input (b_t = Δ_t); a small Δ_t keeps the state and ignores the input. Set w = 0 and the step is constant: the kernel and the dots return.',
      '选择性模式：状态为实数，步长 Δ_t 起门的作用。Δ_t 大时重置状态（a_t → 0）并写入输入（b_t = Δ_t）；Δ_t 小时保持状态、忽略输入。令 w = 0，步长恒定：卷积核和圆点重新出现。'),
    steps: t('steps', '步'), inf: '∞'
  }
  var SIGS = [
    ['impulse', t('unit impulse at t = 5', '在 t = 5 的单位脉冲')],
    ['step', t('step from t = 5', '从 t = 5 起的阶跃')],
    ['pulse', t('square pulse t = 5–24', '方波脉冲 t = 5–24')],
    ['sine', t('noisy sine (period 30)', '含噪正弦（周期 30）')],
    ['two', t('two impulses at t = 5 and t = 60', '在 t = 5 和 t = 60 的两个脉冲')]
  ]

  // ---------------- maths ----------------
  // position u in [0,1] -> r: first half linear 0.5..0.9, second half logarithmic in 1 - r from 0.1 to 0.001
  function rFromU(u) {
    if (u <= 0.5) return 0.5 + 0.4 * (u / 0.5)
    return 1 - 0.1 * Math.pow(0.01, (u - 0.5) / 0.5)
  }
  function uFromR(r) {
    if (r <= 0.9) return (r - 0.5) / 0.4 * 0.5
    return 0.5 + 0.5 * Math.log((1 - r) / 0.1) / Math.log(0.01)
  }
  function softplus(z) { return z > 30 ? z : Math.log1p(Math.exp(z)) }
  var noise = (function () { var g = AIW.rng(4), a = []; for (var i = 0; i < NMAX; i++) a.push(AIW.gauss(g)); return a })()
  function signal(kind, T) {
    var x = new Array(T), i
    for (i = 0; i < T; i++) {
      var v = 0
      if (kind === 'impulse') v = i === 5 ? 1 : 0
      else if (kind === 'step') v = i >= 5 ? 1 : 0
      else if (kind === 'pulse') v = (i >= 5 && i <= 24) ? 1 : 0
      else if (kind === 'sine') v = Math.sin(2 * PI * i / 30) + 0.3 * noise[i]
      else if (kind === 'two') v = (i === 5 || i === 60) ? 1 : 0
      x[i] = v
    }
    return x
  }
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]] }
  function cdiv(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d] }

  function compute(p) {
    var T = p.T, x = signal(p.sig, T), k, i, m = { x: x, T: T, mode: p.sel ? 'sel' : (p.cont ? 'cont' : 'disc') }
    var y = new Array(T), K = null, conv = null
    if (m.mode === 'sel') {
      var D = new Array(T), a = new Array(T), hh = 0
      for (i = 0; i < T; i++) {
        D[i] = softplus(p.w * x[i] + p.c); a[i] = Math.exp(-p.alphaS * D[i])
        hh = a[i] * hh + D[i] * x[i]; y[i] = hh
      }
      m.D = D; m.a = a
      m.const = p.w === 0
      if (m.const) {
        var a0 = Math.exp(-p.alphaS * D[0]), b0 = D[0], pw = 1
        K = new Array(T)
        for (k = 0; k < T; k++) { K[k] = pw * b0; pw *= a0 }
        m.lam = [a0, 0]; m.bb = [b0, 0]
      }
    } else {
      var lam, bb
      if (m.mode === 'disc') {
        lam = [p.r * Math.cos(p.theta), p.r * Math.sin(p.theta)]; bb = [1, 0]
      } else {
        var sD = [-p.alphaC * p.delta, p.omega * p.delta], e = Math.exp(sD[0])
        lam = [e * Math.cos(sD[1]), e * Math.sin(sD[1])]
        if (Math.hypot(sD[0], sD[1]) < 1e-6) bb = [p.delta * (1 + sD[0] / 2), p.delta * sD[1] / 2]
        else bb = cdiv([lam[0] - 1, lam[1]], [-p.alphaC, p.omega])
      }
      m.lam = lam; m.bb = bb
      var hr = 0, hi = 0
      for (i = 0; i < T; i++) {
        var nr = lam[0] * hr - lam[1] * hi + bb[0] * x[i], ni = lam[0] * hi + lam[1] * hr + bb[1] * x[i]
        hr = nr; hi = ni; y[i] = hr
      }
      K = new Array(T)
      var pk = [1, 0]
      for (k = 0; k < T; k++) { K[k] = cmul(pk, bb)[0]; pk = cmul(pk, lam) }
    }
    m.y = y; m.K = K
    if (K) {
      conv = new Array(T)
      var maxd = 0
      for (i = 0; i < T; i++) {
        var s = 0
        for (k = 0; k <= i; k++) s += K[k] * x[i - k]
        conv[i] = s
        var d = Math.abs(s - y[i]); if (d > maxd) maxd = d
      }
      m.conv = conv; m.maxd = maxd
    }
    return m
  }

  // ---------------- UI ----------------
  var P = { r: 0.95, theta: PI / 8, sig: 'impulse', T: 120, cont: false, sel: false,
    alphaC: 0.05, omega: PI / 8, delta: 1, w: 3, c: -3, alphaS: 1 }
  var model = null

  function piFmt(v) {
    var q = v / PI * 64, n = Math.round(q)
    if (Math.abs(q - n) < 1e-6) {
      if (n === 0) return '0'
      var g = function (a, b) { return b ? g(b, a % b) : a }, d = g(n, 64), nn = n / d, dd = 64 / d
      return (nn === 1 ? '' : nn) + 'π' + (dd === 1 ? '' : '/' + dd)
    }
    return AIW.fmt(v / PI, 3) + 'π'
  }
  function z(x) { return Math.abs(x) < 1e-12 ? 0 : x }
  var sR = AIW.slider({ label: S.r, min: 0, max: 1, value: uFromR(P.r), fmt: function (u) { return AIW.fmt(rFromU(u), 3) },
    onInput: function (u) { P.r = Math.min(0.999, rFromU(u)); update() } })
  var sTh = AIW.slider({ label: S.th, min: 0, max: 64, step: 1, value: 8, fmt: function (n) { return piFmt(Math.round(n) * PI / 64) },
    onInput: function (n) { P.theta = Math.round(n) * PI / 64; update() } })
  var ticks = h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.68rem', color: C.muted, fontFamily: 'var(--font-mono)' } },
    h('span', { text: '0' }), h('span', { text: 'π/4' }), h('span', { text: 'π/2' }), h('span', { text: '3π/4' }), h('span', { text: 'π' }))
  sTh.insertBefore(ticks, sTh.lastChild)
  var sSig = AIW.select({ label: S.sig, options: SIGS, value: P.sig, onChange: function (v) { P.sig = v; update() } })
  var sT = AIW.slider({ label: S.T, min: 50, max: 400, step: 10, value: P.T, fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { P.T = Math.round(v); update() } })
  var cCont = AIW.checkbox(S.cont, false, function (v) { P.cont = v; update() })
  var cSel = AIW.checkbox(S.sel, false, function (v) { P.sel = v; update() })
  var sAC = AIW.slider({ label: S.alpha, min: 0.001, max: 1, log: true, value: P.alphaC, fmt: function (v) { return AIW.fmt(v, 3) },
    onInput: function (v) { P.alphaC = v; update() } })
  var sOm = AIW.slider({ label: S.omega, min: 0, max: 64, step: 1, value: 8, fmt: function (n) { return piFmt(Math.round(n) * PI / 64) },
    onInput: function (n) { P.omega = Math.round(n) * PI / 64; update() } })
  var sDe = AIW.slider({ label: S.delta, min: 0.01, max: 10, log: true, value: P.delta, fmt: function (v) { return AIW.fmt(v, 3) },
    onInput: function (v) { P.delta = v; update() } })
  var sW = AIW.slider({ label: S.w, min: -5, max: 5, step: 0.1, value: P.w, fmt: function (v) { return AIW.fmt(Math.round(v * 10) / 10, 1) },
    onInput: function (v) { P.w = Math.round(v * 10) / 10; update() } })
  var sC = AIW.slider({ label: S.c, min: -5, max: 2, step: 0.1, value: P.c, fmt: function (v) { return AIW.fmt(Math.round(v * 10) / 10, 1) },
    onInput: function (v) { P.c = Math.round(v * 10) / 10; update() } })
  var sAS = AIW.slider({ label: S.alphaS, min: 0.001, max: 1, log: true, value: P.alphaS, fmt: function (v) { return AIW.fmt(v, 3) },
    onInput: function (v) { P.alphaS = v; update() } })
  var thNote = h('span', { class: 'w-note', style: { margin: 0 }, text: S.thIgnored })
  sTh.appendChild(thNote)

  var controls = h('div', { class: 'w-controls' }, sR, sTh, sSig, sT, cCont, cSel, sAC, sOm, sDe, sW, sC, sAS)
  el.appendChild(controls)

  function legend(items) {
    var box = h('div', { class: 'w-legend' })
    items.forEach(function (it) {
      var chip = h('i', { style: { background: it[0] } })
      if (it[2]) { chip.style.height = '7px'; chip.style.width = '7px'; chip.style.borderRadius = '50%' }
      if (it[3]) { chip.style.background = 'transparent'; chip.style.borderTop = '2px dashed ' + it[0]; chip.style.height = '0' }
      box.appendChild(h('span', null, chip, it[1]))
    })
    return box
  }
  var legK = h('div'), legS = h('div')
  function setLegends() {
    legK.textContent = ''; legS.textContent = ''
    legK.appendChild(legend(model && model.mode === 'sel'
      ? [[C.blue, S.legKer]] : [[C.blue, S.legKer], [C.muted, S.legEnv, false, true]]))
    legS.appendChild(legend(model && !model.conv ? [[C.muted, S.legX], [C.blue, S.legRec]]
      : [[C.muted, S.legX], [C.blue, S.legRec], [C.orange, S.legConv, true]]))
  }
  var kTitle = h('div', { class: 'w-note', style: { marginTop: '.2rem', fontWeight: 600, color: C.navy }, text: S.kernelTitle })
  var sTitle = h('div', { class: 'w-note', style: { fontWeight: 600, color: C.navy }, text: S.signalTitle })
  var rTitle = h('div', { class: 'w-note', style: { fontWeight: 600, color: C.navy }, text: S.retTitle })
  var kWrap = h('div'), sWrap = h('div'), rWrap = h('div')
  el.appendChild(kTitle); el.appendChild(legK); el.appendChild(kWrap)
  el.appendChild(sTitle); el.appendChild(legS); el.appendChild(sWrap)
  el.appendChild(rTitle); el.appendChild(rWrap)

  function pickRange(arrs, pad) {
    var lo = 0, hi = 0
    arrs.forEach(function (a) { for (var i = 0; i < a.length; i++) { if (a[i] < lo) lo = a[i]; if (a[i] > hi) hi = a[i] } })
    if (hi - lo < 1e-9) { hi = 1; lo = -1 }
    var e = (hi - lo) * pad
    return [lo - e, hi + e]
  }

  function niceStep(span) {
    var e = Math.pow(10, Math.floor(Math.log10(span / 5))), c = [1, 2, 2.5, 5, 10, 20]
    for (var i = 0; i < c.length; i++) if (span / (c[i] * e) <= 5.0001) return c[i] * e
    return 20 * e
  }
  function niceY(lo, hi) {
    var st = niceStep(hi - lo), a = Math.floor(lo / st + 1e-9), b = Math.ceil(hi / st - 1e-9)
    return { y0: a * st, y1: b * st, n: b - a, st: st }
  }
  function xAxis(T) {
    var st = T <= 60 ? 10 : T <= 140 ? 20 : T <= 250 ? 50 : 50, x1 = Math.ceil((T - 1) / st) * st
    return { x0: 0, x1: x1, xticks: x1 / st }
  }
  function yfm(st) { return function (v) { return AIW.fmt(Math.abs(v) < st * 1e-6 ? 0 : v, st >= 1 ? 0 : Math.max(1, Math.ceil(-Math.log10(st) - 1e-9))) } }

  var kO = { aspect: 0.32, maxHeight: 220 }, sO = { aspect: 0.4, maxHeight: 280 }, rO = { aspect: 0.2, maxHeight: 140 }
  function setAspect() {
    var narrow = (el.clientWidth || 600) < 520
    kO.aspect = narrow ? 0.62 : 0.32; sO.aspect = narrow ? 0.75 : 0.4; rO.aspect = narrow ? 0.4 : 0.2
  }
  setAspect()
  if (window.ResizeObserver) new ResizeObserver(setAspect).observe(el)
  var kC = AIW.canvas(kWrap, kO, function (ctx, w, hgt) {
    if (!model) return
    var m = model, T = m.T, xa
    var yr
    if (m.K) {
      var env = m.mode === 'sel' ? 0 : Math.hypot(m.bb[0], m.bb[1])
      var mx = 0; for (var i = 0; i < m.K.length; i++) mx = Math.max(mx, Math.abs(m.K[i]))
      mx = Math.max(mx, env) * 1.1
      yr = [-mx, mx]
    } else yr = [-1, 1]
    var ny = niceY(yr[0], yr[1]), xa = xAxis(T)
    var ax = AIW.axes(ctx, { w: w, h: hgt, x0: xa.x0, x1: xa.x1, y0: ny.y0, y1: ny.y1, xlabel: S.lagK, ylabel: 'K_k', xticks: xa.xticks, yticks: ny.n,
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: yfm(ny.st) })
    if (!m.K) {
      ctx.save(); ctx.fillStyle = C.slate; ctx.font = '13px "DM Sans", system-ui, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(S.noKernel, (ax.pad.l + w - ax.pad.r) / 2, hgt / 2); ctx.restore()
      return
    }
    ctx.save()
    ctx.strokeStyle = C.slate; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(ax.X(0), ax.Y(0)); ctx.lineTo(ax.X(xa.x1), ax.Y(0)); ctx.stroke()
    if (m.mode !== 'sel') {
      var A = Math.hypot(m.bb[0], m.bb[1]), rr = Math.hypot(m.lam[0], m.lam[1])
      ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4])
      ;[1, -1].forEach(function (sg) {
        ctx.beginPath()
        for (var k = 0; k < T; k++) { var px = ax.X(k), py = ax.Y(sg * A * Math.pow(rr, k)); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py) }
        ctx.stroke()
      })
      ctx.setLineDash([])
    }
    ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = T > 200 ? 1 : 1.5
    for (var j = 0; j < T; j++) {
      var X = ax.X(j), Y = ax.Y(m.K[j])
      ctx.beginPath(); ctx.moveTo(X, ax.Y(0)); ctx.lineTo(X, Y); ctx.stroke()
      ctx.beginPath(); ctx.arc(X, Y, T > 200 ? 1.5 : 2.5, 0, 2 * PI); ctx.fill()
    }
    ctx.restore()
  })

  var sC2 = AIW.canvas(sWrap, sO, function (ctx, w, hgt) {
    if (!model) return
    var m = model, T = m.T
    var yr = pickRange([m.x, m.y, m.conv || []], 0.04), ny = niceY(yr[0], yr[1]), xa = xAxis(T)
    yr = [ny.y0, ny.y1]
    var ax = AIW.axes(ctx, { w: w, h: hgt, x0: xa.x0, x1: xa.x1, y0: ny.y0, y1: ny.y1, xlabel: S.timeT, ylabel: 'x, y', xticks: xa.xticks, yticks: ny.n,
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: yfm(ny.st) })
    ctx.save()
    ctx.beginPath(); ctx.rect(ax.pad.l, ax.pad.t, w - ax.pad.l - ax.pad.r, hgt - ax.pad.t - ax.pad.b); ctx.clip()
    if (yr[0] < 0 && yr[1] > 0) {
      ctx.strokeStyle = C.slate; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(ax.X(0), ax.Y(0)); ctx.lineTo(ax.X(xa.x1), ax.Y(0)); ctx.stroke()
    }
    function line(arr, col, lw) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath()
      for (var i = 0; i < T; i++) { var px = ax.X(i), py = ax.Y(arr[i]); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py) }
      ctx.stroke()
    }
    line(m.x, C.muted, 1.2)
    line(m.y, C.blue, 1.8)
    if (m.conv) {
      ctx.fillStyle = C.orange
      for (var i = 0; i < T; i++) { ctx.beginPath(); ctx.arc(ax.X(i), ax.Y(m.conv[i]), T > 200 ? 1.5 : 2.3, 0, 2 * PI); ctx.fill() }
    }
    ctx.restore()
  })

  var rC = AIW.canvas(rWrap, rO, function (ctx, w, hgt) {
    if (!model || model.mode !== 'sel') return
    var m = model, T = m.T
    var xa = xAxis(T)
    var ax = AIW.axes(ctx, { w: w, h: hgt, x0: xa.x0, x1: xa.x1, y0: 0, y1: 1, xlabel: S.timeT, ylabel: 'a_t', xticks: xa.xticks, yticks: 2,
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: function (v) { return AIW.fmt(v, 1) } })
    ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 1.6; ctx.beginPath()
    for (var i = 0; i < T; i++) { var px = ax.X(i), py = ax.Y(m.a[i]); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py) }
    ctx.stroke(); ctx.restore()
  })

  var readout = h('div', { class: 'w-readout', style: { marginTop: '.6rem' } })
  var noteEl = h('p', { class: 'w-note', title: S.tip })
  el.appendChild(readout); el.appendChild(noteEl)

  function show(node, on) { node.style.display = on ? '' : 'none' }
  function grey(node, off) {
    var inp = node.querySelector('input,select'); if (inp) inp.disabled = off
    node.style.opacity = off ? '0.45' : ''
  }
  function ang(re, im) { return Math.atan2(im, re) }
  function f(x, d) { return AIW.fmt(z(x), d) }
  function sci(x) { return x === 0 ? '0' : x.toExponential(1).replace('-', '−') }
  function stepsFmt(x) { return isFinite(x) ? f(x, 2) : S.inf }

  function update() {
    var sel = P.sel, cont = P.cont && !sel
    show(sR, !cont && !sel); show(sTh, !cont); grey(sTh, sel)
    show(thNote, sel); show(sAC, cont); show(sOm, cont); show(sDe, cont)
    show(sW, sel); show(sC, sel); show(sAS, sel)
    grey(cCont, sel)
    show(rTitle, sel); show(rWrap, sel)
    kTitle.textContent = sel ? t('Kernel: exists only while the step is constant, K_k = a^k b', '卷积核：仅在步长恒定时存在，K_k = a^k b') : S.kernelTitle
    model = compute(P)
    setLegends()
    kC.redraw(); sC2.redraw(); rC.redraw()
    var m = model, L = []
    if (m.mode === 'sel') {
      var dmin = Math.min.apply(null, m.D), dmax = Math.max.apply(null, m.D), amin = Math.min.apply(null, m.a), amax = Math.max.apply(null, m.a)
      L.push('Δ_t = softplus(' + f(P.w, 1) + '·x_t ' + (P.c < 0 ? '− ' : '+ ') + f(Math.abs(P.c), 1) + ')   α = ' + f(P.alphaS, 3))
      L.push(t('Δ_t range: ', 'Δ_t 范围：') + f(dmin, 4) + ' … ' + f(dmax, 4))
      L.push(t('a_t range: ', 'a_t 范围：') + f(amin, 4) + ' … ' + f(amax, 4) + t('   b_t = Δ_t', '   b_t = Δ_t'))
      if (m.const) {
        var a0 = m.lam[0]
        L.push(t('w = 0: constant step, a = ', 'w = 0：步长恒定，a = ') + f(a0, 4) + ', b = ' + f(m.bb[0], 4))
        L.push(t('half-life ln 0.5 / ln a = ', '半衰期 ln 0.5 / ln a = ') + stepsFmt(Math.log(0.5) / Math.log(a0)) + ' ' + S.steps)
        L.push(t('max |recurrence − convolution| = ', 'max |递推 − 卷积| = ') + sci(m.maxd))
      } else {
        L.push(t('max |recurrence − convolution| = not defined (no fixed kernel)', 'max |递推 − 卷积| = 无定义（没有固定的卷积核）'))
      }
      noteEl.textContent = S.noteSel
    } else {
      var lr = m.lam[0], li = m.lam[1], mod = Math.hypot(lr, li), th = ang(lr, li)
      var hl = mod < 1 ? Math.log(0.5) / Math.log(mod) : Infinity
      var per = Math.abs(th) < 1e-12 ? Infinity : 2 * PI / Math.abs(th)
      L.push('λ = ' + f(mod, 4) + ' ∠ ' + f(th, 4) + ' rad (' + piFmt(Math.abs(th)).replace(/^0$/, '0') + ')' )
      L.push('λ = ' + f(z(lr), 4) + (z(li) < 0 ? ' − ' : ' + ') + f(Math.abs(z(li)), 4) + 'i')
      L.push('|λ| = ' + f(mod, 4))
      L.push(t('half-life ln 0.5 / ln|λ| = ', '半衰期 ln 0.5 / ln|λ| = ') + stepsFmt(hl) + ' ' + S.steps)
      L.push(t('oscillation period 2π/θ = ', '振荡周期 2π/θ = ') + stepsFmt(per) + ' ' + S.steps)
      if (m.mode === 'cont') {
        L.push('b̄ = ' + f(z(m.bb[0]), 4) + (z(m.bb[1]) < 0 ? ' − ' : ' + ') + f(Math.abs(z(m.bb[1])), 4) + 'i')
        L.push(t('time constant 1/α = ', '时间常数 1/α = ') + f(1 / P.alphaC, 2) + t(' time units = ', ' 时间单位 = ') + f(1 / (P.alphaC * P.delta), 2) + ' ' + S.steps + ' (1/(αΔ))')
      }
      L.push(t('max |recurrence − convolution| = ', 'max |递推 − 卷积| = ') + sci(m.maxd))
      noteEl.textContent = S.note
    }
    if (m.K) L.push('K_0…K_5 = ' + m.K.slice(0, 6).map(function (v) { return f(v, 3) }).join(', '))
    L.push(t('final output y_', '末位输出 y_') + (m.T - 1) + ' = ' + f(m.y[m.T - 1], 4) + t('   peak |y_t| = ', '   峰值 |y_t| = ') + f(Math.max.apply(null, m.y.map(Math.abs)), 4))
    readout.textContent = L.join('\n')
  }
  update()
})
