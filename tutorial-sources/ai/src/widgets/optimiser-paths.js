/* optimiser-paths — Module 02, s7 (used again in s8).
 * Gradient descent, heavy ball, Nesterov, RMSProp and Adam on an ill-conditioned quadratic ravine
 * 𝓛 = ½(u² + κv²), (u, v) = Rθ rotated by α, or on the banana (1 − x)² + 10(y − x²)².
 * The whole run (300 steps; 1,000 on the banana) is recomputed from the start point whenever
 * anything changes; Play reveals it two steps per frame. */
AIW.register('optimiser-paths', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h, C = AIW.C

  // ---------------------------------------------------------------- constants
  var DOMAIN = { ravine: { x0: -2, x1: 2, y0: -2, y1: 2 }, banana: { x0: -2, x1: 2, y0: -1, y1: 3 } }
  var STEPS = { ravine: 300, banana: 1000 }
  var START = { ravine: [-1.8, 0.35], banana: [-1.5, 1.5] }   // ravine start is (u, v), its own axes
  var ETA0 = { ravine: 0.035, banana: 0.01 }                  // suggested η when a surface is chosen
  var MAXT = 1000, LDIV = 1e6, YLO = 1e-12, YHI = 1e3, MEANW = 100
  var NOISE_SEED = 11

  var METHODS = [
    { id: 'gd', name: t('gradient descent', '梯度下降'), color: '#2563EB', on: true },
    { id: 'hb', name: t('heavy ball', '重球动量'), color: '#C2410C', on: true },
    { id: 'nag', name: t('Nesterov', 'Nesterov 动量'), color: '#7E22CE', on: false },
    { id: 'rms', name: 'RMSProp', color: '#0891B2', on: false },
    { id: 'adam', name: 'Adam', color: '#15803D', on: true }
  ]

  var S = {
    surface: 'ravine', kappa: 50, alpha: 0, eta: ETA0.ravine, mu: 0.9, etaA: 0.05, sigma: 0,
    schedule: 'constant', start: { ravine: START.ravine.slice(), banana: START.banana.slice() },
    shown: STEPS.ravine, playing: false
  }

  // one noise sequence, shared by every method: ξ_t = (XI[2t − 2], XI[2t − 1]) at step t
  var XI = new Float64Array(2 * MAXT)
  ;(function () { var r = AIW.rng(NOISE_SEED); for (var i = 0; i < XI.length; i++) XI[i] = AIW.gauss(r) })()

  // ---------------------------------------------------------------- formatting
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  function sup(n) { return String(n).split('').map(function (ch) { return SUP[ch] || ch }).join('') }
  function minus(s) { return s.replace(/-/g, '−') }
  function sig(x, d) { return minus(Number(x).toPrecision(d)) }
  function fix(x, d) { return minus(x.toFixed(d)) }
  function snap2(v) { return Number(v.toPrecision(2)) }
  function fmtL(x) {                      // a loss value
    if (!isFinite(x)) return '∞'
    if (x === 0) return '0'
    var a = Math.abs(x)
    if (a >= 1e-3 && a < 1e3) return sig(x, 3)
    var e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e)
    if (Math.abs(m) >= 9.995) { m /= 10; e += 1 }
    return minus(m.toFixed(2)) + '×10' + sup(e)
  }
  function pow10(y) { var e = Math.round(Math.log10(y)); return e === 0 ? '1' : '10' + sup(e) }

  // ---------------------------------------------------------------- the two surfaces
  function surface() {
    if (S.surface === 'banana') {
      return {
        loss: function (x, y) { var a = 1 - x, b = y - x * x; return a * a + 10 * b * b },
        grad: function (x, y, g) { var b = y - x * x; g[0] = -2 * (1 - x) - 40 * x * b; g[1] = 20 * b },
        start: function () { return S.start.banana.slice() },
        min: [1, 1]
      }
    }
    var a = S.alpha * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), k = S.kappa
    // ∇𝓛 = Rᵀ diag(1, κ) R θ with R = [[c, s], [−s, c]]
    var A11 = c * c + k * s * s, A12 = (1 - k) * c * s, A22 = s * s + k * c * c
    return {
      loss: function (x, y) { var u = c * x + s * y, v = -s * x + c * y; return 0.5 * (u * u + k * v * v) },
      grad: function (x, y, g) { g[0] = A11 * x + A12 * y; g[1] = A12 * x + A22 * y },
      start: function () { var u = S.start.ravine[0], v = S.start.ravine[1]; return [c * u - s * v, s * u + c * v] },
      toUV: function (x, y) { return [c * x + s * y, -s * x + c * y] },
      min: [0, 0]
    }
  }
  function bananaLamMax(x, y) {           // largest Hessian eigenvalue of the banana at (x, y)
    var a = 2 - 40 * (y - x * x) + 80 * x * x, b = -40 * x, d = 20
    return (a + d) / 2 + Math.sqrt((a - d) * (a - d) / 4 + b * b)
  }

  // ---------------------------------------------------------------- the run
  function simulate() {
    var f = surface(), T = STEPS[S.surface], th0 = f.start()
    var L0 = f.loss(th0[0], th0[1]), thr = 1e-6 * L0, g = [0, 0], res = {}
    METHODS.forEach(function (m) {
      var xs = new Float64Array(T + 1), ys = new Float64Array(T + 1), Ls = new Float64Array(T + 1)
      var x = th0[0], y = th0[1], v0 = 0, v1 = 0, s0 = 0, s1 = 0, m0 = 0, m1 = 0, q0 = 0, q1 = 0
      var n = T, reached = 0, diverged = 0
      xs[0] = x; ys[0] = y; Ls[0] = L0
      for (var k = 1; k <= T; k++) {
        var fac = S.schedule === 'cosine' ? 0.5 * (1 + Math.cos(Math.PI * (k - 1) / T)) : 1
        var e = S.eta * fac, ea = S.etaA * fac
        if (m.id === 'nag') f.grad(x - e * S.mu * v0, y - e * S.mu * v1, g)   // look-ahead point
        else f.grad(x, y, g)
        var g0 = g[0] + S.sigma * XI[2 * k - 2], g1 = g[1] + S.sigma * XI[2 * k - 1]
        if (m.id === 'gd') { x -= e * g0; y -= e * g1 }
        else if (m.id === 'hb' || m.id === 'nag') {
          v0 = S.mu * v0 + g0; v1 = S.mu * v1 + g1
          x -= e * v0; y -= e * v1
        } else if (m.id === 'rms') {
          s0 = 0.9 * s0 + 0.1 * g0 * g0; s1 = 0.9 * s1 + 0.1 * g1 * g1
          x -= ea * g0 / (Math.sqrt(s0) + 1e-8); y -= ea * g1 / (Math.sqrt(s1) + 1e-8)
        } else {
          m0 = 0.9 * m0 + 0.1 * g0; m1 = 0.9 * m1 + 0.1 * g1
          q0 = 0.999 * q0 + 0.001 * g0 * g0; q1 = 0.999 * q1 + 0.001 * g1 * g1
          var b1 = 1 - Math.pow(0.9, k), b2 = 1 - Math.pow(0.999, k)
          x -= ea * (m0 / b1) / (Math.sqrt(q0 / b2) + 1e-8)
          y -= ea * (m1 / b1) / (Math.sqrt(q1 / b2) + 1e-8)
        }
        var L = f.loss(x, y)
        xs[k] = x; ys[k] = y; Ls[k] = L
        if (!isFinite(L) || L > LDIV) { diverged = k; n = k; break }
        if (!reached && L < thr) reached = k
      }
      res[m.id] = { xs: xs, ys: ys, Ls: Ls, n: n, reached: reached, diverged: diverged }
    })
    return { T: T, L0: L0, thr: thr, th0: th0, res: res, f: f }
  }
  var run = simulate()

  // ---------------------------------------------------------------- controls
  function slider(o) { var s = AIW.slider(o); s.style.flex = '1 1 160px'; return s }
  var selSurface = AIW.select({
    label: t('surface', '曲面'),
    options: [['ravine', t('ravine (quadratic)', '峡谷（二次函数）')], ['banana', t('banana', '香蕉函数')]],
    value: 'ravine',
    onChange: function (v) {
      var atEnd = S.shown >= STEPS[S.surface]
      S.surface = v
      S.start[v] = START[v].slice()
      S.eta = ETA0[v]; slEta.set(S.eta)
      S.shown = atEnd ? STEPS[v] : Math.min(S.shown, STEPS[v])
      setRavineControls()
      recompute()
    }
  })
  selSurface.style.flex = '1 1 160px'
  var slKappa = slider({ label: t('condition number κ', '条件数 κ'), min: 1, max: 100, value: 50, log: true,
    fmt: function (v) { return String(snap2(v)) }, onInput: function (v) { S.kappa = snap2(v); recompute() } })
  var slAlpha = slider({ label: t('rotation α', '旋转角 α'), min: 0, max: 90, step: 1, value: 0,
    fmt: function (v) { return Math.round(v) + '°' }, onInput: function (v) { S.alpha = Math.round(v); recompute() } })
  var slEta = slider({ label: t('η: GD, heavy ball, Nesterov', '学习率 η：梯度下降、重球、Nesterov'), min: 0.001, max: 0.2, value: S.eta, log: true,
    fmt: function (v) { return String(snap2(v)) }, onInput: function (v) { S.eta = snap2(v); recompute() } })
  var slMu = slider({ label: t('momentum μ', '动量系数 μ'), min: 0, max: 0.99, step: 0.01, value: 0.9,
    fmt: function (v) { return v.toFixed(2) }, onInput: function (v) { S.mu = Math.round(v * 100) / 100; recompute() } })
  var slEtaA = slider({ label: t('η: RMSProp, Adam', '学习率 η：RMSProp、Adam'), min: 0.001, max: 0.5, value: 0.05, log: true,
    fmt: function (v) { return String(snap2(v)) }, onInput: function (v) { S.etaA = snap2(v); recompute() } })
  var slSigma = slider({ label: t('gradient noise σ', '梯度噪声 σ'), min: 0, max: 1, step: 0.01, value: 0,
    fmt: function (v) { return v.toFixed(2) }, onInput: function (v) { S.sigma = Math.round(v * 100) / 100; recompute() } })
  var selSched = AIW.select({
    label: t('schedule', '学习率调度'),
    options: [['constant', t('constant', '恒定')], ['cosine', t('cosine to 0 over the run', '余弦退火，全程降到 0')]],
    value: 'constant',
    onChange: function (v) { S.schedule = v; recompute() }
  })
  selSched.style.flex = '1 1 160px'
  function setRavineControls() {
    var off = S.surface !== 'ravine'
    ;[slKappa, slAlpha].forEach(function (w) { w.querySelector('input').disabled = off; w.style.opacity = off ? '0.45' : '' })
  }
  var controls = h('div', { class: 'w-controls' }, selSurface, slKappa, slAlpha, slEta, slMu, slEtaA, slSigma, selSched)

  var methodRow = h('div', { class: 'w-legend', style: { alignItems: 'center', gap: '.3rem 1.1rem', margin: '0 0 .7rem' } },
    h('span', { style: { fontWeight: '600', color: 'var(--navy)', fontSize: '.78rem' } }, t('show:', '显示：')))
  METHODS.forEach(function (m) {
    var box = AIW.checkbox(m.name, m.on, function (v) { m.on = v; render() })
    box.style.minWidth = '0'
    box.insertBefore(h('i', { style: { background: m.color, width: '16px', height: '4px', marginRight: '0' } }), box.lastChild)
    methodRow.appendChild(box)
  })

  var btnPlay = AIW.button(t('Play', '播放'), play)
  var btnStep = AIW.button(t('Step', '单步'), stepOnce, true)
  var btnReset = AIW.button(t('Reset', '重置'), reset, true)
  var stepLbl = h('span', { class: 'w-val', style: { marginLeft: '.4rem' } })
  var btnRow = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center', margin: '0 0 .8rem' } },
    btnPlay, btnStep, btnReset, stepLbl)

  el.appendChild(controls)
  el.appendChild(methodRow)
  el.appendChild(btnRow)

  // ---------------------------------------------------------------- plots
  var plotRow = h('div', { class: 'w-row' })
  var colPath = h('div', { class: 'w-col' }), colLoss = h('div', { class: 'w-col' })
  plotRow.appendChild(colPath); plotRow.appendChild(colLoss)
  el.appendChild(plotRow)

  function square(w, hh) {               // a square plot area, so both axes share one scale
    var l0 = 44, r0 = 10, t0 = 10, b0 = 38
    var side = Math.max(60, Math.min(w - l0 - r0, hh - t0 - b0))
    var ex = (w - l0 - r0 - side) / 2, ey = (hh - t0 - b0 - side) / 2
    return { l: l0 + ex, r: r0 + ex, t: t0 + ey, b: b0 + ey, side: side }
  }
  var view = null                        // last mapping of the contour plot, for clicks

  // background (heat map, grid, contours) is cached; it changes only with the surface, κ, α or size
  var bg = { key: '', cv: document.createElement('canvas') }
  function background(w, hh) {
    var dpr = window.devicePixelRatio || 1
    var key = [S.surface, S.kappa, S.alpha, w, hh, dpr].join('|')
    if (bg.key === key) return
    bg.key = key
    bg.cv.width = Math.round(w * dpr); bg.cv.height = Math.round(hh * dpr)
    var c = bg.cv.getContext('2d')
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, w, hh)
    var f = surface(), d = DOMAIN[S.surface], p = square(w, hh)
    // heat map of log10 𝓛 at half resolution, smoothed up
    var n = Math.max(48, Math.round(p.side / 2)), img = new ImageData(n, n)
    var zlo = -3, zhi = 2.6
    for (var j = 0; j < n; j++) {
      for (var i = 0; i < n; i++) {
        var x = d.x0 + (i + 0.5) / n * (d.x1 - d.x0), y = d.y1 - (j + 0.5) / n * (d.y1 - d.y0)
        var z = (Math.log10(f.loss(x, y) + 1e-12) - zlo) / (zhi - zlo)
        z = Math.max(0, Math.min(1, z))
        var o = 4 * (j * n + i)
        img.data[o] = Math.round(255 - 52 * z); img.data[o + 1] = Math.round(255 - 40 * z); img.data[o + 2] = Math.round(255 - 22 * z); img.data[o + 3] = 255
      }
    }
    var tmp = document.createElement('canvas'); tmp.width = n; tmp.height = n
    tmp.getContext('2d').putImageData(img, 0, 0)
    c.imageSmoothingEnabled = true
    c.drawImage(tmp, p.l, p.t, p.side, p.side)
    var lab = S.surface === 'ravine' ? ['θ₁', 'θ₂'] : ['x', 'y']
    var ax = AIW.axes(c, { w: w, h: hh, x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1, pad: { l: p.l, r: p.r, t: p.t, b: p.b },
      xticks: 4, yticks: 4, xfmt: function (v) { return minus(String(Math.round(v))) }, yfmt: function (v) { return minus(String(Math.round(v))) },
      xlabel: lab[0], ylabel: lab[1] })
    // contour lines at log-spaced levels 10^(k/2)
    c.save()
    c.beginPath(); c.rect(p.l, p.t, p.side, p.side); c.clip()
    c.strokeStyle = 'rgba(71,85,105,0.38)'; c.lineWidth = 0.9
    var levels = []
    for (var k = -6; k <= 5; k++) levels.push(Math.pow(10, k / 2))
    if (S.surface === 'ravine') {
      var px = p.side / (d.x1 - d.x0), a = S.alpha * Math.PI / 180
      levels.forEach(function (lv) {
        c.beginPath()
        c.ellipse(ax.X(0), ax.Y(0), Math.sqrt(2 * lv) * px, Math.sqrt(2 * lv / S.kappa) * px, -a, 0, 2 * Math.PI)
        c.stroke()
      })
    } else {
      contours(c, f, d, ax, levels.map(function (lv) { return Math.log10(lv) }), 160)
    }
    c.restore()
  }
  // marching squares on log10 𝓛
  function contours(c, f, d, ax, levels, N) {
    var W = N + 1, val = new Float64Array(W * W)
    for (var j = 0; j <= N; j++) for (var i = 0; i <= N; i++) {
      val[j * W + i] = Math.log10(f.loss(d.x0 + (d.x1 - d.x0) * i / N, d.y0 + (d.y1 - d.y0) * j / N) + 1e-12)
    }
    var P = function (i, j) { return [ax.X(d.x0 + (d.x1 - d.x0) * i / N), ax.Y(d.y0 + (d.y1 - d.y0) * j / N)] }
    var seg = function (A, B) { var a = P(A[0], A[1]), b = P(B[0], B[1]); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]) }
    levels.forEach(function (lv) {
      c.beginPath()
      for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
        var a = val[j * W + i], b = val[j * W + i + 1], e = val[(j + 1) * W + i + 1], q = val[(j + 1) * W + i]
        var A = a > lv, B = b > lv, E = e > lv, Q = q > lv
        if (A === B && B === E && E === Q) continue
        var bot = A !== B ? [i + (lv - a) / (b - a), j] : null
        var rgt = B !== E ? [i + 1, j + (lv - b) / (e - b)] : null
        var top = Q !== E ? [i + (lv - q) / (e - q), j + 1] : null
        var lft = A !== Q ? [i, j + (lv - a) / (q - a)] : null
        var pts = [bot, rgt, top, lft].filter(Boolean)
        if (pts.length === 2) seg(pts[0], pts[1])
        else if (pts.length === 4) {
          if (((a + b + e + q) / 4 > lv) === A) { seg(bot, rgt); seg(top, lft) } else { seg(bot, lft); seg(rgt, top) }
        }
      }
      c.stroke()
    })
  }

  function clampPx(v) { return v > 1e4 ? 1e4 : (v < -1e4 ? -1e4 : v) }
  function drawPaths(ctx, w, hh) {
    background(w, hh)
    ctx.drawImage(bg.cv, 0, 0, w, hh)
    var d = DOMAIN[S.surface], p = square(w, hh)
    var X = function (x) { return clampPx(p.l + (x - d.x0) / (d.x1 - d.x0) * p.side) }
    var Y = function (y) { return clampPx(p.t + p.side - (y - d.y0) / (d.y1 - d.y0) * p.side) }
    view = { p: p, d: d }
    ctx.save()
    ctx.beginPath(); ctx.rect(p.l, p.t, p.side, p.side); ctx.clip()
    // minimum
    var mx = X(run.f.min[0]), my = Y(run.f.min[1])
    ctx.strokeStyle = C.navy; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(mx - 6, my - 6); ctx.lineTo(mx + 6, my + 6); ctx.moveTo(mx + 6, my - 6); ctx.lineTo(mx - 6, my + 6); ctx.stroke()
    // start point
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(X(run.th0[0]), Y(run.th0[1]), 6, 0, 2 * Math.PI); ctx.stroke()
    METHODS.forEach(function (m) {
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(S.shown, r.n)
      ctx.strokeStyle = m.color; ctx.fillStyle = m.color; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'
      ctx.beginPath()
      for (var k = 0; k <= last; k++) {
        if (!isFinite(r.xs[k]) || !isFinite(r.ys[k])) break
        if (k === 0) ctx.moveTo(X(r.xs[k]), Y(r.ys[k])); else ctx.lineTo(X(r.xs[k]), Y(r.ys[k]))
      }
      ctx.stroke()
      for (var j = 1; j <= last; j++) {
        if (!isFinite(r.xs[j]) || !isFinite(r.ys[j])) break
        ctx.beginPath(); ctx.arc(X(r.xs[j]), Y(r.ys[j]), 1.7, 0, 2 * Math.PI); ctx.fill()
      }
    })
    METHODS.forEach(function (m) {          // current points on top
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(S.shown, r.n)
      if (!isFinite(r.xs[last]) || !isFinite(r.ys[last])) return
      ctx.beginPath(); ctx.arc(X(r.xs[last]), Y(r.ys[last]), 5, 0, 2 * Math.PI)
      ctx.fillStyle = m.color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
    })
    ctx.restore()
  }

  function drawLoss(ctx, w, hh) {
    var T = run.T
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: T, y0: YLO, y1: YHI, logY: true, yticks: 5, xticks: T === 300 ? 6 : 5,
      pad: { l: 50, r: 12, t: 10, b: 38 },
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: pow10,
      xlabel: t('step t', '步数 t'), ylabel: t('loss 𝓛 (log scale)', '损失 𝓛（对数坐标）') })
    var pl = 50, pr = w - 12, pt = 10, pb = hh - 38
    ctx.save()
    ctx.beginPath(); ctx.rect(pl, pt, pr - pl, pb - pt); ctx.clip()
    // threshold 10⁻⁶ L₀
    var ty = ax.Y(run.thr)
    ctx.strokeStyle = C.slate; ctx.lineWidth = 1; ctx.setLineDash([5, 4])
    ctx.beginPath(); ctx.moveTo(pl, ty); ctx.lineTo(pr, ty); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = C.slate; ctx.font = '11px "DM Mono", Consolas, monospace'; ctx.textAlign = 'right'
    ctx.fillText('10⁻⁶·L₀', pr - 4, ty - 4)
    // current step
    if (S.shown < T) {
      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(ax.X(S.shown), pt); ctx.lineTo(ax.X(S.shown), pb); ctx.stroke()
    }
    var Yc = function (L) { return ax.Y(Math.min(Math.max(L, 1e-30), 1e30)) }
    METHODS.forEach(function (m) {
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(S.shown, r.n)
      ctx.strokeStyle = m.color; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'
      ctx.beginPath()
      for (var k = 0; k <= last; k++) {
        var L = isFinite(r.Ls[k]) ? r.Ls[k] : 1e30
        if (k === 0) ctx.moveTo(ax.X(k), Yc(L)); else ctx.lineTo(ax.X(k), Yc(L))
      }
      ctx.stroke()
      if (r.reached && r.reached <= last) {
        ctx.fillStyle = m.color
        ctx.beginPath(); ctx.arc(ax.X(r.reached), ty, 4, 0, 2 * Math.PI); ctx.fill()
      }
    })
    ctx.restore()
  }

  var cvPath = AIW.canvas(colPath, { aspect: 1, maxHeight: 440 }, drawPaths)
  var cvLoss = AIW.canvas(colLoss, { aspect: 1, maxHeight: 440 }, drawLoss)
  cvPath.cv.style.cursor = 'crosshair'
  cvPath.cv.setAttribute('role', 'img')
  cvPath.cv.setAttribute('aria-label', t('Contour plot of the loss with the path of each optimiser', '损失等高线图及各优化器的路径'))
  cvLoss.cv.setAttribute('role', 'img')
  cvLoss.cv.setAttribute('aria-label', t('Loss against step on a log scale', '损失随步数变化（对数坐标）'))
  cvPath.cv.addEventListener('click', function (ev) {
    if (!view) return
    var rect = cvPath.cv.getBoundingClientRect(), p = view.p, d = view.d
    var px = ev.clientX - rect.left, py = ev.clientY - rect.top
    if (px < p.l || px > p.l + p.side || py < p.t || py > p.t + p.side) return
    var x = Math.round((d.x0 + (px - p.l) / p.side * (d.x1 - d.x0)) * 100) / 100
    var y = Math.round((d.y0 + (p.t + p.side - py) / p.side * (d.y1 - d.y0)) * 100) / 100
    if (S.surface === 'ravine') S.start.ravine = surface().toUV(x, y)
    else S.start.banana = [x, y]
    recompute()
  })

  // ---------------------------------------------------------------- readouts
  var readRow = h('div', { class: 'w-row', style: { marginTop: '.8rem' } })
  var colTab = h('div', { class: 'w-col' }), colStab = h('div', { class: 'w-col' })
  readRow.appendChild(colTab); readRow.appendChild(colStab)
  el.appendChild(readRow)

  var info = h('div', { style: { marginBottom: '.35rem' } })
  var thMean = h('th', { text: t('mean, last 100 steps', '最近 100 步平均') })
  var table = h('table', { class: 'w-table', style: { width: '100%' } },
    h('thead', null, h('tr', null,
      h('th', { style: { textAlign: 'left' } }, t('method', '方法')),
      h('th', null, t('loss now', '当前损失')),
      h('th', null, t('first below 10⁻⁶·L₀', '首次低于 10⁻⁶·L₀')),
      thMean)))
  var tbody = h('tbody')
  table.appendChild(tbody)
  METHODS.forEach(function (m) {
    m.cells = [h('td', { style: { textAlign: 'left', whiteSpace: 'nowrap' } },
      h('i', { style: { display: 'inline-block', width: '12px', height: '4px', borderRadius: '2px', background: m.color, marginRight: '.35rem', verticalAlign: 'middle' } }), m.name),
    h('td'), h('td'), h('td')]
    m.row = h('tr', null, m.cells[0], m.cells[1], m.cells[2], m.cells[3])
    tbody.appendChild(m.row)
  })
  colTab.appendChild(h('div', { class: 'w-readout' }, info, h('div', { style: { overflowX: 'auto' } }, table)))

  var stab = h('div', { class: 'w-readout' })
  colStab.appendChild(stab)
  el.appendChild(h('p', { class: 'w-note' }, t(
    'Click or tap the contour plot to move the start point (×: the minimum, ○: the start). Every change reruns all five methods from the start point; Play replays the run two steps per frame, and Reset returns to step 0 at the default start.',
    '点击或轻触等高线图可移动起点（×：极小点，○：起点）。任何改动都会让五种方法从起点重新运行；“播放”以每帧两步重放整个过程，“重置”回到第 0 步和默认起点。')))

  function rootsMax(b, c) {               // largest |r| with r² − b r + c = 0
    var disc = b * b - 4 * c
    if (disc < 0) return Math.sqrt(c)
    var q = Math.sqrt(disc)
    return Math.max(Math.abs((b + q) / 2), Math.abs((b - q) / 2))
  }
  function rho(id, lam) {
    var e = S.eta, mu = S.mu
    if (id === 'gd') return Math.abs(1 - e * lam)
    if (id === 'hb') return rootsMax(1 + mu - e * lam, mu)
    var q = 1 - e * lam
    return rootsMax((1 + mu) * q, mu * q)
  }
  function stabLine(name, formula, limit, id) {
    var ok = S.eta < limit
    var r = Math.max(rho(id, 1), rho(id, S.kappa))
    return h('div', { style: { color: ok ? 'var(--green)' : 'var(--red)' } },
      (ok ? '✓ ' : '✗ ') + name + t(': η < ', '：η < ') + formula + ' = ' + sig(limit, 3) + '  ' +
      t('ρ = ', 'ρ = ') + fix(r, 3) + (ok ? '' : t(' (unstable)', '（不稳定）')))
  }
  function renderStability() {
    stab.textContent = ''
    if (S.surface === 'ravine') {
      var k = S.kappa, mu = S.mu
      stab.appendChild(h('div', { style: { fontWeight: '600' } },
        t('Stability on the ravine 𝓛 = ½(u² + κv²): λ_min = 1, λ_max = κ = ', '峡谷 𝓛 = ½(u² + κv²) 上的稳定性：λ_min = 1，λ_max = κ = ') + snap2(k) + t(', η = ', '，η = ') + snap2(S.eta)))
      stab.appendChild(stabLine(t('GD', '梯度下降'), '2/κ', 2 / k, 'gd'))
      stab.appendChild(stabLine(t('heavy ball', '重球动量'), '2(1 + μ)/κ', 2 * (1 + mu) / k, 'hb'))
      stab.appendChild(stabLine('Nesterov', '2(1 + μ)/((1 + 2μ)κ)', 2 * (1 + mu) / ((1 + 2 * mu) * k), 'nag'))
      stab.appendChild(h('div', { style: { marginTop: '.3rem', color: 'var(--slate)' } },
        t('ρ: contraction per step of the slowest mode. GD multiplies the steep coordinate v by 1 − ηκ = ',
          'ρ：最慢模式每步的收缩因子。梯度下降每步把陡峭坐标 v 乘以 1 − ηκ = ') + fix(1 - S.eta * k, 3) +
        t(' and the shallow coordinate u by 1 − η = ', '，把平缓坐标 u 乘以 1 − η = ') + fix(1 - S.eta, 3) + t('.', '。')))
    } else {
      var s0 = run.th0, l0 = bananaLamMax(s0[0], s0[1]), l1 = bananaLamMax(1, 1)
      stab.appendChild(h('div', { style: { fontWeight: '600' } }, t('Stability on the banana 𝓛 = (1 − x)² + 10(y − x²)²', '香蕉函数 𝓛 = (1 − x)² + 10(y − x²)² 上的稳定性')))
      stab.appendChild(h('div', { style: { color: 'var(--slate)' } }, t(
        'Not a quadratic, so no single limit: the largest Hessian eigenvalue is ' + l0.toFixed(1) + ' at the start and ' + l1.toFixed(1) +
        ' at the minimum (1, 1). The ravine’s limits hold only locally: GD needs η < ' + sig(2 / l0, 3) + ' at the start and η < ' + sig(2 / l1, 3) + ' near the minimum.',
        '它不是二次函数，没有统一的界限：Hessian 矩阵的最大特征值在起点为 ' + l0.toFixed(1) + '，在极小点 (1, 1) 为 ' + l1.toFixed(1) +
        '。峡谷的稳定界限只在局部成立：梯度下降在起点需要 η < ' + sig(2 / l0, 3) + '，在极小点附近需要 η < ' + sig(2 / l1, 3) + '。')))
    }
  }

  function renderReadouts() {
    var T = run.T, step = Math.min(S.shown, T)
    stepLbl.textContent = t('step ' + step + ' / ' + T, '第 ' + step + ' / ' + T + ' 步')
    var th = run.th0
    var parts = [t('start (', '起点 (') + fix(th[0], 2) + ', ' + fix(th[1], 2) + t('), L₀ = ', ')，L₀ = ') + fmtL(run.L0) +
      t(', 10⁻⁶·L₀ = ', '，10⁻⁶·L₀ = ') + fmtL(run.thr)]
    if (S.schedule === 'cosine') {
      parts.push(t('learning-rate factor for the next step: ', '下一步的学习率系数：') + fix(0.5 * (1 + Math.cos(Math.PI * Math.min(step, T) / T)), 3))
    }
    info.textContent = parts.join('\n')
    var noisy = S.sigma > 0
    thMean.style.display = noisy ? '' : 'none'
    METHODS.forEach(function (m) {
      m.row.style.display = m.on ? '' : 'none'
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(step, r.n)
      var div = r.diverged && r.diverged <= step
      m.cells[1].textContent = div ? '> 10⁶' : fmtL(r.Ls[last])
      m.cells[2].textContent = div ? t('diverged at step ' + r.diverged, '第 ' + r.diverged + ' 步发散')
        : (r.reached && r.reached <= step ? t('step ' + r.reached, '第 ' + r.reached + ' 步') : '—')
      m.cells[2].style.color = div ? 'var(--red)' : ''
      m.cells[3].style.display = noisy ? '' : 'none'
      if (noisy) {
        var lo = Math.max(1, last - MEANW + 1), sum = 0
        for (var k = lo; k <= last; k++) sum += r.Ls[k]
        m.cells[3].textContent = div || last < 1 ? '—' : fmtL(sum / (last - lo + 1))
      }
    })
    btnPlay.textContent = S.playing ? t('Pause', '暂停') : t('Play', '播放')
    btnStep.disabled = step >= T
  }

  function render() {
    renderReadouts()
    cvPath.redraw()
    cvLoss.redraw()
  }
  function recompute() {
    run = simulate()
    if (S.shown > run.T) S.shown = run.T
    renderStability()
    render()
  }

  // ---------------------------------------------------------------- animation
  var raf = 0
  function frame() {
    raf = 0
    if (!S.playing) return
    S.shown = Math.min(run.T, S.shown + 2)
    if (S.shown >= run.T) S.playing = false
    render()
    if (S.playing) raf = requestAnimationFrame(frame)
  }
  function stop() { S.playing = false; if (raf) cancelAnimationFrame(raf); raf = 0 }
  function play() {
    if (S.playing) { stop(); render(); return }
    if (S.shown >= run.T) S.shown = 0
    S.playing = true
    render()
    raf = requestAnimationFrame(frame)
  }
  function stepOnce() {
    stop()
    if (S.shown < run.T) S.shown += 1
    render()
  }
  function reset() {
    stop()
    S.start[S.surface] = START[S.surface].slice()
    S.shown = 0
    recompute()
  }

  renderStability()
  renderReadouts()
})
