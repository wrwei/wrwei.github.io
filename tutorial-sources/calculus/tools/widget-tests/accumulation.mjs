export const page = 'module_10'

const num = s => Number(s)

export async function run(t) {
  // Start: f(x) = sin x, a = 0, x = 2. A(2) = 1 − cos 2 ≈ 1.4161, and the slope of A at 2 is sin 2 ≈ 0.9093.
  let r = await t.text('.cw-readout')
  t.check(r.includes('A(x) ≈ 1.4161') && r.includes('slope of A at x ≈ 0.9093 = f(x) ≈ 0.9093'),
    'sin x from 0 to 2: A(x) ≈ 1.4161, and the slope of A equals f(2) ≈ 0.9093')
  t.check((await t.count('.acc-plus')) === 1 && (await t.count('.acc-minus')) === 0 && (await t.count('.acc-Acurve')) >= 1,
    'the area from 0 to 2 is all blue (counts positive), and the graph of A is drawn')
  t.check(num(await t.attr('.acc-tangent', 'y2')) < num(await t.attr('.acc-tangent', 'y1')), 'the tangent to A at x = 2 rises (slope f(2) > 0)')

  // x = a: no area. x < a: the integral runs backwards; sin < 0 on (−1, 0), so that area counts positive.
  await t.set('input[type=range] >> nth=1', 0)
  t.check((await t.text('.cw-readout')).includes('A(x) = 0'), 'x = a gives A(x) = 0')
  await t.set('input[type=range] >> nth=1', -1)
  r = await t.text('.cw-readout')
  t.check(r.includes('A(x) ≈ 0.4597') && r.includes('backwards') && (await t.count('.acc-plus')) === 1 && (await t.count('.acc-minus')) === 0,
    'x = −1 < a: A ≈ 1 − cos 1 ≈ 0.4597, and the area under the axis counts positive (blue)')

  // Moving a changes A by a constant but not its slope: a = 1, x = 2 gives cos 1 − cos 2 ≈ 0.95645.
  await t.set('input[type=range] >> nth=0', 1)
  await t.set('input[type=range] >> nth=1', 2)
  r = await t.text('.cw-readout')
  t.check(r.includes('A(x) ≈ 0.95645') && r.includes('slope of A at x ≈ 0.9093'), 'a = 1: A(2) ≈ 0.95645, with the same slope 0.9093')

  // x² − 1 from 0: A(2) = 2/3 and f(2) = 3 exactly; at x = 1, f(1) = 0, the area is negative (orange) and the tangent flat.
  await t.select('select', 'quad')
  r = await t.text('.cw-readout')
  t.check(r.includes('A(x) ≈ 0.66667') && r.includes('= f(x) = 3'), 'x² − 1 from 0 to 2: A ≈ 0.66667, and f(2) = 3 exactly')
  await t.set('input[type=range] >> nth=1', 1)
  r = await t.text('.cw-readout')
  const y1 = num(await t.attr('.acc-tangent', 'y1')), y2 = num(await t.attr('.acc-tangent', 'y2'))
  t.check(r.includes('A(x) ≈ −0.66667') && r.includes('f(x) = 0') && Math.abs(y1 - y2) < 0.5 && (await t.count('.acc-minus')) === 1,
    'x² − 1 at x = 1: A ≈ −0.66667 (orange area), f(1) = 0 and a horizontal tangent')

  // 1/(1 + x²) from 0 to 1: A = arctan 1 = π/4 ≈ 0.7854.
  await t.select('select', 'witch')
  t.check((await t.text('.cw-readout')).includes('A(x) ≈ 0.7854'), '1/(1 + x²) from 0 to 1: A ≈ π/4 ≈ 0.7854')

  // A typed function: 2x from 0 to 3 gives 9, and the list says "your own".
  await t.type('input[type=text]', '2x')
  await t.wait(400)
  await t.set('input[type=range] >> nth=1', 3)
  const chosen = await t.page.evaluate(root => document.querySelector(root + ' select').value, t.root)
  t.check((await t.text('.cw-readout')).includes('A(x) ≈ 9') && chosen === 'own', 'typed 2x: A(3) ≈ 9, and the list shows "your own"')

  // sign(x) jumps at 0: A has a corner there. 1/x is undefined at 0: A(−1) from a = 1 does not exist.
  await t.type('input[type=text]', 'sign(x)')
  await t.wait(400)
  await t.set('input[type=range] >> nth=0', -2)
  await t.set('input[type=range] >> nth=1', 0)
  r = await t.text('.cw-readout')
  t.check(r.includes('corner') && r.includes('≈ −1') && r.includes('≈ 1') && (await t.count('.acc-tangent')) === 0,
    'sign(x) at 0: A has a corner (slopes −1 and 1) and no tangent is drawn')
  await t.type('input[type=text]', '1/x')
  await t.wait(400)
  await t.set('input[type=range] >> nth=0', 1)
  await t.set('input[type=range] >> nth=1', -1)
  t.check((await t.text('.cw-readout')).includes('not defined'), '1/x from 1 to −1: A(x) is not defined')

  // A mistyped formula gives a message, not an error.
  await t.type('input[type=text]', 'x^^2')
  await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0, 'a mistyped formula shows a message')

  // Clicking the lower graph three quarters of the way across moves x to about 2.5 (the view is −5 to 5).
  await t.type('input[type=text]', 'cos(x) + 0.5')
  await t.wait(400)
  await t.set('input[type=range] >> nth=0', 0)
  await t.clickAt('.acc-aplot svg', 0.75, 0.5)
  const x = Number(await t.page.evaluate(root => document.querySelectorAll(root + ' input[type=range]')[1].value, t.root))
  t.check(x > 2.2 && x < 2.8 && (await t.text('.cw-readout')).includes('slope of A at x'), 'clicking the graph of A moves x to about 2.5')

  await t.select('select', 'sin')
  await t.shot()
}
