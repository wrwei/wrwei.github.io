## Self-check quiz {#quiz}

Twelve questions, one correct answer each; attempt them without looking back, then read every explanation, including those of the options you rejected, because each wrong option is a mistake people really make.

```quiz
? Unrolled over $T$ steps, a recurrent network is equivalent to:
- [x] a $T$-layer feed-forward network whose layers share the same weights
- [ ] a single-layer network applied to the concatenated sequence
- [ ] a $T$-layer network with independent weights in every layer
- [ ] a convolution whose kernel is $T$ steps wide
> The same $\mathbf{W}_h$, $\mathbf{W}_x$ and $\mathbf{b}$ are applied at every step, so each step is a layer and all layers share their weights ([Section 2](#s2)). A single layer on the concatenated sequence would need a fixed length and would not reuse its weights across positions. Independent weights per layer describe a deep window network, with $T$ times the parameters. A convolution is equivalent only for linear time-invariant recurrences ([Section 13](#s13)), and then its kernel is $\mathbf{C}\mathbf{A}^k\mathbf{B}$, not an arbitrary filter.

? A linear RNN's recurrent matrix has eigenvalues 0.95 and 1.05. What happens to a gradient propagated 100 steps back from a generic starting vector?
- [ ] It vanishes, because the eigenvalues average to 1
- [ ] It stays about the same size
- [x] It grows about 130-fold and turns towards the eigenvector of 1.05
- [ ] It oscillates without growing
> The two eigen-components scale as $0.95^{100} = 0.0059$ and $1.05^{100} = 131.5$. The second dominates, so the gradient grows about 130-fold and aligns with its eigenvector ([Section 4](#s4)). Averaging eigenvalues means nothing here, because each component is multiplied by its own eigenvalue and the powers do not average. The size does not stay the same for the same reason. Oscillation without growth would need complex eigenvalues of modulus 1, and these are real.

? Global-norm gradient clipping with threshold $c$:
- [ ] sets every gradient component larger than $c$ to $c$
- [ ] adds noise of size $c$ to small gradients to stop them vanishing
- [ ] divides the learning rate by $c$ whenever the loss rises
- [x] rescales the whole gradient to norm $c$ when its norm exceeds $c$, keeping its direction
> Norm clipping bounds the step length and keeps the direction, which is why it helps at a cliff of the loss surface ([Section 4](#s4)). Setting components to $c$ is value clipping, which changes the direction. Adding noise to small gradients is not clipping and would not recover a lost signal. Dividing the learning rate is a schedule, not clipping. Clipping never enlarges a small gradient, so it does nothing for vanishing gradients.

? In an LSTM, the derivative of $\mathbf{c}_t$ with respect to $\mathbf{c}_{t-1}$ along the direct (cell) path is:
- [ ] $\mathbf{W}_f$, the forget gate's weight matrix
- [x] $\operatorname{diag}(\mathbf{f}_t)$
- [ ] $\operatorname{diag}(\mathbf{o}_t \odot \tanh'(\mathbf{c}_t))$
- [ ] $\operatorname{diag}(\mathbf{i}_t)$
> From $\mathbf{c}_t = \mathbf{f}_t \odot \mathbf{c}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{c}}_t$, differentiating the first term with respect to $\mathbf{c}_{t-1}$ gives $\operatorname{diag}(\mathbf{f}_t)$: a per-step gate value that the network can hold near 1 ([Section 5](#s5)). $\mathbf{W}_f$ enters only through the paths that go via $\mathbf{h}_{t-1}$, not the direct one. $\operatorname{diag}(\mathbf{o}_t \odot \tanh'(\mathbf{c}_t))$ is the derivative of $\mathbf{h}_t$ with respect to $\mathbf{c}_t$. $\operatorname{diag}(\mathbf{i}_t)$ multiplies the candidate, which does not contain $\mathbf{c}_{t-1}$ directly.

? How many parameters does PyTorch's `nn.LSTM(10, 20)` have?
- [x] 2,560
- [ ] 2,480
- [ ] 1,920
- [ ] 640
> Four gate blocks of $20 \times (10 + 20)$ give $4\cdot20\cdot30 = 2{,}400$ weights, and PyTorch's two bias vectors of $4\cdot20 = 80$ each add 160: 2,560. The value 2,480 is the count with one bias vector. 1,920 is `nn.GRU(10, 20)`, three blocks: $3\cdot20\cdot30 + 3\cdot20\cdot2 = 1{,}920$. 640 is a plain `nn.RNN(10, 20)`, one block: $20\cdot30 + 2\cdot20 = 640$.

? For which task is a bidirectional LSTM appropriate?
- [ ] Forecasting the next value of a bearing temperature in real time
- [ ] Streaming anomaly detection with a 10 ms latency budget
- [x] Labelling every second of a recorded test as normal or faulty after the test
- [ ] Generating text one character at a time
> A bidirectional network reads each position's future as well as its past, so only offline tasks, with the whole sequence available, may use it ([Section 6](#s6)). Forecasting, streaming detection and generation are all causal: at the moment of the decision the future does not exist, and a bidirectional model trained on them would be using information it can never have in service.

? A sequence-to-sequence model trained only with teacher forcing produces fluent first tokens and then drifts. The most likely cause is:
- [ ] a learning rate that was too high
- [ ] a bidirectional encoder
- [ ] a beam width that is too large
- [x] exposure bias: the decoder never conditioned on its own predictions during training
> With teacher forcing the decoder always saw the true previous tokens; at inference its own, sometimes wrong, tokens put it in states it never met in training, and errors compound ([Section 10](#s10)). A learning rate that is too high shows up as unstable or diverging training, not as fluent starts that drift at inference. A bidirectional encoder is normal and reads only the source. A large beam causes a bias towards short outputs, not this pattern.

? Beam search with beam width $k = 1$ is:
- [ ] exhaustive search over all sequences
- [x] greedy decoding
- [ ] sampling at temperature 1
- [ ] length-normalised search
> Keeping only the single best partial hypothesis at every step is exactly greedy decoding ([Section 10](#s10)). Exhaustive search keeps every hypothesis and is infeasible ($V^{20} = 10^{80}$ for a 10,000-token vocabulary and 20 tokens). Sampling is random, whereas beam search is deterministic. Length normalisation is a scoring choice that can be used with any $k$, including 1 and including exhaustive search.

? In Bahdanau attention, the weights $\alpha_{t,j}$ at decoder step $t$:
- [ ] are learned parameters, one per source position
- [ ] sum to 1 over decoder steps $t$
- [x] sum to 1 over source positions $j$ and are computed from $\mathbf{s}_{t-1}$ and each $\mathbf{h}_j$
- [ ] are fixed to the diagonal for monotonic tasks
> They are a softmax over $j$ of the scores $\mathbf{v}_a^\top\tanh(\mathbf{W}_a\mathbf{s}_{t-1} + \mathbf{U}_a\mathbf{h}_j)$, recomputed for every input and every step ([Section 11](#s11)). The parameters are $\mathbf{v}_a$, $\mathbf{W}_a$ and $\mathbf{U}_a$; the weights depend on the input, so they cannot be fixed per position. The normalisation is over the source positions at one step, not over steps. Nothing forces them onto the diagonal: Lab 4's alignment for digit reversal is the anti-diagonal.

? Which of these is not leakage when evaluating a forecaster?
- [ ] z-scoring with the mean and standard deviation of the whole series
- [ ] shuffling overlapping windows before a random 80/20 split
- [ ] choosing the number of epochs by the RMSE on the final test period
- [x] recomputing normalisation statistics from the training part of each walk-forward fold
> Per-fold statistics computed from the training part only are the correct procedure ([Section 8](#s8)). Whole-series statistics use the future. Shuffled overlapping windows put near-copies of every test window into the training set, so the model interpolates between memorised neighbours. Choosing epochs by the test period reuses the test set for model selection, so its error is no longer an honest estimate.

? A one-step LSTM forecaster that subtracts each window's last value monitors a sensor. A constant offset of $+0.8$ appears and stays for 100 samples. A residual-threshold detector will:
- [ ] alarm continuously for the 100 samples
- [x] alarm at the onset (and at the end) only, because the model re-centres on the new level within a step
- [ ] never alarm
- [ ] alarm only after 50 samples
> The inputs are taken relative to the last value, so after one step the shifted level is the new reference and the residuals return to normal. The change is visible only when it happens and when it ends ([Section 9](#s9) and Lab 3). It does not alarm continuously, because the residual is large only at the step. It does alarm at the onset, so "never" is wrong. Nothing in the model counts to 50; a delayed alarm would need a rule that accumulates evidence, which a single-step threshold lacks. A sustained offset needs a level check against an independent reference, or residuals from a model that does not re-centre.

? Why can an S4-style state-space layer be trained in parallel over time while an LSTM cannot?
- [x] Its recurrence is linear and time-invariant, so its output is a convolution of the input with the kernel $\mathbf{C}\bar{\mathbf{A}}^k\bar{\mathbf{B}}$, computable for all steps at once
- [ ] It has fewer parameters than an LSTM
- [ ] It uses attention internally
- [ ] It has no hidden state
> Linearity and time-invariance turn the unrolled map into a convolution, computed with the FFT ([Section 13](#s13)); time-varying linear recurrences such as Mamba's use an associative scan instead. An LSTM's gates depend nonlinearly on $\mathbf{h}_{t-1}$, which forces a serial loop. Parameter count does not decide whether steps can be computed together. A state-space layer contains no attention. It does have a hidden state, which it uses in recurrent mode at inference.
```

## Guided reading {#reading}

A paper is read in two passes, not one. The first pass takes five to ten minutes and is not reading in the usual sense. Read the title, abstract and introduction, the headings, every figure with its caption, and the conclusion. Then write down, in your own words, three things: what problem the paper attacks, what it claims to have done, and which figure or table is the evidence. If you cannot, the paper is not worth the second pass yet, or you lack a prerequisite; go back to it after the relevant section of this module. The second pass is slow and active. Read the sections named under **What to read**, with a pencil, and do the small computations the questions ask for: a bound, a shape, a parameter count. A number you have recomputed is one you understand. Skip proofs and appendices on a first reading, and note each step you did not follow instead of leaving it behind. The scheme is an adaptation of the three-pass method in Keshav's "How to read a paper" (2007).

The three papers cover the module's arc: why recurrent gradients misbehave and how clipping tames the explosion ([Section 4](#s4)), the attention that removed the encoder–decoder bottleneck ([Section 11](#s11)), and the selective state-space model that brought recurrence back ([Section 13](#s13)). Together they take 50 minutes. Section and figure numbers differ between versions of a paper, so the instructions below name the topic of each part; match them to the version you have.

::: paper minutes=20
Pascanu, R., Mikolov, T., Bengio, Y. "On the difficulty of training recurrent neural networks." *International Conference on Machine Learning (ICML)*, 2013.

**Why read it.** It is the clearest analysis of why recurrent gradients vanish and explode: the product of Jacobians, the view of the network as a dynamical system, and the geometry of the cliff in the loss surface. It is also the origin of gradient-norm clipping, which every recurrent and transformer training run still uses. The paper shows which of the claims of [Section 4](#s4) are sufficient conditions and which only necessary ones.

**What to read.** Read the introduction and the section on exploding and vanishing gradients in full: the mechanics, with the sufficient condition for vanishing and the necessary condition for exploding, then the dynamical-systems view and the geometric interpretation with the figure of the "wall". Then read the subsection on scaling down the gradients, which is the clipping algorithm. Skim the proposed regulariser for vanishing gradients and the experiments. Skip the proofs in the appendix.

**Questions to answer while reading.**

1. State the sufficient condition for vanishing gradients in terms of the largest singular value of $\mathbf{W}_{\text{rec}}$ and the bound $\gamma$ on the activation's derivative. What is $\gamma$ for tanh and for the logistic sigmoid?
2. Why is the corresponding condition for exploding gradients only necessary, not sufficient?
3. Describe the "wall" in the loss surface, and explain why rescaling the gradient's norm, rather than its components, helps when a step hits it.
4. How do the authors suggest choosing the clipping threshold, and how does that compare with the range of 1 to 5 given in [Section 7](#s7)?

**After reading.** Take the $2\times2$ matrix of the worked example in [Section 4](#s4), $\begin{pmatrix}0.8 & 0.3\\0.3 & 0.8\end{pmatrix}$, and decide with the paper's conditions whether tanh units guarantee vanishing (its largest singular value is 1.1, and $\gamma = 1$). Then say in two sentences why the answer is "not guaranteed", and what the example shows about the tanh derivative nonetheless.
:::

::: paper minutes=15
Bahdanau, D., Cho, K., Bengio, Y. "Neural machine translation by jointly learning to align and translate." *International Conference on Learning Representations (ICLR)*, 2015 (arXiv:1409.0473).

**Why read it.** It introduced attention as the fix for the encoder–decoder bottleneck. The idea, with the recurrence removed, became the transformer, so this is the paper in which the mechanism of [Module 06](module_06_EN.html) first appears, in its additive form.

**What to read.** Read the introduction, the background on the RNN encoder–decoder, and the section on learning to align and translate: the decoder with its alignment model, and the bidirectional encoder that produces the annotations. Look at the figure of translation quality against sentence length and at the alignment figures. Skip the experimental settings and most of the appendix, except the definition of the alignment model.

**Questions to answer while reading.**

1. What is an "annotation" $\mathbf{h}_j$, and why do the authors use a bidirectional RNN to compute it?
2. Write their alignment model $a(\mathbf{s}_{i-1}, \mathbf{h}_j)$ and map each symbol to the notation of [Section 11](#s11).
3. What does the figure of quality against sentence length show for the encoder–decoder without attention and with it? Compare with the digit-reversal accuracies of [Lab 4](#lab4).
4. Find an alignment in the figures that is not monotonic, and explain it from the word order of the two languages.

**After reading.** Rewrite the paper's decoder step in the shapes of [Section 11](#s11) (annotations of width $2H$, attention width $d_a$) and list which of the three matrices' products with the annotations can be computed once per source sentence. Then state the one change that turns the paper's score into Luong's dot score, and what that change removes.
:::

::: paper minutes=15
Gu, A., Dao, T. "Mamba: Linear-time sequence modeling with selective state spaces." arXiv:2312.00752, 2023.

**Why read it.** It made recurrence competitive again for language-scale sequence modelling by making a state-space model's parameters depend on the input. It is the clearest current example of the trade discussed in [Sections 12](#s12) and [13](#s13): constant-cost recurrence against attention's exact lookup.

**What to read.** Read the abstract and the introduction. Read the section on state-space models: the continuous system, discretisation, the recurrent and convolutional computations, and linear time-invariance. From the section on selective state-space models, read the motivation (selection as a means of compression, with the selective-copying and induction-head tasks) and the algorithm that contrasts the time-invariant model with the selective one. Skim the description of the hardware-aware scan. Skip the experiments, apart from one look at the synthetic-task results.

**Questions to answer while reading.**

1. The authors describe a trade-off between efficiency and effectiveness in terms of how much a model compresses its context into its state. State it, and place the transformer and an LTI state-space model at its two ends.
2. Which parameters become functions of the input in the selective model, and why does that rule out the convolutional mode?
3. In one sentence, how is the selective recurrence computed efficiently on a GPU?
4. The paper connects $\Delta$ to the gates of classical recurrent networks. State the connection and compare it with the GRU's update gate in [Section 6](#s6).

**After reading.** Using the zero-order-hold formula of [Section 13](#s13), compute $a = e^{-\Delta}$ for $\Delta = 0.01$ and $\Delta = 5$, and say which kind of token in the selective-copying task each value suits. Then write down one task for which the selective model's fixed-size state is a handicap against attention.
:::

## Summary {#summary}

- A recurrent network applies the same function $\mathbf{h}_t = \phi(\mathbf{W}_h\mathbf{h}_{t-1} + \mathbf{W}_x\mathbf{x}_t + \mathbf{b})$ at every step, which makes it a deep network with shared weights; a plain layer has $H(H + d_{\text{in}}) + H$ parameters, plus another $H$ in PyTorch's double-bias convention.
- Backpropagation through time is ordinary backpropagation on the unrolled network: the gradient with respect to a state is a product of Jacobians $\mathbf{J}_k = \operatorname{diag}(\phi'(\mathbf{z}_k))\mathbf{W}_h$, and the gradient of a shared weight is the sum of its contributions from every step; truncating the backward pass trades dependency range for memory, and finite differences check any implementation.
- Gradients vanish or explode geometrically with the lag, because a product of $n$ Jacobians scales like $\rho^n$: $0.9^{100} = 2.7\times10^{-5}$ and $1.1^{100} = 1.4\times10^{4}$; the tanh derivative makes vanishing worse, so even an orthogonal recurrent matrix loses gradient in practice.
- Clipping the global gradient norm (typically at 1 to 5) cures exploding gradients and nothing else; orthogonal or identity initialisation delays vanishing but does not remove it, and the structural fix is an additive path.
- The LSTM's cell state is updated additively, $\mathbf{c}_t = \mathbf{f}_t \odot \mathbf{c}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{c}}_t$, so along it the gradient is multiplied by the forget gate $\mathbf{f}_t$, a number the network can hold near 1; a forget bias of 5 gives a default half-life of about 103 steps against 1 step for a bias of 0.
- Parameter counts are mechanical: `nn.LSTM(1, 32)` has 4,480 parameters and `nn.GRU(1, 32)` has 3,360; the LSTM is the default, the GRU the choice when size or speed is tight, and a bidirectional network is legitimate only when the whole sequence is available offline.
- Training recurrent networks in practice needs padding, masking or packing of variable lengths, a clipped gradient, a sensible forget bias, and a debugging order that starts from a single small batch the model must be able to overfit.
- A forecast is only as good as its split and its baseline: split by time with walk-forward folds, compute every statistic on the training part, report naive, seasonal-naive and linear-autoregression errors next to the model's (or a scaled score such as MASE), and normalise per window when the level drifts, because a network does not extrapolate a level.
- A residual-based monitor sets its threshold on held-out normal data, because training residuals are optimistically small, and a $3\sigma$ test at 1 Hz would give about 233 false alarms a day if residuals were independent and Gaussian; each fault type (spike, changed noise, stuck sensor, sustained offset) needs its own detector.
- An encoder–decoder factorises $p(y \mid x)$ token by token, is trained with teacher forcing on true prefixes and decoded on its own predictions (exposure bias); beam search with width 1 is greedy decoding, wider beams find more probable sequences but favour short ones unless the score is length-normalised, and no search repairs a model that does not know the answer.
- A single summary vector is a bottleneck (in Lab 4, digit reversal falls from about 99% of strings right at length 4 to about 1% at length 12), and attention removes it: the decoder takes a softmax-weighted average of all encoder states, giving every output a one-step path to every input, and the weights form an alignment that is a diagnostic, not an explanation.
- The transformer replaced recurrence because a nonlinear recurrence needs $T$ dependent steps and has paths of length $O(T)$, while attention has one-step paths at quadratic cost; recurrence keeps a constant-size state (32.8 kB for a 4-layer LSTM of width 1,024 against 6.44 GB of key–value cache for a 24-layer transformer of width 2,048 at 32,768 tokens), and a linear time-invariant recurrence is a convolution that trains in parallel, with Mamba's input-dependent step turning it back into a gate.

[Module 05](module_05_EN.html) widens the view from sequences to the other network families worth knowing: autoencoders and VAEs, GANs, diffusion models, graph networks, physics-informed networks and contrastive learning, several of which return in the large models of later modules. [Module 06](module_06_EN.html) then takes the attention of [Section 11](#s11), removes the recurrence entirely and builds the transformer: the same query–key–value lookup, applied by every position to every other, with the scale factor $\sqrt{d_k}$ that [Section 11](#s11) motivated and the positional information that a recurrence supplied for free.

## References {#refs}

- Elman, J. L. "Finding structure in time." *Cognitive Science*, 1990. The simple recurrent network of Section 2.
- Werbos, P. J. "Backpropagation through time: what it does and how to do it." *Proceedings of the IEEE*, 1990. Backpropagation through time.
- Williams, R. J., Zipser, D. "A learning algorithm for continually running fully recurrent neural networks." *Neural Computation*, 1989. Real-time recurrent learning, the forward-mode alternative.
- Williams, R. J., Peng, J. "An efficient gradient-based algorithm for on-line training of recurrent network trajectories." *Neural Computation*, 1990. Truncated BPTT with separate update and backpropagation lengths.
- Hochreiter, S. "Untersuchungen zu dynamischen neuronalen Netzen." Diploma thesis, Technische Universität München, 1991. The first analysis of the vanishing gradient, in German.
- Bengio, Y., Simard, P., Frasconi, P. "Learning long-term dependencies with gradient descent is difficult." *IEEE Transactions on Neural Networks*, 1994. The vanishing-gradient problem for recurrent networks.
- Pascanu, R., Mikolov, T., Bengio, Y. "On the difficulty of training recurrent neural networks." *ICML*, 2013. The spectral conditions and gradient clipping (guided reading).
- Saxe, A. M., McClelland, J. L., Ganguli, S. "Exact solutions to the nonlinear dynamics of learning in deep linear neural networks." *ICLR*, 2014. Orthogonal initialisation.
- Le, Q. V., Jaitly, N., Hinton, G. E. "A simple way to initialize recurrent networks of rectified linear units." *arXiv*, 2015. Identity initialisation with ReLU.
- Arjovsky, M., Shah, A., Bengio, Y. "Unitary evolution recurrent neural networks." *ICML*, 2016. Norm-preserving recurrences.
- Hochreiter, S., Schmidhuber, J. "Long short-term memory." *Neural Computation*, 1997. The LSTM and the constant error carousel.
- Gers, F. A., Schmidhuber, J., Cummins, F. "Learning to forget: continual prediction with LSTM." *Neural Computation*, 2000. The forget gate.
- Greff, K. et al. "LSTM: a search space odyssey." *IEEE Transactions on Neural Networks and Learning Systems*, 2017. Eight variants compared.
- Jozefowicz, R., Zaremba, W., Sutskever, I. "An empirical exploration of recurrent network architectures." *ICML*, 2015. The forget-gate bias of 1.
- Tallec, C., Ollivier, Y. "Can recurrent neural networks warp time?" *ICLR*, 2018. Chrono initialisation of the gate biases.
- Cho, K. et al. "Learning phrase representations using RNN encoder-decoder for statistical machine translation." *EMNLP*, 2014. The GRU and the encoder–decoder.
- Cho, K., van Merriënboer, B., Bahdanau, D., Bengio, Y. "On the properties of neural machine translation: encoder-decoder approaches." *SSST-8 Workshop*, 2014. Translation quality falling with sentence length.
- Chung, J., Gulcehre, C., Cho, K., Bengio, Y. "Empirical evaluation of gated recurrent neural networks on sequence modeling." *arXiv*, 2014. GRU against LSTM.
- Weiss, G., Goldberg, Y., Yahav, E. "On the practical computational power of finite precision RNNs for language recognition." *ACL*, 2018. LSTMs can count; GRUs in practice do not.
- Schuster, M., Paliwal, K. K. "Bidirectional recurrent neural networks." *IEEE Transactions on Signal Processing*, 1997. Bidirectional networks.
- Gal, Y., Ghahramani, Z. "A theoretically grounded application of dropout in recurrent neural networks." *NeurIPS*, 2016. Variational dropout.
- Merity, S., Keskar, N. S., Socher, R. "Regularizing and optimizing LSTM language models." *ICLR*, 2018. Dropout on recurrent weights (AWD-LSTM).
- Ba, J. L., Kiros, J. R., Hinton, G. E. "Layer normalization." *arXiv*, 2016. Includes recurrent networks.
- Graves, A. "Generating sequences with recurrent neural networks." *arXiv*, 2013. Character-level and handwriting generation.
- Karpathy, A. "The unreasonable effectiveness of recurrent neural networks." Blog post, 2015. Character-level models writing prose, code and markup.
- Karpathy, A., Johnson, J., Fei-Fei, L. "Visualizing and understanding recurrent networks." *ICLR Workshop*, 2016. Interpretable LSTM cells.
- Sutskever, I., Vinyals, O., Le, Q. V. "Sequence to sequence learning with neural networks." *NeurIPS*, 2014. The encoder–decoder and the reversed source.
- Bengio, S., Vinyals, O., Jaitly, N., Shazeer, N. "Scheduled sampling for sequence prediction with recurrent neural networks." *NeurIPS*, 2015. A remedy for exposure bias.
- Ranzato, M. et al. "Sequence level training with recurrent neural networks." *ICLR*, 2016. Names exposure bias.
- Wu, Y. et al. "Google's neural machine translation system: bridging the gap between human and machine translation." *arXiv*, 2016. Deep residual LSTM stacks; length normalisation in beam search.
- Bahdanau, D., Cho, K., Bengio, Y. "Neural machine translation by jointly learning to align and translate." *ICLR*, 2015. Additive attention (guided reading).
- Luong, M.-T., Pham, H., Manning, C. D. "Effective approaches to attention-based neural machine translation." *EMNLP*, 2015. Multiplicative attention.
- Jain, S., Wallace, B. C. "Attention is not explanation." *NAACL*, 2019; with Wiegreffe, S., Pinter, Y. "Attention is not not explanation." *EMNLP*, 2019. Reading attention weights with care.
- Vaswani, A. et al. "Attention is all you need." *NeurIPS*, 2017. The transformer, Module 06; its complexity table is the model for Section 12's.
- van den Oord, A. et al. "WaveNet: a generative model for raw audio." *arXiv*, 2016. Dilated causal convolutions.
- Bai, S., Kolter, J. Z., Koltun, V. "An empirical evaluation of generic convolutional and recurrent networks for sequence modeling." *arXiv*, 2018. Temporal convolutional networks.
- Katharopoulos, A., Vyas, A., Pappas, N., Fleuret, F. "Transformers are RNNs: fast autoregressive transformers with linear attention." *ICML*, 2020. Linear attention as a recurrence.
- Blelloch, G. E. "Prefix sums and their applications." Technical report CMU-CS-90-190, Carnegie Mellon University, 1990. The parallel scan.
- Gu, A., Dao, T., Ermon, S., Rudra, A., Ré, C. "HiPPO: recurrent memory with optimal polynomial projections." *NeurIPS*, 2020. The initialisation behind S4.
- Gu, A., Goel, K., Ré, C. "Efficiently modeling long sequences with structured state spaces." *ICLR*, 2022. S4.
- Tay, Y. et al. "Long Range Arena: a benchmark for efficient transformers." *ICLR*, 2021. The long-sequence benchmark.
- Gupta, A., Gu, A., Berant, J. "Diagonal state spaces are as effective as structured state spaces." *NeurIPS*, 2022; and Gu, A., Gupta, A., Goel, K., Ré, C. "On the parameterization and initialization of diagonal state space models." *NeurIPS*, 2022. DSS and S4D.
- Orvieto, A. et al. "Resurrecting recurrent neural networks for long sequences." *ICML*, 2023. The Linear Recurrent Unit that Lab 5 follows.
- Gu, A., Dao, T. "Mamba: linear-time sequence modeling with selective state spaces." *arXiv*:2312.00752, 2023. Selective state-space models (guided reading).
- Dao, T., Gu, A. "Transformers are SSMs: generalized models and efficient algorithms through structured state space duality." *ICML*, 2024. Mamba-2.
- Lieber, O. et al. "Jamba: a hybrid transformer-Mamba language model." *arXiv*, 2024. A published hybrid.
- Beck, M. et al. "xLSTM: extended long short-term memory." *NeurIPS*, 2024. A revisited LSTM.
- Hyndman, R. J., Athanasopoulos, G. *Forecasting: Principles and Practice*, 3rd edition. OTexts, 2021. Free online; baselines and time-series cross-validation.
- Hyndman, R. J., Koehler, A. B. "Another look at measures of forecast accuracy." *International Journal of Forecasting*, 2006. MASE.
- Tashman, L. J. "Out-of-sample tests of forecasting accuracy: an analysis and review." *International Journal of Forecasting*, 2000. Rolling-origin evaluation.
- Ben Taieb, S., Bontempi, G., Atiya, A. F., Sorjamaa, A. "A review and comparison of strategies for multi-step ahead time series forecasting based on the NN5 forecasting competition." *Expert Systems with Applications*, 2012. Recursive versus direct.
- Kim, T. et al. "Reversible instance normalization for accurate time-series forecasting against distribution shift." *ICLR*, 2022. RevIN.
- Makridakis, S., Spiliotis, E., Assimakopoulos, V. "The M4 Competition: 100,000 time series and 61 forecasting methods." *International Journal of Forecasting*, 2020; and Smyl, S. "A hybrid method of exponential smoothing and recurrent neural networks for time series forecasting." *International Journal of Forecasting*, 2020. The forecasting competition and its hybrid winner.
- Salinas, D., Flunkert, V., Gasthaus, J., Januschowski, T. "DeepAR: probabilistic forecasting with autoregressive recurrent networks." *International Journal of Forecasting*, 2020. Probabilistic recurrent forecasting.
- Hundman, K. et al. "Detecting spacecraft anomalies using LSTMs and nonparametric dynamic thresholding." *KDD*, 2018. Forecast-residual monitoring of telemetry.
- Page, E. S. "Continuous inspection schemes." *Biometrika*, 1954. The CUSUM test.
- Isermann, R. *Fault-Diagnosis Systems*. Springer, 2006. Model-based fault detection from residuals.
- Keshav, S. "How to read a paper." *ACM SIGCOMM Computer Communication Review*, 2007. The three-pass method behind the two-pass scheme of the guided reading.
