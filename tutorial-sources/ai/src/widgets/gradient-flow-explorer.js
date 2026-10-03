/* gradient-flow-explorer — Module 04, Section 4: how far a gradient survives going back through a recurrent net.
 * Forward: h_0 = 0; z_t = W h_{t-1} + x_t, h_t = φ(z_t), x_t ~ N(0, σ_x² I) (W_x = I, b = 0), t = 1..n_max.
 * Backward: g_0 = random unit vector; g_n = Wᵀ (φ'(z_{n_max−n+1}) ⊙ g_{n−1}), renormalised every step;
 * the plot shows log10 (‖g_n‖ / ‖g_0‖) against the lag n.  LSTM path: Π_k f_k, f_k = σ(b_f + s ε_k).
 * Matrix: G with N(0,1) entries; orthogonal W = ρ Q (Q from modified Gram–Schmidt on G, diag R > 0);
 * Gaussian W = (ρ/ρ̂) G with ρ̂ the power-iteration growth rate of G.  PRNG: mulberry32(seed) + Box–Muller,
 * stream order G, [power-iteration v], x_t (t = 1..n_max, unit by unit), g_0, ε_k. */
AIW.register('gradient-flow-explorer', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h

  var S = {
    rho: t('spectral radius ρ of W_h', 'W_h 的谱半径 ρ'),
    mtype: t('matrix type', '矩阵类型'),
    orth: t('orthogonal (all singular values = ρ)', '正交矩阵（所有奇异值 = ρ）'),
    gauss: t('random Gaussian (non-normal)', '随机高斯矩阵（非正规）'),
    nonlin: t('nonlinearity φ', '非线性函数 φ'),
    linear: t('linear', '线性'),
    sx: t('input standard deviation σ_x', '输入标准差 σ_x'),
    hid: t('hidden size H', '隐藏层大小 H'),
    nmax: t('maximum lag n_max', '最大滞后 n_max'),
    lstm: t('show the LSTM cell path', '显示 LSTM 细胞状态通路'),
    bf: t('forget-gate bias b_f', '遗忘门偏置 b_f'),
    sp: t('forget-gate spread s', '遗忘门波动 s'),
    draw: t('new random draw', '重新随机抽样'),
    seed: t('seed', '随机种子'),
    yl: t('log₁₀ gradient ratio', 'log₁₀ 梯度比'),
    xl: t('lag n (steps back)', '滞后 n（向回的步数）'),
    legV: t('vanilla recurrence ‖∂L/∂h_{T−n}‖ / ‖∂L/∂h_T‖', '普通循环网络 ‖∂L/∂h_{T−n}‖ / ‖∂L/∂h_T‖'),
    legRho: t('reference n·log₁₀ ρ', '参考线 n·log₁₀ ρ'),
    legSig: t('n·log₁₀ σ_max', 'n·log₁₀ σ_max'),
    legL: t('LSTM cell path, product of f_k', 'LSTM 细胞状态通路，f_k 的乘积'),
    clampNote: t('triangles: value outside the plotted range, clamped to the edge', '三角形：数值超出绘图范围，已截到边缘'),
    histT: t('φ′(z) values visited in the forward pass', '前向传播中取到的 φ′(z) 值'),
    histX: t('φ′(z)', 'φ′(z)'),
    histY: t('share', '占比'),
    zero: t('gradient exactly zero: every unit inactive', '梯度恰好为零：所有单元均未激活'),
    rhoRead: function (g) { return g ? t('ρ̂ (estimated, rescaled to ρ)', 'ρ̂（估计值，已缩放至 ρ）') : t('ρ (set)', 'ρ（设定值）') },
    mean: t('mean |φ′(z)| along the trajectory', '轨迹上 |φ′(z)| 的均值'),
    ratio: function (n) { return t('gradient ratio at n = ' + n, 'n = ' + n + ' 时的梯度比') },
    horizon: t('memory horizon (first n with ratio < 1e-3)', '记忆视野（比值首次 < 1e-3 的 n）'),
    beyond: function (n) { return t('> ' + n, '> ' + n) },
    na: t('(beyond n_max)', '（超出 n_max）'),
    half: t('half-life ln 0.5 / ln σ(b_f)', '半衰期 ln 0.5 / ln σ(b_f)'),
    lratio: function (n) { return t('LSTM path ratio at n = ' + n, 'LSTM 通路在 n = ' + n + ' 时的比值') },
    stepsU: t(' steps', ' 步'),
    sigmax: t('σ_max (largest singular value)', 'σ_max（最大奇异值）'),
    hint: t('Vanilla curve versus the flat ρⁿ line: the gap is the nonlinearity. Switch to linear, lower σ_x, or raise ρ to 1.5 and 3.',
      '普通循环网络的曲线与平坦的 ρⁿ 线之间的差距来自非线性。可改为线性、降低 σ_x，或把 ρ 升到 1.5 和 3。')
  }

  // 'W_h' -> W with a subscript h, in DOM text
  var rich = function (str) {
    var span = h('span'), re = /_(\{[^}]*\}|[A-Za-z0-9]+)/g, last = 0, m
    while ((m = re.exec(str))) {
      if (m.index > last) span.appendChild(document.createTextNode(str.slice(last, m.index)))
      span.appendChild(h('sub', { style: { fontSize: '.72em', lineHeight: '0' } }, m[1].charAt(0) === '{' ? m[1].slice(1, -1) : m[1]))
      last = re.lastIndex
    }
    if (last < str.length) span.appendChild(document.createTextNode(str.slice(last)))
    return span
  }
  var richLabel = function (ctl) {
    var sp = ctl.querySelector('span:first-child')
    if (sp) { var txt = sp.textContent; sp.textContent = ''; sp.appendChild(rich(txt)) }
    return ctl
  }

  var C = AIW.C
  var MONO = '"DM Mono", Consolas, monospace'
  var st = { rho: 1, mtype: 'orth', phi: 'tanh', sx: 1, H: 32, nmax: 100, lstm: true, bf: 4, sp: 0.5, seed: 1 }

  // ---------- the maths ----------
  var sigmoid = function (x) { return 1 / (1 + Math.exp(-x)) }

  function compute() {
    var H = st.H, N = st.nmax, rand = AIW.rng(st.seed), gs = function () { return AIW.gauss(rand) }
    var i, j, k, n
    var G = new Float64Array(H * H)
    for (i = 0; i < H * H; i++) G[i] = gs()
    var W = new Float64Array(H * H), rhoHat = st.rho
    if (st.mtype === 'orth') {
      // modified Gram–Schmidt on the columns of G; r_jj is a norm, so diag(R) > 0
      var Q = G.slice()
      for (j = 0; j < H; j++) {
        var nr = 0
        for (i = 0; i < H; i++) nr += Q[i * H + j] * Q[i * H + j]
        nr = Math.sqrt(nr)
        for (i = 0; i < H; i++) Q[i * H + j] /= nr
        for (k = j + 1; k < H; k++) {
          var dot = 0
          for (i = 0; i < H; i++) dot += Q[i * H + j] * Q[i * H + k]
          for (i = 0; i < H; i++) Q[i * H + k] -= dot * Q[i * H + j]
        }
      }
      for (i = 0; i < H * H; i++) W[i] = st.rho * Q[i]
    } else {
      var v = new Float64Array(H), w = new Float64Array(H), s2 = 0, lg = 0, cnt = 0
      for (i = 0; i < H; i++) { v[i] = gs(); s2 += v[i] * v[i] }
      s2 = Math.sqrt(s2)
      for (i = 0; i < H; i++) v[i] /= s2
      for (k = 1; k <= 512; k++) {
        var r = 0
        for (i = 0; i < H; i++) { var a = 0; for (j = 0; j < H; j++) a += G[i * H + j] * v[j]; w[i] = a; r += a * a }
        r = Math.sqrt(r)
        for (i = 0; i < H; i++) v[i] = w[i] / r
        if (k > 256) { lg += Math.log(r); cnt++ }
      }
      rhoHat = Math.exp(lg / cnt)
      for (i = 0; i < H * H; i++) W[i] = (st.rho / rhoHat) * G[i]
    }
    // σ_max: 200 power iterations on WᵀW
    var u = new Float64Array(H), tmp = new Float64Array(H), tmp2 = new Float64Array(H), sm = 0
    for (i = 0; i < H; i++) u[i] = 1 / Math.sqrt(H) + 0.01 * ((i * 7919) % 13 - 6) / 13
    var un = 0
    for (i = 0; i < H; i++) un += u[i] * u[i]
    un = Math.sqrt(un)
    for (i = 0; i < H; i++) u[i] /= un
    for (k = 0; k < 200; k++) {
      for (i = 0; i < H; i++) { var b = 0; for (j = 0; j < H; j++) b += W[i * H + j] * u[j]; tmp[i] = b }
      for (j = 0; j < H; j++) { var c = 0; for (i = 0; i < H; i++) c += W[i * H + j] * tmp[i]; tmp2[j] = c }
      var q = 0, m2 = 0
      for (i = 0; i < H; i++) { q += u[i] * tmp2[i]; m2 += tmp2[i] * tmp2[i] }
      sm = Math.sqrt(Math.max(q, 0))
      m2 = Math.sqrt(m2)
      if (m2 === 0) break
      for (i = 0; i < H; i++) u[i] = tmp2[i] / m2
    }
    // forward pass
    var hs = new Float64Array(H), dphi = [], hist = new Float64Array(10), sumd = 0
    for (n = 1; n <= N; n++) {
      var d = new Float64Array(H), nh = new Float64Array(H)
      for (i = 0; i < H; i++) {
        var z = 0
        for (j = 0; j < H; j++) z += W[i * H + j] * hs[j]
        z += st.sx * gs()
        if (st.phi === 'linear') { nh[i] = z; d[i] = 1 }
        else if (st.phi === 'tanh') { var th = Math.tanh(z); nh[i] = th; d[i] = 1 - th * th }
        else { nh[i] = z > 0 ? z : 0; d[i] = z > 0 ? 1 : 0 }
        sumd += d[i]
        hist[Math.min(9, Math.floor(d[i] * 10))]++
      }
      hs = nh; dphi.push(d)
    }
    // backward pass
    var g = new Float64Array(H), gn = 0, zero = false
    for (i = 0; i < H; i++) { g[i] = gs(); gn += g[i] * g[i] }
    gn = Math.sqrt(gn)
    for (i = 0; i < H; i++) g[i] /= gn
    var L = [0], logsum = 0, ng = new Float64Array(H)
    for (n = 1; n <= N; n++) {
      if (zero) { L.push(-Infinity); continue }
      var dd = dphi[N - n]            // φ'(z_{n_max − n + 1}); dphi[t − 1] holds step t
      for (j = 0; j < H; j++) ng[j] = 0
      for (i = 0; i < H; i++) { var di = dd[i] * g[i]; if (di !== 0) for (j = 0; j < H; j++) ng[j] += W[i * H + j] * di }
      var m = 0
      for (j = 0; j < H; j++) m += ng[j] * ng[j]
      m = Math.sqrt(m)
      if (m === 0) { zero = true; L.push(-Infinity); continue }
      logsum += Math.log10(m)
      for (j = 0; j < H; j++) g[j] = ng[j] / m
      L.push(logsum)
    }
    // LSTM path
    var Lc = [0], ls = 0
    for (n = 1; n <= N; n++) { ls += Math.log10(sigmoid(st.bf + st.sp * gs())); Lc.push(ls) }
    var total = H * N
    for (i = 0; i < 10; i++) hist[i] /= total
    var hor = null
    for (n = 1; n <= N; n++) if (L[n] < -3) { hor = n; break }
    return { L: L, Lc: Lc, rhoHat: rhoHat, sigMax: sm, mean: sumd / total, hist: hist, zero: zero, hor: hor, N: N }
  }

  // ---------- number formatting ----------
  var minus = function (s) { return s.replace(/-/g, '−') }
  var ratioStr = function (lg) {          // 10^lg as m.me±x without overflow
    if (lg === -Infinity) return '0'
    var e = Math.floor(lg), m = Math.pow(10, lg - e)
    if (m.toFixed(1) === '10.0') { m = 1; e += 1 }
    return minus(m.toFixed(1) + 'e' + e)
  }

  // ---------- controls ----------
  var res = null
  var rhoCtl = AIW.slider({ label: S.rho, min: 0.5, max: 3, step: 0.01, value: st.rho, fmt: function (v) { return v.toFixed(2) }, onInput: function (v) { st.rho = v; update() } })
  var typeCtl = AIW.select({ label: S.mtype, value: st.mtype, options: [['orth', S.orth], ['gauss', S.gauss]], onChange: function (v) { st.mtype = v; update() } })
  var phiCtl = AIW.select({ label: S.nonlin, value: st.phi, options: [['linear', S.linear], ['tanh', 'tanh'], ['relu', 'ReLU']], onChange: function (v) { st.phi = v; update() } })
  var sxCtl = AIW.slider({ label: S.sx, min: 0, max: 3, step: 0.05, value: st.sx, fmt: function (v) { return v.toFixed(2) }, onInput: function (v) { st.sx = v; update() } })
  var hCtl = AIW.select({ label: S.hid, value: st.H, options: [[8, '8'], [16, '16'], [32, '32'], [64, '64']], onChange: function (v) { st.H = Number(v); update() } })
  var nCtl = AIW.slider({ label: S.nmax, min: 20, max: 200, step: 10, value: st.nmax, fmt: function (v) { return String(Math.round(v)) }, onInput: function (v) { st.nmax = Math.round(v); update() } })
  var lstmCtl = AIW.checkbox(S.lstm, st.lstm, function (v) { st.lstm = v; update() })
  var bfCtl = AIW.slider({ label: S.bf, min: -2, max: 8, step: 0.1, value: st.bf, fmt: function (v) { return v.toFixed(1) }, onInput: function (v) { st.bf = v; update() } })
  var spCtl = AIW.slider({ label: S.sp, min: 0, max: 2, step: 0.1, value: st.sp, fmt: function (v) { return v.toFixed(1) }, onInput: function (v) { st.sp = v; update() } })
  ;[rhoCtl, sxCtl, nCtl, bfCtl, spCtl, lstmCtl].forEach(richLabel)
  var drawBtn = AIW.button(S.draw, function () { st.seed++; update() }, true)
  el.appendChild(h('div', { class: 'w-controls' }, rhoCtl, typeCtl, phiCtl, sxCtl, hCtl, nCtl, lstmCtl, bfCtl, spCtl,
    h('div', { style: { display: 'flex', alignItems: 'flex-end' } }, drawBtn)))

  var left = h('div', { class: 'w-col', style: { flex: '2 1 340px' } }), right = h('div', { class: 'w-col', style: { flex: '1 1 240px' } })
  el.appendChild(h('div', { class: 'w-row' }, left, right))

  function leg(color, kind, text) {
    var sw = h('i', { style: kind === 'solid' ? { background: color } : { background: 'none', borderTop: '3px ' + kind + ' ' + color, height: '0' } })
    return h('span', null, sw, typeof text === 'string' ? rich(text) : text)
  }
  var plot = AIW.canvas(left, { aspect: 0.62, maxHeight: 400 }, function (ctx, w, hh) { drawPlot(ctx, w, hh) })
  var legend = h('div', { class: 'w-legend' })
  left.appendChild(legend)
  var hist = AIW.canvas(right, { aspect: 0.5, maxHeight: 190 }, function (ctx, w, hh) { drawHist(ctx, w, hh) })
  var readout = h('div', { class: 'w-readout', style: { marginTop: '.6rem' } })
  right.appendChild(readout)
  var msg = h('div', { class: 'w-note', style: { color: C.red, minHeight: '1.1em' } })
  el.appendChild(msg)
  el.appendChild(h('div', { class: 'w-note' }, rich(S.hint)))

  // ---------- drawing ----------
  var YMIN = -30, YMAX = 30
  function drawPlot(ctx, w, hh) {
    if (!res) return
    var N = res.N
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: N, y0: YMIN, y1: YMAX, xlabel: S.xl, ylabel: S.yl, xticks: 5, yticks: 6,
      pad: { l: 50, r: 12, t: 12, b: 36 }, xfmt: function (v) { return String(Math.round(v)) }, yfmt: function (v) { return minus(String(Math.round(v))) } })
    var X = ax.X, Y = function (v) { return ax.Y(Math.max(YMIN, Math.min(YMAX, v))) }
    var pad = ax.pad
    ctx.save()
    ctx.beginPath(); ctx.rect(pad.l, pad.t - 4, w - pad.l - pad.r, hh - pad.t - pad.b + 8); ctx.clip()
    var zeroY = Y(0)
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, zeroY); ctx.lineTo(w - pad.r, zeroY); ctx.stroke()
    var line = function (fn, color, width, dash) {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.lineJoin = 'round'
      ctx.beginPath()
      for (var n = 0; n <= N; n++) { var v = fn(n); var y = Y(v === -Infinity ? -1e9 : v); if (n === 0) ctx.moveTo(X(n), y); else ctx.lineTo(X(n), y) }
      ctx.stroke(); ctx.setLineDash([])
      // markers for clamped points
      ctx.fillStyle = color
      var last = -99
      for (var m = 1; m <= N; m++) {
        var vv = fn(m), up = vv > YMAX, dn = vv < YMIN
        if ((up || dn) && m - last >= 6) {
          last = m
          var px = X(m), py = up ? Y(YMAX) + 2 : Y(YMIN) - 2, sgn = up ? -1 : 1
          ctx.beginPath(); ctx.moveTo(px, py + sgn * (-5)); ctx.lineTo(px - 3.5, py + sgn * 2); ctx.lineTo(px + 3.5, py + sgn * 2); ctx.closePath(); ctx.fill()
        }
      }
    }
    if (st.mtype === 'gauss') line(function (n) { return n * Math.log10(res.sigMax) }, C.purple, 1.6, [2, 3])
    if (st.lstm) line(function (n) { return res.Lc[n] }, C.green, 2.4)
    line(function (n) { return res.L[n] }, C.blue, 2.4)
    line(function (n) { return n * Math.log10(st.rho) }, C.orange, 1.6, [6, 4])
    ctx.restore()
  }

  function drawHist(ctx, w, hh) {
    if (!res) return
    var pad = { l: 44, r: 8, t: 26, b: 30 }, pw = w - pad.l - pad.r, ph = hh - pad.t - pad.b
    ctx.save()
    ctx.fillStyle = C.navy; ctx.font = '11px "DM Sans", system-ui, sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(S.histT, 4, 13)
    var mx = 0, i
    for (i = 0; i < 10; i++) mx = Math.max(mx, res.hist[i])
    var top = mx > 0.5 ? 1 : (mx > 0.25 ? 0.5 : (mx > 0.1 ? 0.25 : 0.1))
    ctx.strokeStyle = C.border; ctx.fillStyle = C.slate; ctx.font = '10px ' + MONO; ctx.textAlign = 'right'
    ;[0, 0.5, 1].forEach(function (f) {
      var y = pad.t + ph * (1 - f)
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke()
      ctx.fillText((top * f).toFixed(top < 0.2 ? 2 : 1).replace(/\.?0+$/, '') || '0', pad.l - 4, y + 3)
    })
    ctx.fillStyle = C.blue
    for (i = 0; i < 10; i++) {
      var bh = ph * Math.min(1, res.hist[i] / top)
      ctx.fillRect(pad.l + pw * i / 10 + 1, pad.t + ph - bh, pw / 10 - 2, bh)
    }
    ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke()
    ctx.fillStyle = C.slate; ctx.textAlign = 'center'
    ;[0, 0.5, 1].forEach(function (f) { ctx.fillText(String(f), pad.l + pw * f, pad.t + ph + 12) })
    ctx.font = '11px "DM Sans", system-ui, sans-serif'; ctx.fillStyle = C.navy
    ctx.fillText(S.histX, pad.l + pw / 2, hh - 4)
    ctx.save(); ctx.translate(8, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(S.histY, 0, 0); ctx.restore()
    ctx.restore()
  }

  // ---------- readouts ----------
  function row(label, value) { return label + t(': ', '：') + value }
  function update() {
    res = compute()
    var N = res.N, gz = st.mtype === 'gauss'
    var at = function (n) { return n <= N ? ratioStr(res.L[n]) : S.na }
    var lat = function (n) { return n <= N ? ratioStr(res.Lc[n]) : S.na }
    var sb = sigmoid(st.bf), halfLife = Math.log(0.5) / Math.log(sb)
    var lines = [
      row(S.rhoRead(gz), (gz ? res.rhoHat.toFixed(3) + ' → ' : '') + st.rho.toFixed(2)),
      row(S.sigmax, res.sigMax.toFixed(3)),
      row(S.mean, res.mean.toFixed(3)),
      row(S.ratio(10), at(10)), row(S.ratio(50), at(50)), row(S.ratio(100), at(100)),
      row(S.horizon, res.hor === null ? S.beyond(N) : res.hor + (res.hor === 1 ? t(' step', ' 步') : S.stepsU)),
      row('σ(b_f)', sb.toFixed(4)),
      row(S.half, halfLife.toFixed(1) + S.stepsU),
      row(S.lratio(100), lat(100)),
      row(S.seed, String(st.seed))
    ]
    readout.textContent = lines.join('\n')
    msg.textContent = res.zero ? S.zero : ''
    legend.textContent = ''
    legend.appendChild(leg(C.blue, 'solid', S.legV))
    legend.appendChild(leg(C.orange, 'dashed', S.legRho))
    if (gz) legend.appendChild(leg(C.purple, 'dotted', S.legSig))
    if (st.lstm) legend.appendChild(leg(C.green, 'solid', S.legL))
    legend.appendChild(h('span', null, S.clampNote))
    plot.redraw(); hist.redraw()
  }
  update()
})
