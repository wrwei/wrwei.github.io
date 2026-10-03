#!/usr/bin/env bash
# Run Python in the lab environment: the venv in .venv at the series root (see HANDOVER.md), or $AIS_PYTHON.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -n "$AIS_PYTHON" ]; then PY="$AIS_PYTHON"
elif [ -x "$ROOT/.venv/Scripts/python.exe" ]; then PY="$ROOT/.venv/Scripts/python.exe"
elif [ -x "$ROOT/.venv/bin/python" ]; then PY="$ROOT/.venv/bin/python"
else PY="$(command -v python3 || command -v python)"; fi
export HF_HOME="${HF_HOME:-$ROOT/.hf}"
export HF_HUB_DISABLE_SYMLINKS_WARNING=1 HF_HUB_DISABLE_PROGRESS_BARS=1 TRANSFORMERS_VERBOSITY=error
export TOKENIZERS_PARALLELISM=false PYTHONIOENCODING=utf-8 PYTHONUTF8=1 MPLBACKEND=Agg
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-4}" MKL_NUM_THREADS="${MKL_NUM_THREADS:-4}"
exec "$PY" "$@"
