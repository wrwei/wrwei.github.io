"""Draw the Git series' figures in English and Chinese.

    python3 -I src/figures/_gen/figs.py            all figures, both languages
    python3 -I src/figures/_gen/figs.py fig-05-2   one figure

Writes src/figures/<lang>/<id>.svg. One style for all figures: the series' colours, DM Sans
(with CJK fallbacks) for text, DM Mono for commands and hashes. Hashes shown in a figure come
from the lesson's own replayed output, so figure and text agree.
"""
import os
import re
import sys
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
FIGS = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(FIGS))

C = dict(navy='#1A2E4A', blue='#2563EB', sky='#0EA5E9', skyl='#DBEAFE', skyp='#F0F9FF', slate='#475569',
         muted='#94A3B8', border='#CBD5E1', bg='#F8FAFC', white='#FFFFFF', green='#15803D', greenl='#DCFCE7',
         greenp='#F0FDF4', orange='#C2410C', orangep='#FFF7ED', red='#DC2626', redl='#FEE2E2', redp='#FEF2F2',
         amber='#B45309', amberp='#FFFBEB', purple='#6D28D9', purplep='#F5F3FF', indigo='#4338CA', indigop='#EEF2FF',
         term='#111827', termtext='#E5E7EB')
SANS = "'DM Sans', system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif"
MONO = "'DM Mono', Consolas, 'SFMono-Regular', Menlo, 'PingFang SC', 'Microsoft YaHei', monospace"


# ---------------------------------------------------------------- primitives

class SVG:
    def __init__(self, w, h, title):
        self.w, self.h, self.title = w, h, title
        self.items = []

    def add(self, s):
        self.items.append(s)

    def rect(self, x, y, w, h, fill=C['white'], stroke=C['border'], r=10, sw=1.5, dash=None, extra=''):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}{extra}/>')

    def text(self, x, y, s, size=13, fill=C['navy'], weight=400, anchor='start', mono=False, italic=False, extra=''):
        fam = MONO if mono else SANS
        it = ' font-style="italic"' if italic else ''
        self.add(f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{it}{extra}>{escape(s)}</text>')

    def lines(self, x, y, rows, size=13, gap=None, **kw):
        gap = gap or round(size * 1.45)
        for i, r in enumerate(rows):
            self.text(x, y + i * gap, r, size=size, **kw)

    def line(self, x1, y1, x2, y2, stroke=C['slate'], sw=2, dash=None, arrow=False, color=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        m = f' marker-end="url(#ah-{(color or stroke).lstrip("#")})"' if arrow else ''
        self.add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{d}{m}/>')

    def path(self, d, stroke=C['slate'], sw=2, fill='none', dash=None, arrow=False):
        da = f' stroke-dasharray="{dash}"' if dash else ''
        m = f' marker-end="url(#ah-{stroke.lstrip("#")})"' if arrow else ''
        self.add(f'<path d="{d}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}"{da}{m}/>')

    def circle(self, x, y, r=11, fill=C['white'], stroke=C['navy'], sw=2.5):
        self.add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def pill(self, x, y, s, kind='branch', size=12, anchor='middle'):
        """A label like Git's: branch (green), head (blue), remote (red), plain (grey)."""
        fill, stroke, col = {'branch': (C['greenl'], C['green'], C['green']), 'head': (C['skyl'], C['blue'], C['blue']),
                             'remote': (C['redp'], C['red'], C['red']), 'plain': (C['bg'], C['border'], C['slate']),
                             'cmd': (C['term'], C['term'], C['termtext'])}[kind]
        w = max(34, round(len(s) * size * 0.62 + 16))
        x0 = x - w / 2 if anchor == 'middle' else x
        self.rect(x0, y - size - 4, w, size + 10, fill=fill, stroke=stroke, r=(size + 10) / 2, sw=1.4)
        self.text(x0 + w / 2, y + 1, s, size=size, fill=col, weight=600, anchor='middle', mono=True)
        return w

    def svg(self):
        colours = sorted({re.search(r'url\(#ah-([0-9A-Fa-f]+)\)', i).group(1) for i in self.items if 'url(#ah-' in i})
        marks = ''.join(f'<marker id="ah-{c}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#{c}"/></marker>' for c in colours)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" height="{self.h}" role="img">'
                f'<title>{escape(self.title)}</title><defs>{marks}</defs>' + ''.join(self.items) + '</svg>\n')


def commit_chain(s, xs, y, labels=(), r=11, fill=C['white'], stroke=C['navy'], gap_line=C['slate']):
    for a, b in zip(xs, xs[1:]):
        s.line(a + r, y, b - r, y, stroke=gap_line, sw=2.2)
    for x in xs:
        s.circle(x, y, r, fill=fill, stroke=stroke)
    for x, t in zip(xs, labels):
        if t:
            s.text(x, y + r + 18, t, size=11.5, fill=C['slate'], anchor='middle', mono=True)


def lesson_hashes(lesson, command):
    """Short hashes and messages from a replayed `git log --oneline` block in a lesson."""
    text = open(os.path.join(ROOT, 'src', 'en', lesson), encoding='utf-8').read()
    block = text.split('$ ' + command + '\n', 1)[1].split('```', 1)[0]
    out = []
    for ln in block.strip().split('\n'):
        m = re.match(r'^([0-9a-f]{7}) (?:\([^)]*\) )?(.*)$', ln)
        if m:
            out.append((m.group(1), m.group(2)))
    return out

# ---------------------------------------------------------------- figures


def fig_01_1(L):
    T = {'en': dict(title='Copies of a file against a history of snapshots', no='Without Git', yes='With Git',
                    files=['report.docx', 'report-final.docx', 'report-final-2.docx', 'report-final-REALLY.docx', 'report-final-REALLY-v3 (2).docx'],
                    q=['Which one is the latest?', 'What changed, and why?'],
                    one='report.docx', commits=['Add the introduction', 'Fix the figures', 'Add the results', 'Shorten the summary'],
                    when=['Mon 10:14', 'Tue 16:02', 'Wed 09:40', 'Thu 11:05'], note=['One file. Every version kept,', 'with who, when and why.']),
         'zh': dict(title='一堆文件副本与一份快照历史', no='没有 Git', yes='使用 Git',
                    files=['报告.docx', '报告-最终版.docx', '报告-最终版-2.docx', '报告-最终版-真的.docx', '报告-最终版-真的-v3 (2).docx'],
                    q=['哪个才是最新的？', '改了什么，为什么改？'],
                    one='报告.docx', commits=['添加引言', '修正插图', '添加结果', '精简摘要'],
                    when=['周一 10:14', '周二 16:02', '周三 09:40', '周四 11:05'], note=['只有一个文件。每个版本都保留，', '并记录是谁、何时、为什么修改。'])}[L]
    s = SVG(760, 340, T['title'])
    for x0, title, col in ((20, T['no'], C['orange']), (400, T['yes'], C['green'])):
        s.text(x0 + 170, 30, title, size=16, weight=700, fill=col, anchor='middle')
        s.rect(x0, 46, 340, 280, fill=C['bg'], stroke=C['border'], r=14)
    for i, f in enumerate(T['files']):
        y = 80 + i * 38
        s.add(f'<path d="M44 {y - 15}h14l6 6v18h-20z" fill="{C["white"]}" stroke="{C["slate"]}" stroke-width="1.4"/>')
        s.text(74, y, f, size=13, fill=C['navy'], mono=True)
    s.lines(40, 286, T['q'], size=13, fill=C['orange'], weight=600)
    s.add(f'<path d="M424 65h14l6 6v18h-20z" fill="{C["white"]}" stroke="{C["slate"]}" stroke-width="1.4"/>')
    s.text(454, 82, T['one'], size=13, mono=True)
    s.line(440, 112, 440, 246, stroke=C['blue'], sw=2.5)
    for i, (m, w) in enumerate(zip(T['commits'], T['when'])):
        y = 112 + i * 44
        s.circle(440, y, 8, fill=C['blue'], stroke=C['blue'], sw=2)
        s.text(460, y + 4.5, m, size=13, weight=600)
        s.text(724, y + 4.5, w, size=11.5, fill=C['muted'], anchor='end', mono=True)
    s.lines(420, 286, T['note'], size=13, fill=C['green'], weight=600)
    return s


def fig_01_2(L):
    T = {'en': dict(title='Git on your computer, GitHub on the internet', me='Your computer', me2='Git keeps the history here',
                    gh='GitHub', gh2='a copy of the same history, online', push='git push', push2='sends your new commits',
                    pull='git pull', pull2='brings new commits back'),
         'zh': dict(title='Git 在你的电脑上，GitHub 在互联网上', me='你的电脑', me2='Git 在这里保存历史',
                    gh='GitHub', gh2='同一份历史的在线副本', push='git push', push2='发送你的新提交',
                    pull='git pull', pull2='取回新的提交')}[L]
    s = SVG(760, 290, T['title'])
    s.rect(20, 30, 270, 230, fill=C['skyp'], stroke=C['sky'], r=16)
    s.text(155, 62, T['me'], size=16, weight=700, anchor='middle')
    s.text(155, 84, T['me2'], size=12.5, fill=C['slate'], anchor='middle')
    s.rect(470, 30, 270, 230, fill=C['indigop'], stroke=C['indigo'], r=16)
    s.text(605, 62, T['gh'], size=16, weight=700, anchor='middle', fill=C['indigo'])
    s.text(605, 84, T['gh2'], size=12.5, fill=C['slate'], anchor='middle')
    for x0 in (20, 470):
        s.text(x0 + 135, 132, 'my-page', size=13, mono=True, anchor='middle', fill=C['slate'])
        commit_chain(s, [x0 + 45, x0 + 105, x0 + 165, x0 + 225], 170)
    s.line(300, 128, 458, 128, stroke=C['green'], sw=3, arrow=True)
    s.text(379, 116, T['push'], size=13.5, weight=600, mono=True, anchor='middle', fill=C['green'])
    s.text(379, 148, T['push2'], size=11.5, anchor='middle', fill=C['slate'])
    s.line(460, 212, 302, 212, stroke=C['blue'], sw=3, arrow=True)
    s.text(381, 200, T['pull'], size=13.5, weight=600, mono=True, anchor='middle', fill=C['blue'])
    s.text(381, 232, T['pull2'], size=11.5, anchor='middle', fill=C['slate'])
    return s


def fig_03_1(L):
    T = {'en': dict(title='The three areas: working folder, staging area, repository',
                    cols=[('Working folder', 'your files, as you edit them'), ('Staging area', 'what goes into the next commit'),
                          ('Repository (.git)', 'every commit you made')],
                    states=['new or changed', 'ready to commit', 'a commit'], status='git status shows what is in each place'),
         'zh': dict(title='三个区域：工作文件夹、暂存区、仓库',
                    cols=[('工作文件夹', '你正在编辑的文件'), ('暂存区', '为下一次提交选定的改动'), ('仓库（.git）', '你做过的每一个提交')],
                    states=['新建或修改', '准备提交', '一个提交'], status='git status 显示每个地方现在有什么')}[L]
    s = SVG(780, 300, T['title'])
    xs = [20, 295, 570]
    fills = [(C['bg'], C['border']), (C['amberp'], '#FCD34D'), (C['greenp'], '#86EFAC')]
    for x, (t, sub_), (f, st) in zip(xs, T['cols'], fills):
        s.rect(x, 30, 190, 200, fill=f, stroke=st, r=14)
        s.text(x + 95, 62, t, size=15.5, weight=700, anchor='middle')
        s.text(x + 95, 84, sub_, size=12, fill=C['slate'], anchor='middle')
    for i, (x, st) in enumerate(zip(xs, T['states'])):
        if i < 2:
            col = C['red'] if i == 0 else C['green']
            s.rect(x + 25, 118, 140, 40, fill=C['white'], stroke=col, r=8, sw=1.6)
            s.text(x + 95, 143, 'index.html', size=13, mono=True, anchor='middle', fill=col, weight=600)
        else:
            s.circle(x + 30, 138, 11, fill=C['white'], stroke=C['navy'])
            s.text(x + 50, 133, 'c50e3a0', size=12, mono=True, fill=C['blue'], weight=600)
            s.text(x + 50, 150, 'Add my first web page', size=11.5, fill=C['navy'])
        s.text(x + 95, 196, st, size=12, fill=C['slate'], anchor='middle', italic=True)
    s.line(214, 138, 290, 138, stroke=C['amber'], sw=2.6, arrow=True)
    s.text(252, 126, 'git add', size=12.5, mono=True, weight=700, anchor='middle', fill=C['amber'])
    s.line(489, 138, 565, 138, stroke=C['green'], sw=2.6, arrow=True)
    s.text(527, 126, 'git commit', size=12.5, mono=True, weight=700, anchor='middle', fill=C['green'])
    s.path('M30 250 v12 h720 v-12', stroke=C['muted'], sw=1.5)
    s.text(390, 286, T['status'], size=13, fill=C['slate'], anchor='middle')
    return s


def fig_04_1(L):
    commits = list(reversed(lesson_hashes('lesson_04.md', 'git log --oneline')))  # oldest first
    T = {'en': dict(title='A chain of commits', old='older', new='newer', snap='Each commit is a full snapshot of the project, and points back to the one before.'),
         'zh': dict(title='一串提交', old='较早', new='较新', snap='每个提交都是整个项目的完整快照，并指向它的前一个提交。')}[L]
    s = SVG(760, 270, T['title'])
    xs = [30, 275, 520]
    for i, ((h, m), x) in enumerate(zip(commits, xs)):
        s.rect(x, 96, 210, 84, fill=C['white'], stroke=C['navy'], r=12, sw=2)
        s.text(x + 16, 124, h, size=14, mono=True, weight=600, fill=C['blue'])
        words, row, rows = m.split(), '', []
        for w in words:
            if len(row) + len(w) > 26:
                rows.append(row.strip()); row = ''
            row += w + ' '
        rows.append(row.strip())
        s.lines(x + 16, 146, rows, size=12.5, gap=17, fill=C['slate'])
        if i:
            s.line(x - 2, 138, xs[i - 1] + 214, 138, stroke=C['slate'], sw=2.2, arrow=True)
    s.pill(625, 62, 'main', 'branch', size=13)
    s.line(625, 70, 625, 92, stroke=C['green'], sw=2, arrow=True)
    s.pill(705, 62, 'HEAD', 'head', size=13)
    s.line(684, 57, 660, 57, stroke=C['blue'], sw=2, arrow=True)
    s.line(60, 208, 700, 208, stroke=C['muted'], sw=1.5, arrow=True)
    s.text(60, 228, T['old'], size=12, fill=C['muted'])
    s.text(700, 228, T['new'], size=12, fill=C['muted'], anchor='end')
    s.text(380, 256, T['snap'], size=13, fill=C['slate'], anchor='middle')
    return s


def lesson_output(lesson, command):
    """The output lines of the first replayed `$ command` in a lesson."""
    text = open(os.path.join(ROOT, 'src', 'en', lesson), encoding='utf-8').read()
    block = text.split('$ ' + command + '\n', 1)[1].split('```', 1)[0]
    return block.rstrip('\n').split('\n')


def fig_04_2(L):
    # The diff the reader has just made in Lesson 4, read from the lesson, so the two always agree.
    rows = lesson_output('lesson_04.md', 'git diff')
    at = next(i for i, r in enumerate(rows) if r.startswith('@@'))
    line = re.match(r'@@ -(\d+)', rows[at]).group(1)
    added = [i for i, r in enumerate(rows) if r.startswith('+') and i > at]
    T = {'en': dict(title='How to read git diff', file='which file', where=f'where: around line {line}', ctx='unchanged lines, to show where',
                    add='an added line (+, green)', after='unchanged', rem='A removed line would start with − and be red.'),
         'zh': dict(title='如何阅读 git diff', file='哪个文件', where=f'位置：大约第 {line} 行', ctx='未改动的行，用来定位',
                    add='添加的行（+，绿色）', after='未改动', rem='删除的行以 − 开头，显示为红色。')}[L]
    notes = [(0, at - 1, T['file']), (at, at, T['where']), (at + 1, added[0] - 1, T['ctx'])]
    notes += [(i, i, T['add']) for i in added]
    if added[-1] + 1 < len(rows):
        notes.append((added[-1] + 1, len(rows) - 1, T['after']))
    h = 52 + len(rows) * 26 + 40
    s = SVG(760, h, T['title'])
    s.rect(20, 20, 450, len(rows) * 26 + 20, fill=C['term'], stroke=C['term'], r=12)
    for i, r in enumerate(rows):
        col = '#F3F4F6' if i < at else '#22D3EE' if i == at else '#F87171' if r.startswith('-') else '#4ADE80' if r.startswith('+') else '#D1D5DB'
        s.text(36, 52 + i * 26, r, size=12.5, mono=True, fill=col, weight=600 if i < at else 400, extra=' xml:space="preserve"')
    for a, b, note in notes:
        y1, y2 = 52 + a * 26 - 13, 52 + b * 26 + 5
        col = C['green'] if note == T['add'] else C['slate']
        s.path(f'M480 {y1} h8 v{y2 - y1} h-8', stroke=col, sw=1.6)
        s.text(498, (y1 + y2) / 2 + 4.5, note, size=13, fill=col, weight=600 if col != C['slate'] else 400)
    s.text(20, h - 16, T['rem'], size=12.5, fill=C['red'])
    return s


def fig_05_1(L):
    T = {'en': dict(title='A branch is a label on a commit', r1='1   git switch -c dark-theme', r2='2   git commit, on dark-theme',
                    msgs=['first page', 'a sentence', 'colours', 'dark theme'], note='main stays where it was'),
         'zh': dict(title='分支是贴在提交上的标签', r1='1   git switch -c dark-theme', r2='2   在 dark-theme 上 git commit',
                    msgs=['第一个页面', '一句介绍', '颜色', '深色主题'], note='main 停在原处')}[L]
    s = SVG(760, 360, T['title'])
    for y0, title in ((26, T['r1']), (196, T['r2'])):
        s.rect(20, y0, 720, 150, fill=C['bg'], stroke=C['border'], r=14)
        s.text(40, y0 + 26, title, size=13.5, weight=700, mono=True)
    xs = [120, 250, 380, 510]
    commit_chain(s, xs[:3], 136, T['msgs'][:3])
    s.pill(380, 84, 'main', 'branch')
    s.pill(470, 84, 'dark-theme', 'branch')
    s.line(380, 90, 380, 120, stroke=C['green'], sw=2, arrow=True)
    s.path('M470 90 Q470 110 392 126', stroke=C['green'], sw=2, arrow=True)
    s.pill(590, 84, 'HEAD', 'head')
    s.line(568, 80, 528, 80, stroke=C['blue'], sw=2, arrow=True)
    commit_chain(s, xs, 306, T['msgs'])
    s.circle(510, 306, 11, fill=C['greenl'], stroke=C['green'])
    s.pill(380, 254, 'main', 'branch')
    s.line(380, 260, 380, 290, stroke=C['green'], sw=2, arrow=True)
    s.pill(510, 254, 'dark-theme', 'branch')
    s.line(510, 260, 510, 290, stroke=C['green'], sw=2, arrow=True)
    s.pill(630, 254, 'HEAD', 'head')
    s.line(608, 250, 562, 250, stroke=C['blue'], sw=2, arrow=True)
    s.text(380, 234, T['note'], size=12, fill=C['muted'], anchor='middle', italic=True)
    return s


def fig_05_2(L):
    T = {'en': dict(title='Fast-forward merge and merge commit', ff='Fast-forward', ff2='only the label moves', mc='Merge commit',
                    mc2='a new commit joins the two lines', before='before', after='after the merge'),
         'zh': dict(title='快进合并与合并提交', ff='快进（fast-forward）', ff2='只移动标签', mc='合并提交',
                    mc2='用一个新提交连接两条线', before='合并前', after='合并后')}[L]
    s = SVG(760, 300, T['title'])
    s.rect(20, 20, 345, 260, fill=C['bg'], stroke=C['border'], r=14)
    s.rect(395, 20, 345, 260, fill=C['bg'], stroke=C['border'], r=14)
    s.text(192, 48, T['ff'], size=15, weight=700, anchor='middle')
    s.text(192, 68, T['ff2'], size=12.5, fill=C['slate'], anchor='middle')
    s.text(567, 48, T['mc'], size=15, weight=700, anchor='middle')
    s.text(567, 68, T['mc2'], size=12.5, fill=C['slate'], anchor='middle')
    # fast-forward: A - B - C ; main moves from B to C
    commit_chain(s, [70, 160, 250], 190)
    s.pill(160, 132, 'main', 'plain')
    s.text(160, 108, T['before'], size=11, fill=C['muted'], anchor='middle', italic=True)
    s.line(160, 138, 160, 174, stroke=C['muted'], sw=1.8, dash='4 3', arrow=True, color=C['muted'])
    s.pill(250, 132, 'main', 'branch')
    s.text(250, 108, T['after'], size=11, fill=C['green'], anchor='middle', italic=True)
    s.line(250, 138, 250, 174, stroke=C['green'], sw=2, arrow=True)
    s.path('M180 132 Q205 118 222 128', stroke=C['green'], sw=1.8, arrow=True)
    s.pill(250, 238, 'dark-theme', 'branch', size=11.5)
    s.line(250, 224, 250, 205, stroke=C['green'], sw=1.8, arrow=True)
    # merge commit: B -> C (main), B -> D (branch), M joins C and D
    s.line(456, 190, 524, 150, stroke=C['slate'], sw=2.2)
    s.line(456, 190, 524, 230, stroke=C['slate'], sw=2.2)
    s.line(546, 150, 614, 186, stroke=C['slate'], sw=2.2)
    s.line(546, 230, 614, 194, stroke=C['slate'], sw=2.2)
    s.circle(445, 190)
    s.circle(535, 150)
    s.circle(535, 230)
    s.circle(625, 190, 13, fill=C['greenl'], stroke=C['green'])
    s.pill(625, 132, 'main', 'branch')
    s.line(625, 138, 625, 172, stroke=C['green'], sw=2, arrow=True)
    s.pill(535, 268, 'add-hobbies', 'plain', size=11.5)
    s.line(535, 254, 535, 245, stroke=C['muted'], sw=1.8)
    return s


def fig_06_1(L):
    T = {'en': dict(title='Anatomy of a merge conflict', notes=['start of the conflict', 'your version: HEAD, the branch you are on (main)',
                                                                 'the divider', 'the incoming version (from new-heading)', 'end of the conflict'],
                    keep='Keep the text you want, then delete the three marker lines.'),
         'zh': dict(title='合并冲突的结构', notes=['冲突开始', '你的版本：HEAD，即你所在的分支（main）', '分隔线',
                                              '传入的版本（来自 new-heading）', '冲突结束'],
                    keep='保留你想要的文字，然后删除三行标记。')}[L]
    rows = [('<body>', None), ('<<<<<<< HEAD', 'mark'), ('  <h1>Hello and welcome!</h1>', 'ours'), ('=======', 'mark'),
            ('  <h1>Welcome to my page!</h1>', 'theirs'), ('>>>>>>> new-heading', 'mark'), ('  <p>This is my first web page.</p>', None)]
    s = SVG(760, 300, T['title'])
    s.rect(20, 20, 360, 232, fill=C['white'], stroke=C['border'], r=12)
    bg = {'mark': C['redl'], 'ours': C['skyl'], 'theirs': C['greenl']}
    for i, (r, k) in enumerate(rows):
        y = 50 + i * 28
        if k:
            s.rect(22, y - 18, 356, 26, fill=bg[k], stroke='none', r=0, sw=0)
        s.text(36, y, r, size=13, mono=True, fill='#991B1B' if k == 'mark' else C['navy'], weight=700 if k == 'mark' else 400,
               extra=' xml:space="preserve"')
    targets = [1, 2, 3, 4, 5]
    cols = [C['red'], C['blue'], C['red'], C['green'], C['red']]
    for t, note, col in zip(targets, T['notes'], cols):
        y = 50 + t * 28 - 4
        s.line(386, y, 410, y, stroke=col, sw=1.6)
        s.text(418, y + 4.5, note, size=13, fill=col, weight=600)
    s.text(20, 284, T['keep'], size=13.5, fill=C['navy'], weight=600)
    return s


def fig_07_1(L):
    T = {'en': dict(title='Your repository and its copy on GitHub', me='Your computer', gh='GitHub: your-username/my-page',
                    note='your note of where main is on GitHub', push='git push', push2='sends the commits GitHub does not have',
                    origin='origin = https://github.com/your-username/my-page.git'),
         'zh': dict(title='你的仓库与它在 GitHub 上的副本', me='你的电脑', gh='GitHub：your-username/my-page',
                    note='你对 GitHub 上 main 位置的记录', push='git push', push2='发送 GitHub 还没有的提交',
                    origin='origin = https://github.com/your-username/my-page.git')}[L]
    s = SVG(760, 330, T['title'])
    s.rect(20, 50, 300, 230, fill=C['skyp'], stroke=C['sky'], r=16)
    s.text(170, 80, T['me'], size=15.5, weight=700, anchor='middle')
    s.rect(440, 50, 300, 230, fill=C['indigop'], stroke=C['indigo'], r=16)
    # left-aligned on two lines, so the push arrow coming down on the right does not cross it
    s.text(462, 80, 'GitHub', size=15.5, weight=700, fill=C['indigo'])
    s.text(462, 99, 'your-username/my-page', size=12, fill=C['indigo'], mono=True)
    commit_chain(s, [55, 120, 185, 250], 180)
    s.circle(250, 180, 11, fill=C['greenl'], stroke=C['green'])
    s.pill(250, 132, 'main', 'branch')
    s.line(250, 138, 250, 164, stroke=C['green'], sw=2, arrow=True)
    s.pill(185, 242, 'origin/main', 'remote', size=11.5)
    s.line(185, 228, 185, 196, stroke=C['red'], sw=1.8, dash='4 3', arrow=True)
    s.text(170, 268, T['note'], size=11.5, fill=C['red'], anchor='middle', italic=True)
    commit_chain(s, [480, 545, 610], 180)
    s.add(f'<circle cx="675" cy="180" r="11" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="2.2" stroke-dasharray="4 3"/>')
    s.line(621, 180, 664, 180, stroke=C['green'], sw=2, dash='4 3')
    s.pill(610, 132, 'main', 'branch')
    s.line(610, 138, 610, 164, stroke=C['green'], sw=2, arrow=True)
    s.path('M262 170 C 330 20, 600 20, 664 166', stroke=C['green'], sw=2.6, arrow=True)
    s.text(380, 44, T['push'], size=14, mono=True, weight=700, fill=C['green'], anchor='middle')
    s.text(590, 230, T['push2'], size=11.5, fill=C['green'], anchor='middle', italic=True)
    s.text(380, 314, T['origin'], size=12.5, mono=True, fill=C['slate'], anchor='middle')
    return s


def wire_input(s, x, y, w, text, h=30, mono=True, chevron=False, fill=C['white']):
    s.rect(x, y, w, h, fill=fill, stroke=C['border'], r=6, sw=1.4)
    s.text(x + 10, y + h / 2 + 4.5, text, size=12.5, mono=mono, fill=C['navy'])
    if chevron:
        s.text(x + w - 12, y + h / 2 + 4.5, '▾', size=12, anchor='middle', fill=C['slate'])


def marker(s, x, y, n):
    """A numbered orange dot that a legend refers to."""
    s.circle(x, y, 10, fill=C['orange'], stroke=C['white'], sw=1.5)
    s.text(x, y + 4.2, str(n), size=11.5, fill=C['white'], weight=700, anchor='middle')


def callout(s, x, y, text, tx, ty, col=C['orange']):
    s.line(tx, ty, x - 6, y - 4, stroke=col, sw=1.6, arrow=False)
    s.circle(tx, ty, 3.5, fill=col, stroke=col, sw=1)
    s.text(x, y, text, size=12.5, fill=col, weight=700)


def fig_07_2(L):
    T = {'en': dict(title="Sketch of GitHub's 'Create a new repository' page", sketch='simplified sketch', head='Create a new repository',
                    notes=['type my-page', 'Public', 'leave Off', 'leave as they are', 'click']),
         'zh': dict(title='GitHub“Create a new repository”页面示意图', sketch='简化示意图', head='Create a new repository',
                    notes=['输入 my-page', '公开（Public）', '保持关闭（Off）', '保持不变', '点击'])}[L]
    s = SVG(760, 430, T['title'])
    s.rect(20, 14, 540, 400, fill=C['white'], stroke=C['border'], r=12)
    s.rect(20, 14, 540, 34, fill=C['bg'], stroke=C['border'], r=12)
    s.text(36, 36, T['head'], size=14, weight=700)
    s.text(548, 36, T['sketch'], size=11, fill=C['muted'], anchor='end', italic=True)
    s.text(40, 80, 'Owner', size=12, fill=C['slate'], weight=600)
    s.text(220, 80, 'Repository name *', size=12, fill=C['slate'], weight=600)
    wire_input(s, 40, 88, 160, 'your-username', chevron=True)
    s.text(209, 108, '/', size=16, fill=C['slate'], anchor='middle')
    wire_input(s, 220, 88, 220, 'my-page', fill=C['amberp'])
    s.text(40, 146, 'Description (optional)', size=12, fill=C['slate'], weight=600)
    wire_input(s, 40, 154, 400, '')
    s.text(40, 212, 'Choose visibility', size=12, fill=C['slate'], weight=600)
    wire_input(s, 40, 220, 150, 'Public', chevron=True, mono=False, fill=C['amberp'])
    s.text(40, 278, 'Add README', size=12, fill=C['slate'], weight=600)
    s.rect(40, 286, 54, 26, fill=C['bg'], stroke=C['border'], r=13)
    s.circle(54, 299, 9, fill=C['white'], stroke=C['muted'], sw=1.4)
    s.text(102, 304, 'Off', size=12.5, fill=C['slate'])
    s.text(200, 278, 'Add .gitignore', size=12, fill=C['slate'], weight=600)
    wire_input(s, 200, 286, 150, 'No .gitignore', chevron=True, mono=False)
    s.text(370, 278, 'Add license', size=12, fill=C['slate'], weight=600)
    wire_input(s, 370, 286, 150, 'No license', chevron=True, mono=False)
    s.rect(370, 356, 170, 36, fill=C['green'], stroke=C['green'], r=8)
    s.text(455, 379, 'Create repository', size=13, fill=C['white'], weight=700, anchor='middle')
    for n, (x, y) in enumerate([(454, 103), (204, 235), (134, 299), (532, 301), (530, 349)], 1):
        marker(s, x, y, n)
    for n, note in enumerate(T['notes'], 1):
        y = 100 + (n - 1) * 34
        marker(s, 592, y, n)
        s.text(610, y + 4.5, note, size=13, fill=C['orange'], weight=700)
    return s


def fig_08_1(L):
    T = {'en': dict(title='Sketch of the GitHub Pages settings', sketch='simplified sketch', group='Code, planning, and automation',
                    notes=['Pages', 'Deploy from a branch', 'main and / (root)', 'Save']),
         'zh': dict(title='GitHub Pages 设置页面示意图', sketch='简化示意图', group='Code, planning, and automation',
                    notes=['Pages', 'Deploy from a branch（从分支部署）', 'main 和 / (root)', 'Save（保存）'])}[L]
    s = SVG(760, 360, T['title'])
    s.rect(20, 14, 720, 290, fill=C['white'], stroke=C['border'], r=12)
    s.text(728, 34, T['sketch'], size=11, fill=C['muted'], anchor='end', italic=True)
    s.line(220, 14, 220, 304, stroke=C['border'], sw=1.4)
    for i, t in enumerate(['General', 'Collaborators']):
        s.text(40, 52 + i * 28, t, size=12.5, fill=C['slate'])
    s.text(40, 122, T['group'], size=10.5, fill=C['muted'], weight=700)
    for i, t in enumerate(['Branches', 'Actions', 'Webhooks', 'Pages']):
        y = 148 + i * 28
        if t == 'Pages':
            s.rect(32, y - 18, 176, 26, fill=C['skyl'], stroke=C['blue'], r=6, sw=1.4)
        s.text(44, y, t, size=12.5, fill=C['blue'] if t == 'Pages' else C['slate'], weight=700 if t == 'Pages' else 400)
    s.text(244, 56, 'GitHub Pages', size=17, weight=700)
    s.text(244, 92, 'Build and deployment', size=13.5, weight=700)
    s.text(244, 120, 'Source', size=12, fill=C['slate'], weight=600)
    wire_input(s, 244, 128, 200, 'Deploy from a branch', chevron=True, mono=False, fill=C['amberp'])
    s.text(244, 190, 'Branch', size=12, fill=C['slate'], weight=600)
    wire_input(s, 244, 198, 110, 'main', chevron=True, fill=C['amberp'])
    wire_input(s, 364, 198, 110, '/ (root)', chevron=True, fill=C['amberp'])
    s.rect(484, 198, 64, 30, fill=C['bg'], stroke=C['border'], r=6, sw=1.4)
    s.text(516, 218, 'Save', size=12.5, weight=700, anchor='middle')
    for n, (x, y) in enumerate([(196, 218), (458, 143), (420, 244), (562, 213)], 1):
        marker(s, x, y, n)
    x = 30
    for n, note in enumerate(T['notes'], 1):
        marker(s, x + 10, 334, n)
        s.text(x + 26, 338.5, note, size=12.5, fill=C['orange'], weight=700)
        x += 34 + len(note) * (7.2 if L == 'en' else 9.5) + 18
    return s


def fig_09_1(L):
    T = {'en': dict(title='The daily routine', steps=[('git pull', 'start: get the latest'), ('edit', 'change your files'),
                                                      ('git add + git commit', 'save in small steps'), ('git push', 'finish: back up and share')],
                    repeat='repeat', next='next time'),
         'zh': dict(title='每天的工作流程', steps=[('git pull', '开始：获取最新内容'), ('编辑', '修改你的文件'),
                                                ('git add + git commit', '分小步保存'), ('git push', '结束：备份并分享')],
                    repeat='重复', next='下一次')}[L]
    s = SVG(760, 250, T['title'])
    xs = [20, 205, 390, 575]
    cols = [C['blue'], C['slate'], C['green'], C['green']]
    for i, ((cmd, sub), x, col) in enumerate(zip(T['steps'], xs, cols)):
        s.rect(x, 60, 165, 86, fill=C['white'], stroke=col, r=14, sw=2)
        s.circle(x + 22, 60, 12, fill=col, stroke=col, sw=1)
        s.text(x + 22, 64.5, str(i + 1), size=12, fill=C['white'], weight=700, anchor='middle')
        s.text(x + 82, 98, cmd, size=13 if len(cmd) < 14 else 11.5, mono=cmd.startswith('git'), weight=700, anchor='middle', fill=col)
        s.text(x + 82, 124, sub, size=12, fill=C['slate'], anchor='middle')
        if i < 3:
            s.line(x + 167, 103, x + 183, 103, stroke=C['slate'], sw=2.2, arrow=True)
    s.path('M472 146 C 472 190, 288 190, 288 150', stroke=C['green'], sw=2, dash='5 4', arrow=True)
    s.text(380, 196, T['repeat'], size=12, fill=C['green'], anchor='middle', italic=True)
    s.path('M657 146 C 657 238, 102 238, 102 150', stroke=C['blue'], sw=2, dash='5 4', arrow=True)
    s.text(380, 236, T['next'], size=12, fill=C['blue'], anchor='middle', italic=True)
    return s


def fig_09_2(L):
    T = {'en': dict(title='Why a push is rejected, and how pull fixes it', p1='1  Both sides moved on', p2='2  git pull merges',
                    p3='3  git push is accepted', gh='GitHub', me='your computer', rej='rejected: GitHub would lose W',
                    w='W = the README edit made on GitHub', l='L = your new commit'),
         'zh': dict(title='推送为什么被拒绝，以及 pull 如何解决', p1='1  两边都有了新提交', p2='2  git pull 合并',
                    p3='3  git push 被接受', gh='GitHub', me='你的电脑', rej='被拒绝：GitHub 会丢失 W',
                    w='W = 在 GitHub 上对 README 的修改', l='L = 你的新提交')}[L]
    s = SVG(780, 330, T['title'])
    for x0, t in ((14, T['p1']), (270, T['p2']), (526, T['p3'])):
        s.rect(x0, 14, 240, 266, fill=C['bg'], stroke=C['border'], r=14)
        s.text(x0 + 16, 40, t, size=13.5, weight=700)

    def lane(x0, y, label, nodes, col=C['navy']):
        s.text(x0 + 16, y - 26, label, size=11.5, fill=C['muted'], weight=700)
        for a, b in zip(nodes, nodes[1:]):
            s.line(a[0] + 11, a[1], b[0] - 11, b[1], stroke=C['slate'], sw=2)
        for x, yy, t, f in nodes:
            s.circle(x, yy, 11, fill=f, stroke=col)
            s.text(x, yy + 4.5, t, size=10.5, weight=700, anchor='middle', mono=True)
    lane(14, 100, T['gh'], [(50, 100, '', C['white']), (110, 100, '', C['white']), (170, 100, 'W', C['amberp'])], C['indigo'])
    lane(14, 200, T['me'], [(50, 200, '', C['white']), (110, 200, '', C['white']), (170, 200, 'L', C['greenl'])])
    s.line(200, 194, 200, 116, stroke=C['red'], sw=2.4, arrow=True)
    s.text(208, 160, '✗', size=20, fill=C['red'], weight=700)
    s.text(134, 246, T['rej'], size=11.5, fill=C['red'], anchor='middle', weight=600)
    # panel 2: computer has L and W merged into M
    s.text(286, 74, T['me'], size=11.5, fill=C['muted'], weight=700)
    for a, b in (((306, 160), (366, 160)), ((366, 160), (426, 120)), ((366, 160), (426, 200)), ((426, 120), (486, 160)), ((426, 200), (486, 160))):
        s.line(a[0], a[1], b[0], b[1], stroke=C['slate'], sw=2)
    for x, y, t, f in ((306, 160, '', C['white']), (366, 160, '', C['white']), (426, 120, 'W', C['amberp']), (426, 200, 'L', C['greenl']), (486, 160, 'M', C['skyl'])):
        s.circle(x, y, 11, fill=f, stroke=C['navy'])
        s.text(x, y + 4.5, t, size=10.5, weight=700, anchor='middle', mono=True)
    # panel 3: GitHub gets L and M too
    s.text(542, 74, T['gh'], size=11.5, fill=C['muted'], weight=700)
    for a, b in (((562, 160), (622, 160)), ((622, 160), (682, 120)), ((622, 160), (682, 200)), ((682, 120), (742, 160)), ((682, 200), (742, 160))):
        s.line(a[0], a[1], b[0], b[1], stroke=C['slate'], sw=2)
    for x, y, t, f in ((562, 160, '', C['white']), (622, 160, '', C['white']), (682, 120, 'W', C['amberp']), (682, 200, 'L', C['greenl']), (742, 160, 'M', C['skyl'])):
        s.circle(x, y, 11, fill=f, stroke=C['indigo'])
        s.text(x, y + 4.5, t, size=10.5, weight=700, anchor='middle', mono=True)
    s.text(646, 246, '✓', size=20, fill=C['green'], weight=700, anchor='middle')
    s.text(20, 304, T['w'], size=12, fill=C['slate'])
    s.text(20, 322, T['l'], size=12, fill=C['slate'])
    return s


def fig_10_1(L):
    T = {'en': dict(title='The pull request flow', me='Your computer', gh='GitHub',
                    steps=[('1', 'branch, edit, commit', 'git switch -c add-contact'), ('2', 'push the branch', 'git push -u origin add-contact'),
                           ('3', 'open the pull request', 'Compare & pull request'), ('4', 'review the changes', 'Files changed'),
                           ('5', 'merge it', 'Merge pull request'), ('6', 'bring it home, tidy up', 'git pull, git branch -d')]),
         'zh': dict(title='拉取请求的流程', me='你的电脑', gh='GitHub',
                    steps=[('1', '建分支、编辑、提交', 'git switch -c add-contact'), ('2', '推送分支', 'git push -u origin add-contact'),
                           ('3', '创建拉取请求', 'Compare & pull request'), ('4', '审查改动', 'Files changed'),
                           ('5', '合并', 'Merge pull request'), ('6', '取回合并、整理分支', 'git pull, git branch -d')])}[L]
    s = SVG(780, 300, T['title'])
    s.rect(14, 20, 752, 110, fill=C['skyp'], stroke=C['sky'], r=14)
    s.rect(14, 160, 752, 110, fill=C['indigop'], stroke=C['indigo'], r=14)
    s.text(30, 42, T['me'], size=12, weight=700, fill=C['sky'])
    s.text(30, 182, T['gh'], size=12, weight=700, fill=C['indigo'])
    pos = {'1': (30, 52, 180), '2': (245, 52, 210), '6': (540, 52, 212), '3': (160, 192, 190), '4': (372, 192, 168), '5': (562, 192, 190)}
    for n, what, how in T['steps']:
        x, y, w = pos[n]
        col = C['blue'] if y < 150 else C['indigo']
        s.rect(x, y, w, 66, fill=C['white'], stroke=col, r=10, sw=1.8)
        s.circle(x + 18, y + 20, 10, fill=col, stroke=col, sw=1)
        s.text(x + 18, y + 24.5, n, size=11.5, weight=700, fill=C['white'], anchor='middle')
        s.text(x + 36, y + 25, what, size=12.5, weight=700)
        s.text(x + 12, y + 50, how, size=10.5 if len(how) > 24 else 11, mono=True, fill=C['slate'])
    s.line(212, 85, 241, 85, stroke=C['slate'], sw=2.2, arrow=True)
    s.line(340, 120, 286, 188, stroke=C['slate'], sw=2.2, arrow=True)
    s.line(352, 225, 368, 225, stroke=C['slate'], sw=2.2, arrow=True)
    s.line(542, 225, 558, 225, stroke=C['slate'], sw=2.2, arrow=True)
    s.line(656, 190, 650, 122, stroke=C['slate'], sw=2.2, arrow=True)
    return s


def fig_11_1(L):
    T = {'en': dict(title='Which undo to use', root='What do you want to undo?',
                    a=['Changes to a file,', 'not committed'], b=['A file in the', 'staging area'], c=['My last commit'], d=['A commit I', 'cannot find'],
                    q=['Is it on GitHub', 'already?'], no='no', yes='yes', amend='fix it', reset='undo it, keep the changes',
                    lost='the changes are lost', revert='a new commit undoes it', before='only before you push', unstage='the file stays as it is'),
         'zh': dict(title='该用哪种撤销', root='你想撤销什么？',
                    a=['文件里尚未提交的改动'], b=['暂存区里的文件'], c=['最近一次提交'], d=['找不到的提交'],
                    q=['它已经在', 'GitHub 上了吗？'], no='否', yes='是', amend='修正它', reset='撤销它，保留改动',
                    lost='改动会丢失', revert='用新提交撤销它', before='只能在推送之前使用', unstage='文件内容不变')}[L]
    s = SVG(760, 430, T['title'])
    s.rect(260, 14, 240, 44, fill=C['navy'], stroke=C['navy'], r=12)
    s.text(380, 42, T['root'], size=14, weight=700, fill=C['white'], anchor='middle')
    xs = [14, 200, 386, 572]
    for x, rows in zip(xs, (T['a'], T['b'], T['c'], T['d'])):
        s.path(f'M380 58 L{x + 87} 92', stroke=C['muted'], sw=1.6)
        s.rect(x, 92, 174, 54, fill=C['bg'], stroke=C['border'], r=10)
        top = 123 if len(rows) == 1 else 114
        for i, r in enumerate(rows):
            s.text(x + 87, top + i * 17, r, size=12.5, weight=700, anchor='middle')

    def outcome(x, y, cmd, sub_, col):
        s.rect(x, y, 174, 58, fill=C['white'], stroke=col, r=10, sw=1.8)
        s.text(x + 87, y + 24, cmd, size=10.5 if len(cmd) > 22 else 11.5 if len(cmd) > 18 else 12.5, mono=True, weight=700, anchor='middle', fill=col)
        if sub_:
            s.text(x + 87, y + 44, sub_, size=11.5, anchor='middle', fill=C['slate'], italic=True)
    outcome(14, 178, 'git restore FILE', T['lost'], C['red'])
    s.line(101, 146, 101, 174, stroke=C['muted'], sw=1.6, arrow=True)
    outcome(200, 178, 'git restore --staged FILE', T['unstage'], C['green'])
    s.line(287, 146, 287, 174, stroke=C['muted'], sw=1.6, arrow=True)
    outcome(572, 178, 'git reflog', '', C['green'])
    s.line(659, 146, 659, 174, stroke=C['muted'], sw=1.6, arrow=True)
    s.add(f'<polygon points="473,170 563,212 473,254 383,212" fill="{C["amberp"]}" stroke="{C["amber"]}" stroke-width="1.6"/>')
    s.line(473, 146, 473, 168, stroke=C['muted'], sw=1.6, arrow=True)
    for i, r in enumerate(T['q']):
        s.text(473, 208 + i * 16, r, size=11.5, weight=700, anchor='middle', fill=C['amber'])
    s.path('M428 233 L300 312', stroke=C['slate'], sw=1.8, arrow=True)
    s.text(352, 270, T['no'], size=12.5, weight=700, fill=C['slate'], anchor='end')
    s.path('M518 233 L640 312', stroke=C['slate'], sw=1.8, arrow=True)
    s.text(594, 270, T['yes'], size=12.5, weight=700, fill=C['slate'])
    outcome(118, 316, 'git commit --amend', T['amend'], C['blue'])
    outcome(300, 316, 'git reset --soft HEAD~1', T['reset'], C['blue'])
    outcome(560, 316, 'git revert HASH', T['revert'], C['green'])
    s.text(296, 404, T['before'], size=12, fill=C['blue'], anchor='middle', weight=600)
    return s


FIGURES = {
    'fig-01-1': fig_01_1, 'fig-01-2': fig_01_2, 'fig-03-1': fig_03_1, 'fig-04-1': fig_04_1, 'fig-04-2': fig_04_2,
    'fig-05-1': fig_05_1, 'fig-05-2': fig_05_2, 'fig-06-1': fig_06_1, 'fig-07-1': fig_07_1, 'fig-07-2': fig_07_2,
    'fig-08-1': fig_08_1, 'fig-09-1': fig_09_1, 'fig-09-2': fig_09_2, 'fig-10-1': fig_10_1, 'fig-11-1': fig_11_1,
}

if __name__ == '__main__':
    want = sys.argv[1:] or list(FIGURES)
    for lang in ('en', 'zh'):
        os.makedirs(os.path.join(FIGS, lang), exist_ok=True)
        for fid in want:
            svg = FIGURES[fid](lang).svg()
            with open(os.path.join(FIGS, lang, fid + '.svg'), 'w', encoding='utf-8') as f:
                f.write(svg)
    print(f'wrote {len(want)} figure(s) in en and zh')
