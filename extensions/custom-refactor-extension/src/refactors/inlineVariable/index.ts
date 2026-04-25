import * as vscode from "vscode";
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "inlineVariable";

async function inlineVariable(context: RefactorContext) {

    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}

    const position = context.selection.active;

    editor.selection = new vscode.Selection(position, position);

    await vscode.commands.executeCommand(
        "editor.action.codeAction",
        {
            kind: "refactor.inline.variable"
        }
    );
}

registerRefactor(REFACTOR_ID, inlineVariable);