import * as vscode from "vscode";
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "extractFunction";

async function extractFunction(context: RefactorContext) {

    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}

    editor.selection = context.selection;

    await vscode.commands.executeCommand(
        "editor.action.codeAction",
        {
            kind: "refactor.extract.function"
        }
    );
}

registerRefactor(REFACTOR_ID, extractFunction);