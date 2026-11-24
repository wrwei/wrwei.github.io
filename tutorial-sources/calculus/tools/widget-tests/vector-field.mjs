export const page = 'module_20'

// The number after "≈" in a readout line (with − read as -); NaN for "—".
const num = s => { const m = String(s).match(/≈\s*(−?[\d.]+)/); return m ? Number(m[1].replace('−', '-')) : NaN }
const four = async t => Promise.all(['.vf-circ', '.vf-curl', '.vf-flux', '.vf-div'].map(async s => num(await t.text(s))))
const near = (a, b, tol = 6e-4) => Math.abs(a - b) <= tol
const live = (t, sel) => t.page.$$eval(t.root + ' ' + sel, els => els.map(e => e.value))
const TWO_PI = 2 * Math.PI

export async function run(t) {
  // The rotation field <-y, x> and the circle about (1, 0.5) of radius 1: circulation = integral of the curl 2 = 2π; flux 0.
  let [c, cu, f, d] = await four(t)
  t.check((await t.text('.vf-formula')) === 'F = ⟨−y, x⟩' && near(c, TWO_PI) && near(cu, TWO_PI) && f === 0 && d === 0 &&
    (await t.count('.vf-yes')) === 1, 'rotation, r = 1: circulation ≈ 2π ≈ 6.2832 = the curl integral; flux and divergence integral ≈ 0; they agree')
  t.check((await t.count('.vf-field line')) >= 100 && (await t.count('path.vf-circle')) === 1 && (await t.count('.vf-orient')) === 2,
    'draws the field (100+ arrows), the circle and its two anticlockwise arrowheads')

  // Radius 2: the circulation is 2 × area = 8π ≈ 25.133, wherever the circle is.
  await t.set('input[type=range] >> nth=2', 2)
  ;[c, cu] = await four(t)
  t.check(near(c, 8 * Math.PI, 6e-3) && near(cu, 8 * Math.PI, 6e-3), 'rotation, r = 2: circulation ≈ ∬ 2 dA = 8π ≈ 25.133')

  // The source <x, y>: flux 8π, circulation 0. The sink: flux −8π. The shear <y, 0>: circulation −4π with parallel arrows.
  await t.select('select', 'source')
  ;[c, cu, f, d] = await four(t)
  t.check(c === 0 && cu === 0 && near(f, 8 * Math.PI, 6e-3) && near(d, 8 * Math.PI, 6e-3), 'source, r = 2: flux ≈ ∬ 2 dA ≈ 25.133, circulation ≈ 0')
  await t.select('select', 'sink')
  ;[c, cu, f, d] = await four(t)
  t.check(near(f, -8 * Math.PI, 6e-3) && near(d, -8 * Math.PI, 6e-3), 'sink, r = 2: flux ≈ −25.133 = the divergence integral')
  await t.select('select', 'shear')
  ;[c, cu, f, d] = await four(t)
  t.check(near(c, -4 * Math.PI, 6e-3) && near(cu, -4 * Math.PI, 6e-3) && f === 0, 'shear ⟨y, 0⟩, r = 2: circulation ≈ −4π ≈ −12.566 = ∬ (−1) dA')

  // The gradient field: its potential's level curves are drawn, and the circulation is 0 (Theorem 20.3). The constant field: all 0.
  await t.select('select', 'gradient')
  ;[c, cu, f, d] = await four(t)
  t.check((await t.count('.vf-levels path')) >= 1 && (await t.text('.vf-key')).includes('potential') && c === 0 && cu === 0 && near(f, 8 * Math.PI, 6e-3),
    'gradient field: level curves of ½(x² + y²) drawn; circulation ≈ 0, flux ≈ 25.133')
  await t.select('select', 'constant')
  t.check((await four(t)).every(v => v === 0), 'constant field: all four numbers ≈ 0')

  // Dragging moves the centre (the sliders follow); for the rotation field the circulation stays 8π.
  await t.select('select', 'rotation')
  await t.drag('svg.cw-plot', [0.5, 0.5], [0.25, 0.75])
  const [x0, y0] = (await live(t, 'input[type=range]')).map(Number)
  ;[c, cu] = await four(t)
  t.check(x0 < -1.2 && x0 > -2.4 && y0 < -0.6 && y0 > -1.8 && near(c, 8 * Math.PI, 6e-3) && near(cu, 8 * Math.PI, 6e-3),
    `dragging moves the centre to (${x0}, ${y0}); the circulation stays ≈ 25.133`)
  await t.shot()

  // A typed field: <-y^3, x^3> round the unit circle about the origin: both sides 3π/2 ≈ 4.7124 (Exercise 20.10's disc).
  await t.set('input[type=range] >> nth=0', 0)
  await t.set('input[type=range] >> nth=1', 0)
  await t.set('input[type=range] >> nth=2', 1)
  await t.type('.vf-fields .cw-field:nth-child(1) input', '-y^3')
  await t.type('.vf-fields .cw-field:nth-child(2) input', 'x^3')
  await t.wait(400)
  ;[c, cu, f, d] = await four(t)
  t.check((await live(t, 'select'))[0] === 'own' && near(c, 1.5 * Math.PI) && near(cu, 1.5 * Math.PI) && f === 0 && (await t.count('.vf-yes')) === 1,
    'typed ⟨−y³, x³⟩, unit circle: circulation ≈ ∬ 3(x² + y²) dA ≈ 4.7124, and the menu shows “your own”')

  // The field of Example 20.6 round a circle that encloses the origin: circulation 2π, but the curl integral is 0.
  await t.type('.vf-fields .cw-field:nth-child(1) input', '-y/(x^2+y^2)')
  await t.type('.vf-fields .cw-field:nth-child(2) input', 'x/(x^2+y^2)')
  await t.wait(400)
  await t.set('input[type=range] >> nth=0', 0.3)
  await t.set('input[type=range] >> nth=1', 0.2)
  ;[c, cu] = await four(t)
  let verdict = await t.text('.vf-verdict')
  t.check(near(c, TWO_PI) && cu === 0 && verdict.includes('differ'), 'vortex, circle round the origin: circulation ≈ 6.2832, curl integral ≈ 0, and the readout says they differ')
  await t.set('input[type=range] >> nth=0', 2)
  await t.set('input[type=range] >> nth=1', 1)
  ;[c, cu] = await four(t)
  t.check(c === 0 && cu === 0 && (await t.count('.vf-yes')) === 1 && (await t.text('.vf-verdict')).includes('check that P and Q'),
    'vortex, origin outside the circle: both sides ≈ 0, and the readout distinguishes agreement from checking the hypotheses')
  await t.set('input[type=range] >> nth=0', 0)
  await t.set('input[type=range] >> nth=1', 0)
  verdict = await t.text('.vf-verdict')
  t.check((await t.text('.vf-curl')).includes('—') && near(num(await t.text('.vf-circ')), TWO_PI) && verdict.includes('could not be estimated reliably'),
    'vortex, circle centred at the origin: the unreliable double integral estimates are withheld (—)')
  await t.shot('vortex')

  await t.type('.vf-fields .cw-field:nth-child(1) input', 'sqrt(x)')
  await t.type('.vf-fields .cw-field:nth-child(2) input', '0')
  await t.wait(400)
  const boundaryIssue = (await four(t)).every(Number.isNaN) && (await t.text('.vf-verdict')).includes('sampled value')

  await t.type('.vf-fields .cw-field:nth-child(1) input', 'sin(12345*x)')
  await t.wait(400)
  const integrationIssue = Number.isNaN((await four(t))[0]) &&
    (await t.text('.vf-verdict')).includes('could not estimate one or both line integrals')
  t.check(boundaryIssue && integrationIssue,
    'distinguishes a nonfinite boundary sample from running out of integration budget for a smooth field')

  // A formula that does not parse: a message, no arrows, no error.
  await t.type('.vf-fields .cw-field:nth-child(1) input', 'x^^2')
  await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0 && (await t.count('.vf-field line')) === 0 && (await t.text('.vf-readout')).includes('Type formulas'),
    'a bad formula gives a message and draws no field')
}
