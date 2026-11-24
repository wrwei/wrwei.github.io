"""Check a tutorial course's examples and build its Python download."""

import argparse
import json
from pathlib import Path
import sys
from zipfile import ZIP_DEFLATED, ZipFile

default_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(default_root.parent / "calculus" / "tools"))
import calc


def example_readme(course):
    requirements = course["pythonRequirements"]
    english = "The examples use the Python standard library."
    chinese = "示例仅使用 Python 标准库。"
    if requirements:
        command = "python -m pip install " + " ".join(requirements)
        english = f"Install the dependencies with\n    {command}"
        chinese = f"用以下命令安装依赖\n    {command}"
    return (
        f"{course['en']['title']} / {course['zh']['title']}\n\n"
        f"Run an example with python module_01.py.\n{english}\n\n"
        f"用 python module_01.py 运行一个示例。\n{chinese}\n"
    ).encode()


parser = argparse.ArgumentParser(add_help=False)
parser.add_argument("--course", type=Path, default=default_root)
parser.add_argument("--lang", choices=("en", "zh"), default="en")
args, remaining = parser.parse_known_args()
root = args.course.resolve()
course = json.loads((root / "course.json").read_text())
archive_name = f"{course['id']}-code"
output = root / "out"
if args.lang == "zh":
    output /= "zh"

calc.ROOT = str(root)
calc.SRC = str(root / "src" / args.lang)
calc.OUT = str(output)
calc.ZIP = f"{archive_name}.zip"
sys.argv = [sys.argv[0], *remaining]

try:
    calc.main()
except SystemExit as result:
    if result.code == 0 and not remaining:
        archive = output / calc.ZIP
        with ZipFile(archive) as source:
            files = {Path(name).name: source.read(name) for name in source.namelist()}
        temporary = archive.with_suffix(".tmp")
        with ZipFile(temporary, "w", ZIP_DEFLATED) as target:
            for name, content in files.items():
                if name == "README.txt":
                    content = example_readme(course)
                else:
                    content = content.replace(b'"""Calculus,', f'"""{course[args.lang]["title"]},'.encode(), 1)
                target.writestr(f"{archive_name}/{name}", content)
        temporary.replace(archive)
    raise
