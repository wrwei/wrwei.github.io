## 练习 {#exercises}

共十五道练习，按所需工作量分级。一星练习（★）是概念题，约五分钟：用几句话作答即可。二星练习（★★）是推导或计算，约十分钟，在纸上借助计算器完成。唯一的三星练习（★★★）是一个约 25 分钟、需要写代码的小项目。第一类有七道（35 分钟），第二类七道（70 分钟），第三类一道，合计 130 分钟。学习计划把每道练习安排在它所考查的阅读内容之后，使每段阅读都不会长时间没有动手的环节。

先尝试每一道练习，再打开它的解答。解答默认是隐藏的，打开后应当完整阅读：每道解答先给出答案，再给出每一步及其理由，其中每个数字都经过计算和核对。解答含有代码之处，代码都实际运行过，所示输出就是它打印的结果；最后几位数字在你的机器上可能不同。如果你的答案与解答不同，先找出两者开始分歧的第一行，再往下读。方法正确而数字错误，通常是笔误。用不同的方法得到正确的数字，值得与解答的方法对照，因为差别往往暴露出某个假设。练习使用各自的数字：除练习 4 和练习 8 引用了[实验 2](#lab2) 和[实验 4](#lab4) 的结果外，没有一道重复正文中的例题或检查题。

::: exercise id=e1 level=2 kind=calculation minutes=10
**输出尺寸，以及窗口从未读取的行**。一个 7 × 7 的单通道输入与一个 3 × 3 卷积核做卷积。填充 $p$、步长 $s$ 和空洞 $d$ 在两个轴上相同。

(a) 给出 $(p, s, d) = (0,1,1)$、$(1,1,1)$、$(1,2,1)$、$(0,1,2)$ 和 $(0,2,2)$ 时的输出尺寸。

(b) 对两种步长为 2 的情形，列出每个输出行读取的输入行。有没有从未被读取的输入行？如果有，是哪些？

(c) 空洞为 2、步长为 1 时，多大的填充能使输出保持 7 × 7？
:::

::: solution
**(a) 尺寸**。[第 3 节](#s3)的公式数的是窗口的位置。空洞为 $d$ 的 $3 \times 3$ 卷积核，其窗口跨越 $d(k-1) + 1$ 个格子；填充后，该轴有 $H + 2p$ 个格子。窗口从第 $0, s, 2s, \dots$ 格开始，最后一个起点是仍能容下整个跨度的那一个，位于 $H + 2p - d(k-1) - 1$。数出起点的个数，得到

$$
H_{\text{out}} = \left\lfloor \frac{H + 2p - d(k-1) - 1}{s} \right\rfloor + 1 .
$$

当 $H = 7$、$k = 3$ 时，分子为 $7 + 2p - 2d - 1 = 6 + 2p - 2d$：

| $(p, s, d)$ | 跨度 | 分子 | 输出尺寸 |
|---|---|---|---|
| $(0, 1, 1)$ | 3 | 4 | $\lfloor 4/1 \rfloor + 1 = 5$ |
| $(1, 1, 1)$ | 3 | 6 | $\lfloor 6/1 \rfloor + 1 = 7$ |
| $(1, 2, 1)$ | 3 | 6 | $\lfloor 6/2 \rfloor + 1 = 4$ |
| $(0, 1, 2)$ | 5 | 2 | $\lfloor 2/1 \rfloor + 1 = 3$ |
| $(0, 2, 2)$ | 5 | 2 | $\lfloor 2/2 \rfloor + 1 = 2$ |

每个轴上的尺寸依次为 5、7、4、3 和 2，所以输出分别为 $5 \times 5$、$7 \times 7$、$4 \times 4$、$3 \times 3$ 和 $2 \times 2$。

**(b) 步长为 2 的窗口读取了什么**。在填充后的坐标中计算：填充后的第 $q$ 格就是输入的第 $q - p$ 行；落在 $0, \dots, 6$ 之外的格子是填充。

- $(1, 2, 1)$：填充后的轴有 9 个格子，编号 $0$ 到 $8$。窗口从 $0, 2, 4, 6$ 开始，读取填充后的格子 $\{0,1,2\}$、$\{2,3,4\}$、$\{4,5,6\}$ 和 $\{6,7,8\}$。减去 $p = 1$，各输出行读取的输入行为 $\{-1,0,1\}$、$\{1,2,3\}$、$\{3,4,5\}$ 和 $\{5,6,7\}$，其中 $-1$ 和 $7$ 是填充。**每个输入行都被读到了**。第 1、3、5 行被读取两次，因为宽为 3、步长为 2 的窗口与相邻窗口重叠 $k - s = 1$ 行；第 0、2、4、6 行被读取一次。
- $(0, 2, 2)$：没有填充，每个窗口跨越 5 个格子。窗口从 $0$ 和 $2$ 开始（下一个起点 $4$ 会一直延伸到第 8 行）。它们的抽头是第 $\{0, 2, 4\}$ 行和第 $\{2, 4, 6\}$ 行。**第 1、3、5 行从未被读取**。

第二种情形并不是尺寸上的巧合。每个窗口都从步长的倍数 $t = s m$ 开始，读取 $t, t + d, t + 2d$，所以它读取的每一行都是 $\gcd(s, d)$ 的倍数。这里 $\gcd(2, 2) = 2$，只有偶数行可见。这与[第 3 节](#s3)中空洞堆叠的网格效应是同一种缺陷，只不过它经由步长而不是经由重复的空洞产生。在二维中情况更糟：只有两个坐标都是偶数的 16 个像素被读取，只占 49 个像素的三分之一。

**(c) 带空洞时的“same”填充**。步长为 1 且分子为 $H - 1$ 时尺寸不变，所以 $H + 2p - d(k-1) - 1 = H - 1$，由此得 $p = d(k-1)/2$。当 $d = 2$、$k = 3$ 时，$p = 2$，而确实有 $\lfloor (7 + 4 - 4 - 1)/1 \rfloor + 1 = 7$。空洞卷积核的跨度是 5，所以它需要与 $5 \times 5$ 卷积核一样宽的边界。

下面的循环用 PyTorch 核对了以上全部结果。它把一个轴当作对全 1 输入的一维卷积来运行，然后读出输出之和对每个输入格子的梯度，这个梯度就是读取该格子的窗口个数。

```python
import torch
import torch.nn as nn

def rows_read(h, k, p, s, d):
    """Output length, and how many windows read each input row (one axis)."""
    conv = nn.Conv1d(1, 1, k, stride=s, padding=p, dilation=d, bias=False)
    nn.init.ones_(conv.weight)
    x = torch.ones(1, 1, h, requires_grad=True)
    y = conv(x)
    y.sum().backward()          # d(sum y)/dx[i] = number of windows that read x[i]
    return y.shape[-1], x.grad[0, 0].int().tolist()

for p, s, d in [(0, 1, 1), (1, 1, 1), (1, 2, 1), (0, 1, 2), (0, 2, 2), (2, 1, 2)]:
    size, counts = rows_read(7, 3, p, s, d)
    print(f"p={p} s={s} d={d}: output {size}, reads per row {counts}")
```

```output
p=0 s=1 d=1: output 5, reads per row [1, 2, 3, 3, 3, 2, 1]
p=1 s=1 d=1: output 7, reads per row [2, 3, 3, 3, 3, 3, 2]
p=1 s=2 d=1: output 4, reads per row [1, 2, 1, 2, 1, 2, 1]
p=0 s=1 d=2: output 3, reads per row [1, 1, 2, 1, 2, 1, 1]
p=0 s=2 d=2: output 2, reads per row [1, 0, 2, 0, 2, 0, 1]
p=2 s=1 d=2: output 7, reads per row [2, 2, 3, 3, 3, 2, 2]
```

输出尺寸与公式一致，$(1, 2, 1)$ 和 $(0, 2, 2)$ 读取的行就是上面列出的那些，最后一行对应 (c) 小题。形状正确并不说明每个输入都被用到了：$(0, 2, 2)$ 层返回一张完全正常的 $2 \times 2$ 特征图，却忽略了三分之二的输入。
:::

::: exercise id=e2 level=2 kind=derivation minutes=10
**通往 9 × 9 感受野的三条路**。(a) 证明 $n$ 个堆叠的、步长为 1 的 $k \times k$ 卷积，其感受野与单个大小为 $n(k-1) + 1$ 的卷积相同。

(b) 每层都有 $C$ 个输入通道和 $C$ 个输出通道，且不含偏置。比较达到 $9 \times 9$ 感受野的三种方式：一个 $9 \times 9$ 层、两个 $5 \times 5$ 层和四个 $3 \times 3$ 层。统计权重数、每个输出位置的乘加次数，以及非线性的个数（每层之后一个）。

(c) 推广到 $n$ 个堆叠的 $3 \times 3$ 层与一个 $(2n+1) \times (2n+1)$ 层的比较。随着 $n$ 增大，堆叠所用的权重占多大比例？它放弃了什么？
:::

::: solution
**(a) 堆叠的感受野**。沿一个轴计算。单层的一个单元读取 $k$ 个连续的输入，所以 $r_1 = k$。设第 $n - 1$ 层的一个单元依赖于由 $r_{n-1}$ 个连续输入构成的窗口。第 $n$ 层的一个单元读取第 $n - 1$ 层的 $k$ 个相邻单元，而由于步长为 1，相邻单元的窗口彼此错开一个输入。$k$ 个宽为 $r_{n-1}$、依次错开一格的窗口，其并集是一个宽为 $r_{n-1} + (k - 1)$ 的窗口。所以 $r_n = r_{n-1} + (k - 1)$，这正是[第 3 节](#s3)的递推式在每个跳距都等于 1、每个空洞都等于 1 时的情形。从 $r_0 = 1$（单元只看到它自己）出发，

$$
r_n = 1 + n(k - 1) .
$$

$k = 3$ 时它是 $2n + 1$，$k = 5$ 时是 $4n + 1$，而 $9 \times 9$ 的感受野需要 $n(k-1) = 8$：$(k, n) = (9, 1)$、$(5, 2)$ 或 $(3, 4)$。

**(b) 三种设计**。输入和输出各有 $C$ 个通道的 $k \times k$ 层有 $k^2 C^2$ 个权重。在步长为 1、“same”填充下，它在每个位置计算一个输出向量，每个权重在每个位置使用一次，所以每个输出位置的乘加次数等于权重数（[第 4 节](#s4)）：

| 设计 | 感受野 | 权重 | 每个位置的 MAC | 非线性个数 |
|---|---|---|---|---|
| 一个 $9 \times 9$ | 9 | $81\,C^2$ | $81\,C^2$ | 1 |
| 两个 $5 \times 5$ | 9 | $2 \cdot 25\,C^2 = 50\,C^2$ | $50\,C^2$ | 2 |
| 四个 $3 \times 3$ | 9 | $4 \cdot 9\,C^2 = 36\,C^2$ | $36\,C^2$ | 4 |

具体地，在 $40 \times 40$ 的特征图（1,600 个位置）上取 $C = 32$：权重数分别为 82,944、51,200 和 36,864，三种设计的开销分别为 132.7 M、81.9 M 和 59.0 M 次 MAC。最深的堆叠最便宜，权重不到单层的一半，而且非线性最多。这是把[第 7 节](#s7)中 VGG 的论证再往前推两步：每一步都把一个大卷积核换成一叠更深的小卷积核。

**(c) 一般的堆叠**。$n$ 个 $3 \times 3$ 层达到 $2n + 1$ 的感受野，使用 $9n\,C^2$ 个权重；一个 $(2n+1)^2$ 的层使用 $(2n+1)^2 C^2$ 个。两者之比为

$$
f(n) = \frac{9n}{(2n+1)^2} .
$$

$n = 1$ 时它等于 1（两者是同一个层），$n = 2$ 时为 72%，$n = 4$ 时为 $36/81 = 44\%$，$n = 10$ 时为 $90/441 = 20\%$。当 $n$ 很大时，$(2n+1)^2 \approx 4n^2$，所以 $f(n) \to 9/(4n)$：堆叠的开销随感受野的宽度线性增长，而单个卷积核的开销按平方增长。$n = 100$ 时，堆叠只用 2.2% 的权重，接近近似值 $9/400 = 2.25\%$。

**堆叠放弃了什么**。

1. *单个线性映射的表达能力*。没有非线性时，堆叠复合成一个卷积，但只能复合成那些可以分解为一串 $3 \times 3$ 卷积核的 $(2n+1) \times (2n+1)$ 卷积核。对 $C = 1$、$n = 2$，这是 $5 \times 5$ 卷积核的 25 个值之中一个至多 18 个参数的函数族（把一个卷积核除以某个常数、另一个乘以同一常数，结果不变，所以实际只有 17 个）：一般的 $5 \times 5$ 卷积核不是两个 $3 \times 3$ 卷积核的卷积。在层间加上非线性后，堆叠计算的是另一种更丰富的函数，并不是单层所能表示的函数的子集，但它无法表示大层能表示的每一个卷积核。
2. *感受野的形状*。堆叠的有效感受野集中在中心，近似高斯形（[第 3 节](#s3)）；单个卷积核可以让窗口边缘的权重与中心一样大。依赖于固定距离上一个细圆环的任务，用单个卷积核更容易完成。
3. *内存*。每多一层，就要为反向传播多存一张激活图：堆叠要存四张 $C$ 通道的图，单层只存一张；在高分辨率下，这往往是比权重更紧的约束（[第 4 节](#s4)）。
4. *深度*。四层依次运行，在并行硬件上会增加时延，而且每一层都会增加优化器必须穿越的深度（[第 8 节](#s8)）。

下面的检查代码用正的权重、不加非线性搭建这三种设计，使任何路径都不会相互抵消，并以中心输出的梯度所覆盖的范围来测量感受野。

```python
import torch
import torch.nn as nn

def stack(kernel_sizes, channels=4):
    """Stride-1 'same' convolutions with positive weights and no nonlinearity."""
    layers = []
    for k in kernel_sizes:
        conv = nn.Conv2d(channels, channels, k, padding=k // 2, bias=False)
        nn.init.uniform_(conv.weight, 0.1, 1.0)   # positive: no path can cancel
        layers.append(conv)
    return nn.Sequential(*layers)

for name, ks in [("one 9x9", [9]), ("two 5x5", [5, 5]), ("four 3x3", [3, 3, 3, 3])]:
    net = stack(ks)
    x = torch.ones(1, 4, 31, 31, requires_grad=True)
    net(x)[0, 0, 15, 15].backward()               # centre output unit
    rows = (x.grad[0].sum(dim=(0, 2)) != 0).nonzero().flatten()
    field = rows.max().item() - rows.min().item() + 1
    weights = sum(p.numel() for p in net.parameters())
    # 4 channels in and out, so weights = (number of layers) * k^2 * C^2 with C^2 = 16
    print(f"{name}: field {field}, weights {weights}, per C^2 {weights // 16}")
```

```output
one 9x9: field 9, weights 1296, per C^2 81
two 5x5: field 9, weights 800, per C^2 50
four 3x3: field 9, weights 576, per C^2 36
```

三种设计都看到 $9 \times 9$，每 $C^2$ 的权重数（这些堆叠的 $C = 4$，所以 $C^2 = 16$）为 81、50 和 36，与推导一致。
:::

::: exercise id=e3 level=2 kind=calculation minutes=10
**ResNet-18 的感受野**。224 × 224 输入下的 ResNet-18 以[第 3 节](#s3)例题中的 stem 开始（一个步长为 2、填充为 3 的 $7 \times 7$ 卷积，接着一个步长为 2、填充为 1 的 $3 \times 3$ 最大池化），之后是四个阶段，每个阶段两个基本块。一个基本块是两个填充为 1 的 $3 \times 3$ 卷积；第 2、3、4 阶段的第一个卷积步长为 2，所在块的捷径是步长为 2 的 $1 \times 1$ 投影；其余每个卷积的步长都为 1。

(a) 计算池化之后以及每个阶段之后的感受野和跳距。

(b) 最后一张特征图有多大？它每个单元的理论感受野是多少？感受野怎么会超过 224？

(c) 在第 2 阶段的第一个块中，比较经由主路径达到的感受野与经由投影捷径达到的感受野。一条走遍所有捷径的路径能看到什么？
:::

::: solution
**(a) 递推式**。由[第 3 节](#s3)，$r_l = r_{l-1} + (k_l - 1)\,d_l\,\Delta_{l-1}$，$\Delta_l = \Delta_{l-1}\,s_l$，从 $r_0 = 1$、$\Delta_0 = 1$ 出发。一个层新增的抽头在前一层中相隔 $(k_l - 1)$ 个单元，而前一层的一个单元与它的邻居相距 $\Delta_{l-1}$ 个输入像素；随后，该层自身的步长再拉大其上各层的间距，所以步长在 $r$ 更新之后才计入 $\Delta$。

- stem：卷积给出 $r = 1 + 6 \cdot 1 = 7$，$\Delta = 2$；池化增加 $2 \cdot 2 = 4$：$r = 11$，$\Delta = 4$。
- 第 1 阶段（步长全为 1）：四个卷积在跳距 4 下各增加 $2 \cdot 4 = 8$：$19, 27, 35, 43$。跳距保持为 4。
- 第 2 阶段：第一个卷积的步长为 2。它仍然只增加 $2 \cdot 4 = 8$，因为递推式用的是它*下面*那一层的跳距（$43 \to 51$），之后它才把跳距变为 8。其余三个卷积各增加 $2 \cdot 8 = 16$：$67, 83, 99$。
- 第 3 阶段：$99 + 16 = 115$（跳距变为 16），然后三次 $+32$：$147, 179, 211$。
- 第 4 阶段：$211 + 32 = 243$（跳距变为 32），然后三次 $+64$：$307, 371, 435$。

| 之后 | $r$ | $\Delta$ | 特征图尺寸 |
|---|---|---|---|
| stem 卷积 | 7 | 2 | 112 |
| 最大池化 | 11 | 4 | 56 |
| 第 1 阶段 | 43 | 4 | 56 |
| 第 2 阶段 | 99 | 8 | 28 |
| 第 3 阶段 | 211 | 16 | 14 |
| 第 4 阶段 | 435 | 32 | 7 |

有一个闭式可以用来核对这些算术。第一个卷积步长为 2 的阶段使感受野增加 $2\Delta + 3 \cdot 2 \cdot 2\Delta = 14\Delta$，其中 $\Delta$ 是进入该阶段时的跳距：$43 + 14 \cdot 4 = 99$，$99 + 14 \cdot 8 = 211$，$211 + 14 \cdot 16 = 435$。第 1 阶段增加 $4 \cdot 2 \cdot 4 = 32$。

```python
# Receptive field and jump through ResNet-18 at 224 x 224 (one axis).
layers = [("stem conv 7x7/2", 7, 2), ("max pool 3x3/2", 3, 2)]
for stage, first_stride in zip(range(1, 5), [1, 2, 2, 2]):
    for block in range(2):
        for conv in range(2):
            stride = first_stride if (block == 0 and conv == 0) else 1
            label = f"stage {stage} block {block + 1} conv {conv + 1}"
            layers.append((label, 3, stride))

r, jump = 1, 1
for name, k, s in layers:
    r += (k - 1) * jump          # the new taps lie (k - 1) units of the old jump apart
    jump *= s                    # then the stride widens the spacing of the units
    if "stem" in name or "pool" in name or name.endswith("block 2 conv 2"):
        print(f"{name:28s} r = {r:3d}  jump = {jump}")
```

```output
stem conv 7x7/2              r =   7  jump = 2
max pool 3x3/2               r =  11  jump = 4
stage 1 block 2 conv 2       r =  43  jump = 4
stage 2 block 2 conv 2       r =  99  jump = 8
stage 3 block 2 conv 2       r = 211  jump = 16
stage 4 block 2 conv 2       r = 435  jump = 32
```

**(b) 最后的特征图，以及比图像还大的感受野**。特征图尺寸遵循[第 3 节](#s3)的公式：$224 \to 112 \to 56 \to 56 \to 28 \to 14 \to 7$，所以最后的特征图是 $7 \times 7$（真实网络中有 512 个通道）。它的每个单元都有 $435 \times 435$ 的理论感受野，接近图像边长的两倍。单元的窗口在每一层都会伸进零填充，这些填充位置虽然不含任何内容，也被计算在内。在这些填充设置下，下标为 $i$ 的单元以输入位置 $32\,i$ 为中心，所以它的感受野覆盖 $32\,i - 217$ 到 $32\,i + 217$。中央的单元能看到全部图像。角上的单元 $i = 0$ 覆盖 $-217$ 到 $217$，所以它看到前 218 行和前 218 列，却永远看不到最后 6 行和 6 列。超出图像的理论感受野说明单元*能够*看到整幅图像，而不是说它确实看到了；有效感受野要小得多（[第 3 节](#s3)；实测的例子见[实验 3](#lab3)）。

**(c) 捷径与主路径**。在第 2 阶段的第一个块中，输入有 $r = 43$、$\Delta = 4$。主路径是两个 $3 \times 3$ 卷积，第一个步长为 2：$r = 51$，然后是 $67$，与 (a) 中相同。投影是步长为 2 的 $1 \times 1$ 卷积：它增加 $(1 - 1) \cdot 4 = 0$，所以感受野保持为 43，而它的步长使跳距变为 8，从而使它的输出与主路径的输出落在同一网格上。该块的输出是两组特征之和，一组看到 $67 \times 67$ 像素，另一组看到 $43 \times 43$ 像素。一条走遍所有捷径的路径跳过了每个分支，而 $1 \times 1$ 投影什么也不增加，所以它只看到 stem 所看到的 11 个像素。最后特征图上的一个单元是许多路径之和，这些路径的感受野从 11 到 435 不等。

第二段检查代码按真实的形状搭建网络，使用正的权重，不用 ReLU，也不用归一化（并用平均池化代替最大池化，因为最大池化会把梯度只送到每个窗口中的一个格子，从而掩盖理论感受野），然后找出影响某一个单元的输入行。

```python
import torch
import torch.nn as nn

torch.manual_seed(0)

def conv(cin, cout, k, stride, pad):
    layer = nn.Conv2d(cin, cout, k, stride, pad, bias=False)
    nn.init.uniform_(layer.weight, 0.1, 1.0)      # positive weights, no ReLU, no BN
    return layer

class Block(nn.Module):
    def __init__(self, cin, cout, stride):
        super().__init__()
        self.c1, self.c2 = conv(cin, cout, 3, stride, 1), conv(cout, cout, 3, 1, 1)
        self.skip = (nn.Identity() if stride == 1 and cin == cout
                     else conv(cin, cout, 1, stride, 0))
    def forward(self, x):
        return self.c2(self.c1(x)) + self.skip(x)

# Average pooling stands in for max pooling: a max pool sends the gradient to one
# element of its window, which would hide the theoretical field.
stem = nn.Sequential(conv(1, 4, 7, 2, 3), nn.AvgPool2d(3, 2, 1))
stages = nn.Sequential(Block(4, 4, 1), Block(4, 4, 1), Block(4, 8, 2), Block(8, 8, 1),
                       Block(8, 16, 2), Block(16, 16, 1), Block(16, 32, 2),
                       Block(32, 32, 1))

def rows_seen(modules, i, j):
    """First and last input row that influences unit (i, j); and the map width."""
    x = torch.ones(1, 1, 224, 224, requires_grad=True)
    h = x
    for m in modules:
        h = m(h)
    h[0, 0, i, j].backward()
    seen = (x.grad[0, 0].sum(dim=1) > 0).nonzero().flatten()
    return seen.min().item(), seen.max().item(), h.shape[-1]

print("last map, corner unit (0, 0):", rows_seen([stem, stages], 0, 0))
print("last map, unit (3, 3):       ", rows_seen([stem, stages], 3, 3))
stage1 = [stem, stages[:2]]
print("after stage 1, unit (28, 28):", rows_seen(stage1, 28, 28))
blk = stages[2]                                   # stage 2, block 1
print("main path of stage 2 block 1:", rows_seen(stage1 + [blk.c1, blk.c2], 14, 14))
print("shortcut of stage 2 block 1: ", rows_seen(stage1 + [blk.skip], 14, 14))
```

```output
last map, corner unit (0, 0): (0, 217, 7)
last map, unit (3, 3):        (0, 223, 7)
after stage 1, unit (28, 28): (91, 133, 56)
main path of stage 2 block 1: (79, 145, 28)
shortcut of stage 2 block 1:  (91, 133, 28)
```

最后特征图的角单元读取第 0 到 217 行，内部单元读取整幅图像，与推导一致。第 1 阶段之后感受野为 43（$91$ 到 $133$）；在 (c) 小题的块中，主路径达到 67，捷径为 43。
:::

::: exercise id=e4 level=1 kind=conceptual minutes=5
**全局平均池化为什么胜出**。在[实验 2](#lab2) 中，对于随机放置在 $16 \times 16$ 画布上的数字，以全局平均池化结尾的 CNN 达到约 0.93 的测试精度，而同样的卷积配上展平加全连接的头部只达到约 0.89，参数却更多（11,018 对 6,218）。解释这一差别，并举出一个展平头部是更好选择的任务。
:::

::: solution
**每种头部对数据提出了什么要求**。两个网络的卷积层相同。它们是等变的：笔画检测器在笔画出现的任何地方都会响应。不同之处在于最后一张特征图，即 32 个由 $4 \times 4$ 个格子构成的通道，如何变成十个类别得分。

- *全局平均池化*把每个通道在 16 个格子上取平均，得到 32 个数，再接一个有 $32 \times 10 + 10 = 330$ 个权重的线性层。这个头部无法知道某个特征在哪里响应，只知道它在某处响应得有多强，所以分类器在构造上就对数字的位置不变（这只是近似的：画布边界、零填充，以及两个 $2 \times 2$ 池化与数字的对齐方式，仍会泄漏一点位置信息）。
- *展平*保留全部 $32 \times 16 = 512$ 个值，使用一个有 $512 \times 10 + 10 = 5{,}130$ 个权重的线性层，每个通道在每个格子上都有单独的权重。左上格子里一个像“3”的特征，与右下格子里的同一个特征，经由不同的权重到达输出。网络必须从恰好在某个位置有 3 的那些样本中，分别学会 3 在每个位置上是什么样子：1,347 张训练图像分到 16 个格子上，每个格子约 84 张，每类每格约 8 张。

第一种头部内置了任务本身具有的对称性；第二种必须从数据中学会它，而且学得并不完美。按实验 2 的配置重新运行，展平网络把训练集完全拟合（训练精度 1.00），在测试集上却损失约十个点；池化网络少了 4,800 个参数，对训练集拟合得没那么紧（约 0.98），泛化却更好。大部分收益仍来自卷积本身：同一画布上的 MLP 只达到约 0.44，因为它根本没有共享的检测器。所以卷积贡献了较大的部分（0.44 到 0.89），池化头部贡献了其余部分（0.89 到 0.93）。

**什么时候展平更好**。当标签取决于*位置*时，因为这时与位置相关的权重正是所需要的，而池化会把答案丢掉。例如：判断缺陷位于零件的左半边还是右半边；在扫描表单的固定位置读取一个字段；在固定相机拍摄的图像中，检查某个元件是否位于装配图所规定的位置。需要输出位置的网络，例如[第 12 节](#s12)的分割网络，出于同样的原因保留空间特征图。一种折中的做法是照常池化，但在输入上附加坐标通道，使网络在需要时能够利用位置。
:::

::: exercise id=e5 level=2 kind=derivation minutes=10
**深度可分离层的代价**。在相同的输出尺寸下，推导深度可分离 $k \times k$ 卷积（先逐通道，再逐点）与有 $C_{\text{in}}$ 个输入通道、$C_{\text{out}}$ 个输出通道的标准 $k \times k$ 卷积的乘加次数之比。

(a) 对 $28 \times 28$ 特征图上从 96 到 192 通道的 $5 \times 5$ 卷积求出该比值，并给出两种版本的参数量（含偏置）、MAC 和 FLOPs。

(b) 当 $C_{\text{out}}$ 增大时，$k = 3$ 和 $k = 5$ 的比值分别趋于什么？

(c) 在可分离版本中，逐通道部分占开销的多大份额？用 $5 \times 5$ 逐通道卷积核比用 $3 \times 3$ 的要多花多少？这对可分离设计中的卷积核大小有什么启示？
:::

::: solution
**比值**。按每个输出位置计数；位置数 $H_{\text{out}} W_{\text{out}}$ 在两者中相同，可以约去。

- 标准：$C_{\text{out}}$ 个输出中的每一个都是 $k^2 C_{\text{in}}$ 个乘积之和，所以是 $k^2 C_{\text{in}} C_{\text{out}}$ 次 MAC。
- 逐通道：$C_{\text{in}}$ 个通道各由自己的 $k \times k$ 卷积核滤波，所以是 $k^2 C_{\text{in}}$ 次 MAC，输出仍有 $C_{\text{in}}$ 个通道。
- 逐点：一个从 $C_{\text{in}}$ 到 $C_{\text{out}}$ 的 $1 \times 1$ 卷积，所以是 $C_{\text{in}} C_{\text{out}}$ 次 MAC。

$$
\frac{k^2 C_{\text{in}} + C_{\text{in}} C_{\text{out}}}{k^2 C_{\text{in}} C_{\text{out}}}
= \frac{1}{C_{\text{out}}} + \frac{1}{k^2} .
$$

权重数遵循同样的比值，因为每个权重在每个位置使用一次。

**(a) 数值**。标准：$25 \cdot 96 \cdot 192 = 460{,}800$ 个权重加 192 个偏置，共 460,992 个参数；在 $28 \cdot 28 = 784$ 个位置上，是 $460{,}800 \cdot 784 = 361.3$ M 次 MAC，即 722.5 MFLOPs（FLOPs 是 MAC 的两倍，不计偏置加法）。可分离：逐通道 $25 \cdot 96 = 2{,}400$ 个权重，逐点 $96 \cdot 192 = 18{,}432$ 个；合计 20,832 个权重，加上 96 个和 192 个偏置，共 21,120 个参数；$20{,}832 \cdot 784 = 16.3$ M 次 MAC，即 32.7 MFLOPs。比值为 $1/192 + 1/25 = 0.0452$：可分离层所需的 MAC 少 $22.1$ 倍。参数量的差距略小，为 $460{,}992 / 21{,}120 = 21.8$ 倍，因为偏置并没有按同样的比例缩小。

**(b) 极限**。当 $C_{\text{out}} \to \infty$ 时，第一项消失，比值趋于 $1/k^2$：$3 \times 3$ 节省 9 倍，$5 \times 5$ 节省 25 倍。实际的节省总比极限略小：$C_{\text{out}} = 192$ 时，$3 \times 3$ 为 $1/(1/192 + 1/9) = 8.6$ 倍，$5 \times 5$ 为上面的 22.1 倍。

**(c) 开销在哪里**。逐通道部分占 20,832 个权重中的 2,400 个，即开销的 $11.5\%$，其余是逐点层。用 $3 \times 3$ 逐通道卷积核时，该块有 $864 + 18{,}432 = 19{,}296$ 个权重，所以 $5 \times 5$ 版本的开销是它的 $20{,}832 / 19{,}296 = 1.080$ 倍：多花 8%，换来从 3 增长到 5 的感受野。在可分离块中，空间滤波器是便宜的部分，所以把它放大在 FLOPs 上花费很少。这就是可分离设计可以放手使用 $5 \times 5$ 逐通道卷积核（EfficientNet）乃至 $7 \times 7$ 逐通道卷积核（ConvNeXt，[第 9 节](#s9)）的原因。

需要提醒的是，FLOPs 不等于运行时间（[第 6 节](#s6)）。逐通道层每读写一个字节只执行很少的运算，所以在 GPU 上它受限于访存流量而不是算术，在 FLOPs 上几乎免费的卷积核，在毫秒上不一定免费。下面的检查代码用 PyTorch 自己的层重现了这些计数。

```python
import torch.nn as nn

c_in, c_out, k, h, w = 96, 192, 5, 28, 28

def params(*layers):
    return sum(p.numel() for layer in layers for p in layer.parameters())

def macs(layer):
    """Multiply-accumulates at h x w output positions (weights only, no biases)."""
    return layer.weight.numel() * h * w         # each weight is used once per position

standard = nn.Conv2d(c_in, c_out, k, padding=k // 2)
depthwise = nn.Conv2d(c_in, c_in, k, padding=k // 2, groups=c_in)
pointwise = nn.Conv2d(c_in, c_out, 1)
separable_macs = macs(depthwise) + macs(pointwise)

print(f"standard : {params(standard):,} parameters, {macs(standard) / 1e6:.1f} M MACs, "
      f"{2 * macs(standard) / 1e6:.1f} MFLOPs")
print(f"separable: {params(depthwise, pointwise):,} parameters, "
      f"{separable_macs / 1e6:.1f} M MACs, {2 * separable_macs / 1e6:.1f} MFLOPs")
print(f"ratio {separable_macs / macs(standard):.4f} = 1/{c_out} + 1/{k * k} "
      f"= {1 / c_out + 1 / k**2:.4f}")
print(f"depthwise share of the separable block: {macs(depthwise) / separable_macs:.3f}")
depthwise3 = nn.Conv2d(c_in, c_in, 3, padding=1, groups=c_in)
separable3_macs = macs(depthwise3) + macs(pointwise)
print(f"5x5 depthwise costs {100 * (separable_macs / separable3_macs - 1):.1f}% "
      f"more than 3x3 depthwise")
```

```output
standard : 460,992 parameters, 361.3 M MACs, 722.5 MFLOPs
separable: 21,120 parameters, 16.3 M MACs, 32.7 MFLOPs
ratio 0.0452 = 1/192 + 1/25 = 0.0452
depthwise share of the separable block: 0.115
5x5 depthwise costs 8.0% more than 3x3 depthwise
```
:::

::: exercise id=e6 level=2 kind=derivation minutes=10
**原始残差块中的梯度**。(a) 原始残差块在加法之后应用 ReLU：$\mathbf{h}_{l+1} = \mathrm{ReLU}(\mathbf{h}_l + F_l(\mathbf{h}_l))$。写出雅可比矩阵 $\partial \mathbf{h}_{l+1}/\partial \mathbf{h}_l$，以及从 $l$ 到 $L$ 的一叠这种块的雅可比矩阵，并说明[第 8 节](#s8)预激活推导中的恒等项被什么取代了。

(b) 100 层上的标量梯度因子：每层增益都为 0.95 或都为 1.05 的朴素网络；分支导数全为 $+0.02$、全为 $-0.02$，或 $+0.02$ 与 $-0.02$ 交替的残差网络。

(c) 怎样才会使残差网络的梯度消失？
:::

::: solution
**(a) 雅可比矩阵**。记 $\mathbf{z}_l = \mathbf{h}_l + F_l(\mathbf{h}_l)$ 为 ReLU 之前的值，$\mathbf{J}_l = \partial F_l / \partial \mathbf{h}_l$ 为分支的雅可比矩阵。由链式法则得

$$
\frac{\partial \mathbf{h}_{l+1}}{\partial \mathbf{h}_l}
= \mathbf{D}_l\,(\mathbf{I} + \mathbf{J}_l),
\qquad
\mathbf{D}_l = \operatorname{diag}\big(\mathbb{1}[\mathbf{z}_l > 0]\big),
$$

其中 $\mathbf{D}_l$ 存放 ReLU 的导数：值为正的单元取 1，否则取 0（PyTorch 把恰好在 0 处的导数取为 0）。对一叠块，较后的因子放在左边：

$$
\frac{\partial \mathbf{h}_L}{\partial \mathbf{h}_l}
= \mathbf{D}_{L-1}(\mathbf{I} + \mathbf{J}_{L-1}) \cdots \mathbf{D}_{l}(\mathbf{I} + \mathbf{J}_{l}) .
$$

把它展开。每个因子 $(\mathbf{I} + \mathbf{J}_i)$ 贡献 $\mathbf{I}$ 或 $\mathbf{J}_i$ 之一，所以乘积是 $2^{L-l}$ 项之和，每一项对应路径所经过的分支的一个子集。不经过任何分支的那一项只是各个 $\mathbf{D}_i$ 之积：

$$
\mathbf{D}_{L-1} \cdots \mathbf{D}_{l} ,
$$

这是一个对角矩阵：若单元 $m$ 在从块 $l$ 到块 $L - 1$ 的*每一次*加法之后都为正，它的第 $m$ 个对角元为 1，否则为 0。它取代了[第 8 节](#s8)方程中的单位矩阵。梯度仍有一条高速通道，但这条通道在每个块的每个单元上都设了一道门，一个单元只要在途中任何一处被关掉，就失去了它的通道。对始终保持打开的单元，这条通道与恒等映射一样好。预激活形式在加法之后不放任何操作，恢复了纯粹的 $\mathbf{I}$（He 等人 2016b）。原始设计在 ResNet-50 到 152 的深度上训练得很好；门控在非常深时影响最大，He 等人也正是在那种深度上报告预激活形式有所帮助。

下面的代码在一个由四个宽为 6 的块构成的玩具堆叠上核对这段代数（使用双精度，使比较足够精确）：它比较 autograd 算出的雅可比矩阵与 $\mathbf{D}_i(\mathbf{I} + \mathbf{J}_i)$ 之积，打印高速通道项，然后在第三个块中关掉一个单元，表明它在 $\partial \mathbf{h}_L / \partial \mathbf{h}_0$ 中的对角元从约 1 塌缩为 0。

```python
import torch

torch.manual_seed(0)
width, depth = 6, 4
eye = torch.eye(width, dtype=torch.double)
branches = [torch.nn.Sequential(torch.nn.Linear(width, width), torch.nn.Tanh(),
                                torch.nn.Linear(width, width)).double()
            for _ in range(depth)]
for branch in branches:                  # small branches, as with gamma = 0
    for p in branch.parameters():
        p.data *= 0.3

def stack(h):
    for branch in branches:
        h = torch.relu(h + branch(h))    # the original block: ReLU after the addition
    return h

h0 = torch.rand(width, dtype=torch.double) + 0.2     # non-negative, as after a ReLU
jacobian = torch.autograd.functional.jacobian(stack, h0)

def highway_and_product():
    """The product of D_i (I + J_i), and the product of the D_i alone."""
    h, product, highway = h0, eye, eye
    for branch in branches:
        pre = h + branch(h)
        d = torch.diag((pre > 0).double())           # the ReLU's 0/1 derivatives
        j = torch.autograd.functional.jacobian(branch, h)
        product, highway = d @ (eye + j) @ product, d @ highway
        h = torch.relu(pre)
    return product, highway

product, highway = highway_and_product()
print(f"max |autograd - product of D(I+J)| = {(jacobian - product).abs().max():.1e}")
print("highway diagonal:", highway.diag().tolist())
print("diagonal of dh_L/dh_0:", [f"{v:.3f}" for v in jacobian.diag().tolist()])

# Push unit 2 below zero in the third block: its highway closes from there on.
branches[2][2].bias.data[2] = -5.0
jacobian = torch.autograd.functional.jacobian(stack, h0)
_, highway = highway_and_product()
print("highway diagonal, unit 2 off in block 3:", highway.diag().tolist())
print("diagonal of dh_L/dh_0:", [f"{v:.3f}" for v in jacobian.diag().tolist()])
```

```output
max |autograd - product of D(I+J)| = 4.4e-16
highway diagonal: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
diagonal of dh_L/dh_0: ['1.035', '0.977', '0.957', '1.000', '0.992', '1.042']
highway diagonal, unit 2 off in block 3: [1.0, 1.0, 0.0, 1.0, 1.0, 1.0]
diagonal of dh_L/dh_0: ['1.035', '0.977', '-0.000', '1.000', '0.992', '1.042']
```

两个雅可比矩阵在舍入误差范围内一致。关掉单元之前，$\partial \mathbf{h}_L / \partial \mathbf{h}_0$ 的对角元与 1 相差不过百分之几，即恒等项加上较小的分支贡献。第三个块的分支把单元 2 推到零以下之后，它的对角元变为 0，而其余对角元不受影响：只有这个单元的高速通道关闭了。

**(b) 标量因子**。把每个雅可比矩阵看作标量。数值如下：

| 网络 | 每层因子 | 100 层之后 |
|---|---|---|
| 朴素 | $0.95$ | $0.95^{100} = 0.0059$ |
| 朴素 | $1.05$ | $1.05^{100} = 131.5$ |
| 残差，全部 $\epsilon = +0.02$ | $1.02$ | $1.02^{100} = 7.24$ |
| 残差，全部 $\epsilon = -0.02$ | $0.98$ | $0.98^{100} = 0.133$ |
| 残差，交替 | $1.02, 0.98$ | $(1.02 \cdot 0.98)^{50} = 0.9996^{50} = 0.980$ |

朴素网络与残差网络各行的算术是一样的：每层增益为 $0.98$ 的朴素网络，经过 100 层同样只让 0.133 通过。区别在于这个数从何而来，以及它有多大可能接近 1。朴素层的增益由它的权重决定，没有任何东西让它保持在 1 附近：在不加归一化、采用 PyTorch 默认初始化的朴素网络中，它约为每层 0.4（[第 8 节](#s8)），而 $0.05$ 的偏差只是寻常的失准。残差块的增益是 $1 + \epsilon$，其中 $\epsilon$ 是分支的导数；分支一开始就很小，若它最后一个批归一化的缩放因子初始化为 0，则 $\epsilon$ 恰好为 0。这个 1 是内置的。符号混杂时，偏差大多相互抵消：对随机的符号，$\ln \prod (1 + \epsilon_i)$ 是 100 个约为 $\pm 0.02$ 的项之和，标准差为 $0.02\sqrt{100} = 0.2$，所以向任一方向偏离一个标准差，对应的因子在 $e^{-0.2} = 0.82$ 到 $e^{0.2} = 1.22$ 之间。

**(c) 怎样才会消失**。因子 $(1 + \epsilon_i)$ 之积必须趋于 0，所以必须有某个因子接近 0：在某个块上，分支的导数接近 $-1$，从而抵消恒等项，而且对每个样本都如此。对矩阵而言，条件是 $\mathbf{I} + \mathbf{J}_i$ 接近奇异，即 $\mathbf{J}_i$ 在梯度传来的方向上有一个接近 $-1$ 的特征值。这不是一般的情形，也不是训练开始时的情形，因为分支一开始很小。残差网络并非不会漂移：如果各个 $\epsilon_i$ 符号相同，乘积仍会按几何级数偏离 1（(b) 中的 7.24 和 0.133），只是比朴素堆叠慢得多。[第 8 节](#s8)中带批归一化的 55 层网络展示了这种对比：朴素网络的 stem 梯度约为 190，有捷径时为 0.8。
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
**保持标签不变的数据增强**。对下面每个数据集，以下哪些数据增强能保持标签不变：水平翻转、垂直翻转、90 度旋转、$\pm 10^\circ$ 以内的旋转、亮度与对比度抖动、mixup？(a) 手写数字。(b) 按作物分类的农田航拍图像。(c) 标注是否患有肺炎的胸部 X 光片。(d) 分割为细胞核与细胞质的细胞显微图像。
:::

::: solution
判断的标准是：熟悉该领域的人是否仍会给变换后的图像同样的标签，以及变换后的图像是否像部署后的系统会遇到的东西。

| 数据增强 | (a) 数字 | (b) 作物 | (c) 胸部 X 光片 | (d) 细胞掩码 |
|---|---|---|---|---|
| 水平翻转 | 否 | 是 | 存疑 | 是 |
| 垂直翻转 | 否 | 是 | 否 | 是 |
| 90° 旋转 | 否 | 是 | 否 | 是 |
| $\pm 10^\circ$ 以内的旋转 | 是 | 是 | 是 | 是 |
| 亮度与对比度 | 是 | 轻度可以 | 是 | 是，仅作用于图像 |
| mixup | 不保持标签 | 不保持标签 | 不保持标签 | 不使用 |

**(a) 数字**。小幅旋转和光度抖动是书写者或扫描仪会产生的变换。翻转会把 2、3、5 或 7 变成不是数字的镜像，垂直翻转或 180° 旋转会把 6 变成 9，从而改变标签。90° 旋转产生的图像没有哪个书写者写得出来。Mixup 把两张图像及其标签混合成一个软标签，这使它成为一种正则化手段，而不是保持标签的变换。

**(b) 农田航拍**。相机竖直向下拍摄，田块没有固定的朝向，所以翻转和 90° 旋转都没有问题，小幅旋转也可以（空出的角用反射填充，或者裁掉）。适度的亮度和对比度变化没有问题；强烈的色调偏移则不行，因为颜色在很大程度上就是区分作物的依据。

**(c) 胸部 X 光片**。小幅旋转和曝光变化模拟的是患者的姿势和机器的设置，是安全的。垂直翻转或 90° 旋转得到的是没人会拍的图像。水平翻转存疑：它把心脏放到右边，把标记字母变成反写，这在实践中从不出现（罕见的病症除外），而对任何取决于左右侧的标签，它都会改变标签。肺炎标签也许经得起这种翻转，但翻转后的图像是你自己引入的分布偏移，所以只有在未翻转数据上的验证显示出提升时才使用它。

**(d) 细胞分割**。标签就是掩码，所以每种几何变换都可以用，前提是它同时作用于图像和掩码，并对掩码使用最近邻插值，以免凭空产生类别值；翻转和 90° 旋转对显微图像来说很自然。光度抖动只作用于图像。掩码的 mixup 没有公认的含义，因此不使用。
:::

::: exercise id=e8 level=1 kind=conceptual minutes=5
**哪些层能迁移**。在[实验 4](#lab4) 中，一个在数字 0 到 4 上预训练的网络，只保留第一块时与从头训练一样好，保留两块时更差，作为冻结的特征提取器时则很差。然而，ImageNet 骨干网络即使对显微图像，也常常是一个不错的冻结特征提取器。解释这一差别，并给出从头训练能与预训练骨干网络持平的两种情形。
:::

::: solution
**各层的通用程度不同**。早期层学到的是任何图像都需要的通用检测器（边缘、笔画、色斑、简单纹理），它们能够迁移。后期层则变得专属于源任务的类别（Yosinski 等人 2014）。实验 4 的源任务只有 5 个类别和 675 张图像，所以它的最后一块编码的是“一个 0、1、2、3 或 4”，几乎别无其他：复制并冻结后，它提供给目标任务分类器的是针对错误数字调好的特征；而第一块的笔画检测器足够通用，不会造成损害（同时又便宜到在 25 张图像上就能学会，所以也带不来收益）。任务如此狭窄的源，只能提供它的早期层。

ImageNet 是另一个极端：1,000 个类别的 128 万张训练图像，其中许多是纹理、部件和材质。为了区分一千个类别，后期层必须编码一套丰富的形状与纹理词汇，其中相当一部分对看上去与照片毫无相似之处的图像也有用。这种广度正是整个骨干网络常常能够迁移的原因，也是迁移到显微图像并无保证的原因：这是在赌这套词汇覆盖了目标任务，需要在验证集上检验。

**从头训练何时能与预训练持平**。

1. *目标数据集大，训练时间长*。He、Girshick 和 Dollár（2019）在 COCO 上从随机初始化训练检测器，只要迭代次数足够、归一化方式合适（组归一化或同步批归一化），就能与 ImageNet 预训练的检测器持平。预训练主要是加快了收敛，只有在目标数据较少时才有明显帮助。
2. *目标领域与源相距甚远，且数据充足*。Raghu 等人（2019）在大型医学影像数据集上发现，与从头训练相比，ImageNet 预训练在最终精度上几乎没有提升，而且从头训练的较小模型可以与标准的大型预训练模型持平；不过预训练往往仍收敛得更快。

在数据稀缺且宽泛的源覆盖了目标任务时，或者在负担不起训练时间时，从头训练会输。实验 4 展示了这笔交易的另一面：源任务狭窄时，在 25 张图像上从头训练与任何迁移方案一样好。
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
**为什么要用焦点损失**。一个单阶段检测器每张图像要给约 20,000 个锚框打分，其中也许只有 10 个与目标重叠。(a) 为什么对所有锚框求和的普通交叉熵训练不好它？(b) 焦点损失把每个锚框的交叉熵乘以 $(1 - p_t)^\gamma$，其中 $p_t$ 是模型给该锚框真实类别的概率。不做计算，说明这对模型已经自信而正确地分类的锚框、以及对严重分错的锚框分别有什么作用，以及 $\gamma = 0$ 时退回到什么。(c) 为什么单独用一个权重 $\alpha_t$ 对类别重新加权解决不了问题？(d) 为什么两阶段检测器受这个问题的影响较小？
:::

::: solution
**(a) 总和被容易的大多数主导**。模型已经判对的每个背景锚框，贡献的损失和梯度都很小。但它们约有 20,000 个，加起来压倒了少数几个正样本。取训练早期 19,990 个 $p_t = 0.98$ 的背景锚框和 10 个 $p_t = 0.2$ 的正样本。交叉熵是 $-\ln p_t$，所以背景锚框之和为 $19{,}990 \cdot 0.0202 = 404$，正样本之和为 $10 \cdot 1.609 = 16.1$：背景占损失的 96%。于是总和的梯度主要在推动模型对它已经判对的背景更加确定，来自目标的信号只占其中一小部分。

**(b) 这个因子的作用**。对自信且正确的锚框，$p_t$ 接近 1，所以 $(1 - p_t)^\gamma$ 接近 0，它的损失几乎被消除。对严重分错的锚框，$p_t$ 很小，因子接近 1，它的损失得以保留。训练集中在难样本上。取 $\gamma = 2$：$p_t = 0.98$ 时因子为 $0.0004$；0.5 时为 0.25；0.2 时为 0.64；0.05 时为 0.90。上面的两组现在给出背景 $0.16$、正样本 $10.3$：背景所占份额从 96% 降到 1.5%。$\gamma = 0$ 时因子处处为 1，焦点损失又变回（按类别加权的）交叉熵。

**(c) 为什么类别权重不够**。权重 $\alpha_t$ 把一个类别的每个锚框按同样的量缩放。它可以平衡总和：给背景加权 $10/19{,}990 = 0.0005$，这一组的总和就降到约 0.2。但它无法区分容易的负样本与困难的负样本。一个自信的误报（背景锚框上 $p_t = 0.2$）与其余样本一起被缩放到 $0.0008$，于是模型不再被教导去消除自己的错误，而这些错误恰恰是信息量最大的负样本。焦点因子取决于锚框自身的 $p_t$，所以它保留困难的负样本（因子 0.64），消除容易的负样本（因子 0.0004）。在 $\gamma = 2$ 做到这一点之后，RetinaNet 反而给正样本*较小*的权重，$\alpha = 0.25$，负样本为 $0.75$（Lin 等人 2017）。

**(d) 两阶段检测器**。区域提议阶段在第二阶段之前就丢弃了大部分背景，第二阶段随后在采样得到的 mini-batch 上训练，正负样本比例固定，常见设置中采样区域至多四分之一为正样本。不平衡由采样而不是由损失来处理。上面的数字在这里重现。

```python
import numpy as np

n_negative, n_positive = 19_990, 10
p_negative = 0.98       # p_t of a typical easy background anchor
p_positive = 0.20       # p_t of a positive early in training

def loss(p_t, gamma):
    """Focal loss for one anchor; gamma = 0 is plain cross-entropy."""
    return -((1 - p_t) ** gamma) * np.log(p_t)

for gamma in (0, 2):
    neg = n_negative * loss(p_negative, gamma)
    pos = n_positive * loss(p_positive, gamma)
    print(f"gamma={gamma}: negatives {neg:8.3f}, positives {pos:6.3f}, "
          f"negatives' share {neg / (neg + pos):.1%}")

for p_t in (0.98, 0.90, 0.50, 0.20, 0.05):
    print(f"p_t={p_t:.2f}: CE {loss(p_t, 0):.4f}, focal {loss(p_t, 2):.6f}, "
          f"factor {(1 - p_t) ** 2:.4f}")

# A class weight alone, chosen to balance the totals: alpha_negative = 10 / 19,990.
alpha = n_positive / n_negative
print(f"alpha only: a confident false positive (p_t = 0.2) now costs "
      f"{alpha * loss(0.2, 0):.5f} instead of {loss(0.2, 0):.4f}")
```

```output
gamma=0: negatives  403.852, positives 16.094, negatives' share 96.2%
gamma=2: negatives    0.162, positives 10.300, negatives' share 1.5%
p_t=0.98: CE 0.0202, focal 0.000008, factor 0.0004
p_t=0.90: CE 0.1054, focal 0.001054, factor 0.0100
p_t=0.50: CE 0.6931, focal 0.173287, factor 0.2500
p_t=0.20: CE 1.6094, focal 1.030040, factor 0.6400
p_t=0.05: CE 2.9957, focal 2.703648, factor 0.9025
alpha only: a confident false positive (p_t = 0.2) now costs 0.00081 instead of 1.6094
```
:::

::: exercise id=e10 level=2 kind=calculation minutes=10
**手算 IoU、NMS 和平均精度**。边界框记为 $(x_1, y_1, x_2, y_2)$，全部属于同一类别：A $= (0,0,8,8)$，得分 0.90；B $= (2,0,10,8)$，得分 0.85；C $= (20,20,28,28)$，得分 0.70；D $= (3,3,11,11)$，得分 0.60。

(a) 计算 IoU(A, B)、IoU(A, D) 和 IoU(B, D)。

(b) 先以阈值 0.5、再以阈值 0.3 运行非极大值抑制。D 与 B 的 IoU 超过了 0.3，D 在 0.3 下还能保留下来吗？

(c) 真实标注是两个目标，恰好位于 A 和 C。按得分对检测结果排序，以 IoU $\ge 0.5$ 为准，把每个检测结果标为真正例或假正例（每个目标只能被匹配一次）。分别对阈值 0.5 的 NMS 之后保留下来的框，以及不做 NMS 的全部四个框，计算全点插值平均精度。这两个结果对 NMS 说明了什么？对 AP 作为汇总指标又说明了什么？
:::

::: solution
**(a) 重叠**。交集的角点坐标取两个最小坐标中的较大者和两个最大坐标中的较小者（[第 11 节](#s11)）；它的宽和高是坐标差的 $\max(0, \cdot)$。

- A 与 B：交集的 $x$ 从 2 到 8，$y$ 从 0 到 8，面积为 $6 \times 8 = 48$。每个框的面积都是 $8 \times 8 = 64$，所以并集为 $64 + 64 - 48 = 80$，IoU $= 48/80 = 0.600$。
- A 与 D：$x$ 从 3 到 8，$y$ 从 3 到 8，面积为 $5 \times 5 = 25$；并集为 $128 - 25 = 103$；IoU $= 25/103 = 0.243$。
- B 与 D：$x$ 从 3 到 10（宽 7），$y$ 从 3 到 8（高 5），面积为 $35$；并集为 $128 - 35 = 93$；IoU $= 35/93 = 0.376$。

（并集要减去一次交集，因为两个面积相加时把交集算了两次。）

**(b) 抑制**。NMS 按得分排序，保留最好的框，删除剩余框中与它的 IoU 超过阈值的每一个，再对剩下的框重复这一过程。

- *阈值 0.5*。保留 A。IoU(A, B) $= 0.600 > 0.5$：删除 B。保留 C，它与 A 的 IoU 为 0。D：IoU(A, D) $= 0.243 \le 0.5$，所以 D 保留。结果是 A、C、D。
- *阈值 0.3*。结果相同：B 被删除（0.600 $> 0.3$），D 被保留（0.243 $\le 0.3$）。

尽管 IoU(B, D) $= 0.376$ 高于 0.3，D 在 0.3 下仍然保留了下来，因为在考虑 D 之前 B 已经被删除，而被删除的框不会抑制任何框。NMS 只把每个框与已经保留的框比较。只有阈值低于 0.243 时 D 才会被删除，那时是 A 本身把它去掉；下面的代码显示它在 0.2 时被删除。

**(c) 平均精度**。*做 NMS 时*，按得分排列的检测结果是 A、C、D。A 与位于 A 的目标匹配（IoU 为 1）：真正例。C 与位于 C 的目标匹配：真正例。D 与位于 A 的目标的 IoU 为 0.243，与位于 C 的目标的 IoU 为 0：假正例。各名次之后的精确率依次为 $1/1, 2/2, 2/3$，召回率为 $0.5, 1, 1$。召回率 $r$ 处的插值精确率，是召回率 $\ge r$ 的所有位置上精确率的最大值，在这里处处为 1，因为第二个检测结果已经以精确率 1 达到召回率 1。全点 AP 是这条曲线下的面积：

$$
\text{AP} = 0.5 \cdot 1 + 0.5 \cdot 1 = 1.0 .
$$

*不做 NMS 时*，顺序是 A、B、C、D。A 是真正例。B 与位于 A 的目标的 IoU 为 0.600，足以匹配，但该目标已经被匹配过，所以 B 是假正例：一个重复检测。C 是真正例，D 是假正例。各名次之后的精确率依次为 $1/1, 1/2, 2/3, 2/4$，召回率为 $0.5, 0.5, 1, 1$。召回率不超过 0.5 时插值精确率为 1（来自第一个检测结果），召回率高于 0.5 时为 $2/3$（召回率 1 处的最佳精确率来自第三个检测结果）。所以

$$
\text{AP} = 0.5 \cdot 1 + 0.5 \cdot \tfrac{2}{3} = 0.833 .
$$

在这里，NMS 值 $0.167$ 的 AP，因为它去掉了一个排在真正例之前的重复检测。假正例 D 排在所有真正例之后，无论做不做 NMS，都不会使 AP 受损。这正是 AP 作为汇总指标的局限：AP 为完美的 1.0，而检测器的结果列表里三个框中就有一个是错的。AP 奖励的是列表的排序，而不是你据以采取行动的那份列表，所以它要与工作阈值下的精确率和召回率（这里是 $2/3$ 和 1）一起报告。

```python
import numpy as np

def iou(a, b):
    """IoU of two boxes (x1, y1, x2, y2)."""
    iw = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    ih = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = iw * ih
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union

boxes = {"A": (0, 0, 8, 8), "B": (2, 0, 10, 8),
         "C": (20, 20, 28, 28), "D": (3, 3, 11, 11)}
scores = {"A": 0.90, "B": 0.85, "C": 0.70, "D": 0.60}
for p, q in [("A", "B"), ("A", "D"), ("B", "D")]:
    print(f"IoU({p},{q}) = {iou(boxes[p], boxes[q]):.3f}")

def nms(names, threshold):
    order = sorted(names, key=lambda n: -scores[n])
    keep = []
    for n in order:
        if all(iou(boxes[n], boxes[k]) <= threshold for k in keep):
            keep.append(n)
    return keep

for t in (0.5, 0.3, 0.2):
    print(f"NMS at {t}: {nms(boxes, t)}")

truth = [(0, 0, 8, 8), (20, 20, 28, 28)]

def average_precision(names):
    """All-point interpolated AP; each ground-truth box may be matched once."""
    order = sorted(names, key=lambda n: -scores[n])
    matched, flags = set(), []
    for n in order:
        best, best_iou = None, 0.5          # need IoU >= 0.5
        for g, box in enumerate(truth):
            if g not in matched and iou(boxes[n], box) >= best_iou:
                best, best_iou = g, iou(boxes[n], box)
        if best is None:
            flags.append(0)
        else:
            matched.add(best); flags.append(1)
    tp = np.cumsum(flags); fp = np.cumsum(1 - np.array(flags))
    precision = tp / (tp + fp); recall = tp / len(truth)
    # envelope: precision at recall r is the best precision at any recall >= r
    envelope = np.maximum.accumulate(precision[::-1])[::-1]
    recall_prev = np.concatenate([[0.0], recall[:-1]])
    ap = float(np.sum((recall - recall_prev) * envelope))
    return order, flags, precision.round(3), recall.round(3), ap

for label, names in [("with NMS 0.5", nms(boxes, 0.5)), ("without NMS", list(boxes))]:
    order, flags, prec, rec, ap = average_precision(names)
    print(f"{label}: order {order} TP flags {flags}")
    print(f"  precision {prec.tolist()} recall {rec.tolist()} AP = {ap:.3f}")
```

```output
IoU(A,B) = 0.600
IoU(A,D) = 0.243
IoU(B,D) = 0.376
NMS at 0.5: ['A', 'C', 'D']
NMS at 0.3: ['A', 'C', 'D']
NMS at 0.2: ['A', 'C']
with NMS 0.5: order ['A', 'C', 'D'] TP flags [1, 1, 0]
  precision [1.0, 1.0, 0.667] recall [0.5, 1.0, 1.0] AP = 1.000
without NMS: order ['A', 'B', 'C', 'D'] TP flags [1, 0, 1, 0]
  precision [1.0, 0.5, 0.667, 0.5] recall [0.5, 0.5, 1.0, 1.0] AP = 0.833
```
:::

::: exercise id=e11 level=1 kind=conceptual minutes=5
**切片并不独立**。一个团队在 CT 上分割肝脏肿瘤：40 名患者，每人 100 张带标注的切片，使用二维 U-Net。他们把全部 4,000 张切片打乱，按 80/20 划分，报告的 Dice 为 0.91；在 10 名新患者上，Dice 为 0.74。（这些数字是设想的情景，不是实际结果。）解释这一差距，并说明评估本应如何设置。
:::

::: solution
**差距从何而来**。同一患者的相邻切片几乎是同一幅图：它们有相同的解剖结构、相同的扫描仪、相同的造影期相，往往还有相同的肿瘤，而一个肿瘤会出现在一串连续的切片中。按切片随机划分，几乎会为每一张测试切片在训练集中放入它的近似副本。于是 0.91 衡量的是网络把这 40 名患者记得有多牢，而不是它分割一名新患者的能力。这就是数据泄漏（[模块 01，第 10 节](module_01_ZH.html#s10)）：泛化的单位是患者，而划分忽略了这一点。这项研究的有效样本量是 40，而不是 4,000。

10 名新患者上的 0.74 是对部署性能更诚实的估计，但有两点需要注意。十名患者是一个小样本，所以这个估计并不确定。而且新患者可能来自另一台扫描仪或另一家医院，所以差距中有一部分可能是站点之间的偏移，而不是泄漏。要区分这两种原因，可以在原来的 40 名患者内部按患者划分重新评估：如果结果约为 0.75，差距来自泄漏；如果结果为 0.9，则是新患者与原来的患者不同。

**应当如何设置**。

- 按患者划分：例如 32 名患者用于训练，8 名用于测试；或者以患者为分组做五折分组交叉验证，使一名患者的全部 100 张切片都落在同一侧，且每名患者都恰好被测试一次。在从训练集中取出的验证患者上调超参数，绝不在测试患者上调。
- 如有可能，把第二个站点或第二台扫描仪的数据完整地留作最终测试。
- 报告在*患者*上的均值和离散程度（每名患者一个 Dice，再取它们的均值，并在患者上计算自助法置信区间），而不是在切片上汇总的 Dice，后者会让大肿瘤占主导。
- 说明没有肿瘤的切片如何计分（[第 12 节](#s12)）：对空掩码给出空预测，Dice 为 $0/0$，而所采用的约定会改变结果。
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
**两个体数据组成的 batch 上的批归一化**。一个三维 U-Net 在 $64^3$ 的图像块上以 batch 大小 2 训练；批归一化使训练充满噪声，验证分数还取决于 batch 的组成。(a) 一个 32 通道层的每个批归一化均值由多少个值算出？为什么它们仍然太少？(b) 在同一层上换用组归一化（8 组），每个均值和方差由哪些值算出？共有多少个？
:::

::: solution
**(a) 值很多，样本很少**。批归一化对每个通道计算一个均值和一个方差，范围是整个 batch 和全部空间位置：每个通道 $2 \cdot 64^3 = 524{,}288$ 个值。这看起来很多，但这些值来自两个体数据，而同一个体数据内的体素高度相关：一个通道在一个体数据上的平均值，取决于该体数据包含什么，例如图像块中有多少是前景。把一个体数据的均值建模为在体数据之间变化、标准差为 $\sigma_b$ 的量。batch 均值是 $B$ 个这样的体数据均值的平均，所以无论每个体数据有多少体素，它的标准差都约为 $\sigma_b/\sqrt{B}$：$B = 2$ 时为 $0.71\,\sigma_b$，而 $B = 16$ 时为 $0.25\,\sigma_b$。起作用的是相互独立的样本数，来自两个样本的五十万个体素并不等于五十万个样本。

结果是：归一化的平移和缩放随 batch 而变，训练信号因此充满噪声；测试时还会出现不匹配，因为那时该层使用在许多 batch 上累积的滑动均值，算出的东西与网络在训练中看到的不同。于是验证分数取决于测试 batch 是否与训练 batch 相似。

**(b) 组归一化只用一个样本**。组归一化把 32 个通道分成 8 组，每组 4 个，对每个样本分别、对每个组，在该组的通道和全部位置上计算一个均值和一个方差：每个统计量由 $4 \cdot 64^3 = 1{,}048{,}576$ 个值算出，全部来自同一个体数据。训练和测试计算的是完全相同的东西，没有任何东西依赖于 batch 大小或 batch 中的其他体数据，而统计量是从一个体数据的 4 个通道估计的，这是一个可以稳定估计的量。这就是[第 13 节](#s13)的三维 U-Net 块使用组归一化的原因。
:::

::: exercise id=e13 level=2 kind=calculation minutes=10
**三维 U-Net 的激活内存**。一个三维 U-Net 的编码器有四个层级，通道数分别为 32、64、128 和 256。第一层级在图像块的全分辨率上工作，之后每深一个层级，每个空间维度都减半。训练时每个层级要为反向传播保留六个张量（两个卷积输出、两个归一化输出、两个激活），均为 float32。

(a) 对由 4 个 $96^3$ 体素的图像块组成的 batch，计算编码器的激活内存。

(b) 解码器的开销与编码器大致相当。如果权重和优化器状态占 0.5 GiB，训练能放进 8 GiB 的 GPU 吗？

(c) 用两种方式把激活内存减半：通过 batch；以及在 batch 为 4 时，改用一个有三次池化的网络能够接受的立方体图像块尺寸。你会选哪一种？为什么？

(d) 比较 $96^3$ 图像块的一张 32 通道特征图与 $1{,}024 \times 1{,}024$ 二维切片的一张 32 通道特征图。
:::

::: solution
**(a) 编码器**。一个 float32 值占 4 字节。层级 0 的一个张量，每个图像块为 $96^3 \cdot 32 \cdot 4\ \text{B} = 113{,}246{,}208\ \text{B} = 108\ \text{MiB}$，共有六个：648 MiB。每深一个层级，体素数变为 $1/8$（每条边减半），通道数加倍，所以内存变为 $1/4$：162、40.5 和 10.1 MiB。编码器每个图像块占 $648 + 162 + 40.5 + 10.1 = 860.6$ MiB，4 个图像块的 batch 占 $4 \cdot 860.6 = 3{,}442.5$ MiB，即 3.36 GiB。仅第一层级就占了四分之三，这就是全分辨率层级占主导、而图像块尺寸是关键杠杆的原因。

**(b) 整个网络**。加上同样大的解码器，激活约为 $2 \cdot 3.36 = 6.72$ GiB，再加上权重和优化器状态的 0.5 GiB，共 7.22 GiB。纸面上它能放进 8 GiB，还余 0.78 GiB。这个余量很薄。估计中没有计入解码器拼接进来的跳跃连接输入和上采样后的特征图（它们是额外的张量，不是上面那些张量）、卷积库所需的工作空间、分配器因碎片化而损失的内存，以及 CUDA 上下文本身，后者通常要占几百 MiB。在相信这个估计之前，先用 `torch.cuda.max_memory_allocated()` 测出真实的峰值，并做好把 batch 降到 3 或 2 的准备。

**(c) 减半的两种方式**。

- *batch*。内存与 batch 成线性关系，所以 batch 为 2 时恰好减半：编码器 1,721 MiB，整个网络连同权重约 3.9 GiB。
- *图像块*。内存与边长成立方关系。在 batch 为 4 时，满足 $s^3 = 96^3/2$ 的边长为 $s = 96 \cdot 0.5^{1/3} = 76.2$。为了做三次池化，边长必须能被 $2^3 = 8$ 整除，所以可选的是 80（保留 58% 的内存）和 72（保留 42%）。

选较小的 batch。使用组归一化时，没有任何东西依赖于 batch 大小（[练习 12](#e12)），所以 batch 为 2 只会多一些梯度噪声，而把梯度在两步上累积就能消除这些噪声，代价是时间而不是内存。较小的图像块则会改变网络看到的东西：每个预测得到的上下文更少，边界体素在输出中所占的比例更大，推理时还需要更多相互重叠的分块（[第 13 节](#s13)）。（在反向传播时重新计算激活，即“激活检查点”，是第三个杠杆，它用大约多三分之一的计算量换回大部分激活内存。）

**(d) 与二维的比较**。一张 $96^3$ 体素、32 通道的特征图占 $96^3 \cdot 32 \cdot 4\ \text{B} = 108$ MiB。一张 $1{,}024 \times 1{,}024$ 切片、32 通道的特征图占 $1{,}024^2 \cdot 32 \cdot 4\ \text{B} = 128$ MiB。一个很小的 $96^3$ 图像块，每张特征图的开销就与一张一百万像素的切片相当，而三维网络在每个层级都保留这样的特征图，且每个层级六个张量，这就是三维训练受内存限制、而二维情形不受限制的原因。

```python
MIB = 2**20
CHANNELS = (32, 64, 128, 256)
TENSORS_PER_LEVEL = 6                      # 2 convolutions, 2 norms, 2 activations

def level_mib(side, level, batch=1):
    """Float32 memory of one level; level l has side / 2^l voxels per edge."""
    voxels = (side // 2**level) ** 3
    return voxels * CHANNELS[level] * 4 * TENSORS_PER_LEVEL * batch / MIB

def encoder_mib(side, batch):
    return sum(level_mib(side, level, batch) for level in range(4))

print("per level, one patch, MiB:", [level_mib(96, l) for l in range(4)])
one, four = encoder_mib(96, 1), encoder_mib(96, 4)
print(f"one patch {one:.1f} MiB; batch of 4 {four:.1f} MiB = {four / 1024:.2f} GiB")
total = 2 * four / 1024 + 0.5
print(f"encoder + decoder + 0.5 GiB = {total:.2f} GiB; {8 - total:.2f} GiB left of 8")
print(f"batch 2: {encoder_mib(96, 2):.1f} MiB ({encoder_mib(96, 2) / four:.0%})")
print(f"side that halves it: 96 * 0.5**(1/3) = {96 * 0.5 ** (1 / 3):.1f}")
for side in (80, 72):
    print(f"side {side}, batch 4: {encoder_mib(side, 4):.1f} MiB "
          f"({encoder_mib(side, 4) / four:.0%})")
print(f"one 32-channel map: 96^3 patch {96**3 * 32 * 4 / MIB:.0f} MiB, "
      f"1024^2 slice {1024**2 * 32 * 4 / MIB:.0f} MiB")
```

```output
per level, one patch, MiB: [648.0, 162.0, 40.5, 10.125]
one patch 860.6 MiB; batch of 4 3442.5 MiB = 3.36 GiB
encoder + decoder + 0.5 GiB = 7.22 GiB; 0.78 GiB left of 8
batch 2: 1721.2 MiB (50%)
side that halves it: 96 * 0.5**(1/3) = 76.2
side 80, batch 4: 1992.2 MiB (58%)
side 72, batch 4: 1452.3 MiB (42%)
one 32-channel map: 96^3 patch 108 MiB, 1024^2 slice 128 MiB
```
:::

::: exercise id=e14 level=3 kind=project minutes=25
**由掩码计算体积，并做误差预算**。掩码好不好，要看从它得到的测量好不好。下面处理第二个物体（[第 13 节](#s13)处理过第一个）。

1. 在体素间距为平面内 0.4 × 0.4 微米、切片之间 1.5 微米的网格上，通过检验每个体素中心，构建一个沿 $x$、$y$、$z$ 的半轴分别为 10、8 和 5 微米的椭球的掩码。把椭球中心放在距某个体素中心 (0.3, 0.6, 0.2) 个体素处（按 $(x, y, z)$ 顺序），并在它周围留出若干体素的边距。
2. 用体素数乘以体素体积计算它的体积，并与 $\tfrac{4}{3}\pi a b c$ 比较。
3. 对 20 个亚体素偏移 `np.random.default_rng(0).random((20, 3))` 重复上述计算，报告均值和标准差（`ddof=1`）。
4. 统计暴露的体素面，每个面按其物理面积加权，以此计算表面积，并与精确面积 730.6 平方微米比较（由椭圆积分公式得到；Knud Thomsen 的近似公式取 $p = 1.6075$ 时给出 731.1）。当体素缩小时，面计数趋于什么？
5. 选做，需要安装 scikit-image，且掩码按 $(z, y, x)$ 索引：对二值掩码（等值 0.5，间距 $(1.5, 0.4, 0.4)$），以及对沿每个轴用 0.5 微米高斯模糊后的掩码（`scipy.ndimage.gaussian_filter`，sigma 换算成体素单位），运行 `measure.marching_cubes`，并把 `measure.mesh_surface_area` 与精确值比较。
6. 一个文件转换器丢掉了切片间距，报告为各向同性的 0.4 微米体素。这时掩码报告的体积是多少？
7. 用[模块 01，第 8 节](module_01_ZH.html#s8)的分解，把每项差异归类为偏差、方差或粗大误差，并说明其中哪些会随体素变细而缩小。
:::

::: solution
**计划**。在数字有意义之前，有三件事必须做对。

- *顺序*。NumPy 体数据按 $(z, y, x)$ 索引，而间距和偏移按 $(x, y, z)$ 给出。代码在 $(z, y, x)$ 上用 `np.meshgrid(..., indexing="ij")` 构建掩码，并用对应轴的间距换算为物理位置；调用移动立方体算法时，传入顺序反过来的间距 $(1.5, 0.4, 0.4)$。
- *边距*。网格在中间体素两侧各延伸每个半轴的 1.2 倍（向上取整为整数个体素），使物体不会碰到边界；被网格截断的掩码会因为与本练习毫无关系的原因损失体积。
- *精确值*。体积是 $\tfrac{4}{3}\pi abc$。面积没有初等公式；对 $a \ge b \ge c$，它是
  $$
  S = 2\pi c^2 + \frac{2\pi a b}{\sin\varphi}\Big(E(\varphi, k)\sin^2\varphi
  + F(\varphi, k)\cos^2\varphi\Big), \quad
  \cos\varphi = \frac{c}{a},\quad k^2 = \frac{a^2(b^2 - c^2)}{b^2(a^2 - c^2)},
  $$
  其中 $E$ 和 $F$ 分别是第二类和第一类不完全椭圆积分。SciPy 中对应的函数是 `ellipeinc` 和 `ellipkinc`，参数取 $k^2$。对曲面做暴力数值积分（未列出）给出同样的 730.6，前五位数字一致，公式的转写就是这样核对的。

面计数的做法如下：给掩码补一层零；沿每个轴，相邻体素之间的每一次变化（`np.diff` 非零）就是一个暴露面，其面积是另外两个间距之积。移动立方体算法的那几行需要 scikit-image（下面的输出由 0.26 版产生）；没有安装时脚本会跳过它们，其余部分只需要 NumPy 和 SciPy。

```python
import numpy as np
from scipy import ndimage, special

SPACING = np.array([0.4, 0.4, 1.5])          # micrometres, in (x, y, z) order
SEMI = np.array([10.0, 8.0, 5.0])            # semi-axes a, b, c along x, y, z

def ellipsoid_mask(offset_xyz, spacing=SPACING):
    """Mask indexed (z, y, x); centre = middle voxel plus an offset in voxels."""
    nx, ny, nz = 2 * np.ceil(1.2 * SEMI / spacing).astype(int) + 1   # room to spare
    centre = np.array([nx // 2, ny // 2, nz // 2]) + np.asarray(offset_xyz)
    z, y, x = np.meshgrid(np.arange(nz), np.arange(ny), np.arange(nx), indexing="ij")
    px = (x - centre[0]) * spacing[0]        # physical position of each voxel centre
    py = (y - centre[1]) * spacing[1]
    pz = (z - centre[2]) * spacing[2]
    return (px / SEMI[0]) ** 2 + (py / SEMI[1]) ** 2 + (pz / SEMI[2]) ** 2 <= 1.0

def exposed_face_area(mask, spacing=SPACING):
    """Sum of the physical areas of the voxel faces between inside and outside."""
    padded = np.pad(mask, 1).astype(np.int8)
    face_area = [spacing[0] * spacing[1],    # axis 0 is z: faces span x and y
                 spacing[0] * spacing[2],    # axis 1 is y: faces span x and z
                 spacing[1] * spacing[2]]    # axis 2 is x: faces span y and z
    return sum(np.count_nonzero(np.diff(padded, axis=axis)) * face_area[axis]
               for axis in range(3))

def ellipsoid_area(a, b, c):
    """Exact surface area from the elliptic integrals, for a >= b >= c."""
    a, b, c = sorted((a, b, c), reverse=True)
    phi = np.arccos(c / a)
    m = a**2 * (b**2 - c**2) / (b**2 * (a**2 - c**2))       # k squared
    e, f = special.ellipeinc(phi, m), special.ellipkinc(phi, m)
    return 2 * np.pi * c**2 + 2 * np.pi * a * b / np.sin(phi) * (
        e * np.sin(phi) ** 2 + f * np.cos(phi) ** 2)

exact_volume = 4 / 3 * np.pi * SEMI.prod()
exact_area = ellipsoid_area(*SEMI)
p = 1.6075
thomsen = 4 * np.pi * (sum((SEMI[i] * SEMI[j]) ** p
                           for i, j in [(0, 1), (0, 2), (1, 2)]) / 3) ** (1 / p)
print(f"exact volume {exact_volume:.1f}, exact area {exact_area:.1f} "
      f"(Thomsen {thomsen:.1f})")

# (1) and (2): one placement of the ellipsoid on the grid
mask = ellipsoid_mask((0.3, 0.6, 0.2))
voxel_volume = SPACING.prod()                # 0.24 cubic micrometres
volume = mask.sum() * voxel_volume
print(f"voxels {mask.sum()}, volume {volume:.1f} ({volume / exact_volume - 1:+.1%})")

# (3): twenty sub-voxel offsets
offsets = np.random.default_rng(0).random((20, 3))
volumes = np.array([ellipsoid_mask(o).sum() * voxel_volume for o in offsets])
mean, sd = volumes.mean(), volumes.std(ddof=1)
print(f"20 offsets: mean {mean:.1f} ({mean / exact_volume - 1:+.2%}), "
      f"sd {sd:.1f} ({sd / exact_volume:.2%})")

# (4): exposed faces against the exact area, and the limit of the face count
faces = exposed_face_area(mask)
a, b, c = SEMI
limit = 2 * np.pi * (a * b + a * c + b * c)
print(f"exposed faces {faces:.1f} ({faces / exact_area - 1:+.1%}); "
      f"limit 2*pi*(ab+ac+bc) = {limit:.1f} ({limit / exact_area - 1:+.1%})")
for scale in (2, 1, 0.5, 0.25):              # coarser and finer grids, same ratios
    spacing = SPACING * scale
    masks = [ellipsoid_mask(o, spacing) for o in offsets]
    vols = np.array([m.sum() * spacing.prod() for m in masks])
    areas = np.array([exposed_face_area(m, spacing) for m in masks])
    print(f"  voxels x{scale:<4}: volume sd {vols.std(ddof=1):5.2f}, "
          f"mean face area {areas.mean():7.1f} ({areas.mean() / exact_area - 1:+.1%})")

# (5): marching cubes, if scikit-image is installed
try:
    from skimage import measure
except ImportError:
    measure = None

def mesh_area(volume_zyx, spacing):
    """Area of the 0.5 isosurface; the volume is indexed (z, y, x)."""
    spacing_zyx = (spacing[2], spacing[1], spacing[0])
    verts, tris, _, _ = measure.marching_cubes(volume_zyx, level=0.5,
                                               spacing=spacing_zyx)
    return measure.mesh_surface_area(verts, tris)

if measure is not None:
    for scale in (2, 1, 0.5, 0.25):
        spacing = SPACING * scale
        binary = ellipsoid_mask((0.3, 0.6, 0.2), spacing).astype(float)
        sigma = tuple(0.5 / s for s in spacing[::-1])        # 0.5 um in voxels
        blurred = ndimage.gaussian_filter(binary, sigma)
        area_binary = mesh_area(binary, spacing)
        area_blurred = mesh_area(blurred, spacing)
        print(f"marching cubes, voxels x{scale:<4}: binary {area_binary:6.1f} "
              f"({area_binary / exact_area - 1:+.1%}), blurred {area_blurred:6.1f} "
              f"({area_blurred / exact_area - 1:+.1%})")
    cube = np.array([0.4, 0.4, 0.4])                         # isotropic voxels
    area_cube = mesh_area(ellipsoid_mask((0.3, 0.6, 0.2), cube).astype(float), cube)
    print(f"marching cubes, isotropic 0.4 um voxels, binary: {area_cube:.1f} "
          f"({area_cube / exact_area - 1:+.1%})")

# (6): the converter that drops the slice spacing and reports 0.4 micrometres everywhere
wrong_volume = mask.sum() * 0.4**3
print(f"isotropic misread: {wrong_volume:.1f} = {wrong_volume / exact_volume:.0%} "
      f"of the true volume")

# (7): a segmentation boundary displaced outward by 0.25 micrometres
grown = 4 / 3 * np.pi * np.prod(SEMI + 0.25)
print(f"boundary +0.25 um: volume {grown:.1f} ({grown / exact_volume - 1:+.1%})")
```

```output
exact volume 1675.5, exact area 730.6 (Thomsen 731.1)
voxels 7005, volume 1681.2 (+0.3%)
20 offsets: mean 1676.9 (+0.08%), sd 11.4 (0.68%)
exposed faces 1077.4 (+47.5%); limit 2*pi*(ab+ac+bc) = 1068.1 (+46.2%)
  voxels x2   : volume sd 35.00, mean face area  1054.0 (+44.3%)
  voxels x1   : volume sd 11.45, mean face area  1064.5 (+45.7%)
  voxels x0.5 : volume sd  2.63, mean face area  1067.4 (+46.1%)
  voxels x0.25: volume sd  0.66, mean face area  1068.0 (+46.2%)
marching cubes, voxels x2   : binary  857.7 (+17.4%), blurred  775.6 (+6.2%)
marching cubes, voxels x1   : binary  887.2 (+21.4%), blurred  755.5 (+3.4%)
marching cubes, voxels x0.5 : binary  883.7 (+21.0%), blurred  727.4 (-0.4%)
marching cubes, voxels x0.25: binary  886.4 (+21.3%), blurred  723.0 (-1.0%)
marching cubes, isotropic 0.4 um voxels, binary: 795.5 (+8.9%)
isotropic misread: 448.3 = 27% of the true volume
boundary +0.25 um: volume 1859.6 (+11.0%)
```

**(2) 一次放置**。7,005 个体素，每个 $0.4 \cdot 0.4 \cdot 1.5 = 0.24$ 立方微米，给出 1,681.2，而精确值为 $\tfrac{4}{3}\pi \cdot 10 \cdot 8 \cdot 5 = 1{,}675.5$：$+0.3\%$。仅凭这一个数无法区分偏差与运气，这正是需要下一步的原因。

**(3) 二十次放置**。均值为 1,676.9（$+0.08\%$），标准差为 11.4（$0.68\%$）。均值接近真值：统计光滑物体内部的体素中心，几乎是无偏的，而上面那一次放置只是一次普通的抽样，距均值 0.4 个标准差。离散程度是方差，来自物体恰好落在网格上的位置。它随体素缩小而缩小，表格显示了缩小的方式：体素尺寸每减半，它约缩小为四分之一（35.0、11.4、2.6、0.66）。原因在于只有跨越边界的体素可能出错；它们的数量随体素尺寸 $h$ 按 $1/h^2$ 增长，每个的误差至多为体积 $h^3$，而独立的误差按平方根累加：$\sqrt{1/h^2} \cdot h^3 = h^2$。

**(4) 暴露面**。面计数给出 1,077 平方微米，比精确面积高 47.5%。任何分辨率都修正不了这一点。每个面都与坐标轴对齐，对凸体而言，朝 $+x$ 和朝 $-x$ 的面合起来覆盖物体在 $yz$ 平面上投影的两倍，即 $2\pi bc$；把三个方向加起来，

$$
S_{\text{faces}} \to 2\pi(ab + ac + bc) = 2\pi \cdot 170 = 1{,}068.1 ,
$$

比 730.6 高 46.2%。细化表格恰好趋于这个值：随着体素缩小，依次为 $+44.3\%$、$+45.7\%$、$+46.1\%$ 和 $+46.2\%$。更细的体素使阶梯更细，却不会使它更平。这是方法本身的**偏差**，体素掩码的面积不能用这种方法测量。

**(5) 移动立方体算法**。等值面算法把顶点放在插值场穿过 0.5 的地方，即由八个相邻体素中心构成的立方体的棱上，网格的面积是它各个三角形的面积之和。在二值掩码上，它给出 887（$+21\%$）：比面计数好，但仍然相差很远，而细化各行显示，它并不随体素缩小而改善：在保持相同体素形状的三个最细的网格上，依次为 $+21.4\%$、$+21.0\%$ 和 $+21.3\%$（最粗的网格给出 $+17.4\%$）。二值场只有两个取值，所以每个顶点都落在所在棱的中点，网格保留了阶梯；各向异性的体素使情况更糟，因为对各向同性的 0.4 微米体素，同一个掩码给出 795.5（$+8.9\%$）。在用 0.5 微米高斯模糊后的掩码上，场有了中间值，顶点移到亚体素位置，面积为 755（$+3.4\%$）。这就是[第 13 节](#s13)的实用规则：对概率体数据做网格化，或者至少对轻度平滑过的掩码做网格化。模糊有它自己的代价。它会使凸物体略微缩小（模糊后物体的 0.5 等值面位于原边界之内），所以随着体素变细，阶梯偏差消失，平滑偏差显现出来，即最后两行的 $-0.4\%$ 和 $-1.0\%$。以物理单位选择模糊的尺度，使它相对于你要测量的特征很小。

**(6) 转换器**。七千零五个体素，每个 $0.4^3 = 0.064$ 立方微米，给出 448.3，是真实体积的 27%。切片间距小了 3.75 倍，体积也就错了这个倍数。这是**粗大误差**：掩码质量和分辨率都影响不了它，在体素上计算的任何统计量也揭示不了它。唯一的防御办法是让间距随掩码一起传递，并拒绝没有间距的掩码（[第 13 节](#s13)）。

**(7) 分类**。

| 差异 | 大小 | 类型 | 随体素变细而缩小吗？ |
|---|---|---|---|
| 体积，一次放置 | $+0.3\%$ | 来自方差的一次抽样 | 是 |
| 体积，各次放置的均值 | $+0.08\%$ | 偏差，可以忽略 | 趋于 0 |
| 体积，各次放置的离散程度 | 11.4（0.68%） | 方差 | 是，每减半约缩小为四分之一 |
| 面计数得到的面积 | $+47.5\%$ | 偏差，结构性的 | 否：趋于 $+46.2\%$ |
| 移动立方体算法，二值掩码 | $+21\%$ | 偏差，来自二值场和体素形状 | 否，只有体素更接近各向同性时才缩小 |
| 移动立方体算法，模糊掩码 | $+3.4\%$ | 来自模糊的小偏差 | 阶梯部分缩小；平滑部分不缩小 |
| 丢失切片间距 | $-73\%$（真值的 27%） | 粗大误差 | 否 |

此外还要加上一项本练习无法展示的误差，因为本练习用的是完美的掩码：真实的分割有它自己的偏差。边界向外偏移四分之一微米，即平面内体素尺寸的 0.6 倍，会增加 $\tfrac{4}{3}\pi \cdot 10.25 \cdot 8.25 \cdot 5.25 - 1{,}675.5 = 184$ 立方微米，即 $+11\%$（面积乘以偏移量给出 183，在一阶近似下相同）。网格带来的方差 0.7%，约比亚体素边界误差的影响小十六倍。在真实测量中，误差预算由网络把边缘放在哪里以及元数据主导，而不是由离散化主导。评估这一部分需要留出的样品和人工测量，而这里的离散化分析是不需要它们也能完成的那一部分。
:::

::: exercise id=e15 level=1 kind=conceptual minutes=5
**这些图能证明它吗**？一位同事展示了混凝土图像裂纹分类器的 Grad-CAM 图；每张图都突出显示了裂纹。这能说明分类器是出于正确的原因检测裂纹吗？给出这一证据的两个局限，以及两项进一步的检验。
:::

::: solution
**不能**。它是这样一个证据：在所展示的图像上、在粗略的尺度上，分类器*除其他东西之外*找到了裂纹。共有四个局限（作答时给出两个即可）：

1. *分辨率*。Grad-CAM 的分辨率就是最后一个卷积层的分辨率。对 $224 \times 224$ 输入下的 ResNet-50，这是 $7 \times 7$，一个格子覆盖 $32 \times 32$ 像素，而几个像素宽的裂纹完全可以落在一个格子里。这张图说明证据是在那个区域找到的，而不是在裂纹本身上找到的。
2. *它显示的是哪里，而不是什么*。裂纹总是伴随着沿其分布的污渍、阴影、剥落的边缘和水渍。依据污渍做判断的分类器会点亮同一个格子。一张图无法区分裂纹与随裂纹一起出现的东西，而捷径通常就是这样隐藏起来的（[第 14 节](#s14)）。
3. *挑选*。展示出来的图可能都是成功的例子。有信息量的是误报和漏报的图，以及没有裂纹的图像上的图。
4. *看似合理不等于忠实*。某些显著性方法即使对权重随机化的网络，也会生成看上去合理的图（Adebayo 等人 2018），所以一张看上去正确的图，并不能证明它依赖于模型学到的东西。

**两项进一步的检验**。

- *随机化模型*。重新初始化顶部的几层（或者逐步重新初始化所有层），再重新计算这些图。如果它们仍然突出显示裂纹，说明这个方法显示的是图像而不是模型；如果它们变了，说明原来的图依赖于训练好的权重（[实验 6](#lab6) 做了这项检验）。
- *反事实*。用图像修复或一块周围的混凝土把裂纹涂掉，观察得分是否下降；沿一条没有裂纹的线添加像裂纹的污渍或阴影，看得分是否上升。把裂纹移到别处，或者改变背景。利用裂纹的分类器能通过这两项检验，利用污渍的分类器则通不过第二项。

除此之外，还要检查出错样本的图，并在来自另一个现场、另一台相机或另一种表面类型的图像上评估，在那里，与训练来源绑定的捷径会失效。
:::
