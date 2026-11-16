---
title: 用 Isabelle 学形式化方法
lead: 从逻辑和离散数学到机器检查的证明。先学习形式化方法所依赖的数学，再在 Isabelle/HOL 中证明程序和系统模型的正确性，每一个证明都由 Isabelle2026 检查。
---

## 本系列适合谁 {#who}

你会用某种语言写一点程序，也还记得中学代数。你没有学过逻辑或证明，也从未用过证明助手。你可能是计算机科学或软件工程专业的学生，也可能是一名希望验证设计、而不只是测试设计的工程师。本系列不假定其他任何基础，每个概念都会先在纸上讲清楚，再交给 Isabelle 检查。

## 你将能够做什么 {#outcomes}

- 用命题逻辑和谓词逻辑写出精确的规约，并运用集合、关系、函数和归纳进行推理。
- 解释什么是证明，手工构造自然演绎证明，并在 Isabelle 中重现它们。
- 在 Isabelle/HOL 中定义函数和数据类型，并借助自动化、Isar 结构化证明和归纳证明它们的性质。
- 对照规约验证函数式程序，把系统建模为状态机并证明其不变式，并证明一个小型编译器是正确的。

## 学习方式 {#how}

共四个部分、十四个模块，总计约 40 小时。每个模块都有例题、三个层次的练习（附完整解答）和一组简短的自测题。这些页面上的每一个 Isabelle 输出，包括每一条错误消息，都是 Isabelle2026 根据所示文本产生的；每一个证明，包括练习的解答，都经过了 Isabelle 的检查。请从模块 1 开始，它也会带你安装 Isabelle。

<!-- modules -->

## 参考资料与下载 {#reference}

**速查表**汇集了符号、命令、证明方法和规则；**问题排查**解释 Isabelle 的常见消息及其原因和解决办法；**术语表**给出每个术语的定义及其英文原文。本系列的所有 Isabelle 理论和经过检查的练习解答都打包在一个下载文件中：[formal-methods-theories.zip](formal-methods-theories.zip)。

## 继续深入 {#further}

Isabelle 自带文档（在 Isabelle/jEdit 的 Documentation 面板中）。托比亚斯·尼普科（Tobias Nipkow）的《Programming and Proving in Isabelle/HOL》是官方教程；尼普科和格尔温·克莱因（Gerwin Klein）合著的《Concrete Semantics》在此基础上继续讲解程序设计语言的语义。[形式化证明档案库](https://www.isa-afp.org)（Archive of Formal Proofs）收录了数百个经过检查的 Isabelle 项目。在本站，[数学基础](../math/index_ZH.html)为第一部分的数学提供更多练习，[Isabelle 模型验证](../isabelle/)（英文）则把 Isabelle 应用于一个对象模型。
