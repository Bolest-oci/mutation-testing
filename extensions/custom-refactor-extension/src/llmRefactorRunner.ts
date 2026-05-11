import * as vscode from "vscode";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

/**
 * Runtime AI refactor configuration loaded from YAML files.
 */
export interface RuntimeRefactorConfig {

    /** Unique refactor identifier */
    refactorId: string;

    /** Human-readable refactor name */
    refactorName: string;

    /** Optional description shown in QuickPick */
    description?: string;

    /** Additional prompt rules */
    rules?: string[];
}

/**
 * Registers the runtime AI refactor command.
 *
 * HOW TO ADD NEW AI RUNTIME REFACTOR:
 *
 * 1. Create YAML file in:
 *    src/prompts/runtime/
 *
 * 2. Add:
 *    - refactorId
 *    - refactorName
 *    - description
 *    - rules
 *
 * 3. Run extension (F5)
 *
 * 4. Open Command Palette:
 *    "LLM Runtime Refactor"
 *
 * 5. Select refactor from QuickPick menu
 */
export function registerAIRefactorRunner(
    context: vscode.ExtensionContext
): void {

    const command = vscode.commands.registerCommand(
        "extension.llmRuntimeRefactor",
        runAIRefactor
    );

    context.subscriptions.push(command);
}

/**
 * Main runtime AI refactor flow.
 */
async function runAIRefactor(): Promise<void> {

    // 1. Get active editor
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage(
            "Open a file before running AI refactor."
        );
        return;
    }

    // 2. Load available YAML refactors
    const refactors = loadRuntimeRefactors();

    if (refactors.length === 0) {
        vscode.window.showErrorMessage(
            "No runtime refactor prompts found."
        );
        return;
    }

    // 3. Show QuickPick menu
    const selected = await vscode.window.showQuickPick(

        refactors.map(refactor => ({

            label: refactor.refactorName,

            description: refactor.description,

            refactor

        })),

        {
            placeHolder: "Select AI runtime refactor"
        }
    );

    if (!selected) {
        return;
    }

    const config = selected.refactor;

    // 4. Get editor context
    const document = editor.document;

    const fullCode = document.getText();

    const selectedCode =
        document.getText(editor.selection);

    const language =
        document.languageId;

    // 5. Select Copilot model
    const [model] = await vscode.lm.selectChatModels({
        vendor: "copilot",
        family: "gpt-4.1"
    });

    if (!model) {

        vscode.window.showErrorMessage(
            "No AI model available."
        );

        return;
    }

    // 6. Build prompt
    const prompt =
        buildPrompt(
            config,
            language,
            fullCode,
            selectedCode
        );

    const messages = [

        vscode.LanguageModelChatMessage.User(prompt)

    ];

    try {

        // 7. Send request
        const response = await model.sendRequest(
            messages,
            {},
            new vscode.CancellationTokenSource().token
        );

        // 8. Collect streamed response
        let result = "";

        for await (const chunk of response.text) {
            result += chunk;
        }

        // 9. Cleanup markdown formatting
        result = cleanupResponse(result);

        // 10. Open diff preview
        await openDiffPreview(
            editor,
            fullCode,
            result,
            config.refactorName
        );

        vscode.window.showInformationMessage(
            `AI refactor "${config.refactorName}" generated.`
        );

    } catch (error: any) {

        vscode.window.showErrorMessage(
            `AI refactor failed: ${error.message}`
        );
    }
}

/**
 * Loads all runtime YAML prompts.
 */
function loadRuntimeRefactors(): RuntimeRefactorConfig[] {

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
        "runtime"
    );

    const files = fs
        .readdirSync(promptsPath)
        .filter(file => file.endsWith(".yaml"));

    const refactors: RuntimeRefactorConfig[] = [];

    for (const file of files) {

        const fullPath =
            path.join(promptsPath, file);

        const content =
            fs.readFileSync(fullPath, "utf8");

        const parsed =
            yaml.load(content) as RuntimeRefactorConfig;

        refactors.push(parsed);
    }

    return refactors;
}

/**
 * Builds the AI prompt.
 */
function buildPrompt(
    config: RuntimeRefactorConfig,
    language: string,
    fullCode: string,
    selectedCode: string
): string {

    return `
You are a code refactoring engine.

Apply the Fowler refactoring:

"${config.refactorName}"

Description:
${config.description ?? ""}

Rules:
${(config.rules ?? [])
    .map(rule => `- ${rule}`)
    .join("\n")}

INPUT:

Programming language:
${language}

Full file:
${fullCode}

Selected code:
${selectedCode}

IMPORTANT:
- Modify only the selected code
- Preserve original behavior
- Keep formatting consistent
- Return ONLY the updated full file
- Do NOT add explanations
`;
}

/**
 * Removes markdown wrappers from AI response.
 */
function cleanupResponse(result: string): string {

    return result
        .replace(/```typescript/g, "")
        .replace(/```ts/g, "")
        .replace(/```/g, "")
        .trim();
}

/**
 * Opens VS Code diff preview.
 *
 * LEFT  = readonly original snapshot
 * RIGHT = real workspace file with AI changes applied
 *
 * User can:
 * - review changes
 * - press Ctrl+S to save
 * - undo changes normally
 */
async function openDiffPreview(
    editor: vscode.TextEditor,
    originalContent: string,
    generatedContent: string,
    refactorName: string
): Promise<void> {

    const document = editor.document;

    // 1. Create readonly snapshot for LEFT side
    const originalDoc =
        await vscode.workspace.openTextDocument({

            content: originalContent,

            language: document.languageId
        });

    // 2. Replace REAL file content
    const fullRange = new vscode.Range(

        document.positionAt(0),

        document.positionAt(document.getText().length)
    );

    await editor.edit(editBuilder => {

        editBuilder.replace(
            fullRange,
            generatedContent
        );

    });

    // 3. Open diff:
    // LEFT  = original snapshot
    // RIGHT = real edited workspace file
    await vscode.commands.executeCommand(

        "vscode.diff",

        originalDoc.uri,

        document.uri,

        `AI Refactor Preview: ${refactorName}`
    );
}