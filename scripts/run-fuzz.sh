#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f requirements-fuzz.txt ]]; then
  echo "Run from repo root where requirements-fuzz.txt exists" >&2
  exit 1
fi

python3 -m venv .venv-fuzz
source .venv-fuzz/bin/activate
pip install --upgrade pip
pip install -r requirements-fuzz.txt

# Ensure PYTHONPATH includes repo root
export PYTHONPATH="$(pwd):${PYTHONPATH:-}"

FUZZ_TARGET=${1:-schema_generator_fuzz}
shift || true

echo "Running fuzz target: ${FUZZ_TARGET}"
python -m atheris "fuzz/${FUZZ_TARGET}.py" -only_ascii=1 -timeout=10 -atheris_runs=0 "$@"
