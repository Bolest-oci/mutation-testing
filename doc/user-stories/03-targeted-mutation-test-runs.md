# 03.0 I want to perform mutation testing in a targeted way driven by recent code changes, so that only relevant parts of the codebase are mutated and tested, reducing execution time and noise while preserving meaningful results.

# 03.1 I want the system to detect relevant code changes using version control information, including modified source files and exact changed line ranges, while ignoring whitespace-only and non-code changes, so that mutation testing can be restricted to recently changed code.

# 03.2 I want mutation testing to be skipped for parts of the changed code that fail basic quality checks or lack sufficient test coverage (such as linting, static analysis, or zero coverage), so that only stable and test-relevant code remains eligible for mutation testing.

# 03.3 I want only mutation operators that are relevant to the nature of the detected code changes to be applied, so that irrelevant or equivalent mutants are avoided.

# 03.4 I want only tests that are relevant to the mutated code to be selected, so that mutation testing executes with minimal and focused test suites.

# 03.5 I want to execute the resulting targeted mutation tests using Cosmic Ray with the optimized configuration, so that only selected code lines, mutation operators, and relevant tests are executed.

---
*Generated/modified by AI RooCode 3.36.6, used model xai/grok-code-fast-1*
