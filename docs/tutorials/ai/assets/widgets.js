/* AI series — interactive widget framework.
 * A widget file calls AIW.register('name', function (el, opts) { ... }) where el is the empty
 * <div class="widget" data-widget="name"> and opts holds its data-* attributes. Widgets build
 * their own DOM with the helpers below, use the CSS classes w-row, w-col, w-controls, w-ctl,
 * w-val, w-btn, w-canvas, w-readout, w-note, w-legend, w-matrix, w-table from style.css, and
 * label everything through AIW.t(english, chinese). No external libraries. */
(function () {
  'use strict'
  var registry = {}
  var AIW = window.AIW = {}
  AIW.lang = (document.documentElement.lang || '').indexOf('zh') === 0 ? 'zh' : 'en'
  AIW.t = function (en, zh) { return AIW.lang === 'zh' && zh ? zh : en }
  AIW.C = { navy: '#1A2E4A', blue: '#2563EB', sky: '#0EA5E9', skyLight: '#DBEAFE', slate: '#475569', muted: '#94A3B8',
    border: '#E2E8F0', green: '#15803D', orange: '#C2410C', red: '#DC2626', purple: '#7E22CE', amber: '#B45309', bg: '#FAFBFD' }
  AIW.SERIES = ['#2563EB', '#C2410C', '#15803D', '#7E22CE', '#0EA5E9', '#B45309', '#DC2626', '#475569']

  AIW.register = function (name, fn) { registry[name] = fn }
  AIW.mountAll = function (renderMath) {
    var els = document.querySelectorAll('.widget[data-widget]')
    for (var i = 0; i < els.length; i++) AIW.mount(els[i], renderMath)
  }
  AIW.mount = function (el, renderMath) {
    var name = el.getAttribute('data-widget')
    var fn = registry[name]
    if (!fn) { el.textContent = ''; el.appendChild(AIW.h('p', { class: 'w-note' }, AIW.t('This interactive demo is not available.', '该交互演示暂不可用。'))); return }
    var opts = {}
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i]
      if (a.name.indexOf('data-') === 0 && a.name !== 'data-widget') opts[a.name.slice(5)] = a.value
    }
    try { fn(el, opts); if (renderMath) renderMath(el) } catch (e) {
      el.textContent = ''; el.appendChild(AIW.h('p', { class: 'w-note' }, AIW.t('This interactive demo failed to start.', '该交互演示启动失败。')))
      if (window.console) console.error('widget ' + name + ' failed:', e)
    }
  }

  // ---- DOM helpers ----
  AIW.h = function (tag, attrs) {
    var el = document.createElement(tag)
    if (attrs) for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue
      var v = attrs[k]
      if (k === 'class') el.className = v
      else if (k === 'text') el.textContent = v
      else if (k === 'style' && typeof v === 'object') for (var s in v) el.style[s] = v[s]
      else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v)
      else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v)
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i]
      if (c == null || c === false) continue
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c)
    }
    return el
  }
  AIW.fmt = function (x, d) {
    if (!isFinite(x)) return x > 0 ? '∞' : (x < 0 ? '−∞' : '—')
    if (d === undefined) d = 3
    var a = Math.abs(x)
    if (a !== 0 && (a >= 1e5 || a < 1e-3)) return x.toExponential(Math.max(0, d - 1)).replace('-', '−')
    return x.toFixed(d).replace('-', '−')
  }
  // slider: {label, min, max, step, value, log, fmt(v), onInput(v)} -> element with .value / .set(v)
  AIW.slider = function (o) {
    var toPos = function (v) { return o.log ? Math.log10(v) : v }
    var fromPos = function (p) { return o.log ? Math.pow(10, p) : p }
    var val = AIW.h('span', { class: 'w-val' })
    var input = AIW.h('input', { type: 'range', min: toPos(o.min), max: toPos(o.max), step: o.log ? 'any' : (o.step || 'any'), value: toPos(o.value) })
    var wrap = AIW.h('label', { class: 'w-ctl' }, AIW.h('span', { text: o.label }), input, val)
    var show = function () { var v = fromPos(Number(input.value)); val.textContent = o.fmt ? o.fmt(v) : AIW.fmt(v, 3); return v }
    input.addEventListener('input', function () { var v = show(); if (o.onInput) o.onInput(v) })
    show()
    Object.defineProperty(wrap, 'value', { get: function () { return fromPos(Number(input.value)) } })
    wrap.set = function (v) { input.value = toPos(v); show() }
    return wrap
  }
  // select: {label, options: [[value, label], ...], value, onChange(v)}
  AIW.select = function (o) {
    var sel = AIW.h('select')
    o.options.forEach(function (p) { var op = AIW.h('option', { value: p[0] }, p[1]); if (String(p[0]) === String(o.value)) op.selected = true; sel.appendChild(op) })
    sel.addEventListener('change', function () { if (o.onChange) o.onChange(sel.value) })
    var wrap = AIW.h('label', { class: 'w-ctl' }, AIW.h('span', { text: o.label }), sel)
    Object.defineProperty(wrap, 'value', { get: function () { return sel.value } })
    return wrap
  }
  AIW.button = function (label, onClick, secondary) {
    return AIW.h('button', { type: 'button', class: 'w-btn' + (secondary ? ' secondary' : ''), onclick: onClick }, label)
  }
  AIW.checkbox = function (label, checked, onChange) {
    var box = AIW.h('input', { type: 'checkbox' })
    box.checked = !!checked
    box.addEventListener('change', function () { if (onChange) onChange(box.checked) })
    var wrap = AIW.h('label', { class: 'w-ctl', style: { flexDirection: 'row', alignItems: 'center', gap: '.4rem' } }, box, AIW.h('span', { text: label }))
    Object.defineProperty(wrap, 'value', { get: function () { return box.checked } })
    return wrap
  }

  // ---- canvas with device-pixel-ratio scaling and responsive width ----
  // AIW.canvas(parent, {aspect: 0.6, maxHeight: 420}, draw) -> {cv, ctx, w, h, redraw}
  AIW.canvas = function (parent, o, draw) {
    o = o || {}
    var cv = AIW.h('canvas', { class: 'w-canvas' })
    parent.appendChild(cv)
    var api = { cv: cv, ctx: cv.getContext('2d'), w: 0, h: 0 }
    api.redraw = function () {
      var w = Math.max(200, cv.parentNode.clientWidth || 600)
      var h = Math.round(Math.min(o.maxHeight || 420, w * (o.aspect || 0.6)))
      var dpr = window.devicePixelRatio || 1
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
        cv.style.height = h + 'px'
      }
      api.w = w; api.h = h
      api.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      api.ctx.clearRect(0, 0, w, h)
      if (draw) draw(api.ctx, w, h)
    }
    if (window.ResizeObserver) new ResizeObserver(function () { api.redraw() }).observe(parent)
    else window.addEventListener('resize', api.redraw)
    setTimeout(api.redraw, 0)
    return api
  }

  // ---- simple axes: returns {X, Y, x0, x1, y0, y1} mapping data to pixels ----
  AIW.axes = function (ctx, o) {
    var pad = o.pad || { l: 46, r: 12, t: 12, b: 34 }
    var W = o.w, H = o.h
    var X = function (x) { return pad.l + (x - o.x0) / (o.x1 - o.x0) * (W - pad.l - pad.r) }
    var Y = function (y) { return H - pad.b - (y - o.y0) / (o.y1 - o.y0) * (H - pad.t - pad.b) }
    if (o.logY) { var ly0 = Math.log10(o.y0), ly1 = Math.log10(o.y1); Y = function (y) { return H - pad.b - (Math.log10(Math.max(y, 1e-300)) - ly0) / (ly1 - ly0) * (H - pad.t - pad.b) } }
    ctx.save()
    ctx.strokeStyle = AIW.C.border; ctx.lineWidth = 1; ctx.fillStyle = AIW.C.slate
    ctx.font = '11px "DM Mono", Consolas, monospace'
    var nx = o.xticks || 5, ny = o.yticks || 4
    for (var i = 0; i <= nx; i++) {
      var xv = o.x0 + (o.x1 - o.x0) * i / nx, px = X(xv)
      ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, H - pad.b); ctx.stroke()
      ctx.textAlign = 'center'; ctx.fillText(o.xfmt ? o.xfmt(xv) : AIW.fmt(xv, 2), px, H - pad.b + 14)
    }
    for (var j = 0; j <= ny; j++) {
      var yv = o.logY ? Math.pow(10, Math.log10(o.y0) + (Math.log10(o.y1) - Math.log10(o.y0)) * j / ny) : o.y0 + (o.y1 - o.y0) * j / ny
      var py = Y(yv)
      ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(W - pad.r, py); ctx.stroke()
      ctx.textAlign = 'right'; ctx.fillText(o.yfmt ? o.yfmt(yv) : AIW.fmt(yv, 2), pad.l - 6, py + 4)
    }
    ctx.strokeStyle = AIW.C.muted
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke()
    ctx.font = '12px "DM Sans", system-ui, sans-serif'; ctx.fillStyle = AIW.C.navy
    if (o.xlabel) { ctx.textAlign = 'center'; ctx.fillText(o.xlabel, pad.l + (W - pad.l - pad.r) / 2, H - 4) }
    if (o.ylabel) { ctx.save(); ctx.translate(12, pad.t + (H - pad.t - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(o.ylabel, 0, 0); ctx.restore() }
    ctx.restore()
    return { X: X, Y: Y, pad: pad }
  }

  // ---- numbers ----
  AIW.rng = function (seed) {           // mulberry32: deterministic, so a demo looks the same every visit
    var a = (seed >>> 0) || 1
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  }
  AIW.gauss = function (rand) { var u = 0, v = 0; while (u === 0) u = rand(); while (v === 0) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }
  AIW.softmax = function (xs) { var m = Math.max.apply(null, xs); var e = xs.map(function (x) { return Math.exp(x - m) }); var s = e.reduce(function (a, b) { return a + b }, 0); return e.map(function (x) { return x / s }) }
  AIW.debounce = function (fn, ms) { var t; return function () { var args = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, args) }, ms || 50) } }
})()

;
/* ---- attention-calculator.js ---- */
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

;
/* ---- bpe-merge-stepper.js ---- */
/* bpe-merge-stepper — Module 07, Section 2 (tokens: byte-pair encoding, step by step).
 * Learns BPE merges on a small corpus one step at a time. Every word becomes its characters plus
 * the end marker '_'. A step counts adjacent pairs, each adding its word's count; merges the most
 * frequent pair (ties: the smallest (left, right) pair in code-point order, left first), replacing
 * every non-overlapping occurrence from left to right; and records the merge with its rank.
 * Encoding a word replays the merges: the lowest-rank pair present is merged (leftmost first)
 * until none applies. Characters outside the base alphabet (the corpus's characters plus '_') are
 * shown as [UNK]. Optional attributes: data-merges (merges at start, default 0) and data-word
 * (the word to encode, default 'welding'). */
AIW.register('bpe-merge-stepper', function (el, opts) {
  'use strict'
  var t = AIW.t, h = AIW.h, C = AIW.C
  var MAX_MERGES = 40, MAX_WORDS = 200, MAX_CHARS = 2000, MAX_COUNT = 999999999, END = '_'
  var DEFAULT_COUNTS = 'weld 10\nwelded 9\nwelds 7\ncooled 7\nmelt 5\nheated 4'
  var DEFAULT_FREE = 'The pressure relief valve protects the reactor vessel from overpressure. If the pressure ' +
    'exceeds the set point, the valve opens and vents the gas to the flare system. The hazard is that the valve ' +
    'fails to open on demand. The safety goal is to keep the probability of this failure below one in ten ' +
    'thousand per demand. The evidence comprises the proof test records, the maintenance history and the ' +
    'results of the last functional test, which was completed in March.'
  // one colour per merge rank (cycling); red is kept for [UNK]
  var RANK_COL = ['#2563EB', '#C2410C', '#15803D', '#7E22CE', '#0EA5E9', '#B45309', '#0F766E', '#A21CAF']
  var MONO = 'var(--font-mono)'
  var HEAD = { fontSize: '.8rem', fontWeight: '600', color: C.navy, margin: '0 0 .4rem' }

  function rankCol(r) { return RANK_COL[(r - 1) % RANK_COL.length] }
  function tint(hex, a) {
    var n = parseInt(hex.slice(1), 16)
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'
  }
  function num(n) { return n.toLocaleString('en-US') }
  function clampN(v) { var n = Math.round(Number(v)); return isFinite(n) ? Math.max(0, Math.min(MAX_MERGES, n)) : 0 }

  // ---------- BPE ----------
  // strings compared by Unicode code point, as Python compares them
  function cmpCP(x, y) {
    var i = 0, j = 0
    while (i < x.length && j < y.length) {
      var a = x.codePointAt(i), b = y.codePointAt(j)
      if (a !== b) return a < b ? -1 : 1
      i += a > 0xFFFF ? 2 : 1; j += b > 0xFFFF ? 2 : 1
    }
    return i < x.length ? 1 : (j < y.length ? -1 : 0)
  }
  // ranking: highest count first, then the smallest (left, right) pair
  function byRank(p, q) { return q.n - p.n || cmpCP(p.a, q.a) || cmpCP(p.b, q.b) }

  function parse(text, free) {
    var warn = []
    if (text.length > MAX_CHARS) {
      var k = MAX_CHARS, c = text.charCodeAt(k - 1)
      if (c >= 0xD800 && c <= 0xDBFF) k--
      text = text.slice(0, k)
      warn.push(t('Only the first 2,000 characters are used.', '只使用前 2,000 个字符。'))
    }
    var counts = new Map(), bad = []
    if (free) {
      text.split(/\s+/).forEach(function (w) { if (w) counts.set(w, (counts.get(w) || 0) + 1) })
    } else {
      text.split('\n').forEach(function (line, i) {
        var p = line.trim().split(/\s+/), n = 1
        if (!p[0]) return
        if (p.length === 2 && /^\d+$/.test(p[1]) && Number(p[1]) >= 1 && Number(p[1]) <= MAX_COUNT) n = Number(p[1])
        else if (p.length !== 1) { bad.push(i + 1); return }
        counts.set(p[0], (counts.get(p[0]) || 0) + n)
      })
    }
    if (bad.length) {
      var lines = bad.slice(0, 5).join(', ') + (bad.length > 5 ? ', …' : '')
      warn.push(t('Ignored line ' + lines + ': write a word, a space and a whole-number count from 1 to 999,999,999.',
        '已忽略第 ' + lines + ' 行：请写成“词、空格、计数”，计数为 1 到 999,999,999 之间的整数。'))
    }
    var words = []
    counts.forEach(function (n, w) { words.push({ w: w, n: n }) })
    if (words.length > MAX_WORDS) {
      words = words.slice(0, MAX_WORDS)
      warn.push(t('Only the first 200 distinct words are used.', '只使用前 200 个不同的词。'))
    }
    if (free) words.sort(function (a, b) { return b.n - a.n })   // stable: equal counts keep their order
    return { words: words, warn: warn }
  }

  function countPairs(syms, words) {
    var map = new Map(), list = []
    for (var i = 0; i < syms.length; i++) {
      var s = syms[i], n = words[i].n
      for (var j = 0; j + 1 < s.length; j++) {
        var inner = map.get(s[j])
        if (!inner) { inner = new Map(); map.set(s[j], inner) }
        var e = inner.get(s[j + 1])
        if (!e) { e = { a: s[j], b: s[j + 1], n: 0 }; inner.set(s[j + 1], e); list.push(e) }
        e.n += n
      }
    }
    return list.sort(byRank)
  }
  function applyMerge(syms, ranks, a, b, r) {
    var outS = [], outR = []
    for (var i = 0; i < syms.length; i++) {
      var s = syms[i], rk = ranks[i], ns = [], nr = []
      for (var j = 0; j < s.length; j++) {
        if (j + 1 < s.length && s[j] === a && s[j + 1] === b) { ns.push(a + b); nr.push(r); j++ } else { ns.push(s[j]); nr.push(rk[j]) }
      }
      outS.push(ns); outR.push(nr)
    }
    return { syms: outS, ranks: outR }
  }
  function corpusLength(syms, words) {
    var L = 0
    for (var i = 0; i < syms.length; i++) L += syms[i].length * words[i].n
    return L
  }
  // states[k]: the corpus after k merges and the ranked pair counts for merge k + 1
  function train(words) {
    var alpha = new Set([END])
    var syms = words.map(function (x) {
      var s = Array.from(x.w)
      s.forEach(function (ch) { alpha.add(ch) })
      s.push(END)
      return s
    })
    var ranks = syms.map(function (s) { return s.map(function () { return 0 }) })
    var states = [], merges = [], symRank = new Map(), len = corpusLength(syms, words)
    for (var r = 1; ; r++) {
      var pairs = countPairs(syms, words)
      states.push({ syms: syms, ranks: ranks, len: len, pairs: pairs })
      if (r > MAX_MERGES || !pairs.length) break
      var win = pairs[0], next = applyMerge(syms, ranks, win.a, win.b, r)
      var after = corpusLength(next.syms, words), tie = 0
      while (tie < pairs.length && pairs[tie].n === win.n) tie++
      merges.push({ r: r, a: win.a, b: win.b, n: win.n, before: len, after: after, tie: tie })
      if (!symRank.has(win.a + win.b)) symRank.set(win.a + win.b, r)
      syms = next.syms; ranks = next.ranks; len = after
    }
    var total = 0
    words.forEach(function (x) { total += x.n })
    return { words: words, total: total, base: Array.from(alpha).sort(cmpCP), states: states, merges: merges, symRank: symRank }
  }
  // encode one word with the first m merges: merge the lowest-rank pair present, leftmost first
  function encode(word, M, m) {
    var rank = new Map()
    for (var i = 0; i < m; i++) {
      var g = M.merges[i], inner = rank.get(g.a)
      if (!inner) { inner = new Map(); rank.set(g.a, inner) }
      if (!inner.has(g.b)) inner.set(g.b, g.r)
    }
    var syms = Array.from(word).concat([END]), rk = syms.map(function () { return 0 }), applied = []
    for (;;) {
      var best = -1, bestR = Infinity
      for (var j = 0; j + 1 < syms.length; j++) {
        var inn = rank.get(syms[j]), r = inn ? inn.get(syms[j + 1]) : 0
        if (r && r < bestR) { bestR = r; best = j }
      }
      if (best < 0) break
      syms.splice(best, 2, syms[best] + syms[best + 1])
      rk.splice(best, 2, bestR)
      applied.push(bestR)
    }
    return { syms: syms, ranks: rk, applied: applied }
  }
  function utf8Hex(ch) {
    var b = new TextEncoder().encode(ch), out = []
    for (var i = 0; i < b.length; i++) out.push('0x' + (b[i] < 16 ? '0' : '') + b[i].toString(16).toUpperCase())
    return out.join(' ')
  }

  // ---------- state ----------
  var S = {
    free: false,
    text: { counts: DEFAULT_COUNTS, free: DEFAULT_FREE },
    target: clampN(opts.merges || 0),
    model: null
  }
  function curM() { return Math.min(S.target, S.model.merges.length) }

  // ---------- DOM pieces ----------
  var CHIP = { display: 'inline-block', fontFamily: MONO, fontSize: '.8rem', lineHeight: '1.4', padding: '0 .3rem',
    minWidth: '1.15rem', textAlign: 'center', borderRadius: '4px', whiteSpace: 'pre', color: C.navy,
    background: '#fff', border: '1px solid #CBD5E1' }
  function chip(sym, rank, unk) {
    var st = Object.assign({}, CHIP), title = null
    if (unk) {
      st.border = '1px solid ' + C.red; st.background = '#FEF2F2'; st.color = C.red; st.fontWeight = '600'
      title = t('not in the base alphabet: ', '不在基础字母表中：') + sym
    } else if (rank > 0) {
      var col = rankCol(rank)
      st.border = '1px solid ' + col; st.background = tint(col, 0.15)
      title = t('made by merge ', '由第 ') + rank + t('', ' 次合并产生')
    }
    return h('span', { style: st, title: title }, unk ? '[UNK]' : sym)
  }
  function symChip(sym, M) { return chip(sym, M.symRank.get(sym) || 0) }
  function pairChips(a, b, M) { return h('span', { style: { display: 'inline-flex', gap: '3px' } }, symChip(a, M), symChip(b, M)) }
  function mergeExpr(g, M) {
    var op = function (s) { return h('span', { style: { color: C.slate, fontFamily: MONO, fontSize: '.78rem' } }, s) }
    return h('span', { style: { display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px' } },
      symChip(g.a, M), op('+'), symChip(g.b, M), op('→'), chip(g.a + g.b, g.r))
  }
  function cell(content, left, extra) {
    var st = { verticalAlign: 'middle', textAlign: left ? 'left' : 'right' }
    if (extra) Object.assign(st, extra)
    return h('td', { style: st }, content)
  }
  function headCell(text, left) { return h('th', { style: { textAlign: left ? 'left' : 'right', fontWeight: '600', fontFamily: 'var(--font-body)' } }, text) }

  // controls
  var stepBtn = AIW.button(t('Step', '单步合并'), function () {
    var m = curM()
    if (m < S.model.merges.length) { S.target = m + 1; render() }
  })
  var runN = h('input', { type: 'number', min: 0, max: MAX_MERGES, step: 1, value: 7, 'aria-label': t('number of merges', '合并次数') })
  function runTo() { runN.value = clampN(runN.value); S.target = Number(runN.value); render() }
  var runBtn = AIW.button(t('Run to', '运行到'), runTo, true)
  runN.addEventListener('keydown', function (e) { if (e.key === 'Enter') runTo() })
  runN.addEventListener('change', function () { runN.value = clampN(runN.value) })
  var resetBtn = AIW.button(t('Reset', '重置'), function () { S.target = 0; render() }, true)
  var status = h('span', { style: { fontSize: '.8rem', fontWeight: '600', color: C.orange } })
  var bar = h('div', { class: 'w-controls', style: { alignItems: 'center' } },
    stepBtn,
    h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '.45rem' } }, runBtn,
      h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.8rem', color: C.slate } },
        runN, h('span', null, t('merges', '次合并')))),
    resetBtn, status)

  // row A: the corpus as symbols, and the pair counts for the next merge
  var corpusHead = h('div', { style: HEAD })
  var corpusRows = h('div', { style: { maxHeight: '330px', overflowY: 'auto', padding: '2px 4px 2px 0' } })
  var corpusNote = h('div', { class: 'w-note' })
  var pairHead = h('div', { style: HEAD })
  var pairBox = h('div', { style: { overflowX: 'auto' } })
  var pairNote = h('div', { class: 'w-note' })
  var rowA = h('div', { class: 'w-row' },
    h('div', { class: 'w-col' }, corpusHead, corpusRows, corpusNote),
    h('div', { class: 'w-col' }, pairHead, pairBox, pairNote))

  // row B: the merge list, and the counters with the corpus-length chart
  var mergeScroll = h('div', { style: { maxHeight: '260px', overflow: 'auto' } })
  var mergeNote = h('div', { class: 'w-note' })
  var readout = h('div', { class: 'w-readout', style: { display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '.9rem' } })
  var chartBox = h('div', { style: { marginTop: '.6rem' } })
  var rowB = h('div', { class: 'w-row', style: { marginTop: '1.1rem' } },
    h('div', { class: 'w-col' }, h('div', { style: HEAD }, t('Merges learned', '已学到的合并')), mergeScroll, mergeNote),
    h('div', { class: 'w-col' }, h('div', { style: HEAD }, t('Counters', '计数')), readout, chartBox))

  // row C: encode a word, and the corpus text
  var encIn = h('input', { type: 'text', maxlength: 60, spellcheck: 'false', autocomplete: 'off', style: { width: '100%', fontFamily: MONO } })
  encIn.value = typeof opts.word === 'string' ? opts.word : 'welding'
  encIn.addEventListener('input', function () { renderEncode() })
  var encOut = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px 0', margin: '.55rem 0 .1rem', minHeight: '1.4rem' } })
  var encInfo = h('div', { class: 'w-note', style: { color: C.slate } })
  var taLabel = h('span')
  var ta = h('textarea', { rows: 7, spellcheck: 'false', autocomplete: 'off',
    style: { width: '100%', fontFamily: MONO, fontSize: '.8rem', lineHeight: '1.45', padding: '.4rem .5rem', border: '1px solid ' + C.border,
      borderRadius: '6px', color: C.navy, background: '#fff', resize: 'vertical' } })
  ta.value = S.text.counts
  var freeBox = AIW.checkbox(t('free text', '自由文本'), false, function (on) {
    S.text[S.free ? 'free' : 'counts'] = ta.value
    S.free = on
    ta.value = S.text[on ? 'free' : 'counts']
    rebuild(); render()
  })
  freeBox.style.marginTop = '.35rem'
  var warnBox = h('div', { class: 'w-note', style: { color: C.orange } })
  ta.addEventListener('input', AIW.debounce(function () { S.text[S.free ? 'free' : 'counts'] = ta.value; rebuild(); render() }, 150))
  var rowC = h('div', { class: 'w-row', style: { marginTop: '1.1rem' } },
    h('div', { class: 'w-col' }, h('label', { class: 'w-ctl', style: { minWidth: 0 } }, h('span', null, t('Encode a word', '编码一个词')), encIn), encOut, encInfo),
    h('div', { class: 'w-col' }, h('label', { class: 'w-ctl', style: { minWidth: 0 } }, taLabel, ta), freeBox, warnBox))

  el.textContent = ''
  el.appendChild(bar); el.appendChild(rowA); el.appendChild(rowB); el.appendChild(rowC)

  // ---------- rendering ----------
  function rebuild() {
    var p = parse(ta.value, S.free)
    S.model = train(p.words)
    warnBox.textContent = p.warn.join(' ')
    taLabel.textContent = S.free
      ? t('Corpus as free text: split at whitespace and counted, case kept', '语料（自由文本）：按空白切分并计数，保留大小写')
      : t('Corpus: one “word count” per line', '语料：每行一个“词 计数”')
  }

  function render() {
    var M = S.model, m = curM(), st = M.states[m]
    var next = m < M.merges.length ? M.merges[m] : null
    // controls
    stepBtn.disabled = !next
    runBtn.disabled = !M.words.length
    status.textContent = !M.words.length ? t('The corpus is empty.', '语料为空。')
      : !st.pairs.length ? t('Every word is a single token.', '每个词都已是单个 token。')
        : !next ? t('This demo stops at ' + MAX_MERGES + ' merges.', '本演示最多合并 ' + MAX_MERGES + ' 次。') : ''
    renderCorpus(M, m, st, next)
    renderPairs(M, m, st, next)
    renderMerges(M, m)
    renderCounters(M, m, st)
    renderEncode()
    chart.redraw()
  }

  function renderCorpus(M, m, st, next) {
    corpusHead.textContent = m === 0
      ? t('Corpus: each word as characters plus the end marker _', '语料：每个词拆成字符，再加词尾标记 _')
      : t('Corpus after ' + m + (m === 1 ? ' merge' : ' merges'), '合并 ' + m + ' 次后的语料')
    corpusRows.textContent = ''
    var col = next ? rankCol(next.r) : null
    M.words.forEach(function (wd, i) {
      var s = st.syms[i], rk = st.ranks[i]
      var boxes = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px 4px', minWidth: 0, flex: '1 1 auto', padding: '2px 0' } })
      for (var j = 0; j < s.length; j++) {
        if (next && j + 1 < s.length && s[j] === next.a && s[j + 1] === next.b) {
          boxes.appendChild(h('span', { style: { display: 'inline-flex', gap: '2px', outline: '2px dashed ' + col, outlineOffset: '1px', borderRadius: '4px' } },
            chip(s[j], rk[j]), chip(s[j + 1], rk[j + 1])))
          j++
        } else boxes.appendChild(chip(s[j], rk[j]))
      }
      corpusRows.appendChild(h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '.55rem', padding: '.12rem 0' } },
        h('span', { style: { flex: '0 0 auto', minWidth: '2.6rem', textAlign: 'right', fontFamily: MONO, fontSize: '.75rem', color: C.slate, lineHeight: '1.9' } }, num(wd.n) + '×'),
        boxes))
    })
    corpusNote.textContent = next
      ? t('Left: how often each word occurs. Dashed: where merge ' + next.r + ' joins a pair. Colour: the merge that made a symbol.',
        '左侧：每个词出现的次数。虚线框：第 ' + next.r + ' 次合并要连接的位置。颜色：产生该符号的合并。')
      : (M.words.length ? t('Left: how often each word occurs. Colour: the merge that made a symbol.', '左侧：每个词出现的次数。颜色：产生该符号的合并。') : '')
  }

  function renderPairs(M, m, st, next) {
    pairBox.textContent = ''; pairNote.textContent = ''
    if (!st.pairs.length) {
      pairHead.textContent = t('Pair counts', '相邻符号对计数')
      pairBox.appendChild(h('div', { class: 'w-note', style: { marginTop: 0, color: C.slate } }, M.words.length
        ? t('No adjacent pair is left: every word is a single token.', '已没有相邻符号对：每个词都已是单个 token。')
        : t('Type a corpus below to start.', '请在下方输入语料。')))
      return
    }
    pairHead.textContent = t('Pair counts for merge ' + (m + 1) + ' (each pair adds its word’s count)', '第 ' + (m + 1) + ' 次合并的相邻符号对计数（每个符号对计入其所在词的次数）')
    var win = st.pairs[0], tie = 0
    while (tie < st.pairs.length && st.pairs[tie].n === win.n) tie++
    var tb = h('tbody')
    st.pairs.slice(0, 8).forEach(function (p, i) {
      var hl = i === 0 ? { background: '#DBEAFE', fontWeight: '600' } : null
      var note = i === 0 ? (tie > 1 ? t('tie: smallest pair wins', '并列：最小的符号对胜出') : t('most frequent: merged next', '最频繁：下一次合并'))
        : (p.n === win.n ? t('tie', '并列') : '')
      tb.appendChild(h('tr', null,
        cell(pairChips(p.a, p.b, M), true, hl),
        cell(num(p.n), false, hl),
        cell(note, true, Object.assign({ fontFamily: 'var(--font-body)', color: i === 0 ? C.blue : C.slate }, hl || {}))))
    })
    pairBox.appendChild(h('table', { class: 'w-table', style: { width: '100%' } },
      h('thead', null, h('tr', null, headCell(t('pair', '符号对'), true), headCell(t('count', '计数')), headCell('', true))), tb))
    var lines = []
    if (st.pairs.length > 8) lines.push(t('The 8 largest of ' + st.pairs.length + ' distinct pairs.', '共 ' + st.pairs.length + ' 个不同的符号对，这里列出最大的 8 个。'))
    if (tie > 1) lines.push(t(tie + ' pairs tie at ' + win.n + ': the smallest pair wins, comparing the left symbols in code-point order, then the right.',
      tie + ' 个符号对并列，计数都是 ' + win.n + '：最小的符号对胜出，先按码位顺序比较左符号，再比较右符号。'))
    lines.forEach(function (s) { pairNote.appendChild(h('div', null, s)) })
    if (next) {
      pairNote.appendChild(h('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.35rem', marginTop: '.45rem', color: C.navy, fontSize: '.82rem' } },
        h('span', { style: { fontWeight: '600' } }, t('Next merge:', '下一次合并：')), mergeExpr(next, M),
        h('span', null, t('count ' + num(next.n) + '; the corpus goes from ' + num(next.before) + ' to ' + num(next.after) + ' symbols.',
          '计数 ' + num(next.n) + '；语料从 ' + num(next.before) + ' 个符号变为 ' + num(next.after) + ' 个。'))))
    }
  }

  function renderMerges(M, m) {
    mergeScroll.textContent = ''; mergeNote.textContent = ''
    if (!m) {
      mergeScroll.appendChild(h('div', { class: 'w-note', style: { marginTop: 0, color: C.slate } },
        t('None yet. Press Step to merge the most frequent pair.', '还没有合并。点击“单步合并”，合并最频繁的符号对。')))
      return
    }
    var tb = h('tbody'), overlap = false
    for (var k = 0; k < m; k++) {
      var g = M.merges[k], ov = g.before - g.after !== g.n
      if (ov) overlap = true
      tb.appendChild(h('tr', null,
        cell(String(g.r)),
        cell(mergeExpr(g, M), true),
        cell(h('span', null, num(g.n), g.tie > 1 ? h('span', { style: { color: C.orange, fontFamily: 'var(--font-body)' } }, t(' tie of ' + g.tie, '（' + g.tie + ' 个并列）')) : null)),
        cell(num(g.before) + ' → ' + num(g.after) + (ov ? ' †' : ''), false, { whiteSpace: 'nowrap' })))
    }
    mergeScroll.appendChild(h('table', { class: 'w-table', style: { width: '100%' } },
      h('thead', null, h('tr', null, headCell(t('rank', '序号')), headCell(t('left + right → new symbol', '左 + 右 → 新符号'), true), headCell(t('count', '计数')), headCell(t('corpus length', '语料长度')))), tb))
    mergeScroll.scrollTop = mergeScroll.scrollHeight
    mergeNote.textContent = overlap
      ? t('† A run such as a a a holds two a a pairs but merges once, so that merge removes fewer symbols than its count. Every other merge removes exactly its count.',
        '† 像 a a a 这样的连续符号含两个 a a 对，却只合并一次，所以该次合并减少的符号少于它的计数。其余每次合并减少的符号数正好等于它的计数。')
      : t('Each merge removes exactly as many symbols as its count.', '每次合并减少的符号数正好等于它的计数。')
  }

  function renderCounters(M, m, st) {
    readout.textContent = ''
    var muted = function (s) { return h('span', { style: { color: C.muted } }, s) }
    var rows = [
      [t('merges', '合并次数'), [String(m)]],
      [t('base alphabet', '基础字母表'), [String(M.base.length), muted('  ' + M.base.join(' '))]],
      [t('vocabulary', '词表大小'), [String(M.base.length + m), muted('  = ' + M.base.length + ' + ' + m)]],
      [t('corpus length', '语料长度'), [num(st.len) + t(' symbols', ' 个符号'), muted(t('  (start ', '（初始 ') + num(M.states[0].len) + t(')', '）'))]],
      [t('symbols per word', '每词符号数'), [M.total ? (st.len / M.total).toFixed(2) : '—', muted(t('  (' + num(M.total) + ' words)', '（共 ' + num(M.total) + ' 个词）'))]]
    ]
    rows.forEach(function (r) {
      readout.appendChild(h('span', { style: { color: C.slate } }, r[0]))
      readout.appendChild(h.apply(null, ['span', null].concat(r[1])))
    })
  }

  function renderEncode() {
    encOut.textContent = ''; encInfo.textContent = ''
    var M = S.model, m = curM()
    var words = encIn.value.trim().split(/\s+/).filter(Boolean)
    if (!words.length) { encInfo.textContent = t('Type a word to encode it with the merges learned so far.', '输入一个词，用目前学到的合并给它编码。'); return }
    var base = new Set(M.base), nTok = 0, unk = [], applied = []
    words.forEach(function (w) {
      var e = encode(w, M, m)
      var group = h('span', { style: { display: 'inline-flex', flexWrap: 'wrap', gap: '4px', marginRight: '1rem' } })
      e.syms.forEach(function (s, i) {
        var isUnk = e.ranks[i] === 0 && !base.has(s)
        if (isUnk && unk.indexOf(s) < 0) unk.push(s)
        group.appendChild(chip(s, e.ranks[i], isUnk))
      })
      nTok += e.syms.length
      applied = e.applied
      encOut.appendChild(group)
    })
    var lines = []
    var tok = t(nTok + (nTok === 1 ? ' token' : ' tokens'), nTok + ' 个 token')
    if (words.length === 1) {
      var list = applied.map(function (r) { var g = M.merges[r - 1]; return '#' + r + ' ' + g.a + '+' + g.b })
      lines.push(tok + (list.length
        ? t('; merges replayed by rank: ' + list.join(', '), '；按序号重放的合并：' + list.join('、'))
        : (m ? t('; none of the ' + m + ' merges applies', '；' + m + ' 次合并都用不上') : t('; no merges learned yet', '；还没有学到合并'))))
    } else lines.push(tok + t(' for ' + words.length + ' words', '，共 ' + words.length + ' 个词'))
    if (unk.length) {
      var shown = unk.slice(0, 6), more = unk.length - shown.length
      var bytes = shown.map(function (c) { return c + ' = ' + utf8Hex(c) })
      lines.push(t(shown.join(', ') + (more ? ' and ' + more + ' more' : '') + (unk.length === 1 ? ' is' : ' are') +
        ' not in the base alphabet, so a character-level BPE has to emit [UNK]; a byte-level BPE would emit the UTF-8 bytes instead (' + bytes.join(', ') + ').',
        shown.join('、') + (more ? ' 等 ' + unk.length + ' 个字符' : '') + ' 不在基础字母表中，字符级 BPE 只能输出 [UNK]；字节级 BPE 则输出它们的 UTF-8 字节（' + bytes.join('、') + '）。'))
    }
    lines.forEach(function (s) { encInfo.appendChild(h('div', { style: { marginTop: '.2rem' } }, s)) })
  }

  // ---------- chart: corpus length against merge number ----------
  function niceAxis(v) {
    var mag = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1))))
    var steps = [[1, 4], [1.5, 3], [2, 4], [3, 3], [4, 4], [5, 5], [6, 3], [8, 4], [10, 5]]
    for (var i = 0; i < steps.length; i++) {
      var y1 = steps[i][0] * mag
      if (y1 >= v) return { y1: y1, ny: y1 < 10 ? Math.max(1, Math.min(steps[i][1], Math.round(y1))) : steps[i][1] }
    }
    return { y1: 10 * mag, ny: 5 }
  }
  var chart = AIW.canvas(chartBox, { aspect: 0.42, maxHeight: 175 }, function (ctx, w, hh) {
    var M = S.model
    if (!M || !M.words.length) return
    var m = curM(), x1 = m <= 10 ? 10 : m <= 20 ? 20 : m <= 30 ? 30 : 40
    var ax = niceAxis(M.states[0].len)
    var A = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: x1, y0: 0, y1: ax.y1, xticks: x1 === 10 ? 5 : x1 === 20 ? 4 : x1 / 10, yticks: ax.ny,
      xlabel: t('merges', '合并次数'), ylabel: t('symbols', '符号数'), pad: { l: 50, r: 16, t: 14, b: 34 },
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: function (v) { return num(Math.round(v)) } })
    ctx.save()
    ctx.lineWidth = 2
    for (var k = 1; k <= m; k++) {
      ctx.strokeStyle = rankCol(k)
      ctx.beginPath(); ctx.moveTo(A.X(k - 1), A.Y(M.states[k - 1].len)); ctx.lineTo(A.X(k), A.Y(M.states[k].len)); ctx.stroke()
    }
    for (k = 0; k <= m; k++) {
      ctx.fillStyle = k ? rankCol(k) : C.navy
      ctx.beginPath(); ctx.arc(A.X(k), A.Y(M.states[k].len), k === m ? 4 : 2.6, 0, 2 * Math.PI); ctx.fill()
    }
    var px = A.X(m), py = A.Y(M.states[m].len)
    ctx.fillStyle = C.navy; ctx.font = '600 11px "DM Mono", Consolas, monospace'
    ctx.textAlign = px > w - 70 ? 'right' : 'left'
    ctx.fillText(num(M.states[m].len), px + (px > w - 70 ? -7 : 7), Math.max(12, py - 7))
    ctx.restore()
  })

  rebuild()
  render()
})

;
/* ---- compute-budget-planner.js ---- */
/* Module 08: model-compute budget and the published parametric scaling fit. */
AIW.register('compute-budget-planner', function (el) {
  'use strict'
  var h = AIW.h, tr = AIW.t, C = AIW.C
  var st = { N: 9550729216, D: 2e12, gpu: '989', custom: 989, count: 80,
    mfu: 0.4, rule: true, embedding: 622854144, L: 36, T: 8192, d: 4096, price: '' }
  var controls = h('div', { class: 'w-controls' }), readout = h('div', {
    class: 'w-readout', 'aria-live': 'polite' }), payback = h('p', { class: 'w-note' })
  var chartWrap = h('div'), chart, result
  function fmt(v) { return v.toPrecision(3).replace('e+', 'e') }
  function law(N, D) { return 1.69 + 406.4 / Math.pow(N, 0.34)
    + 410.7 / Math.pow(D, 0.28) }
  function optimum(budget) {
    var N = Math.pow(0.34 * 406.4 / (0.28 * 410.7), 1 / 0.62)
      * Math.pow(budget / 6, 0.28 / 0.62)
    return { N: N, D: budget / (6 * N) }
  }
  function change(key, value) { st[key] = value; update() }
  function slider(key, label, min, max, step, log, format) {
    var control = AIW.slider({ label: label, min: min, max: max, step: step,
      log: log, value: st[key], fmt: format || fmt,
      onInput: function (v) { change(key, v) } })
    controls.appendChild(control); return control
  }
  function number(key, label, min, max) {
    var input = h('input', { type: 'number', min: min, max: max, value: st[key],
      style: { width: '14ch', maxWidth: '100%' },
      oninput: function () {
        change(key, Math.max(min, Math.min(max, Number(input.value) || min)))
      } })
    controls.appendChild(h('label', { class: 'w-ctl' }, label, input))
    return input
  }
  var nSlider = slider('N', tr('Parameters N', '参数量 N'), 1e8, 1e12, null, true)
  var dSlider = slider('D', tr('Training tokens D', '训练 token 数 D'), 1e9, 1e14, null, true)
  controls.appendChild(AIW.select({ label: tr('Assumed dense bf16 peak', '假定稠密 bf16 峰值'),
    options: [['312', 'A100 80 GB: 312 TFLOP/s'], ['989', 'H100 SXM: 989 TFLOP/s'],
      ['h200', 'H200: 989 TFLOP/s'], ['custom', tr('Custom', '自定义')]],
    value: st.gpu, onChange: function (v) { change('gpu', v) } }))
  var custom = number('custom', tr('Custom peak (TFLOP/s)', '自定义峰值（TFLOP/s）'), 1, 100000)
  number('count', tr('GPU count', 'GPU 数量'), 1, 100000)
  slider('mfu', tr('Model FLOP utilisation', '模型 FLOP 利用率'), 0.1, 0.6, 0.01, false,
    function (v) { return (100 * v).toFixed(0) + '%' })
  controls.appendChild(AIW.checkbox(tr('Use Module 06 FLOP rule', '使用模块 06 的 FLOP 规则'),
    st.rule, function (v) { change('rule', v) }))
  number('embedding', tr('Input lookup parameters Vd', '输入查表参数 Vd'), 0, 5e11)
  number('L', tr('Layers L', '层数 L'), 1, 512)
  number('T', tr('Sequence length T', '序列长度 T'), 1, 1000000)
  number('d', tr('Width d', '宽度 d'), 1, 100000)
  var price = h('input', { type: 'number', min: 0, step: 0.01, placeholder: '2.50',
    oninput: function () { st.price = price.value; update() } })
  controls.appendChild(h('label', { class: 'w-ctl' },
    tr('Assumed USD / GPU-hour (optional)', '假定 USD / GPU 小时（可选）'), price))
  function setAllocation(target) {
    if (target.N < 1e8 || target.N > 1e12 || target.D < 1e9 || target.D > 1e14) return
    st.N = target.N; st.D = target.D
    nSlider.set(st.N); dSlider.set(st.D); update()
  }
  var twentyButton = AIW.button(tr('Set 20 tokens / parameter at fixed 6ND',
    '固定 6ND，设为每参数 20 个 token '), function () { setAllocation(result.twenty) })
  var optimumButton = AIW.button(tr('Set fitted minimum at fixed 6ND',
    '固定 6ND，设为拟合最优点'), function () { setAllocation(result.optimal) })
  controls.appendChild(twentyButton); controls.appendChild(optimumButton)
  el.appendChild(controls); el.appendChild(readout); el.appendChild(chartWrap)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Curve: L = 1.69 + 406.4/N^0.34 + 410.7/D^0.28, with C₆ = 6ND fixed. '
      + 'Shaded regions extrapolate outside N = 70M–16B or D = 5B–500B. '
      + 'The cost readout uses the selected FLOP rule; the curve and payback use 6ND.',
    '曲线：L = 1.69 + 406.4/N^0.34 + 410.7/D^0.28，固定 C₆ = 6ND。'
      + '阴影区域表示超出 N = 7000 万–160 亿或 D = 50 亿–5000 亿的外推。'
      + '成本读数采用所选 FLOP 规则；曲线和回本计算采用 6ND。')))
  el.appendChild(payback)
  function calculate() {
    var budget6 = 6 * st.N * st.D, embedding = Math.min(st.embedding, st.N / 2)
    var perToken = st.rule ? 6 * (st.N - embedding) + 6 * st.L * st.T * st.d : 6 * st.N
    var compute = perToken * st.D
    var peak = st.gpu === 'custom' ? st.custom : st.gpu === 'h200' ? 989 : Number(st.gpu)
    var hours = compute / (peak * 1e12 * st.mfu) / 3600
    var N20 = Math.sqrt(budget6 / 120)
    return { compute: compute, budget6: budget6, hours: hours,
      days: hours / st.count / 24, loss: law(st.N, st.D),
      forwardWeight: 2 * (st.rule ? st.N - embedding : st.N),
      twenty: { N: N20, D: 20 * N20 }, optimal: optimum(budget6) }
  }
  chart = AIW.canvas(chartWrap, { aspect: 0.8, maxHeight: 350 }, function (ctx, w, height) {
    if (!result) return
    var points = [], ymin = Infinity, ymax = 0
    for (var i = 0; i <= 200; i++) {
      var x = 7 + 6 * i / 200, N = Math.pow(10, x), D = result.budget6 / (6 * N)
      if (D < 1e8) continue
      var loss = law(N, D); ymin = Math.min(ymin, loss); ymax = Math.max(ymax, loss)
      points.push({ x: x, y: loss, N: N, D: D })
    }
    var padding = Math.max(0.01, (ymax - ymin) * 0.08)
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 7, x1: 13,
      y0: ymin - padding, y1: ymax + padding, xticks: 6,
      xlabel: tr('Parameters N (log axis)', '参数量 N（对数轴）'),
      ylabel: tr('Predicted nats /token', '预测损失（奈特 /token ）'),
      xfmt: function (v) { return '1e' + v.toFixed(0) } })
    ctx.save(); ctx.beginPath(); ctx.rect(axes.X(7), axes.Y(ymax + padding),
      axes.X(13) - axes.X(7), axes.Y(ymin - padding) - axes.Y(ymax + padding)); ctx.clip()
    points.forEach(function (point) {
      if (point.N < 7e7 || point.N > 1.6e10 || point.D < 5e9 || point.D > 5e11) {
        ctx.fillStyle = 'rgba(148,163,184,0.18)'
        ctx.fillRect(axes.X(point.x), axes.Y(ymax + padding),
          axes.X(point.x + 0.03) - axes.X(point.x), axes.Y(ymin - padding))
      }
    })
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath()
    points.forEach(function (point, i) {
      if (i === 0) ctx.moveTo(axes.X(point.x), axes.Y(point.y))
      else ctx.lineTo(axes.X(point.x), axes.Y(point.y))
    }); ctx.stroke()
    ;[{ N: st.N, D: st.D, colour: C.orange },
      { N: result.twenty.N, D: result.twenty.D, colour: C.purple },
      { N: result.optimal.N, D: result.optimal.D, colour: C.green }].forEach(function (point) {
        ctx.fillStyle = point.colour; ctx.beginPath()
        ctx.arc(axes.X(Math.log10(point.N)), axes.Y(law(point.N, point.D)), 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    ctx.restore()
  })
  function pointText(label, point) {
    return label + ': N ' + fmt(point.N) + ', D ' + fmt(point.D)
      + ', L ' + law(point.N, point.D).toFixed(4)
  }
  function update() {
    result = calculate(); custom.disabled = st.gpu !== 'custom'
    readout.textContent = 'C = ' + fmt(result.compute) + ' FLOP; '
      + fmt(result.hours) + tr(' GPU-hours; ', ' GPU 小时；')
      + result.days.toFixed(1) + tr(' days; D/N = ', ' 天；D/N = ')
      + (st.D / st.N).toFixed(1) + '; L = ' + result.loss.toFixed(4)
      + tr('; forward weight FLOP/token = ', '；每 token 前向权重 FLOP = ')
      + fmt(result.forwardWeight) + (st.rule ? '' : tr(' (quick estimate)', '（快速估计）'))
      + (st.price !== '' && Number(st.price) >= 0 ? tr('; assumed cost USD ', '；假定成本 USD ')
        + (result.hours * Number(st.price)).toFixed(2) : '')
    var low = 15, high = 28
    for (var i = 0; i < 60; i++) {
      var middle = (low + high) / 2, point = optimum(Math.pow(10, middle))
      if (law(point.N, point.D) > result.loss) low = middle
      else high = middle
    }
    var equalBudget = Math.pow(10, (low + high) / 2), equal = optimum(equalBudget)
    payback.textContent = pointText(tr('Green: fitted minimum', '绿色：拟合最优点'), result.optimal)
      + '\n' + pointText(tr('Purple: 20-token point', '紫色：20 token 点'), result.twenty)
      + '\n' + pointText(tr('Equal-loss optimum', '等损失最优点'), equal)
      + '; C′ = ' + fmt(equalBudget) + '. '
      + (st.N < equal.N * (1 - 1e-8) ? tr('Served-token break-even S* = ', '服务 token 回本点 S* = ')
        + fmt((result.budget6 - equalBudget) / (2 * (equal.N - st.N)))
        : st.N > equal.N * (1 + 1e-8) ? tr(
          'This model costs more to train and serve than the equal-loss optimum.',
          '本模型训练和服务成本均高于等损失最优点。') : tr(
          'Already at the equal-loss optimum.', '已在等损失最优点。'))
      + '\n' + tr('These are fitted predictions and hardware/price assumptions, not measured '
        + 'quality or elapsed time. Inference attention, extra overhead and time variation are omitted.',
        '这些是拟合预测以及硬件和价格假设，并非实测质量或耗时。未计入推理注意力、额外开销和耗时波动。')
      + (result.days > 60 ? '\n' + tr('Calendar estimate: ', '日历耗时估计：')
        + (result.days / 30.44).toFixed(1) + tr(' months (30.44 days each).', ' 个月（每月 30.44 天）。') : '')
    payback.style.whiteSpace = 'pre-line'
    ;[[twentyButton, result.twenty], [optimumButton, result.optimal]].forEach(function (pair) {
      pair[0].disabled = pair[1].N < 1e8 || pair[1].N > 1e12
        || pair[1].D < 1e9 || pair[1].D > 1e14
    })
    chart.redraw()
  }
  update()
})

;
/* ---- convolution-explorer.js ---- */
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

;
/* ---- diffusion-explorer.js ---- */
/* diffusion-explorer — Module 05, Section 5.
 * The forward process x_t = sqrt(abar_t) x_0 + sqrt(1 - abar_t) eps under the linear and the cosine
 * schedule, side by side on the same points and the same noise; and the reverse process run from
 * fresh N(0, I) points with the exact posterior mean E[x_0 | x_t] of the data mixture in place of a
 * trained network (DDPM ancestral or DDIM with K steps).
 *
 * Random numbers (AIW.rng = mulberry32, AIW.gauss = Box-Muller): the data x_0 always use seed 1.
 * One "draw" seed (79 by default, +1 per "Resample noise") feeds, in this order, the fixed per-point
 * noise eps, the reverse runs' starting points x_T and the DDPM noise z for t = 1000..2, each point
 * drawing its x then its y. Seed 79 is a representative draw: the ring's mean distance from the
 * origin at t = 1000 is 1.24, against sqrt(pi/2) = 1.25 for N(0, I). */
AIW.register('diffusion-explorer', function (el, opts) {
  'use strict'
  var tr = AIW.t, h = AIW.h
  var T = 1000, N = 1000, DRAW_SEED = 79, FRAMES = 60, FRAME_MS = 40, PLAY_MS = 5000
  var reduced = false
  try { reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) } catch (e) { reduced = false }

  // ---- colours: the page's CSS custom properties when present, else the series palette ----
  function cssVar(name, fallback) {
    try { var v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fallback } catch (e) { return fallback }
  }
  var COL = {
    sch: [cssVar('--blue', AIW.C.blue), cssVar('--orange', AIW.C.orange)],
    ink: cssVar('--navy', AIW.C.navy), slate: cssVar('--slate', AIW.C.slate), muted: cssVar('--muted', AIW.C.muted),
    miss: cssVar('--red', AIW.C.red), bg: cssVar('--white', '#FFFFFF')
  }
  var DASH = [[], [7, 4]]                       // linear solid, cosine dashed: readable without colour

  // ---- schedules (double precision, abar_0 = 1, abar_t = prod (1 - beta_s)) ----
  function schedule(kind) {
    var beta = new Float64Array(T + 1), ab = new Float64Array(T + 1), s
    var f = function (u) { var c = Math.cos(((u / T) + 0.008) / 1.008 * Math.PI / 2); return c * c }
    ab[0] = 1
    for (s = 1; s <= T; s++) {
      beta[s] = kind === 'linear' ? 1e-4 + (0.02 - 1e-4) * (s - 1) / 999 : Math.min(1 - f(s) / f(s - 1), 0.999)
      ab[s] = ab[s - 1] * (1 - beta[s])
    }
    var below = T + 1                            // first t with abar_t < 0.01 (SNR below -20 dB)
    for (s = 0; s <= T; s++) if (ab[s] < 0.01) { below = s; break }
    return { kind: kind, beta: beta, ab: ab, below: below }
  }
  var SCH = [schedule('linear'), schedule('cosine')]

  // ---- data: equal-weight Gaussian mixtures with isotropic component standard deviation sigma ----
  function mixture(name) {
    var means = [], sigma, j, k
    if (name === 'moons') {
      for (j = 0; j < 12; j++) { var a = Math.PI * j / 11; means.push([(Math.cos(a) - 0.5) / 0.8898, (Math.sin(a) - 0.25) / 0.4807]) }
      for (j = 0; j < 12; j++) { var b = Math.PI * j / 11; means.push([(1 - Math.cos(b) - 0.5) / 0.8898, (0.5 - Math.sin(b) - 0.25) / 0.4807]) }
      sigma = 0.08
    } else if (name === 'single') {
      means.push([1.5, -1.0]); sigma = 0.3
    } else {
      for (k = 0; k < 8; k++) means.push([2 * Math.cos(2 * Math.PI * k / 8), 2 * Math.sin(2 * Math.PI * k / 8)])
      sigma = 0.1
    }
    var K = means.length, mx = new Float64Array(K), my = new Float64Array(K)
    for (k = 0; k < K; k++) { mx[k] = means[k][0]; my[k] = means[k][1] }
    var r = AIW.rng(1), x0 = new Float64Array(2 * N)
    for (var i = 0; i < N; i++) {
      k = Math.floor(r() * K)
      x0[2 * i] = mx[k] + sigma * AIW.gauss(r)
      x0[2 * i + 1] = my[k] + sigma * AIW.gauss(r)
    }
    return { name: name, K: K, mx: mx, my: my, sigma: sigma, x0: x0 }
  }
  function drawNoise(seed) {
    var r = AIW.rng(seed), eps = new Float64Array(2 * N), xT = new Float64Array(2 * N), j
    for (j = 0; j < 2 * N; j++) eps[j] = AIW.gauss(r)
    for (j = 0; j < 2 * N; j++) xT[j] = AIW.gauss(r)
    return { seed: seed, eps: eps, xT: xT }
  }

  // ---- the exact denoiser: E[x_0 | x_t] for the mixture (never divides by sqrt(abar_t)) ----
  function denoise(x, abt, mix, out, lr) {
    var sa = Math.sqrt(abt), s2 = mix.sigma * mix.sigma, v = abt * s2 + 1 - abt, g = sa * s2 / v
    var K = mix.K, mx = mix.mx, my = mix.my
    for (var i = 0; i < N; i++) {
      var xi = x[2 * i], yi = x[2 * i + 1], top = -Infinity, k
      for (k = 0; k < K; k++) {
        var dx = xi - sa * mx[k], dy = yi - sa * my[k], l = -(dx * dx + dy * dy) / (2 * v)
        lr[k] = l; if (l > top) top = l
      }
      var s = 0, ax = 0, ay = 0
      for (k = 0; k < K; k++) {                  // responsibilities by log-sum-exp, then sum_k r_k m_k
        var w = Math.exp(lr[k] - top)
        s += w
        ax += w * (mx[k] + g * (xi - sa * mx[k]))
        ay += w * (my[k] + g * (yi - sa * my[k]))
      }
      out[2 * i] = ax / s; out[2 * i + 1] = ay / s
    }
  }
  function ddpmStep(sch, t, x, xh, r, mix, lr) {  // x_t -> x_{t-1}, posterior mean plus noise
    denoise(x, sch.ab[t], mix, xh, lr)
    var ab = sch.ab, b = sch.beta[t]
    var c0 = Math.sqrt(ab[t - 1]) * b / (1 - ab[t]), c1 = Math.sqrt(1 - b) * (1 - ab[t - 1]) / (1 - ab[t])
    var sd = Math.sqrt((1 - ab[t - 1]) * b / (1 - ab[t]))
    for (var i = 0; i < N; i++) {
      var nx = c0 * xh[2 * i] + c1 * x[2 * i], ny = c0 * xh[2 * i + 1] + c1 * x[2 * i + 1]
      if (t > 1) { nx += sd * AIW.gauss(r); ny += sd * AIW.gauss(r) }
      x[2 * i] = nx; x[2 * i + 1] = ny
    }
  }
  function ddimStep(sch, t, tn, x, xh, mix, lr) { // x_t -> x_tn, deterministic
    denoise(x, sch.ab[t], mix, xh, lr)
    var a = Math.sqrt(sch.ab[t]), b = Math.sqrt(1 - sch.ab[t]), an = Math.sqrt(sch.ab[tn]), bn = Math.sqrt(1 - sch.ab[tn])
    for (var j = 0; j < 2 * N; j++) { var e = (x[j] - a * xh[j]) / b; x[j] = an * xh[j] + bn * e }
  }
  function assess(x, mix) {                      // precision and components hit after a reverse run
    var lim = 9 * mix.sigma * mix.sigma, hitK = new Uint8Array(mix.K), hit = new Uint8Array(N), n = 0
    for (var i = 0; i < N; i++) {
      var best = Infinity, kb = 0
      for (var k = 0; k < mix.K; k++) {
        var dx = x[2 * i] - mix.mx[k], dy = x[2 * i + 1] - mix.my[k], d = dx * dx + dy * dy
        if (d < best) { best = d; kb = k }
      }
      if (best <= lim) { n++; hit[i] = 1; hitK[kb] = 1 }
    }
    var comps = 0
    for (var c = 0; c < mix.K; c++) comps += hitK[c]
    return { n: n, precision: n / N, comps: comps, hit: hit }
  }

  // ---- number formatting for the readouts (plain Unicode) ----
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  function sig3(x) {
    if (x === 1) return '1'
    if (x === 0) return '0'
    if (x >= 1e-3) return x.toPrecision(3)
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e)
    if (Number(m.toFixed(2)) >= 10) { m /= 10; e += 1 }
    return m.toFixed(2) + '×10' + String(e).split('').map(function (c) { return SUP[c] }).join('')
  }
  function signed(v, d) { return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d) }
  function snrText(ab) { return ab >= 1 ? '+∞ dB' : signed(10 * Math.log10(ab / (1 - ab)), 1) + ' dB' }
  function meanNorm(x) { var s = 0; for (var i = 0; i < N; i++) s += Math.sqrt(x[2 * i] * x[2 * i] + x[2 * i + 1] * x[2 * i + 1]); return s / N }

  // ---- state ----
  var DATASETS = [['ring', tr('ring of 8 Gaussians', '8 个高斯组成的环')], ['moons', tr('two moons', '双月')],
    ['single', tr('single Gaussian', '单个高斯')]]
  var SAMPLERS = [['ddpm', tr('DDPM ancestral, 1000 steps', 'DDPM 祖先采样，1000 步'), 1000],
    ['ddim50', tr('DDIM 50 steps', 'DDIM，50 步'), 50], ['ddim10', tr('DDIM 10 steps', 'DDIM，10 步'), 10],
    ['ddim3', tr('DDIM 3 steps', 'DDIM，3 步'), 3]]
  function sampler(id) { for (var i = 0; i < SAMPLERS.length; i++) if (SAMPLERS[i][0] === id) return SAMPLERS[i]; return SAMPLERS[1] }
  function samplerTimes(id) {
    var sp = sampler(id), K = sp[2], times = [], i
    if (id === 'ddpm') for (i = T; i >= 0; i--) times.push(i)
    else for (i = 0; i <= K; i++) times.push(Math.round(T * (1 - i / K)))
    return times
  }
  var startT = parseInt(opts.t, 10)
  var S = {
    ds: DATASETS.some(function (d) { return d[0] === opts.dataset }) ? opts.dataset : 'ring',
    t: isFinite(startT) ? Math.max(0, Math.min(T, startT)) : 500,
    sampler: SAMPLERS.some(function (d) { return d[0] === opts.sampler }) ? opts.sampler : 'ddim50',
    seed: DRAW_SEED, means: true,
    mode: 'forward',   // 'forward': the panels show x_t of the forward process; 'reverse': a reverse run
    run: null,         // the reverse run being shown
    last: null         // the last finished run, kept for the readouts until the data or the noise change
  }
  var mix = mixture(S.ds), noise = drawNoise(S.seed)
  var pts = [new Float64Array(2 * N), new Float64Array(2 * N)]
  var hist = { bins: [new Float64Array(40), new Float64Array(40)], ymax: 0.5 }

  function forward() {
    for (var p = 0; p < 2; p++) {
      var ab = SCH[p].ab[S.t], a = Math.sqrt(ab), b = Math.sqrt(1 - ab), x = pts[p]
      for (var j = 0; j < 2 * N; j++) x[j] = a * mix.x0[j] + b * noise.eps[j]
    }
  }
  function computeHists() {
    var top = 0
    for (var p = 0; p < 2; p++) {
      var bins = hist.bins[p]; bins.fill(0)
      for (var i = 0; i < N; i++) {
        var x = pts[p][2 * i]
        if (x >= -4 && x < 4) bins[Math.floor((x + 4) / 0.2)] += 1
      }
      for (var k = 0; k < 40; k++) { bins[k] /= N * 0.2; if (bins[k] > top) top = bins[k] }
    }
    var nice = [0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
    hist.ymax = nice[nice.length - 1]
    for (var n = 0; n < nice.length; n++) if (nice[n] >= top * 1.05) { hist.ymax = nice[n]; break }
  }

  // ---- layout ----
  el.textContent = ''
  var dsSel = AIW.select({ label: tr('Dataset', '数据集'), options: DATASETS, value: S.ds, onChange: function (v) { setDataset(v) } })
  var tSl = AIW.slider({ label: tr('Timestep t (both panels)', '时间步 t（两个面板）'), min: 0, max: T, step: 1, value: S.t,
    fmt: function (v) { return String(Math.round(v)) }, onInput: function (v) { stopPlay(); toForward(); setT(Math.round(v)) } })
  tSl.style.flex = '2 1 220px'
  var tInput = tSl.querySelector('input')
  tInput.addEventListener('keydown', function (e) {   // arrows move t by 1 natively; Shift + arrow by 50
    if (!e.shiftKey) return
    var d = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 50 : (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -50 : 0
    if (!d) return
    e.preventDefault()
    var v = Math.max(0, Math.min(T, S.t + d))
    stopPlay(); toForward(); tSl.set(v); setT(v)
  })
  var playBtn = AIW.button(tr('Play', '播放'), togglePlay)
  var noiseBtn = AIW.button(tr('Resample noise', '重新采样噪声'), resample, true)
  var samSel = AIW.select({ label: tr('Reverse sampler', '反向采样器'), options: SAMPLERS.map(function (s) { return [s[0], s[1]] }), value: S.sampler,
    onChange: function (v) { S.sampler = v; chart.redraw(); readouts() } })
  var runBtn = AIW.button(tr('Run reverse', '运行反向过程'), runReverse)
  var meansBox = AIW.checkbox(tr('Show component means', '显示分量均值'), S.means, function (v) { S.means = v; scat[0].redraw(); scat[1].redraw() })
  var ctlStyle = { alignItems: 'flex-end' }
  el.appendChild(h('div', { class: 'w-controls', style: ctlStyle }, dsSel, tSl, playBtn, noiseBtn))
  el.appendChild(h('div', { class: 'w-controls', style: ctlStyle }, samSel, runBtn, meansBox))

  function lineSample(p, w) {
    return h('i', { style: { display: 'inline-block', width: (w || 26) + 'px', height: '0', borderTop: '2.5px ' + (p ? 'dashed' : 'solid') + ' ' + COL.sch[p],
      verticalAlign: 'middle', marginRight: '.45rem' } })
  }
  var TITLES = [tr('Linear schedule', '线性调度'), tr('Cosine schedule', '余弦调度')]
  var row = h('div', { class: 'w-row' }), scat = [], hcv = [], ro = []
  for (var p = 0; p < 2; p++) {
    var col = h('div', { class: 'w-col', style: { flex: '1 1 312px' } })   // two columns from 640 px, stacked below
    col.appendChild(h('div', { style: { fontWeight: '600', fontSize: '.86rem', color: COL.ink, margin: '0 0 .35rem' } }, lineSample(p), TITLES[p]))
    var sw = h('div'), hw = h('div', { style: { marginTop: '.3rem' } })
    col.appendChild(sw); col.appendChild(hw)
    scat.push(AIW.canvas(sw, { aspect: 1, maxHeight: 440 }, drawScatter.bind(null, p)))
    hcv.push(AIW.canvas(hw, { aspect: 0.3, maxHeight: 120 }, drawHist.bind(null, p)))
    scat[p].cv.setAttribute('role', 'img')
    scat[p].cv.setAttribute('aria-label', tr('Scatter plot of the 1,000 points under the ', '1,000 个点的散点图：') + TITLES[p])
    hcv[p].cv.setAttribute('role', 'img')
    hcv[p].cv.setAttribute('aria-label', tr('Histogram of the points’ x-coordinates with the N(0, 1) density', '各点 x 坐标的直方图与 N(0, 1) 密度'))
    ro.push(h('div', { class: 'w-readout', style: { marginTop: '.45rem' }, 'aria-live': 'polite' }))
    col.appendChild(ro[p])
    row.appendChild(col)
  }
  el.appendChild(row)

  var chartWrap = h('div', { style: { marginTop: '.9rem' } })
  chartWrap.appendChild(h('div', { style: { fontWeight: '600', fontSize: '.86rem', color: COL.ink, margin: '0 0 .3rem' } },
    tr('Signal fraction ', '信号比例 '), h('span', { class: 'math-i' }, '\\bar\\alpha_t'),
    tr(' against t (log scale), both schedules', ' 随 t 的变化（对数坐标），两种调度')))
  el.appendChild(chartWrap)
  var chart = AIW.canvas(chartWrap, { aspect: 0.5, maxHeight: 210 }, drawChart)
  chart.cv.setAttribute('role', 'img')
  chart.cv.setAttribute('aria-label', tr('Line chart of abar_t against t for the linear and cosine schedules', '线性与余弦调度下 ᾱ_t 随 t 变化的折线图'))
  function legendItem(sample, text) { return h('span', { style: { display: 'inline-flex', alignItems: 'center' } }, sample, text) }
  function borderSample(style, color, w) {
    return h('i', { style: { display: 'inline-block', width: (w || 22) + 'px', height: '0', borderTop: style + ' ' + color, verticalAlign: 'middle', marginRight: '.35rem', background: 'none' } })
  }
  el.appendChild(h('div', { class: 'w-legend' },
    legendItem(lineSample(0, 22), tr('linear β_t, 10⁻⁴ to 0.02', '线性 β_t，10⁻⁴ 到 0.02')),
    legendItem(lineSample(1, 22), tr('cosine, s = 0.008', '余弦，s = 0.008')),
    legendItem(borderSample('2px dotted', COL.slate), 'ᾱ = 0.01 (SNR −20 dB)'),
    legendItem(borderSample('2px solid', COL.ink, 3), tr('current t', '当前 t')),
    legendItem(h('i', { style: { display: 'inline-block', width: '2px', height: '9px', background: COL.slate, marginRight: '.35rem' } }),
      tr('timesteps the selected sampler visits', '所选采样器经过的时间步'))))
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Below ᾱ = 0.01 the input is almost pure noise: the linear schedule is there from t = ' + SCH[0].below + ' (' + ((T - SCH[0].below + 1) / 10).toFixed(1) +
      '% of its steps), the cosine schedule from t = ' + SCH[1].below + ' (' + ((T - SCH[1].below + 1) / 10).toFixed(1) + '%).',
    '当 ᾱ < 0.01 时输入几乎是纯噪声：线性调度从 t = ' + SCH[0].below + ' 起进入这一区间（占全部步数的 ' + ((T - SCH[0].below + 1) / 10).toFixed(1) +
      '%），余弦调度从 t = ' + SCH[1].below + ' 起（' + ((T - SCH[1].below + 1) / 10).toFixed(1) + '%）。')))
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Both panels use the same 1,000 points x₀ and the same per-point noise ε; only the schedule differs. Run reverse starts both panels from the same fresh N(0, I) points and uses the exact posterior mean E[x₀ | x_t] of the data mixture in place of a trained network. Precision is the share of final points within 3σ of the nearest component mean; perfect samples score 1 − e^(−4.5) ≈ 0.989. Keys: ←/→ on the slider move t by 1, Shift+←/→ by 50.',
    '两个面板使用相同的 1,000 个数据点 x₀ 和相同的逐点噪声 ε，只有噪声调度不同。“运行反向过程”让两个面板从同一组新抽取的 N(0, I) 点出发，并用数据混合分布的精确后验均值 E[x₀ | x_t] 代替训练好的网络。精确率是最终点中落在最近分量均值 3σ 以内的比例；完美的样本得分为 1 − e^(−4.5) ≈ 0.989。键盘：在滑块上按 ←/→ 使 t 变化 1，Shift+←/→ 变化 50。')))

  // ---- drawing ----
  function squarePad(w, h) {                     // a square plot area, centred, with room for tick labels
    var side = Math.max(60, Math.min(w - 38, h - 26)), l = 30 + Math.max(0, (w - 38 - side) / 2)
    return { side: side, pad: { l: l, r: w - l - side, t: 6, b: h - 6 - side } }
  }
  function drawScatter(p, ctx, w, hh) {
    var sq = squarePad(w, hh), pad = sq.pad, side = sq.side, i, k
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: -4, x1: 4, y0: -4, y1: 4, xticks: 4, yticks: 4, pad: pad,
      xfmt: function (v) { return String(Math.round(v)).replace('-', '−') }, yfmt: function (v) { return String(Math.round(v)).replace('-', '−') } })
    var x = pts[p], run = S.mode === 'reverse' ? S.run : null, res = run && run.done ? run.res[p] : null
    ctx.save()
    ctx.beginPath(); ctx.rect(pad.l, pad.t, side, side); ctx.clip()
    var px = side / 8
    if (S.means) {                               // the data components' means, as faint crosses
      ctx.strokeStyle = COL.ink; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.2
      ctx.beginPath()
      for (k = 0; k < mix.K; k++) {
        var cx = ax.X(mix.mx[k]), cy = ax.Y(mix.my[k])
        ctx.moveTo(cx - 4.5, cy); ctx.lineTo(cx + 4.5, cy); ctx.moveTo(cx, cy - 4.5); ctx.lineTo(cx, cy + 4.5)
      }
      ctx.stroke()
      if (res) {                                 // the 3-sigma discs that count as a hit
        ctx.globalAlpha = 0.35; ctx.setLineDash([3, 3]); ctx.lineWidth = 1
        ctx.beginPath()
        for (k = 0; k < mix.K; k++) { var ex = ax.X(mix.mx[k]), ey = ax.Y(mix.my[k]); ctx.moveTo(ex + 3 * mix.sigma * px, ey); ctx.arc(ex, ey, 3 * mix.sigma * px, 0, 2 * Math.PI) }
        ctx.stroke(); ctx.setLineDash([])
      }
    }
    var r = side < 300 ? 1.4 : 1.7
    ctx.fillStyle = COL.sch[p]; ctx.globalAlpha = 0.5
    ctx.beginPath()
    for (i = 0; i < N; i++) {
      if (res && !res.hit[i]) continue
      var X = ax.X(x[2 * i]), Y = ax.Y(x[2 * i + 1])
      ctx.moveTo(X + r, Y); ctx.arc(X, Y, r, 0, 2 * Math.PI)
    }
    ctx.fill()
    if (res) {                                   // misses: hollow red rings, so they read without colour too
      ctx.strokeStyle = COL.miss; ctx.globalAlpha = 0.85; ctx.lineWidth = 1
      ctx.beginPath()
      for (i = 0; i < N; i++) {
        if (res.hit[i]) continue
        var mxp = ax.X(x[2 * i]), myp = ax.Y(x[2 * i + 1])
        ctx.moveTo(mxp + 2.6, myp); ctx.arc(mxp, myp, 2.6, 0, 2 * Math.PI)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    // what the panel shows, top left
    var tag = S.mode === 'reverse' && run
      ? (run.done ? tr('reverse result, ', '反向结果，') : tr('reverse, ', '反向，')) + run.label + ' · t = ' + S.t
      : tr('forward, t = ', '前向，t = ') + S.t
    ctx.font = '11.5px "DM Sans", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
    var tw = ctx.measureText(tag).width
    ctx.fillStyle = COL.bg; ctx.globalAlpha = 0.85
    ctx.fillRect(pad.l + 4, pad.t + 4, tw + 10, 18)
    ctx.globalAlpha = 1; ctx.fillStyle = COL.ink; ctx.textAlign = 'left'
    ctx.fillText(tag, pad.l + 9, pad.t + 17)
    ctx.restore()
  }
  function drawHist(p, ctx, w, hh) {
    var sq = squarePad(w, w), pad = { l: sq.pad.l, r: sq.pad.r, t: 6, b: 18 }, ymax = hist.ymax
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: -4, x1: 4, y0: 0, y1: ymax, xticks: 4, yticks: 2, pad: pad,
      xfmt: function (v) { return String(Math.round(v)).replace('-', '−') }, yfmt: function (v) { return v.toFixed(v === 0 ? 0 : (ymax % 2 === 0 ? 0 : 1)) } })
    ctx.save()
    ctx.beginPath(); ctx.rect(pad.l, pad.t, w - pad.l - pad.r, hh - pad.t - pad.b); ctx.clip()
    var bins = hist.bins[p]
    ctx.fillStyle = COL.sch[p]; ctx.globalAlpha = 0.38
    for (var k = 0; k < 40; k++) {
      if (!bins[k]) continue
      var x0 = ax.X(-4 + 0.2 * k), x1 = ax.X(-4 + 0.2 * (k + 1)), y = ax.Y(bins[k])
      ctx.fillRect(x0 + 0.5, y, x1 - x0 - 1, ax.Y(0) - y)
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5
    ctx.beginPath()
    for (var i = 0; i <= 160; i++) {
      var xv = -4 + i * 0.05, yv = Math.exp(-xv * xv / 2) / Math.sqrt(2 * Math.PI)
      if (i) ctx.lineTo(ax.X(xv), ax.Y(yv)); else ctx.moveTo(ax.X(xv), ax.Y(yv))
    }
    ctx.stroke()
    ctx.font = '11px "DM Sans", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.fillStyle = COL.slate; ctx.textAlign = 'right'
    ctx.fillText(tr('x-coordinates; line: N(0, 1)', 'x 坐标；曲线：N(0, 1)'), w - pad.r - 4, pad.t + 11)
    ctx.restore()
  }
  function decade(v) {
    var e = Math.round(Math.log10(v))
    if (e >= -2) return e === 0 ? '1' : (e === -1 ? '0.1' : '0.01')
    return '10' + String(e).split('').map(function (c) { return SUP[c] }).join('')
  }
  function drawChart(ctx, w, hh) {
    var pad = { l: 58, r: 14, t: 10, b: 34 }, Y0 = 1e-5
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: T, y0: Y0, y1: 1, logY: true, xticks: 5, yticks: 5, pad: pad,
      xlabel: 't', ylabel: 'ᾱ_t', xfmt: function (v) { return String(Math.round(v)) }, yfmt: decade })
    var L = pad.l, R = w - pad.r, top = pad.t, bot = hh - pad.b
    ctx.save()
    ctx.beginPath(); ctx.rect(L, top, R - L, bot - top); ctx.clip()
    // the sampler's timesteps, as a rug along the bottom
    var times = samplerTimes(S.sampler)
    ctx.fillStyle = COL.slate; ctx.globalAlpha = 0.75
    if (S.sampler === 'ddpm') ctx.fillRect(L, bot - 7, R - L, 7)
    else for (var q = 0; q < times.length; q++) ctx.fillRect(ax.X(times[q]) - 0.75, bot - 7, 1.5, 7)
    ctx.globalAlpha = 1
    // abar = 0.01
    ctx.strokeStyle = COL.slate; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3])
    ctx.beginPath(); ctx.moveTo(L, ax.Y(0.01)); ctx.lineTo(R, ax.Y(0.01)); ctx.stroke()
    ctx.setLineDash([])
    // the two schedules
    for (var p = 0; p < 2; p++) {
      var ab = SCH[p].ab
      ctx.strokeStyle = COL.sch[p]; ctx.lineWidth = 2.2; ctx.setLineDash(DASH[p])
      ctx.beginPath()
      for (var t = 0; t <= T; t++) {
        var yy = ax.Y(Math.max(ab[t], Y0 / 10))
        if (t) ctx.lineTo(ax.X(t), yy); else ctx.moveTo(ax.X(t), yy)
      }
      ctx.stroke()
    }
    ctx.setLineDash([])
    // the current t
    var X = ax.X(S.t)
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(X, top); ctx.lineTo(X, bot); ctx.stroke()
    for (p = 0; p < 2; p++) {
      var v = SCH[p].ab[S.t]
      if (v < Y0) continue
      ctx.fillStyle = COL.sch[p]; ctx.strokeStyle = COL.bg; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(X, ax.Y(v), 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke()
    }
    ctx.restore()
  }
  function readouts() {
    var run = S.mode === 'reverse' ? S.run : null
    for (var p = 0; p < 2; p++) {
      var ab = SCH[p].ab[S.t], lines = []
      lines.push('t = ' + S.t + '    ᾱ_t = ' + sig3(ab))
      lines.push(tr('signal ', '信号 ') + '√ᾱ_t = ' + sig3(Math.sqrt(ab)))
      lines.push(tr('noise ', '噪声 ') + '√(1−ᾱ_t) = ' + Math.sqrt(1 - ab).toFixed(3))
      lines.push(tr('SNR', '信噪比') + ' = 10 log₁₀(ᾱ_t/(1−ᾱ_t)) = ' + snrText(ab))
      lines.push(tr('mean ', '平均 ') + '‖x_t‖ = ' + meanNorm(pts[p]).toFixed(2) + tr('   (N(0, I): 1.25)', '（N(0, I)：1.25）'))
      if (run && !run.done) {
        lines.push(tr('reverse run, ', '反向运行，') + run.label + ':')
        lines.push(tr('step ', '第 ') + run.step + ' / ' + run.K + tr('', ' 步'))
      } else if (S.last) {
        var r = S.last.res[p]
        lines.push((run ? tr('reverse run, ', '反向运行，') : tr('last reverse run, ', '上次反向运行，')) + S.last.label + ':')
        lines.push(tr('precision ', '精确率 ') + r.precision.toFixed(3) + ' (' + r.n + '/' + N + ')  ·  ' +
          tr('components hit ', '命中分量 ') + r.comps + '/' + S.last.K)
      } else {
        lines.push(tr('reverse run: press Run reverse', '反向运行：点击“运行反向过程”'))
        lines.push(tr('precision —  ·  components hit —', '精确率 —  ·  命中分量 —'))
      }
      ro[p].textContent = lines.join('\n')
    }
  }
  function render() {
    computeHists()
    scat[0].redraw(); scat[1].redraw(); hcv[0].redraw(); hcv[1].redraw(); chart.redraw()
    readouts()
  }

  // ---- forward interaction ----
  function setT(v) { S.t = v; if (S.mode === 'forward') forward(); render() }
  function toForward() { cancelRun(); if (S.mode !== 'forward') { S.mode = 'forward'; S.run = null } }
  function setDataset(v) {
    toForward(); S.ds = v; mix = mixture(v); S.last = null
    forward(); render()
  }
  function resample() {
    toForward(); S.seed += 1; noise = drawNoise(S.seed); S.last = null
    forward(); render()
  }
  var play = null, pausedAt = null, playRaf = 0
  function stopPlay() {
    if (!play) return
    cancelAnimationFrame(playRaf); play = null; playBtn.textContent = tr('Play', '播放')
  }
  function togglePlay() {
    if (play) { stopPlay(); pausedAt = S.t; return }
    toForward()
    var from = (pausedAt !== null && pausedAt === S.t && S.t < T) ? S.t : 0
    pausedAt = null
    play = { from: from, start: performance.now() }
    playBtn.textContent = tr('Pause', '暂停')
    tSl.set(from); setT(from)
    playRaf = requestAnimationFrame(tickPlay)
  }
  function tickPlay(now) {
    if (!play) return
    var el2 = Math.max(0, now - play.start)
    // reduced motion: no continuous movement, ten jumps of 100 steps instead
    var v = reduced ? play.from + Math.floor(el2 / (PLAY_MS / 10)) * (T / 10) : play.from + el2 * T / PLAY_MS
    v = Math.min(T, Math.round(v))
    if (v !== S.t) { tSl.set(v); setT(v) }
    if (v >= T) { stopPlay(); return }
    playRaf = requestAnimationFrame(tickPlay)
  }

  // ---- the reverse process, in chunks with requestAnimationFrame (about 60 frames for any K) ----
  var runRaf = 0
  function cancelRun() { if (S.run && !S.run.done) { cancelAnimationFrame(runRaf); S.run.cancelled = true } }
  function runReverse() {
    stopPlay(); cancelRun(); pausedAt = null
    var sp = sampler(S.sampler)
    var run = { id: sp[0], label: sp[1], K: sp[2], times: samplerTimes(sp[0]), step: 0, frame: 0, last: 0, done: false,
      x: [], rng: [], xh: new Float64Array(2 * N), lr: new Float64Array(mix.K), mix: mix, res: null }
    for (var p = 0; p < 2; p++) {               // same start points and the same z for both panels
      var r = AIW.rng(S.seed)
      for (var j = 0; j < 4 * N; j++) AIW.gauss(r) // skip eps and x_T, which noise already holds
      run.rng.push(r); run.x.push(Float64Array.from(noise.xT))
    }
    S.run = run; S.mode = 'reverse'
    showRun()
    runRaf = requestAnimationFrame(tickRun)
  }
  function advance(run, target) {
    while (run.step < target) {
      var t = run.times[run.step], tn = run.times[run.step + 1]
      for (var p = 0; p < 2; p++) {
        if (run.id === 'ddpm') ddpmStep(SCH[p], t, run.x[p], run.xh, run.rng[p], run.mix, run.lr)
        else ddimStep(SCH[p], t, tn, run.x[p], run.xh, run.mix, run.lr)
      }
      run.step++
    }
  }
  function tickRun(now) {
    var run = S.run
    if (!run || run.done || run.cancelled) return
    if (reduced) {                               // compute in time-boxed chunks and show only the result
      var c0 = performance.now()
      while (run.step < run.K && performance.now() - c0 < 12) advance(run, run.step + 1)
      if (run.step >= run.K) finish(run); else { readouts(); runRaf = requestAnimationFrame(tickRun) }
      return
    }
    if (now - run.last >= FRAME_MS) {
      run.last = now; run.frame++
      advance(run, Math.min(run.K, Math.floor(run.frame * run.K / FRAMES)))
      if (run.frame >= FRAMES) { finish(run); return }
      showRun()
    }
    runRaf = requestAnimationFrame(tickRun)
  }
  function finish(run) {
    advance(run, run.K)
    run.done = true
    run.res = [assess(run.x[0], run.mix), assess(run.x[1], run.mix)]
    S.last = { label: run.label, res: run.res, K: run.mix.K }
    showRun()
  }
  function showRun() {
    var run = S.run
    S.t = run.times[run.step]
    tSl.set(S.t)
    pts[0].set(run.x[0]); pts[1].set(run.x[1])
    render()
  }

  forward()
  render()
})

;
/* ---- gd-quadratic.js ---- */
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

;
/* ---- gradient-flow-explorer.js ---- */
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

;
/* ---- memory-planner.js ---- */
/* Module 08: explicit component estimates, not an allocator peak prediction. */
AIW.register('memory-planner', function (el) {
  'use strict'
  var h = AIW.h, tr = AIW.t, C = AIW.C
  var st = { L: 36, d: 4096, heads: 32, kv: 8, ff: 15360, V: 152064,
    tied: false, power: 13, batch: 1, ranks: 8, tp: 1, scheme: '16',
    checkpoint: 'none', flash: true, memory: 80 }
  var controls = h('div', { class: 'w-controls' }), readout = h('div', {
    class: 'w-readout', 'aria-live': 'polite' }), note = h('p', { class: 'w-note' })
  var chartWrap = h('div'), table = h('table', { class: 'w-table' }), chart, result
  function change(key, value) { st[key] = value; update() }
  function slider(key, label, min, max, step, format) {
    controls.appendChild(AIW.slider({ label: label, min: min, max: max, step: step,
      value: st[key], fmt: format, onInput: function (v) { change(key, v) } }))
  }
  function number(key, label, min, max) {
    var input = h('input', { type: 'number', min: min, max: max, step: 1,
      style: { width: '14ch', maxWidth: '100%' },
      value: st[key], oninput: function () {
        change(key, Math.max(min, Math.min(max, Math.round(Number(input.value) || min))))
      } })
    controls.appendChild(h('label', { class: 'w-ctl' }, label, input))
  }
  function select(key, label, options) {
    controls.appendChild(AIW.select({ label: label, options: options, value: st[key],
      onChange: function (v) { change(key, v) } }))
  }
  slider('L', tr('Layers L', '层数 L'), 2, 128, 1, String)
  slider('d', tr('Width d', '宽度 d'), 256, 16384, 128, String)
  number('heads', tr('Query heads', '查询头数'), 1, 256)
  number('kv', tr('KV heads', 'KV 头数'), 1, 256)
  number('ff', tr('FFN width', '前馈网络宽度'), 128, 262144)
  number('V', tr('Vocabulary V', '词表大小 V'), 1, 1000000)
  controls.appendChild(AIW.checkbox(tr('Tied embeddings', '绑定嵌入'), st.tied,
    function (v) { change('tied', v) }))
  slider('power', tr('Sequence length T', '序列长度 T'), 9, 17, 1,
    function (v) { return String(Math.pow(2, v)) })
  slider('batch', tr('Micro-batch per GPU', '每 GPU 微批量'), 1, 32, 1, String)
  number('ranks', tr('Sharding degree', '分片度'), 1, 1024)
  select('tp', tr('Tensor parallelism (sequence parallel)', '张量并行（含序列并行）'),
    [1, 2, 4, 8].map(function (v) { return [String(v), String(v)] }))
  select('scheme', tr('State precision', '模型状态精度'), [
    ['16', tr('bf16 + fp32 master + Adam: 16 B', 'bf16 + fp32 主权重 + Adam：16 B')],
    ['18', tr('fp32 gradients: 18 B', 'fp32 梯度：18 B')],
    ['10', tr('8-bit Adam states: 10 B', '8 位 Adam 状态：10 B')]])
  select('checkpoint', tr('Activation checkpointing', '激活检查点'), [
    ['none', tr('None', '无')], ['selective', tr('Selective', '选择性')],
    ['full', tr('Full', '完整')]])
  controls.appendChild(AIW.checkbox(tr('FlashAttention', 'FlashAttention'), st.flash,
    function (v) { change('flash', v) }))
  select('memory', tr('GPU allocation (decimal GB)', 'GPU 容量（十进制 GB）'),
    [24, 40, 80, 141, 192].map(function (v) { return [String(v), v + ' GB'] }))
  el.appendChild(controls); el.appendChild(readout); el.appendChild(chartWrap)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Blue: weights; orange: gradients; green: optimiser; purple: activations; sky: fp32 logits. '
      + 'Hatching marks the subtotal above capacity. Long bars are capped at 3× capacity.',
    '蓝色：权重；橙色：梯度；绿色：优化器；紫色：激活；浅蓝色：fp32 logits。'
      + '斜线表示超过容量的部分；过长的柱最多显示到容量的 3 倍。')))
  el.appendChild(table); el.appendChild(note)
  function calculate() {
    var T = Math.pow(2, st.power), dh = Math.round(st.d / st.heads)
    var kvWidth = st.kv * dh, queryWidth = st.heads * dh
    var N = st.L * (2 * st.d * queryWidth + 2 * st.d * kvWidth
      + 3 * st.d * st.ff + 2 * st.d) + st.V * st.d * (st.tied ? 1 : 2) + st.d
    var P = N / Number(st.tp), g = st.scheme === '18' ? 4 : 2
    var optimiser = st.scheme === '10' ? 6 : 12
    var A = (12 * st.d + 4 * kvWidth + 6 * st.ff) / Number(st.tp)
    var activation = st.checkpoint === 'full'
      ? 2 * st.d * st.batch * T * st.L / Number(st.tp) + A * st.batch * T
      : A * st.batch * T * st.L
    if (!st.flash && st.checkpoint === 'none') {
      activation += 2 * st.heads * T * T * st.batch * st.L / Number(st.tp)
    }
    var logits = 4 * st.batch * T * st.V / Number(st.tp)
    var states = [[2 * P, g * P, optimiser * P],
      [2 * P, g * P, optimiser * P / st.ranks],
      [2 * P, g * P / st.ranks, optimiser * P / st.ranks],
      [2 * P / st.ranks, g * P / st.ranks, optimiser * P / st.ranks]]
    var bars = states.map(function (parts) {
      return parts.concat([activation, logits]).map(function (bytes) { return bytes / 1e9 })
    })
    var extra = st.checkpoint === 'full' ? 1 / 3 : st.checkpoint === 'selective'
      ? 2 * st.L * T * st.d / (6 * N + 6 * st.L * T * st.d) : 0
    return { N: N, dh: dh, A: A, bars: bars, extra: extra,
      communication: st.ranks === 1 ? [0, 0, 0, 0]
        : [4 * P / 1e9, 4 * P / 1e9, 4 * P / 1e9, 6 * P / 1e9] }
  }
  function gb(value) { return value >= 1000 ? (value / 1000).toFixed(2) + ' TB'
    : value.toFixed(1) + ' GB' }
  chart = AIW.canvas(chartWrap, { aspect: 1.05, maxHeight: 360 }, function (ctx, w, height) {
    if (!result) return
    var capacity = Number(st.memory), max = 3 * capacity
    var axes = AIW.axes(ctx, { w: w, h: height, x0: 0, x1: 4, y0: 0, y1: max,
      ylabel: tr('GB per GPU', '每 GPU 的 GB'),
      xticks: 4, xfmt: function () { return '' },
      yfmt: function (v) { return String(Math.round(v)) },
      pad: { l: 48, r: 8, t: 28, b: 36 } })
    var colours = [C.blue, C.orange, C.green, C.purple, C.sky]
    result.bars.forEach(function (parts, i) {
      var total = parts.reduce(function (sum, x) { return sum + x }, 0)
      var x = axes.X(i + 0.18), bw = axes.X(i + 0.82) - x, base = 0
      parts.forEach(function (value, j) {
        var top = Math.min(max, base + value), bottom = Math.min(max, base)
        ctx.fillStyle = colours[j]
        ctx.fillRect(x, axes.Y(top), bw, axes.Y(bottom) - axes.Y(top)); base += value
      })
      if (total > capacity) {
        ctx.save(); ctx.beginPath(); ctx.rect(x, axes.Y(Math.min(max, total)), bw,
          axes.Y(capacity) - axes.Y(Math.min(max, total))); ctx.clip()
        ctx.strokeStyle = C.navy; ctx.lineWidth = 1
        for (var y = 0; y < height + bw; y += 8) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + bw, y - bw); ctx.stroke()
        }
        ctx.restore()
      }
      ctx.fillStyle = C.navy; ctx.font = '11px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(gb(total), x + bw / 2, Math.max(16, axes.Y(Math.min(total, max)) - 7))
      ctx.fillText(i === 0 ? 'DP' : 'ZeRO-' + i, x + bw / 2, height - 12)
    })
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(axes.X(0), axes.Y(capacity))
    ctx.lineTo(axes.X(4), axes.Y(capacity)); ctx.stroke(); ctx.setLineDash([])
  })
  function update() {
    result = calculate()
    readout.textContent = 'N = ' + result.N.toLocaleString('en-GB')
      + '; dₕ = ' + result.dh + '; d_ff/d = ' + (st.ff / st.d).toFixed(2)
      + tr('; activation bytes/token/layer = ', '；每 token 每层激活字节 = ')
      + result.A.toFixed(0) + tr('; state B/parameter = ', '；每参数状态字节 = ')
      + st.scheme + tr('; recomputation estimate +', '；重计算估计 +')
      + (100 * result.extra).toFixed(1) + '%'
    table.textContent = ''
    table.appendChild(h('tr', null, h('th', null, tr('Strategy', '策略')),
      h('th', null, tr('Subtotal', '小计')), h('th', null, tr('Capacity', '容量'))))
    result.bars.forEach(function (parts, i) {
      var total = parts.reduce(function (sum, x) { return sum + x }, 0)
      table.appendChild(h('tr', null, h('td', null, i === 0 ? 'DP' : 'ZeRO-' + i),
        h('td', null, gb(total)), h('td', null, total <= Number(st.memory)
          ? tr('Within subtotal', '小计在容量内') : tr('Does not fit', '无法容纳'))))
      var labels = [tr('Weights ', '权重 '), tr('gradients ', '梯度 '),
        tr('optimiser ', '优化器 '), tr('activations ', '激活 '), 'logits ']
      table.appendChild(h('tr', null, h('td', { colspan: 3 },
        parts.map(function (value, j) { return labels[j] + gb(value) }).join('; '))))
      table.appendChild(h('tr', null, h('td', { colspan: 3 },
        tr('Approx. bf16 communication: ', '近似 bf16 通信量：')
        + gb(result.communication[i]) + (i === 3 ? tr(' / micro-batch', ' / 微批量')
          : tr(' / optimiser step', ' / 优化器步')))))
    })
    var warning = st.d % st.heads || st.heads % st.kv || st.kv > st.heads
    note.textContent = (warning ? tr(
      'Warning: heads do not divide the requested shape; dₕ is rounded for this illustration. ',
      '警告：头数不能整除所选形状；本示例对 dₕ 取整。') : '') + tr(
      'These component estimates omit peak gathered weights, communication buffers, allocator '
        + 'overhead and uneven tensor partitions. Measure the peak before claiming a run fits.',
      '这些分项估计未包含权重聚集峰值、通信缓冲区、分配器开销和不均匀张量分片。'
        + '判断能否运行前需要实测峰值。')
    chart.redraw()
  }
  update()
})

;
/* ---- message-passing-explorer.js ---- */
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
    var lab = compLabels(g.key), left = { textAlign: 'left' }, nw = { whiteSpace: 'nowrap' }
    table.appendChild(h('tr', null, h('th', { style: left }, t('node', '节点')),
      h('th', { style: nw }, swatch(PURE[0], g.key !== 'tree'), lab[0]), h('th', { style: nw }, swatch(PURE[1], g.key !== 'tree'), lab[1]),
      h('th', { style: nw }, swatch(PURE[2], true), lab[2])))
    if (!pins.length) {
      table.appendChild(h('tr', null, h('td', { colspan: '4', style: left }, t('Click a node to pin it here.', '点击节点即可固定到这里。'))))
      return
    }
    pins.forEach(function (i, p) {
      var nd = g.nodes[i], v = Hk[i]
      table.appendChild(h('tr', null,
        h('td', { style: left },
          h('span', { style: { whiteSpace: 'nowrap' } },
            h('span', { style: { display: 'inline-block', width: '1.35em', height: '1.35em', lineHeight: '1.35em', borderRadius: '50%', textAlign: 'center',
              background: ink.navy, color: '#fff', fontWeight: '600', marginRight: '.3rem' } }, String(p + 1)),
            swatch(colourOf(v).css, !(nd.type === OR || nd.type === AND)), h('b', null, nd.id)), h('br'),
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
      ne.badgeT.textContent = p >= 0 ? String(p + 1) : ''
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
    if (g.key === 'hex') msgs.push(t('Message passing cannot tell a hexagon from two triangles: every node has degree 2 and the same starting vector, so every node keeps the same vector at every k under every setting. (The largest eigenvalue, λ₁ = ' + fx(l1) + ', appears three times, once per connected component.)',
      '消息传递无法区分一个六边形和两个三角形：每个节点的度都是 2，初始向量也相同，所以在任何设置下、任何 k 时，所有节点的向量都相同。（最大特征值 λ₁ = ' + fx(l1) + ' 出现三次，每个连通分量一次。）'))
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
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: KMAX, y0: 0, y1: 1, xticks: 8, yticks: 4, pad: { l: 54, r: 12, t: 12, b: 34 },
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
      var near = tops[1] && tops[2] && Math.abs(tops[1].x - tops[2].x) < 26
      if (near) {                                     // too close to centre both: lambda_2 to the left, lambda_1 to the right
        var ly = Math.min(tops[1].y, tops[2].y) - 9
        ctx.fillStyle = ink.orange; ctx.textAlign = 'left'; ctx.fillText('λ₁', Math.max(tops[1].x, tops[2].x) + 1, ly)
        ctx.fillStyle = ink.purple; ctx.textAlign = 'right'; ctx.fillText('λ₂', Math.min(tops[1].x, tops[2].x) - 1, ly)
      } else {
        if (tops[1]) { ctx.fillStyle = ink.orange; ctx.textAlign = 'center'; ctx.fillText('λ₁', tops[1].x, tops[1].y - 9) }
        if (tops[2]) { ctx.fillStyle = ink.purple; ctx.textAlign = 'center'; ctx.fillText('λ₂', tops[2].x, tops[2].y - 9) }
      }
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

;
/* ---- mlp-playground.js ---- */
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

;
/* ---- optimiser-paths.js ---- */
/* optimiser-paths — Module 02, s7 (used again in s8).
 * Gradient descent, heavy ball, Nesterov, RMSProp and Adam on an ill-conditioned quadratic ravine
 * 𝓛 = ½(u² + κv²), (u, v) = Rθ rotated by α, or on the banana (1 − x)² + 10(y − x²)².
 * The whole run (300 steps; 1,000 on the banana) is recomputed from the start point whenever
 * anything changes; Play reveals it two steps per frame. */
AIW.register('optimiser-paths', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h, C = AIW.C

  // ---------------------------------------------------------------- constants
  var DOMAIN = { ravine: { x0: -2, x1: 2, y0: -2, y1: 2 }, banana: { x0: -2, x1: 2, y0: -1, y1: 3 } }
  var STEPS = { ravine: 300, banana: 1000 }
  var START = { ravine: [-1.8, 0.35], banana: [-1.5, 1.5] }   // ravine start is (u, v), its own axes
  var ETA0 = { ravine: 0.035, banana: 0.01 }                  // suggested η when a surface is chosen
  var MAXT = 1000, LDIV = 1e6, YLO = 1e-12, YHI = 1e3, MEANW = 100
  var NOISE_SEED = 11

  var METHODS = [
    { id: 'gd', name: t('gradient descent', '梯度下降'), color: '#2563EB', on: true },
    { id: 'hb', name: t('heavy ball', '重球动量'), color: '#C2410C', on: true },
    { id: 'nag', name: t('Nesterov', 'Nesterov 动量'), color: '#7E22CE', on: false },
    { id: 'rms', name: 'RMSProp', color: '#0891B2', on: false },
    { id: 'adam', name: 'Adam', color: '#15803D', on: true }
  ]

  var S = {
    surface: 'ravine', kappa: 50, alpha: 0, eta: ETA0.ravine, mu: 0.9, etaA: 0.05, sigma: 0,
    schedule: 'constant', start: { ravine: START.ravine.slice(), banana: START.banana.slice() },
    shown: STEPS.ravine, playing: false
  }

  // one noise sequence, shared by every method: ξ_t = (XI[2t − 2], XI[2t − 1]) at step t
  var XI = new Float64Array(2 * MAXT)
  ;(function () { var r = AIW.rng(NOISE_SEED); for (var i = 0; i < XI.length; i++) XI[i] = AIW.gauss(r) })()

  // ---------------------------------------------------------------- formatting
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
  function sup(n) { return String(n).split('').map(function (ch) { return SUP[ch] || ch }).join('') }
  function minus(s) { return s.replace(/-/g, '−') }
  function sig(x, d) { return minus(Number(x).toPrecision(d)) }
  function fix(x, d) { return minus(x.toFixed(d)) }
  function snap2(v) { return Number(v.toPrecision(2)) }
  function fmtL(x) {                      // a loss value
    if (!isFinite(x)) return '∞'
    if (x === 0) return '0'
    var a = Math.abs(x)
    if (a >= 1e-3 && a < 1e3) return sig(x, 3)
    var e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e)
    if (Math.abs(m) >= 9.995) { m /= 10; e += 1 }
    return minus(m.toFixed(2)) + '×10' + sup(e)
  }
  function pow10(y) { var e = Math.round(Math.log10(y)); return e === 0 ? '1' : '10' + sup(e) }

  // ---------------------------------------------------------------- the two surfaces
  function surface() {
    if (S.surface === 'banana') {
      return {
        loss: function (x, y) { var a = 1 - x, b = y - x * x; return a * a + 10 * b * b },
        grad: function (x, y, g) { var b = y - x * x; g[0] = -2 * (1 - x) - 40 * x * b; g[1] = 20 * b },
        start: function () { return S.start.banana.slice() },
        min: [1, 1]
      }
    }
    var a = S.alpha * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), k = S.kappa
    // ∇𝓛 = Rᵀ diag(1, κ) R θ with R = [[c, s], [−s, c]]
    var A11 = c * c + k * s * s, A12 = (1 - k) * c * s, A22 = s * s + k * c * c
    return {
      loss: function (x, y) { var u = c * x + s * y, v = -s * x + c * y; return 0.5 * (u * u + k * v * v) },
      grad: function (x, y, g) { g[0] = A11 * x + A12 * y; g[1] = A12 * x + A22 * y },
      start: function () { var u = S.start.ravine[0], v = S.start.ravine[1]; return [c * u - s * v, s * u + c * v] },
      toUV: function (x, y) { return [c * x + s * y, -s * x + c * y] },
      min: [0, 0]
    }
  }
  function bananaLamMax(x, y) {           // largest Hessian eigenvalue of the banana at (x, y)
    var a = 2 - 40 * (y - x * x) + 80 * x * x, b = -40 * x, d = 20
    return (a + d) / 2 + Math.sqrt((a - d) * (a - d) / 4 + b * b)
  }

  // ---------------------------------------------------------------- the run
  function simulate() {
    var f = surface(), T = STEPS[S.surface], th0 = f.start()
    var L0 = f.loss(th0[0], th0[1]), thr = 1e-6 * L0, g = [0, 0], res = {}
    METHODS.forEach(function (m) {
      var xs = new Float64Array(T + 1), ys = new Float64Array(T + 1), Ls = new Float64Array(T + 1)
      var x = th0[0], y = th0[1], v0 = 0, v1 = 0, s0 = 0, s1 = 0, m0 = 0, m1 = 0, q0 = 0, q1 = 0
      var n = T, reached = 0, diverged = 0
      xs[0] = x; ys[0] = y; Ls[0] = L0
      for (var k = 1; k <= T; k++) {
        var fac = S.schedule === 'cosine' ? 0.5 * (1 + Math.cos(Math.PI * (k - 1) / T)) : 1
        var e = S.eta * fac, ea = S.etaA * fac
        if (m.id === 'nag') f.grad(x - e * S.mu * v0, y - e * S.mu * v1, g)   // look-ahead point
        else f.grad(x, y, g)
        var g0 = g[0] + S.sigma * XI[2 * k - 2], g1 = g[1] + S.sigma * XI[2 * k - 1]
        if (m.id === 'gd') { x -= e * g0; y -= e * g1 }
        else if (m.id === 'hb' || m.id === 'nag') {
          v0 = S.mu * v0 + g0; v1 = S.mu * v1 + g1
          x -= e * v0; y -= e * v1
        } else if (m.id === 'rms') {
          s0 = 0.9 * s0 + 0.1 * g0 * g0; s1 = 0.9 * s1 + 0.1 * g1 * g1
          x -= ea * g0 / (Math.sqrt(s0) + 1e-8); y -= ea * g1 / (Math.sqrt(s1) + 1e-8)
        } else {
          m0 = 0.9 * m0 + 0.1 * g0; m1 = 0.9 * m1 + 0.1 * g1
          q0 = 0.999 * q0 + 0.001 * g0 * g0; q1 = 0.999 * q1 + 0.001 * g1 * g1
          var b1 = 1 - Math.pow(0.9, k), b2 = 1 - Math.pow(0.999, k)
          x -= ea * (m0 / b1) / (Math.sqrt(q0 / b2) + 1e-8)
          y -= ea * (m1 / b1) / (Math.sqrt(q1 / b2) + 1e-8)
        }
        var L = f.loss(x, y)
        xs[k] = x; ys[k] = y; Ls[k] = L
        if (!isFinite(L) || L > LDIV) { diverged = k; n = k; break }
        if (!reached && L < thr) reached = k
      }
      res[m.id] = { xs: xs, ys: ys, Ls: Ls, n: n, reached: reached, diverged: diverged }
    })
    return { T: T, L0: L0, thr: thr, th0: th0, res: res, f: f }
  }
  var run = simulate()

  // ---------------------------------------------------------------- controls
  function slider(o) { var s = AIW.slider(o); s.style.flex = '1 1 160px'; return s }
  var selSurface = AIW.select({
    label: t('surface', '曲面'),
    options: [['ravine', t('ravine (quadratic)', '峡谷（二次函数）')], ['banana', t('banana', '香蕉函数')]],
    value: 'ravine',
    onChange: function (v) {
      var atEnd = S.shown >= STEPS[S.surface]
      S.surface = v
      S.start[v] = START[v].slice()
      S.eta = ETA0[v]; slEta.set(S.eta)
      S.shown = atEnd ? STEPS[v] : Math.min(S.shown, STEPS[v])
      setRavineControls()
      recompute()
    }
  })
  selSurface.style.flex = '1 1 160px'
  var slKappa = slider({ label: t('condition number κ', '条件数 κ'), min: 1, max: 100, value: 50, log: true,
    fmt: function (v) { return String(snap2(v)) }, onInput: function (v) { S.kappa = snap2(v); recompute() } })
  var slAlpha = slider({ label: t('rotation α', '旋转角 α'), min: 0, max: 90, step: 1, value: 0,
    fmt: function (v) { return Math.round(v) + '°' }, onInput: function (v) { S.alpha = Math.round(v); recompute() } })
  var slEta = slider({ label: t('η: GD, heavy ball, Nesterov', '学习率 η：梯度下降、重球、Nesterov'), min: 0.001, max: 0.2, value: S.eta, log: true,
    fmt: function (v) { return String(snap2(v)) }, onInput: function (v) { S.eta = snap2(v); recompute() } })
  var slMu = slider({ label: t('momentum μ', '动量系数 μ'), min: 0, max: 0.99, step: 0.01, value: 0.9,
    fmt: function (v) { return v.toFixed(2) }, onInput: function (v) { S.mu = Math.round(v * 100) / 100; recompute() } })
  var slEtaA = slider({ label: t('η: RMSProp, Adam', '学习率 η：RMSProp、Adam'), min: 0.001, max: 0.5, value: 0.05, log: true,
    fmt: function (v) { return String(snap2(v)) }, onInput: function (v) { S.etaA = snap2(v); recompute() } })
  var slSigma = slider({ label: t('gradient noise σ', '梯度噪声 σ'), min: 0, max: 1, step: 0.01, value: 0,
    fmt: function (v) { return v.toFixed(2) }, onInput: function (v) { S.sigma = Math.round(v * 100) / 100; recompute() } })
  var selSched = AIW.select({
    label: t('schedule', '学习率调度'),
    options: [['constant', t('constant', '恒定')], ['cosine', t('cosine to 0 over the run', '余弦退火，全程降到 0')]],
    value: 'constant',
    onChange: function (v) { S.schedule = v; recompute() }
  })
  selSched.style.flex = '1 1 160px'
  function setRavineControls() {
    var off = S.surface !== 'ravine'
    ;[slKappa, slAlpha].forEach(function (w) { w.querySelector('input').disabled = off; w.style.opacity = off ? '0.45' : '' })
  }
  var controls = h('div', { class: 'w-controls' }, selSurface, slKappa, slAlpha, slEta, slMu, slEtaA, slSigma, selSched)

  var methodRow = h('div', { class: 'w-legend', style: { alignItems: 'center', gap: '.3rem 1.1rem', margin: '0 0 .7rem' } },
    h('span', { style: { fontWeight: '600', color: 'var(--navy)', fontSize: '.78rem' } }, t('show:', '显示：')))
  METHODS.forEach(function (m) {
    var box = AIW.checkbox(m.name, m.on, function (v) { m.on = v; render() })
    box.style.minWidth = '0'
    box.insertBefore(h('i', { style: { background: m.color, width: '16px', height: '4px', marginRight: '0' } }), box.lastChild)
    methodRow.appendChild(box)
  })

  var btnPlay = AIW.button(t('Play', '播放'), play)
  var btnStep = AIW.button(t('Step', '单步'), stepOnce, true)
  var btnReset = AIW.button(t('Reset', '重置'), reset, true)
  var stepLbl = h('span', { class: 'w-val', style: { marginLeft: '.4rem' } })
  var btnRow = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center', margin: '0 0 .8rem' } },
    btnPlay, btnStep, btnReset, stepLbl)

  el.appendChild(controls)
  el.appendChild(methodRow)
  el.appendChild(btnRow)

  // ---------------------------------------------------------------- plots
  var plotRow = h('div', { class: 'w-row' })
  var colPath = h('div', { class: 'w-col' }), colLoss = h('div', { class: 'w-col' })
  plotRow.appendChild(colPath); plotRow.appendChild(colLoss)
  el.appendChild(plotRow)

  function square(w, hh) {               // a square plot area, so both axes share one scale
    var l0 = 44, r0 = 10, t0 = 10, b0 = 38
    var side = Math.max(60, Math.min(w - l0 - r0, hh - t0 - b0))
    var ex = (w - l0 - r0 - side) / 2, ey = (hh - t0 - b0 - side) / 2
    return { l: l0 + ex, r: r0 + ex, t: t0 + ey, b: b0 + ey, side: side }
  }
  var view = null                        // last mapping of the contour plot, for clicks

  // background (heat map, grid, contours) is cached; it changes only with the surface, κ, α or size
  var bg = { key: '', cv: document.createElement('canvas') }
  function background(w, hh) {
    var dpr = window.devicePixelRatio || 1
    var key = [S.surface, S.kappa, S.alpha, w, hh, dpr].join('|')
    if (bg.key === key) return
    bg.key = key
    bg.cv.width = Math.round(w * dpr); bg.cv.height = Math.round(hh * dpr)
    var c = bg.cv.getContext('2d')
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, w, hh)
    var f = surface(), d = DOMAIN[S.surface], p = square(w, hh)
    // heat map of log10 𝓛 at half resolution, smoothed up
    var n = Math.max(48, Math.round(p.side / 2)), img = new ImageData(n, n)
    var zlo = -3, zhi = 2.6
    for (var j = 0; j < n; j++) {
      for (var i = 0; i < n; i++) {
        var x = d.x0 + (i + 0.5) / n * (d.x1 - d.x0), y = d.y1 - (j + 0.5) / n * (d.y1 - d.y0)
        var z = (Math.log10(f.loss(x, y) + 1e-12) - zlo) / (zhi - zlo)
        z = Math.max(0, Math.min(1, z))
        var o = 4 * (j * n + i)
        img.data[o] = Math.round(255 - 52 * z); img.data[o + 1] = Math.round(255 - 40 * z); img.data[o + 2] = Math.round(255 - 22 * z); img.data[o + 3] = 255
      }
    }
    var tmp = document.createElement('canvas'); tmp.width = n; tmp.height = n
    tmp.getContext('2d').putImageData(img, 0, 0)
    c.imageSmoothingEnabled = true
    c.drawImage(tmp, p.l, p.t, p.side, p.side)
    var lab = S.surface === 'ravine' ? ['θ₁', 'θ₂'] : ['x', 'y']
    var ax = AIW.axes(c, { w: w, h: hh, x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1, pad: { l: p.l, r: p.r, t: p.t, b: p.b },
      xticks: 4, yticks: 4, xfmt: function (v) { return minus(String(Math.round(v))) }, yfmt: function (v) { return minus(String(Math.round(v))) },
      xlabel: lab[0], ylabel: lab[1] })
    // contour lines at log-spaced levels 10^(k/2)
    c.save()
    c.beginPath(); c.rect(p.l, p.t, p.side, p.side); c.clip()
    c.strokeStyle = 'rgba(71,85,105,0.38)'; c.lineWidth = 0.9
    var levels = []
    for (var k = -6; k <= 5; k++) levels.push(Math.pow(10, k / 2))
    if (S.surface === 'ravine') {
      var px = p.side / (d.x1 - d.x0), a = S.alpha * Math.PI / 180
      levels.forEach(function (lv) {
        c.beginPath()
        c.ellipse(ax.X(0), ax.Y(0), Math.sqrt(2 * lv) * px, Math.sqrt(2 * lv / S.kappa) * px, -a, 0, 2 * Math.PI)
        c.stroke()
      })
    } else {
      contours(c, f, d, ax, levels.map(function (lv) { return Math.log10(lv) }), 160)
    }
    c.restore()
  }
  // marching squares on log10 𝓛
  function contours(c, f, d, ax, levels, N) {
    var W = N + 1, val = new Float64Array(W * W)
    for (var j = 0; j <= N; j++) for (var i = 0; i <= N; i++) {
      val[j * W + i] = Math.log10(f.loss(d.x0 + (d.x1 - d.x0) * i / N, d.y0 + (d.y1 - d.y0) * j / N) + 1e-12)
    }
    var P = function (i, j) { return [ax.X(d.x0 + (d.x1 - d.x0) * i / N), ax.Y(d.y0 + (d.y1 - d.y0) * j / N)] }
    var seg = function (A, B) { var a = P(A[0], A[1]), b = P(B[0], B[1]); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]) }
    levels.forEach(function (lv) {
      c.beginPath()
      for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
        var a = val[j * W + i], b = val[j * W + i + 1], e = val[(j + 1) * W + i + 1], q = val[(j + 1) * W + i]
        var A = a > lv, B = b > lv, E = e > lv, Q = q > lv
        if (A === B && B === E && E === Q) continue
        var bot = A !== B ? [i + (lv - a) / (b - a), j] : null
        var rgt = B !== E ? [i + 1, j + (lv - b) / (e - b)] : null
        var top = Q !== E ? [i + (lv - q) / (e - q), j + 1] : null
        var lft = A !== Q ? [i, j + (lv - a) / (q - a)] : null
        var pts = [bot, rgt, top, lft].filter(Boolean)
        if (pts.length === 2) seg(pts[0], pts[1])
        else if (pts.length === 4) {
          if (((a + b + e + q) / 4 > lv) === A) { seg(bot, rgt); seg(top, lft) } else { seg(bot, lft); seg(rgt, top) }
        }
      }
      c.stroke()
    })
  }

  function clampPx(v) { return v > 1e4 ? 1e4 : (v < -1e4 ? -1e4 : v) }
  function drawPaths(ctx, w, hh) {
    background(w, hh)
    ctx.drawImage(bg.cv, 0, 0, w, hh)
    var d = DOMAIN[S.surface], p = square(w, hh)
    var X = function (x) { return clampPx(p.l + (x - d.x0) / (d.x1 - d.x0) * p.side) }
    var Y = function (y) { return clampPx(p.t + p.side - (y - d.y0) / (d.y1 - d.y0) * p.side) }
    view = { p: p, d: d }
    ctx.save()
    ctx.beginPath(); ctx.rect(p.l, p.t, p.side, p.side); ctx.clip()
    // minimum
    var mx = X(run.f.min[0]), my = Y(run.f.min[1])
    ctx.strokeStyle = C.navy; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(mx - 6, my - 6); ctx.lineTo(mx + 6, my + 6); ctx.moveTo(mx + 6, my - 6); ctx.lineTo(mx - 6, my + 6); ctx.stroke()
    // start point
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(X(run.th0[0]), Y(run.th0[1]), 6, 0, 2 * Math.PI); ctx.stroke()
    METHODS.forEach(function (m) {
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(S.shown, r.n)
      ctx.strokeStyle = m.color; ctx.fillStyle = m.color; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'
      ctx.beginPath()
      for (var k = 0; k <= last; k++) {
        if (!isFinite(r.xs[k]) || !isFinite(r.ys[k])) break
        if (k === 0) ctx.moveTo(X(r.xs[k]), Y(r.ys[k])); else ctx.lineTo(X(r.xs[k]), Y(r.ys[k]))
      }
      ctx.stroke()
      for (var j = 1; j <= last; j++) {
        if (!isFinite(r.xs[j]) || !isFinite(r.ys[j])) break
        ctx.beginPath(); ctx.arc(X(r.xs[j]), Y(r.ys[j]), 1.7, 0, 2 * Math.PI); ctx.fill()
      }
    })
    METHODS.forEach(function (m) {          // current points on top
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(S.shown, r.n)
      if (!isFinite(r.xs[last]) || !isFinite(r.ys[last])) return
      ctx.beginPath(); ctx.arc(X(r.xs[last]), Y(r.ys[last]), 5, 0, 2 * Math.PI)
      ctx.fillStyle = m.color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
    })
    ctx.restore()
  }

  function drawLoss(ctx, w, hh) {
    var T = run.T
    var ax = AIW.axes(ctx, { w: w, h: hh, x0: 0, x1: T, y0: YLO, y1: YHI, logY: true, yticks: 5, xticks: T === 300 ? 6 : 5,
      pad: { l: 50, r: 12, t: 10, b: 38 },
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: pow10,
      xlabel: t('step t', '步数 t'), ylabel: t('loss 𝓛 (log scale)', '损失 𝓛（对数坐标）') })
    var pl = 50, pr = w - 12, pt = 10, pb = hh - 38
    ctx.save()
    ctx.beginPath(); ctx.rect(pl, pt, pr - pl, pb - pt); ctx.clip()
    // threshold 10⁻⁶ L₀
    var ty = ax.Y(run.thr)
    ctx.strokeStyle = C.slate; ctx.lineWidth = 1; ctx.setLineDash([5, 4])
    ctx.beginPath(); ctx.moveTo(pl, ty); ctx.lineTo(pr, ty); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = C.slate; ctx.font = '11px "DM Mono", Consolas, monospace'; ctx.textAlign = 'right'
    ctx.fillText('10⁻⁶·L₀', pr - 4, ty - 4)
    // current step
    if (S.shown < T) {
      ctx.strokeStyle = C.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(ax.X(S.shown), pt); ctx.lineTo(ax.X(S.shown), pb); ctx.stroke()
    }
    var Yc = function (L) { return ax.Y(Math.min(Math.max(L, 1e-30), 1e30)) }
    METHODS.forEach(function (m) {
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(S.shown, r.n)
      ctx.strokeStyle = m.color; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'
      ctx.beginPath()
      for (var k = 0; k <= last; k++) {
        var L = isFinite(r.Ls[k]) ? r.Ls[k] : 1e30
        if (k === 0) ctx.moveTo(ax.X(k), Yc(L)); else ctx.lineTo(ax.X(k), Yc(L))
      }
      ctx.stroke()
      if (r.reached && r.reached <= last) {
        ctx.fillStyle = m.color
        ctx.beginPath(); ctx.arc(ax.X(r.reached), ty, 4, 0, 2 * Math.PI); ctx.fill()
      }
    })
    ctx.restore()
  }

  var cvPath = AIW.canvas(colPath, { aspect: 1, maxHeight: 440 }, drawPaths)
  var cvLoss = AIW.canvas(colLoss, { aspect: 1, maxHeight: 440 }, drawLoss)
  cvPath.cv.style.cursor = 'crosshair'
  cvPath.cv.setAttribute('role', 'img')
  cvPath.cv.setAttribute('aria-label', t('Contour plot of the loss with the path of each optimiser', '损失等高线图及各优化器的路径'))
  cvLoss.cv.setAttribute('role', 'img')
  cvLoss.cv.setAttribute('aria-label', t('Loss against step on a log scale', '损失随步数变化（对数坐标）'))
  cvPath.cv.addEventListener('click', function (ev) {
    if (!view) return
    var rect = cvPath.cv.getBoundingClientRect(), p = view.p, d = view.d
    var px = ev.clientX - rect.left, py = ev.clientY - rect.top
    if (px < p.l || px > p.l + p.side || py < p.t || py > p.t + p.side) return
    var x = Math.round((d.x0 + (px - p.l) / p.side * (d.x1 - d.x0)) * 100) / 100
    var y = Math.round((d.y0 + (p.t + p.side - py) / p.side * (d.y1 - d.y0)) * 100) / 100
    if (S.surface === 'ravine') S.start.ravine = surface().toUV(x, y)
    else S.start.banana = [x, y]
    recompute()
  })

  // ---------------------------------------------------------------- readouts
  var readRow = h('div', { class: 'w-row', style: { marginTop: '.8rem' } })
  var colTab = h('div', { class: 'w-col' }), colStab = h('div', { class: 'w-col' })
  readRow.appendChild(colTab); readRow.appendChild(colStab)
  el.appendChild(readRow)

  var info = h('div', { style: { marginBottom: '.35rem' } })
  var thMean = h('th', { text: t('mean, last 100 steps', '最近 100 步平均') })
  var table = h('table', { class: 'w-table', style: { width: '100%' } },
    h('thead', null, h('tr', null,
      h('th', { style: { textAlign: 'left' } }, t('method', '方法')),
      h('th', null, t('loss now', '当前损失')),
      h('th', null, t('first below 10⁻⁶·L₀', '首次低于 10⁻⁶·L₀')),
      thMean)))
  var tbody = h('tbody')
  table.appendChild(tbody)
  METHODS.forEach(function (m) {
    m.cells = [h('td', { style: { textAlign: 'left', whiteSpace: 'nowrap' } },
      h('i', { style: { display: 'inline-block', width: '12px', height: '4px', borderRadius: '2px', background: m.color, marginRight: '.35rem', verticalAlign: 'middle' } }), m.name),
    h('td'), h('td'), h('td')]
    m.row = h('tr', null, m.cells[0], m.cells[1], m.cells[2], m.cells[3])
    tbody.appendChild(m.row)
  })
  colTab.appendChild(h('div', { class: 'w-readout' }, info, h('div', { style: { overflowX: 'auto' } }, table)))

  var stab = h('div', { class: 'w-readout' })
  colStab.appendChild(stab)
  el.appendChild(h('p', { class: 'w-note' }, t(
    'Click or tap the contour plot to move the start point (×: the minimum, ○: the start). Every change reruns all five methods from the start point; Play replays the run two steps per frame, and Reset returns to step 0 at the default start.',
    '点击或轻触等高线图可移动起点（×：极小点，○：起点）。任何改动都会让五种方法从起点重新运行；“播放”以每帧两步重放整个过程，“重置”回到第 0 步和默认起点。')))

  function rootsMax(b, c) {               // largest |r| with r² − b r + c = 0
    var disc = b * b - 4 * c
    if (disc < 0) return Math.sqrt(c)
    var q = Math.sqrt(disc)
    return Math.max(Math.abs((b + q) / 2), Math.abs((b - q) / 2))
  }
  function rho(id, lam) {
    var e = S.eta, mu = S.mu
    if (id === 'gd') return Math.abs(1 - e * lam)
    if (id === 'hb') return rootsMax(1 + mu - e * lam, mu)
    var q = 1 - e * lam
    return rootsMax((1 + mu) * q, mu * q)
  }
  function stabLine(name, formula, limit, id) {
    var ok = S.eta < limit
    var r = Math.max(rho(id, 1), rho(id, S.kappa))
    return h('div', { style: { color: ok ? 'var(--green)' : 'var(--red)' } },
      (ok ? '✓ ' : '✗ ') + name + t(': η < ', '：η < ') + formula + ' = ' + sig(limit, 3) + '  ' +
      t('ρ = ', 'ρ = ') + fix(r, 3) + (ok ? '' : t(' (unstable)', '（不稳定）')))
  }
  function renderStability() {
    stab.textContent = ''
    if (S.surface === 'ravine') {
      var k = S.kappa, mu = S.mu
      stab.appendChild(h('div', { style: { fontWeight: '600' } },
        t('Stability on the ravine 𝓛 = ½(u² + κv²): λ_min = 1, λ_max = κ = ', '峡谷 𝓛 = ½(u² + κv²) 上的稳定性：λ_min = 1，λ_max = κ = ') + snap2(k) + t(', η = ', '，η = ') + snap2(S.eta)))
      stab.appendChild(stabLine(t('GD', '梯度下降'), '2/κ', 2 / k, 'gd'))
      stab.appendChild(stabLine(t('heavy ball', '重球动量'), '2(1 + μ)/κ', 2 * (1 + mu) / k, 'hb'))
      stab.appendChild(stabLine('Nesterov', '2(1 + μ)/((1 + 2μ)κ)', 2 * (1 + mu) / ((1 + 2 * mu) * k), 'nag'))
      stab.appendChild(h('div', { style: { marginTop: '.3rem', color: 'var(--slate)' } },
        t('ρ: contraction per step of the slowest mode. GD multiplies the steep coordinate v by 1 − ηκ = ',
          'ρ：最慢模式每步的收缩因子。梯度下降每步把陡峭坐标 v 乘以 1 − ηκ = ') + fix(1 - S.eta * k, 3) +
        t(' and the shallow coordinate u by 1 − η = ', '，把平缓坐标 u 乘以 1 − η = ') + fix(1 - S.eta, 3) + t('.', '。')))
    } else {
      var s0 = run.th0, l0 = bananaLamMax(s0[0], s0[1]), l1 = bananaLamMax(1, 1)
      stab.appendChild(h('div', { style: { fontWeight: '600' } }, t('Stability on the banana 𝓛 = (1 − x)² + 10(y − x²)²', '香蕉函数 𝓛 = (1 − x)² + 10(y − x²)² 上的稳定性')))
      stab.appendChild(h('div', { style: { color: 'var(--slate)' } }, t(
        'Not a quadratic, so no single limit: the largest Hessian eigenvalue is ' + l0.toFixed(1) + ' at the start and ' + l1.toFixed(1) +
        ' at the minimum (1, 1). The ravine’s limits hold only locally: GD needs η < ' + sig(2 / l0, 3) + ' at the start and η < ' + sig(2 / l1, 3) + ' near the minimum.',
        '它不是二次函数，没有统一的界限：Hessian 矩阵的最大特征值在起点为 ' + l0.toFixed(1) + '，在极小点 (1, 1) 为 ' + l1.toFixed(1) +
        '。峡谷的稳定界限只在局部成立：梯度下降在起点需要 η < ' + sig(2 / l0, 3) + '，在极小点附近需要 η < ' + sig(2 / l1, 3) + '。')))
    }
  }

  function renderReadouts() {
    var T = run.T, step = Math.min(S.shown, T)
    stepLbl.textContent = t('step ' + step + ' / ' + T, '第 ' + step + ' / ' + T + ' 步')
    var th = run.th0
    var parts = [t('start (', '起点 (') + fix(th[0], 2) + ', ' + fix(th[1], 2) + t('), L₀ = ', ')，L₀ = ') + fmtL(run.L0) +
      t(', 10⁻⁶·L₀ = ', '，10⁻⁶·L₀ = ') + fmtL(run.thr)]
    if (S.schedule === 'cosine') {
      parts.push(t('learning-rate factor for the next step: ', '下一步的学习率系数：') + fix(0.5 * (1 + Math.cos(Math.PI * Math.min(step, T) / T)), 3))
    }
    info.textContent = parts.join('\n')
    var noisy = S.sigma > 0
    thMean.style.display = noisy ? '' : 'none'
    METHODS.forEach(function (m) {
      m.row.style.display = m.on ? '' : 'none'
      if (!m.on) return
      var r = run.res[m.id], last = Math.min(step, r.n)
      var div = r.diverged && r.diverged <= step
      m.cells[1].textContent = div ? '> 10⁶' : fmtL(r.Ls[last])
      m.cells[2].textContent = div ? t('diverged at step ' + r.diverged, '第 ' + r.diverged + ' 步发散')
        : (r.reached && r.reached <= step ? t('step ' + r.reached, '第 ' + r.reached + ' 步') : '—')
      m.cells[2].style.color = div ? 'var(--red)' : ''
      m.cells[3].style.display = noisy ? '' : 'none'
      if (noisy) {
        var lo = Math.max(1, last - MEANW + 1), sum = 0
        for (var k = lo; k <= last; k++) sum += r.Ls[k]
        m.cells[3].textContent = div || last < 1 ? '—' : fmtL(sum / (last - lo + 1))
      }
    })
    btnPlay.textContent = S.playing ? t('Pause', '暂停') : t('Play', '播放')
    btnStep.disabled = step >= T
  }

  function render() {
    renderReadouts()
    cvPath.redraw()
    cvLoss.redraw()
  }
  function recompute() {
    run = simulate()
    if (S.shown > run.T) S.shown = run.T
    renderStability()
    render()
  }

  // ---------------------------------------------------------------- animation
  var raf = 0
  function frame() {
    raf = 0
    if (!S.playing) return
    S.shown = Math.min(run.T, S.shown + 2)
    if (S.shown >= run.T) S.playing = false
    render()
    if (S.playing) raf = requestAnimationFrame(frame)
  }
  function stop() { S.playing = false; if (raf) cancelAnimationFrame(raf); raf = 0 }
  function play() {
    if (S.playing) { stop(); render(); return }
    if (S.shown >= run.T) S.shown = 0
    S.playing = true
    render()
    raf = requestAnimationFrame(frame)
  }
  function stepOnce() {
    stop()
    if (S.shown < run.T) S.shown += 1
    render()
  }
  function reset() {
    stop()
    S.start[S.surface] = START[S.surface].slice()
    S.shown = 0
    recompute()
  }

  renderStability()
  renderReadouts()
})

;
/* ---- polynomial-capacity.js ---- */
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

;
/* ---- receptive-field-builder.js ---- */
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

;
/* ---- rope-explorer.js ---- */
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

;
/* ---- sampling-explorer.js ---- */
/* Module 07: temperature and sequential support filters over twelve saved logits. */
AIW.register('sampling-explorer', function (el) {
  'use strict'
  var h = AIW.h, tr = AIW.t, C = AIW.C
  var presets = [
    { context: 'After the test, the engineer reported that the valve was',
      tokens: ['not', 'leaking', 'working', 'in', 'operating', 'still',
        'failing', '"', 'functioning', 'defective', 'too', 'open'],
      logits: [25.702, 25.316, 25.124, 24.617, 24.426, 24.379,
        24.278, 24.235, 24.152, 24.045, 23.971, 23.905] },
    { context: 'The safety case argues that the system is acceptably',
      tokens: ['safe', 'secure', 'robust', 'reliable', 'good', 'stable',
        'well', 'effective', 'clean', 'designed', 'simple', 'low'],
      logits: [27.664, 24.510, 24.286, 24.007, 23.536, 23.348,
        22.975, 22.792, 22.789, 22.778, 22.728, 22.695] }
  ]
  var st = { preset: 0, tau: 1, greedy: false, k: 0, p: 1, minp: 0, seed: 1 }
  var random, samples = [], current, chart, curve
  function reseed() {
    var a = st.seed >>> 0
    random = function () {
      a = (a + 0x6D2B79F5) | 0
      var x = Math.imul(a ^ a >>> 15, a | 1)
      x ^= x + Math.imul(x ^ x >>> 7, x | 61)
      return ((x ^ x >>> 14) >>> 0) / 4294967296
    }
  }
  function entropy(p) {
    return -p.reduce(function (sum, x) { return sum + (x ? x * Math.log2(x) : 0) }, 0)
  }
  function probabilities(tau) {
    return AIW.softmax(presets[st.preset].logits.map(function (z) { return z / tau }))
  }
  function distribution() {
    var q = probabilities(st.tau), kept = q.map(function () { return true })
    var removed = q.map(function () { return '' })
    if (st.greedy) q = q.map(function (_, i) { return i === 0 ? 1 : 0 })
    function drop(i, cause) { kept[i] = false; removed[i] = cause }
    function renormalise() {
      var mass = q.reduce(function (sum, x, i) { return sum + (kept[i] ? x : 0) }, 0)
      return q.map(function (x, i) { return kept[i] ? x / mass : 0 })
    }
    if (st.greedy) {
      for (var i = 1; i < q.length; i++) drop(i, tr('greedy', '贪心'))
    }
    if (st.k > 0) {
      var boundary = q.slice().sort(function (a, b) { return b - a })[st.k - 1]
      q.forEach(function (x, i) {
        if (kept[i] && x < boundary) drop(i, 'top-k')
      })
    }
    if (st.p < 1) {
      var r = renormalise(), total = 0
      var order = r.map(function (_, i) { return i }).filter(function (i) {
        return kept[i]
      }).sort(function (a, b) { return r[b] - r[a] || a - b })
      order.forEach(function (i, j) {
        if (j > 0 && total >= st.p) drop(i, 'top-p')
        total += r[i]
      })
    }
    if (st.minp > 0) {
      var filtered = renormalise(), limit = st.minp * Math.max.apply(null, filtered)
      filtered.forEach(function (x, i) {
        if (kept[i] && x < limit) drop(i, 'min-p')
      })
    }
    if (!kept.some(Boolean)) kept[0] = true
    return { q: q, final: renormalise(), removed: removed,
      count: kept.filter(Boolean).length,
      mass: q.reduce(function (sum, x, i) { return sum + (kept[i] ? x : 0) }, 0) }
  }
  var controls = h('div', { class: 'w-controls' })
  function change(key, value) { st[key] = value; samples = []; update() }
  var preset = AIW.select({ label: tr('Saved distribution', '保存的分布'),
    options: [['0', tr('A: broad', 'A：较平坦')], ['1', tr('B: peaked', 'B：较集中')]],
    value: 0, onChange: function (v) { change('preset', Number(v)) } })
  var tau = AIW.slider({ label: tr('Temperature τ', '温度 τ'), min: 0.05, max: 5,
    log: true, value: 1, fmt: function (v) { return v.toFixed(2) },
    onInput: function (v) { change('tau', v) } })
  var greedy = AIW.checkbox(tr('Greedy (τ → 0)', '贪心（τ → 0）'), false,
    function (v) { change('greedy', v) })
  var k = AIW.slider({ label: tr('Top-k (0 = off)', 'Top-k（0 = 关闭）'),
    min: 0, max: 12, step: 1, value: 0, fmt: String,
    onInput: function (v) { change('k', v) } })
  var p = AIW.slider({ label: tr('Top-p (1 = off)', 'Top-p（1 = 关闭）'),
    min: 0.05, max: 1, step: 0.01, value: 1,
    onInput: function (v) { change('p', v) } })
  var minp = AIW.slider({ label: tr('Min-p (0 = off)', 'Min-p（0 = 关闭）'),
    min: 0, max: 0.5, step: 0.01, value: 0,
    onInput: function (v) { change('minp', v) } })
  var seed = h('input', { type: 'number', value: 1, step: 1,
    oninput: function () {
      st.seed = Math.trunc(Number(seed.value) || 0); reseed(); samples = []; update()
    } })
  var sample = AIW.button(tr('Sample 20', '采样 20 次'), function () {
    samples = []
    for (var i = 0; i < 20; i++) {
      var u = random(), sum = 0, index = current.final.length - 1
      for (var j = 0; j < current.final.length; j++) {
        sum += current.final[j]
        if (u < sum) { index = j; break }
      }
      samples.push(index)
    }
    update()
  })
  var reset = AIW.button(tr('Reset', '重置'), function () {
    st = { preset: 0, tau: 1, greedy: false, k: 0, p: 1, minp: 0, seed: 1 }
    preset.querySelector('select').value = '0'
    tau.set(1); k.set(0); p.set(1); minp.set(0)
    greedy.querySelector('input').checked = false
    seed.value = 1; samples = []; reseed(); update()
  }, true)
  ;[preset, tau, greedy, k, p, minp,
    h('label', { class: 'w-ctl' }, tr('Seed', '随机种子'), seed), sample, reset]
    .forEach(function (control) { controls.appendChild(control) })
  var context = h('p', { class: 'w-note' })
  var readout = h('div', { class: 'w-readout', 'aria-live': 'polite' })
  var chartWrap = h('div'), curveWrap = h('div')
  var table = h('table', { class: 'w-table', style: { width: '100%' } })
  var sampleList = h('ol', { style: { overflowWrap: 'anywhere' } })
  el.appendChild(controls); el.appendChild(context); el.appendChild(readout)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'SmolLM2-135M saved logits; probabilities are renormalised over these twelve candidates. '
      + 'Pale = temperature only; blue = final; hatched = removed. Token order is fixed.',
    '使用 SmolLM2-135M 保存的 logits；概率仅在这十二个候选词之间重新归一化。'
      + '浅色表示仅调温度，蓝色表示最终分布，斜线表示被移除。词的顺序固定。')))
  el.appendChild(chartWrap); el.appendChild(curveWrap); el.appendChild(table)
  el.appendChild(h('p', { class: 'w-note' }, tr(
    'Try top-k = 3, then compare presets with top-p = 0.9 or min-p = 0.1. '
      + 'Each sample click continues the seeded random stream; a setting change clears the sample.',
    '先尝试 top-k = 3，再用 top-p = 0.9 或 min-p = 0.1 比较两个预设。'
      + '每次点击采样都延续随机数流；改变设置会清空样本。')))
  el.appendChild(sampleList)
  function hatch(ctx, x, y, w, height) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, height); ctx.clip()
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1
    for (var a = -height; a < w; a += 7) {
      ctx.beginPath(); ctx.moveTo(x + a, y + height)
      ctx.lineTo(x + a + height, y); ctx.stroke()
    }
    ctx.restore()
  }
  chart = AIW.canvas(chartWrap, { aspect: 1.8, maxHeight: 450 }, function (ctx, w) {
    if (!current) return
    var left = 86, right = 8, scale = (w - left - right) / 1
    ctx.font = '12px system-ui'; ctx.textBaseline = 'middle'
    for (var i = 0; i < 12; i++) {
      var y = 17 + i * 34
      ctx.fillStyle = C.navy; ctx.textAlign = 'right'
      ctx.fillText(presets[st.preset].tokens[i], left - 8, y + 8)
      ctx.fillStyle = C.skyLight
      ctx.fillRect(left, y, scale * current.q[i], 18)
      ctx.fillStyle = C.blue
      ctx.fillRect(left, y + 5, scale * current.final[i], 8)
      if (current.removed[i]) hatch(ctx, left, y, scale * current.q[i], 18)
    }
    ctx.fillStyle = C.slate; ctx.textAlign = 'left'
    ctx.fillText(tr('Probability: 0 → 1', '概率：0 → 1'), left, 436)
  })
  curve = AIW.canvas(curveWrap, { aspect: 0.62, maxHeight: 220 }, function (ctx, w, height) {
    var axes = AIW.axes(ctx, { w: w, h: height, x0: Math.log10(0.05),
      x1: Math.log10(5), y0: 0, y1: Math.log2(12),
      xlabel: tr('Temperature τ (log axis)', '温度 τ（对数轴）'),
      ylabel: tr('Unfiltered entropy (bits)', '未截断熵（比特）'),
      xfmt: function (x) { return Math.pow(10, x).toFixed(2) } })
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath()
    for (var i = 0; i <= 120; i++) {
      var x = Math.log10(0.05) + 2 * i / 120
      var y = entropy(probabilities(Math.pow(10, x)))
      if (i === 0) ctx.moveTo(axes.X(x), axes.Y(y))
      else ctx.lineTo(axes.X(x), axes.Y(y))
    }
    ctx.stroke(); ctx.fillStyle = C.orange; ctx.beginPath()
    ctx.arc(axes.X(Math.log10(st.tau)), axes.Y(entropy(probabilities(st.tau))),
      4, 0, Math.PI * 2); ctx.fill()
  })
  function update() {
    current = distribution()
    context.textContent = presets[st.preset].context + ' …'
    readout.textContent = tr('Entropy: final ', '熵：最终 ')
      + entropy(current.final).toFixed(3) + tr(' bits; temperature only ', ' 比特；仅温度 ')
      + entropy(current.q).toFixed(3) + tr(' bits; maximum 3.585 bits. Kept ',
        ' 比特；最大 3.585 比特。保留 ')
      + current.count + '/12' + tr('; retained mass ', '；保留概率质量 ')
      + current.mass.toFixed(3)
    table.textContent = ''
    table.appendChild(h('tr', null, h('th', null, tr('Token', '候选词')),
      h('th', null, tr('Before → final', '截断前 → 最终')),
      h('th', null, tr('Draws / expected', '次数 / 期望'))))
    var tally = current.final.map(function () { return 0 })
    samples.forEach(function (i) { tally[i]++ })
    current.final.forEach(function (p, i) {
      table.appendChild(h('tr', null, h('td', null, presets[st.preset].tokens[i]),
        h('td', null, current.q[i].toFixed(3) + ' → ' + p.toFixed(3)
          + (current.removed[i] ? ' (' + current.removed[i] + ')' : '')),
        h('td', null, (samples.length ? String(tally[i]) : '—')
          + ' / ' + (20 * p).toFixed(2))))
    })
    sampleList.textContent = ''
    samples.forEach(function (i) {
      sampleList.appendChild(h('li', null,
        presets[st.preset].context + ' ' + presets[st.preset].tokens[i]))
    })
    chart.redraw(); curve.redraw()
  }
  reseed(); update()
})

;
/* ---- ssm-kernel-explorer.js ---- */
/* ssm-kernel-explorer — Module 04, Section 13: a linear time-invariant recurrence and a convolution with
 * its impulse response are the same map; the eigenvalue's modulus sets the memory and its angle the
 * oscillation; an input-dependent step (Mamba-style selectivity) removes the fixed kernel.
 *
 * Discrete view: lambda = r e^{i theta}, bbar = 1, c = 1.
 * Continuous view: s = -alpha + i omega, lambda = e^{s Delta} (zero-order hold),
 *   bbar = (e^{s Delta} - 1)/s (complex division; Delta(1 + s Delta/2) when |s Delta| < 1e-6), c = 1.
 * Recurrence:  h_0 = 0; h = lambda h + bbar x_t; y_t = Re(h).
 * Convolution: K_k = Re(c lambda^k bbar) (lambda^k by repeated multiplication), y_t = sum_{k<=t} K_k x_{t-k}.
 * Selective:   real state, Delta_t = softplus(w x_t + c), a_t = exp(-alpha Delta_t), b_t = Delta_t,
 *   h_t = a_t h_{t-1} + b_t x_t. With w = 0 the step is constant, so a fixed kernel K_k = a^k b returns. */
AIW.register('ssm-kernel-explorer', function (el) {
  'use strict'
  var t = AIW.t, h = AIW.h, C = AIW.C
  var PI = Math.PI
  var NMAX = 400

  var S = {
    r: t('modulus |λ| = r', '模 |λ| = r'),
    th: t('angle θ', '角 θ'),
    sig: t('input signal', '输入信号'),
    T: t('sequence length T', '序列长度 T'),
    cont: t('continuous-time view (pole s, step Δ)', '连续时间视图（极点 s，步长 Δ）'),
    sel: t('selective step (Mamba-style)', '选择性步长（Mamba 式）'),
    alpha: t('pole decay α (s = −α + iω)', '极点衰减率 α（s = −α + iω）'),
    omega: t('pole frequency ω', '极点频率 ω'),
    delta: t('step Δ', '步长 Δ'),
    w: t('weight w (Δ_t = softplus(w·x_t + c))', '权重 w（Δ_t = softplus(w·x_t + c)）'),
    c: t('bias c', '偏置 c'),
    alphaS: t('decay rate α (a_t = exp(−α Δ_t))', '衰减率 α（a_t = exp(−α Δ_t)）'),
    thIgnored: t('θ is ignored in the selective view', '选择性视图中忽略 θ'),
    kernelTitle: t('Impulse response (kernel) K_k = Re(c λ^k b̄)', '脉冲响应（卷积核）K_k = Re(c λ^k b̄)'),
    signalTitle: t('Input and output', '输入与输出'),
    retTitle: t('Retention a_t = exp(−α Δ_t) (1 = keep the state, 0 = reset it)', '保留系数 a_t = exp(−α Δ_t)（1 = 保持状态，0 = 重置状态）'),
    noKernel: t('no fixed kernel: the step depends on the input', '没有固定的卷积核：步长取决于输入'),
    lagK: t('lag k (steps)', '滞后 k（步）'),
    timeT: t('t (steps)', 't（步）'),
    legX: t('input x_t', '输入 x_t'), legRec: t('output by recurrence', '递推输出'),
    legConv: t('output by convolution (dots)', '卷积输出（圆点）'), legEnv: t('envelope ±|c b̄| r^k', '包络 ±|c b̄| r^k'),
    legKer: t('kernel K_k', '卷积核 K_k'), legRet: t('retention a_t', '保留系数 a_t'),
    note: t('One complex mode with a real output is equivalent to a real two-state system: a damped oscillator. The recurrence is the way to run it; the kernel is the way to train it (as one parallel convolution).',
      '一个复模态加实数输出，等价于一个实二维状态系统：阻尼振荡器。递推是运行它的方式；卷积核是训练它的方式（一次并行卷积）。'),
    tip: t('One complex mode with a real output is equivalent to a real two-state system, a damped oscillator.',
      '一个复模态加实数输出，等价于一个实二维状态系统，即阻尼振荡器。'),
    noteSel: t('Selective mode: the state is real and the step Δ_t is a gate. A large Δ_t resets the state (a_t → 0) and writes the input (b_t = Δ_t); a small Δ_t keeps the state and ignores the input. Set w = 0 and the step is constant: the kernel and the dots return.',
      '选择性模式：状态为实数，步长 Δ_t 起门的作用。Δ_t 大时重置状态（a_t → 0）并写入输入（b_t = Δ_t）；Δ_t 小时保持状态、忽略输入。令 w = 0，步长恒定：卷积核和圆点重新出现。'),
    steps: t('steps', '步'), inf: '∞'
  }
  var SIGS = [
    ['impulse', t('unit impulse at t = 5', '在 t = 5 的单位脉冲')],
    ['step', t('step from t = 5', '从 t = 5 起的阶跃')],
    ['pulse', t('square pulse t = 5–24', '方波脉冲 t = 5–24')],
    ['sine', t('noisy sine (period 30)', '含噪正弦（周期 30）')],
    ['two', t('two impulses at t = 5 and t = 60', '在 t = 5 和 t = 60 的两个脉冲')]
  ]

  // ---------------- maths ----------------
  // position u in [0,1] -> r: first half linear 0.5..0.9, second half logarithmic in 1 - r from 0.1 to 0.001
  function rFromU(u) {
    if (u <= 0.5) return 0.5 + 0.4 * (u / 0.5)
    return 1 - 0.1 * Math.pow(0.01, (u - 0.5) / 0.5)
  }
  function uFromR(r) {
    if (r <= 0.9) return (r - 0.5) / 0.4 * 0.5
    return 0.5 + 0.5 * Math.log((1 - r) / 0.1) / Math.log(0.01)
  }
  function softplus(z) { return z > 30 ? z : Math.log1p(Math.exp(z)) }
  var noise = (function () { var g = AIW.rng(4), a = []; for (var i = 0; i < NMAX; i++) a.push(AIW.gauss(g)); return a })()
  function signal(kind, T) {
    var x = new Array(T), i
    for (i = 0; i < T; i++) {
      var v = 0
      if (kind === 'impulse') v = i === 5 ? 1 : 0
      else if (kind === 'step') v = i >= 5 ? 1 : 0
      else if (kind === 'pulse') v = (i >= 5 && i <= 24) ? 1 : 0
      else if (kind === 'sine') v = Math.sin(2 * PI * i / 30) + 0.3 * noise[i]
      else if (kind === 'two') v = (i === 5 || i === 60) ? 1 : 0
      x[i] = v
    }
    return x
  }
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]] }
  function cdiv(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d] }

  function compute(p) {
    var T = p.T, x = signal(p.sig, T), k, i, m = { x: x, T: T, mode: p.sel ? 'sel' : (p.cont ? 'cont' : 'disc') }
    var y = new Array(T), K = null, conv = null
    if (m.mode === 'sel') {
      var D = new Array(T), a = new Array(T), hh = 0
      for (i = 0; i < T; i++) {
        D[i] = softplus(p.w * x[i] + p.c); a[i] = Math.exp(-p.alphaS * D[i])
        hh = a[i] * hh + D[i] * x[i]; y[i] = hh
      }
      m.D = D; m.a = a
      m.const = p.w === 0
      if (m.const) {
        var a0 = Math.exp(-p.alphaS * D[0]), b0 = D[0], pw = 1
        K = new Array(T)
        for (k = 0; k < T; k++) { K[k] = pw * b0; pw *= a0 }
        m.lam = [a0, 0]; m.bb = [b0, 0]
      }
    } else {
      var lam, bb
      if (m.mode === 'disc') {
        lam = [p.r * Math.cos(p.theta), p.r * Math.sin(p.theta)]; bb = [1, 0]
      } else {
        var sD = [-p.alphaC * p.delta, p.omega * p.delta], e = Math.exp(sD[0])
        lam = [e * Math.cos(sD[1]), e * Math.sin(sD[1])]
        if (Math.hypot(sD[0], sD[1]) < 1e-6) bb = [p.delta * (1 + sD[0] / 2), p.delta * sD[1] / 2]
        else bb = cdiv([lam[0] - 1, lam[1]], [-p.alphaC, p.omega])
      }
      m.lam = lam; m.bb = bb
      var hr = 0, hi = 0
      for (i = 0; i < T; i++) {
        var nr = lam[0] * hr - lam[1] * hi + bb[0] * x[i], ni = lam[0] * hi + lam[1] * hr + bb[1] * x[i]
        hr = nr; hi = ni; y[i] = hr
      }
      K = new Array(T)
      var pk = [1, 0]
      for (k = 0; k < T; k++) { K[k] = cmul(pk, bb)[0]; pk = cmul(pk, lam) }
    }
    m.y = y; m.K = K
    if (K) {
      conv = new Array(T)
      var maxd = 0
      for (i = 0; i < T; i++) {
        var s = 0
        for (k = 0; k <= i; k++) s += K[k] * x[i - k]
        conv[i] = s
        var d = Math.abs(s - y[i]); if (d > maxd) maxd = d
      }
      m.conv = conv; m.maxd = maxd
    }
    return m
  }

  // ---------------- UI ----------------
  var P = { r: 0.95, theta: PI / 8, sig: 'impulse', T: 120, cont: false, sel: false,
    alphaC: 0.05, omega: PI / 8, delta: 1, w: 3, c: -3, alphaS: 1 }
  var model = null

  function piFmt(v) {
    var q = v / PI * 64, n = Math.round(q)
    if (Math.abs(q - n) < 1e-6) {
      if (n === 0) return '0'
      var g = function (a, b) { return b ? g(b, a % b) : a }, d = g(n, 64), nn = n / d, dd = 64 / d
      return (nn === 1 ? '' : nn) + 'π' + (dd === 1 ? '' : '/' + dd)
    }
    return AIW.fmt(v / PI, 3) + 'π'
  }
  function z(x) { return Math.abs(x) < 1e-12 ? 0 : x }
  var sR = AIW.slider({ label: S.r, min: 0, max: 1, value: uFromR(P.r), fmt: function (u) { return AIW.fmt(rFromU(u), 3) },
    onInput: function (u) { P.r = Math.min(0.999, rFromU(u)); update() } })
  var sTh = AIW.slider({ label: S.th, min: 0, max: 64, step: 1, value: 8, fmt: function (n) { return piFmt(Math.round(n) * PI / 64) },
    onInput: function (n) { P.theta = Math.round(n) * PI / 64; update() } })
  var ticks = h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.68rem', color: C.muted, fontFamily: 'var(--font-mono)' } },
    h('span', { text: '0' }), h('span', { text: 'π/4' }), h('span', { text: 'π/2' }), h('span', { text: '3π/4' }), h('span', { text: 'π' }))
  sTh.insertBefore(ticks, sTh.lastChild)
  var sSig = AIW.select({ label: S.sig, options: SIGS, value: P.sig, onChange: function (v) { P.sig = v; update() } })
  var sT = AIW.slider({ label: S.T, min: 50, max: 400, step: 10, value: P.T, fmt: function (v) { return String(Math.round(v)) },
    onInput: function (v) { P.T = Math.round(v); update() } })
  var cCont = AIW.checkbox(S.cont, false, function (v) { P.cont = v; update() })
  var cSel = AIW.checkbox(S.sel, false, function (v) { P.sel = v; update() })
  var sAC = AIW.slider({ label: S.alpha, min: 0.001, max: 1, log: true, value: P.alphaC, fmt: function (v) { return AIW.fmt(v, 3) },
    onInput: function (v) { P.alphaC = v; update() } })
  var sOm = AIW.slider({ label: S.omega, min: 0, max: 64, step: 1, value: 8, fmt: function (n) { return piFmt(Math.round(n) * PI / 64) },
    onInput: function (n) { P.omega = Math.round(n) * PI / 64; update() } })
  var sDe = AIW.slider({ label: S.delta, min: 0.01, max: 10, log: true, value: P.delta, fmt: function (v) { return AIW.fmt(v, 3) },
    onInput: function (v) { P.delta = v; update() } })
  var sW = AIW.slider({ label: S.w, min: -5, max: 5, step: 0.1, value: P.w, fmt: function (v) { return AIW.fmt(Math.round(v * 10) / 10, 1) },
    onInput: function (v) { P.w = Math.round(v * 10) / 10; update() } })
  var sC = AIW.slider({ label: S.c, min: -5, max: 2, step: 0.1, value: P.c, fmt: function (v) { return AIW.fmt(Math.round(v * 10) / 10, 1) },
    onInput: function (v) { P.c = Math.round(v * 10) / 10; update() } })
  var sAS = AIW.slider({ label: S.alphaS, min: 0.001, max: 1, log: true, value: P.alphaS, fmt: function (v) { return AIW.fmt(v, 3) },
    onInput: function (v) { P.alphaS = v; update() } })
  var thNote = h('span', { class: 'w-note', style: { margin: 0 }, text: S.thIgnored })
  sTh.appendChild(thNote)

  var controls = h('div', { class: 'w-controls' }, sR, sTh, sSig, sT, cCont, cSel, sAC, sOm, sDe, sW, sC, sAS)
  el.appendChild(controls)

  function legend(items) {
    var box = h('div', { class: 'w-legend' })
    items.forEach(function (it) {
      var chip = h('i', { style: { background: it[0] } })
      if (it[2]) { chip.style.height = '7px'; chip.style.width = '7px'; chip.style.borderRadius = '50%' }
      if (it[3]) { chip.style.background = 'transparent'; chip.style.borderTop = '2px dashed ' + it[0]; chip.style.height = '0' }
      box.appendChild(h('span', null, chip, it[1]))
    })
    return box
  }
  var legK = h('div'), legS = h('div')
  function setLegends() {
    legK.textContent = ''; legS.textContent = ''
    legK.appendChild(legend(model && model.mode === 'sel'
      ? [[C.blue, S.legKer]] : [[C.blue, S.legKer], [C.muted, S.legEnv, false, true]]))
    legS.appendChild(legend(model && !model.conv ? [[C.muted, S.legX], [C.blue, S.legRec]]
      : [[C.muted, S.legX], [C.blue, S.legRec], [C.orange, S.legConv, true]]))
  }
  var kTitle = h('div', { class: 'w-note', style: { marginTop: '.2rem', fontWeight: 600, color: C.navy }, text: S.kernelTitle })
  var sTitle = h('div', { class: 'w-note', style: { fontWeight: 600, color: C.navy }, text: S.signalTitle })
  var rTitle = h('div', { class: 'w-note', style: { fontWeight: 600, color: C.navy }, text: S.retTitle })
  var kWrap = h('div'), sWrap = h('div'), rWrap = h('div')
  el.appendChild(kTitle); el.appendChild(legK); el.appendChild(kWrap)
  el.appendChild(sTitle); el.appendChild(legS); el.appendChild(sWrap)
  el.appendChild(rTitle); el.appendChild(rWrap)

  function pickRange(arrs, pad) {
    var lo = 0, hi = 0
    arrs.forEach(function (a) { for (var i = 0; i < a.length; i++) { if (a[i] < lo) lo = a[i]; if (a[i] > hi) hi = a[i] } })
    if (hi - lo < 1e-9) { hi = 1; lo = -1 }
    var e = (hi - lo) * pad
    return [lo - e, hi + e]
  }

  function niceStep(span) {
    var e = Math.pow(10, Math.floor(Math.log10(span / 5))), c = [1, 2, 2.5, 5, 10, 20]
    for (var i = 0; i < c.length; i++) if (span / (c[i] * e) <= 5.0001) return c[i] * e
    return 20 * e
  }
  function niceY(lo, hi) {
    var st = niceStep(hi - lo), a = Math.floor(lo / st + 1e-9), b = Math.ceil(hi / st - 1e-9)
    return { y0: a * st, y1: b * st, n: b - a, st: st }
  }
  function xAxis(T) {
    var st = T <= 60 ? 10 : T <= 140 ? 20 : T <= 250 ? 50 : 50, x1 = Math.ceil((T - 1) / st) * st
    return { x0: 0, x1: x1, xticks: x1 / st }
  }
  function yfm(st) { return function (v) { return AIW.fmt(Math.abs(v) < st * 1e-6 ? 0 : v, st >= 1 ? 0 : Math.max(1, Math.ceil(-Math.log10(st) - 1e-9))) } }

  var kO = { aspect: 0.32, maxHeight: 220 }, sO = { aspect: 0.4, maxHeight: 280 }, rO = { aspect: 0.2, maxHeight: 140 }
  function setAspect() {
    var narrow = (el.clientWidth || 600) < 520
    kO.aspect = narrow ? 0.62 : 0.32; sO.aspect = narrow ? 0.75 : 0.4; rO.aspect = narrow ? 0.4 : 0.2
  }
  setAspect()
  if (window.ResizeObserver) new ResizeObserver(setAspect).observe(el)
  var kC = AIW.canvas(kWrap, kO, function (ctx, w, hgt) {
    if (!model) return
    var m = model, T = m.T, xa
    var yr
    if (m.K) {
      var env = m.mode === 'sel' ? 0 : Math.hypot(m.bb[0], m.bb[1])
      var mx = 0; for (var i = 0; i < m.K.length; i++) mx = Math.max(mx, Math.abs(m.K[i]))
      mx = Math.max(mx, env) * 1.1
      yr = [-mx, mx]
    } else yr = [-1, 1]
    var ny = niceY(yr[0], yr[1]), xa = xAxis(T)
    var ax = AIW.axes(ctx, { w: w, h: hgt, x0: xa.x0, x1: xa.x1, y0: ny.y0, y1: ny.y1, xlabel: S.lagK, ylabel: 'K_k', xticks: xa.xticks, yticks: ny.n,
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: yfm(ny.st) })
    if (!m.K) {
      ctx.save(); ctx.fillStyle = C.slate; ctx.font = '13px "DM Sans", system-ui, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(S.noKernel, (ax.pad.l + w - ax.pad.r) / 2, hgt / 2); ctx.restore()
      return
    }
    ctx.save()
    ctx.strokeStyle = C.slate; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(ax.X(0), ax.Y(0)); ctx.lineTo(ax.X(xa.x1), ax.Y(0)); ctx.stroke()
    if (m.mode !== 'sel') {
      var A = Math.hypot(m.bb[0], m.bb[1]), rr = Math.hypot(m.lam[0], m.lam[1])
      ctx.strokeStyle = C.muted; ctx.setLineDash([5, 4])
      ;[1, -1].forEach(function (sg) {
        ctx.beginPath()
        for (var k = 0; k < T; k++) { var px = ax.X(k), py = ax.Y(sg * A * Math.pow(rr, k)); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py) }
        ctx.stroke()
      })
      ctx.setLineDash([])
    }
    ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = T > 200 ? 1 : 1.5
    for (var j = 0; j < T; j++) {
      var X = ax.X(j), Y = ax.Y(m.K[j])
      ctx.beginPath(); ctx.moveTo(X, ax.Y(0)); ctx.lineTo(X, Y); ctx.stroke()
      ctx.beginPath(); ctx.arc(X, Y, T > 200 ? 1.5 : 2.5, 0, 2 * PI); ctx.fill()
    }
    ctx.restore()
  })

  var sC2 = AIW.canvas(sWrap, sO, function (ctx, w, hgt) {
    if (!model) return
    var m = model, T = m.T
    var yr = pickRange([m.x, m.y, m.conv || []], 0.04), ny = niceY(yr[0], yr[1]), xa = xAxis(T)
    yr = [ny.y0, ny.y1]
    var ax = AIW.axes(ctx, { w: w, h: hgt, x0: xa.x0, x1: xa.x1, y0: ny.y0, y1: ny.y1, xlabel: S.timeT, ylabel: 'x, y', xticks: xa.xticks, yticks: ny.n,
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: yfm(ny.st) })
    ctx.save()
    ctx.beginPath(); ctx.rect(ax.pad.l, ax.pad.t, w - ax.pad.l - ax.pad.r, hgt - ax.pad.t - ax.pad.b); ctx.clip()
    if (yr[0] < 0 && yr[1] > 0) {
      ctx.strokeStyle = C.slate; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(ax.X(0), ax.Y(0)); ctx.lineTo(ax.X(xa.x1), ax.Y(0)); ctx.stroke()
    }
    function line(arr, col, lw) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath()
      for (var i = 0; i < T; i++) { var px = ax.X(i), py = ax.Y(arr[i]); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py) }
      ctx.stroke()
    }
    line(m.x, C.muted, 1.2)
    line(m.y, C.blue, 1.8)
    if (m.conv) {
      ctx.fillStyle = C.orange
      for (var i = 0; i < T; i++) { ctx.beginPath(); ctx.arc(ax.X(i), ax.Y(m.conv[i]), T > 200 ? 1.5 : 2.3, 0, 2 * PI); ctx.fill() }
    }
    ctx.restore()
  })

  var rC = AIW.canvas(rWrap, rO, function (ctx, w, hgt) {
    if (!model || model.mode !== 'sel') return
    var m = model, T = m.T
    var xa = xAxis(T)
    var ax = AIW.axes(ctx, { w: w, h: hgt, x0: xa.x0, x1: xa.x1, y0: 0, y1: 1, xlabel: S.timeT, ylabel: 'a_t', xticks: xa.xticks, yticks: 2,
      xfmt: function (v) { return String(Math.round(v)) }, yfmt: function (v) { return AIW.fmt(v, 1) } })
    ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 1.6; ctx.beginPath()
    for (var i = 0; i < T; i++) { var px = ax.X(i), py = ax.Y(m.a[i]); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py) }
    ctx.stroke(); ctx.restore()
  })

  var readout = h('div', { class: 'w-readout', style: { marginTop: '.6rem' } })
  var noteEl = h('p', { class: 'w-note', title: S.tip })
  el.appendChild(readout); el.appendChild(noteEl)

  function show(node, on) { node.style.display = on ? '' : 'none' }
  function grey(node, off) {
    var inp = node.querySelector('input,select'); if (inp) inp.disabled = off
    node.style.opacity = off ? '0.45' : ''
  }
  function ang(re, im) { return Math.atan2(im, re) }
  function f(x, d) { return AIW.fmt(z(x), d) }
  function sci(x) { return x === 0 ? '0' : x.toExponential(1).replace('-', '−') }
  function stepsFmt(x) { return isFinite(x) ? f(x, 2) : S.inf }

  function update() {
    var sel = P.sel, cont = P.cont && !sel
    show(sR, !cont && !sel); show(sTh, !cont); grey(sTh, sel)
    show(thNote, sel); show(sAC, cont); show(sOm, cont); show(sDe, cont)
    show(sW, sel); show(sC, sel); show(sAS, sel)
    grey(cCont, sel)
    show(rTitle, sel); show(rWrap, sel)
    kTitle.textContent = sel ? t('Kernel: exists only while the step is constant, K_k = a^k b', '卷积核：仅在步长恒定时存在，K_k = a^k b') : S.kernelTitle
    model = compute(P)
    setLegends()
    kC.redraw(); sC2.redraw(); rC.redraw()
    var m = model, L = []
    if (m.mode === 'sel') {
      var dmin = Math.min.apply(null, m.D), dmax = Math.max.apply(null, m.D), amin = Math.min.apply(null, m.a), amax = Math.max.apply(null, m.a)
      L.push('Δ_t = softplus(' + f(P.w, 1) + '·x_t ' + (P.c < 0 ? '− ' : '+ ') + f(Math.abs(P.c), 1) + ')   α = ' + f(P.alphaS, 3))
      L.push(t('Δ_t range: ', 'Δ_t 范围：') + f(dmin, 4) + ' … ' + f(dmax, 4))
      L.push(t('a_t range: ', 'a_t 范围：') + f(amin, 4) + ' … ' + f(amax, 4) + t('   b_t = Δ_t', '   b_t = Δ_t'))
      if (m.const) {
        var a0 = m.lam[0]
        L.push(t('w = 0: constant step, a = ', 'w = 0：步长恒定，a = ') + f(a0, 4) + ', b = ' + f(m.bb[0], 4))
        L.push(t('half-life ln 0.5 / ln a = ', '半衰期 ln 0.5 / ln a = ') + stepsFmt(Math.log(0.5) / Math.log(a0)) + ' ' + S.steps)
        L.push(t('max |recurrence − convolution| = ', 'max |递推 − 卷积| = ') + sci(m.maxd))
      } else {
        L.push(t('max |recurrence − convolution| = not defined (no fixed kernel)', 'max |递推 − 卷积| = 无定义（没有固定的卷积核）'))
      }
      noteEl.textContent = S.noteSel
    } else {
      var lr = m.lam[0], li = m.lam[1], mod = Math.hypot(lr, li), th = ang(lr, li)
      var hl = mod < 1 ? Math.log(0.5) / Math.log(mod) : Infinity
      var per = Math.abs(th) < 1e-12 ? Infinity : 2 * PI / Math.abs(th)
      L.push('λ = ' + f(mod, 4) + ' ∠ ' + f(th, 4) + ' rad (' + piFmt(Math.abs(th)).replace(/^0$/, '0') + ')' )
      L.push('λ = ' + f(z(lr), 4) + (z(li) < 0 ? ' − ' : ' + ') + f(Math.abs(z(li)), 4) + 'i')
      L.push('|λ| = ' + f(mod, 4))
      L.push(t('half-life ln 0.5 / ln|λ| = ', '半衰期 ln 0.5 / ln|λ| = ') + stepsFmt(hl) + ' ' + S.steps)
      L.push(t('oscillation period 2π/θ = ', '振荡周期 2π/θ = ') + stepsFmt(per) + ' ' + S.steps)
      if (m.mode === 'cont') {
        L.push('b̄ = ' + f(z(m.bb[0]), 4) + (z(m.bb[1]) < 0 ? ' − ' : ' + ') + f(Math.abs(z(m.bb[1])), 4) + 'i')
        L.push(t('time constant 1/α = ', '时间常数 1/α = ') + f(1 / P.alphaC, 2) + t(' time units = ', ' 时间单位 = ') + f(1 / (P.alphaC * P.delta), 2) + ' ' + S.steps + ' (1/(αΔ))')
      }
      L.push(t('max |recurrence − convolution| = ', 'max |递推 − 卷积| = ') + sci(m.maxd))
      noteEl.textContent = S.note
    }
    if (m.K) L.push('K_0…K_5 = ' + m.K.slice(0, 6).map(function (v) { return f(v, 3) }).join(', '))
    L.push(t('final output y_', '末位输出 y_') + (m.T - 1) + ' = ' + f(m.y[m.T - 1], 4) + t('   peak |y_t| = ', '   峰值 |y_t| = ') + f(Math.max.apply(null, m.y.map(Math.abs)), 4))
    readout.textContent = L.join('\n')
  }
  update()
})
