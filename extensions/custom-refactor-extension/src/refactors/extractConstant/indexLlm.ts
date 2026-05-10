import * as vscode from "vscode";
import { registerGeneratorCommand, loadRefactorConfig } from "../llmGeneratorBase";

/**
 * Registers the LLM generation command for the "Extract Constant (String)" refactor.
 */
export function registerLLMCommand(context: vscode.ExtensionContext) {
    const options = loadRefactorConfig("extractConstant/prompt.yaml");
    registerGeneratorCommand(
        context,
        "llm.generateExtractConstantString",
        options
    );
}
