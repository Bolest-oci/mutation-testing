from typing import Any

from config_utils import (
    compute_relative_filter_config,
    normalize_test_command_paths,
    update_line_filter_lines,
    update_test_command,
    validate_config_path,
    validate_test_command,
)
from target_parser import build_lines_mapping, parse_target


def register_tools(server) -> None:
    @server.tool()
    async def ping() -> str:
        """Simple connectivity check returning the string 'pong'."""
        return "pong"

    @server.tool()
    async def run_line_mutation_workflow(
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