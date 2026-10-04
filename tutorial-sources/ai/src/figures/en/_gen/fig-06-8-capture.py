"""Capture measured head maps by executing Lab 6's first four code blocks.

Run from the series root with the lab environment. This repeats the two-layer
training to retain arrays that the lab ordinarily only plots; it does not train
the one-layer control or change the Markdown's output fences.
"""
import json
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[4]
source = (ROOT / "src/en/module_06/21-labs-b.md").read_text(encoding="utf-8")
lab = source.split("## Lab 6", 1)[1]
blocks = re.findall(r"```python\n(.*?)\n```", lab, re.S)
namespace = {}
plt.show = lambda: plt.close("all")
for block in blocks[:4]:
    exec(compile(block, "module_06_lab6", "exec"), namespace)
data = {
    "segment_length": int(namespace["segments"][0]),
    "previous_head": namespace["previous_head"],
    "induction_head": namespace["induction_head"],
    "maps": [namespace["maps"][layer][0, head].tolist()
             for layer, head in ((0, namespace["previous_head"]),
                                 (1, namespace["induction_head"]))],
}
(ROOT / "labs/module_06/lab6-head-maps.json").write_text(
    json.dumps(data, indent=2), encoding="utf-8")
