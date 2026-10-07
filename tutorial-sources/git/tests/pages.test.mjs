import test from 'node:test';
import assert from 'node:assert/strict';
import {expandSessions, renderLesson, checkParity, checkContract, UI} from '../tools/pages.mjs';

const VERSION = 'git version 2.50.1 (Apple Git-155)';
const graph = {commits: [{short: 'abc1234', hash: 'abc1234', parents: [], refs: 'HEAD -> main', subject: 'Start'}], text: '* abc1234 (HEAD -> main) Start\n'};
const sessions = new Map([['m01-first', {
  title: {en: 'First steps', zh: '第一步'}, role: 'example', graphs: {start: graph},
  record: [
    {kind: 'command', line: 'git init shop', output: 'Initialized empty Git repository in /home/alex/shop/.git/\n', ok: true},
    {kind: 'command', line: 'cd shop', output: '', ok: true},
    {kind: 'file', path: 'a.txt', content: 'one\n\nthree\n'},
    {kind: 'as', persona: 'sam'},
    {kind: 'graph', label: 'start'},
  ],
}]]);

test('a session marker becomes commands, outputs, edits, a person switch, a graph and a caption', () => {
  const {markdown, used, graphs} = expandSessions('Intro\n\n{{SESSION:m01-first}}\n\n{{GRAPH:m01-first@start}}\n', sessions, 'en', VERSION);
  assert.deepEqual(used, ['m01-first']);
  assert.deepEqual(graphs, ['m01-first@start']);
  assert.match(markdown, /<div class="term" id="term-m01-first">\n<div class="term-head"><span class="term-label">Try it<\/span><span class="term-title">First steps<\/span><\/div>/);
  assert.match(markdown, /````gitcmd\ngit init shop\n````\n\n````output\nInitialized empty Git repository in \/home\/alex\/shop\/\.git\/\n````/);
  assert.match(markdown, /````gitcmd\ncd shop\n````\n\n<div class="term-edit">/, 'no output block for a silent command');
  assert.match(markdown, /Create or edit <code>a\.txt<\/code> so that it contains:<\/div>\n\n````text\none\n\nthree\n````/);
  assert.match(markdown, /<div class="term-who">Now acting as Sam Lee, in Sam's own folder\.<\/div>/);
  assert.equal((markdown.match(/<figure class="graph">/g) || []).length, 2);
  assert.match(markdown, /Output from git version 2\.50\.1 \(Apple Git-155\), run while this page was built\./);
  assert.throws(() => expandSessions('{{SESSION:m01-none}}\n', sessions, 'en', VERSION), /Unknown session "m01-none"/);
  assert.throws(() => expandSessions('{{GRAPH:m01-first@nope}}\n', sessions, 'en', VERSION), /Unknown graph "m01-first@nope"/);
  assert.throws(() => expandSessions('See {{SESSION:m01-first}} here\n', sessions, 'en', VERSION), /line of its own/);
});

const meta = {number: 1, hours: 1, title: {en: 'T', zh: 'T'}, lead: {en: 'L', zh: 'L'}, prerequisites: {en: 'P', zh: 'P'}, outcomes: {en: ['O'], zh: ['O']},
  sessions: [{minutes: 60, title: {en: 'S', zh: 'S'}, activities: [{kind: 'practice', anchor: 's1', minutes: 60, text: {en: 'R', zh: 'R'}}]}]};
const series = {modules: [{number: 1, title: {en: 'T', zh: 'T'}}]};

test('a lesson page highlights commands, keeps outputs plain and reports its structure', () => {
  const source = '## One {#s1}\n\n{{SESSION:m01-first}}\n\n```quiz\n? Q\n- [x] A\n- [ ] B\n> E\n```\n';
  const {html, record} = renderLesson({meta, lang: 'en', source, sessions, version: VERSION, series, published: [1]});
  assert.match(html, /<pre class="command"><code class="language-gitcmd"><span class="hljs-keyword">git<\/span> <span class="hljs-title">init<\/span> shop<\/code><\/pre>/);
  assert.match(html, /<div class="output"><div class="output-label">Output<\/div><pre><code>Initialized empty Git repository/);
  assert.match(html, /data-key="git-series:m01:s1"/);
  assert.match(html, /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces[^"]*DM\+Mono[^"]*" rel="stylesheet">/, 'the page loads the fonts the stylesheet names');
  assert.match(html, /<span class="chip">Git 2\.50\.1 \(Apple Git-155\)<\/span>/);
  assert.deepEqual(record, {sections: ['s1'], sessions: ['m01-first'], graphs: [], figures: [], exercises: 0, solutions: 0, quizAnswers: [0]});
  assert.throws(() => renderLesson({meta, lang: 'en', source: '## One {#s1}\n\n<!-- BRIEF later -->\n', sessions, version: VERSION, series, published: [1]}), /BRIEF/);
});

test('parity and contract checks name what is wrong', () => {
  const en = {sections: ['s1', 'quiz'], sessions: ['m01-first'], graphs: [], figures: [], exercises: 1, solutions: 1, quizAnswers: [0, 2]};
  assert.doesNotThrow(() => checkParity(en, structuredClone(en), 1));
  assert.throws(() => checkParity(en, {...en, sessions: []}, 1), /sessions differ/);
  const contract = {sessions: [1, 2], exercises: 1, quiz: [2, 3], sections: ['s1', 'quiz']};
  assert.doesNotThrow(() => checkContract(en, contract, sessions, 1));
  assert.throws(() => checkContract(en, {...contract, sessions: [2, 3]}, sessions, 1), /1 teaching sessions; the contract allows 2–3/);
  assert.throws(() => checkContract({...en, sessions: []}, contract, sessions, 1), /exactly once/);
});

test('the Chinese edition calls command sessions 动手环节, keeping 练习 for exercises', () => {
  assert.equal(UI.zh.chipSessions(4), '4 个动手环节');
});

test('the Chinese caption refers to the output above it, where the transcript is', () => {
  const {markdown} = expandSessions('{{SESSION:m01-first}}\n', sessions, 'zh', VERSION);
  assert.match(markdown, /上面的输出来自 git version 2\.50\.1 \(Apple Git-155\)，在构建本页时实际运行得到。/);
  assert.doesNotMatch(markdown, /以下输出/);
});
