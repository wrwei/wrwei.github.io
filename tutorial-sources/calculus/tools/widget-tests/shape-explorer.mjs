export const page = 'module_08'

// The signs shown in a sign chart, left to right, e.g. "+ − +".
const signs = (t, k) => t.page.evaluate((root, k) => [...document.querySelectorAll(`${root} .se-chart${k} .se-seg`)]
  .map(e => e.getAttribute('data-sign')).join(' '), t.root, k)

export async function run(t) {
  // f(x) = x³ − 3x: f′ = 3(x − 1)(x + 1), f″ = 6x.
  let s = await t.text('.se-summary')
  t.check(s.includes('x ≈ −1 (local maximum), x ≈ 1 (local minimum)') && s.includes('Inflection points: x ≈ 0'),
    'x³ − 3x: local maximum at −1, local minimum at 1, inflection point at 0')
  t.check((await t.count('.se-main .se-crit')) === 2 && (await t.count('.se-main .se-infl')) === 1, 'x³ − 3x: two critical points and one inflection point are marked')
  t.check((await signs(t, 1)) === '+ − +' && (await signs(t, 2)) === '− +', 'x³ − 3x: the sign charts read + − + for f′ and − + for f″')
  t.check((await t.count('.se-main .se-up')) === 2 && (await t.count('.se-main .se-down')) === 1 &&
    (await t.count('.se-main .se-cd')) === 1 && (await t.count('.se-main .se-cu')) === 1, 'the curve is blue, orange, blue; the background concave down, then up')

  // The point x = 0.5: f = 0.125 − 1.5 = −1.375 exactly, f′ = −2.25, f″ = 3.
  await t.set('input[type=range]', 0.5)
  let p = await t.text('.se-point')
  t.check(p.includes('f(x) = −1.375') && p.includes('f′(x) ≈ −2.25 < 0: f is decreasing here') && p.includes('f″(x) ≈ 3 > 0: concave up here'),
    'x = 0.5: f(x) = −1.375, f′(x) ≈ −2.25 (decreasing), f″(x) ≈ 3 (concave up)')
  const y1 = Number(await t.attr('.se-tangent', 'y1')), y2 = Number(await t.attr('.se-tangent', 'y2'))
  t.check(y2 > y1, 'x = 0.5: the tangent at the point slopes downwards')

  // x⁴ − 4x³ (Example 8.10): a flat point at 0 that is no extremum and is an inflection point; a minimum at 3.
  await t.select('select', 'quartic')
  s = await t.text('.se-summary')
  t.check(s.includes('x ≈ 0 (f′ = 0 but f′ does not change sign: no extremum), x ≈ 3 (local minimum)') && s.includes('Inflection points: x ≈ 0, x ≈ 2'),
    'x⁴ − 4x³: critical numbers 0 (no extremum) and 3 (minimum), inflection points 0 and 2')
  t.check((await signs(t, 2)) === '+ − +', 'x⁴ − 4x³: f″ is + − +')

  // x/(1 + x²): inflection points at 0 and ±√3 ≈ ±1.732.
  await t.select('select', 'witch')
  s = await t.text('.se-summary')
  t.check(s.includes('x ≈ −1 (local minimum), x ≈ 1 (local maximum)') && s.includes('Inflection points: x ≈ −1.732, x ≈ 0, x ≈ 1.732'),
    'x/(1 + x²): minimum at −1, maximum at 1, inflection points at −√3, 0, √3')

  // x e^(−x) (Example 8.12): maximum at 1, inflection point at 2.
  await t.select('select', 'xexp')
  s = await t.text('.se-summary')
  t.check(s.includes('Critical numbers: x ≈ 1 (local maximum)') && s.includes('Inflection points: x ≈ 2'), 'x·e^(−x): maximum at 1, inflection point at 2')

  // sin x + x/2: f′ = cos x + 1/2 is 0 at ±2π/3 and ±4π/3.
  await t.select('select', 'sin')
  s = await t.text('.se-summary')
  t.check(s.includes('x ≈ −4.189 (local maximum), x ≈ −2.094 (local minimum), x ≈ 2.094 (local maximum), x ≈ 4.189 (local minimum)'),
    'sin x + x/2: extrema at ±2π/3 ≈ ±2.094 and ±4π/3 ≈ ±4.189')

  // A typed function with asymptotes (Example 8.11): the sign changes at ±2 are breaks, not inflection points.
  await t.type('input[type=text]', 'x^2/(x^2 - 4)')
  await t.wait(400)
  s = await t.text('.se-summary')
  const chosen = await t.page.evaluate(root => document.querySelector(root + ' select').value, t.root)
  t.check(s.includes('Critical numbers: x ≈ 0 (local maximum)') && s.includes('Inflection points: none') &&
    s.includes('Not defined or not continuous at: x ≈ −2, x ≈ 2') && chosen === 'own', 'x²/(x² − 4): maximum at 0, asymptotes at ±2, no inflection point')

  // The cusp of Example 8.7: a local maximum where f′ does not exist.
  await t.type('input[type=text]', 'cbrt(x^2)(x - 5)')
  await t.wait(400)
  s = await t.text('.se-summary')
  t.check(s.includes('x ≈ 0 (local maximum; f′ does not exist there), x ≈ 2 (local minimum)') && s.includes('Inflection points: x ≈ −1'),
    'x^(2/3)(x − 5): maximum at the cusp 0, minimum at 2, inflection point at −1')

  // A mistyped formula gives a message and keeps the last function.
  await t.type('input[type=text]', 'x^^2')
  await t.wait(400)
  t.check((await t.text('.cw-msg')).length > 0 && (await t.text('.se-summary')).includes('x ≈ 2 (local minimum)'), 'a mistyped formula shows a message and keeps the graph')

  // Zoom in about the point: the window halves.
  await t.select('select', 'cubic')
  await t.click('Zoom in')
  t.check((await t.text('.se-summary')).startsWith('In the window 0.25 ≤ x ≤ 2.75'), 'Zoom in halves the window about the point x = 1.5')
  await t.select('select', 'cubic')
  await t.shot()
}
