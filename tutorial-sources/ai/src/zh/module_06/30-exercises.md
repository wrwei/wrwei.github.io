## 练习 {#exercises}

使用自然对数，一次乘加计两次 FLOP。计算遵循 [第 11 节](#s11) 的约定。先独立尝试，再展开解答。

::: exercise id=e1 level=1 kind=conceptual minutes=5
解释为何对任意有限的查询和键，因果注意力的第一个输出都精确等于第一个值向量。它预测下一个 token 时能使用哪些信息？
:::

::: solution
只有第一个键可见，单个分数的 softmax 为 $e^s/e^s=1$，所以输出为 $\mathbf{v}_1$。该位置的后续各层也有相同信息边界：可依赖第一个 token 和位置，不能依赖后续 token。这并不决定具体损失；某些数据源中，第一个 token 已能高度确定下一个 token。
:::

::: exercise id=e2 level=2 kind=calculation minutes=10
向三 token 算例加入 $\mathbf{q}_4=\mathbf{k}_4=(1,-1)$。去掉因果掩码，以四阶单位矩阵为值矩阵，计算各输出行，保留三位小数。解释前三行如何变化，以及正交键为何仍有权重。恢复掩码后，哪些行不变？
:::

::: solution
未缩放分数各行为 $(1,0,1,1)$、$(0,1,1,-1)$、$(1,1,2,0)$、$(1,-1,0,2)$，分别除以 $\sqrt2$。四种可能的指数为 $1$、$e^{1/\sqrt2}=2.028115$、$e^{-1/\sqrt2}=0.493069$、$e^{\sqrt2}=4.113250$。逐行归一化得到

$$
\mathbf{P}\approx\begin{pmatrix}
0.286&0.141&0.286&0.286\\
0.180&0.365&0.365&0.089\\
0.221&0.221&0.449&0.109\\
0.266&0.065&0.131&0.539
\end{pmatrix}.
$$

因为 $\mathbf{V}=\mathbf{I}$，所以 $\mathbf{O}=\mathbf{P}$。第四个键向每个无掩码分母加入正的指数项，改变所有前三行。虽然它与查询 3 正交，权重仍为 0.109，因为零分数的指数为 1，不是 0。恢复因果掩码后，前三行看不到键 4，保留原权重，只在第四分量补零。
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
头宽度为 128 时，查询与键的元素独立、方差为 1。描述未缩放点积的尺度，并解释对学习查询与键投影的影响。
:::

::: solution
方差为 128，标准差为 $\sqrt{128}=11.31$。随机分数差距过大，可使 softmax 接近独热分布；雅可比元素 $p_i(1-p_i)$、$-p_i p_j$ 变小，削弱到达查询、键投影的梯度。除以 $\sqrt{128}$ 可在这些独立性假设下恢复单位方差，但不强制训练后的分数方差仍为 1。
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
设 $\mathbf{P}$ 为置换矩阵，证明无位置信息、无掩码的自注意力满足 $\operatorname{Attention}(\mathbf{P}\mathbf{X})= \mathbf{P}\operatorname{Attention}(\mathbf{X})$。再证明，固定查询、同时同序排列键和值时，输出不变。固定因果掩码是否对任意置换仍保留第一个恒等式？
:::

::: solution
线性投影给出 $\mathbf{Q}'=\mathbf{P}\mathbf{Q}$、$\mathbf{K}'=\mathbf{P}\mathbf{K}$ 和 $\mathbf{V}'=\mathbf{P}\mathbf{V}$。因此分数变为 $\mathbf{S}'=\mathbf{P}\mathbf{S}\mathbf{P}^{\top}$。排列行会重新排序独立的 softmax 计算。排列列会重新排序每行的指数，而不更改其分母。因此， $\softmax(\mathbf{S}')=\mathbf{P}\softmax(\mathbf{S})\mathbf{P}^{\top}$ 和

$$
\mathbf{O}'=\mathbf{P}\softmax(\mathbf{S})\mathbf{P}^{\top}
\mathbf{P}\mathbf{V}=\mathbf{P}\mathbf{O}.
$$

固定查询，同时排列键和值，分数变为 $\mathbf{S}\mathbf{P}^{\top}$，softmax 为 $\softmax(\mathbf{S})\mathbf{P}^{\top}$；乘以 $\mathbf{P}\mathbf{V}$ 时排列抵消。固定因果掩码与序列索引绑定，通常不等于它自身置换后的版本，所以任意置换不能保留上述恒等式。无位置信息、无掩码注意力对 token 排列等变；位置编码或依赖顺序的掩码，才提供内容集合缺少的顺序信息。
:::

::: exercise id=e5 level=1 kind=conceptual minutes=5
写出前置与后置归一化的残差更新，找出直接恒等路径。说明它对深层梯度意味着什么，又不保证什么。
:::

::: solution
前置归一化为 $\mathbf{x}_{\ell+1}=\mathbf{x}_{\ell}+ F_{\ell}(\operatorname{Norm}(\mathbf{x}_{\ell}))$，后置归一化为 $\mathbf{x}_{\ell+1}=\operatorname{Norm}(\mathbf{x}_{\ell}+F_{\ell}(\mathbf{x}_{\ell}))$。前者的雅可比为恒等矩阵加子层导数，直接残差路径不经过中间归一化的雅可比；后者的残差路径也经过这些矩阵。因此，前者提供更简单的梯度路径，却不保证所有梯度有界或非零：分支可能尺度不当，也可能相互抵消。最终输出归一化同样有自己的导数。
:::

::: exercise id=e6 level=2 kind=derivation minutes=10
将 RoPE 写为二维旋转的块对角矩阵，证明相对位置点积恒等式与范数保持。若值也按绝对位置旋转，输出如何变化？
:::

::: solution
对于频率对 $\theta_i$，使用

$$
\mathbf{R}(a)=\begin{pmatrix}\cos a&-\sin a\\\sin a&\cos a\end{pmatrix},
\qquad \mathbf{R}_t=\operatorname{diag}
(\mathbf{R}(t\theta_0),\ldots,\mathbf{R}(t\theta_{d_k/2-1})).
$$

相乘两个旋转块，利用角度加法公式得到 $\mathbf{R}(a)\mathbf{R}(b)=\mathbf{R}(a+b)$，转置得到 $\mathbf{R}(a)^{\top}=\mathbf{R}(-a)$。因此逐块有 $\mathbf{R}_t^{\top}\mathbf{R}_s=\mathbf{R}_{s-t}$、$(\mathbf{R}_t\mathbf{q})^{\top}(\mathbf{R}_s\mathbf{k}) =\mathbf{q}^{\top}\mathbf{R}_{s-t}\mathbf{k}$。又因 $\mathbf{R}_t^{\top}\mathbf{R}_t=\mathbf{I}$，故 $\|\mathbf{R}_t\mathbf{q}\|^2=\mathbf{q}^{\top}\mathbf{q}$。若值也旋转，输出为 $\mathbf{o}_t=\sum_s p_{ts}\mathbf{R}_s\mathbf{v}_s$。共同平移 $c$ 保持权重不变，却将输出变为 $\mathbf{R}_c\mathbf{o}_t$。分数仍是相对的，输出坐标却带有绝对旋转；普通 RoPE 因此不旋转值。
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
某模型只学习了 1024 个位置的绝对位置嵌入，却收到 2000 个 token。比较它与训练长度为 1024 的 RoPE 模型的失败方式。
:::

::: solution
只有 1024 行的嵌入表无法索引更后的位置。扩大表、加入未训练行，可以避免索引错误，却没有学到这些位置的表示。RoPE 在训练长度之外仍定义旋转，所以计算可执行；但更大偏移会带来未训练的角度组合，以及更多竞争键。数学上能定义超过 1024 的位置，不保证长上下文可靠；仍需适当训练与评估。
:::

::: exercise id=e8 level=1 kind=conceptual minutes=5
给出两个原因，解释为何双向掩码语言模型不能直接变成从左到右的下一个 token 生成器。
:::

::: solution
它用两侧上下文预测选中的缺失 token，并非用前缀预测所有后继；生成时右侧上下文尚不存在。另外，其通常的无掩码位置 logits 未被训练为下一个 token 分布。可以设计迭代掩码生成或改变目标，但这些都不是直接采用本模块不变的因果下一个 token 生成过程。
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
在宽度与深度相同条件下，比较 32 个查询头、8 个 KV 头的 GQA 与普通多头注意力。哪些投影和推理存储张量缩小四倍，哪些主要计算项不变？
:::

::: solution
键和值投影宽度从 $d$ 缩至 $d/4$，各自权重减至四分之一；缓存键和值也缩小四倍。查询与输出投影、FFN 不变。各查询头仍给所有可见键打分并混合值，因此查询-键和概率-值乘法的主导 FLOPs 不变；总计算仍因较小的键和值投影而下降。
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
解释为何将稠密注意力换成 FlashAttention 可以保持训练后模型的函数，而加入滑动窗口通常会改变它。
:::

::: solution
FlashAttention 分块计算同样的可见分数、softmax 与加权和，只改变浮点顺序和执行细节。滑动窗口移除部分可见键，改变 softmax 分母与加权和。因此，全注意力模型改用窗口后需要适应训练和评估，不能视为等价的 kernel 替换。
:::

::: exercise id=e11 level=2 kind=calculation minutes=10
将分数 $(2,1,3,0)$ 与标量值 $(1,2,3,4)$ 分成两个各含两项的块。计算各块处理后的累积最大值、归一化常数和累加器，并与直接 softmax 加权平均核对。
:::

::: solution
第一个块之后，$m=2$、$\ell=1+e^{-1}=1.367879$ 和 $a=1+2e^{-1}=1.735759$。第二块将最大值提高到 3，要求旧贡献乘以 $e^{-1}$。然后

$$
\begin{aligned}
\ell'&=(1+e^{-1})e^{-1}+1+e^{-3}=1.553002,\\
a'&=(1+2e^{-1})e^{-1}+3+4e^{-3}=3.837698.
\end{aligned}
$$

比值约为 2.471。直接以最大值 3 缩放，指数为 $(e^{-1},e^{-2},1,e^{-3})$，总和同样为 $\ell'$，值的加权和为 $e^{-1}+2e^{-2}+3+4e^{-3}=a'$。这种核对避免了先将权重取整再相乘。
:::

::: exercise id=e12 level=2 kind=calculation minutes=10
计算词表 4096、宽度 256、四层、八个查询头、两个 KV 头、FFN 宽度 $\lfloor8(256)/3\rfloor$、无偏置 RMSNorm、共享嵌入的解码器参数量。逐项列出，解释与 $12Ld^2$ 的差异。
:::

::: solution
头宽度为 32，KV 投影宽度为 64，共享词表有 $4096(256)=1{,}048{,}576$ 个参数。每层查询与输出矩阵共 $2(256^2)=131{,}072$，键与值共 $2(256)(64)=32{,}768$，注意力总计 163,840。FFN 宽度为 682，三个矩阵共 $3(256)(682)=523{,}776$；两个归一化共 512。每层 688,128，四层 2,752,512。再加最终归一化 256 和词表，得到 **3,801,344**。

规则 $12Ld^2=3{,}145{,}728$ 不计嵌入，并假设普通多头注意力。GQA 每层节省 98,304；FFN 宽度取整又少 512，两个归一化恰好加回 512。因此，块总计 $3{,}145{,}728-4(98{,}304) =2{,}752{,}512$，嵌入与最终归一化解释剩余差异。
:::

::: exercise id=e13 level=2 kind=calculation minutes=15
使用第 11 节 Llama-2-7B 的计数、两万亿训练 token、序列长度 4096，以及给定的 184,320 GPU 小时预算。分别用 $6N_{\text{total}}D$ 和本系列约定计算模型 FLOPs，再换算每 GPU 持续 FLOP/s，以及相对给定峰值 312 TFLOP/s 的利用率。解释该估计忽略什么。
:::

::: solution
设 $N_{\text{total}}=6{,}738{,}415{,}616$、$N_{\text{matmul}}=6{,}607{,}343{,}616$。简化计数为 $6N_{\text{total}}D=8.08610\times10^{22}$ FLOPs；权重项为 $7.92881\times10^{22}$，因果注意力项为 $6(32)(4096)(4096)(2\times10^{12})=6.44245\times10^{21}$，相加为 $8.57306\times10^{22}$ FLOPs。

给定 GPU 小时等于 $184{,}320(3600)=663{,}552{,}000$ GPU 秒，除后分别约为每 GPU $1.219\times10^{14}$、$1.292\times10^{14}$ FLOP/s，再除以 $312\times10^{12}$，得到模型算力利用率 39.1%、41.4%。简化计数错误计入查找权重并漏掉注意力，误差部分抵消，最终仍低 5.7%。两种模型计数均不含检查点重算、优化器操作、评估、停机或通信。这里是模型算力利用率，不是直接测量硬件活动。
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
训练与验证损失异常迅速降到每字符 0.02 奈特。列出两个泄漏错误，并设计测试信息边界的干预。
:::

::: solution
缺失或反向的因果掩码暴露下一个 token；目标未移位则让模型重建当前输入。先检查输入目标配对，再固定前缀、改变未来 token；因果模型较早位置的 logits 必须不变。仅前缀评分与生成提供独立检查；低留出窗口损失本身无法区分这些错误与成功学习。
:::

::: exercise id=e15 level=3 kind=coding minutes=25
实现显式因果注意力，与 PyTorch SDPA 比较输出。设置 batch 为 1、8 个头、头宽 64、float32，计算长度 512、2048、4096 的分数存储，并为两种实现计时。可选：在 GPU 上比较长度 512、2048、8192 的峰值分配内存，报告实际后端。
:::

::: solution
以下显式实现可独立运行。计时前先核对数值；计时不含随机输入构造。预热避免某一实现单独承担首次调用初始化开销，但结果仍取决于机器。

```python
import time
import torch
import torch.nn.functional as F

torch.manual_seed(0)
torch.set_num_threads(4)


def explicit(q, k, v):
    T = q.shape[-2]
    future = torch.ones(T, T, dtype=torch.bool, device=q.device).triu(1)
    scores = q @ k.transpose(-1, -2) / q.shape[-1] ** 0.5
    return scores.masked_fill(future, -torch.inf).softmax(-1) @ v


def fused(q, k, v):
    return F.scaled_dot_product_attention(q, k, v, is_causal=True)


with torch.no_grad():
    for T in (512, 2048, 4096):
        q, k, v = (torch.randn(1, 8, T, 64) for _ in range(3))
        reference, actual = explicit(q, k, v), fused(q, k, v)
        error = (reference - actual).abs().max().item()
        assert error < 1e-5
        print(f"T={T}: score storage {8 * T * T * 4 / 2**20:.0f} MiB, "
              f"max difference {error:.2e}")
        for name, function in (("explicit", explicit), ("SDPA", fused)):
            function(q, k, v)
            started = time.perf_counter()
            for _ in range(3):
                function(q, k, v)
            print(f"  {name}: {(time.perf_counter() - started) / 3:.4f} s")
```

仅分数张量分别为 8、128、512 MiB；长度 8192 时为 2 GiB。显式实现还保留 softmax 输出与临时量，所以峰值高于分数张量大小。SDPA 的内存取决于实际选择的实现，不是函数名。

可选 GPU 实验应先分配输入，再重置峰值统计，测量新增的实时分配；在计时和内存查询前后同步。较长的显式计算可能内存不足；这测量的是容量限制，不是正确性失败。

```python norun
from torch.nn.attention import SDPBackend, sdpa_kernel

for T in (512, 2048, 8192):
    q, k, v = (torch.randn(1, 8, T, 64, device="cuda", dtype=torch.float16)
               for _ in range(3))
    for name, function in (("explicit", explicit), ("FlashAttention SDPA", fused)):
        torch.cuda.synchronize()
        baseline = torch.cuda.memory_allocated()
        torch.cuda.reset_peak_memory_stats()
        with torch.no_grad(), sdpa_kernel(SDPBackend.FLASH_ATTENTION):
            result = function(q, k, v)
        torch.cuda.synchronize()
        extra = torch.cuda.max_memory_allocated() - baseline
        print(T, name, "incremental peak MiB", extra / 2**20)
        del result
```

显式分支不受后端选择影响；SDPA 分支要求支持 FlashAttention 后端。后端错误应报告，不能悄悄换用其他实现。比较结束后，在解码器中恢复融合函数。
:::
