"""Observe an isolated child process and scoped file cleanup."""
import json, os, subprocess, sys, tempfile
from pathlib import Path
child = subprocess.run([sys.executable, "-c", "import os,json; print(json.dumps({'pid':os.getpid(),'answer':6*7}))"],
                       check=True, capture_output=True, text=True, timeout=10)
data = json.loads(child.stdout)
assert data["pid"] != os.getpid() and data["answer"] == 42
print("child is a different process:", data["pid"] != os.getpid())
print("child result:", data["answer"])
with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / "catalogue.txt"
    path.write_text("Dune\nFoundation\n", encoding="utf-8")
    print("file records:", path.read_text(encoding="utf-8").splitlines())
print("temporary directory removed:", not Path(folder).exists())
