"""Independent checks of links, bilingual structure, labs and algorithm contracts."""
import contextlib
import hashlib
from html.parser import HTMLParser
from itertools import combinations, combinations_with_replacement, permutations, product
import io
from pathlib import Path
import runpy
import subprocess
import sys
import tempfile
from urllib.parse import unquote, urlsplit

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[1]
DEST = ROOT / "docs/tutorials/cs"

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.answers, self.keys = [], [], [], []
        self.code, self.outputs = [], []
        self.capture, self.output_depth, self.div_depth = None, None, 0
        self.exercises = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs: self.ids.append(attrs["id"])
        for attr in ("src", "href"):
            if attr in attrs: self.links.append(attrs[attr])
        if "data-answer" in attrs: self.answers.append(attrs["data-answer"])
        if "data-key" in attrs: self.keys.append(attrs["data-key"])
        if attrs.get("class") == "exercise": self.exercises += 1
        if tag == "div":
            self.div_depth += 1
            if attrs.get("class") == "output": self.output_depth = self.div_depth
        if tag == "code" and attrs.get("class") == "language-python":
            self.code.append(""); self.capture = self.code
        elif tag == "code" and self.output_depth is not None:
            self.outputs.append(""); self.capture = self.outputs
    def handle_endtag(self, tag):
        if tag == "code": self.capture = None
        if tag == "div":
            if self.div_depth == self.output_depth: self.output_depth = None
            self.div_depth -= 1
    def handle_data(self, data):
        if self.capture is not None: self.capture[-1] += data

def load_lab(filename):
    with contextlib.redirect_stdout(io.StringIO()):
        return runpy.run_path(str(SOURCE / "labs" / filename))

def structural_checks():
    pages = {}
    for path in DEST.glob("*.html"):
        page = Page(); page.feed(path.read_text(encoding="utf-8"))
        assert len(page.ids) == len(set(page.ids)), (path.name, "duplicate ID")
        pages[path.resolve()] = page
    assert len(pages) == 30
    for path, page in pages.items():
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc: continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir():
                assert any((target / name).exists() for name in ("index.html", "index.md")), link
            else: assert target.exists(), (path.name, link)
            if target in pages and url.fragment:
                assert unquote(url.fragment) in pages[target].ids, (path.name, link)
        assert "{{" not in path.read_text(encoding="utf-8")
    for number in range(1,15):
        en, zh = [pages[(DEST / f"module_{number:02}_{lang}.html").resolve()] for lang in ("EN", "ZH")]
        assert en.ids == zh.ids and en.keys == zh.keys and en.answers == zh.answers
        assert en.code == zh.code and en.outputs == zh.outputs
        assert len(en.keys) == 4 and len(set(en.keys)) == 4 and en.exercises == 8
        assert len(en.answers) == (8 if number == 1 else 6)
        lab_links = [link for link in en.links if link.startswith("labs/")]
        assert len(lab_links) == (3 if number == 1 else 2)
        assert len(en.outputs) == len(lab_links)
        for code, link in zip(en.code, lab_links):
            assert code == (DEST / link).read_text(encoding="utf-8"), link
        # Every script is executed independently; published output must match it exactly.
        for link, expected in zip(lab_links, en.outputs):
            result = subprocess.run([sys.executable, str(DEST / link)], capture_output=True,
                                    text=True, encoding="utf-8", timeout=30, check=True)
            assert result.stdout == expected, (number, link, "output drift")
    progress_keys = [key for path, page in pages.items() if "_EN" in path.name for key in page.keys]
    assert len(set(progress_keys)) == 56
    for path in (DEST / "labs").glob("*.py"):
        assert path.read_bytes() == (SOURCE / "labs" / path.name).read_bytes()
    css = (DEST / "assets/style.css").read_text(encoding="utf-8")
    assert (DEST / "assets/../../ai/assets/style.css").resolve().exists()
    assert "@import" in css
    print("PASS: 30 pages, local links/fragments, EN/ZH parity, 112 exercises, 86 quizzes, 56 unique session keys and 29 captured lab outputs")

def algorithm_checks():
    binary = load_lab("m05_search.py")["binary_search"]
    sort = load_lab("m05_sort.py")["insertion_sort"]
    for size in range(7):
        for items in combinations_with_replacement(range(3), size):
            for target in range(-1,4):
                expected = items.index(target) if target in items else -1
                assert binary(items, target)[0] == expected
    for size in range(6):
        for values in product(range(3), repeat=size):
            original = list(values)
            assert sort(original)[0] == sorted(values) and original == list(values)
    scheduling = load_lab("m08_greedy.py")
    pool = [(a,b) for a in range(4) for b in range(a+1,5)]
    for size in range(5):
        for jobs in combinations(pool, size):
            optimal = max(len(subset) for n in range(size+1) for subset in combinations(jobs,n)
                          if scheduling["compatible"](subset))
            assert len(scheduling["schedule"](jobs)) == optimal
    coins = load_lab("m08_dynamic.py")["min_coins"]
    for choices in ([1,3,4],[2,5],[3,7],[]):
        for amount in range(15):
            # Independent breadth-first search of reachable amounts.
            frontier, seen, distance = {0}, {0}, 0
            while frontier and amount not in frontier:
                distance += 1
                frontier = {v+c for v in frontier for c in choices if v+c <= amount} - seen
                seen |= frontier
            expected = distance if amount in frontier else None
            result = coins(choices,amount)
            assert (len(result) if result is not None else None) == expected
            if result is not None: assert sum(result) == amount
    parser = load_lab("m13_interpreter.py")
    for a,b,c in product(range(4), repeat=3):
        for text,expected in [(f"{a}+{b}*{c}",a+b*c),(f"({a}+{b})*{c}",(a+b)*c)]:
            assert parser["evaluate"](parser["Parser"](text).parse()) == expected
    print("PASS: independent exhaustive search, sort, greedy scheduling, coin-DP and interpreter checks")

def capstone_checks():
    mod = load_lab("m14_capstone.py")
    with tempfile.TemporaryDirectory() as folder:
        store = mod["Catalogue"](str(Path(folder) / "db.sqlite"))
        first = store.borrow("one",1,"alice")
        assert store.borrow("one",1,"alice")[1] == first[1]
        for book,member in [(2,"alice"),(1,"bob")]:
            try: store.borrow("one",book,member)
            except mod["Conflict"]: pass
            else: raise AssertionError("mismatched replay accepted")
        assert store.search("Dune")[0]["copies"] == 1
        with contextlib.closing(store.connect()) as db:
            # A rejected direct FK insert must not survive transaction rollback.
            import sqlite3
            try:
                with db: db.execute("INSERT INTO loans VALUES('invalid',999,'alice')")
            except sqlite3.IntegrityError: pass
            else: raise AssertionError("foreign key not enforced")
            assert db.execute("SELECT COUNT(*) FROM loans").fetchone()[0] == 1
    print("PASS: capstone identity-bound replay, conflict rollback and foreign-key enforcement")

def reproducibility():
    def snapshot():
        return {p:hashlib.sha256(p.read_bytes()).hexdigest() for p in DEST.rglob("*") if p.is_file()}
    before = snapshot()
    subprocess.run([sys.executable,str(SOURCE / "build.py")],check=True)
    assert before == snapshot(), "generated files must be reproducible"
    print("PASS: reproducible full-series build")

if __name__ == "__main__":
    structural_checks()
    algorithm_checks()
    capstone_checks()
    reproducibility()
