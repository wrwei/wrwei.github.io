// Shared code for the series' widgets. Loaded first (build.mjs concatenates src/widgets/*.js in name
// order). A widget file calls FMWidgets.register(name, mount); tutorial.js calls FMWidgets.mountAll(),
// which runs mount(root, api) for every <div class="widget" data-widget="name"> on the page.
//
// api.lang       'en' or 'zh' (from <html lang>)
// api.t(en, zh)  pick the string for the page language
// api.h(tag, attrs, ...children)   create an element (attrs: class, text, on*: handlers, others as attributes)
// api.css(id, text)                add a <style> block once per page
// FMWidgets.Logic                  formulas: parse, print, evaluate (see below)
;(function () {
  'use strict'
  var registry = {}

  function lang() { return (document.documentElement.getAttribute('lang') || 'en').slice(0, 2) === 'zh' ? 'zh' : 'en' }

  function h(tag, attrs) {
    var el = document.createElement(tag)
    attrs = attrs || {}
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]
      if (v == null || v === false) return
      if (k === 'class') el.className = v
      else if (k === 'text') el.textContent = v
      else if (k === 'html') el.innerHTML = v
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v)
      else el.setAttribute(k, v === true ? '' : v)
    })
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i]
      if (c == null || c === false) continue
      if (Array.isArray(c)) c.forEach(function (x) { if (x != null && x !== false) el.appendChild(typeof x === 'string' ? document.createTextNode(x) : x) })
      else el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
    }
    return el
  }

  var injected = {}
  function css(id, text) {
    if (injected[id]) return
    injected[id] = true
    var s = document.createElement('style')
    s.setAttribute('data-widget-css', id)
    s.textContent = text
    document.head.appendChild(s)
  }

  // Common look for all widgets; individual widgets add their own rules with css().
  css('fm-core', [
    '.fmw{font-size:.92rem;color:var(--navy)}',
    '.fmw-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.4rem 0}',
    '.fmw-input{font-family:var(--font-isa,monospace);font-size:1rem;padding:.45rem .6rem;border:1px solid var(--border);border-radius:8px;min-width:0;flex:1 1 16rem;background:var(--white);color:var(--navy)}',
    '.fmw-input:focus{outline:2px solid var(--sky);outline-offset:1px}',
    '.fmw-btn{font:inherit;font-size:.85rem;padding:.35rem .75rem;border:1px solid var(--border);border-radius:8px;background:var(--white);color:var(--navy);cursor:pointer}',
    '.fmw-btn:hover{border-color:var(--blue);color:var(--blue)}',
    '.fmw-btn[aria-pressed="true"],.fmw-btn.on{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.fmw-btn:disabled{opacity:.45;cursor:default}',
    '.fmw-sym{font-family:var(--font-isa,monospace);min-width:2.1rem}',
    '.fmw-msg{font-size:.85rem;margin:.4rem 0;color:var(--slate)}',
    '.fmw-ok{color:#15803D;font-weight:600}',
    '.fmw-bad{color:#B91C1C;font-weight:600}',
    '.fmw-isa{font-family:var(--font-isa,monospace)}',
    '.fmw-table{border-collapse:collapse;font-family:var(--font-isa,monospace);font-size:.9rem;margin:.5rem 0}',
    '.fmw-table th,.fmw-table td{border:1px solid var(--border);padding:.2rem .55rem;text-align:center}',
    '.fmw-table th{background:var(--bg);font-weight:600}',
    '.fmw-t{color:#15803D}.fmw-f{color:#B91C1C}',
    '.fmw-scroll{overflow-x:auto;max-width:100%}',
  ].join('\n'))

  // ---------------------------------------------------------------- formulas
  // Syntax as in Isabelle/HOL, with Isabelle's priorities: ¬ (40) binds tighter than ∧ (35), ∨ (30),
  // ⟶ and ⟷ (25, same level); the binary connectives group to the right; = (50) binds tighter than ¬,
  // so ¬ x = y means ¬ (x = y); a quantifier's body extends as far to the right as possible.
  // ASCII input is accepted: ~ & | --> <-> ALL EX, and also ! / \ / -> <=> forall exists.
  // AST: {k:'const',v} {k:'atom',name,args:[terms]} {k:'eq',l,r} {k:'not',a} {k:'and'|'or'|'imp'|'iff',l,r}
  //      {k:'all'|'ex',v,body};  terms: {k:'var'|'fn',name,args}
  var Logic = (function () {
    var SYM = { '~': '¬', '!': '¬', '&': '∧', '&&': '∧', '/\\': '∧', '|': '∨', '||': '∨', '\\/': '∨', '-->': '⟶', '->': '⟶', '=>': '⟶',
      '<->': '⟷', '<-->': '⟷', '<=>': '⟷', 'ALL': '∀', 'forall': '∀', 'EX': '∃', 'exists': '∃', '~=': '≠' }
    var TOKEN = /\s*(⟷|⟶|<-->|<->|<=>|-->|->|=>|\/\\|\\\/|&&|\|\||~=|≠|[¬∧∨∀∃~!&|().,=]|[A-Za-z_][\w']*|\d+)/y

    function tokenize(src) {
      var toks = [], pos = 0, m
      src = String(src)
      while (pos < src.length) {
        TOKEN.lastIndex = pos
        m = TOKEN.exec(src)
        if (!m) { if (/^\s*$/.test(src.slice(pos))) break; throw new Error('cannot read "' + src.slice(pos).trim().slice(0, 12) + '"') }
        var t = m[1]
        toks.push(SYM[t] || t)
        pos = TOKEN.lastIndex
      }
      return toks
    }

    function parse(src) {
      var toks = tokenize(src), k = 0
      function peek() { return toks[k] }
      function eat(t) { if (toks[k] !== t) throw new Error('expected ' + t + (toks[k] ? ' before ' + toks[k] : ' at the end')); k++ }
      function isName(t) { return t && /^[A-Za-z_]/.test(t) && t !== 'True' && t !== 'False' }
      // A term: x, 3, f(x, y) in mathematical style, or f x y in Isabelle style (arguments are names,
      // numbers or parenthesised terms).
      function simple() {
        var t = toks[k]
        if (t === '(') { k++; var e = term(); eat(')'); return e }
        if (/^\d+$/.test(t || '')) { k++; return { k: 'fn', name: t, args: [] } }
        if (!isName(t)) throw new Error('expected a term' + (t ? ' before ' + t : ' at the end'))
        k++
        return { k: 'var', name: t }
      }
      function term() {
        var t = toks[k]
        if (t === '(' || /^\d+$/.test(t || '')) return simple()
        if (!isName(t)) throw new Error('expected a term' + (t ? ' before ' + t : ' at the end'))
        k++
        var args = []
        if (peek() === '(' && isName(t)) {
          k++; args.push(term()); while (peek() === ',') { k++; args.push(term()) } eat(')')
        } else {
          while (isName(peek()) || /^\d+$/.test(peek() || '') || peek() === '(') args.push(simple())
        }
        return args.length ? { k: 'fn', name: t, args: args } : { k: 'var', name: t }
      }
      function top() {
        if (peek() === '∀' || peek() === '∃') {
          var q = toks[k++] === '∀' ? 'all' : 'ex', vs = []
          while (isName(peek())) vs.push(toks[k++])
          if (!vs.length) throw new Error('expected a variable after ' + (q === 'all' ? '∀' : '∃'))
          eat('.')
          var body = top()
          for (var i = vs.length - 1; i >= 0; i--) body = { k: q, v: vs[i], body: body }
          return body
        }
        var l = or()
        if (peek() === '⟶' || peek() === '⟷') { var op = toks[k++] === '⟶' ? 'imp' : 'iff'; return { k: op, l: l, r: top() } }
        return l
      }
      function or() { var l = and(); if (peek() === '∨') { k++; return { k: 'or', l: l, r: or() } } return l }
      function and() { var l = unary(); if (peek() === '∧') { k++; return { k: 'and', l: l, r: and() } } return l }
      function unary() {
        if (peek() === '¬') { k++; return { k: 'not', a: unary() } }
        if (peek() === '∀' || peek() === '∃') return top()
        return atom()
      }
      function atom() {
        var t = peek()
        if (t === '(') {
          // a parenthesised formula, or a term that is the left side of an equation such as (x) = y
          k++; var f = top(); eat(')'); return f
        }
        if (t === 'True' || t === 'False') { k++; return { k: 'const', v: t === 'True' } }
        if (!isName(t) && !/^\d+$/.test(t || '')) throw new Error('unexpected ' + (t || 'end of formula'))
        var start = k, lhs = term()
        if (peek() === '=' || peek() === '≠') {
          var neg = toks[k++] === '≠', rhs = term(), e = { k: 'eq', l: lhs, r: rhs }
          return neg ? { k: 'not', a: e } : e
        }
        if (lhs.k === 'var') return { k: 'atom', name: lhs.name, args: [] }
        if (/^\d+$/.test(lhs.name)) { k = start; throw new Error('a number is not a formula') }
        return { k: 'atom', name: lhs.name, args: lhs.args }
      }
      if (!toks.length) throw new Error('empty formula')
      var f = top()
      if (k !== toks.length) throw new Error('unexpected ' + toks[k])
      return f
    }

    var PRI = { iff: 25, imp: 25, or: 30, and: 35, not: 40, all: 10, ex: 10, eq: 50, atom: 100, const: 100 }
    var OPS = { and: '∧', or: '∨', imp: '⟶', iff: '⟷' }
    // Terms and atoms print in Isabelle style: f x, R x (f y).
    function argStr(t) { return t.k === 'fn' && t.args.length ? '(' + termStr(t) + ')' : termStr(t) }
    function termStr(t) { return t.k === 'var' || !t.args.length ? t.name : t.name + ' ' + t.args.map(argStr).join(' ') }
    // Print with the fewest parentheses that keep the structure under Isabelle's priorities.
    function show(f, ctx) {
      ctx = ctx || 0
      var s, p = PRI[f.k]
      switch (f.k) {
        case 'const': return f.v ? 'True' : 'False'
        case 'atom': return f.args.length ? f.name + ' ' + f.args.map(argStr).join(' ') : f.name
        case 'eq': s = termStr(f.l) + ' = ' + termStr(f.r); break
        case 'not': s = '¬' + (f.a.k === 'atom' || f.a.k === 'const' || f.a.k === 'not' ? '' : ' ') + show(f.a, 40); break
        case 'all': case 'ex': s = (f.k === 'all' ? '∀' : '∃') + f.v + '. ' + show(f.body, 0); break
        default: s = show(f.l, p + 1) + ' ' + OPS[f.k] + ' ' + show(f.r, p)
      }
      return p < ctx || ((f.k === 'all' || f.k === 'ex') && ctx > 0) ? '(' + s + ')' : s
    }

    // Propositional atoms (atoms without arguments), in order of first appearance.
    function atoms(f, acc) {
      acc = acc || []
      if (f.k === 'atom' && !f.args.length) { if (acc.indexOf(f.name) < 0) acc.push(f.name) }
      ;['a', 'l', 'r', 'body'].forEach(function (x) { if (f[x]) atoms(f[x], acc) })
      return acc
    }

    // Truth of a propositional formula under a valuation {A: true, ...}.
    function evalProp(f, v) {
      switch (f.k) {
        case 'const': return f.v
        case 'atom': if (!(f.name in v)) throw new Error('no value for ' + f.name); return !!v[f.name]
        case 'not': return !evalProp(f.a, v)
        case 'and': return evalProp(f.l, v) && evalProp(f.r, v)
        case 'or': return evalProp(f.l, v) || evalProp(f.r, v)
        case 'imp': return !evalProp(f.l, v) || evalProp(f.r, v)
        case 'iff': return evalProp(f.l, v) === evalProp(f.r, v)
      }
      throw new Error('not a propositional formula')
    }

    // Truth in a finite structure M = {domain: [...], consts: {c: d}, preds: {P: [[d...], ...]}, funcs: {f: {key: d}}}
    // under an assignment env {x: d}. Function tables are keyed by the argument tuple joined with ','.
    function evalTerm(t, M, env) {
      if (t.k === 'var') {
        if (t.name in env) return env[t.name]
        if (M.consts && t.name in M.consts) return M.consts[t.name]
        throw new Error('no value for ' + t.name)
      }
      if (!t.args.length) { if (M.consts && t.name in M.consts) return M.consts[t.name]; throw new Error('no value for ' + t.name) }
      var tab = M.funcs && M.funcs[t.name]
      if (!tab) throw new Error('no function ' + t.name)
      return tab[t.args.map(function (a) { return evalTerm(a, M, env) }).join(',')]
    }
    function holds(f, M, env) {
      env = env || {}
      switch (f.k) {
        case 'const': return f.v
        case 'atom': {
          var rel = M.preds && M.preds[f.name]
          if (!rel) { if (!f.args.length && M.props && f.name in M.props) return !!M.props[f.name]; throw new Error('no predicate ' + f.name) }
          var tup = f.args.map(function (a) { return evalTerm(a, M, env) })
          return rel.some(function (r) { return r.length === tup.length && r.every(function (x, i) { return x === tup[i] }) })
        }
        case 'eq': return evalTerm(f.l, M, env) === evalTerm(f.r, M, env)
        case 'not': return !holds(f.a, M, env)
        case 'and': return holds(f.l, M, env) && holds(f.r, M, env)
        case 'or': return holds(f.l, M, env) || holds(f.r, M, env)
        case 'imp': return !holds(f.l, M, env) || holds(f.r, M, env)
        case 'iff': return holds(f.l, M, env) === holds(f.r, M, env)
        case 'all': case 'ex': {
          var any = false, all = true
          M.domain.forEach(function (d) { var e = Object.assign({}, env); e[f.v] = d; if (holds(f.body, M, e)) any = true; else all = false })
          return f.k === 'all' ? all : any
        }
      }
    }
    // Variables that occur free.
    function freeVars(f, bound, acc) {
      bound = bound || []; acc = acc || []
      function term(t) { if (t.k === 'var') { if (bound.indexOf(t.name) < 0 && acc.indexOf(t.name) < 0) acc.push(t.name) } else t.args.forEach(term) }
      switch (f.k) {
        case 'atom': f.args.forEach(term); break
        case 'eq': term(f.l); term(f.r); break
        case 'not': freeVars(f.a, bound, acc); break
        case 'all': case 'ex': freeVars(f.body, bound.concat([f.v]), acc); break
        case 'const': break
        default: freeVars(f.l, bound, acc); freeVars(f.r, bound, acc)
      }
      return acc
    }
    function same(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
    return { tokenize: tokenize, parse: parse, show: show, atoms: atoms, evalProp: evalProp, holds: holds, evalTerm: evalTerm, freeVars: freeVars, same: same }
  })()

  window.FMWidgets = {
    Logic: Logic,
    register: function (name, mount) { registry[name] = mount },
    mountAll: function () {
      var api = { lang: lang(), t: function (en, zh) { return lang() === 'zh' ? zh : en }, h: h, css: css, Logic: Logic }
      var nodes = document.querySelectorAll('.widget[data-widget]')
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i], fn = registry[node.getAttribute('data-widget')]
        if (!fn || node.getAttribute('data-mounted')) continue
        try { fn(node, api); node.setAttribute('data-mounted', '1') }
        catch (e) { node.textContent = api.t('This widget could not start: ', '此组件无法启动：') + e.message }
      }
    },
  }
})()
