## 自测题 {#quiz}

共 12 道题，每题只有一个正确答案。先不回看正文作答，再读每一条解析，包括你排除的那些选项的解析，因为每个错误选项都是人们真实会犯的错误。

```quiz
? 一个 3 × 3 卷积把 32 个输入通道映射到 64 个输出通道，每个输出通道有一个偏置。它有多少个参数？
- [ ] 18,432
- [ ] 2,048
- [x] 18,496
- [ ] 4,718,592
> 参数量为 $k^2 C_{\text{in}} C_{\text{out}} + C_{\text{out}} = 9 \times 32 \times 64 + 64 = 18{,}496$。18,432 漏掉了 64 个偏置；2,048 忽略了 3 × 3 的空间范围（$32 \times 64$ 是 1 × 1 卷积的参数量）；4,718,592 是 16 × 16 输出特征图上的乘加次数（$18{,}432 \times 256$），它取决于特征图的大小，而参数量与之无关。

? 输入宽度 64，卷积核大小 3，空洞 2，填充 1，步长 1。输出宽度是多少？
- [ ] 64
- [ ] 60
- [x] 62
- [ ] 63
> 输出宽度为 $\lfloor (64 + 2\cdot 1 - 2\cdot(3-1) - 1)/1 \rfloor + 1 = 62$。带空洞的卷积核跨越 $d(k-1) + 1 = 5$ 个输入，所以“same”填充需要 $p = 2$，得到 64（忽略空洞时也得到 64，即 $64 + 2 - 2 - 1 + 1$）；60 是不填充的结果；63 既忽略了空洞，又丢掉了最后的 $+1$，即 $64 + 2 - 2 - 1 = 63$。

? 在循环填充下，下列哪种运算对输入的一个像素的循环平移是严格等变的？
- [ ] 步长为 2 的 2 × 2 最大池化
- [ ] 步长为 2 的 3 × 3 卷积
- [ ] 展平后接一个全连接层
- [x] 步长为 1 的 3 × 3 卷积
> 步长为 1 的卷积与每一个整数平移都可交换。步长为 2 的运算（池化和步长卷积）只对 2 的倍数的平移是等变的：一个像素的平移会改变被采样的窗口，这正是[第 5 节](#s5)所讨论的混叠的来源。展平特征图上的全连接层对每个位置都有单独的权重，完全没有等变性。

? 堆叠四个 3 × 3 卷积。第二个的步长为 2，其余的步长为 1，都不带空洞。最后一层输出的感受野是多少？
- [ ] 9
- [ ] 11
- [x] 13
- [ ] 17
> 第一层之后感受野为 3，第二层之后为 5；第二层的步长使跳距变为 2，所以第三层和第四层各增加 $(3-1) \times 2 = 4$，依次得到 9 和 13。如果所有步长都为 1，答案是 9（3、5、7、9）；17 要求第三层的步长也为 2（3、5、9、17）；11 只在第三层用了加倍的跳距，又让第四层只增加 2（3、5、9、11），忘了跳距对之后的每一层都保持加倍。

? 把一个输入和输出均为 256 通道的标准 3 × 3 卷积，替换为逐通道 3 × 3 卷积再接一个 1 × 1 卷积。乘加次数大约降低多少倍？
- [ ] 2
- [ ] 256
- [x] 8.7
- [ ] 恰好 9
> 开销比为 $1/C_{\text{out}} + 1/k^2 = 1/256 + 1/9 = 0.115$，即 8.7 倍。只有当 $C_{\text{out}}$ 无限增大时它才趋近 9，所以对任何真实的层，“恰好 9”都是错的。256 倍要求通道混合不花任何代价，而 2 倍只对通道很少的层成立。

? 在由残差块 $\mathbf{h}_{l+1} = \mathbf{h}_l + F(\mathbf{h}_l)$ 组成的网络中，为什么即使网络很深，梯度也能到达早期的层？
- [ ] 残差分支是线性的，所以它们的雅可比矩阵是单位矩阵
- [ ] 批归一化在每个块上重新缩放梯度，所以梯度不会消失
- [x] 每个块的雅可比矩阵是 $\mathbf{I} + \partial F/\partial \mathbf{h}$，所以梯度中有一项原封不动地穿过每个块
- [ ] 捷径减少了参数量，所以每个参数分到更大份额的梯度
> 展开递推式得到 $\partial \mathcal{L}/\partial \mathbf{h}_l = \partial \mathcal{L}/\partial \mathbf{h}_L\,(\mathbf{I} + \partial/\partial \mathbf{h}_l \sum_i F_i)$：无论分支做什么，恒等项都把顶层梯度送到每一层。分支是非线性的，它们的雅可比矩阵也不是单位矩阵。在[实验 3](#lab3) 中，单靠批归一化并没有挽救朴素网络：在 55 层时，它的 stem 梯度不是消失，而是爆炸（约 190）。参数量与此无关。

? 你用 `requires_grad=False` 冻结了预训练的骨干网络，在整个模型处于 `train()` 模式时训练新的分类头，结果发现骨干网络的输出发生了漂移。原因是什么？
- [ ] 优化器仍对被冻结的权重施加权重衰减
- [ ] 学习率调度重新初始化了骨干网络
- [ ] dropout 掩码存储在权重中
- [x] 无论 `requires_grad` 如何，批归一化的滑动均值和方差在 train 模式下都会更新
> `requires_grad=False` 阻止了梯度更新，但处于 train 模式的批归一化层会用你的 batch 的统计量覆盖它的滑动统计量，从而改变它在评估模式下的输出。每次调用 `model.train()` 之后，都要把被冻结的块重新设为 `eval()` 模式。PyTorch 的优化器会跳过没有梯度的参数（而且被冻结的参数通常根本不会传给优化器），dropout 不在权重中保存任何状态，而学习率调度改变的是学习率，不是权重。

? 两个 10 × 10 的框相互重叠，其中一个相对另一个在 $x$ 方向偏移 5 个像素，在 $y$ 方向偏移 5 个像素。它们的 IoU 是多少？
- [ ] 0.25
- [ ] 0.5
- [x] 0.143
- [ ] 0.125
> 交集为 $5 \times 5 = 25$，并集为 $100 + 100 - 25 = 175$，IoU 为 $25/175 = 0.143$。0.25 是用交集除以一个框的面积，而不是除以并集；0.5 是每条边重叠的比例；0.125 是除以两个面积之和 $200$，忘了减去一次交集。

? 非极大值抑制做什么？
- [ ] 删除得分低于其类别最高得分的所有框
- [ ] 在每个池化窗口中抑制低于最大值的激活
- [ ] 把重叠的框平均成一个框
- [x] 反复保留得分最高的框，并删除同一类别中与它的 IoU 超过阈值的其他框
> NMS 是按类别运行的贪心去重。第一项会删除该类别的所有其他目标，无论它们离得多远；第二项描述的是最大池化；把重叠的框平均是另一种方法（加权框融合），有不同的失败模式。NMS 自己的失败恰好相反：两个真实目标的重叠超过阈值时，得分较低的那个会被删除，Soft-NMS 缓解了这一点。

? U-Net 为什么把编码器的特征图拼接进解码器？
- [ ] 为了减少解码器的参数量
- [ ] 为了让每个块都成为残差块，使网络在深度上可训练
- [ ] 为了让网络接受任意大小的输入
- [x] 为了给解码器提供高分辨率特征，使目标边界能被精确定位
> 瓶颈处已经丢失了空间细节，跳跃连接在每个分辨率上把它带回来。在[实验 5](#lab5) 中，它们把距真实边缘 2 个像素以内的像素准确率从 0.920 提高到 0.950，而整体 Dice 只从 0.952 变为 0.965。拼接会增加解码器的参数（输入通道数翻倍）；它不是残差求和；它使尺寸约束更严而不是更松，因为两张特征图的高和宽必须一致。

? 在一个前景像素占 0.6% 的数据集上，某个模型在所有位置都预测为背景。它的像素准确率和 Dice 系数分别是多少？
- [ ] 0.6% 和 0
- [ ] 99.4% 和 0.994
- [x] 99.4% 和 0
- [ ] 50% 和 0.5
> 准确率计入的是占 99.4%、被正确标为背景的像素。Dice 为 $2TP/(2TP + FP + FN)$，当 $TP = 0$ 时为 0。这就是分割要用前景类别的 Dice 或 IoU 来报告的原因：像素准确率奖励多数类。第一项把前景比例当成了准确率，第二项认为 Dice 系数等于准确率，而 50% 描述的是一个随机猜测的模型。

? 在 Grad-CAM 中，特征图 $k$ 对类别 $c$ 的权重 $\alpha_k^c$ 是：
- [ ] 特征图 $k$ 的最大激活
- [ ] $y^c$ 对输入像素的梯度
- [x] $\partial y^c/\partial A^k_{ij}$ 在该特征图各位置上的空间平均
- [ ] 总是等于分类器权重 $w_k^c$
> 按定义，$\alpha_k^c = \frac{1}{Z}\sum_{i,j} \partial y^c/\partial A^k_{ij}$。只有对全局平均池化加线性分类头的情形，即 CAM 的情形，它才等于 $w_k^c/Z$，而不是 $w_k^c$；对输入像素的梯度是显著图，是另一种东西；最大激活则与类别完全无关。
```

## 论文导读 {#reading}

读论文要读两遍，而不是一遍。第一遍用五分钟，并不是通常意义上的阅读：你只看标题、摘要和引言、各节标题、图及其说明，以及结论。然后用一句话写下作者的主张，并判断这一主张对你是否重要。大多数论文到这里就可以放下了。第二遍就是下面的时间估计所对应的那一遍。你带着笔，读导读中指明的部分，并亲手做那些论文要求你“想当然接受”的工作：复现一个推导，核对表格中的一个数字与正文所述是否一致，记下论证所需的每一个假设。阅读问题是浓缩版的第二遍。读论文之前先读这些问题，这样论文就会在你读的过程中逐一作答。第三遍是重新实现该方法，本模块的实验已经对卷积、残差网络和 U-Net 做过了。Keshav 的 "How to read a paper"（在参考文献中）用三页篇幅描述了这一习惯。

这两篇论文覆盖了本模块的主线：让深度变得可训练的论文（[第 8 节](#s8)），以及为分割确立范式的论文（[第 12 节](#s12)）。两篇合计 45 分钟。下面的节号和图号以会议版为准；同一论文的 arXiv 版可能略有不同，如果编号对不上，请以标题为准。

::: paper minutes=25
He, K., Zhang, X., Ren, S., Sun, J. "Deep residual learning for image recognition." *IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 2016.

**为什么读它。** 正是这篇论文让深度变得可训练。它从一个实验（退化问题）出发，推出一个想法（残差连接），并用干净的消融实验支撑这个想法。它的块 $\mathbf{x} + F(\mathbf{x})$ 重新出现在每一个 Transformer 中。它的运算量统计的是乘加次数，后来的视觉论文沿袭了这一约定（[第 4 节](#s4)）。

**读哪些部分。** 读第 1 节和图 1。读第 3.1 至 3.3 节（残差学习、恒等捷径，以及图 3 和表 1 中的架构）。在第 4.1 节中，读朴素网络与残差网络的对比（图 4 和表 2）、捷径选项 A、B 和 C（表 3），以及瓶颈设计（图 5）。读第 4.2 节关于 CIFAR-10 的内容（图 6 和表 6）。其余的 ImageNet 对比表格略读即可。跳过第 2 节（相关工作）、第 4.3 节的目标检测结果，以及 arXiv 版中关于检测与定位的附录。

**阅读时要回答的问题。**

1. 图 1 显示 56 层朴素网络的训练误差高于 20 层网络。为什么这排除了过拟合？第 1 节中的哪个论证说明，更深的模型至少应当和较浅的模型一样好？
2. 论文以 FLOPs 给出运算量，表 1 中 ResNet-18 为 $1.8 \times 10^9$。根据 ResNet-18 的层列表，自己统计它在 224 × 224 下的乘加次数（[第 4 节](#s4)给出的是 1.81 G），并判断论文采用的是哪种约定。当你与一篇把乘法和加法分开计数的论文比较时，为什么这一点很重要？
3. 捷径选项 A、B 和 C（表 3）分别是什么？它们的误差相差多少？作者为什么得出投影捷径并非必不可少的结论？
4. 对 256 个通道，统计图 5（右）中瓶颈块的权重数，不计偏置和批归一化参数，并与 256 通道的两个 3 × 3 卷积比较。（答案：69,632 对 1,179,648。）
5. 在 CIFAR-10 上，1,202 层网络的训练误差与 110 层网络相近，但测试误差更高（7.93% 对 6.43%）。原因是什么？它与退化问题有何不同？

**读完之后。** 凭记忆把[第 8 节](#s8)的残差块写成一个 PyTorch 模块，包括宽度改变时的投影捷径，并与论文的图 5（左）和式 2 对照。然后用两句话说明：[实验 3](#lab3) 在 8 × 8 数字上用 55 层（而不是在 CIFAR-10 上用 56 层），复现了论文主张中的哪些部分，又有哪些未能复现。
:::

::: paper minutes=20
Ronneberger, O., Fischer, P., Brox, T. "U-Net: Convolutional networks for biomedical image segmentation." *Medical Image Computing and Computer-Assisted Intervention (MICCAI)*, 2015.

**为什么读它。** 这篇短文确立了生物医学分割的标准架构。有了[第 3 节](#s3)的输出尺寸公式，它图 1 中的每个数字都可以核对；而且论文坦率地说明了自己是在极少的标注图像上工作的。

**读哪些部分。** 完整地读第 1 至 3 节，连同图 1 至 3（架构、重叠分块策略，以及用于相互接触的细胞的权重图），包括数据增强一小节（3.1）。略读第 4 节，了解训练图像的数量和所用的指标。跳过对比表格的细节。

**阅读时要回答的问题。**

1. 用输出尺寸公式，追踪图 1 中特征图从 572 × 572 到 388 × 388 的尺寸变化。在拼接之前，第一张编码器特征图的每一侧必须裁掉多少像素？（568 到 392：88。）
2. 重叠分块策略（图 2）解决的是什么问题？作者为什么在图像边界处做镜像？
3. 式 2 中的权重图 $w(\mathbf{x})$ 是做什么用的？它针对的是普通逐像素交叉熵的哪种失败？
4. 当只有少量标注图像时，作者特别指出哪种数据增强是关键？为什么它适合显微图像？
5. 论文中的卷积不做填充。如果做填充，架构和分块推理会有什么变化？

**读完之后。** 把论文的架构与[实验 5](#lab5) 的 U-Net 比较：列出三处不同（填充、深度与宽度、损失），并说明每一处带来的代价或收益。然后对照实验 5 的测量结果，检验[第 12 节](#s12)的论断，即跳跃连接对边界精度的作用大于对整体 Dice 的作用，再判断论文自身的证据能否区分这两者。
:::

## 小结 {#summary}

- 把图像展平成向量，会丢掉它的邻域结构，并使全连接层对每一对像素都要付出一个权重；卷积通过局部连接和权值共享恢复了这两者，所以一个 3 × 3 层无论图像多大都只有 $9 C_{\text{in}} C_{\text{out}} + C_{\text{out}}$ 个参数，而且它的响应对平移是等变的。
- 深度学习库所说的卷积其实是互相关：卷积核不翻转。输出尺寸为 $\lfloor (H + 2p - d(k-1) - 1)/s \rfloor + 1$；感受野在每一层增加 $(k-1)$ 乘以当前跳距，而跳距会乘以每一层的步长；有效感受野比理论感受野小。
- 一个层的开销用参数、乘加运算（MAC）和激活内存来计数：在 56 × 56 特征图上从 64 到 128 通道的 3 × 3 层有 73,856 个参数和 2.31 亿次 MAC，即不计偏置加法时的 462.4 MFLOPs，FLOPs 等于 MAC 的两倍。ResNet、EfficientNet 和 ConvNeXt 论文中的“FLOPs”，以及 MobileNet 的“Mult-Adds”，都是 MAC。更廉价的层把工作拆开：1 × 1 卷积在单个位置上混合通道，分组卷积把通道分成相互独立的组，深度可分离卷积（逐通道 3 × 3，再接 1 × 1）的开销是标准卷积的 $1/C_{\text{out}} + 1/k^2$，在 256 通道时 MAC 约少 8.7 倍，代价是在真实硬件上的算术强度较低。
- 池化和步长用分辨率换取感受野和一定的不变性，但带步长的运算只对步长整数倍的平移是等变的，所以网络的平移不变性比其设计所暗示的要弱；抗混叠下采样能恢复一部分。
- 每种经典架构各贡献了一个想法：LeNet 是卷积-池化-全连接的模式；AlexNet 是 ReLU、dropout 和大规模 GPU 训练（ILSVRC-2012 的 top-5 误差为 15.3%，第二名为 26.2%）；VGG 是由统一的 3 × 3 堆叠带来的深度；Inception 是带 1 × 1 降维的多尺度分支，以及用全局平均池化代替大型全连接层。
- 超过一定深度的朴素网络，训练得比更浅的网络还差，即使在训练集上也是如此（退化问题）。残差块 $\mathbf{h}_{l+1} = \mathbf{h}_l + F(\mathbf{h}_l)$ 的雅可比矩阵是 $\mathbf{I} + \partial F/\partial \mathbf{h}$，所以梯度中有一项原封不动地到达每一层；在实验 3 中，55 层朴素网络的 stem 梯度在不做归一化时下溢为 0，做归一化时则爆炸，而残差网络的梯度在每个深度上都保持在 0.02 到 0.09 之间。
- 后来的 CNN 改进了这一配方，而没有取代它：DenseNet 拼接特征，MobileNet 和 EfficientNet 通过可分离卷积和复合缩放高效地使用参数和算力，ConvNeXt 则表明，与视觉 Transformer 之间的差距很大一部分来自训练配方和设计细节，而不是注意力。截至 2026 年，CNN 与 Transformer 并存，如何选择取决于数据、时延和硬件。
- 训练好一个 CNN，主要靠架构之外的决策：保持标签不变的数据增强（当它破坏任务的对称性时可能有害，就像对居中的数字做平移和旋转那样）；batch 太小、批归一化不适用时改用组归一化；以及迁移学习，其中早期层迁移得好，后期层则专属于任务。被冻结的批归一化层必须保持在 eval 模式。
- 目标检测预测边界框：IoU 衡量重叠程度，锚框为网络提供参考形状，非极大值抑制贪心地去除重复，平均精度概括精确率-召回率曲线；单阶段检测器以一些精度换取速度，焦点损失则对付大量容易的背景锚框。
- 分割为每个像素打标签。U-Net 的编码器汇集上下文，解码器恢复分辨率，拼接的跳跃连接送回边界所需的细节。使用 Dice 和 IoU（二者满足 $D = 2J/(1+J)$），是因为像素准确率奖励预测背景（前景像素占 0.6% 时，准确率为 99.4%，Dice 为 0）。
- 同样的机制也适用于一维和三维。掩码只有借助体素间距才能成为测量值，所以间距要随数据一起传递，而测得的表面积和体积带有误差预算（按错误的间距读取一个各向异性的椭球，报告的体积是真实值的两倍）。
- 显著图和 Grad-CAM 显示分类器的输出依赖哪些输入区域，却不能说明原因。Grad-CAM 的权重为 $\alpha_k^c = \frac{1}{Z}\sum_{i,j}\partial y^c/\partial A^k_{ij}$，它在实验 6 中揭露了一个依赖虚假线索的分类器；在任何人信任一张图之前，都需要先做合理性检验。

[模块 04](module_04_ZH.html) 保留了使卷积奏效的想法，即在各个位置之间共享权重，但把它沿时间而不是沿空间应用：循环网络在每一步都复用同一组权重，所以它的梯度是同一个矩阵的多次连乘，这正是你在实验 3 中测得的梯度消失与爆炸，只是换了一副面孔。[第 13 节](#s13)的一维卷积是两者之间的桥梁，模块 04 会把它们与循环直接比较。[模块 06](module_06_ZH.html) 随后用能够自己选择邻居的注意力取代固定的局部窗口，它的 Transformer 块原封不动地沿用了[第 8 节](#s8)的残差连接。

## 参考文献 {#refs}

- LeCun, Y., Bottou, L., Bengio, Y., Haffner, P. "Gradient-based learning applied to document recognition." *Proceedings of the IEEE*, 1998. LeNet-5；[第 7 节](#s7)中的参数量和连接数出自此处。
- Krizhevsky, A., Sutskever, I., Hinton, G. E. "ImageNet classification with deep convolutional neural networks." *NeurIPS*, 2012. AlexNet。
- Russakovsky, O. et al. "ImageNet large scale visual recognition challenge." *International Journal of Computer Vision*, 2015. ILSVRC 各项数字的定义。
- Simonyan, K., Zisserman, A. "Very deep convolutional networks for large-scale image recognition." *ICLR*, 2015. VGG。
- Lin, M., Chen, Q., Yan, S. "Network in network." *ICLR*, 2014. 1 × 1 卷积与全局平均池化。
- Szegedy, C. et al. "Going deeper with convolutions." *CVPR*, 2015. GoogLeNet 与 inception 模块。
- He, K., Zhang, X., Ren, S., Sun, J. "Deep residual learning for image recognition." *CVPR*, 2016. ResNet；论文导读。
- He, K., Zhang, X., Ren, S., Sun, J. "Identity mappings in deep residual networks." *ECCV*, 2016. 预激活块，以及[第 8 节](#s8)的梯度推导。
- Goyal, P. et al. "Accurate, large minibatch SGD: Training ImageNet in 1 hour." *arXiv*, 2017. 把每个残差分支最后一个批归一化的缩放因子初始化为零。
- Xie, S., Girshick, R., Dollár, P., Tu, Z., He, K. "Aggregated residual transformations for deep neural networks." *CVPR*, 2017. ResNeXt 与分组卷积。
- Huang, G., Liu, Z., van der Maaten, L., Weinberger, K. Q. "Densely connected convolutional networks." *CVPR*, 2017. DenseNet。
- Howard, A. G. et al. "MobileNets: Efficient convolutional neural networks for mobile vision applications." *arXiv*, 2017. 深度可分离网络及其开销公式。
- Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., Chen, L.-C. "MobileNetV2: Inverted residuals and linear bottlenecks." *CVPR*, 2018. 倒残差块。
- Tan, M., Le, Q. V. "EfficientNet: Rethinking model scaling for convolutional neural networks." *ICML*, 2019. 复合缩放；文中引用的数字出自 ICML 版的表 2（后来的 arXiv 修订版报告 EfficientNet-B0 为 77.1%）。
- Liu, Z., Mao, H., Wu, C.-Y., Feichtenhofer, C., Darrell, T., Xie, S. "A ConvNet for the 2020s." *CVPR*, 2022. ConvNeXt；配方与架构对比的路线图（图 2，每一步的数值见 arXiv 版附录 C 的表 10；ConvNeXt-T 见表 1）。
- Dosovitskiy, A. et al. "An image is worth 16x16 words: Transformers for image recognition at scale." *ICLR*, 2021. 视觉 Transformer；见[模块 06](module_06_ZH.html)。
- Wu, Y., He, K. "Group normalization." *ECCV*, 2018. 在通道组上做归一化，与 batch 大小无关。
- Zhang, H., Cisse, M., Dauphin, Y. N., Lopez-Paz, D. "mixup: Beyond empirical risk minimization." *ICLR*, 2018. 以样本和标签的凸组合做数据增强。
- Yun, S. et al. "CutMix: Regularization strategy to train strong classifiers with localizable features." *ICCV*, 2019. 在图像之间粘贴图像块的数据增强。
- Yosinski, J., Clune, J., Bengio, Y., Lipson, H. "How transferable are features in deep neural networks?" *NeurIPS*, 2014. 早期层通用、后期层专用（[实验 4](#lab4)）。
- He, K., Girshick, R., Dollár, P. "Rethinking ImageNet pre-training." *ICCV*, 2019. 数据和训练时间足够时，从头训练可以追平预训练。
- Raghu, M., Zhang, C., Kleinberg, J., Bengio, S. "Transfusion: Understanding transfer learning for medical imaging." *NeurIPS*, 2019. ImageNet 迁移在医学影像中还剩多少作用。
- Girshick, R., Donahue, J., Darrell, T., Malik, J. "Rich feature hierarchies for accurate object detection and semantic segmentation." *CVPR*, 2014. R-CNN。
- Ren, S., He, K., Girshick, R., Sun, J. "Faster R-CNN: Towards real-time object detection with region proposal networks." *NeurIPS*, 2015. 锚框与区域提议网络。
- Redmon, J., Divvala, S., Girshick, R., Farhadi, A. "You only look once: Unified, real-time object detection." *CVPR*, 2016. YOLO。
- Liu, W. et al. "SSD: Single shot multibox detector." *ECCV*, 2016. 使用多尺度锚框的单阶段检测。
- Lin, T.-Y., Goyal, P., Girshick, R., He, K., Dollár, P. "Focal loss for dense object detection." *ICCV*, 2017. RetinaNet 与焦点损失。
- Bodla, N., Singh, B., Chellappa, R., Davis, L. S. "Soft-NMS: Improving object detection with one line of code." *ICCV*, 2017. 衰减得分而不是删除框。
- Carion, N. et al. "End-to-end object detection with transformers." *ECCV*, 2020. DETR；不用锚框和 NMS 的检测。
- He, K., Gkioxari, G., Dollár, P., Girshick, R. "Mask R-CNN." *ICCV*, 2017. 实例分割。
- Everingham, M. et al. "The PASCAL visual object classes (VOC) challenge." *International Journal of Computer Vision*, 2010. IoU 为 0.5 时的平均精度。
- Lin, T.-Y. et al. "Microsoft COCO: Common objects in context." *ECCV*, 2014. 在多个 IoU 阈值上取平均的平均精度。
- Long, J., Shelhamer, E., Darrell, T. "Fully convolutional networks for semantic segmentation." *CVPR*, 2015. 用卷积网络做稠密预测。
- Ronneberger, O., Fischer, P., Brox, T. "U-Net: Convolutional networks for biomedical image segmentation." *MICCAI*, 2015. 论文导读。
- Çiçek, Ö., Abdulkadir, A., Lienkamp, S. S., Brox, T., Ronneberger, O. "3D U-Net: Learning dense volumetric segmentation from sparse annotation." *MICCAI*, 2016. 三维扩展。
- Milletari, F., Navab, N., Ahmadi, S.-A. "V-Net: Fully convolutional neural networks for volumetric medical image segmentation." *3DV*, 2016. Dice 损失。
- Odena, A., Dumoulin, V., Olah, C. "Deconvolution and checkerboard artifacts." *Distill*, 2016. 转置卷积为什么会留下棋盘格伪影。
- Dumoulin, V., Visin, F. "A guide to convolution arithmetic for deep learning." *arXiv*, 2016. 卷积和转置卷积的输出尺寸，附示意图。
- Yu, F., Koltun, V. "Multi-scale context aggregation by dilated convolutions." *ICLR*, 2016. 用于稠密预测的空洞卷积。
- van den Oord, A. et al. "WaveNet: A generative model for raw audio." *arXiv*, 2016. 空洞因果卷积。
- Bai, S., Kolter, J. Z., Koltun, V. "An empirical evaluation of generic convolutional and recurrent networks for sequence modeling." *arXiv*, 2018. 时间卷积网络。
- Lorensen, W. E., Cline, H. E. "Marching cubes: A high resolution 3D surface construction algorithm." *SIGGRAPH*, 1987. [第 13 节](#s13)的等值面算法。
- Luo, W., Li, Y., Urtasun, R., Zemel, R. "Understanding the effective receptive field in deep convolutional neural networks." *NeurIPS*, 2016. 有效感受野为什么比理论感受野小。
- Zhang, R. "Making convolutional networks shift-invariant again." *ICML*, 2019. 抗混叠下采样。
- Azulay, A., Weiss, Y. "Why do deep convolutional networks generalize so poorly to small image transformations?" *Journal of Machine Learning Research*, 2019. 实测的平移不变性损失。
- Zeiler, M. D., Fergus, R. "Visualizing and understanding convolutional networks." *ECCV*, 2014. 可视化特征图对什么产生响应。
- Simonyan, K., Vedaldi, A., Zisserman, A. "Deep inside convolutional networks: Visualising image classification models and saliency maps." *ICLR Workshop*, 2014. 梯度显著图。
- Zhou, B., Khosla, A., Lapedriza, A., Oliva, A., Torralba, A. "Learning deep features for discriminative localization." *CVPR*, 2016. 类激活图。
- Selvaraju, R. R. et al. "Grad-CAM: Visual explanations from deep networks via gradient-based localization." *ICCV*, 2017. 梯度加权的类激活图。
- Adebayo, J. et al. "Sanity checks for saliency maps." *NeurIPS*, 2018. 一些显著图方法通不过的随机化检验。
- Geirhos, R. et al. "ImageNet-trained CNNs are biased towards texture; increasing shape bias improves accuracy and robustness." *ICLR*, 2019. 纹理偏向。
- Geirhos, R. et al. "Shortcut learning in deep neural networks." *Nature Machine Intelligence*, 2020. 作为一般失败模式的捷径学习。
- Zech, J. R. et al. "Variable generalization performance of a deep learning model to detect pneumonia in chest radiographs: A cross-sectional study." *PLOS Medicine*, 2018. 一个利用了医院特有线索的分类器。
- Keshav, S. "How to read a paper." *ACM SIGCOMM Computer Communication Review*, 2007. 三遍阅读法。
- Goodfellow, I., Bengio, Y., Courville, A. *Deep Learning*. MIT Press, 2016. 第 9 章，卷积网络。
- Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. *Dive into Deep Learning*. 卷积神经网络和现代卷积神经网络两章；以代码为先，并持续更新。
