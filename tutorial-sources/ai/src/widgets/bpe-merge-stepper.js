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
