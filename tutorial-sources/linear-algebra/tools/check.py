"""Check the lesson mathematics and Python using the shared Markdown runner."""
from pathlib import Path
import sys
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root.parent / "calculus" / "tools"))
import calc

calc.ROOT = str(root)
calc.SRC = str(root / "src" / "en")
calc.OUT = str(root / "out")
calc.ZIP = "linear-algebra-code.zip"

try:
    calc.main()
except SystemExit as result:
    if result.code == 0 and not sys.argv[1:]:
        archive = root / "out" / calc.ZIP
        with ZipFile(archive) as source:
            files = {Path(name).name: source.read(name) for name in source.namelist()}
        temporary = archive.with_suffix(".tmp")
        with ZipFile(temporary, "w", ZIP_DEFLATED) as target:
            for name, content in files.items():
                content = content.replace(b"Calculus", b"Linear Algebra", 1)
                target.writestr(f"linear-algebra-code/{name}", content)
        temporary.replace(archive)
    raise
