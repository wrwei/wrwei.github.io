## Self-check quiz {#quiz}

Twelve questions, one correct answer each, about fifteen to twenty minutes in all; answer before you open the explanation, and reread the section named in any explanation you got wrong.

```quiz
? Which statement about the KL divergence $D_{\KL}(q \,\|\, p)$ is true?
- [ ] It is symmetric: $D_{\KL}(q \,\|\, p) = D_{\KL}(p \,\|\, q)$.
- [ ] It satisfies the triangle inequality, so it is a distance.
- [ ] It is bounded above by $\log 2$.
- [x] It is non-negative, and zero only when $q = p$.
> Jensen's inequality gives $D_{\KL} \ge 0$, with equality if and only if $q = p$. It is not symmetric ([Section 1](#s1)'s example gives 1.153 nats in one direction and 0.597 in the other) and it is not a metric. It is the Jensen–Shannon divergence, not the KL, that is bounded by $\log 2$.

? In a VAE, $\log p_\theta(\mathbf{x}) - \text{ELBO}$ equals:
- [ ] the reconstruction error
- [ ] $D_{\KL}\big(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p(\mathbf{z})\big)$
- [x] $D_{\KL}\big(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})\big)$
- [ ] zero whenever the decoder is Gaussian
> The identity $\log p_\theta(\mathbf{x}) = \text{ELBO} + D_{\KL}\big(q_\phi \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})\big)$ makes the gap the KL divergence to the true posterior. The KL to the prior is one term inside the ELBO, not the gap; the reconstruction term is the other ELBO term; and the gap is zero only when $q_\phi$ equals the true posterior, whatever the decoder family.

? Why does a VAE need the reparameterisation trick?
- [x] Because drawing $\mathbf{z} \sim \mathcal{N}(\boldsymbol\mu, \boldsymbol\sigma^2)$ is not a differentiable function of $\boldsymbol\mu$ and $\boldsymbol\sigma$; writing $\mathbf{z} = \boldsymbol\mu + \boldsymbol\sigma \odot \boldsymbol\epsilon$ with $\boldsymbol\epsilon$ an input makes it one.
- [ ] Because the KL divergence between two Gaussians has no closed form.
- [ ] Because the decoder cannot take random inputs.
- [ ] To force the approximate posterior to equal the prior.
> Gradients must flow from the reconstruction term back to the encoder through the sample, and a bare random draw blocks them; the trick moves the randomness into $\boldsymbol\epsilon$. The Gaussian KL does have a closed form, a decoder takes random inputs at sampling time anyway, and forcing the posterior onto the prior is the failure called posterior collapse, not the purpose of the trick.

? Why is the non-saturating generator loss $-\log D(G(\mathbf{z}))$ used instead of $\log\big(1 - D(G(\mathbf{z}))\big)$?
- [ ] It has a different optimum, which prevents mode collapse.
- [ ] It makes the discriminator train faster.
- [ ] It turns the Jensen–Shannon divergence into a Wasserstein distance.
- [x] Early in training $D(G(\mathbf{z}))$ is near 0, where $\log(1-D)$ has almost no gradient with respect to $D$'s logit, while $-\log D$ has a gradient near $-1$.
> With $D = \sigma(a)$ for a logit $a$, $\partial_a \log(1-D) = -D$ and $\partial_a(-\log D) = -(1-D)$. At $D(G(\mathbf{z})) = 0.01$ these are $-0.01$ and $-0.99$. Both losses have the same fixed point, $p_g = p_{\text{data}}$, so the change affects the dynamics and not the optimum. It does not prevent mode collapse, it does not change the divergence being minimised, and it concerns the generator's update, not the discriminator's.

? During DDPM training, how is the noisy input $\mathbf{x}_t$ obtained for a randomly drawn $t$?
- [ ] It must be computed by running the $t$ noising steps from $\mathbf{x}_0$ in sequence.
- [x] In one step: $\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon$.
- [ ] $\mathbf{x}_t = \mathbf{x}_0 + \beta_t\,\boldsymbol\epsilon$.
- [ ] $\mathbf{x}_t = (1-\bar\alpha_t)\,\mathbf{x}_0 + \bar\alpha_t\,\boldsymbol\epsilon$.
> A composition of Gaussian steps is Gaussian, so one draw gives $\mathbf{x}_t$ exactly and running the steps is unnecessary; that is what makes training cheap. $\beta_t$ is the variance of a single step, not a cumulative scale. The last formula swaps signal and noise and uses linear instead of square-root weights, so its variance is wrong.

? With classifier-free guidance, $\tilde{\boldsymbol\epsilon} = \boldsymbol\epsilon_\theta(\mathbf{x}_t, \varnothing) + w\,\big[\boldsymbol\epsilon_\theta(\mathbf{x}_t, c) - \boldsymbol\epsilon_\theta(\mathbf{x}_t, \varnothing)\big]$, which statement is correct?
- [ ] $w = 0$ gives the conditional model.
- [ ] Guidance needs a separately trained classifier of noisy images.
- [x] $w = 1$ gives the conditional model; $w > 1$ increases fidelity to $c$ at the cost of diversity.
- [ ] Guidance halves the number of network evaluations per step.
> $w = 0$ is the unconditional model and $w = 1$ the conditional one; above 1 the prediction is extrapolated away from the unconditional one and towards $c$. In [Lab 2](#lab2) the recall-like distance grows from 0.022 at $w = 1$ to 0.046 at $w = 7$ as the samples crowd together. Classifier-free guidance needs no classifier, which is its point, and it doubles the evaluations per step, one conditional and one unconditional.

? In a GCN with self-loops, what is $\hat{A}_{ij}$ for an edge between a node with 3 neighbours and a node with 1 neighbour?
- [x] $1/\sqrt{4 \times 2} = 0.354$
- [ ] $1/\sqrt{3 \times 1} = 0.577$
- [ ] $1/4 = 0.25$
- [ ] $1$
> Self-loops add 1 to each degree, giving $\tilde d_i = 4$ and $\tilde d_j = 2$, and $\hat{A}_{ij} = 1/\sqrt{\tilde d_i \tilde d_j} = 1/\sqrt 8 = 0.354$. The value 0.577 forgets the self-loops; 0.25 is a random-walk weight seen from the hub; 1 is the unnormalised adjacency.

? Repeatedly applying $\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A}+\mathbf{I})\tilde{\mathbf{D}}^{-1/2}$ to the node features of a connected graph makes them converge to:
- [ ] zero
- [ ] the original features
- [x] one common direction for every node, scaled by $\sqrt{\tilde d_i}$
- [ ] one-hot vectors of each node's community
> $\hat{\mathbf{A}}$ has eigenvalue 1 with eigenvector $\tilde{\mathbf{D}}^{1/2}\mathbf{1}$ and every other eigenvalue below 1 in magnitude, so $\hat{\mathbf{A}}^k\mathbf{X}$ tends to $\mathbf{u}\mathbf{u}^\top\mathbf{X}$ with $\mathbf{u}$ the normalised eigenvector: every row becomes the same vector, scaled by $\sqrt{\tilde d_i}$. Nothing goes to zero, because the dominant eigenvalue is exactly 1; the original features are lost; and community structure is washed out, not sharpened.

? A PINN for $u'' + \omega_0^2 u = 0$ with $u(0) = 1$, $u'(0) = 0$ converges to $u \equiv 0$. The most likely cause is:
- [ ] too many collocation points
- [x] the initial-condition term is too weak relative to the residual term, and $u \equiv 0$ satisfies the equation exactly
- [ ] the $\tanh$ activation
- [ ] a learning rate that is too small
> Zero has zero residual for a homogeneous equation; only the condition terms exclude it, so if the residual loss dominates, shrinking the output is the quickest way to lower the total ([Lab 4](#lab4): residual loss 52.5 against 1.36 at the start, in dimensional units). More collocation points and $\tanh$ are standard choices, and a small learning rate slows training but does not select the trivial solution.

? A DeepONet trained on solver runs for one family of boundary conditions is applied to a boundary condition far outside that family. What should you expect?
- [x] Unknown accuracy: a surrogate is validated only on the distribution it was trained on, so check against the solver.
- [ ] The same accuracy, because an operator is learned for all input functions.
- [ ] Exact results, because the trunk network is a basis.
- [ ] A shape error, because the branch network rejects new inputs.
> Operator learning approximates the map on the training distribution; outside it the error is unquantified. The trunk network's basis is learned from the same data, and the input shape ($m$ sensor values) is unchanged, so the network runs without complaint and returns a confident, unvalidated answer.

? With InfoNCE over $N = 256$ candidates, the largest value that the bound $\log N - \mathcal{L}$ on mutual information can certify is about:
- [ ] 2.4 nats
- [x] 5.55 nats
- [ ] 256 nats
- [ ] unbounded
> The loss is at least 0, so $\log N - \mathcal{L} \le \log 256 = 5.545$ nats; certifying more information needs more candidates. The value 2.4 is a typical loss, not a bound, and 256 confuses $N$ with $\log N$.

? A mixture-of-experts layer has 8 experts and routes each token to its top 2. Compared with one dense FFN of the size of a single expert, it has:
- [ ] 2 times the parameters and 8 times the compute
- [ ] 8 times the parameters and 8 times the compute
- [ ] the same parameters and a quarter of the compute
- [x] 8 times the parameters and about 2 times the compute per token
> All 8 experts are stored, but only 2 run for any one token, plus a negligible router. That separation of parameters from compute is the point of the design (Mixtral 8x7B: about 47B parameters in total, about 13B active per token).
```

## Guided reading {#reading}

A paper is read in two passes, and the first should be short.

**First pass, about a quarter of the time.** Read the title, abstract, introduction and conclusion, look at every figure and table with its caption, and skim the headings. Then write down, without looking back, what the authors claim, what they compare against and what would convince you. If the claim is already clear and the paper is not central to your work, you may stop here.

**Second pass, the rest.** Read the sections named below with a pencil. Do the derivations they point to: take the equation that defines the method, check one line of algebra, and find where the paper's symbols match the ones used in this module. In the experiments, find the baseline and ask whether it is strong, whether the comparison is fair (same data, same compute, tuned alike), and where the method fails; the authors' limitations paragraph is often the most informative page. Skip proofs and appendices unless a question sends you there. Papers are not read in order, and the time budgets below assume you do not read every line.

Each paper below comes with the reason to read it, the parts to read and to skip, and questions whose answers can be found in the text. Do not quote the paper's numbers from memory: finding them is part of the exercise.

::: paper minutes=20
Ho, J., Jain, A., Abbeel, P. "Denoising diffusion probabilistic models." *Advances in Neural Information Processing Systems (NeurIPS)*, 2020.

**Why read it.** It is the paper that made diffusion practical: it ties the variational bound to denoising score matching and shows that a simplified noise-prediction loss gives the best samples. [Sections 5](#s5) and [6](#s6) and [Lab 2](#lab2) follow it closely, so you read it with the algebra already worked.

**What to read.** Read the background section (the forward process, the variational bound and the closed form for $q(\mathbf{x}_t \mid \mathbf{x}_0)$); the section relating diffusion models to denoising autoencoders, above all the reverse-process parameterisation and the simplified training objective; Algorithms 1 and 2; and the ablation table in the experiments that compares parameterisations and objectives. Skim the sample-quality results. Skip progressive coding, interpolation and the appendices, except the derivation of the bound if you want the full algebra.

**Questions to answer while reading.**

1. Find the equation for $q(\mathbf{x}_t \mid \mathbf{x}_0)$. Which symbol of the paper corresponds to this module's $\bar\alpha_t$?
2. What does the network predict in their best model, and what does the ablation table show for predicting the mean $\tilde{\boldsymbol\mu}$ instead, once with the true bound and once with the simplified objective?
3. What $T$ and what $\beta$ schedule do they use? Compute $\bar\alpha_T$ from it and compare with the value quoted in [Section 5](#s5).
4. Map Algorithms 1 and 2 line by line onto the training loop and the sampler of [Lab 2](#lab2). Where do they differ?
5. Why, according to the authors, does the simplified objective improve sample quality? Relate their argument to the weights computed in [Section 5](#s5) (0.50 at $t = 1$, about 0.01 at $t = 100$).

**After reading.** You should be able to state in two sentences why predicting the noise is equivalent to predicting the mean of the reverse step, and why dropping the bound's weights trades likelihood for sample quality. If you cannot, redo Question 5 with the table of weights.
:::

::: paper minutes=12
Kipf, T. N., Welling, M. "Semi-supervised classification with graph convolutional networks." *International Conference on Learning Representations (ICLR)*, 2017.

**Why read it.** It is short and clear. It derives the GCN layer from spectral graph convolution in two approximations and shows it working with very few labels, and its depth experiment anticipates the over-smoothing of [Section 8](#s8).

**What to read.** Read the section on fast approximate convolutions on graphs (the first-order approximation and the renormalisation trick); the two-layer model for semi-supervised node classification with its forward-model equation; the comparison of propagation models in the results; and the appendix on model depth. On a first reading, skip the spectral details if graph Laplacians are new to you, and skip the related work and the dataset statistics.

**Questions to answer while reading.**

1. What is the "renormalisation trick", and which numerical problem does it address?
2. Write their two-layer forward model and identify each factor in the code of [Lab 3](#lab3).
3. Which propagation model wins in their comparison, and by how much over the first-order model without the renormalisation?
4. What happens to training and test accuracy as depth grows in the appendix experiment, with and without residual connections? Compare with [Lab 3](#lab3) at 8 and 16 layers.

**After reading.** Rewrite the propagation rule for a five-node graph of your own and compute one layer by hand, as in [Section 7](#s7). If the arithmetic reproduces the structure in the paper's equation, you have the paper.
:::

::: paper minutes=13
Raissi, M., Perdikaris, P., Karniadakis, G. E. "Physics-informed neural networks: a deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations." *Journal of Computational Physics*, 378, 2019.

**Why read it.** It is the paper that named the method and set its pattern: a residual computed by automatic differentiation, collocation points, and inverse problems with trainable coefficients. Read after [Lab 4](#lab4), it lets you judge its claims against failure modes you have reproduced.

**What to read.** Read the introduction; the problem set-up; the continuous-time data-driven solution of partial differential equations with its Burgers' equation example; and the set-up of the continuous-time data-driven discovery problem, with the Navier–Stokes example. Skip the discrete-time Runge–Kutta models and the Korteweg–de Vries example.

**Questions to answer while reading.**

1. How many initial and boundary training points and how many collocation points does the Burgers example use, and what error do the authors report?
2. Write their residual $f$ for Burgers' equation and map it onto the residual function of [Lab 4](#lab4).
3. In the discovery problem, which coefficients are learned, from how much data, with what noise, and how accurately are they recovered?
4. Which claims about accuracy or cost would you check against a classical solver before relying on them, and how? Use [Section 9](#s9) and McGreivy and Hakim (2024) to decide.

**After reading.** Write down the baseline you would run before trusting a PINN on your own problem, and the number it would have to beat.
:::

## Summary {#summary}

- A **KL divergence** is non-negative, zero only for equal distributions and not symmetric; for Gaussians it has a closed form, and the example $\mathcal{N}(0,1)$ against $\mathcal{N}(1, 0.5)$ gives 1.153 nats one way and 0.597 the other.
- A **linear autoencoder** recovers the PCA subspace, so a nonlinear autoencoder is worth its cost only if it beats a PCA baseline; an autoencoder anomaly detector takes its threshold from held-out normal data.
- A **VAE** maximises the ELBO, which equals $\log p_\theta(\mathbf{x})$ minus the KL divergence from $q_\phi(\mathbf{z}\mid\mathbf{x})$ to the true posterior; the **reparameterisation trick** $\mathbf{z} = \boldsymbol\mu + \boldsymbol\sigma\odot\boldsymbol\epsilon$ lets gradients reach the encoder, and a KL per dimension near zero signals posterior collapse.
- A **GAN** with an optimal discriminator minimises the Jensen–Shannon divergence between $p_g$ and the data; the non-saturating generator loss fixes vanishing gradients but not mode collapse, and as of 2026 diffusion models have displaced GANs for most image generation.
- A **diffusion model** noises data with a fixed Gaussian process whose marginal is $\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon$, and is trained by regressing the noise; the simplified loss reweights the variational bound towards harder, noisier steps.
- **Sampling** a diffusion model takes many network evaluations; DDIM, distillation and consistency models cut the count, **classifier-free guidance** with scale $w$ trades diversity for fidelity at twice the evaluations per step, and the noise schedule must end with $\bar\alpha_T$ near zero.
- A **GCN layer** computes $\mathbf{H}^{(l+1)} = \sigma(\hat{\mathbf{A}}\mathbf{H}^{(l)}\mathbf{W}^{(l)})$ with $\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A}+\mathbf{I})\tilde{\mathbf{D}}^{-1/2}$; repeated application drives all node features towards one direction (over-smoothing), so useful depth is small unless residual connections or normalisation are added.
- Message-passing networks cannot distinguish graphs that the Weisfeiler–Leman test cannot, and information from distant nodes is squeezed through narrow edges (over-squashing); engineering models such as fault trees and safety arguments are graphs, and the first baseline is always a simple structural rule.
- A **physics-informed network** minimises a PDE residual computed by automatic differentiation plus boundary and initial terms; it can converge to the trivial solution when the condition terms are outweighed, and the fixes are non-dimensionalising, weighting the terms or building the conditions in as a hard constraint.
- **Neural operators** such as DeepONet and the Fourier neural operator learn a map between functions from solver runs; they are surrogates that are valid only on the family of inputs they were trained on, and each needs a check against the solver before it is used on a new design.
- **Contrastive learning** with InfoNCE is a classification loss over $N$ candidates whose value at chance is $\log N$, so $\log N - \mathcal{L}$ can certify at most $\log N$ nats of mutual information; the augmentations decide what the representation keeps, and a linear probe measures what it bought.
- A **mixture-of-experts** layer stores $E$ experts but runs only $k$ per token, so parameters grow with $E$ and compute with $k$; routing collapse is countered by a load-balancing loss, and a model's total and active parameters are counted separately.

Everything in this module is a way of putting structure in the model, in the loss or in the data: a bottleneck, a noise process, a graph, an equation, an augmentation, a router. The next module, [Module 06](module_06_EN.html), takes one such structure, attention, and builds it in full. The transformer replaces the recurrence of [Module 04](module_04_EN.html) and the fixed neighbourhoods of this module's graph networks with learned, content-dependent weights between all positions of a sequence. It is the architecture behind the diffusion backbones, the CLIP encoders and the mixture-of-experts layers met here, and behind the language models of Modules 07 to 10.

## References {#refs}

- Kingma, D. P., Welling, M. "Auto-encoding variational Bayes." *ICLR*, 2014. The VAE, the ELBO estimator and the reparameterisation trick.
- Rezende, D. J., Mohamed, S., Wierstra, D. "Stochastic backpropagation and approximate inference in deep generative models." *ICML*, 2014. The same idea, found independently.
- Baldi, P., Hornik, K. "Neural networks and principal component analysis: learning from examples without local minima." *Neural Networks*, 1989. The linear autoencoder recovers the PCA subspace.
- Vincent, P., Larochelle, H., Bengio, Y., Manzagol, P.-A. "Extracting and composing robust features with denoising autoencoders." *ICML*, 2008. Denoising autoencoders.
- Vincent, P. "A connection between score matching and denoising autoencoders." *Neural Computation*, 2011. Denoising estimates the score; the bridge to diffusion.
- Bowman, S. R. et al. "Generating sentences from a continuous space." *CoNLL*, 2016. Posterior collapse with powerful decoders; KL annealing.
- Burda, Y., Grosse, R., Salakhutdinov, R. "Importance weighted autoencoders." *ICLR*, 2016. Defines active units.
- Kingma, D. P. et al. "Improved variational inference with inverse autoregressive flow." *NeurIPS*, 2016. Introduces free bits.
- Higgins, I. et al. "beta-VAE: learning basic visual concepts with a constrained variational framework." *ICLR*, 2017. The KL weight $\beta$.
- Goodfellow, I. et al. "Generative adversarial nets." *NeurIPS*, 2014. The GAN game, the optimal discriminator and the Jensen–Shannon divergence.
- Metz, L., Poole, B., Pfau, D., Sohl-Dickstein, J. "Unrolled generative adversarial networks." *ICLR*, 2017. Mode collapse and mode hopping on a ring of Gaussians.
- Arjovsky, M., Chintala, S., Bottou, L. "Wasserstein GAN." *ICML*, 2017. The earth-mover distance and the critic.
- Gulrajani, I. et al. "Improved training of Wasserstein GANs." *NeurIPS*, 2017. The gradient penalty.
- Miyato, T. et al. "Spectral normalization for generative adversarial networks." *ICLR*, 2018. A Lipschitz constraint per layer.
- Sohl-Dickstein, J. et al. "Deep unsupervised learning using nonequilibrium thermodynamics." *ICML*, 2015. The first diffusion model.
- Song, Y., Ermon, S. "Generative modeling by estimating gradients of the data distribution." *NeurIPS*, 2019. Score-based generation.
- Ho, J., Jain, A., Abbeel, P. "Denoising diffusion probabilistic models." *NeurIPS*, 2020. DDPM and the simplified noise-prediction loss; guided reading.
- Song, Y. et al. "Score-based generative modeling through stochastic differential equations." *ICLR*, 2021. The continuous-time view uniting scores and diffusion.
- Nichol, A., Dhariwal, P. "Improved denoising diffusion probabilistic models." *ICML*, 2021. The cosine schedule.
- Song, J., Meng, C., Ermon, S. "Denoising diffusion implicit models." *ICLR*, 2021. DDIM: deterministic sampling with fewer steps.
- Dhariwal, P., Nichol, A. "Diffusion models beat GANs on image synthesis." *NeurIPS*, 2021. Classifier guidance; the point where diffusion overtook GANs.
- Ho, J., Salimans, T. "Classifier-free diffusion guidance." arXiv:2207.12598, 2022 (first presented at a NeurIPS 2021 workshop). Guidance without a classifier.
- Rombach, R. et al. "High-resolution image synthesis with latent diffusion models." *CVPR*, 2022. Diffusion in an autoencoder's latent space.
- Salimans, T., Ho, J. "Progressive distillation for fast sampling of diffusion models." *ICLR*, 2022. Few-step samplers; the $v$-parameterisation.
- Song, Y., Dhariwal, P., Chen, M., Sutskever, I. "Consistency models." *ICML*, 2023. One- and few-step generation.
- Lin, S. et al. "Common diffusion noise schedules and sample steps are flawed." *WACV*, 2024. Non-zero terminal signal-to-noise ratio and its symptoms.
- Carlini, N. et al. "Extracting training data from diffusion models." *USENIX Security Symposium*, 2023. Memorisation in diffusion models.
- Gilmer, J. et al. "Neural message passing for quantum chemistry." *ICML*, 2017. The general message-passing framework.
- Kipf, T. N., Welling, M. "Semi-supervised classification with graph convolutional networks." *ICLR*, 2017. The GCN; guided reading.
- Velickovic, P. et al. "Graph attention networks." *ICLR*, 2018. Learned neighbour weights.
- Li, Q., Han, Z., Wu, X.-M. "Deeper insights into graph convolutional networks for semi-supervised learning." *AAAI*, 2018. The GCN as Laplacian smoothing; over-smoothing.
- Xu, K., Hu, W., Leskovec, J., Jegelka, S. "How powerful are graph neural networks?" *ICLR*, 2019. The Weisfeiler–Leman bound and GIN.
- Schlichtkrull, M. et al. "Modeling relational data with graph convolutional networks." *ESWC*, 2018. One weight matrix per edge type and direction.
- Alon, U., Yahav, E. "On the bottleneck of graph neural networks and its practical implications." *ICLR*, 2021. Over-squashing.
- Pfaff, T. et al. "Learning mesh-based simulation with graph networks." *ICLR*, 2021. MeshGraphNets, learned simulators on meshes.
- Lagaris, I. E., Likas, A., Fotiadis, D. I. "Artificial neural networks for solving ordinary and partial differential equations." *IEEE Transactions on Neural Networks*, 1998. Trial solutions that satisfy the conditions by construction.
- Raissi, M., Perdikaris, P., Karniadakis, G. E. "Physics-informed neural networks: a deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations." *Journal of Computational Physics*, 2019. The PINN; guided reading.
- Rahaman, N. et al. "On the spectral bias of neural networks." *ICML*, 2019. Networks fit low frequencies first.
- Tancik, M. et al. "Fourier features let networks learn high frequency functions in low dimensional domains." *NeurIPS*, 2020. The Fourier-feature remedy.
- Wang, S., Teng, Y., Perdikaris, P. "Understanding and mitigating gradient flow pathologies in physics-informed neural networks." *SIAM Journal on Scientific Computing*, 2021. Loss imbalance and adaptive weights.
- Krishnapriyan, A. S. et al. "Characterizing possible failure modes in physics-informed neural networks." *NeurIPS*, 2021. Regimes where PINN training fails.
- McGreivy, N., Hakim, A. "Weak baselines and reporting biases lead to overoptimism in machine learning for fluid-related partial differential equations." *Nature Machine Intelligence*, 2024. Why learned PDE solvers need strong classical baselines.
- Chen, T., Chen, H. "Universal approximation to nonlinear operators by neural networks with arbitrary activation functions and its application to dynamical systems." *IEEE Transactions on Neural Networks*, 1995. The theorem behind DeepONet.
- Lu, L. et al. "Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators." *Nature Machine Intelligence*, 2021. DeepONet.
- Li, Z. et al. "Fourier neural operator for parametric partial differential equations." *ICLR*, 2021. The Fourier neural operator.
- van den Oord, A., Li, Y., Vinyals, O. "Representation learning with contrastive predictive coding." arXiv:1807.03748, 2018. InfoNCE and its mutual-information bound.
- Chen, T. et al. "A simple framework for contrastive learning of visual representations." *ICML*, 2020. SimCLR and the projection head.
- Wang, T., Isola, P. "Understanding contrastive representation learning through alignment and uniformity on the hypersphere." *ICML*, 2020. What the contrastive loss optimises.
- Grill, J.-B. et al. "Bootstrap your own latent: a new approach to self-supervised learning." *NeurIPS*, 2020. BYOL, without negatives.
- Radford, A. et al. "Learning transferable visual models from natural language supervision." *ICML*, 2021. CLIP.
- He, K. et al. "Masked autoencoders are scalable vision learners." *CVPR*, 2022. Masked modelling for images.
- Jacobs, R. A., Jordan, M. I., Nowlan, S. J., Hinton, G. E. "Adaptive mixtures of local experts." *Neural Computation*, 1991. The original mixture of experts.
- Shazeer, N. et al. "Outrageously large neural networks: the sparsely-gated mixture-of-experts layer." *ICLR*, 2017. Sparse top-$k$ gating.
- Fedus, W., Zoph, B., Shazeer, N. "Switch transformers: scaling to trillion parameter models with simple and efficient sparsity." *Journal of Machine Learning Research*, 2022. Top-1 routing, the load-balancing loss, capacity.
- Jiang, A. Q. et al. "Mixtral of experts." arXiv, 2024. The configuration counted in [Section 12](#s12) and the routing analysis.
- DeepSeek-AI. "DeepSeek-V3 technical report." arXiv, 2024. Fine-grained and shared experts; auxiliary-loss-free balancing.
