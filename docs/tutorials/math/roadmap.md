# Mathematical Foundations Curriculum Roadmap

A complete series connecting mathematical reasoning to programs, algorithms, data, and learning systems. Start with notation and proofs, then follow a CS or AI route through the mathematics each subject uses.

**Status:** All 32 modules, the optional algebra refresher, entry diagnostic, Python primer, and NumPy preparation are implemented in English and Simplified Chinese. Use the [course overview](index.html) for lesson links. This page records the curriculum roadmap.

[Read the detailed series plan](PLAN.md) · [View the roadmap metadata](plan.json)

## Scope and study routes

The full curriculum contains 32 modules, including two capstones, and an optional six-hour algebra refresher. Estimated study time is 328 hours, including required practice and assessment. The routes below let learners choose a narrower foundation. Times are planning estimates.

| Route | Modules | Estimated hours |
|---|---|---|
| Full foundation | 01–32 | 328 |
| CS core | 01–08, 21–24, 31 | 120 |
| AI foundation | 01–06, 09–19, 21–30, 32 | 286 |
| Preparation for the existing AI series | 01–05, 09–13, 15–19, 21–25 | 192 |

The CS route uses the discrete branches of the probability modules. The AI routes include integration before continuous probability. Full constrained SVM duality in Module 30 is an extension requiring Module 20. The detailed plan records all prerequisites and alternative branches.

## Before starting

Learners should be comfortable with arithmetic and simple school algebra. The diagnostic and Module 00 refresher cover fractions, equations, exponents, logarithms, and graph reading. The theory can be studied with pencil and paper; the Python primer introduces the loops and functions used in labs. NumPy notation is introduced with linear algebra. No GPU or paid service is required for the planned labs.

## Module roadmap

Modules 00–32 are available in both languages through the [course overview](index.html). The table lists the implemented curriculum and its estimated study budgets.

| Module | Topic | 中文标题 | Hours |
|---|---|---|---|
| 00 optional | Algebra and Python orientation | 可选代数复习与 Python 入门 | 6 plus optional setup |
| 01 | Mathematical language, numbers, and functions | 数学语言 数与函数 | 6 |
| 02 | Logic, quantifiers, and specifications | 逻辑 量词与规格说明 | 8 |
| 03 | Sets, relations, and discrete structures | 集合 关系与离散结构 | 8 |
| 04 | Proof methods, induction, and invariants | 证明方法 归纳法与不变式 | 10 |
| 05 | Counting, combinatorics, and finite probability | 计数 组合数学与有限概率 | 8 |
| 06 | Sequences, sums, asymptotics, and recurrences | 数列 求和 渐近分析与递推关系 | 10 |
| 07 | Graphs, trees, and state transitions | 图 树与状态转移 | 8 |
| 08 | Modular arithmetic and algebra for computing | 模运算与计算中的代数 | 8 |
| 09 | Vectors, geometry, and array notation | 向量 几何与数组记法 | 8 |
| 10 | Matrices, linear maps, and linear systems | 矩阵 线性映射与线性方程组 | 10 |
| 11 | Vector spaces, bases, rank, and identifiability | 向量空间 基 秩与可辨识性 | 10 |
| 12 | Orthogonality, projections, and least squares | 正交性 投影与最小二乘 | 10 |
| 13 | Eigenvalues, spectral geometry, and quadratic forms | 特征值 谱几何与二次型 | 10 |
| 14 | SVD, low rank approximation, and PCA | 奇异值分解 低秩近似与主成分分析 | 10 |
| 15 | Limits, continuity, and convergence | 极限 连续性与收敛 | 8 |
| 16 | Derivatives, Taylor approximation, and sensitivity | 导数 泰勒近似与敏感性 | 10 |
| 17 | Integration, accumulation, and simple differential equations | 积分 累积与简单微分方程 | 10 |
| 18 | Multivariable derivatives, matrix calculus, and automatic differentiation | 多元微分 矩阵微积分与自动微分 | 12 |
| 19 | Convexity, gradient methods, and unconstrained optimisation | 凸性 梯度方法与无约束优化 | 12 |
| 20 | Constrained optimisation, Lagrange multipliers, and duality | 约束优化 拉格朗日乘子与对偶性 | 12 |
| 21 | Probability models, conditioning, and Bayes rule | 概率模型 条件概率与贝叶斯法则 | 10 |
| 22 | Random variables, distributions, and transformations | 随机变量 分布与变换 | 10 |
| 23 | Expectation, joint distributions, covariance, and dependence | 期望 联合分布 协方差与依赖关系 | 10 |
| 24 | Limit theorems, concentration, and Monte Carlo | 极限定理 集中不等式与蒙特卡洛方法 | 10 |
| 25 | Estimation, likelihood, and Bayesian updating | 参数估计 似然与贝叶斯更新 | 12 |
| 26 | Statistical inference, experiments, and regression | 统计推断 实验设计与回归 | 12 |
| 27 | Information theory, entropy, and probabilistic objectives | 信息论 熵与概率目标函数 | 10 |
| 28 | Stochastic optimisation, regularisation, and training dynamics | 随机优化 正则化与训练动态 | 12 |
| 29 | Numerical computation, conditioning, and reliable experiments | 数值计算 条件数与可靠实验 | 12 |
| 30 | Generalisation, kernels, and mathematical learning theory | 泛化 核方法与数学学习理论 | 12 |
| 31 | CS capstone: verified dependency planner | 计算机科学综合项目 可验证的依赖规划器 | 14 |
| 32 | AI capstone: a learning pipeline with mathematical checks | 人工智能综合项目 具备数学检验的学习流程 | 16 |

## What the modules contain

Modules 01–30 implement six concept sections, at least six worked examples, three executed CPU-only labs, twelve required exercises, two optional extensions, ten quiz questions, four original bilingual figures and an accessible explorer. Every module specifies outcomes, prerequisites, four-session study budget, failure cases, readings and exit assessment. Quizzes and project defences include saved written responses shared between language editions.

The implemented CS capstone combines graph modelling, correctness proofs, cycle witnesses, algorithm analysis, checksum counterexamples and exact/simulated uncertainty. The AI capstone combines training-only scaling/PCA, differentiation, likelihoods, stable computation, validation selection, mandatory fault diagnostics and frozen evaluation on the specified synthetic dataset. Each includes runnable reference scripts, actual outputs/plots and a weighted assessment rubric.

The [detailed plan](PLAN.md) contains the full lesson sequence, specific examples, lab tasks, assessment criteria, dependency map, reading catalogue, bilingual notation policy and production checklist. All planned module groups are available; study estimates remain provisional until learner pilots.

## Related tutorials

[Computer Science Fundamentals](../cs/index.html) introduces computation and the systems around it. [AI from Machine Learning to Large Language Models](../ai/index.html) applies the continuous mathematics this series develops.
