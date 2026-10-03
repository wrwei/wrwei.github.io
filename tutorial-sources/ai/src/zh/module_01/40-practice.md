## 自测题 {#quiz}

共十二道题，每题约 90 秒；先作答再看解析，答错的题请重读解析中指出的章节。

```quiz
? 正规方程 $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\mathbf{w}) = \mathbf{0}$ 表明，在最小二乘解处，
- [ ] 残差全部为零
- [ ] 权重向量与 $\mathbf{y}$ 正交
- [x] 残差向量与 $\mathbf{X}$ 的每一列正交
- [ ] $\mathbf{X}^\top\mathbf{X}$ 是单位矩阵
> $\mathbf{X}^\top\mathbf{r} = \mathbf{0}$ 表示 $\mathbf{X}$ 的每一列与残差 $\mathbf{r}$ 的内积为零，所以 $\hat{\mathbf{y}}$ 是 $\mathbf{y}$ 在列空间上的正交投影。只有当 $\mathbf{y}$ 本身就在该空间内时残差才会为零，而带噪声的数据从不满足这一点。没有任何条件使 $\mathbf{w}$ 与 $\mathbf{y}$ 正交。只有当各列标准正交时，$\mathbf{X}^\top\mathbf{X}$ 才是单位矩阵。

? 对 $\mathcal{L}(\mathbf{w}) = \tfrac12\mathbf{w}^\top\mathbf{H}\mathbf{w}$ 运行梯度下降，其中 $\mathbf{H}$ 的特征值为 0.5 和 8。哪个学习率会发散？
- [ ] 0.10
- [ ] 0.20
- [ ] 0.24
- [x] 0.26
> 稳定性要求 $\eta < 2/\lambda_{\max} = 2/8 = 0.25$。取 0.26 时，陡峭方向每步被乘以 $1 - 0.26\times8 = -1.08$，因此一边变号一边增长。取 0.24 时因子为 $-0.92$：迭代点来回振荡但在缩小。取 0.10 和 0.20 时，陡峭方向的因子分别为 0.2 和 $-0.6$，而平缓方向的因子（0.95 和 0.90）说明了为什么平缓方向收敛得慢。

? 两个已中心化、互不相关的特征，标准差分别为 1 和 100。$\mathbf{X}^\top\mathbf{X}/N$ 的条件数约为
- [ ] 10
- [ ] 100
- [x] 10,000
- [ ] 1,000,000
> $\mathbf{X}^\top\mathbf{X}/N = \operatorname{diag}(1^2, 100^2)$，所以 $\kappa = 100^2/1^2 = 10^4$：条件数是标准差之比的平方。100 是比值本身，忘了平方。10 是它的平方根。$10^6$ 相当于比值的三次方，没有任何依据。

? 恒定步长的 SGD 已在极小值附近到达噪声底。把学习率减半，大致会
- [ ] 使噪声底保持不变
- [x] 使稳态超额损失减半，并减慢趋近速度
- [ ] 使噪声底翻倍
- [ ] 使迭代点精确收敛到极小值
> 稳态方差为 $\eta s^2/\big(B\lambda(2 - \eta\lambda)\big) \approx \eta s^2/(2B\lambda)$，与 $\eta$ 成正比，所以噪声底减半；而每步的收缩因子 $1 - \eta\lambda$ 变弱，所以趋近变慢。噪声底既不会不变，也不会翻倍。步长恒定时它永远降不到零：精确收敛需要衰减的步长（Robbins–Monro 条件）或不断增大的 batch。

? 如果 $y$ 中的噪声服从拉普拉斯分布，极大似然会用哪种损失来拟合模型？最优的常数预测是什么？
- [ ] 平方误差；均值
- [ ] 交叉熵；众数
- [x] 绝对误差；中位数
- [ ] 绝对误差；均值
> 拉普拉斯分布的负对数似然是 $|y - f(\mathbf{x})|/b$ 加一个常数，所以损失是绝对误差，而使绝对偏差之和最小的常数是中位数。平方误差配均值是高斯情形。交叉熵属于伯努利或类别型结果，不适用于实值目标。“绝对误差；均值”把正确的损失与错误的统计量配在了一起：均值最小化的是平方偏差，而不是绝对偏差。

? 对于二元交叉熵，$\hat p = \sigma(z)$，损失对 logit $z$ 的导数是
- [ ] $(\hat p - y)\,\hat p(1 - \hat p)$
- [x] $\hat p - y$
- [ ] $y - \hat p$
- [ ] $-\log\hat p$
> sigmoid 的导数 $\hat p(1 - \hat p)$ 与对数的导数相消，只剩 $\hat p - y$，它恰好在模型自信地出错时最大。$(\hat p - y)\hat p(1 - \hat p)$ 是 $\tfrac12(\hat p - y)^2$ 经过 sigmoid 的梯度；当 $\hat p$ 在错误的一端饱和时它会消失，这就是该损失训练效果差的原因。$y - \hat p$ 符号错了（它是负梯度）。$-\log\hat p$ 是 $y = 1$ 时的损失本身，不是它的导数。

? 某检测的召回率为 0.8，假阳性率为 0.01。被检测的情况患病率为 0.2%。阳性结果中真阳性的比例约为
- [ ] 80%
- [ ] 50%
- [x] 14%
- [ ] 1%
> 精确率 $= 0.8\times0.002\,/\,(0.8\times0.002 + 0.01\times0.998) = 0.0016/0.0116 = 0.14$。误报约是真检出的六倍，因为阴性样本比阳性样本多 499 倍。80% 是把召回率当成了精确率，忽略了基础比率。1% 是假阳性率，是另一个量。要得到 50%，患病率需约为 1.2%，是这里的六倍。

? 一个 15 次多项式拟合 20 个带噪声的点，训练 RMSE 为 0.11，验证 RMSE 为 0.72，噪声水平为 0.3。偏差-方差分解中的哪一项主导其期望误差？
- [ ] 偏差的平方
- [x] 方差
- [ ] 噪声 $\sigma^2$
- [ ] 都不是：该分解只对线性模型成立
> 这个灵活的模型会跟随其特定训练集的噪声，因此预测随样本变化很大：在[第 8 节](#s8)中，方差占期望测试 MSE 0.96 中的 0.87。它的偏差平方接近零，因为 15 次多项式能够表示目标函数。噪声无论模型如何都贡献 0.09。该分解对平方误差是恒等式，对任何模型都成立。

? 岭回归是权重服从哪种先验下的 MAP 估计？
- [ ] 零均值拉普拉斯分布
- [ ] 均匀分布
- [ ] 没有先验：岭回归是极大似然估计
- [x] 零均值高斯分布
> 高斯先验会给负对数后验加上 $\lVert\mathbf{w}\rVert^2/(2\tau^2)$，得到 $\lambda = \sigma^2/(N\tau^2)$ 的岭回归。拉普拉斯先验加的是 L1 项，得到 Lasso 回归。均匀先验加的是常数，退回到普通的极大似然。岭回归不是极大似然：惩罚项就是先验。

? 下列哪一项不是泄漏？
- [ ] 在全部数据上选出与标签相关性最高的 20 个特征，然后做交叉验证
- [ ] 把同一批试件的重复测量按行划分
- [ ] 交叉验证之前打乱时间序列
- [x] 只在训练折上拟合 `StandardScaler`，并放在 `Pipeline` 内
> 只在训练折上拟合的预处理从未见过验证数据，这是正确的做法。另外三种都让验证信息进入了训练：在全部数据上做特征选择（在[实验 4](#lab4) 中，纯噪声上得到 0.87 的准确率）、同一试件各行之间的分组泄漏，以及时间泄漏，即模型在被评分的那些点的未来数据上训练。

? 把某个特征从毫米改为米，对于哪种模型拟合出的预测不会改变？
- [x] 梯度提升树集成
- [ ] $k$ 近邻
- [ ] RBF 核支持向量机
- [ ] 岭回归
> 树每次只按一个特征的阈值分裂，阈值随缩放一同移动，所以划分和预测都不变。$k$-NN 和 RBF 核使用混合各特征的距离，以米为单位的特征在以毫米为单位的特征旁边几乎消失。岭回归惩罚系数，而系数大小取决于单位，因此缩放之后惩罚对各特征的权重就不同了。

? 在 0–20% 应变范围内的 neo-Hookean 拟合，$c_1$ 的 95% 区间约为 $\pm2\%$，但它在 40% 应变处的预测偏低 13%。最好的解释是
- [ ] 区间计算错了
- [x] 区间量化的是在模型正确前提下的噪声；它不包含拟合范围之外的模型误差
- [ ] 在 0–20% 内增加数据就能修正外推
- [ ] 40% 应变处噪声更大
> [实验 5](#lab5) 中的区间与蒙特卡洛检验一致，所以并没有算错；它是以模型为条件的。材料在 20% 之后变硬（它是 Gent 固体），再多的小应变数据也无法揭示这一点。在该范围内增加数据只会让区间更窄。40% 处噪声更大只会让区间变宽，不会让预测偏移 13%。
```

## 论文导读 {#reading}

读论文不是从第一行读到最后一行。分两遍读，并在第一遍之后决定第二遍是否值得花时间。

**第一遍，5 到 10 分钟。** 读标题、摘要、引言和结论，并只看每张图和每张表及其说明，不看周围的正文。然后用自己的话写下三件事：论文提出的问题、它的主张，以及它给出的证据。如果你无法把主张表述成一个含有数字或比较的句子（“在数据集 C 上，方法 A 比方法 B 高出这么多”），第一遍就没有完成。第一遍结束时，你应当知道这篇论文是否与你相关。

**第二遍，用剩余的时间。** 只读下面的导读指出的章节，其余跳过。读方法部分，直到你能根据描述复现核心图。对每个结果，提出本模块的那些问题：基线是什么，数字是怎么测的，在哪个划分上，区间多大，什么会改变它？先读实验设置再读结果，因为它会告诉你哪些比较是公平的。第一次阅读时跳过证明，除非某个问题问到它；改为检查自己能否说出每个定理的假设。

准备一页笔记，以下面的阅读问题为标题，每个答案写一两句话。读过的论文，是你能复述并批评其主张的论文，而不是你只是看过的论文。所给时间是初读的预算；这些问题值得再读一遍。

::: paper minutes=15
Belkin, M., Hsu, D., Ma, S., Mandal, S. "Reconciling modern machine-learning practice and the classical bias–variance trade-off." *Proceedings of the National Academy of Sciences (PNAS)*, 2019.

**为什么读。** 提出“双下降”这一名称的论文。它说明了[第 8 节](#s8)中经典的 U 形验证曲线在哪里不再是全部图景，以及为什么分解本身依然成立。

**读什么、跳过什么。** 读摘要、引言（到图 1 为止，含图 1），以及关于随机傅里叶特征的一节及其图。跳过理论分析和补充材料。

**阅读时要回答的问题**

1. 什么是插值阈值？对随机傅里叶特征，它位于何处？
2. 越过阈值后，许多参数向量都能精确拟合训练数据。作者选了哪一个？这一选择为什么对测试误差很重要？
3. 双下降是否与你在第 8 节推导的偏差-方差分解相矛盾？用两句话解释。
4. 这篇论文对实践中用验证集选择模型规模意味着什么？

**读完之后。** 把论文中的曲线与[第 8 节](#s8)双下降段落中的数字对比，那些数字把超过 19 次之后的最小范数拟合应用于[实验 3](#lab3) 的设计。在那里，第二次下降并没有低于经典的最小值；检查论文对其实验是否有不同的主张，以及这个答案说明了何时该相信哪一种曲线形状。
:::

::: paper minutes=15
Kapoor, S., Narayanan, A. "Leakage and the reproducibility crisis in machine-learning-based science." *Patterns*, 2023.

**为什么读。** 一份关于已发表的基于机器学习的科学研究中泄漏问题的综述，其分类法把[实验 4](#lab4) 的三种情形变成了一张检查清单，并附有一个案例研究：一旦修复泄漏，复杂模型备受称道的优势就消失了。

**读什么、跳过什么。** 读引言、泄漏分类法（其表格和每一类的定义）以及内战预测案例研究。略读逐领域的综述和模型信息表。

**阅读时要回答的问题**

1. 把实验 4 的三条有泄漏的流水线分别放进论文的分类法中。
2. 在内战案例中，错误被纠正之后，所报告的复杂模型相对于逻辑回归的优势怎么样了？
3. 作者提出的文档规范（模型信息表）中，哪些条目本可以发现实验 4 中的分组泄漏？
4. 说出分类法中的一种泄漏类型，是只打开一次测试集也防不住的，并说明原因。

**读完之后。** 取一次你做过或审阅过的模型评估，把分类法当作检查清单逐项填写，每种泄漏类型一行：“已排除，因为……”或“可能存在，因为……”。你答不上来的部分，就是该评估最薄弱之处。
:::

::: paper minutes=15
Domingos, P. "A few useful things to know about machine learning." *Communications of the ACM*, 2012.

**为什么读。** 一位实践者对本模块正式推导过的那些经验的总结。最后读它，可以检验形式化的版本是否真的记住了；当同事问起本模块讲了什么时，这也是可以递给他的那篇文章。

**读什么、跳过什么。** 读关于“学习 = 表示 + 评估 + 优化”的一节，以及关于泛化、过拟合（含飞镖靶图）、高维下直觉失效、以及更多数据胜过更聪明的算法的各节。其余略读。

**阅读时要回答的问题**

1. Domingos 把学习器拆成表示、评估和优化。把它们对应到[第 1 节](#s1)的五个要素。他让哪些要素保持隐含？
2. 他的四个飞镖靶中，哪一个对应实验 3 中 20 个点上未正则化的 15 次多项式，哪一个对应 1 次拟合？
3. 他说更多数据胜过更聪明的算法。利用第 8 节的学习曲线，说明何时这是对的、何时是错的。
4. 他的高维直觉中，哪一条被[第 11 节](#s11)的子立方体计算量化了，哪一条由[练习 12](#e12) 的 $k$-NN 场景所说明？

**读完之后。** 列出文章中本模块没有涉及的经验（例如特征工程和集成方法），并标注哪个后续模块会讲到每一条。
:::

## 小结 {#summary}

- 一种学习方法由五个选择构成：数据、模型族、损失、优化器和评估。每一个选择都带有一个假设，大多数失败都能追溯到其中之一。
- 最小二乘是一个正交投影：正规方程 $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\mathbf{w}) = \mathbf{0}$ 表明残差与 $\mathbf{X}$ 的每一列正交。
- 在二次函数上，梯度下降收敛当且仅当 $\eta < 2/\lambda_{\max}$（Hessian 的最大特征值），所需步数与条件数 $\kappa = \lambda_{\max}/\lambda_{\min}$ 成正比；中心化并标准化特征是降低 $\kappa$ 最便宜的办法。
- 步长恒定时，SGD 停在与 $\eta/B$ 成正比的噪声底，而不是极小值。收敛需要衰减的步长或更大的 batch，这两个旋钮是在速度与精度之间权衡。
- 损失是负对数似然：高斯噪声给出平方误差（最优常数：均值），拉普拉斯噪声给出绝对误差（中位数），伯努利或类别型结果给出交叉熵。
- 对逻辑回归和 softmax 回归，损失对 logits 的梯度是 $\hat p - y$（或 $\hat{\mathbf{p}} - \mathbf{y}$）：sigmoid 或 softmax 的导数与对数相消，所以自信的错误会产生很大的梯度。
- 指标要根据它所服务的决策来选。精确率取决于基础比率（召回率 0.8、假阳性率 0.01、患病率 0.2% 时，精确率为 0.14），而用期望校准误差和 Brier 分数衡量的校准，是与区分能力不同的另一种性质。
- 测试误差等于偏差平方加方差加噪声。验证曲线、学习曲线和 $k$ 折交叉验证能把模型定位在欠拟合与过拟合之间，在近乎相等的候选之间做选择时，应对照比较的标准误差来判断。
- 岭回归和 Lasso 回归分别是高斯先验和拉普拉斯先验下的 MAP 估计，岭回归的 $\lambda = \sigma^2/(N\tau^2)$：正则化就是先验知识，用少量偏差换取更大的方差下降。双下降在特定条件下是真实存在的现象，但并不取代 U 形曲线。
- 诚实的评估意味着每个拟合的步骤（包括缩放和选择）都在折内进行；划分尊重分组和时间；模型选择是嵌套的；测试集只打开一次（在全部数据上选特征，在实验 4 的纯噪声上得到 0.87 的准确率），并且每个报告的数字都附带区间。在同一测试集上比较两个模型，用配对自助法和 McNemar 精确检验；当两者结论不一致时，如实说明，而不是选你偏爱的那一个。
- 表格数据先做基线：先正则化线性模型，再梯度提升树。重新缩放某个特征会改变 $k$-NN、核方法和岭回归的预测，但不会改变树的预测。
- 参数区间衡量的是给定模型下的噪声，而不是模型误差。在 0–20% 应变上区间为 $\pm2\%$（95%）的 neo-Hookean 拟合，在 40% 处偏低 13%，因此拟合出的模型应当附上它被拟合时所用的范围。

下一模块 [Module 02](module_02_ZH.html) 把本模块的线性模型变成网络：堆叠多层，用反向传播取代手工推导的梯度，用动量法和 Adam 取代朴素 SGD。这里的一切都会延续：损失仍是负对数似然，Hessian 的特征值仍决定训练速度，正则化仍编码先验，而网络的验证分数一旦泄漏，仍然一文不值。

## 参考文献 {#refs}

- Bishop, C. M. "Pattern Recognition and Machine Learning." *Springer*, 2006. 第 1、3、4 章：本模块的概率视角。
- Hastie, T., Tibshirani, R., Friedman, J. "The Elements of Statistical Learning," 2nd ed. *Springer*, 2009. 第 2、3、7 章：最小二乘、岭回归与 Lasso、模型评估和单标准误差规则。
- James, G., Witten, D., Hastie, T., Tibshirani, R. "An Introduction to Statistical Learning," 2nd ed. *Springer*, 2021. 上一本书的入门版配套读物。
- Goodfellow, I., Bengio, Y., Courville, A. "Deep Learning." *MIT Press*, 2016. 第 5 章：机器学习基础。
- Murphy, K. P. "Probabilistic Machine Learning: An Introduction." *MIT Press*, 2022. 在同一套记号下讲极大似然、MAP 和逻辑回归。
- Trefethen, L. N., Bau, D. "Numerical Linear Algebra." *SIAM*, 1997. QR、SVD 与最小二乘的条件性。
- Nocedal, J., Wright, S. J. "Numerical Optimization," 2nd ed. *Springer*, 2006. 梯度下降的收敛速率；Gauss–Newton 与 Levenberg–Marquardt。
- Robbins, H., Monro, S. "A stochastic approximation method." *Annals of Mathematical Statistics*, 1951. SGD 的步长条件。
- Bottou, L., Curtis, F. E., Nocedal, J. "Optimization methods for large-scale machine learning." *SIAM Review*, 2018. SGD 的理论与实践。
- Keskar, N. S. et al. "On large-batch training for deep learning: generalization gap and sharp minima." *ICLR*, 2017. 第 4 节中小 batch、平坦极小值的观察。
- Hoerl, A. E., Kennard, R. W. "Ridge regression: biased estimation for nonorthogonal problems." *Technometrics*, 1970. 岭回归的原始论文。
- Tibshirani, R. "Regression shrinkage and selection via the lasso." *Journal of the Royal Statistical Society, Series B*, 1996. Lasso 回归的原始论文。
- Belkin, M., Hsu, D., Ma, S., Mandal, S. "Reconciling modern machine-learning practice and the classical bias–variance trade-off." *PNAS*, 2019. 双下降；论文导读。
- Nakkiran, P. et al. "Deep double descent: where bigger models and more data hurt." *ICLR*, 2020. 深度网络中的双下降。
- Wolpert, D. H. "The lack of a priori distinctions between learning algorithms." *Neural Computation*, 1996. 没有免费午餐定理。
- Kaufman, S., Rosset, S., Perlich, C., Stitelman, O. "Leakage in data mining: formulation, detection, and avoidance." *ACM Transactions on Knowledge Discovery from Data*, 2012. 对泄漏较早的形式化处理。
- Kapoor, S., Narayanan, A. "Leakage and the reproducibility crisis in machine-learning-based science." *Patterns*, 2023. 论文导读。
- Ambroise, C., McLachlan, G. J. "Selection bias in gene extraction on the basis of microarray gene-expression data." *PNAS*, 2002. 实验 4 的特征选择泄漏。
- Varma, S., Simon, R. "Bias in error estimation when using cross-validation for model selection." *BMC Bioinformatics*, 2006. 为什么要用嵌套交叉验证。
- Cawley, G. C., Talbot, N. L. C. "On over-fitting in model selection and subsequent selection bias in performance evaluation." *Journal of Machine Learning Research*, 2010. 超参数搜索中的同一问题。
- Fawcett, T. "An introduction to ROC analysis." *Pattern Recognition Letters*, 2006. ROC 曲线与 AUC。
- Saito, T., Rehmsmeier, M. "The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets." *PLoS ONE*, 2015. 为什么基础比率影响曲线的选择。
- Niculescu-Mizil, A., Caruana, R. "Predicting good probabilities with supervised learning." *ICML*, 2005. 经典分类器的校准；Platt 与保序重校准。
- Guo, C., Pleiss, G., Sun, Y., Weinberger, K. Q. "On calibration of modern neural networks." *ICML*, 2017. 期望校准误差与温度缩放。
- Efron, B., Tibshirani, R. J. "An Introduction to the Bootstrap." *Chapman & Hall*, 1993. 第 10 节的自助法。
- McNemar, Q. "Note on the sampling error of the difference between correlated proportions or percentages." *Psychometrika*, 1947. 第 10 节的配对检验。
- Dietterich, T. G. "Approximate statistical tests for comparing supervised classification learning algorithms." *Neural Computation*, 1998. 为什么 McNemar 检验适合在同一测试集上比较两个分类器。
- Breiman, L. "Random forests." *Machine Learning*, 2001. 带随机特征子集的装袋树。
- Friedman, J. H. "Greedy function approximation: a gradient boosting machine." *Annals of Statistics*, 2001. 作为函数空间梯度下降的梯度提升。
- Chen, T., Guestrin, C. "XGBoost: a scalable tree boosting system." *KDD*, 2016. 一个广泛使用的提升库。
- Ke, G. et al. "LightGBM: a highly efficient gradient boosting decision tree." *NeurIPS*, 2017. 基于直方图的提升。
- Grinsztajn, L., Oyallon, E., Varoquaux, G. "Why do tree-based models still outperform deep learning on typical tabular data?" *NeurIPS Datasets and Benchmarks Track*, 2022. 表格基线建议背后的基准测试。
- Cortes, C., Vapnik, V. "Support-vector networks." *Machine Learning*, 1995. 软间隔支持向量机。
- Rasmussen, C. E., Williams, C. K. I. "Gaussian Processes for Machine Learning." *MIT Press*, 2006. 高斯过程的标准参考书。
- Arthur, D., Vassilvitskii, S. "k-means++: the advantages of careful seeding." *SODA*, 2007. scikit-learn 的 $k$ 均值默认使用的初始化规则。
- Domingos, P. "A few useful things to know about machine learning." *Communications of the ACM*, 2012. 论文导读。
- Holzapfel, G. A. "Nonlinear Solid Mechanics: A Continuum Approach for Engineering." *Wiley*, 2000. Neo-Hookean 及相关应变能函数。
- Gent, A. N. "A new constitutive relation for rubber." *Rubber Chemistry and Technology*, 1996. 第 12 节和实验 5 的 Gent 模型。
- Bates, D. M., Watts, D. G. "Nonlinear Regression Analysis and Its Applications." *Wiley*, 1988. 非线性最小二乘中的参数不确定性。
- Pedregosa, F. et al. "Scikit-learn: machine learning in Python." *Journal of Machine Learning Research*, 2011. 实验中使用的库。
