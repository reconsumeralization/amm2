# Fuzzing Guide (Atheris)

This repository includes Python fuzzers using Atheris to stress core generators and catch crashes/edge cases early.

## Targets

- `fuzz/schema_generator_fuzz.py`: Exercises `schema-generator.py`
  - `pascale_to_snake`
  - `generate_collection_schemas`
  - `generate_relationship_tables`
  - `generate_utility_functions`
- `fuzz/supabase_schema_generator_fuzz.py`: Exercises `supabase-schema-generator.py`
  - `pascale_to_snake`
  - `generate_supabase_table_schema`
  - `generate_supabase_migration`
  - `generate_typescript_queries`

## Quick Start (Local)

```bash
# From repo root
./scripts/run-fuzz.sh schema_generator_fuzz
./scripts/run-fuzz.sh supabase_schema_generator_fuzz
```

The script bootstraps a venv, installs `requirements-fuzz.txt`, and runs Atheris with sane defaults.

To pass custom flags to Atheris, append them after the target name:

```bash
./scripts/run-fuzz.sh schema_generator_fuzz -runs=100000 -only_ascii=1
```

## Seed Corpora

- `fuzz/corpora/schema_generator`
- `fuzz/corpora/supabase_schema_generator`

Add more minimized, interesting inputs over time. Keep corpora small and meaningful.

## CI

A GitHub Action at `.github/workflows/fuzz.yml` runs both fuzzers with a finite number of iterations on PRs and `main` pushes.

## Guidelines

- Keep fuzz harnesses side-effect free: do not write files or connect to databases.
- Make optional imports tolerant (e.g., psycopg2) to avoid import-time crashes in minimal environments.
- When a crash is found, add the minimized input to the appropriate corpus and include a regression test where relevant.
- Prefer deterministic, bounded runs in CI (`-runs=N`). Use unbounded runs locally for deeper discovery.

## Troubleshooting

- If imports fail, ensure `PYTHONPATH` includes the repo root.
- If you see UnicodeDecodeError, keep `-only_ascii=1` while debugging.
- Use `-timeout=10` to abort long hangs during triage.

