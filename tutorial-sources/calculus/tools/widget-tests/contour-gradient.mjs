export const page = 'module_17'

// The readout as one string; the number that follows a label in it (with − read as -); the live values of the
// controls (properties, not attributes).
const readout = async t => (await t.texts('.cg-readout div')).join(' | ')
const after = (s, label) => { const m = s.split(label)[1]; return m == null ? NaN : Number(m.trim().split(/[\s|]/)[0].replace('−', '-')) }
const live = (t, sel) => t.page.$$eval(t.root + ' ' + sel, els => els.map(e => e.value))

export async function run(t) {
  // f = x² + y² at (1, 0.5), u = ⟨1, 0⟩: f = 1.25, ∇f = ⟨2, 1⟩, ‖∇f‖ = √5 ≈ 2.236, Dᵤf = 2.
  let r = await readout(t)
  t.check(r.includes('(x, y) = (1, 0.5)') && r.includes('f(x, y) = 1.25') && r.includes('∇f ≈ ⟨2, 1⟩') && r.includes('‖∇f‖ ≈ 2.236') &&
    r.includes('u = ⟨cos 0°, sin 0°⟩ = ⟨1, 0⟩') && after(r, 'Dᵤf = ∇f · u ≈') === 2, 'x² + y² at (1, 0.5): ∇f ≈ ⟨2, 1⟩, ‖∇f‖ ≈ 2.236, Dᵤf ≈ 2 for u = ⟨1, 0⟩')

  // Contours: one coloured path per level, the same levels in the legend, increasing; and both arrows.
  const levels = (await t.texts('.cg-lev')).map(s => Number(s.replace('−', '-')))
  t.check(levels.length >= 6 && (await t.count('g.cg-contours path')) === levels.length && levels.every((v, i) => i === 0 || v > levels[i - 1]),
    `the contour map has one path per level, and the legend lists the ${levels.length} levels in increasing order`)
  t.check((await t.count('g.cg-grad')) === 1 && (await t.count('g.cg-u')) === 1 && (await t.count('g.cg-level path')) === 1, 'draws ∇f, u and the dashed level curve through the point')

  // Turning u: the direction of ∇f = ⟨2, 1⟩ is 26.57°, so 27° is along it, 207° against it, 117° along the level curve.
  await t.set('input[type=range] >> nth=2', 27)
  r = await readout(t)
  t.check(r.includes('along ∇f') && after(r, 'Dᵤf = ∇f · u ≈') === 2.236, 'u at 27°: along ∇f, Dᵤf ≈ 2.236 = ‖∇f‖ (the largest)')
  await t.set('input[type=range] >> nth=2', 207)
  r = await readout(t)
  t.check(r.includes('against ∇f') && after(r, 'Dᵤf = ∇f · u ≈') === -2.236, 'u at 207°: against ∇f, Dᵤf ≈ −2.236 (the smallest)')
  await t.set('input[type=range] >> nth=2', 117)
  r = await readout(t)
  t.check(r.includes('along the level curve') && Math.abs(after(r, 'Dᵤf = ∇f · u ≈')) < 0.02, 'u at 117°: along the level curve, Dᵤf ≈ 0')

  // A click in the middle of the map (view [−3, 3] × [−2, 2]) moves the point to (0, 0), the bottom of the bowl.
  await t.clickAt('svg.cw-plot', 0.5, 0.5)
  const [x0, y0] = await live(t, 'input[type=range]')
  r = await readout(t)
  t.check(Number(x0) === 0 && Number(y0) === 0 && r.includes('(x, y) = (0, 0)') && r.includes('critical point') && (await t.count('g.cg-grad')) === 0,
    'a click in the middle moves the point to (0, 0): ∇f = 0, a critical point, and no gradient arrow')

  // The landscape of Figure 17.1 at (0.5, 0.5): f = e^0.5 ≈ 1.649, ∇f = ⟨0, 2e^0.5⟩ ≈ ⟨0, 3.297⟩; at the pass (1, 0), ∇f = 0.
  await t.select('select', 'peaks')
  await t.set('input[type=range] >> nth=2', 90)
  r = await readout(t)
  t.check(r.includes('(x, y) = (0.5, 0.5)') && r.includes('f(x, y) ≈ 1.649') && r.includes('∇f ≈ ⟨0, 3.297⟩') && r.includes('along ∇f'),
    'the landscape at (0.5, 0.5): ∇f ≈ ⟨0, 3.297⟩, and u at 90° points along it')
  await t.set('input[type=range] >> nth=0', 1)
  await t.set('input[type=range] >> nth=1', 0)
  r = await readout(t)
  t.check(r.includes('(x, y) = (1, 0)') && r.includes('critical point'), 'the landscape at the pass (1, 0): ∇f ≈ 0, a critical point')
  await t.shot()

  // f = x² − y² at (1, 1): ∇f = ⟨2, −2⟩, ‖∇f‖ = 2√2 ≈ 2.828, pointing at 315°.
  await t.select('select', 'saddle')
  await t.set('input[type=range] >> nth=1', 1)
  await t.set('input[type=range] >> nth=2', 315)
  r = await readout(t)
  t.check(r.includes('∇f ≈ ⟨2, −2⟩') && r.includes('‖∇f‖ ≈ 2.828') && r.includes('along ∇f'), 'x² − y² at (1, 1): ∇f ≈ ⟨2, −2⟩, ‖∇f‖ ≈ 2.828, along ∇f at 315°')

  // A typed function: x e^y at (2, 0) is Example 17.13; at 53°, close to the direction of ⟨3, 4⟩, Dᵤf ≈ 2.199.
  await t.type('input.cw-input', 'x e^y')
  await t.wait(400)
  await t.set('input[type=range] >> nth=0', 2)
  await t.set('input[type=range] >> nth=1', 0)
  await t.set('input[type=range] >> nth=2', 53)
  r = await readout(t)
  t.check((await live(t, 'select'))[0] === 'own' && r.includes('f(x, y) = 2') && r.includes('∇f ≈ ⟨1, 2⟩') && after(r, 'Dᵤf = ∇f · u ≈') === 2.199,
    "a typed x e^y at (2, 0): the menu shows 'your own', ∇f ≈ ⟨1, 2⟩, and Dᵤf ≈ 2.199 at 53°")

  // A formula that does not parse: a message, no contours, no error.
  await t.type('input.cw-input', 'x^^2')
  await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0 && (await t.count('g.cg-contours')) === 0 && (await readout(t)).includes('Type a formula'),
    'a bad formula gives a message and draws no contours')
  await t.type('input.cw-input', 'ln(x^2 + y^2)')
  await t.wait(400)
  await t.clickAt('svg.cw-plot', 0.5, 0.5)
  r = await readout(t)
  t.check(r.includes('not defined at the point (0, 0)') && (await t.count('g.cg-contours path')) >= 6, 'ln(x² + y²): contours are drawn, and the origin, where f is undefined, is reported')
}
