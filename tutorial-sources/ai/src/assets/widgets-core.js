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
