import * as vscode from 'vscode';
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "convertIfToCase";

/*
 AFTER GENERATION:
 - import this file in extension.ts
 - add this refactor to refactorCatalog.ts
*/

export async function convertIfToCase(context: RefactorContext): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const doc = editor.document;
  const sel = context.selection ?? editor.selection;
  const selectedText = doc.getText(sel);

  // Split selection into lines for line-based processing
  const lines = selectedText.split('\n');

  // Store parsed branches
  type Branch = {
    pattern: string | null, // null for else
    commands: string[]
  };
  const branches: Branch[] = [];

  let variable: string | null = null;
  let inBranch = false;
  let currentBranch: Branch | null = null;

  // Helper to trim shell condition and extract variable and value
  function parseCondition(line: string): { variable: string, value: string } | null {
    // Match: if [ "$cmd" = "start" ]; then
    const m = line.match(/^\s*(if|elif)\s*\[\s*["']?(\$\w+)["']?\s*=\s*["']?([^"'\]]+)["']?\s*\]\s*;\s*then\s*$/);
    if (!m) return null;
    return { variable: m[2], value: m[3] };
  }

  // Process each line
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    // Start of a new branch: if or elif
    const cond = parseCondition(line);
    if (cond) {
      if (!variable) variable = cond.variable;
      // If variable changes, abort (not a valid chain)
      if (variable !== cond.variable) return;
      // Save previous branch if any
      if (currentBranch) branches.push(currentBranch);
      currentBranch = { pattern: cond.value, commands: [] };
      inBranch = true;
      continue;
    }

    // else branch
    if (/^\s*else\s*$/.test(line)) {
      if (currentBranch) branches.push(currentBranch);
      currentBranch = { pattern: null, commands: [] };
      inBranch = true;
      continue;
    }

    // End of if chain
    if (/^\s*fi\b/.test(line)) {
      if (currentBranch) branches.push(currentBranch);
      currentBranch = null;
      inBranch = false;
      continue;
    }

    // Inside a branch: collect commands
    if (inBranch && currentBranch) {
      // Ignore empty lines between then/else and commands
      if (line.trim() === '') continue;
      currentBranch.commands.push(line);
    }
  }

  // If no valid branches or variable found, abort
  if (!variable || branches.length === 0) return;

  // Build the case statement
  const indentMatch = lines[0].match(/^(\s*)/);
  const baseIndent = indentMatch ? indentMatch[1] : '';
  const caseLines: string[] = [];
  caseLines.push(`${baseIndent}case ${variable} in`);
  for (const branch of branches) {
    const pat = branch.pattern !== null ? branch.pattern : '*';
    caseLines.push(`${baseIndent}  ${pat})`);
    for (const cmd of branch.commands) {
      caseLines.push(`${baseIndent}    ${cmd.trim()}`);
    }
    caseLines.push(`${baseIndent}    ;;`);
  }
  caseLines.push(`${baseIndent}esac`);

  // Replace the selection with the new case statement
  await editor.edit(editBuilder => {
    editBuilder.replace(sel, caseLines.join('\n'));
  });
}

registerRefactor(REFACTOR_ID, convertIfToCase);