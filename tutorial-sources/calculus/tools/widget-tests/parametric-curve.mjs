export const page = 'module_16'

export async function run(t) {
  const readout = () => t.text('.pc-readout')
  const k = () => t.page.evaluate(r => Number(document.querySelector(r + ' input[type=range]').value), t.root)

  // With reduced motion preferred, the widget does not start playing when it comes into view.
  await t.page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await t.page.evaluate(r => document.querySelector(r).scrollIntoView({ block: 'center', behavior: 'instant' }), t.root)
  await t.wait(700)
  t.check((await t.text('.pc-play')) === 'Play' && (await readout()).startsWith('t = 0\n'), 'no auto-play with prefers-reduced-motion')
  t.check((await t.text('.pc-formula')) === 'x = cos t,  y = sin t,  0 ≤ t ≤ 2π' && (await readout()).includes('point (x, y) = (1, 0)'),
    'starts with the unit circle at (1, 0)')

  await t.set('input[type=range]', 60)                  // t = π/2
  let r = await readout()
  t.check(r.includes('t = π/2 ≈ 1.571') && r.includes('point (x, y) = (0, 1)') && r.includes('⟨x′, y′⟩ = ⟨−1, 0⟩') && r.includes('speed = 1'),
    'circle at t = π/2: point (0, 1), velocity ⟨−1, 0⟩, speed 1')
  t.check((await t.count('.pc-velocity')) === 1, 'draws the velocity arrow')

  await t.select('select', 'cycloid')
  r = await readout()
  t.check(r.includes('momentarily at rest') && (await t.count('.pc-velocity')) === 0, 'cycloid at t = 0: speed 0, no arrow')
  await t.set('input[type=range]', 120)                 // t = π, the top of the arch
  r = await readout()
  t.check(r.includes('t = π ≈ 3.142') && r.includes('≈ (3.142, 2)') && r.includes('= ⟨2, 0⟩') && r.includes('speed = 2'),
    'cycloid at t = π: point (π, 2), velocity ⟨2, 0⟩')

  await t.select('select', 'lissajous')
  await t.set('input[type=range]', 20)                  // t = π/6
  r = await readout()
  t.check(r.includes('≈ (0.866, 1)') && r.includes('= ⟨1, 0⟩'), 'Lissajous at t = π/6: point (√3/2, 1), horizontal velocity ⟨1, 0⟩')

  await t.select('select', 'cardioid')
  t.check((await t.text('.pc-formula')) === 'r = 1 + cos θ,  0 ≤ θ ≤ 2π' && (await t.text('.cw-slider label')) === 'θ', 'cardioid: polar formula and θ slider')
  await t.set('input[type=range]', 60)                  // θ = π/2 (Example 16.7)
  r = await readout()
  t.check(r.includes('r = 1') && r.includes('= (0, 1)') && r.includes('⟨dx/dθ, dy/dθ⟩ = ⟨−1, −1⟩') && r.includes('speed ≈ 1.414'),
    'cardioid at θ = π/2: point (0, 1), velocity ⟨−1, −1⟩')

  await t.select('select', 'rose')
  await t.set('input[type=range]', 40)                  // θ = π/3, r = cos π = −1
  r = await readout()
  t.check(r.includes('r = −1') && r.includes('r < 0') && r.includes('≈ (−0.5, −0.866)'), 'rose at θ = π/3: r = −1, point on the opposite ray')

  await t.select('select', 'spiral')
  await t.set('input[type=range]', 240)                 // θ = 2π
  r = await readout()
  t.check(r.includes('θ = 2π') && r.includes('r ≈ 3.142') && r.includes('≈ ⟨0.5, 3.142⟩') && r.includes('speed ≈ 3.181'),
    'spiral at θ = 2π: r = π, velocity ⟨1/2, π⟩')

  // Play and Pause.
  await t.select('select', 'circle')
  await t.click('Play')
  t.check((await t.text('.pc-play')) === 'Pause', 'Play turns into Pause')
  await t.wait(800)
  const k1 = await k()
  t.check(k1 > 0, `the parameter advances while playing (k = ${k1})`)
  await t.click('Pause')
  const k2 = await k()
  await t.wait(400)
  const k3 = await k()
  t.check(k3 === k2 && (await t.text('.pc-play')) === 'Play', 'Pause stops it')

  // Playing to the end stops there.
  await t.set('input[type=range]', 228)
  await t.click('Play')
  await t.wait(1200)
  r = await readout()
  t.check((await t.text('.pc-play')) === 'Play' && (await k()) === 240 && r.startsWith('t = 2π ≈ 6.283\n') && r.includes('point (x, y) = (1, 0)'),
    'the animation stops at the end, t = 2π')
  await t.set('input[type=range]', 40)
  await t.shot()
}
