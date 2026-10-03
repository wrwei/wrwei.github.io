"""Extract, run and reconcile the labs of one module.

Run it with the lab Python (bash, from the series root):
  tools/labpy.sh tools/labrun.py --module 3              run every lab, report
  tools/labpy.sh tools/labrun.py --module 3 --lab lab2   one lab
  ... --update        write the actual output of each block into its ```output fence
  ... --add-missing   with --update: also add an ```output fence after blocks that print but have none
  ... --timeout 900   seconds per lab (default 900)

How a lab is executed: inside the section "## ... {#labK}", every ```python fence (except those whose
info string contains "norun") is concatenated, in order, into labs/module_NN/labK.py and run as one
script in labs/module_NN/run_labK/. A marker line is printed after each block, so the output of block
i is everything printed between marker i-1 and marker i. An ```output fence belongs to the nearest
python block before it in the same lab. plt.show() saves the open figures to labs/plots/ and records
them in labs/module_NN/labK.plots.json; the page build shows them under the block that made them.
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import time

ROOT = os.environ.get("AIS_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FENCE = re.compile(r"^( {0,8})(`{3,})(.*)$")
H2 = re.compile(r"^## .*\{#([\w-]+)\}\s*$")


def part_files(n, lang):
    d = os.path.join(ROOT, "src", lang, f"module_{n:02d}")
    if not os.path.isdir(d):
        return []
    return [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith(".md")]


def scan(n, lang):
    """Return {lab_id: [fence dicts in order]} across all part files."""
    labs = {}
    current = None
    for path in part_files(n, lang):
        with open(path, encoding="utf-8") as fh:
            lines = fh.read().split("\n")
        i = 0
        while i < len(lines):
            line = lines[i]
            m = H2.match(line)
            if m:
                current = m.group(1) if re.match(r"^lab\d+$", m.group(1)) else None
                if current:
                    labs.setdefault(current, [])
                i += 1
                continue
            fm = FENCE.match(line)
            if fm:
                indent, ticks, info = len(fm.group(1)), fm.group(2), fm.group(3).strip()
                j = i + 1
                while j < len(lines) and not (set(lines[j].strip()) == {"`"} and len(lines[j].strip()) >= len(ticks)):
                    j += 1
                if current:
                    lang_name = info.split()[0] if info else ""
                    kind = "other"
                    if lang_name in ("python", "py") and "norun" not in info.split():
                        kind = "code"
                    elif lang_name == "output":
                        kind = "output"
                    labs[current].append({"file": path, "start": i, "end": j, "info": info, "kind": kind,
                                          "body": "\n".join(ln[indent:] if ln[:indent].strip() == "" else ln.lstrip() for ln in lines[i + 1: j])})
                i = j + 1
                continue
            i += 1
    return labs


def pair(fences):
    """Number the code blocks 1..k and attach each output fence to the code block before it."""
    blocks = []
    for f in fences:
        if f["kind"] == "code":
            blocks.append({"code": f, "output": None})
        elif f["kind"] == "output":
            if blocks and blocks[-1]["output"] is None:
                blocks[-1]["output"] = f
            else:
                blocks.append({"code": None, "output": f, "orphan": True})
    return blocks


PRELUDE = r'''
import os as _lab_os, sys as _lab_sys, json as _lab_json, atexit as _lab_atexit
_lab_os.environ.setdefault("MPLBACKEND", "Agg")
_LAB_PLOTDIR = {plotdir!r}
_LAB_PREFIX = {prefix!r}
_LAB_MANIFEST = {manifest!r}
_lab_block = [0]
_lab_plots = []
try:
    import matplotlib as _lab_mpl
    _lab_mpl.use("Agg")
    import matplotlib.pyplot as _lab_plt
    def _lab_show(*a, **k):
        for _num in _lab_plt.get_fignums():
            _fig = _lab_plt.figure(_num)
            _name = "%s-b%d-%d.png" % (_LAB_PREFIX, _lab_block[0], len(_lab_plots) + 1)
            _fig.savefig(_lab_os.path.join(_LAB_PLOTDIR, _name), dpi=90, bbox_inches="tight")
            _lab_plots.append([_lab_block[0], _name])
        _lab_plt.close("all")
    _lab_plt.show = _lab_show
except Exception:
    pass
def _lab_save_manifest():
    with open(_LAB_MANIFEST, "w", encoding="utf-8") as _fh:
        _lab_json.dump(_lab_plots, _fh)
_lab_atexit.register(_lab_save_manifest)
def _lab_mark(i):
    _lab_sys.stdout.flush(); _lab_sys.stderr.flush()
    print("\n@@LAB-BLOCK-END %d@@" % i, flush=True)
'''


def build_script(n, lab, blocks, workdir):
    plotdir = os.path.join(ROOT, "labs", "plots")
    os.makedirs(plotdir, exist_ok=True)
    manifest = os.path.join(ROOT, "labs", f"module_{n:02d}", f"{lab}.plots.json")
    # remove this lab's old plots so stale images never survive a re-run
    prefix = f"m{n:02d}-{lab}"
    for f in os.listdir(plotdir):
        if f.startswith(prefix + "-b"):
            os.remove(os.path.join(plotdir, f))
    parts = [PRELUDE.format(plotdir=plotdir, prefix=prefix, manifest=manifest)]
    k = 0
    for b in blocks:
        if not b.get("code"):
            continue
        k += 1
        parts.append(f"_lab_block[0] = {k}\n# ---- block {k} ----\n{b['code']['body']}\n_lab_mark({k})\n")
    path = os.path.join(ROOT, "labs", f"module_{n:02d}", f"{lab}.py")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(parts))
    return path, k


def norm(s):
    lines = [ln.rstrip() for ln in s.replace("\r\n", "\n").split("\n")]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines)


def run_lab(n, lab, fences, timeout):
    blocks = pair(fences)
    workdir = os.path.join(ROOT, "labs", f"module_{n:02d}", f"run_{lab}")
    os.makedirs(workdir, exist_ok=True)
    script, k = build_script(n, lab, blocks, workdir)
    t0 = time.time()
    try:
        p = subprocess.run([sys.executable, script], cwd=workdir, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=timeout)
        stdout, stderr, rc, timed_out = p.stdout, p.stderr, p.returncode, False
    except subprocess.TimeoutExpired as e:
        stdout = (e.stdout or b"").decode("utf-8", "replace") if isinstance(e.stdout, bytes) else (e.stdout or "")
        stderr = (e.stderr or b"").decode("utf-8", "replace") if isinstance(e.stderr, bytes) else (e.stderr or "")
        rc, timed_out = -1, True
    secs = time.time() - t0
    chunks = re.split(r"\n?@@LAB-BLOCK-END (\d+)@@\n?", stdout)
    actual = {}
    # chunks: [out1, '1', out2, '2', ..., tail]
    for i in range(1, len(chunks), 2):
        actual[int(chunks[i])] = chunks[i - 1]
    tail = chunks[-1] if len(chunks) % 2 == 1 else ""
    return {"blocks": blocks, "actual": actual, "tail": tail, "stderr": stderr, "rc": rc,
            "timed_out": timed_out, "secs": secs, "n_code": k, "script": script}


def report(n, lab, r, plan_lab):
    print(f"\n=== Module {n:02d} {lab}: {r['n_code']} code blocks, {r['secs']:.1f}s, exit {r['rc']}"
          + (" TIMEOUT" if r["timed_out"] else ""))
    if plan_lab:
        budget = 60 * float(plan_lab.get("cpu_runtime_minutes", 0) or 0)
        if budget and r["secs"] > 1.5 * budget:
            print(f"  ! runtime {r['secs']:.0f}s exceeds 1.5x the stated {plan_lab['cpu_runtime_minutes']} min")
    ok = True
    k = 0
    for b in r["blocks"]:
        if b.get("orphan"):
            print(f"  ! output fence at {os.path.relpath(b['output']['file'], ROOT)}:{b['output']['start'] + 1} has no python block before it")
            ok = False
            continue
        k += 1
        got = norm(r["actual"].get(k, ""))
        reached = k in r["actual"]
        if not reached:
            print(f"  block {k}: NOT REACHED")
            ok = False
            continue
        if b["output"] is None:
            if got:
                print(f"  block {k}: prints {len(got.splitlines())} line(s) but has no ```output fence")
            continue
        want = norm(b["output"]["body"])
        if got == want:
            print(f"  block {k}: match")
        else:
            ok = False
            print(f"  block {k}: DIFFERS from the expected output")
            diff = list(difflib.unified_diff(want.split("\n"), got.split("\n"), "expected", "actual", lineterm="", n=1))
            for line in diff[:40]:
                print("      " + line)
            if len(diff) > 40:
                print(f"      ... {len(diff) - 40} more diff lines")
    if r["rc"] != 0 or r["timed_out"]:
        ok = False
        err = r["stderr"].strip().split("\n")
        print("  stderr (last 25 lines):")
        for line in err[-25:]:
            print("      " + line)
    elif r["stderr"].strip():
        warn = [ln for ln in r["stderr"].split("\n") if ln.strip() and "Warning" in ln]
        if warn:
            print(f"  note: {len(warn)} warning line(s) on stderr, e.g. {warn[0][:160]}")
    man = os.path.join(ROOT, "labs", f"module_{n:02d}", f"{lab}.plots.json")
    if os.path.exists(man):
        with open(man, encoding="utf-8") as fh:
            plots = json.load(fh)
        if plots:
            print(f"  plots: {', '.join(p[1] for p in plots)}")
    print(f"  script: {r['script']}")
    return ok


def update(n, lab, r, add_missing):
    """Write actual outputs into the output fences (bottom-up so line numbers stay valid)."""
    edits = []  # (file, start, end, new_lines) replacing lines[start:end+1]
    k = 0
    for b in r["blocks"]:
        if b.get("orphan"):
            continue
        k += 1
        if k not in r["actual"]:
            continue
        got = norm(r["actual"][k])
        if b["output"] is not None:
            if got:
                o = b["output"]
                edits.append((o["file"], o["start"], o["end"], ["```output"] + got.split("\n") + ["```"]))
        elif add_missing and got:
            c = b["code"]
            edits.append((c["file"], c["end"] + 1, c["end"], ["", "```output"] + got.split("\n") + ["```"]))
    by_file = {}
    for e in edits:
        by_file.setdefault(e[0], []).append(e)
    for path, es in by_file.items():
        with open(path, encoding="utf-8") as fh:
            lines = fh.read().split("\n")
        for _, start, end, new in sorted(es, key=lambda e: e[1], reverse=True):
            lines[start:end + 1] = new
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("\n".join(lines))
    print(f"  updated {len(edits)} output fence(s)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--module", type=int, required=True)
    ap.add_argument("--lab")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--update", action="store_true")
    ap.add_argument("--add-missing", action="store_true")
    ap.add_argument("--timeout", type=int, default=900)
    a = ap.parse_args()
    labs = scan(a.module, a.lang)
    if not labs:
        print("no lab sections found")
        return 1
    plan = {}
    pp = os.path.join(ROOT, "plan", f"module_{a.module:02d}.json")
    if os.path.exists(pp):
        with open(pp, encoding="utf-8") as fh:
            plan = {l["id"]: l for l in json.load(fh).get("labs", [])}
    todo = [a.lab] if a.lab else sorted(labs, key=lambda x: int(x[3:]))
    all_ok = True
    for lab in todo:
        if lab not in labs:
            print(f"{lab}: no such lab section")
            all_ok = False
            continue
        r = run_lab(a.module, lab, labs[lab], a.timeout)
        ok = report(a.module, lab, r, plan.get(lab))
        all_ok = all_ok and ok
        if a.update:
            update(a.module, lab, r, a.add_missing)
    print("\nALL LABS MATCH" if all_ok else "\nSOME LABS NEED ATTENTION")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
