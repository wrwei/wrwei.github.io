/* attention-calculator: Module 06 (The transformer), Section 3.
 * Scaled dot-product attention on two to four tokens, computed exactly in double precision:
 * S = c·QKᵀ/√d_k (the 1/√d_k optional), S_ij = −∞ for j > i under the causal mask, P = softmax(S)
 * row by row with the max subtracted, O = PV. The selected query row is drawn as a mixture of the
 * value rows (d_v = 2: points, their convex hull, lines whose width is the weight) or as a bar
 * chart of its weights (d_v ≠ 2), with its entropy and, on request, the softmax Jacobian and the
 * gradient of the last component of its output. */
(function () {
  'use strict'

  // ---------- numbers and formatting ----------
  var SUBS = '₀₁₂₃₄₅₆₇₈₉'
  function sub(n) { return String(n).replace(/[0-9]/g, function (d) { return SUBS.charAt(Number(d)) }) }
  function fix3(x) { var s = x.toFixed(3); return s === '-0.000' ? '0.000' : s } // ASCII, for the self-check
  function f3(x) {                                     // as displayed: toFixed(3), Unicode minus
    if (x === -Infinity) return '−inf'
    if (!isFinite(x)) return '—'
    return fix3(x).replace('-', '−')
  }
  function vec(xs) { return '(' + xs.map(f3).join(', ') + ')' }
  function clamp10(x) { return Math.max(-10, Math.min(10, x)) }
  function resized(M, r, c) {                          // keep the top-left block, fill the rest with 0
    var out = []
    for (var i = 0; i < r; i++) {
      out.push([])
      for (var j = 0; j < c; j++) out[i].push(M[i] && typeof M[i][j] === 'number' ? M[i][j] : 0)
    }
    return out
  }
  function eye(n) { var I = resized([], n, n); for (var i = 0; i < n; i++) I[i][i] = 1; return I }

  // ---------- the maths ----------
  function attention(st) {
    var T = st.T, raw = [], S = [], P = [], O = [], vis = []
    for (var i = 0; i < T; i++) {
      raw.push([]); S.push([]); vis.push([])
      for (var j = 0; j < T; j++) {
        var d = 0
        for (var a = 0; a < st.dk; a++) d += st.Q[i][a] * st.K[j][a]
        raw[i].push(d)
        var s = st.scale ? d / Math.sqrt(st.dk) : d
        s = s * st.c
        var seen = !st.causal || j <= i               // a causal row always keeps its diagonal
        vis[i].push(seen)
        S[i].push(seen ? s : -Infinity)
      }
      var m = -Infinity
      for (j = 0; j < T; j++) if (vis[i][j] && S[i][j] > m) m = S[i][j]
      var e = [], z = 0
      for (j = 0; j < T; j++) { e.push(vis[i][j] ? Math.exp(S[i][j] - m) : 0); z += e[j] }
      P.push(e.map(function (x) { return x / z }))   // masked entries are 0/z = 0 exactly
      O.push([])
      for (var b = 0; b < st.dv; b++) {
        var o = 0
        for (j = 0; j < T; j++) o += P[i][j] * st.V[j][b]
        O[i].push(o)
      }
    }
    return { raw: raw, S: S, P: P, O: O, vis: vis, factor: (st.scale ? 1 / Math.sqrt(st.dk) : 1) * st.c }
  }

  function rowStats(r, i) {
    var p = r.P[i], vis = r.vis[i], n = 0, mx = -1, H = 0, arg = [], sum = 0
    for (var j = 0; j < p.length; j++) {
      sum += p[j]
      if (!vis[j]) continue
      n++
      if (p[j] > 0) H -= p[j] * Math.log(p[j])
      if (p[j] > mx + 1e-12) { mx = p[j]; arg = [j] } else if (Math.abs(p[j] - mx) <= 1e-12) arg.push(j)
    }
    return { n: n, max: mx, arg: arg, H: H, lnN: Math.log(n), sum: sum }
  }

  // L = O[i][d_v - 1], so g_j = V[j][d_v - 1] and dL/ds_ij = P_ij (g_j - sum_k P_ik g_k) for visible j.
  function rowGrad(st, r, i) {
    var p = r.P[i], vis = r.vis[i], last = st.dv - 1, idx = [], g = [], pg = 0
    for (var j = 0; j < st.T; j++) if (vis[j]) { idx.push(j); g.push(st.V[j][last]); pg += p[j] * st.V[j][last] }
    var dLds = idx.map(function (j, k) { return p[j] * (g[k] - pg) })
    var sum = dLds.reduce(function (a, b) { return a + b }, 0)
    var J = idx.map(function (j) { return idx.map(function (k) { return p[j] * ((j === k ? 1 : 0) - p[k]) }) })
    var dLdq = []
    for (var a = 0; a < st.dk; a++) {
      var s = 0
      for (var k = 0; k < idx.length; k++) s += dLds[k] * st.K[idx[k]][a]
      dLdq.push(s * r.factor)
    }
    return { idx: idx, g: g, pg: pg, L: r.O[i][last], dLds: dLds, sum: sum, J: J, dLdq: dLdq, last: last }
  }

  // The worked example of Section 3 (row 3 selected, index 2).
  function worked() {
    return { T: 3, dk: 2, dv: 2, Q: [[1, 0], [0, 1], [1, 1]], K: [[1, 0], [0, 1], [1, 1]], V: [[1, 0], [0, 2], [3, 3]],
      causal: true, scale: true, c: 1, row: 2, grad: false }
  }

  // Self-check against the values the text prints; a failure is logged as an error.
  var checked = false
  function selfCheck() {
    var errs = []
    function want(label, xs, s) { var got = xs.map(fix3).join(','); if (got !== s) errs.push(label + ' = ' + got + ', expected ' + s) }
    var w = worked(), a = attention(w)
    want('P row 2', a.P[1], '0.330,0.670,0.000')
    if (a.P[1][2] !== 0) errs.push('masked weight P[2][3] is not exactly 0')
    want('O row 2', a.O[1], '0.330,1.340')
    want('P row 3', a.P[2], '0.248,0.248,0.503')
    want('O row 3', a.O[2], '1.759,2.007')
    w = worked(); w.causal = false; want('unmasked P row 1', attention(w).P[0], '0.401,0.198,0.401')
    w = worked(); w.scale = false; want('unscaled P row 3', attention(w).P[2], '0.212,0.212,0.576')
    w = worked(); want('dL/ds row 3', rowGrad(w, attention(w), 2).dLds, '-0.498,-0.002,0.500')
    if (errs.length && window.console) console.error('attention-calculator self-check failed: ' + errs.join('; '))
  }

  // ---------- colours ----------
  function parseColour(s, fb) {
    s = String(s || '').trim()
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s)
    if (m) {
      var hx = m[1].length === 3 ? m[1].replace(/(.)/g, '$1$1') : m[1]
      return [0, 2, 4].map(function (k) { return parseInt(hx.substr(k, 2), 16) })
    }
    m = /^rgba?\(([^)]+)\)$/i.exec(s)
    if (m) {
      var parts = m[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number)
      if (parts.length === 3 && parts.every(isFinite)) return parts
    }
    return fb
  }
  function mix(a, b, u) { return a.map(function (x, k) { return Math.round(x + (b[k] - x) * u) }) }
  function rgb(c, alpha) { return alpha === undefined ? 'rgb(' + c.join(',') + ')' : 'rgba(' + c.join(',') + ',' + alpha + ')' }

  // ---------- styles (scoped to .ac-root) ----------
  var CSS = [
    '.ac-root{--ac-sel:#C2410C}',
    '.ac-root .ac-seg{display:flex;flex-direction:column;gap:.2rem;font-size:.78rem;color:var(--slate)}',
    '.ac-root .ac-seg-l{font-weight:600;color:var(--navy)}',
    '.ac-root .ac-seg-btns{display:flex}',
    '.ac-root .ac-seg-btns button{font-family:var(--font-mono);font-size:.78rem;min-width:2.3rem;padding:.22rem .55rem;border:1px solid var(--blue);background:var(--white);color:var(--blue);cursor:pointer;line-height:1.4}',
    '.ac-root .ac-seg-btns button+button{margin-left:-1px}',
    '.ac-root .ac-seg-btns button:first-child{border-radius:7px 0 0 7px}',
    '.ac-root .ac-seg-btns button:last-child{border-radius:0 7px 7px 0}',
    '.ac-root .ac-seg-btns button[aria-pressed="true"]{background:var(--blue);color:#fff}',
    '.ac-root button:focus-visible,.ac-root input:focus-visible{outline:2px solid var(--sky);outline-offset:2px;position:relative;z-index:1}',
    '.ac-root .ac-check{flex-direction:row;align-items:center;gap:.4rem}',
    '.ac-root .ac-check>span{font-weight:600;color:var(--navy)}',
    '.ac-root .ac-presets{align-items:center;gap:.4rem .45rem}',
    '.ac-root .ac-presets-l{font-size:.78rem;font-weight:600;color:var(--navy);margin-right:.2rem}',
    '.ac-root .ac-presets .w-btn{font-size:.76rem;padding:.22rem .7rem}',
    '.ac-root .ac-section{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:.1rem 0 .3rem}',
    '.ac-root .ac-scroll{overflow-x:auto;padding:.15rem .15rem .55rem;margin-bottom:.35rem}',
    '.ac-root .ac-mats{display:flex;flex-wrap:wrap;gap:.9rem 1.5rem;align-items:flex-start}',
    '.ac-root .ac-mat-h{font-size:.8rem;font-weight:600;color:var(--navy);margin-bottom:.3rem;white-space:nowrap}',
    '.ac-root .ac-dim{font-family:var(--font-mono);font-weight:400;font-size:.7rem;color:var(--slate);margin-left:.4rem}',
    '.ac-root .ac-mnote{font-size:.72rem;color:var(--slate);margin-top:.25rem;max-width:16rem;line-height:1.45}',
    '.ac-root .w-matrix input[type=number]{width:4.1rem}',
    '.ac-root .w-matrix input.ac-qsel{border-color:var(--ac-sel);box-shadow:0 0 0 1px var(--ac-sel)}',
    '.ac-root table.ac-t{border-collapse:separate;border-spacing:2px;font-family:var(--font-mono);font-size:.74rem}',
    '.ac-root .ac-t th{font-weight:400;font-size:.68rem;color:var(--slate);padding:0 .2rem;text-align:center;background:none}',
    '.ac-root .ac-t td{min-width:3.3rem;padding:.2rem .35rem;text-align:right;border-radius:3px;background:var(--code-bg);color:var(--navy);white-space:nowrap}',
    '.ac-root .ac-t td.ac-heat{box-shadow:inset 0 0 0 1px var(--border)}',
    '.ac-root .ac-t td.ac-masked{background:repeating-linear-gradient(135deg,#E2E8F0 0 3px,#F1F5F9 3px 6px);color:var(--slate);box-shadow:none}',
    '.ac-root .ac-t td.ac-sum{background:none;color:var(--slate);min-width:2.8rem}',
    '.ac-root .ac-t tr.ac-sel td{box-shadow:inset 0 0 0 2px var(--ac-sel)}',
    '.ac-root .ac-t tr.ac-sel td.ac-sum{box-shadow:none;color:var(--ac-sel)}',
    '.ac-root .ac-heat-t tbody tr{cursor:pointer}',
    '.ac-root .ac-rowbtn{font-family:var(--font-mono);font-size:.72rem;min-width:2rem;padding:.12rem .3rem;border:1px solid var(--border);border-radius:5px;background:var(--white);color:var(--slate);cursor:pointer}',
    '.ac-root .ac-rowbtn[aria-pressed="true"]{background:var(--ac-sel);border-color:var(--ac-sel);color:#fff}',
    '.ac-root .ac-badge{display:inline-block;margin-left:.5rem;padding:0 .5rem;border-radius:999px;background:var(--orange-bg);color:var(--orange);border:1px solid var(--orange);font-family:var(--font-body);font-size:.7rem;font-weight:600;line-height:1.5}',
    '.ac-root .ac-readout{margin-top:.5rem}',
    '.ac-root .ac-readout .ac-head{font-weight:500;color:var(--ac-sel)}',
    '.ac-root .ac-grad{margin-top:.5rem}',
    '.ac-root .ac-grad table{margin-top:.3rem}',
    '.ac-root .ac-dimtext{color:var(--slate)}',
    '.ac-root .ac-legend i{display:inline-block;vertical-align:middle;margin-right:.3rem}',
    '@media(max-width:600px){.ac-root .ac-mats{flex-direction:column}}'
  ].join('\n')
  function injectStyle() {
    if (document.getElementById('ac-style')) return
    document.head.appendChild(AIW.h('style', { id: 'ac-style', text: CSS }))
  }

  // ---------- plotting helpers ----------
  var MONO = '11px "DM Mono", Consolas, monospace'
  var SANS = '12px "DM Sans", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
  function niceStep(raw) {
    var p = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / p
    return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p
  }
  function tickText(v, step) {
    var dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) + (String(step / Math.pow(10, Math.floor(Math.log10(step)))).indexOf('.') >= 0 ? 1 : 0)
    var s = v.toFixed(dec)
    if (Number(s) === 0) s = (0).toFixed(dec)
    return s.replace('-', '−')
  }
  function convexHull(points) {
    var pts = points.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1] })
    var u = []
    pts.forEach(function (q) { var l = u[u.length - 1]; if (!l || Math.abs(l[0] - q[0]) > 1e-12 || Math.abs(l[1] - q[1]) > 1e-12) u.push(q) })
    if (u.length < 3) return u
    var cross = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]) }
    var lower = [], upper = []
    u.forEach(function (q) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 1e-12) lower.pop(); lower.push(q) })
    for (var k = u.length - 1; k >= 0; k--) {
      var q = u[k]
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 1e-12) upper.pop()
      upper.push(q)
    }
    upper.pop(); lower.pop()
    return lower.concat(upper)
  }

  AIW.register('attention-calculator', function (el) {
    var t = AIW.t, h = AIW.h, C = AIW.C
    if (!checked) { checked = true; selfCheck() }
    injectStyle()
    el.classList.add('ac-root')

    var st = worked()
    var res = null

    function mathI(tex) { return h('span', { class: 'math-i' }, tex) }
    function append(parent, kids) {
      kids.forEach(function (k) { if (k != null && k !== false) parent.appendChild(typeof k === 'string' ? document.createTextNode(k) : k) })
      return parent
    }
    function clear(node) { while (node.firstChild) node.removeChild(node.firstChild) }
    function line(parent, kids, cls) { return parent.appendChild(append(h('div', cls ? { class: cls } : null), [].concat(kids))) }

    // ---------- controls ----------
    function seg(labelKids, aria, values, get, set) {
      var group = h('div', { class: 'ac-seg-btns', role: 'group', 'aria-label': aria })
      var btns = values.map(function (v) {
        return group.appendChild(h('button', { type: 'button', 'aria-pressed': 'false', onclick: function () { set(v) } }, String(v)))
      })
      var wrap = h('div', { class: 'ac-seg' }, append(h('span', { class: 'ac-seg-l' }), labelKids), group)
      wrap.sync = function () { btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(values[k] === get())) }) }
      return wrap
    }
    function check(labelKids, on, onChange) {
      var box = h('input', { type: 'checkbox' })
      box.checked = on
      box.addEventListener('change', function () { onChange(box.checked) })
      var wrap = h('label', { class: 'w-ctl ac-check' }, box, append(h('span'), labelKids))
      wrap.box = box
      return wrap
    }

    var segT = seg([t('tokens ', 'token 数 '), mathI('T')], t('number of tokens T', 'token 数 T'), [2, 3, 4],
      function () { return st.T }, setT)
    var segDk = seg([t('key width ', '键的维度 '), mathI('d_k')], 'd_k', [1, 2, 3, 4], function () { return st.dk }, setDk)
    var segDv = seg([t('value width ', '值的维度 '), mathI('d_v')], 'd_v', [1, 2, 3, 4], function () { return st.dv }, setDv)
    var cbCausal = check([t('causal mask', '因果掩码')], st.causal, function (v) { st.causal = v; update() })
    var cbScale = check([t('divide by ', '除以 '), mathI('\\sqrt{d_k}')], st.scale, function (v) { st.scale = v; update() })
    var slC = AIW.slider({ label: t('sharpness c (every score × c)', '锐度系数 c（每个分数 × c）'), min: 0.1, max: 20, value: 1, log: true,
      fmt: function (v) { return 'c = ' + v.toPrecision(3) }, onInput: function (v) { st.c = v; update() } })
    var cbGrad = check([t('show gradient', '显示梯度')], st.grad, function (v) { st.grad = v; update() })

    function preset(en, zh, fn) { return AIW.button(t(en, zh), fn, true) }
    var presets = [
      preset('worked example', '手算例题', function () { var g = st.grad; st = worked(); st.grad = g; rebuild() }),
      preset('unmasked', '无掩码', function () { var g = st.grad; st = worked(); st.grad = g; st.causal = false; st.row = 0; rebuild() }),
      preset('unscaled', '不缩放', function () { var g = st.grad; st = worked(); st.grad = g; st.scale = false; rebuild() }),
      preset('V = identity', 'V = 单位矩阵', function () { st.dv = st.T; st.V = eye(st.T); rebuild() }),
      preset('hard lookup (c = 20)', '硬查找（c = 20）', function () { st.c = 20; syncControls(); update() }),
      preset('reset', '重置', function () { st = worked(); rebuild() })
    ]

    function setT(v) {
      st.T = v
      st.Q = resized(st.Q, v, st.dk); st.K = resized(st.K, v, st.dk); st.V = resized(st.V, v, st.dv)
      st.row = Math.min(st.row, v - 1)
      rebuild()
    }
    function setDk(v) { st.dk = v; st.Q = resized(st.Q, st.T, v); st.K = resized(st.K, st.T, v); rebuild() }
    function setDv(v) { st.dv = v; st.V = resized(st.V, st.T, v); rebuild() }
    function syncControls() {
      segT.sync(); segDk.sync(); segDv.sync()
      cbCausal.box.checked = st.causal; cbScale.box.checked = st.scale; cbGrad.box.checked = st.grad
      slC.set(st.c)
    }

    // ---------- matrix blocks ----------
    function block(headKids) {
      var dim = h('span', { class: 'ac-dim' })
      var body = h('div')
      var note = h('div', { class: 'ac-mnote' })
      var wrap = h('div', { class: 'ac-mat' }, append(h('div', { class: 'ac-mat-h' }), headKids.concat([dim])), body, note)
      return { wrap: wrap, dim: dim, body: body, note: note }
    }
    var bQ = block([mathI('Q')]), bK = block([mathI('K')]), bV = block([mathI('V')])
    var bRaw = block([t('raw scores ', '原始分数 '), mathI('QK^\\top')])
    var hScaled = mathI('S = c\\,QK^\\top/\\sqrt{d_k}'), hUnscaled = mathI('S = c\\,QK^\\top')
    var bS = block([t('scores ', '分数 '), hScaled, hUnscaled])
    var bP = block([t('weights ', '权重 '), mathI('P = \\operatorname{softmax}(S)')])
    var bO = block([t('output ', '输出 '), mathI('O = PV')])
    bRaw.note.textContent = t('entry (i, j) = qᵢ · kⱼ', '第 (i, j) 项 = qᵢ · kⱼ')
    bP.note.textContent = t('Each row sums to 1. Click a row, or use ↑/↓ on its button, to choose the query.',
      '每行之和为 1。点击某一行，或在行按钮上按 ↑/↓，选择查询行。')
    bO.note.textContent = t('row i = Σⱼ Pᵢⱼ vⱼ', '第 i 行 = Σⱼ Pᵢⱼ vⱼ')

    var inputs = { Q: [], K: [], V: [] }
    function numInput(name, i, j) {
      var inp = h('input', { type: 'number', step: '0.1', min: '-10', max: '10', value: String(st[name][i][j]),
        'aria-label': t(name + ' row ' + (i + 1) + ', column ' + (j + 1), name + ' 第 ' + (i + 1) + ' 行第 ' + (j + 1) + ' 列') })
      function read(commit) {
        var txt = inp.value, v = Number(txt)
        if (txt.trim() === '' || !isFinite(v)) {        // keep the previous value; restore the field on commit
          if (commit) inp.value = String(st[name][i][j])
          return
        }
        var cv = clamp10(v)
        if (cv !== v) inp.value = String(cv)
        if (cv === 0) cv = 0                            // no −0
        if (st[name][i][j] !== cv) { st[name][i][j] = cv; update() }
      }
      inp.addEventListener('input', function () { read(false) })
      inp.addEventListener('change', function () { read(true) })
      return inp
    }
    function buildInputs() {
      [['Q', bQ, st.dk], ['K', bK, st.dk], ['V', bV, st.dv]].forEach(function (spec) {
        var name = spec[0], b = spec[1], cols = spec[2]
        clear(b.body)
        b.dim.textContent = '(' + st.T + ' × ' + cols + ')'
        var grid = h('div', { class: 'w-matrix', style: { gridTemplateColumns: 'repeat(' + cols + ', auto)' } })
        inputs[name] = []
        for (var i = 0; i < st.T; i++) {
          inputs[name].push([])
          for (var j = 0; j < cols; j++) inputs[name][i].push(grid.appendChild(numInput(name, i, j)))
        }
        b.body.appendChild(grid)
      })
    }

    var cells = null
    function headRow(cols, lead, tail) {
      var tr = h('tr', null, h('th'))
      cols.forEach(function (c) { tr.appendChild(h('th', { scope: 'col' }, c)) })
      if (tail) tr.appendChild(h('th', { scope: 'col' }, tail))
      return h('thead', null, tr)
    }
    function keyCols() { var a = []; for (var j = 1; j <= st.T; j++) a.push('k' + sub(j)); return a }
    function buildTables() {
      var T = st.T, i, j
      cells = { raw: [], S: [], P: [], sum: [], O: [], rows: [], btn: [] }
      ;[['raw', bRaw], ['S', bS]].forEach(function (spec) {
        var key = spec[0], b = spec[1], tb = h('tbody')
        clear(b.body); b.dim.textContent = '(' + T + ' × ' + T + ')'
        for (var i = 0; i < T; i++) {
          var tr = tb.appendChild(h('tr', null, h('th', { scope: 'row' }, 'q' + sub(i + 1))))
          cells[key].push([])
          for (var j = 0; j < T; j++) cells[key][i].push(tr.appendChild(h('td')))
          cells.rows.push(tr)
        }
        b.body.appendChild(h('table', { class: 'ac-t', 'aria-label': key === 'raw' ? 'QKᵀ' : 'S' }, headRow(keyCols()), tb))
      })
      // the weight heat map, with the row selector
      clear(bP.body); bP.dim.textContent = '(' + T + ' × ' + T + ')'
      var tbP = h('tbody')
      for (i = 0; i < T; i++) {
        (function (i) {
          var btn = h('button', { type: 'button', class: 'ac-rowbtn', 'aria-pressed': 'false',
            'aria-label': t('query row ' + (i + 1), '查询行 ' + (i + 1)) }, 'q' + sub(i + 1))
          btn.addEventListener('keydown', function (e) {
            var k = e.key, to = null
            if (k === 'ArrowUp' || k === 'ArrowLeft') to = st.row - 1
            else if (k === 'ArrowDown' || k === 'ArrowRight') to = st.row + 1
            else if (k === 'Home') to = 0
            else if (k === 'End') to = st.T - 1
            if (to === null) return
            e.preventDefault()
            selectRow(to, true)
          })
          var tr = tbP.appendChild(h('tr', { onclick: function () { selectRow(i, false) } }, h('th', { scope: 'row' }, btn)))
          cells.P.push([])
          for (var j = 0; j < T; j++) cells.P[i].push(tr.appendChild(h('td', { class: 'ac-heat' })))
          cells.sum.push(tr.appendChild(h('td', { class: 'ac-sum' })))
          cells.btn.push(btn)
          cells.rows.push(tr)
        })(i)
      }
      bP.body.appendChild(h('table', { class: 'ac-t ac-heat-t', 'aria-label': 'P' }, headRow(keyCols(), null, 'Σ'), tbP))
      // the output
      clear(bO.body); bO.dim.textContent = '(' + T + ' × ' + st.dv + ')'
      var tbO = h('tbody'), comp = []
      for (j = 1; j <= st.dv; j++) comp.push(String(j))
      for (i = 0; i < T; i++) {
        var tr = tbO.appendChild(h('tr', null, h('th', { scope: 'row' }, 'o' + sub(i + 1))))
        cells.O.push([])
        for (j = 0; j < st.dv; j++) cells.O[i].push(tr.appendChild(h('td')))
        cells.rows.push(tr)
      }
      bO.body.appendChild(h('table', { class: 'ac-t', 'aria-label': 'O' }, headRow(comp), tbO))
    }

    function selectRow(i, focus) {
      st.row = Math.max(0, Math.min(st.T - 1, i))
      update()
      if (focus && cells.btn[st.row]) cells.btn[st.row].focus()
    }

    // ---------- layout ----------
    var readout = h('div', { class: 'w-readout ac-readout' })
    var gradBox = h('div', { class: 'w-readout ac-grad', hidden: true })
    var plotCol = h('div', { class: 'w-col' })
    var plot = AIW.canvas(plotCol, { aspect: 0.8, maxHeight: 360 }, draw)
    function legendItem(style, text) { return h('span', null, h('i', { style: style }), text) }
    var legend = h('div', { class: 'w-legend ac-legend' },
      legendItem({ width: '9px', height: '9px', borderRadius: '50%', background: C.navy }, t('value rows vⱼ', '值向量 vⱼ')),
      legendItem({ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid ' + C.orange, boxSizing: 'border-box' }, t('output of the chosen row', '所选行的输出')),
      legendItem({ width: '16px', height: '5px', borderRadius: '2px', background: 'rgba(37,99,235,.6)' }, t('line width ∝ weight', '线宽 ∝ 权重')),
      legendItem({ width: '14px', height: '10px', borderRadius: '2px', background: 'rgba(14,165,233,.22)', border: '1px solid ' + C.sky, boxSizing: 'border-box' }, t('convex hull of the visible values', '可见值向量的凸包')))
    var barNote = h('p', { class: 'w-note', hidden: true })
    plotCol.appendChild(legend)
    plotCol.appendChild(barNote)
    var infoCol = h('div', { class: 'w-col' }, cbGrad, readout, gradBox)

    append(el, [
      h('div', { class: 'w-controls' }, segT, segDk, segDv),
      h('div', { class: 'w-controls' }, cbCausal, cbScale, slC),
      append(h('div', { class: 'w-controls ac-presets' }, h('span', { class: 'ac-presets-l' }, t('Presets', '预设'))), presets),
      h('div', { class: 'ac-section' }, t('Inputs (editable, each entry in [−10, 10])', '输入（可编辑，每个元素在 [−10, 10] 内）')),
      h('div', { class: 'ac-scroll' }, h('div', { class: 'ac-mats' }, bQ.wrap, bK.wrap, bV.wrap)),
      h('div', { class: 'ac-section' }, t('Computed', '计算结果')),
      h('div', { class: 'ac-scroll' }, h('div', { class: 'ac-mats' }, bRaw.wrap, bS.wrap, bP.wrap, bO.wrap)),
      h('div', { class: 'w-row' }, plotCol, infoCol)
    ])

    // ---------- update ----------
    function rebuild() { buildInputs(); buildTables(); syncControls(); update() }

    function update() {
      res = attention(st)
      var cs = window.getComputedStyle(el)
      var tok = function (n, fb) { return parseColour(cs.getPropertyValue(n), parseColour(fb)) }
      var bg = tok('--white', '#FFFFFF'), strong = mix(tok('--blue', C.blue), tok('--navy', C.navy), 0.5), ink = rgb(tok('--code-text', '#0F172A'))
      var T = st.T, i, j
      for (i = 0; i < T; i++) {
        for (j = 0; j < T; j++) {
          var seen = res.vis[i][j]
          cells.raw[i][j].textContent = f3(res.raw[i][j])
          var sc = cells.S[i][j]
          sc.textContent = seen ? f3(res.S[i][j]) : '−inf'
          sc.classList.toggle('ac-masked', !seen)
          var pc = cells.P[i][j], p = res.P[i][j]
          pc.classList.toggle('ac-masked', !seen)
          if (seen) {
            pc.textContent = f3(p)
            pc.style.background = rgb(mix(bg, strong, Math.pow(Math.max(0, Math.min(1, p)), 0.6)))
            pc.style.color = p > 0.6 ? '#FFFFFF' : ink
          } else {
            pc.textContent = '0'
            pc.style.background = ''
            pc.style.color = ''
          }
        }
        cells.sum[i].textContent = f3(res.P[i].reduce(function (a, b) { return a + b }, 0))
        for (j = 0; j < st.dv; j++) cells.O[i][j].textContent = f3(res.O[i][j])
        var on = i === st.row
        cells.btn[i].setAttribute('aria-pressed', String(on))
        cells.btn[i].tabIndex = on ? 0 : -1
        for (j = 0; j < inputs.Q[i].length; j++) inputs.Q[i][j].classList.toggle('ac-qsel', on)
      }
      cells.rows.forEach(function (tr) { tr.classList.remove('ac-sel') })
      ;[cells.raw, cells.S, cells.P, cells.O].forEach(function (M) { M[st.row][0].parentNode.classList.add('ac-sel') })
      hScaled.hidden = !st.scale
      hUnscaled.hidden = st.scale
      bS.note.textContent = (st.scale
        ? t('factor c/√dₖ = ', '系数 c/√dₖ = ') + st.c.toPrecision(3) + '/√' + st.dk + ' = ' + f3(res.factor)
        : t('factor c = ', '系数 c = ') + st.c.toPrecision(3) + t(' (not divided by √dₖ)', '（未除以 √dₖ）')) +
        (st.causal ? t('; −inf where j > i (causal mask)', '；j > i 处为 −inf（因果掩码）') : '')
      renderReadout()
      renderGrad()
      legend.hidden = st.dv !== 2
      barNote.hidden = st.dv === 2
      barNote.textContent = t('With dᵥ = ' + st.dv + ' the outputs are not points in a plane, so the chart shows the chosen row’s weights. Set dᵥ = 2 for the geometric picture.',
        'dᵥ = ' + st.dv + ' 时输出不是平面上的点，所以图中画的是所选行的权重。把 dᵥ 设为 2 可看到几何图。')
      plot.redraw()
    }

    function renderReadout() {
      clear(readout)
      var i = st.row, I = i + 1, p = res.P[i], vis = res.vis[i], s = rowStats(res, i)
      var keys = s.n === 1 ? t('key 1', '键 1') : t('keys 1–' + s.n, '键 1–' + s.n)
      line(readout, t('Row ' + I + ' (query q' + sub(I) + ') sees ' + keys, '第 ' + I + ' 行（查询 q' + sub(I) + '）可见' + keys), 'ac-head')
      line(readout, 'p' + sub(I) + ' = (' + p.map(function (x, j) { return vis[j] ? f3(x) : '0' }).join(', ') + ')   Σ = ' + f3(s.sum))
      line(readout, 'o' + sub(I) + ' = Σⱼ p' + sub(I) + 'ⱼ vⱼ = ' + vec(res.O[i]))
      var big = line(readout, t('largest weight ', '最大权重 ') + f3(s.max) + ' (' + t(s.arg.length > 1 ? 'keys ' : 'key ', '键 ') +
        s.arg.map(function (j) { return j + 1 }).join(', ') + ')')
      if (s.max > 0.99) big.appendChild(h('span', { class: 'ac-badge' }, t('saturated', '饱和')))
      line(readout, t('entropy H = ', '熵 H = ') + f3(s.H) + t(' nats', ' 奈特') + '   ln ' + s.n + ' = ' + f3(s.lnN) +
        t(' (uniform over the visible keys)', '（可见键上均匀分布时）'))
      if (s.n === 1) line(readout, t('Only one key is visible, so its weight is 1 whatever its score.', '只有一个可见的键，所以无论分数多少，它的权重都是 1。'), 'ac-dimtext')
    }

    function renderGrad() {
      gradBox.hidden = !st.grad
      clear(gradBox)
      if (!st.grad) return
      var i = st.row, I = i + 1, G = rowGrad(st, res, i), d = sub(st.dv), si = 's' + sub(I)
      line(gradBox, t('L = o' + sub(I) + ',' + d + ' = ' + f3(G.L) + ', the last component of output row ' + I,
        'L = o' + sub(I) + ',' + d + ' = ' + f3(G.L) + '，即第 ' + I + ' 行输出的最后一个分量'), 'ac-head')
      line(gradBox, 'gⱼ = vⱼ,' + d + ' = ' + vec(G.g) + '   Σₖ pₖgₖ = ' + f3(G.pg))
      line(gradBox, '∂L/∂' + si + 'ⱼ = pⱼ (gⱼ − Σₖ pₖgₖ) = ' + vec(G.dLds))
      line(gradBox, t('sum = ', '之和 = ') + f3(G.sum) + t(' (each row of the Jacobian sums to 0)', '（雅可比矩阵每行之和为 0）'), 'ac-dimtext')
      line(gradBox, '∂L/∂q' + sub(I) + ' = ' + f3(G.dLdq.length ? res.factor : 0) + ' × Σⱼ (∂L/∂' + si + 'ⱼ) kⱼ = ' + vec(G.dLdq))
      line(gradBox, t('softmax Jacobian ∂p/∂s = diag(p) − ppᵀ over the visible keys:', '可见键上 softmax 的雅可比矩阵 ∂p/∂s = diag(p) − ppᵀ：'))
      var cols = G.idx.map(function (j) { return 's' + sub(j + 1) })
      var tb = h('tbody')
      G.J.forEach(function (row, a) {
        var tr = tb.appendChild(h('tr', null, h('th', { scope: 'row' }, 'p' + sub(G.idx[a] + 1))))
        row.forEach(function (x) { tr.appendChild(h('td', null, f3(x))) })
        tr.appendChild(h('td', null, f3(row.reduce(function (u, v) { return u + v }, 0))))
      })
      gradBox.appendChild(h('table', { class: 'w-table' }, headRow(cols, null, 'Σ'), tb))
    }

    // ---------- drawing ----------
    function draw(ctx, W, H) {
      if (!res) return
      if (st.dv === 2) drawGeometry(ctx, W, H)
      else drawBars(ctx, W, H)
    }

    function drawGeometry(ctx, W, H) {
      var i = st.row, p = res.P[i], vis = res.vis[i], T = st.T
      var vals = st.V.map(function (v) { return [v[0], v[1]] })
      var outs = res.O.map(function (o) { return [o[0], o[1]] })
      var all = vals.concat(outs)
      var minX = Math.min.apply(null, all.map(function (q) { return q[0] })), maxX = Math.max.apply(null, all.map(function (q) { return q[0] }))
      var minY = Math.min.apply(null, all.map(function (q) { return q[1] })), maxY = Math.max.apply(null, all.map(function (q) { return q[1] }))
      var span = Math.max(maxX - minX, maxY - minY, 1), m = 0.12 * span + 0.3
      var pad = { l: 40, r: 12, t: 26, b: 34 }
      var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b
      var upp = Math.max((maxX - minX + 2 * m) / pw, (maxY - minY + 2 * m) / ph)   // equal scale on both axes
      var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
      var x0 = cx - upp * pw / 2, x1 = cx + upp * pw / 2, y0 = cy - upp * ph / 2, y1 = cy + upp * ph / 2
      var X = function (x) { return pad.l + (x - x0) / upp }
      var Y = function (y) { return pad.t + ph - (y - y0) / upp }
      ctx.save()
      // grid and ticks
      var step = niceStep(Math.max(x1 - x0, y1 - y0) / 7)
      ctx.lineWidth = 1; ctx.strokeStyle = C.border; ctx.fillStyle = C.slate; ctx.font = MONO
      var k
      for (k = Math.ceil(x0 / step); k * step <= x1 + 1e-9; k++) {
        var px = X(k * step)
        ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, pad.t + ph); ctx.stroke()
        ctx.textAlign = 'center'; ctx.fillText(tickText(k * step, step), px, pad.t + ph + 14)
      }
      for (k = Math.ceil(y0 / step); k * step <= y1 + 1e-9; k++) {
        var py = Y(k * step)
        ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(pad.l + pw, py); ctx.stroke()
        ctx.textAlign = 'right'; ctx.fillText(tickText(k * step, step), pad.l - 6, py + 4)
      }
      ctx.strokeStyle = C.muted
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke()
      ctx.font = SANS; ctx.fillStyle = C.navy; ctx.textAlign = 'center'
      ctx.fillText(t('component 1', '分量 1'), pad.l + pw / 2, H - 4)
      ctx.save(); ctx.translate(12, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(t('component 2', '分量 2'), 0, 0); ctx.restore()
      ctx.textAlign = 'left'; ctx.fillStyle = C.navy
      ctx.fillText(t('Row ' + (i + 1) + ': weighted output', '第 ' + (i + 1) + ' 行：加权输出'), pad.l, 16)
      // clip the data layer to the plot area
      ctx.save()
      ctx.beginPath(); ctx.rect(pad.l, pad.t, pw, ph); ctx.clip()
      // convex hull of the visible values
      var visPts = vals.filter(function (q, j) { return vis[j] })
      var hull = convexHull(visPts)
      if (hull.length >= 3) {
        ctx.beginPath()
        hull.forEach(function (q, a) { if (a === 0) ctx.moveTo(X(q[0]), Y(q[1])); else ctx.lineTo(X(q[0]), Y(q[1])) })
        ctx.closePath()
        ctx.fillStyle = 'rgba(14,165,233,0.16)'; ctx.fill()
        ctx.strokeStyle = 'rgba(14,165,233,0.7)'; ctx.lineWidth = 1; ctx.stroke()
      } else if (hull.length === 2) {
        ctx.beginPath(); ctx.moveTo(X(hull[0][0]), Y(hull[0][1])); ctx.lineTo(X(hull[1][0]), Y(hull[1][1]))
        ctx.strokeStyle = 'rgba(14,165,233,0.28)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt'
      }
      // lines from each visible value to the output, width proportional to its weight
      var o = outs[i]
      ctx.strokeStyle = 'rgba(37,99,235,0.55)'
      for (var j = 0; j < T; j++) {
        if (!vis[j] || p[j] <= 0) continue
        ctx.lineWidth = Math.max(0.75, 14 * p[j])
        ctx.beginPath(); ctx.moveTo(X(vals[j][0]), Y(vals[j][1])); ctx.lineTo(X(o[0]), Y(o[1])); ctx.stroke()
      }
      // the other rows' outputs, faint
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.muted
      for (k = 0; k < T; k++) {
        if (k === i) continue
        ctx.beginPath(); ctx.arc(X(outs[k][0]), Y(outs[k][1]), 4, 0, 2 * Math.PI); ctx.stroke()
      }
      // value points
      for (j = 0; j < T; j++) {
        ctx.beginPath(); ctx.arc(X(vals[j][0]), Y(vals[j][1]), 5, 0, 2 * Math.PI)
        if (vis[j]) { ctx.fillStyle = C.navy; ctx.fill() } else { ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = C.muted; ctx.stroke() }
      }
      // the chosen output: hollow marker
      ctx.beginPath(); ctx.arc(X(o[0]), Y(o[1]), 7, 0, 2 * Math.PI)
      ctx.lineWidth = 2.5; ctx.strokeStyle = C.orange; ctx.stroke()
      ctx.restore()
      // labels (unclipped, kept inside the canvas)
      var placed = []
      function label(x, y, parts, prefer) {
        ctx.font = SANS
        var wsum = parts.reduce(function (a, q) { ctx.font = q.font || SANS; return a + ctx.measureText(q.text).width }, 0)
        var cands = prefer.map(function (d) {
          var lx = d[0] >= 0 ? x + d[0] : x + d[0] - wsum
          return [lx, y + d[1]]
        })
        var best = cands[0], bestScore = Infinity
        cands.forEach(function (c) {
          var bx = [c[0], c[1] - 11, c[0] + wsum, c[1] + 3], score = 0
          if (bx[0] < 2 || bx[2] > W - 2 || bx[1] < pad.t - 4 || bx[3] > pad.t + ph - 2) score += 100
          placed.forEach(function (q) { if (bx[0] < q[2] && bx[2] > q[0] && bx[1] < q[3] && bx[3] > q[1]) score += 10 })
          if (score < bestScore) { bestScore = score; best = c }
        })
        var lx = Math.max(2, Math.min(W - 2 - wsum, best[0])), cx2 = lx
        ctx.textAlign = 'left'
        parts.forEach(function (q) { ctx.font = q.font || SANS; ctx.fillStyle = q.color; ctx.fillText(q.text, cx2, best[1]); cx2 += ctx.measureText(q.text).width })
        placed.push([lx, best[1] - 11, lx + wsum, best[1] + 3])
      }
      var around = [[8, -8], [-8, -8], [8, 16], [-8, 16]]
      var bold = '600 12px "DM Sans", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
      label(X(o[0]), Y(o[1]), [{ text: 'o' + sub(i + 1), color: C.orange, font: bold }], [[10, 16], [-10, 16], [10, -10], [-10, -10]])
      for (j = 0; j < T; j++) {
        var parts = [{ text: 'v' + sub(j + 1), color: vis[j] ? C.navy : C.muted, font: bold }]
        parts.push(vis[j] ? { text: ' ' + f3(p[j]), color: C.blue, font: MONO } : { text: ' ' + t('masked', '已掩码'), color: C.muted })
        label(X(vals[j][0]), Y(vals[j][1]), parts, around)
      }
      for (k = 0; k < T; k++) {
        if (k === i) continue
        label(X(outs[k][0]), Y(outs[k][1]), [{ text: 'o' + sub(k + 1), color: C.muted }], [[-7, 15], [7, 15], [-7, -7], [7, -7]])
      }
      ctx.restore()
    }

    function drawBars(ctx, W, H) {
      var i = st.row, p = res.P[i], vis = res.vis[i], T = st.T, s = rowStats(res, i)
      var pad = { l: 44, r: 12, t: 30, b: 34 }
      var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b
      var Y = function (v) { return pad.t + ph * (1 - v) }
      ctx.save()
      ctx.font = MONO; ctx.lineWidth = 1
      for (var k = 0; k <= 4; k++) {
        var v = k / 4, py = Y(v)
        ctx.strokeStyle = C.border; ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(pad.l + pw, py); ctx.stroke()
        ctx.fillStyle = C.slate; ctx.textAlign = 'right'; ctx.fillText(v.toFixed(2), pad.l - 6, py + 4)
      }
      ctx.strokeStyle = C.muted
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke()
      ctx.font = SANS; ctx.fillStyle = C.navy; ctx.textAlign = 'left'
      ctx.fillText(t('Weights of row ' + (i + 1) + ' (query q' + sub(i + 1) + ')', '第 ' + (i + 1) + ' 行（查询 q' + sub(i + 1) + '）的权重'), pad.l, 16)
      ctx.save(); ctx.translate(12, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(t('weight', '权重'), 0, 0); ctx.restore()
      var slot = pw / T, bw = Math.min(64, slot * 0.6)
      for (var j = 0; j < T; j++) {
        var cx = pad.l + slot * (j + 0.5)
        ctx.font = SANS; ctx.fillStyle = C.navy; ctx.textAlign = 'center'
        ctx.fillText('k' + sub(j + 1), cx, pad.t + ph + 16)
        if (vis[j]) {
          ctx.fillStyle = 'rgba(37,99,235,0.78)'
          ctx.fillRect(cx - bw / 2, Y(p[j]), bw, Y(0) - Y(p[j]))
          ctx.font = MONO; ctx.fillStyle = C.navy
          ctx.fillText(f3(p[j]), cx, Math.max(pad.t + 10, Y(p[j]) - 5))
        } else {
          ctx.strokeStyle = C.muted; ctx.setLineDash([3, 3])
          ctx.strokeRect(cx - bw / 2, Y(1), bw, Y(0) - Y(1))
          ctx.setLineDash([])
          ctx.font = SANS; ctx.fillStyle = C.muted
          ctx.fillText(t('masked', '已掩码'), cx, Y(0.5))
          ctx.font = MONO; ctx.fillText('0', cx, Y(0) - 5)
        }
      }
      // the uniform level 1/n over the visible keys
      var u = 1 / s.n
      ctx.strokeStyle = C.orange; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4])
      ctx.beginPath(); ctx.moveTo(pad.l, Y(u)); ctx.lineTo(pad.l + pw, Y(u)); ctx.stroke(); ctx.setLineDash([])
      ctx.font = MONO; ctx.fillStyle = C.orange; ctx.textAlign = 'right'
      ctx.fillText('1/' + s.n + ' = ' + f3(u), pad.l + pw - 2, Y(u) - 4)
      ctx.restore()
    }

    rebuild()
  })
})()
