// Test of the relation explorer (Module 4): properties with witnesses, closures, presets, sizes,
// classification, the graph, and keyboard use of the grid.
export const page = 'module_04'

export async function run(t) {
  const zh = t.lang === 'zh'
  const yes = zh ? '是' : 'yes'
  const no = zh ? '否' : 'no'
  const prop = id => t.text(`[data-prop="${id}"]`)

  // The widget starts with the chain {(1, 2), (2, 3), (3, 4)} on {1, ..., 4}.
  t.check(await t.count('[data-cell]') === 16 && await t.count('.re-edge') === 3,
    'starts with a 4 × 4 grid and a graph with one arrow per pair')
  const trans = await prop('trans')
  t.check(trans.includes(no) && trans.includes('(1, 2)') && trans.includes('(2, 3)') && trans.includes('(1, 3)'),
    'not transitive, with the witness (1, 2), (2, 3) but not (1, 3)')

  // The transitive closure adds (1, 3), (2, 4) and (1, 4), highlighted in the grid and the graph.
  await t.click('[data-closure="trans"]')
  t.check(await t.count('.re-cell.added') === 3 && await t.count('.re-edge.added') === 3 && (await t.text('.re-msg')).includes('(1, 4)'),
    'the transitive closure adds three pairs, listed and highlighted in grid and graph')
  t.check((await prop('trans')).includes(yes), 'the closure is transitive')
  t.check((await t.text('.re-kind')).includes(zh ? '严格序' : 'Strict order'), 'the closure of the chain is a strict order')
  await t.shot('closure')

  // Presets: ≤ is a total order, divisibility a partial order that is not total.
  await t.click('[data-preset="le"]')
  t.check((await t.text('.re-kind')).includes(zh ? '全序' : 'Total order'), '≤ is a total order')
  await t.click('[data-preset="div"]')
  const div = await t.text('.re-kind')
  t.check(div.includes(zh ? '偏序' : 'Partial order') && (await prop('total')).includes('(2, 3)'),
    'divisibility is a partial order; 2 and 3 are incomparable')

  // A 3-cycle: not symmetric, with a witness; three steps of the transitive closure fill the grid.
  await t.click('[data-size="3"]')
  await t.click('[data-preset="cycle"]')
  t.check(await t.count('[data-cell]') === 9, 'size 3 gives a 3 × 3 grid')
  t.check((await prop('sym')).includes(no) && (await prop('sym')).includes('(2, 1)'), 'the cycle is not symmetric, witness (1, 2) without (2, 1)')
  await t.click('[data-closure="trans"]')
  t.check(await t.count('.re-cell.added') === 6 && (await t.text('.re-kind')).includes('{1, 2, 3}'),
    'the transitive closure of the cycle relates everything: one class {1, 2, 3}')

  // Keyboard: Space on a focused cell toggles it, and the focus stays on the cell.
  await t.click('[data-preset="empty"]')
  await t.page.focus(`${t.root} [data-cell="2-1"]`)
  await t.page.keyboard.press('Space')
  await t.wait(80)
  const pressed = await t.page.$eval(`${t.root} [data-cell="2-1"]`, el => el.getAttribute('aria-pressed'))
  const focused = await t.page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-cell'))
  t.check(pressed === 'true' && focused === '2-1', 'Space toggles the focused cell and keeps the focus')
  await t.page.keyboard.press('ArrowRight')
  t.check(await t.page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-cell')) === '2-2',
    'arrow keys move between cells')

  // Symmetric closure of {(2, 1)} adds (1, 2); reflexive closure adds the three loops.
  await t.click('[data-closure="sym"]')
  t.check(await t.count('.re-cell.added') === 1 && (await t.text('.re-msg')).includes('(1, 2)'), 'the symmetric closure adds (1, 2)')
  await t.click('[data-closure="refl"]')
  t.check(await t.count('.re-cell.added') === 3 && (await t.text('.re-kind')).includes('{1, 2}'),
    'the reflexive closure adds three loops and gives an equivalence with the class {1, 2}')

  // A partition on five elements shows its classes.
  await t.click('[data-size="5"]')
  await t.click('[data-preset="part"]')
  t.check((await t.text('.re-kind')).includes('{3, 4, 5}') && (await t.text('.re-set')).includes('(5, 3)'),
    'the partition preset is an equivalence with the classes {1, 2} and {3, 4, 5}')
  await t.shot()
}
