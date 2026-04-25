import * as vscode from "vscode";
import { RefactorContext } from "../../refactorEngine";
import jscodeshift from "jscodeshift";
import * as recast from "recast";


/**
 * Implementation of Extract Variable refactoring.
 * Currently supports JavaScript and TypeScript using jscodeshift.
 */
export async function extractVariableJsTs(context: RefactorContext) {
  const { document, selection, language, code } = context;

  // Choose the appropriate parser for jscodeshift
  const j = language === "typescript" ? jscodeshift.withParser("ts") : jscodeshift.withParser("babel");

  try {
    const root = j(code);
    const startOffset = document.offsetAt(selection.start);
    const endOffset = document.offsetAt(selection.end);

    // Find the smallest expression that contains the selection
    let bestPath: any = null;

    // We iterate over all Expression nodes
    root.find(j.Expression).forEach(path => {
      const node = path.node as any;
      const start = node.start;
      const end = node.end;
      if (start !== undefined && end !== undefined) {

        const allowed =
          j.BinaryExpression.check(node) ||
          j.CallExpression.check(node) ||
          j.MemberExpression.check(node) ||
          j.LogicalExpression.check(node) ||
          j.ConditionalExpression.check(node) ||
          j.ArrayExpression.check(node) ||
          j.ObjectExpression.check(node) ||
          j.TemplateLiteral.check(node);

        if (!allowed) {
          return;
        }
        // Check if the node contains the selection
        if (start >= startOffset && end <= endOffset) {
          // We want the smallest such node
          if (!bestPath ||
            (end - start) < ((bestPath.node as any).end - (bestPath.node as any).start)) {
            bestPath = path;
          }
        }
      }
    });

    if (!bestPath) {
      vscode.window.showErrorMessage("Could not find a valid expression to extract at selection.");
      return;
    }

    const node = bestPath.node as any;
    const expressionCode = code.substring(node.start, node.end);

    // Find a suitable place to insert the variable declaration.
    // We look for the parent statement.
    // Find the statement that contains the selected expression.
    let anchorStatementPath = bestPath;
    while (anchorStatementPath && !j.Statement.check(anchorStatementPath.node) && anchorStatementPath.parentPath) {
      anchorStatementPath = anchorStatementPath.parentPath;
    }

    if (!anchorStatementPath) {
      vscode.window.showErrorMessage("Could not find a suitable statement to anchor the variable extraction.");
      return;
    }

    // Find the nearest block scope (BlockStatement or Program) to insert the variable.
    let scopeContainerPath = anchorStatementPath;
    while (scopeContainerPath && !j.BlockStatement.check(scopeContainerPath.node) && !j.Program.check(scopeContainerPath.node)) {
      scopeContainerPath = scopeContainerPath.parentPath;
    }

    if (!scopeContainerPath) {
      vscode.window.showErrorMessage("Could not find a suitable scope to insert the variable.");
      return;
    }

    const varName = await vscode.window.showInputBox({
      prompt: "Enter variable name",
      value: "extractedVar"
    });

    if (varName === undefined) {
      return;
    }

    const edit = new vscode.WorkspaceEdit();

    // Replace the original expression with the variable name
    edit.replace(
      document.uri,
      new vscode.Range(document.positionAt(node.start), document.positionAt(node.end)),
      varName
    );

    // Construct the new variable declaration statement
    const varDeclaration = j.variableDeclaration("const", [j.variableDeclarator(j.identifier(varName), node)]);
    const varDeclarationCode = recast.print(varDeclaration).code;

    let forParentPath = bestPath;

    while (forParentPath && !j.ForStatement.check(forParentPath.node)) {
      forParentPath = forParentPath.parentPath;
    }

    // Insert the declaration into the appropriate scope
    let insertionPosition: vscode.Position;

    if (forParentPath) {

      // expression je vo for()
      insertionPosition = document.positionAt(forParentPath.node.start);

    }

    // If the anchor statement is a ReturnStatement, insert before it
    else if (j.ReturnStatement.check(anchorStatementPath.node)) {
      insertionPosition = document.positionAt(anchorStatementPath.node.start);
    } else if (j.ForStatement.check(anchorStatementPath.node) || j.WhileStatement.check(anchorStatementPath.node)) {
      // If the expression is part of a loop's test/init/update, insert before the loop
      // More robust check needed if 'node' is specifically within init/test/update parts
      // For now, if the anchor is a loop statement, insert before it.
      insertionPosition = document.positionAt(anchorStatementPath.node.start);
    } else {
      insertionPosition = document.positionAt(anchorStatementPath.node.start);
    }

    const lineText = document.lineAt(insertionPosition.line).text;
    const indentation = lineText.match(/^\s*/)?.[0] || "";

    edit.insert(
      document.uri,
      insertionPosition,
      `${varDeclarationCode}\n${indentation}`
    );

    await vscode.workspace.applyEdit(edit);

  } catch (error) {
    vscode.window.showErrorMessage(`Error during refactoring: ${error instanceof Error ? error.message : String(error)}`);
  }
}

