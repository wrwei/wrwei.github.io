/* AI series — page behaviour. Runs deferred, after katex, highlight.js and widgets.js. */
(function () {
  'use strict'
  var MACROS = {
    '\\R': '\\mathbb{R}', '\\E': '\\mathbb{E}', '\\argmin': '\\operatorname*{arg\\,min}',
    '\\argmax': '\\operatorname*{arg\\,max}', '\\KL': '\\mathrm{KL}', '\\softmax': '\\operatorname{softmax}'
  }
  var zh = (document.documentElement.lang || '').indexOf('zh') === 0

  function store(k, v) {
    try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v) } catch (e) { return null }
  }

  // ---- maths ----
  function renderMath(root) {
    if (!window.katex) return
    var els = (root || document).querySelectorAll('.math-i, .math-d')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      if (el.getAttribute('data-done')) continue
      var tex = el.textContent
      try {
        window.katex.render(tex, el, { displayMode: el.classList.contains('math-d'), throwOnError: false, macros: MACROS, strict: 'ignore' })
      } catch (e) { el.classList.add('math-err') }
      el.setAttribute('data-done', '1')
    }
  }

  // ---- code ----
  function setupCode() {
    var blocks = document.querySelectorAll('pre > code')
    for (var i = 0; i < blocks.length; i++) {
      var code = blocks[i]
      var pre = code.parentNode
      var inOutput = pre.parentNode && pre.parentNode.classList && pre.parentNode.classList.contains('output')
      if (window.hljs && /language-(python|bash|sh|json|yaml|text|console|toml)/.test(code.className)) {
        try { window.hljs.highlightElement(code) } catch (e) { /* plain text is fine */ }
      }
      if (inOutput) continue
      var b = document.createElement('button')
      b.type = 'button'
      b.className = 'copy-btn'
      b.textContent = zh ? '复制' : 'Copy'
      b.addEventListener('click', (function (codeEl, btn) {
        return function () {
          var done = function () { btn.textContent = zh ? '已复制' : 'Copied'; btn.classList.add('ok'); setTimeout(function () { btn.textContent = zh ? '复制' : 'Copy'; btn.classList.remove('ok') }, 1500) }
          if (navigator.clipboard) navigator.clipboard.writeText(codeEl.textContent).then(done, function () {})
        }
      })(code, b))
      pre.appendChild(b)
    }
  }

  // ---- quizzes ----
  function setupQuizzes() {
    var quizzes = document.querySelectorAll('.quiz')
    for (var q = 0; q < quizzes.length; q++) (function (quiz) {
      var qs = quiz.querySelectorAll('.quiz-q')
      var scoreEl = quiz.querySelector('.quiz-score')
      function score() {
        var answered = 0, right = 0
        for (var i = 0; i < qs.length; i++) {
          if (qs[i].getAttribute('data-chosen') !== null) { answered++; if (qs[i].getAttribute('data-chosen') === qs[i].getAttribute('data-answer')) right++ }
        }
        scoreEl.textContent = answered ? (zh ? '得分 ' + right + ' / ' + answered + '（共 ' + qs.length + ' 题）' : 'Score ' + right + ' / ' + answered + ' answered (of ' + qs.length + ')') : ''
      }
      for (var i = 0; i < qs.length; i++) (function (qq) {
        var opts = qq.querySelectorAll('.quiz-opt')
        for (var j = 0; j < opts.length; j++) opts[j].addEventListener('click', function () {
          if (qq.getAttribute('data-chosen') !== null) return
          var chosen = this.getAttribute('data-i')
          var ans = qq.getAttribute('data-answer')
          qq.setAttribute('data-chosen', chosen)
          for (var k = 0; k < opts.length; k++) {
            opts[k].disabled = true
            if (opts[k].getAttribute('data-i') === ans) opts[k].classList.add('right')
            else if (opts[k].getAttribute('data-i') === chosen) opts[k].classList.add('wrong')
          }
          qq.querySelector('.quiz-expl').hidden = false
          score()
        })
      })(qs[i])
      quiz.querySelector('.quiz-reset').addEventListener('click', function () {
        for (var i = 0; i < qs.length; i++) {
          qs[i].removeAttribute('data-chosen')
          var opts = qs[i].querySelectorAll('.quiz-opt')
          for (var k = 0; k < opts.length; k++) { opts[k].disabled = false; opts[k].classList.remove('right', 'wrong') }
          qs[i].querySelector('.quiz-expl').hidden = true
        }
        score()
      })
    })(quizzes[q])
  }

  // ---- study plan ----
  function setupPlan() {
    var boxes = document.querySelectorAll('.session-done input[data-key]')
    if (!boxes.length) return
    var nEl = document.querySelector('.side-progress-n')
    var bar = document.querySelector('.side-progress-bar span')
    function refresh() {
      var done = 0
      for (var i = 0; i < boxes.length; i++) {
        var s = boxes[i].closest('.session')
        if (boxes[i].checked) { done++; s.classList.add('is-done') } else s.classList.remove('is-done')
      }
      if (nEl) nEl.textContent = done
      if (bar) bar.style.width = (100 * done / boxes.length) + '%'
    }
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].checked = store(boxes[i].getAttribute('data-key')) === '1'
      boxes[i].addEventListener('change', function () { store(this.getAttribute('data-key'), this.checked ? '1' : '0'); refresh() })
    }
    refresh()
  }

  // ---- navigation chrome ----
  function setupChrome() {
    var pb = document.getElementById('progress-bar')
    var dd = document.getElementById('moduleDropdown')
    if (dd) {
      var btn = dd.querySelector('.badge')
      btn.addEventListener('click', function (e) { e.stopPropagation(); var open = dd.classList.toggle('open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false') })
      document.addEventListener('click', function (e) { if (!dd.contains(e.target)) { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false') } })
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dd.classList.remove('open') })
    }
    var side = document.getElementById('sidebar')
    var links = side ? Array.prototype.slice.call(side.querySelectorAll('nav a')) : []
    var anchors = Array.prototype.slice.call(document.querySelectorAll('.section-anchor'))
    var last = ''
    function onScroll() {
      var h = document.documentElement
      if (pb) pb.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + '%'
      var cur = ''
      for (var i = 0; i < anchors.length; i++) if (window.scrollY >= anchors[i].offsetTop - 120) cur = anchors[i].id
      if (cur === last) return
      last = cur
      for (var j = 0; j < links.length; j++) {
        var on = links[j].getAttribute('href') === '#' + cur
        links[j].classList.toggle('active', on)
        if (on && side) {
          var top = links[j].offsetTop
          if (top < side.scrollTop + 60 || top > side.scrollTop + side.clientHeight - 60) side.scrollTop = top - side.clientHeight / 3
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  function start() {
    renderMath(document)
    setupCode()
    setupQuizzes()
    setupPlan()
    setupChrome()
    if (window.AIW && window.AIW.mountAll) window.AIW.mountAll(renderMath)
    // a hash may point inside content whose height changed after maths rendered
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView() }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
