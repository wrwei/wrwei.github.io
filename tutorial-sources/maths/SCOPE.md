# Mathematical Foundations for AI — agreed scope (confirmed by Will, 1 Oct 2026)

Build AFTER the AI series ("From Machine Learning to Large Language Models", `tutorial-sources/ai`)
is published on wrwei.github.io. Same format as the AI series: 10 modules x ~10 hours (5 sessions;
concepts with full derivations, NumPy labs that are executed, 15-20 graded exercises with solutions,
10-12 quiz questions, 2-3 guided readings), bilingual EN / 中文, published under
docs/tutorials/<dir>/ with a card on docs/tutorials/index.md. Reuse the AI series toolchain
(`tutorial-sources/ai/tools`: build.mjs, check.mjs, labrun.py, shot.mjs, widget-test.mjs).

Starting level (confirmed): school algebra plus a first course in calculus. Ends at the level the
AI series assumes, plus the extra maths its later modules use. Each module says which AI-series
modules use it; afterwards add "maths refresher" back-links into the AI series.

1. Vectors, matrices and linear maps (LA I): vectors, dot products, norms (L1, L2, Linf), angles,
   cosine similarity; matrices as linear maps; four views of matrix multiplication; span,
   independence, basis, rank, column/null space; linear systems, inverse, determinant as volume;
   orthogonality, projections, Gram-Schmidt; tensors, shapes, broadcasting, einsum.
   Used in AI 01, 02, 06.
2. Eigenvalues, SVD and decompositions (LA II): eigen-decomposition, diagonalisation; spectral
   theorem, positive-definite matrices, quadratic forms; SVD geometry, low-rank approximation, PCA;
   matrix norms, condition number, pseudo-inverse; QR, Cholesky. Used in AI 01, 04, 09, 10.
3. Calculus and matrix calculus: chain rule; derivatives of exp/log/sigmoid/softmax; gradients,
   Jacobians, Hessians; Taylor expansion and optimisation; matrix-calculus identities and layout
   conventions; computational graphs, forward/reverse mode, gradient checking; integrals as
   expectations, change of variables. Used in AI 02, 06, 09.
4. Probability: conditional probability, Bayes, independence; PMF/PDF/CDF, expectation, variance,
   covariance; common distributions incl. multivariate Gaussian; joint/marginal/conditional;
   transformations and the reparameterisation trick; LLN, CLT; Monte Carlo, importance sampling.
   Used in AI 01, 05, 07, 09.
5. Statistics and inference: estimators, bias, variance, bias-variance; MLE; MAP and priors as
   regularisers; conjugate updates; confidence intervals, bootstrap; hypothesis tests, multiple
   comparisons, paired model comparisons; benchmark noise, calibration, leakage. Used in AI 01, 07, 09.
6. Information theory: entropy (bits/nats), cross-entropy, KL (Jensen; >= 0; asymmetry), mutual
   information; perplexity and compression; ELBO; InfoNCE; temperature and entropy.
   Used in AI 01, 02, 05, 07, 09.
7. Optimisation: convexity; GD convergence and condition number; SGD noise, mini-batches,
   schedules; momentum, AdaGrad, RMSProp, Adam derived; weight decay vs L2; Lagrange/KKT incl. the
   KL-constrained objective; saddle points, flat vs sharp minima; Newton, L-BFGS. Used in AI 01, 02, 08, 09.
8. Numerical computing: IEEE floating point (fp32/fp16/bf16/fp8), rounding, overflow/underflow;
   cancellation, log-sum-exp, stable softmax; conditioning vs stability; mixed precision, loss
   scaling; integer quantisation arithmetic; non-associative sums and reproducibility; FLOP and byte
   counting, roofline. Used in AI 02, 08, 10.
9. Signals, sequences, graphs and geometry: convolution, Fourier transform, convolution theorem;
   complex numbers and rotations; linear recurrences and stability; adjacency and Laplacian
   matrices; high-dimensional geometry, concentration, why scale by sqrt(d). Used in AI 03, 04, 05, 06.
10. Stochastic processes, decisions and generative models: Markov chains, stationary distributions;
   MDPs, value functions, Bellman equations; policy gradients (REINFORCE, baselines, advantages,
   PPO clipped ratio, GRPO group-relative advantages); Brownian motion and Langevin dynamics; score
   functions and forward/reverse diffusion. Used in AI 05, 07, 09.
