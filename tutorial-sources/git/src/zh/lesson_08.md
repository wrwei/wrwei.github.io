---
title: 用 GitHub Pages 发布网页
lead: 开启 GitHub Pages，你的网页就上线了，还有属于你自己的地址。之后，推送一次就能更新它。
minutes: 15
needs: 第 7 课（`my-page` 已经放在 GitHub 上，并且是公开仓库）
goals:
  - 用 GitHub Pages 把一个仓库发布成网站
  - 找到你的网站的地址
  - 通过推送一个提交来更新网站
---

## GitHub Pages 是做什么的 {#what}

**GitHub Pages** 会把你某个仓库（repository）里的文件放到网上，变成一个网站，而且是免费的。你的 `my-page` 仓库已经具备了所需的一切：顶层有一个 `index.html`，也就是浏览器最先显示的页面。

你的网页将位于下面这个地址，其中的用户名是你自己的：

`https://your-username.github.io/my-page/`

有两个条件：在免费的 GitHub 账号上，仓库必须是**公开的**（你的仓库在第 7 课已经设为公开）；并且 `index.html` 必须位于你所发布的文件夹（folder）的顶层，在这里就是 `main` 分支（branch）的顶层。

## 开启 GitHub Pages {#enable}

::: where github
1. 打开你的仓库 `https://github.com/your-username/my-page`。
2. 在仓库名称下方，点击 **Settings**（设置）标签页，它带有一个齿轮图标。如果看不到它，就点击标签页末尾的 **...** 菜单，然后点击 **Settings**。
3. 在左侧边栏的“Code, planning, and automation”（代码、规划与自动化）部分中，点击 **Pages**（页面）。
4. 在“Build and deployment”（构建与部署）下的“Source”（来源）中，选择 **Deploy from a branch**（从分支部署）。
5. 在“Branch”（分支）下，第一个菜单选择 **main**，第二个菜单选择 **/ (root)**（根目录）。点击 **Save**（保存）。
:::

::: figure id=fig-08-1
Pages 设置（简化示意图）：在“Build and deployment”下，来源是“Deploy from a branch”，分支是 `main`，文件夹是 `/ (root)`。然后点击 Save。
:::

`/ (root)` 的意思是“分支的顶层”，也就是你的 `index.html` 所在的位置。

## 稍等片刻，然后访问你的网站 {#visit}

GitHub 现在开始构建你的网站。通常需要一两分钟；GitHub 说最长可能需要 10 分钟。

::: where github
1. 刷新 Pages 设置页面。网站准备好后，页面上会显示你的网站地址，以及一个 **Visit site**（访问网站）按钮。
2. 点击 **Visit site**。你的网页打开了：深色主题、标题和你的爱好都在，而且是在互联网上。
:::

把这个地址发给朋友吧：任何人都能打开它。

::: tip
想看 GitHub 发布网站的过程，可以打开仓库的 **Actions**（操作）标签页。每次发布都会在那里显示为一次工作流运行（workflow run），完成后会出现一个绿色的对勾。
:::

## 修改网页，再次发布 {#update}

从现在起，每次推送（push）到 `main` 都会更新网站。试一试：修改 `index.html` 中的第一段，也就是高亮显示的那一行。

```file index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About me</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Welcome to my page!</h1>
  <p>This is my first web page, published with GitHub Pages.</p>
  <p>I like walking, photography and good coffee.</p>
  <h2>My hobbies</h2>
  <ul>
    <li>Walking</li>
    <li>Photography</li>
  </ul>
</body>
</html>
```

```terminal
$ git add index.html
$ git commit -m "Mention GitHub Pages"
[main a478f84] Mention GitHub Pages
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 402 bytes | 402.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/your-username/my-page.git
   315e479..a478f84  main -> main
```

等一分钟，然后在浏览器中刷新你的网站。新句子出现了。

::: tip
浏览器会保存它显示过的页面的副本。如果你看不到自己的修改，就强制重新加载一份新的：在 Windows 和 Linux 上按 <kbd>Ctrl</kbd>+<kbd>F5</kbd>；在 Mac 上按 <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>（在 Safari 中按 <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>R</kbd>）。
:::

::: trouble
**出现 404 页面：“There isn't a GitHub Pages site here.”**（这里没有 GitHub Pages 网站。）等几分钟：第一次发布花的时间最长。如果一直是这样，就在 Pages 设置中检查来源是不是 `main` 和 `/ (root)`，以及你的文件名是不是正好叫 `index.html`，并且位于仓库的顶层。

**页面出来了，但没有颜色。**浏览器找不到 `style.css`。在网上，文件名是区分大小写的：`Style.css` 和 `style.css` 是两个不同的文件。修改 `<link>` 那一行，让它和 GitHub 列出的文件名完全一致。（在 Windows 和 macOS 上，Git 察觉不到从 `Style.css` 到 `style.css` 的改名，所以给文件改名是没有用的。）

**Settings 里没有 Pages 选项，或者 Pages 设置要求你升级。**这个仓库是私有的。在免费账号上，Pages 需要公开仓库。把它设为公开：在 **Settings** 的 **General**（常规）页面上，向下滚动到“Danger Zone”（危险区域），点击 **Change visibility**（更改可见性），然后按照确认提示一步步操作，把仓库设为公开。（这个部分虽然叫“Danger Zone”，但对这个项目来说，这个更改是安全的。）

**我的修改没有出现。**运行 `git status`。如果它说你的分支领先于（ahead of）`origin/main`，就说明你还没有推送。如果已经推送了，就等一分钟，然后强制重新加载页面（见上面的提示）。
:::

## 小结 {#summary}

- **GitHub Pages** 把一个仓库的文件发布成网站，地址是 `https://your-username.github.io/REPOSITORY/`。
- 只需开启一次：**Settings** > **Pages** > **Deploy from a branch** > `main`、`/ (root)` > **Save**。
- 之后，每次推送到 `main` 都会更新网站，通常在一两分钟内完成（GitHub 说最长可能需要 10 分钟）。
- 网上的文件名区分大小写。

| 命令 | 作用 |
|---|---|
| `git add FILE`、`git commit -m "..."`、`git push` | 合在一起：把一处修改发布到你的网站 |

## 自测题 {#quiz}

```quiz
? 你的仓库是 `my-page`，你的用户名是 `alex`。你的网站在哪里？
- [ ] `https://github.com/alex/my-page`
- [x] `https://alex.github.io/my-page/`
- [ ] `https://my-page.github.io/alex/`
> 第一个地址是 GitHub 上的仓库。网站的地址是你的用户名加上 `.github.io`，后面再跟仓库名称。

? 你修改了 `index.html` 并且提交（commit）了，但网站没有变化。最可能的原因是什么？
- [ ] GitHub Pages 一天只更新一次
- [x] 你还没有推送这个提交
- [ ] 你必须先关闭 Pages，再重新开启
> Pages 发布的是 GitHub 上的内容。你电脑上的提交，在推送之前不会出现在 GitHub 上。

? 浏览器打开你的网站地址时，最先显示的是哪个文件？
- [x] `index.html`
- [ ] `README.md`
- [ ] `style.css`
> `index.html` 是入口页面。如果没有它，Pages 会退而使用 `README.md`，而这不是你在这里想要的。
```
