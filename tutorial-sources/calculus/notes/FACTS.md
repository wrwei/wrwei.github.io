# Facts the pages rely on

Facts about software that readers install, and the history the pages mention, each with its source and
the date it was checked. Re-check this file when Python, SymPy, NumPy or matplotlib change, and update
Module 1 to match.

## Python (checked 22 November 2026)

| Fact | Source |
|---|---|
| The latest release is Python 3.15.2 (25 October 2026); 3.15.0 came out on 9 October 2026. 3.14 also receives bug fixes; 3.10 has reached end of life. | https://www.python.org/downloads/ |
| On Windows, python.org's download button is **Download Python install manager**. The Python install manager can be installed from the Microsoft Store or downloaded from python.org; "the two versions are identical". To install the downloaded file, double-click it and select **Install**. | https://docs.python.org/3/using/windows.html §4.1.1 |
| After installation the `python`, `py` and `pymanager` commands are available. `python` launches the default runtime (the latest stable release unless configured otherwise); "if no version is specifically requested and no runtimes are installed at all, the current latest release will be installed automatically". New runtimes are added with `py install`. | same, §4.1.1, §4.1.2, §4.1.5 |
| When you first install a runtime you will likely be prompted to add a directory (`%LocalAppData%\Python\bin`) to PATH; this is optional if you use `py`. | same, §4.1.1 |
| The traditional full installer is deprecated since 3.14 and "will not be produced for Python 3.16 or later". | same, §4.11 |
| On macOS, python.org provides an installer package (`.pkg`), a universal2 build for Apple Silicon and Intel Macs. Double-click it; **Continue** (Read Me), **Continue** and **Agree** (licence), **Install** (needs an administrator account). Then double-click **Install Certificates.command** in the `/Applications/Python 3.15/` window to finish. | https://docs.python.org/3/using/mac.html §5.1.1 |
| On macOS you start it with `python3` (or `python3.15`). macOS's own `/usr/bin/python3` is Apple's, usually older; do not modify or delete it. | same, §5.1.1 note, §5.1.2 |
| Python comes preinstalled on most Linux distributions. On Debian and Ubuntu: `sudo apt update`, then `sudo apt install python3-venv python3-pip`. Fedora: `sudo dnf install python3-pip python3-wheel`. Arch: `sudo pacman -S python-pip`. | https://docs.python.org/3/using/unix.html §2.1.1; https://packaging.python.org/en/latest/guides/installing-using-linux-tools/ |
| Virtual environment: `python3 -m venv tutorial_env` then `source tutorial_env/bin/activate` (Unix/macOS); `py -m venv tutorial_env` then `tutorial_env\Scripts\activate` (Windows). In PowerShell the script is `<venv>\Scripts\Activate.ps1`, which may need `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` first. `deactivate` leaves it. | https://packaging.python.org/en/latest/tutorials/installing-packages/; https://docs.python.org/3/library/venv.html |
| Installing a package: `python3 -m pip install "SomeProject"` (Unix/macOS), `py -m pip install "SomeProject"` (Windows). Check pip with `python3 -m pip --version` / `py -m pip --version`. | https://packaging.python.org/en/latest/tutorials/installing-packages/ |

## Packages (checked 22 November 2026)

| Fact | Source |
|---|---|
| SymPy's recommended installation is `pip install sympy`; the current version is 1.14.0 (released 27 April 2025). Installing SymPy with pip also installs mpmath. | https://docs.sympy.org/latest/install.html; PyPI JSON API |
| NumPy 2.5.5 (15 November 2026) needs Python 3.12 or later; matplotlib 3.11.2 (11 September 2026) needs 3.11 or later. Both publish ready-built wheels for CPython 3.12, 3.13, 3.14 and 3.15 on Windows, macOS and Linux. mpmath 1.4.1 (15 March 2026). | PyPI JSON API (`https://pypi.org/pypi/NAME/json`) |
| SciPy's `solve_ivp` uses, unless told otherwise, `method='RK45'`: "Explicit Runge-Kutta method of order 5(4)", which adapts its step size to meet a tolerance (Module 13 mentions it; the series does not install SciPy). | SciPy 1.18.1 source, `scipy/integrate/_ivp/ivp.py` (the signature of `solve_ivp` and its docstring), checked 22 November 2026 |
| The outputs on the pages were produced with Python 3.11.18, SymPy 1.14.0, mpmath 1.3.0, NumPy 2.4.6 and matplotlib 3.11.2 (the build machine has Python 3.11, and NumPy 2.5 needs 3.12). | `tools/requirements.txt` |

## History

Only well-established facts, stated without spurious precision:

- Newton developed his calculus ("the method of fluxions") in 1665–1666 but published it late; Leibniz
  published the first account of the differential calculus in 1684 and of the integral calculus in
  1686; his notation ($dx$, $\int$) is the one we use. The two developed calculus independently; the
  priority dispute that followed was bitter.
- Zeno of Elea (5th century BC) posed paradoxes of motion, among them the one of covering half a
  distance, then half of what is left, and so on: Module 14's geometric series answers it.
- Archimedes (3rd century BC) found areas and volumes with the method of exhaustion, an ancestor of
  the limit of Riemann sums.
- Cauchy (1820s) and Weierstrass (1860s–1870s) gave calculus its rigorous ε–δ foundation; Riemann
  defined the integral named after him in 1854 (published 1868).
