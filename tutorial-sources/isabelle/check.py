"""Check tutorial excerpts, proof provenance, downloads and optional built links."""
from pathlib import Path
from html.parser import HTMLParser
from hashlib import sha256
from urllib.parse import urlsplit, unquote
import argparse
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs/tutorials/isabelle'
EXAMPLES = DOCS / 'examples'
SYMBOLS = {'Rightarrow': '⇒', 'Longrightarrow': '⟹', 'longleftrightarrow': '⟷',
           'le': '≤', 'and': '∧', 'not': '¬', 'lparr': '⦇', 'rparr': '⦈',
           'noteq': '≠', 'open': '‹', 'close': '›'}

def normalise(text):
    text = re.sub(r'\\<([^>]+)>', lambda m: SYMBOLS.get(m[1], m[0]), text)
    return '\n'.join(line.rstrip() for line in text.strip().splitlines())

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, help='Already built MkDocs site directory')
    args = parser.parse_args()
    sources = {p.name: p.read_text() for p in EXAMPLES.glob('*.thy')}
    for name, text in sources.items():
        assert re.search(r'^theory\s+' + re.escape(Path(name).stem) + r'\b', text), name
        assert not re.search(r'^\s*(sorry|oops|axiomatization|oracle)\b', text, re.M), name
    snippets = 0
    for page in DOCS.glob('*.md'):
        for name, text in re.findall(r'<!-- checked: ([\w.]+) -->\s*```isabelle\n(.*?)\n```', page.read_text(), re.S):
            assert normalise(text) in normalise(sources[name]), (page.name, name, text)
            assert text.rstrip().endswith(('simp', 'simp_all', 'auto', ')', 'qed', '"')), (page.name, text)
            snippets += 1
    proof = json.loads((EXAMPLES / 'proof-status.json').read_text())
    assert proof['status'] == 'checked', 'Run the Isabelle session and refresh the proof record first'
    assert proof['exit_code'] == 0
    for name, digest in proof['source_sha256'].items():
        assert sha256((EXAMPLES / name).read_bytes()).hexdigest() == digest, name
    with zipfile.ZipFile(EXAMPLES / 'isabelle-tutorial.zip') as archive:
        expected = {'ROOT', 'Isabelle_Tutorial.thy', 'Exercise_Answers.thy', 'README.txt', 'proof-status.json'}
        assert set(archive.namelist()) == expected
        for name in expected:
            assert archive.read(name) == (EXAMPLES / name).read_bytes(), name
    local_links = 0
    if args.site:
        site = args.site.resolve()
        cache = {}
        def parsed(path):
            if path not in cache:
                result = Links()
                result.feed(path.read_text())
                cache[path] = result
            return cache[path]
        pages = [site / 'tutorials/isabelle/index.html',
                 site / 'tutorials/isabelle/exercises/index.html',
                 site / 'tutorials/isabelle/reference/index.html']
        for page in pages:
            assert page.is_file(), page
            for url in parsed(page).links:
                split = urlsplit(url)
                if split.scheme or split.netloc:
                    continue
                relative = unquote(split.path)
                target = ((site / relative.lstrip('/')) if relative.startswith('/') else (page.parent / relative)).resolve() if relative else page
                if target.is_dir():
                    target = target / 'index.html'
                assert target.is_relative_to(site), url
                assert target.is_file(), (page, url, target)
                if split.fragment and target.suffix == '.html':
                    assert unquote(split.fragment) in parsed(target).ids, (page, url)
                local_links += 1
    print(json.dumps({'theories': len(sources), 'checked_excerpts': snippets,
                      'proof_version': proof['isabelle_version'], 'download_matches_sources': True,
                      'built_local_links_checked': local_links}, indent=2))

if __name__ == '__main__':
    main()
