import * as vscode from "vscode";
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "renameSymbol";

async function renameSymbol(context: RefactorContext) {

    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}

    editor.selection = context.selection;

    await vscode.commands.executeCommand(
        "editor.action.rename"
    );
}

registerRefactor(REFACTOR_ID, renameSymbol);