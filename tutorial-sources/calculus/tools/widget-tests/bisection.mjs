export const page = 'module_03'

const num = s => Number(String(s).replace(/−/g, '-'))
const lastRow = t => t.texts('tbody tr:last-child td')

export async function run(t) {
  // The start: x^2 - 2 on [1, 2], one row (n = 0), and the explanation of why the method can start.
  t.check((await t.text('.cw-readout')).includes('opposite signs'), 'starts on [1, 2]: f(1) and f(2) have opposite signs')
  t.check(JSON.stringify(await lastRow(t)) === JSON.stringify(['0', '1', '2', '1.5', '0.25', '1']), 'row 0 is [1, 2] with midpoint 1.5 and f(1.5) = 0.25')
  const band0 = num(await t.attr('g[clip-path] rect', 'width'))

  // One step keeps [1, 1.5], since f(1.5) > 0 has the sign of f(2); the shaded band halves.
  await t.click('Step')
  t.check(JSON.stringify(await lastRow(t)) === JSON.stringify(['1', '1', '1.5', '1.25', '−0.4375', '0.5']), 'step 1 gives [1, 1.5], midpoint 1.25, f = −0.4375')
  const band1 = num(await t.attr('g[clip-path] rect', 'width'))
  t.check(Math.abs(band1 - band0 / 2) < 1.5, `the shaded bracket halves (${band0.toFixed(1)} px to ${band1.toFixed(1)} px)`)

  // Five more steps reproduce row 6 of Example 3.7 and its error bounds.
  for (let i = 0; i < 5; i++) await t.click('Step')
  t.check(JSON.stringify(await lastRow(t)) === JSON.stringify(['6', '1.40625', '1.421875', '1.4140625', '−0.0004272', '0.015625']), 'row 6 matches Example 3.7')
  const r6 = await t.text('.cw-readout')
  t.check(r6.includes('After 6 steps') && r6.includes('= 0.015625') && r6.includes('= 0.0078125'), 'after 6 steps: width 1/2⁶ = 0.015625, midpoint within 0.0078125')

  // Ten more steps: the bracket [a16, b16] still contains sqrt 2 and has width 2^-16.
  await t.click('Run 10 steps')
  let row = await lastRow(t)
  t.check(row[0] === '16' && num(row[1]) < Math.SQRT2 && Math.SQRT2 < num(row[2]) && Math.abs(num(row[2]) - num(row[1]) - 2 ** -16) < 1e-8, `after 16 steps √2 lies in [${row[1]}, ${row[2]}], of width 2⁻¹⁶`)

  // Running on, the ends become neighbouring floating-point numbers after 52 steps, and the method stops.
  for (let i = 0; i < 4; i++) await t.click('Run 10 steps')
  t.check((await t.text('.cw-readout')).includes('neighbouring floating-point numbers') && (await t.count('tbody tr')) === 53, 'stops after 52 steps: the ends are neighbouring floating-point numbers')

  // Reset returns to row 0.
  await t.click('Reset')
  t.check((await t.count('tbody tr')) === 1, 'Reset returns to the starting bracket')

  // [-2, 2]: f(-2) and f(2) have the same sign, so the method cannot start.
  await t.type('.bi-a', '-2'); await t.wait(400)
  t.check((await t.text('.cw-readout')).includes('cannot start') && (await t.attr('button.cw-primary', 'disabled')) !== null, 'a = −2: same signs, the method cannot start and Step is disabled')

  // The cubic of Example 3.5 on [2, 3].
  await t.select('select', 'cubic')
  await t.click('Run 10 steps')
  row = await lastRow(t)
  t.check(num(row[1]) < 2.0945514815 && 2.0945514815 < num(row[2]), `x³ − 2x − 5: after 10 steps the root 2.09455… lies in [${row[1]}, ${row[2]}]`)

  // cos x - x on [0, 1] (Example 3.6), 20 steps.
  await t.select('select', 'cos')
  await t.click('Run 10 steps'); await t.click('Run 10 steps')
  row = await lastRow(t)
  t.check(num(row[1]) < 0.7390851332 && 0.7390851332 < num(row[2]) && num(row[2]) - num(row[1]) < 1e-6, `cos x − x: after 20 steps the root 0.739085… lies in [${row[1]}, ${row[2]}]`)

  // tan x on [1, 2]: the bracket closes in on the asymptote pi/2, and the widget warns.
  await t.select('select', 'tan')
  await t.click('Run 10 steps')
  row = await lastRow(t)
  t.check((await t.text('.bi-warn')).includes('continuous') && num(row[1]) < Math.PI / 2 && Math.PI / 2 < num(row[2]), 'tan x: the bracket closes in on π/2, with a warning about continuity')
  await t.shot('tan')

  // A typed formula with an exact root at a midpoint: x - 0.5 on [0, 2] stops at 0.5.
  await t.type('.bi-f', 'x - 0.5'); await t.wait(400)
  await t.type('.bi-a', '0'); await t.wait(400)
  await t.click('Run 10 steps')
  t.check((await t.text('.cw-readout')).includes('is a root') && (await t.count('tbody tr')) === 2, 'x − 0.5 on [0, 2]: f(0.5) = 0 exactly, and the method stops')

  // A formula that does not parse: a message, no crash.
  await t.type('.bi-f', 'x^^2'); await t.wait(400)
  t.check((await t.text('.cw-readout')).includes('Correct the formula') && (await t.text('.cw-msg')).length > 0, 'a bad formula gives a message instead of an error')

  // Back to the default for the screenshot.
  await t.select('select', 'sqrt2')
  for (let i = 0; i < 6; i++) await t.click('Step')
  await t.shot()
}
