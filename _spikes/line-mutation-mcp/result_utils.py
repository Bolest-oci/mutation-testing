import sqlite3
from pathlib import Path
from typing import Any


def read_mutation_summary(database_path: str | Path) -> dict[str, Any]:
    """Read a simple mutation testing summary from a Cosmic Ray SQLite database."""
    path = Path(database_path).resolve()

    if not path.exists():
        raise ValueError(f"Database file does not exist: {path}")

    if not path.is_file():
        raise ValueError(f"Database path is not a file: {path}")

    with sqlite3.connect(str(path)) as connection:
        cursor = connection.cursor()

        total_jobs = cursor.execute(
            """
            SELECT COUNT(*)
            FROM work_items
            """
        ).fetchone()[0]

        executed_mutants = cursor.execute(
            """
            SELECT COUNT(*)
            FROM work_results
            WHERE UPPER(TRIM(worker_outcome)) != 'SKIPPED'
            """
        ).fetchone()[0]

        killed_mutants = cursor.execute(
            """
            SELECT COUNT(*)
            FROM work_results
            WHERE UPPER(TRIM(worker_outcome)) != 'SKIPPED'
            AND UPPER(TRIM(test_outcome)) = 'KILLED'
            """
        ).fetchone()[0]

        survived_mutants = cursor.execute(
            """
            SELECT COUNT(*)
            FROM work_results
            WHERE UPPER(TRIM(worker_outcome)) != 'SKIPPED'
            AND UPPER(TRIM(test_outcome)) = 'SURVIVED'
            """
        ).fetchone()[0]

    if executed_mutants == 0:
        survived_percentage = 0.0
    else:
        survived_percentage = round(
            survived_mutants / executed_mutants * 100,
            2,
        )

    return {
        "total_jobs": total_jobs,
        "executed_mutants": executed_mutants,
        "killed_mutants": killed_mutants,
        "survived_mutants": survived_mutants,
        "survived_mutants_percentage": survived_percentage,
    }