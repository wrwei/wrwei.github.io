## Prepare array notation before linear algebra {#start}

NumPy stores numerical arrays and applies operations to their entries or axes. A mathematical vector and its storage array are related but distinct: a three-coordinate vector may be stored as a flat array, a row, or a column. Reading the shape lets you decide which operation the code actually performs. Complete this orientation before the first numerical lab in Module 09; learners already familiar with these rules can use the exit check.

Allow about thirty minutes. This is preparation time for the numerical branch, additional to the module estimates when you need it. Basic Python lists, loops, calls, and script execution come from the [Python primer](python_primer_EN.html). The geometric meaning of dot products and lengths is developed in Module 09; here the objective is to read and run the array syntax.

## Use the tested numerical environment {#setup}

The current tested baseline is CPython 3.11.8 with NumPy 1.26.4 on a Windows CPU. The numerical requirements are recorded in `tutorial-sources/math/requirements.txt` in the repository. Modules 01–08 use only the standard library. Use a separate environment for the numerical labs so that the chosen packages are easy to reproduce.

From the repository root in PowerShell, using an installed Python 3.11 interpreter:

```powershell
python -m venv .venv-math
.\.venv-math\Scripts\python.exe -m pip install -r tutorial-sources/math/requirements.txt
.\.venv-math\Scripts\python.exe -c "import numpy as np; print(np.__version__)"
.\.venv-math\Scripts\python.exe tutorial-sources/math/labs/numpy_primer/orientation.py
```

For the tutorial builder, set its lab interpreter explicitly if needed:

```powershell
$env:MATH_PYTHON = (Resolve-Path .\.venv-math\Scripts\python.exe).Path
node tutorial-sources/math/build.mjs
```

The virtual environment is local and is not course content. An import failure means the selected interpreter lacks the package; check which interpreter the terminal or editor runs. The pinned baseline is a tested combination, not a claim that every later Python or package release has been checked. You can run the downloaded lab directly with the same interpreter even when studying only the published pages.

If you are using downloaded scripts rather than a repository checkout, save the [numerical requirements file](labs/requirements.txt) alongside `orientation.py`. From that download folder, run `python -m pip install -r requirements.txt` in your chosen Python 3.11 environment, then `python orientation.py`. The repository paths above are for a full checkout; a saved standalone script does not require the site builder.

## Arrays values and shapes {#arrays}

`import numpy as np` binds a short name for the package. `np.array([1,2,3], dtype=float)` creates a numerical array with shape `(3,)`: one axis containing three entries. `dtype=float` deliberately chooses floating-point storage. A list's `+` concatenates lists, whereas an array's `+` adds compatible entries. Identical symbols in Python do not guarantee identical mathematical operations across types.

| Expression | Shape or meaning |
|---|---|
| `v.shape` | Tuple of axis lengths |
| `v.ndim` | Number of array axes |
| `v.size` | Total entry count |
| `v[None, :]` | Add a row axis, yielding `(1,3)` for this v |
| `v[:, None]` | Add a column axis, yielding `(3,1)` |
| `v.T` | Reverse axes; a flat `(3,)` array stays flat |

The comma in `(3,)` marks a one-element tuple. Array `ndim` is not the dimension of a mathematical vector space or a matrix's algebraic rank. A `(100,3)` table has two array axes and one hundred rows of three coordinates; those are three separate counts.

Zero-based `table[1,:]` selects the second row, and `table[:,0]` selects the first column. The colon means all entries on that axis. `sum(axis=1)` reduces the column axis and gives one sum per row; `sum(axis=0)` reduces the row axis and gives one sum per column. Before a reduction, state which entries belong to the same object and which axis you intend to remove.

## Operators broadcasting and a deliberate fault {#operations}

`v*v` is entrywise multiplication; for this example it gives [1,4,9]. For two compatible flat vectors, `v @ v` is their dot product, the sum of pairwise products, fourteen. Matrices and the general shape rule for `@` return in Module 10. A scalar such as `2*v` multiplies all entries. These operators should be chosen from the intended mathematical operation, not from whichever one happens to run.

**Broadcasting** aligns shapes from their last axes. Two aligned axis lengths must be equal or one must be one; missing leading axes behave as length one. Thus `(3,1)+(3,)` aligns as `(3,1)+(1,3)` and yields `(3,3)`, all pairwise additions. This can run successfully while implementing the wrong pairing. Reshape the second operand to `(3,1)` when the intention is three paired column entries. Check both inputs and the output, rather than assuming no exception proves correctness.

::: worked title="Predict a successful but wrong-shaped operation"
A column [1,2,3] of shape `(3,1)` plus flat [1,2,3] of shape `(3,)` yields rows [2,3,4], [3,4,5], [4,5,6]. Paired addition instead yields a `(3,1)` column [2,4,6]. The wrong result is numerically plausible because every displayed sum is a valid arithmetic sum; its axes implement a different question.
:::

Floating-point arrays approximate many real calculations. `np.allclose` can compare values with declared tolerances, but first verify shapes explicitly because comparison operations may themselves broadcast. Exact small-integer mathematical identities and approximate numerical agreement are different evidence. Module 28 develops floating-point error in detail; earlier labs state local tolerances where needed.

## Execute the orientation {#lab1}

Predict list concatenation, array addition, shapes, axis sums, and the wrong broadcast before running. The script then checks the repaired shape and a small dot product. Its downloaded source generated the captured output below.

{{LAB:lab1}}

## Exit check and reference {#summary}

Explain why `(3,)`, `(1,3)`, and `(3,1)` have the same entry count but different shapes. Predict `(4,2)+(2,)` as `(4,2)`, then explain why `(4,2)+(4,)` is incompatible: trailing lengths two and four are unequal and neither is one. Explain why a flat transpose is insufficient to make a column.

Read the [NumPy beginner guide](https://numpy.org/doc/1.26/user/absolute_beginners.html) for basic array creation and axes, and the [official broadcasting rules](https://numpy.org/doc/1.26/user/basics.broadcasting.html) to verify aligned lengths. The orientation uses original examples and an executed script. Return to the [course overview](index.html) and continue with vectors when the shapes and operator meanings are clear.
