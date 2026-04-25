import * as vscode from "vscode";
import { RefactorContext } from "../../refactorEngine";

export async function extractConstantLsp(context: RefactorContext) {

    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}

    editor.selection = context.selection;

    await vscode.commands.executeCommand(
        "editor.action.codeAction",
        {
            kind: "refactor.extract.constant"
        }
    );
}