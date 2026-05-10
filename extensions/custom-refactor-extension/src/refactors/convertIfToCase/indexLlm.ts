import * as vscode from "vscode";
import { registerGeneratorCommand, loadRefactorConfig } from "../llmGeneratorBase";

/**
 * Registers the LLM generation command for the "Convert if to case" refactor.
 */
export function registerLLMCommand(context: vscode.ExtensionContext) {
    const options = loadRefactorConfig("convertIfToCase/prompt.yaml");
    registerGeneratorCommand(
        context,
        "llm.generateConvertIfToCase",
        options
    );
}
