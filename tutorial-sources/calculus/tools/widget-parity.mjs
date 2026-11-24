// Compare the controls and plot geometry of the English and Chinese Calculus widgets.
//   CHROME_PATH=/path/to/chromium node tools/widget-parity.mjs [path/to/site]
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const site = path.resolve(process.argv[2] || path.join(root, 'out/site'))
const modules = fs.readdirSync(site).filter(file => /^module_\d+_EN\.html$/.test(file)).sort()
assert.ok(modules.length, 'Build the bilingual site before checking widgets')
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--disable-background-networking'],
})

function installFrameClock() {
  // Advance both pages by the same amount before comparing an animated plot.
  let time = 0
  let nextId = 0
  const pending = new Map()
  window.requestAnimationFrame = callback => {
    const id = ++nextId
    pending.set(id, callback)
    return id
  }
  window.cancelAnimationFrame = id => pending.delete(id)
  window.advanceWidgetFrame = () => {
    time += 100
    const callbacks = [...pending.values()]
    pending.clear()
    for (const callback of callbacks) callback(time)
  }
}

function snapshot(widget) {
  const geometry = ['d', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points']
  return {
    mounted: widget.hasAttribute('data-mounted'),
    failed: widget.hasAttribute('data-failed'),
    controls: [...widget.querySelectorAll('input, select, button')].map(control => ({
      kind: control.matches('input') ? control.type : control.localName,
      value: control.value,
      checked: control.checked,
      disabled: control.disabled,
      min: control.min,
      max: control.max,
      options: control.options
        ? [...control.options].filter(option => !option.disabled).map(option => option.value)
        : [],
    })),
    plot: [...widget.querySelectorAll('svg path, svg circle, svg rect, svg line, svg polygon')]
      .map(shape => [shape.localName, ...geometry.map(name => shape.getAttribute(name))]),
  }
}

let widgetCount = 0
let actionCount = 0
const errors = []
try {
  const pages = await Promise.all([browser.newPage(), browser.newPage()])
  for (const page of pages) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.evaluateOnNewDocument(installFrameClock)
    await page.setRequestInterception(true)
    page.on('request', request => request.url().startsWith('file:') ? request.continue() : request.abort())
    page.on('pageerror', error => errors.push(page.url() + ' ' + error.message))
  }
  for (const module of modules) {
    const chinese = module.replace('_EN.html', '_ZH.html')
    assert.ok(fs.existsSync(path.join(site, chinese)), 'Missing translation ' + chinese)
    await Promise.all(pages.map((page, i) => page.goto(pathToFileURL(path.join(site, i ? chinese : module)).href)))
    assert.equal(await pages[1].evaluate(() => document.documentElement.lang), 'zh-CN')
    const names = await Promise.all(pages.map(page => page.$$eval('.widget', widgets => widgets.map(widget => widget.dataset.widget))))
    assert.deepEqual(names[0], names[1], module)

    for (const name of names[0]) {
      const selector = '.widget[data-widget="' + name + '"]'
      async function compare(action) {
        await Promise.all(pages.map(page => page.evaluate(() => {
          window.advanceWidgetFrame()
          window.advanceWidgetFrame()
        })))
        const [english, chinese] = await Promise.all(pages.map(page => page.$eval(selector, snapshot)))
        const context = module + ' ' + name + ' ' + action
        assert.ok(english.mounted && chinese.mounted && !english.failed && !chinese.failed, context)
        assert.deepEqual(chinese.controls, english.controls, context + ' controls differ')
        assert.deepEqual(chinese.plot, english.plot, context + ' plot differs')
        return english.controls
      }
      async function change(index, value) {
        await Promise.all(pages.map(page => page.$eval(selector, (widget, i, next) => {
          const control = widget.querySelectorAll('input, select, button')[i]
          if (!control || control.disabled) return
          if (control.matches('button')) {
            control.click()
            return
          }
          if (control.type === 'checkbox') control.checked = next
          else control.value = next
          control.dispatchEvent(new Event('input', { bubbles: true }))
          control.dispatchEvent(new Event('change', { bubbles: true }))
        }, index, value)))
      }
      const controls = await compare('initial')
      for (const [index, control] of controls.entries()) {
        if (control.disabled || control.kind === 'button') continue
        const { kind, value, min, max, options, checked } = control
        let next
        if (kind === 'range' && Number(max) > Number(min)) next = String(Number(min) + 0.68 * (Number(max) - Number(min)))
        if (kind === 'select') next = options.find(option => option !== value)
        if (kind === 'checkbox') next = !checked
        if (next === undefined) continue
        await change(index, next)
        await compare(kind + ' ' + index)
        await change(index, kind === 'checkbox' ? checked : value)
        actionCount++
      }
      for (const [index, control] of controls.entries()) {
        if (control.kind !== 'button') continue
        await change(index, '')
        await compare('button ' + index)
        actionCount++
      }
      widgetCount++
    }
  }
} finally {
  await browser.close()
}
assert.deepEqual(errors, [], 'JavaScript errors')
console.log(widgetCount + ' widgets and ' + actionCount + ' control changes match between English and Chinese')
