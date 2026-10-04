"""Shared renderer for Modules 02–14. Content lives in lessons/*.py."""
from html import escape
from pathlib import Path
import importlib.util
import re
import shutil
import subprocess
import sys


def load_lessons(source):
    lessons = {}
    for path in sorted((source / "lessons").glob("module_*.py")):
        spec = importlib.util.spec_from_file_location(path.stem, path)
        obj = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(obj)
        lessons[obj.LESSON["number"]] = obj.LESSON
    return lessons


def build_remaining(source, dest, plan, head, footer):
    lessons = load_lessons(source)
    assert set(lessons) == set(range(2, 15)), "All thirteen remaining lessons are required"
    count = 0
    for number, data in sorted(lessons.items()):
        assert len(data["sections"]) >= 5 and len(data["exercises"]) == 8 and len(data["quiz"]) == 6
        lab_outputs = []
        for lab in data["labs"]:
            path = source / "labs" / lab["file"]
            code = path.read_text(encoding="utf-8")
            result = subprocess.run([sys.executable, str(path)], cwd=source, capture_output=True, text=True,
                                    encoding="utf-8", env=None, timeout=30)
            if result.returncode:
                raise RuntimeError(f'{path.name}: {result.stderr}')
            shutil.copyfile(path, dest / "labs" / path.name)
            lab_outputs.append((code, result.stdout))
            count += 1
        for lang in (0, 1):
            render(number, data, lab_outputs, dest, plan, head, footer, lang)
    return count


def render(number, data, outputs, dest, plan, head, footer, lang):
    suffix, other = ("ZH", "EN") if lang else ("EN", "ZH")
    t = lambda en, zh: zh if lang else en
    overview = "index_ZH.html" if lang else "index.html"
    module_title = plan["modules"][number - 1]["title"][lang]
    title = f'{t("Module", "模块")} {number:02}: {module_title}'
    sections = []
    def section(anchor, label, body):
        sections.append((anchor, label))
        return f'<span class="section-anchor" id="{anchor}"></span><div class="section-header" data-sec="{anchor}"><span class="section-num">{len(sections)}</span><h2>{label}</h2></div>{body}'
    def solution(body, cls="solution"):
        return f'<details class="{cls}"><summary>{t("Worked solution", "完整解答")}</summary><div class="details-body">{body}</div></details>'
    content = ""
    for i, (label, body, question, answer) in enumerate(data["sections"], 1):
        content += section(f"s{i}", label[lang], body[lang] + f'<div class="check"><div class="check-label">{t("Check your understanding", "检查理解")}</div><p>{question[lang]}</p></div>' + solution(f'<p>{answer[lang]}</p>', "answer"))
    if number == 2:
        content += f'<div class="widget" id="bit-explorer"><h3>{t("Interactive: interpret one byte", "交互：解释一个字节")}</h3><div class="trace-controls"><label>{t("Unsigned value (0–255)", "无符号值（0–255）")}<input type="number" min="0" max="255" step="1" value="13"></label></div><p role="status" aria-live="polite"></p><noscript>{t("The binary lab provides the same conversions without JavaScript.", "无脚本可运行二进制实验完成同样转换。")}</noscript></div>'
    if number == 9:
        content += f'<div class="widget" id="cpu-explorer"><h3>{t("Interactive: execute the teaching CPU", "交互：执行教学 CPU")}</h3><p>SET 250 → ADD 10 → STORE 0 → HALT</p><div class="trace-controls"><button type="button" data-action="step">{t("Next instruction", "下一指令")}</button><button type="button" data-action="reset">{t("Reset", "重置")}</button></div><p role="status" aria-live="polite"></p><noscript>{t("The CPU lab shows the same execution trace without JavaScript.", "CPU 实验提供相同执行轨迹，无需脚本。")}</noscript></div>'
    pitfalls = ''.join(f'<li>{p[lang]}</li>' for p in data["pitfalls"])
    content += section("wrong", t("Common misconceptions", "常见误解"), f'<div class="callout pitfall"><ul>{pitfalls}</ul></div>')
    setup = t("Download each script and run it in a terminal with Python 3.11 or later: ", "下载脚本，在终端中使用 Python 3.11 或更新版本运行：")
    setup += f'<code>python {data["labs"][0]["file"]}</code>. '
    setup += t("On Windows, py -3 is an alternative; on some systems use python3. The labs use only the standard library. Predict the result before running, then complete the variations. Run without -O so assertions remain enabled. Outputs below were captured by the builder. Code and output are identical in both language editions.", "Windows 也可使用 py -3；部分系统使用 python3。实验仅用标准库。先预测结果，再运行并完成变体。不要使用 -O，以保留断言。下方输出由构建器实际运行捕获，两种语言使用相同代码与输出。")
    content += section("setup", t("Lab setup", "实验准备"), f'<p>{setup}</p>')
    for i, (lab, (code, output)) in enumerate(zip(data["labs"], outputs), 1):
        body = f'<p>{lab["intro"][lang]}</p><p><a href="labs/{lab["file"]}" download>{t("Download", "下载")} {lab["file"]}</a></p><pre><code class="language-python">{escape(code)}</code></pre><div class="output"><div class="output-label">{t("Captured output", "实际运行输出")}</div><pre><code class="language-text">{escape(output)}</code></pre></div>'
        body += lab["tasks"][lang] + solution(lab["solution"][lang])
        content += section(f"lab{i}", f'{t("Lab", "实验")} {i} — {lab["title"][lang]}', body)
    exercises = f'<p>{t("Try before opening the solution. ★ applies an idea; ★★ combines ideas; ★★★ asks for design or proof.", "先尝试，再展开解答。★ 应用概念；★★ 结合概念；★★★ 进行设计或证明。")}</p>'
    for i, (difficulty, title_pair, question, answer) in enumerate(data["exercises"], 1):
        exercises += f'<div class="exercise" id="e{i}"><div class="exercise-head"><span class="exercise-n">{t("Exercise", "练习")} {i} — {title_pair[lang]}</span><span class="stars">{"★" * difficulty}</span></div><p>{question[lang]}</p></div>' + solution(answer[lang])
    content += section("exercises", t("Exercises with worked solutions", "练习与完整解答"), exercises)
    quiz, key = [], []
    for i, (question, options, answer, explanation) in enumerate(data["quiz"], 1):
        buttons = ''.join(f'<li><button class="quiz-opt" type="button" data-i="{j}">{option[lang]}</button></li>' for j, option in enumerate(options))
        quiz.append(f'<div class="quiz-q" data-answer="{answer}"><div class="quiz-stem"><span class="quiz-n">{i}</span><p>{question[lang]}</p></div><ol class="quiz-opts">{buttons}</ol><div class="quiz-expl" hidden>{explanation[lang]}</div></div>')
        key.append(f'<li>{"ABC"[answer]} — {explanation[lang]}</li>')
    quiz_body = f'<p>{t("Choose an answer for feedback; reset to retry. A text answer key is available without JavaScript.", "选择答案查看反馈，重置后可重做。无需 JavaScript 也可阅读答案表。")}</p><div class="quiz">{"".join(quiz)}<div class="quiz-bar"><span class="quiz-score" role="status" aria-live="polite"></span><button class="quiz-reset" type="button">{t("Reset quiz", "重置自测")}</button></div></div><details><summary>{t("Answer key", "答案表")}</summary><div class="details-body"><ol>{"".join(key)}</ol></div></details>'
    content += section("quiz", t("Self-check quiz", "自测"), quiz_body)
    reading = ''.join(f'<li><a href="{url}">{label[lang]}</a> — {task[lang]}</li>' for label, url, task in data["reading"])
    content += section("reading", t("Guided reading", "引导阅读"), f'<ul>{reading}</ul>')
    content += section("summary", t("Review and the next step", "复习与下一步"), data["review"][lang])
    terms = ''.join(f'<tr><td>{term[lang]}</td><td>{definition[lang]}</td></tr>' for term, definition in data["terms"])
    content += section("terms", t("Key terms", "关键术语"), f'<table><thead><tr><th>{t("Term", "术语")}</th><th>{t("Meaning", "含义")}</th></tr></thead><tbody>{terms}</tbody></table>')
    content = re.sub(r'(<table>.*?</table>)', lambda m: f'<div class="table-scroll" tabindex="0" role="region" aria-label="{t("Data table", "数据表格")}">{m[0]}</div>', content, flags=re.S)
    toc = ''.join(f'<a href="#{anchor}"><span class="num">{i}</span><span>{label}</span></a>' for i, (anchor, label) in enumerate(sections, 1))
    mobile = ''.join(f'<a href="#{anchor}">{label}</a>' for anchor, label in sections)
    menu = ''.join(f'<a href="module_{m["number"]:02}_{suffix}.html"' + (' class="active" aria-current="page"' if m["number"] == number else '') + f'>{m["number"]:02} — {m["title"][lang]}</a>' for m in plan["modules"])
    prereqs = ', '.join(f'<a href="module_{p:02}_{suffix}.html">{p:02}</a>' for p in data["prereqs"])
    outcomes = ''.join(f'<li>{outcome[lang]}</li>' for outcome in data["outcomes"])
    schedules = [
        (t("Concepts and worked examples", "概念与示例"), [("s1", 40, t("Read Sections 1–3 and answer the checks", "阅读第 1–3 节并回答检查题")), ("e1", 35, t("Exercises 1–3; justify every answer", "完成练习 1–3，说明理由"))]),
        (t("Build and investigate", "构建与探究"), [("s4", 25, t("Read Sections 4–5 and misconceptions", "阅读第 4–5 节与常见误解")), ("lab1", 50, t("Lab 1, predictions and variations", "实验 1、预测与变体"))]),
        (t("Apply and extend", "应用与拓展"), [("lab2", 50, t("Lab 2 and its variations", "实验 2 及变体")), ("e4", 25, t("Exercises 4–5", "完成练习 4–5"))]),
        (t("Reason and review", "推理与复习"), [("e6", 35, t("Exercises 6–8", "完成练习 6–8")), ("reading", 15, t("Guided reading", "引导阅读")), ("quiz", 15, t("Quiz and explain mistakes", "自测并解释错题")), ("summary", 10, t("Review from memory", "凭记忆复习"))]),
    ]
    cards = []
    for i, (label, activities) in enumerate(schedules, 1):
        assert sum(a[1] for a in activities) == 75
        acts = ''.join(f'<li class="act act-read"><span class="act-what"><a href="#{a}">{text}</a></span><span class="act-min">{minutes}</span></li>' for a, minutes, text in activities)
        cards.append(f'<div class="session"><div class="session-head"><span class="session-n">{t("Session", "时段")} {i}</span><span class="session-min">75 {t("min", "分钟")}</span></div><div class="session-title">{label}</div><ul class="acts">{acts}</ul><label class="session-done"><input type="checkbox" data-key="cs-series:m{number:02}:s{i}"> {t("Done", "已完成")}</label></div>')
    study = f'<section class="plan" id="plan"><div class="plan-head"><h2 class="plan-title">{t("Study plan", "学习计划")}</h2><span class="plan-total">5 {t("hours", "小时")}</span></div><p class="plan-lead">{t("Four 75-minute sessions including practice. Allow longer for extensions or unfamiliar prerequisites. Progress is saved locally and shared between language editions.", "四个 75 分钟时段，包含练习。拓展任务或不熟悉的先修知识可能需要更多时间。进度本地保存，两种语言共享。")}</p><div class="sessions">{"".join(cards)}</div></section>'
    prev = f'<a href="module_{number-1:02}_{suffix}.html">← {t("Previous module", "上一模块")}</a>'
    next_link = f'<a href="module_{number+1:02}_{suffix}.html">{t("Next module", "下一模块")} →</a>' if number < 14 else f'<a href="{overview}">{t("Course overview", "课程概览")}</a>'
    page = head(title, data["lead"][lang], lang) + f'''<body data-module="{number}"><a class="skip-link" href="#main">{t("Skip to content", "跳到正文")}</a><div id="progress-bar"></div>
<header id="topbar"><a class="brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="sep">/</span><a class="crumb" href="{overview}">{t("CS Series", "计算机科学系列")}</a><span class="sep">/</span><span class="crumb crumb-now">{number:02}</span><div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-expanded="false" aria-controls="module-menu">{t(f"Module {number} of 14", f"模块 {number} / 14")}</button><div class="dropdown-menu" id="module-menu">{menu}</div></div><a class="lang-switch" href="module_{number:02}_{other}.html" hreflang="{t('zh-CN', 'en')}">{t("中文", "English")}</a></header>
<div id="layout"><aside id="sidebar"><div class="side-progress"><div class="side-progress-label">{t("Progress", "进度")}: <span class="side-progress-n">0</span>/4</div><div class="side-progress-bar"><span></span></div></div><div class="sidebar-label">{t("Contents", "目录")}</div><nav aria-label="{t("Contents", "目录")}">{toc}</nav></aside>
<main id="main"><div class="module-hero"><div class="series">{t("Computer Science Fundamentals", "计算机科学基础")} — Ran Wei</div><h1 class="module-title">{title}</h1><p class="module-lead">{data["lead"][lang]}</p><div class="hero-chips"><span class="chip chip-time">{t("≈ 5 hours", "约 5 小时")}</span><span class="chip">{t("4 sessions", "4 个时段")}</span><span class="chip">{len(data["labs"])} {t("labs", "个实验")}</span><span class="chip">8 {t("exercises", "道练习")}</span><span class="chip">6 {t("quiz questions", "道自测题")}</span></div></div>
<section class="glance"><div class="glance-col"><h2 class="glance-h">{t("By the end you can", "完成后你能够")}</h2><ul class="outcomes">{outcomes}</ul></div><div class="glance-col"><h2 class="glance-h">{t("Before you start", "开始之前")}</h2><p>{t("Recommended modules", "建议先修模块")}: {prereqs}.</p><p>{data["before"][lang]}</p></div></section><details class="mobile-toc"><summary>{t("Contents", "目录")}</summary><nav aria-label="{t("Mobile contents", "移动端目录")}">{mobile}</nav></details>{study}<div class="content">{content}</div><div class="module-nav">{prev}{next_link}</div>{footer(lang)}</main></div>
<script src="../ai/assets/tutorial.js" defer></script><script src="assets/widgets.js" defer></script><script src="assets/series-widgets.js" defer></script></body></html>'''
    (dest / f"module_{number:02}_{suffix}.html").write_text(page, encoding="utf-8")
