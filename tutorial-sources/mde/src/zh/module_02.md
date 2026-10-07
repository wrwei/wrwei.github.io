## 从领域问题出发 {#s1}

在第 1 模块中，你使用过一个防盗报警器模型，却不必设计它的建模语言。这一次，我们来设计这门语言。目标是让有用的陈述容易表达：架构拥有组件，组件拥有端口，连接器把输出端口接到输入端口。元模型（metamodel）为这些词赋予精确含义。

写类之前，先问清模型需要描述什么。对于报警器，我们要给架构和组件命名、列出每个组件的端口，并连接端口。暂时不需要为每种逻辑门各建一个类。模型可以通过名称区分 `OrGate` 与 `Siren`，而元模型把它们都称作 `Component`。只有当新类型能带来有用的区分或规则时，才把它加入元模型。

本模块使用 **Emfatic**，即 Ecore 元建模语言的一种简洁文本记法。元模型放在 `components.emf` 中；符合它的模型放在 `alarm.flexmi` 中。请在 Playground 中运行每个示例，并查看这两个文件。示例是同一门语言的逐次修订，因此也要比较相邻的元模型。这种逐步演进的讲法受到 Dimitris Kolovos 的 [*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/)（2022）启发；这里的类与程序专为本系列编写。

::: keyidea
元模型规定模型中允许有哪些*种类*的元素和连接。模型则记录具体元素与连接，例如报警器中的 `OrGate` 和 `Siren`。
:::

## 类、属性与多重性 {#s2}

先从两个类开始。`Architecture` 是模型的根元素，包含 `Component` 元素。两个类都有 `name` 属性（attribute）。**属性**保存字符串、数字等值；**引用**（reference）指向另一个模型元素。Emfatic 分别用 `attr`、`ref` 和 `val` 表明这些区别。以 `@namespace` 开头的行给包设置 URI；Flexmi 文件通过 `<?nsuri components?>` 选用这个包。

{{EXAMPLE:m02-classes}}

试着在 Flexmi 面板中把 `Siren` 改为 `Bell`。查询会打印新名称，因为 `Component.all` 按元模型中的类型选择元素，并未把名称写死。再加一个 `<component name="Battery"/>`，重新运行。

元模型中的方括号表示**多重性**（multiplicity），即某个特性可以有多少个值。`String[1]` 表示恰好一个名称，`Component[*]` 表示零个或多个组件。省略方括号时，Emfatic 所采用的 Ecore 默认值是零个或一个，**不是**恰好一个。常见写法如下：

| Emfatic | 含义 | 示例 |
|---|---|---|
| 无方括号或 `[?]` | 零个或一个 | 可选描述 |
| `[1]` | 恰好一个 | 必填名称 |
| `[*]` | 零个或多个 | 可为空的部件列表 |
| `[+]` | 一个或多个 | 不可为空的部件列表 |
| `[2..4]` | 两个到四个 | 有上下限的一组元素 |

下一个元模型把组件的多重性从 `[*]` 改为 `[+]`。比较两个文件，再运行查询。

{{EXAMPLE:m02-bounds}}

输出统计了两个组件。但它**没有**证明每次载入 Flexmi 文件时都会执行下界检查。Ecore 记录结构上的数量约束，而这里的 Playground 工作流程不会自动对每个模型执行完整的有效性检查。如果删掉两个组件，查询仍然可以运行并报告零个；模型却违反了声明的下界。第 5 模块会介绍怎样用 EVL 明确检查项目需要遵守的规则。同样，`[1]` 记录名称必填这一要求，但不能把它误认为对所有输入文件的自动测试。

::: pitfall
查询成功运行，不代表模型一定符合元模型。工具可能载入并查询一个违反数量约束的模型。对于工作中依赖的要求，应明确加以检查。
:::

## 包含与普通引用 {#s3}

`val Component[*] components;` 是**包含引用**（containment reference）。架构拥有它的组件；从模型中删除架构也会删除其中的元素。一个组件只能有一个容器，因此模型具有树状的所有权结构。在 Flexmi 中，XML 元素的嵌套表达这种所有权：`<component>` 写在 `<architecture>` 内部。

连接器需要另一种关系。它的 `source` 是某组件拥有的端口，`target` 是另一个端口。连接器必须**指向**这些端口，而不能占有或移动它们。Emfatic 用 `ref` 表示这种普通的、非包含引用。下面的示例增加了端口与连接器：`Architecture` 包含组件和连接器；组件包含端口；连接器引用两个端口。

{{EXAMPLE:m02-references}}

顺着模型的嵌套结构看：`OrGate` 包含输出端口 `open`，`Siren` 包含输入端口 `sound`。连接器写在架构内部，用 `Alarm.OrGate.open` 这样的完整路径指明两个端口。如果把 `source` 写成 `val OutPort source`，连接器便声称自己拥有一个已经由组件拥有的端口。这不符合领域中的实际关系。

`ref OutPort source;` 与 `ref InPort target;` 还限制了连接两端的端口种类。但它们本身无法规定连接器必须连接不同的组件、两个端口的信号类型必须兼容，或所有必需的输入都有连接。这些是第 5 模块要用验证语言表达的**良构性规则**。

选择 `val` 还是 `ref` 时，可以问元素究竟“住在哪里”。架构是否*包含*组件？是，所以用 `val`。连接器是否仅仅*指明*一个已属于组件的端口？是，所以用 `ref`。

## 反向引用 {#s4}

前三个元模型让我们从架构导航到组件：`a.components`。如果查询从一个组件出发，需要找到其所属架构呢？可以通过 EOL 的 `eContainer()` 沿包含树向上走，但给这个领域关系取名会更直观。**反向引用**（opposite reference）将两个声明配成同一个关系的两个方向。

在 Emfatic 中，`components` 后面的 `#architecture` 指定它的反向引用；`architecture` 后面的 `#components` 则指回来。前者仍是包含引用（`val`），后者是普通引用（`ref`）。Flexmi 模型仍只需把每个组件嵌套写在架构内一次；EMF 会维护反方向的链接。

{{EXAMPLE:m02-opposites}}

程序从每个组件出发，打印它的 `architecture.name`。Flexmi 模型中没有额外的 `architecture="Alarm"` 属性。这个反向链接来自元模型中的关系，无需在模型里重复数据。

双向导航经常用到时，反向引用很有帮助，但它也意味着两端必须保持一致。较大的语言中，不必仅因为可以添加反向引用就给每条关系都加上；按导航或约束的实际需要来选择。这里的写法参见 [Emfatic 的引用文档](https://eclipse.dev/emfatic/)。

## 继承与枚举 {#s5}

端口声明用到了**继承**（inheritance）。`InPort` 和 `OutPort` 都继承 `Port`，也都继承了它的 `name`。关键字 `abstract` 使 `Port` 成为**抽象类**：模型中的端口必须是输入端口或输出端口，不能直接创建一个笼统的 `Port`。查询 `Port.all` 仍能得到这两种子类的实例，因为它们也都是端口。

现在需要区分信号种类。使用自由填写的 `String` 会允许 `digital`、`DIGITL` 或 `on/off` 等不统一的写法。**枚举**（enumeration）定义一个有限的、具名的取值集合。示例增加含有 `DIGITAL` 和 `ANALOG` 的 `PortType`，又为 `Port` 添加 `type` 属性。由于 `InPort` 与 `OutPort` 继承 `Port`，它们都拥有这个属性。

{{EXAMPLE:m02-types}}

输出列出每个端口的类型。报警器用的是数字信号。本模块后面的恒温器参考解答会在同一个元模型中同时使用模拟读数和数字命令。

枚举限制了*可选的值*，却不能决定相连的两个端口是否兼容。模型仍可表示从模拟输出接到数字输入的连接。这是否合法取决于领域；验证规则可以比较 `source.type` 与 `target.type`。

这里存在一个设计选择。分别设置 `InPort` 和 `OutPort` 类，让连接器的两端受到类型限制。另一种做法是只有一个 `Port` 类，再用 `direction` 枚举表示方向。后者的类较少，但必须借助验证规则检查源端与目标端的方向。两种设计没有放之四海而皆准的答案；应选择工具实际需要约束或导航的区分。

## 演进建模语言 {#s6}

随着对领域理解的加深，元模型也会变化。本模块的第一个版本只有架构和组件；之后逐步加入端口、接线、反向导航和信号类型。每次修订都改变了语言，有些修订也要求同步修改模型。例如加入 `PortType` 后，模型需要设置各端口的 `type`。

每次修改都可以用三个问题来审查：

1. **哪些陈述从此可以或不可以表达？** `ref InPort target` 排除了把输出端口当作连接器目标的做法；枚举排除了未声明的信号名称。
2. **已有模型要怎样改？** 新增特性可能要求旧模型提供取值。特性改名可能使旧 Flexmi 属性无法解析，也可能被模糊匹配机制悄悄映射到别处。
3. **还有哪些规则需要验证？** Ecore 描述结构和类型；禁止自环、匹配信号类型等领域规则还需额外处理。

可以在 Playground 中打开元模型的图示，从 `Architecture` 沿包含关系追到端口，再沿 `Connector` 的普通引用追到连接端点。这张图是同一个元模型的另一种视图。第 3 模块将着重编写和阅读符合元模型的模型。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**属性、包含还是引用？** 为每条事实选择 `attr`、`val` 或 `ref`：（a）组件有显示名称；（b）架构拥有组件；（c）连接器指向一个已经由组件拥有的输出端口。
:::

::: solution
（a）`attr String name;` 保存普通值。（b）`val Component[*] components;` 表示架构拥有组件。（c）`ref OutPort source;` 指向已有端口，不把它的所有权转移给连接器。
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**读懂数量约束。** `String[1]`、`Component[+]` 和 `Connector[*]` 各允许多少个值？如果一个没有组件的 Flexmi 模型仍能运行查询，它满足所声明的下界了吗？
:::

::: solution
它们分别表示恰好一个字符串、一个或多个组件、零个或多个连接器。即便查询能够执行，零个组件仍违反了 `Component[+]`。运行成功不等于完成了有效性检查。
:::

::: exercise #e3 level=1 kind=conceptual minutes=6
**画出所有权树。** 在“拥有部件并连接端口”的示例中，谁包含 `OrGate`，谁包含它的 `open` 端口，谁包含连接器？为什么连接器的 `source` 应该用 `ref`？
:::

::: solution
`Alarm` 包含 `OrGate`，`OrGate` 包含 `open`，而 `Alarm` 也包含连接器。连接器引用已经拥有容器的 `open`。如果把 `source` 设成包含引用，就会错误地描述这个端口的所有权。
:::

::: exercise #e4 level=1 kind=coding minutes=8
**增加描述。** 从第一个“架构语言”示例出发，为 `Component` 增加可选的 `String` 描述。在 Flexmi 模型中描述两个组件，并打印各组件的名称和描述。`String` 前应该用哪个关键字？
:::

::: solution
可选的普通值是属性。不写方括号时，它默认允许零个或一个值。完整文件和输出如下：

{{EXAMPLE:m02-e4-solution}}
:::

::: exercise #e5 level=2 kind=project minutes=11
**为恒温器指定类型。** 从“抽象端口与信号类型”示例出发，创建一个 `Thermostat` 架构。它有一个 `Sensor`，输出端口 `reading` 的类型为 `ANALOG`；还有一个 `Controller`，输入端口 `raw` 为 `ANALOG`、输出端口 `command` 为 `DIGITAL`。将 `reading` 接到 `raw`，查询并打印每个端口及其类型。
:::

::: solution
同一个元模型也能描述这第二个架构。连接器使用从 `Thermostat` 开始的完整路径：

{{EXAMPLE:m02-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=10
**从端口导航到所属组件。** 从“沿反向引用导航”示例出发，给 `Component.ports` 增加名为 `Port.component` 的反向引用。打印每个端口的 `component.name` 和 `name`。Flexmi 模型需要额外写 `component` 属性吗？
:::

::: solution
将 `val Port[*]#component ports;` 与 `ref Component#ports component;` 配对。Flexmi 的嵌套结构已经表达了所有权，无需新增模型属性：

{{EXAMPLE:m02-e6-solution}}
:::

## 自测 {#quiz}

```quiz
? `attr String name;` 不写多重性时声明了什么？
- [ ] 必须恰好有一个名称
- [x] 可以有零个或一个名称
- [ ] 可以有任意多个名称
- [ ] 指向另一个模型元素的引用
> 省略方括号时，Emfatic 使用 Ecore 默认的零到一。

? 哪个声明表示架构拥有它的组件？
- [ ] `attr Component[*] components;`
- [ ] `ref Component[*] components;`
- [x] `val Component[*] components;`
- [ ] `enum Component components;`
> `val` 声明包含引用。

? 为什么 `Connector.source` 是普通的 `ref`？
- [ ] 它保存字符串而不是模型元素。
- [x] 源端口已由组件包含。
- [ ] 普通引用总是必填的。
- [ ] 连接器不能有属性。
> 连接器指向端口，但不会变成端口的容器。

? `val Component[*]#architecture components;` 中的 `#architecture` 指明什么？
- [ ] 包的 URI
- [ ] 一个组件子类
- [x] `Component` 上的反向引用
- [ ] Flexmi 的根元素
> 它把 `components` 与 `Component.architecture` 配成一对。

? 模型能直接创建 `abstract class Port` 的实例吗？
- [ ] 能，因为所有类都可以实例化。
- [x] 不能；要创建 `InPort` 等具体子类的实例。
- [ ] 只有端口有名称时才能。
- [ ] 只有在图中才能。
> 抽象类提供共享特性，但不能被直接实例化。

? 枚举适合表达什么？
- [ ] 不受限制的信号名称
- [x] 固定的一组具名信号类型
- [ ] 组件的所有权
- [ ] 双向引用
> `PortType` 提供声明过的 `DIGITAL` 与 `ANALOG` 两个值。

? 元模型写着 `Component[+]`，但查询仍能在零个组件的模型上运行。能得出什么结论？
- [ ] 这个多重性其实是零个或多个。
- [ ] Ecore 自动修改了下界。
- [x] 查询运行了，但模型违反所声明的下界。
- [ ] 模型中一定有一个隐藏组件。
> 运行查询并不等于检查所有已经声明的约束。
```

## 延伸阅读 {#reading}

- [Emfatic 文档](https://eclipse.dev/emfatic/)：类、多重性、继承、枚举和反向引用的语法。
- [Flexmi 文档](https://eclipse.dev/epsilon/doc/flexmi/)：模型如何表达包含关系，以及如何按名称解析引用。
- Dimitris Kolovos，[*Metamodelling with ChatGPT*](https://www-users.york.ac.uk/dimitris.kolovos/blog/metamodelling-with-chatgpt/)（2022）：启发本系列的逐步构建组件语言的示例。
- [Epsilon Playground 指南](https://eclipse.dev/epsilon/doc/articles/playground/)：如何使用浏览器编辑器与图示。
