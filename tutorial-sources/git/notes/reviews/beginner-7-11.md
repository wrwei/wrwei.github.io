# Beginner read-through: Lessons 7 to 11, cheat sheet, troubleshooting

The reader for this review has done Lessons 1 to 6. Before this series they had never used Git, a
terminal or GitHub, they may not be a programmer, and they are following alone. I followed every
step literally three times, including the steps on GitHub's website: once as a Windows reader (Git
Bash in VS Code, Git Credential Manager from the Git installer), once as a macOS reader (zsh in VS
Code, Apple's Git) and once as a Linux reader (bash in VS Code, the distribution's Git, no
credential helper).

Paths are relative to `tutorial-sources/git/src/en/`. Line numbers are where the text in question
starts. Each entry has a severity:

- **High**: a reader working alone is likely to get stuck or do the wrong thing.
- **Medium**: confusion, or a screen that does not match; the reader can probably recover.
- **Low**: a small, cheap improvement.

I checked one claim in the built page: the **Copy** button on a terminal box copies the command
text as written, placeholder included (`out/git/lesson_07_EN.html` has
`data-copy="git remote add origin https://github.com/your-username/my-page.git"`).

## Lesson 7: Put your project on GitHub

1. **lesson_07.md:24, 133, 206, 227**: *Medium.* Only the figure caption says that `origin/main`
   is a *note on your computer*, and many readers skip captions. The body text treats it as GitHub
   itself: "Ahead of 'origin/main' by 1 commit: you have one commit that GitHub does not have
   yet", and "Up to date with 'origin/main': GitHub and your computer agree". The phrase "set up
   to track" is never explained. Lesson 9 then has to unteach this ("Up to date? Not really").
   *Fix:* in the `-u` bullet (133), add: "`origin/main` is your computer's note of where `main` is
   on GitHub. Git updates it whenever it talks to GitHub. 'Track' means your `main` is now paired
   with it, so a plain `git push` (and, later, `git pull`) knows where to go." At 227, write: "Up
   to date: as far as your computer knows, GitHub has the same commits as you."

2. **lesson_07.md:33**: *Low.* The box assumes GitHub is open and the reader is signed in, but
   they have not been on GitHub since Lesson 2. *Fix:* "1. Go to github.com and sign in. In the
   upper-right corner, click **+**, then **New repository**."

3. **lesson_07.md:52**: *Medium.* The page the reader lands on also has the heading "Quick setup —
   if you've done this kind of thing before" and blocks of commands ("…or push an existing
   repository from the command line"). These include `git branch -M main`, which this lesson never
   uses. A beginner wonders whether to run them, or feels they are on a page meant for experts.
   *Fix:* "Below, GitHub lists some commands. You do not need them: you will type the same ones in
   a moment, one at a time. Keep this page open."

4. **lesson_07.md:63**: *High.* "In VS Code's terminal, in `my-page` … Paste the address you
   copied" does not say *where* to paste.
   - If the reader pastes only the address and presses Enter, the terminal answers
     `bash: https://github.com/...: No such file or directory`.
   - If the reader uses the box's **Copy** button, as Lesson 2 suggests, the command contains the
     literal `your-username`. The push then asks them to sign in and fails with "Repository not
     found".
   - The lesson never says to open `my-page` again, and the reader may have closed VS Code since
     Lesson 6.

   *Fix:* "Open `my-page` in VS Code (**File** > **Open Recent**) and open a terminal. Type
   `git remote add origin ` (with a space at the end), paste your address with
   <kbd>Ctrl</kbd>+<kbd>V</kbd> (<kbd>Cmd</kbd>+<kbd>V</kbd> on a Mac), and press Enter. Do not use
   the Copy button here: it copies `your-username`, not your username."

5. **lesson_07.md:82** (also troubleshooting.md:330 and 343): *Low.* "`git remote set-url origin`
   followed by the right address": a beginner cannot build a command from a description. *Fix:*
   show the whole command: `git remote set-url origin https://github.com/your-username/my-page.git`,
   followed by "(with your own address)".

6. **lesson_07.md:89-127**: *High.* The steps are in the wrong order. The reader types the
   command, and then the terminal waits or a window pops up. What to do about that only comes after
   a 12-line output block ("The first time, before this answer appears, …"). *Fix:* put the
   sign-in tabs *before* the command: "The first time you push, Git asks you to sign in to GitHub.
   Read your system's tab below, then type the command. While you sign in, the terminal waits; that
   is normal." Then give the command, its output, and "What it means".

7. **lesson_07.md:110-112** (Windows): *Medium.* Three gaps.
   - The Git Credential Manager window can open behind VS Code. The terminal then just waits, and
     the reader thinks it is stuck.
   - "Approve the request" does not say what to click.
   - If the reader closes the window, VS Code's own sign-in message can appear instead.

   *Fix:* add "If nothing seems to happen, the window may be behind VS Code: look for it on the
   taskbar." Then: "…click the green button to authorise Git Credential Manager. When the browser
   says you are signed in, go back to VS Code. (If VS Code says 'The extension 'GitHub' wants to
   sign in', click **Allow** and continue as on a Mac.)"

8. **lesson_07.md:115-123 and 137-140** (macOS, Linux): *High.* Two common cases are missing.
   - A reader who is already signed in to GitHub in VS Code (for Settings Sync or Copilot) sees no
     message at all, and the push just finishes.
   - A reader who clicks **Cancel**, or whose browser step fails, gets a box at the top of VS Code
     asking "Username for 'https://github.com'", and then a password box. The trouble entry talks
     about "a username and password in the terminal", which is not what they see. They type their
     password and get "Support for password authentication was removed".

   *Fix:* add to both tabs: "If no message appears and the push finishes, you were already signed
   in." Retitle the trouble entry: "**A box at the top of VS Code, or the terminal, asks for a
   username or password.** The browser sign-in did not happen (perhaps you clicked **Cancel**).
   Press <kbd>Esc</kbd> (in the terminal, <kbd>Ctrl</kbd>+<kbd>C</kbd>), run `git push -u origin
   main` again and click **Allow**. Never type your GitHub password there: GitHub refuses it with
   'Support for password authentication was removed'." For Linux, consider one more line: on some
   desktops VS Code first warns that it cannot find an OS keyring, and the reader should choose to
   continue with weaker encryption.

9. **lesson_07.md:155-157**: *Medium.* "If older commits have the real address too, ask for help":
   a reader working alone has no one to ask. The troubleshooting page (582-588) gives a way out
   they can take themselves. *Fix:* "If several commits have the real address: on GitHub, click
   your profile picture > **Settings** > **Emails**, untick **Block command line pushes that expose
   my email**, push, then tick it again. (Those commits will then show your real address on
   GitHub.)"

10. **lesson_07.md:162-169**: *High.* Three things on the repository page.
    - Under the file list, GitHub shows an **Add a README** box with a green button. The next
      section of the lesson is called "Add a README", so a reader following literally may click it
      and commit a README on GitHub. Their own README push is then rejected ("fetch first"), and
      the pull that fixes it, which they have not learned yet, ends in an add/add conflict in
      `README.md`.
    - The latest commit message and the commit count are in a bar *above* the list, not "next to
      it".
    - On a Mac, `.DS_Store` may be listed too. Finder creates it in folders it has opened
      (Lesson 3's "Reveal in Finder"), and Lesson 4's `git add .` would have committed it.

    *Fix:* "Above the list: your latest commit's message and the number of commits…". Then: "GitHub
    also suggests **Add a README**. Do not click it: you will add one from your computer in the
    next step." Then: "(On a Mac you may also see `.DS_Store`, a file Finder makes. It is harmless.)"

11. **lesson_07.md:206-207**: *Low.* From now on, VS Code shows arrows with numbers (commits to
    pull and to push) in its status bar, and a **Sync Changes** button in Source Control. A reader
    who clicks it gets prompts the series never shows, including "Would you like Code to
    periodically run 'git fetch'?". If they accept, VS Code updates `origin/main` in the
    background, and Lesson 9's "Up to date? Not really" demonstration shows "behind" instead.
    *Fix:* "VS Code's status bar shows the same thing with arrows. In this series, push and pull in
    the terminal. If VS Code asks whether to run `git fetch` periodically, click **No**." (See also
    entry 17.)

12. **lesson_07.md:238**: *Medium.* Installing GitHub CLI is harder than the text suggests.
    - `brew install gh` fails on most Macs ("zsh: command not found: brew"): Homebrew is not
      installed by default, and the series never mentions it.
    - The Linux link leads to a page that adds a package repository with several `sudo` commands.
    - Windows readers are not told they can skip the section.

    *Fix:* "Simplest: use VS Code's terminal, as in the rest of this series. On Windows you never
    need this: Git Credential Manager works in every terminal. On a Mac, `brew install gh` works
    only if you have Homebrew. If the terminal says `command not found: brew`, download the macOS
    installer from cli.github.com instead."

13. **lesson_07.md:254-255**: *Medium.* "Paste the one-time code": to copy it, many beginners
    select it and press <kbd>Ctrl</kbd>+<kbd>C</kbd>, which in a terminal *cancels* `gh auth login`
    (the cheat sheet says so itself). The browser page also needs **Continue** and **Authorize**
    clicks. *Fix:* "Press Enter. In the page that opens, type the eight-character code shown in your
    terminal, then click **Continue** and **Authorize**. Typing is easier than copying:
    <kbd>Ctrl</kbd>+<kbd>C</kbd> in a terminal cancels the command."

14. **lesson_07.md:284-288**: *Low.* Quiz question 2's answer ("a README made on GitHub would start
    a different one [history], and your first push would be rejected") is not in the body of the
    lesson. Step 5 only says these options "would add files that are not in it", and the rejection
    appears only in a collapsed trouble box. *Fix:* in step 5, write: "…Your project already has a
    history. With any of these, GitHub would start a separate one and refuse your first push."

## Lesson 8: Publish your page with GitHub Pages

15. **lesson_08.md:123-124** (also troubleshooting.md:596-597): *Medium.* "The repository is
    private" gives the cause but not the fix. A reader who chose Private in Lesson 7 is stuck.
    *Fix:* "Make it public: **Settings** > **General**, scroll to the bottom, click **Change
    visibility** > **Change to public**, and follow the confirmations. (GitHub calls that section
    'Danger Zone'; for this project the change is safe.)"

## Lesson 9: Working from two places

16. **lesson_09.md:22-23**: *Low.* "You will try all of this yourself, playing both parts", but
    only the first case (an edit on GitHub) is actually tried. The clone is made and then thrown
    away without a push from it. *Fix:* either soften the sentence ("You will try the first one
    yourself, and see how the others work"), or add an optional step at 265: "Try it: in
    `my-page-laptop`, change a line, commit and push. Then go back to `my-page` and `git pull`."

17. **lesson_09.md:59-62**: *Low.* If VS Code has been fetching in the background (entry 11), the
    reader's `git status` already says "Your branch is behind 'origin/main' by 1 commit", which
    contradicts "Up to date? Not really". *Fix:* "(If yours already says 'behind … by 1 commit',
    VS Code has fetched for you. That is fine: carry on with `git pull`.)"

18. **lesson_09.md:179-181** (also lesson_11.md:270-271): *Medium.* The step to close the
    `MERGE_MSG` tab is given after the output, in the past tense ("In the middle, VS Code
    opened…"). The reader's terminal stops at "hint: Waiting for your editor to close the file...",
    a line that is not in the output shown, before they have read what to do. *Fix:* before the
    block, write: "Pull. Both sides have new commits, so Git makes a merge commit and, as in
    Lesson 5, opens a `MERGE_MSG` tab in VS Code. Close the tab; the pull then finishes with:". Do
    the same for `git revert` in Lesson 11.

19. **lesson_09.md:200, 257** (also lesson_10.md:198, lesson_11.md:277 and 300): *Low.*
    `origin/HEAD` appears in five outputs and is never explained. Readers whose Git is older than
    2.48 do not see it in `my-page` at all (only in the clone), so their output differs. *Fix:*
    after the first graph, add: "`origin/HEAD` marks GitHub's main branch. You can ignore it.
    (Older versions of Git do not show it here.)"

20. **lesson_09.md:223-225**: *Medium.* The goal "Get a copy of any repository with `git clone`" is
    not met: the lesson never says where to find another repository's address. Lesson 10's fork
    steps (241) depend on it. *Fix:* "To find any repository's address, open its page on GitHub,
    click the green **Code** button, check that **HTTPS** is selected, and copy the address."

21. **lesson_09.md:231-234**: *Low.* The `pwd` answer shows only the macOS path. Nothing tells the
    reader what a wrong answer looks like, although cloning in the wrong folder is this section's
    main trap. *Fix:* "(On Windows: `/c/Users/you`; on Linux: `/home/you`.) If the answer still
    ends in `my-page`, run `cd ..` again before you clone."

22. **lesson_09.md:239-240**: *Medium.* The clone command contains `your-username`, with no
    reminder this time, and the Copy button copies it as written. For an address that does not
    exist, GitHub first asks the reader to sign in (a Git Credential Manager window, or VS Code's
    sign-in message). That is baffling when cloning your own public repository, and it then ends in
    "Repository not found". *Fix:* "Now clone, with your own username in the address, naming the
    new copy `my-page-laptop`:"

23. **lesson_09.md:250-268**: *Medium.* This is the "two folders" moment. VS Code's file list keeps
    showing `my-page` while the terminal is in `my-page-laptop`. A reader who looks at the copy in
    the file list is looking at (and may edit) the original. *Fix:* after `cd my-page-laptop`, add:
    "Only the terminal has moved. VS Code's file list on the left still shows `my-page`. Your
    prompt now ends in `my-page-laptop`: that is where your commands run."

24. **lesson_09.md:277, 283-284**: *Low.* "Delete the `my-page-laptop` folder" and "Delete the
    copy" do not say how, and a reader who searches the web will find `rm -rf`. *Fix:* "To delete
    it, open your home folder in File Explorer, Finder or Files, and move `my-page-laptop` (not
    `my-page`!) to the Recycle Bin or Trash." In the trouble box: "In VS Code's file list,
    right-click `my-page-laptop` and choose **Delete**."

25. **lesson_09.md:322**: *Low.* In quiz question 1, the wrong option "`git status` only looks at
    your computer's files" is nearly true: `git status` never contacts GitHub, and it reads a note
    stored on your computer. A careful reader can choose it for good reasons. *Fix:* replace it
    with a clearly wrong option, for example "Edits made on GitHub never reach your computer".

## Lesson 10: Pull requests

26. **lesson_10.md:14-20**: *Low.* Why it is called a "pull request", and the fact that it is not
    `git pull`, appear only in the quiz feedback (275). *Fix:* add to the first section: "The name
    means 'please pull my branch into yours'. It is not the `git pull` command: you create a pull
    request on GitHub's website."

27. **lesson_10.md:32**: *Medium.* Lesson 9 moved the terminal between two folders, and this lesson
    starts with `git pull` without saying where. A reader whose terminal is still in
    `my-page-laptop` (or who opened that folder "as on a second computer") does the whole lesson
    there. In Lesson 11, `my-page` is then behind GitHub, and the push is rejected. *Fix:* "Open
    `my-page` in VS Code with a terminal, and check with `pwd` that you are in `my-page`, not
    `my-page-laptop`. Then start with the daily routine…"

28. **lesson_10.md:81-99**: *High.* Lesson 9 drilled "Finish: `git push`", so many readers type a
    plain `git push` on the new branch. Git answers: "fatal: The current branch add-contact has no
    upstream branch. To push the current branch and set the remote as upstream, use git push
    --set-upstream origin add-contact …". This is the most likely error in the lesson, and neither
    this lesson nor the troubleshooting page covers it. *Fix:* in the text: "GitHub has no
    `add-contact` yet, so a plain `git push` does not know where to send it. `-u origin
    add-contact` creates it there and pairs the two." In a trouble box: "**`fatal: The current
    branch add-contact has no upstream branch`.** You typed `git push` on its own. Run `git push -u
    origin add-contact`. (Git's own suggestion, `--set-upstream`, means the same.)"

29. **lesson_10.md:101-102**: *Low.* "You can open the link": a plain click on a link in VS Code's
    terminal does nothing. *Fix:* "<kbd>Ctrl</kbd>+click it (<kbd>Cmd</kbd>+click on a Mac) to open
    it, or go to the repository page as below."

30. **lesson_10.md:117**: *Medium.* "Its own page with three tabs": GitHub shows four tabs,
    **Conversation**, **Commits**, **Checks** and **Files changed**. A reader following literally
    counts the tabs and wonders whether they are on the right page. *Fix:* "…its own page with
    tabs. Three of them matter here: … (**Checks** is for automatic tests; you have none.)"

31. **lesson_10.md:126-128**: *Low.* "Write your comment, and add it" does not name a button.
    GitHub offers **Add single comment** and **Start a review**. The second one leaves the comment
    "Pending" until a review is submitted, which puzzles a beginner. The text also does not make
    clear that commenting is optional. *Fix:* "(Optional) To comment on a line, hover over it, click
    the blue **+**, write your comment and click **Add single comment**."

32. **lesson_10.md:152-153**: *Medium.* "With a merge commit, exactly like `git merge` did on your
    computer in Lesson 5" contradicts Lesson 5. There, nothing had happened on `main`, so the merge
    was a fast-forward with no new commit. Here nothing happened on `main` either, yet the graph
    (198-203) shows a merge commit, and the pull at 164-175 says "Fast-forward". A careful reader
    thinks they did something wrong. *Fix:* "GitHub always makes a merge commit, even when, as here,
    a fast-forward would have been possible, so that the history records the pull request. When you
    pull it below, your `main` only has to move forward to that commit, which is why Git says
    'Fast-forward'."

33. **lesson_10.md:185-192**: *Medium.* This is the first `git fetch`. "Asks GitHub for news" does
    not say how it differs from `git pull`; only the troubleshooting page does. "Prune" is an
    unusual English word. The reader also cannot see the out-of-date note anywhere, so the step
    feels like a ritual. *Fix:* "`git fetch` is the first half of `git pull`: it downloads news
    from GitHub and updates your notes, such as `origin/main`, but does not change your files or
    your branches. `--prune` (as a gardener prunes dead branches) also removes notes of branches
    that were deleted on GitHub. This is only tidying: nothing breaks if you forget it."

34. **lesson_10.md:213-215**: *High.* The conflict recipe fails in the usual case. `main` usually
    changed *on GitHub* (an edit there, or another merged pull request), so the local `main` does
    not have that change. `git merge main` on `add-contact` then says "Already up to date.", and
    the pull request stays blocked. *Fix:* "On your computer: `git switch main` and `git pull` (to
    get the change from GitHub), then `git switch add-contact` and `git merge main`. Resolve the
    conflict as in Lesson 6, `git add` the file, `git commit`, and `git push`. The pull request
    updates, and you can merge."

35. **lesson_10.md:225-227**: *Low.* Before showing the Collaborators page, GitHub may ask the
    reader to confirm their password (or passkey, or two-factor code) on a "Confirm access" page.
    Without a warning, this looks like being signed out. *Fix:* "GitHub may first ask you to
    confirm your password. That is a normal safety check."

36. **lesson_10.md:239-246**: *Medium.* The fork steps are too thin to follow alone.
    - Where is the fork's address? The green **Code** button is never shown (entry 20).
    - Nothing reminds the reader to clone outside `my-page`, the trap Lesson 9 warned about.
    - The classic mistake, cloning the original project instead of the fork, ends at the push with
      "remote: Permission to OWNER/PROJECT.git denied to your-username … The requested URL returned
      error: 403". Nothing in the series covers it.
    - A reader working alone has nothing to practise on.

    *Fix:* in step 2: "From your home folder (`cd ..` out of `my-page`), clone **your fork**. On
    the fork's page, whose name starts with your username, click the green **Code** button and copy
    the address." Add a trouble entry for the 403 error: "You cloned the original, not your fork:
    the address in `git remote -v` must contain your username." Optionally add: "To practise,
    github.com/firstcontributions/first-contributions is a project made for exactly this."

## Lesson 11: Undo and fix mistakes

37. **lesson_11.md:32-38**: *Low.* The lead says "Try each one", but there is nothing to throw
    away here. The reader is also not told that this recipe brings back a file they deleted by
    mistake, which is a common beginner panic. *Fix:* "(Nothing to try now: you did this in
    Lesson 4.) The same command also brings back a file you deleted by mistake."

38. **lesson_11.md:53-61**: *Medium (macOS).* On a Mac, `git add .` may also stage `.DS_Store`, so
    `git status` lists two new files and does not match the lesson. The reader may also want to
    undo a whole `git add .` at once. *Fix:* "On a Mac you may also see `new file: .DS_Store`:
    unstage it the same way, and add it to `.gitignore` (see the tip below). To unstage everything
    at once: `git restore --staged .`"

39. **lesson_11.md:84-85**: *Low.* "At the top of your project" can be read as "at the top of the
    file list". *Fix:* "in `my-page`, next to `index.html`, the way you created `README.md`." After
    the `git status`, add: "VS Code now shows `notes.txt` greyed out: Git ignores it."

40. **lesson_11.md:214-229**: *Medium.* Three problems with `HEAD~1`.
    - The reader must type it before it is explained (227).
    - The `~` (tilde) is hard to find on many keyboards outside the US. On French, Spanish,
      Italian, Portuguese or German layouts it needs AltGr or Option, or it is a "dead key" that
      waits for the next key.
    - `--soft` is not explained.

    *Fix:* before the command: "`HEAD~1` means 'one commit before `HEAD`'. The `~` is a tilde. On
    some keyboards you press it and then <kbd>Space</kbd>; if you cannot find it, use the Copy
    button. `--soft` means 'keep the changes'."

41. **lesson_11.md:231-235**: *Low.* The reader undoes the commit and then makes the same commit
    again, with the same message, and may not see the point. *Fix:* "Here you commit them again
    unchanged, to see that nothing was lost. In real life you would change something first, or
    commit the two files separately."

42. **lesson_11.md:253-254**: *Low.* "It also throws away your changes, and with them work that was
    never committed" is hard to parse. *Fix:* "`git reset --hard` undoes the commit *and* deletes
    its changes from your files, together with any work you have not committed. That work cannot
    be recovered."

43. **lesson_11.md:257-291**: *Medium.* Nothing says that a revert does not *hide* anything. For a
    beginner, the most likely "it is on GitHub and must go" case is a password or a private file
    (the quiz raises it at 378). A reader who reverts it believes it is gone, but it stays readable
    in the public history. *Fix:* add a pitfall after 291: "**A revert does not hide anything.**
    The old commit stays in the history, and anyone can read the history of a public repository.
    If you pushed a password or key, change it at once, on the site it belongs to. Removing it from
    the history is an advanced job." Add the same to the troubleshooting page (entry 59).

44. **lesson_11.md:299-311**: *Low.* `HEAD@{0}`, `HEAD@{1}` and so on are not explained. *Fix:*
    "`HEAD@{0}` is where `HEAD` is now, `HEAD@{1}` is where it was one step before, and so on."

45. **lesson_11.md:313-317**: *Medium.* `git branch rescue d562547` is marked as not run, but the
    lead says "Try each one".
    - A reader who copies it gets "fatal: not a valid object name: 'd562547'", because their hash
      is different.
    - A reader who uses their own hash is left with a stray `rescue` branch.
    - Doing what the text suggests ("merge it") would bring back the reading line they have just
      reverted.

    *Fix:* "You do not need to do this now. If you try it, use a hash from **your own** reflog,
    look around, then delete the branch with `git branch -D rescue` (a capital D, because its
    commit is not merged)."

46. **lesson_11.md:317-318 and 388**: *Medium (factual).* "Git keeps reflog entries for about three
    months" is true only for commits that are still on a branch. Commits on no branch are exactly
    the amended and reset ones this section is about, and for them the default is 30 days
    (`gc.reflogExpireUnreachable`). After that, a routine clean-up can delete them. A reader who
    relies on "three months" may wait too long. *Fix:* "Git keeps such 'lost' commits for at least
    a month (30 days by default), so rescue them soon." In the quiz explanation (388), write "for
    at least 30 days".

47. **lesson_11.md:320-335**: *Low.* A recipe is missing: "I want a file as it was in an older
    commit." Lesson 1 promises that the reader can "go back to any earlier version of a file". The
    detached-HEAD entry on the troubleshooting page shows that readers find `git checkout HASH` on
    their own. *Fix:* add a short recipe: find the hash with `git log --oneline`, run
    `git restore --source HASH index.html`, check the file, then commit. Add a matching row to the
    table.

48. **lesson_11.md:338**: *Low.* "Do not force it": "force" is never explained, yet web answers to
    this exact error say `git push --force`. *Fix:* "Do not use `git push --force`, which many
    websites suggest: it replaces GitHub's history with yours and can delete commits there."

## Cheat sheet

49. **cheatsheet.md:3**: *Low.* The page does not point to the troubleshooting page, so a stuck
    reader with an error message is on the wrong page. *Fix:* add to the lead: "Got an error
    message? See Troubleshooting."

50. **cheatsheet.md:56-76, 90**: *Low.* Some commands used in the lessons' trouble boxes are
    missing: `git branch -D NAME`, `git remote set-url origin URL`, `gh auth login`,
    `git commit --amend --no-edit`, and `git revert --abort` / `--continue`. *Fix:* add them to
    the Branches, Work with GitHub and Undo tables.

51. **cheatsheet.md:78-81**: *Low.* The steps on the website are packed into one long sentence,
    which is hard to scan. Three steps are missing: editing a file on GitHub (the pencil icon), the
    green **Code** button, and **Pull requests** > **New pull request**. *Fix:* turn the sentence
    into a small table with the columns "To …", "On GitHub" and "Lesson".

52. **cheatsheet.md:83-92**: *Medium.* The Undo table is where a worried reader looks first, and it
    has no row for "Find a commit that seems lost: `git reflog`" (that row is under History, line
    54) or for "Bring it back: `git branch NAME HASH`". Lesson 11's own table has the reflog row.
    *Fix:* add both rows to the Undo table.

53. **cheatsheet.md:94-103**: *Low.* The terminal section does not say how to paste
    (<kbd>Ctrl</kbd>+<kbd>V</kbd>, or <kbd>Cmd</kbd>+<kbd>V</kbd> on a Mac, in VS Code's terminal).
    It does not warn that <kbd>Ctrl</kbd>+<kbd>C</kbd> cancels rather than copies, or mention
    <kbd>Tab</kbd> to complete file names. *Fix:* add those rows.

54. **cheatsheet.md:105-127**: *Medium.* The glossary is missing words that Lessons 7 to 11 and
    Git's own messages use:
    - `origin/main` and `origin/HEAD`;
    - fetch;
    - track and upstream ("set up to track", "has no upstream branch");
    - reflog, revert and amend;
    - `HEAD~1`;
    - README and Markdown;
    - GitHub Pages and collaborator.

    Git's messages also say "working tree", while the glossary says "working folder". *Fix:* add
    entries such as:
    - "**`origin/main`**: your computer's note of where `main` is on GitHub, updated when you push,
      pull or fetch";
    - "**fetch**: downloading news from GitHub without changing your files; the first half of a
      pull";
    - "**upstream**: the branch on GitHub that your branch is paired with, set by `git push -u`";
    - "**working folder** (Git says *working tree*)".

## Troubleshooting

55. **troubleshooting.md:24-25**: *Low.* Readers may have a Git as old as 2.28 (Lesson 2 allows
    it), which words some lines differently. *Fix:* "…with Git 2.56. An older Git may word a few
    lines differently."

56. **troubleshooting.md:42-45** (also lesson_05.md:328-331): *High.* The Vim advice, "type `:wq`
    and press Enter", fails if the reader has already pressed keys, for example while trying to
    type a message. Vim is then in insert mode, and `:wq` goes into the text. This is how beginners
    get stuck in Vim. *Fix:* "Press <kbd>Esc</kbd> first, then type `:wq` and press Enter. To give
    up instead, press <kbd>Esc</kbd>, type `:q!` and press Enter."

57. **troubleshooting.md:47-57**: *Low.* Two gaps in this group.
    - "Aborting commit due to empty commit message." has no entry. It appears when the reader
      closes `COMMIT_EDITMSG` without writing anything. That is harmless: run the commit again with
      `-m`.
    - For `code: command not found`, Git's own line is "error: there was a problem with the editor
      'code --wait'". Put it in the heading so that a search finds it.

58. **troubleshooting.md:235, 515**: *Low.* Git's messages say "commit your changes or stash
    them", and "stash" is never explained, so a reader may go off to learn it in the middle of a
    problem. *Fix:* "(Git also mentions *stash*, a way to put changes aside. This series does not
    need it: commit, or `git restore`.)"

59. **troubleshooting.md:297-588**: *High.* Several messages that a reader of Lessons 7 to 10 is
    likely to meet are missing. Put the message itself in each heading, so that
    <kbd>Ctrl</kbd>+<kbd>F</kbd> finds it:
    - `fatal: The current branch NAME has no upstream branch`: run `git push -u origin NAME`
      (Lesson 10).
    - `There is no tracking information for the current branch` (`git pull` on a branch that was
      never pushed): push it first with `-u`, or switch to `main`.
    - A box at the top of VS Code, or the terminal, asks `Username for 'https://github.com'`: press
      <kbd>Esc</kbd> or <kbd>Ctrl</kbd>+<kbd>C</kbd>, then push again and sign in through the
      browser (Lesson 7). Outside VS Code, use `gh auth login`.
    - `fatal: Authentication failed for 'https://github.com/...'`: the sign-in was cancelled, or a
      wrong one is saved. Push again and allow the sign-in. If that does not help, delete the saved
      entry, as in the password entry.
    - `remote: Permission to OWNER/REPO.git denied to NAME` or `The requested URL returned error:
      403`: you cannot write to that repository. Either it belongs to someone else (fork it,
      Lesson 10), or you are signed in as another account. To sign out in VS Code, use the
      **Accounts** icon at the bottom of the left-hand bar; on Windows or macOS, delete the saved
      entry as in the password entry.
    - `Everything up-to-date` after `git push`: not an error. There are no new commits to send; if
      you expected some, you have not committed yet. Run `git status`.
    - `warning: adding embedded git repository: my-page-laptop`: you cloned inside your project
      (Lesson 9). Run `git restore --staged my-page-laptop`, then move the folder out or delete it.
    - "I pushed a password or a private file": change the password at once. A revert does not
      remove it from the history (entry 43).

## Verdicts

**Lesson 7.** Up to the push, the lesson is clear and well ordered, and the explanation of
`remote` and `origin` is good. The first push is where a reader working alone is most likely to
stall: the sign-in steps come after the command and its output, and three common cases are
missing (a hidden window, no window at all, and Cancel). Two traps from outside the text can also
derail the next steps: the Copy button pastes `your-username`, and GitHub offers its own "Add a
README" button.

**Lesson 8.** It is short, accurate and easy to follow. The only real gap is that the "private
repository" trouble entry gives the cause but not the fix.

**Lesson 9.** The edit on GitHub and the rejected push are the best-taught part of these lessons,
and the reassurance comes at the right moment. The weak spots are the clone section and one step
told too late. The clone section never shows how to find another repository's address, keeps a
placeholder in the command, and does not say that VS Code's file list stays on `my-page`. The
`MERGE_MSG` step comes only after the output.

**Lesson 10.** The walk through a pull request matches GitHub's pages closely, and the
eight-word routine is a good summary. However, the conflict recipe does not work when `main`
changed on GitHub, and the most common error at this step (a plain `git push` on a new branch) is
not covered. The merge commit that GitHub makes contradicts Lesson 5's fast-forward rule without
saying so. The fork section is too thin to act on alone.

**Lesson 11.** It is well organised as recipes, with the right two rules, good reassurance and a
useful decision table. It needs four fixes. The reflog's three-month claim is wrong for lost
commits. `HEAD~1` (and how to type `~`) and `HEAD@{n}` need explaining. The `rescue` step needs to
be made safe. Readers need a warning that a revert does not hide a pushed password.

**Cheat sheet.** It is well grouped, easy to scan for a command, and the daily routine at the top
is ideal. It is weaker when the reader is stuck. The Undo table lacks the reflog rescue, a few
commands from the trouble boxes are missing, and the glossary lacks the words from Lessons 7 to 11
that Git prints (`origin/main`, fetch, track and upstream).

**Troubleshooting.** The structure is right: the headings are the messages, they are grouped by
activity, there is an "On this page" box, and "Before anything else" is excellent. However,
several messages a reader of Lessons 7 to 10 is very likely to see are missing: no upstream
branch, Authentication failed, Permission denied (403), the username prompt, and Everything
up-to-date. The Vim recipe also misses <kbd>Esc</kbd>, which is the step that actually gets people
out.

## The three most important changes

1. **Make the first push in Lesson 7 hard to get wrong** (entries 4, 6, 7, 8). Put the sign-in
   steps *before* `git push -u origin main`, and say that the terminal waits. Cover three cases: a
   window hidden behind VS Code (Windows), no prompt because the reader is already signed in, and
   Cancel followed by a username box. At `git remote add`, say exactly where to paste, and that
   the Copy button copies `your-username` (the same applies to the clone in Lesson 9).
2. **Fix what fails in Lesson 10, and add the missing everyday errors** (entries 28, 34, 56, 59).
   The conflict recipe must update `main` from GitHub (`git switch main`, `git pull`) before
   `git merge main`. Add "has no upstream branch" to Lesson 10 and to the troubleshooting page,
   together with "Authentication failed", "Permission … denied / 403", the username prompt and
   "Everything up-to-date". Add <kbd>Esc</kbd> to the Vim recipe.
3. **Warn about the GitHub pages that lead to wrong actions, and fill the gap for cloning others'
   projects** (entries 10, 20, 30, 32, 36). Tell readers not to click GitHub's "Add a README"
   button in Lesson 7. Show the green **Code** button as the way to get any repository's address
   (needed for Lesson 9's goal and for forks). Correct the "three tabs" on the pull request page.
   Explain that GitHub always makes a merge commit, where Lesson 5 would predict a fast-forward.
