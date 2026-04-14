import asyncio
import sys
from pathlib import Path
from typing import Any

sys.stderr.write("[cosmic-ray-mcp] Starting MCP server module...\n")
sys.stderr.flush()

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:  # pragma: no cover - environment/setup concern
    sys.stderr.write(
        "[cosmic-ray-mcp] ERROR: The 'mcp' package (with fastmcp) is required "
        "for the Cosmic Ray MCP server. Install it with: pip install mcp\n"
    )
    sys.stderr.flush()
    sys.exit(1)


server = FastMCP("cosmic-ray-mcp")


def _parse_target(target: str) -> dict[str, Any]:
    """Parse one target in the form 'file:line-spec,line-spec,...'."""

    if ":" not in target:
        raise ValueError(
            f"Invalid target {target!r}. Expected format: 'file:64-67' or "
            f"'file:15,33-38'."
        )

    file_path, raw_ranges = target.split(":", 1)
    file_path = file_path.strip()
    raw_ranges = raw_ranges.strip()

    if not file_path:
        raise ValueError(f"Invalid target {target!r}. File path is empty.")

    if not raw_ranges:
        raise ValueError(
            f"Invalid target {target!r}. At least one line or line range is required."
        )

    ranges: list[str] = []
    for part in raw_ranges.split(","):
        part = part.strip()
        if not part:
            continue

        if "-" in part:
            start_str, end_str = part.split("-", 1)
            try:
                start = int(start_str)
                end = int(end_str)
            except ValueError as exc:
                raise ValueError(
                    f"Invalid line range {part!r} in target {target!r}."
                ) from exc

            if start < 1 or end < start:
                raise ValueError(
                    f"Invalid line range {part!r} in target {target!r}."
                )

            ranges.append(f"{start}-{end}")
        else:
            try:
                line = int(part)
            except ValueError as exc:
                raise ValueError(
                    f"Invalid line value {part!r} in target {target!r}."
                ) from exc

            if line < 1:
                raise ValueError(
                    f"Invalid line value {part!r} in target {target!r}."
                )

            ranges.append(str(line))

    if not ranges:
        raise ValueError(
            f"Invalid target {target!r}. No valid lines or ranges were found."
        )

    return {
        "file": file_path,
        "ranges": ranges,
    }


def _build_lines_mapping(
    normalized_targets: list[dict[str, Any]],
) -> dict[str, list[str]]:
    """Convert normalized targets into Cosmic Ray line-filter config format."""

    lines: dict[str, list[str]] = {}

    for target in normalized_targets:
        file_path = target["file"]
        ranges = target["ranges"]

        if file_path not in lines:
            lines[file_path] = []

        lines[file_path].extend(ranges)

    return lines


def _validate_config_path(config_path: str | None) -> str:
    """Validate that an existing Cosmic Ray TOML config path was provided."""

    if not config_path:
        raise ValueError(
            "config_path is required. Please provide the path to an existing "
            "Cosmic Ray TOML config file."
        )

    path = Path(config_path)

    if path.suffix.lower() != ".toml":
        raise ValueError(
            f"config_path {config_path!r} must point to a .toml file."
        )

    if not path.exists():
        raise ValueError(
            f"config_path {config_path!r} does not exist."
        )

    if not path.is_file():
        raise ValueError(
            f"config_path {config_path!r} is not a file."
        )

    return str(path)


@server.tool()
async def ping() -> str:
    """Simple connectivity check returning the string 'pong'."""

    return "pong"


@server.tool()
async def prepare_line_mutation_run(
    targets: list[str],
    config_path: str | None = None,
) -> dict[str, Any]:
    """Validate inputs and prepare line-filter config data for a Cosmic Ray run.

    Example targets:
    - 'src/validators/iban.py:64-67'
    - 'src/validators/card.py:15,33-38'
    """

    if not targets:
        raise ValueError("At least one target is required.")

    validated_config_path = _validate_config_path(config_path)
    normalized_targets = [_parse_target(target) for target in targets]
    lines = _build_lines_mapping(normalized_targets)

    return {
        "ok": True,
        "target_count": len(normalized_targets),
        "config_path": validated_config_path,
        "targets": normalized_targets,
        "lines": lines,
    }


async def main() -> None:  # pragma: no cover - process entrypoint
    """Run the MCP server over stdio using FastMCP helper."""

    sys.stderr.write("[cosmic-ray-mcp] Entering FastMCP.run_stdio_async loop...\n")
    sys.stderr.flush()
    await server.run_stdio_async()


if __name__ == "__main__":  # pragma: no cover - simple process entrypoint
    try:
        asyncio.run(main())
    except Exception as exc:  # pragma: no cover - defensive logging
        sys.stderr.write(f"[cosmic-ray-mcp] FATAL: Unhandled exception: {exc!r}\n")
        sys.stderr.flush()
        raise