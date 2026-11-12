## MiniJDL 项目说明 {#s1}

结课项目要求你设计一种小型语言，用于描述包含实体、字段和有向关系的应用。从同一个模型出发，检查领域规则，生成 SQL DDL、Java 数据类和 HTML 文档，再把实体转换成关系模型。这里的 **MiniJDL** 是教学语言，并非 JHipster 的 JDL；它生成的 Java 类是简单的数据声明，而不是可运行的 Web 应用。

从实体描述生成多个相互协调的产物这一思路改编自 Dimitris Kolovos 的 [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/)（2021）。本节的 MiniJDL 元模型、商店模型和 Epsilon 程序均为教程编写。你可以在本地使用[第 10 模块下载包](downloads/module_10.zip)，或在 Playground 中打开各示例。

目标是建立可重复的流程：元模型定义语言，模型记录应用，EVL 拒绝不良数据，EGL/EGX 生成可读产物，ETL 通过明确的映射创建另一种模型。每一步都留下可检查的证据，再决定是否信任下一步。

## 定义语言 {#s2}

打开第一个示例中的 `minijdl.emf`。`Application` 包含 `Entity`；`Entity` 包含 `Field` 和 `Relation`。字段的 `FieldType` 可以是 `STRING`、`INTEGER` 或 `BOOLEAN`。关系引用目标实体。`val` 明确所有权，`ref` 表示关系指向一个已有实体，而不是拥有它的副本。

Flexmi 模型描述 `Shop`：`Customer` 有 `email` 和 `active`，`Product` 有 `title` 和 `price`，`Purchase` 有 `quantity`，并与另外两个实体建立关系。EOL 查询打印数量，便于确认模型按预期加载。

{{EXAMPLE:m10-language}}

元模型能表达结构，却不能表达所有业务规则。例如，它并不阻止同一实体中的两个字段同名。该规则应放在验证中。若以后加入新的字段类型，就必须同时更新元模型中的枚举和各生成器中的类型映射。

## 构建并验证模型 {#s3}

下一个模型故意包含两个 `Customer.email` 字段。EVL 检查实体名称唯一、每个实体内部的字段名称唯一，并检查关系有目标。重复字段产生两条结果，因为约束会对两个违规字段分别执行。这是验证结果，而不是解析错误。

{{EXAMPLE:m10-invalid}}

生成交付产物前先修复重复字段。练习 4 的参考解答在修正后的模型上运行相同规则。真实项目还应酌情检查标识符语法、目标语言保留字、关系名与字段名冲突、必填字段和循环。通过这组简短规则，并不代表其他策略也已得到保证。

## 生成 SQL、Java 与 HTML {#s4}

EGL 把商店模型映射为 SQL DDL。每个实体变成一张带 `id` 列的表；字段映射为 SQL 列类型；关系变成 `_id` 列和外键声明。检查生成的 SQL，确认 `Purchase` 按名称引用 `Customer` 和 `Product`。模板使用简单的通用 SQL 风格；生产环境必须明确选择数据库专属类型和命名规则。

{{EXAMPLE:m10-sql}}

EGX 针对每个实体调用一次 EGL 模板，得到 `Customer.java`、`Product.java` 和 `Purchase.java`。模板将字段类型映射到 Java 类型，将关系映射为有类型的引用。这些文件展示生成过程；Playground 不会编译它们，关系持久化也不在此小示例范围内。

{{EXAMPLE:m10-java}}

HTML 模板提供同一模型的第三种视图，列出实体、字段和关系数量。打开生成输出，把名称与 SQL、Java 产物比较。如果某个生成器漏掉实体，共同的源模型有助于发现差异。

{{EXAMPLE:m10-html}}

## 转换为关系模型 {#s5}

文本生成不是唯一途径。ETL 程序把 `Application` 映射为 `Schema`，`Entity` 映射为 `Table`，`Field` 映射为 `Column`。目标遵循自己的 `relational.emf` 元模型，因此可以继续验证或交给其他生成器。初始映射故意省略关系，便于观察信息损失。

{{EXAMPLE:m10-relational}}

将目标树与源模型比较：三张表包含五个已声明字段的列，以及三个生成的 `id` 列，却没有外键。ETL 规则在 `t.columns ::= e.fields` 后添加 `id`，因为该赋值会替换先前的列集合。练习 6 加入关系键列和 `Relation2ForeignKey` 规则，并将其结果挂到正确的表下。转换成功运行不代表映射完整；应先确定目标必须满足的不变量，再判断工作是否完成。

## 评估并扩展解答 {#s6}

用下面的清单评估自己的 MiniJDL 变体：

- **语言：** 每个类、包含关系和引用是否都有用途？模型元素的所有权是否如预期？
- **模型：** 所有按名称编写的引用都能解析吗？不修改元模型，能否描述第二个不同的应用？
- **验证：** 无效名称和关系是否产生清楚的结果？修正后的模型是否通过？还有哪些规则尚未实现？
- **SQL：** 所有实体、字段和关系键是否存在？输出对所选数据库是否有效？
- **Java：** 预期的文件和类型是否存在？如需可编译代码，是否已编译并处理包名与导入？
- **HTML：** 文档是否描述了与模型一致的实体和关系？
- **ETL：** 表和列数量是否正确？每个外键是否指向预期目标表？目标模型能否验证？
- **可重复性：** 修改模型后，能否重新运行流程、比较输出，而不手工修补产物？

参考示例提供了小型端到端解答，并不生成完整的 JHipster 应用。加入重数、约束、应用配置和持久化选项，将成为新的设计练习。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**追踪所有权。** 为什么 `Entity` 包含自己的 `Field`，而 `Relation.target` 是引用？
:::

::: solution
字段归声明它的实体所有。关系指向应用中已有的另一个实体；若包含该目标，就会复制或移动它。
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**追踪元素。** 在 SQL、Java 和 HTML 示例中追踪 `Purchase.customer`。哪些表示包含目标名称？HTML 示例省略了什么？
:::

::: solution
SQL 声明 `customer_id` 和指向 `Customer` 的外键；Java 声明 `Customer customer` 字段。HTML 示例只报告 `Purchase` 有两个关系，未列出关系名称和目标，因此它只是摘要，不是完整的模式说明。
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**查找信息损失。** 第一个关系模型目标省略了什么？即使 ETL 已结束，为什么还要检查？
:::

::: solution
它省略了 `Purchase` 的两条关系，因此目标中没有外键。ETL 执行成功只能说明规则运行过，不能证明所有必需的源概念都已映射。
:::

::: exercise #e4 level=2 kind=coding minutes=10
**修复模型。** 将重复的 `Customer.email` 字段改为 `active: BOOLEAN`，然后运行相同的 EVL 规则。
:::

::: solution
修正后的模型通过这组参考规则中的全部三个约束：

{{EXAMPLE:m10-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**扩展 Java 生成。** 在每个生成的 Java 类中加入返回实体名称的 `entityName()` 方法。
:::

::: solution
EGX 规则仍为每个实体创建一个文件；EGL 模板新增该方法：

{{EXAMPLE:m10-e5-solution}}
:::

::: exercise #e6 level=3 kind=coding minutes=15
**完成关系映射。** 加入 ETL 规则，为每条关系创建外键，并通过转换轨迹解析目标表。
:::

::: solution
`Entity2Table` 添加每个 `_id` 列并挂载转换后的关系；`Relation2ForeignKey` 将关系目标实体映射到相应的表。目标树现在于 `Purchase` 下包含 `customer` 和 `product` 外键：

{{EXAMPLE:m10-e6-solution}}
:::

## 自测 {#quiz}

```quiz
? 本模块的 MiniJDL 是什么？
- [x] 用于实体、字段和关系的小型教学语言
- [ ] 官方 JHipster JDL 实现
- [ ] SQL 数据库引擎
- [ ] Eclipse 插件
> 该语言为结课项目专门设计。

? 哪个特征拥有 `Field`？
- [ ] `Relation.target`
- [x] `Entity.fields`
- [ ] `Schema.tables`
- [ ] `Column.sqlType`
> 实体包含自己声明的字段。

? 为什么无效模型产生验证结果？
- [ ] `Application` 没有名称。
- [x] `Customer` 有两个名为 `email` 的字段。
- [ ] 模型没有关系。
- [ ] SQL 生成失败。
> EVL 检查实体内部字段名称的唯一性。

? SQL 生成器为每条关系增加什么？
- [ ] Java 方法
- [x] `_id` 列和外键声明
- [ ] 新应用
- [ ] HTML 标题
> 关系映射为数据库引用。

? EGX 在 Java 生成中负责什么？
- [x] 对每个实体重复执行模板并命名输出文件
- [ ] 编译 Java 源码
- [ ] 自动加载 CSV
- [ ] 迁移旧模型
> EGX 协调每个匹配实体的文件生成。

? 第一个关系模型目标缺少什么？
- [ ] 模式名称
- [ ] 表
- [ ] 字段列
- [x] 表示关系的外键
> 初始映射故意省略关系。

? `Relation2ForeignKey` 如何找到目标表？
- [ ] 搜索生成的 SQL。
- [x] 解析相关实体的 ETL 对应元素。
- [ ] 将源实体复制到目标。
- [ ] 读取 HTML 输出。
> ETL 轨迹连接源实体与目标表。

? 在声称 Java 产物可用于生产前还需要哪项检查？
- [ ] 只统计源实体数量。
- [x] 编译生成文件，并处理包名和持久化需求。
- [ ] 只打开一次模型图。
- [ ] 删除全部验证规则。
> 教程生成的类只是示例性数据声明。
```

## 延伸阅读 {#reading}

- Dimitris Kolovos 的 [*Minimal JHipster JDL Monolith Example*](https://www-users.york.ac.uk/dimitris.kolovos/blog/jhipster-jdl-monolith-example/)（2021）提供了生成整个应用的动机示例。
- [EVL](https://eclipse.dev/epsilon/doc/evl/)、[EGL](https://eclipse.dev/epsilon/doc/egl/)、[EGX](https://eclipse.dev/epsilon/doc/egx/)和 [ETL](https://eclipse.dev/epsilon/doc/etl/)参考文档有助于扩展流程。
