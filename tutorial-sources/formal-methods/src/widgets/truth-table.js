// Truth-table explorer (Module 2, Propositional logic).
// The reader types a formula (Unicode or ASCII) and sees its truth table, how Isabelle groups it,
// its classification and a satisfying and a falsifying row; in Compare mode, two formulas are
// compared row by row. Uses FMWidgets.Logic for parsing, so priorities are Isabelle's.
FMWidgets.register('truth-table', function (root, api) {
  'use strict'
  var t = api.t, h = api.h, Logic = api.Logic
  var MAX_ATOMS = 6, MAX_SUB = 8
  var uid = 'tt' + Math.random().toString(36).slice(2, 8)

  api.css('truth-table', [
    '.tt-w [hidden]{display:none!important}',
    '.tt-w .tt-field{display:flex;flex-direction:column;gap:.2rem;margin:.45rem 0}',
    '.tt-w .tt-field label,.tt-w .tt-lab{font-size:.8rem;font-weight:600;color:var(--slate)}',
    '.tt-w .tt-field .fmw-input{flex:none;width:100%}',
    '.tt-w .tt-syms .fmw-btn{font-family:var(--font-isa,monospace);min-width:2.3rem;padding:.3rem .5rem}',
    '.tt-w .tt-presets .fmw-btn{font-size:.8rem}',
    '.tt-w .tt-check{display:flex;align-items:center;gap:.4rem;font-size:.85rem;color:var(--slate);margin:.3rem 0}',
    '.tt-w .tt-read{font-family:var(--font-isa,monospace);font-size:.85rem;color:var(--slate);margin:.5rem 0 .2rem;overflow-wrap:anywhere}',
    '.tt-w .tt-read b{font-family:var(--font-body,sans-serif);font-weight:600}',
    '.tt-w .verdict{font-weight:700;margin:.5rem 0 .15rem;font-size:.92rem}',
    '.tt-w .verdict.taut{color:var(--green,#15803D)}.tt-w .verdict.contra{color:var(--red,#B91C1C)}.tt-w .verdict.cont{color:var(--blue,#2563EB)}',
    '.tt-w .verdict.err{color:var(--red,#B91C1C);font-weight:600}',
    '.tt-w .tt-rows{margin:.1rem 0 .3rem;padding:0;list-style:none;font-size:.85rem;color:var(--slate)}',
    '.tt-w .tt-rows li{margin:.15rem 0;padding-left:1.4rem;position:relative}',
    '.tt-w .tt-rows .mk{position:absolute;left:0;top:0;font-weight:700}',
    '.tt-w table.tt-table{border-collapse:collapse;width:auto;margin:.4rem 0;font-family:var(--font-isa,monospace);font-size:.86rem}',
    '.tt-w table.tt-table th{background:var(--navy,#1A2E4A);color:#fff;font-weight:600;padding:.3rem .55rem;text-align:center;white-space:nowrap;font-size:.84rem}',
    '.tt-w table.tt-table td{padding:.22rem .55rem;text-align:center;border-bottom:1px solid var(--border,#E2E8F0);color:var(--navy,#1A2E4A);font-weight:400}',
    '.tt-w table.tt-table td.v-t{color:var(--green,#15803D)}.tt-w table.tt-table td.v-f{color:var(--red,#B91C1C)}',
    '.tt-w table.tt-table th.main,.tt-w table.tt-table td.main{border-left:2px solid var(--sky,#0EA5E9);font-weight:700}',
    '.tt-w table.tt-table td.n{color:var(--muted,#94A3B8);font-size:.78rem;text-align:right;white-space:nowrap}',
    '.tt-w table.tt-table tr.sat td{background:var(--green-bg,#F0FDF4)}',
    '.tt-w table.tt-table tr.fal td{background:var(--red-bg,#FEF2F2)}',
    '.tt-w table.tt-table tr.diff td{background:var(--amber-bg,#FFFBEB)}',
    '.tt-w table.tt-table tr.sat td.n,.tt-w table.tt-table tr.fal td.n,.tt-w table.tt-table tr.diff td.n{color:var(--navy,#1A2E4A);font-weight:700}',
    '.tt-w .tt-help{font-size:.8rem}',
  ].join('\n'))

  // ------------------------------------------------------------------ strings
  var PRESETS = [
    { id: 'lem', en: 'Excluded middle', zh: '排中律', f: 'A ∨ ¬A' },
    { id: 'contra', en: 'Contradiction', zh: '矛盾式', f: 'A ∧ ¬A' },
    { id: 'demorgan', en: 'De Morgan', zh: '德摩根律', f: '¬(A ∧ B) ⟷ ¬A ∨ ¬B' },
    { id: 'chain', en: 'Implication chain', zh: '蕴涵链', f: '(A ⟶ B) ∧ (B ⟶ C) ⟶ (A ⟶ C)' },
    { id: 'peirce', en: 'Peirce’s law', zh: '皮尔士定律', f: '((A ⟶ B) ⟶ A) ⟶ A' },
    { id: 'door', en: 'Door rule', zh: '门禁规则', f: 'opens ⟶ badge ∧ pin ∨ fire' },
  ]
  var PAIRS = [
    { id: 'imp', en: 'Implication', zh: '蕴涵', a: 'A ⟶ B', b: '¬A ∨ B' },
    { id: 'contrapos', en: 'Contrapositive', zh: '逆否', a: 'A ⟶ B', b: '¬B ⟶ ¬A' },
    { id: 'converse', en: 'Converse', zh: '逆命题', a: 'A ⟶ B', b: 'B ⟶ A' },
    { id: 'demorgan2', en: 'De Morgan', zh: '德摩根律', a: '¬(A ∧ B)', b: '¬A ∨ ¬B' },
    { id: 'wrongdm', en: 'Wrong De Morgan', zh: '错误的德摩根律', a: '¬(A ∧ B)', b: '¬A ∧ ¬B' },
    { id: 'distrib', en: 'Distributivity', zh: '分配律', a: 'A ∨ B ∧ C', b: '(A ∨ B) ∧ (A ∨ C)' },
  ]
  var SYMS = ['¬', '∧', '∨', '⟶', '⟷', '(', ')']

  // Core parser messages, in Chinese.
  function msgZh(m) {
    var r
    if ((r = m.match(/^expected (.+) before (.+)$/))) return '在 ' + r[2] + ' 之前应为 ' + r[1].replace('a term', '一个项')
    if ((r = m.match(/^expected (.+) at the end$/))) return '公式末尾缺少 ' + r[1].replace('a term', '一个项')
    if (m === 'unexpected end of formula') return '公式不完整'
    if ((r = m.match(/^unexpected (.+)$/))) return '此处不应出现 ' + r[1]
    if ((r = m.match(/^cannot read "(.*)"$/))) return '无法识别 “' + r[1] + '”'
    if (m === 'empty formula') return '公式为空'
    if (m === 'a number is not a formula') return '数字不是公式'
    return m
  }
  function why(e) { var m = String(e && e.message || e); return t(m, msgZh(m)) }

  // ------------------------------------------------------------------ formulas
  var KIND_OK = { const: 1, not: 1, and: 1, or: 1, imp: 1, iff: 1 }
  // The first part of the formula that is not propositional, or null.
  function nonProp(f) {
    if (f.k === 'atom') return f.args.length ? f : null
    if (!KIND_OK[f.k]) return f
    var parts = f.k === 'not' ? [f.a] : f.k === 'const' ? [] : [f.l, f.r]
    for (var i = 0; i < parts.length; i++) { var b = nonProp(parts[i]); if (b) return b }
    return null
  }
  // Symbols that look like connectives but are not Isabelle's.
  function lookalike(s) {
    var m = s.match(/[→⇒⊃↔⇔≡]/)
    if (!m) return null
    var c = m[0]
    if (c === '≡') return t('≡ is not a connective: it says that two formulas are equivalent. Write ⟷, or use “Compare two formulas”.',
      '≡ 不是联结词：它表示两个公式等价。请写 ⟷，或者使用“比较两个公式”。')
    if (c === '↔' || c === '⇔') return t(c + ' is not Isabelle’s symbol for “if and only if”: write ⟷ (type <-->).',
      c + ' 不是 Isabelle 中表示“当且仅当”的符号：请写 ⟷（输入 <-->）。')
    return t(c + ' is not Isabelle’s symbol for implication: write ⟶ (type -->).', c + ' 不是 Isabelle 中表示蕴涵的符号：请写 ⟶（输入 -->）。')
  }
  // {ast} or {error}
  function read(src) {
    var s = String(src || '').trim()
    if (!s) return { error: t('Type a formula.', '请输入一个公式。'), empty: true }
    var look = lookalike(s)
    if (look) return { error: look }
    var ast
    try { ast = Logic.parse(s) } catch (e) { return { error: t('Cannot read the formula: ', '无法读取公式：') + why(e) + t('.', '。') } }
    var bad = nonProp(ast)
    if (bad) {
      var shown = '“' + Logic.show(bad) + '”'
      if (bad.k === 'eq') return { error: t(shown + ' uses = or ≠. Between formulas Isabelle reads = as ⟷, but = binds more tightly than every connective, so A ∧ B = B ∧ A means A ∧ (B = B) ∧ A. Write ⟷ in this widget.',
        shown + ' 用了 = 或 ≠。在公式之间，Isabelle 把 = 读作 ⟷，但 = 比所有联结词结合得都紧，所以 A ∧ B = B ∧ A 的意思是 A ∧ (B = B) ∧ A。在本组件中请写 ⟷。') }
      return { error: bad.k === 'atom'
        ? t(shown + ' is not a propositional formula. Is a connective missing between two atoms?', shown + ' 不是命题公式。两个原子之间是否缺少联结词？')
        : t(shown + ' is not a propositional formula. This widget handles atoms, True, False, ¬ ∧ ∨ ⟶ ⟷ and parentheses.',
          shown + ' 不是命题公式。本组件只处理原子、True、False、¬ ∧ ∨ ⟶ ⟷ 和括号。') }
    }
    return { ast: ast }
  }
  // A formula as Isabelle prints it, except that ⟶ inside ⟷ and ⟷ inside ⟶ keep their parentheses
  // (Logic.show drops them, since the two have the same priority; Module 2 advises writing them).
  function clarify(f) {
    if (f.k === 'not') return { k: 'not', a: clarify(f.a) }
    if (f.k !== 'and' && f.k !== 'or' && f.k !== 'imp' && f.k !== 'iff') return f
    var g = { k: f.k, l: clarify(f.l), r: clarify(f.r) }
    if (f.k === 'imp' || f.k === 'iff') ['l', 'r'].forEach(function (s) {
      var c = g[s]
      if ((c.k === 'imp' || c.k === 'iff') && c.k !== f.k) g[s] = { k: 'atom', name: '(' + Logic.show(c) + ')', args: [] }
    })
    return g
  }
  function disp(f) { return Logic.show(clarify(f)) }
  // The equivalence of two formulas, with each side in parentheses if it is an implication or equivalence.
  function eqv(a, b) {
    function side(x) { var s = disp(x); return x.k === 'imp' || x.k === 'iff' ? '(' + s + ')' : s }
    return side(a) + ' ⟷ ' + side(b)
  }
  // The formula with every grouping made explicit (except around the whole formula).
  function full(f, inner) {
    var s
    switch (f.k) {
      case 'const': return f.v ? 'True' : 'False'
      case 'atom': return f.name
      case 'not': s = '¬' + (f.a.k === 'atom' || f.a.k === 'const' ? full(f.a, false) : full(f.a, true)); break
      default: s = full(f.l, true) + ' ' + { and: '∧', or: '∨', imp: '⟶', iff: '⟷' }[f.k] + ' ' + full(f.r, true)
    }
    return inner ? '(' + s + ')' : s
  }
  // Compound sub-formulas below the root, without repeats, in the order you compute them by hand.
  function subformulas(f) {
    var out = [], seen = {}
    function walk(g, depth) {
      if (g.k === 'atom' || g.k === 'const') return
      if (g.k === 'not') walk(g.a, depth + 1)
      else { walk(g.l, depth + 1); walk(g.r, depth + 1) }
      var key = disp(g)
      if (depth > 0 && !seen[key]) { seen[key] = 1; out.push({ f: g, depth: depth, label: key }) }
    }
    walk(f, 0)
    if (out.length > MAX_SUB) {
      var keep = out.slice().sort(function (a, b) { return a.depth - b.depth }).slice(0, MAX_SUB)
      out = out.filter(function (x) { return keep.indexOf(x) >= 0 })
    }
    return out
  }
  function valuations(atoms) {
    var rows = [], n = atoms.length
    for (var r = 0; r < Math.pow(2, n); r++) {
      var v = {}
      atoms.forEach(function (a, i) { v[a] = !((r >> (n - 1 - i)) & 1) })   // first row: all T, as on the page
      rows.push(v)
    }
    return rows
  }
  function TF(b) { return b ? 'T' : 'F' }
  function describe(atoms, v) {
    return atoms.length ? atoms.map(function (a) { return a + ' = ' + TF(v[a]) }).join(', ') : t('(no atoms)', '（没有原子）')
  }
  function atomsOf(asts) {
    var acc = []
    asts.forEach(function (f) { Logic.atoms(f).forEach(function (a) { if (acc.indexOf(a) < 0) acc.push(a) }) })
    return acc.sort()
  }
  function tooMany(n) {
    return t('This has ' + n + ' atoms, so its table would have ' + Math.pow(2, n) + ' rows. The widget shows tables with at most ' +
      MAX_ATOMS + ' atoms (' + Math.pow(2, MAX_ATOMS) + ' rows). Use fewer atoms, or let Isabelle decide the question.',
      '它有 ' + n + ' 个原子，真值表将有 ' + Math.pow(2, n) + ' 行。本组件最多显示 ' + MAX_ATOMS + ' 个原子（' +
      Math.pow(2, MAX_ATOMS) + ' 行）的真值表。请减少原子，或交给 Isabelle 判断。')
  }

  // ------------------------------------------------------------------ the page
  var mode = 'single', lastInput = null
  var btnSingle = h('button', { type: 'button', class: 'fmw-btn', 'data-mode': 'single', 'aria-pressed': 'true' }, t('One formula', '单个公式'))
  var btnCompare = h('button', { type: 'button', class: 'fmw-btn', 'data-mode': 'compare', 'aria-pressed': 'false' }, t('Compare two formulas', '比较两个公式'))
  var in1 = h('input', { id: uid + '-1', class: 'fmw-input tt-f1', type: 'text', value: 'A ⟶ B', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off' })
  var in2 = h('input', { id: uid + '-2', class: 'fmw-input tt-f2', type: 'text', value: '¬A ∨ B', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off' })
  var lab1 = h('label', { for: uid + '-1' }, t('Formula', '公式'))
  var field2 = h('div', { class: 'tt-field tt-second', hidden: true }, h('label', { for: uid + '-2' }, t('Second formula', '第二个公式')), in2)
  var subBox = h('input', { type: 'checkbox', class: 'tt-sub', checked: true })
  var subLabel = h('label', { class: 'tt-check' }, subBox, t('Show sub-formulas', '显示子公式'))
  var presetRow = h('div', { class: 'fmw-row tt-presets', role: 'group', 'aria-label': t('Examples', '示例') })
  var symRow = h('div', { class: 'fmw-row tt-syms', role: 'group', 'aria-label': t('Insert a symbol', '插入符号') })
  var readLine = h('p', { class: 'tt-read' })
  var verdict = h('p', { class: 'verdict', 'aria-live': 'polite' })
  var rowsList = h('ul', { class: 'tt-rows' })
  var tableWrap = h('div', { class: 'fmw-scroll' })
  var help = h('p', { class: 'fmw-msg tt-help' }, t('Type ~ & | --> <--> for ¬ ∧ ∨ ⟶ ⟷, or use the buttons. Priorities are Isabelle’s: ¬ binds most tightly, then ∧, then ∨, then ⟶ and ⟷, which group to the right.',
    '可输入 ~ & | --> <--> 代表 ¬ ∧ ∨ ⟶ ⟷，也可以使用按钮。优先级与 Isabelle 相同：¬ 结合最紧，其次是 ∧，再次是 ∨，最后是 ⟶ 和 ⟷，二者向右结合。'))

  SYMS.forEach(function (s) {
    symRow.appendChild(h('button', { type: 'button', class: 'fmw-btn fmw-sym', 'data-sym': s, 'aria-label': t('Insert ', '插入 ') + s, onclick: function () { insert(s) } }, s))
  })
  ;[in1, in2].forEach(function (inp) {
    inp.addEventListener('focus', function () { lastInput = inp })
    inp.addEventListener('input', render)
  })
  subBox.addEventListener('change', render)
  btnSingle.addEventListener('click', function () { setMode('single') })
  btnCompare.addEventListener('click', function () { setMode('compare') })

  root.appendChild(h('div', { class: 'fmw tt-w' },
    h('div', { class: 'fmw-row', role: 'group', 'aria-label': t('Mode', '模式') }, btnSingle, btnCompare),
    h('div', { class: 'tt-field' }, lab1, in1),
    field2,
    symRow,
    h('div', { class: 'tt-lab' }, t('Examples:', '示例：')),
    presetRow,
    subLabel,
    readLine, verdict, rowsList, tableWrap, help))

  function insert(s) {
    var inp = lastInput || in1
    if (inp === in2 && mode !== 'compare') inp = in1
    var a = inp.selectionStart == null ? inp.value.length : inp.selectionStart
    var b = inp.selectionEnd == null ? a : inp.selectionEnd
    inp.value = inp.value.slice(0, a) + s + inp.value.slice(b)
    inp.focus()
    try { inp.setSelectionRange(a + s.length, a + s.length) } catch (e) { /* not all inputs support it */ }
    render()
  }
  function setMode(m) {
    mode = m
    btnSingle.setAttribute('aria-pressed', m === 'single' ? 'true' : 'false')
    btnCompare.setAttribute('aria-pressed', m === 'compare' ? 'true' : 'false')
    field2.hidden = m !== 'compare'
    subLabel.hidden = m === 'compare'
    lab1.textContent = m === 'compare' ? t('First formula', '第一个公式') : t('Formula', '公式')
    buildPresets()
    render()
  }
  function buildPresets() {
    presetRow.textContent = ''
    if (mode === 'single') {
      PRESETS.forEach(function (p) {
        presetRow.appendChild(h('button', { type: 'button', class: 'fmw-btn', 'data-preset': p.id, title: p.f,
          onclick: function () { in1.value = p.f; render() } }, t(p.en, p.zh)))
      })
    } else {
      PAIRS.forEach(function (p) {
        presetRow.appendChild(h('button', { type: 'button', class: 'fmw-btn', 'data-preset': p.id, title: p.a + '   |   ' + p.b,
          onclick: function () { in1.value = p.a; in2.value = p.b; render() } }, t(p.en, p.zh)))
      })
    }
  }

  function clearOut() {
    readLine.textContent = ''; verdict.textContent = ''; verdict.className = 'verdict'
    rowsList.textContent = ''; tableWrap.textContent = ''
  }
  function fail(text) { clearOut(); verdict.className = 'verdict err'; verdict.textContent = text }
  function cell(b, extra) { return h('td', { class: (b ? 'v-t' : 'v-f') + (extra ? ' ' + extra : '') }, TF(b)) }

  function render() {
    try { mode === 'single' ? renderSingle() : renderCompare() } catch (e) { fail(t('Something went wrong: ', '出错了：') + why(e)) }
  }

  function renderSingle() {
    var p = read(in1.value)
    if (p.error) return fail(p.error)
    var f = p.ast, atoms = atomsOf([f])
    if (atoms.length > MAX_ATOMS) return fail(tooMany(atoms.length))
    clearOut()
    readLine.appendChild(h('b', null, t('Isabelle reads it as: ', 'Isabelle 的读法：')))
    readLine.appendChild(document.createTextNode(full(f, false)))
    var subs = subBox.checked ? subformulas(f) : []
    var vals = valuations(atoms)
    var rows = vals.map(function (v) { return { v: v, subs: subs.map(function (s) { return Logic.evalProp(s.f, v) }), val: Logic.evalProp(f, v) } })
    var nTrue = rows.filter(function (r) { return r.val }).length, n = rows.length
    var firstT = -1, firstF = -1
    rows.forEach(function (r, i) { if (r.val && firstT < 0) firstT = i; if (!r.val && firstF < 0) firstF = i })
    if (nTrue === n) { verdict.className = 'verdict taut'; verdict.textContent = t(n === 1 ? 'Tautology: true in its only row.' : 'Tautology: true in all ' + n + ' rows.', n === 1 ? '重言式：唯一的一行为真。' : '重言式：全部 ' + n + ' 行都为真。') }
    else if (nTrue === 0) { verdict.className = 'verdict contra'; verdict.textContent = t(n === 1 ? 'Contradiction: false in its only row.' : 'Contradiction: false in all ' + n + ' rows.', n === 1 ? '矛盾式：唯一的一行为假。' : '矛盾式：全部 ' + n + ' 行都为假。') }
    else { verdict.className = 'verdict cont'; verdict.textContent = t('Satisfiable but not valid: true in ' + nTrue + ' of ' + n + ' rows.', '可满足但非有效：' + n + ' 行中有 ' + nTrue + ' 行为真。') }
    rowsList.appendChild(h('li', { class: 'tt-satrow' }, h('span', { class: 'mk', 'aria-hidden': 'true' }, '✓'), firstT >= 0
      ? t('Row ' + (firstT + 1) + ' makes it true (a model): ', '第 ' + (firstT + 1) + ' 行使它为真（一个模型）：') + describe(atoms, rows[firstT].v)
      : t('No row makes it true.', '没有使它为真的行。')))
    rowsList.appendChild(h('li', { class: 'tt-falrow' }, h('span', { class: 'mk', 'aria-hidden': 'true' }, '✗'), firstF >= 0
      ? t('Row ' + (firstF + 1) + ' makes it false (a counterexample): ', '第 ' + (firstF + 1) + ' 行使它为假（一个反例）：') + describe(atoms, rows[firstF].v)
      : t('No row makes it false.', '没有使它为假的行。')))
    var head = h('tr', null, h('th', { scope: 'col' }, '#'),
      atoms.map(function (a) { return h('th', { scope: 'col' }, a) }),
      subs.map(function (s) { return h('th', { scope: 'col' }, s.label) }),
      h('th', { scope: 'col', class: 'main' }, disp(f)))
    var body = rows.map(function (r, i) {
      var cls = i === firstT ? 'sat' : i === firstF ? 'fal' : null
      var mark = i === firstT ? ' ✓' : i === firstF ? ' ✗' : ''
      return h('tr', { class: cls }, h('td', { class: 'n' }, (i + 1) + mark),
        atoms.map(function (a) { return cell(r.v[a]) }), r.subs.map(function (b) { return cell(b) }), cell(r.val, 'main'))
    })
    tableWrap.appendChild(h('table', { class: 'tt-table' }, h('thead', null, head), h('tbody', null, body)))
  }

  function renderCompare() {
    var p = read(in1.value), q = read(in2.value)
    if (p.error) return fail(t('First formula: ', '第一个公式：') + p.error)
    if (q.error) return fail(t('Second formula: ', '第二个公式：') + q.error)
    var atoms = atomsOf([p.ast, q.ast])
    if (atoms.length > MAX_ATOMS) return fail(tooMany(atoms.length))
    clearOut()
    readLine.appendChild(h('b', null, t('Isabelle reads them as: ', 'Isabelle 的读法：')))
    readLine.appendChild(document.createTextNode(full(p.ast, false) + '   ' + t('and', '与') + '   ' + full(q.ast, false)))
    var rows = valuations(atoms).map(function (v) { return { v: v, a: Logic.evalProp(p.ast, v), b: Logic.evalProp(q.ast, v) } })
    var diff = []
    rows.forEach(function (r, i) { if (r.a !== r.b) diff.push(i + 1) })
    var n = rows.length
    if (!diff.length) {
      verdict.className = 'verdict taut'
      verdict.textContent = t('Equivalent: the two formulas agree in all ' + n + (n === 1 ? ' row' : ' rows') + ', so ' + eqv(p.ast, q.ast) + ' is a tautology.',
        '等价：两个公式在全部 ' + n + ' 行中取值相同，所以 ' + eqv(p.ast, q.ast) + ' 是重言式。')
    } else {
      verdict.className = 'verdict contra'
      verdict.textContent = t('Not equivalent: they differ in ' + diff.length + ' of ' + n + ' rows (marked ≠).', '不等价：' + n + ' 行中有 ' + diff.length + ' 行取值不同（标记为 ≠）。')
      var r0 = rows[diff[0] - 1]
      rowsList.appendChild(h('li', { class: 'tt-diffrow' }, h('span', { class: 'mk', 'aria-hidden': 'true' }, '≠'),
        t('Row ' + diff[0] + ': ' + describe(atoms, r0.v) + ', where the first formula is ' + TF(r0.a) + ' and the second ' + TF(r0.b) + '.',
          '第 ' + diff[0] + ' 行：' + describe(atoms, r0.v) + '，此时第一个公式为 ' + TF(r0.a) + '，第二个为 ' + TF(r0.b) + '。')))
    }
    var head = h('tr', null, h('th', { scope: 'col' }, '#'), atoms.map(function (a) { return h('th', { scope: 'col' }, a) }),
      h('th', { scope: 'col', class: 'main' }, disp(p.ast)), h('th', { scope: 'col' }, disp(q.ast)))
    var body = rows.map(function (r, i) {
      var d = r.a !== r.b
      return h('tr', { class: d ? 'diff' : null }, h('td', { class: 'n' }, (i + 1) + (d ? ' ≠' : '')),
        atoms.map(function (a) { return cell(r.v[a]) }), cell(r.a, 'main'), cell(r.b))
    })
    tableWrap.appendChild(h('table', { class: 'tt-table' }, h('thead', null, head), h('tbody', null, body)))
  }

  buildPresets()
  render()
})
