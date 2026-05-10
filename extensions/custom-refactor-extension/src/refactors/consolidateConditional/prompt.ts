import * as vscode from "vscode";
import { registerGeneratorCommand, loadRefactorConfig } from "../llmGeneratorBase";

/**
 * Registers the LLM generation command for the "Consolidate Conditional Expression" refactor.
 * This should be called in the extension's activate function.
 */
export function registerLLMCommand(context: vscode.ExtensionContext) {
    const options = loadRefactorConfig("consolidateConditional/prompt.yaml");
    registerGeneratorCommand(
        context,
        "llm.generateConsolidateConditional",
        options
    );
}
