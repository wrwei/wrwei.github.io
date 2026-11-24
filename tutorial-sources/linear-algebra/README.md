# Linear Algebra

A series of 12 lessons in English and simplified Chinese, from vectors and elimination to orthogonal factorisations, least squares, eigenvalues, SVD and PCA. Each lesson includes a Python calculation, worked exercises and a self-check quiz. The interactive demonstrations reuse the corresponding Mathematical Foundations controls.

The lesson sources live in src/en and src/zh. They use the Markdown renderer, styles and calculation runner from the sibling Calculus series. From this directory, with the Calculus Python and Node dependencies installed, run the following commands.

```sh
python3 -I tools/check.py
python3 -I tools/check.py --lang zh
node tools/build.mjs
```

The first two commands check the examples in both languages. The English check writes the shared Python download. Open out/site/index.html or out/site/index_ZH.html after building. Pass a destination directory to the build command to generate a site copy.

When editing a Python block, update it in both languages. Run each checker with --update to regenerate the outputs, then run both checkers again before building.
