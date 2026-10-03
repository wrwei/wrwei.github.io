/* receptive-field-builder — Module 03, Section 3: build a stack of conv / pool layers and read off
 * the theoretical receptive field, and (by counting paths) how its influence is spread.
 *
 * Theoretical field: r_0 = 1, Δ_0 = 1; r_l = r_{l-1} + (k_l − 1) d_l Δ_{l-1}, Δ_l = Δ_{l-1} s_l (pool: d = 1).
 * Output size: H_l = ⌊(H_{l-1} + 2p_l − d_l(k_l − 1) − 1)/s_l⌋ + 1; H_l < 1 stops the stack.
 * Path counts per axis: c_L = one-hot at unit u; c_{l-1}[x] = Σ c_l[o] over o, t with x = o s_l + t d_l − p_l
 * (0 ≤ x < H_{l-1}); taps that fall in padding are added to one "padding mass" total and not followed
 * further. The 2D map is the outer product of c_0 with itself, each axis divided by the axis total
 * (c_0 on the image + all padding mass), so every shade, contour and share is a fraction of the total.
 * Central window: width w = the odd integer nearest r_L/2 (ties up), i.e. w = 2⌊r_L/4⌋ + 1, centred on the
 * field centre (the unit's position in input coordinates, rounded half up if it falls between cells).
 * Position of unit i of layer l in input coordinates: i Δ_l + off_l, off_l = off_{l-1} + ((k−1)d/2 − p)Δ_{l-1}. */
AIW.register('receptive-field-builder', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h, C = AIW.C
  var SVGNS = 'http://www.w3.org/2000/svg'

  var S = {
    preset: t('preset', '预设网络'),
    custom: t('custom (edited)', '自定义（已编辑）'),
    H: t('input size H', '输入大小 H'),
    erf: t('show the effective receptive field (path-count weighting)', '显示有效感受野（按路径数加权）'),
    unit: t('output unit u (or click the 1D view)', '输出单元 u（或点击一维视图）'),
    add: t('Add layer', '添加层'),
    conv: t('conv', '卷积'), pool: t('pool', '池化'),
    hLayer: t('layer', '层'), hType: t('type', '类型'),
    up: t('move up', '上移'), down: t('move down', '下移'), del: t('remove', '删除'),
    pTitle: t('padding p (empty = automatic ⌊d(k−1)/2⌋)', '填充 p（留空 = 自动 ⌊d(k−1)/2⌋）'),
    colHl: t('H_l', 'H_l'), colJ: t('Δ_l', 'Δ_l'), colR: t('r_l', 'r_l'),
    colHlTitle: t('output size', '输出大小'), colJTitle: t('jump: input pixels between neighbouring units', '跳距：相邻单元在输入上相隔的像素数'),
    colRTitle: t('receptive field', '感受野'),
    noOut: function (n) { return t('layer ' + n + ' has no valid output', '第 ' + n + ' 层没有有效输出') },
    oneD: t('1D view: the cone of the chosen top unit (input at the bottom)', '一维视图：所选顶层单元的连接锥（输入在底部）'),
    legCone: t('units in the cone', '锥内单元'), legTop: t('chosen unit', '所选单元'),
    legPad: t('padding tap', '填充位置'), legDil: t('dilated taps', '空洞抽头'),
    twoD: t('2D view: uniform weights, no nonlinearity: an approximation of the effective receptive field',
      '二维视图：权重均匀、无非线性：有效感受野的近似'),
    legField: t('theoretical field', '理论感受野'), leg50: t('contour: 50% of the mass', '等值线：50% 的质量'),
    leg90: t('contour: 90% of the mass', '等值线：90% 的质量'), legGrid: t('in the field, not reached (gridding)', '在感受野内但未被触及（网格化）'),
    legNever: t('never read by any unit', '任何单元都不读取'), legPadArea: t('padding', '填充区'),
    legShade: t('blue: share of the path mass', '蓝色：路径质量占比'),
    rl: t('receptive field r_L', '感受野 r_L'), jl: t('jump Δ_L', '跳距 Δ_L'),
    paths: t('paths per axis (product of the kernel sizes)', '每个方向的路径数（卷积核大小之积）'),
    counts: t('per-axis path counts', '每个方向的路径数分布'),
    central: function (w) { return t('central ' + w + ' × ' + w + ' window', '中心 ' + w + ' × ' + w + ' 窗口') },
    centralVal: function (share, axis) { return t(share + ' of the 2D path mass (' + axis + ' per axis)', '占二维路径质量的 ' + share + '（每个方向 ' + axis + '）') },
    padMass: t('path mass in padding', '落在填充上的路径质量'),
    half: function (lv) { return t(lv + '% of the mass lies in', lv + '% 的质量位于') },
    cells: function (n, a, b) { return t(n + ' cells (box ' + a + ' × ' + b + ')', n + ' 个格子（外接框 ' + a + ' × ' + b + '）') },
    halfNo: function (lv) { return t(lv + '% of the mass is never inside the image: too much of it lies in padding', lv + '% 的质量无法落在图像内：太多质量落在填充上') },
    warn: function (r, H) { return t('Warning: r_L = ' + r + ' exceeds the input size H = ' + H + ': the field extends into padding.',
      '警告：r_L = ' + r + ' 大于输入大小 H = ' + H + '：感受野延伸到了填充区。') },
    noOutBody: t('The stack has no valid output, so there is no field to show. Reduce a stride or kernel, enlarge the input, or add padding.',
      '该网络没有有效输出，因此无从显示感受野。请减小步长或卷积核、增大输入或增加填充。'),
    clickHint: t('Click the 1D view (or move the slider u) to choose whose field is shown. Pool layers use d = 1.',
      '点击一维视图（或拖动滑块 u）选择要显示其感受野的单元。池化层的 d = 1。'),
    zoomed: function (a, b, n) { return t('views zoomed to input cells ' + a + '–' + b + ' of 0–' + n, '视图放大到输入格 ' + a + '–' + b + '（全部为 0–' + n + '）') },
    inLabel: t('in', '输入')
  }
  var PRESETS = [
    ['one', t('one 7×7 (r = 7)', '一个 7×7（r = 7）'), [['conv', 7, 1, 1]]],
    ['three', t('three 3×3 (r = 7)', '三个 3×3（r = 7）'), [['conv', 3, 1, 1], ['conv', 3, 1, 1], ['conv', 3, 1, 1]]],
    ['vgg', t('VGG blocks 1–2 (r = 16)', 'VGG 第 1–2 块（r = 16）'),
      [['conv', 3, 1, 1], ['conv', 3, 1, 1], ['pool', 2, 2, 1], ['conv', 3, 1, 1], ['conv', 3, 1, 1], ['pool', 2, 2, 1]]],
    ['small', t('SmallResNet main path (r = 49)', 'SmallResNet 主路径（r = 49）'),
      [['conv', 3, 1, 1], ['conv', 3, 1, 1], ['conv', 3, 1, 1], ['conv', 3, 2, 1], ['conv', 3, 1, 1],
        ['conv', 3, 2, 1], ['conv', 3, 1, 1], ['conv', 3, 2, 1], ['conv', 3, 1, 1]]],
    ['dil', t('dilated 1-2-4-8 (r = 31)', '空洞 1-2-4-8（r = 31）'),
      [['conv', 3, 1, 1], ['conv', 3, 1, 2], ['conv', 3, 1, 4], ['conv', 3, 1, 8]]],
    ['stem', t('ResNet stem (r = 11)', 'ResNet 起始层（r = 11）'), [['conv', 7, 2, 1], ['pool', 3, 2, 1]]]
  ]
  var KS = [1, 2, 3, 5, 7], SS = [1, 2, 3], DS = [1, 2, 4, 8], MAXL = 10

  var st = { layers: [], H: 64, erf: true, u: null, preset: 'three' }
  var model = null

  function mkLayer(a) { return { type: a[0], k: a[1], s: a[2], d: a[3], p: 0, auto: true } }
  function loadPreset(id) {
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i][0] === id) st.layers = PRESETS[i][2].map(mkLayer)
    st.u = null; st.preset = id
  }
  function autoP(ly) { var d = ly.type === 'pool' ? 1 : ly.d; return Math.floor(d * (ly.k - 1) / 2) }

  // ---------------- the maths ----------------
  function compute(layers, H, uSel) {
    var L = layers.length, rows = [], Hprev = H, r = 1, J = 1, off = 0, bad = 0
    var Js = [1], offs = [0], i
    for (i = 0; i < L; i++) {
      var ly = layers[i], d = ly.type === 'pool' ? 1 : ly.d, p = ly.auto ? autoP(ly) : ly.p
      var Hl = Math.floor((Hprev + 2 * p - d * (ly.k - 1) - 1) / ly.s) + 1
      var row = { k: ly.k, s: ly.s, d: d, p: p, Hin: Hprev, Hl: Hl, type: ly.type }
      rows.push(row)
      if (Hl < 1) { bad = i + 1; break }
      off += ((ly.k - 1) * d / 2 - p) * J
      r += (ly.k - 1) * d * J
      J *= ly.s
      row.r = r; row.J = J; row.off = off
      Js.push(J); offs.push(off)
      Hprev = Hl
    }
    if (bad) return { rows: rows, bad: bad, L: L }
    var HL = rows[L - 1].Hl
    var u = (uSel == null || uSel >= HL) ? Math.floor(HL / 2) : uSel
    var cs = new Array(L + 1), c = new Array(HL), pad = 0, padL = 0, padR = 0, prodK = 1
    for (i = 0; i < HL; i++) c[i] = 0
    c[u] = 1; cs[L] = c
    for (var l = L; l >= 1; l--) {
      var rw = rows[l - 1], n = new Array(rw.Hin)
      for (i = 0; i < rw.Hin; i++) n[i] = 0
      prodK *= rw.k
      for (var o = 0; o < rw.Hl; o++) {
        var co = c[o]
        if (co === 0) continue
        for (var tt = 0; tt < rw.k; tt++) {
          var x = o * rw.s + tt * rw.d - rw.p
          if (x < 0 || x >= rw.Hin) {
            pad += co
            if (l === 1) { if (x < 0) padL = Math.max(padL, -x); else padR = Math.max(padR, x - (H - 1)) }
          } else n[x] += co
        }
      }
      c = n; cs[l - 1] = c
    }
    var c0 = c, sum0 = 0
    for (i = 0; i < H; i++) sum0 += c0[i]
    var total = sum0 + pad
    var a = new Array(H), maxc = 0
    for (i = 0; i < H; i++) { a[i] = c0[i] / total; if (c0[i] > maxc) maxc = c0[i] }
    // which input cells does any output unit read at all
    var reach = new Array(HL)
    for (i = 0; i < HL; i++) reach[i] = true
    for (l = L; l >= 1; l--) {
      rw = rows[l - 1]
      var rn = new Array(rw.Hin)
      for (i = 0; i < rw.Hin; i++) rn[i] = false
      for (o = 0; o < rw.Hl; o++) {
        if (!reach[o]) continue
        for (tt = 0; tt < rw.k; tt++) { x = o * rw.s + tt * rw.d - rw.p; if (x >= 0 && x < rw.Hin) rn[x] = true }
      }
      reach = rn
    }
    var rL = rows[L - 1].r
    var cx = u * Js[L] + offs[L]
    var w = 2 * Math.floor(rL / 4) + 1
    var w0 = Math.floor(cx - (w - 1) / 2 + 0.5), win = 0
    for (i = Math.max(0, w0); i <= Math.min(H - 1, w0 + w - 1); i++) win += a[i]
    return { rows: rows, L: L, H: H, HL: HL, u: u, cs: cs, c0: c0, a: a, total: total, pad: pad, padL: padL, padR: padR,
      prodK: prodK, maxc: maxc, reach: reach, rL: rL, JL: rows[L - 1].J, Js: Js, offs: offs, cx: cx, w: w, w0: w0, win: win,
      onImage: sum0 / total }
  }

  // smallest set of cells holding >= level of the total 2D mass (ties included)
  function contour(m, level) {
    var a = m.a, nz = [], i, j
    for (i = 0; i < a.length; i++) if (a[i] > 0) nz.push(i)
    var vals = new Float64Array(nz.length * nz.length), q = 0
    for (i = 0; i < nz.length; i++) for (j = 0; j < nz.length; j++) vals[q++] = a[nz[i]] * a[nz[j]]
    vals.sort()
    var cum = 0, thr = -1
    for (q = vals.length - 1; q >= 0; q--) { cum += vals[q]; if (cum >= level - 1e-12) { thr = vals[q] * (1 - 1e-9); break } }
    if (thr < 0) return null
    var n = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1
    for (i = 0; i < nz.length; i++) for (j = 0; j < nz.length; j++) {
      if (a[nz[i]] * a[nz[j]] >= thr) { n++; x0 = Math.min(x0, nz[i]); x1 = Math.max(x1, nz[i]); y0 = Math.min(y0, nz[j]); y1 = Math.max(y1, nz[j]) }
    }
    return { thr: thr, n: n, bw: x1 - x0 + 1, bh: y1 - y0 + 1 }
  }

  // the part of the input shown in both views: the whole image (plus padding taps) when it is small,
  // otherwise a window around the field of the chosen unit
  function viewWindow(m) {
    var mg = Math.min(40, Math.ceil(Math.max(m.padL, m.padR)))
    var lo = -mg, hi = m.H - 1 + mg, half = Math.max(Math.ceil(m.rL * 0.75) + 2, 8)
    if (hi - lo <= 2 * half + 8) return { lo: lo, hi: hi, mg: mg, zoom: false }
    var v0 = Math.max(lo, Math.min(hi - 2 * half, Math.round(m.cx) - half))
    return { lo: v0, hi: v0 + 2 * half, mg: mg, zoom: true }
  }

  // ---------------- formatting ----------------
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
  function sci(n) {
    if (n <= 1e6) return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    var e = Math.floor(Math.log10(n)), mant = n / Math.pow(10, e)
    if (mant >= 9.995) { mant = 1; e++ }
    return mant.toFixed(2) + '×10' + String(e).split('').map(function (c) { return SUP[c] }).join('')
  }
  function pct(x) { return (100 * x).toFixed(1) + '%' }

  // ---------------- DOM ----------------
  var presetSel = h('select', { 'aria-label': S.preset })
  PRESETS.forEach(function (p) { presetSel.appendChild(h('option', { value: p[0] }, p[1])) })
  var customOpt = h('option', { value: 'custom' }, S.custom)
  presetSel.value = st.preset
  presetSel.addEventListener('change', function () {
    if (presetSel.value === 'custom') return
    loadPreset(presetSel.value); if (customOpt.parentNode) presetSel.removeChild(customOpt); buildRows(); update()
  })
  var presetCtl = h('label', { class: 'w-ctl' }, h('span', { text: S.preset }), presetSel)
  var hSlider = AIW.slider({ label: S.H, min: 8, max: 256, step: 1, value: st.H, fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { st.H = Math.round(v); update() } })
  var erfBox = AIW.checkbox(S.erf, st.erf, function (v) { st.erf = v; update() })
  var uSlider = AIW.slider({ label: S.unit, min: 0, max: 63, step: 1, value: 32, fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { st.u = Math.round(v); update() } })
  var uInput = uSlider.querySelector('input')
  var controls = h('div', { class: 'w-controls' }, presetCtl, hSlider, erfBox, uSlider)

  var tbody = h('tbody')
  var thead = h('thead', null, h('tr', null,
    h('th', { text: '#' }), h('th', { text: S.hType }), h('th', { text: 'k' }), h('th', { text: 's' }), h('th', { text: 'd' }), h('th', { text: 'p' }),
    h('th', { text: S.colHl, title: S.colHlTitle }), h('th', { text: S.colJ, title: S.colJTitle }), h('th', { text: S.colR, title: S.colRTitle }),
    h('th', { text: '' })))
  var table = h('table', { class: 'w-table rfb-table', style: { width: '100%' } }, thead, tbody)
  var tstyle = h('style', { text: '.rfb-table td,.rfb-table th{padding:.15rem .25rem!important}' })
  var tableWrap = h('div', { style: { overflowX: 'auto', marginBottom: '.5rem' } }, table)
  var addBtn = AIW.button(S.add, function () {
    if (st.layers.length >= MAXL) return
    st.layers.push(mkLayer(['conv', 3, 1, 1])); touched(); buildRows(); update()
  }, true)
  var msg = h('p', { class: 'w-note', style: { color: C.orange } })

  var svgBox = h('div', { style: { border: '1px solid ' + C.border, borderRadius: '8px', background: '#fff', overflow: 'hidden' } })
  var svg = document.createElementNS(SVGNS, 'svg')
  svg.style.display = 'block'; svg.style.cursor = 'pointer'; svg.style.width = '100%'
  svgBox.appendChild(svg)
  var legend1 = h('div', { class: 'w-legend' })
  function swatch(color, text, dash) {
    var i = h('i', { style: { background: dash ? 'transparent' : color, borderTop: dash ? '2px dashed ' + color : 'none', height: dash ? '0' : '3px' } })
    return h('span', null, i, text)
  }
  legend1.appendChild(swatch(C.blue, S.legCone)); legend1.appendChild(swatch(C.orange, S.legTop))
  legend1.appendChild(swatch(C.purple, S.legDil)); legend1.appendChild(swatch(C.muted, S.legPad, true))

  var cvHost = h('div')
  var legend2 = h('div', { class: 'w-legend' })
  function box(color, text, border) {
    return h('span', null, h('i', { style: { background: color, width: '10px', height: '10px', border: border ? '1px solid ' + border : 'none', borderRadius: '2px' } }), text)
  }
  legend2.appendChild(box('#2563EB', S.legShade)); legend2.appendChild(box('transparent', S.legField, C.orange))
  legend2.appendChild(box('transparent', S.leg50, C.navy)); legend2.appendChild(box('transparent', S.leg90, C.purple))
  legend2.appendChild(box('#FED7AA', S.legGrid)); legend2.appendChild(box('rgba(71,85,105,0.65)', S.legNever)); legend2.appendChild(box('#EEF2F7', S.legPadArea, C.muted))
  var readout = h('div', { class: 'w-readout' })
  var warn = h('p', { class: 'w-note', style: { color: C.orange, fontWeight: '600' } })

  el.appendChild(tstyle)
  el.appendChild(controls)
  el.appendChild(tableWrap)
  el.appendChild(h('div', { style: { display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' } }, addBtn, msg))
  el.appendChild(h('p', { class: 'w-note', text: S.clickHint }))
  var row2 = h('div', { class: 'w-row', style: { marginTop: '.8rem' } })
  var colA = h('div', { class: 'w-col', style: { flex: '1 1 320px' } })
  var colB = h('div', { class: 'w-col', style: { flex: '1 1 300px' } })
  colA.appendChild(h('div', { class: 'w-note', style: { marginTop: 0, marginBottom: '.3rem' }, text: S.oneD }))
  colA.appendChild(svgBox); colA.appendChild(legend1)
  colB.appendChild(h('div', { class: 'w-note', style: { marginTop: 0, marginBottom: '.3rem' }, text: S.twoD }))
  colB.appendChild(cvHost); colB.appendChild(legend2)
  row2.appendChild(colA); row2.appendChild(colB)
  el.appendChild(row2)
  el.appendChild(h('div', { style: { marginTop: '.8rem' } }, readout, warn))

  // ---------------- the layer table ----------------
  var cells = []
  function mkSel(vals, cur, fn, label) {
    var s = h('select', { 'aria-label': label, title: label, style: { padding: '.1rem 0', fontSize: '.74rem' } })
    vals.forEach(function (v) { var o = h('option', { value: v }, String(v)); if (v === cur) o.selected = true; s.appendChild(o) })
    s.addEventListener('change', function () { fn(Number(s.value)) })
    return s
  }
  function touched() { st.preset = 'custom'; if (!customOpt.parentNode) presetSel.appendChild(customOpt); presetSel.value = 'custom'; st.u = null }
  function buildRows() {
    tbody.textContent = ''; cells = []
    st.layers.forEach(function (ly, idx) {
      var typeSel = h('select', { 'aria-label': S.hType, title: S.hType, style: { padding: '.1rem 0', fontSize: '.74rem' } })
      ;[['conv', S.conv], ['pool', S.pool]].forEach(function (p) { var o = h('option', { value: p[0] }, p[1]); if (p[0] === ly.type) o.selected = true; typeSel.appendChild(o) })
      var kSel = mkSel(KS, ly.k, function (v) { ly.k = v; afterEdit() }, 'k')
      var sSel = mkSel(SS, ly.s, function (v) { ly.s = v; afterEdit() }, 's')
      var dSel = mkSel(DS, ly.d, function (v) { ly.d = v; afterEdit() }, 'd')
      var pIn = h('input', { type: 'number', min: 0, max: 20, step: 1, title: S.pTitle, 'aria-label': S.pTitle, style: { width: '2.6rem', padding: '.1rem .2rem', fontSize: '.74rem' } })
      var hl = h('td'), jl = h('td'), rl = h('td')
      function syncP() { pIn.value = String(ly.auto ? autoP(ly) : ly.p) }
      function afterEdit() { touched(); syncP(); update() }
      function syncD() { dSel.disabled = ly.type === 'pool'; dSel.value = String(ly.type === 'pool' ? 1 : ly.d) }
      typeSel.addEventListener('change', function () {
        ly.type = typeSel.value; if (ly.type === 'pool') ly.d = 1
        syncD(); afterEdit()
      })
      pIn.addEventListener('input', function () {
        if (pIn.value === '') { ly.auto = true; syncP() } else {
          var v = Math.round(Number(pIn.value))
          if (!isFinite(v)) return
          ly.auto = false; ly.p = Math.max(0, Math.min(20, v))
        }
        touched(); update()
      })
      function mv(dir) { var j = idx + dir; if (j < 0 || j >= st.layers.length) return; var tmp = st.layers[idx]; st.layers[idx] = st.layers[j]; st.layers[j] = tmp; touched(); buildRows(); update() }
      var upB = AIW.button('↑', function () { mv(-1) }, true), dnB = AIW.button('↓', function () { mv(1) }, true)
      var rmB = AIW.button('✕', function () { if (st.layers.length <= 1) return; st.layers.splice(idx, 1); touched(); buildRows(); update() }, true)
      upB.title = upB.ariaLabel = S.up; dnB.title = dnB.ariaLabel = S.down; rmB.title = rmB.ariaLabel = S.del
      ;[upB, dnB, rmB].forEach(function (b) { b.style.padding = '.05rem .35rem'; b.style.fontSize = '.72rem' })
      if (idx === 0) upB.disabled = true
      if (idx === st.layers.length - 1) dnB.disabled = true
      if (st.layers.length <= 1) rmB.disabled = true
      syncP(); syncD()
      var tr = h('tr', null, h('td', { text: String(idx + 1) }), h('td', null, typeSel), h('td', null, kSel), h('td', null, sSel), h('td', null, dSel),
        h('td', null, pIn), hl, jl, rl, h('td', { style: { whiteSpace: 'nowrap', textAlign: 'left' } }, upB, ' ', dnB, ' ', rmB))
      tbody.appendChild(tr)
      cells.push({ tr: tr, hl: hl, jl: jl, rl: rl })
    })
    addBtn.disabled = st.layers.length >= MAXL
  }

  // ---------------- 1D view (SVG) ----------------
  function se(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e }
  var geo = null, svgRoot = svg, uid = Math.floor(Math.random() * 1e9)
  function draw1D() {
    svgRoot.textContent = ''
    var m = model
    if (!m || m.bad) { svgRoot.setAttribute('height', '20'); return }
    var W = Math.max(260, svgBox.clientWidth || 520), L = m.L, gap = 32, top = 16, Hh = top + gap * L + 18
    svgRoot.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); svgRoot.setAttribute('height', Hh)
    var left = 34, right = 10, l, o, tt, x, rw, c
    var lo = m.win2.lo - 0.5, hi = m.win2.hi + 0.5
    var posF = function (ll, i) { return i * m.Js[ll] + m.offs[ll] }
    var X = function (v) { return left + (v - lo) / (hi - lo) * (W - left - right) }
    var Y = function (ll) { return top + gap * (L - ll) }
    var scale = (W - left - right) / (hi - lo)
    geo = { lo: lo, hi: hi, left: left, right: right, W: W, scale: scale }
    var defs = se('defs', {}), cp = se('clipPath', { id: 'rfb-clip-' + uid })
    cp.appendChild(se('rect', { x: left - 3, y: 0, width: W - left - right + 6, height: Hh }))
    defs.appendChild(cp); svgRoot.appendChild(defs)
    var g = se('g', { 'clip-path': 'url(#rfb-clip-' + uid + ')' })
    svgRoot.appendChild(g)
    var band = Math.max(X(-0.5), left), bandR = Math.min(X(m.H - 0.5), W - right)
    g.appendChild(se('rect', { x: band, y: 4, width: Math.max(1, bandR - band), height: Hh - 8, fill: '#F8FAFC', stroke: C.border }))
    // connections, one path per layer
    for (l = L; l >= 1; l--) {
      rw = m.rows[l - 1]; c = m.cs[l]
      var dpath = ''
      for (o = 0; o < rw.Hl; o++) {
        if (!c[o]) continue
        for (tt = 0; tt < rw.k; tt++) {
          x = o * rw.s + tt * rw.d - rw.p
          dpath += 'M' + X(posF(l, o)).toFixed(1) + ' ' + Y(l) + 'L' + X(posF(l - 1, x)).toFixed(1) + ' ' + Y(l - 1)
        }
      }
      g.appendChild(se('path', { d: dpath, stroke: rw.d > 1 ? C.purple : C.blue, 'stroke-opacity': rw.d > 1 ? '0.45' : '0.32', 'stroke-width': '1', fill: 'none' }))
    }
    // dots
    for (l = 0; l <= L; l++) {
      var n = l === 0 ? m.H : m.rows[l - 1].Hl, cc = m.cs[l]
      var rad = Math.max(0.9, Math.min(3.6, scale * m.Js[l] * 0.38))
      var inCone = '', outCone = ''
      for (o = 0; o < n; o++) {
        var cxp = X(posF(l, o)), s = cxp.toFixed(1) + ' ' + Y(l)
        if (cc[o]) inCone += 'M' + s + 'm-' + rad.toFixed(1) + ' 0a' + rad.toFixed(1) + ' ' + rad.toFixed(1) + ' 0 1 0 ' + (2 * rad).toFixed(1) + ' 0a' + rad.toFixed(1) + ' ' + rad.toFixed(1) + ' 0 1 0 -' + (2 * rad).toFixed(1) + ' 0'
        else outCone += 'M' + s + 'm-' + rad.toFixed(1) + ' 0a' + rad.toFixed(1) + ' ' + rad.toFixed(1) + ' 0 1 0 ' + (2 * rad).toFixed(1) + ' 0a' + rad.toFixed(1) + ' ' + rad.toFixed(1) + ' 0 1 0 -' + (2 * rad).toFixed(1) + ' 0'
      }
      g.appendChild(se('path', { d: outCone, fill: '#CBD5E1' }))
      g.appendChild(se('path', { d: inCone, fill: C.blue }))
      var tx = se('text', { x: 4, y: Y(l) + 4, fill: C.slate, 'font-size': '10', 'font-family': 'DM Mono, Consolas, monospace' })
      tx.textContent = l === 0 ? '0' : String(l)
      svgRoot.appendChild(tx)
    }
    // padding taps (hollow)
    for (l = L; l >= 1; l--) {
      rw = m.rows[l - 1]; c = m.cs[l]
      var seen = {}
      for (o = 0; o < rw.Hl; o++) {
        if (!c[o]) continue
        for (tt = 0; tt < rw.k; tt++) {
          x = o * rw.s + tt * rw.d - rw.p
          if ((x < 0 || x >= rw.Hin) && !seen[x]) { seen[x] = 1; g.appendChild(se('circle', { cx: X(posF(l - 1, x)).toFixed(1), cy: Y(l - 1), r: '2.6', fill: '#fff', stroke: C.muted, 'stroke-dasharray': '1.5 1.5' })) }
        }
      }
    }
    // the chosen unit
    g.appendChild(se('circle', { cx: X(posF(L, m.u)).toFixed(1), cy: Y(L), r: '5', fill: C.orange, stroke: '#fff', 'stroke-width': '1.5' }))
  }
  svg.addEventListener('click', function (ev) {
    if (!model || model.bad || !geo) return
    var rect = svg.getBoundingClientRect(), px = (ev.clientX - rect.left) * (geo.W / rect.width)
    var v = geo.lo + (px - geo.left) / geo.scale
    var o = Math.round((v - model.offs[model.L]) / model.Js[model.L])
    st.u = Math.max(0, Math.min(model.HL - 1, o)); update()
  })

  // ---------------- 2D view (canvas) ----------------
  var cv = AIW.canvas(cvHost, { aspect: 1, maxHeight: 420 }, function (ctx, w, hgt) {
    var m = model
    if (!m || m.bad) return
    var H = m.H, vw = m.win2, vlo = vw.lo, N = vw.hi - vw.lo + 1
    var side = Math.min(w, hgt) - 4, cs = side / N, ox = (w - side) / 2, oy = 2
    var gx = function (x) { return ox + (x - vlo) * cs }, gy = function (y) { return oy + (y - vlo) * cs }
    ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, side, side); ctx.clip()
    // padding margin, hatched
    if (vw.mg > 0) {
      ctx.fillStyle = '#EEF2F7'; ctx.fillRect(ox, oy, side, side)
      ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.beginPath()
      for (var q = -side; q < side; q += 7) { ctx.moveTo(ox + q, oy + side); ctx.lineTo(ox + q + side, oy) }
      ctx.stroke(); ctx.globalAlpha = 1
    }
    ctx.fillStyle = '#fff'; ctx.fillRect(gx(0), gy(0), H * cs, H * cs)
    var a = m.a, vmax = 0, i, j
    for (i = 0; i < H; i++) if (a[i] > vmax) vmax = a[i]
    vmax = vmax * vmax
    var ex = cs < 1 ? 0.6 : 0
    var cl = m.cx - (m.rL - 1) / 2, cr = m.cx + (m.rL - 1) / 2
    var i0 = Math.max(0, vw.lo), i1 = Math.min(H - 1, vw.hi)
    for (i = i0; i <= i1; i++) {
      for (j = i0; j <= i1; j++) {
        var v = a[i] * a[j], inField = i >= cl - 1e-9 && i <= cr + 1e-9 && j >= cl - 1e-9 && j <= cr + 1e-9
        if (v > 0) {
          ctx.fillStyle = st.erf ? 'rgba(37,99,235,' + (0.12 + 0.88 * v / vmax).toFixed(3) + ')' : 'rgba(37,99,235,0.55)'
        } else if (!(m.reach[i] && m.reach[j])) ctx.fillStyle = 'rgba(71,85,105,0.65)'
        else if (inField) ctx.fillStyle = '#FED7AA'
        else continue
        ctx.fillRect(gx(i), gy(j), cs + ex, cs + ex)
      }
    }
    if (cs >= 5) {
      ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.lineWidth = 1; ctx.beginPath()
      for (i = i0; i <= i1 + 1; i++) { ctx.moveTo(gx(i), gy(i0)); ctx.lineTo(gx(i), gy(i1 + 1)); ctx.moveTo(gx(i0), gy(i)); ctx.lineTo(gx(i1 + 1), gy(i)) }
      ctx.stroke()
    }
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(gx(0), gy(0), H * cs, H * cs)
    // contours
    var drawC = function (info, color, dash) {
      if (!info) return
      var inside = function (x, y) { return x >= 0 && y >= 0 && x < H && y < H && a[x] * a[y] >= info.thr }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath()
      var nz = []; for (i = 0; i < H; i++) if (a[i] > 0) nz.push(i)
      nz.forEach(function (x) { nz.forEach(function (y) {
        if (!inside(x, y)) return
        if (!inside(x - 1, y)) { ctx.moveTo(gx(x), gy(y)); ctx.lineTo(gx(x), gy(y + 1)) }
        if (!inside(x + 1, y)) { ctx.moveTo(gx(x + 1), gy(y)); ctx.lineTo(gx(x + 1), gy(y + 1)) }
        if (!inside(x, y - 1)) { ctx.moveTo(gx(x), gy(y)); ctx.lineTo(gx(x + 1), gy(y)) }
        if (!inside(x, y + 1)) { ctx.moveTo(gx(x), gy(y + 1)); ctx.lineTo(gx(x + 1), gy(y + 1)) }
      }) })
      ctx.stroke(); ctx.setLineDash([])
    }
    drawC(m.c90, C.purple, [4, 3]); drawC(m.c50, C.navy, [])
    // theoretical field
    ctx.strokeStyle = C.orange; ctx.lineWidth = 2
    ctx.strokeRect(gx(cl), gy(cl), m.rL * cs, m.rL * cs)
    ctx.restore()
  })

  // ---------------- update ----------------
  function update() {
    model = compute(st.layers, st.H, st.u)
    var i
    // table
    for (i = 0; i < cells.length; i++) {
      var c = cells[i], rw = model.rows[i]
      c.tr.style.background = (!model.bad && i === cells.length - 1) ? C.skyLight : (model.bad === i + 1 ? '#FEE2E2' : 'none')
      if (!rw) { c.hl.textContent = '–'; c.jl.textContent = '–'; c.rl.textContent = '–'; continue }
      c.hl.textContent = String(rw.Hl)
      c.jl.textContent = rw.J != null ? String(rw.J) : '–'
      c.rl.textContent = rw.r != null ? String(rw.r) : '–'
    }
    msg.textContent = model.bad ? S.noOut(model.bad) : ''
    if (model.bad) {
      readout.textContent = S.noOutBody; warn.textContent = ''
      draw1D(); cv.redraw(); return
    }
    var m = model
    // output-unit slider range
    uInput.max = String(m.HL - 1); uSlider.set(m.u)
    m.c50 = contour(m, 0.5); m.c90 = contour(m, 0.9); m.win2 = viewWindow(m)
    var axisShare = m.win, lines = []
    lines.push(S.rl + ' = ' + m.rL + ' × ' + m.rL + '    ' + S.jl + ' = ' + m.JL + '    (H_L = ' + m.HL + ', u = ' + m.u + ')')
    lines.push(S.paths + ' = ' + sci(m.prodK))
    var nzc = m.c0.filter(function (v) { return v > 0 })
    if (nzc.length <= 15) lines.push(S.counts + ': ' + nzc.map(function (v) { return String(v) }).join(' ') + '  (' + t('of ', '共 ') + sci(m.total) + ')')
    lines.push(S.central(m.w) + ': ' + S.centralVal(pct(axisShare * axisShare), pct(axisShare)))
    lines.push(S.padMass + ': ' + pct(1 - m.onImage * m.onImage))
    lines.push(m.c50 ? S.half(50) + ' ' + S.cells(m.c50.n, m.c50.bw, m.c50.bh) : S.halfNo(50))
    lines.push(m.c90 ? S.half(90) + ' ' + S.cells(m.c90.n, m.c90.bw, m.c90.bh) : S.halfNo(90))
    if (m.win2.zoom) lines.push(S.zoomed(m.win2.lo, m.win2.hi, m.H - 1))
    readout.textContent = lines.join('\n')
    warn.textContent = m.rL > m.H ? S.warn(m.rL, m.H) : ''
    draw1D(); cv.redraw()
  }
  if (window.ResizeObserver) new ResizeObserver(function () { if (model && !model.bad) draw1D() }).observe(svgBox)

  loadPreset('three'); buildRows(); update()
})
