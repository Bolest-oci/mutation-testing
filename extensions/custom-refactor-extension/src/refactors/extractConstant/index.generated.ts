import * as vscode from 'vscode';
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "extractConstantStringShell";

export async function extractConstantStringShell(context: RefactorContext): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const selection = editor.selection;
  const selectedText = document.getText(selection);

  // Ensure the selection is a string literal (e.g., "hello world")
  const stringLiteralMatch = selectedText.match(/^"(.*)"$/);
  if (!stringLiteralMatch) {
    vscode.window.showErrorMessage('Please select a string literal (e.g., "value")');
    return;
  }

  // Ask user for variable name
  const varName = await vscode.window.showInputBox({
    prompt: 'Enter variable name for extracted constant',
    validateInput: (input) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(input) ? null : 'Invalid shell variable name'
  });

  if (!varName) {
    return; // User cancelled
  }

  const value = stringLiteralMatch[1];

  // Find the start of the line to insert the variable assignment
  const line = document.lineAt(selection.start.line);
  const insertPosition = new vscode.Position(line.lineNumber, 0);

  // Prepare the edit: insert variable assignment and replace string literal
  const edit = new vscode.WorkspaceEdit();

  // Insert variable assignment at the beginning of the line
  edit.insert(document.uri, insertPosition, `${varName}="${value}"\n`);

  // Replace the original string literal with $VAR
  edit.replace(document.uri, selection, `$${varName}`);

  // Apply the edits
  await vscode.workspace.applyEdit(edit);
}

registerRefactor(REFACTOR_ID, extractConstantStringShell);