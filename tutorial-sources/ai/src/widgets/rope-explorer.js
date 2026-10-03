/* rope-explorer — Module 06 "The transformer", section s6 "Position".
 *
 * Rotary position embedding (RoPE). Split q and k into d_k/2 pairs (x_2i, x_2i+1). The query at
 * position t has its pair i rotated by t·θ_i, the key at position s by s·θ_i, with
 * θ_i = b^(−2i/d_k), i = 0 … d_k/2 − 1 (b is the base, 10,000 by default). Values are not rotated.
 *
 * Why the score depends only on Δ = t − s. Write a pair as the complex number z = x_2i + i·x_2i+1.
 * For two pairs u and v, Re(u·conj(v)) = Re((u_x + i u_y)(v_x − i v_y)) = u_x v_x + u_y v_y, their 2D
 * dot product. Rotating a pair by φ multiplies it by e^{iφ}. So pair i contributes
 *     Re(z_q e^{i t θ_i} · conj(z_k e^{i s θ_i})) = Re(z_q conj(z_k) e^{i (t − s) θ_i}).
 * With z_q conj(z_k) = a_i + i b_i, where a_i = q_2i k_2i + q_2i+1 k_2i+1 and
 * b_i = q_2i+1 k_2i − q_2i k_2i+1, and e^{iΔθ} = cos Δθ + i sin Δθ, the real part is
 *     a_i cos(Δ θ_i) − b_i sin(Δ θ_i).
 * Summed over the pairs, q'_t · k'_s = Σ_i [a_i cos(Δ θ_i) − b_i sin(Δ θ_i)], a function of q, k and
 * Δ alone. The curve uses this formula. The readout and the dials rotate q and k explicitly at their
 * absolute positions, so the equality of score(t, s) and score(t + 100, s + 100) is computed, not
 * assumed. The plotted score is divided by Σ_i sqrt((q_2i² + q_2i+1²)(k_2i² + k_2i+1²)), the most the
 * pairs can add up to, so it lies in [−1, 1] (128 for q = k = all ones at d_k = 128).
 *
 * Context extension by a factor κ (= L_target / L_train): position interpolation keeps b and uses the
 * positions t/κ and s/κ (fractions allowed); the NTK-aware base keeps the positions and uses
 * b′ = b·κ^(d_k/(d_k − 2)), which slows the last pair, θ_last = b^(−(d_k − 2)/d_k), by exactly κ and
 * leaves θ_0 = 1 unchanged.
 */
AIW.register('rope-explorer', function (el, opts) {
  var tr = AIW.t, h = AIW.h
  var NS = 'http://www.w3.org/2000/svg'
  var PMAX = 4096          // position sliders and the linear offset axis: 0 … 4,096
  var LOGMAX = 16384       // the log offset axis: 1 … 16,384
  var NLOG = 200           // log-spaced offsets on the log axis (rounded to whole tokens)
  var DKS = [8, 16, 64, 128]
  var TAU = 2 * Math.PI

  // ---- state; data-* attributes may override the defaults ----
  function numOpt(v, d, lo, hi) { var x = Number(v); if (v == null || v === '' || !isFinite(x)) return d; return Math.min(hi, Math.max(lo, x)) }
  var st = {
    t: Math.round(numOpt(opts.t, 10, 0, PMAX)),
    s: Math.round(numOpt(opts.s, 3, 0, PMAX)),
    lock: opts.lock === 'true',
    dk: DKS.indexOf(Number(opts.dk)) >= 0 ? Number(opts.dk) : 128,
    base: numOpt(opts.base, 10000, 100, 1e6),
    vec: ['ones', 'alt', 'rand'].indexOf(opts.vectors) >= 0 ? opts.vectors : 'ones',
    ext: ['none', 'pi', 'ntk'].indexOf(opts.extension) >= 0 ? opts.extension : 'none',
    kappa: numOpt(opts.kappa, 4, 1, 8),
    L: Math.round(numOpt(opts.context, 4096, 1, 1e7)),
    logx: opts.logx === 'true'
  }

  // ---- formatting ----
  function minus(s) { return s.replace(/-/g, '−') }
  function fx(x, d) { var r = x.toFixed(d); if (/^-0\.?0*$/.test(r)) r = r.slice(1); return minus(r) }
  function sgn(x, d) { var r = fx(x, d); return r.charAt(0) === '−' ? r : '+' + r }
  function grp(x) {                       // whole number with thousands separators
    var n = Math.round(Math.abs(x)), s = String(n), out = ''
    while (s.length > 3) { out = ',' + s.slice(-3) + out; s = s.slice(0, -3) }
    return (x < 0 && n !== 0 ? '−' : '') + s + out
  }
  function trim(x) { return minus(String(Math.round(x * 1000) / 1000)) }   // 2.5, 0.75, 4
  function lenFmt(x) { return x < 100 ? fx(x, 2) : grp(x) }                // 6.28, 54,410
  function expo(x) { return minus(x.toExponential(1)) }
  function niceBase(v) {                  // the base slider snaps to 1, 2, 2.5, 5 × 10^k when close, else 3 significant figures
    var e = Math.floor(Math.log10(v) + 1e-12), p = Math.pow(10, e), m = v / p
    var nice = [1, 2, 2.5, 5, 10]
    for (var i = 0; i < nice.length; i++) if (Math.abs(m / nice[i] - 1) < 0.006) return nice[i] * p
    var q = Math.pow(10, e - 2)
    return Math.round(v / q) * q
  }

  // ---- colours: CSS variables, so the page theme applies; AIW.C as the fallback ----
  var FALL = { navy: AIW.C.navy, blue: AIW.C.blue, orange: AIW.C.orange, green: AIW.C.green, red: AIW.C.red,
    slate: AIW.C.slate, muted: AIW.C.muted, border: AIW.C.border, amber: AIW.C.amber, purple: AIW.C.purple,
    sky: AIW.C.sky, 'sky-light': AIW.C.skyLight, white: '#FFFFFF' }
  function cv(name) { return 'var(--' + name + ', ' + FALL[name] + ')' }        // SVG styles
  function cc(name) {                                                           // canvas
    var v = ''
    try { v = getComputedStyle(el).getPropertyValue('--' + name).trim() } catch (e) { v = '' }
    return v || FALL[name]
  }
  function S(tag, attrs, style, text) {
    var e = document.createElementNS(NS, tag)
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k])
    if (style) for (var p in style) if (style[p] != null) e.style.setProperty(p, style[p])
    if (text != null) e.textContent = text
    return e
  }
  function r2(x) { return Math.round(x * 100) / 100 }

  // ---- vectors and the per-pair coefficients a_i, b_i (cached per choice and d_k) ----
  var vecCache = {}
  function vectors() {
    var key = st.vec + '|' + st.dk
    if (vecCache[key]) return vecCache[key]
    var d = st.dk, n = d / 2, q = new Float64Array(d), k = new Float64Array(d), i
    if (st.vec === 'ones') { for (i = 0; i < d; i++) { q[i] = 1; k[i] = 1 } }
    else if (st.vec === 'alt') { for (i = 0; i < d; i++) { q[i] = i % 2 === 0 ? 1 : 0; k[i] = i % 2 === 1 ? 1 : 0 } }
    else {                                // mulberry32 seeded 1, Box–Muller normals: q first, then k
      var rand = AIW.rng(1)
      for (i = 0; i < d; i++) q[i] = AIW.gauss(rand)
      for (i = 0; i < d; i++) k[i] = AIW.gauss(rand)
    }
    var a = new Float64Array(n), b = new Float64Array(n), nq = new Float64Array(n), nk = new Float64Array(n), N = 0
    for (i = 0; i < n; i++) {
      var q0 = q[2 * i], q1 = q[2 * i + 1], k0 = k[2 * i], k1 = k[2 * i + 1]
      a[i] = q0 * k0 + q1 * k1
      b[i] = q1 * k0 - q0 * k1
      nq[i] = Math.sqrt(q0 * q0 + q1 * q1); nk[i] = Math.sqrt(k0 * k0 + k1 * k1)
      N += Math.sqrt((q0 * q0 + q1 * q1) * (k0 * k0 + k1 * k1))
    }
    vecCache[key] = { q: q, k: k, a: a, b: b, nq: nq, nk: nk, N: N }
    return vecCache[key]
  }

  // ---- frequencies for an extension setting ----
  function setting(ext) {
    var d = st.dk, n = d / 2
    var b = ext === 'ntk' ? st.base * Math.pow(st.kappa, d / (d - 2)) : st.base
    var th = new Float64Array(n)
    for (var i = 0; i < n; i++) th[i] = Math.pow(b, -2 * i / d)
    return { ext: ext, b: b, th: th, kap: ext === 'pi' ? st.kappa : 1 }
  }
  function posOf(p, f) { return f.kap === 1 ? p : p / f.kap }       // interpolation: position p/κ
  function wavelength(f, i) { return TAU / f.th[i] * f.kap }         // tokens per full turn of pair i

  // Rotate every pair of q by (its position)·θ_i and of k likewise; each pair's share of q'·k'.
  function pairs(V, f, t, s) {
    var n = f.th.length, out = new Array(n), pt = posOf(t, f), ps = posOf(s, f)
    for (var i = 0; i < n; i++) {
      var at = pt * f.th[i], as = ps * f.th[i]
      var c1 = Math.cos(at), s1 = Math.sin(at), c2 = Math.cos(as), s2 = Math.sin(as)
      var q0 = V.q[2 * i], q1 = V.q[2 * i + 1], k0 = V.k[2 * i], k1 = V.k[2 * i + 1]
      var qx = q0 * c1 - q1 * s1, qy = q0 * s1 + q1 * c1
      var kx = k0 * c2 - k1 * s2, ky = k0 * s2 + k1 * c2
      out[i] = { qx: qx, qy: qy, kx: kx, ky: ky, share: qx * kx + qy * ky, at: at, as: as }
    }
    return out
  }
  function scoreAbs(V, f, t, s) { var P = pairs(V, f, t, s), sum = 0; for (var i = 0; i < P.length; i++) sum += P[i].share; return sum }
  // The same score from the offset alone: Σ_i a_i cos(Δθ_i) − b_i sin(Δθ_i) (derivation at the top).
  function scoreDelta(V, f, D) {
    var sum = 0, pd = D / f.kap
    for (var i = 0; i < f.th.length; i++) { var ang = pd * f.th[i]; sum += V.a[i] * Math.cos(ang) - V.b[i] * Math.sin(ang) }
    return sum
  }

  // Normalised score against the offset: every whole offset 0 … 4,096 (64 × 4,097 = 262,208 cosines
  // at d_k = 128), or NLOG log-spaced offsets 1 … 16,384. pos[j] is the score at +xs[j], neg[j] at −xs[j].
  var curveCache = {}, curveKeys = []
  function curveData(V, f, log) {
    var key = [st.vec, st.dk, f.b, f.kap, log ? 'log' : 'lin'].join('|')
    if (curveCache[key]) return curveCache[key]
    var xs = [], j, i
    if (log) { for (j = 0; j < NLOG; j++) { var d = Math.round(Math.pow(LOGMAX, j / (NLOG - 1))); if (!xs.length || d !== xs[xs.length - 1]) xs.push(d) } }
    else for (j = 0; j <= PMAX; j++) xs.push(j)
    var m = xs.length, C = new Float64Array(m), Sn = new Float64Array(m)
    for (i = 0; i < f.th.length; i++) {
      var a = V.a[i], b = V.b[i], w = f.th[i]
      if (a === 0 && b === 0) continue
      for (j = 0; j < m; j++) {
        var ang = (xs[j] / f.kap) * w
        if (a !== 0) C[j] += a * Math.cos(ang)
        if (b !== 0) Sn[j] += b * Math.sin(ang)
      }
    }
    var pos = new Float64Array(m), neg = new Float64Array(m)
    for (j = 0; j < m; j++) { pos[j] = (C[j] - Sn[j]) / V.N; neg[j] = (C[j] + Sn[j]) / V.N }
    curveCache[key] = { xs: xs, pos: pos, neg: neg }
    curveKeys.push(key)
    if (curveKeys.length > 8) delete curveCache[curveKeys.shift()]
    return curveCache[key]
  }

  // ---- controls ----
  function moveT(v) {
    v = Math.round(v)
    if (st.lock) {                        // keep t − s fixed; clamp the pair to [0, 4,096]
      var d = st.t - st.s, s2 = v - d
      if (s2 < 0) { s2 = 0; v = d }
      if (s2 > PMAX) { s2 = PMAX; v = PMAX + d }
      st.s = s2; sSl.set(s2)
    }
    st.t = v
    if (tSl.value !== v) tSl.set(v)
    update()
  }
  function moveS(v) {
    v = Math.round(v)
    if (st.lock) {
      var d = st.t - st.s, t2 = v + d
      if (t2 < 0) { t2 = 0; v = -d }
      if (t2 > PMAX) { t2 = PMAX; v = PMAX - d }
      st.t = t2; tSl.set(t2)
    }
    st.s = v
    if (sSl.value !== v) sSl.set(v)
    update()
  }
  var tSl = AIW.slider({ label: tr('query position t', '查询位置 t'), min: 0, max: PMAX, step: 1, value: st.t, fmt: grp, onInput: moveT })
  var sSl = AIW.slider({ label: tr('key position s', '键位置 s'), min: 0, max: PMAX, step: 1, value: st.s, fmt: grp, onInput: moveS })
  tSl.style.flex = '1 1 220px'; sSl.style.flex = '1 1 220px'
  var lockCb = AIW.checkbox(tr('lock offset t − s', '锁定偏移 t − s'), st.lock, function (on) { st.lock = on; update() })
  var dkSel = AIW.select({ label: tr('head dimension dₖ', '每头维度 dₖ'), options: DKS.map(function (d) { return [d, String(d)] }), value: st.dk,
    onChange: function (v) { st.dk = Number(v); update() } })
  var baseSl = AIW.slider({ label: tr('base b', '底数 b'), min: 100, max: 1e6, log: true, value: st.base,
    fmt: function (v) { return grp(niceBase(v)) }, onInput: function (v) { st.base = niceBase(v); update() } })
  baseSl.querySelector('input').step = '0.005'
  var vecSel = AIW.select({ label: tr('vectors q and k', '向量 q 与 k'), value: st.vec,
    options: [['ones', tr('q = k = all ones', 'q = k = 全 1')], ['alt', 'q = (1,0,1,0,…), k = (0,1,0,1,…)'], ['rand', tr('random (seed 1)', '随机（种子 1）')]],
    onChange: function (v) { st.vec = v; update() } })
  var extSel = AIW.select({ label: tr('context extension', '上下文扩展'), value: st.ext,
    options: [['none', tr('none', '无')], ['pi', tr('position interpolation', '位置插值')], ['ntk', tr('NTK-aware base', 'NTK-aware 底数')]],
    onChange: function (v) { st.ext = v; update() } })
  var kapSl = AIW.slider({ label: tr('extension factor κ', '扩展倍数 κ'), min: 1, max: 8, step: 0.5, value: st.kappa, fmt: trim,
    onInput: function (v) { st.kappa = v; update() } })
  var Lin = h('input', { type: 'number', min: 1, max: 10000000, step: 1, value: st.L, style: { width: '6.5rem' } })
  var Lctl = h('label', { class: 'w-ctl' }, h('span', { text: tr('training context L (tokens)', '训练上下文长度 L（token）') }), Lin)
  function readL(commit) {
    var x = Math.round(Number(Lin.value))
    if (Lin.value === '' || !isFinite(x) || x < 1) { if (commit) Lin.value = st.L; return }
    x = Math.min(1e7, x)
    if (commit) Lin.value = x
    if (x !== st.L) { st.L = x; update() }
  }
  Lin.addEventListener('input', function () { readL(false) })
  Lin.addEventListener('change', function () { readL(true) })
  var logCb = AIW.checkbox(tr('log offset axis (1 to 16,384)', '偏移轴取对数（1 到 16,384）'), st.logx, function (on) { st.logx = on; curve.redraw(); renderCurveLegend() })
  var tIn = tSl.querySelector('input'), sIn = sSl.querySelector('input'), bIn = baseSl.querySelector('input'), kIn = kapSl.querySelector('input')

  // ---- layout ----
  var headStyle = { fontSize: '.8rem', fontWeight: '600', color: 'var(--navy)', margin: '.1rem 0 .35rem' }
  el.appendChild(h('div', { class: 'w-controls' }, tSl, sSl, lockCb))
  el.appendChild(h('div', { class: 'w-controls' }, dkSel, baseSl, vecSel))
  el.appendChild(h('div', { class: 'w-controls' }, extSel, kapSl, Lctl))
  var dialHead = h('div', { style: headStyle })
  var dialBox = h('div', { style: { width: '100%' } })
  var dialNote = h('p', { class: 'w-note', style: { marginBottom: '.3rem' } })
  el.appendChild(dialHead); el.appendChild(dialBox); el.appendChild(dialNote)
  var curveHead = h('div', { style: headStyle }, tr('Score against the offset Δ = t − s', '分数随偏移 Δ = t − s 的变化'))
  var cvBox = h('div')
  var curveLegend = h('div', { class: 'w-legend' })
  var colL = h('div', { class: 'w-col', style: { flex: '1 1 290px' } }, curveHead, h('div', { class: 'w-controls', style: { marginBottom: '.4rem' } }, logCb), cvBox, curveLegend)
  var barHead = h('div', { style: headStyle }, tr('Wavelength 2π/θᵢ of each pair', '各维度对的波长 2π/θᵢ'))
  var barBox = h('div', { style: { width: '100%' } })
  var barLegend = h('div', { class: 'w-legend' })
  var colR = h('div', { class: 'w-col', style: { flex: '1 1 290px' } }, barHead, barBox, barLegend)
  el.appendChild(h('div', { class: 'w-row', style: { marginTop: '.9rem' } }, colL, colR))
  var readout = h('div', { class: 'w-readout', style: { marginTop: '.9rem' }, 'aria-live': 'polite' })
  el.appendChild(readout)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Tick “lock offset” and drag t: every arrow turns, every wedge keeps its angle, and the score stays the same.',
    '勾选“锁定偏移”后拖动 t：所有箭头都在转，每个扇形的角度不变，分数也不变。')))

  // ---- dials: one per pair, the rotated q pair, the rotated k pair and the angle between them ----
  function wrapPi(x) { return x - TAU * Math.floor((x + Math.PI) / TAU) }
  function arrow(g, cx, cy, ang, len, color, width, head) {
    if (len < 0.5) return
    var ux = Math.cos(ang), uy = -Math.sin(ang)
    var hl = Math.min(head, len * 0.45), hw = hl * 0.55
    var tx = cx + ux * len, ty = cy + uy * len, bx = tx - ux * hl, by = ty - uy * hl
    g.appendChild(S('line', { x1: r2(cx), y1: r2(cy), x2: r2(bx), y2: r2(by) }, { stroke: color, 'stroke-width': width, 'stroke-linecap': 'round' }))
    g.appendChild(S('polygon', { points: [tx, ty, bx - uy * hw, by + ux * hw, bx + uy * hw, by - ux * hw].map(r2).join(' ') }, { fill: color }))
  }
  var lastDialW = -1, lastBarW = -1
  function renderDials() {
    var W = dialBox.clientWidth || 600, n = st.dk / 2, big = n <= 8
    lastDialW = W
    var cols = big ? (W < 440 ? Math.min(n, 4) : n) : (W < 560 ? 8 : 16)
    var cell = Math.floor(Math.min(big ? 128 : 56, W / cols))
    var lab = big ? 46 : 0, rows = Math.ceil(n / cols)
    var SW = cols * cell, SH = rows * (cell + lab)
    var V = vectors(), f = setting(st.ext), f0 = setting('none'), P = pairs(V, f, st.t, st.s)
    var maxN = 0, i
    for (i = 0; i < n; i++) maxN = Math.max(maxN, V.nq[i], V.nk[i])
    var svg = S('svg', { width: SW, height: SH, viewBox: '0 0 ' + SW + ' ' + SH, role: 'img',
      'aria-label': tr('Dials for the ' + n + ' pairs at t = ' + st.t + ' and s = ' + st.s, '位置 t = ' + st.t + '、s = ' + st.s + ' 处 ' + n + ' 个维度对的圆盘') },
    { display: 'block', margin: '0 auto', 'max-width': '100%', 'font-family': 'var(--font-body)' })
    var posLbl = f.kap === 1 ? '' : '/κ'
    for (i = 0; i < n; i++) {
      var p = P[i], cx = (i % cols + 0.5) * cell, cy = Math.floor(i / cols) * (cell + lab) + cell / 2
      var R = cell * 0.42, g = S('g')
      var slow = wavelength(f0, i) > st.L    // never completes a rotation in training
      var aq = Math.atan2(p.qy, p.qx), ak = Math.atan2(p.ky, p.kx), phi = wrapPi(aq - ak)
      var lq = maxN > 0 ? R * V.nq[i] / maxN : 0, lk = maxN > 0 ? R * V.nk[i] / maxN : 0
      g.appendChild(S('title', null, null, tr('pair ', '维度对 ') + i + ': θ = ' + AIW.fmt(f.th[i] / f.kap, 3) +
        ', t' + posLbl + '·θ = ' + fx(p.at, 2) + ' rad, s' + posLbl + '·θ = ' + fx(p.as, 2) + ' rad, ' +
        tr('angle between ', '夹角 ') + fx(phi * 180 / Math.PI, 1) + '°, ' + tr('share of the score ', '对分数的贡献 ') + sgn(p.share, 3) +
        (slow ? tr('; never completes a rotation in training', '；训练中转不满一圈') : '')))
      g.appendChild(S('circle', { cx: r2(cx), cy: r2(cy), r: r2(R) }, { fill: cv('white'), stroke: slow ? cv('amber') : cv('muted'),
        'stroke-width': big ? 1.5 : 1, 'stroke-dasharray': slow ? (big ? '5 3' : '3 2') : null }))
      if (lq > 0 && lk > 0 && Math.abs(phi) > 1e-3) {
        var rho = R * (big ? 0.42 : 0.55)
        var x1 = cx + rho * Math.cos(ak), y1 = cy - rho * Math.sin(ak), x2 = cx + rho * Math.cos(aq), y2 = cy - rho * Math.sin(aq)
        g.appendChild(S('path', { d: 'M' + r2(cx) + ' ' + r2(cy) + 'L' + r2(x1) + ' ' + r2(y1) + 'A' + r2(rho) + ' ' + r2(rho) + ' 0 0 ' + (phi > 0 ? 0 : 1) + ' ' + r2(x2) + ' ' + r2(y2) + 'Z' },
          { fill: p.share >= 0 ? cv('green') : cv('red'), 'fill-opacity': 0.35 }))
      }
      arrow(g, cx, cy, ak, lk, cv('orange'), big ? 2.4 : 1.5, big ? 9 : 4.5)
      arrow(g, cx, cy, aq, lq, cv('blue'), big ? 2.4 : 1.5, big ? 9 : 4.5)
      if (big) {
        var ty = cy + cell / 2 + 11
        g.appendChild(S('text', { x: r2(cx), y: r2(ty), 'text-anchor': 'middle' }, { 'font-size': '11px', fill: cv('navy'), 'font-weight': 600 }, 'i = ' + i))
        g.appendChild(S('text', { x: r2(cx), y: r2(ty + 14), 'text-anchor': 'middle' }, { 'font-size': '11px', fill: cv('slate'), 'font-family': 'var(--font-mono)' }, '∠ ' + fx(phi * 180 / Math.PI, 0) + '°'))
        g.appendChild(S('text', { x: r2(cx), y: r2(ty + 28), 'text-anchor': 'middle' }, { 'font-size': '11px', fill: p.share >= 0 ? cv('green') : cv('red'), 'font-family': 'var(--font-mono)' }, sgn(p.share, 3)))
      }
      svg.appendChild(g)
    }
    dialBox.textContent = ''
    dialBox.appendChild(svg)
    var rotq = f.kap === 1 ? 'tθᵢ' : '(t/κ)θᵢ', rotk = f.kap === 1 ? 'sθᵢ' : '(s/κ)θᵢ'
    dialHead.textContent = tr('The ' + n + ' pairs of q and k at t = ' + st.t + ' and s = ' + st.s, '位置 t = ' + st.t + '、s = ' + st.s + ' 处 q 与 k 的 ' + n + ' 个维度对')
    dialNote.textContent = tr(
      'One dial per pair i = 0 … ' + (n - 1) + ', fastest first, read left to right. Blue: the q pair rotated by ' + rotq + '; orange: the k pair rotated by ' + rotk +
        '. The wedge is the angle between them, green where the pair adds to the score, red where it subtracts. Dashed circles: pairs that never complete a rotation in training.' +
        (big ? ' Under each dial: the pair, the angle between the arrows, and the pair’s share of the score.' : ''),
      '每对维度一个圆盘，i = 0 … ' + (n - 1) + '，从左到右、由快到慢。蓝色：按 ' + rotq + ' 旋转后的 q 对；橙色：按 ' + rotk +
        ' 旋转后的 k 对。扇形是两者的夹角，绿色表示这一对为分数做正贡献，红色表示负贡献。虚线圆：训练中转不满一圈的维度对。' +
        (big ? '圆盘下方依次是维度对编号、两箭头的夹角和这一对对分数的贡献。' : ''))
  }

  // ---- bar chart: log10 of the wavelength of every pair against the training context ----
  var SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷']
  function renderBars() {
    var W = Math.max(240, barBox.clientWidth || 380), H = Math.round(Math.min(300, Math.max(230, W * 0.66)))
    lastBarW = barBox.clientWidth
    var pad = { l: 44, r: 10, t: 10, b: 40 }, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b
    var f0 = setting('none'), f = setting(st.ext), n = f.th.length, ext = st.ext !== 'none'
    var Y = function (lg) { return pad.t + (1 - Math.min(7, Math.max(0, lg)) / 7) * ph }
    var bw = pw / n, i
    var svg = S('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': tr('Wavelengths of the ' + n + ' pairs on a log scale with the training context', n + ' 个维度对的波长（对数刻度）与训练上下文') },
    { display: 'block', 'font-family': 'var(--font-body)' })
    for (var e = 0; e <= 7; e++) {
      var gy = r2(Y(e))
      svg.appendChild(S('line', { x1: pad.l, y1: gy, x2: W - pad.r, y2: gy }, { stroke: cv('border'), 'stroke-width': 1 }))
      svg.appendChild(S('text', { x: pad.l - 6, y: r2(gy + 4), 'text-anchor': 'end' }, { 'font-size': '11px', fill: cv('slate'), 'font-family': 'var(--font-mono)' }, '10' + SUP[e]))
    }
    var ticks = n >= 16 ? [0, n / 4, n / 2, 3 * n / 4, n - 1] : Array.apply(null, Array(n)).map(function (_, j) { return j })
    ticks.forEach(function (j) {
      svg.appendChild(S('text', { x: r2(pad.l + (j + 0.5) * bw), y: H - pad.b + 15, 'text-anchor': 'middle' }, { 'font-size': '11px', fill: cv('slate'), 'font-family': 'var(--font-mono)' }, String(j)))
    })
    var shaded = 0, top = Y(7)
    for (i = 0; i < n; i++) {
      var lam0 = wavelength(f0, i), lam = wavelength(f, i), slow = lam0 > st.L
      if (slow) shaded++
      var x = pad.l + i * bw
      if (ext) svg.appendChild(S('rect', { x: r2(x + bw * 0.06), y: r2(Y(Math.log10(lam0))), width: r2(bw * 0.88), height: r2(Y(0) - Y(Math.log10(lam0))) },
        { fill: cv('muted'), 'fill-opacity': 0.3 }))
      var wfrac = ext ? 0.52 : 0.8, yv = Y(Math.log10(lam))
      svg.appendChild(S('rect', { x: r2(x + bw * (1 - wfrac) / 2), y: r2(yv), width: r2(bw * wfrac), height: r2(Y(0) - yv) },
        { fill: slow ? cv('amber') : cv('sky') }))
      if (Math.log10(lam) > 7) svg.appendChild(S('polygon', { points: [x + bw / 2, top - 5, x + bw * 0.1, top + 1, x + bw * 0.9, top + 1].map(r2).join(' ') }, { fill: cv('navy') }))
    }
    svg.appendChild(S('line', { x1: pad.l, y1: pad.t, x2: pad.l, y2: H - pad.b }, { stroke: cv('muted') }))
    svg.appendChild(S('line', { x1: pad.l, y1: H - pad.b, x2: W - pad.r, y2: H - pad.b }, { stroke: cv('muted') }))
    function hline(v, color, dash, label, below) {
      var yy = r2(Y(Math.log10(v)))
      svg.appendChild(S('line', { x1: pad.l, y1: yy, x2: W - pad.r, y2: yy }, { stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': dash }))
      svg.appendChild(S('text', { x: pad.l + 4, y: below ? yy + 13 : yy - 5 }, { 'font-size': '11px', fill: color, 'font-weight': 600,
        stroke: cv('white'), 'stroke-width': 3, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, label))
    }
    var tgt = st.kappa * st.L, close = ext && Math.abs(Math.log10(st.kappa)) / 7 * ph < 15
    hline(st.L, cv('navy'), null, tr('training context L = ', '训练上下文 L = ') + grp(st.L), close)
    if (ext) hline(tgt, cv('purple'), '5 4', tr('target context κL = ', '目标上下文 κL = ') + grp(tgt), false)
    svg.appendChild(S('text', { x: r2(pad.l + pw / 2), y: H - 6, 'text-anchor': 'middle' }, { 'font-size': '12px', fill: cv('navy') }, tr('pair i (fast → slow)', '维度对 i（快 → 慢）')))
    var yl = S('text', { x: 0, y: 0, 'text-anchor': 'middle', transform: 'translate(12 ' + r2(pad.t + ph / 2) + ') rotate(-90)' }, { 'font-size': '12px', fill: cv('navy') }, tr('tokens per turn', '每转一圈的 token 数'))
    svg.appendChild(yl)
    barBox.textContent = ''
    barBox.appendChild(svg)
    // legend
    barLegend.textContent = ''
    function key(color, text, kind) {
      var sw = kind === 'bar' ? h('i', { style: { background: color, height: '10px', width: '10px', borderRadius: '2px' } })
        : h('i', { style: kind === 'dash' ? { borderTop: '2px dashed ' + color, background: 'none', height: '0' } : { background: color } })
      barLegend.appendChild(h('span', null, sw, text))
    }
    key(cv('amber'), tr('never completes a rotation in training (λ > L' + (ext ? ' before extension' : '') + '): ' + shaded + ' of ' + n,
      '训练中转不满一圈（' + (ext ? '扩展前 ' : '') + 'λ > L）：' + n + ' 对中的 ' + shaded + ' 对'), 'bar')
    key(cv('sky'), tr('turns at least once within L', '在 L 内至少转一圈'), 'bar')
    if (ext) {
      key(cv('muted'), tr('ghost: wavelength before extension', '浅色：扩展前的波长'), 'bar')
      key(cv('purple'), tr('target context κL', '目标上下文 κL'), 'dash')
    }
  }

  // ---- score curve (canvas) ----
  function drawCurve(ctx, w, hh) {
    var V = vectors(), f = setting(st.ext), ext = st.ext !== 'none', D = st.t - st.s, log = st.logx
    var pad = { l: 44, r: 12, t: 12, b: 38 }, pw = w - pad.l - pad.r, ph = hh - pad.t - pad.b
    var x0 = log ? 0 : (D < 0 ? -PMAX : 0), x1 = log ? Math.log10(LOGMAX) : PMAX
    var X = function (d) { return pad.l + ((log ? Math.log10(d) : d) - x0) / (x1 - x0) * pw }
    var Y = function (y) { return pad.t + (1 - y) / 2 * ph }
    ctx.save()
    ctx.font = '11px "DM Mono", Consolas, monospace'; ctx.lineWidth = 1
    var xt = log ? [1, 10, 100, 1000, 10000] : (D < 0 ? [-4096, -2048, 0, 2048, 4096] : [0, 1024, 2048, 3072, 4096])
    xt.forEach(function (v) {
      var px = X(v)
      ctx.strokeStyle = cc('border'); ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, pad.t + ph); ctx.stroke()
      ctx.fillStyle = cc('slate'); ctx.textAlign = 'center'; ctx.fillText(grp(v), Math.min(px, w - 16), pad.t + ph + 14)
    })
    ;[-1, -0.5, 0, 0.5, 1].forEach(function (v) {
      var py = Y(v)
      ctx.strokeStyle = v === 0 ? cc('muted') : cc('border'); ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(pad.l + pw, py); ctx.stroke()
      ctx.fillStyle = cc('slate'); ctx.textAlign = 'right'; ctx.fillText(fx(v, 1), pad.l - 6, py + 4)
    })
    ctx.strokeStyle = cc('muted'); ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke()
    ctx.font = '12px "DM Sans", system-ui, sans-serif'; ctx.fillStyle = cc('navy'); ctx.textAlign = 'center'
    ctx.fillText(tr('offset Δ = t − s (tokens' + (log ? ', log scale)' : ')'), '偏移 Δ = t − s（token' + (log ? '，对数刻度）' : '）')), pad.l + pw / 2, hh - 6)
    ctx.save(); ctx.translate(12, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(tr('normalised score', '归一化分数'), 0, 0); ctx.restore()
    ctx.beginPath(); ctx.rect(pad.l, pad.t - 1, pw + 1, ph + 2); ctx.clip()
    // vertical lines at the training context and, with an extension, the target context
    function vline(d, color, label) {
      var lo = log ? 1 : x0, hi = log ? LOGMAX : PMAX
      if (d < lo || d > hi) return
      var px = X(d)
      ctx.save(); ctx.strokeStyle = color; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3
      ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, pad.t + ph); ctx.stroke(); ctx.restore()
      ctx.font = '600 11px "DM Sans", system-ui, sans-serif'; ctx.fillStyle = color
      var right = px > pad.l + pw * 0.6
      ctx.textAlign = right ? 'right' : 'left'; ctx.fillText(label, px + (right ? -4 : 4), pad.t + 12)
    }
    vline(st.L, cc('amber'), 'L = ' + grp(st.L))
    if (ext) vline(st.kappa * st.L, cc('purple'), 'κL = ' + grp(st.kappa * st.L))
    function plot(cd, color, dash, width) {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash)
      ctx.lineJoin = 'round'; ctx.beginPath()
      var first = true, j
      if (!log && D < 0) for (j = cd.xs.length - 1; j >= 1; j--) { ctx[first ? 'moveTo' : 'lineTo'](X(-cd.xs[j]), Y(cd.neg[j])); first = false }
      for (j = 0; j < cd.xs.length; j++) { ctx[first ? 'moveTo' : 'lineTo'](X(cd.xs[j]), Y(cd.pos[j])); first = false }
      ctx.stroke(); ctx.restore()
    }
    if (ext) plot(curveData(V, setting('none'), log), cc('muted'), [5, 4], 1.2)
    plot(curveData(V, f, log), cc('blue'), null, 1.3)
    // marker at the current offset
    if (!log || D >= 1) {
      var val = scoreDelta(V, f, D) / V.N, mx = X(D), my = Y(val)
      ctx.save(); ctx.strokeStyle = cc('navy'); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ph); ctx.stroke(); ctx.restore()
      ctx.beginPath(); ctx.arc(mx, my, 4.5, 0, TAU); ctx.fillStyle = cc('orange'); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = cc('white'); ctx.stroke()
      var lbl = 'Δ = ' + grp(D) + ': ' + fx(val, 3)
      ctx.font = '600 11px "DM Mono", Consolas, monospace'
      var tw = ctx.measureText(lbl).width, lx = mx + 8, ly = my < pad.t + 30 ? my + 16 : my - 9
      if (lx + tw > pad.l + pw - 2) lx = mx - 8 - tw
      ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.strokeStyle = cc('white'); ctx.strokeText(lbl, lx, ly)
      ctx.fillStyle = cc('navy'); ctx.fillText(lbl, lx, ly)
    } else {
      ctx.font = '11px "DM Sans", system-ui, sans-serif'; ctx.fillStyle = cc('slate'); ctx.textAlign = 'left'
      ctx.fillText(tr('Δ = ' + grp(D) + ' is not on the log axis', 'Δ = ' + grp(D) + ' 不在对数轴上'), pad.l + 6, pad.t + ph - 8)
    }
    ctx.restore()
  }
  var curve = AIW.canvas(cvBox, { aspect: 0.66, maxHeight: 300 }, drawCurve)
  function renderCurveLegend() {
    curveLegend.textContent = ''
    function key(color, text, dash) {
      curveLegend.appendChild(h('span', null, h('i', { style: dash ? { borderTop: '2px dashed ' + color, background: 'none', height: '0' } : { background: color } }), text))
    }
    key(cv('blue'), tr('score / Σᵢ ‖qᵢ‖‖kᵢ‖', '分数 / Σᵢ ‖qᵢ‖‖kᵢ‖'))
    if (st.ext !== 'none') key(cv('muted'), tr('before extension', '扩展前'), true)
    key(cv('amber'), tr('training context L', '训练上下文 L'), true)
    if (st.ext !== 'none') key(cv('purple'), tr('target context κL', '目标上下文 κL'), true)
    curveLegend.appendChild(h('span', null, h('i', { style: { background: cv('orange'), width: '8px', height: '8px', borderRadius: '50%' } }), tr('current offset', '当前偏移')))
  }

  // ---- readout ----
  function renderReadout() {
    var V = vectors(), f = setting(st.ext), n = st.dk / 2, D = st.t - st.s
    var s1 = scoreAbs(V, f, st.t, st.s), s2 = scoreAbs(V, f, st.t + 100, st.s + 100), diff = s1 - s2
    var a = 'score(' + st.t + ', ' + st.s + ')', b = 'score(' + (st.t + 100) + ', ' + (st.s + 100) + ')'
    var wdt = Math.max(a.length, b.length)
    function padR(x) { while (x.length < wdt) x += ' '; return x }
    var nrm = tr('normalised ', '归一化 ')
    var Ntxt = Math.abs(V.N - Math.round(V.N)) < 1e-9 ? grp(V.N) : fx(V.N, 3)
    var lines = [
      tr('offset', '偏移') + ' Δ = t − s = ' + st.t + ' − ' + st.s + ' = ' + grp(D),
      padR(a) + ' = ' + fx(s1, 3) + '    ' + nrm + fx(s1 / V.N, 3),
      padR(b) + ' = ' + fx(s2, 3) + '    ' + nrm + fx(s2 / V.N, 3),
      tr('difference', '两者之差') + ' = ' + fx(diff, 3) + (diff !== 0 ? tr('   (exactly ' + expo(diff) + ': floating-point rounding)', '（精确值 ' + expo(diff) + '，浮点舍入误差）') : ''),
      tr('normaliser', '归一化因子') + ' Σᵢ ‖qᵢ‖‖kᵢ‖ = ' + Ntxt + tr(' (the score at Δ = 0 when every pair is aligned)', '（所有维度对同向时 Δ = 0 处的分数）')
    ]
    if (st.ext === 'pi') lines.push(tr('position interpolation, κ = ', '位置插值，κ = ') + trim(st.kappa) + tr(': positions ', '：位置 ') + 't/κ = ' + trim(st.t / st.kappa) + ', s/κ = ' + trim(st.s / st.kappa))
    if (st.ext === 'ntk') lines.push(tr('NTK-aware base', 'NTK-aware 底数') + ' b′ = b·κ^(dₖ/(dₖ − 2)) = ' + grp(st.base) + '·' + trim(st.kappa) + '^(' + st.dk + '/' + (st.dk - 2) + ') = ' + grp(f.b))
    lines.push('θᵢ = ' + grp(f.b) + '^(−2i/' + st.dk + ')' + (st.ext === 'pi' ? tr(', positions divided by κ', '，位置除以 κ') : '') + tr(': wavelengths ', '：波长 ') +
      lenFmt(wavelength(f, 0)) + tr(' to ', ' 到 ') + lenFmt(wavelength(f, n - 1)) + tr(' tokens', ' 个 token'))
    readout.textContent = lines.join('\n')
  }

  function syncControls() {
    var on = st.ext !== 'none'
    kIn.disabled = !on
    kapSl.style.opacity = on ? '' : '0.5'
    tIn.setAttribute('aria-valuetext', tr('query position ', '查询位置 ') + st.t)
    sIn.setAttribute('aria-valuetext', tr('key position ', '键位置 ') + st.s)
    bIn.setAttribute('aria-valuetext', tr('base ', '底数 ') + grp(st.base))
    kIn.setAttribute('aria-valuetext', 'κ = ' + trim(st.kappa))
  }
  function update() {
    syncControls()
    renderDials()
    renderBars()
    curve.redraw()
    renderCurveLegend()
    renderReadout()
  }
  var raf = 0
  function onResize() {
    if (raf) return
    raf = requestAnimationFrame(function () {
      raf = 0
      if (dialBox.clientWidth !== lastDialW) renderDials()
      if (barBox.clientWidth !== lastBarW) renderBars()
    })
  }
  if (window.ResizeObserver) { var ro = new ResizeObserver(onResize); ro.observe(dialBox); ro.observe(barBox) }
  else window.addEventListener('resize', onResize)
  update()
})
