import * as vscode from "vscode";
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "extractVariableLsp";

async function extractVariableLsp(context: RefactorContext) {
    const { document, selection } = context;

    // Check if the current active editor is the one we expect
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== document.uri.toString()) {
        return;
    }

    // Ensure the selection in the editor matches the context
    editor.selection = selection;

    try {
        await vscode.commands.executeCommand(
            "editor.action.codeAction",
            {
                kind: "refactor.extract.variable"
            }
        );
    } catch (error) {
        console.error("Failed to execute Extract Variable (LSP):", error);
    }
}

registerRefactor(REFACTOR_ID, extractVariableLsp);