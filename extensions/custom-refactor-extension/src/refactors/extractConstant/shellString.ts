/**
 * @file This module provides functionality to extract a string literal from a shell script
 * and replace it with a new constant variable. This refactoring helps in improving
 * readability and maintainability.
 */

import * as vscode from "vscode";
import { RefactorContext } from "../../refactorEngine";
import { treesitter_getNodeAt, treesitter_findParent, treesitter_rangeOf } from "../../analyzers/shell/treeSitter";

/**
 * Extracts a string literal from the selected range in a shell script,
 * prompts the user for a constant name, and replaces the literal with the new constant.
 *
 * @param context - The refactoring context containing the document, selection, and code.
 */
export async function extractConstantStringShell(context: RefactorContext) {

  // Destructure context to get document, selection, and code.
  const { document, selection, code } = context;

  // Calculate the offset of the selection's start position within the document.
  const offset = document.offsetAt(selection.start);

  // Get the Tree-sitter node at the calculated offset.
  const info = treesitter_getNodeAt(code, offset);

  // Find the parent 'string' node in the AST from the current node.
  const stringNode = treesitter_findParent(info.node, "string");

  // If no string node is found, exit the refactor.
  if (!stringNode) { return; }

  // Get the range (start and end positions) of the found string literal.
  const literal = treesitter_rangeOf(stringNode);

  // Prompt the user for the name of the new constant variable.
  const varName = await vscode.window.showInputBox({
    prompt: "Variable name",
    value: "VALUE"
  });

  // If the user cancels the input, exit the refactor.
  if (!varName) { return; }

  // Create a new WorkspaceEdit to apply changes to the document.
  const edit = new vscode.WorkspaceEdit();

  // Determine the position to insert the new constant declaration (beginning of the line).
  const insertPos = new vscode.Position(selection.start.line, 0);

  // Detect the document's newline style (LF or CRLF)
  // to avoid mixing different line endings in the file.
  const eol = document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";


  // Insert the new constant declaration (e.g., VALUE="some string") at the determined position.
  edit.insert(
    document.uri,
    insertPos,
    `${varName}=${literal.text}${eol}`
  );

  // Get the start and end positions of the string literal to be replaced.
  const startPos = document.positionAt(literal.start);
  const endPos = document.positionAt(literal.end);

  // Replace the original string literal with the new constant variable reference (e.g., $VALUE).
  edit.replace(
    document.uri,
    new vscode.Range(startPos, endPos),
    `$${varName}`
  );

  // Apply the workspace edit to the document.
  await vscode.workspace.applyEdit(edit);
}