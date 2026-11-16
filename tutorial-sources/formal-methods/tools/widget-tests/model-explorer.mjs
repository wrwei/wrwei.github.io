// Test of the model explorer (Module 3): the starting verdicts, the counterexamples and witnesses,
// editing P, Q and R, adding and removing elements, adding formulas (good and bad), keyboard use,
// and the layout at 360 px.
export const page = 'module_03'

export async function run(t) {
  const zh = t.lang === 'zh'
  const T = zh ? '真' : 'true', F = zh ? '假' : 'false'
  const verdict = i => t.text(`.mx-item[data-i="${i}"] .mx-v`)
  const why = i => t.text(`.mx-item[data-i="${i}"] .mx-why`)
  const pressed = sel => t.page.evaluate((root, sel) => document.querySelector(root + ' ' + sel).getAttribute('aria-pressed'), t.root, sel)

  // the starting structure: D = {a, b, c}, P = {a}, Q = {b}, R = {(a, b)}
  t.check(await t.count('.mx-item') === 8, 'shows the eight preset formulas')
  t.check((await t.text('.mx-summary')).includes('R = {(a, b)}'), 'the summary shows R as a set of pairs')
  t.check(await verdict(0) === F && (await why(0)).includes('x = b'), '∀x. ∃y. R x y is false, with counterexample x = b')
  t.check(await verdict(5) === T && (await why(5)).includes('x = b'), '∃x. P x ⟶ Q x is true, with witness b, which is not a P')
  t.check(await verdict(6) === T && (await why(6)).includes('x = a'), 'exactly one P: true, with witness a')
  t.check(await verdict(7) === F && (await why(7)).includes('x = a, y = b'), 'symmetry fails at x = a, y = b')

  // make ∀x. ∃y. R x y true while ∃y. ∀x. R x y stays false: R b c and R c a
  await t.click('button[aria-label="R b c"]')
  await t.click('button[aria-label="R c a"]')
  t.check(await verdict(0) === T, '∀x. ∃y. R x y becomes true')
  t.check(await verdict(1) === F, '∃y. ∀x. R x y stays false')
  t.check((await why(0)).includes('a → b') && (await why(0)).includes('c → a'), 'shows the y chosen for each x')
  t.check((await why(1)).includes('y = a'), 'explains why no single y works')

  // vacuous truth: untick P a, so that nothing is P
  await t.click('input[aria-label="P a"]')
  t.check(await verdict(2) === T && (await why(2)).includes(zh ? '空真' : 'vacuously'), '∀x. P x ⟶ Q x is vacuously true when P is empty')
  t.check(await verdict(4) === F, '∃x. P x ∧ Q x is false when P is empty')

  // a fourth element without arrows breaks ∀x. ∃y. R x y
  await t.click(zh ? '添加元素' : 'Add element')
  t.check(await t.count('button[aria-label^="R d "]') === 4, 'adds a row for d to the grid')
  t.check(await verdict(0) === F && (await why(0)).includes('x = d'), 'the new element d is a counterexample')
  const addDisabled = await t.page.evaluate((root, label) =>
    [...document.querySelectorAll(root + ' button')].find(b => b.textContent.trim() === label).disabled, t.root, zh ? '添加元素' : 'Add element')
  t.check(addDisabled === true, 'at most four elements: Add element is disabled')
  await t.click(zh ? '删除元素' : 'Remove element')
  t.check(await verdict(0) === T && await t.count('button[aria-label^="R d "]') === 0, 'removing d restores the verdict')

  // keyboard: a grid cell is a real button
  await t.page.focus(`${t.root} button[aria-label="R a a"]`)
  await t.page.keyboard.press('Enter')
  t.check(await pressed('button[aria-label="R a a"]') === 'true', 'Enter on a grid cell switches R a a on')

  // bad input never throws: a message instead, and nothing is added
  await t.type('.mx-input', '∀x. P x ∧')
  await t.click(zh ? '添加' : 'Add')
  t.check((await t.text('.mx-msg')).length > 0 && await t.count('.mx-item') === 8, 'an incomplete formula gives a message and is not added')
  await t.type('.mx-input', 'P x')
  await t.click(zh ? '添加' : 'Add')
  t.check((await t.text('.mx-msg')).includes(zh ? '自由变元' : 'free'), 'a free variable is reported')
  await t.type('.mx-input', '∀x. S x')
  await t.click(zh ? '添加' : 'Add')
  t.check((await t.text('.mx-msg')).includes('S'), 'an unknown predicate is reported')
  await t.type('.mx-input', '∃x. R x')
  await t.click(zh ? '添加' : 'Add')
  t.check((await t.text('.mx-msg')).includes(zh ? '两个参数' : 'two arguments'), 'a wrong number of arguments is reported')

  await t.type('.mx-input', '∃!x. P x')
  await t.click(zh ? '添加' : 'Add')
  t.check((await t.text('.mx-msg')).includes('∃x. P x ∧ (∀y. P y ⟶ y = x)') && await t.count('.mx-item') === 8, '∃! is explained, with the formula to write instead')
  await t.type('.mx-input', '∀x1 x2 x3 x4 x5 x6 x7 x8 x9. R x1 x2')
  await t.click(zh ? '添加' : 'Add')
  t.check((await t.text('.mx-msg')).includes('8') && await t.count('.mx-item') === 8, 'nine quantified variables: the limit is explained')

  // ≠ and mixed ⟶/⟷ print as in Isabelle, with the advised parentheses
  await t.type('.mx-input', '∀x y. ~ x = y --> R x y <-> R y x')
  await t.click(zh ? '添加' : 'Add')
  t.check((await t.text('.mx-item[data-i="8"] .mx-f')) === '∀x y. x ≠ y ⟶ (R x y ⟷ R y x)', 'prints ¬ x = y as x ≠ y and keeps the parentheses of ⟷ inside ⟶')
  await t.click('.mx-item[data-i="8"] .mx-del')

  // a good formula in ASCII is added, shown in Isabelle's notation and evaluated
  await t.type('.mx-input', 'EX y. ALL x. R x y --> P x')
  await t.page.keyboard.press('Enter')
  t.check(await t.count('.mx-item') === 9 && (await t.text('.mx-item[data-i="8"] .mx-f')) === '∃y. ∀x. R x y ⟶ P x', 'Enter adds an ASCII formula, printed with symbols')
  t.check(await verdict(8) === F, 'and evaluates it: false, since P is empty')
  await t.click('.mx-item[data-i="8"] .mx-del')
  t.check(await t.count('.mx-item') === 8, 'the remove button deletes a formula')

  // reset
  await t.click(zh ? '重置' : 'Reset')
  t.check(await verdict(0) === F && await pressed('button[aria-label="R b c"]') === 'false', 'Reset restores the starting structure')
  await t.shot()

  // a phone-sized screen: nothing sticks out sideways
  await t.page.setViewport({ width: 360, height: 800, deviceScaleFactor: 1 })
  await t.wait(200)
  const overflow = await t.page.evaluate(root => {
    const el = document.querySelector(root)
    return { widget: el.scrollWidth - el.clientWidth, page: document.documentElement.scrollWidth - document.documentElement.clientWidth }
  }, t.root)
  t.check(overflow.widget <= 1 && overflow.page <= 1, `fits 360 px without sideways scrolling (${JSON.stringify(overflow)})`)
  await t.shot('360')
}
