import * as vscode from 'vscode';
import { registerRefactor, RefactorContext } from "../../refactorEngine";

/**
 * Unique identifier for the refactor. 
 * This ID is used to register and identify the refactor within the engine.
 * When creating a new refactor, ensure this ID is unique.
 */
const REFACTOR_ID = "consolidateConditional";

/**
 * Main refactor function.
 * 
 * To create a new refactor:
 * 1. Define a new REFACTOR_ID.
 * 2. Implement the logic for code analysis and transformation in this function.
 * 3. Use 'editor.edit' to apply changes to the document.
 * 4. Register the function at the bottom of the file.
 * 
 * If you are creating an LLM-based prompt for a new refactor:
 * Use the structure of this file as a template in your 'prompt.ts'.
 */
export async function consolidateConditional(context: RefactorContext): Promise<void> {

  // Access the active text editor to interact with the code
  const editor = vscode.window.activeTextEditor;
  if (!editor) {return;}

  const document = editor.document;
  const selection = editor.selection;
  const selectedText = document.getText(selection);

  // --- Implementation Logic Start ---
  // This section contains the specific logic for this refactor.
  // In this case, it uses regex to parse and consolidate shell-style conditionals.
  
  // Match all elif/if conditions and their bodies
  const conditionalRegex = /(if|elif)\s*\[(.*?)\]\s*;\s*then([\s\S]*?)(?=elif|fi|$)/g;
  let match;
  const conditions: string[] = [];
  const bodies: string[] = [];

  while ((match = conditionalRegex.exec(selectedText)) !== null) {
    const condition = match[2].trim();
    const body = match[3].trim();
    // Avoid duplicate conditions
    if (!conditions.includes(condition)) {
      conditions.push(condition);
      bodies.push(body);
    }
  }

  // Find the else/fi block if present
  const fiMatch = selectedText.match(/fi\s*$/);
  const hasFi = !!fiMatch;

  // Reconstruct the consolidated conditional
  let result = '';
  for (let i = 0; i < conditions.length; i++) {
    if (i === 0) {
      result += `if [${conditions[i]} ]; then\n  ${bodies[i]}\n`;
    } else {
      result += `elif [${conditions[i]} ]; then\n  ${bodies[i]}\n`;
    }
  }
  if (hasFi) {
    result += 'fi\n';
  }
  // --- Implementation Logic End ---

  /**
   * Apply the transformation to the document.
   * 'editBuilder.replace' replaces the user's selection with the newly generated 'result'.
   */
  await editor.edit(editBuilder => {
    editBuilder.replace(selection, result.trimEnd());
  });
}

/**
 * Register the refactor with the RefactorEngine.
 * This makes the refactor available for execution via the extension.
 */
registerRefactor(REFACTOR_ID, consolidateConditional);
