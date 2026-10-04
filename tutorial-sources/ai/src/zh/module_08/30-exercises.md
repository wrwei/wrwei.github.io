## 练习 {#exercises}

采用十进制 GB，并明确本系列的计算约定。缩放定律问题使用原始参数量和 token 数，拟合预算为 $C_6=6ND$；案例硬件预算则计入随上下文变化的注意力项。

::: exercise id=e1 level=1 kind=conceptual minutes=5
列出预训练前应确定的四项决策：后续改变它们需要放弃已有工作、迁移或修改计划。再举一项可在未来更新中改变的决策，解释两者区别。
:::

::: solution
分词器确定各嵌入/输出行及分片 token 的含义，新映射需重新分词及转换嵌入。模型结构确定张量尺寸和连接，改变宽度、深度或词表需迁移权重或建立新模型，不能原样加载同一检查点。过滤和去重决定已见数据对权重的影响，事后删文档不能撤销更新。预热加余弦调度的终点决定衰减时机；延长训练需主动制定新调度，提前结束则可能未完成退火。

未来的数据混合权重可在有记录的阶段边界改变。Batch 大小、检查点间隔和并行布局也可在适当状态迁移后改变。区别在于修改是否只涉及未来工作，还是使已完成工作的假设失效。前四项都不是禁止后续改变，而是带来必须计入计划的成本。
:::

::: exercise id=e2 level=2 kind=calculation minutes=10
预算为 $C_6=10^{21}$ FLOP，每参数训练二十 token，计算 $N$、$D$ 及 $1.69+406.4/N^{0.34}+410.7/D^{0.28}$ 给出的损失。再计算规模缩至四分之一、token 增至四倍的模型。它在推理阶段带来什么收益？
:::

::: solution
代入 $D=20N$ 得到 $C_6=120N^2$，因此

$$
N=\sqrt{10^{21}/120}=2.8868\times10^9,\qquad
D=5.7735\times10^{10}.
$$

两个可约减损失项为 0.24684、0.39840，拟合损失为 $1.69+0.24684+0.39840=2.33524$ 奈特/token。替代方案为 $N'=7.2169\times10^8$、$D'=2.3094\times10^{11}$，保持相同 $6N'D'$，两项变为 0.39547、0.27024，得到 2.35571，比原方案差 0.02047 奈特，约为原总损失的 0.88%；预测困惑度约高 $e^{0.02047}-1=2.07\%$。

按近似 $2N$ 服务成本，每 token 模型运算量为四分之一，相同权重精度下存储也为四分之一。注意力、batch 和带宽会改变实际延迟关系。每参数二十 token 是经验分配；此预算下，拟合定律自己的最小值约为 1.82B 参数、91.4B token，损失 2.329。这些损失对应拟合分布和分词器，不是保证任务的得分。
:::

::: exercise id=e3 level=2 kind=calculation minutes=10
团队可使用 64 张 H100 共 30 天，假设每 GPU 密集 bf16 峰值 989 TFLOP/s、MFU 38%。精确案例结构在 8,192 上下文下可训练多少 token？采用 $N=9{,}550{,}729{,}216$、$N_{\text{matmul}}=8{,}927{,}875{,}072$、$L=36$、$d=4096$，每 token $6N_{\text{matmul}}+6LTd$ FLOP。使用 $6N$ 简化公式会造成什么调度错误？
:::

::: solution
可用模型计算为

$$
C=64(30)(86400)(0.38)(989\times10^{12})
=6.23440\times10^{22}\ \text{FLOPs}.
$$

每 token 权重项为 $6N_{\text{matmul}}=53{,}567{,}250{,}432$，注意力项为 $6(36)(8192)(4096)=7{,}247{,}757{,}312$ FLOP，合计 60,815,007,744。用总计算预算除以每 token 成本，得到 $D=1.02514\times10^{12}$ token，即每参数 107.34 token，约为 2T token 计划的一半。

简化公式给出 $D_6=C/(6N)=1.08795\times10^{12}$，多估约 6.13% token。按假设持续速率训练这些 token 需 31.84 天。因此，计划在 $D_6$ 结束的余弦调度，会在第 30 天被迫停止，未达到最终衰减点。应按考虑架构的计数规划，再监测实际吞吐量、停机和已完成 token。
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
推导每带 $r$ 行、共 $b$ 个带的理想 MinHash-LSH 候选概率。最多使用 128 个哈希，找出全部整数配置，使 $J\ge0.85$ 的检出概率至少 0.95，$J\le0.5$ 的候选概率至多 0.05。哪个配置使用最少哈希？
:::

::: solution
理想独立 MinHash 行以概率 $J$ 一致，一带全部 $r$ 行一致的概率为 $J^r$。各带互不重叠且独立，没有任何匹配带的概率为 $(1-J^r)^b$，因此

$$
P_{\text{candidate}}(J)=1-(1-J^r)^b.
$$

概率随 $J$ 单调增加，故只需检查两个边界相似度。枚举有限整数搜索空间：

```python
def probability(J,b,r):
    return 1-(1-J**r)**b

feasible = [(b,r) for r in range(1,129) for b in range(1,129//r+1)
            if probability(.85,b,r)>=.95 and probability(.5,b,r)<=.05]
print(feasible)
print("Fewest hashes:",min(feasible,key=lambda pair:pair[0]*pair[1]))
```

可行配置为 $(10,8),(11,8),(12,8),(13,8),(12,9),(13,9),(14,9)$。最短签名含 80 项，即 $b=10,r=8$，在 0.85 时概率 0.95847，0.5 时为 0.03838。若低相似度边界改为 0.6，同样搜索在 128 个哈希内没有可行解。这是理想概率结论，不保证实验 1 的近似通用哈希实现对每对文档都如此。
:::

::: exercise id=e5 level=1 kind=conceptual minutes=5
C4 清理删除含花括号的页面。为什么这会删除大量源代码？希望教模型代码的语料应如何处理？
:::

::: solution
花括号用于代码块、JSON、CSS 和模板，因此一概删除会连同网页脚本和模板删除有用代码。将代码作为独立管理来源，采用适合仓库的规则，检查来源许可、文件类型、生成或压缩文件、长度、秘密信息及重复。明确选择其混合权重。修改流程后审计代码损失和任务表现；英文正文过滤器并不自动适合代码。部分语言用缩进而非花括号，因此该规则还引入语言相关选择偏差。
:::

::: exercise id=e6 level=1 kind=conceptual minutes=5
2T token 训练给一个 15B token 的数学来源分配 3%。该来源重复多少次？权重加倍后怎样变化？给出三种增加数学知识的替代方案。
:::

::: solution
该来源贡献 $0.03(2\times10^{12})=60$B token，为其 15B 大小的四倍。份额加倍后为 120B token，即八轮。Muennighoff 等的数据受限实验发现，重复数据的额外价值递减，早期重复比后期更有用。四轮只是粗略实验范围，不是学习停止的普遍阈值。八次使用不提供八倍独立信息，却可能增加记忆。

获取更多来源和使用权兼容的唯一数学文本；生成额外问题并验证解答；或把额外权重集中在较短末期阶段，限制追加重复。相关代码与科学文本也可能提供迁移收益。测量留出数学损失及任务表现，防止同题家族跨训练和评估。
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
证明 logits 同加常数不改变交叉熵。推导 $\lambda(\log Z)^2$ 的梯度，解释其为何有助数值稳定。每次 bf16 训练都必须用这个辅助损失吗？
:::

::: solution
目标为 $y$ 时，交叉熵为 $-z_y+\log\sum_j e^{z_j}$。用 $z_j+c$ 替代各 $z_j$ 后得到 $-(z_y+c)+c+\log\sum_j e^{z_j}$，损失及概率保持不变。这种对称性不能固定 logits 整体水平。由于 $\partial\log Z/\partial z_j=p_j$，

$$
\frac{\partial}{\partial z_j}\lambda(\log Z)^2
=2\lambda\log Z\,p_j.
$$

$\log Z$ 为正时，梯度下降降低归一化常数；为负时方向反转。bf16 间距随数值幅度增大，30 附近为 0.125，因此漂移可能丢掉有意义的小差值。稳定 log-sum-exp 避免直接指数溢出，却无法恢复已舍入的差值。z-loss 针对整体漂移，是应测试的方案选择，并非全部 bf16 训练的必需条件，也不约束模型内部注意力 logits。
:::

::: exercise id=e8 level=2 kind=derivation minutes=10
从 $\Delta\mathcal L_{\text{opt}}(B)=\Delta\mathcal L_{\max}/ (1+B_{\text{noise}}/B)$ 出发，推导达到固定损失的步数与 token 取舍。$B_{\text{noise}}=3$M token 时，计算 batch 为 1M、6M token 的 $S/S_{\min}$、$D/D_{\min}$。
:::

::: solution
每步最优进展减少给定因子时，所需步数为 $S=S_{\min}(1+B_{\text{noise}}/B)$。Token 数为 $D=SB$，故 $D=S_{\min}(B+B_{\text{noise}})$。用小 batch 极限定义 $D_{\min}=S_{\min}B_{\text{noise}}$，于是

$$
\frac D{D_{\min}}=1+\frac B{B_{\text{noise}}},\qquad
\left(\frac S{S_{\min}}-1\right)
\left(\frac D{D_{\min}}-1\right)=1.
$$

1M 时，步数比为 $1+3/1=4$、token 比为 $1+1/3=1.333$；6M 时分别为 $1+3/6=1.5$、$1+6/3=3$。在这个局部模型下，更大 batch 使用更少更新，却需要更多 token。实际耗时还取决于硬件利用率、通信及可用学习率；训练中的噪声尺度也会改变。
:::

::: exercise id=e9 level=2 kind=calculation minutes=10
Llama 3 8B 结构采用 $N=8{,}030{,}261{,}248$、$L=32$、$d=4096$、$h_{\text{kv}}=1024$、$d_{\text{ff}}=14336$、$V=128256$。在八张 80 GB GPU、每张一条 8,192 token 序列下，计算 DP/ZeRO 模型状态、有无完整检查点的激活及 fp32 logits。哪些总量估计可容纳？
:::

::: solution
按每参数 16 字节的 Adam 约定，状态为 $16N$、$4N+12N/8$、$2N+14N/8$、$16N/8$。每层每 token 激活为 $12(4096)+4(1024)+6(14336)=139264$ 字节，乘以 $8192(32)$ 得 36.508 GB。完整检查点保存 $2dTL=2.147$ GB 层输入，并需 $139264(8192)=1.141$ GB 重算单层，总计 3.288 GB；fp32 logits 为 $4TV=4.203$ GB。

| 布局 | 状态（GB） | 无检查点总量 | 有检查点总量 |
|---|---:|---:|---:|
| DP | 128.484 | 169.194 | 135.975 |
| ZeRO-1 | 44.166 | 84.876 | 51.657 |
| ZeRO-2 | 30.113 | 70.823 | 37.605 |
| ZeRO-3 | 16.061 | 56.770 | 23.552 |

无检查点时，ZeRO-2、ZeRO-3 通过简化的 80 GB 限制；有检查点时三个阶段均通过，DP 始终超限。运行时缓冲区、通信和内存余量可能使接近上限的配置失效。案例模型的 FFN 更宽，参数和词表也更大，使 ZeRO-2 无检查点约为 83.7 GB，超过限制。因此分片阶段名称本身不能确定模型是否放得下。
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
GPipe 调度有三分之一总时间处于理想化流水线气泡。给出三种减少气泡的修改及各自成本。
:::

::: solution
增加 micro-batch 数 $m$，降低空闲比例 $(p-1)/(m+p-1)$；但更小 micro-batch 可能降低 kernel 效率，增大全局 batch 又可能超出有用噪声范围。GPipe 还保存很多激活直到反向，1F1B 可减轻内存负担。采用交错虚拟阶段，可按虚拟阶段数缩小理想气泡，但增加消息和调度复杂度。减少物理阶段 $p$，则每 GPU 保存和计算更多层，需靠分片、检查点或 TP 解决内存。公式假设阶段均衡，应先修复慢阶段，再期待调度实现理想收益。
:::

::: exercise id=e11 level=1 kind=conceptual minutes=5
训练损失每 1,000 步呈锯齿变化，记录的学习率调度没有该周期。给出两个合理原因及廉价检查方法。
:::

::: solution
第一，有序加载器可能循环分布不同的分片。记录分片 ID、偏移、来源、文档长度和采样位置，与损失周期对齐，再通过跨分片打乱或随机分片顺序测试。第二，定期评估或检查点操作可能改变训练状态，例如未退出 `model.eval()`、消耗训练生成器或重置加载器。记录 `model.training`、采样器状态哈希及周期操作前后偏移；另在非计划步骤执行一次作对照。这些只是待检验假设，不是仅凭曲线的诊断。还应确认日志中的学习率就是各参数组实际采用的值。
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
检查点写入需两分钟。为什么固定每 5,000 步保存忽略了故障率？在 Young 近似下，集群增大十倍且故障率随 GPU 数增长时，最优间隔怎样改变？异步检查点又改变什么？
:::

::: solution
设阻塞写入耗时 $\delta$，检查点间隔 $\tau$，作业平均故障间隔 $M$，近似开销比例为

$$
H(\tau)=\frac\delta\tau+\frac\tau{2M}.
$$

第一项为写入时间，第二项为每次故障平均丢失半个间隔的工作。求导得 $-\delta/\tau^2+1/(2M)=0$，即 $\tau^*=\sqrt{2\delta M}$。应按时间而非步数设置，因为每步时长可能变化。若 $M'=M/10$，则 $\tau'^*=\tau^*/\sqrt{10}$，约为原间隔的 0.316。最优 $H^*=\sqrt{2\delta/M}$ 下，最小开销增大 $\sqrt{10}$。

异步写入可减小 $\delta$ 的阻塞部分，从而缩短优选间隔。但状态快照必须一致，恢复只能使用最近完整持久化的检查点。后台写入延迟、带宽竞争和写入未完成时故障仍属于运行模型；仅改用主机复制耗时只是初步近似。
:::

::: exercise id=e13 level=2 kind=calculation minutes=10
从 0.5 开始，向 bf16 权重加 $10^{-3}$，再试 $3\times10^{-3}$。连续直接向 bf16 加十次 $10^{-3}$，与在 fp32 主权重中加十次再复制为 bf16，分别得到什么？
:::

::: solution
在 $[0.5,1)$ 中，间距为 $0.5(2^{-7})=2^{-8}=0.00390625$，半间距为 0.001953125。因此 0.501 舍入为 0.5，0.503 舍入为 0.50390625。十次小更新每次都从 bf16 值消失，最终仍为 0.5；fp32 主权重累积约到 0.510000，其 bf16 副本为 0.51171875，误差小于半个 bf16 间距。直接 bf16 累积则丢掉全部预期更新。用实际张量运算验证：

```python
import torch
weight = torch.tensor(.5,dtype=torch.bfloat16)
master = torch.tensor(.5,dtype=torch.float32)
print(float(weight+.001),float(weight+.003))
for _ in range(10):
    weight += .001
    master += .001
print(float(weight),float(master),float(master.to(torch.bfloat16)))
```

若做减法，低于二进制边界 0.5 后间距会变化；本题指定加法，避免另一种舍入计算。fp32 更新及主权重解决累积误差；随机舍入或补偿也可能可用，但需要独立验证。
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
继续预训练使领域困惑度降低 20%，通用损失增加 0.15 奈特，通用基准组下降三个百分点。提出两项方案调整、预期效果及验收决定。
:::

::: solution
增加通用回放，让通用梯度抑制遗忘，但固定 token 预算下领域 token 更少，领域收益可能变小。降低峰值学习率或缩短训练，减少权重移动以限制通用退步，但适配更慢。这些假设需在留出分布及任务组上检验；基准变化需配对不确定性估计。

按训练前声明的限制作判断。分词器相同，困惑度降低 20% 对应领域损失改善 $-\log(0.8)=0.2231$ 奈特。若通用验收门槛禁止三个百分点退步，就不应接受。若所有方案都未通过，保留原检查点，在模块 09 考虑更窄适配或针对任务的 SFT。
:::

::: exercise id=e15 level=3 kind=project minutes=30
在笔记本规模：(a) 对实验 2 的 FULL 运行每 25 步记录固定 batch 验证，在前半段拟合 $\mathcal L(D)=\mathcal L_\infty+aD^{-\gamma}$，比较最终预测和实测损失。(b) 做两个 QUICK 对照：正常运行，以及 10% 窗口来自固定 5,000 token 训练片段的运行。比较验证与片段损失。计算耗时不计入本题操作时间。
:::

::: solution
(a) 设实验 2 为 `QUICK = False`，把验证频率从每 150 步改成每 25 步，保留二十个固定 batch 与专用训练采样器，运行完整实验并保存 `lab2-metrics.json`。(b) 在新进程重建实验 2 的数据、模型及配置。下方对照循环使用五个固定验证 batch；两组从相同种子开始，抽取相同候选窗口，仅重复条件替换部分窗口。固定片段属于训练数据，其损失测重复拟合，而非留出泛化。重复比例按序列 Bernoulli 抽样，打印实际值。

```python
from scipy.optimize import least_squares

def experiment(total_steps,duplicate_share=0.0):
    torch.manual_seed(0)
    model = GPT(**config).to(device)
    optimizer = make_optimizer(model,3e-3)
    sampler = torch.Generator().manual_seed(0)
    vg = torch.Generator().manual_seed(123)
    fixed_valid = [batch(valid_data,vg,T) for _ in range(5)]
    sg = torch.Generator().manual_seed(456)
    fixed_slice = [batch(train_data[:5000],sg,T) for _ in range(5)]
    rows,duplicates = [],0
    warmup = 60 if total_steps==600 else 30
    for step in range(total_steps):
        x,y = batch(train_data,sampler,T)
        sx,sy = batch(train_data[:5000],sampler,T)
        mask = torch.rand(16,generator=sampler)<duplicate_share
        duplicates += mask.sum().item()
        x = torch.where(mask[:,None].to(device),sx,x)
        y = torch.where(mask[:,None].to(device),sy,y)
        for group in optimizer.param_groups:
            group["lr"] = learning_rate(step,total_steps,warmup,3e-3)
        optimizer.zero_grad(set_to_none=True)
        with precision():
            logits = model(x)
            loss = F.cross_entropy(logits.float().flatten(0,1),y.flatten())
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(),1)
        optimizer.step()
        if (step+1)%25==0:
            rows.append(((step+1)*16*T,evaluate(model,fixed_valid)))
    result = dict(curve=rows,validation=evaluate(model,fixed_valid),
                  slice_loss=evaluate(model,fixed_slice),
                  duplicate_share=duplicates/(16*total_steps))
    print(total_steps,duplicate_share,result["validation"],
          result["slice_loss"],result["duplicate_share"])
    return result

# Point this to the FULL metrics saved in (a), in that run's working directory.
full = json.loads(Path("lab2-metrics.json").read_text(encoding="utf8"))
assert not full["quick"] and len(full["validation"]) >= 24
clean = experiment(150)
duplicated = experiment(150,.10)
curve = np.array([(row["tokens"],row["loss"]) for row in full["validation"]])
early = curve[curve[:,0]<=300*16*T]
scale = 1e6

def law(tokens,parameters):
    floor,amplitude,gamma = parameters
    return floor+amplitude*(tokens/scale)**(-gamma)

starts = [[floor,amplitude,gamma] for floor in (0,1,2)
          for amplitude in (1,3,10) for gamma in (.1,.5,1)]
fits = [least_squares(lambda p:law(early[:,0],p)-early[:,1],start,
                      bounds=([0,0,.001],[early[:,1].min(),100,3]))
        for start in starts]
fit = min(fits,key=lambda result:np.sum(result.fun**2))
prediction = law(curve[-1,0],fit.x)
print("Fitted parameters:",fit.x)
print("Final prediction, measurement, error:",prediction,curve[-1,1],
      prediction-curve[-1,1])
fig,ax = plt.subplots(figsize=(7.2,3.6))
ax.loglog(curve[:,0],curve[:,1],"o",label="Measured validation")
ax.loglog(curve[:,0],law(curve[:,0],fit.x),label="First-half fit extrapolated")
ax.axvline(300*16*T,color="gray",linestyle="--",label="Fitting boundary")
ax.set(xlabel="Training tokens seen",ylabel="Cross-entropy (nats/token)")
ax.legend()
plt.show()
```

查看最终结果前，只用早期测量拟合。应报告误差，不能保证预测准确：短曲线难以确定渐近值和指数，余弦退火又改变后期轨迹。稳定学习率阶段更便于比较 token 缩放。上述有约束多起点拟合明确展示假设，不是不确定性区间。

当前环境中，FULL 标准曲线前半段拟合预测最终损失 2.9551，实测 2.8327，误差 +0.1224 奈特。拟合渐近值、百万 token 处振幅和指数分别为 2.1897、1.1679、0.4700。两个 QUICK 对照实测为

| 对照 | 实际重复比例 | 留出损失 | 固定训练片段损失 |
|---|---:|---:|---:|
| 正常 | 0% | 3.7984 | 3.8140 |
| 重复 | 9.958% | 4.3431 | 4.0267 |

重复组的片段损失比其验证损失低 0.3164 奈特，正常组两项则相近。但重复组的绝对片段损失仍高于正常组，重复没有改善全部指标。此种子下，留出损失恶化 0.5447 奈特。两个对照消耗采样器的方式与实验 2 普通循环不同，评估也用五个而非二十个 batch，所以应彼此比较。

重复比较中，应观察片段损失是否比通用验证下降更多。150 步使用 614,400 token，固定 5,000 token 片段按 10% 回放，约相当于 12.3 次 token 等价使用；窗口可重叠，并非按顺序完整遍历十二次。运行和测量噪声可使验证改善或恶化，归因小变化前应换种子重复。记录实际比例，并比较正常组的片段损失：即使不刻意回放，常见故事模式也容易预测。
:::
