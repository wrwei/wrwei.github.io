export const page = 'module_13'

// The readout as one string, the number that follows a label in it (with − read as -), and the live values of
// the controls (properties, not attributes).
const readout = async t => (await t.texts('.sf-readout div')).join(' | ')
const after = (s, label) => { const m = s.split(label)[1]; return m == null ? NaN : Number(m.trim().split(/\s/)[0].replace('−', '-')) }
const live = (t, sel) => t.page.$$eval(t.root + ' ' + sel, els => els.map(e => e.value))

export async function run(t) {
  // y′ = t − y from (0, 1) with h = 0.5 is Example 13.6: y4 = 1.125, exact 1 + 2e^(−2) ≈ 1.27067, error ≈ 0.14567.
  let r = await readout(t)
  t.check(r.includes('to T = 2: 4 steps of h = 0.5') && r.includes('y₄ = 1.125') && r.includes('y(2) ≈ 1.27067') && r.includes('error = accurate − Euler ≈ 0.14567'),
    'starts with Example 13.6: y4 = 1.125, y(2) ≈ 1.27067, error ≈ 0.14567')
  t.check((await t.count('.sf-field line')) >= 150, 'draws the direction field as segments')
  t.check((await t.count('circle.sf-dot')) === 5 && (await t.count('path.sf-solution')) === 1, 'draws the solution curve and one dot per Euler point (5)')

  // Halving h: 0.25 gives 39329/32768 ≈ 1.20023 with error ≈ 0.070445; at h = 1/32 the error divided by h is
  // close to its limit 2e^(−2) ≈ 0.2707.
  await t.set('input[type=range] >> nth=2', 3)
  r = await readout(t)
  t.check(r.includes('8 steps of h = 0.25') && r.includes('y₈ ≈ 1.20023') && Math.abs(after(r, 'error = accurate − Euler ≈') - 0.070445) < 5e-6 &&
    (await t.count('circle.sf-dot')) === 9, 'h = 0.25: eight steps, y8 ≈ 1.20023, error ≈ 0.070445, nine dots')
  await t.set('input[type=range] >> nth=2', 0)
  r = await readout(t)
  t.check(r.includes('64 steps of h = 0.03125') && Math.abs(after(r, 'error ÷ h ≈') - 0.2717) < 0.003, 'h = 1/32: error ÷ h ≈ 0.272, near 2e^(−2)')
  await t.shot()

  // y′ = y from (0, 1) to T = 1: Euler's method is compound interest, (1 + h)^(1/h), as in the value table.
  await t.select('select', 'exp')
  await t.set('input[type=range] >> nth=2', 4)
  r = await readout(t)
  t.check(r.includes('to T = 1: 2 steps of h = 0.5') && r.includes('y₂ = 2.25') && r.includes('y(1) ≈ 2.71828') && r.includes('≈ 0.46828'),
    "y' = y, h = 0.5: y2 = 2.25 against e ≈ 2.71828, error ≈ 0.46828")
  await t.set('input[type=range] >> nth=2', 3)
  r = await readout(t)
  t.check(r.includes('y₄ ≈ 2.44141') && r.includes('≈ 0.27688'), "y' = y, h = 0.25: y4 ≈ 2.44141, error ≈ 0.27688")

  // Clicking the middle of the plot (view [−3, 2.6] × [−0.5, 3]) moves the start point to (−0.2, 1.25), so T = 0.8,
  // Euler gives 1.25 · 1.25^4 ≈ 3.05176 and the solution 1.25e ≈ 3.39785.
  await t.clickAt('svg.cw-plot', 0.5, 0.5)
  const [t0, y0] = await live(t, 'input[type=range]')
  r = await readout(t)
  t.check(Number(t0) === -0.2 && Number(y0) === 1.25 && r.includes('From t₀ = −0.2 to T = 0.8') && r.includes('y₄ ≈ 3.05176') && r.includes('y(0.8) ≈ 3.39785'),
    'a click in the middle of the plot moves the start to (−0.2, 1.25); the sliders and the readout follow')

  // With the keyboard: start on the line y = t − 1 for y′ = t − y. Euler's method is exact along a straight solution.
  await t.select('select', 'lin')
  await t.set('input[type=range] >> nth=2', 4)
  await t.set('input[type=range] >> nth=0', 1)
  await t.set('input[type=range] >> nth=1', 0)
  r = await readout(t)
  t.check(r.includes('From t₀ = 1 to T = 3') && r.includes('y₄ = 2') && after(r, 'error = accurate − Euler ≈') === 0,
    'start (1, 0) on the line y = t − 1: Euler gives y(3) = 2 exactly, error 0')

  // A typed equation, y′ = −y from (0, 1), keeps the view of y′ = t − y (T = 2); with h = 0.5, y4 = 0.5^4 = 0.0625.
  await t.set('input[type=range] >> nth=0', 0)
  await t.set('input[type=range] >> nth=1', 1)
  await t.type('input.cw-input', '-y')
  await t.wait(400)
  r = await readout(t)
  t.check((await live(t, 'select'))[0] === 'own' && r.includes('y₄ = 0.0625') && r.includes('y(2) ≈ 0.135335'),
    "a typed y' = −y: the menu shows 'your own', y4 = 0.0625 against e^(−2) ≈ 0.135335")

  // A formula that does not parse: a message, nothing drawn, no error.
  await t.type('input.cw-input', 'y^^2')
  await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0 && (await t.count('.sf-field line')) === 0 && (await readout(t)).includes('Type a formula'),
    'a bad formula gives a message and draws no field')

  // y′ = t − y² from (0, −1.5) falls to −∞ before T = 2: there is no value to compare with.
  await t.select('select', 'riccati')
  await t.set('input[type=range] >> nth=1', -1.5)
  r = await readout(t)
  t.check(r.includes('blows up') && !r.includes('error ='), "y' = t − y² from (0, −1.5): the solution blows up before T, and no error is claimed")
  await t.shot('riccati')
}
