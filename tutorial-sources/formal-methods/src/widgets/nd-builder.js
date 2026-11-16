// The natural-deduction proof builder of Module 6 (PLAN.md section 6). The reader picks a goal and
// builds a proof backwards, as Isabelle does: the open goals are listed, each with its assumptions;
// introduction rules act on the selected goal, elimination rules on a selected assumption of it. Rules
// that do not apply are refused with a short reason. A goal whose assumptions can be true while it is
// false (found by trying every valuation, or every structure with one or two elements) is marked as a
// dead end. When no goals remain, the finished derivation is shown as a tree and as indented text, with
// the rule names of the module: (∧I) (∧E₁) (∧E₂) (∨I₁) (∨I₂) (∨E) (⟶I) (⟶E) (¬I) (¬E) (⊥E) (∀I) (∀E)
// (∃I) (∃E) (RAA) (=I) (=E), discharged assumptions written [A]¹.
FMWidgets.register('nd-builder', function (root, api) {
  'use strict'
  var t = api.t, h = api.h, Logic = api.Logic

  api.css('nd-builder', [
    '.ndb .nd-help{margin:.1rem 0 .5rem}',
    '.ndb .nd-status{font-weight:600;margin:.7rem 0 .4rem;overflow-wrap:anywhere}',
    '.ndb .nd-goals{display:flex;flex-direction:column;gap:.45rem}',
    '.ndb .nd-goal{border:1px solid var(--border);border-radius:10px;padding:.45rem .65rem .5rem;background:var(--white);min-width:0}',
    '.ndb .nd-goal.sel{border-color:var(--blue);box-shadow:0 0 0 2px var(--sky-light)}',
    '.ndb .nd-goal-head{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}',
    '.ndb .nd-goal-btn{font-weight:600}',
    '.ndb .nd-hyps{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin:.4rem 0 .25rem}',
    '.ndb .nd-k{font-size:.78rem;font-weight:600;color:var(--slate);margin-right:.15rem}',
    '.ndb .nd-hyp{font-family:var(--font-isa,monospace);font-size:.86rem;padding:.12rem .5rem;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--navy);cursor:pointer;max-width:100%;overflow-wrap:anywhere;text-align:left}',
    '.ndb .nd-hyp:hover{border-color:var(--blue)}',
    '.ndb .nd-hyp:focus-visible,.ndb .nd-goal-btn:focus-visible,.ndb .nd-rule:focus-visible{outline:2px solid var(--sky);outline-offset:1px}',
    '.ndb .nd-hyp[aria-pressed="true"]{background:var(--sky-light);border-color:var(--blue);color:var(--blue);font-weight:600}',
    '.ndb .nd-none{font-size:.82rem;color:var(--muted)}',
    '.ndb .nd-show{display:flex;flex-wrap:wrap;gap:.2rem .4rem;align-items:baseline}',
    '.ndb .nd-concl{font-family:var(--font-isa,monospace);font-size:.95rem;font-weight:700;overflow-wrap:anywhere;min-width:0}',
    '.ndb .nd-dead{font-size:.82rem;color:#B91C1C;margin-top:.3rem;overflow-wrap:anywhere}',
    '.ndb .nd-panel{border-top:1px dashed var(--border);margin-top:.8rem;padding-top:.5rem}',
    '.ndb .nd-panel-h{font-weight:600;margin-bottom:.2rem}',
    '.ndb .nd-group{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin:.35rem 0}',
    '.ndb .nd-group-l{flex:1 1 100%;font-size:.78rem;font-weight:600;color:var(--slate)}',
    '.ndb .nd-rule{font-family:var(--font-isa,monospace);min-width:2.8rem;padding:.3rem .5rem}',
    '.ndb .nd-term-l{font-size:.82rem;color:var(--slate);flex:0 1 auto}',
    '.ndb .nd-term{flex:1 1 7rem;max-width:14rem}',
    '.ndb .nd-proof-h{font-weight:600;margin:.8rem 0 .2rem}',
    '.ndb .nd-proof .prooftree{margin:.5rem 0 .7rem}',
    '.ndb .nd-proof .pt-node:not(.pt-leaf){padding-right:2.6rem}',
    '.ndb .nd-proof details{margin:.4rem 0 0}',
    '.ndb .nd-proof summary{cursor:pointer;padding:.4rem .8rem;font-size:.85rem;color:var(--blue)}',
    '.ndb .nd-text{font-family:var(--font-isa,monospace);font-size:.82rem;line-height:1.5;margin:0;padding:.5rem .8rem .7rem;overflow-x:auto;white-space:pre}',
  ].join('\n'))

  // ------------------------------------------------------------------ formulas and terms
  // The AST is api.Logic's: {k:'const',v} {k:'atom',name,args} {k:'eq',l,r} {k:'not',a}
  // {k:'and'|'or'|'imp'|'iff',l,r} {k:'all'|'ex',v,body}; terms {k:'var',name} {k:'fn',name,args}.
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  var BOT = { k: 'const', v: false }
  function sup(n) { return String(n).replace(/\d/g, function (d) { return SUP[+d] }) }
  function clone(x) { return JSON.parse(JSON.stringify(x)) }
  function show(f) { return Logic.show(f).replace(/\bFalse\b/g, '⊥').replace(/¬ \(/g, '¬(') }
  function argStr(u) { return u.k === 'fn' && u.args.length ? '(' + termStr(u) + ')' : termStr(u) }
  function termStr(u) { return u.k === 'var' || !u.args.length ? u.name : u.name + ' ' + u.args.map(argStr).join(' ') }
  function isBot(f) { return f.k === 'const' && f.v === false }

  // Formulas up to the names of bound variables: bound variables become de Bruijn indices.
  function canonT(u, env) {
    if (u.k === 'var') { var i = env.lastIndexOf(u.name); return i >= 0 ? '#' + (env.length - 1 - i) : 'v' + u.name }
    return 'f' + u.name + '(' + u.args.map(function (a) { return canonT(a, env) }).join(',') + ')'
  }
  function canon(f, env) {
    env = env || []
    switch (f.k) {
      case 'const': return f.v ? 'T' : 'F'
      case 'atom': return 'p' + f.name + '(' + f.args.map(function (a) { return canonT(a, env) }).join(',') + ')'
      case 'eq': return '=(' + canonT(f.l, env) + ',' + canonT(f.r, env) + ')'
      case 'not': return '~(' + canon(f.a, env) + ')'
      case 'all': case 'ex': return f.k + '(' + canon(f.body, env.concat([f.v])) + ')'
      default: return f.k + '(' + canon(f.l, env) + ',' + canon(f.r, env) + ')'
    }
  }
  function same(f, g) { return canon(f) === canon(g) }

  function tvars(u, acc) {
    acc = acc || {}
    if (u.k === 'var') acc[u.name] = true
    else u.args.forEach(function (a) { tvars(a, acc) })
    return acc
  }
  function tnames(u, acc) {
    acc = acc || {}
    acc[u.name] = true
    if (u.k === 'fn') u.args.forEach(function (a) { tnames(a, acc) })
    return acc
  }
  function fvs(f) { var acc = {}; Logic.freeVars(f).forEach(function (v) { acc[v] = true }); return acc }
  // Every name in a formula: predicates, functions, free and bound variables.
  function allNames(f, acc) {
    acc = acc || {}
    switch (f.k) {
      case 'const': break
      case 'atom': acc[f.name] = true; f.args.forEach(function (a) { tnames(a, acc) }); break
      case 'eq': tnames(f.l, acc); tnames(f.r, acc); break
      case 'not': allNames(f.a, acc); break
      case 'all': case 'ex': acc[f.v] = true; allNames(f.body, acc); break
      default: allNames(f.l, acc); allNames(f.r, acc)
    }
    return acc
  }
  // Predicate, propositional and function symbols with their arities; bad = a name used in two ways
  // (as a predicate and as a term, or with two different numbers of arguments).
  function symbols(f, acc) {
    acc = acc || { preds: {}, funcs: {}, props: {}, terms: {}, bad: null }
    function setAr(tab, name, n) { if (tab[name] !== undefined && tab[name] !== n) acc.bad = acc.bad || name; tab[name] = n }
    function term(u) {
      acc.terms[u.name] = true
      if (u.k === 'fn') { setAr(acc.funcs, u.name, u.args.length); u.args.forEach(term) }
    }
    ;(function go(f) {
      switch (f.k) {
        case 'const': break
        case 'atom':
          if (f.args.length) setAr(acc.preds, f.name, f.args.length); else acc.props[f.name] = true
          f.args.forEach(term)
          break
        case 'eq': term(f.l); term(f.r); break
        case 'not': go(f.a); break
        case 'all': case 'ex': acc.terms[f.v] = true; go(f.body); break
        default: go(f.l); go(f.r)
      }
    })(f)
    Object.keys(acc.preds).concat(Object.keys(acc.props)).forEach(function (p) {
      if (acc.terms[p] || acc.funcs[p] !== undefined) acc.bad = acc.bad || p
      if (acc.preds[p] !== undefined && acc.props[p]) acc.bad = acc.bad || p
    })
    return acc
  }
  function hasIff(f) {
    if (f.k === 'iff') return true
    return ['a', 'l', 'r', 'body'].some(function (x) { return f[x] && f[x].k && hasIff(f[x]) })
  }

  function freshVar(avoid, base) {
    var b = String(base || 'x').replace(/\d+$/, '') || 'x'
    for (var i = 1; ; i++) if (!avoid[b + i]) return b + i
  }
  function substT(u, x, s) {
    if (u.k === 'var') return u.name === x ? clone(s) : u
    return { k: 'fn', name: u.name, args: u.args.map(function (a) { return substT(a, x, s) }) }
  }
  // f with s for the free occurrences of the variable x, renaming bound variables to avoid capture.
  function subst(f, x, s) {
    switch (f.k) {
      case 'const': return f
      case 'atom': return { k: 'atom', name: f.name, args: f.args.map(function (a) { return substT(a, x, s) }) }
      case 'eq': return { k: 'eq', l: substT(f.l, x, s), r: substT(f.r, x, s) }
      case 'not': return { k: 'not', a: subst(f.a, x, s) }
      case 'all': case 'ex': {
        if (f.v === x || !fvs(f.body)[x]) return f
        var sv = tvars(s)
        if (sv[f.v]) {
          var avoid = allNames(f.body); Object.keys(sv).forEach(function (v) { avoid[v] = true }); avoid[x] = true
          var nv = freshVar(avoid, f.v)
          return { k: f.k, v: nv, body: subst(subst(f.body, f.v, { k: 'var', name: nv }), x, s) }
        }
        return { k: f.k, v: f.v, body: subst(f.body, x, s) }
      }
      default: return { k: f.k, l: subst(f.l, x, s), r: subst(f.r, x, s) }
    }
  }
  // f with s for the free occurrences of the term tt (for =E); n counts the replacements.
  function replaceTerm(f, tt, s) {
    var n = 0, key = canonT(tt, []), sv = tvars(s), tv = tvars(tt)
    function rt(u, bound) {
      if (canonT(u, []) === key && !Object.keys(tvars(u)).some(function (v) { return bound.indexOf(v) >= 0 })) { n++; return clone(s) }
      if (u.k === 'var') return u
      return { k: 'fn', name: u.name, args: u.args.map(function (a) { return rt(a, bound) }) }
    }
    function go(f, bound) {
      switch (f.k) {
        case 'const': return f
        case 'atom': return { k: 'atom', name: f.name, args: f.args.map(function (a) { return rt(a, bound) }) }
        case 'eq': return { k: 'eq', l: rt(f.l, bound), r: rt(f.r, bound) }
        case 'not': return { k: 'not', a: go(f.a, bound) }
        case 'all': case 'ex': {
          var v = f.v, body = f.body
          if (sv[v]) {
            var avoid = allNames(body)
            Object.keys(sv).concat(Object.keys(tv)).forEach(function (x) { avoid[x] = true })
            var nv = freshVar(avoid, v)
            body = subst(body, v, { k: 'var', name: nv }); v = nv
          }
          return { k: f.k, v: v, body: go(body, bound.concat([v])) }
        }
        default: return { k: f.k, l: go(f.l, bound), r: go(f.r, bound) }
      }
    }
    var r = go(f, [])
    return { f: r, n: n }
  }

  // ------------------------------------------------------------------ dead ends
  // A goal is unprovable if some valuation, or some structure with one or two elements, makes all its
  // assumptions true and the goal false (soundness). Small searches only; no claim otherwise.
  var LIMIT = 4096
  function tuples(n, ar) {
    var out = [], total = Math.pow(n, ar)
    for (var j = 0; j < total; j++) {
      var tup = [], x = j
      for (var i = 0; i < ar; i++) { tup.unshift(x % n); x = Math.floor(x / n) }
      out.push(tup)
    }
    return out
  }
  function build(n, dims, idx) {
    var M = { domain: [], consts: {}, preds: {}, funcs: {}, props: {} }
    for (var d = 0; d < n; d++) M.domain.push(d)
    dims.forEach(function (dm) {
      var digit = idx % dm.radix
      idx = Math.floor(idx / dm.radix)
      if (dm.kind === 'p') M.preds[dm.name] = tuples(n, dm.ar).filter(function (tp, j) { return Math.floor(digit / Math.pow(2, j)) % 2 === 1 })
      else if (dm.kind === 'f') {
        var tab = {}
        tuples(n, dm.ar).forEach(function (tp, j) { tab[tp.join(',')] = Math.floor(digit / Math.pow(n, j)) % n })
        M.funcs[dm.name] = tab
      } else if (dm.kind === 'c') M.consts[dm.name] = digit
      else M.props[dm.name] = digit === 1
    })
    return M
  }
  function quantOrEq(f) {
    if (f.k === 'all' || f.k === 'ex' || f.k === 'eq') return true
    return ['a', 'l', 'r'].some(function (x) { return f[x] && quantOrEq(f[x]) })
  }
  function describe(M, fo, dims, hasHyps) {
    var parts = dims.map(function (d) {
      if (d.kind === 'b') return d.name + ' = ' + (M.props[d.name] ? 'T' : 'F')
      if (d.kind === 'c') return d.name + ' = ' + M.consts[d.name]
      if (d.kind === 'p') {
        var r = M.preds[d.name]
        return d.name + ' = ' + (r.length ? '{' + r.map(function (tp) { return tp.length === 1 ? String(tp[0]) : '(' + tp.join(', ') + ')' }).join(', ') + '}' : '∅')
      }
      var tab = M.funcs[d.name]
      return d.name + ' = {' + Object.keys(tab).map(function (k) { return (k.indexOf(',') >= 0 ? '(' + k.split(',').join(', ') + ')' : k) + ' ↦ ' + tab[k] }).join(', ') + '}'
    })
    var what = hasHyps ? t('the assumptions are true and the goal is false', '假设都为真而目标为假') : t('the goal is false', '目标为假')
    if (fo) {
      var dom = '{' + M.domain.join(', ') + '}'
      return t('Dead end: in the structure with domain ' + dom + (parts.length ? ', ' + parts.join(', ') : '') + ', ' + what + '. By soundness no rule can prove it.',
        '死路：在论域为 ' + dom + (parts.length ? '、' + parts.join('、') : '') + ' 的结构中，' + what + '。由可靠性，任何规则都证不出它。')
    }
    return t('Dead end: ' + (parts.length ? 'with ' + parts.join(', ') + ', ' : '') + what + '. By soundness no rule can prove it.',
      '死路：' + (parts.length ? '当 ' + parts.join('、') + ' 时，' : '') + what + '。由可靠性，任何规则都证不出它。')
  }
  function findCounter(hyps, goal) {
    var fs = hyps.concat([goal]), sym = { preds: {}, funcs: {}, props: {}, terms: {}, bad: null }, consts = {}
    fs.forEach(function (f) { symbols(f, sym); Logic.freeVars(f).forEach(function (v) { consts[v] = true }) })
    if (sym.bad) return null
    var preds = Object.keys(sym.preds), funcs = Object.keys(sym.funcs), props = Object.keys(sym.props), cs = Object.keys(consts)
    if (funcs.some(function (f) { return sym.funcs[f] === 0 })) return null        // numerals: no claim
    var fo = !!(preds.length || funcs.length || cs.length || fs.some(quantOrEq))
    var sizes = fo ? [1, 2] : [1]
    for (var si = 0; si < sizes.length; si++) {
      var n = sizes[si], dims = []
      preds.forEach(function (p) { dims.push({ kind: 'p', name: p, ar: sym.preds[p], radix: Math.pow(2, Math.pow(n, sym.preds[p])) }) })
      funcs.forEach(function (f) { dims.push({ kind: 'f', name: f, ar: sym.funcs[f], radix: Math.pow(n, Math.pow(n, sym.funcs[f])) }) })
      cs.forEach(function (c) { dims.push({ kind: 'c', name: c, radix: n }) })
      props.forEach(function (p) { dims.push({ kind: 'b', name: p, radix: 2 }) })
      var total = dims.reduce(function (a, d) { return a * d.radix }, 1)
      if (total > LIMIT) continue
      for (var idx = 0; idx < total; idx++) {
        var M = build(n, dims, idx)
        if (hyps.every(function (f) { return Logic.holds(f, M, {}) }) && !Logic.holds(goal, M, {})) return describe(M, fo, dims, hyps.length > 0)
      }
    }
    return null
  }
  var deadCache = {}
  function deadEnd(N, g) {
    var hyps = g.ctx.map(function (id) { return N.hyps[id].f })
    var key = hyps.map(function (f) { return canon(f) }).join('|') + '⊢' + canon(g.goal)
    if (!(key in deadCache)) {
      var r = null
      try { r = findCounter(hyps, g.goal) } catch (e) { r = null }
      deadCache[key] = r
    }
    return deadCache[key]
  }

  // ------------------------------------------------------------------ messages
  function Refusal(message) { this.message = message }
  function need(ok, msg) { if (!ok) throw new Refusal(msg) }
  function errText(m) {
    m = String(m || '')
    if (api.lang !== 'zh') return m
    var r
    if ((r = m.match(/^cannot read "(.*)"$/))) return '无法识别 "' + r[1] + '"'
    if ((r = m.match(/^expected a term before (.+)$/))) return '在 ' + r[1] + ' 之前应为一个项'
    if (m === 'expected a term at the end') return '结尾处缺少一个项'
    if ((r = m.match(/^expected a variable after (.+)$/))) return r[1] + ' 之后应为变量'
    if ((r = m.match(/^expected (.+) before (.+)$/))) return '在 ' + r[2] + ' 之前应为 ' + r[1]
    if ((r = m.match(/^expected (.+) at the end$/))) return '结尾处缺少 ' + r[1]
    if (m === 'unexpected end of formula') return '公式意外结束'
    if ((r = m.match(/^unexpected (.+)$/))) return '意外的 ' + r[1]
    if (m === 'empty formula') return '公式为空'
    if (m === 'a number is not a formula') return '数字不是公式'
    return m
  }
  function kindName(k) {
    return {
      and: t('a conjunction A ∧ B', '合取 A ∧ B'), or: t('a disjunction A ∨ B', '析取 A ∨ B'),
      imp: t('an implication A ⟶ B', '蕴涵 A ⟶ B'), not: t('a negation ¬A', '否定 ¬A'),
      all: t('a universal statement ∀x. P x', '全称命题 ∀x. P x'), ex: t('an existential statement ∃x. P x', '存在命题 ∃x. P x'),
      eq: t('an equation s = t', '等式 s = t'), iff: t('an equivalence', '等价式'), const: t('a constant', '常量'),
      atom: t('an atomic formula', '原子公式'),
    }[k] || k
  }
  function describeF(f) { return isBot(f) ? '⊥' : kindName(f.k) }
  function introHint(f) {
    if (isBot(f)) return t(' To prove ⊥, select a negated assumption ¬A and use ¬E.', '要证明 ⊥，请选中一个否定形式的假设 ¬A 并使用 ¬E。')
    var r = { and: '∧I', or: '∨I₁ / ∨I₂', imp: '⟶I', not: '¬I', all: '∀I', ex: '∃I', eq: '=I / =E' }[f.k]
    return r ? t(' Try ' + r + '.', '试试 ' + r + '。')
      : t(' No introduction rule proves it: use an assumption, an elimination rule, ⊥E or RAA.', '没有引入规则能证明它：请用假设、消去规则、⊥E 或 RAA。')
  }

  // ------------------------------------------------------------------ proof state
  // nodes: goals {id, ctx: [hyp ids], goal, step}; hyps: {id, f, src} where src is
  // {k:'hyp', label} (a discharged assumption) or {k:'rule', rule, from: [{h}|{n}]} (derived from
  // other assumptions and goals). Steps: {kind:'assumption', h} | {kind:'intro', rule, label?, kids}
  // | {kind:'elim', rule, label?, h, kids} | {kind:'ctx', kids} (adds assumptions; the proof goes on
  // in the last kid).
  var S = null, goalF = null, history = []
  function newState(f) {
    return { nodes: { n0: { id: 'n0', ctx: [], goal: f, step: null } }, hyps: {}, root: 'n0', next: 1, label: 0, sel: 'n0', selHyp: null }
  }
  function addNode(N, ctx, goal) { var id = 'n' + N.next++; N.nodes[id] = { id: id, ctx: ctx.slice(), goal: goal, step: null }; return id }
  function addHyp(N, f, src) { var id = 'h' + N.next++; N.hyps[id] = { id: id, f: f, src: src }; return id }
  function openGoals(N) {
    var out = []
    ;(function go(id) {
      var nd = N.nodes[id]
      if (!nd.step) { out.push(id); return }
      ;(nd.step.kids || []).forEach(go)
    })(N.root)
    return out
  }
  function ctxF(N, g) { return g.ctx.map(function (id) { return N.hyps[id].f }) }
  function inCtx(N, g, f) { return g.ctx.some(function (id) { return same(N.hyps[id].f, f) }) }

  // ------------------------------------------------------------------ terms and names typed by the reader
  function parseTerm(src) {
    var f
    try { f = Logic.parse('__T(' + src + ')') } catch (e) { throw new Refusal(t('Cannot read the term: ', '无法读取这个项：') + errText(e.message)) }
    need(f.k === 'atom' && f.name === '__T' && f.args.length === 1, t('Type one term, such as a or f a.', '请输入一个项，例如 a 或 f a。'))
    return f.args[0]
  }
  function contextSymbols(N, g) {
    var sym = { preds: {}, funcs: {}, props: {}, terms: {}, bad: null }
    ctxF(N, g).concat([g.goal]).forEach(function (f) { symbols(f, sym) })
    return sym
  }
  function readTerm(N, g, rule) {
    var src = termIn.value.trim()
    need(src, t('(' + rule + ') needs a term: type one in the box, for example a.', '(' + rule + ') 需要一个项：请在输入框中输入，例如 a。'))
    var u = parseTerm(src), sym = contextSymbols(N, g)
    var bad = Object.keys(tnames(u)).filter(function (n) { return sym.preds[n] !== undefined || sym.props[n] })
    need(!bad.length, t(bad[0] + ' is a predicate here, not a term.', bad[0] + ' 在这里是谓词，不是项。'))
    var arity = null
    ;(function chk(v) { if (v.k === 'fn') { if (sym.funcs[v.name] !== undefined && sym.funcs[v.name] !== v.args.length) arity = arity || v.name; v.args.forEach(chk) } })(u)
    need(!arity, t(arity + ' takes ' + sym.funcs[arity] + ' argument(s) here.', arity + ' 在这里接受 ' + sym.funcs[arity] + ' 个参数。'))
    return u
  }
  var NAMES = 'abcdeuvwkmnpqrst'.split('')
  function readName(N, g, rule) {
    var src = termIn.value.trim(), fs = ctxF(N, g).concat([g.goal])
    if (!src) {
      var used = {}
      fs.forEach(function (f) { allNames(f, used) })
      for (var i = 0; i < NAMES.length; i++) if (!used[NAMES[i]]) return NAMES[i]
      return freshVar(used, 'a')
    }
    var u = parseTerm(src)
    need(u.k === 'var', t('(' + rule + ') needs a single new name, such as a.', '(' + rule + ') 需要一个新的名字，例如 a。'))
    var name = u.name, sym = contextSymbols(N, g)
    need(sym.preds[name] === undefined && !sym.props[name] && sym.funcs[name] === undefined,
      t(name + ' is already a predicate or function name here; choose another name.', name + ' 在这里已是谓词或函数名，请换一个名字。'))
    var holder = fs.filter(function (f) { return fvs(f)[name] })[0]
    if (holder) {
      throw new Refusal(t(name + ' is not fresh: it occurs free in ' + show(holder) + '. (' + rule + ') needs a name that occurs in no assumption and not in the goal.',
        name + ' 不是新名字：它在 ' + show(holder) + ' 中自由出现。(' + rule + ') 需要一个不出现在任何假设和目标中的名字。'))
    }
    return name
  }

  // ------------------------------------------------------------------ the rules
  function introShape(g, k, rule) {
    need(g.goal.k === k, t('(' + rule + ') proves ' + kindName(k) + ', but this goal is ' + describeF(g.goal) + '.', '(' + rule + ') 用来证明' + kindName(k) + '，但这个目标是' + describeF(g.goal) + '。') + introHint(g.goal))
  }
  function selHyp(N, g, k, rule) {
    var id = N.selHyp
    need(id && g.ctx.indexOf(id) >= 0, t('(' + rule + ') works on an assumption: first select one of this goal\'s assumptions (click it).', '(' + rule + ') 作用于假设：请先选中这个目标的一个假设（点击它）。'))
    var hy = N.hyps[id]
    if (k === 'imp' && hy.f.k === 'not') throw new Refusal(t(show(hy.f) + ' is a negation: use ¬E.', show(hy.f) + ' 是否定式：请用 ¬E。'))
    need(hy.f.k === k, t('(' + rule + ') uses ' + kindName(k) + ', but the selected assumption ' + show(hy.f) + ' is ' + describeF(hy.f) + '.', '(' + rule + ') 使用' + kindName(k) + '，但选中的假设 ' + show(hy.f) + ' 是' + describeF(hy.f) + '。'))
    return hy
  }
  function addDerived(N, g, f, rule, from) {
    need(!inCtx(N, g, f), t(show(f) + ' is already an assumption of this goal.', show(f) + ' 已经是这个目标的假设。'))
    var nh = addHyp(N, f, { k: 'rule', rule: rule, from: from })
    var a = addNode(N, g.ctx.concat([nh]), g.goal)
    g.step = { kind: 'ctx', kids: [a] }
    return t('(' + rule + '): ' + show(f) + ' is now an assumption.', '(' + rule + ')：' + show(f) + ' 现在是假设。')
  }

  var RULES = {
    assumption: function (N, g) {
      var ids = g.ctx.filter(function (id) { return same(N.hyps[id].f, g.goal) })
      need(ids.length, t('The goal ' + show(g.goal) + ' is not among its assumptions.', '目标 ' + show(g.goal) + ' 不在它的假设之中。'))
      g.step = { kind: 'assumption', h: ids[ids.length - 1] }
      return t('Closed: the goal is one of its assumptions.', '已关闭：目标就是它的一个假设。')
    },
    eqI: function (N, g) {
      need(g.goal.k === 'eq' && canonT(g.goal.l, []) === canonT(g.goal.r, []), t('(=I) proves only t = t, with the same term on both sides.', '(=I) 只能证明两边是同一个项的 t = t。'))
      g.step = { kind: 'intro', rule: '=I', kids: [] }
      return t('(=I): t = t holds with no premises.', '(=I)：t = t 不需要前提。')
    },
    andI: function (N, g) {
      introShape(g, 'and', '∧I')
      var a = addNode(N, g.ctx, g.goal.l), b = addNode(N, g.ctx, g.goal.r)
      g.step = { kind: 'intro', rule: '∧I', kids: [a, b] }
      return t('(∧I): two goals, one for each side.', '(∧I)：两个目标，两边各一个。')
    },
    orI1: function (N, g) {
      introShape(g, 'or', '∨I₁')
      g.step = { kind: 'intro', rule: '∨I₁', kids: [addNode(N, g.ctx, g.goal.l)] }
      return t('(∨I₁): prove the left side. This rule is not safe: if the new goal is a dead end, undo.', '(∨I₁)：证明左边。这条规则不安全：如果新目标是死路，请撤销。')
    },
    orI2: function (N, g) {
      introShape(g, 'or', '∨I₂')
      g.step = { kind: 'intro', rule: '∨I₂', kids: [addNode(N, g.ctx, g.goal.r)] }
      return t('(∨I₂): prove the right side. This rule is not safe: if the new goal is a dead end, undo.', '(∨I₂)：证明右边。这条规则不安全：如果新目标是死路，请撤销。')
    },
    impI: function (N, g) {
      introShape(g, 'imp', '⟶I')
      var n = ++N.label, hid = addHyp(N, g.goal.l, { k: 'hyp', label: n })
      g.step = { kind: 'intro', rule: '⟶I', label: n, kids: [addNode(N, g.ctx.concat([hid]), g.goal.r)] }
      return t('(⟶I' + sup(n) + '): ' + show(g.goal.l) + ' is now an assumption, marked ' + n + '.', '(⟶I' + sup(n) + ')：' + show(g.goal.l) + ' 现在是假设，标号 ' + n + '。')
    },
    notI: function (N, g) {
      introShape(g, 'not', '¬I')
      var n = ++N.label, hid = addHyp(N, g.goal.a, { k: 'hyp', label: n })
      g.step = { kind: 'intro', rule: '¬I', label: n, kids: [addNode(N, g.ctx.concat([hid]), BOT)] }
      return t('(¬I' + sup(n) + '): assume ' + show(g.goal.a) + ' and prove ⊥.', '(¬I' + sup(n) + ')：假设 ' + show(g.goal.a) + '，证明 ⊥。')
    },
    allI: function (N, g) {
      introShape(g, 'all', '∀I')
      var name = readName(N, g, '∀I')
      g.step = { kind: 'intro', rule: '∀I', kids: [addNode(N, g.ctx, subst(g.goal.body, g.goal.v, { k: 'var', name: name }))] }
      return t('(∀I): ' + name + ' is a new name, so it stands for an arbitrary element.', '(∀I)：' + name + ' 是新名字，所以它代表任意一个元素。')
    },
    exI: function (N, g) {
      introShape(g, 'ex', '∃I')
      var u = readTerm(N, g, '∃I')
      g.step = { kind: 'intro', rule: '∃I', kids: [addNode(N, g.ctx, subst(g.goal.body, g.goal.v, u))] }
      return t('(∃I): the witness is ' + termStr(u) + '. This rule is not safe: a wrong witness is a dead end.', '(∃I)：见证是 ' + termStr(u) + '。这条规则不安全：选错见证就是死路。')
    },
    andE1: function (N, g) { var hy = selHyp(N, g, 'and', '∧E₁'); return addDerived(N, g, hy.f.l, '∧E₁', [{ h: hy.id }]) },
    andE2: function (N, g) { var hy = selHyp(N, g, 'and', '∧E₂'); return addDerived(N, g, hy.f.r, '∧E₂', [{ h: hy.id }]) },
    orE: function (N, g) {
      var hy = selHyp(N, g, 'or', '∨E'), n = ++N.label
      var h1 = addHyp(N, hy.f.l, { k: 'hyp', label: n }), h2 = addHyp(N, hy.f.r, { k: 'hyp', label: n })
      g.step = { kind: 'elim', rule: '∨E', label: n, h: hy.id, kids: [addNode(N, g.ctx.concat([h1]), g.goal), addNode(N, g.ctx.concat([h2]), g.goal)] }
      return t('(∨E' + sup(n) + '): two cases, one assuming ' + show(hy.f.l) + ', one assuming ' + show(hy.f.r) + '.', '(∨E' + sup(n) + ')：两种情形，一个假设 ' + show(hy.f.l) + '，一个假设 ' + show(hy.f.r) + '。')
    },
    impE: function (N, g) {
      var hy = selHyp(N, g, 'imp', '⟶E'), A = hy.f.l, B = hy.f.r
      if (same(g.goal, B)) {
        g.step = { kind: 'elim', rule: '⟶E', h: hy.id, kids: [addNode(N, g.ctx, A)] }
        return t('(⟶E): the goal is what ' + show(hy.f) + ' concludes, so it is enough to prove ' + show(A) + '.', '(⟶E)：目标正是 ' + show(hy.f) + ' 的结论，所以只需证明 ' + show(A) + '。')
      }
      need(!inCtx(N, g, B), t(show(B) + ' is already an assumption of this goal.', show(B) + ' 已经是这个目标的假设。'))
      var a = addNode(N, g.ctx, A)
      var nh = addHyp(N, B, { k: 'rule', rule: '⟶E', from: [{ h: hy.id }, { n: a }] })
      g.step = { kind: 'ctx', kids: [a, addNode(N, g.ctx.concat([nh]), g.goal)] }
      return t('(⟶E): first prove ' + show(A) + '; then ' + show(B) + ' is an assumption of the goal.', '(⟶E)：先证明 ' + show(A) + '；然后 ' + show(B) + ' 成为原目标的假设。')
    },
    notE: function (N, g) {
      var hy = selHyp(N, g, 'not', '¬E')
      need(isBot(g.goal), t('(¬E) proves ⊥, but the goal is ' + show(g.goal) + '. Use ⊥E or RAA first, to make ⊥ the goal.', '(¬E) 证明的是 ⊥，但目标是 ' + show(g.goal) + '。请先用 ⊥E 或 RAA 把目标变成 ⊥。'))
      g.step = { kind: 'elim', rule: '¬E', h: hy.id, kids: [addNode(N, g.ctx, hy.f.a)] }
      return t('(¬E): ' + show(hy.f) + ' and ' + show(hy.f.a) + ' together give ⊥; prove ' + show(hy.f.a) + '.', '(¬E)：' + show(hy.f) + ' 与 ' + show(hy.f.a) + ' 合起来得到 ⊥；请证明 ' + show(hy.f.a) + '。')
    },
    allE: function (N, g) {
      var hy = selHyp(N, g, 'all', '∀E'), u = readTerm(N, g, '∀E')
      return addDerived(N, g, subst(hy.f.body, hy.f.v, u), '∀E', [{ h: hy.id }])
    },
    exE: function (N, g) {
      var hy = selHyp(N, g, 'ex', '∃E'), name = readName(N, g, '∃E'), n = ++N.label
      var inst = subst(hy.f.body, hy.f.v, { k: 'var', name: name })
      g.step = { kind: 'elim', rule: '∃E', label: n, h: hy.id, kids: [addNode(N, g.ctx.concat([addHyp(N, inst, { k: 'hyp', label: n })]), g.goal)] }
      return t('(∃E' + sup(n) + '): call the witness ' + name + '; ' + show(inst) + ' is now an assumption.', '(∃E' + sup(n) + ')：把见证叫作 ' + name + '；' + show(inst) + ' 现在是假设。')
    },
    eqE: function (N, g) {
      var hy = selHyp(N, g, 'eq', '=E'), s = hy.f.l, tt = hy.f.r
      var r = replaceTerm(g.goal, tt, s)
      need(r.n > 0, t('(=E) with ' + show(hy.f) + ' turns ' + termStr(tt) + ' into ' + termStr(s) + ', but the goal contains no ' + termStr(tt) + '.', '用 ' + show(hy.f) + ' 做 (=E) 会把 ' + termStr(tt) + ' 换成 ' + termStr(s) + '，但目标中没有 ' + termStr(tt) + '。'))
      need(!same(r.f, g.goal), t('(=E) would not change the goal.', '(=E) 不会改变这个目标。'))
      g.step = { kind: 'elim', rule: '=E', h: hy.id, kids: [addNode(N, g.ctx, r.f)] }
      return t('(=E): with ' + show(hy.f) + ', it is enough to prove the goal with ' + termStr(s) + ' in place of ' + termStr(tt) + '.', '(=E)：有了 ' + show(hy.f) + '，只需证明把 ' + termStr(tt) + ' 换成 ' + termStr(s) + ' 后的目标。')
    },
    botE: function (N, g) {
      need(!isBot(g.goal), t('The goal is already ⊥.', '目标已经是 ⊥。'))
      g.step = { kind: 'intro', rule: '⊥E', kids: [addNode(N, g.ctx, BOT)] }
      return t('(⊥E): anything follows from ⊥, so prove ⊥.', '(⊥E)：由 ⊥ 可推出任何公式，所以改为证明 ⊥。')
    },
    raa: function (N, g) {
      need(!isBot(g.goal), t('The goal is already ⊥: RAA would only add the assumption ¬⊥.', '目标已经是 ⊥：RAA 只会多出假设 ¬⊥。'))
      var neg = { k: 'not', a: g.goal }, n = ++N.label
      g.step = { kind: 'intro', rule: 'RAA', label: n, kids: [addNode(N, g.ctx.concat([addHyp(N, neg, { k: 'hyp', label: n })]), BOT)] }
      return t('(RAA' + sup(n) + '): assume ' + show(neg) + ' and prove ⊥.', '(RAA' + sup(n) + ')：假设 ' + show(neg) + '，证明 ⊥。')
    },
  }

  var GROUPS = [
    { label: t('Close the goal', '关闭目标'), rules: [
      ['assumption', t('assumption', '用假设'), t('The goal is one of its assumptions', '目标就在它的假设之中')],
      ['eqI', '=I', t('t = t, with the same term on both sides', '两边是同一个项的 t = t')]] },
    { label: t('Introduction rules, on the goal', '引入规则，作用于目标'), rules: [
      ['andI', '∧I', t('To prove A ∧ B, prove A and prove B', '要证 A ∧ B，分别证 A 和 B')],
      ['orI1', '∨I₁', t('To prove A ∨ B, prove A', '要证 A ∨ B，证 A')],
      ['orI2', '∨I₂', t('To prove A ∨ B, prove B', '要证 A ∨ B，证 B')],
      ['impI', '⟶I', t('To prove A ⟶ B, assume A and prove B', '要证 A ⟶ B，假设 A 并证 B')],
      ['notI', '¬I', t('To prove ¬A, assume A and prove ⊥', '要证 ¬A，假设 A 并证 ⊥')],
      ['allI', '∀I', t('To prove ∀x. P x, prove P a for a new name a', '要证 ∀x. P x，对新名字 a 证 P a')],
      ['exI', '∃I', t('To prove ∃x. P x, prove P t for the term t in the box', '要证 ∃x. P x，对输入框中的项 t 证 P t')]] },
    { label: t('Elimination rules, on the selected assumption', '消去规则，作用于选中的假设'), rules: [
      ['andE1', '∧E₁', t('From A ∧ B, add A', '由 A ∧ B 加入 A')],
      ['andE2', '∧E₂', t('From A ∧ B, add B', '由 A ∧ B 加入 B')],
      ['orE', '∨E', t('From A ∨ B, prove the goal twice: assuming A, and assuming B', '由 A ∨ B 分两种情形证明目标：假设 A，以及假设 B')],
      ['impE', '⟶E', t('From A ⟶ B: if the goal is B, prove A; otherwise prove A, then use B', '由 A ⟶ B：若目标是 B，就证 A；否则先证 A，再使用 B')],
      ['notE', '¬E', t('From ¬A, prove the goal ⊥ by proving A', '由 ¬A，通过证 A 来证目标 ⊥')],
      ['allE', '∀E', t('From ∀x. P x, add P t for the term t in the box', '由 ∀x. P x 加入 P t（t 为输入框中的项）')],
      ['exE', '∃E', t('From ∃x. P x, add P a for a new name a', '由 ∃x. P x 加入 P a（a 为新名字）')],
      ['eqE', '=E', t('From s = t, replace t by s in the goal', '由 s = t，把目标中的 t 换成 s')]] },
    { label: t('Falsity and proof by contradiction', '矛盾与反证'), rules: [
      ['botE', '⊥E', t('Prove any goal by proving ⊥', '通过证明 ⊥ 来证明任何目标')],
      ['raa', 'RAA', t('Assume the negation of the goal and prove ⊥ (classical)', '假设目标的否定并证明 ⊥（经典逻辑）')]] },
  ]

  // ------------------------------------------------------------------ rendering a finished proof
  function deriv(N, hid) {
    var hy = N.hyps[hid]
    if (hy.src.k === 'hyp') return { f: '[' + show(hy.f) + ']' + sup(hy.src.label), rule: '', kids: [] }
    return { f: show(hy.f), rule: '(' + hy.src.rule + ')', kids: hy.src.from.map(function (r) { return r.h ? deriv(N, r.h) : tree(N, r.n) }) }
  }
  function tree(N, nid) {
    var nd = N.nodes[nid], s = nd.step, F = show(nd.goal)
    if (!s) return { f: F, rule: '?', kids: [] }
    var kids = s.kids || [], R = '(' + s.rule + (s.label ? sup(s.label) : '') + ')'
    switch (s.kind) {
      case 'assumption': return deriv(N, s.h)
      case 'ctx': return tree(N, kids[kids.length - 1])
      case 'elim': return { f: F, rule: R, kids: [deriv(N, s.h)].concat(kids.map(function (k) { return tree(N, k) })) }
      default: return { f: F, rule: R, kids: kids.map(function (k) { return tree(N, k) }) }
    }
  }
  function treeEl(node) {
    var f = h('span', { class: 'pt-f', text: node.f })
    if (!node.kids.length && !node.rule) return h('div', { class: 'pt-node pt-leaf' }, f)
    var prem = node.kids.length ? h('div', { class: 'pt-prem' }, node.kids.map(treeEl)) : h('div', { class: 'pt-prem pt-axiom' })
    // like the page's trees: the rule name without its brackets beside the line
    return h('div', { class: 'pt-node' }, prem, h('div', { class: 'pt-bar' }, h('span', { class: 'pt-rule', text: node.rule.replace(/^\((.*)\)$/, '$1') })), h('div', { class: 'pt-concl' }, f))
  }
  function treeText(node, ind, out) {
    out.push(new Array(ind + 1).join(' ') + node.f + (node.rule ? '   ' + node.rule : ''))
    node.kids.forEach(function (k) { treeText(k, ind + 2, out) })
    return out
  }

  // ------------------------------------------------------------------ the widget's elements
  var presetIn = h('select', { class: 'fmw-input nd-preset', id: 'nd-preset-' + Math.random().toString(36).slice(2, 8) })
  var formulaIn = h('input', { class: 'fmw-input nd-input', type: 'text', spellcheck: 'false', autocomplete: 'off', 'aria-label': t('Goal formula', '目标公式'), placeholder: t('or type a formula, e.g. A ∧ B ⟶ A', '或输入公式，例如 A ∧ B ⟶ A') })
  var startBtn = h('button', { class: 'fmw-btn nd-start', type: 'button', text: t('Prove this', '证明它') })
  var statusBox = h('div', { class: 'nd-status', 'aria-live': 'polite' })
  var goalsBox = h('div', { class: 'nd-goals' })
  var termIn = h('input', { class: 'fmw-input nd-term', type: 'text', spellcheck: 'false', autocomplete: 'off', placeholder: 'a', 'aria-label': t('Term or name for ∀I, ∃I, ∀E and ∃E', '用于 ∀I、∃I、∀E、∃E 的项或名字') })
  var panelH = h('div', { class: 'nd-panel-h' })
  var msgBox = h('div', { class: 'fmw-msg nd-msg', role: 'status', 'aria-live': 'polite' })
  var undoBtn = h('button', { class: 'fmw-btn nd-undo', type: 'button', text: t('Undo', '撤销') })
  var resetBtn = h('button', { class: 'fmw-btn nd-reset', type: 'button', text: t('Reset', '重来') })
  var proofBox = h('div', { class: 'nd-proof' })

  var PRESETS = [
    'A ∧ B ⟶ B ∧ A', '(A ⟶ B) ⟶ (B ⟶ C) ⟶ A ⟶ C', 'A ∨ B ⟶ B ∨ A', '¬(A ∨ B) ⟶ ¬A ∧ ¬B',
    '¬A ∧ ¬B ⟶ ¬(A ∨ B)', '¬(A ∧ B) ⟶ ¬A ∨ ¬B', '¬¬A ⟶ A', 'A ∨ ¬A',
    '(∀x. P x ∧ Q x) ⟶ (∀x. P x) ∧ (∀x. Q x)', '(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)',
    '(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)', 's = t ⟶ t = s',
  ]
  PRESETS.forEach(function (p, i) {
    var label = p
    try { label = show(Logic.parse(p)) } catch (e) { /* keep the source */ }
    if (i === 10) label += t('   (not provable)', '   （不可证）')
    presetIn.appendChild(h('option', { value: String(i), text: label }))
  })

  var ruleButtons = []
  var panel = h('div', { class: 'nd-panel' }, panelH,
    h('div', { class: 'nd-group' }, h('label', { class: 'nd-term-l', for: '' }, t('Term or name (for ∀I, ∃I, ∀E, ∃E):', '项或名字（用于 ∀I、∃I、∀E、∃E）：')), termIn),
    GROUPS.map(function (gr) {
      return h('div', { class: 'nd-group', role: 'group', 'aria-label': gr.label },
        h('span', { class: 'nd-group-l', text: gr.label }),
        gr.rules.map(function (r) {
          var b = h('button', { class: 'fmw-btn nd-rule', type: 'button', 'data-rule': r[0], title: r[2], 'aria-label': r[1] + ': ' + r[2], text: r[1] })
          b.addEventListener('click', safe(function () { applyRule(r[0]) }))
          ruleButtons.push(b)
          return b
        }))
    }))
  // label the term box properly (an id keeps the label and the input together)
  termIn.id = presetIn.id + '-term'
  panel.querySelector('.nd-term-l').setAttribute('for', termIn.id)

  root.appendChild(h('div', { class: 'fmw ndb' },
    h('div', { class: 'fmw-row' }, h('label', { class: 'nd-k', for: presetIn.id, text: t('Goal', '目标') }), presetIn),
    h('div', { class: 'fmw-row' }, formulaIn, startBtn),
    h('div', { class: 'fmw-msg nd-help' }, t('Select a goal, then a rule. Elimination rules act on the assumption you select. ASCII works too: ', '先选一个目标，再选一条规则。消去规则作用于你选中的假设。也可以输入 ASCII：'),
      h('span', { class: 'fmw-isa', text: '& | --> ~ ALL EX False' }), t(' (False is ⊥).', '（False 即 ⊥）。')),
    statusBox, goalsBox, panel, msgBox,
    h('div', { class: 'fmw-row' }, undoBtn, resetBtn),
    proofBox))

  // ------------------------------------------------------------------ behaviour
  function safe(fn) {
    return function (e) {
      try { fn(e) } catch (err) { say(t('Something went wrong: ', '出错了：') + (err && err.message ? err.message : String(err)), 'bad') }
    }
  }
  function say(msg, kind) {
    msgBox.textContent = msg || ''
    msgBox.className = 'fmw-msg nd-msg' + (kind === 'ok' ? ' fmw-ok' : kind === 'bad' ? ' fmw-bad' : '')
  }
  function parseGoal(src) {
    var s = String(src || '').replace(/⊥/g, 'False').replace(/⊤/g, 'True').trim()
    need(s, t('Type a formula first.', '请先输入一个公式。'))
    var f
    try { f = Logic.parse(s) } catch (e) { throw new Refusal(t('Cannot read the formula: ', '无法读取公式：') + errText(e.message)) }
    need(!hasIff(f), t('This builder has no rules for ⟷. Write (A ⟶ B) ∧ (B ⟶ A) instead.', '本工具没有 ⟷ 的规则，请改写为 (A ⟶ B) ∧ (B ⟶ A)。'))
    var sym = symbols(f)
    need(!sym.bad, t(sym.bad + ' is used in two ways (as a predicate and as a term, or with different numbers of arguments). Rename one of them.', sym.bad + ' 有两种用法（既作谓词又作项，或参数个数不同）。请给其中一个改名。'))
    return f
  }
  function start() {
    var f
    try { f = parseGoal(formulaIn.value) } catch (e) { if (e instanceof Refusal) { say(e.message, 'bad'); return } throw e }
    goalF = f
    S = newState(f)
    history = []
    termIn.value = ''
    say(t('New goal. Choose a rule for goal 1.', '新目标。请为目标 1 选择一条规则。'), '')
    render()
  }
  function applyRule(id) {
    if (!S) { say(t('Choose or type a goal first.', '请先选择或输入一个目标。'), 'bad'); return }
    var open = openGoals(S)
    if (!open.length) { say(t('The proof is complete. Undo, Reset, or choose another goal.', '证明已完成。可以撤销、重来，或选择另一个目标。'), 'bad'); return }
    if (open.indexOf(S.sel) < 0) S.sel = open[0]
    var N = clone(S), g = N.nodes[N.sel], msg
    try { msg = RULES[id](N, g) } catch (e) { if (e instanceof Refusal) { say(e.message, 'bad'); return } throw e }
    history.push(S)
    S = N
    var nowOpen = openGoals(S)
    var fresh = (g.step.kids || []).filter(function (k) { return nowOpen.indexOf(k) >= 0 })
    // after a step that only adds assumptions (∧E₁, ∧E₂, ∀E, ⟶E forwards) the same assumption stays selected
    var keep = g.step.kind === 'ctx' ? N.selHyp : null
    S.sel = fresh.length ? fresh[0] : (nowOpen[0] || null)
    S.selHyp = keep && S.sel && S.nodes[S.sel].ctx.indexOf(keep) >= 0 ? keep : null
    termIn.value = ''
    if (!nowOpen.length) msg += ' ' + t('Proof complete.', '证明完成。')
    say(msg, 'ok')
    render()
  }
  function select(gid, hid) {
    if (!S) return
    S.sel = gid
    S.selHyp = hid ? (S.selHyp === hid ? null : hid) : (S.selHyp && S.nodes[gid].ctx.indexOf(S.selHyp) >= 0 ? S.selHyp : null)
    render()
  }

  function render() {
    var active = document.activeElement, key = active && root.contains(active) ? active.getAttribute('data-key') : null
    goalsBox.textContent = ''
    proofBox.textContent = ''
    undoBtn.disabled = !history.length
    if (!S) { statusBox.textContent = ''; panel.hidden = true; return }
    var open = openGoals(S)
    if (open.length && open.indexOf(S.sel) < 0) S.sel = open[0]
    if (!open.length) {
      statusBox.className = 'nd-status fmw-ok'
      statusBox.textContent = t('Proof complete: no goals left.', '证明完成：没有剩余目标。')
      panel.hidden = true
      var tr = tree(S, S.root)
      proofBox.appendChild(h('div', { class: 'nd-proof-h', text: t('The derivation of ' + show(goalF) + ':', show(goalF) + ' 的推导：') }))
      proofBox.appendChild(h('div', { class: 'prooftree' }, h('div', { class: 'pt-scroll' }, treeEl(tr))))
      proofBox.appendChild(h('details', null, h('summary', { text: t('As indented text (conclusion first, premises below)', '缩进文本形式（结论在前，前提在下）') }),
        h('pre', { class: 'nd-text', text: treeText(tr, 0, []).join('\n') })))
    } else {
      statusBox.className = 'nd-status'
      statusBox.textContent = t('Proving ' + show(goalF) + ' · ' + open.length + (open.length === 1 ? ' open goal' : ' open goals'),
        '正在证明 ' + show(goalF) + ' · 剩余 ' + open.length + ' 个目标')
      panel.hidden = false
      open.forEach(function (gid, i) {
        var g = S.nodes[gid], sel = gid === S.sel
        var head = h('div', { class: 'nd-goal-head' },
          h('button', { class: 'fmw-btn nd-goal-btn', type: 'button', 'aria-pressed': sel ? 'true' : 'false', 'data-key': 'g:' + gid, text: t('Goal ', '目标 ') + (i + 1), onclick: safe(function () { select(gid, null) }) }))
        var hyps = g.ctx.length
          ? g.ctx.map(function (hid) {
            var hy = S.hyps[hid], txt = show(hy.f)
            return h('button', { class: 'nd-hyp', type: 'button', 'data-f': txt, 'data-key': 'h:' + gid + ':' + hid, 'aria-pressed': sel && S.selHyp === hid ? 'true' : 'false',
              title: hy.src.k === 'hyp' ? t('assumption ' + hy.src.label + ', discharged by the rule marked ' + hy.src.label, '假设 ' + hy.src.label + '，由标号为 ' + hy.src.label + ' 的规则解除') : t('derived by (' + hy.src.rule + ')', '由 (' + hy.src.rule + ') 推出'),
              text: txt, onclick: safe(function () { select(gid, hid) }) })
          })
          : [h('span', { class: 'nd-none', text: t('none', '无') })]
        var dead = deadEnd(S, g)
        goalsBox.appendChild(h('div', { class: 'nd-goal' + (sel ? ' sel' : ''), role: 'group', 'aria-label': t('Goal ', '目标 ') + (i + 1) },
          head,
          h('div', { class: 'nd-hyps' }, h('span', { class: 'nd-k', text: t('Assumptions:', '假设：') }), hyps),
          h('div', { class: 'nd-show' }, h('span', { class: 'nd-k', text: t('Prove:', '要证：') }), h('span', { class: 'nd-concl', text: show(g.goal) })),
          dead ? h('div', { class: 'nd-dead', text: '✗ ' + dead }) : null))
      })
      var idx = open.indexOf(S.sel) + 1
      panelH.textContent = t('Rules for goal ' + idx, '目标 ' + idx + ' 的规则')
    }
    if (key) {
      var el = root.querySelector('[data-key="' + key + '"]')
      if (el) el.focus()
    }
  }

  presetIn.addEventListener('change', safe(function () {
    var p = PRESETS[+presetIn.value]
    if (p) { formulaIn.value = p; start() }
  }))
  startBtn.addEventListener('click', safe(start))
  formulaIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); safe(start)() } })
  undoBtn.addEventListener('click', safe(function () {
    if (!history.length) return
    S = history.pop()
    say(t('Undone.', '已撤销。'), '')
    render()
  }))
  resetBtn.addEventListener('click', safe(function () {
    if (!goalF) return
    S = newState(goalF)
    history = []
    termIn.value = ''
    say(t('Back to the start.', '已回到开始。'), '')
    render()
  }))

  formulaIn.value = PRESETS[0]
  start()
})
