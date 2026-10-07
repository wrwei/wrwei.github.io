// Command sessions: a .session script is parsed into steps and run with real Git in a sandbox.
// Everything that could differ between machines or runs is fixed: identities, dates, configuration
// and paths, so the same script always produces the same output and commit hashes.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

export const PERSONAS = {
  alex: {name: 'Alex Smith', email: 'alex@example.com'},
  sam: {name: 'Sam Lee', email: 'sam@example.com'},
};
export const BUILTINS = ['pwd', 'ls', 'cd', 'mkdir', 'cat'];
const START = Date.UTC(2026, 0, 5, 9, 0, 0) / 1000; // Monday 5 January 2026, 09:00 UTC
const TICK = 60; // seconds between commands

/** Splits a command line like a shell, but rejects the shell features sessions do not support. */
export function splitCommand(line, where) {
  const words = [];
  let word = '';
  let started = false;
  let quote = null;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else if (quote === '"' && '$`\\'.includes(ch)) throw new Error(`${where}: "${ch}" inside double quotes would be expanded by a shell; use single quotes`);
      else word += ch;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; started = true; continue; }
    if (/\s/.test(ch)) {
      if (started) { words.push(word); word = ''; started = false; }
      continue;
    }
    if ('|&;<>$`\\*?(){}'.includes(ch)) throw new Error(`${where}: shell syntax "${ch}" is not supported; a session runs one plain command per line`);
    word += ch;
    started = true;
  }
  if (quote) throw new Error(`${where}: a quote is not closed`);
  if (started) words.push(word);
  return words;
}

/**
 * Parses a session script. The header holds "title:" and "title-zh:" (and optionally "role: solution")
 * and ends at "---". Then, one step per line:
 *   $ command      shown, must succeed          $! command   shown, must fail
 *   > command      hidden setup, must succeed   @as sam      act as another person
 *   @graph label   snapshot of the commit graph
 *   +file path     shown file edit, contents until "+end";  +hidden path  the same, not shown
 * Blank lines and lines starting with "#" are ignored.
 */
export function parseSession(text, name = 'session') {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const meta = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') { i++; break; }
    if (!line.trim()) continue;
    const m = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (!m) throw new Error(`${name}:${i + 1}: the header needs "key: value" lines ending with "---"`);
    meta[m[1]] = m[2].trim();
  }
  if (!meta.title || !meta['title-zh']) throw new Error(`${name}: the header needs "title:" and "title-zh:"`);
  if (meta.role && !['example', 'solution'].includes(meta.role)) throw new Error(`${name}: "role" must be "example" or "solution"`);
  const steps = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    const where = `${name}:${i + 1}`;
    if (!line.trim() || line.startsWith('#')) continue;
    let m;
    if ((m = /^(\$!|\$|>)\s+(.+)$/.exec(line))) {
      const words = splitCommand(m[2], where);
      if (words[0] !== 'git' && !BUILTINS.includes(words[0])) throw new Error(`${where}: "${words[0]}" is neither git nor a built-in (${BUILTINS.join(', ')})`);
      steps.push({kind: 'run', line: m[2].trim(), words, shown: m[1] !== '>', expectFail: m[1] === '$!', where});
    } else if ((m = /^\+(file|hidden)\s+(\S+)$/.exec(line))) {
      const content = [];
      for (i++; i < lines.length && lines[i] !== '+end'; i++) content.push(lines[i]);
      if (i >= lines.length) throw new Error(`${where}: "+${m[1]}" has no closing "+end"`);
      steps.push({kind: 'file', path: m[2], content: content.length ? content.join('\n') + '\n' : '', shown: m[1] === 'file', where});
    } else if ((m = /^@as\s+(\S+)$/.exec(line))) {
      if (!PERSONAS[m[1]]) throw new Error(`${where}: unknown person "${m[1]}" (${Object.keys(PERSONAS).join(', ')})`);
      steps.push({kind: 'as', persona: m[1], where});
    } else if ((m = /^@graph\s+([a-z0-9-]+)$/.exec(line))) {
      steps.push({kind: 'graph', label: m[1], where});
    } else {
      throw new Error(`${where}: cannot read "${line}"`);
    }
  }
  return {title: {en: meta.title, zh: meta['title-zh']}, role: meta.role ?? 'example', steps};
}

/** The first line of `git --version`, e.g. "git version 2.50.1 (Apple Git-155)". */
export function gitVersion(git = 'git') {
  const r = spawnSync(git, ['--version'], {encoding: 'utf8'});
  if (r.error || r.status !== 0) throw new Error(`Cannot run "${git} --version": ${r.error || r.stderr}`);
  return r.stdout.trim();
}

/**
 * Runs a parsed session in `sandbox`, an empty directory. Returns
 *   record:   what the lesson shows, in order: {kind:'command', line, output, ok} | {kind:'file', path, content}
 *             | {kind:'as', persona} | {kind:'graph', label}
 *   graphs:   label -> {commits, text} for each @graph step
 *   problems: messages for every step that did not behave as declared (empty when all is well)
 */
export function runSession(session, {sandbox, git = 'git'}) {
  const root = fs.realpathSync(sandbox);
  const places = {alex: path.join(root, 'alex'), sam: path.join(root, 'sam'), server: path.join(root, 'server')};
  const shown = [[places.alex, '/home/alex'], [places.sam, '/home/sam'], [places.server, '/srv/git']];
  for (const dir of [...Object.values(places), path.join(root, 'config-alex'), path.join(root, 'config-sam')]) fs.mkdirSync(dir, {recursive: true});
  const systemConfig = path.join(root, 'gitconfig-system');
  fs.writeFileSync(systemConfig, '[init]\n\tdefaultBranch = main\n');
  const outputFile = path.join(root, 'output.txt');
  const cwd = {alex: places.alex, sam: places.sam};
  let persona = 'alex';
  let clock = START;

  const forward = p => p.replace(/\\/g, '/');
  const toShown = text => shown.reduce((t, [real, nice]) => t.split(real).join(nice).split(forward(real)).join(nice), text);
  const toReal = p => {
    for (const [real, nice] of shown) if (p === nice || p.startsWith(nice + '/')) return path.join(real, p.slice(nice.length));
    return path.resolve(cwd[persona], p);
  };
  const env = () => {
    const who = PERSONAS[persona];
    const date = `@${clock} +0000`;
    const config = path.join(root, `config-${persona}`);
    return {
      PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT ?? '',
      HOME: config, USERPROFILE: config, XDG_CONFIG_HOME: path.join(config, '.config'), GIT_CONFIG_SYSTEM: systemConfig,
      LANG: 'C', LC_ALL: 'C', TZ: 'UTC', GIT_PAGER: 'cat', PAGER: 'cat', GIT_EDITOR: 'true', GIT_TERMINAL_PROMPT: '0',
      GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email, GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email, GIT_COMMITTER_DATE: date,
    };
  };
  const runGit = args => {
    // stdout and stderr share one file so that their lines stay in order
    const fd = fs.openSync(outputFile, 'w');
    try {
      const r = spawnSync(git, args, {cwd: cwd[persona], env: env(), stdio: ['ignore', fd, fd], timeout: 60000});
      if (r.error) throw r.error;
      return {status: r.status, output: fs.readFileSync(outputFile, 'utf8')};
    } finally {
      fs.closeSync(fd);
    }
  };
  const builtin = ([name, ...args]) => {
    const fail = message => ({status: 1, output: message + '\n'});
    switch (name) {
      case 'pwd': return {status: 0, output: toShown(cwd[persona]) + '\n'};
      case 'cd': {
        const target = !args[0] || args[0] === '~' ? places[persona] : toReal(args[0]);
        if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) return fail(`cd: no such directory: ${args[0]}`);
        cwd[persona] = target;
        return {status: 0, output: ''};
      }
      case 'mkdir': {
        for (const arg of args) {
          const target = toReal(arg);
          if (fs.existsSync(target)) return fail(`mkdir: ${arg}: File exists`);
          fs.mkdirSync(target);
        }
        return {status: 0, output: ''};
      }
      case 'ls': {
        const all = args.includes('-a');
        const dir = toReal(args.find(a => !a.startsWith('-')) ?? '.');
        if (!fs.existsSync(dir)) return fail(`ls: ${args.find(a => !a.startsWith('-'))}: No such file or directory`);
        const names = fs.readdirSync(dir).filter(n => all || !n.startsWith('.')).sort();
        const list = all ? ['.', '..', ...names] : names;
        return {status: 0, output: list.length ? list.join('  ') + '\n' : ''};
      }
      case 'cat': {
        let output = '';
        for (const arg of args) {
          const file = toReal(arg);
          if (!fs.existsSync(file)) return fail(`cat: ${arg}: No such file or directory`);
          output += fs.readFileSync(file, 'utf8');
        }
        return {status: 0, output};
      }
    }
    throw new Error(`Unknown built-in ${name}`);
  };

  const record = [];
  const graphs = {};
  const problems = [];
  for (const step of session.steps) {
    if (step.kind === 'as') { persona = step.persona; record.push({kind: 'as', persona}); continue; }
    if (step.kind === 'file') {
      const target = toReal(step.path);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, step.content);
      if (step.shown) record.push({kind: 'file', path: step.path, content: step.content});
      continue;
    }
    if (step.kind === 'graph') {
      const log = runGit(['log', '--all', '--topo-order', '--format=%h%x09%H%x09%P%x09%D%x09%s']);
      const text = runGit(['log', '--all', '--graph', '--oneline', '--decorate']);
      if (log.status !== 0 || !log.output.trim()) { problems.push(`${step.where}: no commits to draw for "@graph ${step.label}"`); continue; }
      const commits = log.output.trimEnd().split('\n').map(line => {
        const [short, hash, parents, refs, subject] = line.split('\t');
        return {short, hash, parents: parents ? parents.split(' ') : [], refs, subject};
      });
      graphs[step.label] = {commits, text: toShown(text.output)};
      record.push({kind: 'graph', label: step.label});
      continue;
    }
    clock += TICK;
    // arguments may name the readable paths a learner sees, such as /srv/git/recipes.git
    const args = step.words.slice(1).map(a => (shown.some(([, nice]) => a === nice || a.startsWith(nice + '/')) ? toReal(a) : a));
    const {status, output} = step.words[0] === 'git' ? runGit(args) : builtin(step.words);
    const ok = status === 0;
    if (ok === step.expectFail) {
      problems.push(`${step.where}: "${step.line}" ${ok ? 'succeeded, but is declared to fail ($!)' : `failed with exit code ${status}, but is declared to succeed`}\n${toShown(output)}`);
    }
    if (step.shown) record.push({kind: 'command', line: step.line, output: toShown(output), ok});
  }
  return {record, graphs, problems};
}
