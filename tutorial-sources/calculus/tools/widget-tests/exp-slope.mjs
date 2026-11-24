export const page = 'module_06'

export async function run(t) {
  const out = () => t.text('.cw-readout')
  const near = (p, q) => Math.abs(Number(p) - Number(q)) < 0.6
  let r = await out()
  t.check(r.includes('a = 2\n') && r.includes('at x = 0 ≈ 0.69315'), 'starts at a = 2 with slope at 0 ≈ 0.69315')
  t.check(r.includes('less than 1: make a larger') && !r.includes('ln a'), 'a = 2: slope below 1, and ln a still hidden')
  t.check((await t.count('line[stroke="var(--orange)"]')) === 1 && (await t.count('line[stroke="var(--green)"]')) === 1 && (await t.count('circle')) === 2,
    'draws the tangent lines at x = 0 and x = 1 with their points')
  await t.set('input[type=range]', 3)
  r = await out()
  t.check(r.includes('at x = 0 ≈ 1.09861') && r.includes('greater than 1: make a smaller'), 'a = 3: slope ≈ 1.09861, more than 1')
  t.check(r.includes('slope at x = 1 ≈ 3.29584') && r.includes('a × (slope at 0) ≈ 3.29584'), 'a = 3: slope at x = 1 is a times the slope at 0')
  await t.set('input[type=range]', 2.718)
  t.check((await out()).includes('within 0.001 of 1'), 'a = 2.718: slope within 0.001 of 1')
  await t.set('input[type=range]', 2.722)
  t.check(!(await out()).includes('within 0.001'), 'a = 2.722: no longer within 0.001 of 1')
  await t.type('input.cw-input', '2.5'); await t.wait(400)
  r = await out()
  t.check(r.includes('a = 2.5\n') && r.includes('at x = 0 ≈ 0.91629') && (await t.text('output')) === '2.5', 'typing 2.5 sets the base')
  await t.type('input.cw-input', '7'); await t.wait(400)
  t.check((await t.text('.cw-msg')).includes('1.5 to 4') && (await out()).includes('a = 2.5\n'), 'a base outside [1.5, 4] is refused with a message')
  await t.type('input.cw-input', 'x+'); await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0 && (await out()).includes('a = 2.5\n'), 'a formula that is not a number is refused with a message')
  await t.click('Show ln a')
  t.check((await out()).includes('ln a ≈ 0.91629'), 'Show ln a reveals ln 2.5 ≈ 0.91629, the slope at 0')
  await t.click('Show e')
  r = await out()
  t.check(r.includes('a = e ≈ 2.718282') && r.includes('= 1 exactly') && r.includes('ln e = 1'), 'Show e: slope at 0 exactly 1, and ln e = 1')
  t.check((await t.text('output')) === 'e', 'the slider shows e')
  const tan0 = [await t.attr('line[stroke="var(--orange)"]', 'y1'), await t.attr('line[stroke="var(--orange)"]', 'y2')]
  const unit = [await t.attr('line[stroke="var(--muted)"]', 'y1'), await t.attr('line[stroke="var(--muted)"]', 'y2')]
  t.check(near(tan0[0], unit[0]) && near(tan0[1], unit[1]), 'with a = e the tangent at 0 lies along the line of slope 1')
  await t.shot()
}
