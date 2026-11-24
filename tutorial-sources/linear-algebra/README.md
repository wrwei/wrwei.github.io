# Linear Algebra

An English series of 12 lessons from vectors and elimination to orthogonal factorisations, least squares, eigenvalues, SVD and PCA. Each lesson includes a Python calculation, worked exercises and a self-check quiz. The interactive demonstrations reuse the corresponding Mathematical Foundations controls.

The lesson sources live in src/en. They use the Markdown renderer, styles and calculation runner from the sibling Calculus series. From this directory, with the Calculus Python and Node dependencies installed, run the following commands.

```sh
python3 -I tools/check.py
node tools/build.mjs
```

The first command checks the examples and writes the Python download. The second builds the tutorial into out/site. Open out/site/index.html to start. Pass a destination directory to the build command to generate a site copy.

When editing a Python block, run the checker with --update to regenerate its output, then run it again without --update before building.
