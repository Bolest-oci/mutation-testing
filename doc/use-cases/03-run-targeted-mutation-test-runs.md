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
   - Agent detects modified source files and exact changed line ranges using version control, while ignoring whitespace-only and non-code changes.
   - Agent applies line-based mutation filtering by following **Use Case 03.1 – Apply Line-Based Mutation Filtering**, which marks all mutation jobs outside the changed line ranges as skipped in the mutation database.
   - The resulting set of candidate files and line ranges is passed to subsequent steps.

2. **Apply Quality Gates**
   - Agent applies basic quality checks only to the previously identified candidate files and line ranges.
   - Agent follows **Use Case 03.2 – Apply Quality Gates**, which evaluates linting and available coverage information.
   - Any mutation jobs intersecting files or line ranges that fail applicable quality gates are marked as skipped in the mutation database.
   - The resulting refined set of candidate files and line ranges is passed to subsequent steps.


3. **Select Relevant Mutation Operators**
   - Agent optimizes the mutation scope by selecting mutation operators that are relevant to the previously selected code lines.
   - Agent follows the steps defined in **Use Case 03.3 – Optimize Mutation Scope**.

4. **Select Relevant Tests**
   - Agent identifies test files that correspond to each mutated module (e.g., test_module.py for module.py).
   - Agent updates the `test-command` in the Cosmic Ray configuration file to execute all identified test files, ensuring comprehensive coverage of the mutated code.

5. **Execute Targeted Mutations**
   - Agent executes mutation testing using Cosmic Ray with the optimized configuration.


## Postconditions
- Mutation testing has been executed only on selected relevant parts of the codebase.
- Mutation testing results are available for analysis.

## Source
This use case was generated based on:
- `doc/user-stories/03-targeted-mutation-test-runs.md`: #03.0–#03.6

---
*Generated/modified by AI RooCode 3.36.6, used model xai/grok-code-fast-1*
