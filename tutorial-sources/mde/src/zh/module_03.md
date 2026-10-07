## Flexmi 与元模型 {#s1}

第 2 模块用 Emfatic 定义了一门组件与连接器语言。**元模型**（metamodel）列出它允许的元素种类（`Architecture`、`Component`、`InPort`、`OutPort`、`Connector`）、元素拥有的值以及元素之间的关系。本模块要用这门语言编写**模型**（model）。模型记录具体事物：名为 `Alarm` 的架构、带有 `open` 输出端口的 `OrGate`，以及通往另一个端口的连接器。

我们用 **Flexmi** 编写模型。它是 EMF 模型的一种简洁记法，有 XML 和 YAML 两种写法。Flexmi 借助元模型来解释文本，因此一份短小的文件就能创建许多相连的模型元素。之后，Epsilon 可以查询、验证或转换这个模型。这里我们用简短的 EOL 查询显示实际载入了什么；第 4 模块会系统讲解 EOL。

学习顺序是：读元模型、写模型、运行查询，然后查看模型图。每个示例下面的输出都由构建过程中的 Epsilon 2.8.0 实际运行得到。浏览器里的 Playground 也能运行示例，但它不会显示所有模型载入警告。第 5 节会故意制造一个这样的警告。

::: keyidea
Flexmi 文件是模型的一种**具体语法**（concrete syntax）。元素类型、特性和关系来自元模型；改变记法并不会改变这些概念。
:::

## XML 嵌套与元素 {#s2}

打开第一个示例，对照两个可见的文件。`components.emf` 声明了 `Architecture`、它的 `components` 和 `connectors` 包含引用，以及各个端口类。`alarm.flexmi` 以 `<?nsuri components?>` 开头，用来选择该元模型的命名空间。随后，`<architecture name="Alarm">` 创建一个 `Architecture` 实例。

{{EXAMPLE:m03-xml}}

从外到内阅读 XML。每个 `<component>` 都嵌套在 `<architecture>` 中，因为架构包含组件。每个 `<inPort>` 或 `<outPort>` 都嵌套在其组件中，因为 `Component.ports` 是包含引用。两个 `<connector>` 也位于架构内。它们的 `source` 和 `target` 属性是**普通引用**，并非在连接器内部新建的端口。

此模型中的三个组件共包含七个端口；架构还包含两个连接器。查询打印的正是这些数量。运行查询，然后删除 `Siren` 元素和指向它的连接器。再次运行前，先预测各项数量。一次小小的文本修改就能改变程序所读到的对象关系。

Flexmi 根据元模型中的类和包含特性匹配 XML 标签。架构内的 `<component>` 会成为一个 `Component`，组件内的 `<inPort>` 会成为一个 `InPort`。这种匹配有意设计得比较宽松，因此不要把标签的拼写当作严格的解析检查。如果模型行为出乎意料，请查看图示，并查询实际类型与取值，不要假定所有拼写错误都会报错。[Flexmi 文档](https://eclipse.dev/epsilon/doc/flexmi/)解释了匹配规则。

## 按名称建立引用 {#s3}

包含关系让每个端口在模型树中都有位置，但连接器要连接不同分支的端口。Flexmi 用元素的标识符解析普通引用。如果没有专门的 ID 属性，它会在可用时使用 `name`。**完全限定名**（fully qualified name）从具名根元素出发，沿具名容器一直走到目标。

报警器中有两个名为 `open` 的端口：一个是 `OrGate` 的输出，另一个是 `AndGate` 的输入。单写 `open` 无法清楚地指明其中哪一个。因此，第一个连接器的 `source` 是 `Alarm.OrGate.open`，`target` 是 `Alarm.AndGate.open`。查询在打印端口名称时也打印所属组件，让两者的区别一目了然。

{{EXAMPLE:m03-references}}

用同样的方法追踪第二个连接器：从 `Alarm.AndGate.sound` 到 `Alarm.Siren.sound`。这两个端口的短名称也相同。在 Epsilon 2.8.0 中，应使用从根元素开始的完整路径，以便可靠地解析引用。较新版的 Flexmi 文档介绍了后来加入的部分路径；本系列使用 2.8.0 构建并检查示例。

::: pitfall
如果重命名组件或端口，也要更新每一处引用它的路径。XML 嵌套负责创建元素，但连接器的 `source` 和 `target` 文本仍必须能解析到相应元素。
:::

## Epsilon 2.8 中的 YAML {#s4}

Flexmi 也能读取 YAML。下一个示例用**同一个元模型**描述**同一个报警器**，运行的也是与 XML 示例**相同的查询**。比较实际输出：架构、组件、端口与连接器的数量完全一致。

{{EXAMPLE:m03-yaml}}

请注意 2.8 的写法。`?nsuri: components` 选择元模型。`architecture:` 下面是一组条目，记录根元素的属性及其包含的元素。`- component:` 引入一个组件；其下缩进的条目设置组件的 `name`，并加入端口。连接器可以简写为 `- connector: {source: ..., target: ...}`。缩进很重要，因此要统一使用空格。

[新版 Flexmi 文档](https://eclipse.dev/epsilon/doc/flexmi/)展示的是 Epsilon 2.9 及以后修订过的 YAML 映射，使用 `$nsuri`。本系列的运行器采用 2.8，而实时 Playground 检查也确认了这些示例能按旧版写法运行。因此修改它们时，请遵循[旧版 YAML 参考文档](https://eclipse.dev/epsilon/doc/flexmi/legacy-flexmi-yaml-flavour/)。把 2.9 的示例直接放进 2.8 环境，可能得不到预期结果。

对于这个小架构，XML 的树形结构很容易浏览。YAML 在大部分内容都是名称和值时也很方便。两者是同一**抽象结构**的不同具体语法；选择团队能够可靠阅读和维护的写法。

## 警告与符合性 {#s5}

下一个模型在第二个连接器的目标名称中犯了一处错误：写成 `Alarm.Siren.sond`，而正确写法是 `Alarm.Siren.sound`。模型中存在 `Siren.sound` 端口，却没有一个名为 `sond` 的元素。

{{EXAMPLE:m03-broken}}

按顺序阅读实际输出。本地运行器先给出一条**模型警告**，指出行号和无法解析的 `target`，然后 EOL 查询打印了与有效报警器完全相同的数量。连接器元素本身仍然存在，因此查询数到了两个连接器，尽管第二个没有目标。仅仅统计元素，无法证明接线正确。

在 Playground 中，控制台只显示四行数量，**不显示**这条模型警告。切换到模型面板的图示：出错的连接器缺少指向 `Siren.sound` 的箭头。图示能暴露这条断开的关系。第 6 节会介绍怎样改变图示的表现形式。

其他错误需要其他检查方式。Flexmi 可能把拼错的标签模糊匹配到某个类或特性；如果某个 XML 属性在元模型的所有类中都没有声明，本系列的本地运行器会报告它，但 Playground 不会显示该警告。像 `Component[+]` 这样的数量约束虽然已声明，单纯运行查询仍不是完整的有效性检查，第 2 模块已经演示了这一点。对于重要的规则，应检查模型并明确编写验证。第 5 模块会用 EVL 表达输入是否连接、信号类型是否兼容等领域规则。

::: tip
排查问题时从模型本身开始：先核对元模型名称，再核对嵌套、取值以及每条非包含引用的路径。把图示与文本对照，并在相信程序看似合理的输出之前读完所有警告。
:::

## 图示与语法 {#s6}

模型并不等同于它的 XML 或 YAML 文件。文件只是书写模型的方法。Playground 还能画出载入的模型。默认情况下，它显示对象图，其中有模型元素以及元素间的引用。Emfatic **标注**（annotation）可以指定更有针对性的图形表现形式，而不改变模型的概念或 EOL 查询结果。

下面的示例在要画成具名节点的类上加入 `@node(label="name")`，在 `Connector` 上加入 `@edge(source="source", target="target")`，让连接器实例成为端口之间的边。Flexmi 文件与之前有效的报警器相同；变化的只有 Emfatic 中控制显示的标注。

{{EXAMPLE:m03-diagram}}

在 Playground 中打开它，切换到**模型**面板的图示。找到两个连接器形成的箭头。然后切回文本，删掉 `@edge` 标注。连接器仍在模型中，EOL 数量也不变，但图示会采用另一种表现方式。这些标注是 Playground 的功能；本地运行器会读取元模型和模型，却不会通过输出检查图示外观。[图形语法标注指南](https://eclipse.dev/epsilon/doc/articles/playground/graphical-syntax-annotations/)列出了可用选项。

**元模型**面板也有图示。它展示的是类与引用，而不是这个报警器里的具体组件与端口。请分清两个层次：元模型图解释这门语言；模型图展示这门语言的一个实例。XML、YAML 和图示则是模型抽象结构的不同具体视图。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**类型还是实例？** 在 XML 示例中，将 `Component`、`OrGate`、`OutPort` 和 `Alarm.OrGate.open` 分别归为元模型类型或模型元素。哪个模型元素是 `OutPort` 的实例？
:::

::: solution
`Component` 和 `OutPort` 是元模型类型。`OrGate` 和 `Alarm.OrGate.open` 是模型元素。`Alarm.OrGate.open` 是 `OutPort` 的实例；`OrGate` 是 `Component` 的实例。
:::

::: exercise #e2 level=1 kind=conceptual minutes=4
**阅读模型树。** 在 XML 报警器中，谁包含 `AndGate`、它的 `armed` 输入，以及第二个连接器？连接器包含它所连接的任一端口吗？
:::

::: solution
`Alarm` 包含 `AndGate` 和第二个连接器；`AndGate` 包含 `armed`。连接器只引用其源端口和目标端口，并不包含它们。
:::

::: exercise #e3 level=1 kind=conceptual minutes=4
**两个名为 `open` 的端口。** 写出第一个连接器的源端口和目标端口的完整路径。为什么这里单写 `open` 不合适？
:::

::: solution
源端口是 `Alarm.OrGate.open`，目标端口是 `Alarm.AndGate.open`。两个端口的短名称都是 `open`，无法据此区分。在 Epsilon 2.8.0 中，完整路径既能区分它们，也能可靠地解析。
:::

::: exercise #e4 level=2 kind=coding minutes=6
**用 XML 建立恒温器模型。** 使用同一个元模型创建 `Thermostat` 架构。把 `Sensor.reading` 接到 `Filter.raw`，再把 `Filter.smoothed` 接到 `Display.value`。将四个端口都设为 `ANALOG`，运行数量查询。先预测输出的四行。
:::

::: solution
这个架构有三个组件、四个端口和两个连接器。完整模型与实际输出如下：

{{EXAMPLE:m03-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=7
**把恒温器转换为 YAML。** 用 Epsilon 2.8 的 YAML 写法表达上一题的解答。保留相同的嵌套结构与完整的连接器路径。数量查询会变化吗？
:::

::: solution
变化的只有具体语法；查询和各项数量都不变。`?nsuri` 行及序列条目采用旧版 2.8 映射：

{{EXAMPLE:m03-e5-solution}}
:::

::: exercise #e6 level=1 kind=coding minutes=5
**修复并查看。** 打开“无法解析的端口引用”示例，在 Flexmi 文本中找到错误的目标，修复后重新运行。将实际输出与修复后的参考解答比较，并在 Playground 的模型图中检查第二个连接器。
:::

::: solution
把 `Alarm.Siren.sond` 改成 `Alarm.Siren.sound`。本地警告消失，连接器的两端都能解析。此查询打印实际的端点名称，让修复后的关系可见：

{{EXAMPLE:m03-e6-solution}}
:::

## 自测 {#quiz}

```quiz
? XML Flexmi 模型用什么选择 Emfatic 包？
- [ ] 根元素的 `name` 值
- [x] `<?nsuri components?>` 指令
- [ ] 第一个连接器
- [ ] EOL 程序的名称
> `nsuri` 指令标识元模型的命名空间。

? 为什么 `<outPort>` 嵌套在 `<component>` 内？
- [ ] 因为连接器拥有它。
- [x] 因为 `Component.ports` 是包含引用。
- [ ] 因为所有 XML 元素都必须至少嵌套两层。
- [ ] 因为 `OutPort` 是枚举。
> XML 嵌套表达模型中的包含关系。

? 连接器的 `target="Alarm.Siren.sound"` 起什么作用？
- [ ] 在连接器下新建一个端口。
- [x] 用完整路径引用一个已有端口。
- [ ] 重命名警报器。
- [ ] 修改元模型。
> 非包含引用指向已有元素。

? 哪一行属于这里的 Epsilon 2.8 YAML 示例？
- [x] `?nsuri: components`
- [ ] `$nsuri: components`
- [ ] `<?nsuri components?>`
- [ ] `namespace = components`
> 本模块使用 Epsilon 2.8 支持的旧版 YAML 映射。

? “无法解析的端口引用”示例数出了两个连接器，这能证明什么？
- [ ] 两个连接器都有有效的目标端口。
- [ ] 模型完全符合元模型。
- [x] 两个连接器元素被载入，但其中一个目标没有解析成功。
- [ ] 拼写错误已经自动修正。
> 元素数量看起来正确，引用仍可能为空。

? 图示示例中的 `@edge(source="source", target="target")` 改变了什么？
- [ ] EOL 查询的数量结果
- [ ] 模型中连接器的个数
- [x] Playground 绘制连接器实例的方式
- [ ] Flexmi 命名空间
> 控制显示的标注改变图形视图，不改变模型元素。

? 元模型图展示什么？
- [ ] 报警器中具体的 `OrGate` 和 `Siren` 实例
- [x] 建模语言中的类与关系
- [ ] 只有 EOL 输出
- [ ] 模型的 Git 历史
> 模型图展示实例；元模型图展示这些实例所使用的语言类型。
```

## 延伸阅读 {#reading}

- [Flexmi 文档](https://eclipse.dev/epsilon/doc/flexmi/)介绍 XML 嵌套、模糊标签匹配与引用解析。
- [旧版 Flexmi YAML 参考文档](https://eclipse.dev/epsilon/doc/flexmi/legacy-flexmi-yaml-flavour/)说明本模块采用的 Epsilon 2.8 写法。
- [Playground 图形语法标注指南](https://eclipse.dev/epsilon/doc/articles/playground/graphical-syntax-annotations/)介绍 `@node`、`@edge` 与图示选项。
- [Epsilon Playground 指南](https://eclipse.dev/epsilon/doc/articles/playground/)介绍模型图、元模型图和浏览器中的操作。
