export const page = 'module_01'

export async function run(t) {
  t.check((await t.text('.fe-formula')) === 'y = x²', 'starts with y = x²')
  t.check((await t.count('path')) >= 2, 'draws f and the transformed graph')
  await t.set('input[type=range] >> nth=0', 2)          // a = 2
  t.check((await t.text('.fe-formula')) === 'y = 2·x²', 'a = 2 gives y = 2·x²')
  t.check((await t.text('.cw-readout')).includes('stretched vertically by a factor of 2'), 'describes a vertical stretch')
  await t.set('input[type=range] >> nth=2', 1)          // c = 1
  t.check((await t.text('.fe-formula')) === 'y = 2·(x − 1)²', 'c = 1 shifts right: y = 2·(x − 1)²')
  t.check((await t.text('.cw-readout')).includes('shifted 1 to the right'), 'describes the shift to the right')
  await t.set('input[type=range] >> nth=3', -1.5)       // d = −1.5
  t.check((await t.text('.fe-formula')) === 'y = 2·(x − 1)² − 1.5', 'd = −1.5 shifts down')
  await t.select('select', 'sin')
  t.check((await t.text('.fe-formula')) === 'y = 2·sin(x − 1) − 1.5', 'keeps a, c, d for sin')
  await t.set('input[type=range] >> nth=1', 0)          // b = 0 is not allowed: moves to ±0.25
  t.check(!(await t.text('.fe-formula')).includes('0x'), 'b never becomes 0')
  await t.click('Reset')
  t.check((await t.text('.fe-formula')) === 'y = sin x', 'Reset restores y = sin x')
  t.check((await t.text('.cw-readout')).includes('itself'), 'Reset says this is f itself')
  await t.shot()
}
