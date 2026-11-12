## 走出浏览器 {#s1}

Playground 让前八个模块无需安装即可运行。真实项目通常还需要纳入版本管理的文件、可重复的构建、本地数据、磁盘上的生成文件，以及与其他工具的集成。离开浏览器时，仍保留元模型、模型和程序这三项输入。先导出一个能运行的示例，再改变执行环境，并将本地结果与本页记录的结果比较。

本模块的[下载包](downloads/module_09.zip)包含示例文件。Playground 自带的 **Download** 按钮还可把当前示例打包成 Eclipse Ant、Maven、Gradle 或 Java 项目，并附带 README；参见 [Playground 下载指南](https://eclipse.dev/epsilon/doc/articles/playground/)。如果在本教程的本地仓库中工作，[Maven 运行器源码](https://github.com/wrwei/wrwei.github.io/tree/main/tutorial-sources/mde/runner)展示了针对同一组文件运行 EOL、EVL、EGL、EGX 和 ETL 的 Java 集成。

## 设置 Eclipse Epsilon {#s2}

[Epsilon 下载页](https://eclipse.dev/epsilon/download/)介绍了两种方式：在 Eclipse Installer 中选择 **Epsilon**，或在现有 Eclipse 中打开 **Help → Install New Software**，使用稳定版更新站点 `https://download.eclipse.org/epsilon/updates/2.8/`。当前稳定的 Epsilon 2.8 系列与本教程记录的运行版本一致。新建项目，解压下载包，查看 `components.emf`、`alarm.flexmi` 和 `inspect.eol`。配置 EOL 运行时，将模型命名为 `M`，以 Flexmi 文件为模型输入、`components.emf` 为元模型。如果程序通过名称或限定类型访问模型，模型名称尤为重要。

先在 Playground 中运行查询，再在本地运行。两处都应列出警报模型及其三个组件。如果本地加载失败，先检查元模型命名空间、文件路径及连线引用的完整路径，再改动 EOL 程序。

{{EXAMPLE:m09-inspect}}

示例文件刻意保持简短。学习 Eclipse 运行配置时，可以把输出当作已知参照。[Epsilon 入门指南](https://eclipse.dev/epsilon/)和 Playground 导出项目中的 README 提供适合所用安装版本的界面步骤。

## 用 Ant 与 Maven 运行 {#s3}

Ant 工作流指定要加载的模型及要运行的程序。Epsilon 提供 EOL 等语言的 Ant 任务。典型的 EMF 任务加载 Ecore 元模型和模型，然后 EOL 任务引用该模型：

```xml
<epsilon.emf.loadModel name="M" modelFile="alarm.xmi" metamodelFile="components.ecore"/>
<epsilon.eol src="inspect.eol"><model ref="M"/></epsilon.eol>
```

这段代码假定已把 Emfatic 和 Flexmi 输入导出为 Ecore 和 XMI。若继续使用教程的 `.emf` 与 `.flexmi` 文件，请从 Playground 的 **Ant (Eclipse)** 下载项目开始；它包含必要配置。也可参照完整的 [Epsilon 命令行 Ant 示例](https://eclipse.dev/epsilon/doc/articles/running-epsilon-ant-tasks-from-command-line/)。只有上面两行任务片段，既不会安装 Ant 任务，也不会转换文件格式。

对于 Maven，在 Playground 的下载菜单选择 **Maven**，进入解压后的项目执行 `mvn clean package`。导出的 `pom.xml` 提供依赖并调用 Epsilon 任务。在真实项目中应固定 Epsilon 版本；[下载页](https://eclipse.dev/epsilon/download/)列出了 2.8.0 版 Maven 坐标。把验证放在生成之前，避免无效模型悄悄产出交付文件。下面的 EVL 关卡检查连线的信号类型：

{{EXAMPLE:m09-validate}}

本地运行时，除了退出状态，还要查看验证结果。对于验证发现的问题，构建必须有明确策略：报告问题、使构建失败，或允许有记录的例外。

## 从 Java 运行 {#s4}

在 Playground 的下载菜单选择 **Java (Maven)**，可得到小型 Java 项目和当前示例的 Epsilon API 配置。Java 中的步骤是：创建如 `EolModule` 的模块、解析程序、通过 EMC 驱动加载模型、把模型加入模块仓库、执行模块，最后释放资源。[教程运行器的 `Run.java`](https://github.com/wrwei/wrwei.github.io/blob/main/tutorial-sources/mde/runner/src/main/java/mde/Run.java)提供了更完整的实现。它的 `pom.xml` 固定 Epsilon 2.8.0；网站构建用它捕获每个示例的输出。

下面的 EGL 模板可用于检查集成结果：Java 可捕获其文本，构建也可将其写入文件。应将数值与模型比较，不要仅凭模板完成运行就假定产物正确。

{{EXAMPLE:m09-generate}}

要生成多个文件，可以让 EGX 对每个匹配元素调用一次 EGL 模板。本地运行时需要选择可写的输出目录；Playground 则在输出面板展示生成文件。

{{EXAMPLE:m09-batch}}

## 其他模型格式与工具 {#s5}

Epsilon 的 **EMC** 层让各语言连接不同的模型技术。EMF 是其中一种驱动，并不是模型的唯一形式。[EMC 指南](https://eclipse.dev/epsilon/doc/emc/)列出 CSV、XML、JSON、YAML 等驱动。例如，[CSV 驱动指南](https://eclipse.dev/epsilon/doc/articles/csv-emc/)在 EOL 中使用 `Row.all`，并在 Ant 中使用 `epsilon.csv.loadModel`。CSV 行也是可查询的元素，但不遵循这些 Playground 示例所用的组件元模型。移植规则之前，先用小样本确认驱动的类型名、特征名和持久化行为。

项目需求变化后，其他 Epsilon 工具也会派上用场：[ECL](https://eclipse.dev/epsilon/doc/ecl/)比较模型，[EML](https://eclipse.dev/epsilon/doc/eml/)合并模型，[Flock](https://eclipse.dev/epsilon/doc/flock/)迁移旧模型，[EUnit](https://eclipse.dev/epsilon/doc/eunit/)测试 Epsilon 程序，[Picto](https://eclipse.dev/epsilon/doc/picto/)在 Eclipse 中展示模型视图。这些是后续学习的起点，不是完成结课项目的前提。

## 规划真实项目 {#s6}

确定哪个模型是权威来源、如何验证、哪些产物会重新生成，以及哪些文件纳入版本管理。在持续集成中保留一个小型端到端示例。如果转换结果还要交给生成器，也应验证目标模型。下面的 ETL 示例重用组件到图的映射：本地工作流可先对源模型运行 EVL，再运行 ETL，检查图模型，最后生成图报告。

{{EXAMPLE:m09-transform}}

记录工具版本、输入文件和生成产物。决定如何处理人工修改；第 6 模块介绍了受保护区域，但真实项目应先在可丢弃副本上测试重新生成。一个实用的本地里程碑是：通过一条命令或一次 Eclipse 启动，得到与本页相同的组件数量、验证结果和报告文本。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**选择下载方式。** Eclipse Ant 工作流应选择哪个 Playground 下载选项？由 Maven 构建、通过 API 调用的 Java 程序又该选哪个？
:::

::: solution
Eclipse 工作流选择 **Ant (Eclipse)**，带有 Maven 依赖的 Java API 项目选择 **Java (Maven)**。阅读各自导出项目的 README 并检查路径。
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**安排工作流。** 按合理顺序排列模型加载、验证、转换和生成。目标模型应在何处检查？
:::

::: solution
加载源模型，验证源模型，执行转换，检查或验证目标模型，最后生成文本。工作流结束后释放模型。如果源模型验证失败，可在转换前停止。
:::

::: exercise #e3 level=1 kind=conceptual minutes=5
**选择驱动。** 团队收到 CSV 库存和 XML 配置。Epsilon 哪一层让 EOL 访问它们？重用组件规则前应检查什么？
:::

::: solution
EMC 提供 CSV 和 XML 模型驱动。检查驱动中的元素及特征名称，以及数据的加载和保存方式；针对 `Component` 写的规则不会自动适用于 CSV 的 `Row` 或 XML 节点。
:::

::: exercise #e4 level=2 kind=coding minutes=10
**检查导出文件。** 编写 EOL 查询，将每个输出端口打印成 `组件.端口`，以便比较本地运行与 Playground 的结果。
:::

::: solution
查询选择具体的输出端口，并打印其所属组件名称：

{{EXAMPLE:m09-e4-solution}}
:::

::: exercise #e5 level=2 kind=coding minutes=10
**加入本地关卡。** 在生成之前，要求组件名称各不相同。在警报模型上测试约束。
:::

::: solution
警报模型中各组件名称不同，因此这次 EVL 运行通过：

{{EXAMPLE:m09-e5-solution}}
:::

::: exercise #e6 level=2 kind=coding minutes=10
**生成交接清单。** 生成简短的文本清单，包含模型名称、组件名称和运行验证的提醒。
:::

::: solution
EGL 模板从模型读取名称，并打印验证步骤：

{{EXAMPLE:m09-e6-solution}}
:::

## 自测 {#quiz}

```quiz
? 将示例移出 Playground 后应该比较什么？
- [x] 本地结果与本页记录的结果
- [ ] 仅比较文件扩展名
- [ ] 仅比较 Java 版本
- [ ] Eclipse 中的颜色
> 已知输出有助于定位环境配置错误。

? 哪种下载包包含调用 Epsilon API 的 Java 类？
- [ ] Ant (Eclipse)
- [x] Java (Maven)
- [ ] PNG 图
- [ ] 只有模型 XML
> Java 下载项目包含 API 代码和 Maven 项目。

? Ant 中的 `model ref="M"` 指向什么？
- [ ] 模型文件扩展名
- [x] 已用名称 `M` 加载的模型
- [ ] 输出目录
- [ ] 元模型中的第一个类
> Ant 任务通过名称共享已加载的模型。

? 为什么要固定 Epsilon 依赖版本？
- [ ] 为了改变模型命名空间
- [x] 为了使本地和构建运行可重复
- [ ] 为了禁用验证
- [ ] 为了免去元模型
> 固定工具版本可以减少行为漂移。

? 哪一层把 Epsilon 语言连接到 CSV 和 XML 模型？
- [ ] EGX
- [ ] ETL 轨迹
- [x] EMC
- [ ] 只有 Picto
> EMC 提供模型驱动。

? Flock 主要解决什么问题？
- [ ] CSV 分隔符
- [ ] Java 编译
- [x] 元模型演化后的模型迁移
- [ ] 每个组件生成一个文件
> Flock 是 Epsilon 的模型迁移语言。

? 生成交付文件前应做什么？
- [x] 验证输入，并决定失败对构建意味着什么。
- [ ] 删除元模型。
- [ ] 只要解析成功就相信数据有效。
- [ ] 未测试就手工合并生成产物。
> 可重复的工作流将验证作为明确关卡。
```

## 延伸阅读 {#reading}

- [Epsilon 下载与 Eclipse 安装](https://eclipse.dev/epsilon/download/)；[Playground 导出项目](https://eclipse.dev/epsilon/doc/articles/playground/)。
- [Ant 与 Maven 执行](https://eclipse.dev/epsilon/doc/articles/running-epsilon-ant-tasks-from-command-line/)以及 [EMC 指南](https://eclipse.dev/epsilon/doc/emc/)。
- Dimitris Kolovos 的 [*Introduction to MDE, EMF and Epsilon* 公共讲座](https://www.youtube.com/playlist?list=PLRwHao6Ue0YUecg7vEUQTrtySIWwrd_mI)提供延伸视频。
