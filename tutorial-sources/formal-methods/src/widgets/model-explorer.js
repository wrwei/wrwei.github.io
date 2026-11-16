// Model explorer (Module 3): a small structure the reader edits by clicking (a domain of 2 to 4
// elements, two one-place predicates P and Q, one two-place relation R) and a list of sentences that
// are re-evaluated with FMWidgets.Logic.holds after every change. A false ∀ shows a counterexample,
// a true ∃ a witness; ∀x. ∃y shows the y chosen for each x.
FMWidgets.register('model-explorer', function (root, api) {
  'use strict'
  var t = api.t, h = api.h, Logic = api.Logic
  var NAMES = ['a', 'b', 'c', 'd'], MIN = 2, MAX = 4
  var ARITY = { P: 1, Q: 1, R: 2 }
  var PRESETS = [
    '∀x. ∃y. R x y',
    '∃y. ∀x. R x y',
    '∀x. P x ⟶ Q x',
    '∀x. P x ∧ Q x',
    '∃x. P x ∧ Q x',
    '∃x. P x ⟶ Q x',
    '∃x. P x ∧ (∀y. P y ⟶ y = x)',
    '∀x y. R x y ⟶ R y x',
  ]
  // Starting structure: P = {a}, Q = {b}, R = {(a, b)}.
  function initial() {
    var R = [0, 1, 2, 3].map(function () { return [false, false, false, false] })
    R[0][1] = true
    return { n: 3, P: [true, false, false, false], Q: [false, true, false, false], R: R,
      formulas: PRESETS.map(function (s) { return { src: s } }) }
  }
  var st = initial()

  api.css('model-explorer', [
    '.mx-top{display:flex;flex-wrap:wrap;gap:.75rem 2rem;align-items:flex-start}',
    '.mx-block{min-width:0;max-width:100%}',
    '.mx-h{font-size:.82rem;font-weight:600;color:var(--slate);margin:.2rem 0 .1rem}',
    '.mx-table{border-collapse:collapse;font-family:var(--font-isa,monospace);font-size:.9rem;margin:.3rem 0}',
    '.mx-table th,.mx-table td{border:1px solid var(--border);padding:.15rem .35rem;text-align:center}',
    '.mx-table th{background:var(--bg);color:var(--navy);font-weight:600;font-size:.88rem;padding:.15rem .45rem;text-align:center}',
    '.mx-table input{width:1.15rem;height:1.15rem;margin:.2rem;accent-color:var(--blue);cursor:pointer}',
    '.mx-cell{font:inherit;width:2rem;height:2rem;border:1px solid var(--border);border-radius:6px;background:var(--white);color:var(--muted);cursor:pointer;padding:0}',
    '.mx-cell[aria-pressed="true"]{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.mx-cell:focus-visible,.mx-del:focus-visible,.mx table input:focus-visible{outline:2px solid var(--sky);outline-offset:1px}',
    '.mx-summary{font-family:var(--font-isa,monospace);font-size:.86rem;color:var(--navy);margin:.4rem 0;display:flex;flex-wrap:wrap;gap:.1rem 1.4rem}',
    '.mx-summary span{overflow-wrap:anywhere}',
    '.mx-list{list-style:none;margin:.4rem 0;padding:0;border-top:1px solid var(--border)}',
    '.mx-item{display:flex;flex-wrap:wrap;align-items:center;gap:.15rem .6rem;padding:.4rem .2rem;border-bottom:1px solid var(--border)}',
    '.mx-f{font-family:var(--font-isa,monospace);font-size:.92rem;flex:1 1 12rem;min-width:0;overflow-wrap:anywhere}',
    '.mx-v{font-weight:700;min-width:3.2rem;text-align:center;border-radius:999px;padding:.05rem .5rem;font-size:.82rem}',
    '.mx-v.fmw-t{background:#DCFCE7}.mx-v.fmw-f{background:#FEE2E2}.mx-v.mx-err{background:var(--bg);color:var(--slate);font-weight:600}',
    '.mx-why{flex:1 1 100%;font-size:.84rem;color:var(--slate);overflow-wrap:anywhere}',
    '.mx-why .fmw-isa{color:var(--navy)}',
    '.mx-del{font:inherit;font-size:1rem;line-height:1;border:1px solid var(--border);border-radius:6px;background:var(--white);color:var(--slate);cursor:pointer;width:1.8rem;height:1.8rem;padding:0}',
    '.mx-del:hover{border-color:#B91C1C;color:#B91C1C}',
    '.mx-add{margin-top:.5rem}',
    '.mx-add label{font-size:.85rem;font-weight:600;color:var(--slate);flex:1 1 100%}',
  ].join('\n'))

  // ------------------------------------------------------------ the structure as Logic.holds wants it
  function domain() { return NAMES.slice(0, st.n) }
  function structure() {
    var dom = domain()
    var M = { domain: dom, consts: {}, preds: { P: [], Q: [], R: [] } }
    dom.forEach(function (d, i) {
      M.consts[d] = d
      if (st.P[i]) M.preds.P.push([d])
      if (st.Q[i]) M.preds.Q.push([d])
      dom.forEach(function (e, j) { if (st.R[i][j]) M.preds.R.push([d, e]) })
    })
    return M
  }

  // ------------------------------------------------------------ messages in both languages
  function list(xs) { return xs.join(t(', ', ', ')) }
  function parseMessage(m) {
    var r
    if (m === 'empty formula') return t('Type a formula first.', '请先输入一个公式。')
    if ((r = m.match(/^cannot read "(.*)"$/))) return t('Cannot read “' + r[1] + '”.', '无法识别“' + r[1] + '”。')
    if ((r = m.match(/^expected a variable after (.)$/))) return t('A variable must follow ' + r[1] + '.', r[1] + ' 后面应当是一个变元。')
    if ((r = m.match(/^expected a term at the end$/))) return t('The formula stops where a term should follow.', '公式在应当出现项的地方结束了。')
    if ((r = m.match(/^expected a term before (.+)$/))) return t('A term should come before ' + r[1] + '.', '在 ' + r[1] + ' 之前应当是一个项。')
    if ((r = m.match(/^expected (.+) at the end$/))) return t('Missing ' + r[1] + ' at the end.', '末尾缺少 ' + r[1] + '。')
    if ((r = m.match(/^expected (.+) before (.+)$/))) return t('Expected ' + r[1] + ' before ' + r[2] + '.', '在 ' + r[2] + ' 之前应当是 ' + r[1] + '。')
    if (m === 'unexpected end of formula') return t('The formula is incomplete.', '公式不完整。')
    if ((r = m.match(/^unexpected (.+)$/))) return t('Unexpected ' + r[1] + '.', '这里不应出现 ' + r[1] + '。')
    if (m === 'a number is not a formula') return t('A number is not a formula.', '数字不是公式。')
    return m
  }

  // Check that a parsed formula only uses this structure's vocabulary; return a message or null.
  function vocabularyProblem(f) {
    var dom = domain(), problem = null
    function term(tm, bound) {
      if (problem) return
      if (tm.k === 'fn') {
        problem = /^\d+$/.test(tm.name)
          ? t('Numbers are not elements of this structure: use ' + list(dom) + '.', '数字不是这个结构的元素：请使用 ' + list(dom) + '。')
          : t('This structure has no function symbols such as ' + tm.name + '.', '这个结构没有 ' + tm.name + ' 这样的函数符号。')
        return
      }
      if (bound.indexOf(tm.name) >= 0 || dom.indexOf(tm.name) >= 0) return
      problem = NAMES.indexOf(tm.name) >= 0
        ? t('There is no element ' + tm.name + ' in the domain {' + list(dom) + '}.', '论域 {' + list(dom) + '} 中没有元素 ' + tm.name + '。')
        : t(tm.name + ' is free here: bind it with ∀ or ∃, or use an element name (' + list(dom) + ').',
          tm.name + ' 在这里是自由变量：请用 ∀ 或 ∃ 约束它，或者改用元素名（' + list(dom) + '）。')
    }
    function walk(g, bound) {
      if (problem) return
      switch (g.k) {
        case 'const': return
        case 'atom':
          if (!(g.name in ARITY)) {
            problem = t(g.name + ' is not a predicate of this structure: use P x, Q x or R x y.', g.name + ' 不是这个结构中的谓词：请使用 P x、Q x 或 R x y。')
            return
          }
          if (g.args.length !== ARITY[g.name]) {
            problem = ARITY[g.name] === 1
              ? t(g.name + ' takes one argument, as in ' + g.name + ' x.', g.name + ' 只接受一个参数，例如 ' + g.name + ' x。')
              : t(g.name + ' takes two arguments, as in ' + g.name + ' x y.', g.name + ' 接受两个参数，例如 ' + g.name + ' x y。')
            return
          }
          g.args.forEach(function (a) { term(a, bound) })
          return
        case 'eq': term(g.l, bound); term(g.r, bound); return
        case 'not': walk(g.a, bound); return
        case 'all': case 'ex': walk(g.body, bound.concat([g.v])); return
        default: walk(g.l, bound); walk(g.r, bound)
      }
    }
    walk(f, [])
    return problem
  }

  // ------------------------------------------------------------ evaluation with witnesses
  // The first tuple of values for vars (in domain order) for which body evaluates to want, or null.
  function firstTuple(vars, body, M, env, want) {
    var found = null
    ;(function go(k, e) {
      if (found) return
      if (k === vars.length) { if (Logic.holds(body, M, e) === want) found = vars.map(function (v) { return e[v] }); return }
      M.domain.forEach(function (d) { if (found) return; var e2 = Object.assign({}, e); e2[vars[k]] = d; go(k + 1, e2) })
    })(0, env)
    return found
  }
  function chain(f) {
    var vars = [], body = f
    while (body.k === f.k) { vars.push(body.v); body = body.body }
    return { vars: vars, body: body }
  }
  function eqs(vars, vals) { return vars.map(function (v, i) { return v + ' = ' + vals[i] }).join(', ') }
  function isa(s) { return h('span', { class: 'fmw-isa', text: s }) }
  // Print as Isabelle does: ∀x. ∀y. φ becomes ∀x y. φ, and ¬ x = y becomes x ≠ y. Unlike Logic.show,
  // keep the parentheses of ⟶ inside ⟷ and of ⟷ inside ⟶, as Module 2 advises.
  function clarify(f) {
    switch (f.k) {
      case 'not':
        if (f.a.k === 'eq') return { k: 'atom', name: Logic.show(f.a).replace(' = ', ' ≠ '), args: [] }
        return { k: 'not', a: clarify(f.a) }
      case 'all': case 'ex': return { k: f.k, v: f.v, body: clarify(f.body) }
      case 'and': case 'or': case 'imp': case 'iff': {
        var g = { k: f.k, l: clarify(f.l), r: clarify(f.r) }
        if (f.k === 'imp' || f.k === 'iff') ['l', 'r'].forEach(function (side) {
          var c = g[side]
          if ((c.k === 'imp' || c.k === 'iff') && c.k !== f.k) g[side] = { k: 'atom', name: '(' + Logic.show(c) + ')', args: [] }
        })
        return g
      }
      default: return f
    }
  }
  function show(f) {
    var s = Logic.show(clarify(f)), prev
    do { prev = s; s = s.replace(/([∀∃])([\w' ]+)\. \1(?=[\w'])/g, '$1$2 ') } while (s !== prev)
    return s
  }
  // The number of variables bound by quantifiers: evaluation takes up to (domain size)^n steps.
  var MAX_BOUND = 8
  function boundCount(f) {
    switch (f.k) {
      case 'all': case 'ex': return 1 + boundCount(f.body)
      case 'not': return boundCount(f.a)
      case 'and': case 'or': case 'imp': case 'iff': return boundCount(f.l) + boundCount(f.r)
      default: return 0
    }
  }

  // Returns the explanation (an array of nodes and strings) for a sentence f with value val.
  function explain(f, val, M) {
    if (f.k !== 'all' && f.k !== 'ex') return null
    var c = chain(f), vs = c.vars.join(', ')
    if (f.k === 'all' && !val) {
      var ce = firstTuple(c.vars, c.body, M, {}, false)
      return [t('Counterexample: ', '反例：'), isa(eqs(c.vars, ce)), t('.', '。')]
    }
    if (f.k === 'ex' && val) {
      var w = firstTuple(c.vars, c.body, M, {}, true)
      return [t('Witness: ', '见证：'), isa(eqs(c.vars, w)), t('.', '。')]
    }
    if (f.k === 'all' && val && c.body.k === 'ex') {
      // ∀x. ∃y. φ: show the y chosen for each x
      var inner = chain(c.body), pairs = []
      ;(function go(k, e, vals) {
        if (k === c.vars.length) {
          var y = firstTuple(inner.vars, inner.body, M, e, true)
          pairs.push(vals.join(' ') + ' → ' + y.join(' '))
          return
        }
        M.domain.forEach(function (d) { var e2 = Object.assign({}, e); e2[c.vars[k]] = d; go(k + 1, e2, vals.concat([d])) })
      })(0, {}, [])
      return [t('Each ' + vs + ' has its own ' + inner.vars.join(', ') + ': ', '每个 ' + vs + ' 都有各自的 ' + inner.vars.join(', ') + '：'),
        isa(pairs.join(t(', ', ', '))), t('.', '。')]
    }
    if (f.k === 'ex' && !val && c.body.k === 'all') {
      // ∃y. ∀x. φ false: for each y, an x where φ fails
      var inner2 = chain(c.body), fails = []
      M.domain.forEach(function (d) {
        var e = {}; e[c.vars[0]] = d
        if (c.vars.length > 1) return
        var x = firstTuple(inner2.vars, inner2.body, M, e, false)
        if (x) fails.push(c.vars[0] + ' = ' + d + t(' fails at ', ' 在 ') + eqs(inner2.vars, x) + t('', ' 处不成立'))
      })
      if (fails.length) return [t('No single ' + vs + ' works for every ' + inner2.vars.join(', ') + ': ', '没有一个 ' + vs + ' 对所有 ' + inner2.vars.join(', ') + ' 都成立：'),
        isa(fails.join(t('; ', '；'))), t('.', '。')]
    }
    if (f.k === 'all' && val) {
      if (c.body.k === 'imp' && !firstTuple(c.vars, c.body.l, M, {}, true))
        return [t('True, vacuously: no ' + vs + ' satisfies ', '空真：没有 ' + vs + ' 满足 '), isa(show(c.body.l)), t('.', '。')]
      return [t('True for every ' + vs + '.', '对每个 ' + vs + ' 都成立。')]
    }
    return [t('No ' + vs + ' makes it true.', '没有哪个 ' + vs + ' 使它为真。')]
  }

  // ------------------------------------------------------------ the page elements
  root.classList.add('fmw', 'mx')
  var uid = 'mx' + Math.random().toString(36).slice(2, 8)
  var addBtn = h('button', { type: 'button', class: 'fmw-btn', text: t('Add element', '添加元素'), onclick: function () { resize(+1) } })
  var delBtn = h('button', { type: 'button', class: 'fmw-btn', text: t('Remove element', '删除元素'), onclick: function () { resize(-1) } })
  var resetBtn = h('button', { type: 'button', class: 'fmw-btn', text: t('Reset', '重置'), onclick: function () { st = initial(); drawStructure(); drawFormulas(); msg.textContent = t('Back to the starting structure and formulas.', '已恢复初始的结构和公式。') } })
  var domText = h('span', { class: 'fmw-isa' })
  var tables = h('div', { class: 'mx-top' })
  var summary = h('div', { class: 'mx-summary' })
  var items = h('ol', { class: 'mx-list', 'aria-label': t('Formulas', '公式') })
  var input = h('input', { type: 'text', id: uid + '-in', class: 'fmw-input mx-input', autocomplete: 'off', spellcheck: 'false',
    placeholder: '∃x. R x x', onkeydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); addFormula() } } })
  var msg = h('div', { class: 'fmw-msg mx-msg', role: 'status', 'aria-live': 'polite' })

  root.appendChild(h('div', { class: 'fmw-row' }, h('span', { class: 'mx-h', text: t('Domain', '论域') }), domText, addBtn, delBtn, resetBtn))
  root.appendChild(tables)
  root.appendChild(summary)
  root.appendChild(h('div', { class: 'mx-h', text: t('Formulas (true or false in this structure)', '公式（在这个结构中为真或为假）') }))
  root.appendChild(items)
  root.appendChild(h('div', { class: 'fmw-row mx-add' },
    h('label', { for: uid + '-in' }, t('Add a formula, with ', '添加公式，可用 '), isa('∀ ∃ ¬ ∧ ∨ ⟶ ⟷ ='),
      t(' or in ASCII: ', '，或用 ASCII：'), isa('ALL EX ~ & | --> <-->')),
    input, h('button', { type: 'button', class: 'fmw-btn', text: t('Add', '添加'), onclick: addFormula })))
  root.appendChild(msg)

  function resize(d) {
    var n = st.n + d
    if (n < MIN || n > MAX) return
    if (d < 0) {                       // forget everything about the removed element
      st.P[n] = st.Q[n] = false
      for (var i = 0; i < MAX; i++) { st.R[n][i] = false; st.R[i][n] = false }
    }
    st.n = n
    drawStructure()
    drawFormulas()
    msg.textContent = d > 0 ? t('Added element ' + NAMES[n - 1] + '.', '已添加元素 ' + NAMES[n - 1] + '。') : t('Removed element ' + NAMES[n] + '.', '已删除元素 ' + NAMES[n] + '。')
    ;(d > 0 ? (addBtn.disabled ? delBtn : addBtn) : (delBtn.disabled ? addBtn : delBtn)).focus()
  }

  function drawStructure() {
    var dom = domain()
    domText.textContent = '{' + dom.join(', ') + '}'
    addBtn.disabled = st.n >= MAX
    delBtn.disabled = st.n <= MIN
    tables.textContent = ''
    // P and Q: one row per element, a check box per predicate
    var pq = h('table', { class: 'mx-table' },
      h('thead', null, h('tr', null, h('th', { scope: 'col', text: t('element', '元素') }), h('th', { scope: 'col', text: 'P' }), h('th', { scope: 'col', text: 'Q' }))),
      h('tbody', null, dom.map(function (d, i) {
        return h('tr', null, h('th', { scope: 'row', text: d }), ['P', 'Q'].map(function (p) {
          var box = h('input', { type: 'checkbox', 'aria-label': p + ' ' + d, 'data-p': p + ',' + d,
            onchange: function () { st[p][i] = box.checked; drawSummary(); drawFormulas() } })
          box.checked = st[p][i]
          return h('td', null, box)
        }))
      })))
    // R: rows x, columns y
    var grid = h('table', { class: 'mx-table' },
      h('thead', null, h('tr', null, h('th', { scope: 'col', text: 'x \\ y' }), dom.map(function (d) { return h('th', { scope: 'col', text: d }) }))),
      h('tbody', null, dom.map(function (x, i) {
        return h('tr', null, h('th', { scope: 'row', text: x }), dom.map(function (y, j) {
          var b = h('button', { type: 'button', class: 'mx-cell', 'aria-label': 'R ' + x + ' ' + y, 'aria-pressed': st.R[i][j] ? 'true' : 'false',
            text: st.R[i][j] ? '✓' : '·',
            onclick: function () {
              st.R[i][j] = !st.R[i][j]
              b.setAttribute('aria-pressed', st.R[i][j] ? 'true' : 'false')
              b.textContent = st.R[i][j] ? '✓' : '·'
              drawSummary(); drawFormulas()
            } })
          return h('td', null, b)
        }))
      })))
    tables.appendChild(h('div', { class: 'mx-block' }, h('div', { class: 'mx-h', text: t('P x and Q x: tick where they hold', 'P x 与 Q x：在成立处打勾') }), h('div', { class: 'fmw-scroll' }, pq)))
    tables.appendChild(h('div', { class: 'mx-block' }, h('div', { class: 'mx-h', text: t('R x y: row x, column y (click to switch)', 'R x y：第 x 行、第 y 列（点击切换）') }), h('div', { class: 'fmw-scroll' }, grid)))
    drawSummary()
  }

  function drawSummary() {
    var M = structure()
    function set(rel) { return '{' + rel.map(function (r) { return r.length === 1 ? r[0] : '(' + r.join(', ') + ')' }).join(', ') + '}' }
    summary.textContent = ''
    ;['P', 'Q', 'R'].forEach(function (p) { summary.appendChild(h('span', { text: p + ' = ' + set(M.preds[p]) })) })
  }

  // Evaluate one formula; returns {text, cls, verdict, why}
  function evaluate(src, M) {
    var f
    if (/(∃|\bEX|\?)\s*!/.test(src)) return { text: src, error: t('This explorer has no ∃!. For “exactly one x with P x”, write ∃x. P x ∧ (∀y. P y ⟶ y = x).',
      '模型探索器不支持 ∃!。要表达“恰好有一个 x 满足 P x”，请写 ∃x. P x ∧ (∀y. P y ⟶ y = x)。') }
    try { f = Logic.parse(src) } catch (e) { return { text: src, error: parseMessage(e.message) } }
    var shown = show(f)
    var problem = vocabularyProblem(f)
    if (!problem && boundCount(f) > MAX_BOUND) problem = t('This explorer evaluates formulas with at most ' + MAX_BOUND + ' quantified variables.',
      '模型探索器最多只能处理含 ' + MAX_BOUND + ' 个约束变元的公式。')
    if (problem) return { text: shown, error: problem }
    try {
      var val = Logic.holds(f, M, {})
      return { text: shown, val: val, why: explain(f, val, M) }
    } catch (e) {
      return { text: shown, error: t('Cannot evaluate this formula: ', '无法对这个公式求值：') + e.message }
    }
  }

  function drawFormulas(focusIndex) {
    var M = structure()
    items.textContent = ''
    if (!st.formulas.length) items.appendChild(h('li', { class: 'mx-item', text: t('No formulas yet: add one below.', '还没有公式：请在下面添加。') }))
    st.formulas.forEach(function (fm, i) {
      var r = evaluate(fm.src, M)
      var verdict = r.error ? h('span', { class: 'mx-v mx-err', text: t('error', '错误') })
        : h('span', { class: 'mx-v ' + (r.val ? 'fmw-t' : 'fmw-f'), text: r.val ? t('true', '真') : t('false', '假') })
      var del = h('button', { type: 'button', class: 'mx-del', 'aria-label': t('Remove ', '删除 ') + r.text, title: t('Remove', '删除'), text: '×',
        onclick: function () {
          st.formulas.splice(i, 1)
          drawFormulas(Math.min(i, st.formulas.length - 1))
          msg.textContent = t('Removed ' + r.text + '.', '已删除 ' + r.text + '。')
        } })
      var why = r.error ? [r.error] : r.why
      items.appendChild(h('li', { class: 'mx-item', 'data-i': String(i) }, h('span', { class: 'mx-f', text: r.text }), verdict, del,
        why ? h('span', { class: 'mx-why' }, why) : null))
    })
    if (focusIndex != null) {
      var dels = items.querySelectorAll('.mx-del')
      if (focusIndex >= 0 && dels[focusIndex]) dels[focusIndex].focus(); else input.focus()
    }
  }

  function addFormula() {
    var src = input.value.trim()
    var r
    try { r = evaluate(src, structure()) } catch (e) { r = { error: e.message } }
    if (r.error) { msg.textContent = r.error; return }
    st.formulas.push({ src: src })
    input.value = ''
    drawFormulas()
    msg.textContent = t('Added ' + r.text + ': ', '已添加 ' + r.text + '：') + (r.val ? t('true', '真') : t('false', '假')) + t('.', '。')
  }

  drawStructure()
  drawFormulas()
})
