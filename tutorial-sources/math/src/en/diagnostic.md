## How to use the diagnostic {#start}

Allow about thirty minutes. Try each task before showing its solution. Mark it “explained,” “needs practice,” or “unfamiliar.” There is no pass/fail gate. If any of Tasks 1–5 needs practice, use the linked algebra section; Tasks 6–9 identify topics taught in the main series, while Tasks 10–12 check lab readiness.

## Arithmetic and algebra {#algebra}

### Task 1 Fractions {#d1}

Compute $3/4-2/3$, showing a common denominator.

::: answer
$9/12-8/12=1/12$. Review [fractions](module_00_EN.html#s1) if you added denominators or cannot explain the equivalent fractions.
:::

### Task 2 Signs {#d2}

Evaluate $-3^2$ and $(-3)^2$ and explain why they differ.

::: answer
$-9$ and $9$. In the first, the negative sign is outside the square; in the second it belongs to the base. Review [operation order](module_00_EN.html#s1).
:::

### Task 3 Equations {#d3}

Solve $3x+5=17$ and verify your answer in the original equation.

::: answer
Subtract five, then divide by three: $x=4$. Check $3(4)+5=17$. Review [equations](module_00_EN.html#s3) if the reversible steps are unclear.
:::

### Task 4 Expansion {#d4}

Expand $(x+2)(x-3)$ without omitting cross terms.

::: answer
$x^2-3x+2x-6=x^2-x-6$. Review [polynomials](module_00_EN.html#s4).
:::

### Task 5 Exponents {#d5}

Solve $2^x=8$ and name the inverse operation.

::: answer
$x=3$. A base-two logarithm asks for the exponent producing eight. Review [powers and logarithms](module_00_EN.html#s5).
:::

## Mathematical language {#language}

### Task 6 Domains {#d6}

Give the real domain of $1/(x-2)$.

::: answer
All real inputs except $x=2$, because that value makes the denominator zero. Study [Module 01 functions](module_01_EN.html#s3).
:::

### Task 7 Indexed notation {#d7}

Expand $\sum_{i=1}^4 i$ and calculate the total.

::: answer
$1+2+3+4=10$. The bounds are inclusive and the index takes integer values. Study [Module 01 sums](module_01_EN.html#s5).
:::

### Task 8 Negation {#d8}

Negate “every item is valid.” Is “every item is invalid” the negation?

::: answer
The negation is “at least one item is invalid.” “Every item is invalid” is stronger: some valid items could remain while the original universal claim is false. Module 02 will teach this distinction; it is currently planned. No logic prerequisite blocks Module 01.
:::

### Task 9 Claims and counterexamples {#d9}

Does $f(a+b)=f(a)+f(b)$ hold for every real function? Give a valid example supporting your answer.

::: answer
No. Choose $f(x)=x^2$, $a=2$, $b=3$: $25\ne13$. Study [Module 01 contracts and claims](module_01_EN.html#s6). A function can satisfy additivity, but not every function does.
:::

## Python readiness {#python}

### Task 10 Trace a loop {#d10}

Predict the printed values:

```python norun
for i in range(3):
    print(i)
    print(i * i)
```

::: answer
The six lines are `0,0,1,1,2,4` in that order. Both indented prints belong to each iteration. Review the [Python notation guide](python_primer_EN.html#notation).
:::

### Task 11 Define a function {#d11}

Write a function returning the square of its input and call it with minus three.

::: answer
Use `def square(x):` with indented `return x*x`; `square(-3)` returns nine. Printing alone does not supply the returned value. Review [functions](python_primer_EN.html#functions).
:::

### Task 12 Run and diagnose {#d12}

Run the [orientation script](python_primer_EN.html#lab1) from your terminal. Identify its final exception message and explain why the script still finishes.

::: answer
It reports a caught `ZeroDivisionError` with “division by zero.” The explicit `except` handles the deliberate fault. If the file cannot be opened, check the terminal's working folder and the filename first. Use the [setup instructions](python_primer_EN.html#setup) and [error guide](python_primer_EN.html#errors).
:::

## Choose preparation and continue {#next}

Use the [algebra refresher](module_00_EN.html) for missed school-mathematics tasks and the [Python primer](python_primer_EN.html) for lab setup. New notation is taught in [Module 01](module_01_EN.html); you do not have to answer all twelve questions correctly before beginning it.
