# Isabelle tutorial sources

The tutorial is authored directly in `docs/tutorials/isabelle/`. MkDocs builds
those Markdown pages with the existing site theme; there is no separate page
generator. Edit the guide, exercises and reference there.

- `index.md`: introductory guide and guard explorer.
- `exercises.md`: eight exercises with expandable solutions.
- `reference.md`: notation, proof methods and troubleshooting.
- `examples/Isabelle_Tutorial.thy`: canonical teaching theory.
- `examples/Exercise_Answers.thy`: complete exercise answers.
- `examples/ROOT`: the independent `Isabelle_Web_Tutorial` session.
- `examples/proof-status.json`: proof-check provenance and source hashes.
- `examples/isabelle-tutorial.zip`: downloadable source bundle.
- `assets/guard.js` and `guard.css`: scoped browser illustration.

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
3. Run `python tutorial-sources/isabelle/check.py` for source and download checks.
4. Run `python -m mkdocs build --strict --site-dir /path/to/built/site`, then the
   checker again. Check the guard and exercise answers in the browser at desktop
   and mobile widths.

A typical browser walkthrough: admit target 60; reject target 120 without moving
the current angle; reject a latched or unsupported lid; reset the controls;
verify the copyable Isabelle expression and open an exercise answer.

The existing deployment workflow publishes after a push to `main`. Source edits
and a local preview alone do not update GitHub Pages.
