## Self-check quiz {#quiz}

Choose one answer for each question. Revisit the relevant concept section after a mistake.

```quiz
? For a batch of B sequences of length T with h heads of width d_k, what is the shape of the attention-weight tensor?
- [ ] (B, T, d)
- [ ] (B, h, T, d_k)
- [x] (B, h, T, T)
- [ ] (B, T, T, h)
> Each head scores every query position against every key position, giving a T x T matrix per head per sequence: (B, h, T, T). (B, h, T, d_k) is the shape of q, k, v and the per-head output; (B, T, d) is the shape entering and leaving the layer; (B, T, T, h) is a legal layout but not the one the code produces.

? Why are the scores divided by sqrt(d_k)?
- [x] To keep the scores at roughly unit variance, so the softmax does not saturate and its gradient does not vanish at initialisation
- [ ] To make each row of attention weights sum to one
- [ ] To reduce the number of FLOPs in Q K^T
- [ ] To make attention independent of the sequence length
> With independent unit-variance entries, q.k has variance d_k; dividing by sqrt(d_k) restores variance 1. The softmax already makes rows sum to one, the division adds FLOPs rather than removing them, and it has nothing to do with T.

? Under a causal mask, what is the attention weight of position 3 on position 5?
- [ ] A small positive number that training drives towards zero
- [x] Exactly zero
- [ ] Equal to the weight of position 5 on position 3
- [ ] 1/T
> The score is set to -inf before the softmax, and exp(-inf) = 0 exactly. Nothing is learned about it; the future is structurally invisible. Attention is not symmetric, and 1/T is the uniform weight without a mask.

? An unmasked transformer layer with no positional encoding receives a sentence, and then the same sentence with its tokens shuffled. How do the two sets of output vectors compare?
- [ ] Identical, in the same order
- [ ] Entirely different
- [x] The same vectors, shuffled in the same way as the input
- [ ] They differ only by a scale factor
> Self-attention without position is permutation-equivariant: Attention(PX) = P Attention(X). The model sees a set, which is why order must be injected. The outputs are not in the original order, nor different vectors.

? Which tensors does RoPE rotate?
- [ ] The token embeddings, once, at the input
- [ ] Queries, keys and values
- [ ] Only the attention output
- [x] Queries and keys, in every attention layer
> RoPE rotates q and k so that their dot product depends only on t - s; values are untouched, and the rotation is applied inside every layer. Adding a vector at the input is what sinusoidal and learned absolute encodings do.

? A decoder has L = 32 layers of width d = 4,096 with multi-head attention and an FFN of 8d^2 parameters. About how many parameters are in its layers, excluding embeddings?
- [ ] 0.5 billion
- [x] 6.4 billion
- [ ] 2.1 billion
- [ ] 12.9 billion
> 12 L d^2 = 12 x 32 x 4,096^2 = 6.44e9: 4d^2 for attention and 8d^2 for the FFN per layer. 2.1B counts only the attention (4 L d^2); 12.9B counts every layer twice; 0.5B would need a width of about 1,100 at the same depth.

? For a dense decoder at short context, with N_matmul parameters in its matrix multiplies, the forward pass costs about how many FLOPs per token, and a training step about how many per token?
- [x] 2 N_matmul and 6 N_matmul
- [ ] N_matmul and 3 N_matmul
- [ ] 2 N_matmul and 4 N_matmul
- [ ] 6 N_matmul and 18 N_matmul
> Each such weight takes part in one multiply-add per token in the forward pass (2 FLOPs); the backward pass computes two products of the same size per layer (gradients with respect to inputs and weights), so training costs three times the forward pass. At long context add attention, 4Ldt per token at context t (2LdT averaged over a causal sequence), also times three for training.

? Compared with multi-head attention, grouped-query attention with 32 query heads and 8 key-value heads reduces:
- [ ] The number of query heads to 8
- [ ] The FLOPs of Q K^T by a factor of 4
- [ ] The FFN width
- [x] The KV cache and the K and V projection weights by a factor of 4
> Groups of four query heads share one KV head, so K and V projections and the cache shrink four-fold. All 32 query heads remain and each still scores every key, so the FLOPs of Q K^T are unchanged; the FFN is unaffected.

? How does FlashAttention reduce attention's memory from O(T^2) to O(T)?
- [ ] By approximating the softmax with a low-rank kernel
- [x] By computing attention tile by tile with a running maximum and running sum, so the T x T matrix is never stored
- [ ] By restricting each query to a sliding window of keys
- [ ] By storing scores in 8-bit integers
> The online softmax lets each tile be folded into running statistics and an output accumulator, then discarded; the result is exact. Low-rank kernels and sliding windows change the function; quantising scores would reduce memory by a constant, not change its order.

? A character-level model with V = 46 reports a loss of 3.88 at step 0. What does this indicate?
- [ ] The model is broken: the loss at initialisation should be near zero
- [ ] The model has already learned the bigram statistics
- [x] The initial logits are nearly uniform, as they should be: ln 46 = 3.83
- [ ] The learning rate is too high
> A model that knows nothing should spread its probability evenly, giving a cross-entropy of log V; small random logits add a little (about sigma^2/2). The bigram entropy of that corpus is 1.72, so nothing has been learned yet; no training step has happened for the learning rate to matter.

? Which statement about pre-norm transformers is correct?
- [ ] The normalisation is applied after the residual addition
- [ ] They make residual connections unnecessary
- [x] Their intermediate residual additions have a direct identity route, which simplifies gradient propagation
- [ ] They double the number of normalisation parameters
> Pre-norm uses x + F(Norm(x)); post-norm uses Norm(x + F(x)). The identity route improves gradient propagation but does not guarantee stable training at any learning rate. Both retain residual connections and the same number of norm parameters.

? Which is the best summary of why the decoder-only shape became the default for large language models?
- [x] Every token is a training target, one next-token objective covers every task written as text, and generation is the product
- [ ] It has the lowest cost per token of the three shapes at any size
- [ ] Encoders cannot be scaled beyond a billion parameters
- [ ] Cross-attention cannot be implemented with FlashAttention
> The reasons are training signal, generality and the product. Costs per token are similar across shapes at equal size; encoders scale fine; fused kernels handle cross-attention.

```

## Guided reading {#reading}

### Reading 1 {#paper1}

::: paper minutes=20
Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., Polosukhin, I. "Attention is all you need." NeurIPS, 2017. [Paper](https://arxiv.org/abs/1706.03762).

**Why read it.** The original; with this module behind you, every equation in its model section is familiar, and the differences from the modern block (post-norm, sinusoids, ReLU, encoder-decoder) become visible.

**What to read.** Read Section 3 (Model Architecture) in full and Section 4 (Why Self-Attention) with Table 1. Skim Section 5 (Training), stopping at the learning-rate formula with its warmup. Look only at Table 3's 'base' and 'big' rows in Section 6; skip the remaining results and the conclusion.

**Questions to answer while reading**

1. Find the footnote that justifies the 1/sqrt(d_k) scale. What assumption does it make, and is it the one used in Section 2 of this module?
2. Table 1 compares complexity per layer. For which sequence lengths n (relative to d) is a self-attention layer cheaper than a recurrent one?
3. Is the paper's block pre-norm or post-norm? Quote the sublayer equation and connect it to the warmup in the learning-rate formula.
4. Estimate the base model's parameters with this module's rules (d = 512, d_ff = 2,048, 6 encoder layers at 12d^2, 6 decoder layers at 16d^2, one shared embedding of about 37,000 x 512) and compare with the 65M of Table 3. (About 63M.)
5. Which of the three shapes of Section 7 is this model, and where do its cross-attention keys and values come from?
:::

### Reading 2 {#paper2}

::: paper minutes=13
Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., Liu, Y. "RoFormer: Enhanced transformer with rotary position embedding." arXiv:2104.09864, 2021. [Paper](https://arxiv.org/abs/2104.09864).

**Why read it.** The derivation of RoPE by its authors, in the complex form Section 6 used, with the long-term decay property that Lab 2 plotted.

**What to read.** Read the formulation of the goal (a score that depends only on the relative position), the 2D derivation with complex numbers, the general form with the block-diagonal rotation matrix, and the efficient element-wise implementation and the long-term decay property. Skip the combination with linear attention and the experiments.

**Questions to answer while reading**

1. The paper asks for functions f_q, f_k with <f_q(x_m, m), f_k(x_n, n)> = g(x_m, x_n, m - n). Write this in this module's notation (q, k, t, s).
2. Compare the paper's element-wise implementation with the module's rope() function. Which dimensions does each pair together, and why does the convention matter when weights are moved between implementations?
3. State the long-term decay property in your own words and compare it with Lab 2's curve for q = k = all ones.
:::

### Reading 3 {#paper3}

::: paper minutes=17
Dao, T., Fu, D. Y., Ermon, S., Rudra, A., Ré, C. "FlashAttention: Fast and memory-efficient exact attention with IO-awareness." NeurIPS, 2022. [Paper](https://arxiv.org/abs/2205.14135).

**Why read it.** The paper that made attention's memory linear in sequence length without approximation; its Algorithm 1 is Lab 3, and its background section is the clearest short account of why attention is memory-bound.

**What to read.** Read Section 2 (the GPU memory hierarchy, the standard implementation as Algorithm 0) and Section 3.1 (tiling, recomputation, Algorithm 1), and the statement of the IO-complexity theorem in Section 3.2 without its proof. Skim the block-sparse extension and look at one speed-up figure in the experiments.

**Questions to answer while reading**

1. Map Algorithm 1's updates of m and l onto the online-softmax recurrences of Section 10. Which line performs the rescaling by exp(m - m')?
2. The paper gives Theta(N d + N^2) HBM accesses for standard attention and Theta(N^2 d^2 / M) for FlashAttention, with M the SRAM size. Show that the ratio is about M / d^2 when N >> d, and evaluate it for d = 64 and M = 100 KB of fp16 values (about 51,200 elements): about 12.
3. Why does the backward pass recompute S and P instead of reading them, and why is that faster although it performs more FLOPs?
4. What bandwidths does the paper give for HBM and on-chip SRAM on an A100?
:::

## Summary {#summary}

- Attention computes a content-dependent weighted sum of visible value vectors.
- Query-key scores are scaled by the square root of head width to control their initial variance.
- A causal mask prevents every prediction from reading its successor token.
- Multi-head attention writes several independently projected value mixtures into a shared residual stream.
- Pre-norm leaves a direct residual route through the intermediate blocks.
- RoPE rotates queries and keys so that each pair contributes a relative-position score.
- Encoder, decoder and encoder-decoder models differ in their information boundaries and training objectives.
- Grouped queries retain query heads while reducing key/value projection width and cache storage.
- FlashAttention computes full attention in tiles using a running normaliser and output accumulator.
- Parameter storage and compute use different counts when an input table is lookup-only.
- Training matrix products cost approximately three times their forward counterparts.
- Initial-loss checks and prefix-only scoring detect errors that ordinary validation loss can miss.

The next module examines what the next-token objective means for language: tokenisation, perplexity, scaling, prompting, sampling and the limits of an LLM. Continue with [Module 07](module_07_EN.html).

## References {#refs}

- Vaswani, A. et al. "Attention is all you need." NeurIPS, 2017. The original transformer; guided reading 1.
- Bahdanau, D., Cho, K., Bengio, Y. "Neural machine translation by jointly learning to align and translate." ICLR, 2015. The attention the transformer kept (Module 04).
- Devlin, J. et al. "BERT: Pre-training of deep bidirectional transformers for language understanding." NAACL, 2019. Encoder-only, masked language modelling.
- Radford, A. et al. "Improving language understanding by generative pre-training." 2018; "Language models are unsupervised multitask learners." 2019. GPT and GPT-2: decoder-only, learned positions, the 1/sqrt(N) residual initialisation.
- Brown, T. et al. "Language models are few-shot learners." NeurIPS, 2020. GPT-3; in-context learning as the argument for one decoder-only model.
- Raffel, C. et al. "Exploring the limits of transfer learning with a unified text-to-text transformer." JMLR, 2020. T5; the controlled comparison of shapes and objectives.
- Wang, T. et al. "What language model architecture and pretraining objective work best for zero-shot generalization?" ICML, 2022. Causal decoders win for zero-shot use after self-supervised pretraining.
- Xiong, R. et al. "On layer normalization in the transformer architecture." ICML, 2020. Why pre-norm trains without warmup.
- Zhang, B., Sennrich, R. "Root mean square layer normalization." NeurIPS, 2019. RMSNorm.
- Shazeer, N. "GLU variants improve transformer." arXiv, 2020. SwiGLU and its relatives.
- Geva, M., Schuster, R., Berant, J., Levy, O. "Transformer feed-forward layers are key-value memories." EMNLP, 2021.
- Meng, K., Bau, D., Andonian, A., Belinkov, Y. "Locating and editing factual associations in GPT." NeurIPS, 2022. Factual recall localised in mid-layer FFNs.
- Elhage, N. et al. "A mathematical framework for transformer circuits." Transformer Circuits Thread, 2021. The residual stream, QK and OV circuits.
- Olsson, C. et al. "In-context learning and induction heads." Transformer Circuits Thread, 2022. Induction heads and their abrupt formation (Lab 6).
- Jain, S., Wallace, B. C. "Attention is not explanation." NAACL, 2019. Why attention maps need interventions behind them.
- Su, J. et al. "RoFormer: Enhanced transformer with rotary position embedding." arXiv, 2021. RoPE; guided reading 2.
- Press, O., Smith, N. A., Lewis, M. "Train short, test long: attention with linear biases enables input length extrapolation." ICLR, 2022. ALiBi.
- Haviv, A., Ram, O., Press, O., Izsak, P., Levy, O. "Transformer language models without positional encodings still learn positional information." Findings of EMNLP, 2022.
- Chen, S., Wong, S., Chen, L., Tian, Y. "Extending context window of large language models via positional interpolation." arXiv, 2023.
- Peng, B., Quesnelle, J., Fan, H., Shippole, E. "YaRN: Efficient context window extension of large language models." ICLR, 2024. Also traces the history of NTK-aware scaling.
- Shazeer, N. "Fast transformer decoding: One write-head is all you need." arXiv, 2019. Multi-query attention.
- Ainslie, J. et al. "GQA: Training generalized multi-query transformer models from multi-head checkpoints." EMNLP, 2023.
- Beltagy, I., Peters, M. E., Cohan, A. "Longformer: The long-document transformer." arXiv, 2020. Sliding-window plus global attention.
- Jiang, A. Q. et al. "Mistral 7B." arXiv, 2023. Sliding-window attention with GQA in an open model.
- Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. "Efficient streaming language models with attention sinks." ICLR, 2024.
- Milakov, M., Gimelshein, N. "Online normalizer calculation for softmax." arXiv, 2018. The online softmax.
- Dao, T., Fu, D. Y., Ermon, S., Rudra, A., Ré, C. "FlashAttention: Fast and memory-efficient exact attention with IO-awareness." NeurIPS, 2022. Guided reading 3.
- Dao, T. "FlashAttention-2: Faster attention with better parallelism and work partitioning." ICLR, 2024.
- Kaplan, J. et al. "Scaling laws for neural language models." arXiv, 2020. The per-token FLOP accounting used in Section 11.
- Touvron, H. et al. "LLaMA: Open and efficient foundation language models." arXiv, 2023. The reference decoder recipe; the 6.7B configuration.
- Touvron, H. et al. "Llama 2: Open foundation and fine-tuned chat models." arXiv, 2023. Training tokens and GPU-hours used in exercise e13.
- Grattafiori, A. et al. "The Llama 3 herd of models." arXiv, 2024. GQA with 8 KV heads; RoPE base 500,000.
- Dosovitskiy, A. et al. "An image is worth 16x16 words: Transformers for image recognition at scale." ICLR, 2021. The vision transformer.
- Touvron, H. et al. "Training data-efficient image transformers and distillation through attention." ICML, 2021. DeiT.
- Phuong, M., Hutter, M. "Formal algorithms for transformers." arXiv, 2022. Precise pseudocode for every variant in this module; a good companion to Section 12's code.
