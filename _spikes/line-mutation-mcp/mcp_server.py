import asyncio
import sys

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

from tools import register_tools


server = FastMCP("cosmic-ray-mcp")
register_tools(server)


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