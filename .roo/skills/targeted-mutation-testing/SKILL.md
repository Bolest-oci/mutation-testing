---
name: targeted-mutation-testing
description: Always use whenever the conversation mentions mutation testing, mutations, mutants, mutating code, survived mutants, killed mutants, skipped mutants, Cosmic Ray, cr-html, line-filter, mutation reports, or report.html, including follow-up questions about previous mutation runs.
---

# Mutation testing instructions

## Important

If the conversation already contains a recent mutation testing run and the user asks about results, survived mutants, killed mutants, or reports, do not rerun mutation testing. Use the latest database/result context and generate or open the HTML report.

Use MCP server by default when the user asks to run mutation testing.

## Main workflow

1. Identify target:
   - source file(s)
   - line range(s), if provided

2. Choose minimal `test_command`.

3. Call MCP tools:
   - `prepare_line_mutation_config`
   - `execute_line_mutation_testing`

4. Return short summary:
   - total
   - executed
   - killed
   - survived

## Choosing `test_command`

Pick the smallest reliable command that still tests the mutated code.

### Test runner

Detect runner in this order:

1. existing Cosmic Ray `test-command`
2. user-provided command
3. project config files  
   `pyproject.toml`, `pytest.ini`, `tox.ini`, `setup.cfg`, `package.json`, CI files
4. test file patterns/imports
5. ask user if unclear

Do not assume `pytest` unless the project clearly uses it.

### Test files

Prefer:

1. direct mapping  
   `src/.../<module>.py` → `tests/test_<module>.py`

2. tests referencing mutated function/class/module

3. closest relevant test directory

4. full suite only as last resort

Keep the detected command style and only narrow the scope.

Example:

```text
python -m pytest -q tests
-> python -m pytest -q tests/test_iban.py
```

Example:

```text
python -m unittest discover -s tests
-> python -m unittest tests.test_iban
```

## Detailed results / survived mutants

If the user asks for more details, survived mutants, or a report, generate HTML report.

Use database path from context if available.

Default database name:

```text
cosmic-ray-sql.sqlite
```

Generate report:

```bash
cr-html --hide-skipped <database_path> > report.html
```

Implementation note:
Do NOT re-run mutation execution just to answer “survived mutants”; rely on the existing database from the previous run.

Then reply only with:

```text
Generated report:
<path-to-report.html>

Summary:
total / executed / killed / survived
```

## Failure handling

If MCP connection fails:

1. retry once
2. if it still fails, run the Cosmic Ray workflow manually from the repo if possible
