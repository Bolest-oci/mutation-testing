import * as vscode from "vscode";
import { registerGeneratorCommand } from "../llmGeneratorBase";

/**
 * Registers the LLM generation command for the "Consolidate Conditional Expression" refactor.
 * This should be called in the extension's activate function.
 */
export function registerLLMCommand(context: vscode.ExtensionContext) {
    registerGeneratorCommand(
        context,
        "llm.generateConsolidateConditional",
        {
            refactorId: "consolidateConditional",
            refactorName: "Consolidate Conditional Expression",
            outputFile: "consolidateConditional/index.ts"
        }
    );
}
