# Paper check (HANDOVER.md, open issue 4)

The guided-reading notes of Modules 01–05 point into the papers by section, figure, table, equation,
proposition and algorithm number, and some name sections. The writers took these from memory
(`notes/task-reports/`, search "memory"). Check each against the paper itself before publishing.
Search snippets are not enough: open the paper.

The hosts below must be allowed by the session's network policy (Custom network access, Allowed
domains): `arxiv.org`, `openaccess.thecvf.com`, `proceedings.mlr.press`, `proceedings.neurips.cc`,
`openreview.net`.

## What to check

In the `{#reading}` section of each `src/en/module_NN/40-practice.md`: every numbered pointer, every
section, figure or table named by its content, every claim about what a paper shows or says, and the
citation line. Where the Chinese part exists (`src/zh/module_01/40-practice.md`,
`src/zh/module_02/40-practice.md`), make the same correction there. The concept text also cites
papers; check a pointer there when it names a section, figure or table.

| Module | Paper | Source | Pointers to check |
|---|---|---|---|
| 01 | Belkin et al. 2019, PNAS | arXiv:1812.11118 | Figure 1; the random-Fourier-features section and its figure |
| 01 | Kapoor and Narayanan 2023, *Patterns* | arXiv:2207.07048 | the leakage taxonomy, the civil-war case study, model info sheets |
| 01 | Domingos 2012, CACM | the author's page, or a library copy | section names; the dartboard figure |
| 02 | Rumelhart, Hinton and Williams 1986, *Nature* | the journal | notation ($x_j$, $y_j$, $E$), the family-tree task; equation numbers are deliberately not given |
| 02 | Glorot and Bengio 2010, AISTATS | proceedings.mlr.press, v9 | Sections 1, 3 and 4; the saturation figures |
| 02 | Loshchilov and Hutter 2019, ICLR | arXiv:1711.05101 | Sections 1 and 2, Proposition 2, Algorithm 2, the experiments section |
| 03 | He et al. 2016, CVPR | openaccess.thecvf.com, arXiv:1512.03385 | Section 1 and Figure 1; Sections 3.1–3.3; Sections 4.1–4.2; Tables 1, 2, 3 and 6; Figures 4–6; Figure 5 (right); FLOPs for ResNet-18 |
| 03 | Ronneberger et al. 2015, MICCAI | arXiv:1505.04597 | Sections 1–4; Figures 1–3; Equation 2; sizes 572 to 388 |
| 04 | Pascanu, Mikolov and Bengio 2013, ICML | proceedings.mlr.press, v28; arXiv:1211.5063 | the dynamical-systems view, clipping and the threshold advice |
| 04 | Bahdanau, Cho and Bengio 2015, ICLR | arXiv:1409.0473 | the alignment model $a(\mathbf{s}_{i-1}, \mathbf{h}_j)$, the decoder step |
| 04 | Gu and Dao 2023 | arXiv:2312.00752 | the link between $\Delta$ and recurrent gates |
| 05 | Ho, Jain and Abbeel 2020, NeurIPS | arXiv:2006.11239 | $T$, the $\beta$ schedule, the simplified objective and the authors' reason for it |
| 05 | Kipf and Welling 2017, ICLR | arXiv:1609.02907 | the two approximations, the propagation rule |
| 05 | Raissi, Perdikaris and Karniadakis 2019, JCP | the journal | forward and inverse problems, accuracy and cost claims |
| 06 | Shazeer 2020, "GLU variants improve Transformer" | arXiv:2002.05202 | the quotation in `src/en/module_06/11-concepts-b.md` ("no explanation as to why these architectures seem to work"): match it word for word, or paraphrase it |

Record each paper's result in `notes/task-reports/paper-check.json`: what was confirmed, what was
corrected (file and line), and anything that could not be checked.
