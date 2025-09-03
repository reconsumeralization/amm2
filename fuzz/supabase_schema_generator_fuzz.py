#!/usr/bin/env python3
"""
Fuzzer for supabase-schema-generator.py using Atheris.

Targets:
- SupabaseSchemaGenerator.pascale_to_snake
- SupabaseSchemaGenerator.generate_supabase_table_schema
- SupabaseSchemaGenerator.generate_supabase_migration
- SupabaseSchemaGenerator.generate_typescript_queries
"""

import sys
import atheris
import json
import io
import os
import importlib.util
from typing import Any, Dict, List


def _load_module(filepath: str, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, filepath)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module from {filepath}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore
    return mod


SUPABASE_MOD = _load_module(os.path.join(os.path.dirname(__file__), "..", "supabase-schema-generator.py"),
                            "supabase_schema_generator_module")


def _bytes_to_strings(data: bytes) -> List[str]:
    try:
        s = data.decode("utf-8", errors="ignore")
    except Exception:
        s = ""
    tokens = [t for t in s.replace("\n", " ").replace("\t", " ").split(" ") if t]
    if not tokens:
        tokens = ["Services", "Products", "BlogPosts"]
    return tokens[:50]


def _build_collections_info(data: bytes) -> Dict[str, Any]:
    try:
        parsed = json.loads(data.decode("utf-8", errors="ignore"))
        if isinstance(parsed, dict) and isinstance(parsed.get("collections"), list):
            collections = [str(x)[:100] for x in parsed.get("collections", [])][:200]
            return {"collections": collections}
    except Exception:
        pass

    tokens = _bytes_to_strings(data)
    normalized = []
    for t in tokens:
        t_stripped = "".join(ch for ch in t if ch.isalnum())
        if not t_stripped:
            continue
        normalized.append(t_stripped[:60].capitalize())
    if not normalized:
        normalized = ["Services", "Products"]
    return {"collections": normalized[:200]}


def TestOneInput(data: bytes) -> None:
    gen = SUPABASE_MOD.SupabaseSchemaGenerator()
    gen.collections_info = _build_collections_info(data)

    # Name conversion
    for token in _bytes_to_strings(data)[:10]:
        _ = gen.pascale_to_snake(token)

    # Generate per-table schema for a few names
    for name in gen.collections_info.get("collections", [])[:5]:
        table = gen.pascale_to_snake(name)
        _ = gen.generate_supabase_table_schema(table, name)

    # Generate whole migration and TS queries
    _ = gen.generate_supabase_migration()
    _ = gen.generate_typescript_queries()


def main():
    atheris.Setup(sys.argv, TestOneInput, enable_python_coverage=True)
    atheris.Fuzz()


if __name__ == "__main__":
    main()

