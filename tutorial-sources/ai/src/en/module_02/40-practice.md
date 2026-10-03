## Self-check quiz {#quiz}

Twelve questions, about 18 minutes, no notes: answer each before opening its explanation, and for every miss go back to the section named in the explanation or the lab that measured it.

```quiz
? What does the universal approximation theorem guarantee for a network with one hidden layer and a non-polynomial activation?
- [x] For any continuous function on a compact set and any $\varepsilon > 0$, some finite width achieves error below $\varepsilon$ everywhere on that set.
- [ ] Gradient descent from a random initialisation reaches any target error if the layer is wide enough.
- [ ] The width needed grows at most linearly with the input dimension.
- [ ] A network that fits the training data within $\varepsilon$ also has error below $\varepsilon$ on unseen inputs.
> The theorem is about existence only. It says nothing about whether training finds the weights (the second option), constructions can need a number of units that is exponential in the input dimension (the third), and generalisation from finite data is a separate question ([Module 01](module_01_EN.html), the fourth). See [Section 1](#s1).

? In a batch of $B = 32$, layer $l$ has input $\mathbf{H}^{(l-1)} \in \mathbb{R}^{32 \times 100}$, weights $\mathbf{W}^{(l)} \in \mathbb{R}^{100 \times 50}$ and error signals $\boldsymbol{\Delta}^{(l)} \in \mathbb{R}^{32 \times 50}$. Which expression is $\partial \mathcal{L} / \partial \mathbf{W}^{(l)}$?
- [ ] $\boldsymbol{\Delta}^{(l)\top}\mathbf{H}^{(l-1)}$, of shape $50 \times 100$
- [ ] $\boldsymbol{\Delta}^{(l)}\mathbf{W}^{(l)\top}$, of shape $32 \times 100$
- [x] $\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$, of shape $100 \times 50$
- [ ] $\mathbf{H}^{(l-1)}\mathbf{W}^{(l)}$, of shape $32 \times 50$
> The gradient has the shape of $\mathbf{W}^{(l)}$ ($100 \times 50$) and is the sum over the batch of the outer products $\mathbf{h}\boldsymbol{\delta}^\top$, which is $\mathbf{H}^\top\boldsymbol{\Delta}$. The first option is its transpose, the layout PyTorch stores for `nn.Linear` but not this module's convention. The second is the error passed back to the previous layer's output, before it is gated by $\phi'$. The last is the forward pre-activation without its bias. See [Section 3](#s3).

? A scalar loss depends on $n = 10^6$ parameters. Which statement about computing its gradient is correct?
- [ ] Forward mode needs one pass; reverse mode needs $10^6$.
- [ ] Both modes need $10^6$ passes, but the reverse-mode passes are cheaper.
- [x] Reverse mode needs one backward pass costing a small multiple of the forward pass; forward mode would need about $10^6$ passes.
- [ ] Reverse mode needs one pass and no memory beyond the parameters.
> Reverse mode computes one row of the Jacobian (a vector–Jacobian product) per pass, and a scalar loss has one row. Forward mode computes one column per pass, so it needs one pass per input. Reverse mode's price is memory: the forward values must be stored or recomputed, which rules out the last option. See [Section 4](#s4).

? Which property made ReLU the default hidden activation, ahead of the sigmoid, in deep networks?
- [ ] It is smooth everywhere, which helps the optimiser.
- [ ] Its outputs are zero-centred.
- [ ] It cannot produce units that stop learning.
- [x] Its derivative is exactly 1 for positive inputs, so it does not shrink backpropagated errors on the active side.
> The sigmoid multiplies the error by at most $1/4$ per layer. ReLU has a kink at 0 (GELU and SiLU are the smooth ones), its outputs are non-negative rather than zero-centred, and dead units are precisely its failure mode. See [Section 5](#s5).

? Why does He initialisation use $\operatorname{Var}(w) = 2/n_{\text{in}}$ for ReLU layers, twice the $1/n_{\text{in}}$ used for tanh?
- [ ] ReLU outputs have twice the variance of their inputs.
- [x] A ReLU sets negative pre-activations to zero, so $\mathbb{E}[h^2] = \operatorname{Var}(z)/2$; doubling the weight variance keeps $\operatorname{Var}(z)$ the same from layer to layer.
- [ ] To balance the forward and backward passes, as Glorot initialisation does.
- [ ] Because the ReLU's derivative is 2 on its active side.
> With zero-mean inputs, $\operatorname{Var}(z_{\text{next}}) = n_{\text{in}}\sigma_w^2\,\mathbb{E}[h^2]$, and for a symmetric $z$, $\mathbb{E}[\operatorname{ReLU}(z)^2] = \operatorname{Var}(z)/2$. The first option is false: the output variance is $0.34\operatorname{Var}(z)$, and it is the second moment that halves. The third describes Glorot's compromise $2/(n_{\text{in}} + n_{\text{out}})$. The derivative is 1, not 2. See [Section 6](#s6).

? Heavy-ball momentum updates a velocity $\mathbf{v} \leftarrow \mu\mathbf{v} + \mathbf{g}$ with $\mu = 0.9$. One gradient component is constant from step to step; another flips sign every step. In the steady state the velocity scales them by about:
- [ ] $0.9$ and $0.9$
- [ ] $10$ and $10$
- [ ] $1.9$ and $0.1$
- [x] $10$ and $0.53$
> Momentum is a linear filter. Its gain is $1/(1-\mu) = 10$ at zero frequency (a constant gradient) and $1/(1+\mu) = 0.526$ at the alternating frequency. That is why momentum damps oscillation across a valley while accelerating progress along it. See [Section 7](#s7).

? Adam with $\beta_1 = 0.9$ and $\beta_2 = 0.999$ takes its first step without bias correction. Compared with the corrected step (about $\eta$ per coordinate), the uncorrected step is:
- [ ] About 10 times smaller, because $m_1 = 0.1g$.
- [x] About 3.16 times larger, because $v_1 = 0.001g^2$ is depleted more than $m_1 = 0.1g$.
- [ ] The same, because the two corrections cancel.
- [ ] About 1,000 times larger, because $v_1 = 0.001g^2$.
> $m_1/\sqrt{v_1} = 0.1g/(0.0316|g|) = 3.16\,\operatorname{sign}(g)$, while the corrected ratio is 1. The first option ignores the depletion of $v$; the last ignores $m$ and the square root. For a constant gradient the uncorrected-to-corrected ratio is $(1-\beta_1^t)/\sqrt{1-\beta_2^t}$, which keeps growing to about 6.6 near $t = 12$ before it returns to 1. See [Section 8](#s8).

? Why is L2 regularisation added to the gradient not the same as AdamW's decoupled weight decay when the optimiser is Adam?
- [ ] They are identical up to a rescaling of $\lambda$, exactly as for SGD.
- [ ] AdamW decays only the biases.
- [ ] L2 regularisation is applied only at evaluation time.
- [x] The L2 term is divided by $\sqrt{\hat v}$ like the rest of the gradient, so parameters with large gradient histories are decayed less; AdamW shrinks every parameter by the same factor.
> For SGD the two coincide, so the first option is true there but not here. Under Adam the coupled penalty is normalised per parameter, and no single L2 coefficient reproduces uniform decay unless $\hat v$ is the same for every parameter. See [Section 8](#s8).

? A network with batch normalisation is evaluated after `model.eval()`. Which statistics normalise a test input?
- [ ] The mean and variance of the current test batch.
- [x] Running averages of the batch means and variances accumulated during training.
- [ ] The mean and variance across the test input's own features.
- [ ] None: batch normalisation is switched off in evaluation mode.
> Evaluation mode replaces batch statistics by running averages, so a prediction does not depend on which other examples share its batch. The first option is what happens when `eval()` is forgotten; the third describes layer normalisation; and the layer is not switched off, since it still normalises and applies $\gamma$ and $\beta$. See [Section 10](#s10).

? Inverted dropout with $p = 0.25$ is applied to a hidden activation $h$. What happens during training and at evaluation?
- [ ] Training: zeroed with probability 0.25; evaluation: multiplied by 0.75.
- [ ] Training: multiplied by 0.75; evaluation: zeroed with probability 0.25.
- [ ] Training: zeroed with probability 0.75, otherwise multiplied by 4.
- [x] Training: zeroed with probability 0.25, otherwise multiplied by $4/3$; evaluation: unchanged.
> Scaling the survivors by $1/(1-p) = 4/3$ keeps $\mathbb{E}[\tilde h] = h$, so evaluation needs no change. The first option is the original, non-inverted formulation: correct in expectation, but not what frameworks implement. The third confuses $p$ with the keep probability. See [Section 11](#s11).

? Why is bf16 usually preferred to fp16 for training without loss scaling?
- [ ] bf16 has more mantissa bits, so it is more precise.
- [ ] bf16 represents every integer up to $10^6$ exactly.
- [x] bf16 has fp32's 8 exponent bits, so its range reaches about $3.4\times 10^{38}$, while fp16 overflows above 65,504 and underflows small gradients.
- [ ] fp16 cannot represent negative numbers.
> bf16 trades precision for range: 7 mantissa bits (spacing $2^{-7} = 0.0078$ just above 1) against fp16's 10, but fp32's 8 exponent bits against fp16's 5. That is why fp16 training needs loss scaling and bf16 usually does not. bf16 is the less precise format and represents integers exactly only up to 256. See [Section 12](#s12).

? A new 10-class classifier starts training at a loss of 47 instead of about 2.3. What is the most likely cause?
- [ ] The learning rate is too small.
- [ ] The validation set leaked into the training set.
- [ ] Dropout is active during training.
- [x] The initial weights are too large, so the logits are large and confidently wrong.
> A sensibly initialised network predicts near-uniform probabilities, so its loss is near $\ln 10 = 2.30$ before any step is taken. The learning rate and leakage cannot affect the loss at step 0, and dropout cannot raise it twentyfold. [Lab 5](#lab5)'s $\mathcal{N}(0, 1)$ initialisation starts at about 677. See [Section 14](#s14).
```

## Guided reading {#reading}

A paper is read in two passes, not one. The first pass takes five minutes and is not reading in the usual sense: you read the title, abstract and introduction, the section headings, the figures and their captions, and the conclusion. Then you write down, in one sentence, what the authors claim, and decide whether the claim matters to you. Most papers stop here. The second pass is the one the time estimates below describe. You read the parts the guide below names, with a pen, and you do the work the paper asks you to take on trust: you reproduce one derivation, you check one number in a table against what the text says, and you note every assumption the argument needs. The reading questions are the second pass in miniature. Read them before you read the paper, so that the paper answers them as you go. A third pass, reimplementing the method, is what the labs of this module already did for backpropagation, momentum and Adam. For more on the habit, see Keshav's "How to read a paper" (in the references).

The three papers cover the module's arc: the original statement of backpropagation, the analysis that made initialisation a matter of calculation, and the correction that turned Adam into the optimiser used today. Together they take 50 minutes. Page and section numbers are given where the layout is stable; papers differ between the journal, conference and arXiv versions, so use the headings rather than page numbers if yours do not match.

::: paper minutes=15
Rumelhart, D. E., Hinton, G. E., Williams, R. J. "Learning representations by back-propagating errors." *Nature* 323, 533–536, 1986.

**Why read it.** It is the four-page letter that made backpropagation the way networks are trained. It is short, its equations are those of [Section 3](#s3) in other notation, and it already contains momentum, the symmetry-breaking argument for random initialisation, and learned internal features.

**What to read.** Read all of it. Skim the paragraph near the end on unrolling a recurrent network into a layered one, which [Module 04](module_04_EN.html) treats properly.

**Questions to answer while reading.**

1. Map the paper's notation to this module's. What are its $x_j$, $y_j$, $E$, $\partial E/\partial y_j$ and $\partial E/\partial x_j$, and which of its equations is the between-layers equation of [Section 3](#s3)? (Its weight $w_{ji}$ runs from unit $i$ to unit $j$, the transpose of this module's layout.)
2. The paper's acceleration method is $\Delta w(t) = -\varepsilon\,\partial E/\partial w(t) + \alpha\,\Delta w(t-1)$. Show that it is heavy-ball momentum and relate $\varepsilon$ and $\alpha$ to this module's $\eta$ and $\mu$.
3. Why do the authors start from small random weights, and which section of this module makes the same argument?
4. In the family-tree task, what do the hidden units come to encode, and why is that an instance of [Section 1](#s1)'s learned features?
5. Which error measure and output nonlinearity does the paper use, and what would [Module 01](module_01_EN.html) recommend instead for a classification output?

**After reading.** Write the paper's three-step algorithm (forward pass, backward pass, weight update) in this module's notation on one page, without looking. Then compare it with the NumPy loop of [Lab 1](#lab1): everything the paper leaves out, such as the choice of activation, initialisation scale, loss and optimiser, is what the rest of the module is about.
:::

::: paper minutes=20
Glorot, X., Bengio, Y. "Understanding the difficulty of training deep feedforward neural networks." *Proceedings of the 13th International Conference on Artificial Intelligence and Statistics (AISTATS)*, 2010.

**Why read it.** It is the experimental paper behind Xavier initialisation. It shows, layer by layer, how activations saturate and gradients shrink in deep sigmoid and tanh networks, and it derives the $2/(n_{\text{in}} + n_{\text{out}})$ variance used in [Section 6](#s6). Read after [Section 10](#s10), it also shows the problem that normalisation layers later solved during training as well as at initialisation.

**What to read.** Read Section 1, the experiments with sigmoid and tanh units in Section 3, and Section 4 on gradients at initialisation, including the theoretical derivation of the normalised initialisation and the histograms of activations and back-propagated gradients. Skim Section 2 (data sets and set-up) and the softsign experiments. Read the conclusions in Section 5.

**Questions to answer while reading.**

1. The derivation assumes units in their linear regime at initialisation. State the forward and backward conditions on $\operatorname{Var}(W)$ that it obtains, and why both cannot hold unless $n_{\text{in}} = n_{\text{out}}$.
2. Show that the uniform range $\pm\sqrt{6}/\sqrt{n_{\text{in}} + n_{\text{out}}}$ gives $\operatorname{Var}(W) = 2/(n_{\text{in}} + n_{\text{out}})$.
3. What happens to the top hidden layer of the sigmoid network early in training, and how do the authors explain it? Connect your answer to [Section 5](#s5)'s zero-centring argument.
4. Which cost function do the authors find trains better, and how does that agree with [Module 01](module_01_EN.html)'s argument about cross-entropy against squared error?
5. The paper predates the wide use of ReLU. What changes in its derivation for ReLU units (He et al., 2015), and why does batch normalisation (2015) make the exact initial scale matter less?

**After reading.** Reproduce one of the paper's histograms with a few lines of NumPy: a 5-layer tanh network of width 100 on standard normal inputs, with weights from the paper's "standard" initialisation $U(-1/\sqrt{n_{\text{in}}}, 1/\sqrt{n_{\text{in}}})$ (variance $1/(3n_{\text{in}})$), then from its normalised initialisation (variance $2/(n_{\text{in}} + n_{\text{out}})$), then of variance 1. Compare the spread of the activations layer by layer with the paper's figures, and with the predictions of [Section 6](#s6).
:::

::: paper minutes=15
Loshchilov, I., Hutter, F. "Decoupled weight decay regularization." *International Conference on Learning Representations (ICLR)*, 2019.

**Why read it.** It is the paper behind AdamW, which is what "Adam" means in modern practice. It shows that L2 regularisation and weight decay coincide for SGD but not for adaptive methods, and that decoupling makes the best weight decay nearly independent of the learning rate.

**What to read.** Read Section 1, Section 2 (the propositions and Algorithm 2, where the decoupled term is highlighted), and the experiment in Section 4 that maps the final test error over a grid of learning rate and weight decay for Adam and AdamW. Skip Section 3 (the Bayesian-filtering justification) and the warm-restart (AdamWR) experiments.

**Questions to answer while reading.**

1. Restate Proposition 1 in this module's notation: which L2 coefficient makes SGD with L2 regularisation identical to SGD with weight decay?
2. Explain Proposition 2 in one sentence using [Section 8](#s8)'s derivation: why does no L2 coefficient reproduce decoupled weight decay under Adam?
3. Compare the shape of the good region in the learning-rate by weight-decay heatmaps for Adam and for AdamW. Why does AdamW's shape make hyperparameter search cheaper?
4. In PyTorch, which of `torch.optim.Adam(weight_decay=λ)` and `torch.optim.AdamW(weight_decay=λ)` implements the paper's Algorithm 2 with the decoupled term?

**After reading.** Compare the paper's decay term with the code of [Lab 3](#lab3). Note one detail on which the paper and PyTorch differ in form: the paper multiplies its decay $\lambda$ by the schedule multiplier $\eta_t$ alone, while PyTorch multiplies its `weight_decay` by the current learning rate, which is the base rate $\alpha$ times $\eta_t$. Work out which `weight_decay` reproduces the paper's $\lambda$, and check that under a cosine schedule both decays shrink with the schedule.
:::

## Summary {#summary}

- A multilayer perceptron alternates affine maps $\mathbf{Z} = \mathbf{H}\mathbf{W} + \mathbf{1}\mathbf{b}^\top$ with nonlinearities, and learns its own features; without the nonlinearity the stack collapses to one linear map. The digits network 64 → 128 → 128 → 10 has 26,122 parameters, and each weight costs two FLOPs per example in the forward pass.
- The universal approximation theorem is an existence result: one wide hidden layer can approximate any continuous function on a compact set, but it says nothing about whether training finds the weights, how wide the layer must be, or whether the fit generalises. Depth buys representational efficiency, since the number of linear pieces can grow exponentially with the number of layers.
- Backpropagation is the chain rule organised so that each layer's error signal is computed once: $\boldsymbol{\delta}^{(L)} = \hat{\mathbf{p}} - \mathbf{y}$ for softmax with cross-entropy, $\boldsymbol{\delta}^{(l)} = (\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)}) \odot \phi'(\mathbf{z}^{(l)})$ going down, and $\partial \mathcal{L}/\partial\mathbf{W}^{(l)} = \mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ for a batch. It is reverse-mode automatic differentiation: one backward pass returns the whole gradient for at most about twice the cost of the forward pass (1.68 times for the digits network), at the price of storing the forward values, where forward mode would need one pass per parameter and so suits functions with few inputs.
- ReLU passes a gradient of exactly 1 on its active side, where the sigmoid shrinks it by at most $1/4$ per layer, which is why ReLU replaced it; ReLU's failure mode is the dead unit, and GELU and SiLU are the smooth variants that modern transformers use.
- Initialisation keeps the second moment of activations and gradients constant across layers: $\operatorname{Var}(w) = 2/n_{\text{in}}$ for ReLU (He), $1/n_{\text{in}}$ for tanh near the origin, and $2/(n_{\text{in}} + n_{\text{out}})$ as Glorot's compromise. A ReLU halves the second moment, and its output variance is $0.34$ of its input's. An initial loss far from $\ln K$, such as 677 against 2.30 for ten classes, shows that the scale is wrong before any step has been taken.
- On a quadratic, gradient descent is stable for $\eta < 2/\lambda_{\max}$ and converges at a rate set by the condition number $\kappa$; heavy-ball momentum is a low-pass filter with gain $1/(1-\mu)$ on a steady gradient and $1/(1+\mu)$ on an alternating one, which damps oscillation across a ravine and speeds progress along it.
- Adam divides a momentum average of the gradient by the root of a running average of its square, giving each parameter a step of about $\eta$; without bias correction its first step is about 3.16 times too large for $\beta_1 = 0.9$, $\beta_2 = 0.999$. AdamW applies weight decay directly to the weights, because L2 added to Adam's gradient is divided by $\sqrt{\hat v}$ and so decays parameters unevenly.
- A range test finds the peak learning rate in minutes; warmup protects adaptive methods from their erratic first steps, decay removes the noise floor that a constant rate leaves around the minimum, and global-norm gradient clipping stops a single bad batch from corrupting the optimiser's state.
- Batch normalisation uses batch statistics in training and running averages in evaluation, so forgetting `model.eval()` changes the answers; layer normalisation and RMSNorm normalise each example's features alone and are what transformers use, RMSNorm without the mean subtraction.
- Dropout with probability $p$ zeroes activations and scales the survivors by $1/(1-p)$ so that evaluation needs no change; weight decay, early stopping, augmentation and label smoothing each constrain the model in a different way and are not interchangeable.
- Cross-entropy must be computed from logits with the log-sum-exp identity, never as the log of a softmax; fp16 overflows above 65,504 and needs loss scaling to keep small gradients from underflowing, while bf16 keeps fp32's range of about $3.4\times10^{38}$ and gives up precision.
- Training problems are diagnosed, not guessed at: check the initial loss against $\ln K$, overfit one small batch, compare analytic and numerical gradients, and plot the loss, the gradient norm and the learning rate together.

[Module 03](module_03_EN.html) keeps everything in this module and changes one thing: the dense first layer is replaced by convolution, which shares one small set of weights across all positions of an image. The training loop, initialisation, optimiser, normalisation and the debugging checklist carry over unchanged, and ResNet's residual connection is how Module 03 keeps very deep networks trainable. Modules 04 and 06 then change the structure again, to recurrence and to attention, and in both the same four things decide whether training works: the scale at initialisation, the optimiser, the normalisation, and the numerical format.

## References {#refs}

- Rumelhart, D. E., Hinton, G. E., Williams, R. J. "Learning representations by back-propagating errors." *Nature*, 1986. Backpropagation for multilayer networks, with momentum and random initialisation.
- Cybenko, G. "Approximation by superpositions of a sigmoidal function." *Mathematics of Control, Signals and Systems*, 1989. Universal approximation with sigmoids.
- Hornik, K. "Approximation capabilities of multilayer feedforward networks." *Neural Networks*, 1991. Universal approximation for general activations.
- Leshno, M., Lin, V. Ya., Pinkus, A., Schocken, S. "Multilayer feedforward networks with a nonpolynomial activation function can approximate any function." *Neural Networks*, 1993. Any non-polynomial activation suffices.
- Montúfar, G., Pascanu, R., Cho, K., Bengio, Y. "On the number of linear regions of deep neural networks." *NeurIPS*, 2014. Linear regions grow exponentially with depth.
- Telgarsky, M. "Benefits of depth in neural networks." *COLT*, 2016. The sawtooth depth-separation argument of [Section 1](#s1).
- Baydin, A. G., Pearlmutter, B. A., Radul, A. A., Siskind, J. M. "Automatic differentiation in machine learning: a survey." *JMLR*, 2018. Forward and reverse mode; the worked example of [Section 4](#s4).
- Griewank, A., Walther, A. *Evaluating Derivatives: Principles and Techniques of Algorithmic Differentiation*, 2nd ed. SIAM, 2008. The reference on automatic differentiation and its cost.
- Chen, T., Xu, B., Zhang, C., Guestrin, C. "Training deep nets with sublinear memory cost." *arXiv*, 2016. Gradient checkpointing.
- LeCun, Y., Bottou, L., Orr, G. B., Müller, K.-R. "Efficient BackProp." In *Neural Networks: Tricks of the Trade*, Springer, 1998. Input standardisation and the $1/n_{\text{in}}$ initialisation for tanh.
- Glorot, X., Bengio, Y. "Understanding the difficulty of training deep feedforward neural networks." *AISTATS*, 2010. Xavier initialisation.
- He, K., Zhang, X., Ren, S., Sun, J. "Delving deep into rectifiers: surpassing human-level performance on ImageNet classification." *ICCV*, 2015. He initialisation.
- Maas, A. L., Hannun, A. Y., Ng, A. Y. "Rectifier nonlinearities improve neural network acoustic models." *ICML Workshop on Deep Learning for Audio, Speech and Language Processing*, 2013. Leaky ReLU.
- Hendrycks, D., Gimpel, K. "Gaussian error linear units (GELUs)." *arXiv*, 2016. GELU.
- Elfwing, S., Uchibe, E., Doya, K. "Sigmoid-weighted linear units for neural network function approximation in reinforcement learning." *Neural Networks*, 2018. SiLU.
- Ramachandran, P., Zoph, B., Le, Q. V. "Searching for activation functions." *arXiv*, 2017. Swish, the same function as SiLU.
- Polyak, B. T. "Some methods of speeding up the convergence of iteration methods." *USSR Computational Mathematics and Mathematical Physics*, 1964. Heavy-ball momentum.
- Nesterov, Y. "A method of solving a convex programming problem with convergence rate $O(1/k^2)$." *Soviet Mathematics Doklady*, 1983. Nesterov momentum.
- Sutskever, I., Martens, J., Dahl, G., Hinton, G. "On the importance of initialization and momentum in deep learning." *ICML*, 2013. Momentum and Nesterov momentum for deep networks.
- Duchi, J., Hazan, E., Singer, Y. "Adaptive subgradient methods for online learning and stochastic optimization." *JMLR*, 2011. AdaGrad.
- Tieleman, T., Hinton, G. "Lecture 6.5 — RMSProp." *Coursera: Neural Networks for Machine Learning*, 2012. RMSProp, published only as lecture slides.
- Kingma, D. P., Ba, J. "Adam: a method for stochastic optimization." *ICLR*, 2015. Adam.
- Reddi, S. J., Kale, S., Kumar, S. "On the convergence of Adam and beyond." *ICLR*, 2018. The flaw in Adam's original convergence proof.
- Loshchilov, I., Hutter, F. "SGDR: stochastic gradient descent with warm restarts." *ICLR*, 2017. Cosine learning-rate schedules.
- Loshchilov, I., Hutter, F. "Decoupled weight decay regularization." *ICLR*, 2019. AdamW.
- Smith, L. N. "Cyclical learning rates for training neural networks." *WACV*, 2017. The learning-rate range test.
- Goyal, P. et al. "Accurate, large minibatch SGD: training ImageNet in 1 hour." *arXiv*, 2017. Linear learning-rate scaling with batch size, and gradual warmup.
- Liu, L. et al. "On the variance of the adaptive learning rate and beyond." *ICLR*, 2020. Why adaptive methods need warmup.
- Pascanu, R., Mikolov, T., Bengio, Y. "On the difficulty of training recurrent neural networks." *ICML*, 2013. Gradient-norm clipping.
- Cohen, J. M., Kaur, S., Li, Y., Kolter, J. Z., Talwalkar, A. "Gradient descent on neural networks typically occurs at the edge of stability." *ICLR*, 2021. Sharpness rising to $2/\eta$.
- Ioffe, S., Szegedy, C. "Batch normalization: accelerating deep network training by reducing internal covariate shift." *ICML*, 2015. Batch normalisation.
- Santurkar, S., Tsipras, D., Ilyas, A., Madry, A. "How does batch normalization help optimization?" *NeurIPS*, 2018. The smoothing explanation.
- Ba, J. L., Kiros, J. R., Hinton, G. E. "Layer normalization." *arXiv*, 2016. Layer normalisation.
- Zhang, B., Sennrich, R. "Root mean square layer normalization." *NeurIPS*, 2019. RMSNorm.
- Wu, Y., He, K. "Group normalization." *ECCV*, 2018. Normalisation for small batches.
- Srivastava, N., Hinton, G., Krizhevsky, A., Sutskever, I., Salakhutdinov, R. "Dropout: a simple way to prevent neural networks from overfitting." *JMLR*, 2014. Dropout.
- Hinton, G. E., Srivastava, N., Krizhevsky, A., Sutskever, I., Salakhutdinov, R. R. "Improving neural networks by preventing co-adaptation of feature detectors." *arXiv*, 2012. The first description of dropout and the geometric-mean argument.
- Gal, Y., Ghahramani, Z. "Dropout as a Bayesian approximation: representing model uncertainty in deep learning." *ICML*, 2016. Monte Carlo dropout.
- Szegedy, C., Vanhoucke, V., Ioffe, S., Shlens, J., Wojna, Z. "Rethinking the Inception architecture for computer vision." *CVPR*, 2016. Label smoothing.
- Müller, R., Kornblith, S., Hinton, G. "When does label smoothing help?" *NeurIPS*, 2019. Calibration and distillation effects of label smoothing.
- Guo, C., Pleiss, G., Sun, Y., Weinberger, K. Q. "On calibration of modern neural networks." *ICML*, 2017. Overconfidence of modern networks and temperature scaling.
- Bishop, C. M. "Training with noise is equivalent to Tikhonov regularization." *Neural Computation*, 1995. Input noise as a regulariser.
- Micikevicius, P. et al. "Mixed precision training." *ICLR*, 2018. fp16 training with loss scaling.
- Goodfellow, I., Bengio, Y., Courville, A. *Deep Learning*. MIT Press, 2016. Chapters 6–8; Section 7.8 on early stopping as L2 regularisation.
- Karpathy, A. *micrograd* (open-source software), 2020. The scalar autodiff engine whose design [Lab 2](#lab2) follows.
- Keshav, S. "How to read a paper." *ACM SIGCOMM Computer Communication Review*, 2007. The three-pass method that the guided reading adapts.
