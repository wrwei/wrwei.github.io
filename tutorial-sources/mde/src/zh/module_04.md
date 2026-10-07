## 导航模型 {#s1}

前三个模块建立了一门建模语言，并用它编写了报警器模型。现在，我们可以提问，而不必逐一阅读 XML 元素。EOL（**Epsilon Object Language**）是 Epsilon 用来导航和修改模型的基础语言。EVL、EGL、EGX 和 ETL 都沿用它的表达式，因此这里学到的查询会贯穿后续模块。

`Component.all` 得到元模型中该类型的所有实例。对于每个组件，`c.name` 读取属性，`c.ports` 沿包含引用导航。点号表示“从当前值访问某个特性或操作”。下面的查询打印组件及各自拥有的端口数量。

{{EXAMPLE:m04-nav}}

程序依赖元模型，而不是把 `OrGate` 或 `Siren` 写死。换成第 3 模块的恒温器模型，同一程序也会以相同方式导航。`Port.all` 包括 `InPort` 和 `OutPort` 的实例，因为它们继承 `Port`。普通引用也能用于导航：`connector.source.eContainer().name` 先到达源端口，再到其所属组件。

::: keyidea
查询使用模型类型和特性来表达问题。模型改变但仍采用同一个元模型时，可以再次运行这个问题，而不用改写查询。
:::

## 筛选与映射集合 {#s2}

`Component.all` 是一个集合。EOL 提供处理集合的操作。`select(c | condition)` 保留条件为真的元素；`collect(c | expression)` 为每个元素产生一个值。这里的 `exists(p | p.isTypeOf(OutPort))` 判断某组件是否至少有一个输出端口。示例筛选出能产生输出的组件，按名称排序后打印。

{{EXAMPLE:m04-filter}}

从里向外阅读：`c.ports` 取得一个组件的端口；`exists` 对这些端口回答“有吗”；`select` 保留答案为真的组件；`sortBy(c | c.name)` 返回排序后的集合，并不会修改源模型中元素的名称或位置。`Siren` 只有输入端口，所以没有出现在输出中。

常见错误是本应筛选却使用 `collect`。`collect(c | c.name)` 把组件映射成名称，每个输入仍对应一个结果；`select` 保留原组件，之后仍能导航其端口。需要时可以组合两者：先选元素，再收集要报告的值。

## 量化判断与排序 {#s3}

模型查询常问“是否全部如此”或“是否至少有一个”，而不一定产出列表。`forAll` 在每个元素都满足条件时为真；`exists` 在至少一个满足条件时为真。下一个示例检查所有连接器的两端信号类型是否相同，以及是否有输入未被任何连接器指向。

{{EXAMPLE:m04-quantify}}

第一个答案为真：报警器中的每个连接器都连接数字端口。第二个答案也为真：`door`、`window` 和 `armed` 在架构内部没有入站连接。这里它们本来就来自外部，因此“未连接”是一项观察，不能自动判为错误。第 5 模块会增加所需的信息和规则，以决定哪些输入必须连接。

`sortBy` 根据竖线后的表达式排列集合。对名称而言，它使用字符串顺序。报告往往需要稳定的顺序，而模型的书写顺序不一定适合展示。还要注意排序依据：`Port.all.sortBy(p | p.name)` 可能包含来自不同组件的同名端口。若要唯一标签，还应加入所属组件的名称。

## 定义操作 {#s4}

多个查询重复同一计算时，可以把它命名为操作。EOL 中的 `operation Component inputCount() : Integer` 作用于 `Component`。操作体内的 `self` 是接收这次调用的组件。示例统计输入端口数，并按名称顺序逐个打印。

{{EXAMPLE:m04-operations}}

主程序语句写在操作定义之前。这在 EOL 中很重要：第一个操作定义之后的独立语句不会作为主程序执行。操作可以在另一个 EOL 查询中复用；使用同一模型时，也能用于 EVL 约束或 EGL 模板。简短的操作名称还可以比一遍遍重复嵌套的 `select` 表达式更清楚地说明领域含义。

操作不一定要附着在元模型类上。EOL 还可以定义不带上下文、像函数一样调用的操作，或定义作用于 `String` 等内置类型的操作。当问题自然地属于某个元素时，就使用上下文，例如“这个组件有多少输入？”[EOL 文档](https://eclipse.dev/epsilon/doc/eol/)详细说明了操作分派和这里使用的集合操作。

## 修改模型 {#s5}

EOL 不仅能读取模型，也能更新已载入的模型。示例找到 `Siren`，给它的 `name` 赋新值，然后打印改变后的组件名称集合。

{{EXAMPLE:m04-mutate}}

这次赋值只在**本次运行的内存模型**中生效。本系列的本地运行器不会保存 Flexmi 文件；关闭页面后，Playground 也不会保留你的修改。如果不改动示例文本而重新运行，原始模型又会载入 `Siren`。若需要持久修改，应编辑 Flexmi 源文件，或在本地项目中采用适合保存的模型格式。

修改名称还可能使按路径书写的引用失效。如果在 Flexmi 文本中把 `Siren` 改名，必须同步更新 `Alarm.Siren.sound` 这样的连接器路径。上面的查询修改的是已经载入的对象，不会改写源文件中的引用文本。要区分编辑源文本、修改已载入模型和保存模型资源。

## 设计实用查询 {#s6}

好的查询回答一个明确问题，并暴露其假设。“哪些组件没有输出？”可以直接检查端口；“哪些输入错误地未连接？”则需要更多领域信息：哪些输入来自外部，以及模型是否表示这些外部连接。不要把方便计算的数量直接当成架构有效性的证明。

写 EOL 表达式前，先确定起始类型、经过元模型的导航路径，以及答案的形式。需要子集时用 `select`，需要报告值时用 `collect`，需要布尔答案时用 `exists` 或 `forAll`，展示顺序重要时用 `sortBy`。重复出现且有明确领域含义的表达式可以定义成操作。这些选择会让后续模块的验证和生成规则更易读。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**选择操作。** 对每个问题选择 `select`、`collect`、`exists` 或 `forAll`：（a）所有组件的名称；（b）有输出端口的组件；（c）是否存在缺少目标的连接器；（d）是否每个组件都有名称。
:::

::: solution
（a）用 `collect` 将组件映射为名称。（b）用 `select` 保留组件的子集。（c）用 `exists`，一个缺少目标的连接器就足够。（d）用 `forAll`，条件必须对每个组件成立。必要时再组合导航和排序。
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**阅读查询。** 解释 `Component.all.select(c | c.ports.exists(p | p.isTypeOf(OutPort)))` 在报警器模型中返回什么，以及 `Siren` 为何不在结果中。
:::

::: solution
它返回至少有一个具体类型为 `OutPort` 的端口的 `Component` 元素：`OrGate` 和 `AndGate`。`Siren` 只有 `InPort`，所以内部的 `exists` 为假，`select` 将它排除。
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**观察还是规则？** 量化判断示例发现了未连接的输入。这能证明报警器无效吗？验证规则还需要知道什么？
:::

::: solution
不能。`door`、`window` 和 `armed` 由当前架构外部提供。规则需要知道哪些输入是外部输入，或以其他方式定义哪些输入必须由内部连接器驱动。第 5 模块会增加这样的区分。
:::

::: exercise #e4 level=1 kind=coding minutes=9
**寻找接收端。** 打印没有输出端口的组件名称。从 `Component.all` 开始，组合 `select` 和 `exists`，再打印保留的名称。
:::

::: solution
对 `exists` 取反，只保留不存在 `OutPort` 的组件：

{{EXAMPLE:m04-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**统计出站连接。** 按字母顺序列出每个组件，并统计源端口属于该组件的连接器个数。没有出站连接的组件应打印零。
:::

::: solution
对于每个组件，按源端口的容器筛选 `Connector.all`，然后取得集合大小：

{{EXAMPLE:m04-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=11
**命名可复用标签。** 定义作用于 `Port` 的操作，返回 `组件名.端口名`，然后按端口名称顺序打印所有标签。报警器中有两个同名的 `open` 端口；标签怎样区分它们？
:::

::: solution
操作使用 `self.eContainer().name` 和 `self.name`。两个标签分别是 `OrGate.open` 和 `AndGate.open`：

{{EXAMPLE:m04-e6-solution}}
:::

## 自测 {#quiz}

```quiz
? `Component.all` 返回什么？
- [ ] Emfatic 中的 `Component` 类声明
- [x] 已载入模型中类型为 `Component` 的所有元素
- [ ] 只有第一个组件
- [ ] 组件名称列表
> `Type.all` 选择已载入模型中的实例。

? 哪个操作保留满足条件的组件？
- [x] `select`
- [ ] `collect`
- [ ] `println`
- [ ] `sortBy`
> `select` 筛选集合，同时保留原元素。

? 哪个操作为每个输入元素产生一个报告值？
- [ ] `exists`
- [x] `collect`
- [ ] `forAll`
- [ ] `selectOne`
> `collect` 把每个元素映射为表达式的结果。

? `Connector.all.forAll(c | c.source.type = c.target.type)` 返回真说明什么？
- [ ] 至少一个连接器两端类型相同。
- [x] 每个被检查的连接器两端类型都相同。
- [ ] 所有输入都已连接。
- [ ] 元模型有效。
> `forAll` 要求集合中的每个元素都满足条件。

? 带上下文的 EOL 操作中的 `self` 指什么？
- [ ] 第一个载入的模型
- [ ] 操作的返回类型
- [x] 调用该操作的元素
- [ ] 上下文类型的所有实例
> `self` 是当前接收者，例如某个 `Component`。

? 在本系列的运行器中，修改示例把 `Siren` 改名后，Flexmi 文件会怎样？
- [ ] 文件被重写为 `Bell`。
- [x] 本次运行的模型发生变化，但源文件没有保存。
- [ ] 所有连接器都被删除。
- [ ] 元模型被更新。
> 运行器不持久化 Flexmi 资源。

? 报告为什么可能使用 `sortBy(c | c.name)`？
- [ ] 永久改变元模型的顺序。
- [ ] 让所有名称变得唯一。
- [x] 按名称给报告结果稳定排序。
- [ ] 验证每个组件。
> 排序改变结果集合的顺序，不改变源模型。
```

## 延伸阅读 {#reading}

- [EOL 参考文档](https://eclipse.dev/epsilon/doc/eol/)说明导航、操作、集合和模型修改。
- [Epsilon Playground 指南](https://eclipse.dev/epsilon/doc/articles/playground/)介绍如何编辑并重新运行示例。
