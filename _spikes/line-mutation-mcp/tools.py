from typing import Any
from pathlib import Path

from command_utils import run_command
from config_utils import (
    compute_relative_filter_config,
    normalize_test_command_paths,
    update_line_filter_lines,
    update_test_command,
    validate_config_path,
    validate_test_command,
)
from target_parser import build_lines_mapping, parse_target
from result_utils import read_mutation_summary


def register_tools(server) -> None:
    @server.tool()
    async def ping() -> str:
        """Simple connectivity check returning the string 'pong'."""
        return "pong"

    @server.tool()
    async def prepare_line_mutation_config(
        targets: list[str],
        config_path: str | None = None,
        test_command: str | None = None,
    ) -> dict[str, Any]:
        """Prepare a Cosmic Ray TOML config for targeted line mutation testing.

        Required:
        - targets: source files with line ranges to mutate
        - config_path: existing Cosmic Ray TOML config path
        - test_command: test command to store in the config, that tests only relevant test files to targets

        This tool:
        - updates module-path and line-filter for the selected targets
        - writes the test command into [cosmic-ray].test-command
        """
        if not targets:
            raise ValueError("At least one target is required.")

        validated_config_path = validate_config_path(config_path)
        validated_test_command = validate_test_command(test_command)
        normalized_test_command = normalize_test_command_paths(
            validated_config_path,
            validated_test_command,
        )

        normalized_targets = [parse_target(target) for target in targets]
        lines = build_lines_mapping(normalized_targets)

        computed = compute_relative_filter_config(validated_config_path, lines)
        updated_config_path = update_line_filter_lines(validated_config_path, lines)
        updated_config_path = update_test_command(
            updated_config_path,
            normalized_test_command,
        )

        return {
            "ok": True,
            "status": "config_updated",
            "target_count": len(normalized_targets),
            "config_path": updated_config_path,
            "module_path": computed["module_path"],
            "lines": computed["lines"],
            "test_command": normalized_test_command,
        }
        
    @server.tool()
    async def execute_line_mutation_testing(
        config_path: str | None = None,
        database_name: str = "cosmic-ray-sql.sqlite",
        timeout_seconds: int = 300,
    ) -> dict[str, Any]:
        """Run targeted line mutation testing using a prepared Cosmic Ray config.

        This tool initializes the Cosmic Ray database, applies the line filter,
        executes mutations only for the selected lines, and reads the final results.

        Returns:
        - total number of generated mutation jobs
        - number of actually executed mutants
        - killed mutants
        - survived mutants
        - survived mutant percentage
        - command outputs for debugging
        """
        validated_config_path = validate_config_path(config_path)

        config_file = Path(validated_config_path)
        cwd = config_file.parent
        config_name = config_file.name
        database_path = cwd / database_name

        init_command = [
            "cosmic-ray",
            "init",
            config_name,
            database_path.name,
            "--force",
        ]

        init_result = await run_command(
            command=init_command,
            cwd=cwd,
            timeout_seconds=timeout_seconds,
        )

        if init_result.exit_code != 0 or init_result.timed_out:
            return {
                "ok": False,
                "status": "init_failed",
                "config_path": str(config_file),
                "database_path": str(database_path),
                "init": {
                    "command": init_result.command,
                    "cwd": init_result.cwd,
                    "exit_code": init_result.exit_code,
                    "timed_out": init_result.timed_out,
                    "stdout": init_result.stdout,
                    "stderr": init_result.stderr,
                },
                "filter": None,
            }

        filter_command = [
            "cr-filter-lines",
            database_path.name,
            "--config",
            config_name,
        ]

        filter_result = await run_command(
            command=filter_command,
            cwd=cwd,
            timeout_seconds=timeout_seconds,
        )

        if filter_result.exit_code != 0 or filter_result.timed_out:
            return {
                "ok": False,
                "status": "filter_failed",
                "config_path": str(config_file),
                "database_path": str(database_path),
                "init": {
                    "command": init_result.command,
                    "cwd": init_result.cwd,
                    "exit_code": init_result.exit_code,
                    "timed_out": init_result.timed_out,
                    "stdout": init_result.stdout,
                    "stderr": init_result.stderr,
                },
                "filter": {
                    "command": filter_result.command,
                    "cwd": filter_result.cwd,
                    "exit_code": filter_result.exit_code,
                    "timed_out": filter_result.timed_out,
                    "stdout": filter_result.stdout,
                    "stderr": filter_result.stderr,
                },
                "exec": None,
            }

        exec_command = [
            "cosmic-ray",
            "exec",
            config_name,
            database_path.name,
        ]

        exec_result = await run_command(
            command=exec_command,
            cwd=cwd,
            timeout_seconds=timeout_seconds,
        )
        summary = read_mutation_summary(database_path)

        return {
            "ok": exec_result.exit_code == 0 and not exec_result.timed_out,
            "status": "exec_finished"
            if exec_result.exit_code == 0 and not exec_result.timed_out
            else "exec_failed",
            "config_path": str(config_file),
            "database_path": str(database_path),
            "summary": summary,
            "init": {
                "command": init_result.command,
                "cwd": init_result.cwd,
                "exit_code": init_result.exit_code,
                "timed_out": init_result.timed_out,
                "stdout": init_result.stdout,
                "stderr": init_result.stderr,
            },
            "filter": {
                "command": filter_result.command,
                "cwd": filter_result.cwd,
                "exit_code": filter_result.exit_code,
                "timed_out": filter_result.timed_out,
                "stdout": filter_result.stdout,
                "stderr": filter_result.stderr,
            },
            "exec": {
                "command": exec_result.command,
                "cwd": exec_result.cwd,
                "exit_code": exec_result.exit_code,
                "timed_out": exec_result.timed_out,
                "stdout": exec_result.stdout,
                "stderr": exec_result.stderr,
            },
        }