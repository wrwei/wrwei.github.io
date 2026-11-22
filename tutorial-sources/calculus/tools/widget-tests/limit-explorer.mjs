export const page = 'module_02'

// Slider positions: the ε and δ sliders step through these values.
const V = [0.001, 0.002, 0.005, 0.01, 0.02, 0.03, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.5, 2]
const at = v => V.indexOf(v)

export async function run(t) {
  const plain = s => s.replace(/\u00a0/g, ' ').replace(/\u2060/g, '')   // the widget keeps each inequality on one line
  const words = async () => plain(await t.text('.cw-readout'))
  const formula = async () => plain(await t.text('.le-formula'))
  const width = async () => { const v = (await t.attr('svg.cw-plot', 'data-view')).split(' ').map(Number); return v[1] - v[0] }
  const eps = v => t.set('input[type=range] >> nth=0', at(v))
  const delta = v => t.set('input[type=range] >> nth=1', at(v))

  t.check((await formula()) === 'f(x) = (x² − 1)/(x − 1), a = 1, L = 2', 'starts with (x² − 1)/(x − 1) at a = 1, with L = 2')
  let w = await words()
  t.check(w.includes('the band 1.5 < y < 2.5') && w.includes('0 < |x − 1| < 1') && w.includes('Escapes: at x ≈') && (await t.count('circle.le-escape')) === 1,
    'ε = 0.5, δ = 1: the band 1.5 < y < 2.5, and a named point escapes (red dot)')
  await delta(0.5)
  w = await words()
  t.check(w.includes('This δ wins') && (await t.count('circle.le-escape')) === 0, 'δ = 0.5 wins against ε = 0.5, and no point is marked')
  await eps(0.1); await delta(0.1)
  t.check((await words()).includes('This δ wins'), 'for x + 1, δ = ε = 0.1 wins')
  await delta(0.15)
  t.check((await words()).includes('Escapes') && (await words()).includes('Try a smaller δ'), 'δ = 0.15 loses against ε = 0.1')

  await t.click('Zoom in'); await t.click('Zoom in')
  t.check((await width()) === 1 && (await t.text('.le-zoom')) === 'zoom ×4', 'two clicks on Zoom in shrink the view from width 4 to width 1 around (1, 2)')
  await t.click('Reset view')
  t.check((await width()) === 4, 'Reset view restores the view')

  await t.select('select >> nth=0', 'sinc')
  await eps(0.01); await delta(0.2)
  t.check((await formula()) === 'f(x) = sin(x)/x, a = 0, L = 1' && (await words()).includes('This δ wins'), 'sin(x)/x: δ = 0.2 wins against ε = 0.01')
  await delta(0.3)
  t.check((await words()).includes('Escapes'), 'sin(x)/x: δ = 0.3 loses against ε = 0.01 (1 − sin(0.3)/0.3 ≈ 0.0149)')

  await t.select('select >> nth=0', 'xsin')
  await eps(0.05); await delta(0.05)
  const w1 = await words()
  await delta(0.1)
  t.check(w1.includes('This δ wins') && (await words()).includes('Escapes'), 'x·sin(1/x): δ = ε = 0.05 wins, δ = 0.1 loses')

  await t.select('select >> nth=0', 'jump')
  w = await words()
  t.check((await t.count('option')) === 8 && w.includes('no δ wins once ε ≤ 2') && w.includes('f(x) = −1') && w.includes('no limit at 0'),
    '|x|/x: candidate L = 1 is offered, and the readout says no δ wins once ε ≤ 2')
  await t.select('select >> nth=1', '0'); await eps(1.5)
  w = await words()
  t.check(w.includes('This δ wins') && w.includes('no δ wins once ε ≤ 1'), '|x|/x with L = 0: ε = 1.5 is met, but no δ wins once ε ≤ 1')

  await t.select('select >> nth=0', 'osc')
  await eps(1); await delta(0.001)
  w = await words()
  t.check(w.includes('Escapes') && w.includes('f(x) = 1 and x with f(x) = −1'), 'sin(1/x) with L = 0: even δ = 0.001 loses against ε = 1')

  await t.select('select >> nth=0', 'hole')
  await eps(0.5); await delta(0.75)
  await t.shot()
}
