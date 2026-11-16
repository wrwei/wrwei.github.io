# Facts about Isabelle2026 used in the series

Every fact about Isabelle that the pages state is listed here with its source. Sources are the
Isabelle web site (read 16 November 2026), the Isabelle2026 Linux bundle (`Isabelle2026_linux.tar.gz`,
ISABELLE_ID `096842708b28`) and its manuals in `doc/`, and screenshots of Isabelle2026/jEdit running
on Linux in this project (scratchpad, `jedit/`). Outputs of Isabelle are not listed here: they are
produced by `tools/isa.py` and checked on every build.

## Release and download

| Fact | Source |
|---|---|
| The current release is **Isabelle2026 (October 2026)**. | isabelle.in.tum.de home page, "Now available: Isabelle2026 (October 2026)", last updated 2026-10-05 |
| Downloads: Linux, Linux (ARM), Windows, macOS (ARM), macOS (Intel). | home page |
| Hardware: small experiments 4 GB memory, 2 CPU cores; medium applications 8 GB, 4 cores; large projects 16–32 GB, 8 cores. | home page, "Hardware requirements" |
| Isabelle is free, under several open-source licences; the main code base is BSD-style. | home page, "Distribution & Support" |
| Support: isabelle-users mailing list, Zulip chat, Stack Overflow. | home page |
| Isabelle was originally developed at the University of Cambridge and Technische Universität München. | home page, "What is Isabelle?" |
| The Archive of Formal Proofs is a large collection of Isabelle developments. | home page |

## Installation (isabelle.in.tum.de/installation.html, last updated 2026-10-06)

| Platform | Steps |
|---|---|
| Linux | Download `Isabelle2026_linux.tar.gz`; `tar -xzf Isabelle2026_linux.tar.gz`; start the IDE with `Isabelle2026/Isabelle2026`; command-line tools with `Isabelle2026/bin/isabelle`. Needs a window manager or desktop that works with Java/AWT/Swing. |
| Windows 10, 11 | `Isabelle2026.exe` is a self-extracting archive; unpack it into any directory. The installer starts Isabelle/jEdit the first time and creates a desktop alias. The application lacks developer signatures, so Microsoft rejects it by default: the first start "requires some careful clicks in the proper spots". Windows Defender may stop external provers (Sledgehammer, `smt`); then exclude the Isabelle directory from Virus & threat protection. `Isabelle2026\Cygwin-Terminal` runs command-line tools. |
| macOS (Apple Silicon 13, 14, 15, 26, 27; Intel 12–15) | Download `Isabelle2026_macos_arm.tar.gz` (or the Intel one); put the application in `/Applications` and start it as usual. It lacks developer signatures, so Apple rejects it by default: open `Isabelle2026.app` and press Cancel in the security dialog; open System Settings, Privacy & Security, where "Allow apps …" lists the blocked application; click Open Anyway and confirm. |
| Docker | `docker pull makarius/isabelle:Isabelle2026` (Ubuntu 22.04, no GUI); ARM: `makarius/isabelle:Isabelle2026_ARM`. |
| LaTeX (optional, for documents only) | TeX Live (Linux), MiKTeX (Windows), MacTeX (macOS). Not needed for this series. |

## What the bundle contains (Linux bundle, `contrib/` and `doc/`)

- Java runtime `jdk-25.0.4`, jEdit `jedit-20260515`, Poly/ML `polyml-5.9.2-6`, Scala `scala-3.3.8-1`.
- Automatic provers used by Sledgehammer, Nitpick and `smt`: `cvc5-1.3.4`, `e-3.2`, `spass-3.8ds-5`,
  `vampire-4.8-2`, `verit-2026.05`, `z3-4.4.0pre-8`, `zipperposition-2.1-2`, `kodkodi-20260628`
  (Nitpick), `minisat-2.2.1-2`.
- Manuals in `doc/`: `prog-prove.pdf` (Programming and Proving in Isabelle/HOL), `isar-ref.pdf`,
  `jedit.pdf`, `main.pdf` (What's in Main), `tutorial.pdf`, `nitpick.pdf`, `sledgehammer.pdf`,
  `functions.pdf`, `datatypes.pdf`, `codegen.pdf`, `locales.pdf`, `classes.pdf` and more. The
  Documentation panel in jEdit lists them under "Isabelle Tutorials" and "Isabelle Reference Manuals".
- Fonts `isabelle_fonts-20241227` (Isabelle DejaVu); the pages use the same font for Isabelle text.

## Isabelle/jEdit, as it appears (screenshots, Isabelle2026 on Linux)

- Menu bar: File, Edit, Search, Markers, Folding, View, Utilities, Plugins, Isabelle, Options, Help.
- Docked panels on first start: left **Documentation** and **File Browser**; right **HyperSearch Results**,
  **Sidekick**, **State**, **Theories**; bottom **Output**, **Query**, **Sledgehammer**, **Symbols**.
  The Theories panel is open on the right; the Output panel is closed until you click its tab.
- Theories panel: **Purge** button, **Continuous checking** (ticked), status **Prover: ready**, the logic
  ("Default (HOL)"), and the open theories, each with a check box.
- Output panel controls: **Proof state** (not ticked by default), **Auto hovering** (ticked), **Auto update**
  (ticked), **Update** button, **Search:** field, zoom (100%).
- The Output panel shows the messages of the command at the cursor. Proof states appear in it only when
  **Proof state** is ticked; otherwise they appear in the separate **State** panel. Ticking it "is a
  globally persistent option: it affects all open panels and future editor sessions." (jedit.pdf §3.2, §3.3)
- A blue **i** in the left gutter marks a line with an information message, for example from
  Auto solve_direct or Auto Quickcheck, which Isabelle/jEdit runs on every new `lemma` statement.
  Seen messages: "Auto solve_direct: the current goal can be solved directly with
  List.rev_rev_ident: rev (rev ?xs) = ?xs" and "Auto Quickcheck found a counterexample:".
  In batch builds (`isa.py`) these automatic tools do not run, so the pages call `quickcheck`,
  `nitpick` or `solve_direct` explicitly when they show such output.
- Status bar: cursor line,column, encoding `UTF-8-Isabelle`, ML heap use.
- Positions inside messages (for example "Failed to finish proof⌂:") are shown as a clickable ⌂; batch
  builds print them as `(line N of "file")`, and `isa.py` writes ⌂ instead, as jEdit shows them.

## Typing symbols (jedit.pdf §2.2, table from `etc/symbols`)

| Symbol | Name with backslash | Abbreviation |
|---|---|---|
| λ | `\lambda` | `%` |
| ⇒ | `\Rightarrow` | `=>` |
| ⟹ | `\Longrightarrow` | `==>` |
| ⋀ | `\And` | `!!` |
| ≡ | `\equiv` | `==` |
| ∀ | `\forall` | `!` |
| ∃ | `\exists` | `?` |
| ⟶ | `\longrightarrow` | `-->` |
| ∧ | `\and` | `&` |
| ∨ | `\or` | `\|` |
| ¬ | `\not` | `~` |
| ≠ | `\noteq` | `~=` |
| ∈ | `\in` | `:` |
| ∉ | `\notin` | `~:` |

Other input methods (same section): the Symbols panel; copy and paste of rendered Unicode text between
applications (so copying a block from the pages into jEdit works); completion of a symbol's name after
a backslash. The pages show Unicode and tell readers to type the abbreviation or `\name` and accept the
completion (Tab or Return, jedit.pdf §3.7).

## Keyboard actions in jEdit (jedit.pdf §3.2)

`isabelle.tooltip` CS+b, `isabelle.message` CS+m, `isabelle.line-status` CS+l, `isabelle.first-error`
CS+a, `isabelle.last-error` CS+z, `isabelle.next-error` CS+n, `isabelle.prev-error` CS+p
(C = Control, S = Shift; Command instead of Control on macOS).
