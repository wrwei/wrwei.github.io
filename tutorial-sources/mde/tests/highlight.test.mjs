import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {highlight, highlightBlocks} from '../tools/highlight.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGUAGE = {eol: 'eol', evl: 'evl', egl: 'egl', egx: 'egx', etl: 'etl', emf: 'emfatic', flexmi: 'flexmi'};
const plain = html => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const has = (html, cls, text) => html.includes(`<span class="hljs-${cls}">${text}</span>`);

function files(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

test('highlighting keeps every example file\'s text exactly', () => {
  const sources = [...files(path.join(ROOT, 'examples')), ...files(path.join(ROOT, 'tests', 'fixtures'))]
    .filter(file => LANGUAGE[file.split('.').pop()]);
  assert(sources.length > 30, 'example and fixture files were found');
  for (const file of sources) {
    const source = fs.readFileSync(file, 'utf8');
    assert.equal(plain(highlight(source, LANGUAGE[file.split('.').pop()])), source, file);
  }
});

test('EOL: keywords, types, strings, numbers, literals and comments', () => {
  const html = highlight('var n = 42; // count\nfor (c in Component.all) { c.name.println(); }\nif (true) { "a"; }', 'eol');
  for (const [cls, text] of [['keyword', 'var'], ['number', '42'], ['comment', '// count'], ['keyword', 'for'], ['keyword', 'in'],
    ['type', 'Component'], ['keyword', 'if'], ['literal', 'true'], ['string', '&quot;a&quot;']]) assert(has(html, cls, text), `${cls} ${text}`);
  assert(!html.includes('>all<') && !html.includes('>name<'), 'features after a dot stay plain');
});

test('EVL, ETL and EGX keywords, but never a feature after a dot', () => {
  const evl = highlight('context Connector {\n  constraint NoSelfLoop {\n    check: self.target <> self.source\n    message: "x"\n  }\n}', 'evl');
  for (const text of ['context', 'constraint', 'check', 'message', 'self']) assert(has(evl, 'keyword', text), text);
  assert(has(evl, 'type', 'NoSelfLoop'));
  assert(!has(evl, 'keyword', 'target'), 'self.target is a feature');
  const etl = highlight('rule A2B\n  transform a : Source!Component\n  to b : Target!Node {\n  b.nodes ::= a.components;\n}', 'etl');
  for (const text of ['rule', 'transform', 'to']) assert(has(etl, 'keyword', text), text);
  assert(has(etl, 'type', 'Source') && has(etl, 'operator', '!') && has(etl, 'operator', '::='));
  const egx = highlight('rule R transform c : Component {\n  template: "template.egl"\n  target: c.name + ".txt"\n}', 'egx');
  for (const text of ['rule', 'transform', 'template', 'target']) assert(has(egx, 'keyword', text), text);
  assert(!has(highlight('var target = 1;', 'eol'), 'keyword', 'target'), 'EGX keywords are not EOL keywords');
});

test('EGL: template markers stand out, code is EOL, static text stays plain', () => {
  const html = highlight('<h2>[%=Architecture.all.first().name%]</h2>\n[* note *]\n[% for (c in Component.all) { %]x[% } %]', 'egl');
  assert(html.startsWith('&lt;h2&gt;'), 'static text is escaped and plain');
  assert(has(html, 'template-tag', '[%=') && has(html, 'template-tag', '%]') && has(html, 'template-tag', '[%'));
  assert(has(html, 'type', 'Architecture') && has(html, 'keyword', 'for') && has(html, 'comment', '[* note *]'));
});

test('Emfatic: keywords, types, annotations, multiplicities and opposites', () => {
  const html = highlight('@namespace(uri="components", prefix="components")\npackage components;\n// parts\nabstract class Port {\n  attr String name;\n  attr boolean on;\n  val Component[*] parts;\n  ref Component#ports owner;\n}', 'emfatic');
  for (const [cls, text] of [['meta', '@namespace'], ['string', '&quot;components&quot;'], ['keyword', 'package'], ['comment', '// parts'],
    ['keyword', 'abstract'], ['keyword', 'class'], ['type', 'Port'], ['keyword', 'attr'], ['type', 'String'], ['type', 'boolean'],
    ['keyword', 'val'], ['number', '[*]'], ['keyword', 'ref'], ['operator', '#']]) assert(has(html, cls, text), `${cls} ${text}`);
});

test('Flexmi: XML tags, attributes, values, comments and the nsuri line', () => {
  const html = highlight('<?nsuri components?>\n<architecture name="Alarm">\n  <!-- wiring -->\n  <inPort name="door"/>\n</architecture>', 'flexmi');
  for (const [cls, text] of [['meta', '&lt;?nsuri components?&gt;'], ['name', 'architecture'], ['attr', 'name'], ['string', '&quot;Alarm&quot;'],
    ['comment', '&lt;!-- wiring --&gt;'], ['name', 'inPort'], ['string', '&quot;door&quot;']]) assert(has(html, cls, text), `${cls} ${text}`);
});

test('Flexmi: the YAML flavour highlights keys, quoted values and comments', () => {
  const html = highlight('$nsuri: psl\nproject:\n  name: "ACME"\n  person:\n    - name: Alice # lead\n', 'flexmi');
  for (const [cls, text] of [['attr', '$nsuri'], ['attr', 'project'], ['attr', 'person'], ['string', '&quot;ACME&quot;'], ['comment', '# lead']]) assert(has(html, cls, text), `${cls} ${text}`);
  assert(html.includes('<span class="hljs-attr">name</span>: Alice'), 'unquoted values stay plain');
});

test('unknown languages are only escaped', () => {
  assert.equal(highlight('a < b && "c"', 'python'), 'a &lt; b &amp;&amp; &quot;c&quot;');
});

test('highlightBlocks rewrites only the Epsilon, Emfatic and Flexmi code blocks of a page', () => {
  const page = '<pre><code class="language-eol">var x = &quot;&lt;&quot;;\n</code></pre>\n<pre data-norun><code class="language-python">if x: pass</code></pre>\n<div class="output"><pre><code>var</code></pre></div>';
  const html = highlightBlocks(page);
  assert(html.startsWith('<pre><code class="language-eol"><span class="hljs-keyword">var</span> x = <span class="hljs-string">&quot;&lt;&quot;</span>;\n</code></pre>'));
  assert(html.includes('<pre data-norun><code class="language-python">if x: pass</code></pre>'), 'other languages untouched');
  assert(html.endsWith('<div class="output"><pre><code>var</code></pre></div>'), 'captured output untouched');
});
