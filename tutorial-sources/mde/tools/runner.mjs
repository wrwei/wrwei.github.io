// Runs examples on Eclipse Epsilon through the Java runner in ../runner.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const windows = process.platform === 'win32';

/** Builds runner/target/mde-runner.jar when it is missing or older than its sources; returns its path. */
export function ensureRunner(runnerDir) {
  const jar = path.join(runnerDir, 'target', 'mde-runner.jar');
  const sources = [path.join(runnerDir, 'pom.xml'), ...listFiles(path.join(runnerDir, 'src'))];
  const stale = !fs.existsSync(jar) || sources.some(file => fs.statSync(file).mtimeMs > fs.statSync(jar).mtimeMs);
  if (stale) {
    const mvn = spawnSync(windows ? 'mvn.cmd' : 'mvn', ['-q', '-B', '-f', path.join(runnerDir, 'pom.xml'), 'package'], {encoding: 'utf8', shell: windows});
    if (mvn.error || mvn.status !== 0) throw new Error(`Building the Epsilon runner failed:\n${mvn.error || mvn.stdout + mvn.stderr}`);
  }
  return jar;
}

function listFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry =>
    entry.isDirectory() ? listFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}

/**
 * Runs jobs in one JVM. A job is {key, language, program, secondProgram?, emfatic, secondEmfatic?, flexmi}
 * with absolute file paths. Returns Map(key -> {status: 'ok' | 'error', output}).
 */
export function runJobs(jar, jobs, workDir) {
  fs.rmSync(workDir, {recursive: true, force: true});
  fs.mkdirSync(path.join(workDir, 'jobs'), {recursive: true});
  const files = jobs.map(job => {
    const out = path.join(workDir, 'out', job.key);
    const lines = Object.entries({...job, out})
      .filter(([key, value]) => key !== 'key' && value)
      .map(([key, value]) => `${key}=${String(value).replace(/\\/g, '\\\\')}`);
    const file = path.join(workDir, 'jobs', `${job.key}.properties`);
    fs.writeFileSync(file, lines.join('\n') + '\n');
    return file;
  });
  const java = spawnSync('java', ['-jar', jar, ...files], {encoding: 'utf8', timeout: 300000});
  if (java.error || java.status !== 0) throw new Error(`The Epsilon runner crashed:\n${java.error || java.stdout + java.stderr}`);
  return new Map(jobs.map(job => {
    const out = path.join(workDir, 'out', job.key);
    const status = fs.readFileSync(path.join(out, 'status.txt'), 'utf8').split('\n')[0];
    return [job.key, {status, output: fs.readFileSync(path.join(out, 'output.txt'), 'utf8')}];
  }));
}
