/* parametric-curve (Module 16): trace a parametric or polar curve with its velocity vector.
 * The parameter (t, or the angle θ for the polar curves) runs in steps of π/120 from a slider or the
 * Play button. The plot shows the whole curve faintly, the part traced so far, the moving point and its
 * velocity ⟨x′, y′⟩, drawn at a fixed fraction of its length; for polar curves also the ray in the
 * direction θ and the segment from the pole to the point (which points backwards when r < 0); for the
 * cycloid also the rolling wheel. The readout gives the parameter, the point, the velocity and the
 * speed, from the exact derivatives of the built-in curves. The animation plays once by itself when the
 * widget first comes into view, unless the reader has touched a control or prefers reduced motion. */
CalcWidgets.register('parametric-curve', function (root, api) {
  var t = api.t, h = api.h, fmt = api.num.fmt
  var PI = Math.PI
  var N = 120                 // steps per π: the parameter is always k·π/120
  var DURATION = 6000         // milliseconds for a whole trace

  // Each curve: x(s), y(s) and their exact derivatives, the parameter range [0, K·π/120], the view
  // (width:height = 5:3, so that the plot keeps its height), and the scale at which the arrow is drawn.
  function polar(r, dr) {
    return {
      x: function (s) { return r(s) * Math.cos(s) }, y: function (s) { return r(s) * Math.sin(s) },
      dx: function (s) { return dr(s) * Math.cos(s) - r(s) * Math.sin(s) },
      dy: function (s) { return dr(s) * Math.sin(s) + r(s) * Math.cos(s) }, r: r,
    }
  }
  var CURVES = [
    { value: 'circle', label: t('circle', '圆'), K: 2 * N, scale: 0.5, view: [-2, 2, -1.2, 1.2],
      text: 'x = cos t,  y = sin t,  0 ≤ t ≤ 2π',
      x: Math.cos, y: Math.sin, dx: function (s) { return -Math.sin(s) }, dy: Math.cos },
    { value: 'ellipse', label: t('ellipse', '椭圆'), K: 2 * N, scale: 0.5, view: [-4.5, 4.5, -2.7, 2.7],
      text: 'x = 3 cos t,  y = 2 sin t,  0 ≤ t ≤ 2π',
      x: function (s) { return 3 * Math.cos(s) }, y: function (s) { return 2 * Math.sin(s) },
      dx: function (s) { return -3 * Math.sin(s) }, dy: function (s) { return 2 * Math.cos(s) } },
    { value: 'cycloid', label: t('cycloid', '摆线'), K: 2 * N, scale: 0.5, view: [-0.6, 6.9, -0.75, 3.75], wheel: true,
      text: 'x = t − sin t,  y = 1 − cos t,  0 ≤ t ≤ 2π',
      x: function (s) { return s - Math.sin(s) }, y: function (s) { return 1 - Math.cos(s) },
      dx: function (s) { return 1 - Math.cos(s) }, dy: Math.sin },
    { value: 'lissajous', label: t('Lissajous curve', '利萨如曲线'), K: 2 * N, scale: 0.25, view: [-2, 2, -1.2, 1.2],
      text: 'x = sin 2t,  y = sin 3t,  0 ≤ t ≤ 2π',
      x: function (s) { return Math.sin(2 * s) }, y: function (s) { return Math.sin(3 * s) },
      dx: function (s) { return 2 * Math.cos(2 * s) }, dy: function (s) { return 3 * Math.cos(3 * s) } },
    Object.assign({ value: 'cardioid', label: t('cardioid (polar)', '心形线（极坐标）'), K: 2 * N, scale: 0.5,
      view: [-1.6, 2.9, -1.35, 1.35], isPolar: true, rings: [1, 2], text: 'r = 1 + cos θ,  0 ≤ θ ≤ 2π' },
      polar(function (s) { return 1 + Math.cos(s) }, function (s) { return -Math.sin(s) })),
    Object.assign({ value: 'rose', label: t('rose (polar)', '玫瑰线（极坐标）'), K: N, scale: 0.25,
      view: [-1.75, 1.75, -1.05, 1.05], isPolar: true, rings: [0.5, 1], text: 'r = cos 3θ,  0 ≤ θ ≤ π' },
      polar(function (s) { return Math.cos(3 * s) }, function (s) { return -3 * Math.sin(3 * s) })),
    Object.assign({ value: 'spiral', label: t('spiral (polar)', '螺线（极坐标）'), K: 4 * N, scale: 0.25,
      view: [-9, 9, -6.3, 4.5], isPolar: true, rings: [PI, 2 * PI], text: 'r = θ/2,  0 ≤ θ ≤ 4π' },
      polar(function (s) { return s / 2 }, function () { return 0.5 })),
  ]
  var state = { c: CURVES[0], k: 0, playing: false, kf: 0, last: null, touched: false }

  // The parameter k·π/120 as a multiple of π, in lowest terms: "0", "π", "3π/4", "7π/120".
  function gcd(p, q) { while (q) { var r = p % q; p = q; q = r } return p }
  function piText(k) {
    if (k === 0) return '0'
    var g = gcd(k, N), p = k / g, q = N / g
    return (p === 1 ? '' : p) + 'π' + (q === 1 ? '' : '/' + q)
  }
  // A number to 4 significant digits, and whether those digits are its exact value.
  function show(v) {
    var s = fmt(v, 4), w = Number(s.replace(/−/g, '-').replace(/\s/g, ''))
    return { s: s, exact: isFinite(w) && Math.abs(v - w) <= 1e-9 * Math.max(1, Math.abs(v)) }
  }
  function tuple(vals, open, close) {
    var parts = vals.map(show)
    var exact = parts.every(function (p) { return p.exact })
    return (exact ? '= ' : '≈ ') + open + parts.map(function (p) { return p.s }).join(', ') + close
  }
  function param() { return state.k * PI / N }
  function scaleText(sc) {
    return sc === 1 ? t('at its full length', '按实际长度') : sc === 0.5 ? t('at half its length', '按其长度的一半') : t('at a quarter of its length', '按其长度的四分之一')
  }

  var sel = api.select({ label: t('Curve', '曲线'), value: CURVES[0].value,
    options: CURVES.map(function (c) { return { value: c.value, label: c.label } }),
    onchange: function (v) {
      touch(); stop()
      state.c = CURVES.filter(function (c) { return c.value === v })[0]
      state.k = 0
      S.input.max = state.c.K
      S.set(0)
      S.el.querySelector('label').textContent = state.c.isPolar ? 'θ' : 't'
      P.setView(state.c.view)
      update()
    } })
  var S = api.slider({ label: 't', min: 0, max: CURVES[0].K, step: 1, value: 0,
    fmt: function (k) { return (k * PI / N).toFixed(3) },
    oninput: function (k) { touch(); stop(); state.k = Math.round(k); update() } })
  var playBtn = api.button(t('Play', '播放'), function () { touch(); if (state.playing) stop(); else play() }, { primary: true })
  playBtn.classList.add('pc-play')
  var formulaEl = h('div', { class: 'pc-formula' })
  var keyEl = h('div', { class: 'pc-key' })
  var out = api.readout()
  out.classList.add('pc-readout')
  var plotBox = h('div', { class: 'pc-plot' })
  root.appendChild(api.row(sel.el))
  root.appendChild(formulaEl)
  root.appendChild(plotBox)
  root.appendChild(keyEl)
  root.appendChild(h('div', { class: 'pc-controls' }, S.el, playBtn))
  root.appendChild(out)
  api.css('parametric-curve', [
    '.pc-formula{font:600 1rem var(--font-mono);color:var(--blue);margin:.4rem 0 .5rem;white-space:pre-wrap}',
    '.pc-formula span{white-space:nowrap}',
    '.pc-key{font-size:.8rem;color:var(--slate);margin:.25rem 0}',
    '.pc-controls{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;margin:.5rem 0}',
    '.pc-controls .cw-slider{flex:1 1 220px}',
    '.pc-play{min-width:5.5em}',
  ].join(''))

  var P = api.plot(plotBox, {
    view: state.c.view, equal: true,
    label: t('A curve traced up to the current value of its parameter, with the velocity vector at the moving point',
      '描到参数当前值的曲线，以及动点处的速度向量'),
    draw: function (P) {
      var c = state.c, s = param(), end = c.K * PI / N
      P.axes()
      if (c.isPolar) c.rings.forEach(function (R) {
        P.param(function (u) { return R * Math.cos(u) }, function (u) { return R * Math.sin(u) }, 0, 2 * PI, { color: 'var(--border)', width: 1, layer: 'back' })
      })
      P.param(c.x, c.y, 0, end, { color: 'var(--muted)', width: 1.6, opacity: 0.6, samples: 900 })
      var x = c.x(s), y = c.y(s)
      if (c.wheel) {
        P.param(function (u) { return s + Math.cos(u) }, function (u) { return 1 + Math.sin(u) }, 0, 2 * PI, { color: 'var(--slate)', width: 1.2, opacity: 0.7 })
        P.line(s, 1, x, y, { color: 'var(--slate)', width: 1.2, opacity: 0.8 })
      }
      if (c.isPolar) {
        var reach = Math.max(c.view[1], -c.view[0], c.view[3], -c.view[2]) * 1.5
        P.line(0, 0, reach * Math.cos(s), reach * Math.sin(s), { color: 'var(--slate)', width: 1.2, dash: '5 4' })
        P.line(0, 0, x, y, { color: 'var(--navy)', width: 1.6 })
      }
      if (state.k > 0) P.param(c.x, c.y, 0, s, { color: 'var(--blue)', width: 2.8, samples: Math.max(20, Math.round(900 * state.k / c.K)) })
      var vx = c.dx(s), vy = c.dy(s), ex = x + c.scale * vx, ey = y + c.scale * vy
      if (Math.hypot(P.X(ex) - P.X(x), P.Y(ey) - P.Y(y)) > 4) {
        var g = P.arrow(x, y, ex, ey, { color: 'var(--orange)', width: 2.6, head: 11, layer: 'main' })
        g.setAttribute('class', 'pc-velocity')
      }
      P.point(x, y, { color: 'var(--navy)', r: 5 })
    },
  })

  function update() {
    var c = state.c, s = param(), name = c.isPolar ? 'θ' : 't'
    // One span per part, so that on a narrow screen the line breaks only between the parts.
    formulaEl.textContent = ''
    c.text.split('  ').forEach(function (part, i) {
      if (i) formulaEl.appendChild(document.createTextNode('  '))
      formulaEl.appendChild(h('span', { text: part }))
    })
    var keys = [t('Faint: the whole curve. Blue: the part traced so far. Orange arrow: the velocity, drawn ',
      '浅色：整条曲线。蓝色：已描出的部分。橙色箭头：速度向量，') + scaleText(c.scale) + t('.', '画出。')]
    if (c.isPolar) keys.push(t('Dashed: the ray in the direction θ.', '虚线：方向为 θ 的射线。'))
    if (c.wheel) keys.push(t('Grey: the rolling wheel.', '灰色：滚动的轮子。'))
    keyEl.textContent = keys.join(' ')
    var vx = c.dx(s), vy = c.dy(s), speed = Math.hypot(vx, vy)
    var lines = [name + ' = ' + piText(state.k) + (state.k ? ' ≈ ' + fmt(s, 4) : '')]
    if (c.isPolar) {
      var rv = c.r(s)
      lines[0] += ',  r ' + tuple([rv], '', '')
      if (rv < -1e-12) lines.push(t('r < 0: the point lies on the ray opposite to the direction θ', 'r < 0：点位于与方向 θ 相反的射线上'))
    }
    lines.push(t('point (x, y) ', '点 (x, y) ') + tuple([c.x(s), c.y(s)], '(', ')'))
    lines.push(t('velocity ', '速度 ') + (c.isPolar ? '⟨dx/dθ, dy/dθ⟩ ' : '⟨x′, y′⟩ ') + tuple([vx, vy], '⟨', '⟩'))
    var sp = show(speed)
    lines.push(t('speed ', '速率 ') + (speed < 1e-12 ? '= 0: ' + t('the point is momentarily at rest', '此刻点静止不动') : (sp.exact ? '= ' : '≈ ') + sp.s))
    out.textContent = lines.join('\n')
    P.redraw()
  }

  // The animation: about DURATION ms for the whole range, a step of π/120 at a time; it stops at the end.
  function frame(ts) {
    if (!state.playing) return
    if (state.last === null) state.last = ts
    state.kf += (ts - state.last) / DURATION * state.c.K
    state.last = ts
    var k = Math.min(state.c.K, Math.floor(state.kf))
    if (k !== state.k) { state.k = k; S.set(k); update() }
    if (k >= state.c.K) { stop(); return }
    window.requestAnimationFrame(frame)
  }
  function play() {
    if (state.k >= state.c.K) { state.k = 0; S.set(0) }
    state.playing = true
    state.kf = state.k
    state.last = null
    playBtn.textContent = t('Pause', '暂停')
    out.setAttribute('aria-live', 'off')      // no announcement for every frame
    update()
    window.requestAnimationFrame(frame)
  }
  function stop() {
    if (!state.playing) return
    state.playing = false
    playBtn.textContent = t('Play', '播放')
    out.setAttribute('aria-live', 'polite')
    update()
  }
  function touch() { state.touched = true }

  // Play once when the widget first comes into view, unless the reader prefers reduced motion or has
  // already used a control.
  if (window.IntersectionObserver) {
    var io = new window.IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting })) return
      io.disconnect()
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduce && !state.touched && !state.playing) play()
    }, { threshold: 0.6 })
    io.observe(root)
  }
  update()
})
