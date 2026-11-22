export const page = 'module_09'

const num = s => Number(String(s).replace(/−/g, '-').replace(/^[≈=]\s*/, ''))
const val = (t, cls) => t.text(`.${cls} .rs-val`)
const lastRow = t => t.texts('.rs-table tbody tr:last-child td')
const typed = (t, sel) => t.page.evaluate((root, sel) => document.querySelector(root + ' ' + sel).value, t.root, sel)

export async function run(t) {
  // The start: x² on [0, 1], left rule, n = 4 — the rectangles of Example 9.1.
  t.check(await val(t, 'rs-approx') === '= 0.21875' && (await t.text('.rs-approx .rs-key')).endsWith('L₄') && await t.count('.rs-piece') === 4,
    'x² on [0, 1], left, n = 4: four rectangles and L₄ = 0.21875')
  t.check(await val(t, 'rs-int') === '≈ 0.3333333333' && await val(t, 'rs-err') === '≈ 0.115' && await val(t, 'rs-dx') === '= 0.25',
    'the integral ≈ 0.3333333333, the error ≈ 0.115, Δx = 0.25')

  // The other two sums of Example 9.1 and Section 9.3.
  await t.select('select >> nth=1', 'right')
  const r4 = await val(t, 'rs-approx')
  await t.select('select >> nth=1', 'mid')
  t.check(r4 === '= 0.46875' && await val(t, 'rs-approx') === '= 0.328125', `right and midpoint rules: R₄ = 0.46875, M₄ = 0.328125 (${r4})`)

  // Doubling n: the midpoint error is divided by 4 (exactly, for x²); the left error by about 2.
  await t.click('Double n')
  let row = await lastRow(t)
  t.check(await val(t, 'rs-approx') === '= 0.33203125' && row[0] === '8' && row[1] === '0.0013' && row[2] === '4' && (await t.count('.rs-table tbody tr')) === 2,
    `midpoint, n = 8: M₈ = 0.33203125 and the error ratio is 4 (row ${row.join(' | ')})`)
  await t.select('select >> nth=1', 'left')
  await t.click('Double n')
  row = await lastRow(t)
  t.check(row[0] === '16' && row[2] === '1.96' && (await t.text('.rs-factor')).includes('the left sum by about 2'),
    `left rule, n = 8 to 16: the error ratio is 92/47 ≈ 1.96, about 2, as the note says (row ${row.join(' | ')})`)

  // Simpson's rule needs an even n: 5 becomes 6, drawn as 3 parabolic strips.
  await t.select('select >> nth=1', 'simp')
  await t.set('input[type=range]', 5)
  t.check(await t.text('.rs-n output') === '6' && (await t.text('.rs-note')).includes('even n') && await t.count('.rs-piece') === 3 && await t.count('.rs-arc') === 3,
    "Simpson with n = 5: n is set to 6, with 3 parabolic strips")
  t.check(await val(t, 'rs-err') === '≈ 0 (below rounding error)', "Simpson's rule is exact for x²: the error is below rounding error")

  // sin x on [0, π] with Simpson's rule: each doubling divides the error by about 16.
  await t.select('select >> nth=0', 'sin')
  await t.click('Double n')
  await t.click('Double n')
  row = await lastRow(t)
  t.check(row[0] === '24' && num(row[2]) > 15 && num(row[2]) < 17 && (await typed(t, '.rs-b input')) === 'pi',
    `sin x on [0, π], Simpson, n = 12 to 24: the error ratio is about 16 (row ${row.join(' | ')})`)

  // sin 0 = sin π: the left sum equals the right sum, and its error falls by about 4 per doubling, not 2.
  await t.select('select >> nth=1', 'left')
  await t.click('Double n')
  row = await lastRow(t)
  t.check(row[0] === '48' && num(row[2]) > 3.9 && num(row[2]) < 4.1 && (await t.text('.rs-factor')).includes('f(a) = f(b)'),
    `sin x on [0, π], left rule, n = 24 to 48: the error ratio is about 4, and the note says why (row ${row.join(' | ')})`)
  await t.set('input[type=range]', 24)

  // A net area of 0: the trapezoid sums and the integral of sin x over [0, 2π] show as ≈ 0, not as rounding noise.
  await t.select('select >> nth=1', 'trap')
  await t.type('.rs-b input', '2pi')
  await t.wait(400)
  t.check(await val(t, 'rs-approx') === '≈ 0' && await val(t, 'rs-int') === '≈ 0' && (await t.count('.rs-piece')) === 24,
    'sin x on [0, 2π], trapezoid rule, n = 24: the sum and the integral are ≈ 0')

  // A typed function: x³ on [0, 2] with the midpoint rule and n = 4 gives 3.875; the integral is 4.
  await t.select('select >> nth=0', 'custom')
  await t.select('select >> nth=1', 'mid')
  await t.set('input[type=range]', 4)
  await t.type('.rs-field input', 'x^3')
  await t.wait(400)
  t.check(await val(t, 'rs-approx') === '= 3.875' && await val(t, 'rs-int') === '≈ 4' && await val(t, 'rs-err') === '≈ 0.125',
    'x³ on [0, 2], midpoint, n = 4: M₄ = 3.875, integral ≈ 4')

  // Bad input gives messages, not errors: an unfinished formula, a > b, a point where f is undefined, a pole.
  await t.type('.rs-field input', 'x^')
  await t.wait(400)
  t.check((await t.text('.rs-field .cw-msg')).length > 0 && await val(t, 'rs-approx') === '—' && await t.count('.rs-piece') === 0,
    'an unfinished formula shows a message and draws nothing')
  await t.type('.rs-field input', 'x^2')
  await t.type('.rs-a input', '3')
  await t.wait(400)
  t.check((await t.text('.rs-msg')).includes('a < b'), 'a = 3 > b = 2: asks for a < b')
  await t.select('select >> nth=0', 'recip')
  await t.type('.rs-a input', '-1')
  await t.type('.rs-b input', '1')
  await t.wait(400)
  t.check((await t.text('.rs-msg')).includes('not a finite number') && await val(t, 'rs-int') === '—', '1/x on [−1, 1]: not defined at 0, no sums')
  await t.select('select >> nth=0', 'custom')
  await t.type('.rs-field input', '1/(x - 0.3337)')
  await t.type('.rs-b input', '1')
  await t.type('.rs-a input', '0')
  await t.wait(400)
  t.check((await t.text('.rs-msg')).includes('vertical asymptote'), '1/(x − 0.3337) on [0, 1]: a vertical asymptote, so not integrable')

  // Double n stops at 200.
  await t.select('select >> nth=0', 'sq')
  await t.set('input[type=range]', 150)
  t.check(await t.attr('button.cw-primary', 'disabled') !== null, 'Double n is disabled when 2n > 200')
  await t.set('input[type=range]', 16)
  await t.shot()
}
