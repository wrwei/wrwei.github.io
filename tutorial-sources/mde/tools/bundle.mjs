// The Epsilon Playground bundle (examples.json plus files) and per-module zip downloads.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {FILE_FIELDS} from './examples.mjs';

export const PLAYGROUND = 'https://eclipse.dev/epsilon/playground/';
const pad = n => String(n).padStart(2, '0');

/** The Playground selects an example by a query parameter with no value: ?examples=<bundle>&<id>. */
export function playgroundLink(bundleUrl, id) {
  return `${PLAYGROUND}?examples=${encodeURIComponent(bundleUrl)}&${id}`;
}

/** modules: [{number, title: {en}, examples}]. Writes dest/playground/; paths in examples.json are relative to it. */
export function writeBundle(dest, modules) {
  const root = path.join(dest, 'playground');
  fs.rmSync(root, {recursive: true, force: true});
  fs.mkdirSync(root, {recursive: true});
  const groups = modules.filter(m => m.examples.length).map(m => ({
    title: `Module ${pad(m.number)}: ${m.title.en}`,
    examples: m.examples.map(example => {
      const entry = {id: example.id, title: example.title.en, language: example.language};
      for (const field of FILE_FIELDS) {
        if (!example[field]) continue;
        const relative = `module_${pad(m.number)}/${example.id}/${example[field]}`;
        fs.mkdirSync(path.dirname(path.join(root, relative)), {recursive: true});
        fs.copyFileSync(path.join(example.dir, example[field]), path.join(root, relative));
        entry[field] = relative;
      }
      if (example.outputType) entry.outputType = example.outputType;
      if (example.outputLanguage) entry.outputLanguage = example.outputLanguage;
      return entry;
    }),
  }));
  fs.writeFileSync(path.join(root, 'examples.json'), JSON.stringify({examples: groups}, null, 2) + '\n');
  return groups;
}

/** Each example's files under <id>/, for running the examples in Eclipse. */
export function zipEntries(examples) {
  return examples.flatMap(example => FILE_FIELDS.filter(field => example[field]).map(field => ({
    name: `${example.id}/${example[field]}`,
    data: fs.readFileSync(path.join(example.dir, example[field])),
  })));
}

/** Stored (uncompressed) entries with a fixed 1980-01-01 timestamp, so the same files give the same bytes. */
export function writeZip(file, entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const {name, data} of entries) {
    const nameBytes = Buffer.from(name, 'utf8');
    const crc = zlib.crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(20, 4);
    record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0x0800, 8);
    record.writeUInt16LE(0, 10);
    record.writeUInt16LE(0, 12);
    record.writeUInt16LE(0x21, 14);
    record.writeUInt32LE(crc, 16);
    record.writeUInt32LE(data.length, 20);
    record.writeUInt32LE(data.length, 24);
    record.writeUInt16LE(nameBytes.length, 28);
    record.writeUInt32LE(offset, 42);
    parts.push(local, nameBytes, data);
    central.push(record, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, Buffer.concat([...parts, directory, end]));
}
