/* convolution-explorer — Module 03 "Convolutional networks", section s2 "Convolution".
 *
 * One output value is one multiply-accumulate of the kernel with one window of the input.
 *   Xp = X zero-padded by p on every side;
 *   K' = K flipped in both axes (K'[u][v] = K[2-u][2-v]) if "flip" is ticked, else K (k = 3);
 *   Y[i][j] = sum_{u,v=0..2} K'[u][v] * Xp[i*s + u*d][j*s + v*d];
 *   H_out = floor((H + 2p - d(k-1) - 1)/s) + 1, and the same for the width.
 * The whole output is recomputed on every change and revealed in row-major order up to the current
 * window. Without the flip this is cross-correlation, which is what deep-learning libraries call
 * convolution; with it, true convolution, so every value of the symmetric-looking examples changes sign
 * for an antisymmetric kernel such as the s2 edge detector.
 */
AIW.register('convolution-explorer', function (el, opts) {
  var tr = AIW.t, h = AIW.h
  var NS = 'http://www.w3.org/2000/svg'
  var K = 3
  var uid = 'cvx' + Math.floor(Math.random() * 1e9).toString(36)

  // ---- data ----
  var WORKED = [[1, 2, 0, 1, 3], [0, 1, 3, 2, 1], [2, 0, 1, 4, 0], [1, 3, 2, 0, 1], [0, 1, 1, 2, 2]]
  function make12(f) { var m = []; for (var r = 0; r < 12; r++) { var row = []; for (var c = 0; c < 12; c++) row.push(f(r, c)); m.push(row) } return m }
  var IMAGES = {
    worked: WORKED,
    letterF: make12(function (r, c) { return ((r >= 2 && r <= 9 && c >= 3 && c <= 4) || (r >= 2 && r <= 3 && c >= 3 && c <= 9) || (r >= 5 && r <= 6 && c >= 3 && c <= 7)) ? 8 : 1 }),
    step: make12(function (r, c) { return c < 6 ? 2 : 8 }),
    diag: make12(function (r, c) { return (c === r || c === r + 1) ? 8 : 0 }),
    checker: make12(function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 2)) % 2 === 0 ? 8 : 0 })
  }
  var IMAGE_OPTIONS = [
    ['worked', tr('Worked example (5×5)', '例题（5×5）')],
    ['letterF', tr('Letter F (12×12)', '字母 F（12×12）')],
    ['step', tr('Step edge (12×12)', '阶跃边缘（12×12）')],
    ['diag', tr('Diagonal line (12×12)', '对角线（12×12）')],
    ['checker', tr('Checkerboard (12×12)', '棋盘格（12×12）')]
  ]
  var KERNELS = {
    identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    box: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9],
    gauss: [1 / 16, 2 / 16, 1 / 16, 2 / 16, 4 / 16, 2 / 16, 1 / 16, 2 / 16, 1 / 16],
    sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    sobelx: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
    sobely: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
    laplace: [0, 1, 0, 1, -4, 1, 0, 1, 0],
    edge: [1, 0, -1, 1, 0, -1, 1, 0, -1]
  }
  var KERNEL_OPTIONS = [
    ['identity', tr('Identity', '恒等')],
    ['box', tr('Box blur', '均值模糊')],
    ['gauss', tr('Gaussian blur', '高斯模糊')],
    ['sharpen', tr('Sharpen', '锐化')],
    ['sobelx', tr('Sobel-x (vertical edges)', 'Sobel-x（竖直边缘）')],
    ['sobely', tr('Sobel-y (horizontal edges)', 'Sobel-y（水平边缘）')],
    ['laplace', tr('Laplacian', '拉普拉斯')],
    ['edge', tr('Edge [1, 0, −1] × 3 (the s2 example)', '边缘 [1, 0, −1] × 3（s2 的例子）')],
    ['custom', tr('Custom', '自定义')]
  ]

  // ---- state ----
  function pick(v, list, d) { return list.indexOf(v) >= 0 ? v : d }
  var st = {
    img: pick(opts.image, Object.keys(IMAGES), 'worked'),
    preset: pick(opts.kernel, Object.keys(KERNELS).concat(['custom']), 'edge'),
    w: null, flip: false, p: 0, s: 1, d: 1, cur: 0, playing: false, nums: true
  }
  st.w = (KERNELS[st.preset] || KERNELS.edge).slice()
  var timer = null
  var M = null           // model computed by compute()

  // ---- formatting ----
  function minus(s) { return String(s).replace(/-/g, '−') }
  function f3(x) {                         // 3 significant figures, trailing zeros dropped; 1/9 -> 0.111
    if (!isFinite(x)) return '—'
    var v = Number(x.toPrecision(3))
    if (Math.abs(v) < 1e-9) v = 0
    return minus(String(v))
  }
  function paren(x) { return '(' + f3(x) + ')' }

  // ---- computation ----
  function compute() {
    var X = IMAGES[st.img], H = X.length, W = X[0].length, p = st.p, s = st.s, d = st.d
    var Hp = H + 2 * p, Wp = W + 2 * p
    var Xp = []
    for (var i = 0; i < Hp; i++) {
      var row = []
      for (var j = 0; j < Wp; j++) {
        var a = i - p, b = j - p
        row.push(a >= 0 && a < H && b >= 0 && b < W ? X[a][b] : 0)
      }
      Xp.push(row)
    }
    var Kp = []
    for (var u = 0; u < K; u++) for (var v = 0; v < K; v++) Kp.push(st.flip ? st.w[(K - 1 - u) * K + (K - 1 - v)] : st.w[u * K + v])
    var numH = H + 2 * p - d * (K - 1) - 1, numW = W + 2 * p - d * (K - 1) - 1
    var Ho = Math.floor(numH / s) + 1, Wo = Math.floor(numW / s) + 1
    var Y = [], maxAbs = 0, valid = Ho >= 1 && Wo >= 1
    if (valid) {
      for (var i2 = 0; i2 < Ho; i2++) {
        var yr = []
        for (var j2 = 0; j2 < Wo; j2++) {
          var acc = 0
          for (var u2 = 0; u2 < K; u2++) for (var v2 = 0; v2 < K; v2++) acc += Kp[u2 * K + v2] * Xp[i2 * s + u2 * d][j2 * s + v2 * d]
          yr.push(acc)
          if (Math.abs(acc) > maxAbs) maxAbs = Math.abs(acc)
        }
        Y.push(yr)
      }
    }
    var imax = 1
    for (var a2 = 0; a2 < H; a2++) for (var b2 = 0; b2 < W; b2++) if (X[a2][b2] > imax) imax = X[a2][b2]
    return { X: X, H: H, W: W, Xp: Xp, Hp: Hp, Wp: Wp, Kp: Kp, numH: numH, numW: numW, Ho: Ho, Wo: Wo, Y: Y,
      maxAbs: maxAbs > 0 ? maxAbs : 1, valid: valid, n: valid ? Ho * Wo : 0, imax: imax }
  }

  // ---- svg helpers ----
  function S(tag, attrs, style, text) {
    var e = document.createElementNS(NS, tag)
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k])
    if (style) e.setAttribute('style', style)
    if (text != null) e.textContent = text
    return e
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild) }
  function grey(v, vmax) { var g = Math.round(255 - 215 * (v / vmax)); return 'rgb(' + g + ',' + g + ',' + g + ')' }
  function diverge(v, m) {                 // blue negative, white zero, red positive
    var t = Math.max(-1, Math.min(1, v / m)), a = Math.abs(t)
    var c = t >= 0 ? [220, 38, 38] : [37, 99, 235]
    return 'rgb(' + Math.round(255 + (c[0] - 255) * a) + ',' + Math.round(255 + (c[1] - 255) * a) + ',' + Math.round(255 + (c[2] - 255) * a) + ')'
  }
  function darkBg(rgb) { var m = rgb.match(/\d+/g); return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) < 140 }
  function cellText(svg, x, y, cs, str, fill) {
    var fs = Math.min(cs * 0.42, 0.88 * cs / (0.62 * Math.max(str.length, 1)), 13)
    svg.appendChild(S('text', { x: x + cs / 2, y: y + cs / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs.toFixed(1),
      'font-family': 'DM Mono, Consolas, monospace' }, 'fill:' + fill + ';pointer-events:none', str))
  }
  var ACC = 'var(--orange, #C2410C)'

  // ---- DOM ----
  var imageSel = AIW.select({ label: tr('Input image', '输入图像'), options: IMAGE_OPTIONS, value: st.img, onChange: function (v) { st.img = v; resetStep() } })
  var kernelSel = AIW.select({ label: tr('Kernel preset', '卷积核预设'), options: KERNEL_OPTIONS, value: st.preset, onChange: function (v) {
    st.preset = v
    if (v !== 'custom') { st.w = KERNELS[v].slice(); syncInputs() }
    resetStep()
  } })
  var kernelSelEl = kernelSel.querySelector('select')

  var inputs = []
  var matrix = h('div', { class: 'w-matrix', style: { gridTemplateColumns: 'repeat(3, auto)', alignSelf: 'flex-start' } })
  for (var q = 0; q < 9; q++) (function (idx) {
    var inp = h('input', { type: 'number', step: 'any', 'aria-label': tr('Kernel weight', '卷积核权重') + ' [' + Math.floor(idx / 3) + ',' + (idx % 3) + ']' })
    var upd = function () {
      var v = parseFloat(inp.value)
      if (!isFinite(v)) return
      if (st.w[idx] !== v) { st.w[idx] = v; st.preset = 'custom'; kernelSelEl.value = 'custom'; resetStep() }
    }
    inp.addEventListener('input', upd); inp.addEventListener('change', upd)
    inputs.push(inp); matrix.appendChild(inp)
  })(q)
  var normBtn = AIW.button(tr('Normalise to sum 1', '归一化使和为 1'), function () {
    var sum = wsum()
    if (Math.abs(sum) < 1e-12) return
    st.w = st.w.map(function (x) { return x / sum })
    st.preset = 'custom'; kernelSelEl.value = 'custom'
    syncInputs(); resetStep()
  }, true)
  function wsum() { return st.w.reduce(function (a, b) { return a + b }, 0) }
  function syncInputs() { for (var i = 0; i < 9; i++) inputs[i].value = String(Number(st.w[i].toPrecision(3))) }

  var kpBox = h('div', { class: 'w-readout', style: { padding: '.35rem .6rem', display: 'inline-block' } })
  var flipBox = AIW.checkbox(tr('Flip the kernel (true convolution instead of cross-correlation)', '翻转卷积核（真卷积，而非互相关）'), false, function (v) { st.flip = v; resetStep() })
  var pSl = AIW.slider({ label: tr('Padding p', '填充 p'), min: 0, max: 3, step: 1, value: 0, fmt: function (v) { return String(Math.round(v)) }, onInput: function (v) { st.p = Math.round(v); resetStep() } })
  var sSl = AIW.slider({ label: tr('Stride s', '步长 s'), min: 1, max: 3, step: 1, value: 1, fmt: function (v) { return String(Math.round(v)) }, onInput: function (v) { st.s = Math.round(v); resetStep() } })
  var dSl = AIW.slider({ label: tr('Dilation d', '空洞 d'), min: 1, max: 3, step: 1, value: 1, fmt: function (v) { return String(Math.round(v)) }, onInput: function (v) { st.d = Math.round(v); resetStep() } })
  var prevBtn = AIW.button(tr('◀ Previous step', '◀ 上一步'), function () { stopPlay(); go(st.cur - 1) }, true)
  var nextBtn = AIW.button(tr('Next step ▶', '下一步 ▶'), function () { stopPlay(); go(st.cur + 1) })
  var playBtn = AIW.button(tr('Play', '播放'), function () { st.playing ? stopPlay() : startPlay() }, true)
  var resetBtn = AIW.button(tr('Reset', '重置'), function () { stopPlay(); go(0) }, true)
  var numsBox = AIW.checkbox(tr('Show numbers (untick for colours only)', '显示数值（取消勾选则只显示颜色）'), true, function (v) { st.nums = v; render() })

  var inSvg = S('svg', { role: 'img', tabindex: '0', 'aria-label': tr('Input with padding and the current window', '带填充的输入与当前窗口') }, 'width:100%;height:auto;display:block;outline-offset:2px')
  var outSvg = S('svg', { role: 'img', tabindex: '0', 'aria-label': tr('Output, filled in as the window moves', '输出，随窗口移动逐步填充') }, 'width:100%;height:auto;display:block;outline-offset:2px')
  var imgSvg = S('svg', { role: 'img', 'aria-label': tr('Whole input and whole output as images', '完整输入与完整输出的图像') }, 'width:100%;height:auto;display:block;max-width:460px')
  var macBox = h('div', { class: 'w-readout' })
  var sizeBox = h('div', { class: 'w-readout' })
  var inTitle = h('div', { class: 'w-note', style: { marginTop: 0, fontWeight: '600', color: 'var(--navy)' } })
  var outTitle = h('div', { class: 'w-note', style: { marginTop: 0, fontWeight: '600', color: 'var(--navy)' } })
  var legend = h('div', { class: 'w-note' })

  var kernelCtl = h('div', { class: 'w-ctl' },
    h('span', { text: tr('Kernel weights K (3×3; editing one switches the preset to custom)', '卷积核权重 K（3×3；修改任一权重即切换为自定义）') }),
    matrix, h('div', { style: { marginTop: '.35rem' } }, normBtn))
  var usedCtl = h('div', { class: 'w-ctl' }, h('span', { text: tr('Kernel as used', '实际使用的卷积核') }), kpBox)

  el.appendChild(h('div', { class: 'w-controls' }, imageSel, kernelSel))
  el.appendChild(h('div', { class: 'w-controls' }, kernelCtl, usedCtl))
  el.appendChild(h('div', { class: 'w-controls' }, flipBox, pSl, sSl, dSl))
  el.appendChild(h('div', { class: 'w-controls', style: { alignItems: 'center' } }, prevBtn, nextBtn, playBtn, resetBtn, numsBox))
  el.appendChild(h('div', { class: 'w-row' },
    h('div', { class: 'w-col' }, inTitle, inSvg),
    h('div', { class: 'w-col' }, outTitle, outSvg)))
  el.appendChild(legend)
  el.appendChild(h('div', { style: { marginTop: '.7rem' } }, macBox))
  el.appendChild(h('div', { style: { marginTop: '.5rem' } }, sizeBox))
  el.appendChild(h('div', { class: 'w-note', style: { fontWeight: '600', color: 'var(--navy)', marginTop: '.8rem' }, text: tr('Whole input and whole output, at equal pixel size', '完整输入与完整输出（像素尺寸相同）') }))
  el.appendChild(imgSvg)

  // ---- stepping ----
  function stopPlay() { st.playing = false; if (timer) { clearTimeout(timer); timer = null } playBtn.textContent = tr('Play', '播放') }
  function tick() {
    timer = null
    if (!st.playing) return
    if (st.cur >= M.n - 1) { stopPlay(); return }
    st.cur++; render()
    if (st.cur >= M.n - 1) stopPlay(); else timer = setTimeout(tick, 400)
  }
  function startPlay() {
    if (!M.valid) return
    if (st.cur >= M.n - 1) st.cur = 0
    st.playing = true; playBtn.textContent = tr('Pause', '暂停'); render()
    timer = setTimeout(tick, 400)
  }
  function go(i) { if (!M.valid) return; st.cur = Math.max(0, Math.min(M.n - 1, i)); render() }
  function resetStep() { stopPlay(); st.cur = 0; render() }

  el.addEventListener('keydown', function (e) {
    var t = e.target && e.target.tagName
    if (t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA') return
    if (e.key === 'ArrowRight') { e.preventDefault(); stopPlay(); go(st.cur + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stopPlay(); go(st.cur - 1) }
  })

  // ---- drawing ----
  function drawInput() {
    clear(inSvg)
    var cs = 400 / Math.max(M.Wp, M.Hp), W = cs * M.Wp, Hh = cs * M.Hp
    inSvg.setAttribute('viewBox', '0 0 ' + W.toFixed(1) + ' ' + Hh.toFixed(1))
    var pid = uid + 'hatch'
    var defs = S('defs')
    var pat = S('pattern', { id: pid, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' })
    pat.appendChild(S('rect', { width: 6, height: 6 }, 'fill:var(--code-bg, #F1F5F9)'))
    pat.appendChild(S('line', { x1: 0, y1: 0, x2: 0, y2: 6, 'stroke-width': 1.6 }, 'stroke:var(--muted, #94A3B8)'))
    defs.appendChild(pat); inSvg.appendChild(defs)
    var p = st.p
    for (var i = 0; i < M.Hp; i++) for (var j = 0; j < M.Wp; j++) {
      var pad = i < p || i >= p + M.H || j < p || j >= p + M.W
      var x = j * cs, y = i * cs, v = M.Xp[i][j]
      var fill = pad ? 'url(#' + pid + ')' : grey(v, M.imax)
      inSvg.appendChild(S('rect', { x: x, y: y, width: cs, height: cs }, 'fill:' + fill + ';stroke:var(--border, #E2E8F0);stroke-width:0.8'))
      if (st.nums) cellText(inSvg, x, y, cs, f3(v), pad ? 'var(--slate, #475569)' : (darkBg(grey(v, M.imax)) ? '#fff' : '#0F172A'))
    }
    if (p > 0) inSvg.appendChild(S('rect', { x: p * cs, y: p * cs, width: M.W * cs, height: M.H * cs, fill: 'none', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, 'stroke:var(--slate, #475569)'))
    if (M.valid) {
      var ci = Math.floor(st.cur / M.Wo), cj = st.cur % M.Wo
      var r0 = ci * st.s, c0 = cj * st.s, ext = st.d * (K - 1) + 1
      // cells inside the window's extent that are skipped by dilation
      for (var a = 0; a < ext; a++) for (var b = 0; b < ext; b++) {
        if (a % st.d === 0 && b % st.d === 0) continue
        inSvg.appendChild(S('rect', { x: (c0 + b) * cs, y: (r0 + a) * cs, width: cs, height: cs }, 'fill:var(--white, #fff);fill-opacity:0.55;stroke:none'))
      }
      inSvg.appendChild(S('rect', { x: c0 * cs, y: r0 * cs, width: ext * cs, height: ext * cs, fill: 'none', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, 'stroke:' + ACC))
      for (var u = 0; u < K; u++) for (var v2 = 0; v2 < K; v2++)
        inSvg.appendChild(S('rect', { x: (c0 + v2 * st.d) * cs + 1.2, y: (r0 + u * st.d) * cs + 1.2, width: cs - 2.4, height: cs - 2.4, fill: 'none', 'stroke-width': 2.4, rx: 2 }, 'stroke:' + ACC))
    }
  }

  function drawOutput() {
    clear(outSvg)
    if (!M.valid) {
      outSvg.setAttribute('viewBox', '0 0 400 120')
      outSvg.appendChild(S('rect', { x: 1, y: 1, width: 398, height: 118, rx: 8, fill: 'none', 'stroke-dasharray': '5 4' }, 'stroke:var(--muted, #94A3B8)'))
      outSvg.appendChild(S('text', { x: 200, y: 60, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 15 }, 'fill:var(--red, #DC2626)', tr('No valid window: the kernel does not fit.', '没有有效窗口：卷积核放不进输入。')))
      return
    }
    var cs = 400 / Math.max(M.Wo, M.Ho, 5), W = cs * M.Wo, Hh = cs * M.Ho
    outSvg.setAttribute('viewBox', '0 0 ' + W.toFixed(1) + ' ' + Hh.toFixed(1))
    for (var i = 0; i < M.Ho; i++) for (var j = 0; j < M.Wo; j++) (function (i, j) {
      var idx = i * M.Wo + j, x = j * cs, y = i * cs
      var shown = idx <= st.cur
      var r = S('rect', { x: x, y: y, width: cs, height: cs, 'data-idx': idx }, 'cursor:pointer;stroke-width:0.8;' + (shown
        ? 'fill:' + diverge(M.Y[i][j], M.maxAbs) + ';stroke:var(--border, #E2E8F0)'
        : 'fill:var(--white, #fff);stroke:var(--muted, #94A3B8);stroke-dasharray:2 2'))
      r.addEventListener('click', function () { stopPlay(); go(idx) })
      outSvg.appendChild(r)
      if (shown && st.nums) { var c = diverge(M.Y[i][j], M.maxAbs); cellText(outSvg, x, y, cs, f3(M.Y[i][j]), Math.abs(M.Y[i][j]) / M.maxAbs > 0.6 ? '#fff' : '#0F172A') }
    })(i, j)
    var ci = Math.floor(st.cur / M.Wo), cj = st.cur % M.Wo
    outSvg.appendChild(S('rect', { x: cj * cs + 1.2, y: ci * cs + 1.2, width: cs - 2.4, height: cs - 2.4, fill: 'none', 'stroke-width': 2.6, rx: 2, 'pointer-events': 'none' }, 'stroke:' + ACC))
  }

  function drawImages() {
    clear(imgSvg)
    var S0 = 190, gap = 20
    imgSvg.setAttribute('viewBox', '0 0 ' + (2 * S0 + gap) + ' ' + (S0 + 22))
    var cw = S0 / M.W, ch = S0 / M.H
    for (var i = 0; i < M.H; i++) for (var j = 0; j < M.W; j++)
      imgSvg.appendChild(S('rect', { x: j * cw, y: i * ch + 20, width: cw + 0.4, height: ch + 0.4 }, 'fill:' + grey(M.X[i][j], M.imax)))
    imgSvg.appendChild(S('rect', { x: 0, y: 20, width: S0, height: S0, fill: 'none' }, 'stroke:var(--muted, #94A3B8)'))
    imgSvg.appendChild(S('text', { x: 0, y: 12, 'font-size': 12, 'font-weight': 600 }, 'fill:var(--navy, #1A2E4A)', tr('Input ', '输入 ') + M.H + '×' + M.W))
    var ox = S0 + gap
    imgSvg.appendChild(S('text', { x: ox, y: 12, 'font-size': 12, 'font-weight': 600 }, 'fill:var(--navy, #1A2E4A)',
      M.valid ? tr('Output ', '输出 ') + M.Ho + '×' + M.Wo : tr('Output: none', '输出：无')))
    if (M.valid) {
      var ow = S0 / M.Wo, oh = S0 / M.Ho
      for (var a = 0; a < M.Ho; a++) for (var b = 0; b < M.Wo; b++)
        imgSvg.appendChild(S('rect', { x: ox + b * ow, y: a * oh + 20, width: ow + 0.4, height: oh + 0.4 }, 'fill:' + diverge(M.Y[a][b], M.maxAbs)))
      var ci = Math.floor(st.cur / M.Wo), cj = st.cur % M.Wo
      imgSvg.appendChild(S('rect', { x: ox + cj * ow, y: ci * oh + 20, width: ow, height: oh, fill: 'none', 'stroke-width': 1.5 }, 'stroke:' + ACC))
    }
    imgSvg.appendChild(S('rect', { x: ox, y: 20, width: S0, height: S0, fill: 'none' }, 'stroke:var(--muted, #94A3B8)'))
  }

  function sizeLine(sym, base, num, out) {
    return sym + '_out = ⌊(' + sym + ' + 2p − d(k − 1) − 1)/s⌋ + 1 = ⌊(' + base + ' + 2·' + st.p + ' − ' + st.d + '·(' + K + ' − 1) − 1)/' + st.s + '⌋ + 1 = ⌊' + minus(num) + '/' + st.s + '⌋ + 1 = ' + minus(out)
  }
  function updateText() {
    var i = Math.floor(st.cur / Math.max(M.Wo, 1)), j = st.cur % Math.max(M.Wo, 1)
    // multiply-accumulate
    var lines = []
    if (M.valid) {
      var terms = [], prods = [], sum = 0
      for (var u = 0; u < K; u++) for (var v = 0; v < K; v++) {
        var kv = M.Kp[u * K + v], xv = M.Xp[i * st.s + u * st.d][j * st.s + v * st.d]
        terms.push(paren(kv) + paren(xv)); prods.push(f3(kv * xv)); sum += kv * xv
      }
      lines.push('Y[' + i + ',' + j + '] = ' + terms.join(' + '))
      lines.push('       = ' + prods.join(' + '))
      lines.push('       = ' + f3(sum))
      lines.push(tr('Window rows ', '窗口行 ') + (i * st.s) + (st.d > 1 ? ', ' + (i * st.s + st.d) + ', ' + (i * st.s + 2 * st.d) : '–' + (i * st.s + 2)) +
        tr(', columns ', '，列 ') + (j * st.s) + (st.d > 1 ? ', ' + (j * st.s + st.d) + ', ' + (j * st.s + 2 * st.d) : '–' + (j * st.s + 2)) +
        tr(' of the padded input; position ', '（填充后输入的坐标）；位置 ') + (st.cur + 1) + tr(' of ', ' / 共 ') + M.n + tr('.', '。'))
    } else lines.push(tr('No valid window, so there is nothing to multiply.', '没有有效窗口，因此无需做乘加。'))
    macBox.textContent = lines.join('\n')
    // output size
    var sl = [sizeLine('H', M.H, M.numH, M.Ho), sizeLine('W', M.W, M.numW, M.Wo)]
    if (!M.valid) sl.push(tr('H_out < 1 or W_out < 1: no valid window.', 'H_out < 1 或 W_out < 1：没有有效窗口。'))
    else {
      sl.push(tr('Output: ', '输出：') + M.Ho + ' × ' + M.Wo + tr(' (input ', '（输入 ') + M.H + ' × ' + M.W + tr(', padded ', '，填充后 ') + M.Hp + ' × ' + M.Wp + tr(')', '）'))
      var rr = M.numH % st.s, rc = M.numW % st.s
      if (rr > 0) sl.push(tr('Rows: the last ' + rr + ' row' + (rr > 1 ? 's' : '') + ' of the padded input are never read (' + M.numH + ' is not divisible by ' + st.s + ').',
        '行：填充后输入的最后 ' + rr + ' 行永远不会被读到（' + M.numH + ' 不能被 ' + st.s + ' 整除）。'))
      if (rc > 0) sl.push(tr('Columns: the last ' + rc + ' column' + (rc > 1 ? 's' : '') + ' of the padded input are never read (' + M.numW + ' is not divisible by ' + st.s + ').',
        '列：填充后输入的最后 ' + rc + ' 列永远不会被读到（' + M.numW + ' 不能被 ' + st.s + ' 整除）。'))
    }
    sizeBox.textContent = sl.join('\n')
    // kernel as used
    var kt = ''
    for (var a = 0; a < K; a++) { kt += (a ? '\n' : ''); var cells = []; for (var b = 0; b < K; b++) cells.push(f3(M.Kp[a * K + b])); kt += cells.map(function (c) { return ('        ' + c).slice(-7) }).join(' ') }
    kpBox.textContent = kt
    usedCtl.querySelector('span').textContent = st.flip ? tr('Kernel as used (flipped in both axes)', '实际使用的卷积核（两个方向都已翻转）') : tr('Kernel as used (not flipped)', '实际使用的卷积核（未翻转）')
    inTitle.textContent = tr('Input X, zero-padded (', '输入 X，零填充（') + M.Hp + '×' + M.Wp + tr(')', '）')
    outTitle.textContent = tr('Output Y, filled in as the window moves', '输出 Y，随窗口移动逐步填充')
    legend.textContent = tr('Orange outlines: the nine cells the kernel reads (faded cells in between are skipped by dilation). Hatched cells are zero padding. Output colours: blue negative, white zero, red positive, scaled by the largest |value| of the full output (' + f3(M.maxAbs) + '). Click an output cell, or use the left and right arrow keys.',
      '橙色轮廓：卷积核读取的 9 个格子（中间变淡的格子被空洞跳过）。斜线格是零填充。输出颜色：蓝色为负，白色为零，红色为正，按完整输出中最大的 |值|（' + f3(M.maxAbs) + '）缩放。点击输出格，或用左右方向键。')
  }

  function render() {
    M = compute()
    if (st.cur > M.n - 1) st.cur = Math.max(0, M.n - 1)
    var wsumv = wsum()
    normBtn.disabled = Math.abs(wsumv) < 1e-12
    prevBtn.disabled = !M.valid || st.cur <= 0
    nextBtn.disabled = !M.valid || st.cur >= M.n - 1
    playBtn.disabled = !M.valid
    resetBtn.disabled = !M.valid
    updateText(); drawInput(); drawOutput(); drawImages()
  }

  syncInputs()
  M = compute()
  render()
})
