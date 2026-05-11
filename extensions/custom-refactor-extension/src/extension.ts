/**
 * Custom VSCode Refactor Extension
 *
 * This extension exposes a catalog of refactorings defined in refactorCatalog.ts
 * and surfaces them in the VS Code "Refactor..." context menu when text is selected.
 * 
 * --- HOW IT WORKS ---
 *
 * 1. User selects code or places cursor
 * 2. VS Code calls CustomRefactorProvider
 * 3. Provider:
 *    - detects language
 *    - optionally detects code smell from comments
 *    - filters applicable refactors
 * 4. Matching refactors are shown in the UI
 * 5. When user selects one:
 *    → command "custom-refactor-extension.executeRefactor" is executed
 * 6. Command calls runRefactor(id, context)
 * 7. Refactor implementation is executed
 * 
 * --- HOW TO ADD A NEW REFACTOR ---
 * 
 * 1. Register the refactor metadata in `src/refactorCatalog.ts`.
 *    Add a new entry to the `REFACTOR_LIST` array with a unique `id`.
 * 
 * 2. Create the implementation in `src/refactors/`.
 *    In your implementation file, use `registerRefactor(id, callback)` from `src/refactorEngine.ts`
 *    to map your logic to the `id` you defined in the catalog.
 * 
 * 3. Import your implementation file below.
 *    This ensures that `registerRefactor` is called when the extension activates.
 * 
 * 4. (Optional) Update the supported languages.
 *    If your refactor introduces a new language, add it to the list in `registerCodeActionsProvider`
 *    within the `activate` function.

 */
import * as vscode from 'vscode';
import { REFACTOR_LIST, CODE_SMELL_MAPPING } from './refactorCatalog';
import { runRefactor } from './refactorEngine';
// Import refactor implementations here to trigger their registration
import "./refactors/extractVariable";
import "./refactors/extractVariable/lsp";
import "./refactors/inlineVariable";
import "./refactors/renameSymbol";
import "./refactors/extractFunction/index";
import "./refactors/extractConstant";
import "./refactors/llmRefactor";
import "./refactors/consolidateConditional";
// Generated (LLM-based) refactors
import "./refactors/extractConstant/index.generated";
import "./refactors/convertIfToCase/index.generated";
// LLM generator commands
import { registerAIRefactorRunner } from "./llmRefactorRunner";
import { registerLLMRefactorGenerator } from "./llmRefactorGenerator";



// This method is called when your extension is activated.
// VS Code activates the extension either on startup or when one of its activation events (defined in package.json) occurs.
export function activate(context: vscode.ExtensionContext) {

	// Diagnostic output to the VS Code debug console
	console.log('Congratulations, your extension "custom-refactor-extension" is now active!');

	// Store the absolute path to this extension globally.
	// This is useful for modules that need to locate assets or run external scripts (like Python refactoring tools).
	(global as any).extensionPath = context.extensionPath;

	console.log("Extension path:", context.extensionPath);

	// The provider responsible for analyzing the current document and offering refactorings.
	const provider = new CustomRefactorProvider();

	// Register the Code Actions provider. 
	// This makes our refactorings appear in the lightbulb menu and the "Refactor..." context menu.
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			["javascript", "typescript", "python", "shellscript"], // List of languages where this extension is active
			provider,
			{
				// Tell VS Code that this provider specifically handles refactoring actions.
				providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
			}
		)
	);

	// Register specialized commands for LLM-powered refactorings.
	// These usually involve complex logic or interaction with external AI services.
    registerAIRefactorRunner(context);
    registerLLMRefactorGenerator(context);

	// Register the central command that executes the chosen refactoring.
	// When a user clicks a refactor in the UI, this command is triggered with the refactor's ID.
	const executeCommand = vscode.commands.registerCommand(
		"custom-refactor-extension.executeRefactor",
		(refactorId: string) => {

			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				// No active editor means nowhere to apply a refactor.
				return;
			}

			// Capture the current editor state to pass as context to the refactor engine.
			// This ensures the refactor implementation has all the data it needs.
			const context = {
				document: editor.document,
				selection: editor.selection,
				language: editor.document.languageId,
				code: editor.document.getText()
			};

			console.log("Executing refactor:", refactorId);
			console.log("Language:", context.language);

			// Dispatch the execution to the refactor engine which handles the actual code transformation.
			runRefactor(refactorId, context);
		}
	);

	// Ensure the command is cleaned up when the extension is deactivated.
	context.subscriptions.push(executeCommand);
}

// Clean up resources when the extension is disabled or VS Code closes.
export function deactivate() { }


/**
 * The CodeActionProvider is responsible for suggesting refactorings in the UI.
 * It is called by VS Code whenever the user selects code, moves the cursor, or requests refactorings.
 */
class CustomRefactorProvider implements vscode.CodeActionProvider {

	/**
	 * Analyzes the current selection and returns a list of applicable refactorings.
	 * 
	 * Logic flow:
	 * 1. Verify if refactoring is allowed in the current context.
	 * 2. Identify the language of the file.
	 * 3. Search for "code smell" comments (e.g., // Long Method) that might trigger specific refactors.
	 * 4. Filter the global refactor catalog based on language and detected smells.
	 * 5. Convert matching refactors into VS Code CodeAction objects.
	 */
	provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
): vscode.CodeAction[] {

    // 1. Filter: Only show our refactors if specifically requested via 'Refactor...' menu 
    // or if no specific kind is requested (e.g., clicking the lightbulb menu).
    if (context.only && !context.only.contains(vscode.CodeActionKind.Refactor)) {
        return [];
    }

    const language = document.languageId;
    
    // --- CODE SMELL DETECTION ---
    // We look for comments that indicate a specific issue (e.g., "// Long Method").
    // If such a comment is found, we prioritize refactors that fix that specific smell.
    let detectedCodeSmell: string | undefined;
    const linesToSearch: string[] = [];

    // Check the line immediately above the selection.
    if (range.start.line > 0) {
        linesToSearch.push(document.lineAt(range.start.line - 1).text);
    }

    // Check all lines within the selection.
    for (let i = range.start.line; i <= range.end.line; i++) {
        linesToSearch.push(document.lineAt(i).text);
    }

    // Iterate through lines to find a match with any known code smell defined in the catalog.
    for (const text of linesToSearch) {
        for (const smell of Object.keys(CODE_SMELL_MAPPING)) {
            // Regex to match comments in various languages: // Smell, # Smell, /* Smell */
            const regex = new RegExp(`(//|#|/\\*).*${smell}`, 'i');
            if (regex.test(text)) {
                detectedCodeSmell = smell;
                break;
            }
        }
        if (detectedCodeSmell) {
            break;
        }
    }

    // --- REFACTOR FILTERING ---
    // Start with all refactors that support the current file's language.
    let availableRefactors = REFACTOR_LIST.filter(r =>
        r.supportedLanguages.includes(language as any)
    );

    if (detectedCodeSmell) {
        // If a code smell was detected, only show refactors mapped to that specific smell.
        const suitableIds = CODE_SMELL_MAPPING[detectedCodeSmell];
        availableRefactors = availableRefactors.filter(r => suitableIds.includes(r.id));
    } else {
        // If NO code smell is present, we only show refactors when the user has selected some text.
        // This prevents the menu from being cluttered with refactor suggestions when just clicking around.
        if (range.isEmpty) {
            return [];
        }
    }

    // --- MAPPING TO VS CODE UI ---
    // Transform our internal refactor definitions into objects that VS Code can display.
    return availableRefactors.map(refactor => {

        // Create a display label (e.g., "MBT (typescript): Extract Variable")
        const action = new vscode.CodeAction(
            `MBT (${language}${detectedCodeSmell ? ': ' + detectedCodeSmell : ''}): ${refactor.name}`,
            refactor.kind
        );

        // Link the menu item to our execution command and pass the unique refactor ID.
        action.command = {
            command: "custom-refactor-extension.executeRefactor",
            title: refactor.name,
            arguments: [refactor.id]
        };

        return action;
    });
}
}