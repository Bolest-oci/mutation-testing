import * as vscode from "vscode";
// TODO DOCUMENT
export interface RefactorContext {
  document: vscode.TextDocument;
  selection: vscode.Selection;
  language: string;
  code: string;
}

type RefactorFunction = (context: RefactorContext) => void | Promise<void>;

/**
 * Registry of implemented refactorings.
 * New refactorings are registered here.
 */
const registry: Record<string, RefactorFunction> = {};

/**
 * Register a refactoring implementation.
 */
export function registerRefactor(id: string, fn: RefactorFunction) {
  console.log("REGISTER:", id);
  registry[id] = fn;
}

/**
 * Execute refactoring by id.
 */
export function runRefactor(id: string, context: RefactorContext) {
  const refactor = registry[id];

  if (!refactor) {
    vscode.window.showWarningMessage(`Refactor "${id}" is not implemented yet.`);
    return;
  }

  refactor(context);
}