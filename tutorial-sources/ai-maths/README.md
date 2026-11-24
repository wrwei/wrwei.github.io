# Maths for AI and LLMs

Eight lessons in English and simplified Chinese follow the maths from token probabilities through training and numerical inference. Each lesson includes three worked exercises, three self-check questions and a Python example. Interactive demonstrations cover Bayes' rule, KL divergence and quadratic gradient descent.

With the Calculus Python and Node dependencies installed, run these commands from this directory.

```sh
python3 -I ../linear-algebra/tools/check.py --course .
python3 -I ../linear-algebra/tools/check.py --course . --lang zh
node ../linear-algebra/tools/build.mjs out/site .
```

Open out/site/index.html or out/site/index_ZH.html. The English check writes the shared Python download. If you change an example, update the corresponding code blocks and expected outputs in both languages.
