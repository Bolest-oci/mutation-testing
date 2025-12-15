# Use Case: 03 – Run Targeted Mutation Test Runs

## Description
This use case describes how to execute mutation testing in a targeted manner, focusing only on recently changed and relevant parts of the codebase. The goal is to reduce execution time and noise while preserving meaningful mutation analysis.

## Actor
RooCode Agent

## Preconditions
- The project repository is available as a submodule in the workspace.
- A baseline branch or commit is available for comparison.
- Cosmic Ray is available in the project environment.

## Flow
1. **Detect Relevant Code Changes**
   - Agent identifies modified files and exact changed line ranges using version control.
   - Agent follows the steps defined in **Use Case 03.1 – Detect Relevant Code Changes**.
   - If no relevant changes are detected, the use case terminates.

2. **Apply Quality Gates**
   - Agent evaluates basic quality conditions (e.g. linting, static checks, coverage).
   - Agent follows the steps defined in **Use Case 03.2 – Apply Quality Gates**.
   - Code that fails quality gates is excluded from mutation testing.

3. **Optimize Mutation Scope**
   - Agent optimizes the mutation scope by selecting relevant mutation operators, restricting mutations to changed lines, and selecting relevant tests.
   - Agent follows the steps defined in **Use Case 03.3 – Optimize Mutation Scope**.

4. **Execute Targeted Mutation Tests**
   - Agent executes mutation testing using Cosmic Ray with the optimized configuration.

5. **Report Results**
   - Agent presents mutation testing results.
   - Agent reports which files, lines, operators, or tests were skipped and the reasons for skipping them.

## Postconditions
- Mutation testing has been executed only on selected relevant parts of the codebase.
- Mutation testing results are available for analysis.

## Source
This use case was generated based on:
- `doc/user-stories/03-targeted-mutation-test-runs.md`: #03.0–#03.6

---
*Generated/modified by AI RooCode 3.36.6, used model xai/grok-code-fast-1*
