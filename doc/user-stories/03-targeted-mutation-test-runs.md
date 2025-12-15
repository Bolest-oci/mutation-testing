# 03.0 I want to perform targeted mutation testing driven by recent code changes, so that mutation tests focus only on newly introduced or modified logic.

# 03.1 I want the system to detect relevant code changes using version control information, including specific files and exact changed line ranges, while ignoring whitespace-only and non-code changes.

# 03.2 I want mutation testing to be skipped for parts of the code that fail basic quality checks (such as linting or static analysis), so that only stable and valid code is mutated.

# 03.3 I want test coverage to be considered when selecting mutation targets, skipping or deprioritizing code with zero or insufficient coverage.

# 03.4 I want to apply only mutation operators that are relevant to the nature of the detected code changes, in order to avoid generating meaningless or equivalent mutants.

# 03.5 I want to execute only tests that are relevant to the mutated code, avoiding execution of unrelated test suites to improve efficiency and reduce noise.

# 03.6 I want to use Cosmic Ray to perform these targeted mutation test runs on the selected code, lines, operators, and tests.

*Generated/modified by AI RooCode 3.36.6, used model xai/grok-code-fast-1*