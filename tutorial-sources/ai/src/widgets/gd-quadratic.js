/* gd-quadratic — Module 01, Section 3: gradient descent on a two-dimensional quadratic.
 * L(w) = ½(λ_max (v_maxᵀw)² + λ_min (v_minᵀw)²) with λ_max = 1 and λ_min = 1/κ; the valley
 * direction v_min = (cos 30°, sin 30°), the steep direction v_max = (−sin 30°, cos 30°); minimum at 0.
 * Update w ← w − η(Hw + σ_g ξ), ξ two standard normals from AIW.rng(1) + AIW.gauss (mulberry32,
 * Box–Muller), reseeded for every run so a run always repeats exactly.
 * A run stops when L > 10⁶ (diverged), when σ_g = 0 and L < 10⁻⁶·L₀ (converged), or after 300 steps. */
AIW.register('gd-quadratic', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h

  // ---------- every visible string, in one object for the translation ----------
  var S = {
    eta: t('learning rate η (in units of 1/λ_max)', '学习率 η（以 1/λ_max 为单位）'),
    kappa: t('condition number κ = λ_max/λ_min', '条件数 κ = λ_max/λ_min'),
    sigma: t('gradient noise σ_g (0 = full batch)', '梯度噪声 σ_g（0 为全批量）'),
    preset: t('preset', '预设场景'),
    custom: t('custom (set by the sliders)', '自定义（由滑块设定）'),
    presets: [
      t('well conditioned (κ = 1, η = 1)', '良态（κ = 1，η = 1）'),
      t('standardised but correlated, ρ = 0.8 (κ = 9)', '已标准化但相关，ρ = 0.8（κ = 9）'),
      t('units differ tenfold (κ = 100)', '单位相差十倍（κ = 100）'),
      t('units differ thirtyfold (κ = 900)', '单位相差三十倍（κ = 900）'),
      t('zig-zag (κ = 20, η = 1.8)', '之字形（κ = 20，η = 1.8）'),
      t('just unstable (κ = 20, η = 2.05)', '刚好不稳定（κ = 20，η = 2.05）')
    ],
    step: t('Step', '单步'), run: t('Run', '运行'), pause: t('Pause', '暂停'), reset: t('Reset', '重置'),
    hint: t('Click the contour plot to move the starting point w₀; a preset restores the default start. Presets without an η use η = 1.8.',
      '点击等高线图可移动起点 w₀；选择预设场景会恢复默认起点。未标明 η 的预设场景使用 η = 1.8。'),
    flat: t('flat (valley)', '平坦方向（谷底）'), steep: t('steep', '陡峭方向'),
    iter: t('iteration t', '迭代步数 t'), lossAxis: t('loss L (log scale)', '损失 L（对数坐标）'),
    legLoss: t('loss L(w_t)', '损失 L(w_t)'), legEnv: t('envelope L₀ρ^(2t)', '包络 L₀ρ^(2t)'),
    legTarget: t('target 10⁻⁶ L₀', '目标 10⁻⁶ L₀'), legFloor: t('predicted noise floor', '预测的噪声基底'),
    barSteep: t('steep |1 − ηλ_max|', '陡峭 |1 − ηλ_max|'), barFlat: t('flat |1 − ηλ_min|', '平坦 |1 − ηλ_min|'),
    barNote: t('stable only below 1', '小于 1 才稳定'),
    stableWhile: t('stable while η < 2/λ_max = 2', 'η < 2/λ_max = 2 时稳定'),
    factors: t('factor per step', '每步收缩因子'), steepF: t('steep', '陡峭'), flatF: t('flat', '平坦'),
    stepT: t('step t', '步数 t'),
    status: t('status', '状态'),
    atStart: t('at the start: press Step or Run', '位于起点：请按“单步”或“运行”'),
    convergedIn: function (n) { return t('converged in ' + n + (n === 1 ? ' step' : ' steps'), n + ' 步收敛') },
    divergedAt: function (n) { return t('diverged at step ' + n, '在第 ' + n + ' 步发散') },
    converging: t('converging', '正在收敛'),
    diverging: t('diverging: the steep mode grows every step', '正在发散：陡峭方向的分量逐步增大'),
    oscillating: t('oscillating across the valley', '在山谷两侧来回振荡'),
    marginal: t('marginal: the steep mode neither grows nor decays', '临界：陡峭方向的分量既不增长也不衰减'),
    atFloor: t('at the noise floor', '已到达噪声基底'),
    toFloor: t('descending towards the noise floor', '正在向噪声基底下降'),
    capShown: t('plots show the first 300 steps', '图中只显示前 300 步'),
    stepsFor: t('steps for a 10⁶ loss reduction', '损失下降 10⁶ 倍所需步数'),
    predicted: t('predicted', '预测'), byEnvelope: t('from the envelope', '由包络估计'), actual: t('actual', '实际'),
    never: t('never', '永不'),
    divergesAt: function (n) { return t('diverges at step ' + n, '在第 ' + n + ' 步发散') },
    noisy: t('not measured with noise: the loss stalls at the floor', '有噪声时不统计：损失停在噪声基底附近'),
    meanL: function (a, b) { return t('L averaged over steps ' + a + '–' + b, '第 ' + a + '–' + b + ' 步 L 的平均值') },
    floor: t('predicted floor Σ_i ησ_g²/(2(2 − ηλ_i))', '预测噪声基底 Σ_i ησ_g²/(2(2 − ηλ_i))'),
    floorInf: t('∞ (needs η < 2/λ_max)', '∞（需要 η < 2/λ_max）')
  }

  // ---------- colours from the page's CSS variables (fallback: the core palette) ----------
  var css = window.getComputedStyle ? window.getComputedStyle(el) : null
  var col = function (name, fb) { var v = css && css.getPropertyValue(name); return (v && v.trim()) || fb }
  var C = {
    navy: col('--navy', AIW.C.navy), blue: col('--blue', AIW.C.blue), sky: col('--sky', AIW.C.sky),
    slate: col('--slate', AIW.C.slate), muted: col('--muted', AIW.C.muted), border: col('--border', AIW.C.border),
    orange: col('--orange', AIW.C.orange), red: col('--red', AIW.C.red), purple: col('--purple', AIW.C.purple),
    amber: col('--amber', AIW.C.amber), green: col('--green', AIW.C.green), white: col('--white', '#FFFFFF'),
    track: col('--code-bg', '#F1F5F9')
  }
  var MONO = '"DM Mono", Consolas, monospace', SANS = '"DM Sans", system-ui, sans-serif'

  // ---------- the model ----------
  var C30 = Math.cos(Math.PI / 6), S30 = Math.sin(Math.PI / 6)
  var VMIN = [C30, S30], VMAX = [-S30, C30], LMAX = 1
  var W0 = [-3.5 * VMIN[0] + 1.5 * VMAX[0], -3.5 * VMIN[1] + 1.5 * VMAX[1]]   // ≈ (−3.78, −0.45)
  var CAP = 300, LDIV = 1e6, TOL = 1e-6, LONG = 2000000
  var PRESETS = [{ kappa: 1, eta: 1 }, { kappa: 9, eta: 1.8 }, { kappa: 100, eta: 1.8 }, { kappa: 900, eta: 1.8 },
    { kappa: 20, eta: 1.8 }, { kappa: 20, eta: 2.05 }]
  var st = { eta: 1.8, kappa: 20, sigma: 0, w0: W0.slice(), shown: 0, playing: false }
  var run = null

  var loss = function (x, y, lmin) {
    var ps = VMAX[0] * x + VMAX[1] * y, pf = VMIN[0] * x + VMIN[1] * y
    return 0.5 * (LMAX * ps * ps + lmin * pf * pf)
  }
  // one gradient step in place on p = [x, y]; noise from rand when sg > 0
  var stepOnce = function (p, eta, lmin, sg, rand) {
    var ps = VMAX[0] * p[0] + VMAX[1] * p[1], pf = VMIN[0] * p[0] + VMIN[1] * p[1]
    var gx = LMAX * ps * VMAX[0] + lmin * pf * VMIN[0]
    var gy = LMAX * ps * VMAX[1] + lmin * pf * VMIN[1]
    if (sg > 0) { gx += sg * AIW.gauss(rand); gy += sg * AIW.gauss(rand) }
    p[0] -= eta * gx; p[1] -= eta * gy
  }
  var factors = function () {
    var lmin = 1 / st.kappa, fs = 1 - st.eta * LMAX, ff = 1 - st.eta * lmin
    return { lmin: lmin, fs: fs, ff: ff, rho: Math.max(Math.abs(fs), Math.abs(ff)) }
  }
  var floorValue = function () {
    if (st.eta * LMAX >= 2) return Infinity
    var s2 = st.sigma * st.sigma
    return [LMAX, 1 / st.kappa].reduce(function (a, l) { return a + st.eta * s2 / (2 * (2 - st.eta * l)) }, 0)
  }

  // the whole run from w₀, computed at once; the plots show its first st.shown steps
  function simulate() {
    var f = factors(), lmin = f.lmin, sg = st.sigma
    var p = st.w0.slice(), L0 = loss(p[0], p[1], lmin)
    var rand = AIW.rng(1)
    var xs = [p[0]], ys = [p[1]], Ls = [L0]
    var outcome = 'cap', T = CAP
    if (L0 === 0) { outcome = 'converged'; T = 0 }
    for (var k = 1; k <= CAP && T === CAP; k++) {
      stepOnce(p, st.eta, lmin, sg, rand)
      var L = loss(p[0], p[1], lmin)
      xs.push(p[0]); ys.push(p[1]); Ls.push(L)
      if (L > LDIV) { outcome = 'diverged'; T = k }
      else if (sg === 0 && L < TOL * L0) { outcome = 'converged'; T = k }
    }
    // noise-free runs that need more than 300 steps: keep iterating (not drawn) to count the steps
    var actual = null
    if (sg === 0) {
      if (outcome !== 'cap') actual = { kind: outcome, n: T }
      else if (st.eta * LMAX === 2) actual = { kind: 'never' }
      else {
        actual = { kind: 'never' }
        for (var j = CAP + 1; j <= LONG; j++) {
          stepOnce(p, st.eta, lmin, 0, null)
          var Lj = loss(p[0], p[1], lmin)
          if (Lj > LDIV) { actual = { kind: 'diverged', n: j }; break }
          if (Lj < TOL * L0) { actual = { kind: 'converged', n: j }; break }
        }
      }
    }
    // eigen-coordinates of w₀, for the noise-free part of the loss
    var es = VMAX[0] * st.w0[0] + VMAX[1] * st.w0[1], ef = VMIN[0] * st.w0[0] + VMIN[1] * st.w0[1]
    run = { xs: xs, ys: ys, Ls: Ls, L0: L0, T: T, outcome: outcome, actual: actual, es: es, ef: ef, f: f }
  }
  // loss of the noise-free iteration after k steps, from the closed form
  var detLoss = function (k) {
    var f = run.f
    return 0.5 * (LMAX * run.es * run.es * Math.pow(f.fs, 2 * k) + f.lmin * run.ef * run.ef * Math.pow(f.ff, 2 * k))
  }

  // ---------- number formatting ----------
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
  var sup = function (n) { return String(n).split('').map(function (c) { return SUP[c] || c }).join('') }
  var minus = function (s) { return s.replace(/-/g, '−') }
  var round3 = function (v) { return Number(v.toPrecision(3)) }
  var sep = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }
  var num = function (x, d) {                // d significant figures; ×10ⁿ outside [10⁻³, 10⁵)
    if (!isFinite(x)) return '∞'
    if (x === 0) return '0'
    var a = Math.abs(x)
    if (a >= 1e-3 && a < 1e5) { var r = x.toPrecision(d); return minus(/e/.test(r) ? String(Math.round(Number(r))) : r) }
    var e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e)
    if (Math.abs(Number(m.toPrecision(d))) >= 10) { e += 1; m /= 10 }
    return minus(m.toPrecision(d)) + '×10' + sup(e)
  }
  var kfmt = function (k) { return k >= 100 ? String(Math.round(k)) : String(Number(k.toPrecision(3))) }
  var efmt = function (e) { return e.toPrecision(3) }
  var ffmt = function (x) {                  // a factor, with enough decimals to tell it from ±1
    var g = Math.abs(1 - Math.abs(x)), d = 3
    if (g > 0 && g < 0.01) d = Math.min(7, Math.ceil(-Math.log10(g)) + 1)
    return minus(x.toFixed(d))
  }

  // ---------- subscripts: 'λ_max' → λ with a subscript, in the DOM and on a canvas ----------
  var parseSub = function (s) {
    var out = [], re = /_(\{[^}]*\}|[A-Za-z0-9]+)/g, last = 0, m
    while ((m = re.exec(s))) {
      if (m.index > last) out.push([s.slice(last, m.index), false])
      out.push([m[1].charAt(0) === '{' ? m[1].slice(1, -1) : m[1], true])
      last = re.lastIndex
    }
    if (last < s.length) out.push([s.slice(last), false])
    return out
  }
  var rich = function (s) {
    var span = h('span')
    parseSub(s).forEach(function (p) {
      span.appendChild(p[1] ? h('sub', { style: { fontSize: '.72em', lineHeight: '0' } }, p[0]) : document.createTextNode(p[0]))
    })
    return span
  }
  var ctxText = function (ctx, s, x, y, o) {  // o: {size, family, align, color, halo}
    var size = o.size || 11, fam = o.family || SANS, parts = parseSub(s)
    var big = size + 'px ' + fam, small = Math.round(size * 0.72) + 'px ' + fam, w = 0
    parts.forEach(function (p) { ctx.font = p[1] ? small : big; w += ctx.measureText(p[0]).width })
    var x0 = o.align === 'center' ? x - w / 2 : (o.align === 'right' ? x - w : x)
    ctx.save(); ctx.textAlign = 'left'
    parts.forEach(function (p) {
      ctx.font = p[1] ? small : big
      var yy = y + (p[1] ? size * 0.3 : 0)
      if (o.halo) { ctx.lineWidth = 3; ctx.strokeStyle = C.white; ctx.lineJoin = 'round'; ctx.strokeText(p[0], x0, yy) }
      ctx.fillStyle = o.color || C.slate; ctx.fillText(p[0], x0, yy)
      x0 += ctx.measureText(p[0]).width
    })
    ctx.restore()
    return w
  }

  // ---------- controls ----------
  // slider on a 0..N integer scale, mapped linearly or logarithmically; the state keeps the exact value
  function slider(o) {
    var N = 1000, l0 = o.log ? Math.log10(o.min) : o.min, l1 = o.log ? Math.log10(o.max) : o.max
    var toPos = function (v) { return Math.round(((o.log ? Math.log10(v) : v) - l0) / (l1 - l0) * N) }
    var fromPos = function (p) { var u = l0 + (l1 - l0) * p / N; return o.round(o.log ? Math.pow(10, u) : u) }
    var input = h('input', { type: 'range', min: 0, max: N, step: 1, value: toPos(o.value) })
    var val = h('span', { class: 'w-val' })
    var wrap = h('label', { class: 'w-ctl', style: { flex: '1 1 190px' } }, h('span', null, rich(o.label), ' ', val), input)
    if (o.ticks) {
      var row = h('span', { style: { position: 'relative', display: 'block', height: '1.05rem', marginTop: '-.1rem' } })
      o.ticks.forEach(function (tk) {
        var f = ((o.log ? Math.log10(tk[0]) : tk[0]) - l0) / (l1 - l0)
        row.appendChild(h('span', { style: { position: 'absolute', top: '0', left: 'calc(' + (100 * f).toFixed(2) + '% + ' + ((0.5 - f) * 16).toFixed(2) + 'px)',
          transform: 'translateX(-50%)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '.66rem', lineHeight: '1', color: tk[2] } },
        h('span', { style: { display: 'block', width: '1px', height: '5px', margin: '0 auto 1px', background: tk[2] } }), tk[1]))
      })
      wrap.appendChild(row)
    }
    input.addEventListener('input', function () { o.onInput(fromPos(Number(input.value))) })
    var put = function (v) { val.textContent = ''; val.appendChild(rich(o.fmt(v))) }
    wrap.set = function (v) { input.value = toPos(v); put(v) }
    wrap.show = put
    wrap.set(o.value)
    return wrap
  }

  var etaCtl = slider({ label: S.eta, min: 0.01, max: 2.5, log: true, value: st.eta, round: round3,
    fmt: function (v) { return efmt(v) }, ticks: [[1, '1', C.slate], [2, '2', C.red]],
    onInput: function (v) { st.eta = v; etaCtl.show(v); changed() } })
  var kappaCtl = slider({ label: S.kappa, min: 1, max: 1000, log: true, value: st.kappa, round: round3,
    fmt: function (v) { return kfmt(v) + '   (λ_min = ' + num(1 / v, 3) + ')' },
    onInput: function (v) { st.kappa = v; kappaCtl.show(v); changed() } })
  var sigmaCtl = slider({ label: S.sigma, min: 0, max: 1, value: st.sigma,
    round: function (v) { return Math.round(v * 100) / 100 }, fmt: function (v) { return v.toFixed(2) },
    onInput: function (v) { st.sigma = v; sigmaCtl.show(v); changed() } })
  var presetCtl = AIW.select({ label: S.preset, value: '4',
    options: [['custom', S.custom]].concat(S.presets.map(function (name, i) { return [String(i), name] })),
    onChange: function (v) {
      if (v === 'custom') return
      var p = PRESETS[Number(v)]
      st.kappa = p.kappa; st.eta = p.eta; st.w0 = W0.slice()
      etaCtl.set(st.eta); kappaCtl.set(st.kappa)
      changed()
    } })
  var presetSel = presetCtl.querySelector('select')
  presetCtl.style.flex = '1 1 230px'; presetCtl.style.maxWidth = '100%'; presetSel.style.maxWidth = '100%'

  var stepBtn = AIW.button(S.step, function () {
    pause()
    if (st.shown >= run.T) st.shown = 0
    st.shown = Math.min(run.T, st.shown + 1)
    render()
  }, true)
  var runBtn = AIW.button(S.run, function () { if (st.playing) { pause(); render() } else play() })
  var resetBtn = AIW.button(S.reset, function () { pause(); st.shown = 0; render() }, true)
  var buttons = h('div', { style: { display: 'flex', gap: '.5rem', alignItems: 'flex-end', flexWrap: 'wrap' } }, runBtn, stepBtn, resetBtn)

  el.appendChild(h('div', { class: 'w-controls' }, etaCtl, kappaCtl, sigmaCtl, presetCtl, buttons))

  // ---------- layout ----------
  var left = h('div', { class: 'w-col' }), right = h('div', { class: 'w-col' })
  el.appendChild(h('div', { class: 'w-row' }, left, right))
  var readout = h('div', { class: 'w-readout', style: { marginTop: '.75rem' } })
  el.appendChild(readout)

  // ---------- contour plot ----------
  var cmap = null
  var contour = AIW.canvas(left, { aspect: 1, maxHeight: 420 }, function (ctx, w, hh) {
    var padL = 30, padR = 8, padT = 8, padB = 30
    var side = Math.max(80, Math.min(w - padL - padR, hh - padT - padB))
    var x0 = padL + (w - padL - padR - side) / 2, y0 = padT + (hh - padT - padB - side) / 2, k = side / 8
    var X = function (u) { return x0 + (u + 4) * k }, Y = function (v) { return y0 + (4 - v) * k }
    cmap = { x0: x0, y0: y0, k: k }
    var f = run.f
    // grid and ticks
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.fillStyle = C.slate; ctx.font = '11px ' + MONO
    for (var g = -4; g <= 4; g += 2) {
      ctx.beginPath(); ctx.moveTo(X(g), y0); ctx.lineTo(X(g), y0 + side); ctx.moveTo(x0, Y(g)); ctx.lineTo(x0 + side, Y(g)); ctx.stroke()
      ctx.textAlign = 'center'; ctx.fillText(minus(String(g)), X(g), y0 + side + 13)
      ctx.textAlign = 'right'; ctx.fillText(minus(String(g)), x0 - 5, Y(g) + 4)
    }
    ctxText(ctx, 'w₁', x0 + side / 2, hh - 3, { size: 12, align: 'center', color: C.navy })
    ctx.save(); ctx.translate(10, y0 + side / 2); ctx.rotate(-Math.PI / 2); ctxText(ctx, 'w₂', 0, 0, { size: 12, align: 'center', color: C.navy }); ctx.restore()
    ctx.save()
    ctx.beginPath(); ctx.rect(x0, y0, side, side); ctx.clip()
    // level sets: L = c on 12 log-spaced levels, semi-axes √(2c/λ) along each eigenvector
    for (var i = 0; i < 12; i++) {
      var c = Math.pow(10, -3 + 4 * i / 11)
      ctx.beginPath()
      ctx.ellipse(X(0), Y(0), Math.sqrt(2 * c / f.lmin) * k, Math.sqrt(2 * c / LMAX) * k, -Math.PI / 6, 0, 2 * Math.PI)
      ctx.strokeStyle = C.blue; ctx.globalAlpha = 0.6 - 0.4 * i / 11; ctx.lineWidth = 1; ctx.stroke()
    }
    ctx.globalAlpha = 1
    // eigen-directions
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(X(-8 * VMIN[0]), Y(-8 * VMIN[1])); ctx.lineTo(X(8 * VMIN[0]), Y(8 * VMIN[1]))
    ctx.moveTo(X(-8 * VMAX[0]), Y(-8 * VMAX[1])); ctx.lineTo(X(8 * VMAX[0]), Y(8 * VMAX[1])); ctx.stroke()
    ctx.setLineDash([])
    ctxText(ctx, S.flat + ' · λ_min = ' + num(f.lmin, 3), X(3.85), Y(3.85 * Math.tan(Math.PI / 6)) + 15, { size: 11, align: 'right', color: C.slate, halo: true })
    ctxText(ctx, S.steep + ' · λ_max = 1', X(-3.7 * Math.tan(Math.PI / 6)) + 6, Y(3.62), { size: 11, align: 'left', color: C.slate, halo: true })
    // minimum
    ctx.strokeStyle = C.navy; ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(X(0) - 4, Y(0) - 4); ctx.lineTo(X(0) + 4, Y(0) + 4); ctx.moveTo(X(0) - 4, Y(0) + 4); ctx.lineTo(X(0) + 4, Y(0) - 4); ctx.stroke()
    ctxText(ctx, 'w*', X(0) + 6, Y(0) - 6, { size: 11, color: C.navy, halo: true })
    // iterates
    var n = st.shown
    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.4; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(X(run.xs[0]), Y(run.ys[0]))
    for (var j = 1; j <= n; j++) ctx.lineTo(X(run.xs[j]), Y(run.ys[j]))
    ctx.stroke()
    ctx.fillStyle = C.orange
    var r = n > 120 ? 1.6 : 2.3
    for (var q = 1; q < n; q++) { ctx.beginPath(); ctx.arc(X(run.xs[q]), Y(run.ys[q]), r, 0, 2 * Math.PI); ctx.fill() }
    ctx.strokeStyle = C.navy; ctx.lineWidth = 1.5; ctx.fillStyle = C.white
    ctx.beginPath(); ctx.arc(X(run.xs[0]), Y(run.ys[0]), 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke()
    ctxText(ctx, 'w₀', X(run.xs[0]) + 7, Y(run.ys[0]) - 7, { size: 12, color: C.navy, halo: true })
    if (n > 0) {
      ctx.fillStyle = C.orange; ctx.strokeStyle = C.navy; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.arc(X(run.xs[n]), Y(run.ys[n]), 4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke()
    }
    ctx.restore()
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, side - 1, side - 1)
  })
  contour.cv.style.cursor = 'crosshair'
  contour.cv.addEventListener('click', function (e) {
    if (!cmap) return
    var b = contour.cv.getBoundingClientRect()
    var u = (e.clientX - b.left - cmap.x0) / cmap.k - 4, v = 4 - (e.clientY - b.top - cmap.y0) / cmap.k
    if (u < -4.05 || u > 4.05 || v < -4.05 || v > 4.05) return
    st.w0 = [Math.round(Math.max(-4, Math.min(4, u)) * 100) / 100, Math.round(Math.max(-4, Math.min(4, v)) * 100) / 100]
    changed()
  })
  left.appendChild(h('p', { class: 'w-note' }, rich(S.hint)))

  // ---------- loss against iteration ----------
  var niceAxis = function (T) {
    var n = Math.max(T, 10), mag = Math.pow(10, Math.floor(Math.log10(n / 5)))
    for (var i = 0; i < 12; i++) {
      var s = [1, 2, 5][i % 3] * mag * Math.pow(10, Math.floor(i / 3))
      if (Math.ceil(n / s) <= 6) return { x1: Math.ceil(n / s) * s, ticks: Math.ceil(n / s) }
    }
    return { x1: n, ticks: 5 }
  }
  var lossPlot = AIW.canvas(right, { aspect: 0.66, maxHeight: 300 }, function (ctx, w, hh) {
    var ax = niceAxis(run.T), f = run.f
    var A = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: ax.x1, y0: 1e-12, y1: 1e3, logY: true, xticks: ax.ticks, yticks: 5,
      xlabel: S.iter, ylabel: S.lossAxis, pad: { l: 52, r: 10, t: 10, b: 34 },
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: function (v) { return '10' + sup(Math.round(Math.log10(v))) } })
    var X = A.X, Y = A.Y, pl = A.pad
    ctx.save(); ctx.beginPath(); ctx.rect(pl.l, pl.t, w - pl.l - pl.r, hh - pl.t - pl.b); ctx.clip()
    // target 10⁻⁶ L₀
    if (run.L0 > 0) {
      ctx.setLineDash([2, 3]); ctx.strokeStyle = C.slate; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(X(0), Y(TOL * run.L0)); ctx.lineTo(X(ax.x1), Y(TOL * run.L0)); ctx.stroke()
    }
    // noise floor
    var fl = floorValue()
    if (st.sigma > 0 && isFinite(fl)) {
      ctx.setLineDash([7, 4]); ctx.strokeStyle = C.purple; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(X(0), Y(fl)); ctx.lineTo(X(ax.x1), Y(fl)); ctx.stroke()
    }
    // envelope L₀ρ^(2t)
    ctx.setLineDash([6, 4]); ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5
    ctx.beginPath()
    for (var i = 0; i <= 240; i++) {
      var tt = ax.x1 * i / 240, env = f.rho === 0 ? (tt === 0 ? run.L0 : 0) : run.L0 * Math.pow(f.rho, 2 * tt)
      if (i === 0) ctx.moveTo(X(tt), Y(env)); else ctx.lineTo(X(tt), Y(Math.min(env, 1e30)))
    }
    ctx.stroke(); ctx.setLineDash([])
    // the run so far
    ctx.strokeStyle = C.orange; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(X(0), Y(run.Ls[0]))
    for (var j = 1; j <= st.shown; j++) ctx.lineTo(X(j), Y(run.Ls[j]))
    ctx.stroke()
    ctx.fillStyle = C.orange; ctx.strokeStyle = C.navy; ctx.lineWidth = 1.2
    var Lc = Math.max(1e-13, Math.min(run.Ls[st.shown], 1e4))
    ctx.beginPath(); ctx.arc(X(st.shown), Y(Lc), 3.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke()
    ctx.restore()
  })
  var swatch = function (color, dash) {
    return h('i', { style: dash ? { background: 'none', height: '0', width: '16px', borderTop: '2px ' + dash + ' ' + color, borderRadius: '0' } : { background: color } })
  }
  var floorLegend = h('span', null, swatch(C.purple, 'dashed'), rich(S.legFloor))
  right.appendChild(h('div', { class: 'w-legend' },
    h('span', null, swatch(C.orange), rich(S.legLoss)),
    h('span', null, swatch(C.blue, 'dashed'), rich(S.legEnv)),
    h('span', null, swatch(C.slate, 'dotted'), rich(S.legTarget)),
    floorLegend))

  // ---------- the two contraction factors ----------
  var bars = AIW.canvas(right, { aspect: 0.3, maxHeight: 112 }, function (ctx, w, hh) {
    var f = run.f
    var rows = [[S.barSteep, Math.abs(f.fs)], [S.barFlat, Math.abs(f.ff)]]
    ctx.font = '11px ' + SANS
    var lw = 0
    rows.forEach(function (r) { lw = Math.max(lw, ctxText(ctx, r[0], -1000, -1000, { size: 11 })) })
    var bx0 = Math.min(lw + 12, w * 0.45), bx1 = w - 96, top = 6, rowH = (hh - top - 34) / 2
    var X = function (v) { return bx0 + Math.min(v, 1.5) / 1.5 * (bx1 - bx0) }
    rows.forEach(function (r, i) {
      var yc = top + rowH * (i + 0.5), bh = Math.min(16, rowH * 0.6)
      ctxText(ctx, r[0], bx0 - 8, yc + 4, { size: 11, align: 'right', color: C.navy })
      ctx.fillStyle = C.track; ctx.fillRect(bx0, yc - bh / 2, bx1 - bx0, bh)
      ctx.fillStyle = r[1] > 1 ? C.red : (r[1] === 1 ? C.amber : C.sky)
      ctx.fillRect(bx0, yc - bh / 2, X(r[1]) - bx0, bh)
      var isRho = r[1] === f.rho && (i === 0 ? true : Math.abs(f.fs) !== f.rho)
      ctxText(ctx, ffmt(r[1]) + (isRho ? '  = ρ' : ''), bx1 + 6, yc + 4, { size: 11, family: MONO, color: r[1] >= 1 ? C.red : C.navy })
    })
    ctx.strokeStyle = C.red; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(X(1), top - 2); ctx.lineTo(X(1), top + 2 * rowH + 2); ctx.stroke()
    ctx.fillStyle = C.slate; ctx.font = '10px ' + MONO; ctx.textAlign = 'center'
    ctx.fillText('0', X(0), hh - 3); ctx.fillText('0.5', X(0.5), hh - 3); ctx.fillText('1.5', X(1.5), hh - 3)
    ctx.fillStyle = C.red; ctx.fillText('1', X(1), hh - 3)
    ctxText(ctx, S.barNote, X(1) - 5, top + 2 * rowH + 14, { size: 10, align: 'right', color: C.red })
  })

  // ---------- readout ----------
  function statusText() {
    var f = run.f, osc = f.fs < 0 && f.fs > -1 ? ', ' + S.oscillating : ''
    if (st.shown === 0) return [S.atStart, C.slate]
    var done = st.shown >= run.T
    if (done && run.outcome === 'diverged') return [S.divergedAt(run.T), C.red]
    if (st.eta * LMAX === 2) return [S.marginal, C.amber]
    if (f.fs < -1) return [S.diverging, C.red]
    if (st.sigma > 0) {
      var at = detLoss(st.shown) <= floorValue()
      return [(at ? S.atFloor : S.toFloor) + osc, C.purple]
    }
    if (done && run.outcome === 'converged') return [S.convergedIn(run.T) + osc, C.green]
    return [S.converging + osc + (done ? ' (' + S.capShown + ')' : ''), C.navy]
  }
  function actualText() {
    var a = run.actual
    if (!a && run.outcome === 'diverged') return '∞ (' + S.divergesAt(run.T) + ')'
    if (!a) return S.noisy
    if (a.kind === 'converged') return sep(a.n) + (a.n > CAP ? ' (' + S.capShown + ')' : '')
    if (a.kind === 'diverged') return '∞ (' + S.divergesAt(sep(a.n)) + ')'
    return '∞ (' + S.never + ')'
  }
  function predictedText() {
    var rho = run.f.rho
    if (rho === 0) return '1'
    if (rho >= 1) return '∞'
    return sep(Math.round(6 * Math.LN10 / (-2 * Math.log(rho))))
  }
  function updateReadout() {
    var f = run.f, n = st.shown, gap = '    '
    var lines = [
      'λ_max = 1' + gap + 'λ_min = 1/κ = ' + num(f.lmin, 3) + gap + 'κ = ' + kfmt(st.kappa) + gap + 'η = ' + efmt(st.eta) + '  (' + S.stableWhile + ')',
      S.factors + ': ' + S.steepF + ' 1 − ηλ_max = ' + ffmt(f.fs) + gap + S.flatF + ' 1 − ηλ_min = ' + ffmt(f.ff) + gap + 'ρ = max|1 − ηλ_i| = ' + ffmt(f.rho),
      'w₀ = (' + minus(st.w0[0].toFixed(2)) + ', ' + minus(st.w0[1].toFixed(2)) + ')' + gap + 'L₀ = ' + num(run.L0, 4) + gap + S.stepT + ' = ' + n + gap + 'L(w_t) = ' + num(run.Ls[n], 4)
    ]
    readout.textContent = ''
    lines.forEach(function (s) { readout.appendChild(h('div', null, rich(s))) })
    var stt = statusText()
    readout.appendChild(h('div', null, S.status + ': ', h('span', { style: { color: stt[1], fontWeight: '600' } }, rich(stt[0]))))
    readout.appendChild(h('div', null, rich(S.stepsFor + ': ' + S.predicted + ' ' + predictedText() + ' (' + S.byEnvelope + ')' + gap + S.actual + ' ' + actualText())))
    if (st.sigma > 0) {
      var fl = floorValue(), meanTxt = '—'
      if (n > 0) {
        var a = Math.max(1, n - 99), s = 0
        for (var i = a; i <= n; i++) s += run.Ls[i]
        meanTxt = S.meanL(a, n) + ' = ' + num(s / (n - a + 1), 4)
      }
      readout.appendChild(h('div', null, rich(meanTxt + gap + S.floor + ' = ' + (isFinite(fl) ? num(fl, 4) : S.floorInf))))
    }
  }

  // ---------- state changes ----------
  function syncPreset() {
    var isW0 = st.w0[0] === W0[0] && st.w0[1] === W0[1], v = 'custom'
    PRESETS.forEach(function (p, i) { if (isW0 && p.kappa === st.kappa && p.eta === st.eta) v = String(i) })
    presetSel.value = v
  }
  function render() {
    contour.redraw(); lossPlot.redraw(); bars.redraw()
    updateReadout()
    floorLegend.hidden = !(st.sigma > 0 && isFinite(floorValue()))
    runBtn.textContent = st.playing ? S.pause : S.run
  }
  function changed() {             // a control moved: recompute the run and show all of it
    pause()
    simulate()
    st.shown = run.T
    syncPreset()
    render()
  }
  var raf = 0, last = 0, acc = 0
  function play() {
    if (st.shown >= run.T) st.shown = 0
    st.playing = true; last = 0; acc = 0
    render()
    raf = window.requestAnimationFrame(tick)
  }
  function tick(now) {
    if (!st.playing) return
    if (!last) last = now
    acc += now - last; last = now
    var adv = Math.floor(acc / 100)            // 10 iterations per second
    if (adv > 0) { acc -= adv * 100; st.shown = Math.min(run.T, st.shown + adv) }
    if (st.shown >= run.T) { st.playing = false; render(); return }
    if (adv > 0) render()
    raf = window.requestAnimationFrame(tick)
  }
  function pause() { st.playing = false; if (raf) window.cancelAnimationFrame(raf); raf = 0 }

  simulate()
  st.shown = run.T
  syncPreset()
  render()
})
