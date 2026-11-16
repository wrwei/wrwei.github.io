// Test of the truth-table widget (Module 2).
export const page = 'module_02'

export async function run(t) {
  const zh = t.lang === 'zh'
  const has = (s, en, cn) => s.toLowerCase().includes((zh ? cn : en).toLowerCase())

  // The starting formula A ⟶ B: four rows, contingent, one model and one counterexample highlighted.
  t.check(await t.count('tbody tr') === 4, 'starts with the 4-row table of A ⟶ B')
  t.check(has(await t.text('.verdict'), 'true in 3 of 4 rows', '4 行中有 3 行为真'), 'A ⟶ B is true in 3 of 4 rows')
  t.check(await t.count('tr.sat') === 1 && await t.count('tr.fal') === 1, 'one satisfying and one falsifying row are highlighted')
  t.check((await t.text('.tt-falrow')).includes('A = T, B = F'), 'the counterexample to A ⟶ B is A = T, B = F')

  // A contradiction and a tautology, typed in Unicode.
  await t.type('.tt-f1', 'A ∧ ¬A')
  t.check(has(await t.text('.verdict'), 'contradiction', '矛盾'), 'classifies A ∧ ¬A as a contradiction')
  t.check(await t.count('tr.sat') === 0 && await t.count('tr.fal') === 1, 'a contradiction has no satisfying row')
  await t.type('.tt-f1', 'A ∨ ¬A')
  t.check(has(await t.text('.verdict'), 'tautology', '重言'), 'classifies A ∨ ¬A as a tautology')

  // ASCII input and Isabelle's grouping: --> groups to the right, ~ binds tighter than &.
  await t.type('.tt-f1', '~A & B --> C --> A')
  t.check(await t.count('tbody tr') === 8, 'ASCII formula with three atoms has 8 rows')
  t.check((await t.text('.tt-read')).includes('((¬A) ∧ B) ⟶ (C ⟶ A)'), 'shows the grouping ((¬A) ∧ B) ⟶ (C ⟶ A)')
  t.check((await t.texts('thead th')).includes('¬A ∧ B'), 'shows the sub-formula ¬A ∧ B as a column')

  // Symbol buttons insert at the cursor.
  await t.type('.tt-f1', 'P ')
  await t.click('[data-sym="⟶"]')
  await t.type('.tt-f1', ' P', { clear: false })
  t.check(has(await t.text('.verdict'), 'tautology', '重言'), 'symbol button builds P ⟶ P, a tautology')

  // Bad input gives a message, not an exception; too many atoms gives the limit message.
  await t.type('.tt-f1', 'A ∧ ∨ B')
  t.check(has(await t.text('.verdict'), 'cannot read', '无法读取') && await t.count('tbody tr') === 0, 'bad input shows a message and no table')
  await t.type('.tt-f1', 'A ∧ B ∧ C ∧ D ∧ E ∧ F ∧ G')
  t.check(has(await t.text('.verdict'), 'at most 6 atoms', '最多显示 6 个原子'), 'seven atoms: the limit is explained')

  // = between formulas, and symbols that look like connectives, get an explanation.
  await t.type('.tt-f1', 'A ∧ B = B ∧ A')
  t.check((await t.text('.verdict')).includes('“B = B”') && await t.count('tbody tr') === 0, '= binds more tightly than ∧: the message names B = B')
  await t.type('.tt-f1', 'A ↔ B')
  t.check((await t.text('.verdict')).includes('<-->'), '↔ is not Isabelle’s symbol: the message suggests <-->')

  // ⟶ inside ⟷ keeps its parentheses in the columns, as the page advises.
  await t.type('.tt-f1', 'A ⟶ B ⟷ C')
  t.check((await t.texts('thead th')).includes('A ⟶ (B ⟷ C)'), 'A ⟶ B ⟷ C is shown as A ⟶ (B ⟷ C)')

  // A preset.
  await t.click('[data-preset="peirce"]')
  t.check(has(await t.text('.verdict'), 'tautology', '重言'), 'Peirce’s law preset is a tautology')
  await t.click('[data-preset="door"]')
  t.check(await t.count('tbody tr') === 16 && has(await t.text('.verdict'), 'true in 13 of 16', '16 行中有 13 行为真'), 'door rule: 16 rows, 13 true')
  await t.shot()

  // Compare mode.
  await t.click('[data-mode="compare"]')
  await t.click('[data-preset="wrongdm"]')
  t.check(has(await t.text('.verdict'), 'differ in 2 of 4', '4 行中有 2 行取值不同') && await t.count('tr.diff') === 2, 'wrong De Morgan: differs in 2 rows')
  await t.type('.tt-f2', '~A | ~B')
  const eq = await t.text('.verdict')
  t.check(eq.startsWith(zh ? '等价' : 'Equivalent') && await t.count('tr.diff') === 0, 'De Morgan typed in ASCII: equivalent')
  await t.click('[data-preset="converse"]')
  t.check(await t.count('tr.diff') === 2, 'converse differs from the implication in 2 rows')
  await t.click('[data-preset="contrapos"]')
  t.check((await t.text('.verdict')).includes('(A ⟶ B) ⟷ (¬B ⟶ ¬A)'), 'contrapositive: equivalent, with both sides in parentheses')
  await t.shot('compare')

  // Narrow screen: the page must not scroll sideways; the table scrolls inside the widget.
  await t.page.setViewport({ width: 360, height: 800 })
  await t.click('[data-mode="single"]')
  await t.click('[data-preset="chain"]')
  await t.wait(150)
  const w = await t.page.evaluate(root => { const r = document.querySelector(root); return { widget: r.scrollWidth - r.clientWidth, page: document.documentElement.scrollWidth - document.documentElement.clientWidth } }, t.root)
  t.check(w.widget <= 1, `the widget fits 360 px; its table scrolls inside it (overflow ${w.widget}px)`)
  t.check(w.page <= 1, `no horizontal page scroll at 360 px (overflow ${w.page}px)`)
  await t.shot('narrow')
}
