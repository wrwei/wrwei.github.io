# Isabelle tutorial sources

The model-verification project is part of Formal Methods with Isabelle. Edit
the guide, exercises and quick reference in
`docs/tutorials/formal-methods/model-verification/`. The same three files
under `zh/` are the Simplified Chinese edition. MkDocs builds both editions
with the site theme.

- `index.md`: introductory guide and guard explorer.
- `exercises.md`: eight exercises with expandable solutions.
- `reference.md`: notation, proof methods and troubleshooting.
- `assets/guard.js` and `guard.css`: scoped browser illustration.

The checked files and ZIP live at their original download URLs under
`docs/tutorials/isabelle/`. The three old article URLs forward to the
project pages and carry over section fragments.

- `examples/Isabelle_Tutorial.thy`: canonical teaching theory.
- `examples/Exercise_Answers.thy`: complete exercise answers.
- `examples/ROOT`: the independent `Isabelle_Web_Tutorial` session.
- `examples/proof-status.json`: proof-check provenance and source hashes.
- `examples/isabelle-tutorial.zip`: downloadable source bundle.

The `<!-- checked: Theory.thy -->` markers identify excerpts that must occur in
the named theory after Isabelle symbol escapes are rendered. Keep the canonical
source and those excerpts together when making changes.

The guard explorer calculates individual integer cases in JavaScript. It does
not run Isabelle in the browser. Its labels state this; the theory proves the
general property separately.

## Verify changes

1. Run Isabelle2025-2 on `docs/tutorials/isabelle/examples/`:

   ```sh
   /path/to/isabelle build -D docs/tutorials/isabelle/examples
   ```

2. Record the successful version and source hashes in `proof-status.json`, and
   refresh the ZIP with both theories, `ROOT`, the proof record and its README.
   Do not retain a successful proof record after changing an unchecked theory.
3. Run `python tutorial-sources/isabelle/check.py` to check code-block parity,
   proof excerpts in both languages and the shared download.
4. Run `python -m mkdocs build --strict --site-dir /path/to/built/site`, then the
   checker again. Check the guard and exercise answers in the browser at desktop
   and mobile widths.

A typical browser walkthrough: admit target 60; reject target 120 without moving
the current angle; reject a latched or unsupported lid; reset the controls;
verify the copyable Isabelle expression and open an exercise answer.

The existing deployment workflow publishes after a push to `main`. Source edits
and a local preview alone do not update GitHub Pages.
