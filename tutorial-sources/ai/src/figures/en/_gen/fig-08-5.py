"""Ideal LSH curves and measured Lab 1 bins. Usage: python ... en|zh."""
import json
import re
import sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'src/figures'))
import figstyle as fs
LANG = sys.argv[1] if len(sys.argv) > 1 else 'en'
assert LANG in ('en', 'zh')
def t(en, zh):
    return zh if LANG == 'zh' else en

fig, ax = fs.figure(width=10, height=4.5, lang=LANG)
s = np.linspace(0, 1, 501)
for (b,r),colour in zip([(16,8),(14,8),(32,4),(8,16)],fs.SERIES):
    ax.plot(s, 1-(1-s**r)**b, color=colour, label=f'b = {b}, r = {r}')
    threshold=(1/b)**(1/r)
    ax.plot([threshold,threshold],[0,.06],color=colour)
metrics=json.loads((ROOT/'labs/module_08/lab1-metrics.json').read_text(encoding='utf8'))
bins=metrics['detection_bins']
ax.scatter([v['mean_j'] for v in bins],[v['empirical'] for v in bins],
           marker='x',color=fs.NAVY,s=40,zorder=5,
           label=t('Lab 1: 600 constructed pairs','实验 1：600 个构造的文档对'))
ax.set(xlabel=t('True five-word-shingle Jaccard s','真实的五词片段 Jaccard 相似度 s'),
       ylabel=t('Candidate probability / observed fraction','候选概率 / 实测比例'),
       xlim=(0,1),ylim=(-.02,1.05))
ax.legend(loc='upper left',fontsize=10)
path=Path(fs.save(fig,'fig-08-5',lang=LANG))
svg=path.read_text(encoding='utf8').replace('width="720pt"','width="720"')
svg=re.sub(r'height="([\d.]+)pt"',r'height="\1"',svg,count=1)
path.write_text(svg,encoding='utf8')
