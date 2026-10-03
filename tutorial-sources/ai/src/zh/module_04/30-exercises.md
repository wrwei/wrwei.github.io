## 练习 {#exercises}

十五道练习按它们所练习的各节顺序排列，并按工作量分级：★ 是概念题，约 5 分钟，除了读出一个比值之外不需要计算；★★ 是推导或计算，这里约 10 分钟；★★★ 是编程，约 25 分钟。第一类有七道，第二类七道，第三类一道，合计约 130 分钟。解答默认折叠，打开之前，先在纸上定下一个答案：先读解答，所学远不如亲自尝试练习。

没有一道练习重复例题或正文检查题的数字或场景。各节在一组数字上讲授一种方法；这里把同一种方法用到另一组数字上，使能迁移的是方法而不是答案。解答中的每个数字都先手算，再用脚本核对。解答中的代码是完整的，在 CPU 上用 Python 3.11、NumPy 2.x 和 PyTorch 2.x 运行过；打印输出的最后几位以及所有计时，在你的机器上可能不同。除非写作 KiB，内存大小均为十进制（1 kB = $10^3$ B）。

::: exercise id=e1 level=1 kind=conceptual minutes=5
对下面每个任务，指出任务的形态（多对一、对齐的多对多、序列到序列或一对多），并说明第 $t$ 步的输出能否依赖于 $t$ 之后的输入。

(a) 每 10 分钟一次，根据一台风力发电机最近一周的传感器读数，预测其齿轮箱一小时之后的油温。

(b) 对一条实时管道压力数据流的每个样本，在下一个样本到达之前判断是否正在发生压力骤升，以便关闭阀门。

(c) 把一次机组跳闸期间触发的报警代码序列，变成交接班日志中的一句话摘要。

(d) 一个点焊完成之后，根据它完整的电流曲线判断是否合格。

(e) 给定一栋建筑的建筑面积和用途，生成一周看起来合理的逐小时用电需求，用来测试一种控制策略。
:::

::: solution
每种情形由两个问题决定（[第 1 节](#s1)）。损失放在哪里：一个输出上、每一步一个输出上，还是一个有自己长度的新序列上？以及，在必须做出决策的时候，其余的输入是否已经存在？第二个问题决定了能否使用双向网络。

(a) **对齐的多对多，或按窗口的多对一；因果**。每 10 分钟一个读数，一周就是 $7\times24\times6 = 1{,}008$ 个样本，“一小时之后”是 6 个样本。在数据流的每一步都输出一个预测的网络是对齐的多对多；把每个 1,008 样本的窗口映射为一个数的网络是多对一。训练哪一种，是把损失放在哪里的选择，而不是另一个问题。无论哪种，$t$ 时刻的输出都只能使用截至 $t$ 的读数：做预测时，未来的读数还不存在；在验证中让模型看到它们，就是泄漏（[第 8 节](#s8)）。

(b) **对齐的多对多（每个样本一个标签）；因果**。答案必须在下一个样本到达之前给出，所以不能使用 $t$ 之后的任何输入，双向网络被排除。这与事后给同一条压力曲线打标签不同，后者是离线的，可以双向读取（[第 6 节](#s6)）。截止时间也约束了每一步的计算量，而循环神经网络的每步计算量是恒定的（[第 12 节](#s12)）。

(c) **序列到序列**。输入（报警代码）和输出（一句话）长度不同，也没有逐步的对齐，这正是[第 10 节](#s10)的编码器-解码器所要处理的。跳闸已经结束，所以编码器可以读取整个代码序列，也可以是双向的：在这个意义上答案是肯定的，每个输入对每个输出都可用。解码器在它*自己*的输出上仍然是因果的：摘要的第 $t$ 个词依赖于它之前的词，而不是之后的词。

(d) **多对一；离线**。决策来自整条曲线，而曲线已经完整，所以允许双向读取，输出可以依赖于每一个输入。

(e) **一对多，生成**。条件输入（建筑面积和用途）是一个固定的向量；输出是 168 个逐小时值，每个值都作为下一步的输入反馈回去。每个生成的值只能依赖于条件输入和已经生成的值，所以答案是否定的。“看起来合理”要求在每一步从模型的分布中带噪声地*采样*，而不是在每一步取最可能的值，后者会给出平滑得不真实的一周（关于采样，见[第 2 节](#s2)）。

规律是：模型必须随数据到达而作答的任务（(a)、(b)）禁止前瞻；在已完成的记录上运行的任务（(c)、(d)）允许前瞻；而在每个生成任务中，解码器在它自己的输出上都是因果的。
:::

::: exercise id=e2 level=2 kind=derivation minutes=10
考虑标量 RNN $h_t = \tanh(w\,h_{t-1} + u\,x_t)$，其中 $h_0 = 0$，损失在 $T = 3$ 步之后为 $L = \tfrac12(h_3 - y)^2$。

(a) 把 $\partial L/\partial w$ 写成三项之和。在每一项中显式写出雅可比矩阵之积 $\partial h_3/\partial h_k = \prod_j w(1-h_j^2)$。

(b) 对 $w = 0.9$、$u = 0.5$、$x = (1, 0, 1)$ 和 $y = 0.5$ 计算所有的量，包括 $\partial L/\partial u$。比较 $x_1$ 和 $x_3$ 对 $\partial L/\partial u$ 的贡献。

(c) 对线性循环（把 tanh 换成恒等映射），分别对 $w = 0.8$ 和 $w = 1.25$ 计算 $\partial h_{50}/\partial h_0$，并说明各自对学习意味着什么。
:::

::: solution
**准备**。记 $z_t = w\,h_{t-1} + u\,x_t$，$h_t = \tanh z_t$。由于 $\tanh' = 1 - \tanh^2$，有 $\partial h_t/\partial z_t = 1 - h_t^2$。状态 $h_{t-1}$ 以系数 $w$ 进入 $z_t$，所以单步雅可比是标量

$$J_t = \frac{\partial h_t}{\partial h_{t-1}} = w\,(1 - h_t^2).$$

这是[第 3 节](#s3)的雅可比矩阵 $\operatorname{diag}(\phi'(\mathbf{z}_t))\,\mathbf{W}_h$ 的标量情形。

**(a)** 参数 $w$ 在每一步都被使用，所以它的梯度是对各步的求和（[第 3 节](#s3)）。第 $k$ 步的使用使 $z_k$ 改变 $h_{k-1}\,\mathrm{d}w$，从而使 $h_k$ 改变 $(1 - h_k^2)\,h_{k-1}\,\mathrm{d}w$。这一变化经由 $\partial h_3/\partial h_k$ 传到 $h_3$，再经由 $\partial L/\partial h_3 = h_3 - y$ 传到损失。把三步加起来：

$$\frac{\partial L}{\partial w} = (h_3 - y)\sum_{k=1}^{3}\frac{\partial h_3}{\partial h_k}\,(1 - h_k^2)\,h_{k-1}, \qquad \frac{\partial h_3}{\partial h_k} = \prod_{j=k+1}^{3} w\,(1 - h_j^2).$$

逐项写出：

- $k = 3$：乘积为空，$\partial h_3/\partial h_3 = 1$，该项为 $(1 - h_3^2)\,h_2$。
- $k = 2$：$\partial h_3/\partial h_2 = w(1 - h_3^2)$，该项为 $w(1 - h_3^2)(1 - h_2^2)\,h_1$。
- $k = 1$：$\partial h_3/\partial h_1 = w(1 - h_3^2)\cdot w(1 - h_2^2)$，该项为 $w(1 - h_3^2)\,w(1 - h_2^2)\,(1 - h_1^2)\,h_0$。

因子 $(1 - h_3^2)$ 是三项共有的，所以

$$\frac{\partial L}{\partial w} = (h_3 - y)(1 - h_3^2)\Big[\,h_2 + w(1 - h_2^2)\,h_1 + w(1 - h_2^2)\,w(1 - h_1^2)\,h_0\Big].$$

第 $k$ 项带着从第 $k$ 步到第 3 步的雅可比之积：滞后越长，因子越多，而每个因子通常都小于 1（[第 4 节](#s4)）。这里 $h_0 = 0$ 使最后一项为零，但正是这一项承载对初始状态的依赖。

要算数值，更方便的做法是对误差信号 $g_k = \partial L/\partial z_k$ 运行[第 3 节](#s3)的递推。由于 $z_{k+1}$ 以系数 $w$ 依赖于 $h_k$，

$$g_3 = (h_3 - y)(1 - h_3^2), \qquad g_k = g_{k+1}\,w\,(1 - h_k^2), \qquad \frac{\partial L}{\partial w} = \sum_k g_k\,h_{k-1}, \qquad \frac{\partial L}{\partial u} = \sum_k g_k\,x_k.$$

**(b)** 先做前向传播，因为每个因子都需要这些状态：

- $h_1 = \tanh(0.9\cdot0 + 0.5\cdot1) = \tanh 0.5 = 0.4621$；
- $h_2 = \tanh(0.9\cdot0.4621 + 0.5\cdot0) = \tanh 0.4159 = 0.3935$；
- $h_3 = \tanh(0.9\cdot0.3935 + 0.5\cdot1) = \tanh 0.8541 = 0.6932$；
- $L = \tfrac12(0.6932 - 0.5)^2 = 0.01867$。

导数因子为 $1 - h_3^2 = 0.5194$、$1 - h_2^2 = 0.8452$ 和 $1 - h_1^2 = 0.7864$。误差信号为：

- $g_3 = (0.6932 - 0.5)(0.5194) = 0.10037$；
- $g_2 = g_3\cdot w(1 - h_2^2) = 0.10037\times0.7607 = 0.07635$；
- $g_1 = g_2\cdot w(1 - h_1^2) = 0.07635\times0.7078 = 0.05404$。

于是

$$\frac{\partial L}{\partial w} = g_3h_2 + g_2h_1 + g_1h_0 = 0.03949 + 0.03528 + 0 = 0.07477,$$

$$\frac{\partial L}{\partial u} = g_1x_1 + g_2x_2 + g_3x_3 = 0.05404 + 0 + 0.10037 = 0.1544.$$

输入 $x_1$ 和 $x_3$ 都等于 1，但 $x_1$ 的贡献只有 $x_3$ 的 $0.05404/0.10037 = 0.538$ 倍。原因在于路径：第 3 步的误差要先经过两个局部因子 $w(1 - h_2^2) = 0.761$ 和 $w(1 - h_1^2) = 0.708$ 才能到达 $z_1$，二者之积为 0.538。仅线性部分会给出 $0.9^2 = 0.81$；另一个因子 $0.538/0.81 = 0.66$ 是 tanh 导数的贡献，只要单元不在零点，这些导数就小于 1。非线性只会让衰减更严重，绝不会使之减轻（[第 4 节](#s4)）。

下面的脚本重复了这些算术，并用中心差分核对两个梯度。

```python
import numpy as np

w, u, y = 0.9, 0.5, 0.5
x = [1.0, 0.0, 1.0]

def forward(w, u):
    h = [0.0]                                    # h_0 = 0
    for xt in x:
        h.append(np.tanh(w * h[-1] + u * xt))
    return h

def loss(w, u):
    return 0.5 * (forward(w, u)[3] - y) ** 2

h = forward(w, u)
g3 = (h[3] - y) * (1 - h[3] ** 2)                # dL/dz_3
g2 = g3 * w * (1 - h[2] ** 2)                    # dL/dz_2
g1 = g2 * w * (1 - h[1] ** 2)                    # dL/dz_1
dw = g3 * h[2] + g2 * h[1] + g1 * h[0]
du = g1 * x[0] + g2 * x[1] + g3 * x[2]
eps = 1e-6
dw_fd = (loss(w + eps, u) - loss(w - eps, u)) / (2 * eps)
du_fd = (loss(w, u + eps) - loss(w, u - eps)) / (2 * eps)
print("h:", [f"{v:.4f}" for v in h[1:]], f" L = {loss(w, u):.5f}")
print(f"g3, g2, g1 = {g3:.5f}, {g2:.5f}, {g1:.5f}")
print(f"dL/dw = {dw:.5f} (central difference {dw_fd:.5f})")
print(f"dL/du = {du:.5f} (central difference {du_fd:.5f})")
print(f"contribution of x_1 / x_3 = {g1 / g3:.3f}")
print(f"0.8^50 = {0.8 ** 50:.3e}, 1.25^50 = {1.25 ** 50:.3e}, "
      f"1 / 0.8^50 = {0.8 ** -50:.0f}")
```

```output
h: ['0.4621', '0.3935', '0.6932']  L = 0.01867
g3, g2, g1 = 0.10037, 0.07635, 0.05404
dL/dw = 0.07477 (central difference 0.07477)
dL/du = 0.15440 (central difference 0.15440)
contribution of x_1 / x_3 = 0.538
0.8^50 = 1.427e-05, 1.25^50 = 7.006e+04, 1 / 0.8^50 = 70065
```

**(c)** 去掉 tanh 后，$h_t = w\,h_{t-1} + u\,x_t$，每个雅可比都是 $w$，所以 $\partial h_{50}/\partial h_0 = w^{50}$。

- $w = 0.8$：$0.8^{50} = 1.4\times10^{-5}$。50 步之前的输入到达损失时，梯度比新输入小约 70,000 倍。这一依赖关系的梯度信号低于其他所有项的噪声，所以这种依赖实际上永远学不到。梯度裁剪无济于事，因为梯度是太小，而不是太大。
- $w = 1.25$：$1.25^{50} = 7.0\times10^{4}$，是反方向的同一个因子，因为 $1.25 = 1/0.8$。除非对梯度进行裁剪，沿这个方向的一次更新就会大 70,000 倍，把权重抛到远离模型原本正常工作的区域。

恢复 tanh 后，每个因子都是 $w(1 - h^2) \le w$。非线性只会让梯度消失更严重，而一旦单元饱和，它又会给爆炸设上限，这就是为什么梯度爆炸往往以偶发的悬崖形式出现，而不是稳定地增长（[第 4 节](#s4)）。
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
用三四句话解释：为什么全局范数梯度裁剪能治愈梯度爆炸，却治不了梯度消失；为什么把每个分量裁剪到 $[-c, c]$ 比裁剪范数更糟。以 $\mathbf{g} = (0.6, -45)$ 和 $c = 1$ 为例；不需要计算角度。
:::

::: solution
全局范数裁剪把 $\mathbf{g}$ 替换为 $\mathbf{g}\min(1, c/\lVert\mathbf{g}\rVert)$：范数超过 $c$ 的梯度被缩放到范数恰好为 $c$，所以步长有界而方向不变，损失曲面上的悬崖再也不能把参数抛到远处。梯度消失是相反的情形，梯度太小而不是太大：裁剪从不放大梯度，所以长程依赖的贡献仍然被短程依赖淹没，要治愈它，需要结构上的改变，例如 LSTM 的门控加性通路（[第 5 节](#s5)）。把每个分量裁剪到 $[-c, c]$ 会改变更新的*方向*，因为它缩小大的分量，而对小的分量不加改动。裁剪范数把每个分量除以同一个数，所以方向不变。

数值上：$\lVert\mathbf{g}\rVert = \sqrt{0.6^2 + 45^2} = \sqrt{2025.36} = 45.004$。

- 范数裁剪乘以 $1/45.004$，得到 $(0.0133, -0.9999)$。两个分量之比仍为 $0.6 : 45 = 1 : 75$。
- 分量裁剪得到 $(0.6, -1)$。大分量被削减了 45 倍，小分量毫无变化，所以比值变成 $3 : 5$，更新指向了别处：原本梯度很小的那个参数被赋予了大得多的权重。

（作为参考，$\mathbf{g}$ 与分量裁剪后的向量之间的余弦为 0.864，约 $30^\circ$；范数裁剪后的向量余弦恰好为 1。）实践中的陷阱也是同一个：各分量不能互换，所以独立地裁剪它们会改变哪些参数在移动。梯度裁剪的来龙去脉见[第 4 节](#s4)，它所服务的优化器见[模块 02](module_02_ZH.html)。
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
(a) 由[第 5 节](#s5)的 LSTM 方程推导 $\partial\mathbf{c}_t/\partial\mathbf{c}_{t-1}$，并指出不经过 $\mathbf{h}_{t-1}$ 的那一项。

(b) 固定各个门（忽略经过 $\mathbf{h}$ 的路径），当遗忘门等于 $\sigma(b_f)$、$b_f = 1.5$、$2.5$ 和 $4.5$ 时，计算每个单元的 $\partial c_{60}/\partial c_0$。与每步因子为 0.7 的普通 tanh RNN 比较。

(c) 多大的遗忘门偏置能给出 250 步的记忆半衰期？

(d) 要应用它，必须设置哪些 PyTorch 张量的哪一段切片？
:::

::: solution
**(a)** 细胞更新为 $\mathbf{c}_t = \mathbf{f}_t\odot\mathbf{c}_{t-1} + \mathbf{i}_t\odot\tilde{\mathbf{c}}_t$。$\mathbf{c}_{t-1}$ 从哪里进入它？

1. *直接地*，作为与 $\mathbf{f}_t$ 相乘的因子。
2. *间接地*，经由 $\mathbf{h}_{t-1} = \mathbf{o}_{t-1}\odot\tanh(\mathbf{c}_{t-1})$，它输入门 $\mathbf{f}_t$、$\mathbf{i}_t$ 和候选值 $\tilde{\mathbf{c}}_t$。（门 $\mathbf{o}_{t-1}$ 由 $\mathbf{h}_{t-2}$ 计算得到，不依赖于 $\mathbf{c}_{t-1}$。）

直接路径的导数为 $\operatorname{diag}(\mathbf{f}_t)$。对间接路径，经由 $\mathbf{h}_{t-1}$ 应用链式法则，并利用 $\sigma' = \sigma(1-\sigma)$ 和 $\tanh' = 1 - \tanh^2$。设 $\mathbf{W}^h_f$、$\mathbf{W}^h_i$、$\mathbf{W}^h_c$ 为权重矩阵中与 $\mathbf{h}_{t-1}$ 相乘的 $H\times H$ 块。于是

$$\frac{\partial\mathbf{c}_t}{\partial\mathbf{h}_{t-1}} = \operatorname{diag}\big(\mathbf{c}_{t-1}\odot\mathbf{f}_t\odot(1-\mathbf{f}_t)\big)\mathbf{W}^h_f + \operatorname{diag}\big(\tilde{\mathbf{c}}_t\odot\mathbf{i}_t\odot(1-\mathbf{i}_t)\big)\mathbf{W}^h_i + \operatorname{diag}\big(\mathbf{i}_t\odot(1-\tilde{\mathbf{c}}_t^{\,2})\big)\mathbf{W}^h_c,$$

$$\frac{\partial\mathbf{h}_{t-1}}{\partial\mathbf{c}_{t-1}} = \operatorname{diag}\big(\mathbf{o}_{t-1}\odot(1-\tanh^2\mathbf{c}_{t-1})\big).$$

相乘并加上直接项，

$$\frac{\partial\mathbf{c}_t}{\partial\mathbf{c}_{t-1}} = \operatorname{diag}(\mathbf{f}_t) + \frac{\partial\mathbf{c}_t}{\partial\mathbf{h}_{t-1}}\,\operatorname{diag}\big(\mathbf{o}_{t-1}\odot(1-\tanh^2\mathbf{c}_{t-1})\big).$$

不经过 $\mathbf{h}_{t-1}$ 的那一项是 $\operatorname{diag}(\mathbf{f}_t)$。它不含权重矩阵，也不含压缩函数的导数：门的值就是整个因子，网络在每一步设定它，并且可以让它保持在 1 附近。其余各项含有 $\mathbf{W}^h$ 和小于 1 的导数，正是[第 4 节](#s4)中那个趋于消失的乘积的组成部分。

**(b)** 忽略经过 $\mathbf{h}$ 的路径，每个单元有 $\partial c_t/\partial c_{t-1} = f$，所以 60 步的因子为 $f^{60}$。先求 $f = \sigma(b_f) = 1/(1 + e^{-b_f})$。以 $b_f = 2.5$ 为例手算：$e^{-2.5} = 0.0821$，所以 $f = 1/1.0821 = 0.9241$；$\ln f = -0.07889$；$60\ln f = -4.733$；$e^{-4.733} = 8.8\times10^{-3}$。半衰期为 $\ln 0.5/\ln f$（[第 5 节](#s5)）。

| $b_f$ | $f = \sigma(b_f)$ | $f^{60}$ | 半衰期（步） | 60 步合多少个半衰期 |
|---|---|---|---|---|
| 1.5 | 0.8176 | $5.6\times10^{-6}$ | 3.4 | 17.4 |
| 2.5 | 0.9241 | $8.8\times10^{-3}$ | 8.8 | 6.8 |
| 4.5 | 0.9890 | 0.515 | 62.7 | 0.96 |
| 普通 RNN，因子 0.7 | 0.7 | $5.1\times10^{-10}$ | 1.9 | 31 |

只有最大的偏置能把可用的梯度传到 60 步的滞后：$b_f = 4.5$ 传过去约一半，因为 60 步大约是一个半衰期（0.96 个）。另外两个只传过去百万分之一和百分之一。与普通 RNN 的因子相比，$b_f = 4.5$ 大 $0.515/5.1\times10^{-10} \approx 10^{9}$ 倍。需要注意的仍是题目中的那个限定：这只是沿细胞通路、在门固定时的乘积。在训练好的网络中，门随输入变化，所以 $f^{60}$ 是一个单元在 60 步内把遗忘门保持在 $f$ 附近时所能保留的梯度。

**(c)** 解 $f^{250} = 0.5$：$f = 0.5^{1/250} = e^{-\ln 2/250} = e^{-0.002773} = 0.99723$。对 sigmoid 求逆：$b_f = \ln\dfrac{f}{1-f} = \ln\dfrac{0.99723}{0.00277} = \ln 360.2 = 5.887$。半衰期很长时 $1 - f \approx \ln 2/t_{1/2}$，由此得到捷径

$$b_f \approx \ln\frac{t_{1/2}}{\ln 2} = \ln 360.7 = 5.888,$$

前三位数字相同。这就是 chrono 初始化的逻辑（[第 5 节](#s5)）：时间常数 $1/(1-f) = 1 + e^{b_f}$ 随偏置每增加一个单位而增长 $e$ 倍，所以约为 6 的偏置就设定了几百步的记忆。之所以这样做，是因为在初始化时权重很小，偏置是唯一决定门值的参数。

**(d)** PyTorch 按 $i, f, g, o$ 的顺序堆叠四个门，其中 $g$ 是候选值，所以遗忘门是行的*第二*块。对第 0 层，这是两个偏置向量 `bias_ih_l0` 和 `bias_hh_l0` 的切片 `[H:2*H]`。两个偏置在门内相加，所以把其中一个设为该值，另一个置零（或者把两者一并考虑）。下面的脚本同时核对这一做法和 (b) 小题。它把所有参数置零，使每个门只取决于自己的偏置；这时输入门为 $\sigma(0) = 0.5$，候选值为 $\tanh(0) = 0$，所以恰好有 $c_t = f\,c_{t-1}$。从 $c_0 = 1$ 出发，最终的细胞状态就是记忆 $f^{n}$。

```python
import math
import torch
import torch.nn as nn

H = 4

def memory_after(steps, forget_bias):
    """Zero all weights so each gate depends on its bias alone; start with c_0 = 1."""
    lstm = nn.LSTM(1, H, batch_first=True)
    with torch.no_grad():
        for p in lstm.parameters():
            p.zero_()
        lstm.bias_ih_l0[H:2 * H] = forget_bias   # slice 1 of the stacked i, f, g, o
    x = torch.zeros(1, steps, 1)
    h0, c0 = torch.zeros(1, 1, H), torch.ones(1, 1, H)
    with torch.no_grad():
        _, (_, c_n) = lstm(x, (h0, c0))
    return float(c_n[0, 0, 0])

for b in (1.5, 2.5, 4.5):
    f = 1 / (1 + math.exp(-b))
    print(f"b_f = {b}: c_60 = {memory_after(60, b):.3e}, "
          f"sigmoid(b_f)^60 = {f ** 60:.3e}")
b_250 = math.log(0.5 ** (1 / 250) / (1 - 0.5 ** (1 / 250)))
print(f"b_f = {b_250:.3f}: c_250 = {memory_after(250, b_250):.4f} "
      f"(half-life 250 -> 0.5)")
print(f"chrono shortcut ln(250 / ln 2) = {math.log(250 / math.log(2)):.3f}")
```

```output
b_f = 1.5: c_60 = 5.645e-06, sigmoid(b_f)^60 = 5.645e-06
b_f = 2.5: c_60 = 8.797e-03, sigmoid(b_f)^60 = 8.797e-03
b_f = 4.5: c_60 = 5.154e-01, sigmoid(b_f)^60 = 5.154e-01
b_f = 5.887: c_250 = 0.5000 (half-life 250 -> 0.5)
chrono shortcut ln(250 / ln 2) = 5.888
```

如果切片错了（`[0:H]` 是输入门），无论偏置是多少，遗忘门都会停留在 $\sigma(0) = 0.5$，每一行都会打印 $0.5^{60} = 8.7\times10^{-19}$（最后一行则是 $0.5^{250}$）。这就是它的失效方式：索引错误的偏置抬高了错误的门，而且不会报错。
:::

::: exercise id=e5 level=2 kind=calculation minutes=10
对 $d_\text{in} = 8$、$H = 64$ 的循环层，分别统计普通 RNN、LSTM 和 GRU 的参数量，先按每个门一个偏置向量计，再按 PyTorch 的方式计。然后逐层统计 `nn.GRU(8, 64, num_layers=2, bidirectional=True)` 的参数量，并解释为什么它的第二层更大。
:::

::: solution
**每个门一个偏置向量**。普通的循环层有一个循环矩阵 $\mathbf{W}_h$（$H\times H$）、一个输入矩阵 $\mathbf{W}_x$（$H\times d_\text{in}$）和一个偏置（$H$）：

$$H(H + d_\text{in} + 1) = 64\times(64 + 8 + 1) = 4{,}672.$$

LSTM 有四个这样的块（三个门和一个候选值），所以是 $4\times4{,}672 = 18{,}688$；GRU 有三个（两个门和一个候选值），所以是 $3\times4{,}672 = 14{,}016$（[第 5 节和第 6 节](#s5)）。

**按 PyTorch 的方式计**。PyTorch 每个块保存*两个*偏置向量 `bias_ih` 和 `bias_hh`，二者在门内相加。这使每个块多出 $H$ 个参数，所以总数为 $g\,H(H + d_\text{in}) + 2gH$，其中块数 $g = 1, 4, 3$：

- RNN：$64\times72 + 2\times64 = 4{,}608 + 128 = 4{,}736$；
- LSTM：$4\times64\times72 + 8\times64 = 18{,}432 + 512 = 18{,}944$；
- GRU：$3\times64\times72 + 6\times64 = 13{,}824 + 384 = 14{,}208$。

**双向两层 GRU**。双向层是两个相互独立的 GRU，每个方向一个，输出拼接在一起。第 1 层读取 8 个原始特征，所以每个方向就是刚才算出的 14,208；两个方向共 $28{,}416$。第 2 层读取第 1 层*拼接后*的输出，宽度为 $2H = 128$，而不是 8：

$$3\times64\times(128 + 64) + 6\times64 = 36{,}864 + 384 = 37{,}248 \text{ 每个方向}, \qquad 2\times37{,}248 = 74{,}496.$$

总数为 $28{,}416 + 74{,}496 = 102{,}912$。第二层是第一层的 $74{,}496/28{,}416 = 2.6$ 倍，因为它的输入矩阵是 $3H\times128 = 192\times128$，即 24,576 个元素，而不是 $192\times8 = 1{,}536$。循环矩阵（每个方向 $192\times64 = 12{,}288$）和偏置在两层中相同。这正是[第 6 节](#s6)的结论：在堆叠网络中，尤其是在双向堆叠中，参数量由上层的输入矩阵主导。

```python
import torch.nn as nn

count = lambda m: sum(p.numel() for p in m.parameters())
for name, cls, gates in (("RNN", nn.RNN, 1), ("LSTM", nn.LSTM, 4), ("GRU", nn.GRU, 3)):
    one_bias = gates * 64 * (64 + 8 + 1)
    print(f"{name:5s} one bias {one_bias:6,d}   PyTorch {count(cls(8, 64)):6,d}")

gru = nn.GRU(8, 64, num_layers=2, bidirectional=True)
layer = lambda l: sum(p.numel() for n, p in gru.named_parameters() if f"_l{l}" in n)
print(f"two-layer bidirectional GRU: layer 1 {layer(0):,}, layer 2 {layer(1):,}, "
      f"total {count(gru):,}")
print("weight_ih_l0:", tuple(gru.weight_ih_l0.shape), " weight_ih_l1:",
      tuple(gru.weight_ih_l1.shape))
```

```output
RNN   one bias  4,672   PyTorch  4,736
LSTM  one bias 18,688   PyTorch 18,944
GRU   one bias 14,016   PyTorch 14,208
two-layer bidirectional GRU: layer 1 28,416, layer 2 74,496, total 102,912
weight_ih_l0: (192, 8)  weight_ih_l1: (192, 128)
```
:::

::: exercise id=e6 level=1 kind=conceptual minutes=5
一个 batch 中有三条传感器序列，长度分别为 30、90 和 240，用零填充到 240，送入一个单向 LSTM 分类器。分类器使用第 240 个位置的输出，另有一个逐步的辅助损失，在全部 720 个位置上取平均。列出哪里出了问题，以及相应的修正方法。
:::

::: solution
先计数：这个 batch 有 $3\times240 = 720$ 个位置，其中真实的有 $30 + 90 + 240 = 360$ 个。半个 batch 是填充。由此产生四个问题（[第 7 节](#s7)）。

1. **对短序列，分类器读到的是错误的状态**。对长度为 30 和 90 的序列，第 240 个位置的输出位于 210 步和 150 步零输入之后，所以这个状态是网络在这段时间内对零输入的响应，而不是序列的概括。*修正*：在每条序列真正的最后一步读取输出（按长度取出，`out[b, length_b - 1]`），或者对 batch 打包，使最后的输出就是真正的那一个。
2. **辅助损失在填充上训练**。720 个位置中有一半（360 个）是填充，所以一半的损失在教模型预测填充目标，真实位置所占的梯度份额被减半。*修正*：对损失加掩码，在真实位置上求和并除以它们的个数，即 $\sum_{\text{真实}}\ell/360$，而不是除以 720。
3. **一半的计算被浪费**。每个填充位置的开销与真实位置一样。*修正*：对序列打包，或者按长度对 batch 分桶，使长度相近的序列共享一个 batch。
4. **双向层会更糟**。反向方向会从第 240 个位置开始，所以对长度为 30 的序列，它在读到任何数据之前要先读 210 步填充，即使每次读出都取在正确的位置，它的最终状态也已被污染。*修正*：打包（`pack_padded_sequence`），使反向方向从每条序列真正的末尾开始。

在右侧填充和单向网络下，真实位置上的状态是精确的：它们在读到任何填充之前就已算出。所以在这种情况下，问题 1 和问题 2 关乎*你读取哪些位置、对哪些位置计分*，打包主要是节省计算。下面的脚本在一个随机 LSTM 上展示问题 1 及其修正。

```python
import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

torch.manual_seed(0)
lens = torch.tensor([30, 90, 240])
T = 240
lstm = nn.LSTM(1, 16, batch_first=True)
x = torch.zeros(3, T, 1)                     # zero padding after each real sequence
for b, n in enumerate(lens):
    x[b, :n, 0] = torch.randn(int(n))

with torch.no_grad():
    out, _ = lstm(x)
    alone = lstm(x[0:1, :30])[0][0, -1]      # sequence 0 by itself, no padding
    short_pad = lstm(x[0:1, :60])[0][0, -1]  # the same sequence padded only to 60
    pk = pack_padded_sequence(x, lens, batch_first=True, enforce_sorted=False)
    packed, _ = lstm(pk)
    unpacked, _ = pad_packed_sequence(packed, batch_first=True, total_length=T)

gap = lambda a, b: f"{(a - b).norm():.4f}"
print("norm of the true last output of sequence 0  :", gap(alone, torch.zeros(16)))
print("readout at position 240 vs true last output :", gap(out[0, -1], alone))
print("readout at position 60 vs true last output  :", gap(short_pad, alone))
print("gathered at the true length vs true output  :", gap(out[0, lens[0] - 1], alone))
print("packed, gathered at true length vs true     :",
      gap(unpacked[0, lens[0] - 1], alone))
mask = torch.arange(T)[None, :] < lens[:, None]
print("real positions:", int(mask.sum()), "of", mask.numel())
```

```output
norm of the true last output of sequence 0  : 0.3512
readout at position 240 vs true last output : 0.0670
readout at position 60 vs true last output  : 0.0670
gathered at the true length vs true output  : 0.0000
packed, gathered at true length vs true     : 0.0000
real positions: 360 of 720
```

填充后的读出与真实输出相差 0.067，而输出的范数是 0.351，误差为其大小的 19%。它在第 60 个位置和第 240 个位置相同，是因为这个小型随机网络在几步之内就落到了它的零输入不动点上；训练好的网络可能漂移得更远或更近。不论大小如何，这个读出描述的是填充而不是序列，而按长度取出（或打包）能精确地消除这一误差。
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
一位同事为振动预测器搭建的流水线：

1. 对整个两年的序列做 z 分数标准化；
2. 以步长 1 切出 128 个样本的窗口；
3. 打乱窗口，按 80/20 随机划分；
4. 在那 20% 上用早停进行训练；
5. 报告同一个 20% 上的 RMSE。

找出每一处泄漏，并给出修正后的流水线。
:::

::: solution
四处泄漏，用[第 8 节](#s8)的术语来说。

- **第 1 步用到了未来**。整个序列的均值和标准差包含了测试时段。部署时，未来的统计量是未知的。在存在漂移时，这处泄漏还掩盖了一个真实的困难：处于新水平的测试时段被重新缩放，看起来与训练数据相似。*修正*：只在训练部分上计算统计量，或者用每个窗口自身的最后一个值或均值对它归一化。
- **第 2 步和第 3 步合在一起泄漏了目标**。步长为 1 的 128 样本窗口与每个相邻窗口共享 127 个值。每个测试目标都是之后至多 128 个窗口中的一个*输入值*，而在随机的 80/20 划分下，这 128 个窗口全部落入测试集的概率为 $0.2^{128} \approx 3\times10^{-90}$。所以训练集几乎包含了每一道测试题的答案，得分衡量的是插值，而不是预测。单独任何一步都是无害的（重叠窗口用于训练没有问题；把已经从训练块中切出的窗口打乱也没有问题）。必须尊重时间的是划分。
- **第 4 步和第 5 步重复使用了测试集**。那 20% 先选定停止的轮次，再报告得分，所以得分因选择而偏乐观。用于选择的数据集与用于报告的数据集必须不同。
- **没有基线**。没有任何参照的预测 RMSE 说明不了什么：应在同一数据上报告朴素预测、季节性朴素预测和线性基线（[模块 01](module_01_ZH.html)：每一个数字都要带上它的基线）。

**修正后的流水线**。按时间顺序划分：对两年的数据，比如说第 1 到 16 个月用于训练，第 17 到 20 个月用于验证（早停和超参数），第 21 到 24 个月用于测试，测试只用一次。任何训练窗口的目标都不能落在训练块结束之后；验证窗口和测试窗口可以读取更早的样本作为输入，因为在预测时这些是已知的。对多步预测范围 $h$，块与块之间至少留出 $h$ 的间隔。只在训练块上（或逐窗口）拟合归一化。如果单个测试块给出的估计太单薄，就使用带内层验证块的前向滚动验证的多个折（[第 8 节](#s8)），报告每一折的得分以及各折的均值和离散程度，并附上同样各折上的基线。
:::

::: exercise id=e8 level=2 kind=calculation minutes=10
一个预测器在留出的正常数据上的一步残差，标准差为 $\sigma = 0.2$，近似服从高斯分布；传感器以 10 Hz 采样。

(a) 对 $3.5\sigma$、$4.5\sigma$ 和 $5.5\sigma$ 的双侧阈值，计算每天预期的误报次数。

(b) 如果残差相互独立，要求连续多少次超过 $3.5\sigma$，才能使误报少于每月一次？

(c) 给出两个理由，说明实际的误报率为什么会高于 (a) 的预测，并说明应当如何设定阈值。

(d) 出现了一个 $+1.2$ 的传感器偏移，并一直保持。对一个减去每个窗口最后一个值的预测器，$4\sigma$ 的逐点检验会标记多少个样本？你会增加什么？
:::

::: solution
**(a)** 每秒 10 个样本，一天就是 $10\times86{,}400 = 864{,}000$ 个样本。$k\sigma$ 处的双侧阈值被超过的概率为 $p = 2\,(1 - \Phi(k))$，其中 $\Phi$ 是标准正态分布函数；预期误报次数为 $864{,}000\,p$（[第 9 节](#s9)）。

| 阈值 | $p$ | 每天误报次数 |
|---|---|---|
| $3.5\sigma$ | $4.65\times10^{-4}$ | 402 |
| $4.5\sigma$ | $6.80\times10^{-6}$ | 5.87 |
| $5.5\sigma$ | $3.80\times10^{-8}$ | 0.033（约每月一次） |

$p$ 的值来自正态分布的尾部（查表或用 `scipy.stats.norm.sf`）。$k$ 每增加 1，误报率降低约 70 到 180 倍，这就是为什么提高阈值的代价很低。

**(b)** 如果残差相互独立，长度为 $n$ 的连续超限从某个给定样本开始的概率为 $p^{n}$，所以每天预期的连续超限次数为 $864{,}000\,p^{n}$（各次连续超限重叠的情况很少，这样计数已足够准确）。取 $p = 4.65\times10^{-4}$：

- $n = 2$：$p^2 = 2.17\times10^{-7}$，所以每天 $0.187$ 次，即每月 $5.6$ 次：太多；
- $n = 3$：$p^3 = 1.01\times10^{-10}$，所以每天 $8.7\times10^{-5}$ 次，即每月 $0.0026$ 次：远少于一次。

答案是连续三次超限。代价是两个样本的延迟（10 Hz 下为 0.2 s），在这里微不足道；以及漏掉任何短于三个样本的故障，所以单样本的尖峰不再能被这条规则捕获。这就是每种故障类型都需要自己的检测器的原因（[第 9 节](#s9)）。

**(c)** 两个理由，都来自[第 9 节](#s9)。残差是**自相关**的：在某一步出错的预测器往往在下一步以同样的方式出错，所以超限成串出现，$p^n$ 过于乐观。残差还是**重尾**的：正常运行中包含罕见的瞬态（启动、负荷变化），高斯尾部描述不了它们。第三个理由是 $\sigma$ 本身随运行状态变化。应当改为根据**一段很长的留出正常记录上残差的经验分位数**来设定阈值，并应用持续性规则，然后在这段记录上*实测*每天的误报次数。10 Hz 下每月一次的误报率，相当于 $30\times864{,}000 = 25.9$ 百万个样本中出现一次，所以要测出它，需要大约一个月的正常数据，最好是几个月：一天的数据无法区分 $10^{-8}$ 和 $10^{-6}$。

**(d)** 跳变为 $1.2/0.2 = 6\sigma$，所以起始样本会被 $4\sigma$ 检验标记，偏移消失时的末尾样本也会被标记。跳变之后，预测器已经*重新居中*：它把下一个值预测为最后一个值加上对变化量的预测，所以水平误差一步之后就消失了，偏移再也不会作为水平被看到。剩下的是回波，因为窗口中现在包含一个模型在训练中从未见过的阶跃。所以答案是“起始处一个，再加上阶跃穿过窗口期间的几个”，而不是持续的报警。作为参照，[实验 3](#lab3) 注入了 $+0.8$ 的偏移，在那里同样约为 $6\sigma$（$\sigma = 0.131$），它的 $4\sigma$ 逐点检验发出 3 次报警，分别在起始处、4 个样本之后和偏移结束处，中间一次也没有。逐点检验只看得到边沿。

要增加的是：**对照独立参照的水平检查**，这个参照不随传感器移动：冗余传感器、孪生模型的物理预测，或者对照已知运行范围的量程检查。另一种做法是，对一个不会重新居中的模型（预测范围更长的预测器，或不做逐窗口归一化的预测器）的残差做 CUSUM（累积和），累积水平有误的证据。

```python
from scipy.stats import norm

samples_per_day = 10 * 86_400                    # 10 Hz
for k in (3.5, 4.5, 5.5):
    p = 2 * norm.sf(k)                           # two-sided tail probability
    print(f"{k}σ: p = {p:.3e}, false alarms/day = {p * samples_per_day:.3f}")
p = 2 * norm.sf(3.5)
for n in (1, 2, 3):
    per_day = samples_per_day * p ** n           # expected starts of a run of n
    print(f"{n} in a row: {per_day:.3e} per day, {30 * per_day:.4f} per month")
```

```output
3.5σ: p = 4.653e-04, false alarms/day = 401.983
4.5σ: p = 6.795e-06, false alarms/day = 5.871
5.5σ: p = 3.798e-08, false alarms/day = 0.033
1 in a row: 4.020e+02 per day, 12059.4915 per month
2 in a row: 1.870e-01 per day, 5.6108 per month
3 in a row: 8.702e-05 per day, 0.0026 per month
```
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
解释为什么教师强制使 RNN 解码器可以不经采样就得到训练，以及什么是暴露偏差。利用实验 4 中无注意力模型在长度 12 下的数字（教师强制下的 token 准确率为 74%，自由运行下为 53%），解释两者之间的差距，并提出两种补救办法。
:::

::: solution
**为什么训练不需要采样**。在教师强制下，解码器第 $t$ 步的输入是*真实*的前一个 token $y_{t-1}$，它可以从数据中得知。因此解码器的每个输入在前向传播开始之前都已可用，每一步的损失都是针对已知目标、在正确前缀上计算的普通交叉熵。不需要先生成什么再去评分，每一步都得到干净的学习信号（[第 10 节](#s10)）。

**暴露偏差**。在测试时没有真实的前一个 token，所以解码器以它自己的输出为条件。模型只接触过正确的前缀。一个错误的 token 就会把它带进任何训练步骤都没有产生过的状态；它的下一次预测比模型在正确前缀上的准确率所显示的更不可靠，错误会逐步累积。

**差距**。教师强制下 74% 的准确率意味着，*在前缀正确的条件下*，26% 的 token 是错的。自由运行下 53% 的准确率意味着 47% 是错的，是前者的 $47/26 = 1.8$ 倍。多出来的错误，是那些跟在先前错误之后的错误：两种测量之间没有其他任何差别。差距随长度增大（长度 4 时基本没有，99.7% 对 99.4%；长度 8 时 91% 对 80%；长度 12 时 74% 对 53%），因为输出越长，前面可能出错的 token 就越多。差距的出现还需要错误能够累积：有注意力时，两种准确率在每个长度上都是 100%，对一个从不出错的模型，暴露偏差没有任何代价。

**补救办法**。

- **计划采样**（scheduled sampling，Bengio 等人 2015）：训练时，以一个随训练进程上升的概率，用模型自己的前一个预测代替真实 token 作为输入，使解码器学会从自己的错误中恢复。
- **在模型自己的生成轨迹上训练，或使用序列级目标**，对完整生成的输出评分（[模块 09](module_09_ZH.html) 中的强化学习方法）。
- **降低错误率本身**：对这个任务，最好的修正是注意力（[第 11 节](#s11)），它消除了导致最初那些错误的瓶颈。

无论采用哪种补救办法，都要以自由运行的方式评估，这是部署时唯一的模式。
:::

::: exercise id=e10 level=2 kind=calculation minutes=10
一个在 $\{A, B, \langle e\rangle\}$ 上的解码器有 $p(y_1) = (A\ 0.45,\ B\ 0.35,\ \langle e\rangle\ 0.20)$、$p(y_2\mid A) = (A\ 0.40,\ B\ 0.35,\ \langle e\rangle\ 0.25)$ 和 $p(y_2\mid B) = (A\ 0.10,\ B\ 0.75,\ \langle e\rangle\ 0.15)$。输出两个 token 之后，它总是输出 $\langle e\rangle$。

(a) 贪心解码输出什么？概率是多少？

(b) 像[第 10 节](#s10)那样逐步运行 $k = 2$ 的束搜索（在所有扩展中保留最好的 $k$ 个；保留下来的假设若已结束，就放到一边），列出保留的假设及其对数概率。

(c) 按概率对所有完整序列排序。束搜索在这里是精确的吗？一般情况下是精确的吗？

(d) 计算概率最高的三个序列的长度归一化得分（对数概率除以长度，$\langle e\rangle$ 计入长度）。排序是否改变？
:::

::: solution
**(a)** 贪心解码在每一步取最可能的 token。第 1 步：$A$（0.45）。在 $A$ 之后：$A$（0.40）。两个 token 之后：$\langle e\rangle$（概率 1）。输出为 $AA\langle e\rangle$，概率为 $0.45\times0.40\times1 = 0.18$。

**(b)** 先取对数：$\ln 0.45 = -0.799$，$\ln 0.35 = -1.050$，$\ln 0.20 = -1.609$。

*第 1 步*。空前缀的三个扩展是 $A$（$-0.799$）、$B$（$-1.050$）和 $\langle e\rangle$（$-1.609$）。保留最好的两个，$A$ 和 $B$；空输出 $\langle e\rangle$ 被剪掉。

*第 2 步*。用每个 token 扩展 $A$ 和 $B$，按累积概率给这六个扩展打分：

| 扩展 | 概率 | $\ln p$ |
|---|---|---|
| $BB$ | $0.35\times0.75 = 0.2625$ | $-1.338$ |
| $AA$ | $0.45\times0.40 = 0.18$ | $-1.715$ |
| $AB$ | $0.45\times0.35 = 0.1575$ | $-1.848$ |
| $A\langle e\rangle$ | $0.45\times0.25 = 0.1125$ | $-2.185$（已结束） |
| $B\langle e\rangle$ | $0.35\times0.15 = 0.0525$ | $-2.947$（已结束） |
| $BA$ | $0.35\times0.10 = 0.035$ | $-3.352$ |

保留最好的两个：$BB$ 和 $AA$。两者都没有结束。

*第 3 步*。每个都只能输出 $\langle e\rangle$（概率 1），所以 $BB\langle e\rangle$ 的 $\ln p = -1.338$，$AA\langle e\rangle$ 为 $-1.715$。两者都结束，束变空。最好的已结束假设是 $BB\langle e\rangle$，概率为 0.2625，是贪心解码答案的 $0.2625/0.18 = 1.46$ 倍。贪心解码在第 1 步选定了 $A$，因为它的首 token 概率更高；以 $B$ 开头的序列有好得多的后续，而 $k = 2$ 的束搜索能看到这一点。

**(c)** 全部七个完整序列，由上面的概率以及单独的 $\langle e\rangle$（0.20）得到：

| 名次 | 序列 | 概率 |
|---|---|---|
| 1 | $BB\langle e\rangle$ | 0.2625 |
| 2 | $\langle e\rangle$ | 0.2000 |
| 3 | $AA\langle e\rangle$ | 0.1800 |
| 4 | $AB\langle e\rangle$ | 0.1575 |
| 5 | $A\langle e\rangle$ | 0.1125 |
| 6 | $B\langle e\rangle$ | 0.0525 |
| 7 | $BA\langle e\rangle$ | 0.0350 |

它们之和为 1，理应如此。束搜索在这里找到了最好的序列，因为它的首 token $B$ 在第 1 步位列前二。它**一般并不精确**：它在第 1 步剪掉了概率第二高的序列，即空输出 $\langle e\rangle$；任何序列，只要它的前缀在某一步掉出前 $k$ 名，就永远丢失了，无论它的后续有多好。在 $k = 1$（贪心）时，它在这里丢掉了最好的序列。（如果一种实现不把已结束的假设计入束的名额，就会把 $\langle e\rangle$ 保留为一个已结束的候选。它仍会返回 $BB\langle e\rangle$，但按前缀剪枝的原理是一样的。）

**(d)** 把对数概率除以以 token 计的长度，$\langle e\rangle$ 计入长度：

- $BB\langle e\rangle$：$-1.338/3 = -0.446$；
- $\langle e\rangle$：$-1.609/1 = -1.609$；
- $AA\langle e\rangle$：$-1.715/3 = -0.572$。

排序改变了：空输出在这三个序列中从第二位降到第三位（在全部七个序列中降到最后一位，$-1.609$，而其他序列在 $-0.446$ 到 $-1.473$ 之间）。对数概率之和偏向短输出，因为每个 token 都把概率乘以一个小于 1 的数；按长度归一化纠正了这一偏向（[第 10 节](#s10)）。它是不是正确的纠正，取决于任务：空输出可能恰恰就是想要的。

```python
import math

# p(next token | prefix); after two tokens the decoder always emits <e> (written "e")
P = {"": {"A": 0.45, "B": 0.35, "e": 0.20},
     "A": {"A": 0.40, "B": 0.35, "e": 0.25},
     "B": {"A": 0.10, "B": 0.75, "e": 0.15}}

def next_probs(prefix):
    return P[prefix] if len(prefix) < 2 else {"e": 1.0}

def beam_search(k, show=False):
    beam, finished = [("", 0.0)], []
    while beam:
        cand = [(s + t, lp + math.log(p))
                for s, lp in beam for t, p in next_probs(s).items()]
        cand = sorted(cand, key=lambda c: -c[1])[:k]         # keep the k best of all
        if show:
            print("  kept:", ", ".join(f"{s} {lp:.3f}" for s, lp in cand))
        finished += [c for c in cand if c[0].endswith("e")]  # set finished ones aside
        beam = [c for c in cand if not c[0].endswith("e")]
    return max(finished, key=lambda c: c[1])

for k in (1, 2):
    print(f"k = {k}")
    seq, lp = beam_search(k, show=True)
    print(f"  best finished: {seq}  p = {math.exp(lp):.4f}  ln p = {lp:.3f}")
```

```output
k = 1
  kept: A -0.799
  kept: AA -1.715
  kept: AAe -1.715
  best finished: AAe  p = 0.1800  ln p = -1.715
k = 2
  kept: A -0.799, B -1.050
  kept: BB -1.338, AA -1.715
  kept: BBe -1.338, AAe -1.715
  best finished: BBe  p = 0.2625  ln p = -1.338
```

$k = 1$ 的运行就是贪心解码，重现了 (a)；$k = 2$ 的运行重现了 (b)。
:::

::: exercise id=e11 level=2 kind=calculation minutes=10
编码器状态为 $\mathbf{h}_1 = (1, 1)$、$\mathbf{h}_2 = (2, 0)$、$\mathbf{h}_3 = (0, -1)$。

(a) 用点积打分，解码器状态 $\mathbf{s} = (1, 0)$，计算得分、注意力权重和上下文向量。

(b) 对 $\mathbf{s} = (3, 0)$ 重做一遍。什么变了？为什么这对训练很重要？

(c) 把 (b) 与[模块 06](module_06_ZH.html) 中的 $1/\sqrt{d_k}$ 因子联系起来。

(d) 用加性注意力，$\mathbf{W}_a = \mathbf{I}$、$\mathbf{U}_a = \begin{bmatrix}1 & 0\\ 0.5 & -0.5\end{bmatrix}$、$\mathbf{v}_a = (1, 0.5)$，$\mathbf{s}_{t-1} = (-0.5, 0.5)$，计算权重和上下文。
:::

::: solution
**(a)** 注释向量 $j$ 的得分是点积 $e_j = \mathbf{s}^\top\mathbf{h}_j$：$e_1 = 1\cdot1 + 0\cdot1 = 1$，$e_2 = 1\cdot2 + 0 = 2$，$e_3 = 0$。所以 $e = (1, 2, 0)$。softmax：$\exp(e) = (2.7183,\ 7.3891,\ 1)$，和为 $11.1073$，所以

$$\alpha = (0.2447,\ 0.6652,\ 0.0900).$$

上下文是各注释向量的加权平均（算术以全精度进行，所以用舍入后的权重重新计算，最后一位可能不同）：

$$\mathbf{a} = 0.2447\,(1, 1) + 0.6652\,(2, 0) + 0.0900\,(0, -1) = (0.2447 + 1.3304,\ 0.2447 - 0.0900) = (1.5752,\ 0.1547).$$

**(b)** 当 $\mathbf{s} = (3, 0)$ 时，得分为 $(3, 6, 0)$，是原来的三倍。于是 $\exp(e) = (20.086,\ 403.43,\ 1)$，和为 $424.51$，所以

$$\alpha = (0.0473,\ 0.9503,\ 0.0024), \qquad \mathbf{a} = (1.9480,\ 0.0450).$$

方向相同、长度变为三倍，使分布尖锐得多：95% 的权重落在 $\mathbf{h}_2$ 上，而原来是 67%。把每个得分乘以 3，等同于把 softmax 的温度除以 3。这对训练很重要，因为 softmax 会*饱和*：权重对得分的敏感度为 $\partial\alpha_j/\partial e_j = \alpha_j(1 - \alpha_j)$，在 (a) 中为 $(0.185,\ 0.223,\ 0.082)$，在 (b) 中为 $(0.045,\ 0.047,\ 0.0024)$。对第三个注释向量，梯度缩小了 35 倍。饱和的 softmax 几乎不向打分网络或产生这些得分的状态传递梯度，训练就会停滞。

**(c)** 对宽度为 $d_k$ 的查询和键，若各分量相互独立、均值为零、方差为 1，则点积 $\sum_i q_ik_i$ 的方差为 $\sum_i\mathbb{E}[q_i^2]\,\mathbb{E}[k_i^2] = d_k$。因此典型的得分按 $\sqrt{d_k}$ 增长，宽模型在初始化时就处于 (b) 那样的饱和区，梯度趋于消失。把得分除以 $\sqrt{d_k}$，无论宽度如何都能恢复单位方差（[模块 06](module_06_ZH.html)）。对 20,000 个随机对的模拟给出 $d = 4$、64 和 1,024 时的方差分别为 4.0、64.5 和 1,023.5（脚本见下），而像这里这样宽度为 2 时，得分的标准差只有 $\sqrt2$，所以要显现这一效应，需要像因子 3 这样的夸大。

**(d)** 加性注意力为 $e_j = \mathbf{v}_a^\top\tanh(\mathbf{W}_a\mathbf{s}_{t-1} + \mathbf{U}_a\mathbf{h}_j)$（[第 11 节](#s11)）。分步计算：

1. $\mathbf{W}_a\mathbf{s}_{t-1} = \mathbf{s}_{t-1} = (-0.5, 0.5)$，因为 $\mathbf{W}_a = \mathbf{I}$。
2. $\mathbf{U}_a\mathbf{h}_j$：对 $\mathbf{h}_1 = (1, 1)$，为 $(1,\ 0.5 - 0.5) = (1, 0)$；对 $\mathbf{h}_2 = (2, 0)$，为 $(2, 1)$；对 $\mathbf{h}_3 = (0, -1)$，为 $(0, 0.5)$。（这些乘积与 $t$ 无关，所以实际实现中对每个源序列只计算一次。）
3. 激活前的值，即两者之和：$(0.5, 0.5)$、$(1.5, 1.5)$、$(-0.5, 1.0)$。
4. 经过 tanh 之后：$(0.4621, 0.4621)$、$(0.9051, 0.9051)$、$(-0.4621, 0.7616)$。
5. 得分 $e_j = \tanh_1 + 0.5\tanh_2$：$0.4621 + 0.2311 = 0.6932$；$0.9051 + 0.4526 = 1.3577$；$-0.4621 + 0.3808 = -0.0813$。
6. softmax：$\exp(e) = (2.0000,\ 3.8873,\ 0.9219)$，和为 $6.8093$，所以 $\alpha = (0.2937,\ 0.5709,\ 0.1354)$。
7. 上下文：$0.2937\,(1, 1) + 0.5709\,(2, 0) + 0.1354\,(0, -1) = (0.2937 + 1.1418,\ 0.2937 - 0.1354) = (1.4355,\ 0.1583)$。

权重之和为 1，上下文位于各注释向量之间，理应如此。

```python
import numpy as np

H = np.array([[1, 1], [2, 0], [0, -1]], float)         # rows are h_1, h_2, h_3

def softmax(e):
    e = np.exp(e - e.max())
    return e / e.sum()

for s in ([1, 0], [3, 0]):
    s = np.array(s, float)
    e = H @ s                                          # dot-product scores
    a = softmax(e)
    print(f"s = {s}: e = {e}, alpha = {a.round(4)}, context = {(a @ H).round(4)}, "
          f"alpha(1-alpha) = {(a * (1 - a)).round(4)}")

W_a, U_a, v_a = np.eye(2), np.array([[1, 0], [0.5, -0.5]]), np.array([1, 0.5])
s_prev = np.array([-0.5, 0.5])
pre = H @ U_a.T + W_a @ s_prev                        # U_a h_j + W_a s_{t-1}
e = np.tanh(pre) @ v_a
a = softmax(e)
print("additive: e =", e.round(4), " alpha =", a.round(4),
      " context =", (a @ H).round(4))

rng = np.random.default_rng(0)
for d in (4, 64, 1024):
    q, k = rng.standard_normal((20000, d)), rng.standard_normal((20000, d))
    print(f"d = {d:4d}: variance of q.k = {(q * k).sum(axis=1).var():.1f}")
```

```output
s = [1. 0.]: e = [1. 2. 0.], alpha = [0.2447 0.6652 0.09  ], context = [1.5752 0.1547], alpha(1-alpha) = [0.1848 0.2227 0.0819]
s = [3. 0.]: e = [3. 6. 0.], alpha = [0.0473 0.9503 0.0024], context = [1.948 0.045], alpha(1-alpha) = [0.0451 0.0472 0.0024]
additive: e = [ 0.6932  1.3577 -0.0813]  alpha = [0.2937 0.5709 0.1354]  context = [1.4355 0.1583]
d =    4: variance of q.k = 4.0
d =   64: variance of q.k = 64.5
d = 1024: variance of q.k = 1023.5
```
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
各用两句话回答：为什么循环神经网络不能在时间上并行训练，而 Transformer 可以？然后，不必计算大小：生成过程中，一条序列从 4,096 个 token 增长到 32,768 个 token。LSTM 每条序列的状态增长多少倍？Transformer 的 KV cache 增长多少倍？这对一个加速器的显存能同时容纳的序列数意味着什么？
:::

::: solution
**循环神经网络**。状态 $\mathbf{h}_t$ 是 $\mathbf{h}_{t-1}$ 的非线性函数，所以第 $t$ 步必须等第 $t-1$ 步完成后才能开始。教师强制使*输入*提前已知，但并不能打破这条链：无论有多少处理器空闲，这 $T$ 步仍是一个相互依赖的序列（[第 12 节](#s12)）。

**Transformer**。在一层之内，每个位置依赖的是该层的*输入*，而教师强制使这些输入已知；它不依赖于同一层其他位置的输出。因此所有位置可以一起计算，每层一次带掩码的矩阵运算（[模块 06](module_06_ZH.html)）。

**状态与缓存**。LSTM 每层保存一个固定的 $(\mathbf{h}, \mathbf{c})$，无论上下文多长：倍数为 **1**。KV cache 为每个过去的 token 存储一个键和一个值，所以它与上下文成正比增长：倍数为 $32{,}768/4{,}096 = $ **8**。在[第 12 节](#s12)的例子中，缓存在 4,096 个 token 时为 0.81 GB，在 32,768 个 token 时为 6.44 GB。

**后果**。对于存放权重之后剩余的固定显存预算，同时处理的序列数等于预算除以每条序列的状态。LSTM 在任何长度下都能容纳*同样*多的序列。如果缓存占主导，Transformer 在 32,768 个 token 时能容纳的序列数只有 4,096 个 token 时的八分之一。这就是[第 12 节](#s12)的权衡：Transformer 在训练中得到的好处，要在推理时付出代价，[模块 10](module_10_ZH.html) 推导了它对部署服务的影响。
:::

::: exercise id=e13 level=2 kind=calculation minutes=10
(a) 对 $h_t = 0.8\,h_{t-1} + x_t$、$y_t = 2h_t$、$h_0 = 0$ 和 $x = (2, -1, 0, 1)$，先用递推、再用与卷积核 $K_k = c\,a^k b$ 的卷积计算 $y$；说明两者一致。

(b) 连续系统 $\mathrm{d}h/\mathrm{d}t = -0.5\,h + x(t)$ 用步长为 $\Delta$ 的零阶保持进行离散化。对 $\Delta = 0.1$、1 和 5 计算 $a$ 和 $b$，在 $\Delta = 1$ 和 $\Delta = 5$ 时与前向欧拉法比较，并解释 $\Delta$ 的含义。

(c) 对复模态 $\lambda = 0.98\,e^{i\pi/12}$，给出其卷积核的半衰期和振荡周期。

(d) 为什么让 $\Delta$ 依赖于 $x_t$（如 Mamba 那样）会去掉卷积形式？那么用什么来并行地计算这个递推？
:::

::: solution
**(a)** 该递推有 $a = 0.8$、$b = 1$ 和 $c = 2$。

- $h_1 = 0.8\cdot0 + 2 = 2$，所以 $y_1 = 4$；
- $h_2 = 0.8\cdot2 + (-1) = 0.6$，所以 $y_2 = 1.2$；
- $h_3 = 0.8\cdot0.6 + 0 = 0.48$，所以 $y_3 = 0.96$；
- $h_4 = 0.8\cdot0.48 + 1 = 1.384$，所以 $y_4 = 2.768$。

用卷积：展开递推得 $h_t = \sum_{k=0}^{t-1}a^k b\,x_{t-k}$，因此 $y_t = \sum_k K_k\,x_{t-k}$，其中 $K_k = c\,a^kb = 2\times0.8^k$，即 $K = (2,\ 1.6,\ 1.28,\ 1.024)$。于是

- $y_1 = K_0x_1 = 2\cdot2 = 4$；
- $y_2 = K_0x_2 + K_1x_1 = -2 + 3.2 = 1.2$；
- $y_3 = K_0x_3 + K_1x_2 + K_2x_1 = 0 - 1.6 + 2.56 = 0.96$；
- $y_4 = K_0x_4 + K_1x_3 + K_2x_2 + K_3x_1 = 2 + 0 - 1.28 + 2.048 = 2.768$。

两者一致，理应如此：卷积就是展开后的递推。递推每步只需一次乘加，但必须顺序执行；卷积对每个输出是一个求和，可以并行计算（卷积核很长时用 FFT），而它之所以可行，是*因为 $a$、$b$ 和 $c$ 在每一步都相同*（[第 13 节](#s13)）。

**(b)** 在长度为 $\Delta$ 的一步内保持输入不变（零阶保持），求解 $\mathrm{d}h/\mathrm{d}t = -\lambda h + x$，其中 $\lambda = 0.5$：

$$h(t + \Delta) = e^{-\lambda\Delta}h(t) + \frac{1 - e^{-\lambda\Delta}}{\lambda}\,x, \qquad a = e^{-0.5\Delta}, \quad b = \frac{1 - e^{-0.5\Delta}}{0.5}.$$

前向欧拉法把指数换成它的一阶展开：$a = 1 - 0.5\Delta$，$b = \Delta$。

| $\Delta$ | 零阶保持 $a$ | 零阶保持 $b$ | 前向欧拉 $a$ | 前向欧拉 $b$ |
|---|---|---|---|---|
| 0.1 | 0.9512 | 0.0975 | 0.95 | 0.1 |
| 1 | 0.6065 | 0.7869 | 0.5 | 1 |
| 5 | 0.0821 | 1.8358 | $-1.5$ | 5 |

在 $\Delta = 0.1$ 时两种格式几乎一致。在 $\Delta = 1$ 时欧拉法已经不准确（0.5 对 0.6065）。在 $\Delta = 5$ 时欧拉法给出 $a = -1.5$：$|a| > 1$，对一个稳定的系统给出了*不稳定*的递推。这里欧拉法只在 $\Delta < 4$ 时稳定（条件为 $|1 - 0.5\Delta| < 1$）。零阶保持对任何 $\Delta$ 都把稳定的连续极点映射为 $|a| < 1$，这就是状态空间模型用它来离散化的原因。

**$\Delta$ 的含义**。它是系统在两次采样之间被允许演化的时间。小的 $\Delta$ 保留状态（$a$ 接近 1），写入很少（$b$ 很小）；大的 $\Delta$ 遗忘（$a$ 接近 0），写入很多。由于 $\lambda b = 1 - a$，更新为 $h_t = a\,h_{t-1} + (1 - a)\,(x_t/\lambda)$，是旧状态与缩放后输入的凸组合，遗忘的多少由 $\Delta$ 设定：这恰好是 GRU 更新的形式（[第 6 节](#s6)）。$\Delta$ 起到了门的作用。

**(c)** 该模态的卷积核为 $\lambda^k = 0.98^k e^{ik\pi/12}$，其实部为 $0.98^k\cos(k\pi/12)$。包络 $0.98^k$ 在 $0.98^k = 0.5$ 时减半，即在 $k = \ln0.5/\ln0.98 = 34.3$ 步处。余弦在 $k\pi/12 = 2\pi$ 时重复，所以周期为 $2\pi/(\pi/12) = 24$ 步。这个模态是一个阻尼振荡，其包络每 34.3 步减半，约合 1.4 个振荡周期，这正是学到的共振的样子（[第 13 节](#s13)）。

**(d)** 只有当 $\bar A$、$\bar B$ 和 $C$ 在每一步都相同时，才存在单一的卷积核 $K_k = C\bar A^kB$。当 $\Delta_t$ 依赖于 $x_t$ 时，$\bar A_t = e^{-\lambda\Delta_t}$ 每一步都不同，输入 $s$ 对输出 $t$ 的影响是乘积 $\bar A_t\bar A_{t-1}\cdots\bar A_{s+1}$，对每一对 $(s, t)$ 都不同。没有哪一个 $K_k$ 序列能描述它。不过，递推 $h_t = a_th_{t-1} + b_t$ 仍然*对 $h$ 是线性的*，而线性递推的复合满足结合律：一步就是一对 $(a_t, b_t)$，先应用 $(a_1, b_1)$ 再应用 $(a_2, b_2)$ 得到 $h \mapsto a_2(a_1h + b_1) + b_2$，即一对 $(a_2a_1,\ a_2b_1 + b_2)$。满足结合律的运算可以按树的方式求值，所以**并行扫描**在 $O(\log T)$ 轮内算出全部 $T$ 个状态（[第 13 节](#s13)）。下面的脚本对 (a)、(b) 和 (c) 做数值核对，然后把一个 $a_t$ 依赖于输入的扫描与顺序循环进行比较。

```python
import numpy as np

x = np.array([2.0, -1.0, 0.0, 1.0])
a, b, c = 0.8, 1.0, 2.0
h, y_rec = 0.0, []
for xt in x:
    h = a * h + b * xt                                 # recurrence
    y_rec.append(c * h)
K = np.array([c * a ** k * b for k in range(len(x))])  # kernel K_k = c a^k b
y_conv = [sum(K[k] * x[t - k] for k in range(t + 1)) for t in range(len(x))]
print("recurrence:", np.round(y_rec, 4), " kernel:", K,
      " convolution:", np.round(y_conv, 4))

lam = 0.5                                              # dh/dt = -lam h + x(t)
for delta in (0.1, 1.0, 5.0):
    a_zoh = np.exp(-lam * delta)
    b_zoh = (1 - a_zoh) / lam
    print(f"delta = {delta}: ZOH a = {a_zoh:.4f}, b = {b_zoh:.4f}; "
          f"Euler a = {1 - lam * delta:.4f}, b = {delta:.4f}")
mode = 0.98 * np.exp(1j * np.pi / 12)
print(f"|lambda| = {abs(mode):.2f}, half-life = {np.log(0.5) / np.log(abs(mode)):.1f} "
      f"steps, period = {2 * np.pi / np.angle(mode):.1f} steps")
```

```output
recurrence: [4.    1.2   0.96  2.768]  kernel: [2.    1.6   1.28  1.024]  convolution: [4.    1.2   0.96  2.768]
delta = 0.1: ZOH a = 0.9512, b = 0.0975; Euler a = 0.9500, b = 0.1000
delta = 1.0: ZOH a = 0.6065, b = 0.7869; Euler a = 0.5000, b = 1.0000
delta = 5.0: ZOH a = 0.0821, b = 1.8358; Euler a = -1.5000, b = 5.0000
|lambda| = 0.98, half-life = 34.3 steps, period = 24.0 steps
```

```python
import numpy as np

def recurrence(a, b):
    """h_t = a_t h_{t-1} + b_t with h_0 = 0, one step after another."""
    h, out = 0.0, []
    for at, bt in zip(a, b):
        h = at * h + bt
        out.append(h)
    return np.array(out)

def scan(a, b):
    """Same result in ceil(log2 T) rounds; each round combines (a, b) pairs with
    (a2, b2) after (a1, b1) = (a2 * a1, a2 * b1 + b2), which is associative."""
    a, b, shift = a.copy(), b.copy(), 1
    rounds = 0
    while shift < len(a):
        a_prev = np.concatenate([np.ones(shift), a[:-shift]])    # identity pair
        b_prev = np.concatenate([np.zeros(shift), b[:-shift]])   # for t < shift
        b, a = a * b_prev + b, a * a_prev
        shift *= 2
        rounds += 1
    return b, rounds

rng = np.random.default_rng(0)
T = 37
delta = rng.uniform(0.05, 2.0, T)           # input-dependent step sizes
a = np.exp(-0.5 * delta)                    # a_t = exp(-lambda * delta_t), lambda = 0.5
b = (1 - a) / 0.5 * rng.standard_normal(T)  # b_t * x_t
h_loop = recurrence(a, b)
h_scan, rounds = scan(a, b)
print(f"max difference {np.abs(h_loop - h_scan).max():.2e} after {rounds} rounds "
      f"instead of {T} steps")
```

```output
max difference 4.44e-16 after 6 rounds instead of 37 steps
```

六轮代替了 37 个顺序步骤；对 $T = 100{,}000$，将是 17 轮。
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
为每种情形选择一种序列模型，并用一两句话说明理由。

(a) 在一块有 64 KiB RAM 的微控制器上，根据 1 kHz 的加速度计数据在设备端检测轴承故障，依赖关系长达 2 s。

(b) 离线地把上个月 50,000 行工厂日志中的每个事件标记为常规或异常。

(c) 根据四年的历史，预测一栋建筑未来三周的每日能耗。

(d) 一个处理 100,000 个传感器样本长的序列的模型，序列在所有尺度上都有结构，在 GPU 上训练。
:::

::: solution
决策取决于情形的四个性质：在线还是离线，每步有多少内存和计算，依赖关系有多长，以及有多少数据（[第 12 节](#s12)）。

(a) **一个小型 GRU 或 LSTM，或一个对角线性循环，以循环模式运行**。状态是恒定的，至多几 kB（$H = 64$ 的 fp32 GRU 保存 $64\times4 = 256$ B），每个样本的计算开销都同样很小。其他方案所需的内存都超过设备所有。覆盖 1 kHz 下 2 s 的时间卷积网络需要 2,000 个样本的感受野：卷积核大小为 2、空洞为 1 到 1024 时得到 $1 + 2{,}047 = 2{,}048$，而对它做流式处理，每层需要 $(k-1)d$ 个样本的缓冲区，每个通道合计 $2{,}047$ 个样本。16 个通道、fp32 时为 $2{,}047\times16\times4 = 131{,}008$ B，约 128 KiB，是 RAM 的两倍；int8 时为 32.8 kB，是 RAM 的一半。Transformer 在 2,000 个样本上的缓存，若有两层、宽度 32、int8，则为 $2\times2\times2{,}000\times32 = 256{,}000$ B，约 250 KiB。（这些都是按上述大小手算的。）普通的循环网络在 1 kHz 原始样本上学不到 2,000 步的滞后，所以还要降低速率（比如说每 20 ms 一帧的特征），或使用 $|\lambda|$ 接近 1 的线性循环（[第 13 节](#s13)）。

(b) **在日志的窗口上使用双向 LSTM 或 Transformer 编码器**。任务是离线的，所以每一行的标签可以利用两侧的行（[第 6 节](#s6)）；应当先做一个基线，例如基于行特征的逻辑回归（[模块 01](module_01_ZH.html)），以弄清上下文带来多少增益。

(c) **先做基线：季节性朴素预测（以周为周期）和带日历特征的线性模型；只有当神经网络预测器在前向滚动验证的各折上胜过它们时才使用它**。四年的每日数据约有 1,460 个样本，要训练一个深度模型去胜过精心选择的线性模型，数据远远不够，而三周的预测范围只能留出寥寥几个独立的测试块（[第 8 节](#s8)）。

(d) **状态空间模型或线性循环的堆叠，或者采用高效注意力变体的 Transformer**。线性循环以卷积模式或扫描模式训练，时间与长度成线性关系，并通过具有不同 $\lambda$ 的模态覆盖所有尺度上的结构（[第 13 节](#s13)）。普通的 LSTM 会是一个 100,000 步的串行循环；完全注意力每层每个头要计算 $T^2 = 10^{10}$ 个得分（[第 12 节](#s12)）。
:::

::: exercise id=e15 level=3 kind=coding minutes=25
在[实验 3](#lab3) 的预测器中，把 LSTM 换成时间卷积网络（TCN；[第 12 节](#s12)）：卷积核大小为 2、空洞为 1、2、4、8、16、32 的因果一维卷积（[模块 03](module_03_ZH.html)），32 个通道，ReLU，层与层之间有残差连接（第一个残差用一个 $1\times1$ 卷积把单个输入通道提升到 32 个），在最后一个时间步上接一个线性头。保留逐窗口归一化。在同样的四个前向滚动验证折上，用同样的优化器、batch 大小和轮数训练它。

报告：(a) 感受野的计算；(b) 参数量，与 LSTM 的 12,961 比较；(c) 各折一步 RMSE 的均值 $\pm$ 标准差，与 LSTM 和线性基线比较；(d) 两个网络每折的训练时间；(e) 用一段话说明你会在什么时候选择哪一个。
:::

::: solution
**方案**。设置与实验 3 相同：64 个样本的窗口和一步目标；各折的起点为 4,000、5,000、6,000 和 7,000，每折在其后的 1,000 个样本上验证；序列用每折训练部分的统计量做 z 分数标准化，再减去窗口的最后一个值。数据是实验 3 中的渐硬支座（Duffing 振子）信号，这里重复给出，使脚本自成一体。TCN 中重要的选择有两个。

- **因果性**。卷积核为 2、空洞为 $d$ 的卷积查看位置 $t$ 和 $t - d$。在*左侧*填充 $(k-1)d$ 个零，使输出长度保持为 64，并使 $t$ 处的输出只依赖于 $\le t$ 的输入。两侧都填充，会让输出读到窗口内的未来。
- **残差**。每层的输出为 $\text{ReLU}(\text{conv}(\cdot)) + \text{跳跃}$。一旦通道数为 32，跳跃路径就是恒等映射；但第一层从 1 个通道变为 32 个，所以它的跳跃路径是一个 $1\times1$ 卷积（即“提升”）。

**(a) 感受野**。卷积核为 $k$、空洞为 $d_l$ 时，TCN 看到 $1 + (k-1)\sum_l d_l$ 个样本（[第 12 节](#s12)）。这里 $1 + 1\cdot(1 + 2 + 4 + 8 + 16 + 32) = 1 + 63 = 64$，恰好是一个窗口。每一层把覆盖范围加倍。层数更少，最老的样本就用不上；第七层（空洞 64）会伸到窗口之外，只读到填充。

**(b) 参数量**。手算：第一个卷积有 $1\times32\times2$ 个权重和 32 个偏置，共 $96$。其余五个各有 $32\times32\times2 + 32 = 2{,}080$，五个共 $10{,}400$。$1\times1$ 提升为 $1\times32 + 32 = 64$。头部为 $32 + 1 = 33$。总数为 $96 + 10{,}400 + 64 + 33 = 10{,}593$，而 LSTM 为 12,961（[第 5 节](#s5)）：少 18%。

**代码**。脚本在四折上运行两个网络和线性基线。`SEED`（第一个命令行参数）设定权重初始化和 batch 的顺序。

```python
import math
import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 0
torch.set_num_threads(4)
W = 64                                           # window length, as in Lab 3


def simulate(n=8000, seed=0):
    """Stiffening mount (Duffing oscillator) under periodic + random forcing."""
    rng = np.random.default_rng(seed)
    w0, zeta, k3, amp, sig_f, dt, sub = math.pi, 0.05, 40.0, 3.0, 3.0, 0.01, 10
    kicks = rng.standard_normal(n * sub)
    x = v = 0.0
    out = np.empty(n)
    for i in range(n * sub):
        acc = (-2 * zeta * w0 * v - w0 ** 2 * x - k3 * x ** 3
               + amp * math.sin(2 * math.pi * i * dt / 5.0))
        v += dt * acc + sig_f * math.sqrt(dt) * kicks[i]
        x += dt * v
        if (i + 1) % sub == 0:
            out[(i + 1) // sub - 1] = x
    return out + 1e-3 * np.arange(n) + 0.05 * rng.standard_normal(n)


def windows(z, lo, hi):
    """Inputs z[t-W:t] and targets z[t] for every t in [lo, hi)."""
    idx = np.arange(lo, hi)
    X = np.stack([z[t - W:t] for t in idx])[:, :, None]
    X = torch.tensor(X, dtype=torch.float32)
    return X, torch.tensor(z[idx], dtype=torch.float32)


class LSTMForecaster(nn.Module):
    def __init__(self, hidden=32):
        super().__init__()
        self.lstm = nn.LSTM(1, hidden, num_layers=2, dropout=0.1, batch_first=True)
        self.head = nn.Linear(hidden, 1)

    def forward(self, x):                        # x: (B, 64, 1)
        last = x[:, -1:, :]                      # per-window normalisation
        out, _ = self.lstm(x - last)
        return self.head(out[:, -1]).squeeze(-1) + last[:, 0, 0]


class TCNForecaster(nn.Module):
    def __init__(self, channels=32, dilations=(1, 2, 4, 8, 16, 32), k=2):
        super().__init__()
        self.k, self.dilations = k, dilations
        self.convs = nn.ModuleList(
            nn.Conv1d(1 if i == 0 else channels, channels, k, dilation=d)
            for i, d in enumerate(dilations))
        self.lift = nn.Conv1d(1, channels, 1)    # 1x1 conv: skip path of layer 1
        self.head = nn.Linear(channels, 1)

    def forward(self, x):
        last = x[:, -1:, :]
        h = (x - last).transpose(1, 2)           # (B, 1, 64): channels first
        for i, (conv, d) in enumerate(zip(self.convs, self.dilations)):
            y = F.relu(conv(F.pad(h, ((self.k - 1) * d, 0))))  # left pad: causal
            h = y + (self.lift(h) if i == 0 else h)             # residual
        return self.head(h[:, :, -1]).squeeze(-1) + last[:, 0, 0]


def train(model, X, y, epochs=10, bs=128, lr=3e-3):
    gen = torch.Generator().manual_seed(SEED)
    opt = torch.optim.AdamW(model.parameters(), lr=lr)
    for _ in range(epochs):
        model.train()
        perm = torch.randperm(len(X), generator=gen)
        for i in range(0, len(X), bs):
            b = perm[i:i + bs]
            loss = F.mse_loss(model(X[b]), y[b])
            opt.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()


def rmse(model, X, y, sd):
    model.eval()
    with torch.no_grad():
        return float((model(X) - y).pow(2).mean().sqrt()) * sd


def linear_rmse(Xtr, ytr, Xva, yva, sd):
    def feats(X):
        X = X[:, :, 0].numpy()
        return np.hstack([X - X[:, -1:], np.ones((len(X), 1))]), X[:, -1]
    Ftr, ltr = feats(Xtr)
    Fva, lva = feats(Xva)
    coef = np.linalg.lstsq(Ftr, ytr.numpy() - ltr, rcond=None)[0]
    return float(np.sqrt(((Fva @ coef + lva - yva.numpy()) ** 2).mean())) * sd


series = simulate()
dil = (1, 2, 4, 8, 16, 32)
print("receptive field:", 1 + (2 - 1) * sum(dil), "samples")
rows = []
for origin in (4000, 5000, 6000, 7000):
    mu, sd = series[:origin].mean(), series[:origin].std()
    z = (series - mu) / sd                      # statistics of the training part only
    Xtr, ytr = windows(z, W, origin)
    Xva, yva = windows(z, origin, origin + 1000)
    row = [linear_rmse(Xtr, ytr, Xva, yva, sd)]
    for cls in (LSTMForecaster, TCNForecaster):
        torch.manual_seed(SEED)
        model = cls()
        t0 = time.perf_counter()
        train(model, Xtr, ytr)
        seconds = time.perf_counter() - t0
        row += [rmse(model, Xva, yva, sd), seconds]
        n_par = sum(p.numel() for p in model.parameters())
        if origin == 4000:
            print(f"{cls.__name__}: {n_par:,} parameters")
    rows.append(row)
    print(f"origin {origin}: linear {row[0]:.3f}  LSTM {row[1]:.3f} ({row[2]:.1f} s)"
          f"  TCN {row[3]:.3f} ({row[4]:.1f} s)")
rows = np.array(rows)
mean, std = rows.mean(0), rows.std(0)
print(f"linear {mean[0]:.3f} +- {std[0]:.3f}")
print(f"LSTM   {mean[1]:.3f} +- {std[1]:.3f}   {mean[2]:.1f} s per fold")
print(f"TCN    {mean[3]:.3f} +- {std[3]:.3f}   {mean[4]:.1f} s per fold")
print(f"TCN training time is {100 * (1 - mean[4] / mean[2]):.0f}% shorter")
```

```output
receptive field: 64 samples
LSTMForecaster: 12,961 parameters
TCNForecaster: 10,593 parameters
origin 4000: linear 0.166  LSTM 0.139 (8.8 s)  TCN 0.137 (5.6 s)
origin 5000: linear 0.148  LSTM 0.130 (9.0 s)  TCN 0.127 (6.6 s)
origin 6000: linear 0.151  LSTM 0.134 (10.2 s)  TCN 0.134 (8.4 s)
origin 7000: linear 0.154  LSTM 0.134 (12.8 s)  TCN 0.137 (9.4 s)
linear 0.155 +- 0.007
LSTM   0.134 +- 0.003   10.2 s per fold
TCN    0.134 +- 0.004   7.5 s per fold
TCN training time is 27% shorter
```

参数量 12,961 和 10,593 与手算一致。标准差只基于四折（总体形式，`ddof=0`），所以它描述的是各折之间的离散程度，而不是置信区间。

**(c) 准确率**。以信号自身的单位计，一步 RMSE 对 TCN 为 $0.134\pm0.004$，对 LSTM 为 $0.134\pm0.003$，对线性自回归为 $0.155\pm0.007$。TCN **与 LSTM 打成平手**，比线性基线好约 14%，而要证明使用任何网络是合理的，都必须先胜过这个基线（[第 8 节](#s8)）。两个网络是打平而不是分出高下，这一点通过换用其他种子重复运行得到证明。种子 1 给出 TCN $0.132\pm0.004$ 对 LSTM $0.138\pm0.006$；种子 2 给出 TCN $0.134\pm0.004$ 对 LSTM $0.134\pm0.006$（线性基线不依赖于种子）。三个种子下两个网络之差分别为 $0.000$、$-0.006$ 和 $0.000$，不大于各折之间的离散程度。两个网络都以在各种子间稳定的幅度胜过线性模型，因为渐硬弹簧是非线性的。你自己的数字在最后一位会有所不同。

**(d) 训练时间**。每折 LSTM 用时 8.8 到 12.8 s（平均 10.2 s），TCN 用时 5.6 到 9.4 s（平均 7.5 s），少 27%。在同一台机器上反复运行，RMSE 完全相同，节省的比例在约 10% 到 50% 之间，取决于机器上同时还在做什么。用时从第一折到最后一折逐渐上升，因为训练集从 3,936 个窗口增长到 6,936 个。计时取决于机器的负载，所以要看比值，而不是秒数。节省并非来自更少的算术运算。手算乘加次数，TCN 每个窗口用 $64\times2\times32 + 5\times64\times2\times32\times32 + 64\times32 = 661{,}504$ 次，两层 LSTM 用 $64\times(4\times32\times33 + 4\times32\times64) = 794{,}624$ 次：大致相当。节省来自结构：TCN 用一次卷积算出每层全部 64 个位置，共六次大运算，而 LSTM 每层要运行 64 个相互依赖的步骤，共 128 次小运算（[第 12 节](#s12)）。在 GPU 上，小运算会让硬件闲置，差距更大。

**(e) 什么时候选择哪一个**。当所需的依赖长度已知且有界（这里是 64 个样本，足以覆盖负载 50 个样本的周期）、训练速度很重要、并且固定长度的窗口很自然时，选择 **TCN**。它在时间上并行训练，通往任一输入的梯度路径至多六层长。它的局限是感受野固定，早于 64 个样本的任何内容都无法影响输出，要覆盖更长的范围就要更多层；以及流式部署更麻烦：它可以流式运行，但每个空洞层级都需要一个缓冲区。当依赖长度未知或非常长，或者模型必须以很小的恒定状态逐步运行时，例如在[练习 14](#e14)(a) 的微控制器上，选择 **LSTM**（或线性循环，[第 13 节](#s13)）。由于每步计算量恒定，它是实时数据流的天然监测器。在这里，两者准确率打平，决策取决于工程约束，而不是指标。
:::
