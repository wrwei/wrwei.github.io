/* Git and GitHub, Step by Step — page behaviour. Runs deferred. */
(function () {
  'use strict'
  var zh = (document.documentElement.lang || '').indexOf('zh') === 0
  var KEY = 'git-series:'

  function store(k, v) {
    try {
      if (v === undefined) return window.localStorage.getItem(KEY + k)
      if (v === null) window.localStorage.removeItem(KEY + k)
      else window.localStorage.setItem(KEY + k, v)
    } catch (e) { return null }
  }

  // ---- copy buttons: terminal blocks copy their commands only, file blocks the whole file ----
  function setupCopy() {
    var btns = document.querySelectorAll('.copy-btn[data-copy]')
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', function () {
      var btn = this
      var text = btn.getAttribute('data-copy')
      var label = btn.textContent
      var done = function () {
        btn.textContent = zh ? '已复制' : 'Copied'
        btn.classList.add('ok')
        setTimeout(function () { btn.textContent = label; btn.classList.remove('ok') }, 1400)
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {})
      else {
        var ta = document.createElement('textarea')
        ta.value = text; document.body.appendChild(ta); ta.select()
        try { document.execCommand('copy'); done() } catch (e) { /* nothing to do */ }
        document.body.removeChild(ta)
      }
    })
  }

  // ---- operating-system tabs: open the reader's system first, remember their choice ----
  function guessOS() {
    var saved = store('os')
    if (saved) return saved
    var p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '').toLowerCase()
    if (p.indexOf('win') >= 0) return 'windows'
    if (p.indexOf('mac') >= 0 || p.indexOf('iphone') >= 0 || p.indexOf('ipad') >= 0) return 'mac'
    if (p.indexOf('linux') >= 0 || p.indexOf('x11') >= 0) return 'linux'
    return 'windows'
  }
  function setupTabs() {
    var groups = document.querySelectorAll('.tabs')
    if (!groups.length) return
    var all = []
    function choose(key, remember) {
      if (remember) store('os', key)
      for (var g = 0; g < all.length; g++) all[g](key)
    }
    for (var g = 0; g < groups.length; g++) (function (group) {
      var panels = group.querySelectorAll(':scope > .tab-panel')
      var bar = group.querySelector(':scope > .tab-buttons')
      var buttons = []
      for (var i = 0; i < panels.length; i++) (function (panel) {
        var b = document.createElement('button')
        b.type = 'button'
        b.className = 'tab-btn'
        b.setAttribute('role', 'tab')
        b.textContent = panel.getAttribute('data-label')
        b.addEventListener('click', function () { choose(panel.getAttribute('data-tab'), true) })
        bar.appendChild(b)
        buttons.push(b)
      })(panels[i])
      all.push(function (key) {
        var found = false
        for (var i = 0; i < panels.length; i++) if (panels[i].getAttribute('data-tab') === key) found = true
        for (var j = 0; j < panels.length; j++) {
          var on = found ? panels[j].getAttribute('data-tab') === key : j === 0
          panels[j].classList.toggle('active', on)
          buttons[j].setAttribute('aria-selected', on ? 'true' : 'false')
        }
      })
      group.classList.add('ready')
    })(groups[g])
    choose(guessOS(), false)
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
        scoreEl.textContent = answered ? (zh ? '答对 ' + right + ' / ' + answered + '（共 ' + qs.length + ' 题）' : right + ' right out of ' + answered + ' answered (' + qs.length + ' questions)') : ''
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

  // ---- progress: lessons marked as done, kept in this browser ----
  function doneSet() {
    var out = {}
    var n = Number(document.body.getAttribute('data-lessons')) || 0
    for (var i = 1; i <= n; i++) if (store('done:' + i) === '1') out[i] = true
    return out
  }
  function fmt(label, d, n) { return label.replace('{d}', d).replace('{n}', n) }
  function setupProgress() {
    var n = Number(document.body.getAttribute('data-lessons')) || 0
    function refresh() {
      var done = doneSet()
      var count = Object.keys(done).length
      var marks = document.querySelectorAll('.dd-done[data-lesson]')
      for (var i = 0; i < marks.length; i++) marks[i].classList.toggle('is-done', !!done[marks[i].getAttribute('data-lesson')])
      var cards = document.querySelectorAll('.module-card[data-lesson]')
      for (var c = 0; c < cards.length; c++) cards[c].classList.toggle('is-done', !!done[cards[c].getAttribute('data-lesson')])
      var box = document.querySelector('.done-box')
      if (box) {
        var me = box.getAttribute('data-lesson')
        var btn = box.querySelector('.done-btn')
        var on = !!done[me]
        box.classList.toggle('is-done', on)
        btn.textContent = on ? '✓ ' + btn.getAttribute('data-yes') : btn.getAttribute('data-no')
        btn.title = on ? btn.getAttribute('data-undo') : ''
        var p = box.querySelector('.done-progress')
        if (p) p.textContent = fmt(p.getAttribute('data-label'), count, n)
      }
      var ip = document.querySelector('.index-progress')
      if (ip) {
        ip.querySelector('.ip-bar span').style.width = (n ? 100 * count / n : 0) + '%'
        ip.querySelector('.ip-text').textContent = fmt(ip.getAttribute('data-label'), count, n)
        var next = 0
        for (var k = 1; k <= n; k++) if (!done[k]) { next = k; break }
        var a = ip.querySelector('.ip-next')
        if (count && next) {
          var card = document.querySelector('.module-card[data-lesson="' + next + '"]')
          if (card) { a.href = card.getAttribute('href'); a.textContent = a.getAttribute('data-resume') + ' ' + (zh ? '第 ' + next + ' 课' : 'Lesson ' + next) + ' →' }
        } else if (count && !next) {
          a.style.display = 'none'
        }
      }
    }
    var btn = document.querySelector('.done-btn')
    if (btn) btn.addEventListener('click', function () {
      var me = document.querySelector('.done-box').getAttribute('data-lesson')
      store('done:' + me, store('done:' + me) === '1' ? null : '1')
      refresh()
    })
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
      for (var j = 0; j < links.length; j++) links[j].classList.toggle('active', links[j].getAttribute('href') === '#' + cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  function start() {
    setupCopy()
    setupTabs()
    setupQuizzes()
    setupProgress()
    setupChrome()
    if (window.GitWidgets && window.GitWidgets.mountAll) window.GitWidgets.mountAll()
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView() }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
