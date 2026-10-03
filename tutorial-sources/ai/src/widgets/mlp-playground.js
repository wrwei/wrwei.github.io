/* mlp-playground — Module 02, Section 1: a small multilayer perceptron trained live on a 2-D
 * classification problem.
 *
 * Data (seeded: mulberry32 via AIW.rng, normal deviates by Box–Muller via AIW.gauss).
 *   Training set: AIW.rng(seed); test set: AIW.rng(seed + 1000). 100 points per class (class 0 first).
 *   For every point the base coordinates are drawn first, then two normal deviates (x then y) scaled
 *   by `noise` are added (the deviates are drawn even when noise = 0, so the stream does not depend
 *   on the noise level).
 *   circles: class 0 radius U(0, .45), class 1 radius U(.65, .95); each point draws radius, then angle U(0, 2π).
 *   moons:   t ~ U(0, π); class 0 (cos t, sin t), class 1 (1 − cos t, .5 − sin t); then ((x, y) + (−.5, −.25)) · .8.
 *   xor:     a sign s = ±1 is drawn (rand < .5 → −1), the x sign is s and the y sign is s for class 1, −s for class 0;
 *            the point is (.5 s_x + .15 g1, .5 s_y + .15 g2).
 *   spiral:  r = .05 + .9 i/100, θ = 3.5π i/100 + cπ, point (r sin θ, r cos θ), i = 0…99. The test set uses
 *            i + U(0, 1) so that it is not a copy of the training set when noise = 0.
 * Network: sizes [2, H, …, H, 1]; z = Wᵀh + b; one output logit. Weights W[l][i·out + j].
 *   Initialisation stream AIW.rng(seed + 5000), weights in order layer, i, j, one AIW.gauss each:
 *   hidden layers He normal √(2/fan_in) for ReLU / leaky ReLU, Glorot normal √(2/(fan_in + fan_out)) for tanh,
 *   sigmoid and none; the output layer is always Glorot; biases zero.
 * Loss: mean over the training points of max(z, 0) − z y + log(1 + e^(−|z|)); dL/dz = (σ(z) − y)/N.
 * Updates are full batch: GD θ ← θ − ηg; momentum v ← .9 v + g, θ ← θ − η v; Adam (β₁ .9, β₂ .999,
 * ε 1e-8, bias-corrected). The step counter, the losses and the accuracies refer to the weights after
 * that many updates (step 0 = the initial weights). */
AIW.register('mlp-playground', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h

  // ---------- every visible string ----------
  var S = {
    dataset: t('dataset', '数据集'),
    ds: [['circles', t('circles', '同心圆')], ['moons', t('moons', '双月')], ['xor', t('xor', '异或')], ['spiral', t('spiral', '螺旋')]],
    noise: t('noise σ', '噪声标准差 σ'),
    layers: t('hidden layers', '隐藏层数'),
    units: t('units per hidden layer', '每个隐藏层的单元数'),
    act: t('activation', '激活函数'),
    acts: [['relu', 'ReLU'], ['leaky', t('leaky ReLU (a = 0.01)', '带泄漏的 ReLU（a = 0.01）')], ['tanh', 'tanh'], ['sigmoid', 'sigmoid'],
      ['none', t('none (identity)', '无（恒等函数）')]],
    opt: t('optimiser', '优化器'),
    opts: [['gd', t('gradient descent', '梯度下降')], ['momentum', t('gradient descent + momentum 0.9', '梯度下降 + 动量 0.9')],
      ['adam', t('Adam (β₁ 0.9, β₂ 0.999, ε 10⁻⁸)', 'Adam（β₁ 0.9，β₂ 0.999，ε 10⁻⁸）')]],
    lr: t('learning rate η', '学习率 η'),
    spf: t('steps per frame', '每帧步数'),
    seed: t('seed', '随机种子'),
    test: t('show test points', '显示测试点'),
    play: t('Play', '播放'), pause: t('Pause', '暂停'), step: t('Step', '单步'),
    reset: t('Reset weights', '重置权重'), newData: t('New data', '新数据'),
    lossAxis: t('loss (log scale)', '损失（对数坐标）'), stepAxis: t('step', '步数'),
    legTrain: t('training loss', '训练损失'), legTest: t('test loss', '测试损失'),
    legClass0: t('class 0', '类别 0'), legClass1: t('class 1', '类别 1'),
    legBoundary: t('boundary p̂ = 0.5', '决策边界 p̂ = 0.5'), legTestPt: t('hollow = test', '空心 = 测试点'),
    rStep: t('step', '步数'), rTrain: t('training loss', '训练损失'), rTest: t('test loss', '测试损失'),
    rAcc: t('accuracy (train / test)', '准确率（训练 / 测试）'), rParams: t('parameters', '参数个数'),
    rDead: t('dead units, layer 1', '第 1 层死亡单元'),
    rDeadNA: t('— (ReLU only)', '—（仅 ReLU）'),
    diverged: t('Diverged — lower the learning rate and press Reset', '已发散 —— 请调低学习率并按“重置权重”'),
    capped: t('Paused at the 20,000-step limit.', '已达 20,000 步上限，自动暂停。'),
    converged: t('Paused: training loss below 10⁻⁴.', '训练损失低于 10⁻⁴，自动暂停。'),
    featTitle: t('Hidden-unit features: each tile is the unit’s output h over the input region (dark = large; grey frame = dead on every training point)',
      '隐藏单元的特征：每个方块是该单元的输出 h 在输入区域上的取值（越深越大；灰框 = 对所有训练点均为 0 的死亡单元）'),
    layer1: t('layer 1', '第 1 层'), layer2: t('layer 2 (features of features)', '第 2 层（特征的特征）'),
    noHidden: t('No hidden layer: the model is logistic regression, z = w·x + b, and its boundary is a straight line.',
      '没有隐藏层：模型就是逻辑回归 z = w·x + b，决策边界是一条直线。'),
    flatNote: t('Layers and units are disabled while there is no hidden layer.', '没有隐藏层时，层数以外的网络结构控件不可用。'),
    hint: t('Press Play to train. Then try: 0 hidden layers; activation none with 3 layers; 2 units, then 3.',
      '按“播放”开始训练。然后试试：0 个隐藏层；激活函数选“无”并取 3 层；单元数取 2 再取 3。'),
    x1: 'x₁', x2: 'x₂'
  }
  var MONO = '"DM Mono", Consolas, monospace', SANS = '"DM Sans", system-ui, sans-serif'
  var COL0 = AIW.C.orange, COL1 = AIW.C.blue
  var RGB0 = [194, 65, 12], RGB1 = [37, 99, 235]
  var LO = [241, 245, 249], HI = [30, 58, 138]   // sequential palette for the feature tiles
  var G = 80, TG = 48, LIM = 1.5, HIST = 2000, MAXSTEPS = 20000

  // ---------- state ----------
  var st = { dataset: 'circles', noise: 0.05, layers: 1, units: 8, act: 'relu', opt: 'adam', lr: 0.03, spf: 1, seed: 1, showTest: false }
  var net = null, data = null, optState = null
  var steps = 0, trL = [], teL = [], playing = false, note = '', needFrame = true, inView = true
  var cache = null     // forward pass of the training set at the current weights
  var cur = null       // {trLoss, teLoss, trAcc, teAcc, dead}

  // ---------- data ----------
  function genSet(kind, seed, noise, test) {
    var rand = AIW.rng(seed), n = 100, X = new Float64Array(4 * n), y = new Float64Array(2 * n), p = 0
    var add = function (x, yy, c) {
      var gx = AIW.gauss(rand), gy = AIW.gauss(rand)
      X[2 * p] = x + noise * gx; X[2 * p + 1] = yy + noise * gy; y[p] = c; p++
    }
    for (var c = 0; c < 2; c++) {
      for (var i = 0; i < n; i++) {
        if (kind === 'circles') {
          var r = c === 0 ? 0 + 0.45 * rand() : 0.65 + 0.3 * rand(), a = 2 * Math.PI * rand()
          add(r * Math.cos(a), r * Math.sin(a), c)
        } else if (kind === 'moons') {
          var tt = Math.PI * rand()
          var mx = c === 0 ? Math.cos(tt) : 1 - Math.cos(tt), my = c === 0 ? Math.sin(tt) : 0.5 - Math.sin(tt)
          add((mx - 0.5) * 0.8, (my - 0.25) * 0.8, c)
        } else if (kind === 'xor') {
          var s = rand() < 0.5 ? -1 : 1, sy = c === 1 ? s : -s
          var g1 = AIW.gauss(rand), g2 = AIW.gauss(rand)
          add(0.5 * s + 0.15 * g1, 0.5 * sy + 0.15 * g2, c)
        } else {
          var u = test ? (i + rand()) / 100 : i / 100
          var rr = 0.05 + 0.9 * u, th = 3.5 * Math.PI * u + c * Math.PI
          add(rr * Math.sin(th), rr * Math.cos(th), c)
        }
      }
    }
    return { X: X, y: y, n: 2 * n }
  }
  function makeData() {
    data = { tr: genSet(st.dataset, st.seed, st.noise, false), te: genSet(st.dataset, st.seed + 1000, st.noise, true) }
  }

  // ---------- network ----------
  var phi = function (a, z) {
    if (a === 'relu') return z > 0 ? z : 0
    if (a === 'leaky') return z > 0 ? z : 0.01 * z
    if (a === 'tanh') return Math.tanh(z)
    if (a === 'sigmoid') return 1 / (1 + Math.exp(-z))
    return z
  }
  var dphi = function (a, z, hv) {
    if (a === 'relu') return z > 0 ? 1 : 0
    if (a === 'leaky') return z > 0 ? 1 : 0.01
    if (a === 'tanh') return 1 - hv * hv
    if (a === 'sigmoid') return hv * (1 - hv)
    return 1
  }
  function initNet() {
    var L = st.layers, sizes = [2]
    for (var l = 0; l < L; l++) sizes.push(st.units)
    sizes.push(1)
    var rand = AIW.rng(st.seed + 5000), W = [], b = []
    for (var k = 0; k < sizes.length - 1; k++) {
      var fi = sizes[k], fo = sizes[k + 1], hidden = k < L
      var sd = hidden && (st.act === 'relu' || st.act === 'leaky') ? Math.sqrt(2 / fi) : Math.sqrt(2 / (fi + fo))
      var w = new Float64Array(fi * fo)
      for (var i = 0; i < fi; i++) for (var j = 0; j < fo; j++) w[i * fo + j] = sd * AIW.gauss(rand)
      W.push(w); b.push(new Float64Array(fo))
    }
    net = { sizes: sizes, W: W, b: b, L: L }
    var np = 0
    for (var q = 0; q < W.length; q++) np += W[q].length + b[q].length
    net.params = np
    resetOpt()
  }
  function resetOpt() {
    // m: Adam first moment; v: Adam second moment, or the momentum velocity (never both)
    var o = { t: 0, m: [], v: [], mb: [], vb: [] }
    for (var k = 0; k < net.W.length; k++) {
      o.m.push(new Float64Array(net.W[k].length)); o.v.push(new Float64Array(net.W[k].length))
      o.mb.push(new Float64Array(net.b[k].length)); o.vb.push(new Float64Array(net.b[k].length))
    }
    optState = o
  }

  // forward pass of n points X (n × 2) through the first `upto` weight layers (default: all).
  // Returns {Z: [...], H: [...]}: H[0] = X, H[k+1] the output of layer k (activation applied to hidden layers).
  function forward(X, n, upto) {
    var L = net.L, total = L + 1, up = upto === undefined ? total : Math.min(upto, total)
    var Z = [], H = [X]
    for (var k = 0; k < up; k++) {
      var fi = net.sizes[k], fo = net.sizes[k + 1], W = net.W[k], b = net.b[k], inp = H[k]
      var z = new Float64Array(n * fo)
      for (var p = 0; p < n; p++) {
        var zo = p * fo
        for (var j = 0; j < fo; j++) z[zo + j] = b[j]
        for (var i = 0; i < fi; i++) {
          var xv = inp[p * fi + i], wo = i * fo
          for (var j2 = 0; j2 < fo; j2++) z[zo + j2] += xv * W[wo + j2]
        }
      }
      Z.push(z)
      if (k < L) {
        var hh = new Float64Array(n * fo)
        for (var q = 0; q < hh.length; q++) hh[q] = phi(st.act, z[q])
        H.push(hh)
      } else H.push(z)
    }
    return { Z: Z, H: H }
  }
  var bce = function (z, y) { return Math.max(z, 0) - z * y + Math.log(1 + Math.exp(-Math.abs(z))) }
  function lossOf(zo, y, n) { var s = 0; for (var p = 0; p < n; p++) s += bce(zo[p], y[p]); return s / n }
  function accOf(zo, y, n) { var c = 0; for (var p = 0; p < n; p++) if ((zo[p] > 0 ? 1 : 0) === y[p]) c++; return c / n }

  function evaluate() {
    var N = data.tr.n
    cache = forward(data.tr.X, N)
    var te = forward(data.te.X, data.te.n)
    var ztr = cache.Z[net.L], zte = te.Z[net.L]
    var dead = null
    if (st.act === 'relu' && net.L > 0) {
      dead = 0
      var Z0 = cache.Z[0], H = net.sizes[1]
      for (var j = 0; j < H; j++) {
        var any = false
        for (var p = 0; p < N; p++) if (Z0[p * H + j] > 0) { any = true; break }
        if (!any) dead++
      }
    }
    cur = { trLoss: lossOf(ztr, data.tr.y, N), teLoss: lossOf(zte, data.te.y, data.te.n),
      trAcc: accOf(ztr, data.tr.y, N), teAcc: accOf(zte, data.te.y, data.te.n), dead: dead }
  }

  function trainStep() {
    var N = data.tr.n, y = data.tr.y, L = net.L, Z = cache.Z, H = cache.H
    var dz = new Float64Array(N)
    for (var p = 0; p < N; p++) dz[p] = (1 / (1 + Math.exp(-Z[L][p])) - y[p]) / N
    var gW = new Array(L + 1), gb = new Array(L + 1)
    for (var k = L; k >= 0; k--) {
      var fi = net.sizes[k], fo = net.sizes[k + 1], W = net.W[k], inp = H[k]
      var dW = new Float64Array(fi * fo), db = new Float64Array(fo)
      for (var q = 0; q < N; q++) {
        for (var j = 0; j < fo; j++) db[j] += dz[q * fo + j]
        for (var i = 0; i < fi; i++) {
          var xv = inp[q * fi + i]
          for (var j2 = 0; j2 < fo; j2++) dW[i * fo + j2] += xv * dz[q * fo + j2]
        }
      }
      gW[k] = dW; gb[k] = db
      if (k > 0) {
        var nz = new Float64Array(N * fi), zp = Z[k - 1], hp = H[k]
        for (var q2 = 0; q2 < N; q2++) for (var i2 = 0; i2 < fi; i2++) {
          var s = 0
          for (var j3 = 0; j3 < fo; j3++) s += dz[q2 * fo + j3] * W[i2 * fo + j3]
          nz[q2 * fi + i2] = s * dphi(st.act, zp[q2 * fi + i2], hp[q2 * fi + i2])
        }
        dz = nz
      }
    }
    // update
    var o = optState, eta = st.lr
    o.t++
    var c1 = 1 - Math.pow(0.9, o.t), c2 = 1 - Math.pow(0.999, o.t)
    var upd = function (th, g, m, v) {
      for (var i = 0; i < th.length; i++) {
        if (st.opt === 'gd') th[i] -= eta * g[i]
        else if (st.opt === 'momentum') { v[i] = 0.9 * v[i] + g[i]; th[i] -= eta * v[i] }
        else {
          m[i] = 0.9 * m[i] + 0.1 * g[i]
          v[i] = 0.999 * v[i] + 0.001 * g[i] * g[i]
          th[i] -= eta * (m[i] / c1) / (Math.sqrt(v[i] / c2) + 1e-8)
        }
      }
    }
    for (var kk = 0; kk <= L; kk++) { upd(net.W[kk], gW[kk], o.m[kk], o.v[kk]); upd(net.b[kk], gb[kk], o.mb[kk], o.vb[kk]) }
    steps++
    evaluate()
    trL.push(cur.trLoss); teL.push(cur.teLoss)
    needFrame = true
    if (!isFinite(cur.trLoss) || cur.trLoss > 1e6) { setPlaying(false); note = S.diverged; return false }
    return true
  }

  function reinit(newData) {
    if (newData) makeData()
    initNet()
    steps = 0; note = ''
    evaluate()
    trL = [cur.trLoss]; teL = [cur.teLoss]
    setPlaying(false)
    needFrame = true
  }

  // ---------- controls ----------
  var ctl = {}
  var round = function (v, d) { return Number(v.toFixed(d)) }
  ctl.dataset = AIW.select({ label: S.dataset, options: S.ds, value: st.dataset, onChange: function (v) { st.dataset = v; reinit(true) } })
  ctl.noise = AIW.slider({ label: S.noise, min: 0, max: 0.3, step: 0.01, value: st.noise, fmt: function (v) { return v.toFixed(2) },
    onInput: function (v) { st.noise = round(v, 2); reinit(true) } })
  ctl.layers = AIW.slider({ label: S.layers, min: 0, max: 3, step: 1, value: st.layers, fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { st.layers = Math.round(v); syncDisabled(); reinit(false) } })
  ctl.units = AIW.slider({ label: S.units, min: 1, max: 32, step: 1, value: st.units, fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { st.units = Math.round(v); reinit(false) } })
  ctl.act = AIW.select({ label: S.act, options: S.acts, value: st.act, onChange: function (v) { st.act = v; reinit(false) } })
  ctl.opt = AIW.select({ label: S.opt, options: S.opts, value: st.opt, onChange: function (v) { st.opt = v; resetOpt() } })
  ctl.lr = AIW.slider({ label: S.lr, min: 0.001, max: 10, log: true, value: st.lr, fmt: function (v) { return Number(v.toPrecision(3)).toString() },
    onInput: function (v) { st.lr = Number(v.toPrecision(3)) } })
  ctl.spf = AIW.slider({ label: S.spf, min: 1, max: 20, step: 1, value: st.spf, fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { st.spf = Math.round(v) } })
  var seedIn = h('input', { type: 'number', min: 1, step: 1, value: st.seed })
  ctl.seed = h('label', { class: 'w-ctl' }, h('span', { text: S.seed }), seedIn)
  seedIn.addEventListener('change', function () {
    var v = Math.floor(Number(seedIn.value))
    if (!isFinite(v) || v < 1) v = 1
    seedIn.value = v; st.seed = v; reinit(true)
  })
  ctl.test = AIW.checkbox(S.test, st.showTest, function (v) { st.showTest = v; needFrame = true })

  var playBtn = AIW.button(S.play, function () { setPlaying(!playing) })
  var stepBtn = AIW.button(S.step, function () { setPlaying(false); if (steps < MAXSTEPS) trainStep() }, true)
  var resetBtn = AIW.button(S.reset, function () { reinit(false) }, true)
  var newBtn = AIW.button(S.newData, function () { st.seed++; seedIn.value = st.seed; reinit(true) }, true)

  function syncDisabled() {
    var off = st.layers === 0
    ctl.units.querySelector('input').disabled = off
    ctl.act.querySelector('select').disabled = off
  }
  function setPlaying(on) {
    if (on && (steps >= MAXSTEPS || (note === S.diverged))) on = false
    playing = on
    playBtn.textContent = on ? S.pause : S.play
    if (on) { note = ''; needFrame = true; requestAnimationFrame(loop) }
  }

  // ---------- layout ----------
  var root = h('div')
  el.appendChild(root)
  root.appendChild(h('div', { class: 'w-controls' }, ctl.dataset, ctl.noise, ctl.layers, ctl.units, ctl.act, ctl.opt, ctl.lr, ctl.spf, ctl.seed, ctl.test,
    h('div', { class: 'w-ctl', style: { flexDirection: 'row', alignItems: 'flex-end', gap: '.5rem', flexWrap: 'wrap' } }, playBtn, stepBtn, resetBtn, newBtn)))
  var colL = h('div', { class: 'w-col' }), colR = h('div', { class: 'w-col' })
  root.appendChild(h('div', { class: 'w-row' }, colL, colR))
  var legend = h('div', { class: 'w-legend' })
  var dot = function (c, hollow) { return h('i', { style: { width: '10px', height: '10px', borderRadius: '50%', background: hollow ? 'transparent' : c, border: hollow ? '2px solid ' + c : 'none', boxSizing: 'border-box' } }) }
  legend.appendChild(h('span', null, dot(COL0), S.legClass0))
  legend.appendChild(h('span', null, dot(COL1), S.legClass1))
  legend.appendChild(h('span', null, h('i', { style: { background: AIW.C.navy } }), S.legBoundary))
  legend.appendChild(h('span', null, dot(AIW.C.slate, true), S.legTestPt))
  var main = AIW.canvas(colL, { aspect: 1, maxHeight: 400 }, drawMain)
  colL.appendChild(legend)
  var lossLegend = h('div', { class: 'w-legend' },
    h('span', null, h('i', { style: { background: AIW.SERIES[0] } }), S.legTrain),
    h('span', null, h('i', { style: { background: AIW.SERIES[1] } }), S.legTest))
  var chart = AIW.canvas(colR, { aspect: 0.55, maxHeight: 220 }, drawChart)
  colR.appendChild(lossLegend)
  var readout = h('div', { class: 'w-readout' })
  colR.appendChild(readout)
  var noteEl = h('div', { class: 'w-note', style: { color: AIW.C.red, minHeight: '1.2em' } })
  colR.appendChild(noteEl)
  var featTitle = h('div', { class: 'w-note', style: { marginTop: '.8rem' } })
  var featBox = h('div')
  root.appendChild(featTitle)
  root.appendChild(featBox)
  root.appendChild(h('div', { class: 'w-note' }, S.hint))
  var flat = h('div', { class: 'w-note' })
  root.appendChild(flat)

  // ---------- drawing ----------
  var gridCv = document.createElement('canvas'); gridCv.width = G; gridCv.height = G
  var gridCtx = gridCv.getContext('2d')
  function drawMain(ctx, w, hgt) {
    if (!net) return
    var sz = Math.min(w, hgt)
    var P = function (x) { return (x + LIM) / (2 * LIM) * sz }
    var Q = function (y) { return (LIM - y) / (2 * LIM) * sz }
    // grid
    var pts = new Float64Array(G * G * 2)
    for (var r = 0; r < G; r++) for (var c = 0; c < G; c++) {
      pts[2 * (r * G + c)] = -LIM + 2 * LIM * (c + 0.5) / G
      pts[2 * (r * G + c) + 1] = LIM - 2 * LIM * (r + 0.5) / G
    }
    var z = forward(pts, G * G).Z[net.L]
    var img = gridCtx.createImageData(G, G)
    for (var i = 0; i < G * G; i++) {
      var p = 1 / (1 + Math.exp(-z[i])), s = Math.min(1, Math.abs(p - 0.5) * 2) * 0.75, rgb = p >= 0.5 ? RGB1 : RGB0
      for (var k = 0; k < 3; k++) img.data[4 * i + k] = Math.round(255 * (1 - s) + rgb[k] * s)
      img.data[4 * i + 3] = 255
    }
    gridCtx.putImageData(img, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(gridCv, 0, 0, sz, sz)
    // contour z = 0 by marching squares on the cell centres
    var cell = sz / G, X = function (c) { return (c + 0.5) * cell }
    ctx.strokeStyle = AIW.C.navy; ctx.lineWidth = 2; ctx.lineCap = 'round'
    ctx.beginPath()
    var cross = function (a, b, za, zb) { return a + (b - a) * (za / (za - zb)) }
    for (var rr = 0; rr < G - 1; rr++) for (var cc = 0; cc < G - 1; cc++) {
      var z00 = z[rr * G + cc], z10 = z[rr * G + cc + 1], z01 = z[(rr + 1) * G + cc], z11 = z[(rr + 1) * G + cc + 1]
      var e = []
      if ((z00 > 0) !== (z10 > 0)) e.push([cross(X(cc), X(cc + 1), z00, z10), X(rr)])
      if ((z10 > 0) !== (z11 > 0)) e.push([X(cc + 1), cross(X(rr), X(rr + 1), z10, z11)])
      if ((z01 > 0) !== (z11 > 0)) e.push([cross(X(cc), X(cc + 1), z01, z11), X(rr + 1)])
      if ((z00 > 0) !== (z01 > 0)) e.push([X(cc), cross(X(rr), X(rr + 1), z00, z01)])
      if (e.length === 2) { ctx.moveTo(e[0][0], e[0][1]); ctx.lineTo(e[1][0], e[1][1]) }
      else if (e.length === 4) { ctx.moveTo(e[0][0], e[0][1]); ctx.lineTo(e[1][0], e[1][1]); ctx.moveTo(e[2][0], e[2][1]); ctx.lineTo(e[3][0], e[3][1]) }
    }
    ctx.stroke()
    // points
    var D = data.tr
    for (var n = 0; n < D.n; n++) {
      ctx.beginPath(); ctx.arc(P(D.X[2 * n]), Q(D.X[2 * n + 1]), 3.4, 0, 6.2832)
      ctx.fillStyle = D.y[n] ? COL1 : COL0; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke()
    }
    if (st.showTest) {
      var T = data.te
      ctx.lineWidth = 1.6
      for (var m = 0; m < T.n; m++) {
        ctx.beginPath(); ctx.arc(P(T.X[2 * m]), Q(T.X[2 * m + 1]), 3.6, 0, 6.2832)
        ctx.strokeStyle = T.y[m] ? COL1 : COL0; ctx.stroke()
      }
    }
    // frame and axis labels
    ctx.strokeStyle = AIW.C.muted; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, sz - 1, sz - 1)
    ctx.fillStyle = AIW.C.slate; ctx.font = '11px ' + MONO
    ctx.textAlign = 'right'; ctx.fillText(S.x1 + ' ' + LIM, sz - 4, sz - 5)
    ctx.textAlign = 'left'; ctx.fillText(S.x2 + ' ' + LIM, 4, 13)
  }

  function sup(k) {
    var map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
    return String(k).split('').map(function (c) { return map[c] }).join('')
  }
  function drawChart(ctx, w, hgt) {
    if (!trL.length) return
    var n = trL.length, first = Math.max(0, n - HIST), last = Math.max(n - 1, first + 10)
    if (first === 0) {   // round the axis end so that the four tick labels are round numbers
      var raw = last / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), nice = [1, 2, 5, 10].filter(function (m) { return m * mag >= raw })[0] * mag
      last = 4 * nice
    }
    var lo = Infinity, hi = -Infinity
    for (var i = first; i < n; i++) {
      [trL[i], teL[i]].forEach(function (v) { if (isFinite(v) && v > 0) { lo = Math.min(lo, v); hi = Math.max(hi, v) } })
    }
    if (!isFinite(lo)) { lo = 0.01; hi = 1 }
    var e0 = Math.floor(Math.log10(lo)), e1 = Math.ceil(Math.log10(hi))
    if (e1 > 6) e1 = 6
    if (e1 - e0 < 2) { if (e0 > -1) e1 = e0 + 2; else e0 = e1 - 2 }
    if (e0 < -12) e0 = -12
    var ax = AIW.axes(ctx, { w: w, h: hgt, x0: first, x1: last, y0: Math.pow(10, e0), y1: Math.pow(10, e1), logY: true, yticks: e1 - e0, xticks: 4,
      xlabel: S.stepAxis, ylabel: S.lossAxis, xfmt: function (v) { return String(Math.round(v)) },
      yfmt: function (v) { return '10' + sup(Math.round(Math.log10(v))) }, pad: { l: 52, r: 10, t: 10, b: 34 } })
    var line = function (arr, colr) {
      ctx.strokeStyle = colr; ctx.lineWidth = 1.6; ctx.beginPath()
      var started = false
      for (var i = first; i < n; i++) {
        var v = arr[i]
        if (!isFinite(v) || v <= 0) { started = false; continue }
        var px = ax.X(i), py = Math.max(ax.pad.t, Math.min(hgt - ax.pad.b, ax.Y(v)))
        if (started) ctx.lineTo(px, py); else { ctx.moveTo(px, py); started = true }
      }
      ctx.stroke()
    }
    line(teL, AIW.SERIES[1]); line(trL, AIW.SERIES[0])
  }

  function renderReadout() {
    var f = function (x) { return !isFinite(x) ? '—' : (x !== 0 && x < 1e-3 ? x.toExponential(3).replace('-', '−') : x.toPrecision(4)) }
    var pct = function (x) { return (100 * x).toFixed(1) + '%' }
    readout.textContent =
      S.rStep + ': ' + steps + '\n' +
      S.rTrain + ': ' + f(cur.trLoss) + '\n' +
      S.rTest + ': ' + f(cur.teLoss) + '\n' +
      S.rAcc + ': ' + pct(cur.trAcc) + ' / ' + pct(cur.teAcc) + '\n' +
      S.rParams + ': ' + net.params + '\n' +
      S.rDead + ': ' + (cur.dead === null ? S.rDeadNA : cur.dead + ' / ' + net.sizes[1])
    noteEl.textContent = note
  }

  function tileColor(v, out, o) {
    for (var k = 0; k < 3; k++) out[o + k] = Math.round(LO[k] + (HI[k] - LO[k]) * v)
    out[o + 3] = 255
  }
  var tileSig = '', tileEls = []
  function renderTiles() {
    flat.textContent = st.layers === 0 ? S.flatNote : ''
    var sig = st.layers + ':' + st.units
    if (sig !== tileSig) {
      tileSig = sig; tileEls = []
      featBox.textContent = ''
      if (st.layers === 0) { featTitle.textContent = ''; featBox.appendChild(h('div', { class: 'w-note' }, S.noHidden)); return }
      featTitle.textContent = S.featTitle
      for (var l = 1; l <= Math.min(2, st.layers); l++) {
        featBox.appendChild(h('div', { class: 'w-note', style: { margin: '.5rem 0 .25rem' } }, l === 1 ? S.layer1 : S.layer2))
        var rowEl = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } }), row = []
        for (var j = 0; j < st.units; j++) {
          var cv = h('canvas', { width: TG, height: TG, style: { width: '44px', height: '44px', display: 'block', boxSizing: 'border-box',
            border: '1px solid ' + AIW.C.border, borderRadius: '3px', imageRendering: 'pixelated' } })
          row.push(cv); rowEl.appendChild(cv)
        }
        tileEls.push(row); featBox.appendChild(rowEl)
      }
    }
    if (st.layers === 0) return
    var pts = new Float64Array(TG * TG * 2)
    for (var r = 0; r < TG; r++) for (var c = 0; c < TG; c++) {
      pts[2 * (r * TG + c)] = -LIM + 2 * LIM * (c + 0.5) / TG
      pts[2 * (r * TG + c) + 1] = LIM - 2 * LIM * (r + 0.5) / TG
    }
    var nl = Math.min(2, net.L), fw = forward(pts, TG * TG, nl)
    for (var l2 = 1; l2 <= nl; l2++) {
      var H = net.sizes[l2], A = fw.H[l2], tr = cache.Z[l2 - 1]
      for (var j2 = 0; j2 < H; j2++) {
        var dead = st.act === 'relu'
        if (dead) for (var p = 0; p < data.tr.n; p++) if (tr[p * H + j2] > 0) { dead = false; break }
        var mn = Infinity, mx = -Infinity
        for (var q = 0; q < TG * TG; q++) { var v = A[q * H + j2]; if (v < mn) mn = v; if (v > mx) mx = v }
        var cv2 = tileEls[l2 - 1][j2]
        cv2.style.border = dead ? '2px solid ' + AIW.C.muted : '1px solid ' + AIW.C.border
        var cx = cv2.getContext('2d'), im = cx.createImageData(TG, TG), span = mx - mn
        for (var q2 = 0; q2 < TG * TG; q2++) tileColor(span > 1e-12 ? (A[q2 * H + j2] - mn) / span : 0, im.data, 4 * q2)
        cx.putImageData(im, 0, 0)
      }
    }
  }

  function frame() {
    if (!needFrame) return
    needFrame = false
    main.redraw(); chart.redraw(); renderReadout()
    renderTiles()
  }

  // ---------- animation ----------
  function loop() {
    if (!playing) return
    if (inView) {
      for (var i = 0; i < st.spf; i++) {
        if (steps >= MAXSTEPS) { setPlaying(false); note = S.capped; break }
        if (!trainStep()) break
        if (cur.trLoss < 1e-4) { setPlaying(false); note = S.converged; break }
      }
      frame()
    }
    if (playing) requestAnimationFrame(loop)
  }
  // redraw once per frame when something other than the loop changed state (controls, reset, ...)
  function idle() {
    if (needFrame) frame()
    requestAnimationFrame(idle)
  }
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { inView = es[es.length - 1].isIntersecting; if (inView) needFrame = true }).observe(el)

  // ---------- start ----------
  makeData()
  initNet()
  evaluate()
  trL = [cur.trLoss]; teL = [cur.teLoss]
  syncDisabled()
  frame()
  requestAnimationFrame(idle)
})
