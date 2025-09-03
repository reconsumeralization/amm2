#!/usr/bin/env python3
"""
Fuzzer for schema-generator.py using Atheris.

Targets:
- SchemaGenerator.pascale_to_snake
- SchemaGenerator.generate_collection_schemas
- SchemaGenerator.generate_relationship_tables
- SchemaGenerator.generate_utility_functions
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


SCHEMA_MOD = _load_module(os.path.join(os.path.dirname(__file__), "..", "schema-generator.py"),
                          "schema_generator_module")


def _bytes_to_strings(data: bytes) -> List[str]:
    try:
        s = data.decode("utf-8", errors="ignore")
    except Exception:
        s = ""
    # Split into tokens; keep some variants
    tokens = [t for t in s.replace("\n", " ").replace("\t", " ").split(" ") if t]
    # Ensure at least one reasonable default
    if not tokens:
        tokens = ["Users", "Orders", "BlogPosts"]
    # Cap to avoid extreme sizes
    return tokens[:50]


def _build_collections_info(data: bytes) -> Dict[str, Any]:
    # Try to parse as JSON dictionary with "collections"
    try:
        parsed = json.loads(data.decode("utf-8", errors="ignore"))
        if isinstance(parsed, dict) and isinstance(parsed.get("collections"), list):
            # Coerce all items to strings
            collections = [str(x)[:100] for x in parsed.get("collections", [])][:200]
            return {"collections": collections}
    except Exception:
        pass

    # Fallback: derive from string tokens
    tokens = _bytes_to_strings(data)
    # Normalize to plausible PascalCase identifiers to explore name logic
    normalized = []
    for t in tokens:
        t_stripped = "".join(ch for ch in t if ch.isalnum())
        if not t_stripped:
            continue
        normalized.append(t_stripped[:60].capitalize())
    if not normalized:
        normalized = ["Users", "Orders"]
    return {"collections": normalized[:200]}


def TestOneInput(data: bytes) -> None:
    gen = SCHEMA_MOD.SchemaGenerator()
    # Inject fuzzed collections info to avoid file I/O
    gen.collections_info = _build_collections_info(data)

    # Exercise name conversion on several strings
    for token in _bytes_to_strings(data)[:10]:
        _ = gen.pascale_to_snake(token)

    # Generate schemas and utility strings
    schemas = gen.generate_collection_schemas()
    _ = gen.generate_relationship_tables()
    _ = gen.generate_utility_functions()

    # Lightly exercise concatenation path to catch format issues
    # Avoid writing files or DB sync during fuzzing
    _ = len("\n".join(schemas))


def main():
    atheris.Setup(sys.argv, TestOneInput, enable_python_coverage=True)
    atheris.Fuzz()


if __name__ == "__main__":
    main()

