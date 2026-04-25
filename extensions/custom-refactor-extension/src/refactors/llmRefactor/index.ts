import * as vscode from "vscode";
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "llmRefactor";

async function llmRefactor(context: RefactorContext): Promise<void> {

    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    const { code, selection } = context;

    const selectedText = editor.document.getText(selection);

    const [model] = await vscode.lm.selectChatModels({
        vendor: "copilot"
    });

    if (!model) {
        vscode.window.showErrorMessage("No LLM model available");
        return;
    }

    const messages = [
    vscode.LanguageModelChatMessage.User(`
You are a code refactoring engine.

INPUT:
- Programming language: ${context.language}
- Full file:
${code}

- Selected code:
${selectedText}

TASK:
Apply the refactoring "Consolidate Conditional Expression" ONLY to the selected code.

RULES:
- Do NOT change anything outside the selected code
- Preserve original formatting and style
- Do NOT add explanations
- Return ONLY the updated full file

OUTPUT:
Return the full updated file as plain code.
`)
];

    const response = await model.sendRequest(
        messages,
        {},
        new vscode.CancellationTokenSource().token
    );

    let result = "";
    for await (const chunk of response.text) {
        result += chunk;
    }
    console.log("LLM OUTPUT:", result);

    const fullRange = new vscode.Range(
        editor.document.positionAt(0),
        editor.document.positionAt(code.length)
    );

    const edit = new vscode.WorkspaceEdit();
    edit.replace(editor.document.uri, fullRange, result);

    await vscode.workspace.applyEdit(edit);
}

registerRefactor(REFACTOR_ID, llmRefactor);