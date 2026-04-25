import * as vscode from "vscode";
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "extractVariable";

async function extractVariable(context: RefactorContext): Promise<void> {

    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    editor.selection = context.selection;

    await vscode.commands.executeCommand(
        "editor.action.codeAction",
        {
            kind: "refactor.extract"
        }
    );
}

registerRefactor(REFACTOR_ID, extractVariable);