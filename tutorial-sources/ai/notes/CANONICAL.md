# CANONICAL — series-wide decisions from the cross-module review

These decisions were applied to every plan. Reviewers check the written text against them.

## Case-Study Model

settle on one configuration. The plans currently use four. M07 has L 36, d_ff 15,360, V 152,064, N = 9,550,729,216. M08 has L 38, d_ff 14,336, V 152,064, N = 9,533,968,384. M09 has L 36, d_ff 14,336, V 152,064, N = 9,097,744,384 ('9.1B'). M10 has L 36, d_ff 14,336, V 128,000, N = 8.90e9. Use M07's configuration everywhere, for three reasons: M07 introduces the case study, its writer notes fix the numbers, and M10 already uses M07's 5.5 GB file and 147,456 B per token. The configuration is L = 36, d = 4,096, 32 query heads and 8 KV heads of 128, SwiGLU d_ff = 15,360, V = 152,064, untied embeddings, bilingual English-Chinese BPE. Reference values: per layer 230,694,912 (attention 41,943,040; FFN 188,743,680; norms 8,192); all blocks 8,305,016,832; embedding and output head 622,854,144 each; N = 9.55e9 ('9.5B'); N_matmul = N - V*d = 8.93e9; bf16 weights 19.10 GB. The 4-bit file is 5.53 GB, written '5.5 GB': 8.305e9 block weights at 4.125 bits (int4 plus one fp16 scale per 128 weights) give 4.28 GB, and the 8-bit embedding and head add 1.25 GB. The KV cache is 147,456 B per token in bf16, or 0.885 GB per 6,000 tokens.

## Flop And Memory Convention

M06 owns this; state it once in each module that uses it. Memory and Chinchilla's N use N_total. FLOPs follow M06's rule. Forward cost is 2*N_matmul per token plus 4*L*d*t at context t, which averages to 2*L*d*T over a causal sequence of length T. Training cost is three times the forward cost. For the case study, a forward pass costs 1.79e10 FLOPs per token. Training costs 5.36e10 per token plus 6*L*T*d, which is 7.25e9 at T = 8,192 (+13.5%). 2*N_total (1.91e10) may be used only when labelled as a +7% estimate. Under this rule M10's prefill and simulator numbers move by less than 0.5% and can stay: the 4,000-token prefill is 7.61e13 FLOPs and TTFT stays 0.92 s.

## Derived Case-Study Numbers For M08 And M09, Recomputed For The Canonical Configuration. Model States At 16 B Per Parameter

152.8 GB. ZeRO over 8 GPUs: 52.5 GB (stage 1), 35.8 GB (stage 2) and 19.1 GB (stage 3) per GPU. Activations, with M08's formula of 12d + 4*n_kv*d_head + 6*d_ff bytes per token per layer (145,408 B): 42.9 GB per 8,192-token sequence; 3.61 GB with full checkpointing (2.42 GB of layer inputs plus 1.19 GB for one recomputed layer). LoRA on every linear layer adds 84,992*r parameters per layer: r = 16 gives 48,955,392 (0.51%, 0.78 GB of trainable state); r = 64 gives 195,821,568 (2.05%, 3.13 GB). QLoRA base: 4.28 GB of NF4 weights plus 2.49 GB of bf16 embeddings = 6.78 GB. M08's 2T-token pretraining plan: 6*N_matmul*D plus attention = 1.22e23 FLOPs, which is 44.0 days on 80 H100s at 4e14 FLOP/s. With 6*N_total and no attention it is 41.4 days; the text must say which.

## Case-Study Story

pick one path and call it hypothetical in every module. Today the modules disagree. M07 says the team 'adapts an open-weight ~9.5B model'. M08 calls it 'a 9.5B English-Chinese decoder whose pretraining this module plans'. M09 s14 starts from 'an ~9B open instruct model' and never mentions continued pretraining (CPT). M10 serves 'the fine-tuned model'. The path should be as follows. M07 picks an open-weight bilingual ~9.5B model that has base and instruct releases. M08 presents the 2T-token, 80-H100 plan as 'how such a base is made', then costs the team's own CPT (1.8B domain tokens plus 0.2B replay tokens, 1,907 steps) as the case-study decision. M09 starts SFT from the CPT checkpoint if M08's baselines showed CPT was needed, mixing in general instruction data and training the template tokens; otherwise it starts from the instruct release, and it says which. M10 serves the merged, quantised artifact. Use one name and one domain throughout: 'safety-case arguments' for the pressure-relief system of a reactor vessel (M07). Do not mix in M10's 'safety-assurance arguments', its HARA hazard table (an automotive term; use 'hazard log') or its insulin-pump lab prompt.

## Case-Study Workload

use one. M07 s14 defines 6,000 input tokens (with a 4,500-token stable prefix) and 1,000 output tokens 'for reuse in 08-10'. M10 sizes everything on 4,000 tokens in (a 3,000-token shared prefix plus 1,000) and 2,000 out. Adopt M10's version, because its labs, its widget and about 30 printed numbers depend on it, while M07 uses the workload only in s14. The canonical workload is 4,000 tokens in: a 3,000-token stable prefix (system prompt, schema and fixed reference text) plus 1,000 tokens of hazard-log entries and request. Output is 2,000 tokens. Keep M07's volume of 2,000 requests a day. Recompute M07 s14 to match.

## Glossary.Md

TRANSLATION.md requires it but the file does not exist. Seed it with these decisions, one Chinese term per English term:
- token stays 'token': 下一个 token 预测, 特殊 token, 首 token 时延, 每输出 token 时延, token 间时延, 每秒 token 数. Never 词元 (used in M07, M09, M10).
- KV cache stays English, never 键值缓存 (M06, M07, M10).
- LoRA and QLoRA stay English, not 低秩适配 or 量化低秩适配 (M09).
- logits stays English, not 逻辑值 (M01), which reads as 'Boolean value'.
- batch and mini-batch stay English; batch size is batch 大小. M08's 临界批量大小 becomes 临界 batch 大小, and M01's 小批量 becomes mini-batch.
- prompt is 提示词 everywhere: 系统提示词, 提示词注入, 提示词缓存. M07 has 提示缓存 and 提示注入.
- latent space is 潜在空间 and latent diffusion is 潜在扩散. M05 mixes in 潜空间.
- RMSNorm is 均方根归一化（RMSNorm）at first use.
- Compounds take an ASCII hyphen: 编码器-解码器, 偏差-方差权衡, 精确率-召回率曲线. M01 and M04 use en dashes.
- kernel has three senses: 核函数 for kernel methods (M01), 卷积核 for convolution (M03), and plain 'kernel' for GPU kernels (M06, M10).
- dilated convolution is 空洞卷积, not 膨胀（空洞）.
- inference is 推理; reasoning model is 推理模型（reasoning model）; statistical inference is 统计推断.
- contamination is 数据污染 (benchmark contamination 基准污染); decontamination is 去污染.
- reward hacking: choose one of 奖励投机 or 奖励劫持; the plans use both.
Already consistent, keep: 缩放定律, 校准, 自助法, 梯度裁剪, 预热, 灾难性遗忘, 计算最优, 过度训练, 混合专家, 分词器, 梯度消失/梯度爆炸, 微调, 注意力, 自注意力, 残差连接, 浮点运算次数（FLOPs）, 幻觉, 谄媚, 分组查询注意力, 投机解码, 预填充, 前缀缓存.

## Lab Numbering Must Follow The Order The Sessions Run The Labs. M07 Runs Labs 2, 1, 4, 5, 3, 6. M08 Runs 2, 3, 4, 1, 5. M10 Runs 1, 2, 5, 3, 4, 6. Renumber And Fix Every Cross-Reference, Such As 'Smollm2-135M From Lab 2', 'The Tokenizer Cached From Lab 1', 'Lab 5'S Simulator' And The Figure Captions.



## Downloads Outside The Brief List

- tiktoken cl100k_base (M07 Lab 1, optional), whose counts nevertheless feed s3, fig-07-4, e2 and e4.
- torchvision ResNet-18 weights (44.7 MB) and CIFAR-10 (about 170 MB) in M03.
- llama.cpp or Ollama with a 491 MB GGUF file (M10 Lab 6). It is called optional, but its 20 minutes are needed to reach 170 lab minutes (165 without it).
Make each a norun extension on which no main-text number depends, and replace M10 Lab 6 with a Python-only lab (see the M10 notes).

## Star Grades

★ means conceptual (about 5 minutes); calculations and derivations are ★★ (10-20 minutes). These calculations are graded ★:
- M01 e5, e11, e12, e15
- M02 e3, e6, e12
- M03 e1
- M04 e5
- M08 e3, e6, e10, e12, e13 (the most calculation-heavy module has only four ★★)
- M09 e2, e7, e9, e10, e12, e14
- M10 e7, e12, e14
Regrade each to ★★ at 10 minutes or strip out the arithmetic. Each module must stay within 100-130 exercise minutes and 15-20 exercises.

## Reading Blocks

these sessions read for more than about 40 minutes without an activity: M04 S1 (52) and S3 (49); M05 S1 (54) and S2 (43); M06 S1 (58); M07 S4 (47, with no lab in the session); M09 S1 (45); M10 S2 (47, as 13 + 34). Split each with an exercise, a check or the first steps of a lab.

## Derive Once, Recall Elsewhere In One Paragraph Plus A Link

- 6N/6ND is derived in M02 s3, M06 s11, M07 s4 and M08 s1. M06 owns it; M02 keeps only the argument that the backward pass costs about twice the forward.
- The attention-FLOP convention is stated only in M06.
- The Chinchilla allocation is derived in M07 s4 and again as a 'boxed derivation' in M08 s1. M07 owns it.
- The softmax Jacobian (M02 s3) is re-derived in M06 s2.
- M06 s5 repeats M02's RMSNorm/LayerNorm worked examples ((3,4) and (1,2,3,6)) and its activation table.
- ViT patch embedding has a 590,592-parameter worked example in both M03 s9 and M06 s8. The BRIEF allows M03 only a pointer.
- ECE is defined in M01 s7 and re-defined with worked examples in M07 s10 and M09 s10.
- M01 s10 owns SE, paired bootstrap and McNemar; M07 s12 and M09 s12 re-teach them.
- The abstention threshold lambda/(1+lambda) is derived in both M07 s10 and M09 s10.
- M07 s14's batch-throughput table overlaps M10 s2 and s5; M07 s8 (constrained decoding) overlaps M10 s10; M07 s9 (prompt caching) overlaps M10 s6.

## Exercises Must Not Reuse A Worked Example'S Numbers

- M07 e12 and M09 e12 are the same exercise: +1/-2/0 scoring, threshold 2/3, p = 0.6 means abstain.
- M10 e9 uses s9's p and q, which are also the widget's defaults.
- The c = 0.4 half of M10 e10 is s9's worked example.
- M10 e12 is s12's worked example.
- s13's second check gives away M10 e13.
Replacements are in the module notes.

## Notation And Units

the BRIEF fixes B as the batch. M07 writes the serving batch as lower-case b because Chinchilla's constant is called B; M10 uses B for the batch and b for bytes per value. Keep Chinchilla's A, B and E inside M07 s4 only, and use B for the batch everywhere else. Units also differ: M03 and M06 use KiB/MiB/GiB, while M07, M08 and M10 use decimal GB. State the convention once per module, and give both forms where a quantity recurs: for Llama-2-7B's cache, write '524,288 B (512 KiB)'; M06 says '512 KiB' and M10 says '524,288 B'. Shared hardware figures are assumptions and must be labelled where used: H100 SXM 989 TFLOP/s dense bf16, 3.35 TB/s, 80 GB; 4e14 FLOP/s sustained (40% MFU) in M07-M09; 50% prefill MFU in M10.

## Prices

the SPEC forbids '$' because of KaTeX. Write 'USD 2.50' and label every price 'an assumption, as of 2026'. '$' currently appears in M07 s14 and its writer notes, and in M10 s11, e14, e15, fig-10-16 and the widget text. Use one assumption per item across all modules. For the H100, use USD 2.50 per GPU-hour (M07); M10 e15 uses USD 4.00. For the hosted API, use USD 0.20 and 0.80 per million input and output tokens, with cached input at 10% (M07); M10 e14 uses USD 0.60 for output.

## Citations

give each paper the same year and venue in every module. Sharma et al. on sycophancy is '2023' in M09 s10's text but ICLR 2024 in M09's references and in M07. M07 cites Zhang et al. (GSM1k) as NeurIPS 2024 D&B but quotes the first preprint's 'up to 13%'; the published version (arXiv v4) reports drops of up to 8%.

## Public Site

the check passed. Outside generalised_refs.source_text, no plan contains platform names, file paths or internal identifiers (writer_notes mention them only as rules), and M07-M10 all present the case study as hypothetical. One thing to watch: the from_source fields of M02 s10, M04 s2, s3 and s11, and M08's writer notes quote 'Tutorial 0x'. The published text must say 'Module 0x'.

## Per-module notes (already applied to the plans)

### Module 01

- s11 is overloaded: 11 must-cover items, including the kernel-ridge derivation and 'an SVM in about a page', in 1,400 words (about 14 minutes). Raise it to about 1,800 words or move the kernel-ridge derivation into an optional box. s3 (10 items) and s12 (9 items plus 4 worked examples) are also tight: cut each to about 7 items or add about 200 words.
- s1 and the cross-module map say 'learned embeddings for categories are in Module 06', but M06 covers only token embeddings. Link M06's token-embedding section instead, and add one sentence here saying that an embedding table works the same way for any categorical feature.
- e5, e11, e12 and e15 are calculations graded ★. The exercises already total 125 minutes, so regrading all four to ★★ would exceed 130. Regrade at most one and strip the arithmetic from the rest, making them conceptual.
- Terms: logits stays 'logits' (逻辑值 reads as 'Boolean value'). mini-batch stays 'mini-batch' (小批量 breaks TRANSLATION's rule for batch). Write 偏差-方差权衡 and 精确率-召回率曲线 with an ASCII hyphen.
- This module owns ECE (s7) and SE, paired bootstrap and McNemar (s10). Keep the full definitions and worked numbers here so that M07 and M09 can replace their re-derivations with a one-line recall and a link.

### Module 02

- s3 derives 6N, which M06 s11 owns. Keep only the argument that the backward pass costs about twice the forward, and link M06 for the count.
- This module owns the softmax Jacobian (s3), the RMSNorm/LayerNorm worked examples (s10) and the activation table (s5). M06 repeats all three and should link back here; M02 needs no change for this.
- e3, e6 and e12 are calculations graded ★. The exercises are already at 130 minutes, so strip the arithmetic to make them conceptual, or regrade them and drop one other exercise to make room.
- Terms: write RMSNorm as 均方根归一化（RMSNorm）at first use, as M06 does.

### Module 03

- The prerequisite 'the training loop of Module 02, Section 10' should say Section 13. M02 s13 is 'A complete training loop'; s10 is normalisation layers.
- s13 cites 'Module 04's Exercise 3', which is the source's numbering. The TCN-versus-LSTM project is Module 04, Exercise 15 (e15).
- Lab 5's full mode trains two models at 3.3 minutes each on a desktop and 7-10 minutes each on a laptop. That is 14-20 minutes on a laptop, over the 15-minute cap. Cut the epochs or the image size so that FULL takes 15 minutes or less on a laptop and QUICK about 3 minutes.
- Lab 4's steps use seeds 0-2, but its expected numbers and s10 quote five seeds. Make them agree, using five seeds if the runtime allows.
- torchvision's ResNet-18 weights (44.7 MB) and CIFAR-10 (about 170 MB) are not on the BRIEF's download list. Make those cells norun extensions, and take no main-text number from them.
- s9's ViT patch-embedding worked example (590,592 parameters) belongs to M06 s8; the BRIEF gives M03 only a pointer. Cut it to two sentences and a link.
- The receptive-field widget's 'counts near 5.8 million' is 7^8 = 5,764,801, the total number of paths, not the count for any one cell. Say in the spec which quantity the readout shows.
- fig-03-21/22 and the ConvNeXt worked example say 'values copied from the paper's Figure 2'. List the step values in the outline after checking them against the paper, and make the figure's final bar agree with the text's 82.1% (ConvNeXt-T).
- e1 is a calculation graded ★. Regrade it to ★★ or make it conceptual.
- Terms: write 空洞 for dilation, not 膨胀（空洞）. 卷积核 is the convolution sense of 'kernel'; the glossary lists it beside M01's 核函数.

### Module 04

- S1 opens with 52 minutes of reading and S3 with 49. Put an exercise or the first lab steps inside each run.
- s13's worked example says 'Lab 5's ring of moduli [0.9, 0.999] gives half-lives from 6.7 to 543 steps'. With half-life = ln 2 / (-ln|lambda|), the ring's endpoints give 6.6 and 693 steps. The range 6.7-543 comes from the sampled moduli, 0.902-0.9987, that Lab 5 prints. Reword it to 'the sampled moduli (0.902-0.9987) give 6.7-543'.
- e5 is a calculation graded ★. Regrade it to ★★ or make it conceptual.
- Terms: write 编码器-解码器 with an ASCII hyphen, as M03 and M06 do, not with an en dash.

### Module 05

- e8(d)'s solution is wrong. x = (1,0,0,0) has no component on the lambda = 0.5 eigenvectors, so its error decays as (-0.25)^k. The relative errors for k = 1-4 are 0.306, 0.0765, 0.0191 and 0.0048, so the error falls below 1% at k = 4, not 'as 0.5^k, below 1% after 7 steps'. Either fix the answer or choose a generic x, such as a leaf's feature, for which 0.5^k holds.
- s8's check says '3.39^k (1.2e4 by k = 8)', but 3.39^8 = 1.75e4. The 1.2e4 is the explorer's measured largest feature. Give both numbers and say which is which.
- S1 reads for 54 minutes and S2 for 43 before any activity. Put a check or an exercise inside each run.
- s9's hand example uses omega0 = 2 rad/s, but Lab 4 uses 2*pi. Say so, or use one value.
- Terms: replace 潜空间 with 潜在空间 to match 潜在扩散.

### Module 06

- This module owns 6N/6ND (s11) and the attention-FLOP convention. State in one place: 4*L*d*t per token at context t; 2*L*d*T averaged over a causal sequence; times 3 for training; the input embedding excluded because it is a lookup. M02, M07, M08 and M10 can then link here.
- e13, and the s11 sentence it quotes, say attention 'adds about 16% at 4,096 tokens' for Llama-2-7B. Averaged over a causal sequence it adds 2*L*d*T = 1.07e9 FLOPs against 2N = 1.35e10, about 8%. The 16% holds only if the masked half is computed. Fix both, and the remark on utilisation that follows.
- s2 re-derives M02's softmax Jacobian, and s5 repeats M02's RMSNorm/LayerNorm worked examples ((3,4) and (1,2,3,6)) and its activation table. Recall them in one paragraph with a link, or use a new example sized to a transformer.
- This module owns ViT patch embedding (s8): keep the 590,592-parameter example here, and have M03 point to it.
- Lab 4 FULL runs about 2,300 steps at 246 ms each: about 9.4 minutes on the preparation machine and 14-15 minutes on a laptop, right at the cap. Cut it to about 1,500 steps, or make QUICK the default.
- S1 has a 58-minute reading run. Split it.
- Terms: write KV cache, not 键值缓存. Give Llama-2-7B's cache as '524,288 B (512 KiB)' so that it matches M10.

### Module 07

- Keep this module's configuration as the series' canonical one. Two changes are needed. First, replace '2N = 1.9e10 FLOPs per token' with M06's rule, 2*N_matmul = 1.79e10, or label 2N_total as a +7% estimate. Second, derive the 4-bit file explicitly so that M10 s7-s11 reproduce it: 8.305e9 block weights at 4.125 bits (int4 plus one fp16 scale per 128 weights) plus 8-bit embeddings = 5.53 GB, written 5.5 GB.
- Keep the framing 'adapts an open-weight ~9.5B model', but call the model bilingual English-Chinese, as M08 does. Add one sentence saying that M08 shows how such a base is pretrained and costs the team's continued pretraining.
- s14: switch to the series workload (4,000 tokens in with a 3,000-token stable prefix, 2,000 out, 2,000 requests a day) and recompute the cost tables. At this module's assumed prices the API costs USD 0.00186 per request: 3,000 cached input tokens at USD 0.02 per million, 1,000 input tokens at USD 0.20 per million and 2,000 output tokens at USD 0.80 per million. That is USD 3.72 a day.
- The sessions run the labs in the order 2, 1, 4, 5, 3, 6. Renumber them and fix references such as 'SmolLM2-135M from Lab 2'.
- tiktoken's cl100k_base (Lab 1, optional) is not on the BRIEF list, yet its token counts are used in s3, fig-07-4, e2 and e4. Compute those numbers with the allowed tokenizers (gpt2, SmolLM2, Qwen2.5), and keep cl100k only as a norun aside.
- S4 has no lab and a 47-minute reading run (15 + 17 + 15). Place e11 or e12 between the reading blocks.
- s10 says GSM1k showed 'accuracy drops of up to 13%' while citing the NeurIPS 2024 D&B paper. That version (arXiv v4) reports drops of up to 8%; 13% was the May 2024 preprint. Use 8%, here and in the writer notes.
- This module owns the abstention threshold lambda/(1+lambda) (s10) and e12. M09 e12 copies e12 and is the one to change. Replace the re-teaching with one-line recalls and links: M01 s7's ECE definition (in s10), M01 s10's SE, paired bootstrap and McNemar (in s12), and M06's 6N derivation (in s4).
- Keep this module to the single-stream decode bound and the price formula, and link M10 for the rest: s14's batch-throughput table duplicates M10 s2 and s5. Cut constrained decoding (s8) and prompt caching (s9) to one paragraph each, linking M10 s10 and s6.
- Notation: write the serving batch in s14 as B, as the BRIEF and M10 do. Keep Chinchilla's A, B and E inside s4, and say so once.
- Prices: write 'USD 2.50 per GPU-hour' and 'USD 0.20 / USD 0.80', not '$', and label each as an assumption, as of 2026.
- Terms: 下一个词元预测 → 下一个 token 预测; 词元，分词器 → token，分词器; 键值缓存 → KV cache; 提示缓存 and 提示注入 → 提示词缓存 and 提示词注入.

### Module 08

- Configuration: change L from 38 to 36 and d_ff from 14,336 to 15,360, which moves N from 9,533,968,384 to 9,550,729,216. The change touches:
- s5's parameter count and fig-08-7 (x38 becomes x36)
- s1's corrections
- the memory figures in s8 and s9
- s10's tensor-parallel traffic and pipeline layout (36 layers split evenly over 2, 3, 4, 6 or 9 stages)
- e9 and Lab 1's printed outputs
- any KV-cache figure (155,648 becomes 147,456 B per token)
- the defaults of the compute-budget-planner and memory-planner widgets (L = 38, N = 9.534e9)
The canonical values are in the global notes: 152.8 GB of model states; ZeRO-1/2/3 on 8 GPUs at 52.5, 35.8 and 19.1 GB; activations of 42.9 GB per 8,192-token sequence, or 3.61 GB with full checkpointing.
- Storyline: 'a 9.5B English-Chinese decoder whose pretraining this module plans' contradicts M07. Present the 2T-token, 80-H100 plan as how such a base is made. Make the case-study decision the continued pretraining (1.8B domain tokens plus 0.2B replay tokens, 1,907 steps), and cost it explicitly.
- The 41.2-day estimate uses 6N with N = 9.5e9 and leaves out attention. With the series convention (6*N_matmul*D + 6*L*T*d*D at T = 8,192) it is 1.22e23 FLOPs, or 44.0 days on 80 GPUs at 4e14 FLOP/s. With 6*N_total and no attention it is 41.4 days. Say which one the text uses.
- s1's 'boxed derivation' of the Chinchilla allocation repeats M07 s4, and its 6N derivation repeats M06 s11. Recall both results and link to them.
- e4's solution says r = 9 works with b = 12 or 13. b = 14 also works: k = 126 is within 128, P(0.85) = 0.975 and P(0.5) = 0.027.
- The sessions run the labs in the order 2, 3, 4, 1, 5. Renumber them and fix references such as 'the tokenizer cached from Lab 1'.
- Self-containment (SPEC): Labs 4 and 5 read m08_tok.json and m08_base.pt, which Lab 3 writes. In a fresh process, Lab 5 falls back to re-running Lab 3 with QUICK = True (about 3 minutes) plus its own 5 minutes, which breaks the 5-minute limit. Its expected values (2.84 and 6.98) come from the full base, so they will not reproduce. Train the tokenizer inside each lab (about 4 seconds) and a small fixed base inside Lab 5, and quote those numbers.
- e3, e6, e10, e12 and e13 are calculations graded ★, leaving the most calculation-heavy module with only four ★★. The exercises are at 120 minutes: regrade two to ★★ and strip the arithmetic from the others, or drop one exercise.
- Lab 3's cloze set: list all 24 items in the outline, including the harder ones, so that the lab and its expected accuracy can be reproduced.
- Terms: 临界批量大小 → 临界 batch 大小. Use the glossary's 数据污染 and 去污染 for contamination and decontamination.

### Module 09

- Configuration: change d_ff from 14,336 to 15,360, so N goes from 9.10e9 ('9.1B') to 9.55e9 ('9.5B'). The change touches s4, s6, s14, e4, e8, fig-09-6 and fig-09-9. Model states for full fine-tuning go from 9.1e9 x 16 B = 145.6 GB to 152.8 GB. LoRA on every linear layer adds 84,992*r parameters per layer: r = 16 gives 48,955,392 (0.51%) and r = 64 gives 195,821,568 (2.05%). The QLoRA base is 4.28 GB of NF4 weights plus 2.49 GB of bf16 embeddings = 6.78 GB.
- s14 starts from 'an ~9B open instruct model' and never mentions M08's continued pretraining. Say that SFT starts from the CPT checkpoint if M08's baseline showed CPT was needed, mixing in general instruction data and training the template tokens. Otherwise it starts from the instruct release.
- s1 compares 50M SFT tokens with '15T of current open 8-9B models'. Also give the case study's own figures: 2T pretraining tokens in M08's plan and 2B tokens of CPT.
- e12 copies M07 e12 (+1/-2/0 scoring, threshold 2/3, p = 0.6 means abstain). Change it, for example to a -3 penalty, which gives a threshold of 3/4, or make it a question about calibration after RLHF. In s10, replace the re-derivations with one-line recalls: lambda/(1+lambda) from M07 and ECE from M01. In s12, recall M01 s10's SE, paired bootstrap and McNemar the same way.
- e2, e7, e9, e10, e12 and e14 are calculations graded ★. Regrade them or strip the arithmetic, staying within 130 exercise minutes.
- S1 has a 45-minute reading run. Put a check or an exercise inside it.
- Citation: Sharma et al. on sycophancy is '2023' in s10's text but ICLR 2024 in the references and in M07. Use ICLR 2024 throughout.
- Terms: 特殊词元 → 特殊 token. 低秩适配 and 量化低秩适配 → LoRA and QLoRA, which TRANSLATION keeps in English.

### Module 10

- Configuration: the module uses L 36, d_ff 14,336, V 128,000, N = 8.90e9, which conflicts with M07. Switch to the canonical configuration: N = 9.55e9, of which 8.93e9 sits in matmuls.
Rewrite s11 step 1 as: attention 41.9M + FFN 188.7M = 230.7M per layer, times 36 = 8.305e9, plus 2 x 0.623e9 for the embedding and head. The file is then 8.305e9 x 4.125/8 = 4.28 GB (int4 with one fp16 scale per 128 weights) plus 1.25 GB of 8-bit embedding and head = 5.53 GB, still '5.5 GB'. Change step 1's '4.5 bits' and s13's provenance record ('group-32 scales') to group 128.
Use N_matmul in every FLOP formula: Lab 1's Model, the Lab 5 cost model, and the widget's TTFT and t_cmp. TTFT then stays 0.92 s.
What still changes:
- s1's '8.9e9-parameter' case introduction
- s7's last worked example: 8.305e9 block weights at 4.25 bits = 4.41 GB
- s8's precision table: bf16 19.1 GB leaves 2.4 GB of cache, so 2 sequences; int8 9.55 GB leaves 11.95 GB, so 13 sequences
- Lab 1 step 1 (5.53 GB, bf16 19.10 GB, int8 9.55 GB) and step 5 ('4 and 14' becomes '2 and 13')
- e7: 4.41 and 4.67 GB for the block weights
- the widget preset: '8.9B params' and '4.91 bits/weight, 5.47 GB' become a fixed 5.5 GB file, with defaults of 5.5 GB and 18.8 ms
- the writer notes
- Workload: this module's workload becomes the series workload. Use M07's volume of 2,000 requests a day in s11 step 7 to make the utilisation argument concrete. 2,000 requests x 3.0 s = 1.67 GPU-hours a day, 6.9% of one card. An always-on card at USD 1.00/h then costs USD 24 a day: USD 0.012 per request, or USD 6.00 per million output tokens, against USD 0.42 at full utilisation. Through the API at M07's assumed prices, the same traffic costs USD 3.72 a day.
- The decode bound has two definitions. s8's precision table uses weights-only bounds (56, 112 and 182 tokens/s), while s11, Lab 1 and the widget include the 0.74 GB mean cache (160 for the 4-bit file). Use the one with the cache everywhere: at canonical sizes, 50 (bf16), 97 (int8) and 160 (4-bit) tokens/s.
- '3.4-fold' should be '3.3-fold' (1.0/0.30 TB/s = 3.33; 160/48; 959/288). It appears in Lab 1's expected observations, the widget's defaults text and the generalised_refs replacement.
- Speculative decoding:
- s9 says the formula predicts 1.09x with the measured c = 0.49 and v = 1.6. In fact E/(gamma*c + v) = 3.82/3.56 = 1.07x. The measured 1.22x at gamma = 4 is therefore 14% above prediction; say so instead of 'the formula predicts this'.
- Lab 4 step 2 measures v only for 5 tokens. Measure it for gamma + 1 = 3, 5 and 7.
- The predicted tokens per iteration (2.63, 3.82, 4.84) need a separate alpha-hat for each gamma (about 0.871, 0.865, 0.874). A single 0.87 gives 2.63, 3.86 and 4.79. Print alpha-hat per gamma to three decimals.
- Lab 4 step 3 specifies 4 prompts x 48 tokens, but step 5, s9's worked example and the writer notes quote 5 prompts x 64 tokens. Pick one and requote all four places.
- Lab 1: step 7 times an 8,192 x 8,192 matrix but quotes preparation values for 4,096 x 4,096 (5.3 ms, i.e. 12.6 GB/s for 67 MB). Requote it for 8,192, about 21 ms at the same bandwidth. Step 8 says Lab 4's measured steps were 1.5-2 times slower than the bandwidth bound. At 12.6 GB/s the bounds are 42.7 ms (538 MB) and 114.9 ms (1,447 MB), against Lab 4's measured 57 and 116 ms, i.e. 1.3x and 1.0x. Correct the claim.
- Lab 5: the printed iteration costs depend on the chunk's cached prefix, which the step does not give. A 512-token chunk with 17 decodes costs 116 ms with no cached prefix and 124 ms after about 2,000 cached tokens; the 128-token chunk costs 32 or 34 ms. State the prefix. Also, static batching of up to 16 can overflow the 16 GB cache: the worst case is 16 x 10,000 tokens x 147,456 B = 23.6 GB. Say whether the simulator checks memory.
- Costs under the SLO disagree. s11 step 8 gives USD 0.77 per million output tokens at 0.20 requests/s and USD 1.00/h, assuming a 1,800-token mean output. e15(a) gives USD 0.72, from 384 tokens/s, i.e. 1,920 tokens per request. Take both from the lab's printed throughput. In e15(c), 2.2 requests/s is 7,920 an hour, not 7,800. Also say in s11 that Lab 5's output lengths are lognormal (median 1,500, mean about 1,800), while s11 sizes for 2,000.
- Lab 6 needs llama.cpp or Ollama and a 491 MB GGUF file, both outside the BRIEF, yet the lab budget depends on its 20 minutes and s11 and s13 rely on it. Replace it with a required lab that uses only Python. The lab runs batched greedy generation with SmolLM2-135M at B = 1, 2, 4, 8 and 16, with left padding and a DynamicCache. It measures the step time and the aggregate and per-sequence tokens/s, and compares them with Lab 1's CPU roofline; this is the source's Exercise 2, done on a CPU. It also runs the determinism test: the same prompt alone and inside a batch of 8 at temperature 0, printing the maximum logit difference and the top-2 gap. Keep llama.cpp and vLLM as norun extensions.
- The sessions run the labs in the order 1, 2, 5, 3, 4, 6, with the simulator in S2. Renumber: the simulator becomes Lab 3, quantisation Lab 4 and speculative decoding Lab 5. Fix 'Lab 5's simulator' (s11, s12, e15), 'reused in Labs 3 and 4', and the figure captions.
- Exercises whose answers are already in the text:
- e9: use, for example, p = (0.55, 0.25, 0.15, 0.05) and q = (0.30, 0.40, 0.10, 0.20). Then beta = 0.70 and the residual is (5/6, 0, 1/6, 0).
- e10: use alpha = 0.75 with c = 0.1 and c = 0.3. The best gamma is 5 (2.19x) and 2 (1.45x) respectively.
- e12: keep only the question about which SLO to set.
- e13: replace s13's second check, which gives e13 away.
- Grades: e14 is a calculation, so make it ★★ at 10 minutes. Make e7 conceptual by asking only which scheme is more accurate (s7 already shows the bits-per-weight arithmetic), and keep e12 conceptual as above. That gives 7 ★, 7 ★★ and 1 ★★★: 130 minutes.
- Prices: write 'USD', not '$', throughout s11, e14, e15, fig-10-16 and the widget text, and label each price as an assumption. Use M07's assumed prices. e15's H100 at USD 2.50/h costs USD 0.20 per million output tokens, and the conclusion is unchanged. In e14 the hosted output price becomes USD 0.80 per million, so the break-even utilisation is u = 0.80/(2.4 x 0.80) = 42%.
- Terms: 首词元时延, 每输出词元时延, 词元间时延 and 每秒词元数 → 首 token 时延, 每输出 token 时延, token 间时延 and 每秒 token 数. 键值缓存 → KV cache.
- S2 reads for 47 minutes back to back (13 + 34). Move an exercise between the two blocks; S3 (110 minutes) has room to absorb it.
- Case-study domain: s11 and the generalised refs draft 'a 20-entry hazard table from a hazard analysis and risk assessment', and Lab 6 uses an insulin pump. Use 'a 20-entry hazard log for the pressure-relief system', as in M07.
- Paper 3 asks 'why is the smallest draft not always the best?'. In Leviathan et al.'s Table 2, T5-small, the smallest neural draft, gives the largest speed-up in every row. The evidence the question needs is Section 4.2: the bigram draft, with c = 0 and alpha = 0.2, yields only 1.25x. Reword the question to point there.

## Module 09 arithmetic audit (4 October 2026)

Keep earlier two-decimal figures as estimates, but avoid deriving three-decimal precision from
their rounded inputs. For the canonical configuration, checkpointed activations from the stated
formula are 3.60710144 GB (2.415919104 GB stored inputs + 1.191182336 GB one-layer workspace).
The seven linear matrices total 8,304,721,920 parameters; block norms and final norm add 299,008.
At 4.127 bits per linear weight with bf16 norms and both large tables, the QLoRA base estimate is
6.77621301248 GB. Module 09 uses 3.607 and 6.776 in its three-decimal illustrations. Temporary
buffers, kernels, allocator effects and unchunked logits remain outside these estimates.
The illustrative serving format is a separate estimate: 4-bit block weights plus one fp16 scale
per 128 weights, and 8-bit tables, about 5.53 GB before packaging. Do not confuse it with QLoRA's
bf16-table training storage or uniform four-bit storage of every tensor.

## Module 10 arithmetic and measurement audit (5 October 2026)

The serving file now separates the seven linear matrices (8,304,721,920 weights at
4.125 bits), all norms (299,008 at bf16) and both tables (622,854,144 each at eight bits).
Its ideal size is 5.528428544 GB before table scales, headers and alignment; use the
transparent rounded 5.5 GB convention in traffic/capacity calculations. This refines
the earlier 8.305B rounded block estimate without changing the two-decimal 5.53 GB result.

The bf16 cache remains 147,456 B/token, or 144 KiB. A conservative 24 decimal GB device
with 2.5 GB assumed runtime memory leaves 16 GB and admits eighteen 6,000-token requests.
At mean context 5,000 the full-batch traffic step is 18.77104 ms, giving 958.9 aggregate
decode tokens/s before prefill interference. Cold/warm prefill bounds are 0.923/0.241 s
at assumed 50% MFU. The simple prefill-inclusive full-load accounting gives about
1,196 requests/hour and 2.39M output tokens/hour, rounded to 1,200/2.4M; saturated
request latency is approximately 54–55 s, versus about 13.4 s at low load.

All six labs were run sequentially on CPU. Lab 3 is a documented hybrid cost model,
with unchecked static memory, actual-use cache admission, explicit preemption and
256-position prefill chunks; it does not implement physical paging or benchmark an engine.
Its final reference SLO search gives nominal 0.244 requests/s, realised 0.274 in 300
seeded arrivals, 466.3 output tokens/s and assumed USD 0.596/million. Report costs from
actual output throughput, not nominal rate times an assumed output length. Pooled p99
ITL is distinct from a per-request maximum-gap guarantee. All prices, GPU efficiencies,
power figures and hardware serving capacities are labelled assumptions or modelled bounds.
