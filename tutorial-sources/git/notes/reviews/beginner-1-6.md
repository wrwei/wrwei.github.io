# Beginner read-through: index and Lessons 1 to 6

Read on 6 November 2026 as a newcomer following alone, in turn on Windows 11, macOS and Linux
(Ubuntu, Fedora), doing every step literally. Line numbers refer to `src/en/` as of 21:56 UTC.
Lesson 1 changed during the review: a "What you learned" section was added at line 150, and
lines 1 to 148 are unchanged.

Severity: **High** means the reader gets stuck, or their screen silently stops matching the
lesson. **Medium** means confusing, or likely to lead to a wrong action. **Low** means small
friction.

Checked by running Git 2.43 in a sandbox, in a pseudo-terminal: the editor error when `code` is
missing, the text of the Lesson 6 commit tab, Ubuntu's fallback editor, the `git status` and
`git add .` output with a stray `.DS_Store`, and apt's message for the `.deb` command. Points
about the VS Code, macOS and Windows interfaces come from current versions; they were not run
here.

## Issues

### index.md

**index.md:31-41**: Low. The first page uses "terminal" (line 33) and "hashes" (line 35) before
anything explains them. Its "How to use these lessons" list also repeats, almost point for point,
Lesson 1's "How the lessons work" (lesson_01.md:108-148): do them in order, 15 to 45 minutes, type
every command, the boxes, Mark as done, stored in your browser.
**Fix:** keep the full version in Lesson 1 only, moving the "Use the tabs" point there. Here, say:
"Start with Lesson 1, which shows how the lessons work. You need no experience: Lesson 2 shows
you how to install everything and open a terminal."

### lesson_01.md

**lesson_01.md:17-21, 52-54**: Low. The "With Git" side of the figure shows `report.docx` with a
tidy history, and the index names thesis writers as readers. Git does keep Word files, but it
cannot show what changed inside them, so line 53 ("best with text") quietly takes back what the
figure promises.
**Fix:** use `thesis.tex` or `notes.md` in the figure. After line 54, add: "Word files, images and
PDFs can be kept too, but Git cannot show you what changed inside them."

**lesson_01.md:112-119**: Medium. "Type every command yourself, in your own terminal" is the
series' first use of *terminal*, and the word is not explained until lesson_02.md:147. A command
follows at once, but nothing says (a) not to type it now, or (b) that the `$` is not part of the
command. Point (b) matters straight away: in Lesson 2, Mac and Linux readers type `$` commands
(lesson_02.md:83, 119, 131-138) before line 201 tells them to leave the `$` out.
**Fix:** "Type every command yourself, in a **terminal**: a window where you give the computer
instructions by typing them (Lesson 2 shows you how to open one). Commands appear in dark boxes
like this, after a `$`. The `$` is not part of the command: type only what comes after it, then
press Enter. (Nothing to type yet: this one is only an example.)"

### lesson_02.md

**lesson_02.md:40-42**: Medium. "in Lesson 8 your web page will be at `your-username.github.io`"
contradicts Lesson 1, line 99 (`https://your-username.github.io/my-page/`). A reader who later
types the shorter address gets a 404 page.
**Fix:** "...will be at `your-username.github.io/my-page`."

**lesson_02.md:66, 72, 86** (VS Code's first start): Low. Nothing says what VS Code looks like
the first time: a Welcome tab and, in recent versions, possibly a chat panel on the right.
Readers may think they have to deal with these.
**Fix:** "VS Code opens with a Welcome tab. You can close it, and any panel on the right; you will
not need them."

**lesson_02.md:69-75** (macOS tab): Medium. Three problems:
- "Open the downloaded file. Drag Visual Studio Code into your Applications folder": the download
  is a `.zip` that Safari has already unpacked, so "open the downloaded file" starts VS Code from
  Downloads before it has been moved.
- The first launch shows "'Visual Studio Code' is an app downloaded from the Internet. Are you
  sure you want to open it?", which the lesson does not mention.
- Item 3 gives no real reason ("Let VS Code start from the terminal later"; the reader never
  starts VS Code from the terminal). In fact it is what lets Git open VS Code for messages
  (`core.editor "code --wait"`, Step 6). A Mac reader who skips it cannot finish the merge in
  Lesson 5 (see lesson_05.md:328). VS Code also usually asks for administrator rights here.

**Fix:**
- Item 2: "In Finder, open **Downloads**: your Mac has unpacked the download into an app called
  **Visual Studio Code**. Drag it onto **Applications** in the Finder sidebar, then open it from
  there. If macOS asks whether you are sure you want to open it, click **Open**."
- Item 3: "**Do not skip this:** Git uses it to open VS Code when it needs a message from you.
  Press Cmd+Shift+P; a search box opens at the top of the window. Type `shell command` and
  choose **Shell Command: Install 'code' command in PATH**. If VS Code says it will ask for
  administrator privileges, click **OK** and type your Mac's password."

**lesson_02.md:76-85** (Linux tab): Medium. "Or install it from a terminal" leaves three gaps:
- No step says how to open a terminal.
- `sudo` asks for a password that is only explained in Step 3 (line 141).
- The command works only inside the Downloads folder. From the home folder, where a new terminal
  starts, apt answers `E: Unsupported file ./code_*.deb given on commandline` (reproduced).

**Fix:** drop the terminal route (one path), or write it out: "or open a terminal (on Ubuntu,
press Ctrl+Alt+T), type `cd ~/Downloads`, then `sudo apt install ./code_*.deb`. Type your
password when asked; nothing appears while you type, which is normal."

**lesson_02.md:83, 119, 131-138**: High (macOS, Linux). These are the first commands Mac and
Linux readers type, and the `$` rule only comes at line 201. A literal reader types
`$ xcode-select --install` and gets `zsh: command not found: $` (on Linux,
`$: command not found`).
**Fix:** explain the `$` in Lesson 1 (see lesson_01.md:112). Here, add to each OS tab: "Type the
command without the `$` and press Return."

**lesson_02.md:90-92**: Medium. Auto Save is a quiet paragraph between two sets of tabs, yet
later lessons depend on it (lesson_03.md:128: "With Auto Save on (Lesson 2), VS Code saves it for
you"). A reader who misses it is never told how to save by hand: no lesson mentions Ctrl+S or
Cmd+S.
**Fix:** put it in its own `::: where vscode` box headed "Turn on Auto Save", and add it to "What
you learned". Add: "If you ever see a dot (●) on a file's tab, the file is not saved: press
Ctrl+S (Cmd+S on a Mac)."

**lesson_02.md:100-106** (Windows tab): Low. Windows asks "Do you want to allow this app to make
changes to your device?" before the Git installer starts, which can stop a cautious beginner. The
editor choice is a drop-down list, not a button.
**Fix:** "If Windows asks whether to allow this app to make changes to your device, click
**Yes**." And: "On **Choosing the default editor used by Git**, open the drop-down list and
choose..."

**lesson_02.md:122-125** (macOS tab): Low. The real message starts
`xcode-select: error: command line tools are already installed`. The lesson says only that the
terminal "says the command line tools are already installed", so the word "error" will alarm the
reader. The download can also take much longer than "a few minutes".
**Fix:** "If you see `xcode-select: error: command line tools are already installed`, that is
good news despite the word 'error': you already have Git." Also: "It can take 10 minutes or
more."

**lesson_02.md:127-141** (Linux tab): Medium. The Mac tab says where to type (open the Terminal
app); the Linux tab does not. `sudo apt install git` stops at `Do you want to continue? [Y/n]`.
Fedora's `sudo dnf install git` stops at `Is this ok [y/N]:`, where pressing Enter cancels the
install.
**Fix:** "Open a terminal: in VS Code, **Terminal** > **New Terminal** (or press Ctrl+Alt+T on
Ubuntu). ... When asked `Do you want to continue? [Y/n]` or `Is this ok [y/N]`, type `y` and
press Enter."

**lesson_02.md:193-202**: Low. The reader's first command in VS Code is asked for only after the
output, at the end of a paragraph ("Try it now.").
**Fix:** above the block, write: "Type `git --version` and press Enter. You should see something
like this:"

**lesson_02.md:204-206**: Low. The lesson says "anything from 2.28 upwards works", but not what to
do with an older Git. Older versions (Apple's 2.24 on macOS Catalina, 2.25 on Ubuntu 20.04)
ignore `init.defaultBranch`, so from Lesson 3 on every output says `master` instead of `main`.
**Fix:** "If your number is lower than 2.28, install a newer Git before you go on (see the
troubleshooting page)". Add a matching entry to the troubleshooting page.

**lesson_02.md:208-212**: High (Linux). In VS Code's terminal on Linux, paste is Ctrl+Shift+V.
Ctrl+V shows nothing (bash waits for the next key). The reader first needs this in Step 5, to
paste the email address.
**Fix:** "...and paste it into VS Code's terminal with Ctrl+V on Windows, Ctrl+Shift+V on Linux,
or Cmd+V on a Mac." In the trouble box (line 220): "Press Ctrl+C (Ctrl, also on a Mac)".

**lesson_02.md:239-244, 279-289**: High. The Copy button on the Step 5 box copies the
placeholders (`"Your Name"` and `12345678+your-username@...`), and the tip just above invites
readers to use Copy. If they paste and run them, the Step 7 list matches the lesson exactly. The
check passes, and every commit in the series carries "Your Name". Readers also do not know how
to change part of a pasted command: clicking in the terminal does not move the cursor.
**Fix:** show this box without a Copy button, and say: "Type these two commands yourself (do not
use Copy here), with your own name and the address you copied. To change part of a command, move
the cursor with the ← and → keys; clicking does not move it." In Step 7, add: "Check that the
first two lines show *your* name and address. If they say `Your Name` or `your-username`, type
the Step 5 commands again with your own details."

### lesson_03.md

**lesson_03.md:19-22**: High (Windows, macOS). "Go to your home folder (the folder with your user
name)" is hard to do in the Open Folder dialog:
- On Windows 11, the sidebar entry called **Home** is not the home folder (it is a list of recent
  and pinned items, not a real folder), and the folder with your user name is not in the sidebar.
- On macOS the home folder is usually missing from the sidebar too.
- On Linux, the New Folder button is an icon.

Readers end up making `my-page` in Documents or on the Desktop. Those folders are often synced by
OneDrive or iCloud, which makes them a poor place for a repository. After that, `pwd`
(lines 38-42) and the trouble box (lines 115-117) no longer match.
**Fix:** add OS tabs:
- Windows: "Click in the address bar at the top of the window, type `%USERPROFILE%` and press
  Enter."
- macOS: "Press Cmd+Shift+H."
- Linux: "Click **Home** in the sidebar; the button for a new folder is the folder icon with a
  +."

Or use one path that is the same on every system, since the `code` command works after Lesson 2:
with no folder open, open a terminal (it starts in your home folder), type `mkdir my-page`, then
`code -r my-page`.

**lesson_03.md:72-75**: Medium (Windows). In Git Bash, `git init` prints
`Initialized empty Git repository in C:/Users/you/my-page/.git/`, but line 42 told the reader
that their path looks like `/c/Users/you/my-page`. The trouble box at line 115 says "The path in
the `git init` message is not your `my-page` folder", so a careful Windows reader may think they
are in the wrong folder.
**Fix:** after the block, add: "On Windows, Git writes the same folder as
`C:/Users/you/my-page/.git/`: the same place, written the Windows way."

**lesson_03.md:84-86**: Low (Windows). Git Bash's `ls` puts a `/` after folder names, so Windows
readers see `./  ../  .git/`.
**Fix:** "(Git Bash on Windows shows a `/` after folder names: `./  ../  .git/`.)"

**lesson_03.md:115-117**: Medium. "Delete the `.git` folder it made there (ask for help if you
are not sure how)": the reader is alone. They have just learnt that their home folder is now a
repository, and the lesson gives them no way out.
**Fix:** "In the terminal, type `pwd` and check that it shows your home folder (it ends with your
user name, not `my-page`). Then type `rm -rf .git`. This removes only the history Git had just
started there; your files are not touched." Add the same to the troubleshooting page.

**lesson_03.md:125-126**: Low. "Or use **File** > **New File...**" leads to a different screen: a
list of file types at the top of the window, not a name box in the file list. Step 2 then no
longer matches. Also, if the file list is not showing, nothing says how to bring it back.
**Fix:** drop the alternative. Add: "If you do not see the file list, click the top icon (two
sheets of paper) in the narrow bar on the far left."

**lesson_03.md:128**: Low. "Copy the text below into it" does not say how.
**Fix:** "Click **Copy** at the top of the box below, click in the empty file in VS Code, and
paste (Ctrl+V, or Cmd+V on a Mac)."

**lesson_03.md:148-150, 233-240**: High (macOS). On a Mac, the way to see the page ("Reveal in
Finder", then double-click) makes Finder write a hidden `.DS_Store` file into `my-page`. Lesson 11
says so itself (lesson_11.md:120): "macOS creates such files in every folder you open in
Finder". VS Code hides the file, so the reader cannot see it, but Git can. From line 234 on, a
Mac reader's `git status` shows

```
Untracked files:
	.DS_Store
nothing added to commit but untracked files present (use "git add" to track)
```

instead of "nothing to commit, working tree clean". Lesson 4's `git add .` then commits the file
(`3 files changed`, `create mode 100644 .DS_Store`). Both outputs were reproduced.
**Best fix:** in Lesson 2's macOS tab, have Git ignore these files everywhere, once:
`mkdir -p ~/.config/git && echo .DS_Store >> ~/.config/git/ignore` (Git reads this file by
default).
**Alternative fix:**
- Open the page without Finder: `open index.html` in the terminal on a Mac,
  `start index.html` in Git Bash, `xdg-open index.html` on Linux.
- Add a note here and in Lesson 4: "On a Mac, `git status` may also list `.DS_Store`, a hidden
  file Finder makes. Leave it out of your commits; Lesson 11 shows how to make Git ignore it."

**lesson_03.md:152**: Medium. This is the first time the reader goes from typing in a file to
typing a command, and no lesson says to click in the terminal first. A reader who has just pasted
into `index.html` and types `git status` writes it into the page, and Auto Save keeps it. The same
thing happens after a Git message tab closes (Lessons 5 and 6), when VS Code puts the cursor in
another open file.
**Fix:** "Click in the terminal panel at the bottom, so that what you type goes there and not
into your file. Then type:"

**lesson_03.md:236-240**: Low. Three names are used for the same thing: Git says "working tree",
the lesson says "working folder" (line 282), and Git's hint in Lesson 4 (line 59) says "working
directory". Nothing tells the reader they are the same.
**Fix:** "'Working tree' (and, in some hints, 'working directory') is Git's name for your working
folder: the files you see and edit."

**lesson_03.md:296-300**: Low. If you commit without adding in the widget, it prints "Nothing to
commit: run git add first.", which is not what Git says. The quiz (line 328) and the trouble box
(line 250) teach `nothing added to commit`.
**Fix:** have the widget print Git's own line, as it already does for `git status`.

### lesson_04.md

**lesson_04.md:34-35** (also lines 131-133, and lesson_05.md:198): High. "The highlighted line is
the one to add": a reader who types it gets a broken line. VS Code completes HTML tags: as soon as
you type `<p>`, it adds `</p>` after the cursor. Typing the line exactly as shown therefore leaves
an extra closing tag (`...coffee.</p></p>` or worse), and the diff no longer matches. The same
happens with Lesson 5's hobbies list, and in `style.css`, where typing `{` adds `}`. No lesson
says that a file box's **Copy** button copies the whole file, so pasting it into the open file
doubles everything.
**Fix** (here, at the first edit): "To add the line, select it in the box with your mouse, copy
it, and paste it on a new line under `<p>This is my first web page.</p>`. Or click **Copy** on the
box, click in the file, press Ctrl+A (Cmd+A on a Mac) to select everything, and paste over it. If
you type the line, VS Code adds the closing `</p>` for you as soon as you type `<p>`: type only
the sentence." At line 131, add: "...and copy this text into it."

**lesson_04.md:87-97**: Medium. Figure 4.2 ("How to read `git diff`") shows a different diff from
the one the reader has just made, which sits right above it. The figure has `@@ -6,5 +6,5 @@`,
"where: around line 6", other hashes, and the heading changed from "Hello, I'm learning Git!" to
"Welcome to my page!" (the heading from Lesson 6). The bullets below say line 7. A reader who
compares, as told, concludes their output is wrong.
**Fix:** redraw the figure from the reader's own diff (`@@ -7,5 +7,6 @@`, one green `+` line).
If it should also show a removed line, caption it: "An example of a diff with one line removed
and one added (not the change you just made)."

**lesson_04.md:101-105**: Low. After the Source Control tip, the sidebar shows Source Control. The
next step ("**New File...** in the Explorer", line 132) then has no Explorer to use.
**Fix:** add "To get back to your files, click the top icon of the same bar (two sheets of
paper)."

**lesson_04.md:108-110**: Low. "A dot on the file's tab in VS Code means unsaved", but the box
does not say how to save.
**Fix:** "...means unsaved: press Ctrl+S (Cmd+S on a Mac)."

**lesson_04.md:167**: Low. "The heading is blue and the text is centred": the text stays
left-aligned. Only the column is centred, and on a narrow window nothing moves. The most visible
changes, the cream background and the plainer font, are not mentioned.
**Fix:** "the background turns cream, the font changes, the heading turns blue, and the text sits
in a column in the middle of the window."

**lesson_04.md:184-198**: Medium (macOS). With a `.DS_Store` in the folder (see
lesson_03.md:148), `git status` lists it here. "Be sure you are adding only what you mean to"
does not tell the reader whether they mean to add it.
**Fix:** unless the global-ignore fix goes into Lesson 2, add: "On a Mac, if `git status` also
lists `.DS_Store`, add the two files by name instead: `git add index.html style.css`."

**lesson_04.md:230-262**: Low. `git show` prints 17 lines, more than VS Code's terminal panel
usually shows on a laptop, so the reader sees part of the output with a `:` at the bottom. This
step's trouble box covers only a wrong hash; the `:` advice is in another box, two sections up.
**Fix:** add to this box: "**The output stops, with `:` at the bottom.** Press Space to see the
rest, and q to get your prompt back." Optionally, in Lesson 3: "To make the terminal taller, drag
the top edge of its panel up."

### lesson_05.md

**lesson_05.md:83, 103**: Low. "Reload the page in your browser" assumes the page is open, but
opening it was optional in Lesson 3 (line 148). Nothing says how to reload.
**Fix:** "(If it is not open, open it as in Lesson 3. To reload, press F5, or Cmd+R on a Mac.)"

**lesson_05.md:277-289**: High. The command comes first and the warning after it. When the reader
runs `git merge add-hobbies`, VS Code jumps to a `MERGE_MSG` tab and the terminal shows only
`hint: Waiting for your editor to close the file...`, which is not what the block shows. The
instruction ("Close the tab") is in the middle of the paragraph *below* the output. After the tab
closes, the cursor lands in another open file, so the next command (`git log ...`) can end up
typed into `index.html`.
**Fix:** move the paragraph above the command and lead with the action: "This merge needs one
thing from you. When you run it, VS Code opens a tab called `MERGE_MSG` with the message
`Merge branch 'add-hobbies'`, and the terminal waits. The message is fine: **close the tab**
(click its ×). Git then finishes the merge and prints the lines below. Click back in the terminal
before you type the next command."

**lesson_05.md:328-331**: High. The trouble box is wrong or incomplete in three ways:
- (a) If `core.editor` is set but the `code` command cannot be found (a Mac reader who skipped
  Lesson 2, Step 2, item 3), Git does not open Vim. It prints
  `hint: Waiting for your editor to close the file... code --wait: code: not found` (the end of
  that line depends on the shell), then `error: There was a problem with the editor 'code --wait'.`
  and `Not committing merge; use 'git commit' to complete the merge.` The merge is left half-done
  (reproduced with Git 2.43).
- (b) On Ubuntu and Debian, Git's fallback editor is nano, not Vim: Ubuntu's Git falls back to
  `editor`, which is `/usr/bin/nano` (checked). The reader sees a screen with "GNU nano" at the
  top and `^X Exit` at the bottom.
- (c) In Vim, `:wq` only works after Esc. A reader who has typed anything is in insert mode, and
  `:wq` becomes text.

**Fix:** three entries.
- "**`error: There was a problem with the editor 'code --wait'`.** Git could not start VS Code.
  On a Mac, do Lesson 2, Step 2, item 3. Then type `git commit` and close the tab that opens:
  that finishes the merge."
- "**A screen with `~` down the left side.** This is the editor Vim. Press Esc, type `:wq` and
  press Enter. ..."
- "**A screen with `GNU nano` at the top.** Press Ctrl+X to accept the message. Then set the
  editor again: ..."

### lesson_06.md

**lesson_06.md:103, 253-262**: Medium. Goal 4 ("Stop a merge you do not want to finish, with
`git merge --abort`") is only described. The block is `norun`, so the reader's first abort will
happen when they are already in a muddle. Also, on Windows the Git Bash prompt shows
`(main|MERGING)` during the merge. It is a good "you are in the middle of a merge" sign, but the
lesson does not mention it.
**Fix:** practise the abort right after the CONFLICT message: "Before you solve it, try the
emergency exit: `git merge --abort`, then `git status` (clean again; your heading is back to
'Hello and welcome!'). Now start the merge again: `git merge new-heading`." Add: "On Windows, the
prompt shows `(main|MERGING)` until the merge is finished or stopped."

**lesson_06.md:168-173**: Medium. Besides the four links, VS Code shows a **Resolve in Merge
Editor** button on a file with conflicts. Clicking it opens a three-pane editor that looks nothing
like the lesson. This step also has no trouble box, for example for clicking the wrong link.
**Fix:** "VS Code also shows a **Resolve in Merge Editor** button. You do not need it: the links
are simpler." Trouble box: "**I clicked the wrong link.** Press Ctrl+Z (Cmd+Z on a Mac) to undo
it, or edit the file by hand until it looks like the one below."

**lesson_06.md:205, 247-251**: Medium. The pitfall "Before you `git add` a file with a conflict,
check that no marker lines are left" comes after the reader has already added, committed and
deleted the branch.
**Fix:** move it to just before "Tell Git the conflict is solved by adding the file" (line 205).

**lesson_06.md:218-226**: High. This has the same order problem as Lesson 5: the tab is explained
after the output. The tab also does not match the description. It is called `COMMIT_EDITMSG` (the
Lesson 5 trouble box tells readers to look for `MERGE_MSG`), and under the message it says:

```
# Conflicts:
#	index.html
#
# It looks like you may be committing a merge.
# If this is not correct, please run
#	git update-ref -d MERGE_HEAD
# and try again.
```

(reproduced with Git 2.43). A beginner who has just been through their first conflict may think
something went wrong, or run that command.
**Fix:** above the command, write: "VS Code opens a tab called `COMMIT_EDITMSG`. Its first line,
`Merge branch 'new-heading'`, is the message. The lines starting with `#` are notes that Git
leaves out of the commit, including one about `git update-ref`: you do not need it. Close the
tab, then click back in the terminal."

**lesson_06.md:269-270**: Low. "Then `git add` and `git commit` again": `git commit` without `-m`
opens a tab.
**Fix:** "...then `git add index.html` and `git commit -m "Remove conflict markers"`."

## Verdict per lesson

**index.md:** Short, welcoming and clear about who the series is for. Its "How to use" section
repeats Lesson 1 and uses "terminal" and "hashes" before they are explained; cut it down to a
pointer to Lesson 1.

**Lesson 1:** Does its job: short, calm, no commands. All four goals are met, and the quiz can be
answered from the main text (of the word list, only "commit" is tested). It should also explain
"terminal" and "do not type the `$`", which Lesson 2 needs from its first command. The `.docx`
figure oversells Git to Word users.

**Lesson 2:** The riskiest lesson. The Windows path is careful and correct. But Mac and Linux
readers type `$` commands before they learn the rule, Linux readers are not told where to type or
how to answer the installer's question, and the Linux paste key is wrong. The Copy button on
Step 5 can give anyone the placeholder identity without the Step 7 check catching it. The goals
are met for a reader who gets through, and the quiz can be answered.

**Lesson 3:** Well paced, with a good "what this means" after each output. All goals are met and
the quiz can be answered from the main text. Two things can derail a reader: finding the home
folder in the Open Folder dialog (Windows 11, macOS), and, for Mac readers who open the page
through Finder, a `.DS_Store` that makes `git status` differ from this point on.

**Lesson 4:** Clearly structured, with good advice on messages. All goals are met and the quiz
can be answered. VS Code's tag completion breaks the HTML lines when readers type them by hand,
and the `git diff` figure contradicts the reader's own diff right above it.

**Lesson 5:** The strongest lesson: the label model, the graph output and the widget explain
branches well. The goals are met and the quiz can be answered. The merge-commit tab has to be
announced before the command, readers need sending back to the terminal afterwards, and the
editor trouble box needs fixing.

**Lesson 6:** The right tone, a well-chosen conflict and a clear reading of the markers. The quiz
can be answered. Goal 4 (`git merge --abort`) is described but never practised. The commit tab's
`git update-ref` text and VS Code's Resolve in Merge Editor button are not addressed, and the
"check for markers" pitfall comes after the step it protects.

## The three most important changes

1. **Make every step safe to follow literally.**
   - Explain "terminal" and "type only what comes after the `$`" in Lesson 1, before Lesson 2's
     first commands.
   - Take the Copy button off the Step 5 identity block, and make Step 7 check for `Your Name`.
   - Give the right paste key for each system (Ctrl+Shift+V on Linux).
   - At the first file edit, say how to paste one line or replace the whole file, and that VS Code
     completes HTML tags.
   - Once, in Lesson 3, tell readers to click in the terminal before typing a command.
2. **Remove the per-system traps that silently break "your output should match".**
   - macOS: stop `.DS_Store` (a global ignore in Lesson 2, or open the page without Finder).
   - Windows and macOS: give each system a way to the home folder in Open Folder (or use
     `mkdir my-page` and `code -r my-page`).
   - Windows: explain the `C:/...` spelling in `git init`.
   - Linux: say how to open a terminal, add `cd ~/Downloads`, and explain the `[Y/n]` and
     `[y/N]` prompts.
   - Redraw Figure 4.2 from the reader's own diff.
3. **Announce VS Code's message tabs before the commands that open them.**
   - For Lesson 5 (`git merge`) and Lesson 6 (`git commit`), say before the command that a tab
     opens, what it contains (including the `#` notes and the `update-ref` text), that closing it
     finishes the job, and to click back in the terminal.
   - Fix the Lesson 5 trouble box: a missing `code` gives an editor error and a half-done merge,
     Ubuntu shows nano, and Vim needs Esc before `:wq`.
   - Mention Resolve in Merge Editor.
   - Let readers practise `git merge --abort`.
