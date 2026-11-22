export const page = 'module_19'

// The limits of the inner or outer integral of the set-up, as [lower, upper].
const lims = async (t, which) => [await t.text(`.rsl-setup .${which} .rsl-lo`), await t.text(`.rsl-setup .${which} .rsl-hi`)]
const slice = async t => [await t.text('.rsl-from'), await t.text('.rsl-to')]

export async function run(t) {
  // The start: the region between y = x² and y = x (Example 19.4), vertical slices, the slice at x = 0.5.
  let inner = await lims(t, 'rsl-inner'), outer = await lims(t, 'rsl-outer')
  t.check(inner.join() === 'x²,x' && outer.join() === '0,1' && (await t.text('.rsl-setup')).endsWith('dy dx'),
    `dy dx: the integral from 0 to 1 of the integral from x² to x (inner ${inner}, outer ${outer})`)
  let s = await slice(t)
  t.check(s.join() === '= 0.25,= 0.5' && await t.text('.rsl-len') === '0.25' && (await t.text('.rsl-slice')).includes('x = 0.5'),
    `the slice at x = 0.5 runs from y = x² = 0.25 to y = x = 0.5 (${s})`)
  const av = await t.text('.rsl-area-v .rsl-num'), ah = await t.text('.rsl-area-h .rsl-num')
  t.check(av === '≈ 0.1666667' && ah === '≈ 0.1666667' && (await t.text('.rsl-exact')).startsWith('Exact area: 1/6'),
    `the area both ways ≈ 0.1666667, exactly 1/6 (${av}, ${ah})`)
  const labels = await t.texts('.rsl-curve-label')
  t.check(await t.attr('.rsl-slice-seg', 'x1') === await t.attr('.rsl-slice-seg', 'x2') && labels.join() === 'y = x²,y = x' && await t.count('.rsl-curve') === 2,
    `a vertical slice, and the two boundary curves labelled as functions of x (${labels})`)

  // Move the slice with the slider.
  await t.set('input[type=range]', 0.3)
  s = await slice(t)
  t.check(s.join() === '= 0.09,= 0.3' && await t.text('.rsl-pos output') === '0.3', `x = 0.3: from x² = 0.09 to x = 0.3 (${s})`)

  // Horizontal slices: the limits and the labels change to functions of y; a rounded value is marked ≈.
  await t.select('select >> nth=1', 'dxdy')
  inner = await lims(t, 'rsl-inner')
  t.check(inner.join() === 'y,√y' && (await t.texts('.rsl-curve-label')).join() === 'x = √y,x = y' &&
    await t.attr('.rsl-slice-seg', 'y1') === await t.attr('.rsl-slice-seg', 'y2') && (await t.text('.rsl-setup')).endsWith('dx dy'),
    `dx dy: inner limits y and √y, boundary labels x = √y and x = y, a horizontal slice (${inner})`)
  s = await slice(t)
  t.check(s.join() === '= 0.5,≈ 0.7071' && await t.text('.rsl-pos label') === 'Slice at y', `y = 0.5 (the middle): from x = y = 0.5 to x = √y ≈ 0.7071 (${s})`)

  // The quarter disc: inner limits with square roots; at y = 0.6 the slice ends at √0.64 = 0.8 exactly.
  await t.select('select >> nth=0', 'disc')
  await t.set('input[type=range]', 0.6)
  inner = await lims(t, 'rsl-inner')
  s = await slice(t)
  t.check(inner.join() === '0,√(1 − y²)' && s.join() === '0,= 0.8', `quarter disc, dx dy at y = 0.6: from 0 to √(1 − 0.36) = 0.8 (${inner}; ${s})`)
  t.check(await t.text('.rsl-area-v .rsl-num') === '≈ 0.7853982' && await t.text('.rsl-area-h .rsl-num') === '≈ 0.7853982' &&
    (await t.text('.rsl-exact')).startsWith('Exact area: π/4'), 'quarter disc: the area both ways ≈ 0.7853982, exactly π/4')

  // The region between y = √x and y = x/2: the outer limits change with the order.
  await t.select('select >> nth=0', 'sqrt')
  await t.select('select >> nth=1', 'dydx')
  await t.set('input[type=range]', 1)
  outer = await lims(t, 'rsl-outer'); inner = await lims(t, 'rsl-inner'); s = await slice(t)
  const okV = outer.join() === '0,4' && inner.join() === 'x/2,√x' && s.join() === '= 0.5,= 1'
  await t.select('select >> nth=1', 'dxdy')
  await t.set('input[type=range]', 1)
  outer = await lims(t, 'rsl-outer'); inner = await lims(t, 'rsl-inner'); s = await slice(t)
  t.check(okV && outer.join() === '0,2' && inner.join() === 'y²,2y' && s.join() === '= 1,= 2' && (await t.text('.rsl-exact')).startsWith('Exact area: 4/3'),
    `between √x and x/2: 0 ≤ x ≤ 4 with x/2 ≤ y ≤ √x, and 0 ≤ y ≤ 2 with y² ≤ x ≤ 2y (${outer}; ${inner}; ${s})`)

  // The triangle 0 ≤ y ≤ x ≤ 1 with horizontal slices: x runs from y to 1.
  await t.select('select >> nth=0', 'tri')
  inner = await lims(t, 'rsl-inner')
  t.check(inner.join() === 'y,1' && await t.text('.rsl-area-h .rsl-num') === '≈ 0.5' && (await t.texts('.rsl-curve-label')).length === 3,
    `triangle, dx dy: x from y to 1, area ≈ 0.5, three labelled sides (${inner})`)

  // Dragging across the picture moves the slice, snapped to the slider's steps and kept inside the region.
  await t.drag('svg.cw-plot', [0.5, 0.4], [0.5, 0.75])
  const pos = await t.text('.rsl-pos output'), y = Number(pos)
  t.check(y >= 0 && y <= 1 && y < 0.5 && (await t.text('.rsl-slice')).includes('y = ' + pos), `dragging down moves the horizontal slice down, to y = ${pos}`)
  await t.select('select >> nth=0', 'parab')
  await t.select('select >> nth=1', 'dydx')
  await t.set('input[type=range]', 0.6)
  await t.shot()
}
