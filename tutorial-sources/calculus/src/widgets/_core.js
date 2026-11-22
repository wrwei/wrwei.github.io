/* Calculus series: the shared core of the interactive widgets.
 *
 * A widget is a file src/widgets/NAME.js that calls
 *     CalcWidgets.register('NAME', function (root, api) { ... })
 * and builds itself inside root (the page's <div class="widget" data-widget="NAME">).
 *
 * api.lang                 'en' or 'zh';  api.t(en, zh) picks the string for the page's language
 * api.h(tag, attrs, ...children)   create an element (attrs: class, text, on: {click: fn}, any attribute)
 * api.css(id, text)        add a style sheet once (use the site's variables: --navy --blue --sky --slate
 *                          --muted --border --bg --white --orange --green --red --purple --font-mono)
 * api.Expr.parse(src, vars)  parse what a reader types ("x^2 sin(x)", "2x+1", "|x|", "e^(-x)", "√x")
 *                          -> { ok: true, f: (...values) => number, src } or { ok: false, error }
 *                          vars: the variable names allowed, e.g. ['x'] or ['x', 'y'] (default ['x'])
 * api.plot(parent, opts)   an SVG coordinate plane that resizes with the page; see Plot below
 * api.num                  numerical methods: deriv, deriv2, integrate, riemann, simpson, bisect,
 *                          newton, euler, rk4, grad, fmt
 * api.slider(o) api.select(o) api.button(label, onclick, o) api.field(o) api.readout() api.row(...)
 *                          labelled controls, usable with the keyboard
 */
(function () {
  'use strict'
  var registry = {}

  function lang() { return /^zh/.test(document.documentElement.lang || '') ? 'zh' : 'en' }
  function t(en, zh) { return lang() === 'zh' && zh != null ? zh : en }

  function h(tag, attrs) {
    var el = /^(svg|g|path|line|circle|rect|text|polyline|polygon|defs|clipPath|marker|tspan|ellipse)$/.test(tag)
      ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag)
    attrs = attrs || {}
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]
      if (v == null || v === false) return
      if (k === 'text') el.textContent = v
      else if (k === 'on') Object.keys(v).forEach(function (ev) { el.addEventListener(ev, v[ev]) })
      else if (k === 'class' && el instanceof SVGElement) el.setAttribute('class', v)
      else if (k === 'class') el.className = v
      else el.setAttribute(k, v === true ? '' : v)
    })
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i]
      if (c == null || c === false) continue
      if (Array.isArray(c)) c.forEach(function (x) { if (x != null) el.appendChild(typeof x === 'string' ? document.createTextNode(x) : x) })
      else el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c)
    }
    return el
  }

  var cssDone = {}
  function css(id, text) {
    if (cssDone[id]) return
    cssDone[id] = true
    document.head.appendChild(h('style', { 'data-widget-css': id }, text))
  }

  // ------------------------------------------------------------------ expressions
  var FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    sec: function (x) { return 1 / Math.cos(x) }, csc: function (x) { return 1 / Math.sin(x) }, cot: function (x) { return 1 / Math.tan(x) },
    asin: Math.asin, acos: Math.acos, atan: Math.atan, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, exp: Math.exp, ln: Math.log, log: Math.log,
    log10: Math.log10, log2: Math.log2, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, sign: Math.sign,
    floor: Math.floor, ceil: Math.ceil,
  }
  var CONSTS = { pi: Math.PI, e: Math.E }

  function tokenize(src, names) {
    var s = String(src)
      .replace(/[−–]/g, '-').replace(/[·×∙]/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/\*\*/g, '^')
      // √x, √2, √(x+1): the square root of what follows
      .replace(/√\s*(\d+\.?\d*|[A-Za-z_]\w*|\([^()]*\))/g, function (m, a) { return 'sqrt(' + (a[0] === '(' ? a.slice(1, -1) : a) + ')' })
      .replace(/√/g, 'sqrt')
    var toks = [], i = 0, m
    while (i < s.length) {
      var rest = s.slice(i)
      if ((m = rest.match(/^\s+/))) { i += m[0].length; continue }
      if ((m = rest.match(/^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/))) { toks.push({ k: 'num', v: parseFloat(m[0]), at: i }); i += m[0].length; continue }
      if ((m = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/))) {
        // Split a run of letters into known names, longest first: "xsin" -> x, sin; "pix" -> pi, x.
        var word = m[0], j = 0
        while (j < word.length) {
          var found = null
          for (var L = word.length - j; L > 0; L--) {
            var cand = word.slice(j, j + L)
            if (FUNCS[cand] || CONSTS[cand] !== undefined || names.indexOf(cand) >= 0) { found = cand; break }
          }
          if (!found) return { error: t('Unknown name "' + word + '"', '未知的名称“' + word + '”'), at: i + j }
          toks.push({ k: FUNCS[found] ? 'fn' : 'id', v: found, at: i + j })
          j += found.length
        }
        i += word.length
        continue
      }
      if ('+-*/^(),|'.indexOf(s[i]) >= 0) { toks.push({ k: s[i], at: i }); i++; continue }
      return { error: t('Unexpected "' + s[i] + '"', '无法识别的字符“' + s[i] + '”'), at: i }
    }
    toks.push({ k: 'end', at: s.length })
    return { toks: toks }
  }

  function parse(src, vars) {
    vars = vars || ['x']
    if (!String(src).trim()) return { ok: false, error: t('Type a formula', '请输入公式') }
    var tk = tokenize(src, vars)
    if (tk.error) return { ok: false, error: tk.error }
    var toks = tk.toks, p = 0, absDepth = 0
    function peek() { return toks[p] }
    function eat(k) { if (toks[p].k === k) return toks[p++]; throw new Error(t('Expected "' + k + '"', '缺少“' + k + '”')) }
    function startsPrimary(tok) { return tok.k === 'num' || tok.k === 'id' || tok.k === 'fn' || tok.k === '(' || (tok.k === '|' && absDepth === 0) }
    function expr() {
      var node = term()
      while (peek().k === '+' || peek().k === '-') { var op = toks[p++].k; node = { op: op, a: node, b: term() } }
      return node
    }
    function term() {
      var node = unary()
      for (;;) {
        var k = peek().k
        if (k === '*' || k === '/') { p++; node = { op: k, a: node, b: unary() } }
        else if (startsPrimary(peek())) node = { op: '*', a: node, b: power() }    // implicit: 2x, x sin(x), (x+1)(x-1)
        else return node
      }
    }
    function unary() {
      if (peek().k === '-') { p++; return { op: 'neg', a: unary() } }
      if (peek().k === '+') { p++; return unary() }
      return power()
    }
    function power() {
      var base = primary()
      if (peek().k === '^') { p++; return { op: '^', a: base, b: unary() } }
      return base
    }
    function primary() {
      var tok = peek()
      if (tok.k === 'num') { p++; return { op: 'num', v: tok.v } }
      if (tok.k === 'id') { p++; return CONSTS[tok.v] !== undefined && vars.indexOf(tok.v) < 0 ? { op: 'num', v: CONSTS[tok.v] } : { op: 'var', i: vars.indexOf(tok.v) } }
      if (tok.k === 'fn') {
        p++
        if (peek().k !== '(') throw new Error(t('Write ' + tok.v + '(…) with brackets', '请写成 ' + tok.v + '(…)，带括号'))
        p++
        var arg = expr()
        eat(')')
        if (peek().k === '^') { p++; return { op: '^', a: { op: 'fn', f: FUNCS[tok.v], a: arg }, b: unary() } }
        return { op: 'fn', f: FUNCS[tok.v], a: arg }
      }
      if (tok.k === '(') { p++; var e = expr(); eat(')'); return e }
      if (tok.k === '|' && absDepth === 0) { p++; absDepth++; var ea = expr(); absDepth--; eat('|'); return { op: 'fn', f: Math.abs, a: ea } }
      if (tok.k === 'end') throw new Error(t('The formula ends too early', '公式不完整'))
      throw new Error(t('Unexpected "' + tok.k + '"', '这里不能出现“' + tok.k + '”'))
    }
    var tree
    try {
      tree = expr()
      if (peek().k !== 'end') throw new Error(t('Unexpected "' + (peek().v || peek().k) + '"', '多余的“' + (peek().v || peek().k) + '”'))
    } catch (e) { return { ok: false, error: e.message } }
    function compile(n) {
      switch (n.op) {
        case 'num': return function () { return n.v }
        case 'var': return function (v) { return v[n.i] }
        case 'neg': var a0 = compile(n.a); return function (v) { return -a0(v) }
        case 'fn': var fa = compile(n.a), fn = n.f; return function (v) { return fn(fa(v)) }
        default:
          var A = compile(n.a), B = compile(n.b)
          if (n.op === '+') return function (v) { return A(v) + B(v) }
          if (n.op === '-') return function (v) { return A(v) - B(v) }
          if (n.op === '*') return function (v) { return A(v) * B(v) }
          if (n.op === '/') return function (v) { return A(v) / B(v) }
          return function (v) {   // powers: real cube roots of negatives, x^(1/3) for x < 0
            var a = A(v), b = B(v)
            if (a < 0 && !Number.isInteger(b)) {
              var r = 1 / b
              if (Number.isInteger(r) && Math.abs(r) % 2 === 1) return -Math.pow(-a, b)
            }
            return Math.pow(a, b)
          }
      }
    }
    var c = compile(tree)
    return { ok: true, src: String(src), f: function () { return c(arguments) } }
  }

  // ------------------------------------------------------------------ numbers
  function fmt(x, sig) {
    sig = sig || 5
    if (x === Infinity) return '∞'
    if (x === -Infinity) return '−∞'
    if (typeof x !== 'number' || isNaN(x)) return '—'
    if (Math.abs(x) < 1e-12) return '0'
    var s
    if (Math.abs(x) >= 1e6 || Math.abs(x) < 1e-4) {
      s = x.toExponential(sig - 1).replace(/\.?0+e/, 'e')
      var parts = s.split('e')
      s = parts[0] + ' × 10' + sup(parseInt(parts[1], 10))
    } else {
      s = Number(x.toPrecision(sig)).toString()
    }
    return s.replace(/-/g, '−')
  }
  function sup(n) {
    var map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
    return String(n).split('').map(function (c) { return map[c] }).join('')
  }

  var num = {
    fmt: fmt,
    deriv: function (f, x) { var hh = 1e-5 * (1 + Math.abs(x)); return (f(x + hh) - f(x - hh)) / (2 * hh) },
    deriv2: function (f, x) { var hh = 1e-4 * (1 + Math.abs(x)); return (f(x + hh) - 2 * f(x) + f(x - hh)) / (hh * hh) },
    integrate: function (f, a, b, tol) {
      tol = tol || 1e-10
      function simp(a, b, fa, fm, fb) { return (b - a) / 6 * (fa + 4 * fm + fb) }
      function rec(a, b, fa, fm, fb, whole, tol, depth) {
        var m = (a + b) / 2, lm = (a + m) / 2, rm = (m + b) / 2
        var flm = f(lm), frm = f(rm)
        var left = simp(a, m, fa, flm, fm), right = simp(m, b, fm, frm, fb)
        if (depth > 40 || Math.abs(left + right - whole) <= 15 * tol) return left + right + (left + right - whole) / 15
        return rec(a, m, fa, flm, fm, left, tol / 2, depth + 1) + rec(m, b, fm, frm, fb, right, tol / 2, depth + 1)
      }
      if (a === b) return 0
      var fa = f(a), fb = f(b), fm = f((a + b) / 2)
      return rec(a, b, fa, fm, fb, simp(a, b, fa, fm, fb), tol, 0)
    },
    riemann: function (f, a, b, n, rule) {
      var dx = (b - a) / n, s = 0
      for (var i = 0; i < n; i++) {
        var x0 = a + i * dx, x1 = x0 + dx
        if (rule === 'right') s += f(x1)
        else if (rule === 'mid') s += f((x0 + x1) / 2)
        else if (rule === 'trap') s += (f(x0) + f(x1)) / 2
        else s += f(x0)
      }
      return s * dx
    },
    simpson: function (f, a, b, n) {
      if (n % 2) n++
      var dx = (b - a) / n, s = f(a) + f(b)
      for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * dx)
      return s * dx / 3
    },
    bisect: function (f, a, b) { var m = (a + b) / 2; return f(a) * f(m) <= 0 ? [a, m] : [m, b] },
    newton: function (f, x, df) { var d = df ? df(x) : num.deriv(f, x); return x - f(x) / d },
    euler: function (F, t0, y0, hh, n) { var pts = [[t0, y0]], tt = t0, y = y0; for (var i = 0; i < n; i++) { y += hh * F(tt, y); tt += hh; pts.push([tt, y]) } return pts },
    rk4: function (F, t0, y0, hh, n) {
      var pts = [[t0, y0]], tt = t0, y = y0
      for (var i = 0; i < n; i++) {
        var k1 = F(tt, y), k2 = F(tt + hh / 2, y + hh * k1 / 2), k3 = F(tt + hh / 2, y + hh * k2 / 2), k4 = F(tt + hh, y + hh * k3)
        y += hh * (k1 + 2 * k2 + 2 * k3 + k4) / 6; tt += hh; pts.push([tt, y])
      }
      return pts
    },
    grad: function (f, x, y) { var hh = 1e-5; return [(f(x + hh, y) - f(x - hh, y)) / (2 * hh), (f(x, y + hh) - f(x, y - hh)) / (2 * hh)] },
  }

  // ------------------------------------------------------------------ the plot
  function niceStep(range, target) {
    var raw = range / target, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p
  }

  /* api.plot(parent, { view: [xmin, xmax, ymin, ymax], aspect: 0.62, draw: function (P) {...},
   *                    xlabel: 'x', ylabel: 'y', grid: true, equal: false, label: 'accessible name' })
   * The plot calls draw(P) now, whenever the page is resized, and on P.redraw().
   * In draw, use: P.axes() P.curve(f, o) P.param(fx, fy, t0, t1, o) P.line(x1, y1, x2, y2, o)
   * P.infline(x0, y0, slope, o) P.point(x, y, o) P.rect(x0, y0, x1, y1, o) P.poly(pts, o)
   * P.area(f, a, b, o) P.text(x, y, s, o) P.arrow(x0, y0, x1, y1, o) P.vline(x, o) P.hline(y, o)
   * P.contour(f, levels, o)  level curves of f(x, y) for each value in levels (marching squares;
   *                          o.n: grid cells across, default 70; o.colors: one colour per level)
   * P.field(F, o)            arrows of a vector field F(x, y) -> [u, v] on a grid (o.n arrows across,
   *                          default 15); o.segments: true draws short line segments without heads
   *                          (direction fields); o.normalize: true draws every arrow the same length
   * Options o: color, width, dash (true or "6 4"), opacity, fill, r, hollow, size, anchor, dx, dy, bold.
   * P.X(x) P.Y(y) map data to pixels; P.data(px, py) maps back; P.view [xmin, xmax, ymin, ymax];
   * P.setView(v); P.onDrag(function (x, y, phase) {...}) with phase 'start' | 'move' | 'end'.
   */
  function plot(parent, opts) {
    opts = opts || {}
    var P = { view: (opts.view || [-5, 5, -5, 5]).slice(), W: 600, H: 360 }
    var svg = h('svg', { class: 'cw-plot', role: 'img', 'aria-label': opts.label || t('Graph', '图像') })
    var clipId = 'cwclip' + Math.random().toString(36).slice(2, 8)
    var defs = h('defs', {}, h('clipPath', { id: clipId }, h('rect', { x: 0, y: 0, width: 10, height: 10 })))
    var back = h('g'), main = h('g', { 'clip-path': 'url(#' + clipId + ')' }), front = h('g')
    svg.appendChild(defs); svg.appendChild(back); svg.appendChild(main); svg.appendChild(front)
    parent.appendChild(svg)
    var M = { l: 8, r: 8, t: 8, b: 8 }
    function size() {
      var w = parent.clientWidth || 600
      P.W = Math.max(280, Math.min(760, Math.round(w)))
      P.H = Math.round(P.W * (opts.aspect || 0.62))
      if (opts.equal) {
        var v = P.view, sx = (P.W - M.l - M.r) / (v[1] - v[0])
        P.H = Math.round(sx * (v[3] - v[2]) + M.t + M.b)
      }
      svg.setAttribute('viewBox', '0 0 ' + P.W + ' ' + P.H)
      svg.setAttribute('width', P.W)
      svg.setAttribute('height', P.H)
      var r = defs.querySelector('rect')
      r.setAttribute('x', M.l); r.setAttribute('y', M.t); r.setAttribute('width', P.W - M.l - M.r); r.setAttribute('height', P.H - M.t - M.b)
    }
    P.X = function (x) { var v = P.view; return M.l + (x - v[0]) / (v[1] - v[0]) * (P.W - M.l - M.r) }
    P.Y = function (y) { var v = P.view; return P.H - M.b - (y - v[2]) / (v[3] - v[2]) * (P.H - M.t - M.b) }
    P.data = function (px, py) {
      var v = P.view
      return [v[0] + (px - M.l) / (P.W - M.l - M.r) * (v[1] - v[0]), v[2] + (P.H - M.b - py) / (P.H - M.t - M.b) * (v[3] - v[2])]
    }
    function style(o, def) {
      o = o || {}
      var a = { stroke: o.color || def || 'var(--blue)', 'stroke-width': o.width || 2.2, fill: o.fill || 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }
      if (o.dash) a['stroke-dasharray'] = o.dash === true ? '6 4' : o.dash
      if (o.opacity != null) a.opacity = o.opacity
      return a
    }
    function add(layer, el) { (layer === 'back' ? back : layer === 'front' ? front : main).appendChild(el); return el }
    P.clear = function () { while (back.firstChild) back.removeChild(back.firstChild); while (main.firstChild) main.removeChild(main.firstChild); while (front.firstChild) front.removeChild(front.firstChild) }
    P.axes = function (o) {
      o = o || {}
      var v = P.view, sx = niceStep(v[1] - v[0], P.W / 70), sy = niceStep(v[3] - v[2], P.H / 45)
      var ax = Math.min(Math.max(0, v[2]), v[3]), ay = Math.min(Math.max(0, v[0]), v[1])
      var x, y
      if (opts.grid !== false) {
        for (x = Math.ceil(v[0] / sx) * sx; x <= v[1] + 1e-9; x += sx) add('back', h('line', { x1: P.X(x), x2: P.X(x), y1: M.t, y2: P.H - M.b, class: 'cw-grid' }))
        for (y = Math.ceil(v[2] / sy) * sy; y <= v[3] + 1e-9; y += sy) add('back', h('line', { y1: P.Y(y), y2: P.Y(y), x1: M.l, x2: P.W - M.r, class: 'cw-grid' }))
      }
      add('back', h('line', { x1: M.l, x2: P.W - M.r, y1: P.Y(ax), y2: P.Y(ax), class: 'cw-axis' }))
      add('back', h('line', { y1: M.t, y2: P.H - M.b, x1: P.X(ay), x2: P.X(ay), class: 'cw-axis' }))
      for (x = Math.ceil(v[0] / sx) * sx; x <= v[1] + 1e-9; x += sx) {
        if (Math.abs(x) < sx / 1e6 || P.X(x) < M.l + 10 || P.X(x) > P.W - M.r - 10) continue
        add('back', h('text', { x: P.X(x), y: Math.min(P.H - M.b - 3, P.Y(ax) + 15), class: 'cw-tick', 'text-anchor': 'middle' }, fmt(+x.toPrecision(10), 4)))
      }
      for (y = Math.ceil(v[2] / sy) * sy; y <= v[3] + 1e-9; y += sy) {
        if (Math.abs(y) < sy / 1e6 || P.Y(y) < M.t + 8 || P.Y(y) > P.H - M.b - 8) continue
        add('back', h('text', { x: Math.max(M.l + 2, P.X(ay) - 5), y: P.Y(y) + 4, class: 'cw-tick', 'text-anchor': P.X(ay) - 5 < M.l + 20 ? 'start' : 'end' }, fmt(+y.toPrecision(10), 4)))
      }
      var xl = o.xlabel || opts.xlabel || 'x', yl = o.ylabel || opts.ylabel || 'y'
      add('back', h('text', { x: P.W - M.r - 4, y: P.Y(ax) - 6, class: 'cw-axlabel', 'text-anchor': 'end' }, xl))
      add('back', h('text', { x: P.X(ay) + 6, y: M.t + 12, class: 'cw-axlabel' }, yl))
    }
    P.curve = function (f, o) {
      o = o || {}
      var v = P.view, n = o.samples || Math.max(400, P.W * 2), d = '', pen = false, prevPy = null
      var a = o.from != null ? Math.max(o.from, v[0]) : v[0], b = o.to != null ? Math.min(o.to, v[1]) : v[1]
      for (var i = 0; i <= n; i++) {
        var x = a + (b - a) * i / n, y
        try { y = f(x) } catch (e) { y = NaN }
        var py = P.Y(y)
        if (!isFinite(y) || Math.abs(py) > 1e5 || (prevPy !== null && Math.abs(py - prevPy) > P.H * 1.2)) { pen = isFinite(y) && Math.abs(py) <= 1e5; if (pen) d += 'M' + P.X(x).toFixed(1) + ' ' + py.toFixed(1); prevPy = pen ? py : null; continue }
        d += (pen ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + py.toFixed(1)
        pen = true; prevPy = py
      }
      return add(o.layer, h('path', Object.assign(style(o), { d: d })))
    }
    P.param = function (fx, fy, t0, t1, o) {
      o = o || {}
      var n = o.samples || 600, d = ''
      for (var i = 0; i <= n; i++) {
        var tt = t0 + (t1 - t0) * i / n, x = fx(tt), y = fy(tt)
        if (!isFinite(x) || !isFinite(y)) continue
        d += (d ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1)
      }
      return add(o.layer, h('path', Object.assign(style(o), { d: d })))
    }
    P.line = function (x1, y1, x2, y2, o) { return add((o || {}).layer, h('line', Object.assign(style(o, 'var(--slate)'), { x1: P.X(x1), y1: P.Y(y1), x2: P.X(x2), y2: P.Y(y2) }))) }
    P.infline = function (x0, y0, m, o) { var v = P.view; return P.line(v[0], y0 + m * (v[0] - x0), v[1], y0 + m * (v[1] - x0), o) }
    P.vline = function (x, o) { var v = P.view; return P.line(x, v[2], x, v[3], Object.assign({ dash: true, width: 1.2 }, o)) }
    P.hline = function (y, o) { var v = P.view; return P.line(v[0], y, v[1], y, Object.assign({ dash: true, width: 1.2 }, o)) }
    P.point = function (x, y, o) {
      o = o || {}
      var col = o.color || 'var(--blue)'
      return add(o.layer || 'front', h('circle', { cx: P.X(x), cy: P.Y(y), r: o.r || 5, fill: o.hollow ? 'var(--white)' : col, stroke: col, 'stroke-width': 2 }))
    }
    P.rect = function (x0, y0, x1, y1, o) {
      o = o || {}
      var X0 = P.X(Math.min(x0, x1)), X1 = P.X(Math.max(x0, x1)), Y0 = P.Y(Math.max(y0, y1)), Y1 = P.Y(Math.min(y0, y1))
      return add(o.layer, h('rect', { x: X0, y: Y0, width: Math.max(0, X1 - X0), height: Math.max(0, Y1 - Y0), fill: o.fill || 'var(--sky)', 'fill-opacity': o.opacity != null ? o.opacity : 0.25, stroke: o.color || 'var(--sky)', 'stroke-width': o.width || 1 }))
    }
    P.poly = function (pts, o) {
      o = o || {}
      var d = pts.map(function (q, i) { return (i ? 'L' : 'M') + P.X(q[0]).toFixed(1) + ' ' + P.Y(q[1]).toFixed(1) }).join('') + (o.closed ? 'Z' : '')
      var a = style(o)
      if (o.fill) { a.fill = o.fill; a['fill-opacity'] = o.opacity != null ? o.opacity : 0.25; delete a.opacity }
      return add(o.layer, h('path', Object.assign(a, { d: d })))
    }
    P.area = function (f, a, b, o) {
      o = o || {}
      var n = 200, pts = [[a, o.g ? o.g(a) : 0]], i, x
      for (i = 0; i <= n; i++) { x = a + (b - a) * i / n; var y = f(x); pts.push([x, isFinite(y) ? Math.max(Math.min(y, 1e6), -1e6) : 0]) }
      for (i = n; i >= 0; i--) { x = a + (b - a) * i / n; pts.push([x, o.g ? o.g(x) : 0]) }
      return P.poly(pts, { fill: o.fill || 'var(--sky)', opacity: o.opacity != null ? o.opacity : 0.25, color: 'none', width: 0, closed: true, layer: o.layer })
    }
    P.text = function (x, y, s, o) {
      o = o || {}
      return add(o.layer || 'front', h('text', { x: P.X(x) + (o.dx || 0), y: P.Y(y) + (o.dy || 0), class: 'cw-label' + (o.bold ? ' cw-bold' : ''), fill: o.color || 'var(--navy)', 'text-anchor': o.anchor || 'start', 'font-size': o.size || null }, s))
    }
    P.arrow = function (x0, y0, x1, y1, o) {
      o = o || {}
      var col = o.color || 'var(--navy)'
      var X0 = P.X(x0), Y0 = P.Y(y0), X1 = P.X(x1), Y1 = P.Y(y1), ang = Math.atan2(Y1 - Y0, X1 - X0), s = o.head || 9
      var g = h('g')
      g.appendChild(h('line', Object.assign(style(o, col), { x1: X0, y1: Y0, x2: X1 - Math.cos(ang) * s * 0.8, y2: Y1 - Math.sin(ang) * s * 0.8 })))
      g.appendChild(h('path', { d: 'M' + X1 + ' ' + Y1 + 'L' + (X1 - s * Math.cos(ang - 0.4)) + ' ' + (Y1 - s * Math.sin(ang - 0.4)) + 'L' + (X1 - s * Math.cos(ang + 0.4)) + ' ' + (Y1 - s * Math.sin(ang + 0.4)) + 'Z', fill: col }))
      return add(o.layer || 'front', g)
    }
    P.contour = function (f, levels, o) {
      o = o || {}
      var v = P.view, nx = o.n || 70, ny = Math.max(10, Math.round(nx * (P.H / P.W))), i, j, k
      var dx = (v[1] - v[0]) / nx, dy = (v[3] - v[2]) / ny, val = []
      for (j = 0; j <= ny; j++) { val.push([]); for (i = 0; i <= nx; i++) { var z; try { z = f(v[0] + i * dx, v[2] + j * dy) } catch (e) { z = NaN } val[j].push(z) } }
      var g = h('g')
      levels.forEach(function (L, li) {
        var d = ''
        for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
          var c = [val[j][i], val[j][i + 1], val[j + 1][i + 1], val[j + 1][i]]
          if (c.some(function (q) { return !isFinite(q) })) continue
          var x0 = v[0] + i * dx, y0 = v[2] + j * dy
          var corners = [[x0, y0], [x0 + dx, y0], [x0 + dx, y0 + dy], [x0, y0 + dy]], pts = []
          for (k = 0; k < 4; k++) {
            var a = c[k], b = c[(k + 1) % 4]
            if ((a < L) !== (b < L)) {
              var tt = (L - a) / (b - a), p = corners[k], q = corners[(k + 1) % 4]
              pts.push([p[0] + tt * (q[0] - p[0]), p[1] + tt * (q[1] - p[1])])
            }
          }
          for (k = 0; k + 1 < pts.length; k += 2) d += 'M' + P.X(pts[k][0]).toFixed(1) + ' ' + P.Y(pts[k][1]).toFixed(1) + 'L' + P.X(pts[k + 1][0]).toFixed(1) + ' ' + P.Y(pts[k + 1][1]).toFixed(1)
        }
        var col = (o.colors && o.colors[li % o.colors.length]) || o.color || 'var(--slate)'
        g.appendChild(h('path', Object.assign(style({ color: col, width: o.width || 1.3, dash: o.dash, opacity: o.opacity }), { d: d })))
      })
      return add(o.layer, g)
    }
    P.field = function (F, o) {
      o = o || {}
      var v = P.view, nx = o.n || 15, cell = (v[1] - v[0]) / nx, ny = Math.max(2, Math.round((v[3] - v[2]) / cell))
      var vecs = [], maxLen = 0, i, j
      for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
        var x = v[0] + (i + 0.5) * cell, y = v[2] + (j + 0.5) * (v[3] - v[2]) / ny, w
        try { w = F(x, y) } catch (e) { w = [NaN, NaN] }
        if (!w || !isFinite(w[0]) || !isFinite(w[1])) continue
        var len = Math.hypot(w[0], w[1])
        maxLen = Math.max(maxLen, len)
        vecs.push([x, y, w[0], w[1], len])
      }
      var g = h('g'), px = (P.W - 16) / nx * 0.8
      vecs.forEach(function (q) {
        if (q[4] === 0) return
        // lengths in pixels: equal (normalize) or proportional to |F| (the longest fills 80% of a cell)
        var Lpx = o.normalize || o.segments ? px : px * q[4] / maxLen
        var ux = q[2] / q[4], uy = q[3] / q[4]
        var sx = (P.X(1) - P.X(0)), sy = (P.Y(1) - P.Y(0))
        var dxp = ux * Math.abs(sx), dyp = uy * sy, n2 = Math.hypot(dxp, dyp)
        dxp = dxp / n2 * Lpx; dyp = dyp / n2 * Lpx
        var cx = P.X(q[0]), cy = P.Y(q[1]), x0 = cx - dxp / 2, y0 = cy - dyp / 2, x1 = cx + dxp / 2, y1 = cy + dyp / 2
        var col = o.color || 'var(--slate)'
        g.appendChild(h('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: col, 'stroke-width': o.width || 1.4, 'stroke-linecap': 'round' }))
        if (!o.segments && Lpx > 4) {
          var ang = Math.atan2(y1 - y0, x1 - x0), s2 = Math.min(6, Lpx * 0.45)
          g.appendChild(h('path', { d: 'M' + x1 + ' ' + y1 + 'L' + (x1 - s2 * Math.cos(ang - 0.45)) + ' ' + (y1 - s2 * Math.sin(ang - 0.45)) + 'L' + (x1 - s2 * Math.cos(ang + 0.45)) + ' ' + (y1 - s2 * Math.sin(ang + 0.45)) + 'Z', fill: col }))
        }
      })
      return add(o.layer, g)
    }
    P.setView = function (v) { P.view = v.slice(); P.redraw() }
    P.redraw = function () { size(); P.clear(); if (opts.draw) opts.draw(P) }
    var dragCb = null, dragging = false
    P.onDrag = function (cb) { dragCb = cb; svg.classList.add('cw-draggable') }
    function pos(ev) {
      var r = svg.getBoundingClientRect()
      return P.data((ev.clientX - r.left) * P.W / r.width, (ev.clientY - r.top) * P.H / r.height)
    }
    svg.addEventListener('pointerdown', function (ev) { if (!dragCb) return; dragging = true; svg.setPointerCapture(ev.pointerId); var q = pos(ev); dragCb(q[0], q[1], 'start'); ev.preventDefault() })
    svg.addEventListener('pointermove', function (ev) { if (!dragCb || !dragging) return; var q = pos(ev); dragCb(q[0], q[1], 'move') })
    svg.addEventListener('pointerup', function (ev) { if (!dragCb || !dragging) return; dragging = false; var q = pos(ev); dragCb(q[0], q[1], 'end') })
    var timer = null
    window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(P.redraw, 120) })
    P.svg = svg
    P.redraw()
    return P
  }

  // ------------------------------------------------------------------ controls
  var uid = 0
  function slider(o) {
    var id = 'cw' + (++uid), f = o.fmt || function (v) { return fmt(v, 4) }
    var out = h('output', { for: id, class: 'cw-out' }, f(o.value))
    var input = h('input', { type: 'range', id: id, min: o.min, max: o.max, step: o.step || 'any', value: o.value })
    input.addEventListener('input', function () { out.textContent = f(+input.value); if (o.oninput) o.oninput(+input.value) })
    var el = h('div', { class: 'cw-slider' }, h('label', { for: id }, o.label), input, out)
    return { el: el, input: input, get: function () { return +input.value }, set: function (v) { input.value = v; out.textContent = f(+input.value) } }
  }
  function select(o) {
    var id = 'cw' + (++uid)
    var sel = h('select', { id: id, class: 'cw-select' }, o.options.map(function (op) { return h('option', { value: op.value, selected: op.value === o.value }, op.label) }))
    sel.addEventListener('change', function () { if (o.onchange) o.onchange(sel.value) })
    return { el: h('div', { class: 'cw-field' }, h('label', { for: id }, o.label), sel), input: sel, get: function () { return sel.value }, set: function (v) { sel.value = v } }
  }
  function button(label, onclick, o) {
    o = o || {}
    return h('button', { type: 'button', class: 'cw-btn' + (o.primary ? ' cw-primary' : ''), on: { click: onclick } }, label)
  }
  function field(o) {
    var id = 'cw' + (++uid), timer = null
    var input = h('input', { type: 'text', id: id, class: 'cw-input', value: o.value || '', placeholder: o.placeholder || '', spellcheck: 'false', autocomplete: 'off', size: o.size || 18 })
    var msg = h('span', { class: 'cw-msg', 'aria-live': 'polite' })
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { if (o.onchange) o.onchange(input.value) }, 250) })
    input.addEventListener('change', function () { clearTimeout(timer); if (o.onchange) o.onchange(input.value) })
    return {
      el: h('div', { class: 'cw-field' }, h('label', { for: id }, o.label), input, msg), input: input,
      get: function () { return input.value }, set: function (v) { input.value = v },
      error: function (m) { msg.textContent = m || ''; input.classList.toggle('cw-bad', !!m) },
    }
  }
  function readout() { return h('div', { class: 'cw-readout', 'aria-live': 'polite' }) }
  function row() { return h.apply(null, ['div', { class: 'cw-row' }].concat([].slice.call(arguments))) }

  css('core', [
    '.cw{font-size:.9rem;color:var(--navy)}',
    '.cw-row{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;margin:.4rem 0}',
    '.cw-plot{display:block;width:100%;height:auto;max-width:760px;background:var(--white);border:1px solid var(--border);border-radius:8px;touch-action:none;user-select:none}',
    '.cw-plot.cw-draggable{cursor:crosshair}',
    '.cw-grid{stroke:#E8EDF3;stroke-width:1}',
    '.cw-axis{stroke:var(--navy);stroke-width:1.2}',
    '.cw-tick{font:11px var(--font-mono);fill:var(--slate)}',
    '.cw-axlabel{font:italic 13px Georgia,"Times New Roman",serif;fill:var(--navy)}',
    '.cw-label{font:12.5px var(--font-body, sans-serif);paint-order:stroke;stroke:var(--white);stroke-width:3px;stroke-linejoin:round}',
    '.cw-bold{font-weight:700}',
    '.cw-slider{display:flex;align-items:center;gap:.5rem;min-width:0}',
    '.cw-slider label{flex:0 0 auto;white-space:nowrap}',
    '.cw-slider label,.cw-field label{font-weight:600;font-size:.85rem}',
    '.cw-slider input[type=range]{flex:1 1 110px;min-width:90px;width:auto;accent-color:var(--blue)}',
    '.cw-out{flex:0 0 auto;font-family:var(--font-mono);font-size:.82rem;min-width:3.2em;color:var(--slate);text-align:right}',
    '.cw-field{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}',
    '.cw-input,.cw-select{font-family:var(--font-mono);font-size:.85rem;padding:.35rem .5rem;border:1px solid var(--border);border-radius:7px;background:var(--white);color:var(--navy);max-width:100%}',
    '.cw-input.cw-bad{border-color:var(--red)}',
    '.cw-msg{font-size:.8rem;color:var(--red)}',
    '.cw-btn{font:600 .82rem var(--font-body, sans-serif);padding:.38rem .8rem;border-radius:7px;border:1px solid var(--border);background:var(--white);color:var(--navy);cursor:pointer}',
    '.cw-btn:hover{border-color:var(--blue);color:var(--blue)}',
    '.cw-btn:disabled{opacity:.45;cursor:default}',
    '.cw-btn.cw-primary{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.cw-readout{font-family:var(--font-mono);font-size:.82rem;color:var(--navy);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.5rem .7rem;margin:.5rem 0;white-space:pre-wrap;overflow-x:auto}',
    '.cw-scroll{overflow-x:auto;max-width:100%}',
    '.cw-table{border-collapse:collapse;font-family:var(--font-mono);font-size:.8rem}',
    '.cw-table th,.cw-table td{border:1px solid var(--border);padding:.25rem .55rem;text-align:right}',
    '.cw-table th{background:var(--bg);font-weight:600}',
  ].join('\n'))

  var api = {
    get lang() { return lang() }, t: t, h: h, css: css,
    Expr: { parse: parse }, plot: plot, num: num,
    slider: slider, select: select, button: button, field: field, readout: readout, row: row,
  }

  function mount(name) {
    var els = document.querySelectorAll('.widget[data-widget="' + name + '"]:not([data-mounted]):not([data-failed])')
    Array.prototype.forEach.call(els, function (el) {
      try {
        el.classList.add('cw')
        registry[name](el, api)
        el.setAttribute('data-mounted', '')
      } catch (e) {
        el.setAttribute('data-failed', '')
        el.appendChild(h('p', { class: 'cw-msg' }, t('This demonstration could not start: ', '演示无法启动：') + e.message))
        if (window.console) console.error(e)
      }
    })
  }

  window.CalcWidgets = {
    register: function (name, fn) {
      registry[name] = fn
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(name) })
      else mount(name)
    },
    api: api,
  }
})()
