"""Write PLAN.md: a readable plan of the AI series from the ten module outlines, with production status."""
import datetime
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# task completion markers: done/ while a workflow runs, notes/task-reports/ in the repo
DONE_DIR = os.path.join(ROOT, "done") if os.path.isdir(os.path.join(ROOT, "done")) else os.path.join(ROOT, "notes", "task-reports")
DONE = set(f[:-5] for f in os.listdir(DONE_DIR))
# a module whose pages are on the site in both languages has finished every stage
SITE = os.path.join(ROOT, "..", "..", "docs", "tutorials", "ai")


def published(n):
    return all(os.path.isfile(os.path.join(SITE, f"module_{n:02d}_{l}.html")) for l in ("EN", "ZH"))


def esc(s):
    return str(s).replace("|", "\\|").replace("\n", " ").strip()


def first(s, n=170):
    """The first sentence or clause of s, at most about n characters."""
    s = re.sub(r"\s+", " ", str(s)).strip()
    m = re.match(r"(.{20,%d}?[.;])(\s|$)" % n, s)
    if m:
        return m.group(1)
    return s if len(s) <= n else s[:n].rsplit(" ", 1)[0] + " …"


def words_of(path):
    if not os.path.exists(path):
        return 0
    t = open(path, encoding="utf-8").read()
    t = re.sub(r"^```.*?^```", " ", t, flags=re.S | re.M)
    t = re.sub(r"\$\$.*?\$\$", " ", t, flags=re.S)
    t = re.sub(r"\$[^$\n]+\$", " x ", t)
    return len(re.findall(r"[A-Za-z][A-Za-z'’-]*", t))


plans = [json.load(open(os.path.join(ROOT, "plan", f"module_{n:02d}.json"), encoding="utf-8")) for n in range(1, 11)]
L = []
w = L.append

w("# Plan: From Machine Learning to Large Language Models")
w("")
w("A ten-module AI tutorial series for Ran Wei's home page (`docs/tutorials/ai/`), alongside the SysML v2, "
  "MBSE, DevOps and AI Agents series. Each module expands one of ten concise tutorials kept in "
  "the author's private repository into a self-study unit of about ten hours, in English and Simplified Chinese.")
w("")
w("This document is generated from the ten module outlines (`plan/module_NN.json`), the detailed contracts "
  "the writers follow. It summarises them; the outlines are about ten times longer.")
w("")
w("## 1. The series")
w("")
w("**Audience.** Engineers and postgraduates who know calculus, linear algebra and basic probability but have "
  "not worked in machine learning. The aim: read a modern model paper, understand what a training run does to "
  "a model, and make engineering decisions about models with judgement.")
w("")
w("**Shape of a module: about 600 minutes, in five study sessions of about two hours.**")
w("")
w("| Activity | Minutes | Volume |")
w("|---|---|---|")
w("| Concept reading: derivations, worked examples, figures, inline checks, interactive widgets | 210–250 | 12–14 sections, about 15,000 words |")
w("| Labs: Python/PyTorch on a laptop CPU; every printed output produced by running the code | 170–210 | 5–6 labs |")
w("| Exercises with full worked solutions, graded one to three stars | 100–130 | 15 exercises |")
w("| Self-check quiz with explanations | 15–20 | 12 questions |")
w("| Guided reading of key papers | 40–60 | 2–3 papers |")
w("")
w("**Rules kept throughout.** Every number comes from somewhere: the text says how it was obtained. Every "
  "method can fail, and each module has a section on what goes wrong. British spelling and the source "
  "tutorials' direct voice. No references to the private platform: its examples become generic engineering "
  "ones (fitting a hyperelastic material model, segmenting microscopy volumes, sensor time series, fault-tree "
  "graphs). Modules 07–10 follow one hypothetical case study, a ~9.5B open model adapted to draft and check "
  "engineering safety-assurance arguments, with one canonical configuration (L = 36, d = 4,096, 32 query and "
  "8 KV heads, d_ff = 15,360, V = 152,064).")
w("")
w("| # | Module | Planned minutes | Sections | Labs | Exercises | Quiz | Papers | Widgets | Figures planned |")
w("|---|---|---|---|---|---|---|---|---|---|")
for p in plans:
    mins = sum(a["minutes"] for s in p["sessions"] for a in s["activities"])
    figs = sum(len(s.get("figures", [])) for s in p["sections"])
    w(f"| {p['module']:02d} | {esc(p['title'])} | {mins} | {len(p['sections'])} | {len(p['labs'])} | "
      f"{len(p['exercises'])} | {len(p['quiz'])} | {len(p['papers'])} | {len(p.get('widgets', []))} | {figs} |")

w("")
w(f"## 2. Production status ({datetime.date.today().day} {datetime.date.today():%B %Y})")
w("")
stages = [("EN parts", "write"), ("edited", "edit"), ("figures", "fig"), ("widgets", "widget"),
          ("labs run", "labs"), ("tech review", "review"), ("EN QA", "qa-en"), ("中文 parts", "zh-"),
          ("中文 QA", "qa-zh")]
w("| # | " + " | ".join(s for s, _ in stages) + " | English prose words |")
w("|---|" + "---|" * (len(stages) + 1))
for p in plans:
    n = p["module"]
    d = os.path.join(ROOT, "src", "en", f"module_{n:02d}")
    parts = sorted(os.listdir(d)) if os.path.isdir(d) else []
    cells = []
    for _, key in stages:
        if published(n) and key != "write":
            cells.append("✓")
            continue
        if key == "write":
            cells.append(f"{len(parts)}/7")
            continue
        ks = [k for k in DONE if k.startswith(f"m{n:02d}-{key}")]
        expected = {"fig": 3, "widget": 2, "labs": 2, "zh-": 8}.get(key, 1)
        cells.append("✓" if len(ks) >= expected else (f"{len(ks)}/{expected}" if ks else "–"))
    total = sum(words_of(os.path.join(d, f)) for f in parts)
    w(f"| {n:02d} | " + " | ".join(cells) + f" | {total:,} |")
w("")
nfig = len([f for f in os.listdir(os.path.join(ROOT, "src", "figures", "en")) if f.endswith(".svg")])
nwid = len([f for f in os.listdir(os.path.join(ROOT, "src", "widgets")) if f.endswith(".js")])
w(f"Figures drawn so far: {nfig}, each also in Chinese. Widget files: {nwid} of 20. English prose words "
  "exclude code and maths and include labs, exercises and solutions. A module published on the site in both "
  "languages is marked done at every stage.")

w("")
w("## 3. The modules")
for p in plans:
    n = p["module"]
    w("")
    w(f"### Module {n:02d}: {p['title']}")
    w("")
    w(esc(p["lead"]))
    w("")
    w("**Before you start:** " + "; ".join(esc(x).rstrip(".") for x in p.get("prerequisites", [])) + ".")
    w("")
    w("**You will be able to:**")
    w("")
    for o in p.get("outcomes", []):
        w(f"- {esc(re.sub(r'^(by the end,? )?you can ', '', o, flags=re.I))}")
    w("")
    w("**Study plan.**")
    w("")
    w("| Session | Activities (minutes) |")
    w("|---|---|")
    for s in p["sessions"]:
        acts = "; ".join(f"{esc(a['what'])} ({a['minutes']})" for a in s["activities"])
        w(f"| {s['n']}. {esc(s['title'])} | {acts} |")
    w("")
    w("**Concept sections.**")
    w("")
    for s in p["sections"]:
        extra = []
        if s.get("worked_examples"):
            extra.append(f"{len(s['worked_examples'])} worked example(s)")
        if s.get("figures"):
            extra.append(f"{len(s['figures'])} figure(s)")
        if s.get("widget"):
            extra.append(f"widget: {s['widget']}")
        tail = f" _{', '.join(extra)}._" if extra else ""
        w(f"- **{s['id']} {esc(s['title'])}** ({s['minutes']} min). {esc(first(s.get('purpose', ''), 220))}{tail}")
        for item in s.get("must_cover", [])[:6]:
            w(f"  - {esc(first(item))}")
        if len(s.get("must_cover", [])) > 6:
            w(f"  - … and {len(s['must_cover']) - 6} more points")
    w(f"- **What goes wrong.** {len(p.get('what_goes_wrong', []))} failure modes, each as symptom, cause and fix.")
    w("")
    w("**Labs.**")
    w("")
    w("| Lab | Minutes | CPU run | Download | Goal |")
    w("|---|---|---|---|---|")
    for lab in p["labs"]:
        dl = f"{lab.get('download_mb', 0)} MB" if lab.get("download_mb") else "none"
        w(f"| {lab['id']}: {esc(lab['title'])} | {lab['minutes']} | ~{lab.get('cpu_runtime_minutes', '?')} min | "
          f"{dl} | {esc(first(lab.get('goal', ''), 180))} |")
    w("")
    lv = {1: 0, 2: 0, 3: 0}
    for e in p["exercises"]:
        lv[int(e.get("level", 1))] = lv.get(int(e.get("level", 1)), 0) + 1
    mins = sum(e.get("minutes", 0) for e in p["exercises"])
    w(f"**Exercises** ({len(p['exercises'])}: {lv[1]} ★, {lv[2]} ★★, {lv[3]} ★★★; {mins} minutes).")
    w("")
    for e in p["exercises"]:
        w(f"- {e['id']} {'★' * int(e.get('level', 1))} {e.get('kind', '')}, {e.get('minutes', '?')} min: "
          f"{esc(first(e.get('prompt', ''), 150))}")
    w("")
    w(f"**Quiz** ({len(p['quiz'])} questions): " + "; ".join(esc(first(q['question'], 80)) for q in p["quiz"]))
    w("")
    w("**Guided reading.**")
    w("")
    for pa in p["papers"]:
        w(f"- {esc(pa['citation'])} ({pa.get('minutes', '?')} min). {esc(first(pa.get('why', ''), 170))}")
    w("")
    w("**Interactive widgets.**")
    w("")
    for wd in p.get("widgets", []):
        w(f"- `{wd['name']}` (in {wd.get('section', '?')}): {esc(first(wd.get('teaching_point', ''), 200))}")
    w("")
    w(f"**Key terms:** {len(p.get('terms', []))} English–Chinese pairs. **References:** {len(p.get('references', []))}.")

out = os.path.join(ROOT, "PLAN.md")
open(out, "w", encoding="utf-8").write("\n".join(L) + "\n")
print("PLAN.md", round(os.path.getsize(out) / 1024, 1), "KB,", len(L), "lines")
