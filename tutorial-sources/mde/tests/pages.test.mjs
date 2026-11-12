import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {expandExamples, renderLesson, checkParity, checkContract} from '../tools/pages.mjs';

const BUNDLE = 'https://example.test/pg/examples.json';
function fakeExample(extra = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-pages-'));
  fs.writeFileSync(path.join(dir, 'q.eol'), 'for (c in Component.all) {\n\n  c.name.println();\n}\n');
  fs.writeFileSync(path.join(dir, 'a.flexmi'), '<?nsuri components?>\n<architecture name="A"/>\n');
  fs.writeFileSync(path.join(dir, 'c.emf'), 'package components;\n');
  return {id: 'm01-q', title: {en: 'Query', zh: '查询'}, language: 'eol', program: 'q.eol', flexmi: 'a.flexmi', emfatic: 'c.emf', dir,
    result: {status: 'ok', output: '<b>OrGate</b>\n\nSiren\n'}, ...extra};
}

test('an example marker becomes code, a Playground link and the captured output', () => {
  const byId = new Map([['m01-q', fakeExample()]]);
  const {markdown, used} = expandExamples('Intro\n\n{{EXAMPLE:m01-q}}\n', byId, 'en', BUNDLE);
  assert.deepEqual(used, ['m01-q']);
  assert.match(markdown, /href="https:\/\/eclipse\.dev\/epsilon\/playground\/\?examples=https%3A%2F%2Fexample\.test%2Fpg%2Fexamples\.json&amp;m01-q"/);
  assert.match(markdown, /````eol\nfor \(c in Component\.all\) \{\n\n  c\.name\.println\(\);\n\}\n````/);
  assert.match(markdown, /<summary>More files: a\.flexmi, c\.emf<\/summary>/);
  assert.match(markdown, /````output\n<b>OrGate<\/b>\n\nSiren\n````/);
  assert.throws(() => expandExamples('{{EXAMPLE:m01-nope}}\n', byId, 'en', BUNDLE), /Unknown example "m01-nope"/);
  assert.throws(() => expandExamples('See {{EXAMPLE:m01-q}} inline.\n', byId, 'en', BUNDLE), /line of its own/);
});

const meta = {number: 1, hours: 1, title: {en: 'T', zh: 'T'}, lead: {en: 'L', zh: 'L'}, prerequisites: {en: 'P', zh: 'P'}, outcomes: {en: ['O'], zh: ['O']},
  sessions: [{minutes: 60, title: {en: 'S', zh: 'S'}, activities: [{kind: 'read', anchor: 's1', minutes: 60, text: {en: 'R', zh: 'R'}}]}]};
const series = {modules: [{number: 1, title: {en: 'T', zh: 'T'}}]};

test('a lesson page escapes captured output and reports its structure', () => {
  const byId = new Map([['m01-q', fakeExample()]]);
  const source = '## One {#s1}\n\n{{EXAMPLE:m01-q}}\n\n```quiz\n? Q\n- [x] A\n- [ ] B\n> E\n```\n';
  const {html, record} = renderLesson({meta, lang: 'en', source, byId, bundleUrl: BUNDLE, series, published: [1]});
  assert.match(html, /&lt;b&gt;OrGate&lt;\/b&gt;/);
  assert.match(html, /<code class="language-eol"><span class="hljs-keyword">for<\/span> \(c <span class="hljs-keyword">in<\/span> <span class="hljs-type">Component<\/span>\.all\)/, 'example code is highlighted');
  assert.match(html, /data-key="mde-series:m01:s1"/);
  assert.match(html, /href="module_01_ZH\.html"/);
  assert.deepEqual(record, {sections: ['s1'], examples: ['m01-q'], exercises: 0, solutions: 0, quizAnswers: [0]});
  assert.throws(() => renderLesson({meta, lang: 'en', source: '## One {#s1}\n\nCosts $5 and $x$ here.\n', byId, bundleUrl: BUNDLE, series, published: [1]}), /read as maths/);
  assert.throws(() => renderLesson({meta, lang: 'en', source: '## One {#s1}\n\n<!-- BRIEF write this -->\n', byId, bundleUrl: BUNDLE, series, published: [1]}), /BRIEF/);
  assert.throws(() => renderLesson({meta: {...meta, hours: 2}, lang: 'en', source: '## One {#s1}\n', byId, bundleUrl: BUNDLE, series, published: [1]}), /add up to 2 hours/);
});

test('parity and contract checks name what is wrong', () => {
  const en = {sections: ['s1', 'quiz'], examples: ['m01-q'], exercises: 1, solutions: 1, quizAnswers: [0, 2]};
  assert.doesNotThrow(() => checkParity(en, structuredClone(en), 1));
  assert.throws(() => checkParity(en, {...en, quizAnswers: [0, 1]}, 1), /quizAnswers differ/);
  const contract = {examples: [1, 2], exercises: 1, quiz: [2, 3], sections: ['s1', 'quiz']};
  assert.doesNotThrow(() => checkContract(en, contract, [{id: 'm01-q'}], 1));
  assert.throws(() => checkContract(en, {...contract, exercises: 2}, [{id: 'm01-q'}], 1), /the contract needs 2/);
  assert.throws(() => checkContract(en, contract, [{id: 'm01-q'}, {id: 'm01-r', role: 'solution'}], 1), /exactly once/);
  assert.throws(() => checkContract(en, {...contract, sections: ['reading']}, [{id: 'm01-q'}], 1), /\{#reading\} is missing/);
});
