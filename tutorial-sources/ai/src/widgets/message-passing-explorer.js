/* Message-passing explorer (Module 05, Section 8).
 * Repeated propagation H_k = P H_{k-1}, H_0 = X, on three 12-node graphs: the cooling-system fault
 * tree, a path, and a hexagon beside two triangles. P is the symmetric D~^-1/2 A~ D~^-1/2, the
 * random-walk D~^-1 A~ or the unnormalised A~, where A~ = A + I with self-loops and A without.
 * Shows each node's feature vector as a colour, the pinned nodes' numbers, the receptive field of
 * the newest pin (the support of its row of P^k), the mean pairwise cosine similarity for
 * k = 0..40, and the eigenvalues of P (Jacobi rotations on the symmetric form). */
AIW.register('message-passing-explorer', function (el, opts) {
  var t = AIW.t, h = AIW.h, C = AIW.C
  var NS = 'http://www.w3.org/2000/svg'
  var N = 12, KMAX = 40
  var OR = 0, AND = 1, BASIC = 2, PLAIN = 3
  var VB = { x: -10, y: -10, w: 700, h: 380 }      // the spec's 680 x 360 layout plus a margin

  function cssVar(name, fb) {
    try { var v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fb } catch (e) { return fb }
  }
  var ink = {}
  function readTheme() {
    ink.navy = cssVar('--navy', C.navy); ink.slate = cssVar('--slate', C.slate); ink.muted = cssVar('--muted', C.muted)
    ink.border = cssVar('--border', C.border); ink.sky = cssVar('--sky', C.sky); ink.skyLight = cssVar('--sky-light', C.skyLight)
    ink.orange = cssVar('--orange', C.orange); ink.purple = cssVar('--purple', C.purple); ink.blue = cssVar('--blue', C.blue)
  }
  readTheme()

  // ---------- the three graphs (node order, edges and coordinates as in the plan) ----------
  function treeGraph() {
    var rows = [
      ['TOP', OR, 'Loss of cooling', '冷却丧失', 340, 40],
      ['G1', AND, 'All pumps fail', '所有泵失效', 130, 130],
      ['G2', OR, 'Flow path blocked', '流道堵塞', 530, 130],
      ['E1', BASIC, 'Power supply fails', '电源失效', 340, 130],
      ['E2', BASIC, 'Pump A fails', '泵 A 失效', 50, 230],
      ['E3', BASIC, 'Pump B fails', '泵 B 失效', 130, 230],
      ['E4', BASIC, 'Pump C fails', '泵 C 失效', 210, 230],
      ['E5', BASIC, 'Valve V1 stuck closed', '阀门 V1 卡在关闭位置', 450, 230],
      ['E6', BASIC, 'Pipe blocked', '管道堵塞', 530, 230],
      ['G3', AND, 'Both controllers fail', '两个控制器均失效', 610, 230],
      ['E7', BASIC, 'Controller C1 fails', '控制器 C1 失效', 570, 320],
      ['E8', BASIC, 'Controller C2 fails', '控制器 C2 失效', 650, 320]
    ]
    var nodes = rows.map(function (r) { return { id: r[0], type: r[1], desc: t(r[2], r[3]), x: r[4], y: r[5] } })
    return {
      key: 'tree', nodes: nodes,
      X: nodes.map(function (nd) { return [nd.type === OR ? 1 : 0, nd.type === AND ? 1 : 0, nd.type === BASIC ? 1 : 0] }),
      edges: [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [1, 6], [2, 7], [2, 8], [2, 9], [9, 10], [9, 11]],
      pins: [3, 4, 10]                                   // E1, E2, E7
    }
  }
  function pathGraph() {
    var nodes = [], X = [], edges = []
    for (var i = 0; i < N; i++) {
      var end = i === 0 || i === N - 1
      nodes.push({ id: 'v' + i, type: PLAIN, desc: end ? t('end of the path', '路径端点') : t('interior node', '中间节点'),
        x: 45 + i * 590 / 11, y: i % 2 ? 215 : 145 })
      X.push(i === 0 ? [1, 0, 0] : (i === N - 1 ? [0, 0, 1] : [0, 1, 0]))
      if (i) edges.push([i - 1, i])
    }
    return { key: 'path', nodes: nodes, X: X, edges: edges, pins: [5, 0, 11] }
  }
  function hexGraph() {
    var nodes = [], X = [], edges = [], i, a
    var groups = [[125, 100, 58, t('triangle A', '三角形 A')], [125, 268, 58, t('triangle B', '三角形 B')]]
    groups.forEach(function (gr, gi) {
      for (i = 0; i < 3; i++) {
        a = -Math.PI / 2 + i * 2 * Math.PI / 3
        nodes.push({ id: 'v' + (3 * gi + i), type: PLAIN, desc: gr[3], x: gr[0] + gr[2] * Math.cos(a), y: gr[1] + gr[2] * Math.sin(a) })
      }
      edges.push([3 * gi, 3 * gi + 1], [3 * gi + 1, 3 * gi + 2], [3 * gi, 3 * gi + 2])
    })
    for (i = 0; i < 6; i++) {
      a = -Math.PI / 2 + i * Math.PI / 3
      nodes.push({ id: 'v' + (6 + i), type: PLAIN, desc: t('hexagon', '六边形'), x: 470 + 125 * Math.cos(a), y: 180 + 125 * Math.sin(a) })
      edges.push([6 + i, 6 + (i + 1) % 6])
    }
    for (i = 0; i < N; i++) X.push([0.5, 0.5, 0.5])
    return { key: 'hex', nodes: nodes, X: X, edges: edges, pins: [6, 0] }
  }
  var GRAPHS = { tree: treeGraph(), path: pathGraph(), hex: hexGraph() }
  Object.keys(GRAPHS).forEach(function (key) {
    var g = GRAPHS[key]
    g.adj = g.nodes.map(function () { return [] })
    g.edges.forEach(function (e) { g.adj[e[0]].push(e[1]); g.adj[e[1]].push(e[0]) })
    g.adj.forEach(function (l) { l.sort(function (a, b) { return a - b }) })
  })

  // ---------- the maths ----------
  function eigSym(M) {                                  // cyclic Jacobi rotations; M symmetric
    var n = M.length, a = M.map(function (r) { return r.slice() }), p, q, k
    for (var sweep = 0; sweep < 60; sweep++) {
      var off = 0
      for (p = 0; p < n; p++) for (q = p + 1; q < n; q++) off += a[p][q] * a[p][q]
      if (off < 1e-26) break
      for (p = 0; p < n - 1; p++) for (q = p + 1; q < n; q++) {
        var apq = a[p][q]
        if (Math.abs(apq) < 1e-300) continue
        var th = (a[q][q] - a[p][p]) / (2 * apq)
        var tn = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1))
        var c = 1 / Math.sqrt(tn * tn + 1), s = tn * c
        for (k = 0; k < n; k++) { var akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq }
        for (k = 0; k < n; k++) { var apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk }
      }
    }
    var ev = []
    for (p = 0; p < n; p++) ev.push(a[p][p])
    return ev.sort(function (x, y) { return y - x })
  }
  function meanCos(H) {                                 // mean over the 66 node pairs
    var nr = H.map(function (v) { return Math.hypot(v[0], v[1], v[2]) }), s = 0, m = 0
    for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
      s += (H[i][0] * H[j][0] + H[i][1] * H[j][1] + H[i][2] * H[j][2]) / (nr[i] * nr[j]); m++
    }
    return s / m
  }
  var cache = {}
  function compute(gk, norm, loops) {
    var key = gk + '|' + norm + '|' + loops
    if (cache[key]) return cache[key]
    var g = GRAPHS[gk], i, j, k
    var At = []
    for (i = 0; i < N; i++) { At.push([]); for (j = 0; j < N; j++) At[i].push(0) }
    g.edges.forEach(function (e) { At[e[0]][e[1]] = 1; At[e[1]][e[0]] = 1 })
    if (loops) for (i = 0; i < N; i++) At[i][i] += 1
    var d = At.map(function (r) { return r.reduce(function (a, b) { return a + b }, 0) })
    var P = [], S = []
    for (i = 0; i < N; i++) {
      P.push([]); S.push([])
      for (j = 0; j < N; j++) {
        var sym = At[i][j] / Math.sqrt(d[i] * d[j])
        P[i].push(norm === 'sym' ? sym : (norm === 'rw' ? At[i][j] / d[i] : At[i][j]))
        S[i].push(norm === 'none' ? At[i][j] : sym)   // D~^-1 A~ is similar to the symmetric form
      }
    }
    var H = [g.X.map(function (r) { return r.slice() })]
    for (k = 1; k <= KMAX; k++) {
      var prev = H[k - 1], next = []
      for (i = 0; i < N; i++) {
        var v = [0, 0, 0]
        for (j = 0; j < N; j++) { var p = P[i][j]; if (p) { v[0] += p * prev[j][0]; v[1] += p * prev[j][1]; v[2] += p * prev[j][2] } }
        next.push(v)
      }
      H.push(next)
    }
    var ev = eigSym(S), i2 = 1
    for (i = 2; i < N; i++) if (Math.abs(ev[i]) > Math.abs(ev[i2]) + 1e-9) i2 = i
    var res = {
      P: P, d: d, H: H, ev: ev, lam1: ev[0], i2: i2, lam2: ev[i2],
      cos: H.map(meanCos),
      maxAbs: H.map(function (M) { return M.reduce(function (a, v) { return Math.max(a, Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])) }, 0) })
    }
    cache[key] = res
    return res
  }
  function support(g, loops, f, k) {                   // nodes j with (P^k)_fj != 0: walks of length k
    var cur = g.nodes.map(function (_, i) { return i === f })
    for (var s = 0; s < k; s++) {
      var nx = g.nodes.map(function () { return false })
      for (var i = 0; i < N; i++) if (cur[i]) {
        if (loops) nx[i] = true
        g.adj[i].forEach(function (j) { nx[j] = true })
      }
      cur = nx
    }
    return cur
  }

  // ---------- formatting and colour ----------
  function fx(x) {                                      // 3 decimals; scientific from 1000 up
    if (!isFinite(x)) return '∞'
    var a = Math.abs(x)
    if (a >= 999.9995) return x.toExponential(2).replace('e+', 'e').replace('-', '−')
    if (a < 5e-4) return '0.000'
    return x.toFixed(3).replace('-', '−')
  }
  function clamp01(u) { return u < 0 ? 0 : (u > 1 ? 1 : u) }
  function lin(u) { u /= 255; return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4) }
  var DARK = '#0F172A', L_DARK = 0.0086
  function colourOf(v) {      // [x1, x2, x3] -> (red, blue, green), each vector scaled by its largest entry
    var m = Math.max(Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]))
    if (!(m > 0) || !isFinite(m)) return { css: '#FFFFFF', text: DARK }
    var R = Math.round(255 * clamp01(v[0] / m)), B = Math.round(255 * clamp01(v[1] / m)), G = Math.round(255 * clamp01(v[2] / m))
    var L = 0.2126 * lin(R) + 0.7152 * lin(G) + 0.0722 * lin(B)
    return { css: 'rgb(' + R + ',' + G + ',' + B + ')', text: 1.05 / (L + 0.05) > (L + 0.05) / (L_DARK + 0.05) ? '#FFFFFF' : DARK }
  }
  var PURE = ['rgb(255,0,0)', 'rgb(0,0,255)', 'rgb(0,255,0)']   // x1 red, x2 blue, x3 green
  function compLabels(gk) {
    return gk === 'tree' ? [t('OR', '或门'), t('AND', '与门'), t('basic', '基本事件')] : ['x₁', 'x₂', 'x₃']
  }
  function typeName(ty) {
    return [t('OR gate', '或门'), t('AND gate', '与门'), t('basic event', '基本事件'), t('node', '节点')][ty]
  }

  // ---------- state ----------
  var state = {
    g: GRAPHS[opts.graph] ? opts.graph : 'tree',
    norm: ({ sym: 1, rw: 1, none: 1 })[opts.norm] ? opts.norm : 'sym',
    loops: !(opts.loops === '0' || opts.loops === 'false'),
    k: Math.max(0, Math.min(KMAX, Math.round(Number(opts.k)))) || 2,
    pins: { tree: GRAPHS.tree.pins.slice(), path: GRAPHS.path.pins.slice(), hex: GRAPHS.hex.pins.slice() }
  }
  if (opts.k === '0') state.k = 0
  function G() { return GRAPHS[state.g] }
  function R() { return compute(state.g, state.norm, state.loops) }

  // ---------- controls ----------
  var kSl = AIW.slider({ label: t('Propagation steps k', '传播步数 k'), min: 0, max: KMAX, step: 1, value: state.k,
    fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { stop(); state.k = Math.round(v); render() } })
  var gSel = AIW.select({ label: t('Graph', '图'), value: state.g, options: [
    ['tree', t('Cooling-system fault tree (12 nodes)', '冷却系统故障树（12 个节点）')],
    ['path', t('Path (12 nodes)', '路径图（12 个节点）')],
    ['hex', t('Hexagon + two triangles (12 nodes)', '六边形 + 两个三角形（12 个节点）')]],
    onChange: function (v) { state.g = v; buildSvg(); render() } })
  var nSel = AIW.select({ label: t('Normalisation', '归一化'), value: state.norm, options: [
    ['sym', t('symmetric D̃^(−1/2) Ã D̃^(−1/2)', '对称 D̃^(−1/2) Ã D̃^(−1/2)')],
    ['rw', t('random walk D̃^(−1) Ã', '随机游走 D̃^(−1) Ã')],
    ['none', t('none: Ã', '不归一化：Ã')]],
    onChange: function (v) { state.norm = v; render() } })
  var loopBox = AIW.checkbox(t('Add self-loops (Ã = A + I)', '添加自环（Ã = A + I）'), state.loops,
    function (v) { state.loops = v; render() })
  var playBtn = AIW.button(t('▶ Play', '▶ 播放'), function () { if (playing) stop(); else play() }, true)
  el.appendChild(h('div', { class: 'w-controls' }, kSl, gSel, nSel,
    h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '.45rem' } }, loopBox,
      h('div', null, playBtn))))

  // ---------- the graph drawing ----------
  var svgWrap = h('div', { style: { maxWidth: '720px', margin: '0 auto' } })
  el.appendChild(svgWrap)
  var svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h)
  svg.setAttribute('role', 'group')
  svg.style.display = 'block'; svg.style.width = '100%'; svg.style.height = 'auto'
  svg.style.background = '#fff'; svg.style.border = '1px solid ' + ink.border; svg.style.borderRadius = '8px'
  svg.style.color = 'var(--navy, ' + C.navy + ')'
  svgWrap.appendChild(svg)
  function S(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag)
    if (attrs) for (var a in attrs) e.setAttribute(a, attrs[a])
    if (parent) parent.appendChild(e)
    return e
  }
  var nodeEls = [], edgeEls = [], sz = null
  function sizes() {                                   // grow marks and text when the drawing is narrow
    var w = svg.getBoundingClientRect().width || 680
    var s = w / VB.w, u = clamp01((0.85 / s - 1) / 0.75)
    return { u: Math.round(u * 20) / 20, r: 20 + 6.5 * u, font: 12 + 9 * u, gw: 25 + 4 * u, gh: 22 + 6 * u,
      edge: 2 + u, halo: 7 + 2 * u, badge: 8 + 5 * u }
  }
  function buildSvg() {
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    var g = G()
    svg.setAttribute('aria-label', g.key === 'tree' ? t('Cooling-system fault tree', '冷却系统故障树')
      : (g.key === 'path' ? t('Path of 12 nodes', '12 个节点的路径图') : t('Two triangles and a hexagon', '两个三角形和一个六边形')))
    var haloL = S('g', null, svg), edgeL = S('g', null, svg), nodeL = S('g', null, svg)
    edgeEls = g.edges.map(function (e) {
      var a = g.nodes[e[0]], b = g.nodes[e[1]]
      var ln = S('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y }, edgeL)
      ln.style.strokeLinecap = 'round'
      return ln
    })
    nodeEls = g.nodes.map(function (nd, i) {
      var gate = nd.type === OR || nd.type === AND
      var ne = { gate: gate }
      ne.halo = S(gate ? 'rect' : 'circle', null, haloL)
      ne.halo.style.fill = ink.skyLight; ne.halo.style.stroke = ink.sky; ne.halo.style.strokeDasharray = '4 3'
      ne.grp = S('g', { tabindex: '0', role: 'button' }, nodeL)
      ne.grp.style.cursor = 'pointer'; ne.grp.style.outline = 'none'
      ne.title = S('title', null, ne.grp)
      ne.ring = S(gate ? 'rect' : 'circle', null, ne.grp)
      ne.ring.style.fill = 'none'; ne.ring.style.stroke = ink.blue; ne.ring.style.display = 'none'
      ne.shape = S(gate ? 'rect' : 'circle', null, ne.grp)
      ne.name = S('text', { 'text-anchor': 'middle' }, ne.grp)
      ne.name.textContent = nd.id; ne.name.style.fontWeight = '700'
      if (gate) { ne.type = S('text', { 'text-anchor': 'middle' }, ne.grp); ne.type.textContent = nd.type === OR ? t('OR', '或门') : t('AND', '与门') }
      ne.badge = S('g', null, ne.grp)
      ne.badgeC = S('circle', null, ne.badge); ne.badgeC.style.fill = ink.navy
      ne.badgeT = S('text', { 'text-anchor': 'middle' }, ne.badge); ne.badgeT.style.fill = '#fff'; ne.badgeT.style.fontWeight = '700'
      ne.grp.addEventListener('click', function () { clickNode(i) })
      ne.grp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); clickNode(i) }
      })
      ne.grp.addEventListener('focus', function () { ne.ring.style.display = '' })
      ne.grp.addEventListener('blur', function () { ne.ring.style.display = 'none' })
      return ne
    })
    sz = null
    layout()
  }
  function layout() {                                   // place marks for the current size preset
    var z = sizes()
    if (sz && sz.u === z.u) return
    sz = z
    var g = G()
    edgeEls.forEach(function (ln) { ln.style.strokeWidth = z.edge })
    nodeEls.forEach(function (ne, i) {
      var nd = g.nodes[i], x = nd.x, y = nd.y, f = z.font
      if (ne.gate) {
        var box = function (e, pad, rx) { e.setAttribute('x', x - z.gw - pad); e.setAttribute('y', y - z.gh - pad); e.setAttribute('width', 2 * (z.gw + pad)); e.setAttribute('height', 2 * (z.gh + pad)); e.setAttribute('rx', rx) }
        box(ne.shape, 0, 6 + 2 * z.u); box(ne.halo, z.halo, 12 + 3 * z.u); box(ne.ring, 4, 9 + 2 * z.u)
        ne.name.setAttribute('x', x); ne.name.setAttribute('y', y - 0.58 * f + 0.36 * f)
        ne.type.setAttribute('x', x); ne.type.setAttribute('y', y + 0.58 * f + 0.36 * f)
        ne.type.style.fontSize = f + 'px'
      } else {
        ne.shape.setAttribute('cx', x); ne.shape.setAttribute('cy', y); ne.shape.setAttribute('r', z.r)
        ne.halo.setAttribute('cx', x); ne.halo.setAttribute('cy', y); ne.halo.setAttribute('r', z.r + z.halo)
        ne.ring.setAttribute('cx', x); ne.ring.setAttribute('cy', y); ne.ring.setAttribute('r', z.r + 4)
        ne.name.setAttribute('x', x); ne.name.setAttribute('y', y + 0.36 * f)
      }
      ne.name.style.fontSize = f + 'px'
      ne.halo.style.strokeWidth = 1.5 + 0.5 * z.u; ne.ring.style.strokeWidth = 2.5 + z.u
      var bx = ne.gate ? x + z.gw : x + 0.72 * z.r, by = ne.gate ? y - z.gh : y - 0.72 * z.r
      ne.badgeC.setAttribute('cx', bx); ne.badgeC.setAttribute('cy', by); ne.badgeC.setAttribute('r', z.badge)
      ne.badgeT.setAttribute('x', bx); ne.badgeT.setAttribute('y', by + 0.36 * 1.25 * z.badge)
      ne.badgeT.style.fontSize = (1.25 * z.badge) + 'px'
    })
  }
  function clickNode(i) {
    var pins = state.pins[state.g], at = pins.indexOf(i)
    if (at === 0) pins.splice(0, 1)                     // clicking the newest pin unpins it
    else { if (at > 0) pins.splice(at, 1); pins.unshift(i); if (pins.length > 3) pins.pop() }
    render()
  }

  // legend and help under the drawing
  function swatch(css, round) {
    return h('span', { 'aria-hidden': 'true', style: { display: 'inline-block', width: '11px', height: '11px', background: css,
      borderRadius: round ? '50%' : '3px', border: '1px solid ' + ink.slate, verticalAlign: '-1px', marginRight: '.3rem' } })
  }
  var legend = h('div', { class: 'w-legend', style: { justifyContent: 'center' } })
  el.appendChild(legend)
  el.appendChild(h('p', { class: 'w-note', style: { textAlign: 'center', marginTop: '0' } },
    t('Fill colour = the node’s feature vector after k steps as red, blue and green light, each vector scaled by its largest entry: mixtures blend (red + green = yellow, blue + green = cyan, equal parts = white). Click a node, or Tab to it and press Enter, to pin it (up to three); the newest pin ① shows its receptive field. Click ① again to unpin it.',
      '填充色 = 节点经过 k 步后的特征向量，按红、蓝、绿三色光混合，每个向量先除以它自己的最大分量：分量混合则颜色混合（红 + 绿 = 黄，蓝 + 绿 = 青，三者相等 = 白）。点击节点（或用 Tab 键选中后按 Enter）即可固定它，最多三个；最新固定的节点 ① 显示其感受野。再次点击 ① 可取消固定。')))
  function renderLegend() {
    while (legend.firstChild) legend.removeChild(legend.firstChild)
    var lab = compLabels(state.g), tree = state.g === 'tree'
    var items = tree
      ? [[PURE[0], false, t('OR gate', '或门')], [PURE[1], false, t('AND gate', '与门')], [PURE[2], true, t('basic event', '基本事件')]]
      : [[PURE[0], true, lab[0]], [PURE[1], true, lab[1]], [PURE[2], true, lab[2]]]
    items.forEach(function (it) { legend.appendChild(h('span', null, swatch(it[0], it[1]), it[2])) })
    legend.appendChild(h('span', null, h('span', { 'aria-hidden': 'true', style: { display: 'inline-block', width: '14px', height: '11px', background: ink.skyLight,
      border: '1px dashed ' + ink.sky, borderRadius: '6px', verticalAlign: '-1px', marginRight: '.3rem' } }), t('receptive field of ①', '① 的感受野')))
  }

  // ---------- the numbers: pinned nodes, readouts, chart, eigenvalue strip ----------
  var table = h('table', { class: 'w-table', style: { width: '100%', marginBottom: '.6rem' } })
  var readout = h('div', { class: 'w-readout' })
  var colA = h('div', { class: 'w-col' },
    h('div', { style: { fontSize: '.8rem', fontWeight: '600', color: ink.navy, margin: '0 0 .35rem' } }, t('Pinned nodes at step k', '第 k 步时固定节点的特征')),
    table, readout)
  var chartLegend = h('div', { class: 'w-legend' })
  var eigOut = h('div', { class: 'w-readout', style: { marginTop: '.4rem' } })
  var colB = h('div', { class: 'w-col' })
  el.appendChild(h('div', { class: 'w-row', style: { marginTop: '.8rem' } }, colA, colB))
  var chart = AIW.canvas(colB, { aspect: 0.62, maxHeight: 280 }, drawChart)
  colB.appendChild(chartLegend)
  var strip = AIW.canvas(colB, { aspect: 0.3, maxHeight: 130 }, drawStrip)
  colB.appendChild(eigOut)
  var note = h('p', { class: 'w-note' })
  el.appendChild(note)

  function renderTable(g, Hk, pins) {
    while (table.firstChild) table.removeChild(table.firstChild)
    var lab = compLabels(g.key), left = { textAlign: 'left' }
    table.appendChild(h('tr', null, h('th', { style: left }, ''), h('th', { style: left }, t('node', '节点')),
      h('th', null, swatch(PURE[0], g.key !== 'tree'), lab[0]), h('th', null, swatch(PURE[1], g.key !== 'tree'), lab[1]),
      h('th', null, swatch(PURE[2], true), lab[2])))
    if (!pins.length) {
      table.appendChild(h('tr', null, h('td', { colspan: '5', style: left }, t('Click a node to pin it here.', '点击节点即可固定到这里。'))))
      return
    }
    pins.forEach(function (i, p) {
      var nd = g.nodes[i], v = Hk[i]
      table.appendChild(h('tr', null,
        h('td', { style: { textAlign: 'left', whiteSpace: 'nowrap' } },
          h('span', { style: { display: 'inline-block', width: '1.35em', height: '1.35em', lineHeight: '1.35em', borderRadius: '50%', textAlign: 'center',
            background: ink.navy, color: '#fff', fontWeight: '600', marginRight: '.3rem' } }, String(p + 1)),
          swatch(colourOf(v).css, !(nd.type === OR || nd.type === AND))),
        h('td', { style: left }, h('b', null, nd.id), h('br'),
          h('span', { style: { fontFamily: 'var(--font-body)', fontSize: '.7rem', color: ink.slate } }, nd.desc)),
        h('td', null, fx(v[0])), h('td', null, fx(v[1])), h('td', null, fx(v[2]))))
    })
  }

  function render() {
    var g = G(), r = R(), k = state.k, Hk = r.H[k]
    var pins = state.pins[g.key], focus = pins.length ? pins[0] : -1
    var field = focus >= 0 ? support(g, state.loops, focus, k) : null
    var lab = compLabels(g.key)
    layout()
    g.nodes.forEach(function (nd, i) {
      var ne = nodeEls[i], v = Hk[i], col = colourOf(v), p = pins.indexOf(i)
      ne.shape.style.fill = col.css
      ne.name.style.fill = col.text
      if (ne.type) ne.type.style.fill = col.text
      ne.shape.style.stroke = p >= 0 ? ink.navy : ink.slate
      ne.shape.style.strokeWidth = p >= 0 ? 3 + sz.u : 1.25 + 0.5 * sz.u
      ne.badge.style.display = p >= 0 ? '' : 'none'
      ne.badgeT.textContent = String(p + 1)
      ne.halo.style.display = field && field[i] ? '' : 'none'
      var vec = lab[0] + ' ' + fx(v[0]) + ', ' + lab[1] + ' ' + fx(v[1]) + ', ' + lab[2] + ' ' + fx(v[2])
      var label = nd.id + t(', ', '，') + nd.desc + t(', ', '，') + typeName(nd.type) + t('; features at k = ', '；第 ') + k + t(': ', ' 步特征：') + vec +
        (p >= 0 ? t('; pinned ', '；已固定 ') + (p + 1) : '')
      ne.grp.setAttribute('aria-label', label)
      ne.grp.setAttribute('aria-pressed', p >= 0 ? 'true' : 'false')
      ne.title.textContent = nd.id + ' · ' + nd.desc + '\n' + vec
    })
    edgeEls.forEach(function (ln, e) {
      var on = field && field[g.edges[e][0]] && field[g.edges[e][1]]
      ln.style.stroke = on ? ink.sky : ink.muted
      ln.style.strokeWidth = (on ? 1.6 : 1) * sz.edge
    })
    renderLegend()
    renderTable(g, Hk, pins)

    // readout: k, receptive field, one update step of the newest pin, largest feature, cosine
    var lines = [t('k = ', 'k = ') + k + t(k === 1 ? ' step' : ' steps', ' 步')]
    if (focus >= 0) {
      var nf = field.filter(Boolean).length, fid = g.nodes[focus].id
      lines.push(t('receptive field of ' + fid + ': ' + nf + ' of 12 nodes', fid + ' 的感受野：12 个节点中的 ' + nf + ' 个'))
      var terms = [], row = r.P[focus]
      var order = [focus].concat(g.adj[focus])
      order.forEach(function (j) { if (row[j]) terms.push(fx(row[j]) + '·' + g.nodes[j].id) })
      lines.push(t('one step: ', '一步更新：') + fid + ' ← ' + terms.join(' + ') + '  ' +
        (state.norm === 'sym' ? t('(weights 1/√(d̃ᵢ d̃ⱼ))', '（权重 1/√(d̃ᵢ d̃ⱼ)）')
          : (state.norm === 'rw' ? t('(weights 1/d̃ᵢ: a mean)', '（权重 1/d̃ᵢ：取均值）') : t('(a plain sum)', '（直接求和）'))))
    } else lines.push(t('pin a node to see its receptive field', '固定一个节点即可查看其感受野'))
    lines.push(t('largest |feature| = ', '最大特征绝对值 = ') + fx(r.maxAbs[k]))
    lines.push(t('mean pairwise cosine = ', '两两余弦相似度均值 = ') + fx(r.cos[k]))
    readout.textContent = lines.join('\n')

    // eigenvalue readout
    var l1 = r.lam1, l2 = r.lam2, a2 = Math.abs(l2)
    var e1 = 'λ₁ = ' + fx(l1) + '   λ₂ = ' + fx(l2)
    if (Math.abs(l1 - 1) < 1e-9) e1 += '   |λ₂|^k = ' + fx(Math.pow(a2, k))
    else e1 += '\nλ₁^k = ' + fx(Math.pow(l1, k)) + t(' (growth)', '（增长倍数）') + '   (|λ₂|/λ₁)^k = ' + fx(Math.pow(a2 / l1, k))
    eigOut.textContent = e1

    // chart legend
    while (chartLegend.firstChild) chartLegend.removeChild(chartLegend.firstChild)
    chartLegend.appendChild(h('span', null, h('i', { style: { background: ink.blue } }), t('mean pairwise cosine, this setting', '两两余弦相似度均值（当前设置）')))
    if (!isRef()) chartLegend.appendChild(h('span', null, h('i', { style: { background: 'none', borderTop: '2px dashed ' + ink.muted, height: '0' } }),
      t('symmetric with self-loops', '对称归一化 + 自环')))

    // note for the setting
    var msgs = []
    if (g.key === 'hex') msgs.push(t('Message passing cannot tell a hexagon from two triangles: every node has degree 2 and the same starting vector, so every node keeps the same vector at every k under every setting. (λ = 1 appears three times, once per connected component.)',
      '消息传递无法区分一个六边形和两个三角形：每个节点的度都是 2，初始向量也相同，所以在任何设置下、任何 k 时，所有节点的向量都相同。（λ = 1 出现三次，每个连通分量一次。）'))
    else {
      if (state.norm === 'none') msgs.push(t('No normalisation: each step multiplies by Ã, whose largest eigenvalue is λ₁ = ' + fx(l1) + ', so the features grow like λ₁^k. The colours are scaled per node, so they still show only the mix.',
        '不归一化：每一步都乘以 Ã，其最大特征值 λ₁ = ' + fx(l1) + '，所以特征按 λ₁^k 增长。颜色按节点各自缩放，因此仍然只显示分量的比例。'))
      if (!state.loops) msgs.push(t('Without self-loops this graph is bipartite (a tree or a path has no odd cycle): the propagation matrix has eigenvalue −λ₁, so the features flip between the two colour classes at every step and the cosine oscillates instead of reaching 1.',
        '没有自环时这个图是二部图（树和路径都没有奇数长度的环）：传播矩阵有特征值 −λ₁，于是特征每一步都在两类节点之间来回翻转，余弦相似度振荡而不会趋于 1。'))
      else if (state.norm === 'sym') msgs.push(t('Over-smoothing: as k grows every row approaches √d̃ᵢ times one common vector, so only the degree survives; the remaining difference shrinks like |λ₂|^k.',
        '过平滑：随着 k 增大，每一行都趋于 √d̃ᵢ 乘以同一个公共向量，只剩下度的信息；剩余差异按 |λ₂|^k 衰减。'))
      else if (state.norm === 'rw') msgs.push(t('Over-smoothing: with mean aggregation every row approaches the same vector; the remaining difference shrinks like |λ₂|^k.',
        '过平滑：采用均值聚合时，每一行都趋于同一个向量；剩余差异按 |λ₂|^k 衰减。'))
    }
    note.textContent = msgs.join(' ')

    chart.redraw()
    strip.redraw()
  }
  function isRef() { return state.norm === 'sym' && state.loops }

  function drawChart(ctx, w, hh) {
    var r = R(), k = state.k
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: KMAX, y0: 0, y1: 1, xticks: 8, yticks: 4,
      xlabel: t('propagation steps k', '传播步数 k'), ylabel: t('mean cosine', '余弦相似度均值'),
      xfmt: function (x) { return String(Math.round(x)) }, yfmt: function (y) { return y.toFixed(2) } })
    function line(ys, colour, width, dash) {
      ctx.save(); ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.lineJoin = 'round'
      ctx.beginPath()
      ys.forEach(function (y, i) { var px = ax.X(i), py = ax.Y(y); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py) })
      ctx.stroke(); ctx.restore()
    }
    if (!isRef()) line(compute(state.g, 'sym', true).cos, ink.muted, 1.5, [5, 4])
    line(r.cos, ink.blue, 2.2)
    var px = ax.X(k), py = ax.Y(r.cos[k])
    ctx.save()
    ctx.strokeStyle = ink.orange; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(px, ax.Y(0)); ctx.lineTo(px, ax.Y(1)); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = ink.orange; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, 2 * Math.PI); ctx.fill()
    ctx.font = '600 12px "DM Mono", Consolas, monospace'
    var txt = 'k = ' + k + ': ' + fx(r.cos[k]), tw = ctx.measureText(txt).width
    var tx = k < KMAX / 2 ? px + 8 : px - 8 - tw
    var ty = r.cos[k] > 0.8 ? py + 18 : py - 9
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(tx - 2, ty - 11, tw + 4, 15)
    ctx.fillStyle = ink.orange; ctx.textAlign = 'left'; ctx.fillText(txt, tx, ty)
    ctx.restore()
  }

  function drawStrip(ctx, w, hh) {
    var r = R(), ev = r.ev
    var lo = state.norm === 'none' ? Math.min(-1, ev[N - 1]) - 0.35 : -1.12
    var hi = state.norm === 'none' ? Math.max(1, ev[0]) + 0.35 : 1.12
    var pl = 14, pr = 14, base = hh - 24
    var X = function (v) { return pl + (v - lo) / (hi - lo) * (w - pl - pr) }
    ctx.save()
    ctx.font = '600 12px "DM Sans", system-ui, sans-serif'; ctx.fillStyle = ink.navy; ctx.textAlign = 'left'
    ctx.fillText(t('Eigenvalues of the propagation matrix', '传播矩阵的特征值'), pl, 15)
    ctx.strokeStyle = ink.muted; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(X(lo), base); ctx.lineTo(X(hi), base); ctx.stroke()
    ctx.font = '11px "DM Mono", Consolas, monospace'; ctx.fillStyle = ink.slate; ctx.textAlign = 'center'
    var step = state.norm === 'none' ? 1 : 0.5
    for (var tv = Math.ceil(lo / step) * step; tv <= hi + 1e-9; tv += step) {
      var tx = X(tv)
      ctx.strokeStyle = ink.border; ctx.beginPath(); ctx.moveTo(tx, base - 4); ctx.lineTo(tx, base + 4); ctx.stroke()
      ctx.fillText(String(Math.round(tv * 10) / 10).replace('-', '−'), tx, base + 16)
    }
    // stack equal eigenvalues; lambda_1 is the first of its stack, lambda_2 the next one
    var groups = []
    ev.forEach(function (v, i) {
      var gp = groups.length ? groups[groups.length - 1] : null
      if (gp && Math.abs(gp.v - v) < 1e-6) gp.idx.push(i); else groups.push({ v: v, idx: [i] })
    })
    var dy = Math.min(9, (base - 34) / 6.5), rad = Math.min(4.5, dy * 0.5)
    var tops = {}
    groups.forEach(function (gp) {
      gp.idx.forEach(function (i, m) {
        var x = X(gp.v), y = base - rad - 2 - m * dy
        var is1 = i === 0, is2 = i === r.i2
        ctx.beginPath(); ctx.arc(x, y, is1 || is2 ? rad + 1.5 : rad, 0, 2 * Math.PI)
        ctx.fillStyle = is1 ? ink.orange : (is2 ? ink.purple : ink.slate); ctx.fill()
        if (is1 || is2) tops[is1 ? 1 : 2] = { x: x, y: base - rad - 2 - (gp.idx.length - 1) * dy, gp: gp }
      })
    })
    ctx.font = '600 12px "DM Sans", system-ui, sans-serif'
    if (tops[1] && tops[2] && tops[1].gp === tops[2].gp) {
      ctx.fillStyle = ink.orange; ctx.textAlign = 'right'; ctx.fillText('λ₁', tops[1].x - 1, tops[1].y - 9)
      ctx.fillStyle = ink.purple; ctx.textAlign = 'left'; ctx.fillText(' λ₂', tops[1].x - 1, tops[1].y - 9)
    } else {
      if (tops[1]) { ctx.fillStyle = ink.orange; ctx.textAlign = 'center'; ctx.fillText('λ₁', tops[1].x, tops[1].y - 9) }
      if (tops[2]) { ctx.fillStyle = ink.purple; ctx.textAlign = 'center'; ctx.fillText('λ₂', tops[2].x, tops[2].y - 9) }
    }
    ctx.restore()
  }

  // ---------- play k = 0..40 ----------
  var playing = false, raf = 0, last = 0
  function tick(ts) {
    if (!playing) return
    if (!last || ts - last > 160) {
      last = ts
      if (state.k >= KMAX) { stop(); return }
      state.k++; kSl.set(state.k); render()
    }
    raf = requestAnimationFrame(tick)
  }
  function play() {
    if (state.k >= KMAX) { state.k = 0; kSl.set(0); render() }
    playing = true; last = 0; playBtn.textContent = t('❚❚ Pause', '❚❚ 暂停')
    raf = requestAnimationFrame(tick)
  }
  function stop() {
    playing = false; cancelAnimationFrame(raf); playBtn.textContent = t('▶ Play', '▶ 播放')
  }

  buildSvg()
  render()
  if (window.ResizeObserver) new ResizeObserver(function () { var u = sz && sz.u; layout(); if (sz.u !== u) render() }).observe(svgWrap)
  else window.addEventListener('resize', function () { layout(); render() })
})
