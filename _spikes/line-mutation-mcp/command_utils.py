import asyncio
from dataclasses import dataclass
from pathlib import Path


@dataclass
class CommandResult:
    command: list[str]
    cwd: str
    exit_code: int
    stdout: str
    stderr: str
    timed_out: bool


async def run_command(
    command: list[str],
    cwd: str | Path,
    timeout_seconds: int = 300,
    output_limit: int = 12000,
) -> CommandResult:
    """Run a command asynchronously and return trimmed stdout/stderr."""
    if not command:
        raise ValueError("Command cannot be empty.")

    cwd_path = Path(cwd).resolve()

    if not cwd_path.exists():
        raise ValueError(f"Working directory does not exist: {cwd_path}")

    if not cwd_path.is_dir():
        raise ValueError(f"Working directory is not a directory: {cwd_path}")

    try:
        proc = await asyncio.create_subprocess_exec(
            *command,
            cwd=str(cwd_path),
            stdin=asyncio.subprocess.DEVNULL,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError as exc:
        raise ValueError(
            f"Command not found: {command[0]!r}. "
            f"Make sure it is installed and available in PATH."
        ) from exc

    timed_out = False

    try:
        stdout_bytes, stderr_bytes = await asyncio.wait_for(
            proc.communicate(),
            timeout=timeout_seconds,
        )
    except asyncio.TimeoutError:
        timed_out = True
        proc.kill()
        stdout_bytes, stderr_bytes = await proc.communicate()

    stdout = stdout_bytes.decode(errors="replace")
    stderr = stderr_bytes.decode(errors="replace")

    return CommandResult(
        command=command,
        cwd=str(cwd_path),
        exit_code=proc.returncode if proc.returncode is not None else -1,
        stdout=stdout[-output_limit:],
        stderr=stderr[-output_limit:],
        timed_out=timed_out,
    )