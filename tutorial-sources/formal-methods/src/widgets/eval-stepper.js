// eval-stepper (Module 5): step through the evaluation of a recursive function call, one rewrite at a
// time. The equations are exactly the `fun` definitions of Module 5. Evaluation order: call by value,
// leftmost innermost (rewrite the leftmost call or arithmetic operation whose arguments are already
// values), as Section 5.1 describes.
FMWidgets.register('eval-stepper', function (root, api) {
  'use strict'
  var t = api.t, h = api.h

  api.css('eval-stepper', [
    '.evs .evs-args{display:flex;flex-wrap:wrap;gap:.5rem .9rem;align-items:center}',
    '.evs label{font-size:.85rem;color:var(--slate);display:inline-flex;align-items:center;gap:.4rem;max-width:100%;min-width:0}',
    '.evs .evs-args label.wide{display:flex;flex:1 1 18rem}',
    '.evs select{font:inherit;font-size:.9rem;padding:.35rem .5rem;border:1px solid var(--border);border-radius:8px;background:var(--white);color:var(--navy)}',
    '.evs .evs-arg{flex:0 0 auto;width:auto;max-width:100%}',
    '.evs .evs-arg.wide{flex:1 1 auto;width:100%;min-width:0}',
    '.evs .evs-eqs{margin:.6rem 0;border:1px solid var(--border);border-radius:8px;background:var(--bg);padding:.45rem .6rem;overflow-x:auto}',
    '.evs .evs-eq{font-family:var(--font-isa,monospace);font-size:.82rem;line-height:1.55;white-space:pre;padding:0 .35rem;border-radius:5px;color:#111}',
    '.evs .evs-eq.head{color:var(--slate)}',
    '.evs .evs-eq.used{background:#FEF3C7;outline:1px solid #F59E0B}',
    '.evs .evs-chain{margin:.5rem 0;border:1px solid var(--border);border-radius:8px;padding:.4rem .6rem;max-height:15rem;overflow:auto;background:var(--white)}',
    '.evs .evs-line{font-family:var(--font-isa,monospace);font-size:.86rem;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--slate)}',
    '.evs .evs-line .evs-eqsign{color:var(--muted);user-select:none}',
    '.evs .evs-line.now{color:#111;font-weight:600}',
    '.evs .evs-redex{background:#DBEAFE;border-radius:4px;box-shadow:0 0 0 1px #93C5FD}',
    '.evs .evs-more{font-size:.8rem;color:var(--muted);font-style:italic}',
    '.evs .evs-why{min-height:1.4em}',
    '.evs .evs-count{font-variant-numeric:tabular-nums;font-weight:600;color:var(--navy)}',
    '.evs .evs-tally{font-family:var(--font-isa,monospace);font-size:.82rem}',
  ].join('\n'))

  // ------------------------------------------------------------------ terms
  // {k:'num',v} {k:'sym',v} {k:'nil'} {k:'cons',h,t} {k:'tip'} {k:'node',l,x,r}
  // {k:'call',f,a:[...]} {k:'op',o:'+'|'*',l,r}
  function num(v) { return { k: 'num', v: v } }
  function call(f, a) { return { k: 'call', f: f, a: a } }
  function op(o, l, r) { return { k: 'op', o: o, l: l, r: r } }
  function cons(x, xs) { return { k: 'cons', h: x, t: xs } }
  var NIL = { k: 'nil' }, TIP = { k: 'tip' }

  function isValue(e) {
    switch (e.k) {
      case 'num': case 'sym': case 'nil': case 'tip': return true
      case 'cons': return isValue(e.h) && isValue(e.t)
      case 'node': return isValue(e.l) && isValue(e.x) && isValue(e.r)
      default: return false
    }
  }
  function kids(e) {
    switch (e.k) {
      case 'cons': return [e.h, e.t]
      case 'node': return [e.l, e.x, e.r]
      case 'call': return e.a
      case 'op': return [e.l, e.r]
      default: return []
    }
  }
  // The leftmost innermost redex: descend into the leftmost argument that is not yet a value.
  function redex(e) {
    var ks = kids(e)
    for (var i = 0; i < ks.length; i++) if (!isValue(ks[i])) return redex(ks[i])
    return e.k === 'call' || e.k === 'op' ? e : null
  }
  function replace(e, target, by) {
    if (e === target) return by
    switch (e.k) {
      case 'cons': return cons(replace(e.h, target, by), replace(e.t, target, by))
      case 'node': return { k: 'node', l: replace(e.l, target, by), x: replace(e.x, target, by), r: replace(e.r, target, by) }
      case 'call': return call(e.f, e.a.map(function (x) { return replace(x, target, by) }))
      case 'op': return op(e.o, replace(e.l, target, by), replace(e.r, target, by))
      default: return e
    }
  }
  function listElems(e) {      // elements of a cons chain ending in [], or null
    var out = []
    while (e.k === 'cons') { out.push(e.h); e = e.t }
    return e.k === 'nil' ? out : null
  }

  // ------------------------------------------------------------------ printing (Isabelle syntax)
  // Priorities as in Isabelle: application 1000, * infixl 70, + infixl 65, # infixr 65.
  // print returns segments [{s, hl}] so that the next redex can be highlighted.
  function print(e, prec, mark) {
    var segs = []
    function out(s) { segs.push({ s: s, hl: false }) }
    function go(e, prec) {
      var start = segs.length
      var elems = e.k === 'cons' ? listElems(e) : null
      if (e.k === 'num' || e.k === 'sym') out(String(e.v))
      else if (e.k === 'nil') out('[]')
      else if (e.k === 'tip') out('Tip')
      else if (elems) {
        out('[')
        elems.forEach(function (x, i) { if (i) out(', '); go(x, 0) })
        out(']')
      } else if (e.k === 'cons') {
        if (prec > 65) out('(')
        go(e.h, 66); out(' # '); go(e.t, 65)
        if (prec > 65) out(')')
      } else if (e.k === 'op') {
        var p = e.o === '*' ? 70 : 65
        if (prec > p) out('(')
        go(e.l, p); out(e.o === '*' ? ' * ' : ' + '); go(e.r, p + 1)
        if (prec > p) out(')')
      } else {
        var name = e.k === 'node' ? 'Node' : e.f, args = e.k === 'node' ? [e.l, e.x, e.r] : e.a
        if (prec > 999) out('(')
        out(name)
        args.forEach(function (x) { out(' '); go(x, 1000) })
        if (prec > 999) out(')')
      }
      if (e === mark) for (var i = start; i < segs.length; i++) segs[i].hl = true
    }
    go(e, prec || 0)
    return segs
  }
  function show(e) { return print(e, 0, null).map(function (x) { return x.s }).join('') }

  // ------------------------------------------------------------------ the functions of Module 5
  // Each equation is shown exactly as in the module's `fun` definition.
  var DEFS = {
    sum_upto: ['fun sum_upto :: "nat ⇒ nat" where', '  "sum_upto 0 = 0"', '| "sum_upto (Suc n) = sum_upto n + Suc n"'],
    fac: ['fun fac :: "nat ⇒ nat" where', '  "fac 0 = 1"', '| "fac (Suc n) = fac n * Suc n"'],
    pow: ['fun pow :: "nat ⇒ nat ⇒ nat" where', '  "pow x 0 = 1"', '| "pow x (Suc n) = pow x n * x"'],
    fib: ['fun fib :: "nat ⇒ nat" where', '  "fib 0 = 0"', '| "fib (Suc 0) = 1"', '| "fib (Suc (Suc n)) = fib n + fib (Suc n)"'],
    len: ['fun len :: "\'a list ⇒ nat" where', '  "len [] = 0"', '| "len (x # xs) = len xs + 1"'],
    app: ['fun app :: "\'a list ⇒ \'a list ⇒ \'a list" where', '  "app [] ys = ys"', '| "app (x # xs) ys = x # app xs ys"'],
    reverse: ['fun reverse :: "\'a list ⇒ \'a list" where', '  "reverse [] = []"', '| "reverse (x # xs) = app (reverse xs) [x]"'],
    lsum: ['fun lsum :: "nat list ⇒ nat" where', '  "lsum [] = 0"', '| "lsum (x # xs) = x + lsum xs"'],
    mirror: ['fun mirror :: "\'a tree2 ⇒ \'a tree2" where', '  "mirror Tip = Tip"', '| "mirror (Node l x r) = Node (mirror r) x (mirror l)"'],
  }
  // Why a number matches the pattern Suc n: 3 = Suc 2.
  function sucNote(n) { return n + ' = Suc ' + (n - 1) }

  // rewrite(f, args) for argument values: {eq (1-based), bind: [[name, term]], note, result}
  var RULES = {
    sum_upto: function (a) {
      var n = a[0].v
      if (n === 0) return { eq: 1, bind: [], result: num(0) }
      return { eq: 2, bind: [['n', num(n - 1)]], note: sucNote(n), result: op('+', call('sum_upto', [num(n - 1)]), num(n)) }
    },
    fac: function (a) {
      var n = a[0].v
      if (n === 0) return { eq: 1, bind: [], result: num(1) }
      return { eq: 2, bind: [['n', num(n - 1)]], note: sucNote(n), result: op('*', call('fac', [num(n - 1)]), num(n)) }
    },
    pow: function (a) {
      var x = a[0], n = a[1].v
      if (n === 0) return { eq: 1, bind: [['x', x]], result: num(1) }
      return { eq: 2, bind: [['x', x], ['n', num(n - 1)]], note: sucNote(n), result: op('*', call('pow', [x, num(n - 1)]), x) }
    },
    fib: function (a) {
      var n = a[0].v
      if (n === 0) return { eq: 1, bind: [], result: num(0) }
      if (n === 1) return { eq: 2, bind: [], note: '1 = Suc 0', result: num(1) }
      return { eq: 3, bind: [['n', num(n - 2)]], note: n + ' = Suc (Suc ' + (n - 2) + ')', result: op('+', call('fib', [num(n - 2)]), call('fib', [num(n - 1)])) }
    },
    len: function (a) {
      var xs = a[0]
      if (xs.k === 'nil') return { eq: 1, bind: [], result: num(0) }
      return { eq: 2, bind: [['x', xs.h], ['xs', xs.t]], result: op('+', call('len', [xs.t]), num(1)) }
    },
    app: function (a) {
      var xs = a[0], ys = a[1]
      if (xs.k === 'nil') return { eq: 1, bind: [['ys', ys]], result: ys }
      return { eq: 2, bind: [['x', xs.h], ['xs', xs.t], ['ys', ys]], result: cons(xs.h, call('app', [xs.t, ys])) }
    },
    reverse: function (a) {
      var xs = a[0]
      if (xs.k === 'nil') return { eq: 1, bind: [], result: NIL }
      return { eq: 2, bind: [['x', xs.h], ['xs', xs.t]], result: call('app', [call('reverse', [xs.t]), cons(xs.h, NIL)]) }
    },
    lsum: function (a) {
      var xs = a[0]
      if (xs.k === 'nil') return { eq: 1, bind: [], result: num(0) }
      return { eq: 2, bind: [['x', xs.h], ['xs', xs.t]], result: op('+', xs.h, call('lsum', [xs.t])) }
    },
    mirror: function (a) {
      var tr = a[0]
      if (tr.k === 'tip') return { eq: 1, bind: [], result: TIP }
      return { eq: 2, bind: [['l', tr.l], ['x', tr.x], ['r', tr.r]],
        result: { k: 'node', l: call('mirror', [tr.r]), x: tr.x, r: call('mirror', [tr.l]) } }
    },
  }

  // The functions the reader can pick: arguments (kind, name, default) and which definitions to show.
  var MENU = [
    { f: 'sum_upto', args: [['nat', 'n', '3']], defs: ['sum_upto'] },
    { f: 'fac', args: [['nat', 'n', '4']], defs: ['fac'] },
    { f: 'pow', args: [['nat', 'x', '2'], ['nat', 'n', '3']], defs: ['pow'] },
    { f: 'fib', args: [['nat', 'n', '5']], defs: ['fib'] },
    { f: 'len', args: [['list', 'xs', '[a, b, c]']], defs: ['len'] },
    { f: 'app', args: [['list', 'xs', '[1, 2]'], ['list', 'ys', '[3]']], defs: ['app'] },
    { f: 'reverse', args: [['list', 'xs', '[1, 2, 3]']], defs: ['reverse', 'app'] },
    { f: 'lsum', args: [['nlist', 'xs', '[3, 1, 4]']], defs: ['lsum'] },
    { f: 'mirror', args: [['tree', 't', 'Node (Node Tip 1 Tip) 2 (Node (Node Tip 3 Tip) 4 Tip)']], defs: ['mirror'] },
  ]
  // Largest arguments, so that every trace stays small enough to step through.
  var CAP = { sum_upto: [30], fac: [12], pow: [20, 12], fib: [15] }
  var MAX_LIST = 8, MAX_TREE = 10, MAX_STEPS = 5000

  // ------------------------------------------------------------------ reading arguments
  function bad(en, zh) { var e = new Error(t(en, zh)); e.user = true; return e }
  function readNat(s) {
    s = s.trim()
    if (!/^\d+$/.test(s)) throw bad('Type a natural number: 0, 1, 2, …', '请输入一个自然数：0、1、2……')
    if (s.length > 6) throw bad('That number is too large.', '这个数太大了。')
    return num(parseInt(s, 10))
  }
  function readElem(s, numbersOnly) {
    if (/^\d{1,4}$/.test(s)) return num(parseInt(s, 10))
    if (!numbersOnly && /^[a-z]$/.test(s)) return { k: 'sym', v: s }
    throw numbersOnly
      ? bad('lsum adds numbers: use elements such as 3 or 14.', 'lsum 把数相加：元素请用 3、14 这样的数。')
      : bad('Use elements such as 1, 2, 3 or a, b, c.', '元素请用 1、2、3 或 a、b、c。')
  }
  function readList(s, numbersOnly) {
    s = s.trim()
    var m = s.match(/^\[(.*)\]$/)
    if (!m) throw bad('Write a list in brackets, for example [1, 2, 3] or [].', '请用方括号写列表，例如 [1, 2, 3] 或 []。')
    var body = m[1].trim()
    var xs = body === '' ? [] : body.split(',').map(function (x) { return readElem(x.trim(), numbersOnly) })
    if (xs.length > MAX_LIST) throw bad('Use at most ' + MAX_LIST + ' elements.', '最多用 ' + MAX_LIST + ' 个元素。')
    var e = NIL
    for (var i = xs.length - 1; i >= 0; i--) e = cons(xs[i], e)
    return e
  }
  function readTree(s) {
    var toks = s.match(/Tip|Node|\(|\)|\d{1,4}|[a-z]|\S/g) || [], k = 0
    function err() { return bad('Write a tree such as Node (Node Tip 1 Tip) 2 Tip.', '请写一棵树，例如 Node (Node Tip 1 Tip) 2 Tip。') }
    function elem() {
      var x = toks[k++]
      if (x && /^\d+$/.test(x)) return num(parseInt(x, 10))
      if (x && /^[a-z]$/.test(x)) return { k: 'sym', v: x }
      throw err()
    }
    function arg() {
      if (toks[k] === 'Tip') { k++; return TIP }
      if (toks[k] === '(') { k++; var e = tree(); if (toks[k++] !== ')') throw err(); return e }
      throw err()
    }
    function tree() {
      if (toks[k] === 'Node') { k++; var l = arg(), x = elem(), r = arg(); return { k: 'node', l: l, x: x, r: r } }
      return arg()
    }
    var e = tree()
    if (k !== toks.length) throw err()
    var n = 0; (function count(e) { if (e.k === 'node') { n++; count(e.l); count(e.r) } })(e)
    if (n > MAX_TREE) throw bad('Use a tree with at most ' + MAX_TREE + ' nodes.', '树最多 ' + MAX_TREE + ' 个结点。')
    return e
  }
  function readArg(kind, s) {
    if (kind === 'nat') return readNat(s)
    if (kind === 'list') return readList(s, false)
    if (kind === 'nlist') return readList(s, true)
    return readTree(s)
  }

  // ------------------------------------------------------------------ the trace
  // steps[i] = {term, next (the redex of term, or null), used: {f, eq, bind, note} | {arith}}
  function trace(start) {
    var steps = [{ term: start, used: null }], e = start, tally = {}
    for (var n = 0; n <= MAX_STEPS; n++) {
      var r = redex(e)
      steps[steps.length - 1].next = r
      if (!r) return { steps: steps, tally: tally }
      var used, by
      if (r.k === 'op') {
        if (r.l.k !== 'num' || r.r.k !== 'num') throw bad('This cannot be computed with letters.', '含字母的项无法计算。')
        by = num(r.o === '*' ? r.l.v * r.r.v : r.l.v + r.r.v)
        used = { arith: show(r) + ' = ' + by.v }
      } else {
        var res = RULES[r.f](r.a)
        by = res.result
        used = { f: r.f, eq: res.eq, bind: res.bind, note: res.note }
        var key = show(r)
        tally[key] = (tally[key] || 0) + 1
      }
      e = replace(e, r, by)
      steps.push({ term: e, used: used })
    }
    throw bad('This evaluation needs too many steps. Choose a smaller argument.', '这个求值需要的步骤太多，请选小一点的参数。')
  }

  // ------------------------------------------------------------------ the interface
  var state = { item: MENU[0], steps: null, tally: null, i: 0 }

  var select = h('select', { id: 'evs-fn-' + Math.random().toString(36).slice(2, 8), onchange: function () { choose(select.value) } },
    MENU.map(function (m) { return h('option', { value: m.f }, m.f) }))
  var argBox = h('div', { class: 'evs-args' })
  var msg = h('div', { class: 'fmw-msg evs-msg', role: 'status' })
  var eqBox = h('div', { class: 'evs-eqs', 'aria-label': t('Equations', '方程') })
  var chain = h('div', { class: 'evs-chain', 'aria-label': t('Evaluation so far', '到目前为止的求值过程') })
  var why = h('div', { class: 'fmw-msg evs-why', 'aria-live': 'polite' })
  var counter = h('span', { class: 'evs-count' })
  var btn = function (en, zh, fn) { return h('button', { type: 'button', class: 'fmw-btn', onclick: fn }, t(en, zh)) }
  var bBack = btn('Back', '上一步', function () { go(state.i - 1) })
  var bNext = btn('Next', '下一步', function () { go(state.i + 1) })
  var bRun = btn('Run to end', '运行到底', function () { go(Infinity) })
  var bReset = btn('Reset', '重置', function () { go(0) })
  var result = h('div', { class: 'fmw-msg evs-result', 'aria-live': 'polite' })

  root.appendChild(h('div', { class: 'fmw evs' },
    h('div', { class: 'fmw-row' }, h('label', {}, t('Function', '函数'), select)),
    argBox,
    msg,
    eqBox,
    chain,
    why,
    h('div', { class: 'fmw-row' }, bBack, bNext, bRun, bReset, counter),
    result))

  function choose(f) {
    state.item = MENU.filter(function (m) { return m.f === f })[0] || MENU[0]
    select.value = state.item.f
    argBox.innerHTML = ''
    state.item.args.forEach(function (a, i) {
      var id = select.id + '-' + i
      var input = h('input', { id: id, class: 'fmw-input evs-arg' + (a[0] === 'nat' ? '' : ' wide'), type: 'text', spellcheck: 'false',
        autocomplete: 'off', inputmode: a[0] === 'nat' ? 'numeric' : null, size: a[0] === 'nat' ? 6 : null, value: a[2], 'data-arg': String(i),
        oninput: rebuild, onkeydown: function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); go(state.i + 1) } } })
      argBox.appendChild(h('label', { for: id, class: a[0] === 'nat' ? null : 'wide' }, h('span', { class: 'fmw-isa' }, a[1] + ' ='), input))
    })
    rebuild()
  }

  function rebuild() {
    state.steps = null
    try {
      var item = state.item, inputs = argBox.querySelectorAll('input'), args = []
      item.args.forEach(function (a, i) {
        var v = readArg(a[0], inputs[i].value)
        var cap = CAP[item.f] && CAP[item.f][i]
        if (cap != null && v.v > cap) {
          throw bad('Please choose ' + a[1] + ' ≤ ' + cap + ' here: larger arguments make too many steps to follow.',
            '这里请选 ' + a[1] + ' ≤ ' + cap + '：参数更大时，步骤多得无法逐一查看。')
        }
        args.push(v)
      })
      var tr = trace(call(item.f, args))
      state.steps = tr.steps; state.tally = tr.tally
      msg.textContent = ''
    } catch (e) {
      msg.textContent = e && e.user ? e.message : t('Something went wrong: ', '出错了：') + (e && e.message)
      msg.className = 'fmw-msg evs-msg fmw-bad'
    }
    if (state.steps) msg.className = 'fmw-msg evs-msg'
    go(0)
  }

  function go(i) {
    try { render(i) } catch (e) { why.textContent = t('Something went wrong: ', '出错了：') + (e && e.message) }
  }

  function eqLines(used) {
    eqBox.innerHTML = ''
    state.item.defs.forEach(function (f, k) {
      if (k) eqBox.appendChild(h('div', { class: 'evs-eq head' }, ' '))
      DEFS[f].forEach(function (line, j) {
        var on = used && used.f === f && used.eq === j
        eqBox.appendChild(h('div', { class: 'evs-eq' + (j === 0 ? ' head' : '') + (on ? ' used' : ''), 'data-fn': f, 'data-eq': j ? String(j) : null }, line))
      })
    })
  }

  function line(step, isNow, first) {
    var segs = print(step.term, 0, isNow ? step.next : null)
    var el = h('div', { class: 'evs-line' + (isNow ? ' now' : '') }, h('span', { class: 'evs-eqsign' }, first ? '  ' : '= '))
    // consecutive highlighted segments form one highlighted span
    var hl = '', plain = ''
    function flush() {
      if (hl) { el.appendChild(h('span', { class: 'evs-redex' }, hl)); hl = '' }
      if (plain) { el.appendChild(document.createTextNode(plain)); plain = '' }
    }
    segs.forEach(function (sg) {
      if (sg.hl) { if (plain) flush(); hl += sg.s } else { if (hl) flush(); plain += sg.s }
    })
    flush()
    return el
  }

  function render(i) {
    var steps = state.steps
    ;[bBack, bNext, bRun, bReset].forEach(function (b) { b.disabled = !steps })
    if (!steps) { chain.innerHTML = ''; why.textContent = ''; result.textContent = ''; counter.textContent = ''; eqLines(null); return }
    var last = steps.length - 1
    i = Math.max(0, Math.min(last, i))
    state.i = i
    bBack.disabled = bReset.disabled = i === 0
    bNext.disabled = bRun.disabled = i === last
    var used = steps[i].used
    eqLines(used)
    // the calculation so far, as on paper: the first line, then "= ..." for every step
    chain.innerHTML = ''
    var from = Math.max(0, i - 199)
    if (from > 0) chain.appendChild(h('div', { class: 'evs-more' }, t('… ' + from + ' earlier steps', '……之前还有 ' + from + ' 步')))
    for (var k = from; k <= i; k++) chain.appendChild(line(steps[k], k === i, k === 0))
    chain.scrollTop = chain.scrollHeight
    counter.textContent = t('Step ' + i + ' of ' + last, '第 ' + i + ' 步，共 ' + last + ' 步')
    if (!used) {
      why.textContent = last
        ? t('Press Next to rewrite the highlighted part with an equation.', '按“下一步”，用一个方程改写高亮的部分。')
        : t('This term is already a value: there is nothing to rewrite.', '这个项已经是一个值，没有什么可改写的。')
    } else if (used.arith) {
      why.textContent = t('Arithmetic: ', '算术：') + used.arith
    } else {
      var bind = used.bind.map(function (b) { return b[0] + ' = ' + show(b[1]) }).join(', ')
      why.textContent = t('Equation ' + used.eq + ' of ' + used.f, '用 ' + used.f + ' 的第 ' + used.eq + ' 个方程') +
        (bind ? t(', with ', '，其中 ') + bind : '') + (used.note ? t(' (because ', '（因为 ') + used.note + t(')', '）') : '')
    }
    result.innerHTML = ''
    if (i === last) {
      var calls = 0
      Object.keys(state.tally).forEach(function (k) { calls += state.tally[k] })
      result.appendChild(h('div', { class: 'fmw-ok' },
        t('Value: ', '值：') + show(steps[last].term) + t(' after ' + last + (last === 1 ? ' step (' : ' steps (') + calls + ' by equations, ' + (last - calls) + ' by arithmetic).',
          '，共 ' + last + ' 步（' + calls + ' 步用方程，' + (last - calls) + ' 步是算术）。')))
      if (state.item.f === 'fib') {
        var keys = Object.keys(state.tally).sort(function (a, b) { return parseInt(b.slice(4), 10) - parseInt(a.slice(4), 10) })
        var rep = keys.filter(function (k) { return state.tally[k] > 1 })
        // each equation step rewrites one call, so the number of calls is the number of equation steps
        result.appendChild(h('div', {}, t(calls + (calls === 1 ? ' call' : ' calls') + ' in all: ', '一共 ' + calls + ' 次调用：'),
          h('span', { class: 'evs-tally' }, keys.map(function (k) { return k + ' ×' + state.tally[k] }).join(', '))))
        if (rep.length) {
          // the largest repeated call, and the most repeated call that recurses (fib 2 or more)
          var k0 = rep[0], k1 = rep.filter(function (k) { return parseInt(k.slice(4), 10) >= 2 })
            .sort(function (a, b) { return state.tally[b] - state.tally[a] })[0]
          var also = k1 && k1 !== k0
          result.appendChild(h('div', {}, t('Repeated work: ' + k0 + ' was computed ' + state.tally[k0] + ' times' +
            (also ? ' and ' + k1 + ' ' + state.tally[k1] + ' times' : '') + ', each time from scratch.',
            '重复劳动：' + k0 + ' 被从头计算了 ' + state.tally[k0] + ' 次' + (also ? '，' + k1 + ' 被从头计算了 ' + state.tally[k1] + ' 次' : '') + '。')))
        }
      }
    }
  }

  choose(MENU[0].f)
})
