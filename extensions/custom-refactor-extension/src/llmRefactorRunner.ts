import * as vscode from "vscode";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

/**
 * HOW TO ADD A NEW RUNTIME LLM REFACTOR
 *
 * 1. Create a YAML file in:
 *    src/prompts/runtime/
 *
 * 2. Define:
 *    - refactorId
 *    - refactorName
 *    - description
 *    - rules
 *
 * 3. The refactor is automatically available in:
 *    - Command Palette
 *      -> "LLM Runtime Refactor"
 *
 * 4. Optional:
 *    Register the refactor in REFACTOR_LIST
 *    if it should also appear in:
 *    - Refactor menu (Ctrl+Shift+R)
 *    - Lightbulb code actions
 *    - Code smell mappings
 */


/**
 * Configuration for a runtime AI refactor, typically loaded from a YAML file.
 */
export interface RuntimeRefactorConfig {
    /** Unique identifier for the refactor */
    refactorId: string;

    /** Human-readable name displayed in the UI */
    refactorName: string;

    /** Optional description explaining what the refactor does */
    description?: string;

    /** Optional set of rules or guidelines for the AI to follow */
    rules?: string[];
}

/**
 * Registers the runtime AI refactor command with VS Code.
 * @param context The extension context.
 */
export function registerAIRefactorRunner(context: vscode.ExtensionContext): void {
    const command = vscode.commands.registerCommand(
        "extension.llmRuntimeRefactor",
        runAIRefactor
    );
    context.subscriptions.push(command);
}

/**
 * Entry point for the AI refactor command. 
 * Orchestrates the selection and execution of a runtime refactor.
 */
async function runAIRefactor(): Promise<void> {
    const config = await selectRuntimeRefactor();
    if (!config) {
        return;
    }
    await executeRuntimeRefactor(config);
}

/**
 * Shows a QuickPick menu to the user to select one of the available runtime refactors.
 * @returns The selected refactor configuration, or undefined if cancelled.
 */
async function selectRuntimeRefactor(): Promise<RuntimeRefactorConfig | undefined> {
    const refactors = loadRuntimeRefactors();

    if (refactors.length === 0) {
        vscode.window.showErrorMessage("No runtime refactor prompts found in the extension's prompts/runtime directory.");
        return;
    }

    const selected = await vscode.window.showQuickPick(
        refactors.map(refactor => ({
            label: refactor.refactorName,
            description: refactor.description,
            refactor
        })),
        {
            placeHolder: "Select an AI-powered refactor to apply"
        }
    );

    return selected?.refactor;
}

/**
 * Executes a specific runtime refactor using the VS Code Language Model API.
 * 
 * The execution pipeline:
 * 1. Validates active editor.
 * 2. Selects an appropriate AI model.
 * 3. Builds the prompt with context (full code, selection, rules).
 * 4. Sends the request and processes the streaming response.
 * 5. Cleans up the response (removes markdown).
 * 6. Opens a diff preview for the user to review.
 * 
 * @param config The refactor configuration to execute.
 */
export async function executeRuntimeRefactor(config: RuntimeRefactorConfig): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("Please open a file before running an AI refactor.");
        return;
    }

    const document = editor.document;
    const fullCode = document.getText();
    const selectedCode = document.getText(editor.selection);
    const language = document.languageId;

    // We prefer Copilot GPT-4.1 for high-quality refactoring
    const [model] = await vscode.lm.selectChatModels({
        vendor: "copilot",
        family: "gpt-4.1" // Use generic gpt-4 family for better compatibility
    });

    if (!model) {
        vscode.window.showErrorMessage("No compatible AI model available. Please ensure GitHub Copilot is enabled.");
        return;
    }

    const prompt = buildPrompt(config, language, fullCode, selectedCode);
    const messages = [vscode.LanguageModelChatMessage.User(prompt)];

    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Running AI Refactor: ${config.refactorName}`,
            cancellable: true
        }, async (progress, token) => {
            const response = await model.sendRequest(messages, {}, token);
            let result = "";

            for await (const chunk of response.text) {
                result += chunk;
            }

            const cleanedResult = cleanupResponse(result);

            if (!cleanedResult || cleanedResult === fullCode) {
                vscode.window.showInformationMessage("AI did not suggest any changes.");
                return;
            }

            await openDiffPreview(editor, fullCode, cleanedResult, config.refactorName);
            vscode.window.showInformationMessage(`AI refactor "${config.refactorName}" applied as a preview.`);
        });
    } catch (error: any) {
        if (error instanceof vscode.CancellationError) {
            return;
        }
        vscode.window.showErrorMessage(`AI refactor failed: ${error.message}`);
    }
}

/**
 * Locates and executes a runtime refactor by its unique identifier.
 * Primarily used when triggered via CodeActions or other internal registries.
 * @param refactorId The ID of the refactor to run.
 */
export async function runRuntimeRefactorById(refactorId: string): Promise<void> {
    const refactors = loadRuntimeRefactors();
    const config = refactors.find(r => r.refactorId === refactorId);

    if (!config) {
        vscode.window.showErrorMessage(`Runtime refactor with ID "${refactorId}" not found.`);
        return;
    }

    await executeRuntimeRefactor(config);
}

/**
 * Synchronously loads all YAML refactor configurations from the extension's runtime prompts directory.
 * @returns An array of runtime refactor configurations.
 */
export function loadRuntimeRefactors(): RuntimeRefactorConfig[] {
    // extensionPath is expected to be set in the global scope during extension activation.
    const extensionPath = (global as any).extensionPath;

    if (!extensionPath) {
        throw new Error("Extension path not initialized. Ensure 'extensionPath' is set on 'global' during activation.");
    }

    const promptsPath = path.join(extensionPath, "src", "prompts", "runtime");

    if (!fs.existsSync(promptsPath)) {
        return [];
    }

    const files = fs.readdirSync(promptsPath).filter(file => file.endsWith(".yaml"));
    const refactors: RuntimeRefactorConfig[] = [];

    for (const file of files) {
        try {
            const fullPath = path.join(promptsPath, file);
            const content = fs.readFileSync(fullPath, "utf8");
            const parsed = yaml.load(content) as RuntimeRefactorConfig;

            if (parsed && parsed.refactorId && parsed.refactorName) {
                refactors.push(parsed);
            }
        } catch (err) {
            console.error(`Failed to load prompt from ${file}:`, err);
        }
    }

    return refactors;
}

/**
 * Constructs the prompt sent to the AI model.
 * 
 * @param config Refactor settings and rules.
 * @param language The programming language of the source file.
 * @param fullCode The entire content of the file (for context).
 * @param selectedCode The specific snippet the user wants to refactor.
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
 * Removes markdown formatting (like code blocks) from the AI's response to extract raw code.
 * @param result The raw string response from the AI.
 */
function cleanupResponse(result: string): string {
    return result
        .replace(/^```[a-z]*\n([\s\S]*?)\n```$/gm, '$1') // Match full code blocks
        .replace(/```[a-z]*\n?/g, "")                   // Remove opening markers
        .replace(/```/g, "")                            // Remove closing markers
        .trim();
}

/**
 * Displays a diff between the original code and the AI-generated refactor.
 * Uses a temporary document for the "original" side to allow VS Code's diff engine to work.
 * 
 * @param editor The active text editor.
 * @param originalContent The code before refactoring.
 * @param generatedContent The code suggested by the AI.
 * @param refactorName Name of the refactor for the diff title.
 */
async function openDiffPreview(
    editor: vscode.TextEditor,
    originalContent: string,
    generatedContent: string,
    refactorName: string
): Promise<void> {
    const document = editor.document;

    // Create a temporary document to hold the original content for comparison
    const originalDoc = await vscode.workspace.openTextDocument({
        content: originalContent,
        language: document.languageId
    });

    // Replace the content of the active editor with the generated code
    // This allows the user to use 'Undo' to revert the change easily.
    const fullRange = document.validateRange(
        new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
    );

    await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, generatedContent);
    });

    // Open the diff view
    await vscode.commands.executeCommand(
        "vscode.diff",
        originalDoc.uri,
        document.uri,
        `AI Refactor Preview: ${refactorName}`
    );
}
