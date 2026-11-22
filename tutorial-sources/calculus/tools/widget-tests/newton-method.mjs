export const page = 'module_07'

const decimals = t => t.texts('tr.nm-row td:nth-child(3)')
const iterates = t => t.texts('tr.nm-row td:nth-child(2)')

export async function run(t) {
  // x^2 - 2 from x0 = 1: the iterates of Example 7.9, with correct decimals 0, 0, 2, 5, 11, 15.
  t.check((await t.count('tr.nm-row')) === 1 && (await t.text('.nm-ref')).includes('1.414213562373095') &&
    (await t.text('.nm-ref')).includes('bisection'), 'starts with the row of x0 only, and states the reference root √2, found by bisection')
  for (let k = 0; k < 4; k++) await t.click('Step')
  t.check((await iterates(t))[3] === '1.414215686274510', 'x3 = 577/408 = 1.414215686274510')
  t.check((await decimals(t)).join(' ') === '0 0 2 5 11', 'correct decimals of x0 to x4: 0 0 2 5 11')
  t.check((await t.count('line.nm-tangent')) === 4, 'one tangent line drawn per step')
  await t.click('Step')
  t.check((await decimals(t))[5] === '15', 'x5 is correct to 15 decimals, the limit of double precision')
  await t.click('Step')
  t.check((await t.text('.nm-msg')).includes('converged') && (await t.attr('button.cw-primary', 'disabled')) !== null,
    'reports convergence and disables Step')
  await t.shot()

  // A horizontal tangent: x0 = 0.
  await t.set('input[type=range]', 0)
  await t.click('Step')
  t.check((await t.count('tr.nm-row')) === 1 && (await t.text('.nm-msg')).includes('f′(x₀) = 0'),
    'x0 = 0: starts again, and reports f′(x0) = 0, a horizontal tangent')

  // cos x − x: x4 is the solution of cos x = x to double precision (Example 7.10).
  await t.select('select', 'cos')
  for (let k = 0; k < 4; k++) await t.click('Step')
  t.check((await iterates(t))[4] === '0.7390851332151607' && (await t.text('.nm-msg')).includes('f(x₄) = 0'),
    'cos x − x from 1: x4 = 0.7390851332151607, where f is 0 in double precision')

  // The cube root runs away: −2, 4, −8 (Example 7.11).
  await t.select('select', 'cbrt')
  for (let k = 0; k < 3; k++) await t.click('Step')
  t.check((await iterates(t)).slice(1).join(' ') === '−2.000000000000000 4.000000000000000 −8.000000000000000' &&
    (await decimals(t)).join(' ') === 'none none none none', 'cube root from 1: −2, 4, −8, none of them within 0.5 of the root 0')
  t.check((await t.text('.nm-msg')).includes('running away'), 'says the iterates are running away')
  await t.shot('runaway')

  // A nearly horizontal tangent: x^3 − 2x − 5 from x0 = 0.8 (Exercise 7.4(d)).
  await t.select('select', 'cubic')
  await t.set('input[type=range]', 0.8)
  await t.click('Step')
  t.check((await iterates(t))[1].startsWith('−75.3000') && (await decimals(t))[1] === 'none', 'x³ − 2x − 5 from 0.8: the first step lands near −75.3')

  // A cycle: x^3 − 2x + 2 from 0.
  await t.select('select', 'cycle')
  await t.click('Step'); await t.click('Step')
  t.check((await t.text('.nm-msg')).includes('cycle'), 'x³ − 2x + 2 from 0: reports the cycle 0, 1, 0')

  // A typed function that leaves its domain: ln(x) from x0 = 3.
  await t.type('input.cw-input', 'ln(x)')
  await t.wait(400)
  await t.set('input[type=range]', 3)
  await t.click('Step')
  t.check((await t.text('.nm-msg')).includes('outside the domain') && (await t.text('.nm-formula')).includes('numerically'),
    'ln(x) from 3: x1 is outside the domain; f′ is said to be estimated numerically')

  // A formula that does not parse: a message, no crash.
  await t.type('input.cw-input', 'x^^2')
  await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0 && (await t.attr('button.cw-primary', 'disabled')) !== null,
    'a bad formula gives a message and disables Step')
  await t.type('input.cw-input', 'x^2 - 3')
  await t.wait(400)
  await t.set('input[type=range]', 2)
  for (let k = 0; k < 4; k++) await t.click('Step')
  t.check((await iterates(t))[4].startsWith('1.73205080756') && (await t.text('.nm-ref')).includes('1.732050807568877'),
    'a typed x^2 − 3 from 2 converges to √3')
}
