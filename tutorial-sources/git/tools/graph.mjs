// Commit graphs as SVG, drawn from real repository data: one row per commit, newest first (as in
// `git log --graph`), one lane per line of development, with branch, tag and HEAD labels.
import {escapeHtml as esc} from '../../ai/tools/md.mjs';

const ROW = 34;
const LANE = 22;
const TOP = 22;
const LEFT = 18;
const RADIUS = 6;
const CHAR = 7.2; // approximate width of one character of the 12px label font
const COLOURS = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#DC2626', '#0891B2'];

/**
 * Assigns each commit a row and a lane. `commits` are newest first, in topological order, with full
 * parent hashes, as `git log --all --topo-order` lists them. Returns the commits with {row, lane} added.
 */
export function layout(commits) {
  const lanes = []; // the commit each lane is waiting for
  const placed = new Map();
  commits.forEach((commit, row) => {
    let lane = lanes.indexOf(commit.hash);
    if (lane < 0) {
      lane = lanes.indexOf(null);
      if (lane < 0) lane = lanes.length;
    }
    for (let k = 0; k < lanes.length; k++) if (lanes[k] === commit.hash) lanes[k] = null;
    placed.set(commit.hash, {row, lane});
    const [first, ...others] = commit.parents;
    lanes[lane] = first ?? null;
    for (const parent of others) {
      if (lanes.includes(parent)) continue;
      let free = lanes.indexOf(null);
      if (free < 0) free = lanes.length;
      lanes[free] = parent;
    }
  });
  return commits.map(commit => ({...commit, ...placed.get(commit.hash)}));
}

/**
 * Turns a %D decoration into labels. With full ref names (git log --decorate=full),
 * "HEAD -> refs/heads/main, refs/remotes/origin/main, tag: refs/tags/v1.0" becomes
 * [{text: 'HEAD → main', kind: 'head'}, {text: 'origin/main', kind: 'remote'}, {text: 'v1.0', kind: 'tag'}];
 * short names are still accepted, with names containing "/" taken as remote.
 */
export function parseRefs(refs) {
  const short = name => name.replace(/^refs\/(heads|remotes|tags)\//, '');
  return (refs ? refs.split(', ') : []).filter(ref => !ref.endsWith('/HEAD')).map(ref => {
    if (ref.startsWith('HEAD -> ')) return {text: `HEAD → ${short(ref.slice(8))}`, kind: 'head'};
    if (ref === 'HEAD') return {text: 'HEAD', kind: 'head'};
    if (ref.startsWith('tag: ')) return {text: short(ref.slice(5)), kind: 'tag'};
    if (ref.startsWith('refs/heads/')) return {text: short(ref), kind: 'branch'};
    if (ref.startsWith('refs/remotes/')) return {text: short(ref), kind: 'remote'};
    return {text: ref, kind: ref.includes('/') ? 'remote' : 'branch'};
  });
}

const x = lane => LEFT + lane * LANE;
const y = row => TOP + row * ROW;

/** Draws the graph. `text` is the `git log --graph --oneline` output, kept for screen readers. */
export function graphSvg({commits, text}, caption = '') {
  const rows = layout(commits);
  const where = new Map(rows.map(c => [c.hash, c]));
  const width = Math.max(...rows.map(c => c.lane)) + 1;
  const labelX = LEFT + width * LANE + 8;
  const paths = [];
  for (const c of rows) {
    for (const parentHash of c.parents) {
      const p = where.get(parentHash);
      if (!p) continue;
      const colour = COLOURS[Math.max(c.lane, p.lane) % COLOURS.length];
      let d;
      if (p.lane === c.lane) d = `M${x(c.lane)} ${y(c.row)}V${y(p.row)}`;
      else if (p.lane > c.lane) d = `M${x(c.lane)} ${y(c.row)}C${x(c.lane)} ${y(c.row) + ROW / 2} ${x(p.lane)} ${y(c.row) + ROW / 2} ${x(p.lane)} ${y(c.row + 1)}V${y(p.row)}`;
      else d = `M${x(c.lane)} ${y(c.row)}V${y(p.row - 1)}C${x(c.lane)} ${y(p.row) - ROW / 2} ${x(p.lane)} ${y(p.row) - ROW / 2} ${x(p.lane)} ${y(p.row)}`;
      paths.push(`<path d="${d}" stroke="${colour}" stroke-width="2.5" fill="none"/>`);
    }
  }
  let longest = 0;
  const nodes = rows.map(c => {
    const colour = COLOURS[c.lane % COLOURS.length];
    let cursor = labelX;
    let label = `<text x="${cursor}" y="${y(c.row) + 4}" class="g-hash">${esc(c.short)}</text>`;
    cursor += c.short.length * CHAR + 8;
    for (const ref of parseRefs(c.refs)) {
      const w = ref.text.length * CHAR + 12;
      label += `<rect x="${cursor}" y="${y(c.row) - 9}" width="${w.toFixed(1)}" height="18" rx="9" class="g-ref g-${ref.kind}"/><text x="${(cursor + 6).toFixed(1)}" y="${y(c.row) + 4}" class="g-ref-text">${esc(ref.text)}</text>`;
      cursor += w + 6;
    }
    label += `<text x="${cursor.toFixed(1)}" y="${y(c.row) + 4}" class="g-subject">${esc(c.subject)}</text>`;
    longest = Math.max(longest, cursor + c.subject.length * CHAR);
    return `<circle cx="${x(c.lane)}" cy="${y(c.row)}" r="${RADIUS}" fill="#fff" stroke="${colour}" stroke-width="2.5"/>${label}`;
  });
  const svgWidth = Math.ceil(longest + 12);
  const svgHeight = TOP * 2 + (rows.length - 1) * ROW;
  const svg = `<svg class="git-graph" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" aria-hidden="true" focusable="false">${paths.join('')}${nodes.join('')}</svg>`;
  const alternative = text.split('\n').map(line => line.trimEnd()).join('\n').trim();
  return `<figure class="graph">${svg}<pre class="visually-hidden">${esc(alternative)}</pre>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
}
