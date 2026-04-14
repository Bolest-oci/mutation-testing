from pathlib import Path

import tomlkit


def validate_config_path(config_path: str | None) -> str:
    """Validate that an existing Cosmic Ray TOML config path was provided."""
    if not config_path:
        raise ValueError(
            "config_path is required. Please provide the path to an existing "
            "Cosmic Ray TOML config file."
        )

    path = Path(config_path).resolve()

    if path.suffix.lower() != ".toml":
        raise ValueError(
            f"config_path {config_path!r} must point to a .toml file."
        )

    if not path.exists():
        raise ValueError(f"config_path {config_path!r} does not exist.")

    if not path.is_file():
        raise ValueError(f"config_path {config_path!r} is not a file.")

    return str(path)


def _common_path(paths: list[Path]) -> Path:
    """Return the common parent path of the provided file paths."""
    if not paths:
        raise ValueError("Cannot compute common path from an empty path list.")

    common = Path(paths[0])

    for path in paths[1:]:
        common_parts = []
        for left, right in zip(common.parts, path.parts):
            if left != right:
                break
            common_parts.append(left)

        if not common_parts:
            raise ValueError("Target files do not share a common parent directory.")

        common = Path(*common_parts)

    if common.suffix:
        common = common.parent

    return common


def _to_posix(path: Path) -> str:
    """Convert a path to POSIX-style string."""
    return path.as_posix()


def compute_relative_filter_config(
    config_path: str,
    lines: dict[str, list[str]],
) -> dict[str, object]:
    """Compute module-path and line-filter keys relative to the config file location.

    Rules:
    - If exactly one file is targeted, module-path becomes the relative file path
      from the config directory to that file.
    - If multiple files are targeted, module-path becomes their common parent
      directory relative to the config directory.
    - line-filter keys are then made relative to module-path.
    - All returned paths use POSIX-style '/' separators.
    """
    if not lines:
        raise ValueError("Cannot compute filter config from empty lines mapping.")

    config_dir = Path(config_path).resolve().parent
    target_files = [Path(file_path).resolve() for file_path in lines]

    unique_files = list(dict.fromkeys(target_files))
    single_file_mode = len(unique_files) == 1

    if single_file_mode:
        module_path_abs = unique_files[0]
    else:
        module_path_abs = _common_path(unique_files)

    try:
        module_path_rel = module_path_abs.relative_to(config_dir)
    except ValueError as exc:
        raise ValueError(
            "Target files must be inside the same project tree as the config file."
        ) from exc

    relative_lines: dict[str, list[str]] = {}

    for original_file_path, ranges in lines.items():
        file_abs = Path(original_file_path).resolve()

        if single_file_mode:
            line_key = file_abs.name
        else:
            try:
                line_key = file_abs.relative_to(module_path_abs)
            except ValueError as exc:
                raise ValueError(
                    f"Could not make {original_file_path!r} relative to module-path."
                ) from exc

        relative_lines[_to_posix(Path(line_key))] = ranges

    module_path_str = _to_posix(module_path_rel)
    if not single_file_mode and not module_path_str.endswith("/"):
        module_path_str += "/"

    return {
        "module_path": module_path_str,
        "lines": relative_lines,
    }


def update_line_filter_lines(
    config_path: str,
    lines: dict[str, list[str]],
) -> str:
    """Write line-filter lines and module-path into an existing Cosmic Ray TOML config."""
    path = Path(config_path).resolve()
    document = tomlkit.parse(path.read_text(encoding="utf-8"))

    cosmic_ray_section = document.get("cosmic-ray")
    if cosmic_ray_section is None:
        raise ValueError(
            f"Config file {config_path!r} does not contain a [cosmic-ray] section."
        )

    computed = compute_relative_filter_config(str(path), lines)
    cosmic_ray_section["module-path"] = computed["module_path"]

    filters_section = cosmic_ray_section.get("filters")
    if filters_section is None:
        filters_section = tomlkit.table()
        cosmic_ray_section["filters"] = filters_section

    line_filter_section = filters_section.get("line-filter")
    if line_filter_section is None:
        line_filter_section = tomlkit.table()
        filters_section["line-filter"] = line_filter_section

    toml_lines = tomlkit.inline_table()
    for file_path, ranges in computed["lines"].items():
        toml_lines[file_path] = ranges

    line_filter_section["lines"] = toml_lines

    path.write_text(tomlkit.dumps(document), encoding="utf-8")
    return str(path)

def validate_test_command(test_command: str | None) -> str:
    if not test_command or not test_command.strip():
        raise ValueError(
            "test_command is required. Please provide the exact command that "
            "should be written into [cosmic-ray].test-command."
        )

    return test_command.strip()


def update_test_command(config_path: str, test_command: str) -> str:
    """Write or replace [cosmic-ray].test-command in an existing TOML config."""
    path = Path(config_path).resolve()
    document = tomlkit.parse(path.read_text(encoding="utf-8"))

    cosmic_ray_section = document.get("cosmic-ray")
    if cosmic_ray_section is None:
        raise ValueError(
            f"Config file {config_path!r} does not contain a [cosmic-ray] section."
        )

    cosmic_ray_section["test-command"] = test_command

    path.write_text(tomlkit.dumps(document), encoding="utf-8")
    return str(path)

def normalize_test_command_paths(config_path: str, test_command: str) -> str:
    """Normalize file paths in test_command relative to the config directory."""
    config_dir = Path(config_path).resolve().parent
    cwd = Path.cwd().resolve()

    tokens = test_command.split()
    normalized_tokens: list[str] = []

    for token in tokens:
        stripped = token.strip()
        unquoted = stripped.strip('"').strip("'")

        if "/" not in unquoted and "\\" not in unquoted:
            normalized_tokens.append(token)
            continue

        candidate_path = Path(unquoted)

        if candidate_path.is_absolute():
            resolved_candidate = candidate_path.resolve()
        else:
            # interpret relative paths from current working directory,
            # because that is how the user usually typed them
            resolved_candidate = (cwd / candidate_path).resolve()

        try:
            relative_candidate = resolved_candidate.relative_to(config_dir)
            normalized_tokens.append(relative_candidate.as_posix())
        except ValueError:
            normalized_tokens.append(token)

    return " ".join(normalized_tokens)