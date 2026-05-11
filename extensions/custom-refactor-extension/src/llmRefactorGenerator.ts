import * as vscode from "vscode";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

/**
 * Configuration for LLM-generated refactor implementations.
 */
export interface RefactorGeneratorConfig {

    /** Unique refactor identifier */
    refactorId: string;

    /** Human-readable refactor name */
    refactorName: string;

    /** Optional description */
    goal?: string;

    /** Expected implementation behavior */
    expectedBehavior?: string[];

    /**
     * Output file path relative to:
     * src/refactors/
     */
    outputFile?: string;
}

/**
 * Generic LLM-based refactor generator.
 *
 * This module provides reusable logic for generating new refactor implementations
 * using a language model (Copilot).
 *
 * HOW TO ADD NEW LLM GENERATOR:
 *
 * 1. Create directory in:
 *    src/refactors/<name>/
 *
 * 2. Create:
 *    src/prompts/generators/<name>.yaml
 *
 * 3. Add:
 *    - refactorId
 *    - refactorName
 *    - goal
 *    - expectedBehavior
 *
 * 4. Run extension (F5)
 *
 * 5. Open Command Palette:
 *    "LLM Refactor Generator"
 *
 * 6. Select generator from QuickPick menu
 *
 * 7. Generated implementation will be created in:
 *    src/refactors/<refactorId>/index.generated.ts
 */
export function registerLLMRefactorGenerator(
    context: vscode.ExtensionContext
): void {

    const command = vscode.commands.registerCommand(
        "extension.llmRefactorGenerator",
        runLLMRefactorGenerator
    );

    context.subscriptions.push(command);
}

/**
 * Main generator flow.
 */
async function runLLMRefactorGenerator(): Promise<void> {

    // 1. Active editor
    const editor = vscode.window.activeTextEditor;

    if (!editor) {

        vscode.window.showErrorMessage(
            "Open a file before running LLM generator."
        );

        return;
    }

    // 2. Load YAML configs
    const generators = loadGeneratorConfigs();

    if (generators.length === 0) {

        vscode.window.showErrorMessage(
            "No generator prompts found."
        );

        return;
    }

    // 3. QuickPick
    const selected = await vscode.window.showQuickPick(

        generators.map(generator => ({

            label: generator.refactorName,

            description: generator.goal,

            generator

        })),

        {
            placeHolder: "Select LLM refactor generator"
        }
    );

    if (!selected) {
        return;
    }

    const config = selected.generator;

    // 4. Editor context
    const document = editor.document;

    const code =
        document.getText();

    const selectedText =
        document.getText(editor.selection);

    const language =
        document.languageId;

    // 5. Select LLM model
    const [model] = await vscode.lm.selectChatModels({

        vendor: "copilot",

        family: "gpt-4.1"
    });

    if (!model) {

        vscode.window.showErrorMessage(
            "No LLM available. Please ensure GitHub Copilot is active."
        );

        return;
    }

    // 6. Define the TypeScript template
    const template = `
import * as vscode from 'vscode';
import { registerRefactor, RefactorContext } from "../../refactorEngine";

const REFACTOR_ID = "${config.refactorId}";

/*
 AFTER GENERATION:
 - import this file in extension.ts
 - add this refactor to refactorCatalog.ts
*/

export async function ${config.refactorId}(context: RefactorContext): Promise<void> {

  // IMPLEMENTATION HERE

}

registerRefactor(REFACTOR_ID, ${config.refactorId});
`;

    // 7. Construct prompt
    let prompt =
`Your task is to implement a refactor called "${config.refactorName}".

You are working inside a custom VSCode extension.

`;

    if (config.goal) {

        prompt += `Goal:
${config.goal}

`;
    }

    if (
        config.expectedBehavior &&
        config.expectedBehavior.length > 0
    ) {

        prompt += `Expected behavior:
${config.expectedBehavior
    .map(rule => `- ${rule}`)
    .join("\n")}

`;
    }

    prompt += `Context:

- Programming language:
${language}

- Full file content:
${code}

- User selection:
${selectedText}

You are given a TypeScript template of the refactor.

Complete the implementation inside the function body.

Template:
${template}

IMPORTANT:
- Return ONLY valid TypeScript
- Do NOT add explanations
- Preserve template structure
- Add short comments explaining key implementation parts
`;

    const messages = [
        vscode.LanguageModelChatMessage.User(prompt)
    ];

    try {

        // 8. Send request
        const response = await model.sendRequest(
            messages,
            {},
            new vscode.CancellationTokenSource().token
        );

        // 9. Accumulate response
        let result = "";

        for await (const chunk of response.text) {
            result += chunk;
        }

        // 10. Cleanup markdown formatting
        result = cleanupResponse(result);

        // 11. Open generated preview
        await openGeneratedPreview(
            config,
            result
        );

        vscode.window.showInformationMessage(
            `Generated preview for "${config.refactorName}" ✔`
        );

    } catch (error: any) {

        vscode.window.showErrorMessage(
            `LLM generator failed: ${error.message}`
        );
    }
}

/**
 * Loads all generator YAML files.
 */
function loadGeneratorConfigs(): RefactorGeneratorConfig[] {

    const extensionPath =
        (global as any).extensionPath;

    if (!extensionPath) {

        throw new Error(
            "Extension path not found."
        );
    }

    const promptsPath = path.join(

        extensionPath,

        "src",

        "prompts",

        "generators"
    );

    const files = fs
        .readdirSync(promptsPath)
        .filter(file => file.endsWith(".yaml"));

    const generators: RefactorGeneratorConfig[] = [];

    for (const file of files) {

        const fullPath =
            path.join(promptsPath, file);

        const content =
            fs.readFileSync(fullPath, "utf8");

        const parsed =
            yaml.load(content) as RefactorGeneratorConfig;

        generators.push(parsed);
    }

    return generators;
}

/**
 * Removes markdown wrappers from LLM response.
 */
function cleanupResponse(
    result: string
): string {

    return result
        .replace(/```typescript/g, "")
        .replace(/```ts/g, "")
        .replace(/```/g, "")
        .trim();
}

/**
 * Opens generated diff preview.
 *
 * LEFT  = readonly original snapshot
 * RIGHT = real generated file
 */
async function openGeneratedPreview(
    config: RefactorGeneratorConfig,
    generatedContent: string
): Promise<void> {

    const extensionPath =
        (global as any).extensionPath;

    const relativePath =
        config.outputFile ||
        `${config.refactorId}/index.generated.ts`;

    const fileUri = vscode.Uri.file(

        path.join(
            extensionPath,
            "src",
            "refactors",
            relativePath
        )
    );

    // 1. Read original content
    let originalContent = "";

    try {

        const bytes =
            await vscode.workspace.fs.readFile(fileUri);

        originalContent =
            new TextDecoder().decode(bytes);

    } catch {

        originalContent = "";
    }

    // 2. Ensure file exists
    try {

        await vscode.workspace.fs.stat(fileUri);

    } catch {

        await vscode.workspace.fs.writeFile(
            fileUri,
            new TextEncoder().encode("")
        );
    }

    // 3. Open real file
    const doc =
        await vscode.workspace.openTextDocument(fileUri);

    const editor =
        await vscode.window.showTextDocument(doc);

    // 4. Replace content
    const fullRange = new vscode.Range(

        doc.positionAt(0),

        doc.positionAt(doc.getText().length)
    );

    await editor.edit(editBuilder => {

        editBuilder.replace(
            fullRange,
            generatedContent
        );

    });

    // 5. Create readonly LEFT snapshot
    const originalDoc =
        await vscode.workspace.openTextDocument({

            content: originalContent,

            language: "typescript"
        });

    // 6. Open diff preview
    await vscode.commands.executeCommand(

        "vscode.diff",

        originalDoc.uri,

        fileUri,

        `Generated Refactor Preview: ${config.refactorName}`
    );
}