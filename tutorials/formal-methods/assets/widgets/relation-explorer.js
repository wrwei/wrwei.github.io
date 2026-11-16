// Relation explorer (Module 4): a relation on {1, ..., n} (n = 3, 4 or 5), edited in a grid of buttons,
// drawn as a graph, with its properties (and a witness for each one that fails), its kind (equivalence
// relation with classes, partial or total order, strict order) and buttons that add closures.
FMWidgets.register('relation-explorer', function (root, api) {
  'use strict'
  var t = api.t, h = api.h
  var SVGNS = 'http://www.w3.org/2000/svg'
  var uid = 're' + Math.random().toString(36).slice(2, 8)

  api.css('relation-explorer', [
    '.re-label{font-size:.8rem;font-weight:600;color:var(--slate);min-width:4.2rem}',
    '.re-main{display:flex;flex-wrap:wrap;gap:1rem 1.5rem;align-items:flex-start;margin:.6rem 0}',
    '.re-gridbox{flex:0 0 auto;max-width:100%}',
    '.re-grid{width:auto;border-collapse:separate;border-spacing:3px;font-family:var(--font-isa,monospace)}',
    '.re-grid th{background:none;font-size:.85rem;font-weight:600;color:var(--slate);padding:0 .2rem;text-align:center}',
    '.re-grid td{padding:0;border:none}',
    '.re-corner{font-size:.7rem!important;font-weight:400!important;color:var(--muted)!important;white-space:nowrap}',
    '.re-cell{width:2.1rem;height:2.1rem;padding:0;border:1px solid var(--border);border-radius:6px;background:var(--white);',
    'color:var(--muted);font:inherit;font-size:1rem;line-height:1;cursor:pointer}',
    '.re-cell:hover{border-color:var(--blue)}',
    '.re-cell:focus-visible{outline:2px solid var(--sky);outline-offset:1px}',
    '.re-cell.on{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.re-cell.added{background:#FEF3C7;border-color:#B45309;color:#B45309;font-weight:700}',
    '.re-gridnote{font-size:.75rem;color:var(--muted);margin-top:.2rem}',
    '.re-graph{flex:1 1 180px;max-width:250px;min-width:0}',
    '.re-graph svg{width:100%;height:auto;display:block}',
    '.re-set{font-family:var(--font-isa,monospace);font-size:.88rem;margin:.3rem 0;overflow-wrap:anywhere}',
    '.re-props{list-style:none;padding:0;margin:.4rem 0;display:grid;gap:.25rem}',
    '.re-props li{display:flex;flex-wrap:wrap;gap:.2rem .5rem;align-items:baseline;font-size:.88rem;margin:0}',
    '.re-pname{min-width:7.5rem;font-weight:600}',
    '.re-yes,.re-no{font-size:.75rem;font-weight:700;padding:.05rem .45rem;border-radius:999px}',
    '.re-yes{background:#DCFCE7;color:#15803D}.re-no{background:#FEE2E2;color:#B91C1C}',
    '.re-wit{color:var(--slate);font-size:.84rem}',
    '.re-wit code{font-family:var(--font-isa,monospace)}',
    '.re-kind{font-size:.9rem;font-weight:600;margin:.5rem 0;padding:.45rem .7rem;border-radius:8px;background:var(--bg);border:1px solid var(--border)}',
    '.re-msg{min-height:1.3em}',
    '.re-msg .re-addedtxt{color:#B45309;font-weight:600}',
  ].join('\n'))

  var state = { n: 4, rel: {}, added: {} }
  var key = function (x, y) { return x + ',' + y }
  var has = function (x, y) { return !!state.rel[key(x, y)] }
  var pairStr = function (x, y) { return '(' + x + ', ' + y + ')' }
  function elems() { var a = []; for (var i = 1; i <= state.n; i++) a.push(i); return a }
  function pairs() {
    var out = []
    elems().forEach(function (x) { elems().forEach(function (y) { if (has(x, y)) out.push([x, y]) }) })
    return out
  }

  // ------------------------------------------------------------ presets
  var PRESETS = [
    { id: 'empty', en: 'Empty', zh: '空关系', f: function () { return false } },
    { id: 'eq', en: 'Equality', zh: '相等', f: function (x, y) { return x === y } },
    { id: 'le', en: '≤', zh: '≤', f: function (x, y) { return x <= y } },
    { id: 'lt', en: '<', zh: '<', f: function (x, y) { return x < y } },
    { id: 'div', en: 'Divides', zh: '整除', f: function (x, y) { return y % x === 0 } },
    { id: 'cycle', en: 'Cycle', zh: '环', f: function (x, y, n) { return y === (x % n) + 1 } },
    { id: 'part', en: 'Partition', zh: '划分', f: function (x, y) { return block(x) === block(y) } },
  ]
  // blocks of the partition preset: {1, 2} and the rest ({3} for n = 3, {3, 4, 5} for n = 5, {3, 4} for n = 4)
  function block(x) { return x <= 2 ? 0 : 1 }
  function load(p) {
    state.rel = {}; state.added = {}
    elems().forEach(function (x) { elems().forEach(function (y) { if (p.f(x, y, state.n)) state.rel[key(x, y)] = true }) })
    setMsg(t('Loaded: ', '已载入：') + t(p.en, p.zh) + '.')
  }

  // ------------------------------------------------------------ properties, with witnesses
  function analyse() {
    var A = elems(), P = pairs(), r = {}
    r.refl = null; r.irrefl = null; r.sym = null; r.antisym = null; r.trans = null; r.total = null
    A.forEach(function (x) {
      if (!r.refl && !has(x, x)) r.refl = t(pairStr(x, x) + ' is missing', '缺少 ' + pairStr(x, x))
      if (!r.irrefl && has(x, x)) r.irrefl = t(pairStr(x, x) + ' is in R', pairStr(x, x) + ' 属于 R')
    })
    P.forEach(function (p) {
      var x = p[0], y = p[1]
      if (!r.sym && !has(y, x)) r.sym = t(pairStr(x, y) + ' is in R but ' + pairStr(y, x) + ' is not', pairStr(x, y) + ' 属于 R，但 ' + pairStr(y, x) + ' 不属于 R')
      if (!r.antisym && x !== y && has(y, x)) r.antisym = t(pairStr(x, y) + ' and ' + pairStr(y, x) + ' are in R, but ' + x + ' ≠ ' + y, pairStr(x, y) + ' 和 ' + pairStr(y, x) + ' 都属于 R，但 ' + x + ' ≠ ' + y)
      if (!r.trans) A.forEach(function (z) {
        if (!r.trans && has(y, z) && !has(x, z)) r.trans = t(pairStr(x, y) + ' and ' + pairStr(y, z) + ' are in R but ' + pairStr(x, z) + ' is not', pairStr(x, y) + ' 和 ' + pairStr(y, z) + ' 属于 R，但 ' + pairStr(x, z) + ' 不属于 R')
      })
    })
    A.forEach(function (x) {
      A.forEach(function (y) {
        if (!r.total && x < y && !has(x, y) && !has(y, x)) r.total = t('neither ' + pairStr(x, y) + ' nor ' + pairStr(y, x) + ' is in R', pairStr(x, y) + ' 和 ' + pairStr(y, x) + ' 都不属于 R')
      })
    })
    return r
  }
  var PROPS = [
    { id: 'refl', en: 'reflexive', zh: '自反' }, { id: 'irrefl', en: 'irreflexive', zh: '反自反' },
    { id: 'sym', en: 'symmetric', zh: '对称' }, { id: 'antisym', en: 'antisymmetric', zh: '反对称' },
    { id: 'trans', en: 'transitive', zh: '传递' }, { id: 'total', en: 'total', zh: '完全' },
  ]
  function setStr(xs) { return '{' + xs.join(', ') + '}' }
  function classes() {
    var seen = {}, out = []
    elems().forEach(function (x) {
      if (seen[x]) return
      var c = elems().filter(function (y) { return has(x, y) })
      c.forEach(function (y) { seen[y] = true })
      out.push(setStr(c))
    })
    return out
  }
  function kinds(w) {
    var ok = function (p) { return w[p] === null }, out = []
    if (ok('refl') && ok('sym') && ok('trans')) out.push(t('Equivalence relation. Classes: ', '等价关系。等价类：') + classes().join(t(', ', '，')))
    if (ok('refl') && ok('antisym') && ok('trans')) out.push(ok('total') ? t('Total order (a partial order that is total)', '全序（满足完全性的偏序）') : t('Partial order, not total', '偏序，但不是全序'))
    if (ok('irrefl') && ok('trans')) out.push(ok('total') ? t('Strict order, total', '严格序，满足完全性') : t('Strict order, not total', '严格序，不满足完全性'))
    if (!out.length) out.push(t('Neither an equivalence relation nor an order', '既不是等价关系，也不是序'))
    return out
  }

  // ------------------------------------------------------------ closures
  function close(kind) {
    var before = {}, A = elems()
    Object.keys(state.rel).forEach(function (k) { before[k] = true })
    if (kind === 'refl') A.forEach(function (x) { state.rel[key(x, x)] = true })
    if (kind === 'sym') pairs().forEach(function (p) { state.rel[key(p[1], p[0])] = true })
    if (kind === 'trans') A.forEach(function (k) {   // Warshall's algorithm
      A.forEach(function (i) { A.forEach(function (j) { if (has(i, k) && has(k, j)) state.rel[key(i, j)] = true }) })
    })
    state.added = {}
    var added = []
    pairs().forEach(function (p) { var k = key(p[0], p[1]); if (!before[k]) { state.added[k] = true; added.push(pairStr(p[0], p[1])) } })
    var name = { refl: t('reflexive', '自反'), sym: t('symmetric', '对称'), trans: t('transitive', '传递') }[kind]
    if (!added.length) setMsg(t('Nothing to add: R is already ' + name + '.', '无需添加：R 已经是' + name + '的。'))
    else setMsg(h('span', null, t('The ' + name + ' closure added ' + (added.length === 1 ? '1 pair' : added.length + ' pairs') + ': ',
      name + '闭包添加了 ' + added.length + ' 个有序对：'), h('span', { class: 're-addedtxt' }, added.join(', '))))
  }

  // ------------------------------------------------------------ the page structure
  var sizeBtns = [3, 4, 5].map(function (n) {
    return h('button', { type: 'button', class: 'fmw-btn', 'data-size': String(n), 'aria-pressed': 'false',
      onclick: function () { safely(function () { setSize(n) }) } }, String(n))
  })
  var presetBtns = PRESETS.map(function (p) {
    return h('button', { type: 'button', class: 'fmw-btn' + (p.id === 'le' || p.id === 'lt' ? ' fmw-sym' : ''), 'data-preset': p.id,
      onclick: function () { safely(function () { load(p) }) } }, t(p.en, p.zh))
  })
  var closeBtns = [['refl', 'Reflexive closure', '自反闭包'], ['sym', 'Symmetric closure', '对称闭包'], ['trans', 'Transitive closure', '传递闭包']].map(function (c) {
    return h('button', { type: 'button', class: 'fmw-btn', 'data-closure': c[0],
      onclick: function () { safely(function () { close(c[0]) }) } }, t(c[1], c[2]))
  })
  var gridBox = h('div', { class: 're-gridbox' })
  var graphBox = h('div', { class: 're-graph' })
  var setLine = h('div', { class: 're-set', 'aria-live': 'polite' })
  var propList = h('ul', { class: 're-props' })
  var kindBox = h('div', { class: 're-kind' })
  var msg = h('div', { class: 'fmw-msg re-msg', role: 'status', 'aria-live': 'polite' })
  root.appendChild(h('div', { class: 'fmw re' },
    h('div', { class: 'fmw-row' }, h('span', { class: 're-label' }, t('Elements', '元素个数')), sizeBtns),
    h('div', { class: 'fmw-row' }, h('span', { class: 're-label' }, t('Load', '载入')), presetBtns),
    h('div', { class: 're-main' }, gridBox, graphBox),
    setLine,
    h('div', { class: 'fmw-row' }, h('span', { class: 're-label' }, t('Add', '添加')), closeBtns),
    msg, propList, kindBox))

  function setMsg(x) {
    msg.textContent = ''
    msg.appendChild(typeof x === 'string' ? document.createTextNode(x) : x)
  }
  function setSize(n) {
    var old = state.rel
    state.n = n; state.rel = {}; state.added = {}
    Object.keys(old).forEach(function (k) {
      var p = k.split(',').map(Number)
      if (p[0] <= n && p[1] <= n) state.rel[k] = true
    })
    setMsg(t('The relation is now on {1, …, ' + n + '}.', '关系现在定义在 {1, …, ' + n + '} 上。'))
  }
  function toggle(x, y) {
    var k = key(x, y)
    if (state.rel[k]) delete state.rel[k]; else state.rel[k] = true
    state.added = {}
    setMsg(t(pairStr(x, y) + (state.rel[k] ? ' added.' : ' removed.'), pairStr(x, y) + (state.rel[k] ? ' 已加入。' : ' 已移除。')))
  }

  function renderGrid() {
    var A = elems()
    var head = h('tr', null, h('th', { class: 're-corner', scope: 'col' }, 'x \\ y'),
      A.map(function (y) { return h('th', { scope: 'col' }, String(y)) }))
    var rows = A.map(function (x) {
      return h('tr', null, h('th', { scope: 'row' }, String(x)), A.map(function (y) {
        var on = has(x, y), added = !!state.added[key(x, y)]
        var label = pairStr(x, y) + (on ? t(' is in R', ' 属于 R') : t(' is not in R', ' 不属于 R'))
        return h('td', null, h('button', { type: 'button', class: 're-cell' + (on ? (added ? ' added' : ' on') : ''),
          'data-cell': x + '-' + y, 'aria-pressed': on ? 'true' : 'false', 'aria-label': label, title: label,
          onclick: function () { safely(function () { toggle(x, y) }) } }, on ? '●' : '·'))
      }))
    })
    var table = h('table', { class: 're-grid' }, h('caption', { class: 're-gridnote', style: 'caption-side:bottom;text-align:left' },
      t('row x, column y: (x, y)', '第 x 行第 y 列：(x, y)')), h('thead', null, head), h('tbody', null, rows))
    table.addEventListener('keydown', function (e) {
      var cell = e.target.closest && e.target.closest('[data-cell]')
      if (!cell) return
      var p = cell.getAttribute('data-cell').split('-').map(Number), d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]
      if (!d) return
      var nx = p[0] + d[0], ny = p[1] + d[1]
      var next = table.querySelector('[data-cell="' + nx + '-' + ny + '"]')
      if (next) { next.focus(); e.preventDefault() }
    })
    // the grid is rebuilt on every change: keep the keyboard focus on the same cell
    var active = document.activeElement
    var focused = active && gridBox.contains(active) ? active.getAttribute('data-cell') : null
    gridBox.textContent = ''
    gridBox.appendChild(h('div', { class: 'fmw-scroll' }, table))
    if (focused) { var again = table.querySelector('[data-cell="' + focused + '"]'); if (again) again.focus() }
  }

  function svg(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag)
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]) })
    return el
  }
  function renderGraph() {
    var A = elems(), n = A.length, C = 120, RAD = 78, rn = 15
    var s = svg('svg', { viewBox: '0 0 240 240', role: 'img', 'aria-label': t('The relation drawn as a graph', '关系的有向图') })
    var defs = svg('defs')
    ;[['n', '#1A2E4A'], ['a', '#B45309']].forEach(function (m) {
      var mk = svg('marker', { id: uid + m[0], viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' })
      mk.appendChild(svg('path', { d: 'M0 0 10 5 0 10z', fill: m[1] }))
      defs.appendChild(mk)
    })
    s.appendChild(defs)
    var pos = {}
    A.forEach(function (x, i) {
      var a = -Math.PI / 2 + 2 * Math.PI * i / n
      pos[x] = [C + RAD * Math.cos(a), C + RAD * Math.sin(a)]
    })
    var f = function (v) { return v.toFixed(1) }
    pairs().forEach(function (p) {
      var x = p[0], y = p[1], added = !!state.added[key(x, y)]
      var col = added ? '#B45309' : '#1A2E4A'
      var common = { class: 're-edge' + (added ? ' added' : ''), 'data-pair': x + '-' + y, fill: 'none', stroke: col, 'stroke-width': '2' }
      if (added) common['stroke-dasharray'] = '5 4'
      var P = pos[x], Q = pos[y], el
      if (x === y) {   // a loop on the outside of the node
        var ux = (P[0] - C) / RAD, uy = (P[1] - C) / RAD
        el = svg('circle', Object.assign({ cx: f(P[0] + ux * (rn + 8)), cy: f(P[1] + uy * (rn + 8)), r: '10' }, common))
      } else {
        var dx = Q[0] - P[0], dy = Q[1] - P[1], len = Math.sqrt(dx * dx + dy * dy), ux2 = dx / len, uy2 = dy / len
        if (has(y, x)) {   // both directions: bend each arrow to its own side
          var cx = (P[0] + Q[0]) / 2 - uy2 * 20, cy = (P[1] + Q[1]) / 2 + ux2 * 20
          var s1 = norm(cx - P[0], cy - P[1]), e1 = norm(cx - Q[0], cy - Q[1])
          el = svg('path', Object.assign({ d: 'M' + f(P[0] + s1[0] * (rn + 1)) + ' ' + f(P[1] + s1[1] * (rn + 1)) + ' Q' + f(cx) + ' ' + f(cy) + ' ' +
            f(Q[0] + e1[0] * (rn + 2)) + ' ' + f(Q[1] + e1[1] * (rn + 2)), 'marker-end': 'url(#' + uid + (added ? 'a' : 'n') + ')' }, common))
        } else {
          el = svg('line', Object.assign({ x1: f(P[0] + ux2 * (rn + 1)), y1: f(P[1] + uy2 * (rn + 1)), x2: f(Q[0] - ux2 * (rn + 2)), y2: f(Q[1] - uy2 * (rn + 2)),
            'marker-end': 'url(#' + uid + (added ? 'a' : 'n') + ')' }, common))
        }
      }
      s.appendChild(el)
    })
    A.forEach(function (x) {
      s.appendChild(svg('circle', { class: 're-node', cx: f(pos[x][0]), cy: f(pos[x][1]), r: String(rn), fill: '#FFFFFF', stroke: '#2563EB', 'stroke-width': '2' }))
      var tx = svg('text', { x: f(pos[x][0]), y: f(pos[x][1] + 5), 'text-anchor': 'middle', 'font-size': '15', 'font-weight': '700', fill: '#1A2E4A' })
      tx.setAttribute('style', 'font-family:var(--font-isa,monospace)')
      tx.textContent = String(x)
      s.appendChild(tx)
    })
    graphBox.textContent = ''
    graphBox.appendChild(s)
  }
  function norm(x, y) { var l = Math.sqrt(x * x + y * y) || 1; return [x / l, y / l] }

  function render() {
    sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-size')) === state.n)) })
    renderGrid()
    renderGraph()
    var P = pairs()
    setLine.textContent = 'R = ' + setStr(P.map(function (p) { return pairStr(p[0], p[1]) })) + '   ' +
      t('(' + P.length + (P.length === 1 ? ' pair' : ' pairs') + ' on {1, …, ' + state.n + '})', '（' + P.length + ' 个有序对，定义在 {1, …, ' + state.n + '} 上）')
    var w = analyse()
    propList.textContent = ''
    PROPS.forEach(function (p) {
      var ok = w[p.id] === null
      propList.appendChild(h('li', { 'data-prop': p.id },
        h('span', { class: 're-pname' }, t(p.en, p.zh)),
        h('span', { class: ok ? 're-yes' : 're-no' }, ok ? t('yes', '是') : t('no', '否')),
        ok ? null : h('span', { class: 're-wit' }, t('witness: ', '反例：'), w[p.id])))
    })
    kindBox.textContent = ''
    kinds(w).forEach(function (k, i) { if (i) kindBox.appendChild(h('br')); kindBox.appendChild(document.createTextNode(k)) })
  }
  function safely(fn) {
    try { fn(); render() } catch (e) { setMsg(t('Something went wrong: ', '出错了：') + (e && e.message ? e.message : String(e))) }
  }

  // start with the chain {(1, 2), (2, 3), (3, 4)} of Section 4.5
  safely(function () {
    state.rel = {}
    ;[[1, 2], [2, 3], [3, 4]].forEach(function (p) { state.rel[key(p[0], p[1])] = true })
    setMsg(t('Click a cell to add or remove a pair.', '点击格子来加入或移除一个有序对。'))
  })
})
