// Build-time syntax highlighting for the Epsilon languages, Emfatic and Flexmi. Tokens get the
// highlight.js class names that the AI series' stylesheet already colours, plus hljs-name,
// hljs-operator and hljs-template-tag, which assets/style.css adds. The text is never changed:
// removing the spans gives back the source exactly.
import {escapeHtml as esc} from '../../ai/tools/md.mjs';

const EOL_KEYWORDS = ['var', 'for', 'in', 'while', 'if', 'else', 'return', 'operation', 'import', 'new', 'delete',
  'transaction', 'abort', 'break', 'breakAll', 'continue', 'throw', 'switch', 'case', 'default', 'and', 'or', 'not',
  'xor', 'implies', 'self'];
const KEYWORDS = {
  eol: EOL_KEYWORDS,
  evl: [...EOL_KEYWORDS, 'context', 'constraint', 'critique', 'guard', 'check', 'message', 'fix', 'title', 'do', 'pre', 'post'],
  etl: [...EOL_KEYWORDS, 'rule', 'transform', 'to', 'extends', 'guard', 'pre', 'post', 'abstract', 'lazy', 'primary', 'greedy'],
  egx: [...EOL_KEYWORDS, 'rule', 'transform', 'template', 'target', 'parameters', 'guard', 'pre', 'post', 'overwrite',
    'protectRegions', 'merge', 'append', 'formatter', 'patch'],
};
const EMFATIC_KEYWORDS = new Set(['package', 'class', 'abstract', 'interface', 'extends', 'attr', 'ref', 'val', 'op', 'enum',
  'datatype', 'import', 'readonly', 'volatile', 'transient', 'unsettable', 'derived', 'unique', 'ordered', 'resolve', 'id',
  'super', 'void', 'mapentry', 'throws']);
const EMFATIC_PRIMITIVES = new Set(['boolean', 'byte', 'char', 'double', 'float', 'int', 'long', 'short']);
const LITERALS = new Set(['true', 'false', 'null']);
export const HIGHLIGHTED = new Set(['eol', 'evl', 'egl', 'egx', 'etl', 'emfatic', 'flexmi']);

const span = (cls, text) => `<span class="hljs-${cls}">${esc(text)}</span>`;

/**
 * Scans source with sticky-regex rules tried in order at each position. A rule's token function returns
 * the HTML for its match, or null to let the next rule try. Text no rule matches is escaped as is.
 */
function scan(source, rules) {
  let out = '';
  let plainFrom = 0;
  let i = 0;
  while (i < source.length) {
    let html = null;
    let length = 0;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const match = rule.re.exec(source);
      if (!match || !match[0].length) continue;
      html = rule.token(match, source, i);
      if (html !== null) { length = match[0].length; break; }
    }
    if (html === null) { i++; continue; }
    out += esc(source.slice(plainFrom, i)) + html;
    i += length;
    plainFrom = i;
  }
  return out + esc(source.slice(plainFrom));
}

const COMMENTS = [
  {re: /\/\*[\s\S]*?(?:\*\/|$)/y, token: m => span('comment', m[0])},
  {re: /\/\/[^\n]*/y, token: m => span('comment', m[0])},
];
const STRINGS = {re: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y, token: m => span('string', m[0])};
const NUMBERS = {re: /\d+(?:\.\d+)?/y, token: m => span('number', m[0])};

function epsilon(source, keywords) {
  const words = new Set(keywords);
  return scan(source, [
    ...COMMENTS,
    STRINGS,
    {re: /@[A-Za-z_]\w*/y, token: m => span('meta', m[0])},
    {re: /::=|!/y, token: m => span('operator', m[0])},
    NUMBERS,
    {re: /[A-Za-z_]\w*/y, token: (m, source, at) => {
      const word = m[0];
      if (source[at - 1] === '.') return esc(word); // a feature or operation, such as c.target
      if (LITERALS.has(word)) return span('literal', word);
      if (words.has(word)) return span('keyword', word);
      return /^[A-Z]/.test(word) ? span('type', word) : esc(word);
    }},
  ]);
}

/** EGL: static text stays plain, [* *] is a comment, and code between [% or [%= and %] is EOL. */
function egl(source) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const starts = [source.indexOf('[%', i), source.indexOf('[*', i)].filter(n => n >= 0);
    if (!starts.length) { out += esc(source.slice(i)); break; }
    const next = Math.min(...starts);
    out += esc(source.slice(i, next));
    if (source.startsWith('[*', next)) {
      const end = source.indexOf('*]', next + 2);
      const stop = end < 0 ? source.length : end + 2;
      out += span('comment', source.slice(next, stop));
      i = stop;
      continue;
    }
    const marker = source.startsWith('[%=', next) ? '[%=' : '[%';
    const end = source.indexOf('%]', next + marker.length);
    out += span('template-tag', marker) + epsilon(source.slice(next + marker.length, end < 0 ? source.length : end), KEYWORDS.eol);
    if (end < 0) break;
    out += span('template-tag', '%]');
    i = end + 2;
  }
  return out;
}

function emfatic(source) {
  return scan(source, [
    ...COMMENTS,
    STRINGS,
    {re: /@[A-Za-z_][\w.]*/y, token: m => span('meta', m[0])},
    {re: /\[(?:\*|\+|\?|\d+(?:\s*\.\.\s*(?:\d+|\*))?)\]/y, token: m => span('number', m[0])},
    {re: /#/y, token: m => span('operator', m[0])},
    NUMBERS,
    {re: /[A-Za-z_]\w*/y, token: m => {
      const word = m[0];
      if (EMFATIC_KEYWORDS.has(word)) return span('keyword', word);
      if (LITERALS.has(word)) return span('literal', word);
      return EMFATIC_PRIMITIVES.has(word) || /^[A-Z]/.test(word) ? span('type', word) : esc(word);
    }},
  ]);
}

function xmlTag(match) {
  const [text, name, attributes] = match;
  const open = text.startsWith('</') ? '</' : '<';
  const close = text.slice(open.length + name.length + attributes.length);
  const attrs = attributes.replace(/(\s+)([\w:.$-]+)(\s*=\s*)("[^"]*"|'[^']*')/g,
    (_, space, key, equals, value) => esc(space) + span('attr', key) + esc(equals) + span('string', value));
  return esc(open) + span('name', name) + attrs + esc(close);
}

function flexmiXml(source) {
  return scan(source, [
    {re: /<!--[\s\S]*?(?:-->|$)/y, token: m => span('comment', m[0])},
    {re: /<\?[\s\S]*?(?:\?>|$)/y, token: m => span('meta', m[0])},
    {re: /<\/?([\w:.-]+)((?:\s+[\w:.$-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*\/?>/y, token: xmlTag},
  ]);
}

function yamlValue(text) {
  return scan(text, [
    {re: /"(?:[^"\\]|\\.)*"?|'[^']*'?/y, token: m => span('string', m[0])},
    {re: /#.*/y, token: (m, source, at) => (at === 0 || /\s/.test(source[at - 1]) ? span('comment', m[0]) : null)},
  ]);
}

function flexmiYaml(source) {
  return source.split('\n').map(line => {
    const m = /^(\s*(?:-\s+)?)([$\w.-]+)(\s*:)(.*)$/.exec(line);
    return m ? esc(m[1]) + span('attr', m[2]) + esc(m[3]) + yamlValue(m[4]) : yamlValue(line);
  }).join('\n');
}

/** Returns source as HTML with highlighting spans; unknown languages are only escaped. */
export function highlight(source, language) {
  if (language === 'egl') return egl(source);
  if (KEYWORDS[language]) return epsilon(source, KEYWORDS[language]);
  if (language === 'emfatic') return emfatic(source);
  if (language === 'flexmi') return source.trimStart().startsWith('<') ? flexmiXml(source) : flexmiYaml(source);
  return esc(source);
}

const unescapeHtml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Highlights the Epsilon, Emfatic and Flexmi code blocks of rendered HTML; other blocks are left alone. */
export function highlightBlocks(html) {
  return html.replace(/<pre([^>]*)><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g, (block, attributes, language, code) =>
    HIGHLIGHTED.has(language) ? `<pre${attributes}><code class="language-${language}">${highlight(unescapeHtml(code), language)}</code></pre>` : block);
}
