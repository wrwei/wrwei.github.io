export const page = 'module_18'

// The readout as one string; the live value of a control (a property, not the attribute).
const readout = async t => (await t.texts('.lg-readout div')).join(' | ')
const selects = t => t.page.$$eval(t.root + ' select', els => els.map(e => e.value))
// The tips of the two arrows (the first point of each arrowhead): whether both lie at least 5 px inside the plot's
// clipping rectangle (so that the whole head shows), and the ratio of their distances from the point.
const tips = t => t.page.$eval(t.root, el => {
  const b = ['x', 'y', 'width', 'height'].map(a => +el.querySelector('clipPath rect').getAttribute(a))
  const p = el.querySelector('.lg-point'), P = [+p.getAttribute('cx'), +p.getAttribute('cy')]
  const tip = sel => el.querySelector(sel + ' path').getAttribute('d').match(/^M\s*([-\d.e]+)[ ,]+([-\d.e]+)/).slice(1).map(Number)
  const f = tip('.lg-grad-f'), g = tip('.lg-grad-g')
  const inside = q => q[0] > b[0] + 5 && q[0] < b[0] + b[2] - 5 && q[1] > b[1] + 5 && q[1] < b[1] + b[3] - 5
  return { inside: inside(f) && inside(g), ratio: Math.hypot(f[0] - P[0], f[1] - P[1]) / Math.hypot(g[0] - P[0], g[1] - P[1]) }
})

export async function run(t) {
  // Start: f = xy on the ellipse x²/4 + y² = 1 at t = 20°, where f = sin 40° is still increasing with t.
  let r = await readout(t)
  t.check(r.includes('t = 20°') && r.includes('Not parallel') && r.includes('f increases as t increases') && r.includes('xy ≈ 0.64279'),
    'starts with xy on the ellipse at t = 20°: f = sin 40° ≈ 0.64279, not parallel, f increasing')
  t.check((await t.count('.lg-levels path')) === 6 && (await t.count('path.lg-constraint')) === 1 &&
    (await t.count('.lg-grad-f')) === 1 && (await t.count('.lg-grad-g')) === 1 && (await t.count('.lg-value')) >= 4,
    'draws six labelled level curves, the constraint curve and the two gradient arrows')
  const d = await t.attr('.lg-level path', 'd')
  t.check(d && d.length > 50, 'draws the level curve of f through the point')

  // Example 18.5: the maximum of xy on the ellipse is at t = 45°, the point (√2, √2/2), with λ = 1 and f = 1.
  await t.set('input[type=range]', 45)
  r = await readout(t)
  t.check(r.includes('Parallel: a candidate') && r.includes('λ = |∇f| / |∇g| = 1 ') && r.includes('xy = 1') && r.includes('(1.4142, 0.70711)'),
    't = 45°: a candidate at (√2, √2/2) with f = 1 and λ = 1')
  await t.shot()

  // At t = 135° the gradients point in opposite directions: λ = −1, f = −1 (a minimum).
  await t.set('input[type=range]', 135)
  r = await readout(t)
  t.check(r.includes('λ = −|∇f| / |∇g| = −1 ') && r.includes('xy = −1') && r.includes('opposite'), 't = 135°: λ = −1 and f = −1, gradients opposite')

  // The same objective on the unit circle: at 45° the candidate has f = 1/2 and λ = 1/2.
  await t.select('select >> nth=1', 'circle')
  r = await readout(t)
  t.check(r.includes('t = 135°') && r.includes('xy = −0.5') && r.includes('λ = −|∇f| / |∇g| = −0.5'),
    'xy on the circle at 135°: f = −1/2, λ = −1/2 (the slider keeps its value)')
  await t.set('input[type=range]', 45)
  r = await readout(t)
  t.check(r.includes('xy = 0.5') && r.includes('λ = |∇f| / |∇g| = 0.5'), 'xy on the circle at 45°: f = 1/2, λ = 1/2')

  // 2x + y on the circle: the maximum √5 ≈ 2.2361 is at t ≈ 26.57°; the slider's 26.5° is within 0.1° of it.
  await t.select('select >> nth=0', 'lin')
  await t.set('input[type=range]', 26.5)
  r = await readout(t)
  t.check(r.includes('Parallel') && r.includes('2x + y ≈ 2.2361') && r.includes('λ = |∇f| / |∇g| ≈ 1.118') && r.includes('≈ 0.1°'),
    '2x + y on the circle at 26.5°: a candidate with f ≈ 2.2361 = √5 and λ ≈ 1.118 = √5/2')
  await t.set('input[type=range]', 30)
  r = await readout(t)
  t.check(r.includes('Not parallel') && r.includes('f decreases as t increases'), '2x + y at 30°: past the maximum, f decreases')

  // The line x + y = 1 goes only with xy and x² + 2y².
  t.check((await t.attr('option[value="line"]', 'disabled')) !== null, 'with 2x + y the line x + y = 1 cannot be chosen')
  await t.select('select >> nth=0', 'prod')
  await t.select('select >> nth=1', 'line')
  await t.set('input[type=range]', 0.5)
  r = await readout(t)
  t.check(r.includes('x = 0.5') && r.includes('xy = 0.25') && r.includes('λ = |∇f| / |∇g| = 0.5'), 'xy on the line at x = 0.5: the maximum 1/4, λ = 1/2')

  // At the ends of the line the arrows stay inside the plot (they are clipped to it), shrinking together near the top
  // edge: their lengths keep the ratio |∇f| : |∇g|, here √101/2 : √2 at (−0.25, 1.25) and 4√2 : √2 at (2, −1).
  await t.select('select >> nth=0', 'quad')
  const ends = []
  for (const [x, want] of [[-0.25, Math.sqrt(101 / 8)], [2, 4]]) {
    await t.set('input[type=range]', x)
    const q = await tips(t)
    ends.push(q.inside && Math.abs(q.ratio / want - 1) < 0.01)
  }
  await t.shot('line')
  t.check(ends.every(Boolean), 'x² + 2y² at both ends of the line: both arrowheads well inside the plot, lengths in the ratio |∇f| : |∇g|')
  await t.select('select >> nth=0', 'sum')
  r = await readout(t)
  t.check((await selects(t)).join() === 'sum,circle' && r.includes('now the circle') && r.includes('nothing to optimise') && (await t.text('.lg-key')).includes('x² + y² = 1'),
    'choosing x + y while on the line switches to the circle and says why (x + y is constant on the line)')

  // x² + 2y² on the circle: λ = 1 at t = 0° (f = 1), λ = 2 at t = 90° (f = 2): Exercise 18.3.
  await t.select('select >> nth=0', 'quad')
  await t.set('input[type=range]', 0)
  r = await readout(t)
  t.check(r.includes('x² + 2y² = 1') && r.includes('λ = |∇f| / |∇g| = 1 '), 'x² + 2y² on the circle at 0°: f = 1, λ = 1')
  await t.set('input[type=range]', 90)
  r = await readout(t)
  t.check(r.includes('x² + 2y² = 2') && r.includes('λ = |∇f| / |∇g| = 2 '), 'x² + 2y² on the circle at 90°: f = 2, λ = 2')
  await t.shot('quad')
}
