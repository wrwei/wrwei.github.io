export const page = 'module_14'

export async function run(t) {
  const sn = () => t.text('.se-sn'), sum = () => t.text('.se-sum'), err = () => t.text('.se-err'), verdict = () => t.text('.se-verdict')
  const dots = () => t.count('.se-plot:not(.se-terms) circle')
  // Start: the geometric series with r = 0.5 and N = 10: S_10 = 1023/512 = 1.998046875, sum 2, gap 1/512.
  t.check((await sn()) === 'S₁₀ ≈ 1.998047' && (await sum()) === 'Sum: 1/(1 − r) = 2' && (await err()) === 'Sum − S₁₀ ≈ 0.001953',
    'geometric r = 0.5: S₁₀ ≈ 1.998047, sum 2, and 2 − S₁₀ = 1/512 ≈ 0.001953')
  t.check((await verdict()).startsWith('Converges') && (await dots()) === 10, 'converges; ten dots for S₁ … S₁₀')
  await t.set('input[type=range] >> nth=0', 0.3)               // r = 0.3: the sum is 10/7
  t.check((await sum()) === 'Sum: 1/(1 − r) = 10/7 ≈ 1.428571', 'r = 0.3: the sum is the fraction 10/7')
  await t.set('input[type=range] >> nth=0', -1)                // r = −1: partial sums 1, 0, 1, 0, …
  t.check((await sn()) === 'S₁₀ = 0' && (await verdict()).includes('divergence test'), 'r = −1: S₁₀ = 0 exactly, diverges by the divergence test')
  await t.set('input[type=range] >> nth=0', 1)                 // r = 1: S_N = N
  t.check((await sn()) === 'S₁₀ = 10' && (await verdict()).startsWith('Diverges: r = 1'), 'r = 1: S₁₀ = 10, diverges')
  await t.set('input[type=range] >> nth=0', 0)                 // r = 0: 1 + 0 + 0 + …
  t.check((await sn()) === 'S₁₀ = 1' && (await err()) === 'Sum − S₁₀ = 0', 'r = 0: S₁₀ = 1 and the error is exactly 0')
  // The harmonic series at N = 200: H_200 = 5.878030948…, bounds ln 201 and 1 + ln 200, and no sum line.
  await t.select('select', 'harm')
  await t.set('input[type=range] >> nth=2', 200)
  t.check((await sn()) === 'S₂₀₀ ≈ 5.878031' && (await dots()) === 200, 'harmonic: S₂₀₀ ≈ 5.878031, 200 dots')
  t.check((await verdict()).startsWith('Diverges') && (await sum()).startsWith('No sum')
    && (await err()).includes('5.303304') && (await err()).includes('6.298318')
    && (await t.count('.se-plot:not(.se-terms) line[stroke-dasharray="7 5"]')) === 0, 'harmonic: diverges, ln 201 ≤ S₂₀₀ ≤ 1 + ln 200, no sum line')
  // p-series: p = 2 has the sum π²/6; p = 3 gets the integral-test interval; p = 0.5 diverges; the r slider hides.
  await t.select('select', 'p')
  await t.set('input[type=range] >> nth=2', 100)
  t.check((await sn()) === 'S₁₀₀ ≈ 1.634984' && (await sum()) === 'Sum: π²/6 ≈ 1.644934'
    && (await t.attr('.se-sliders .cw-slider >> nth=0', 'hidden')) !== null && (await t.attr('.se-sliders .cw-slider >> nth=1', 'hidden')) === null,
    'p = 2: S₁₀₀ ≈ 1.634984, sum π²/6; the p slider shows and the r slider hides')
  await t.set('input[type=range] >> nth=1', 3)
  await t.set('input[type=range] >> nth=2', 5)                 // Exercise 14.7: 1.199551 ≤ sum ≤ 1.205662
  t.check((await err()) === 'Integral test: 1.199550 ≤ sum ≤ 1.205663' && (await sn()) === 'S₅ ≈ 1.185662', 'p = 3, N = 5: the interval of Exercise 14.7, rounded outwards')
  await t.set('input[type=range] >> nth=1', 0.5)
  t.check((await verdict()).startsWith('Diverges: a p-series with p ≤ 1'), 'p = 0.5: diverges')
  // The alternating harmonic series at N = 20, 1/n! from n = 0 at N = 10, and Σ(−1)ⁿ at N = 7.
  await t.select('select', 'alt')
  await t.set('input[type=range] >> nth=2', 20)
  t.check((await sn()) === 'S₂₀ ≈ 0.6687714' && (await err()).includes('≤ 1/(N + 1) ≈ 0.04762') && (await verdict()).includes('conditionally'),
    'alternating harmonic: S₂₀ ≈ 0.6687714, error bound 1/21, conditional')
  await t.select('select', 'fact')
  await t.set('input[type=range] >> nth=2', 10)
  t.check((await sn()) === 'S₁₀ ≈ 2.718282' && (await sum()).startsWith('Sum: e ≈ 2.718282') && (await verdict()).includes('ratio test'), '1/n! from n = 0: S₁₀ ≈ 2.718282, sum e, ratio test')
  await t.select('select', 'osc')
  await t.set('input[type=range] >> nth=2', 7)
  t.check((await sn()) === 'S₇ = 1' && (await verdict()).includes('divergence test'), 'Σ(−1)ⁿ: S₇ = 1, diverges by the divergence test')
  await t.select('select', 'geom')
  await t.set('input[type=range] >> nth=0', 0.9)
  await t.set('input[type=range] >> nth=2', 60)
  await t.shot()
}
