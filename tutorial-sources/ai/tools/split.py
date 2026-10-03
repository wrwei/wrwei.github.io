"""Split each module's plan into writer parts, in page order. Prints JSON for the writing workflow.

  labpy.sh tools/split.py            all modules with a plan
  labpy.sh tools/split.py 3 7        just these
"""
import json
import math
import os
import sys

ROOT = os.environ.get("AIS_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES = {
    1: "01-machine-learning-foundations.md", 2: "02-neural-networks.md", 3: "03-convolutional-networks.md",
    4: "04-recurrent-networks.md", 5: "05-other-networks.md", 6: "06-transformer.md",
    7: "07-large-language-models.md", 8: "08-llm-pretraining.md", 9: "09-llm-post-training.md",
    10: "10-inference-and-serving.md",
}


def split_sections(secs, max_words=5500):
    total = sum(s["target_words"] for s in secs)
    k = max(2, min(4, math.ceil(total / max_words)))
    goal = total / k
    groups, cur, acc = [], [], 0
    for i, s in enumerate(secs):
        remaining_groups = k - len(groups)
        remaining_secs = len(secs) - i
        if cur and (acc + s["target_words"] / 2 > goal) and remaining_groups > 1 and remaining_secs >= remaining_groups - 1:
            groups.append(cur)
            cur, acc = [], 0
        cur.append(s)
        acc += s["target_words"]
    groups.append(cur)
    return groups


def split_labs(labs):
    n = len(labs)
    if n <= 3:
        return [labs]
    first = math.ceil(n / 2)
    return [labs[:first], labs[first:]]


def module_parts(n):
    with open(os.path.join(ROOT, "plan", f"module_{n:02d}.json"), encoding="utf-8") as fh:
        plan = json.load(fh)
    parts = []
    groups = split_sections(plan["sections"])
    for gi, g in enumerate(groups):
        last = gi == len(groups) - 1
        parts.append({
            "part": f"1{gi}-concepts-{'abcd'[gi]}.md", "kind": "concepts",
            "ids": [s["id"] for s in g], "titles": [s["title"] for s in g],
            "words": sum(s["target_words"] for s in g), "includes_wrong": last,
        })
    for li, g in enumerate(split_labs(plan["labs"])):
        parts.append({
            "part": f"2{li}-labs-{'ab'[li]}.md", "kind": "labs",
            "ids": [l["id"] for l in g], "titles": [l["title"] for l in g],
            "minutes": sum(l["minutes"] for l in g),
        })
    parts.append({"part": "30-exercises.md", "kind": "exercises", "ids": ["exercises"],
                  "titles": [f"{len(plan['exercises'])} exercises"]})
    parts.append({"part": "40-practice.md", "kind": "practice", "ids": ["quiz", "reading", "summary", "refs"],
                  "titles": ["quiz", "guided reading", "summary", "references"]})
    return {"n": n, "title": plan["title"], "file": SOURCES[n], "parts": parts}


def main():
    mods = [int(a) for a in sys.argv[1:]] or [n for n in range(1, 11)
                                                if os.path.exists(os.path.join(ROOT, "plan", f"module_{n:02d}.json"))]
    print(json.dumps({"modules": [module_parts(n) for n in mods]}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
