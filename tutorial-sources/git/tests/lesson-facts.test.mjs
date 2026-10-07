// Facts in the lessons that a review found wrong once. Each check names the claim it protects, so a
// later edit cannot quietly bring the mistake back.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lesson = (lang, n) => fs.readFileSync(path.join(ROOT, 'src', lang, `module_${String(n).padStart(2, '0')}.md`), 'utf8');

test('Module 5 does not claim that every kind of conflict is finished the same way', () => {
  assert.doesNotMatch(lesson('en', 5), /the steps to resolve them are the same every time/);
  assert.match(lesson('en', 5), /Only the command that finishes or abandons the operation differs/);
  assert.match(lesson('en', 5), /`git revert --continue`/);
  assert.doesNotMatch(lesson('zh', 5), /解决步骤每次都相同/);
  assert.match(lesson('zh', 5), /`git revert --continue`/);
});

test('Module 5 checks a staged resolution with git diff --staged --check', () => {
  for (const lang of ['en', 'zh']) {
    const text = lesson(lang, 5);
    assert.equal((text.match(/`git diff --staged --check`/g) || []).length, 2, `${lang}: Section 5 and Exercise 6 both name it`);
  }
  assert.doesNotMatch(lesson('en', 5), /without arguments, for your unstaged changes\) before you commit a resolution/);
});

test('Module 5 tells learners how to recreate each situation in their own repository', () => {
  const en = lesson('en', 5);
  assert.match(en, /To follow along, first give your recipe a `- 50 g sugar` line/);
  assert.match(en, /To follow along, create `less-sugar`/);
  assert.match(en, /`less-sugar` is already merged/);
  const zh = lesson('zh', 5);
  assert.match(zh, /要跟着操作，请先给你的食谱加上一行 `- 50 g sugar`/);
  assert.match(zh, /要跟着操作，请创建 `less-sugar`/);
  assert.match(zh, /`less-sugar` 已经合并/);
});

test('coding exercises say how to set up what they assume', () => {
  assert.match(lesson('en', 3), /To try it, first create `passwords\.txt` with any text, and commit it\./);
  assert.match(lesson('zh', 3), /要动手试试，请先创建 `passwords\.txt`（内容随意）并提交它。/);
  assert.match(lesson('en', 3), /keep the lines already there/);
  assert.match(lesson('en', 4), /To try it, first create `experiment`, commit something on it, and switch back to `main`\./);
  assert.match(lesson('zh', 4), /要动手试试，请先创建 `experiment`，在上面提交一些内容，再切换回 `main`。/);
  assert.match(lesson('en', 5), /To try it, make a conflict as in Section 3, then `git add` and commit the file without removing the markers\./);
  assert.match(lesson('zh', 5), /要动手试试，请像第 3 节那样制造一次冲突，然后不删除标记就 `git add` 并提交该文件。/);
});

test('the Chinese Module 3 says that git revert, not every undo, needs a clean working tree', () => {
  assert.doesNotMatch(lesson('zh', 3), /撤销要求工作区是干净的/);
  assert.match(lesson('zh', 3), /`git revert` 要求工作区是干净的/);
});

test('Module 6 tells learners where to put their stand-in server', () => {
  for (const lang of ['en', 'zh']) {
    assert.match(lesson(lang, 6), /`git init --bare \.\.\/server\/recipes\.git`/, lang);
    assert.match(lesson(lang, 6), /`git config user\.name "Sam Lee"`/, `${lang}: Sam's name is set in Sam's clone only`);
  }
  assert.match(lesson('en', 6), /Wherever the pages show `\/srv\/git\/recipes\.git`, type that path instead\./);
  assert.match(lesson('zh', 6), /页面上凡是出现 `\/srv\/git\/recipes\.git` 的地方，请改用这个路径。/);
});

test('Module 7 says to prune before deleting a squash-merged branch', () => {
  assert.match(lesson('en', 7), /Prune first: while `origin\/add-soups` still exists in your repository, `-d` checks against it/);
  assert.match(lesson('zh', 7), /请先清理：只要你的仓库中还存在 `origin\/add-soups`，`-d` 就会以它为准/);
});

test('Module 8 shows the to-do list of its squash session, whose hashes the session tests pin', () => {
  for (const lang of ['en', 'zh']) {
    assert.match(lesson(lang, 8), /`{3}text\npick bc5616c # Add a tomato soup recipe\nfixup 2b52993 # fixup! Add a tomato soup recipe\npick 49f29eb # Add a soda bread recipe\n\n# Rebase 8bf3c2d\.\.2b52993 onto 8bf3c2d \(3 commands\)\n`{3}/, lang);
  }
});

test('Module 8 says which side of a rebase conflict is yours', () => {
  assert.match(lesson('en', 8), /in a rebase, `<<<<<<< HEAD` holds `main`'s version/);
  assert.match(lesson('zh', 8), /在变基中，`<<<<<<< HEAD` 下面是 `main` 的版本/);
});

test('Module 6 covers Windows: pull merges at once there, and paths with spaces need quotes', () => {
  assert.match(lesson('en', 6), /On Windows, the Git installer asks how `git pull` should behave and, by default, sets `pull\.rebase false` for you\./);
  assert.match(lesson('zh', 6), /在 Windows 上，Git 安装程序会询问 `git pull` 应该怎样工作，并默认替你设置 `pull\.rebase false`。/);
  assert.match(lesson('en', 6), /If the path contains a space, put it in quotes\./);
  assert.match(lesson('zh', 6), /如果路径中含有空格，请给它加上引号。/);
});

test('follow-along steps in Modules 6 to 8 work in a repository that went through the earlier modules', () => {
  assert.match(lesson('en', 6), /use a new branch name, such as `salads`: your repository already has a `soups` branch from Module 4\./);
  assert.match(lesson('zh', 6), /请换一个新的分支名，例如 `salads`：你的仓库中已经有第 4 模块留下的 `soups` 分支。/);
  assert.match(lesson('en', 6), /First run `git pull` in your recipes folder, so that it has Sam's work from Section 5\./);
  assert.match(lesson('zh', 6), /先在你的 recipes 文件夹中运行 `git pull`，让它包含 Sam 在第 5 节中的工作。/);
  assert.match(lesson('en', 7), /point Sam's existing clone at GitHub: in Sam's window, run `git remote set-url origin` with the GitHub address, then `git pull`\./);
  assert.match(lesson('zh', 7), /请让 Sam 现有的克隆指向 GitHub：在 Sam 的窗口中用 GitHub 地址运行 `git remote set-url origin`，然后运行 `git pull`。/);
  assert.match(lesson('en', 8), /on a new branch such as `less-sugar-2`, because `less-sugar` already exists in your repository\./);
  assert.match(lesson('zh', 8), /但使用一个新分支，例如 `less-sugar-2`，因为你的仓库中已经有 `less-sugar` 了。/);
  assert.match(lesson('en', 8), /To follow along, add a line to any recipe and commit it with `git commit -am`\./);
  assert.match(lesson('zh', 8), /要跟着操作，请在任意一份食谱中加一行，并用 `git commit -am` 提交。/);
});

test('Module 7 does not claim that you can approve your own pull request', () => {
  assert.doesNotMatch(lesson('en', 7), /you can open, review and merge your own pull requests/);
  assert.match(lesson('en', 7), /GitHub does not let a pull request's author approve it or request changes, so submit your practice review with \*\*Comment\*\*\./);
  assert.match(lesson('zh', 7), /GitHub 不允许拉取请求的作者批准它或要求修改，所以练习审查时请用 \*\*Comment\*\* 提交。/);
});

test('Module 7 exercises and quiz agree with Git and with the lesson', () => {
  assert.match(lesson('en', 7), /After `git pull` and `git fetch --prune`, `git branch -d add-soups` refuses/);
  assert.match(lesson('zh', 7), /运行 `git pull` 和 `git fetch --prune` 之后，`git branch -d add-soups` 拒绝执行/);
  assert.match(lesson('en', 7), /3\. A clone: it stays on your computer, needs no account, and nobody sees it\./);
  assert.match(lesson('zh', 7), /3\. 克隆：它只在你的电脑上，不需要账户，也没有人能看到。/);
  for (const lang of ['en', 'zh']) assert.doesNotMatch(lesson(lang, 7), /^- \[ \] `git pull`$/m, `${lang}: with fetch.prune set, git pull also prunes`);
});

test('Module 8 recovers a deleted branch from the line below the checkout in the reflog', () => {
  assert.match(lesson('en', 8), /the line just below it shows where HEAD was before, the last commit of `experiment`/);
  assert.match(lesson('zh', 8), /紧挨在它下面的那一行才是 HEAD 之前所在的位置，即 `experiment` 的最后一次提交/);
});

test('Module 9 warns against editing the .git folder by hand', () => {
  assert.match(lesson('en', 9), /Never edit or delete files inside `\.git` by hand\./);
  assert.match(lesson('zh', 9), /永远不要手动编辑或删除 `\.git` 中的文件。/);
});

test('Module 10 says that tags need their own push, and that nobody can approve their own pull request', () => {
  assert.match(lesson('en', 10), /Tags are not pushed by `git push`; push each one by name, as in `git push origin v1\.0`\./);
  assert.match(lesson('zh', 10), /`git push` 不会推送标签；请按名字逐个推送，例如 `git push origin v1\.0`。/);
  assert.match(lesson('en', 10), /GitHub does not let anyone approve their own pull request/);
  assert.match(lesson('zh', 10), /GitHub 不允许任何人批准自己的拉取请求/);
});
