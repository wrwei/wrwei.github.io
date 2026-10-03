/* polynomial-capacity (Module 01, Section 8). Polynomials of degree 0..15 fitted by least squares to
 * N noisy samples of sin(2πx) on the fixed design x_i = i/(N − 1); features are the Legendre
 * polynomials P_0..P_d of t = 2x − 1, and every degree is fitted with its own Householder QR of the
 * N × (d + 1) design (never the normal equations). Left: the data and the fit. Right: training and
 * validation RMSE against degree, and the exact bias², variance and σ² of the fixed design from the
 * smoother matrix S = Φ_g R⁻¹ Qᵀ on 201 grid points:
 *   bias²(x_g) = ((S f)_g − f(x_g))²  with (S f)_g = φ(x_g)ᵀ R⁻¹ Qᵀ f,
 *   variance(x_g) = σ² Σ_j S_gj² = σ² ‖R⁻ᵀ φ(x_g)‖²  (Q has orthonormal columns),
 * both averaged over the grid; expected test MSE = mean bias² + mean variance + σ². */
AIW.register('polynomial-capacity', function (el, opts) {
  'use strict'
  var h = AIW.h, t = AIW.t
  var DMAX = 15, NS = [10, 20, 50, 200], NVAL = 500, NSHOW = 60, NGRID = 201, NCURVE = 401
  var VAL_SEED = 12345, YLIM = 2.5, RMSE_LO = 0.01, RMSE_HI = 10, MSE_LO = 1e-5, MSE_HI = 10

  // ---- every visible string, in one place for the translation ----
  var S = {
    degree: t('Polynomial degree d', '多项式次数 d'),
    atMax: t(' = N − 1, the maximum', ' = N − 1（上限）'),
    nPts: t('Training points N', '训练点数 N'),
    sigma: t('Noise σ', '噪声 σ'),
    draw: t('New noise draw', '重新抽取噪声'),
    reset: t('Reset', '重置'),
    showBV: t('Show bias² and variance', '显示偏差² 与方差'),
    trainPts: t('training points', '训练点'),
    valPts: t('validation points (60 of 500)', '验证点（500 个中的 60 个）'),
    truth: t('true function sin(2πx)', '真实函数 sin(2πx)'),
    fit: t('fitted polynomial', '拟合多项式'),
    trainRmse: t('training RMSE', '训练 RMSE'),
    valRmse: t('validation RMSE', '验证 RMSE'),
    valBest: t('lowest validation RMSE', '验证 RMSE 最低处'),
    sigmaLine: t('σ, the noise level', 'σ（噪声水平）'),
    bias2: t('bias²', '偏差²'),
    variance: t('variance', '方差'),
    noise2: t('σ² (irreducible)', 'σ²（不可约）'),
    sum: t('sum = expected test MSE', '总和 = 期望测试 MSE'),
    sumMin: t('its minimum', '总和的最小值'),
    xDeg: t('degree d', '次数 d'),
    under: t('underfitting', '欠拟合'),
    over: t('overfitting', '过拟合'),
    min: t('min', '最小'),
    seed: t('noise seed', '噪声种子'),
    interp: t('0 (interpolates)', '0（插值）'),
    bestVal: t('best degree on validation', '验证集上的最佳次数'),
    bestExp: t('best degree by expected error', '期望误差最小的次数'),
    exact: t('exact for this design at d = ', '该固定设计下的精确值，d = '),
    root: t('square root of the sum', '总和的平方根'),
    note: t('The exact curves average over every possible noise draw for this fixed design, so a new draw moves the dots and the RMSE curves but not the bias² and variance. Click either chart on the right to pick a degree.',
      '精确曲线对该固定设计下所有可能的噪声抽样取平均，因此重新抽取噪声会改变数据点和 RMSE 曲线，但不会改变偏差² 与方差。点击右侧任一图表可选择次数。')
  }

  // ---- maths ----
  // mulberry32 exactly as AIW.rng, except that seed 0 is used as it is (AIW.rng maps 0 to 1, which
  // would make noise seeds 0 and 1 the same draw).
  function mulberry32(seed) {
    var a = seed >>> 0
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0
      var q = Math.imul(a ^ a >>> 15, 1 | a)
      q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q
      return ((q ^ q >>> 14) >>> 0) / 4294967296
    }
  }
  function f(x) { return Math.sin(2 * Math.PI * x) }
  function legendre(x) {             // P_0..P_15 at t = 2x − 1: (k + 1)P_(k+1) = (2k + 1)tP_k − kP_(k−1)
    var u = 2 * x - 1, p = new Float64Array(DMAX + 1)
    p[0] = 1; p[1] = u
    for (var k = 1; k < DMAX; k++) p[k + 1] = ((2 * k + 1) * u * p[k] - k * p[k - 1]) / (k + 1)
    return p
  }
  function dot(p, w) { var s = 0; for (var j = 0; j < w.length; j++) s += p[j] * w[j]; return s }
  // Householder QR of the first n columns of the m-row design (rows: arrays of Legendre values)
  function qr(rows, m, n) {
    var A = [], refl = [], i, j, k
    for (j = 0; j < n; j++) { var c = new Float64Array(m); for (i = 0; i < m; i++) c[i] = rows[i][j]; A.push(c) }
    for (k = 0; k < n; k++) {
      var a = A[k], nrm = 0
      for (i = k; i < m; i++) nrm += a[i] * a[i]
      nrm = Math.sqrt(nrm)
      var alpha = a[k] > 0 ? -nrm : nrm           // sign chosen so that v[0] involves no cancellation
      var v = new Float64Array(m - k)
      for (i = k; i < m; i++) v[i - k] = a[i]
      v[0] -= alpha
      var vtv = 0
      for (i = 0; i < m - k; i++) vtv += v[i] * v[i]
      if (vtv > 0) for (j = k; j < n; j++) {
        var col = A[j], s = 0
        for (i = k; i < m; i++) s += v[i - k] * col[i]
        s = 2 * s / vtv
        for (i = k; i < m; i++) col[i] -= s * v[i - k]
      }
      refl.push([v, vtv])
    }
    var R = new Float64Array(n * n)
    for (k = 0; k < n; k++) for (j = k; j < n; j++) R[k * n + j] = A[j][k]
    return { m: m, n: n, R: R, refl: refl }
  }
  function qtMul(F, y) {               // Qᵀy, applying the stored reflectors in order
    var z = Float64Array.from(y), m = F.m
    for (var k = 0; k < F.n; k++) {
      var v = F.refl[k][0], vtv = F.refl[k][1], s = 0, i
      if (!(vtv > 0)) continue
      for (i = k; i < m; i++) s += v[i - k] * z[i]
      s = 2 * s / vtv
      for (i = k; i < m; i++) z[i] -= s * v[i - k]
    }
    return z
  }
  function backSub(F, b) {             // R w = (Qᵀy)_(0..n−1)
    var n = F.n, R = F.R, w = new Float64Array(n)
    for (var i = n - 1; i >= 0; i--) { var s = b[i]; for (var j = i + 1; j < n; j++) s -= R[i * n + j] * w[j]; w[i] = s / R[i * n + i] }
    return w
  }
  function rowNorm2(F, p) {            // Σ_j S_gj² = ‖R⁻ᵀ φ‖², forward substitution on Rᵀ
    var n = F.n, R = F.R, z = new Float64Array(n), ss = 0
    for (var i = 0; i < n; i++) { var s = p[i]; for (var j = 0; j < i; j++) s -= R[j * n + i] * z[j]; z[i] = s / R[i * n + i]; ss += z[i] * z[i] }
    return ss
  }
  function argmin(a) { var b = 0; for (var i = 1; i < a.length; i++) if (a[i] < a[b]) b = i; return b }

  // validation set: 500 x uniform on [0, 1], then their own 500 normals, from mulberry32(12345)
  var VAL = (function () {
    var r = mulberry32(VAL_SEED), x = new Float64Array(NVAL), e = new Float64Array(NVAL), fx = new Float64Array(NVAL), P = [], k
    for (k = 0; k < NVAL; k++) x[k] = r()
    for (k = 0; k < NVAL; k++) e[k] = AIW.gauss(r)
    for (k = 0; k < NVAL; k++) { fx[k] = f(x[k]); P.push(legendre(x[k])) }
    return { x: x, e: e, f: fx, P: P }
  })()
  function gridOf(n) {
    var x = new Float64Array(n), fx = new Float64Array(n), P = []
    for (var g = 0; g < n; g++) { x[g] = g / (n - 1); fx[g] = f(x[g]); P.push(legendre(x[g])) }
    return { x: x, f: fx, P: P }
  }
  var GRID = gridOf(NGRID), CURVE = gridOf(NCURVE)

  // ---- state (data-degree, data-n, data-sigma, data-seed, data-bv may change the defaults) ----
  function num(v, lo, hi, d) { var x = Number(v); return v != null && v !== '' && isFinite(x) && x >= lo && x <= hi ? x : d }
  var init = {
    deg: Math.round(num(opts.degree, 0, DMAX, 3)),
    N: NS.indexOf(Number(opts.n)) >= 0 ? Number(opts.n) : 20,
    sigma: Math.round(num(opts.sigma, 0.05, 0.6, 0.3) * 100) / 100,
    seed: Math.round(num(opts.seed, 0, 1e9, 0)),
    bv: !(opts.bv === '0' || opts.bv === 'false' || opts.bv === 'off')
  }
  var state = { degReq: init.deg, N: init.N, sigma: init.sigma, seed: init.seed, bv: init.bv }
  function deg() { return Math.min(state.degReq, state.N - 1) }

  // all degrees at once; called when N, σ or the seed changes (at most 16 QR factorisations)
  var R = null
  function compute() {
    var N = state.N, sig = state.sigma, dmax = Math.min(DMAX, N - 1), i, k, g
    var r = mulberry32(state.seed), x = new Float64Array(N), fx = new Float64Array(N), y = new Float64Array(N), P = []
    for (i = 0; i < N; i++) { x[i] = i / (N - 1); fx[i] = f(x[i]); y[i] = fx[i] + sig * AIW.gauss(r); P.push(legendre(x[i])) }
    var out = { N: N, sigma: sig, dmax: dmax, x: x, y: y, W: [], train: [], val: [], bias2: [], vr: [], tot: [] }
    for (var d = 0; d <= dmax; d++) {
      var F = qr(P, N, d + 1)
      var w = backSub(F, qtMul(F, y)), wf = backSub(F, qtMul(F, fx))
      var se = 0, sv = 0, b2 = 0, lev = 0
      for (i = 0; i < N; i++) { var ri = dot(P[i], w) - y[i]; se += ri * ri }
      for (k = 0; k < NVAL; k++) { var rk = dot(VAL.P[k], w) - (VAL.f[k] + sig * VAL.e[k]); sv += rk * rk }
      for (g = 0; g < NGRID; g++) { var bg = dot(GRID.P[g], wf) - GRID.f[g]; b2 += bg * bg; lev += rowNorm2(F, GRID.P[g]) }
      b2 /= NGRID
      var vr = sig * sig * lev / NGRID
      out.W.push(w)
      out.train.push(d === N - 1 ? 0 : Math.sqrt(se / N))   // d = N − 1 interpolates: the residual is rounding
      out.val.push(Math.sqrt(sv / NVAL))
      out.bias2.push(b2); out.vr.push(vr); out.tot.push(b2 + vr + sig * sig)
    }
    out.bestVal = argmin(out.val); out.bestExp = argmin(out.tot)
    R = out
  }
  compute()

  // ---- drawing helpers ----
  function cssVar(name, fb) { try { var v = window.getComputedStyle(el).getPropertyValue(name).trim(); return v || fb } catch (e) { return fb } }
  function palette() {
    var C = AIW.C
    return { train: cssVar('--blue', C.blue), val: cssVar('--orange', C.orange), fit: cssVar('--navy', C.navy),
      truth: cssVar('--slate', C.slate), bias: cssVar('--purple', C.purple), vari: cssVar('--green', C.green),
      sum: cssVar('--navy', C.navy), noise: cssVar('--slate', C.slate), muted: cssVar('--muted', C.muted),
      text: cssVar('--navy', C.navy), halo: cssVar('--white', '#FFFFFF') }
  }
  var FONT = '11px "DM Sans", system-ui, sans-serif'
  function txt(ctx, s, x, y, color, align, base, font) {
    ctx.save(); ctx.font = font || FONT; ctx.textAlign = align || 'left'; ctx.textBaseline = base || 'alphabetic'
    ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = ctx.__halo || '#FFFFFF'; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y)
    ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore()
  }
  function plotRect(ax, w, hh, grow) { return { x: ax.pad.l - (grow || 0), y: ax.pad.t, w: w - ax.pad.l - ax.pad.r + 2 * (grow || 0), h: hh - ax.pad.t - ax.pad.b } }
  function clipTo(ctx, r) { ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip() }
  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI) }
  function triangle(ctx, x, y, up, s) {  // apex on the edge at (x, y), pointing out of the plot
    var dy = up ? 1.5 * s : -1.5 * s
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s, y + dy); ctx.lineTo(x + s, y + dy); ctx.closePath()
  }
  function clampLog(v, lo, hi) { return Math.min(hi * 1e3, Math.max(lo * 1e-3, v)) }
  function fint(v) { return String(Math.round(v)) }
  function flog(v) {
    var e = Math.round(Math.log10(v))
    if (e < -2) return '10' + String(e).replace('-', '⁻').replace(/[0-9]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] })
    return e >= 0 ? String(Math.round(v)) : v.toFixed(-e)
  }
  function f4(v) { return v < 5e-5 ? (v === 0 ? '0' : v.toExponential(0).replace('e-', '×10⁻').replace(/[0-9]+$/, function (m) { return m.replace(/[0-9]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] }) })) : v.toFixed(4) }
  function f1(v) { return (Math.abs(v) < 1e-9 ? '0' : String(Math.round(v * 10) / 10)).replace('-', '−') }
  function vLine(ctx, ax, x, hh, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.25
    ctx.beginPath(); ctx.moveTo(ax.X(x), ax.pad.t); ctx.lineTo(ax.X(x), hh - ax.pad.b); ctx.stroke(); ctx.restore()
  }
  function hLine(ctx, ax, y, w, color) {
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = color; ctx.lineWidth = 1.3
    ctx.beginPath(); ctx.moveTo(ax.pad.l, ax.Y(y)); ctx.lineTo(w - ax.pad.r, ax.Y(y)); ctx.stroke(); ctx.restore()
  }
  function disabledBand(ctx, ax, w, hh, P) {     // degrees ≥ N cannot be fitted
    if (R.N - 1 >= DMAX) return
    var r = plotRect(ax, w, hh), x0 = ax.X(R.N - 0.5), x1 = r.x + r.w
    ctx.save(); ctx.beginPath(); ctx.rect(x0, r.y, x1 - x0, r.h); ctx.clip()
    ctx.fillStyle = 'rgba(148,163,184,0.14)'; ctx.fillRect(x0, r.y, x1 - x0, r.h)
    ctx.strokeStyle = 'rgba(148,163,184,0.45)'; ctx.lineWidth = 1; ctx.beginPath()
    for (var s = x0 - r.h; s < x1; s += 7) { ctx.moveTo(s, r.y + r.h); ctx.lineTo(s + r.h, r.y) }
    ctx.stroke(); ctx.restore()
    txt(ctx, 'd ≥ N', (x0 + x1) / 2, r.y + r.h / 2, P.muted, 'center', 'middle')
  }
  // one series against degree on a log axis: polyline, dots, and a triangle where a value is off scale
  function series(ctx, ax, vals, lo, hi, color, width, d, rect, marks) {
    ctx.save(); clipTo(ctx, rect)
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.beginPath()
    for (var i = 0; i < vals.length; i++) { var px = ax.X(i), py = ax.Y(clampLog(vals[i], lo, hi)); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py) }
    ctx.stroke()
    for (i = 0; i < vals.length; i++) {
      if (vals[i] < lo || vals[i] > hi) continue
      circle(ctx, ax.X(i), ax.Y(vals[i]), i === d ? 4.5 : 2.4); ctx.fillStyle = color; ctx.fill()
      if (i === d) { ctx.lineWidth = 1.5; ctx.strokeStyle = ctx.__halo || '#FFFFFF'; ctx.stroke() }
    }
    ctx.restore()
    if (marks) for (i = 0; i < vals.length; i++) {
      if (vals[i] >= lo && vals[i] <= hi) continue
      var up = vals[i] > hi
      triangle(ctx, ax.X(i), up ? rect.y : rect.y + rect.h, up, i === d ? 5 : 4); ctx.fillStyle = color; ctx.fill()
    }
  }

  // ---- left: data, true function and fit ----
  var PADFIT = { l: 40, r: 10, t: 12, b: 32 }
  function drawFit(ctx, w, hh) {
    var P = palette(), d = deg(), i, k
    ctx.__halo = P.halo
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: 1, y0: -YLIM, y1: YLIM, xticks: 5, yticks: 2, pad: PADFIT, xlabel: 'x', ylabel: 'y', xfmt: f1, yfmt: f1 })
    var X = ax.X, Y = ax.Y, rect = plotRect(ax, w, hh)
    ctx.save(); ctx.strokeStyle = AIW.C.border; ctx.fillStyle = AIW.C.slate; ctx.font = '11px "DM Mono", Consolas, monospace'; ctx.textAlign = 'right'
    ;[-1, 1].forEach(function (v) { ctx.beginPath(); ctx.moveTo(rect.x, Y(v)); ctx.lineTo(rect.x + rect.w, Y(v)); ctx.stroke(); ctx.fillText(f1(v), PADFIT.l - 6, Y(v) + 4) })
    ctx.restore()
    var W = R.W[d], yfit = new Float64Array(NCURVE)
    for (k = 0; k < NCURVE; k++) yfit[k] = Math.max(-1e4, Math.min(1e4, dot(CURVE.P[k], W)))
    ctx.save(); clipTo(ctx, rect)
    ctx.setLineDash([6, 4]); ctx.strokeStyle = P.truth; ctx.lineWidth = 1.5; ctx.beginPath()
    for (k = 0; k < NCURVE; k++) { if (k) ctx.lineTo(X(CURVE.x[k]), Y(CURVE.f[k])); else ctx.moveTo(X(CURVE.x[k]), Y(CURVE.f[k])) }
    ctx.stroke(); ctx.setLineDash([])
    ctx.strokeStyle = P.val; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.8
    for (k = 0; k < NSHOW; k++) { circle(ctx, X(VAL.x[k]), Y(VAL.f[k] + R.sigma * VAL.e[k]), 3); ctx.stroke() }
    ctx.globalAlpha = 1; ctx.strokeStyle = P.fit; ctx.lineWidth = 2.25; ctx.lineJoin = 'round'; ctx.beginPath()
    for (k = 0; k < NCURVE; k++) { if (k) ctx.lineTo(X(CURVE.x[k]), Y(yfit[k])); else ctx.moveTo(X(CURVE.x[k]), Y(yfit[k])) }
    ctx.stroke()
    var rad = R.N > 50 ? 2.4 : 3.6
    ctx.fillStyle = P.train; ctx.strokeStyle = P.halo; ctx.lineWidth = 1
    for (i = 0; i < R.N; i++) { circle(ctx, X(R.x[i]), Y(R.y[i]), rad); ctx.fill(); ctx.stroke() }
    ctx.restore()
    // a small marker where the fit leaves [−2.5, 2.5], labelled with how far it goes
    var runs = [], cur = null, prev = 0
    for (k = 0; k < NCURVE; k++) {
      var v = yfit[k], side = v > YLIM ? 1 : (v < -YLIM ? -1 : 0)
      if (side !== prev) {
        cur = null
        if (side !== 0) {
          var xe = CURVE.x[k]
          if (k > 0 && prev === 0) { var v0 = yfit[k - 1]; xe = CURVE.x[k - 1] + (side * YLIM - v0) / (v - v0) * (CURVE.x[k] - CURVE.x[k - 1]) }
          cur = { x: xe, side: side, peak: v }; runs.push(cur)
        }
      }
      if (cur && Math.abs(v) > Math.abs(cur.peak)) cur.peak = v
      prev = side
    }
    runs.forEach(function (r) {
      var px = X(r.x), py = r.side > 0 ? rect.y : rect.y + rect.h
      triangle(ctx, px, py, r.side > 0, 5); ctx.fillStyle = P.fit; ctx.fill()
      var right = px < rect.x + rect.w - 44
      txt(ctx, AIW.fmt(r.peak, 1), right ? px + 8 : px - 8, r.side > 0 ? py + 12 : py - 5, P.fit, right ? 'left' : 'right')
    })
    txt(ctx, 'd = ' + d, rect.x + 8, rect.y + 17, P.text, 'left', 'alphabetic', '600 13px "DM Sans", system-ui, sans-serif')
  }

  // ---- right top: training and validation RMSE against degree ----
  var PADR = { l: 56, r: 12, t: 12, b: 32 }, rmseAx = null, bvAx = null
  function drawRmse(ctx, w, hh) {
    var P = palette(), d = deg()
    ctx.__halo = P.halo
    var ax = rmseAx = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: DMAX, y0: RMSE_LO, y1: RMSE_HI, logY: true, xticks: 5, yticks: 3, pad: PADR, xlabel: S.xDeg, ylabel: 'RMSE', xfmt: fint, yfmt: flog })
    var rect = plotRect(ax, w, hh)
    disabledBand(ctx, ax, w, hh, P)
    txt(ctx, '← ' + S.under, rect.x + 6, rect.y + 13, P.muted, 'left')
    txt(ctx, S.over + ' →', rect.x + rect.w - 6, rect.y + 13, P.muted, 'right')
    hLine(ctx, ax, R.sigma, w, P.noise)
    txt(ctx, 'σ', rect.x + 5, ax.Y(R.sigma) + 13, P.noise, 'left')
    vLine(ctx, ax, d, hh, P.text)
    var wide = plotRect(ax, w, hh, 6)
    series(ctx, ax, R.train, RMSE_LO, RMSE_HI, P.train, 2, d, wide, true)
    series(ctx, ax, R.val, RMSE_LO, RMSE_HI, P.val, 2, d, wide, true)
    var b = R.bestVal
    if (R.val[b] >= RMSE_LO && R.val[b] <= RMSE_HI) { circle(ctx, ax.X(b), ax.Y(R.val[b]), 7.5); ctx.strokeStyle = P.val; ctx.lineWidth = 1.5; ctx.stroke() }
  }

  // ---- right bottom: exact bias², variance, σ² and their sum ----
  function drawBV(ctx, w, hh) {
    var P = palette(), d = deg()
    ctx.__halo = P.halo
    var ax = bvAx = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: DMAX, y0: MSE_LO, y1: MSE_HI, logY: true, xticks: 5, yticks: 6, pad: PADR, xlabel: S.xDeg, ylabel: 'MSE', xfmt: fint, yfmt: flog })
    var rect = plotRect(ax, w, hh), wide = plotRect(ax, w, hh, 6)
    disabledBand(ctx, ax, w, hh, P)
    hLine(ctx, ax, R.sigma * R.sigma, w, P.noise)
    vLine(ctx, ax, d, hh, P.text)
    series(ctx, ax, R.bias2, MSE_LO, MSE_HI, P.bias, 2, d, wide, false)
    series(ctx, ax, R.vr, MSE_LO, MSE_HI, P.vari, 2, d, wide, false)
    series(ctx, ax, R.tot, MSE_LO, MSE_HI, P.sum, 2.6, d, wide, false)
    var b = R.bestExp, bx = ax.X(b), by = ax.Y(R.tot[b])
    circle(ctx, bx, by, 7.5); ctx.strokeStyle = P.sum; ctx.lineWidth = 1.5; ctx.stroke()
    txt(ctx, S.min, bx, by - 11, P.sum, 'center', 'alphabetic', '600 11px "DM Sans", system-ui, sans-serif')
    txt(ctx, 'σ²', rect.x + 5, ax.Y(R.sigma * R.sigma) + 13, P.noise, 'left')
  }

  // ---- controls ----
  var degSlider = AIW.slider({ label: S.degree, min: 0, max: DMAX, step: 1, value: deg(),
    fmt: function (v) { var dd = Math.min(Math.round(v), state.N - 1); return String(dd) + (dd === state.N - 1 ? S.atMax : '') },
    onInput: function (v) {
      var dd = Math.round(v)
      if (dd > state.N - 1) { dd = state.N - 1; degSlider.set(dd) }   // degrees ≥ N are disabled
      state.degReq = dd; update(false)
    } })
  degSlider.style.flex = '1 1 200px'
  var nBtns = NS.map(function (n, i) {
    var b = AIW.button(String(n), function () { setN(n) }, n !== state.N)
    b.style.borderRadius = i === 0 ? '8px 0 0 8px' : (i === NS.length - 1 ? '0 8px 8px 0' : '0')
    if (i) b.style.marginLeft = '-1px'
    b.style.minWidth = '2.9rem'
    return b
  })
  function styleN() {
    nBtns.forEach(function (b, i) { var on = NS[i] === state.N; b.className = 'w-btn' + (on ? '' : ' secondary'); b.setAttribute('aria-pressed', on ? 'true' : 'false') })
  }
  styleN()
  var nGroup = h('div', { class: 'w-ctl', role: 'group', 'aria-label': S.nPts },
    h('span', { text: S.nPts }), h.apply(null, ['div', { style: { display: 'flex' } }].concat(nBtns)))
  function setN(n) { state.N = n; styleN(); degSlider.set(deg()); update(true) }
  var sigSlider = AIW.slider({ label: S.sigma, min: 0.05, max: 0.6, step: 0.01, value: state.sigma,
    fmt: function (v) { return v.toFixed(2) },
    onInput: function (v) { state.sigma = Math.round(v * 100) / 100; update(true) } })
  sigSlider.style.flex = '1 1 170px'
  var drawBtn = AIW.button(S.draw, function () { state.seed += 1; update(true) })
  var resetBtn = AIW.button(S.reset, function () {
    state.degReq = init.deg; state.N = init.N; state.sigma = init.sigma; state.seed = init.seed; state.bv = init.bv
    styleN(); degSlider.set(deg()); sigSlider.set(state.sigma); bvInput.checked = state.bv; showBV(); update(true)
  }, true)
  var bvBox = AIW.checkbox(S.showBV, state.bv, function (on) { state.bv = on; showBV(); update(false) })
  var bvInput = bvBox.querySelector('input')
  bvBox.style.alignSelf = 'flex-end'
  var btnRow = h('div', { style: { display: 'flex', gap: '.5rem', alignItems: 'flex-end', alignSelf: 'flex-end', flexWrap: 'wrap' } }, drawBtn, resetBtn)

  // ---- layout ----
  function swatch(kind, color) {
    var st = { display: 'inline-block', marginRight: '.3rem', verticalAlign: 'middle', boxSizing: 'border-box' }
    if (kind === 'line') { st.width = '14px'; st.height = '3px'; st.borderRadius = '2px'; st.background = color }
    else if (kind === 'bold') { st.width = '14px'; st.height = '4px'; st.borderRadius = '2px'; st.background = color }
    else if (kind === 'dash') { st.width = '14px'; st.height = '0'; st.borderRadius = '0'; st.borderTop = '2px dashed ' + color }
    else if (kind === 'dot') { st.width = '8px'; st.height = '8px'; st.borderRadius = '50%'; st.background = color }
    else { st.width = '10px'; st.height = '10px'; st.borderRadius = '50%'; st.border = '1.5px solid ' + color }
    return h('i', { style: st })
  }
  function legend(items) {
    return h.apply(null, ['div', { class: 'w-legend' }].concat(items.map(function (it) { return h('span', null, swatch(it[0], it[1]), it[2]) })))
  }
  var P0 = palette()
  var fitHost = h('div'), rmseHost = h('div'), bvHost = h('div')
  var leftCol = h('div', { class: 'w-col' },
    legend([['dot', P0.train, S.trainPts], ['ring', P0.val, S.valPts], ['dash', P0.truth, S.truth], ['bold', P0.fit, S.fit]]), fitHost)
  var bvWrap = h('div', { style: { marginTop: '.5rem' } },
    legend([['line', P0.bias, S.bias2], ['line', P0.vari, S.variance], ['dash', P0.noise, S.noise2], ['bold', P0.sum, S.sum], ['ring', P0.sum, S.sumMin]]), bvHost)
  var rightCol = h('div', { class: 'w-col' },
    legend([['line', P0.train, S.trainRmse], ['line', P0.val, S.valRmse], ['ring', P0.val, S.valBest], ['dash', P0.noise, S.sigmaLine]]), rmseHost, bvWrap)
  var gridRO = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: '.9rem', rowGap: '.05rem' }
  var ro1 = h('div', { class: 'w-readout', style: gridRO, 'aria-live': 'polite' })
  var ro2 = h('div', { class: 'w-readout', style: gridRO })
  var ro2Wrap = h('div', { class: 'w-col' }, ro2)
  el.textContent = ''
  el.appendChild(h('div', { class: 'w-controls' }, degSlider, nGroup, sigSlider, btnRow, bvBox))
  el.appendChild(h('div', { class: 'w-row' }, leftCol, rightCol))
  el.appendChild(h('div', { class: 'w-row', style: { marginTop: '.8rem' } }, h('div', { class: 'w-col' }, ro1), ro2Wrap))
  el.appendChild(h('p', { class: 'w-note', text: S.note }))

  var fitApi = AIW.canvas(fitHost, { get aspect() { return fitHost.clientWidth < 360 ? 0.86 : 1.0 }, maxHeight: 420 }, drawFit)
  var rmseApi = AIW.canvas(rmseHost, { get aspect() { return rmseHost.clientWidth < 360 ? 0.72 : 0.5 }, maxHeight: 250 }, drawRmse)
  var bvApi = AIW.canvas(bvHost, { get aspect() { return bvHost.clientWidth < 360 ? 0.72 : 0.5 }, maxHeight: 250 }, drawBV)
  function pick(api, getAx) {
    api.cv.style.cursor = 'pointer'
    api.cv.addEventListener('click', function (e) {
      var ax = getAx(); if (!ax) return
      var px = e.clientX - api.cv.getBoundingClientRect().left
      var dd = Math.max(0, Math.min(R.dmax, Math.round((px - ax.pad.l) / (api.w - ax.pad.l - ax.pad.r) * DMAX)))
      state.degReq = dd; degSlider.set(dd); update(false)
    })
  }
  pick(rmseApi, function () { return rmseAx })
  pick(bvApi, function () { return bvAx })

  // ---- readouts ----
  function cell(parent, label, value) {
    parent.appendChild(h('span', { text: label }))
    parent.appendChild(h('span', { text: value, style: { textAlign: 'right' } }))
  }
  function readout() {
    var d = deg(), N = R.N, s = R.sigma
    ro1.textContent = ''; ro2.textContent = ''
    ro1.appendChild(h('div', { style: { gridColumn: '1 / -1', fontWeight: '600' }, text: 'd = ' + d + ' · N = ' + N + ' · σ = ' + s.toFixed(2) + ' · ' + S.seed + ' ' + state.seed }))
    cell(ro1, S.trainRmse, d === N - 1 ? S.interp : R.train[d].toFixed(3))
    cell(ro1, S.valRmse, R.val[d].toFixed(3))
    cell(ro1, S.bestVal, R.bestVal + ' (RMSE ' + R.val[R.bestVal].toFixed(3) + ')')
    cell(ro1, S.bestExp, R.bestExp + ' (MSE ' + R.tot[R.bestExp].toFixed(4) + ')')
    ro2.appendChild(h('div', { style: { gridColumn: '1 / -1', fontWeight: '600' }, text: S.exact + d }))
    cell(ro2, S.bias2, f4(R.bias2[d]))
    cell(ro2, S.variance, R.vr[d].toFixed(4))
    cell(ro2, 'σ²', (s * s).toFixed(4))
    cell(ro2, S.sum, R.tot[d].toFixed(4))
    cell(ro2, S.root, Math.sqrt(R.tot[d]).toFixed(3))
  }
  function showBV() { bvWrap.style.display = state.bv ? '' : 'none'; ro2Wrap.style.display = state.bv ? '' : 'none' }
  function update(recompute) {
    if (recompute) compute()
    fitApi.redraw(); rmseApi.redraw(); if (state.bv) bvApi.redraw()
    readout()
  }
  showBV()
  readout()
})
