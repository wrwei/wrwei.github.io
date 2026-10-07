// Highlighting for the commands in session transcripts (code blocks of language "gitcmd"): the
// program, the Git subcommand, options and quoted text. Removing the spans gives back the command.
import {escapeHtml as esc} from '../../ai/tools/md.mjs';

const span = (cls, text) => `<span class="hljs-${cls}">${esc(text)}</span>`;

/** Highlights one command line, such as git commit -m "Add a README". */
export function highlightCommand(line) {
  let out = '';
  let index = 0;
  for (const match of line.matchAll(/\s+|"[^"]*"|'[^']*'|[^\s"']+/g)) {
    const token = match[0];
    if (/^\s+$/.test(token)) { out += esc(token); continue; }
    if (/^["']/.test(token)) out += span('string', token);
    else if (index === 0) out += span(token === 'git' ? 'keyword' : 'built_in', token);
    else if (index === 1 && line.startsWith('git') && !token.startsWith('-')) out += span('title', token);
    else if (token.startsWith('-')) out += span('attr', token);
    else out += esc(token);
    index++;
  }
  return out;
}

const unescapeHtml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/**
 * Highlights every command block of rendered HTML; other code blocks are left alone. The trailing
 * newline is dropped, so that a pasted command waits for Enter instead of running at once.
 */
export function highlightBlocks(html) {
  return html.replace(/<pre([^>]*)><code class="language-gitcmd">([\s\S]*?)<\/code><\/pre>/g, (block, attributes, code) =>
    `<pre${attributes} class="command"><code class="language-gitcmd">${unescapeHtml(code).replace(/\n+$/, '').split('\n').map(line => (line ? highlightCommand(line) : line)).join('\n')}</code></pre>`);
}
