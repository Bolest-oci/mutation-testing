import * as vscode from "vscode";
import { registerGeneratorCommand } from "../llmGeneratorBase";

/**
 * Registers the LLM generation command for the "Extract Constant (String)" refactor.
 */
export function registerLLMCommand(context: vscode.ExtensionContext) {
    registerGeneratorCommand(
        context,
        "llm.generateExtractConstantString",
        {
            refactorId: "extractConstantStringShell",
            refactorName: "Extract Constant (String)",
            goal: "Replace a selected string literal with a variable in shell scripts.",
            expectedBehavior: [
                "Ask user for variable name",
                "Insert variable assignment at the beginning of the line (e.g. NAME=\"value\")",
                "Replace original string with $NAME"
            ],
            outputFile: "extractConstant/index.generated.ts"
        }
    );
}
