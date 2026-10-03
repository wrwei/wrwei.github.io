/* diffusion-explorer — Module 05, Section 5.
 * The forward process x_t = sqrt(abar_t) x_0 + sqrt(1 - abar_t) eps under the linear and the cosine
 * schedule, side by side on the same points and the same noise; and the reverse process run from
 * fresh N(0, I) points with the exact posterior mean E[x_0 | x_t] of the data mixture in place of a
 * trained network (DDPM ancestral or DDIM with K steps).
 *
 * Random numbers (AIW.rng = mulberry32, AIW.gauss = Box-Muller): the data x_0 always use seed 1.
 * One "draw" seed (79 by default, +1 per "Resample noise") feeds, in this order, the fixed per-point
 * noise eps, the reverse runs' starting points x_T and the DDPM noise z for t = 1000..2, each point
 * drawing its x then its y. Seed 79 is a representative draw: the ring's mean distance from the
 * origin at t = 1000 is 1.24, against sqrt(pi/2) = 1.25 for N(0, I). */
AIW.register('diffusion-explorer', function (el, opts) {
  'use strict'
  var tr = AIW.t, h = AIW.h
  var T = 1000, N = 1000, DRAW_SEED = 79, FRAMES = 60, FRAME_MS = 40, PLAY_MS = 5000
  var reduced = false
  try { reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) } catch (e) { reduced = false }

  // ---- colours: the page's CSS custom properties when present, else the series palette ----
  function cssVar(name, fallback) {
    try { var v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fallback } catch (e) { return fallback }
  }
  var COL = {
    sch: [cssVar('--blue', AIW.C.blue), cssVar('--orange', AIW.C.orange)],
    ink: cssVar('--navy', AIW.C.navy), slate: cssVar('--slate', AIW.C.slate), muted: cssVar('--muted', AIW.C.muted),
    miss: cssVar('--red', AIW.C.red), bg: cssVar('--white', '#FFFFFF')
  }
  var DASH = [[], [7, 4]]                       // linear solid, cosine dashed: readable without colour

  // ---- schedules (double precision, abar_0 = 1, abar_t = prod (1 - beta_s)) ----
  function schedule(kind) {
    var beta = new Float64Array(T + 1), ab = new Float64Array(T + 1), s
    var f = function (u) { var c = Math.cos(((u / T) + 0.008) / 1.008 * Math.PI / 2); return c * c }
    ab[0] = 1
    for (s = 1; s <= T; s++) {
      beta[s] = kind === 'linear' ? 1e-4 + (0.02 - 1e-4) * (s - 1) / 999 : Math.min(1 - f(s) / f(s - 1), 0.999)
      ab[s] = ab[s - 1] * (1 - beta[s])
    }
    var below = T + 1                            // first t with abar_t < 0.01 (SNR below -20 dB)
    for (s = 0; s <= T; s++) if (ab[s] < 0.01) { below = s; break }
    return { kind: kind, beta: beta, ab: ab, below: below }
  }
  var SCH = [schedule('linear'), schedule('cosine')]

  // ---- data: equal-weight Gaussian mixtures with isotropic component standard deviation sigma ----
  function mixture(name) {
    var means = [], sigma, j, k
    if (name === 'moons') {
      for (j = 0; j < 12; j++) { var a = Math.PI * j / 11; means.push([(Math.cos(a) - 0.5) / 0.8898, (Math.sin(a) - 0.25) / 0.4807]) }
      for (j = 0; j < 12; j++) { var b = Math.PI * j / 11; means.push([(1 - Math.cos(b) - 0.5) / 0.8898, (0.5 - Math.sin(b) - 0.25) / 0.4807]) }
      sigma = 0.08
    } else if (name === 'single') {
      means.push([1.5, -1.0]); sigma = 0.3
    } else {
      for (k = 0; k < 8; k++) means.push([2 * Math.cos(2 * Math.PI * k / 8), 2 * Math.sin(2 * Math.PI * k / 8)])
      sigma = 0.1
    }
    var K = means.length, mx = new Float64Array(K), my = new Float64Array(K)
    for (k = 0; k < K; k++) { mx[k] = means[k][0]; my[k] = means[k][1] }
    var r = AIW.rng(1), x0 = new Float64Array(2 * N)
    for (var i = 0; i < N; i++) {
      k = Math.floor(r() * K)
      x0[2 * i] = mx[k] + sigma * AIW.gauss(r)
      x0[2 * i + 1] = my[k] + sigma * AIW.gauss(r)
    }
    return { name: name, K: K, mx: mx, my: my, sigma: sigma, x0: x0 }
  }
  function drawNoise(seed) {
    var r = AIW.rng(seed), eps = new Float64Array(2 * N), xT = new Float64Array(2 * N), j
    for (j = 0; j < 2 * N; j++) eps[j] = AIW.gauss(r)
    for (j = 0; j < 2 * N; j++) xT[j] = AIW.gauss(r)
    return { seed: seed, eps: eps, xT: xT }
  }

  // ---- the exact denoiser: E[x_0 | x_t] for the mixture (never divides by sqrt(abar_t)) ----
  function denoise(x, abt, mix, out, lr) {
    var sa = Math.sqrt(abt), s2 = mix.sigma * mix.sigma, v = abt * s2 + 1 - abt, g = sa * s2 / v
    var K = mix.K, mx = mix.mx, my = mix.my
    for (var i = 0; i < N; i++) {
      var xi = x[2 * i], yi = x[2 * i + 1], top = -Infinity, k
      for (k = 0; k < K; k++) {
        var dx = xi - sa * mx[k], dy = yi - sa * my[k], l = -(dx * dx + dy * dy) / (2 * v)
        lr[k] = l; if (l > top) top = l
      }
      var s = 0, ax = 0, ay = 0
      for (k = 0; k < K; k++) {                  // responsibilities by log-sum-exp, then sum_k r_k m_k
        var w = Math.exp(lr[k] - top)
        s += w
        ax += w * (mx[k] + g * (xi - sa * mx[k]))
        ay += w * (my[k] + g * (yi - sa * my[k]))
      }
      out[2 * i] = ax / s; out[2 * i + 1] = ay / s
    }
  }
  function ddpmStep(sch, t, x, xh, r, mix, lr) {  // x_t -> x_{t-1}, posterior mean plus noise
    denoise(x, sch.ab[t], mix, xh, lr)
    var ab = sch.ab, b = sch.beta[t]
    var c0 = Math.sqrt(ab[t - 1]) * b / (1 - ab[t]), c1 = Math.sqrt(1 - b) * (1 - ab[t - 1]) / (1 - ab[t])
    var sd = Math.sqrt((1 - ab[t - 1]) * b / (1 - ab[t]))
    for (var i = 0; i < N; i++) {
      var nx = c0 * xh[2 * i] + c1 * x[2 * i], ny = c0 * xh[2 * i + 1] + c1 * x[2 * i + 1]
      if (t > 1) { nx += sd * AIW.gauss(r); ny += sd * AIW.gauss(r) }
      x[2 * i] = nx; x[2 * i + 1] = ny
    }
  }
  function ddimStep(sch, t, tn, x, xh, mix, lr) { // x_t -> x_tn, deterministic
    denoise(x, sch.ab[t], mix, xh, lr)
    var a = Math.sqrt(sch.ab[t]), b = Math.sqrt(1 - sch.ab[t]), an = Math.sqrt(sch.ab[tn]), bn = Math.sqrt(1 - sch.ab[tn])
    for (var j = 0; j < 2 * N; j++) { var e = (x[j] - a * xh[j]) / b; x[j] = an * xh[j] + bn * e }
  }
  function assess(x, mix) {                      // precision and components hit after a reverse run
    var lim = 9 * mix.sigma * mix.sigma, hitK = new Uint8Array(mix.K), hit = new Uint8Array(N), n = 0
    for (var i = 0; i < N; i++) {
      var best = Infinity, kb = 0
      for (var k = 0; k < mix.K; k++) {
        var dx = x[2 * i] - mix.mx[k], dy = x[2 * i + 1] - mix.my[k], d = dx * dx + dy * dy
        if (d < best) { best = d; kb = k }
      }
      if (best <= lim) { n++; hit[i] = 1; hitK[kb] = 1 }
    }
    var comps = 0
    for (var c = 0; c < mix.K; c++) comps += hitK[c]
    return { n: n, precision: n / N, comps: comps, hit: hit }
  }

  // ---- number formatting for the readouts (plain Unicode) ----
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  function sig3(x) {
    if (x === 1) return '1'
    if (x === 0) return '0'
    if (x >= 1e-3) return x.toPrecision(3)
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e)
    if (Number(m.toFixed(2)) >= 10) { m /= 10; e += 1 }
    return m.toFixed(2) + '×10' + String(e).split('').map(function (c) { return SUP[c] }).join('')
  }
  function signed(v, d) { return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d) }
  function snrText(ab) { return ab >= 1 ? '+∞ dB' : signed(10 * Math.log10(ab / (1 - ab)), 1) + ' dB' }
  function meanNorm(x) { var s = 0; for (var i = 0; i < N; i++) s += Math.sqrt(x[2 * i] * x[2 * i] + x[2 * i + 1] * x[2 * i + 1]); return s / N }

  // ---- state ----
  var DATASETS = [['ring', tr('ring of 8 Gaussians', '8 个高斯组成的环')], ['moons', tr('two moons', '双月')],
    ['single', tr('single Gaussian', '单个高斯')]]
  var SAMPLERS = [['ddpm', tr('DDPM ancestral, 1000 steps', 'DDPM 祖先采样，1000 步'), 1000],
    ['ddim50', tr('DDIM 50 steps', 'DDIM，50 步'), 50], ['ddim10', tr('DDIM 10 steps', 'DDIM，10 步'), 10],
    ['ddim3', tr('DDIM 3 steps', 'DDIM，3 步'), 3]]
  function sampler(id) { for (var i = 0; i < SAMPLERS.length; i++) if (SAMPLERS[i][0] === id) return SAMPLERS[i]; return SAMPLERS[1] }
  function samplerTimes(id) {
    var sp = sampler(id), K = sp[2], times = [], i
    if (id === 'ddpm') for (i = T; i >= 0; i--) times.push(i)
    else for (i = 0; i <= K; i++) times.push(Math.round(T * (1 - i / K)))
    return times
  }
  var startT = parseInt(opts.t, 10)
  var S = {
    ds: DATASETS.some(function (d) { return d[0] === opts.dataset }) ? opts.dataset : 'ring',
    t: isFinite(startT) ? Math.max(0, Math.min(T, startT)) : 500,
    sampler: SAMPLERS.some(function (d) { return d[0] === opts.sampler }) ? opts.sampler : 'ddim50',
    seed: DRAW_SEED, means: true,
    mode: 'forward',   // 'forward': the panels show x_t of the forward process; 'reverse': a reverse run
    run: null,         // the reverse run being shown
    last: null         // the last finished run, kept for the readouts until the data or the noise change
  }
  var mix = mixture(S.ds), noise = drawNoise(S.seed)
  var pts = [new Float64Array(2 * N), new Float64Array(2 * N)]
  var hist = { bins: [new Float64Array(40), new Float64Array(40)], ymax: 0.5 }

  function forward() {
    for (var p = 0; p < 2; p++) {
      var ab = SCH[p].ab[S.t], a = Math.sqrt(ab), b = Math.sqrt(1 - ab), x = pts[p]
      for (var j = 0; j < 2 * N; j++) x[j] = a * mix.x0[j] + b * noise.eps[j]
    }
  }
  function computeHists() {
    var top = 0
    for (var p = 0; p < 2; p++) {
      var bins = hist.bins[p]; bins.fill(0)
      for (var i = 0; i < N; i++) {
        var x = pts[p][2 * i]
        if (x >= -4 && x < 4) bins[Math.floor((x + 4) / 0.2)] += 1
      }
      for (var k = 0; k < 40; k++) { bins[k] /= N * 0.2; if (bins[k] > top) top = bins[k] }
    }
    var nice = [0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
    hist.ymax = nice[nice.length - 1]
    for (var n = 0; n < nice.length; n++) if (nice[n] >= top * 1.05) { hist.ymax = nice[n]; break }
  }

  // ---- layout ----
  el.textContent = ''
  var dsSel = AIW.select({ label: tr('Dataset', '数据集'), options: DATASETS, value: S.ds, onChange: function (v) { setDataset(v) } })
  var tSl = AIW.slider({ label: tr('Timestep t (both panels)', '时间步 t（两个面板）'), min: 0, max: T, step: 1, value: S.t,
    fmt: function (v) { return String(Math.round(v)) }, onInput: function (v) { stopPlay(); toForward(); setT(Math.round(v)) } })
  tSl.style.flex = '2 1 220px'
  var tInput = tSl.querySelector('input')
  tInput.addEventListener('keydown', function (e) {   // arrows move t by 1 natively; Shift + arrow by 50
    if (!e.shiftKey) return
    var d = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 50 : (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -50 : 0
    if (!d) return
    e.preventDefault()
    var v = Math.max(0, Math.min(T, S.t + d))
    stopPlay(); toForward(); tSl.set(v); setT(v)
  })
  var playBtn = AIW.button(tr('Play', '播放'), togglePlay)
  var noiseBtn = AIW.button(tr('Resample noise', '重新采样噪声'), resample, true)
  var samSel = AIW.select({ label: tr('Reverse sampler', '反向采样器'), options: SAMPLERS.map(function (s) { return [s[0], s[1]] }), value: S.sampler,
    onChange: function (v) { S.sampler = v; chart.redraw(); readouts() } })
  var runBtn = AIW.button(tr('Run reverse', '运行反向过程'), runReverse)
  var meansBox = AIW.checkbox(tr('Show component means', '显示分量均值'), S.means, function (v) { S.means = v; scat[0].redraw(); scat[1].redraw() })
  var ctlStyle = { alignItems: 'flex-end' }
  el.appendChild(h('div', { class: 'w-controls', style: ctlStyle }, dsSel, tSl, playBtn, noiseBtn))
  el.appendChild(h('div', { class: 'w-controls', style: ctlStyle }, samSel, runBtn, meansBox))

  function lineSample(p, w) {
    return h('i', { style: { display: 'inline-block', width: (w || 26) + 'px', height: '0', borderTop: '2.5px ' + (p ? 'dashed' : 'solid') + ' ' + COL.sch[p],
      verticalAlign: 'middle', marginRight: '.45rem' } })
  }
  var TITLES = [tr('Linear schedule', '线性调度'), tr('Cosine schedule', '余弦调度')]
  var row = h('div', { class: 'w-row' }), scat = [], hcv = [], ro = []
  for (var p = 0; p < 2; p++) {
    var col = h('div', { class: 'w-col', style: { flex: '1 1 312px' } })   // two columns from 640 px, stacked below
    col.appendChild(h('div', { style: { fontWeight: '600', fontSize: '.86rem', color: COL.ink, margin: '0 0 .35rem' } }, lineSample(p), TITLES[p]))
    var sw = h('div'), hw = h('div', { style: { marginTop: '.3rem' } })
    col.appendChild(sw); col.appendChild(hw)
    scat.push(AIW.canvas(sw, { aspect: 1, maxHeight: 440 }, drawScatter.bind(null, p)))
    hcv.push(AIW.canvas(hw, { aspect: 0.3, maxHeight: 120 }, drawHist.bind(null, p)))
    scat[p].cv.setAttribute('role', 'img')
    scat[p].cv.setAttribute('aria-label', tr('Scatter plot of the 1,000 points under the ', '1,000 个点的散点图：') + TITLES[p])
    hcv[p].cv.setAttribute('role', 'img')
    hcv[p].cv.setAttribute('aria-label', tr('Histogram of the points’ x-coordinates with the N(0, 1) density', '各点 x 坐标的直方图与 N(0, 1) 密度'))
    ro.push(h('div', { class: 'w-readout', style: { marginTop: '.45rem' }, 'aria-live': 'polite' }))
    col.appendChild(ro[p])
    row.appendChild(col)
  }
  el.appendChild(row)

  var chartWrap = h('div', { style: { marginTop: '.9rem' } })
  chartWrap.appendChild(h('div', { style: { fontWeight: '600', fontSize: '.86rem', color: COL.ink, margin: '0 0 .3rem' } },
    tr('Signal fraction ', '信号比例 '), h('span', { class: 'math-i' }, '\\bar\\alpha_t'),
    tr(' against t (log scale), both schedules', ' 随 t 的变化（对数坐标），两种调度')))
  el.appendChild(chartWrap)
  var chart = AIW.canvas(chartWrap, { aspect: 0.5, maxHeight: 210 }, drawChart)
  chart.cv.setAttribute('role', 'img')
  chart.cv.setAttribute('aria-label', tr('Line chart of abar_t against t for the linear and cosine schedules', '线性与余弦调度下 ᾱ_t 随 t 变化的折线图'))
  function legendItem(sample, text) { return h('span', { style: { display: 'inline-flex', alignItems: 'center' } }, sample, text) }
  function borderSample(style, color, w) {
    return h('i', { style: { display: 'inline-block', width: (w || 22) + 'px', height: '0', borderTop: style + ' ' + color, verticalAlign: 'middle', marginRight: '.35rem', background: 'none' } })
  }
  el.appendChild(h('div', { class: 'w-legend' },
    legendItem(lineSample(0, 22), tr('linear β_t, 10⁻⁴ to 0.02', '线性 β_t，10⁻⁴ 到 0.02')),
    legendItem(lineSample(1, 22), tr('cosine, s = 0.008', '余弦，s = 0.008')),
    legendItem(borderSample('2px dotted', COL.slate), 'ᾱ = 0.01 (SNR −20 dB)'),
    legendItem(borderSample('2px solid', COL.ink, 3), tr('current t', '当前 t')),
    legendItem(h('i', { style: { display: 'inline-block', width: '2px', height: '9px', background: COL.slate, marginRight: '.35rem' } }),
      tr('timesteps the selected sampler visits', '所选采样器经过的时间步'))))
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Below ᾱ = 0.01 the input is almost pure noise: the linear schedule is there from t = ' + SCH[0].below + ' (' + ((T - SCH[0].below + 1) / 10).toFixed(1) +
      '% of its steps), the cosine schedule from t = ' + SCH[1].below + ' (' + ((T - SCH[1].below + 1) / 10).toFixed(1) + '%).',
    '当 ᾱ < 0.01 时输入几乎是纯噪声：线性调度从 t = ' + SCH[0].below + ' 起进入这一区间（占全部步数的 ' + ((T - SCH[0].below + 1) / 10).toFixed(1) +
      '%），余弦调度从 t = ' + SCH[1].below + ' 起（' + ((T - SCH[1].below + 1) / 10).toFixed(1) + '%）。')))
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Both panels use the same 1,000 points x₀ and the same per-point noise ε; only the schedule differs. Run reverse starts both panels from the same fresh N(0, I) points and uses the exact posterior mean E[x₀ | x_t] of the data mixture in place of a trained network. Precision is the share of final points within 3σ of the nearest component mean; perfect samples score 1 − e^(−4.5) ≈ 0.989. Keys: ←/→ on the slider move t by 1, Shift+←/→ by 50.',
    '两个面板使用相同的 1,000 个数据点 x₀ 和相同的逐点噪声 ε，只有噪声调度不同。“运行反向过程”让两个面板从同一组新抽取的 N(0, I) 点出发，并用数据混合分布的精确后验均值 E[x₀ | x_t] 代替训练好的网络。精确率是最终点中落在最近分量均值 3σ 以内的比例；完美的样本得分为 1 − e^(−4.5) ≈ 0.989。键盘：在滑块上按 ←/→ 使 t 变化 1，Shift+←/→ 变化 50。')))

  // ---- drawing ----
  function squarePad(w, h) {                     // a square plot area, centred, with room for tick labels
    var side = Math.max(60, Math.min(w - 38, h - 26)), l = 30 + Math.max(0, (w - 38 - side) / 2)
    return { side: side, pad: { l: l, r: w - l - side, t: 6, b: h - 6 - side } }
  }
  function drawScatter(p, ctx, w, hh) {
    var sq = squarePad(w, hh), pad = sq.pad, side = sq.side, i, k
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: -4, x1: 4, y0: -4, y1: 4, xticks: 4, yticks: 4, pad: pad,
      xfmt: function (v) { return String(Math.round(v)).replace('-', '−') }, yfmt: function (v) { return String(Math.round(v)).replace('-', '−') } })
    var x = pts[p], run = S.mode === 'reverse' ? S.run : null, res = run && run.done ? run.res[p] : null
    ctx.save()
    ctx.beginPath(); ctx.rect(pad.l, pad.t, side, side); ctx.clip()
    var px = side / 8
    if (S.means) {                               // the data components' means, as faint crosses
      ctx.strokeStyle = COL.ink; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.2
      ctx.beginPath()
      for (k = 0; k < mix.K; k++) {
        var cx = ax.X(mix.mx[k]), cy = ax.Y(mix.my[k])
        ctx.moveTo(cx - 4.5, cy); ctx.lineTo(cx + 4.5, cy); ctx.moveTo(cx, cy - 4.5); ctx.lineTo(cx, cy + 4.5)
      }
      ctx.stroke()
      if (res) {                                 // the 3-sigma discs that count as a hit
        ctx.globalAlpha = 0.35; ctx.setLineDash([3, 3]); ctx.lineWidth = 1
        ctx.beginPath()
        for (k = 0; k < mix.K; k++) { var ex = ax.X(mix.mx[k]), ey = ax.Y(mix.my[k]); ctx.moveTo(ex + 3 * mix.sigma * px, ey); ctx.arc(ex, ey, 3 * mix.sigma * px, 0, 2 * Math.PI) }
        ctx.stroke(); ctx.setLineDash([])
      }
    }
    var r = side < 300 ? 1.4 : 1.7
    ctx.fillStyle = COL.sch[p]; ctx.globalAlpha = 0.5
    ctx.beginPath()
    for (i = 0; i < N; i++) {
      if (res && !res.hit[i]) continue
      var X = ax.X(x[2 * i]), Y = ax.Y(x[2 * i + 1])
      ctx.moveTo(X + r, Y); ctx.arc(X, Y, r, 0, 2 * Math.PI)
    }
    ctx.fill()
    if (res) {                                   // misses: hollow red rings, so they read without colour too
      ctx.strokeStyle = COL.miss; ctx.globalAlpha = 0.85; ctx.lineWidth = 1
      ctx.beginPath()
      for (i = 0; i < N; i++) {
        if (res.hit[i]) continue
        var mxp = ax.X(x[2 * i]), myp = ax.Y(x[2 * i + 1])
        ctx.moveTo(mxp + 2.6, myp); ctx.arc(mxp, myp, 2.6, 0, 2 * Math.PI)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    // what the panel shows, top left
    var tag = S.mode === 'reverse' && run
      ? (run.done ? tr('reverse result, ', '反向结果，') : tr('reverse, ', '反向，')) + run.label + ' · t = ' + S.t
      : tr('forward, t = ', '前向，t = ') + S.t
    ctx.font = '11.5px "DM Sans", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
    var tw = ctx.measureText(tag).width
    ctx.fillStyle = COL.bg; ctx.globalAlpha = 0.85
    ctx.fillRect(pad.l + 4, pad.t + 4, tw + 10, 18)
    ctx.globalAlpha = 1; ctx.fillStyle = COL.ink; ctx.textAlign = 'left'
    ctx.fillText(tag, pad.l + 9, pad.t + 17)
    ctx.restore()
  }
  function drawHist(p, ctx, w, hh) {
    var sq = squarePad(w, w), pad = { l: sq.pad.l, r: sq.pad.r, t: 6, b: 18 }, ymax = hist.ymax
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: -4, x1: 4, y0: 0, y1: ymax, xticks: 4, yticks: 2, pad: pad,
      xfmt: function (v) { return String(Math.round(v)).replace('-', '−') }, yfmt: function (v) { return v.toFixed(v === 0 ? 0 : (ymax % 2 === 0 ? 0 : 1)) } })
    ctx.save()
    ctx.beginPath(); ctx.rect(pad.l, pad.t, w - pad.l - pad.r, hh - pad.t - pad.b); ctx.clip()
    var bins = hist.bins[p]
    ctx.fillStyle = COL.sch[p]; ctx.globalAlpha = 0.38
    for (var k = 0; k < 40; k++) {
      if (!bins[k]) continue
      var x0 = ax.X(-4 + 0.2 * k), x1 = ax.X(-4 + 0.2 * (k + 1)), y = ax.Y(bins[k])
      ctx.fillRect(x0 + 0.5, y, x1 - x0 - 1, ax.Y(0) - y)
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5
    ctx.beginPath()
    for (var i = 0; i <= 160; i++) {
      var xv = -4 + i * 0.05, yv = Math.exp(-xv * xv / 2) / Math.sqrt(2 * Math.PI)
      if (i) ctx.lineTo(ax.X(xv), ax.Y(yv)); else ctx.moveTo(ax.X(xv), ax.Y(yv))
    }
    ctx.stroke()
    ctx.font = '11px "DM Sans", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.fillStyle = COL.slate; ctx.textAlign = 'right'
    ctx.fillText(tr('x-coordinates; line: N(0, 1)', 'x 坐标；曲线：N(0, 1)'), w - pad.r - 4, pad.t + 11)
    ctx.restore()
  }
  function decade(v) {
    var e = Math.round(Math.log10(v))
    if (e >= -2) return e === 0 ? '1' : (e === -1 ? '0.1' : '0.01')
    return '10' + String(e).split('').map(function (c) { return SUP[c] }).join('')
  }
  function drawChart(ctx, w, hh) {
    var pad = { l: 58, r: 14, t: 10, b: 34 }, Y0 = 1e-5
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: T, y0: Y0, y1: 1, logY: true, xticks: 5, yticks: 5, pad: pad,
      xlabel: 't', ylabel: 'ᾱ_t', xfmt: function (v) { return String(Math.round(v)) }, yfmt: decade })
    var L = pad.l, R = w - pad.r, top = pad.t, bot = hh - pad.b
    ctx.save()
    ctx.beginPath(); ctx.rect(L, top, R - L, bot - top); ctx.clip()
    // the sampler's timesteps, as a rug along the bottom
    var times = samplerTimes(S.sampler)
    ctx.fillStyle = COL.slate; ctx.globalAlpha = 0.75
    if (S.sampler === 'ddpm') ctx.fillRect(L, bot - 7, R - L, 7)
    else for (var q = 0; q < times.length; q++) ctx.fillRect(ax.X(times[q]) - 0.75, bot - 7, 1.5, 7)
    ctx.globalAlpha = 1
    // abar = 0.01
    ctx.strokeStyle = COL.slate; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3])
    ctx.beginPath(); ctx.moveTo(L, ax.Y(0.01)); ctx.lineTo(R, ax.Y(0.01)); ctx.stroke()
    ctx.setLineDash([])
    // the two schedules
    for (var p = 0; p < 2; p++) {
      var ab = SCH[p].ab
      ctx.strokeStyle = COL.sch[p]; ctx.lineWidth = 2.2; ctx.setLineDash(DASH[p])
      ctx.beginPath()
      for (var t = 0; t <= T; t++) {
        var yy = ax.Y(Math.max(ab[t], Y0 / 10))
        if (t) ctx.lineTo(ax.X(t), yy); else ctx.moveTo(ax.X(t), yy)
      }
      ctx.stroke()
    }
    ctx.setLineDash([])
    // the current t
    var X = ax.X(S.t)
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(X, top); ctx.lineTo(X, bot); ctx.stroke()
    for (p = 0; p < 2; p++) {
      var v = SCH[p].ab[S.t]
      if (v < Y0) continue
      ctx.fillStyle = COL.sch[p]; ctx.strokeStyle = COL.bg; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(X, ax.Y(v), 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke()
    }
    ctx.restore()
  }
  function readouts() {
    var run = S.mode === 'reverse' ? S.run : null
    for (var p = 0; p < 2; p++) {
      var ab = SCH[p].ab[S.t], lines = []
      lines.push('t = ' + S.t + '    ᾱ_t = ' + sig3(ab))
      lines.push(tr('signal ', '信号 ') + '√ᾱ_t = ' + sig3(Math.sqrt(ab)))
      lines.push(tr('noise ', '噪声 ') + '√(1−ᾱ_t) = ' + Math.sqrt(1 - ab).toFixed(3))
      lines.push(tr('SNR', '信噪比') + ' = 10 log₁₀(ᾱ_t/(1−ᾱ_t)) = ' + snrText(ab))
      lines.push(tr('mean ', '平均 ') + '‖x_t‖ = ' + meanNorm(pts[p]).toFixed(2) + tr('   (N(0, I): 1.25)', '（N(0, I)：1.25）'))
      if (run && !run.done) {
        lines.push(tr('reverse run, ', '反向运行，') + run.label + ':')
        lines.push(tr('step ', '第 ') + run.step + ' / ' + run.K + tr('', ' 步'))
      } else if (S.last) {
        var r = S.last.res[p]
        lines.push((run ? tr('reverse run, ', '反向运行，') : tr('last reverse run, ', '上次反向运行，')) + S.last.label + ':')
        lines.push(tr('precision ', '精确率 ') + r.precision.toFixed(3) + ' (' + r.n + '/' + N + ')  ·  ' +
          tr('components hit ', '命中分量 ') + r.comps + '/' + S.last.K)
      } else {
        lines.push(tr('reverse run: press Run reverse', '反向运行：点击“运行反向过程”'))
        lines.push(tr('precision —  ·  components hit —', '精确率 —  ·  命中分量 —'))
      }
      ro[p].textContent = lines.join('\n')
    }
  }
  function render() {
    computeHists()
    scat[0].redraw(); scat[1].redraw(); hcv[0].redraw(); hcv[1].redraw(); chart.redraw()
    readouts()
  }

  // ---- forward interaction ----
  function setT(v) { S.t = v; if (S.mode === 'forward') forward(); render() }
  function toForward() { cancelRun(); if (S.mode !== 'forward') { S.mode = 'forward'; S.run = null } }
  function setDataset(v) {
    toForward(); S.ds = v; mix = mixture(v); S.last = null
    forward(); render()
  }
  function resample() {
    toForward(); S.seed += 1; noise = drawNoise(S.seed); S.last = null
    forward(); render()
  }
  var play = null, pausedAt = null, playRaf = 0
  function stopPlay() {
    if (!play) return
    cancelAnimationFrame(playRaf); play = null; playBtn.textContent = tr('Play', '播放')
  }
  function togglePlay() {
    if (play) { stopPlay(); pausedAt = S.t; return }
    toForward()
    var from = (pausedAt !== null && pausedAt === S.t && S.t < T) ? S.t : 0
    pausedAt = null
    play = { from: from, start: performance.now() }
    playBtn.textContent = tr('Pause', '暂停')
    tSl.set(from); setT(from)
    playRaf = requestAnimationFrame(tickPlay)
  }
  function tickPlay(now) {
    if (!play) return
    var el2 = Math.max(0, now - play.start)
    // reduced motion: no continuous movement, ten jumps of 100 steps instead
    var v = reduced ? play.from + Math.floor(el2 / (PLAY_MS / 10)) * (T / 10) : play.from + el2 * T / PLAY_MS
    v = Math.min(T, Math.round(v))
    if (v !== S.t) { tSl.set(v); setT(v) }
    if (v >= T) { stopPlay(); return }
    playRaf = requestAnimationFrame(tickPlay)
  }

  // ---- the reverse process, in chunks with requestAnimationFrame (about 60 frames for any K) ----
  var runRaf = 0
  function cancelRun() { if (S.run && !S.run.done) { cancelAnimationFrame(runRaf); S.run.cancelled = true } }
  function runReverse() {
    stopPlay(); cancelRun(); pausedAt = null
    var sp = sampler(S.sampler)
    var run = { id: sp[0], label: sp[1], K: sp[2], times: samplerTimes(sp[0]), step: 0, frame: 0, last: 0, done: false,
      x: [], rng: [], xh: new Float64Array(2 * N), lr: new Float64Array(mix.K), mix: mix, res: null }
    for (var p = 0; p < 2; p++) {               // same start points and the same z for both panels
      var r = AIW.rng(S.seed)
      for (var j = 0; j < 4 * N; j++) AIW.gauss(r) // skip eps and x_T, which noise already holds
      run.rng.push(r); run.x.push(Float64Array.from(noise.xT))
    }
    S.run = run; S.mode = 'reverse'
    showRun()
    runRaf = requestAnimationFrame(tickRun)
  }
  function advance(run, target) {
    while (run.step < target) {
      var t = run.times[run.step], tn = run.times[run.step + 1]
      for (var p = 0; p < 2; p++) {
        if (run.id === 'ddpm') ddpmStep(SCH[p], t, run.x[p], run.xh, run.rng[p], run.mix, run.lr)
        else ddimStep(SCH[p], t, tn, run.x[p], run.xh, run.mix, run.lr)
      }
      run.step++
    }
  }
  function tickRun(now) {
    var run = S.run
    if (!run || run.done || run.cancelled) return
    if (reduced) {                               // compute in time-boxed chunks and show only the result
      var c0 = performance.now()
      while (run.step < run.K && performance.now() - c0 < 12) advance(run, run.step + 1)
      if (run.step >= run.K) finish(run); else { readouts(); runRaf = requestAnimationFrame(tickRun) }
      return
    }
    if (now - run.last >= FRAME_MS) {
      run.last = now; run.frame++
      advance(run, Math.min(run.K, Math.floor(run.frame * run.K / FRAMES)))
      if (run.frame >= FRAMES) { finish(run); return }
      showRun()
    }
    runRaf = requestAnimationFrame(tickRun)
  }
  function finish(run) {
    advance(run, run.K)
    run.done = true
    run.res = [assess(run.x[0], run.mix), assess(run.x[1], run.mix)]
    S.last = { label: run.label, res: run.res, K: run.mix.K }
    showRun()
  }
  function showRun() {
    var run = S.run
    S.t = run.times[run.step]
    tSl.set(S.t)
    pts[0].set(run.x[0]); pts[1].set(run.x[1])
    render()
  }

  forward()
  render()
})
