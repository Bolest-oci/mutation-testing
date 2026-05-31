# Custom Refactor Extension

VS Code extension providing custom refactoring operations for JavaScript, TypeScript, Python and Shell Script.

## Supported Languages

- JavaScript
- TypeScript
- Python
- Shell Script

## Refactoring Categories

### LSP-based
- Extract Function
- Extract Variable
- Extract Constant
- Rename Symbol

### AST-based
- Inline Variable
- Consolidate Conditional Expression

### LLM-generated
- Convert If To Case
- Extract Constant (Shell)

### Runtime LLM Refactorings
- Split Variable
- Remove Flag Argument
- Replace Nested Conditional With Guard Clauses

## Features

- Code Actions integration
- Context-aware refactoring filtering
- Tree-sitter analysis for Shell Script
- Runtime YAML-defined refactorings
- LLM-assisted transformations

## Usage

Select code and open:

Refactor... → Custom Refactor

or use the lightbulb menu.
