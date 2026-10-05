## Check the interpreter and run a file {#setup}

Use a text editor, a terminal, and Python 3.11 or later. The terminal executes commands; a `.py` file contains Python code. Do not paste a terminal command such as `python orientation.py` into the Python `>>>` prompt. If you are at that prompt, enter `exit()` to return to the terminal.

On **Windows PowerShell**, try:

```powershell
py --version
py orientation.py
```

If your installation exposes `python` instead of `py`, use `python --version` and `python orientation.py`. On **macOS or Linux**, the usual commands are:

```bash
python3 --version
python3 orientation.py
```

Download the script below into a known folder and open your terminal there. `Get-Location` in PowerShell or `pwd` on macOS/Linux shows the current folder. If the script cannot be opened, check its name and location before changing the code. On Windows, make sure the editor has not saved it as `orientation.py.txt`.

If Python is absent, use the official [Python downloads and installation information](https://www.python.org/downloads/) for your operating system. The minimum stated here matches the tested labs; it is not a request to replace a working interpreter. This first release uses only the standard library, so there is no `pip install` step for learners.

## Read assignment expressions and comparisons {#notation}

`x = 3` binds a name to a value. `x + 1` computes an expression. `x == 3` compares for equality and returns a Boolean. `x < 0` tests an order relation. Python writes powers as `x ** 2`; `x ^ 2` is an integer bitwise operation and is not exponentiation.

Lists such as `[0, 1, 2]` hold ordered values. `values[0]` reads the first one. Mathematical examples may start at one while Python positions usually start at zero: check the declared indexing convention rather than guessing.

An `if` selects a branch. A `for` repeats its indented body for successive values. `range(4)` supplies `0,1,2,3`; `range(1,5)` supplies `1,2,3,4`. The stop is excluded. The official [control-flow tutorial](https://docs.python.org/3/tutorial/controlflow.html#the-range-function) gives more examples.

Indentation forms part of Python's structure. Use four spaces consistently. In the script below, the print inside the loop runs three times; the later print runs once after the loop. A wrongly indented statement can therefore change the computation even when the arithmetic expression is correct.

## Functions returns and imports {#functions}

`def square(x):` defines a function. Its indented `return x * x` gives the result to the caller. `square(-3)` is a call, with argument minus three; its result is nine. Printing a value displays it but does not make that value the function's returned result. A function that reaches its end without a return produces `None`.

`import math` makes the standard-library mathematical module available. `math.log(x)` uses the natural logarithm by default; its real input must be positive. The mathematical domain is still your responsibility when translating a formula.

An `assert` checks a condition and raises an exception if it is false. The labs use it to verify small expected results. It is not a general proof, and assertions should not be the sole input-validation mechanism because Python can disable them in optimised execution. The maths labs use explicit checks for their input contracts.

## Run the orientation script {#lab1}

Predict the three loop lines, the finite sum, and the contrast between `**` and `^`. Then download and run the script. The output below was captured by executing this exact file.

{{LAB:lab1}}

Change the list to `[-2,0,3]` and predict the new values before running. Add one incorrect assertion such as `assert square(3) == 6`; run it, locate the line named in the traceback, and explain the failed claim. Remove or correct that deliberately false assertion afterwards.

## Read errors and choose the next step {#errors}

A traceback identifies the source line and exception type. Read its last line for the immediate failure, then inspect the cited expression. `NameError` often means an undefined or misspelled name; `SyntaxError` means the program could not be parsed; `ZeroDivisionError` identifies an attempted division by zero. A valid program can still implement an incorrect mathematical formula, so successful execution alone is insufficient.

The example catches its deliberate division error so the full script completes. A `try` block runs a calculation; the corresponding `except` handles the specified exception. Do not catch every possible exception to suppress a domain failure. Explain whether the expression's input should be rejected or the formula should be corrected.

You are ready when you can run a downloaded file, explain its loop range and returned values, and locate a deliberate failure. Continue to [Module 01](module_01_EN.html), or use [Computer Science Fundamentals](../cs/index.html) for the wider programming context. For more detail, the official [Python tutorial](https://docs.python.org/3/tutorial/) is a reference rather than required reading for this hour.
