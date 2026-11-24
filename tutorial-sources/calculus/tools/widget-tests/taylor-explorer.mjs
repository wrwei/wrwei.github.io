export const page = 'module_15'

// Expected values computed independently with mpmath (50 digits), then rounded as the widget shows them.
export async function run(t) {
  const val = sel => t.text(sel + ' .te-val')
  const A = 'input[type=range] >> nth=0', N = 'input[type=range] >> nth=1', X0 = 'input[type=range] >> nth=2'

  // e^x about 0, n = 1, x0 = 1: the tangent line 1 + x; T1(1) = 2, e - 2 = 0.7182818.
  t.check(await t.text('.te-formula') === 'T₁(x) = 1 + x' && await val('.te-T') === '≈ 2' && await val('.te-f') === '≈ 2.718281828',
    'eˣ, n = 1: T₁(x) = 1 + x, T₁(1) = 2, f(1) = e')
  t.check(await val('.te-err') === '≈ 0.7182818' && await val('.te-R') === '∞' && await t.count('.te-band') === 0,
    'error e − 2 ≈ 0.7182818; radius ∞, no band')

  // n = 10 and n = 20: the errors e - s_10 and e - s_20, the second far below rounding level (summed from the tail).
  await t.set(N, 10)
  t.check(await val('.te-err') === '≈ 2.731266 × 10⁻⁸' && await val('.te-T') === '≈ 2.718281801', 'n = 10: error e − s₁₀ ≈ 2.731266 × 10⁻⁸')
  await t.set(N, 20)
  t.check(await val('.te-err') === '≈ 2.050298 × 10⁻²⁰', 'n = 20: error ≈ 2.050298 × 10⁻²⁰, not lost in rounding')
  t.check(await t.text('.te-formula') === 'T₂₀(x) = 1 + x + x²/2! + x³/3! + ⋯ + x²⁰/20!', 'the formula of T₂₀ at a = 0, exact')
  await t.shot()

  // sin x keeps n = 20: only odd powers; at x0 = 2 the error is about 4.07 × 10^-14.
  await t.select('select', 'sin')
  t.check(await t.text('.te-formula') === 'T₂₀(x) = x − x³/3! + x⁵/5! − x⁷/7! + ⋯ − x¹⁹/19!' && await val('.te-err') === '≈ 4.07251 × 10⁻¹⁴',
    'sin x, n = 20: odd powers with alternating signs; error at 2 ≈ 4.07251 × 10⁻¹⁴')

  // ln(1 + x): radius 1, interval (-1, 1]; compare the errors inside and outside at two degrees.
  await t.select('select', 'ln')
  t.check(await val('.te-R') === '= 1' && await val('.te-I') === '(−1, 1]' && await t.count('.te-band') === 1 && await val('.te-err') === '≈ 1.537399 × 10⁻⁸',
    'ln(1 + x): R = 1, interval (−1, 1], band drawn; at x₀ = 0.5 with n = 20 the error is ≈ 1.537399 × 10⁻⁸')
  await t.set(X0, 1.5)
  t.check(await val('.te-err') === '≈ 97.74488' && (await t.text('.te-msg')).includes('outside'), 'x₀ = 1.5 is outside: with n = 20 the error is ≈ 97.74488')
  await t.set(N, 5)
  t.check(await val('.te-err') === '≈ −0.8368343', 'at x₀ = 1.5 the absolute error with n = 5 is smaller than with n = 20')
  await t.shot('outside')
  t.check(await t.attr(A, 'min') === '-0.9', 'for ln(1 + x) the centre is kept to the right of −1')

  // Divergence does not mean every increase in degree increases the absolute error.
  await t.set(N, 1)
  const degreeOneError = await val('.te-err')
  await t.set(N, 2)
  t.check(degreeOneError === '≈ −0.5837093' && await val('.te-err') === '≈ 0.5412907' && (await t.text('.te-msg')).includes('increasing n need not improve'),
    'outside, degrees 1 and 2: absolute error decreases from 0.5837093 to 0.5412907; no claim of monotonic growth')

  // 1/(1 - x) about -1: radius 2, interval (-3, 1).
  await t.select('select', 'geo')
  await t.set(A, -1)
  t.check(await val('.te-R') === '= 1 − a = 2' && await val('.te-I') === '(−3, 1)', '1/(1 − x) about −1: R = 2, interval (−3, 1)')

  // arctan about 1: radius sqrt(2), the distance from 1 to ±i.
  await t.select('select', 'atan')
  await t.set(A, 1)
  t.check(await val('.te-R') === '= √(1 + a²) ≈ 1.414213562' && await val('.te-I') === '≈ [−0.4142136, 2.414214]',
    'arctan x about 1: R = √2 ≈ 1.414213562, interval ≈ [−0.4142136, 2.414214]')

  // sqrt(1 + x) at x0 = -1.5: not defined there.
  await t.select('select', 'sqrt')
  await t.set(X0, -1.5)
  t.check(await val('.te-f') === 'not defined' && await val('.te-err') === '—' && (await t.text('.te-msg')).includes('not defined'),
    '√(1 + x) at x₀ = −1.5: f is not defined, no error shown')

  // cos x about 2 with n = 0: T0 is the constant cos 2; at x0 = a the error is exactly 0.
  await t.select('select', 'cos')
  await t.set(N, 0)
  await t.set(A, 2)
  t.check(await t.text('.te-formula') === 'T₀(x) ≈ −0.4161' && await val('.te-T') === '≈ −0.4161468365' && await val('.te-err') === '= 0',
    'cos x about 2, n = 0: T₀ = cos 2 ≈ −0.4161468365, and at x₀ = a the error is 0')
}
