# Translating the Git series into Simplified Chinese

The Chinese edition is a faithful, fluent translation of the English one, for the same readers:
complete beginners. It is not a summary: every step, explanation, box, table and quiz question is
translated. It follows the AI series' `TRANSLATION.md` where this file does not say otherwise.

## 1. What stays exactly as it is

`node tools/check.mjs` compares each Chinese page with the English one and fails if these differ:

- every ` ```terminal ` and ` ```file ` block, including its first line (`terminal norun`,
  `file index.html check`, ...). Commands, Git's output, file contents: all byte-identical.
  Git's own messages stay in English in the text too, when quoted in prose: write
  “working tree clean”（工作区干净）, quoting the English and explaining it in Chinese;
- every `<!-- replay: ... -->` comment;
- every `## ... {#id}` and `### ... {#id}` id, and their order;
- `::: figure id=...` and `::: widget name=...`, in the same order (the caption inside is
  translated; for an `image=` figure, the `alt="..."` text is translated, `url=` is not);
- the OS tab names: `::: tab Windows`, `::: tab macOS`, `::: tab Linux`;
- the quiz: same questions in the same order, the same option marked `[x]`; questions, options and
  explanations are translated;
- the number of `::: trouble` boxes;
- the front matter field `minutes`, and the number of `goals`.

Links between the series' pages change language: `lesson_04_EN.html` becomes `lesson_04_ZH.html`,
`troubleshooting_EN.html` becomes `troubleshooting_ZH.html`, `cheatsheet_EN.html` becomes
`cheatsheet_ZH.html`. External links stay, except where an official Chinese version exists: the
Pro Git book is `https://git-scm.com/book/zh/v2`.

## 2. Labels on the screen

Readers' screens show GitHub's website in English, and VS Code in English unless they installed
the Chinese language pack. So:

- keep the English label in bold, and give a Chinese gloss in full-width brackets the first time
  it appears in a lesson: **New repository**（新建仓库）, **File**（文件）> **Open Folder...**（打开文件夹）.
  After that, the English label alone;
- quoted messages from GitHub or VS Code stay in English, with a translation the first time:
  “Do you trust the authors of the files in this folder?”（你信任此文件夹中文件的作者吗？）

## 3. Terms

Use these everywhere. At a term's first use in a lesson, add the English in brackets:
暂存区（staging area）. After that, Chinese only.

| English | 中文 |
|---|---|
| repository | 仓库 |
| commit (noun and verb) | 提交 |
| snapshot | 快照 |
| hash | 哈希值 |
| branch | 分支 |
| merge | 合并 |
| merge commit | 合并提交 |
| fast-forward | 快进 |
| merge conflict | 合并冲突 |
| working folder | 工作文件夹 |
| staging area | 暂存区 |
| untracked / tracked | 未跟踪 / 已跟踪 |
| staged / modified | 已暂存 / 已修改 |
| remote | 远程仓库 |
| push | 推送 |
| pull | 拉取 |
| fetch | 获取 |
| clone | 克隆 |
| pull request | 拉取请求 |
| fork | 复刻 |
| collaborator | 协作者 |
| review | 审查 |
| undo | 撤销 |
| revert (`git revert`) | 还原 |
| reset (`git reset`) | 重置 |
| amend (`--amend`) | 修改上一次提交 |
| reflog | reflog（引用日志） |
| ignore / `.gitignore` | 忽略 / `.gitignore` |
| terminal | 终端 |
| prompt | 提示符 |
| command | 命令 |
| folder / home folder | 文件夹 / 主文件夹 |
| path | 路径 |
| editor | 编辑器 |
| sign in / authorise | 登录 / 授权 |
| credential | 凭据 |
| noreply address | noreply 地址 |
| cheat sheet | 速查表 |
| troubleshooting | 问题排查 |
| glossary | 术语表 |

Names stay in English: Git, GitHub, GitHub Pages, GitHub CLI, VS Code, Git Bash, Git Credential
Manager, `main`, `origin`, `HEAD`, README, Markdown, HTML.

## 4. Style

- Natural, friendly Chinese for beginners, as a good Chinese tutorial would write it, not word for
  word. Use 你. Keep the English edition's short sentences and direct instructions.
- Full-width punctuation in Chinese text: ，。：；？！“”（）、. Half-width inside code, commands,
  numbers and English words.
- A space between Chinese characters and Latin letters or digits: 运行 `git status` 命令；第 3 课；
  40 分钟. No space next to full-width punctuation.
- Keyboard keys stay as `<kbd>Ctrl</kbd>` etc.
- Lesson titles are short: "Your first repository" → 你的第一个仓库.
- The page chrome (box labels such as 提示, 注意, 如果出了问题, buttons, "Lesson") is added by the
  build; do not add it.
- A Chinese page may add a short sentence of its own where Chinese readers need it (for example,
  that Git may print some messages in Chinese on a Chinese system, or that they may write their
  page in Chinese but should copy the English text first so their outputs match). It may not add
  or remove blocks, boxes, tabs, figures or quiz questions.

## 5. Check

```bash
node tools/check.mjs
node tools/build.mjs
```

Fix every error that concerns your files.
