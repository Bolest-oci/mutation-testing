import * as vscode from "vscode";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

/**
 * Generic LLM-based refactor generator.
 *
 * This module provides reusable logic for generating new refactor implementations
 * using a language model (Copilot).
 *
 * HOW TO ADD NEW LLM REFACTOR:
 *
 * 1. Create directory in src/refactors/<name>/
 *
 * 2. Create prompt.yaml with RefactorGeneratorOptions
 *
 * 3. Create indexLlm.ts and call registerGeneratorCommand(context, commandId, loadRefactorConfig("<name>/prompt.yaml"))
 *
 * 4. Import indexLlm.ts in extension.ts and call registerLLMCommand(context) in activate()
 *
 * 5. Add command to package.json (contributes.commands with id + title)
 */


/**
 * Options for configuring the generic refactor generator.
 */
export interface RefactorGeneratorOptions {
    /** Unique identifier for the refactor */
    refactorId: string;
    /** Human-readable name of the refactor */
    refactorName: string;
    /** Specific goal or description of the refactor */
    goal?: string;
    /** List of expected behaviors or steps for the implementation */
    expectedBehavior?: string[];
    /** 
     * Output file path relative to src/refactors/ 
     * Defaults to ${refactorId}/index.ts
     */
    outputFile?: string;
}

/**
 * Core logic to generate a refactor implementation using LLM.
 * It uses the current editor state (file content and selection) as context.
 */
export async function runRefactorGenerator(options: RefactorGeneratorOptions): Promise<void> {
    const { refactorId, refactorName, goal, expectedBehavior, outputFile } = options;

    // 1. Get the current editor state
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("Open a file to provide context for the refactor generation");
        return;
    }

    const code = editor.document.getText();
    const selectedText = editor.document.getText(editor.selection);
    const language = editor.document.languageId;

    // 2. Select the LLM model (Copilot GPT-4)
    const [model] = await vscode.lm.selectChatModels({
        vendor: "copilot",
        family: "gpt-4.1"
    });

    if (!model) {
        vscode.window.showErrorMessage("No LLM available. Please ensure GitHub Copilot is active.");
        return;
    }

    // 3. Define the TypeScript template
    const template = `
import * as vscode from 'vscode';
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "${refactorId}";

/*
 AFTER GENERATION:
 - import this file in extension.ts
 - add this refactor to refactorCatalog.ts
*/

export async function ${refactorId}(context: RefactorContext): Promise<void> {

  // IMPLEMENTATION HERE

}

registerRefactor(REFACTOR_ID, ${refactorId});
`;

    // 4. Construct the prompt
    let prompt = `Your task is to implement a refactor called "${refactorName}".\n\nYou are working inside a custom VSCode extension.\n\n`;

    if (goal) {
        prompt += `Goal:\n${goal}\n\n`;
    }

    if (expectedBehavior && expectedBehavior.length > 0) {
        prompt += `Expected behavior:\n${expectedBehavior.map(b => `- ${b}`).join('\n')}\n\n`;
    }

    prompt += `Context:
- Programming language: ${language}
- Full file content:
${code}

- User selection:
${selectedText}

You are given a TypeScript template of the refactor.

Complete the implementation inside the function body.

Template:
${template}

Return the completed TypeScript file as plain code.
Add short comments explaining the key parts of the implementation.
`;

    const messages = [
        vscode.LanguageModelChatMessage.User(prompt)
    ];

    // 5. Send request to LLM
    try {
        const response = await model.sendRequest(
            messages,
            {},
            new vscode.CancellationTokenSource().token
        );

        // 6. Accumulate response
        let result = "";
        for await (const chunk of response.text) {
            result += chunk;
        }

        // 7. Cleanup response
        result = result
            .replace(/```typescript/g, "")
            .replace(/```/g, "")
            .replace(/^typescript\s*/i, "")
            .trim();

        // 8. Determine target file path
        const extensionPath = (global as any).extensionPath;

        if (!extensionPath) {
            vscode.window.showErrorMessage(
                "Extension path not found in global context."
            );
            return;
        }

        const relativePath =
            outputFile || `${refactorId}/index.ts`;

        const fileUri = vscode.Uri.file(
            `${extensionPath}/src/refactors/${relativePath}`
        );

        // 9. Read original file content (if file already exists)
        let originalContent = "";

        try {
            const bytes = await vscode.workspace.fs.readFile(fileUri);

            originalContent = new TextDecoder().decode(bytes);

        } catch {
            // File does not exist yet
            originalContent = "";
        }

        // 10. Ensure target file exists
        try {
            await vscode.workspace.fs.stat(fileUri);

        } catch {

            // Create empty file
            await vscode.workspace.fs.writeFile(
                fileUri,
                new TextEncoder().encode("")
            );
        }

        // 11. Open REAL target file
        const doc = await vscode.workspace.openTextDocument(fileUri);

        const generatedEditor =
            await vscode.window.showTextDocument(doc);

        // 12. Replace editor content WITHOUT saving
        const fullRange = new vscode.Range(
            doc.positionAt(0),
            doc.positionAt(doc.getText().length)
        );

        await generatedEditor.edit(editBuilder => {

            editBuilder.replace(fullRange, result);

        });

        // 13. Create readonly snapshot for LEFT diff side
        const originalDoc =
            await vscode.workspace.openTextDocument({
                content: originalContent,
                language: "typescript"
            });

        // 14. Open diff preview
        await vscode.commands.executeCommand(
            "vscode.diff",
            originalDoc.uri,
            fileUri,
            `Generated Refactor Preview: ${refactorName}`
        );

        // 15. Show success
        vscode.window.showInformationMessage(
            `Generated preview for "${refactorName}" ✔`
        );

    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to generate refactor: ${error.message}`);
    }
}

/**
 * Registers a VS Code command that triggers the refactor generation.
 */
export function registerGeneratorCommand(context: vscode.ExtensionContext, commandId: string, options: RefactorGeneratorOptions) {
    const cmd = vscode.commands.registerCommand(
        commandId,
        () => runRefactorGenerator(options)
    );
    context.subscriptions.push(cmd);
}

/**
 * Loads refactor configuration from a YAML file.
 * @param configPath Path to the YAML file relative to the extension's src/refactors directory.
 */
export function loadRefactorConfig(configPath: string): RefactorGeneratorOptions {
    const extensionPath = (global as any).extensionPath;
    if (!extensionPath) {
        throw new Error("Extension path not found in global context.");
    }

    const fullPath = path.join(extensionPath, "src", "refactors", configPath);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return yaml.load(fileContents) as RefactorGeneratorOptions;
}
