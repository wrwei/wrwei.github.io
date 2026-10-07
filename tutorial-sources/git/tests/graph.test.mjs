import test from 'node:test';
import assert from 'node:assert/strict';
import {layout, parseRefs, graphSvg} from '../tools/graph.mjs';

const commit = (hash, parents, refs = '', subject = hash) => ({short: hash, hash, parents, refs, subject});

test('a straight history stays in one lane', () => {
  assert.deepEqual(layout([commit('c', ['b']), commit('b', ['a']), commit('a', [])]).map(c => [c.hash, c.row, c.lane]), [['c', 0, 0], ['b', 1, 0], ['a', 2, 0]]);
});

test('a branch takes a second lane and a merge brings it back', () => {
  // m merges f into main; f and d both grew from a; t is an unmerged branch tip from m
  const rows = layout([commit('t', ['m']), commit('m', ['d', 'f']), commit('f', ['a']), commit('d', ['a']), commit('a', [])]);
  assert.deepEqual(rows.map(c => [c.hash, c.lane]), [['t', 0], ['m', 0], ['f', 1], ['d', 0], ['a', 0]]);
  const fork = layout([commit('x', ['a']), commit('y', ['a']), commit('a', [])]);
  assert.deepEqual(fork.map(c => [c.hash, c.lane]), [['x', 0], ['y', 1], ['a', 0]]);
});

test('refs become labels, with HEAD made visible', () => {
  assert.deepEqual(parseRefs('HEAD -> main, origin/main, origin/HEAD, tag: v1.0, feature'), [
    {text: 'HEAD → main', kind: 'head'}, {text: 'origin/main', kind: 'remote'}, {text: 'v1.0', kind: 'tag'}, {text: 'feature', kind: 'branch'}]);
  assert.deepEqual(parseRefs('HEAD'), [{text: 'HEAD', kind: 'head'}]);
  assert.deepEqual(parseRefs(''), []);
});

test('the SVG is decorative and the git log text is there for screen readers', () => {
  const html = graphSvg({commits: [commit('b2', ['a1'], 'HEAD -> main', 'Add <pancakes> & syrup'), commit('a1', [])], text: '* b2 (HEAD -> main) Add <pancakes> & syrup  \n* a1 a1\n'});
  assert.match(html, /^<figure class="graph"><svg class="git-graph" [^>]*aria-hidden="true"/);
  assert.match(html, />HEAD → main<\/text>/);
  assert.match(html, />Add &lt;pancakes&gt; &amp; syrup<\/text>/);
  assert.match(html, /<pre class="visually-hidden">\* b2 \(HEAD -&gt; main\) Add &lt;pancakes&gt; &amp; syrup\n\* a1 a1<\/pre><\/figure>$/);
  assert(!html.includes('\n\n'), 'no blank line, which would end the HTML block in Markdown');
});
