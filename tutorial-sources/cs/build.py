"""Build the bilingual CS overview and Module 01; run labs for captured outputs.

From the repository root: python tutorial-sources/cs/build.py
Only writes the CS pages and their downloadable labs.
"""
from html import escape
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

SOURCE = Path(__file__).resolve().parent
DEST = SOURCE.parents[1] / "docs" / "tutorials" / "cs"
PLAN = json.loads((SOURCE / "plan.json").read_text(encoding="utf-8"))
NOTICE = '<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->'

# Each pair contains English and Chinese text. Keep content and answer indices aligned.
CHECKS = [
    (("Does counting the books qualify as computation? State its input and output.", "统计书的数量是否属于计算？说明输入与输出。"),
     ("Yes. Input: the finite catalogue. Output: its number of entries. Increment a counter once per entry.", "是。输入为有限目录，输出为项目数。每读一个项目便把计数器增加一。")),
    (("What result is required for an empty catalogue? Is index 0 a missing result?", "空目录应返回什么？索引 0 是否表示不存在？"),
     ("Return -1 for an empty catalogue. Index 0 is the first valid position in a nonempty catalogue.", "空目录返回 -1。非空目录中的索引 0 是第一个有效位置。")),
    (("Trace a search for Foundation. Which positions are inspected?", "跟踪查询 Foundation 的过程。检查哪些位置？"),
     ("Inspect 0, then 1. Return 1 after two comparisons; do not inspect 2 or 3.", "先检查 0，再检查 1。比较两次后返回 1，不检查 2 或 3。")),
    (("Why is the empty catalogue compatible with the invariant argument?", "为什么空目录也符合不变式推理？"),
     ("There are no earlier matches and no entries left to inspect. Every entry is a nonmatch because there are no entries, so -1 is correct.", "没有更早的匹配，也没有待检查项目。因为根本没有项目，所以不存在匹配，返回 -1 正确。")),
    (("Can a titles-only abstraction answer who wrote each book? Why?", "只包含书名的抽象能回答每本书的作者吗？为什么？"),
     ("Not in general. Author information was not retained. Add it to the representation or obtain it from another source.", "一般不能，因为没有保留作者信息。需要扩展表示，或从其他来源获取。")),
]

EXERCISES = [
    (1, 8, ("Specify a counting problem", "规定一个计数问题"),
     ("Write a contract for counting occurrences of a target title, including an empty list and duplicates.", "为统计目标书名出现次数写出约定，涵盖空列表与重复书名。"),
     ("Input: a finite, unchanged list of strings and a target string. Output: the number of entries exactly equal to the target, a nonnegative integer. Empty input returns 0. Duplicates each contribute one. The list is not modified.", "输入为有限且不变的字符串列表与目标字符串。输出是与目标完全相等的项目数，为非负整数。空列表返回 0，每次重复出现都贡献一次，列表不被修改。")),
    (1, 8, ("Trace a duplicate", "跟踪重复值"),
     ("Search [A, B, A] for A under our first-match contract. List inspected indices and the returned result. How would a last-match contract differ?", "按照第一个匹配约定，在 [A, B, A] 中搜索 A。列出检查的索引和结果。最后一个匹配的约定有何不同？"),
     ("Inspect only 0 and return 0. A last-match search must examine the remaining entries; a full forward scan updating the result at each match would return 2 after three comparisons.", "只检查 0 并返回 0。寻找最后一个匹配必须检查剩余项目；每次匹配都更新结果的完整正向扫描会比较三次并返回 2。")),
    (2, 10, ("Repair an early return", "修复过早返回"),
     ("A search returns -1 immediately after the first nonmatch. Give a failing input and explain the repair, including empty input.", "搜索在第一个不匹配后立即返回 -1。给出失败输入，并解释修复方法，涵盖空输入。"),
     ("[A, B] with target B fails: A is unequal, but B was never examined. Move the absent return after the loop so it runs only when all entries have been checked. This also returns -1 for an empty list instead of falling through to None.", "输入 [A, B]、目标 B 会失败：A 不匹配，但 B 尚未检查。把表示不存在的返回移到循环之后，仅在全部检查后执行，也使空列表返回 -1，而不是运行到函数末尾返回 None。")),
    (2, 10, ("Count exact work", "精确统计工作量"),
     ("A list has 12 entries. How many comparisons find a first match at index 7? How many establish absence? What if the list is empty?", "列表有 12 项。第一个匹配在索引 7 时比较几次？确认不存在时几次？空列表呢？"),
     ("Index 7 requires 8 comparisons (indices 0–7). Absence requires 12. An empty list requires 0. These count equality checks, not all machine instructions.", "索引 7 需要 8 次比较（索引 0–7）；不存在需要 12 次；空列表需要 0 次。这是相等性检查次数，不是全部机器指令数。")),
    (3, 12, ("Explain the invariant", "解释不变式"),
     ("Give the initialisation, preservation and exit arguments for: before inspecting i, no earlier index contains the target.", "对于“检查 i 前，更早位置都不包含目标”，给出初始化、保持与退出时的推理。"),
     ("Initially i=0 has no earlier positions. After a nonmatch at i, all positions before i+1 are nonmatches. On a match, no earlier match exists, so i is minimal. On exhaustion, all entries are nonmatches. Finite length and advancing positions establish termination separately.", "初始 i=0 时没有更早位置。i 不匹配后，i+1 前所有位置均不匹配。匹配时没有更早匹配，所以 i 最小；耗尽时所有项目均不匹配。有限长度与位置前进另行证明终止。")),
    (2, 10, ("Find the abstraction loss", "找出抽象丢失的信息"),
     ("You replace the catalogue by its entry count alone. Which queries can it answer: how many entries, where is Dune, or which title is first?", "把目录替换为一个项目数量。它能回答哪些问题：有多少项、Dune 在哪里、第一本的书名是什么？"),
     ("Only the number of entries. Many different catalogues have the same count, so the count cannot recover either title identity or order. An abstraction is appropriate relative to the question being asked.", "只能回答项目数。多个不同目录可能有相同数量，因此数量无法还原书名或顺序。抽象是否合适取决于要回答的问题。")),
    (3, 15, ("Change the matching rule", "改变匹配规则"),
     ("Specify and implement a first-match search for ASCII titles ignoring letter case. Which checks should change?", "规定并实现一个忽略大小写的 ASCII 书名搜索，返回第一个匹配。哪些检查需要改变？"),
     ("Require ASCII strings and compare item.lower() == target.lower() inside the same loop; keep the absent return after the loop. Now [Dune] with target dune returns 0. Empty, absent and duplicate tests remain necessary. The existing exact-match contract has changed; text matching beyond ASCII needs more careful rules.", "要求字符串为 ASCII，在原循环中比较 item.lower() == target.lower()，不存在的返回仍放在循环之后。现在 [Dune] 查询 dune 返回 0；仍需检查空列表、缺失目标与重复值。原来的精确匹配约定已经改变；非 ASCII 文本匹配需要更谨慎的规则。")),
    (2, 12, ("Locate a fault", "定位故障"),
     ("Classify these faults: the requested matching rule is wrong; pseudocode skips index 0; return -1 is indented inside the loop; the script file cannot be opened.", "分类这些故障：要求的匹配规则不对；伪代码跳过索引 0；return -1 缩进在循环内；脚本文件无法打开。"),
     ("Respectively: specification, algorithm, implementation and environment. Check the contract with its user, repair the procedure, repair the code's control flow, or check the command and file path. A fault can involve multiple layers, but this distinction guides the first investigation.", "分别属于规约、算法、实现和环境。相应地，应核实用户要求、修复过程、修复代码控制流，或检查命令与文件路径。故障可能涉及多层，但这一分类有助于确定首先调查哪里。")),
]

QUIZ = [
    (("Which statement specifies a problem rather than an algorithm?", "哪个陈述描述问题要求，而不是算法？"),
     [("Return the smallest matching index, or -1.", "返回最小匹配索引，或 -1。"), ("Inspect titles from left to right.", "从左到右检查书名。"), ("Increase i after a nonmatch.", "不匹配后增加 i。")], 0,
     ("It describes the required result without prescribing the steps.", "它描述所需结果，没有规定执行步骤。")),
    (("What does our search return on an empty list?", "本例搜索空列表返回什么？"),
     [("0", "0"), ("-1", "-1"), ("The last title", "最后一个书名")], 1,
     ("The contract uses -1 for absence, including an empty list.", "约定用 -1 表示不存在，包括空列表。")),
    (("Where is the first Dune in [Dune, Foundation, Dune]?", "[Dune, Foundation, Dune] 中第一个 Dune 的索引是多少？"),
     [("1", "1"), ("2", "2"), ("0", "0")], 2,
     ("Positions start at zero, and the algorithm stops at the first match.", "索引从零开始，算法在第一个匹配处停止。")),
    (("How many equality comparisons establish absence in 9 entries?", "9 个项目中确认目标不存在需要多少次相等性比较？"),
     [("1", "1"), ("9", "9"), ("10", "10")], 1,
     ("All nine entries must be compared. The final return is not a title comparison.", "九个项目都必须比较。最后的返回不属于书名比较。")),
    (("Which fact ensures this search terminates?", "哪个事实保证本例搜索终止？"),
     [("The list is finite and each nonmatch advances a position.", "列表有限，每次不匹配都向前推进一个位置。"), ("The CPU is fast.", "CPU 速度快。"), ("The target must exist.", "目标一定存在。")], 0,
     ("Remaining work decreases to zero; the target may be absent.", "剩余工作量递减到零；目标可以不存在。")),
    (("What does passing five tests establish?", "通过五个测试说明什么？"),
     [("Correctness for every input.", "对所有输入都正确。"), ("Constant elapsed time.", "实际耗时固定。"), ("Correct results on those five cases.", "这五个案例的结果正确。")], 2,
     ("Tests provide evidence about cases; the invariant argument covers valid inputs generally.", "测试为具体案例提供证据；不变式推理覆盖一般有效输入。")),
    (("Why check a returned -1 before indexing a Python list?", "为什么用搜索结果索引 Python 列表前要检查 -1？"),
     [("Python always rejects -1.", "Python 总会拒绝 -1。"), ("-1 can access the last entry instead of representing absence.", "-1 可以访问最后一项，而不是表示不存在。"), ("The list is sorted.", "列表已排序。")], 1,
     ("Our sentinel convention and Python's indexing rule have different meanings.", "本例的哨兵约定与 Python 索引规则含义不同。")),
    (("What must an ordered-list abstraction retain?", "有序列表抽象必须保留什么？"),
     [("Meaningful order and accessible items.", "有意义的顺序和可访问的项目。"), ("The CPU model number.", "CPU 型号。"), ("The physical shelf colour.", "实体书架的颜色。")], 0,
     ("First-match search needs order and item equality, not those physical details.", "第一个匹配搜索需要顺序和项目比较，不需要这些物理细节。")),
]


def choose(pair, lang):
    return pair[lang]


def details(body, lang, cls="solution"):
    label = choose(("Worked solution", "完整解答"), lang)
    return f'<details class="{cls}"><summary>{label}</summary><div class="details-body"><p>{body}</p></div></details>'


def head(title, description, lang):
    language = "zh-CN" if lang else "en"
    return f'''{NOTICE}
<!DOCTYPE html><html lang="{language}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{escape(title)}</title><meta name="description" content="{escape(description, quote=True)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&amp;family=DM+Mono:wght@400;500&amp;family=DM+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css"></head>'''


def footer(lang):
    return '<footer class="site-footer">' + choose(("Created by", "作者"), lang) + ' Ran Wei · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></footer>'


def index(lang):
    zh = bool(lang)
    filename = "index_ZH.html" if zh else "index.html"
    other = "index.html" if zh else "index_ZH.html"
    suffix = "ZH" if zh else "EN"
    title = choose(("Computer Science Fundamentals", "计算机科学基础"), lang)
    lead = choose(("From a first algorithm to the systems that run it: a beginner-friendly path through programming, mathematics, data structures, architecture, operating systems, networks and databases.", "从第一个算法到运行它的系统：面向初学者，学习程序设计、数学、数据结构、体系结构、操作系统、网络与数据库。"), lang)
    how = choose(("Each module combines concepts and worked examples, a timed study plan, runnable Python labs, exercises with solutions and a self-check quiz. Selected interactive demonstrations make execution visible. Progress is saved in your browser and shared between language editions on the same browser and site.", "每个模块包含概念与示例、学习时间安排、可运行的 Python 实验、带解答的练习和自测。部分交互演示展示执行过程。进度保存在当前浏览器中，同一浏览器与站点中的两种语言共享进度。"), lang)
    prereq = choose(("No programming experience or university mathematics is assumed. We introduce the notation as needed. You need a browser, a text editor and Python 3.11 or later; Module 01 uses no third-party packages.", "无需编程经验或大学数学基础。必要的记法会随内容介绍。需要浏览器、文本编辑器与 Python 3.11 或更新版本；模块 01 不需要第三方包。"), lang)
    project = choose(("A small library catalogue connects the series: represent books, search and sort records, choose data structures, store data in SQLite and expose it through a local server. Other examples teach topics where the catalogue is a poor fit.", "一个小型图书目录贯穿课程：表示图书、搜索与排序、选择数据结构、用 SQLite 保存数据，并通过本地服务器提供访问。不适合目录项目的主题会使用其他例子。"), lang)
    availability = choose(("Module 01 is available in both languages. Modules 02–14 are planned; their cards describe the roadmap and do not link to unfinished lessons. Allow roughly 5–7 hours per module as the series develops.", "模块 01 已提供中英文版本。模块 02–14 处于计划阶段；卡片介绍路线，不会链接到未完成的课程。后续模块预计各需约 5–7 小时。"), lang)
    cards = []
    for module in PLAN["modules"]:
        available = module["status"] == "available"
        tag = f'a href="module_{module["number"]:02}_{suffix}.html"' if available else 'article'
        close = "a" if available else "article"
        status = choose(("Available · 5 h · 3 labs · 8 exercises", "已提供 · 5 小时 · 3 个实验 · 8 道练习"), lang) if available else choose(("Planned · approximately 5–7 h", "计划中 · 约 5–7 小时"), lang)
        cards.append(f'''<{tag} class="module-card{' planned' if not available else ''}">
<div class="card-num">{choose(("Module", "模块"), lang)} {module["number"]:02}</div>
<div class="card-title">{escape(module["title"][lang])}</div>
<div class="card-desc">{escape(module["topics"][lang])}</div>
<div class="card-status">{status}</div><div class="card-footer"><span class="card-theme theme-foundations">{choose(("Fundamentals", "基础"), lang)}</span><span class="card-lang">EN · 中文</span></div></{close}>''')
    page = head(title, lead, lang) + f'''<body class="index-page">
<a class="skip-link" href="#main">{choose(("Skip to content", "跳到正文"), lang)}</a>
<nav class="site-nav" aria-label="{choose(("Course navigation", "课程导航"), lang)}"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><span class="nav-crumb">{choose(("CS Series", "计算机科学系列"), lang)}</span><a class="lang-switch" href="{other}" hreflang="{'en' if zh else 'zh-CN'}">{'English' if zh else '中文'}</a></nav>
<main id="main" style="max-width:none;padding:0">
<div class="index-hero"><h1>{choose(("Computer Science <em>Fundamentals</em>", "计算机科学<em>基础</em>"), lang)}</h1><p class="lead">{lead}</p><div class="hero-tags"><span class="tag tag-module">{choose(("Beginner-friendly", "面向初学者"), lang)}</span><span class="tag tag-theme">{choose(("14-module roadmap", "14 个模块路线"), lang)}</span><span class="tag tag-time">EN / 中文</span></div></div>
<div class="index-body"><h2>{choose(("How the series works", "课程结构"), lang)}</h2><p>{how}</p><h2>{choose(("Before you start", "开始之前"), lang)}</h2><p>{prereq}</p><h2>{choose(("One project, many perspectives", "一个项目，多种视角"), lang)}</h2><p>{project}</p><h2 id="modules">{choose(("The modules", "课程模块"), lang)}</h2><p>{availability}</p></div>
<div class="index-grid">{''.join(cards)}</div></main>{footer(lang)}</body></html>'''
    (DEST / filename).write_text(page, encoding="utf-8")


def widget(lang):
    return f'''<div class="widget" id="search-trace"><h3>{choose(("Interactive: step through linear search", "交互演示：逐步执行线性搜索"), lang)}</h3>
<div class="trace-controls"><label>{choose(("Target", "目标"), lang)}<select><option>Dune</option><option>Foundation</option><option selected>The Hobbit</option><option>Solaris</option></select></label>
<label><span>{choose(("Catalogue", "目录"), lang)}</span><span><input type="checkbox"> {choose(("Use an empty list", "使用空列表"), lang)}</span></label>
<button type="button" data-action="step">{choose(("Next step", "下一步"), lang)}</button><button type="button" data-action="reset">{choose(("Reset", "重置"), lang)}</button></div>
<ol class="trace-items" aria-label="{choose(("Catalogue entries", "目录项目"), lang)}"></ol>
<p class="trace-status" role="status" aria-live="polite"></p><noscript><p>{choose(("Enable JavaScript to use this demonstration. The trace table above and Lab 1 show the same algorithm without it.", "启用 JavaScript 可使用演示。上方轨迹表和实验 1 展示相同算法，无需脚本。"), lang)}</p></noscript></div>'''


def exercise_html(lang):
    result = []
    for number, (stars, minutes, title, question, solution) in enumerate(EXERCISES, 1):
        answer = escape(solution[lang])
        if number == 7:
            code = 'def find_first_ascii_ignore_case(items, target):\n    for index, item in enumerate(items):\n        if item.lower() == target.lower():\n            return index\n    return -1\n\nassert find_first_ascii_ignore_case(["Dune"], "dune") == 0\nassert find_first_ascii_ignore_case([], "dune") == -1'
            answer += '</p><pre><code class="language-python">' + escape(code) + '</code></pre><p>'
        result.append(f'''<div class="exercise" id="e{number}"><div class="exercise-head"><span class="exercise-n">{choose(("Exercise", "练习"), lang)} {number} — {title[lang]}</span><span class="stars">{'★' * stars}</span><span class="exercise-time">{minutes} {choose(("min", "分钟"), lang)}</span></div><p>{escape(question[lang])}</p></div>{details(answer, lang)}''')
    return "\n".join(result)


def quiz_html(lang):
    questions, answers = [], []
    for number, (stem, options, answer, explanation) in enumerate(QUIZ, 1):
        buttons = ''.join(f'<li><button class="quiz-opt" type="button" data-i="{i}">{escape(option[lang])}</button></li>' for i, option in enumerate(options))
        questions.append(f'<div class="quiz-q" data-answer="{answer}"><div class="quiz-stem"><span class="quiz-n">{number}</span><p>{stem[lang]}</p></div><ol class="quiz-opts">{buttons}</ol><div class="quiz-expl" hidden>{explanation[lang]}</div></div>')
        answers.append(f'<li>{"ABC"[answer]} — {explanation[lang]}</li>')
    return '<div class="quiz">' + ''.join(questions) + f'<div class="quiz-bar"><span class="quiz-score" role="status" aria-live="polite"></span><button class="quiz-reset" type="button">{choose(("Reset quiz", "重置自测"), lang)}</button></div></div><details><summary>{choose(("Answer key", "答案表"), lang)}</summary><div class="details-body"><ol>{"".join(answers)}</ol></div></details>'


SESSIONS = [
    (("Questions and contracts", "问题与约定"), [("s1", 25, ("Read Sections 1–2 and answer their checks.", "阅读第 1–2 节并回答检查题。")), ("e1", 8, ("Exercise 1: specify counting.", "练习 1：规定计数问题。")), ("s3", 22, ("Read Section 3, predict and explore traces.", "阅读第 3 节，预测并探索轨迹。")), ("e2", 8, ("Exercise 2: trace duplicates.", "练习 2：跟踪重复值。")), ("s2", 12, ("Write the contract in your own words.", "用自己的话写出约定。"))]),
    (("Correctness and a first lab", "正确性与第一个实验"), [("s4", 18, ("Read Section 4 and answer its check.", "阅读第 4 节并回答检查题。")), ("setup", 15, ("Set up Python and explain the notation.", "准备 Python 并理解记法。")), ("lab1", 30, ("Run Lab 1 and all its variations.", "完成实验 1 及其变体。")), ("e5", 12, ("Exercise 5: explain the invariant.", "练习 5：解释不变式。"))]),
    (("Layers, tests and fault finding", "分层、测试与故障定位"), [("s5", 20, ("Read Section 5 and the misconceptions.", "阅读第 5 节与常见误解。")), ("lab2", 35, ("Run Lab 2, break it, then repair it.", "完成实验 2，制造错误，再修复。")), ("e3", 10, ("Exercise 3: an early return.", "练习 3：过早返回。")), ("e8", 10, ("Exercise 8: locate faults.", "练习 8：定位故障。"))]),
    (("Cost and review", "工作量与复习"), [("lab3", 35, ("Run Lab 3 and its variations.", "完成实验 3 及其变体。")), ("e4", 10, ("Exercise 4: exact counts.", "练习 4：精确计数。")), ("reading", 10, ("Read the selected Python documentation.", "阅读指定 Python 文档。")), ("quiz", 10, ("Complete the quiz and explain mistakes.", "完成自测并解释错题。")), ("summary", 10, ("Review from memory.", "凭记忆复习。"))]),
]


def study_plan(lang):
    cards = []
    for number, (title, activities) in enumerate(SESSIONS, 1):
        assert sum(activity[1] for activity in activities) == 75
        acts = ''.join(f'<li class="act act-read"><span class="act-what"><a href="#{anchor}">{text[lang]}</a></span><span class="act-min">{minutes}</span></li>' for anchor, minutes, text in activities)
        cards.append(f'<div class="session"><div class="session-head"><span class="session-n">{choose(("Session", "时段"), lang)} {number}</span><span class="session-min">75 {choose(("min", "分钟"), lang)}</span></div><div class="session-title">{title[lang]}</div><ul class="acts">{acts}</ul><label class="session-done"><input type="checkbox" data-key="cs-series:m01:s{number}"> {choose(("Done", "已完成"), lang)}</label></div>')
    return f'<section class="plan" id="plan"><div class="plan-head"><h2 class="plan-title">{choose(("Study plan", "学习计划"), lang)}</h2><span class="plan-total">5 {choose(("hours", "小时"), lang)}</span></div><p class="plan-lead">{choose(("Four sessions of 75 minutes. Times are estimates and include hands-on practice. Exercises 6–7 are optional extensions (25 extra minutes). Tick sessions to save progress in this browser.", "四个时段，每个 75 分钟。时间为估计，包含动手实践。练习 6–7 为可选拓展（额外 25 分钟）。勾选时段可在当前浏览器保存进度。"), lang)}</p><div class="sessions">{"".join(cards)}</div></section>'


def module(lang, labs):
    suffix = "ZH" if lang else "EN"
    other = "EN" if lang else "ZH"
    overview = "index_ZH.html" if lang else "index.html"
    title = choose(("Module 01: What is computation?", "模块 01：什么是计算？"), lang)
    lead = choose(("Turn a question into a contract, trace a search, explain why it works and count its work. Then locate that small computation within a running computer.", "把问题变成约定，跟踪搜索，解释为什么正确，并统计工作量；再把这次小计算放入计算机的运行层次中。"), lang)
    content = (SOURCE / f"module_01_{suffix}.html").read_text(encoding="utf-8")
    for number, (question, answer) in enumerate(CHECKS, 1):
        check = f'<div class="check"><div class="check-label">{choose(("Check your understanding", "检查理解"), lang)}</div><p>{question[lang]}</p></div>' + details(answer[lang], lang, "answer")
        content = content.replace("{{CHECK" + str(number) + "}}", check)
    for number, (filename, code, output) in enumerate(labs, 1):
        lab = f'<p><a href="labs/{filename}" download>{choose(("Download", "下载"), lang)} {filename}</a></p><pre><code class="language-python">{escape(code)}</code></pre><div class="output"><div class="output-label">{choose(("Captured output", "实际运行输出"), lang)}</div><pre><code class="language-text">{escape(output)}</code></pre></div>'
        content = content.replace("{{LAB" + str(number) + "}}", lab)
    content = content.replace("{{WIDGET}}", widget(lang)).replace("{{EXERCISES}}", exercise_html(lang)).replace("{{QUIZ}}", quiz_html(lang))
    content = re.sub(r'(<table>.*?</table>)', lambda m: '<div class="table-scroll" tabindex="0" role="region" aria-label="' + choose(("Data table", "数据表格"), lang) + '">' + m[0] + '</div>', content, flags=re.S)
    assert "{{" not in content
    sections = re.findall(r'<h2 id="([^"]+)">([^<]+)</h2>', content)
    def heading(match):
        anchor, text = match.groups()
        number = next(i for i, section in enumerate(sections, 1) if section[0] == anchor)
        return f'<span class="section-anchor" id="{anchor}"></span><div class="section-header" data-sec="{anchor}"><span class="section-num">{number}</span><h2>{text}</h2></div>'
    content = re.sub(r'<h2 id="([^"]+)">([^<]+)</h2>', heading, content)
    toc = ''.join(f'<a href="#{anchor}"><span class="num">{i}</span><span>{text}</span></a>' for i, (anchor, text) in enumerate(sections, 1))
    mobile_toc = ''.join(f'<a href="#{anchor}">{text}</a>' for anchor, text in sections)
    outcomes = choose(([
        "Distinguish a problem specification, an algorithm and a program.",
        "State a search contract including empty, absent and duplicate cases.",
        "Trace a linear search and explain its changing state.",
        "Explain correctness, termination and comparison counts separately.",
        "Recognise abstractions and the layers used to run a program."], [
        "区分问题规约、算法与程序。", "明确搜索约定，涵盖空列表、缺失目标与重复值。", "跟踪线性搜索并解释状态变化。", "分别解释正确性、终止性与比较次数。", "识别抽象与运行程序涉及的层次。"]), lang)
    before = choose(("No earlier module or programming experience. Read the small Python notation guide before the labs. You need a browser, a text editor and Python 3.11 or later. No third-party packages are used.", "无需先修模块或编程经验。实验前阅读简短的 Python 记法介绍。需要浏览器、文本编辑器与 Python 3.11 或更新版本，不使用第三方包。"), lang)
    page = head(title + " — " + choose(("Computer Science Fundamentals", "计算机科学基础"), lang), lead, lang) + f'''<body data-module="1">
<a class="skip-link" href="#main">{choose(("Skip to content", "跳到正文"), lang)}</a><div id="progress-bar"></div>
<header id="topbar"><a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span><a href="{overview}" class="crumb">{choose(("CS Series", "计算机科学系列"), lang)}</a><span class="sep">/</span><span class="crumb crumb-now">{choose(("Module 01", "模块 01"), lang)}</span>
<div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-expanded="false" aria-controls="module-menu">{choose(("Module 1 of 14", "模块 1 / 14"), lang)}</button><div class="dropdown-menu" id="module-menu"><a class="active" href="module_01_{suffix}.html" aria-current="page">{title}</a><a href="{overview}#modules">{choose(("Full roadmap — Modules 02–14 planned", "完整路线 — 模块 02–14 计划中"), lang)}</a></div></div><a class="lang-switch" href="module_01_{other}.html" hreflang="{'en' if lang else 'zh-CN'}">{'English' if lang else '中文'}</a></header>
<div id="layout"><aside id="sidebar"><div class="side-progress"><div class="side-progress-label">{choose(("Progress", "进度"), lang)}: <span class="side-progress-n">0</span>/4 {choose(("sessions done", "个时段已完成"), lang)}</div><div class="side-progress-bar"><span></span></div></div><div class="sidebar-label">{choose(("Contents", "目录"), lang)}</div><nav aria-label="{choose(("Contents", "目录"), lang)}">{toc}</nav></aside>
<main id="main"><div class="module-hero"><div class="series">{choose(("Computer Science Fundamentals", "计算机科学基础"), lang)} — Ran Wei</div><h1 class="module-title">{title}</h1><p class="module-lead">{lead}</p><div class="hero-chips"><span class="chip chip-time">{choose(("≈ 5 hours", "约 5 小时"), lang)}</span><span class="chip">{choose(("4 sessions", "4 个时段"), lang)}</span><span class="chip">{choose(("3 labs", "3 个实验"), lang)}</span><span class="chip">{choose(("8 exercises", "8 道练习"), lang)}</span><span class="chip">{choose(("8 quiz questions", "8 道自测题"), lang)}</span></div></div>
<section class="glance"><div class="glance-col"><h2 class="glance-h">{choose(("By the end you can", "完成后你能够"), lang)}</h2><ul class="outcomes">{''.join('<li>' + x + '</li>' for x in outcomes)}</ul></div><div class="glance-col"><h2 class="glance-h">{choose(("Before you start", "开始之前"), lang)}</h2><p>{before}</p></div></section>
<details class="mobile-toc"><summary>{choose(("Contents", "目录"), lang)}</summary><nav aria-label="{choose(("Mobile contents", "移动端目录"), lang)}">{mobile_toc}</nav></details>
{study_plan(lang)}<div class="content">{content}</div><div class="module-nav"><a href="{overview}">{choose(("← Course overview and roadmap", "← 课程概览与路线"), lang)}</a></div>{footer(lang)}</main></div>
<script src="../ai/assets/tutorial.js" defer></script><script src="assets/widgets.js" defer></script></body></html>'''
    (DEST / f"module_01_{suffix}.html").write_text(page, encoding="utf-8")


def main():
    (DEST / "labs").mkdir(parents=True, exist_ok=True)
    labs = []
    for path in sorted((SOURCE / "labs").glob("lab*.py")):
        output = subprocess.run([sys.executable, str(path)], check=True, text=True, capture_output=True).stdout
        labs.append((path.name, path.read_text(encoding="utf-8"), output))
        shutil.copyfile(path, DEST / "labs" / path.name)
    assert len(labs) == 3
    for lang in (0, 1):
        index(lang)
        module(lang, labs)
    print("Built 2 overview pages and 2 Module 01 pages; executed and copied 3 labs.")


if __name__ == "__main__":
    main()
