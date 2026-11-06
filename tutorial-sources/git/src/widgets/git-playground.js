/* Git series — interactive demos. Two widgets, mounted on <div class="widget" data-widget="NAME">:
 *   three-areas   edit / git add / git commit, with the working folder, staging area and repository,
 *                 and the `git status` text Git prints in each state (captured from real Git)
 *   branch-graph  commit / new branch / switch / merge, drawing the history as it grows
 * No libraries. Text follows the page language (html lang="zh-CN" gives Chinese). */
(function () {
  'use strict'
  var zh = (document.documentElement.lang || '').indexOf('zh') === 0
  var T = zh ? {
    edit: '编辑 index.html', start: '重新开始', working: '工作文件夹', staging: '暂存区', repo: '仓库',
    empty: '（空）', noCommits: '（还没有提交）', version: '版本',
    commitN: function (n) { return '提交 ' + n }, edited: function (v) { return '你编辑了 index.html（现在是第 ' + v + ' 版）。' },
    commit: '提交', newBranch: '新建分支并切换', switchTo: '切换', mergeInto: '合并到当前分支', branchName: '分支名',
    badName: '分支名不能为空，也不能有空格。', exists: function (b) { return '已经有一个叫 ' + b + ' 的分支。' },
    full: '这个演示最多显示 14 个提交。点“重新开始”再试一次。', onBranch: function (b) { return '当前分支：' + b },
    numbered: '在这个演示里，提交用编号（c1、c2……）代替哈希值。',
  } : {
    edit: 'Edit index.html', start: 'Start again', working: 'Working folder', staging: 'Staging area', repo: 'Repository',
    empty: '(empty)', noCommits: '(no commits yet)', version: 'version',
    commitN: function (n) { return 'Commit ' + n }, edited: function (v) { return 'You edited index.html (it is now version ' + v + ').' },
    commit: 'Commit', newBranch: 'New branch and switch', switchTo: 'Switch', mergeInto: 'Merge into current branch', branchName: 'branch name',
    badName: 'A branch name cannot be empty or contain spaces.', exists: function (b) { return 'There is already a branch called ' + b + '.' },
    full: 'This demo shows up to 14 commits. Click "Start again" to try more.', onBranch: function (b) { return 'On branch ' + b },
    numbered: 'In this demo, commits are numbered (c1, c2, ...) instead of having hashes.',
  }

  function el(tag, attrs, kids) {
    var e = document.createElement(tag)
    for (var k in (attrs || {})) {
      if (k === 'text') e.textContent = attrs[k]
      else if (k === 'class') e.className = attrs[k]
      else e.setAttribute(k, attrs[k])
    }
    ;(kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c) })
    return e
  }
  function button(label, cls, onClick) {
    var b = el('button', { type: 'button', class: 'gw-btn' + (cls ? ' ' + cls : ''), text: label })
    b.addEventListener('click', onClick)
    return b
  }

  // ---- terminal output, coloured like a terminal ----
  function terminal(lines) {
    var pre = el('pre', { class: 'term-body gw-term' })
    var code = el('code')
    var section = ''
    lines.forEach(function (ln, i) {
      var span
      if (ln.indexOf('$ ') === 0) {
        span = el('span', { class: 't-line' }, [el('span', { class: 't-prompt', text: '$ ' }), el('span', { class: 't-cmd', text: ln.slice(2) })])
        section = ''
      } else {
        if (/^Changes to be committed:/.test(ln)) section = 'good'
        else if (/^(Changes not staged for commit|Untracked files):/.test(ln)) section = 'bad'
        else if (/^\S/.test(ln)) section = ''
        span = el('span', { class: 't-out' + (/^\t/.test(ln) && section ? ' t-' + section : ''), text: ln || ' ' })
      }
      code.appendChild(span)
      void i
    })
    pre.appendChild(code)
    return el('div', { class: 'term gw-termwrap' }, [el('div', { class: 'term-bar' }, [el('span', { class: 'term-dots' }, [el('i'), el('i'), el('i')]), el('span', { class: 'term-title', text: zh ? '终端' : 'Terminal' })]), pre])
  }

  // ======================================================================== three-areas
  // `git status` in each state, exactly as Git 2.56 prints it for a repository whose one file is index.html
  var STATUS = {
    new_untracked: 'On branch main\n\nNo commits yet\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tindex.html\n\nnothing added to commit but untracked files present (use "git add" to track)',
    new_staged: 'On branch main\n\nNo commits yet\n\nChanges to be committed:\n  (use "git rm --cached <file>..." to unstage)\n\tnew file:   index.html',
    new_staged_modified: 'On branch main\n\nNo commits yet\n\nChanges to be committed:\n  (use "git rm --cached <file>..." to unstage)\n\tnew file:   index.html\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   index.html',
    clean: 'On branch main\nnothing to commit, working tree clean',
    modified: 'On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   index.html\n\nno changes added to commit (use "git add" and/or "git commit -a")',
    staged: 'On branch main\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tmodified:   index.html',
    staged_modified: 'On branch main\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tmodified:   index.html\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   index.html',
  }

  function threeAreas(root) {
    var s
    function reset() { s = { work: 1, index: null, head: null, commits: [], last: [] }; draw() }
    function statusKey() {
      if (s.head === null) return s.index === null ? 'new_untracked' : s.work === s.index ? 'new_staged' : 'new_staged_modified'
      if (s.index === s.head) return s.work === s.head ? 'clean' : 'modified'
      return s.work === s.index ? 'staged' : 'staged_modified'
    }
    function act(kind) {
      if (kind === 'edit') { s.work += 1; s.last = [T.edited(s.work)] }
      if (kind === 'add') { s.index = s.work; s.last = ['$ git add index.html'] }
      if (kind === 'commit') {
        // Nothing staged: Git prints the status and refuses, saying "Initial commit" where
        // git status says "No commits yet" (wt-status.c, commit_template).
        if (s.index === null || s.index === s.head) s.last = ['$ git commit -m "..."'].concat(STATUS[statusKey()].replace('No commits yet', 'Initial commit').split('\n'))
        else {
          var n = s.commits.length + 1
          s.commits.push({ n: n, ver: s.index })
          s.head = s.index
          s.last = ['$ git commit -m "' + T.commitN(n) + '"']
        }
      }
      draw()
    }
    function chip(text, cls) { return el('span', { class: 'gw-chip ' + cls, text: text }) }
    function draw() {
      root.innerHTML = ''
      var bar = el('div', { class: 'gw-controls' }, [
        button(T.edit, 'secondary', function () { act('edit') }),
        button('git add index.html', 'mono', function () { act('add') }),
        button('git commit', 'mono', function () { act('commit') }),
        button(T.start, 'ghost', reset),
      ])
      var staged = s.index !== null && s.index !== s.head
      var dirty = s.index === null || s.work !== s.index
      var cols = el('div', { class: 'gw-cols' }, [
        el('div', { class: 'gw-col gw-work' }, [el('div', { class: 'gw-col-h', text: T.working }),
          chip('index.html · ' + T.version + ' ' + s.work, dirty ? 'bad' : 'plain')]),
        el('div', { class: 'gw-col gw-stage' }, [el('div', { class: 'gw-col-h', text: T.staging }),
          staged ? chip('index.html · ' + T.version + ' ' + s.index, 'good') : el('span', { class: 'gw-empty', text: T.empty })]),
        el('div', { class: 'gw-col gw-repo' }, [el('div', { class: 'gw-col-h', text: T.repo })].concat(
          s.commits.length ? s.commits.slice().reverse().map(function (c) { return chip(T.commitN(c.n) + ' · ' + T.version + ' ' + c.ver, 'commit') })
            : [el('span', { class: 'gw-empty', text: T.noCommits })])),
      ])
      var lines = s.last.concat(['$ git status']).concat(STATUS[statusKey()].split('\n'))
      root.appendChild(bar)
      root.appendChild(cols)
      root.appendChild(terminal(lines))
    }
    reset()
  }

  // ======================================================================== branch-graph
  function branchGraph(root) {
    var s
    var MAX = 14
    function reset() {
      s = { commits: [{ id: 'c1', parents: [], lane: 0 }], branches: { main: 'c1' }, lanes: { main: 0 }, head: 'main', log: [T.numbered] }
      draw()
    }
    function byId(id) { for (var i = 0; i < s.commits.length; i++) if (s.commits[i].id === id) return s.commits[i] }
    function ancestors(id) {
      var seen = {}, stack = [id]
      while (stack.length) { var c = byId(stack.pop()); if (!c || seen[c.id]) continue; seen[c.id] = true; stack.push.apply(stack, c.parents) }
      return seen
    }
    function newCommit(parents) {
      var id = 'c' + (s.commits.length + 1)
      s.commits.push({ id: id, parents: parents, lane: s.lanes[s.head] })
      s.branches[s.head] = id
      return id
    }
    function say(lines) { s.log = lines; draw() }
    function commit() {
      if (s.commits.length >= MAX) return say([T.full])
      var n = s.commits.length + 1
      var id = newCommit([s.branches[s.head]])
      say(['$ git commit -m "' + T.commitN(n) + '"', '[' + s.head + ' ' + id + '] ' + T.commitN(n)])
    }
    function branch(name) {
      name = (name || '').trim()
      if (!name || /\s/.test(name)) return say([T.badName])
      if (s.branches[name]) return say(['$ git switch -c ' + name, "fatal: a branch named '" + name + "' already exists"])
      var used = {}
      for (var b in s.lanes) used[s.lanes[b]] = true
      var lane = 1
      while (used[lane]) lane++
      s.lanes[name] = lane
      s.branches[name] = s.branches[s.head]
      s.head = name
      say(['$ git switch -c ' + name, "Switched to a new branch '" + name + "'"])
    }
    function switchTo(name) {
      if (name === s.head) return say(['$ git switch ' + name, "Already on '" + name + "'"])
      s.head = name
      say(['$ git switch ' + name, "Switched to branch '" + name + "'"])
    }
    function merge(name) {
      var mine = s.branches[s.head], theirs = s.branches[name]
      var cmd = '$ git merge ' + name
      if (ancestors(mine)[theirs]) return say([cmd, 'Already up to date.'])
      if (ancestors(theirs)[mine]) {
        s.branches[s.head] = theirs
        return say([cmd, 'Updating ' + mine + '..' + theirs, 'Fast-forward'])
      }
      if (s.commits.length >= MAX) return say([T.full])
      newCommit([mine, theirs])
      say([cmd, "Merge made by the 'ort' strategy."])
    }

    function svgEl(tag, attrs) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', tag)
      for (var k in attrs) e.setAttribute(k, attrs[k])
      return e
    }
    function graph() {
      var maxLane = 0
      for (var b in s.lanes) maxLane = Math.max(maxLane, s.lanes[b])
      var X = function (c) { return 34 + (Number(c.id.slice(1)) - 1) * 58 }
      var Y = function (c) { return 70 + c.lane * 64 }
      var w = Math.max(560, 34 + s.commits.length * 58 + 60), h = 70 + maxLane * 64 + (maxLane ? 76 : 40)
      var svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, class: 'gw-svg', role: 'img' })
      s.commits.forEach(function (c) {
        c.parents.forEach(function (pid) {
          var p = byId(pid)
          var d = Y(p) === Y(c) ? 'M' + X(p) + ' ' + Y(p) + ' L' + X(c) + ' ' + Y(c)
            : 'M' + X(p) + ' ' + Y(p) + ' C' + (X(p) + 30) + ' ' + Y(p) + ' ' + (X(c) - 30) + ' ' + Y(c) + ' ' + X(c) + ' ' + Y(c)
          svg.appendChild(svgEl('path', { d: d, stroke: '#475569', 'stroke-width': 2.2, fill: 'none' }))
        })
      })
      var current = s.branches[s.head]
      s.commits.forEach(function (c) {
        var isHead = c.id === current
        svg.appendChild(svgEl('circle', { cx: X(c), cy: Y(c), r: 11, fill: isHead ? '#DCFCE7' : '#FFFFFF', stroke: isHead ? '#15803D' : '#1A2E4A', 'stroke-width': 2.5 }))
        var t = svgEl('text', { x: X(c), y: c.lane === 0 ? Y(c) + 27 : Y(c) - 17, 'text-anchor': 'middle', 'font-size': 11, fill: '#64748B', 'font-family': "'DM Mono', monospace" })
        t.textContent = c.id
        svg.appendChild(t)
      })
      // branch labels above their commits, stacked when several point at the same one
      var stack = {}
      Object.keys(s.branches).sort(function (a, b) { return a === 'main' ? -1 : b === 'main' ? 1 : s.lanes[a] - s.lanes[b] }).forEach(function (b) {
        var c = byId(s.branches[b])
        var k = stack[c.id] = (stack[c.id] || 0) + 1
        var label = (b === s.head ? 'HEAD -> ' : '') + b
        var wid = label.length * 7.2 + 14
        // labels sit above commits on the main line and below commits on the other lines, away from the edges
        var y = c.lane === 0 ? Y(c) - 20 - k * 22 : Y(c) + 14 + k * 22
        svg.appendChild(svgEl('rect', { x: X(c) - wid / 2, y: y - 9, width: wid, height: 19, rx: 9.5, fill: b === s.head ? '#DBEAFE' : '#DCFCE7', stroke: b === s.head ? '#2563EB' : '#15803D', 'stroke-width': 1.3 }))
        var t = svgEl('text', { x: X(c), y: y + 4.5, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 600, fill: b === s.head ? '#2563EB' : '#15803D', 'font-family': "'DM Mono', monospace" })
        t.textContent = label
        svg.appendChild(t)
      })
      return el('div', { class: 'gw-graph' }, [svg])
    }
    function draw() {
      root.innerHTML = ''
      var names = Object.keys(s.branches)
      var input = el('input', { type: 'text', class: 'gw-input', placeholder: T.branchName, 'aria-label': T.branchName })
      var n = 1
      while (s.branches[n === 1 ? 'idea' : 'idea-' + n]) n++
      input.value = n === 1 ? 'idea' : 'idea-' + n
      var sw = el('select', { class: 'gw-select', 'aria-label': T.switchTo })
      names.forEach(function (b) { var o = el('option', { value: b, text: b }); if (b === s.head) o.selected = true; sw.appendChild(o) })
      var mg = el('select', { class: 'gw-select', 'aria-label': T.mergeInto })
      names.filter(function (b) { return b !== s.head }).forEach(function (b) { mg.appendChild(el('option', { value: b, text: b })) })
      var mergeBtn = button(T.mergeInto, '', function () { if (mg.value) merge(mg.value) })
      if (!mg.options.length) { mg.disabled = true; mergeBtn.disabled = true }
      root.appendChild(el('div', { class: 'gw-controls' }, [
        button(T.commit, '', commit),
        el('span', { class: 'gw-group' }, [input, button(T.newBranch, 'secondary', function () { branch(input.value) })]),
        el('span', { class: 'gw-group' }, [sw, button(T.switchTo, 'secondary', function () { switchTo(sw.value) })]),
        el('span', { class: 'gw-group' }, [mg, mergeBtn]),
        button(T.start, 'ghost', reset),
      ]))
      root.appendChild(el('div', { class: 'gw-status', text: T.onBranch(s.head) }))
      root.appendChild(graph())
      root.appendChild(terminal(s.log))
    }
    reset()
  }

  var WIDGETS = { 'three-areas': threeAreas, 'branch-graph': branchGraph }
  window.GitWidgets = {
    mountAll: function () {
      var nodes = document.querySelectorAll('.widget[data-widget]')
      for (var i = 0; i < nodes.length; i++) {
        var fn = WIDGETS[nodes[i].getAttribute('data-widget')]
        if (fn && !nodes[i].getAttribute('data-mounted')) {
          try { fn(nodes[i]); nodes[i].setAttribute('data-mounted', '1') } catch (e) { nodes[i].textContent = 'This demo could not start: ' + e.message }
        }
      }
    },
  }
})()
