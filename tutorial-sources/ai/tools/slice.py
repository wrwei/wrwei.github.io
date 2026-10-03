"""Write one small plan file per writer part: the module context plus only that part's entries."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
split = json.load(open(os.path.join(ROOT, "notes", "split.json"), encoding="utf-8"))
for m in split["modules"]:
    n = m["n"]
    plan = json.load(open(os.path.join(ROOT, "plan", f"module_{n:02d}.json"), encoding="utf-8"))
    base = {
        "module": n, "title": plan["title"], "lead": plan["lead"],
        "writer_notes": plan.get("writer_notes", ""), "generalised_refs": plan.get("generalised_refs", []),
        "terms": plan.get("terms", []),
        "all_sections": [{k: s[k] for k in ("id", "title", "minutes", "target_words")} for s in plan["sections"]],
        "all_labs": [{k: l[k] for k in ("id", "title", "minutes")} for l in plan["labs"]],
        "all_figures": [f["id"] for s in plan["sections"] for f in s.get("figures", [])],
        "widgets": plan.get("widgets", []),
    }
    os.makedirs(os.path.join(ROOT, "plan", "slices", f"module_{n:02d}"), exist_ok=True)
    for p in m["parts"]:
        mine = {}
        if p["kind"] == "concepts":
            mine["sections"] = [s for s in plan["sections"] if s["id"] in p["ids"]]
            if p.get("includes_wrong"):
                mine["what_goes_wrong"] = plan.get("what_goes_wrong", [])
            mine["widgets"] = [w for w in plan.get("widgets", []) if w.get("section") in p["ids"]]
        elif p["kind"] == "labs":
            mine["labs"] = [l for l in plan["labs"] if l["id"] in p["ids"]]
        elif p["kind"] == "exercises":
            mine["exercises"] = plan["exercises"]
        else:
            mine.update(quiz=plan["quiz"], papers=plan["papers"], references=plan.get("references", []),
                        outcomes=plan.get("outcomes", []))
        out = dict(base, part=p["part"], kind=p["kind"], mine=mine)
        if p["kind"] != "concepts":
            out.pop("widgets", None)
        path = os.path.join(ROOT, "plan", "slices", f"module_{n:02d}", p["part"].replace(".md", ".json"))
        json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
sizes = []
for d, _, fs in os.walk(os.path.join(ROOT, "plan", "slices")):
    for f in fs:
        sizes.append(os.path.getsize(os.path.join(d, f)))
print(len(sizes), "slices; KB min/avg/max:", min(sizes)//1024, sum(sizes)//len(sizes)//1024, max(sizes)//1024)
