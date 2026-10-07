import test from 'node:test';
import assert from 'node:assert/strict';
import {highlightCommand, highlightBlocks} from '../tools/highlight.mjs';

const plain = html => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('commands are highlighted without changing their text', () => {
  const html = highlightCommand('git commit -m "Add <b> & c"');
  assert.equal(html, '<span class="hljs-keyword">git</span> <span class="hljs-title">commit</span> <span class="hljs-attr">-m</span> <span class="hljs-string">&quot;Add &lt;b&gt; &amp; c&quot;</span>');
  for (const line of ['git log --oneline --all', "git config --global user.name 'Alex Smith'", 'cd recipes', 'ls -a', 'git remote add origin /srv/git/shop.git']) {
    assert.equal(plain(highlightCommand(line)), line);
  }
  assert.equal(highlightCommand('cd recipes'), '<span class="hljs-built_in">cd</span> recipes');
});

test('only command blocks are highlighted, and they get the command class', () => {
  const html = highlightBlocks('<pre><code class="language-gitcmd">git status</code></pre>\n<pre><code class="language-text">git status</code></pre>');
  assert.equal(html, '<pre class="command"><code class="language-gitcmd"><span class="hljs-keyword">git</span> <span class="hljs-title">status</span></code></pre>\n<pre><code class="language-text">git status</code></pre>');
});

test('a copied command has no trailing newline, so pasting does not run it at once', () => {
  const html = highlightBlocks('<pre><code class="language-gitcmd">git config --global user.name &quot;Alex Smith&quot;\n</code></pre>');
  assert.match(html, /&quot;Alex Smith&quot;<\/span><\/code><\/pre>$/);
});
