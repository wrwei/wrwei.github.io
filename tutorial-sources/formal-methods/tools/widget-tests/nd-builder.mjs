// Test of the natural-deduction proof builder (Module 6, Section 6.7).
export const page = 'module_06'

export async function run(t) {
  const zh = t.lang === 'zh'
  const assumption = zh ? '用假设' : 'assumption'
  const status = () => t.text('.nd-status')
  const msg = () => t.text('.nd-msg')

  // the first preset is loaded with one open goal
  t.check((await status()).includes('A ∧ B ⟶ B ∧ A') && await t.count('.nd-goal') === 1, 'starts with A ∧ B ⟶ B ∧ A and one open goal')

  // a rule that does not fit the goal is refused, with a reason and a suggestion
  await t.click('∧I')
  t.check((await msg()).includes('⟶I') && await t.count('.nd-goal') === 1, 'refuses (∧I) on an implication and suggests (⟶I)')

  // (⟶I) then (∧I): two goals, each with the discharged assumption A ∧ B
  await t.click('⟶I')
  await t.click('∧I')
  t.check(await t.count('.nd-goal') === 2 && (await t.texts('.nd-goal .nd-hyp')).every(x => x === 'A ∧ B'), '(⟶I) and (∧I) leave two goals with the assumption A ∧ B')

  // an elimination rule needs a selected assumption
  await t.click('∧E₂')
  t.check((await msg()).includes(zh ? '选中' : 'select'), 'asks for an assumption before (∧E₂)')

  // finish the proof and compare it with the tree of Section 6.4
  await t.click('.nd-goal.sel .nd-hyp')
  await t.click('∧E₂')
  await t.click(assumption)
  await t.click('.nd-goal.sel .nd-hyp')
  await t.click('∧E₁')
  await t.click(assumption)
  t.check((await status()).includes(zh ? '证明完成' : 'Proof complete'), 'reports Proof complete when no goals are left')
  t.check(await t.text('.nd-proof .nd-text') === 'A ∧ B ⟶ B ∧ A   (⟶I¹)\n  B ∧ A   (∧I)\n    B   (∧E₂)\n      [A ∧ B]¹\n    A   (∧E₁)\n      [A ∧ B]¹',
    'the finished derivation is the tree of Section 6.4')
  t.check(await t.count('.nd-proof .pt-rule') === 4, 'draws the derivation as a tree with four rule labels')
  await t.shot('done')

  // Undo reopens the last goal
  await t.click('.nd-undo')
  t.check(await t.count('.nd-goal') === 1 && !(await status()).includes(zh ? '证明完成' : 'complete'), 'Undo reopens the last goal')

  // a premature (∨I₁) is marked as a dead end, with a valuation
  await t.type('.nd-input', 'A ∨ B ⟶ B ∨ A')
  await t.click('.nd-start')
  await t.click('⟶I')
  await t.click('∨I₁')
  const dead = await t.text('.nd-dead')
  t.check(dead.includes('A = T') && dead.includes('B = F'), 'marks A ∨ B ⊢ B as a dead end, with A = T and B = F')
  await t.click('.nd-undo')
  t.check(await t.count('.nd-dead') === 0, 'Undo removes the dead end')

  // the eigenvariable condition: (∀I) refuses a name that occurs in an assumption
  await t.type('.nd-input', '(∀y. ∃x. R x y) ⟶ (∃x. ∀y. R x y)')
  await t.click('.nd-start')
  await t.click('⟶I')
  await t.click('.nd-goal.sel .nd-hyp')
  await t.type('.nd-term', 'c')
  await t.click('∀E')
  await t.click('.nd-goal.sel .nd-hyp[data-f="∃x. R x c"]')
  await t.click('∃E')
  await t.type('.nd-term', 'a')
  await t.click('∃I')
  await t.type('.nd-term', 'c')
  await t.click('∀I')
  t.check((await msg()).includes(zh ? 'c 不是新名字' : 'c is not fresh'), 'refuses (∀I) with a name that occurs in an assumption')

  // the master-key derivation of Section 6.6
  await t.type('.nd-input', '(∃x. ∀y. R x y) ⟶ (∀y. ∃x. R x y)')
  await t.click('.nd-start')
  await t.click('⟶I')
  await t.type('.nd-term', 'b')
  await t.click('∀I')
  await t.click('.nd-goal.sel .nd-hyp')
  await t.type('.nd-term', 'a')
  await t.click('∃E')
  await t.click('.nd-goal.sel .nd-hyp[data-f="∀y. R a y"]')
  await t.type('.nd-term', 'b')
  await t.click('∀E')
  await t.type('.nd-term', 'a')
  await t.click('∃I')
  await t.click(assumption)
  const tree = await t.text('.nd-proof .nd-text')
  t.check(tree.includes('∀y. ∃x. R x y   (∀I)') && tree.includes('∃x. R x b   (∃E²)') && tree.includes('[∀y. R a y]²'), 'builds the master-key derivation of Section 6.6')

  // input it cannot read gives a message, not an error
  await t.type('.nd-input', 'A ∧ (B')
  await t.click('.nd-start')
  t.check((await msg()).includes(zh ? '无法读取' : 'Cannot read'), 'reports a formula it cannot read')

  // True has no rule in Module 6, so a goal with True is refused rather than left unprovable
  await t.type('.nd-input', 'A ⟶ True')
  await t.click('.nd-start')
  t.check((await msg()).includes('True') && (await msg()).includes('¬⊥'), 'refuses a goal with True and suggests ¬⊥')
  await t.shot()
}
