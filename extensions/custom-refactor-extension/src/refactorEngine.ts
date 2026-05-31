import * as vscode from "vscode";
// TODO DOCUMENT
export interface RefactorContext {
  document: vscode.TextDocument;
  selection: vscode.Selection;
  language: string;
  code: string;
}

/**
 * Interface for all refactor implementations.
 * Using a class-based approach (Strategy/Command Pattern) 
 * allows for pre-execution checks and better state management.
 */
export abstract class BaseRefactor {
  abstract readonly id: string;

  /**
   * Optional check to see if the refactor is applicable at the current cursor/selection.
   * If it returns false, the refactor won't be shown in the menu.
   */
  async isApplicable(context: RefactorContext): Promise<boolean> {
    return true; // Default to true if not overridden
  }

  /**
   * The actual refactor logic.
   */
  abstract run(context: RefactorContext): void | Promise<void>;
}

type RefactorFunction = (context: RefactorContext) => void | Promise<void>;
type RefactorImplementation = RefactorFunction | BaseRefactor;

/**
 * Registry of implemented refactorings.
 */
const registry: Record<string, RefactorImplementation> = {};

/**
 * Register a refactoring implementation.
 */
export function registerRefactor(id: string, impl: RefactorImplementation) {
  console.log("REGISTER:", id);
  registry[id] = impl;
}

/**
 * Get a registered refactor.
 */
export function getRefactor(id: string): RefactorImplementation | undefined {
  return registry[id];
}

/**
 * Execute refactoring by id.
 */
export async function runRefactor(id: string, context: RefactorContext) {
  const refactor = registry[id];

  if (!refactor) {
    vscode.window.showWarningMessage(`Refactor "${id}" is not implemented yet.`);
    return;
  }

  // Example of Decorator Pattern: 
  // Wrapping the execution with logging and error handling
  console.log(`[REFACTOR ENGINE] Starting ${id}...`);
  const startTime = Date.now();

  try {
    if (refactor instanceof BaseRefactor) {
      await refactor.run(context);
    } else {
      await refactor(context);
    }
    console.log(`[REFACTOR ENGINE] Finished ${id} in ${Date.now() - startTime}ms`);
  } catch (err: any) {
    console.error(`[REFACTOR ENGINE] Error in ${id}:`, err);
    vscode.window.showErrorMessage(`Refactor "${id}" failed: ${err.message}`);
  }
}