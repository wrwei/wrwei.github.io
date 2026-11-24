export const page = 'module_05'

// The numbers in an attribute, for comparing positions in the SVG.
const num = s => Number(s)

export async function run(t) {
  // Start: f(x) = x³ − 3x at a = 1.5, where f(a) = −1.125 and f′(a) = 3(1.5)² − 3 = 3.75.
  let r = await t.text('.cw-readout')
  t.check(r.includes('f(a) = −1.125') && r.includes('f′(a) ≈ 3.75') && r.includes('Rising'), 'x³ − 3x at a = 1.5: f(a) = −1.125, f′(a) ≈ 3.75, rising')
  t.check((await t.count('.dg-fplot path')) >= 1 && (await t.count('.dg-dplot path')) >= 1, 'draws f and f′')

  // At a = 1 the graph is flat: the tangent is horizontal and the point (a, f′(a)) lies on the x-axis of the f′ graph.
  await t.set('input[type=range]', 1)
  r = await t.text('.cw-readout')
  t.check(r.includes('f(a) = −2') && r.includes('f′(a) ≈ 0') && r.includes('Flat'), 'a = 1: f(a) = −2 and flat')
  const y1 = num(await t.attr('.dg-tangent', 'y1')), y2 = num(await t.attr('.dg-tangent', 'y2'))
  t.check(Math.abs(y1 - y2) < 0.5, 'a = 1: the tangent line is horizontal')
  const cy = num(await t.attr('.dg-dplot circle', 'cy')), axisY = num(await t.attr('.dg-dplot line.cw-axis', 'y1'))
  t.check(Math.abs(cy - axisY) < 0.5, 'a = 1: the point (a, f′(a)) is on the x-axis of the lower graph')

  // At a = 0 the graph falls with slope −3, and the tangent goes down to the right (SVG y grows downwards).
  await t.set('input[type=range]', 0)
  r = await t.text('.cw-readout')
  t.check(r.includes('f(a) = 0') && r.includes('f′(a) ≈ −3') && r.includes('Falling'), 'a = 0: f(a) = 0, f′(a) ≈ −3, falling')
  t.check(num(await t.attr('.dg-tangent', 'y2')) > num(await t.attr('.dg-tangent', 'y1')), 'a = 0: the tangent slopes downwards')

  // sin(x) at its default a = 0.5: f(a) ≈ 0.47943, f′(a) ≈ cos 0.5 ≈ 0.8776.
  await t.select('select', 'sin')
  r = await t.text('.cw-readout')
  t.check(r.includes('a = 0.5') && r.includes('f(a) ≈ 0.47943') && r.includes('f′(a) ≈ 0.8776'), 'sin(x) at a = 0.5: f′(a) ≈ cos 0.5 ≈ 0.8776')

  // The caption's second step: x·sin(x) at a = 0 is flat, as the product rule predicts (f′(0) = sin 0 + 0·cos 0 = 0).
  await t.select('select', 'xsin')
  await t.set('input[type=range]', 0)
  r = await t.text('.cw-readout')
  t.check(r.includes('f(a) = 0') && r.includes('f′(a) ≈ 0') && r.includes('Flat'), 'x·sin(x) at a = 0: flat, f′(0) = 0')

  // A typed function: x^2 is flat at 0; a mistake in the formula gives a message, not an error.
  await t.type('input[type=text]', 'x^2')
  await t.wait(400)
  await t.set('input[type=range]', 0)
  r = await t.text('.cw-readout')
  const chosen = await t.page.evaluate(root => document.querySelector(root + ' select').value, t.root)
  t.check(r.includes('f(a) = 0') && r.includes('Flat') && chosen === 'own', 'typed x^2: flat at 0, and the example list says "your own"')
  await t.type('input[type=text]', 'x^^2')
  await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0, 'a mistyped formula shows a message')

  // Example 5.13 close to its asymptote at π (the view is still −7 to 7): steep, but differentiable and rising;
  // the cube root at 0 has a vertical tangent: no derivative.
  await t.type('input[type=text]', 'sin(x)/(1 + cos(x))')
  await t.wait(400)
  await t.set('input[type=range]', 3.1)
  r = await t.text('.cw-readout')
  t.check(r.includes('Rising') && !r.includes('not seem'), 'sin(x)/(1 + cos(x)) at a = 3.1, near its asymptote: rising')
  await t.type('input[type=text]', 'cbrt(x)')
  await t.wait(400)
  await t.set('input[type=range]', 0)
  t.check((await t.text('.cw-readout')).includes('not seem to be differentiable'), 'cbrt(x) at 0: vertical tangent, not differentiable')

  // |x| has a corner at 0: no derivative there. (The cubic's view, −2.2 to 2.2, stays for a typed function.)
  await t.select('select', 'cubic')
  await t.type('input[type=text]', '|x|')
  await t.wait(400)
  await t.set('input[type=range]', 0)
  r = await t.text('.cw-readout')
  t.check(r.includes('not seem to be differentiable') && (await t.count('.dg-tangent')) === 0, '|x| at 0: not differentiable, no tangent line')

  // Clicking the top graph three quarters of the way across moves a to about 1.1 (the view is −2.2 to 2.2).
  await t.page.evaluate(root => document.querySelector(root + ' .dg-fplot').scrollIntoView({ block: 'center', behavior: 'instant' }), t.root)
  await t.clickAt('.dg-fplot svg', 0.75, 0.5)
  const a = Number(await t.page.evaluate(root => document.querySelector(root + ' input[type=range]').value, t.root))
  t.check(a > 0.9 && a < 1.3 && (await t.text('.cw-readout')).includes('Rising'), 'clicking the graph moves a to about 1.1, where |x| is rising')
  await t.select('select', 'cubic')
  await t.shot()
}
