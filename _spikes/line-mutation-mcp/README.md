# Line Mutation MCP Server

MCP server for targeted Cosmic Ray mutation testing on selected lines of code.

It is mainly intended for use with an AI coding agent such as RooCode. The agent can prepare mutation testing for changed lines and run Cosmic Ray only on those selected lines instead of the whole project.

## Tools

### ping

Checks whether the MCP server is reachable.

Returns:

pong

### prepare_line_mutation_config

Prepares an existing Cosmic Ray TOML config for targeted line mutation testing.

Inputs:

- targets: files with line ranges, for example `src/math.py:10-15`
- config_path: path to an existing Cosmic Ray config
- test_command: command written into `[cosmic-ray].test-command`

This tool updates:

- `[cosmic-ray].module-path`
- `[cosmic-ray].test-command`
- `[cosmic-ray.filters.line-filter].lines`

It does not run Cosmic Ray.

### execute_line_mutation_testing

Runs targeted line mutation testing using the prepared config.

It:

- initializes the Cosmic Ray database
- applies the line filter
- executes mutation testing for the selected lines
- reads the SQLite results

Returns:

- total jobs
- executed mutants
- killed mutants
- survived mutants
- survived mutant percentage

## Workflow

1. Select source lines for mutation testing.
2. Call `prepare_line_mutation_config`.
3. Call `execute_line_mutation_testing`.
4. Read the returned summary.

## Requirements

The environment running this MCP server must have:

- `cosmic-ray`
- `cr-filter-lines`
- required Python dependencies
- an existing Cosmic Ray TOML config file

## Example target format

`src/validators/finance.py:31-33`

`src/validators/iban.py:64-65,67`