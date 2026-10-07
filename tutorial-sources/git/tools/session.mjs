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
export function splitCommand(line, where, allowTilde = false) {
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
    if (!started && ch === '#') throw new Error(`${where}: a word starting with "#" is a comment in a shell; quote it`);
    if (!started && ch === '~' && !allowTilde) throw new Error(`${where}: "~" is expanded by a shell; write /home/alex instead`);
    if ('|&;<>$`\\*?(){}[]'.includes(ch)) throw new Error(`${where}: shell syntax "${ch}" is not supported; a session runs one plain command per line`);
    word += ch;
    started = true;
  }
  if (quote) throw new Error(`${where}: a quote is not closed`);
  if (started) words.push(word);
  return words;
}

/** The forms of each built-in that the runner implements; anything else is rejected while parsing. */
function checkBuiltin([name, ...args], where) {
  const options = args.filter(a => a.startsWith('-'));
  const operands = args.filter(a => !a.startsWith('-'));
  const fail = message => { throw new Error(`${where}: ${message}`); };
  if (name === 'pwd' && args.length) fail('pwd takes no arguments');
  if (name === 'ls' && (options.some(o => o !== '-a') || options.length > 1 || operands.length > 1)) fail('ls: only "ls", "ls -a" and one folder are supported');
  if (name === 'cd' && (options.length || operands.length > 1)) fail('cd takes at most one folder');
  if (name === 'mkdir' && options.length) fail('mkdir: options are not supported');
  if (name === 'mkdir' && !operands.length) fail('mkdir needs a folder name');
  if (name === 'cat' && options.length) fail('cat: options are not supported');
  if (name === 'cat' && !operands.length) fail('cat needs at least one file');
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
      const words = splitCommand(m[2], where, /^cd\s+~$/.test(m[2].trim()));
      if (words[0] !== 'git' && !BUILTINS.includes(words[0])) throw new Error(`${where}: "${words[0]}" is neither git nor a built-in (${BUILTINS.join(', ')})`);
      if (words[0] !== 'git') checkBuiltin(words, where);
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
 * Maps between the sandbox's real paths and the paths a lesson shows. `root` holds the shown file
 * system (/home/alex, /home/sam, /srv/git); `internal` holds the runner's own files and must never
 * appear in output. `pathApi` is node:path, or path.win32 in tests.
 */
export function sandboxPaths(root, internal, pathApi = path) {
  const forward = p => p.replace(/\\/g, '/');
  const roots = [...new Set([root, forward(root)])];
  const outside = [...new Set([internal, forward(internal), pathApi.dirname(root), forward(pathApi.dirname(root))])];
  const MARK = '\u0000';
  return {
    /** Rewrites sandbox paths in text as shown paths with forward slashes; the root itself is "/". */
    toShown(text) {
      let out = text;
      for (const r of roots) out = out.split(r).join(MARK);
      return out.replace(/\u0000([^\s'"]*)/g, (_, rest) => forward(rest) || '/');
    },
    /** The real path for a shown absolute path such as /srv/git/recipes.git. */
    toReal(shown) {
      return pathApi.join(root, ...shown.split('/').filter(Boolean));
    },
    /** The same, with forward slashes, which Git accepts on every system. */
    forGit(shown) {
      return forward(pathApi.join(root, ...shown.split('/').filter(Boolean)));
    },
    /** Paths outside the shown file system that appear in (already shown) text. */
    leaks(text) {
      const found = outside.find(p => text.includes(p));
      return found ? [found] : [];
    },
  };
}

const isShownPath = p => p === '/' || /^\/(home|srv)(\/|$)/.test(p);

/**
 * Runs a parsed session in `sandbox`, an empty directory. Returns
 *   record:   what the lesson shows, in order: {kind:'command', line, output, ok} | {kind:'file', path, content}
 *             | {kind:'as', persona} | {kind:'graph', label}
 *   graphs:   label -> {commits, text} for each @graph step
 *   problems: messages for every step that did not behave as declared (empty when all is well)
 */
export function runSession(session, {sandbox, git = 'git'}) {
  const base = fs.realpathSync.native(sandbox);
  const root = path.join(base, 'root');
  const internal = path.join(base, 'internal');
  const homes = {alex: path.join(root, 'home', 'alex'), sam: path.join(root, 'home', 'sam')};
  for (const dir of [...Object.values(homes), path.join(root, 'srv', 'git'), internal]) fs.mkdirSync(dir, {recursive: true});
  const paths = sandboxPaths(root, internal);
  const outputFile = path.join(internal, 'output.txt');
  const cwd = {...homes};
  let persona = 'alex';
  let clock = START;

  // Paths never leave the shown file system: going above / stays at /, as in a shell.
  const confine = p => (p === root || p.startsWith(root + path.sep) ? p : root);
  const toReal = p => confine(isShownPath(p) ? paths.toReal(p) : path.resolve(cwd[persona], p));
  const env = () => {
    const who = PERSONAS[persona];
    const date = `@${clock} +0000`;
    return {
      PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT ?? '',
      HOME: homes[persona], USERPROFILE: homes[persona], XDG_CONFIG_HOME: path.join(homes[persona], '.config'),
      // No system or vendor configuration (Apple's Git reads an extra file that GIT_CONFIG_SYSTEM cannot replace);
      // new repositories start on main, as if the learner had followed Module 1.
      GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'init.defaultBranch', GIT_CONFIG_VALUE_0: 'main',
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
    const exists = p => fs.existsSync(p);
    switch (name) {
      case 'pwd': return {status: 0, output: paths.toShown(cwd[persona]) + '\n'};
      case 'cd': {
        const target = !args[0] || args[0] === '~' ? homes[persona] : toReal(args[0]);
        if (!exists(target) || !fs.statSync(target).isDirectory()) return fail(`cd: no such directory: ${args[0]}`);
        cwd[persona] = target;
        return {status: 0, output: ''};
      }
      case 'mkdir': {
        for (const arg of args) {
          const target = toReal(arg);
          if (exists(target)) return fail(`mkdir: ${arg}: File exists`);
          if (!exists(path.dirname(target))) return fail(`mkdir: ${arg}: No such file or directory`);
          fs.mkdirSync(target);
        }
        return {status: 0, output: ''};
      }
      case 'ls': {
        const all = args.includes('-a');
        const named = args.find(a => !a.startsWith('-'));
        const dir = toReal(named ?? '.');
        if (!exists(dir)) return fail(`ls: ${named}: No such file or directory`);
        const names = fs.readdirSync(dir).filter(n => all || !n.startsWith('.')).sort();
        const list = all ? ['.', '..', ...names] : names;
        return {status: 0, output: list.length ? list.join('  ') + '\n' : ''};
      }
      case 'cat': {
        let output = '';
        for (const arg of args) {
          const file = toReal(arg);
          if (!exists(file) || fs.statSync(file).isDirectory()) return fail(`cat: ${arg}: No such file or directory`);
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
  const show = (text, where) => {
    const shown = paths.toShown(text);
    for (const leak of paths.leaks(shown)) problems.push(`${where}: the output shows a path outside the sandbox (${leak})`);
    return shown;
  };
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
      graphs[step.label] = {commits, text: show(text.output, step.where)};
      record.push({kind: 'graph', label: step.label});
      continue;
    }
    clock += TICK;
    let result;
    if (step.words[0] === 'git') {
      // arguments may name the paths a learner sees, such as /srv/git/recipes.git
      result = runGit(step.words.slice(1).map(a => (isShownPath(a) ? paths.forGit(a) : a)));
    } else {
      try {
        result = builtin(step.words);
      } catch (error) {
        result = {status: 1, output: `${step.words[0]}: ${error.message}\n`};
      }
    }
    const ok = result.status === 0;
    const output = show(result.output, step.where);
    if (ok === step.expectFail) {
      problems.push(`${step.where}: "${step.line}" ${ok ? 'succeeded, but is declared to fail ($!)' : `failed with exit code ${result.status}, but is declared to succeed`}\n${output}`);
    }
    if (step.shown) record.push({kind: 'command', line: step.line, output, ok});
  }
  return {record, graphs, problems};
}
