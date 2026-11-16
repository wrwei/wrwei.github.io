// Test of the eval-stepper widget (Module 5): step, run, back, the equation used, repeated work in fib,
// lists and trees, bad input and the size cap, and the layout at 360 px.
export const page = 'module_05'

export async function run(t) {
  const L = (en, zh) => (t.lang === 'zh' ? zh : en)
  const now = () => t.text('.evs-line.now')
  const choose = async (f, args) => {
    await t.page.select(`${t.root} select`, f)
    await t.wait(80)
    if (args) {
      const inputs = await t.page.$$(`${t.root} input`)
      for (let i = 0; i < args.length; i++) {
        await inputs[i].evaluate(el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })) })
        await inputs[i].type(args[i])
      }
      await t.wait(80)
    }
  }

  // sum_upto 3, one step at a time
  t.check((await now()) === 'sum_upto 3', 'starts with sum_upto 3')
  await t.click(L('Next', '下一步'))
  t.check((await now()) === '= sum_upto 2 + 3', 'Next rewrites sum_upto 3 to sum_upto 2 + 3')
  t.check((await t.text('.evs-eq.used')) === '| "sum_upto (Suc n) = sum_upto n + Suc n"', 'the equation used is highlighted')
  t.check((await t.text('.evs-why')).includes('n = 2') && (await t.text('.evs-why')).includes('3 = Suc 2'), 'the match n = 2 is explained')
  await t.click(L('Run to end', '运行到底'))
  t.check((await now()) === '= 6' && (await t.text('.evs-count')).includes('7'), 'Run to end: value 6 after 7 steps')
  t.check((await t.texts('.evs-line')).length === 8, 'the whole calculation is shown, one line per step')
  await t.click(L('Back', '上一步'))
  t.check((await now()) === '= 3 + 3' && (await t.text('.evs-why')).includes('1 + 2 = 3'), 'Back shows the previous step, an arithmetic step')
  await t.click(L('Reset', '重置'))
  t.check((await now()) === 'sum_upto 3', 'Reset returns to the start')

  // fib 5: repeated work
  await choose('fib', ['5'])
  await t.click(L('Run to end', '运行到底'))
  const res = await t.text('.evs-result')
  t.check((await now()) === '= 5' && (await t.text('.evs-count')).includes('22'), 'fib 5 = 5 after 22 steps')
  t.check(res.includes('fib 2 ×3') && res.includes('fib 3 ×2'), 'the tally shows fib 3 twice and fib 2 three times')

  // lists and trees
  await choose('reverse', ['[1, 2, 3]'])
  await t.click(L('Next', '下一步'))
  const first = await now()
  await t.click(L('Run to end', '运行到底'))
  t.check(first === '= app (reverse [2, 3]) [1]' && (await now()) === '= [3, 2, 1]', 'reverse [1, 2, 3]: reverse.2 first, value [3, 2, 1]')
  await choose('mirror')
  await t.click(L('Run to end', '运行到底'))
  t.check((await now()) === '= Node (Node Tip 4 (Node Tip 3 Tip)) 2 (Node Tip 1 Tip)', 'mirror of the tree of Figure 5.1')

  // bad input and the cap: a message, no exception, buttons disabled
  await choose('app', ['[1, 2', '[3]'])
  t.check((await t.text('.evs-msg')).length > 0 && (await t.count('button:disabled')) === 4, 'a malformed list gives a message')
  await choose('fib', ['40'])
  t.check((await t.text('.evs-msg')).includes('15'), 'fib 40 is refused with the cap')

  // 360 px: no horizontal overflow of the widget
  await choose('reverse', ['[1, 2, 3, 4, 5]'])
  await t.click(L('Run to end', '运行到底'))
  await t.page.setViewport({ width: 360, height: 900, deviceScaleFactor: 1 })
  await t.wait(200)
  const fits = await t.page.evaluate(root => { const r = document.querySelector(root); return r.scrollWidth <= r.clientWidth + 1 }, t.root)
  t.check(fits, 'fits in 360 px without horizontal scrolling')
  await t.shot('360')
  await t.page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 })
  await choose('fib', ['5'])
  await t.click(L('Next', '下一步'))
  await t.click(L('Next', '下一步'))
  await t.shot()
}
