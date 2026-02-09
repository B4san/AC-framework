#!/usr/bin/env python3
"""Validate mirrored skill directories are byte-identical across assistants using SHA-256."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SKILLS = [
    "speckit-clarify",
    "speckit-specify",
    "speckit-plan",
    "test-planning",
    "test-execution",
    "performance-optimizer",
    "security-scan",
    "code-review",
    "sync-index",
]


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def collect_skill_hashes(skill_name: str) -> dict[str, str]:
    results: dict[str, str] = {}
    for skills_dir in sorted(p for p in ROOT.glob(".*/skills") if p.is_dir()):
        assistant = skills_dir.parent.name
        file_path = skills_dir / skill_name / "SKILL.md"
        results[assistant] = sha256_file(file_path) if file_path.exists() else "MISSING"
    return results


def main() -> int:
    skills = sys.argv[1:] or DEFAULT_SKILLS

    failures: dict[str, dict[str, str]] = {}
    for skill in skills:
        hashes = collect_skill_hashes(skill)
        expected = hashes.get(".claude")
        if expected in (None, "MISSING"):
            failures[skill] = hashes
            continue
        if any(v != expected for v in hashes.values()):
            failures[skill] = hashes

    if failures:
        print("Mirror hash validation FAILED")
        print(json.dumps(failures, indent=2, sort_keys=True))
        return 1

    print(f"Mirror hash validation passed for {len(skills)} skills across assistants.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
