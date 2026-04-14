from typing import Any


def parse_target(target: str) -> dict[str, Any]:
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


def build_lines_mapping(
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