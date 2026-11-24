export const page = 'module_04'

// The slope, in data units, of a line the widget drew: its end points in pixels, with the plot's scaling undone
// (api.plot leaves an 8-pixel margin on each side).
async function drawnSlope(t, sel, view) {
  const r = await t.page.evaluate((root, sel) => {
    const svg = document.querySelector(root + ' svg.cw-plot'), ln = document.querySelector(root + ' ' + sel)
    if (!svg || !ln) return null
    const vb = svg.getAttribute('viewBox').split(' ').map(Number)
    return { W: vb[2], H: vb[3], x1: +ln.getAttribute('x1'), y1: +ln.getAttribute('y1'), x2: +ln.getAttribute('x2'), y2: +ln.getAttribute('y2') }
  }, t.root, sel)
  if (!r) return NaN
  const [x0, x1, y0, y1] = view
  return (-(r.y2 - r.y1) * (y1 - y0) / (r.H - 16)) / ((r.x2 - r.x1) * (x1 - x0) / (r.W - 16))
}

export async function run(t) {
  const val = sel => t.text(sel + ' .st-val')
  const SQ = [-3.3, 3.3, -1.5, 9.5]               // the view of x² in the widget

  // x² at a = 1 with h = 1: quotient 2a + h = 3, derivative 2, drawn with those slopes.
  t.check(await val('.st-hval') === '= 1' && await val('.st-dq') === '= 3', 'x² at a = 1, h = 1: the difference quotient is 3')
  t.check(await val('.st-der') === '= 2a = 2' && await val('.st-gap') === '= 1', 'f′(1) = 2a = 2, exactly; the gap is 1')
  t.check(Math.abs(await drawnSlope(t, '.st-secant', SQ) - 3) < 0.02 && Math.abs(await drawnSlope(t, '.st-tangent', SQ) - 2) < 0.02,
    'the secant is drawn with slope 3 and the tangent with slope 2')

  // Halving h halves the gap; a negative h gives the secant from the left.
  await t.click('Halve h')
  await t.click('Halve h')
  t.check(await val('.st-hval') === '= 0.25' && await val('.st-dq') === '= 2.25' && await val('.st-gap') === '= 0.25',
    'two halvings: h = 0.25, quotient 2.25, gap 0.25')
  await t.select('select >> nth=1', '-')
  t.check(await val('.st-hval') === '= −0.25' && await val('.st-dq') === '= 1.75' && await val('.st-gap') === '= −0.25',
    'h < 0: the secant from the left has slope 1.75')
  await t.set('input[type=range] >> nth=1', -3)
  t.check(await val('.st-hval') === '= −0.001' && await val('.st-dq') === '= 1.999' && await val('.st-gap') === '= −0.001',
    'the log slider at its end: h = −0.001, quotient 1.999')
  t.check(await t.attr('button.cw-btn', 'disabled') !== null, 'Halve h is disabled at the smallest step')

  // x³ and sin x: exact derivatives from formulas.
  await t.select('select >> nth=0', 'cube')
  t.check(await val('.st-dq') === '= 2.997001' && await val('.st-der') === '= 3a² = 3', 'x³ at 1 with h = −0.001: quotient 2.997001, derivative 3')
  await t.select('select >> nth=0', 'sin')
  t.check(await val('.st-der') === '= cos a ≈ 0.5403023' && (await t.text('.st-note')).includes('Module 5'), 'sin x at 1: f′(1) = cos 1 ≈ 0.5403023, credited to Module 5')

  // √x at 0: no derivative, a vertical tangent, and no secant to the left.
  await t.select('select >> nth=0', 'sqrt')
  await t.set('input[type=range] >> nth=0', 0)
  t.check(await val('.st-der') === 'does not exist' && await t.attr('.st-tangent', 'data-slope') === 'vertical' && await val('.st-dq') === '—',
    '√x at 0 with h < 0: no derivative, a vertical tangent, no secant')
  await t.select('select >> nth=1', '+')
  t.check(await val('.st-dq') === '≈ 31.62278', '√x at 0 with h = 0.001: the quotient 1/√h ≈ 31.62278')

  // A typed function: |x| at 0 has different one-sided slopes; a broken formula gives a message, not an error.
  await t.select('select >> nth=0', 'custom')
  await t.type('.st-field input', '|x|')
  await t.wait(400)
  t.check(await val('.st-der') === 'does not exist' && (await t.text('.st-msg')).includes('≈ −1') && (await t.text('.st-msg')).includes('≈ 1') && await val('.st-dq') === '= 1',
    '|x| at 0: the one-sided slopes −1 and 1 differ; the quotient for h > 0 is 1')
  await t.set('input[type=range] >> nth=0', 1)
  await t.type('.st-field input', 'x^3 - 3x')
  await t.wait(400)
  t.check(await val('.st-der') === '≈ 0 (numerical)', 'x³ − 3x at 1: the numerical derivative is ≈ 0')
  await t.type('.st-field input', 'x^')
  await t.wait(400)
  t.check((await t.text('.st-field .cw-msg')).length > 0 && await val('.st-dq') === '—' && await t.count('.st-secant') === 0,
    'an unfinished formula shows a message and draws no secant')
  await t.shot()
}
