// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


const REFACTOR_CATALOG = [
	{
		id: "extractFunction",
		title: "Extract Function",
		kind: vscode.CodeActionKind.RefactorExtract,
		languages: ["javascript", "typescript", "python"]
	},
	{
		id: "inlineVariable",
		title: "Inline Variable",
		kind: vscode.CodeActionKind.RefactorInline,
		languages: ["javascript", "typescript", "python"]
	},
	{
		id: "renameVariable",
		title: "Rename Variable",
		kind: vscode.CodeActionKind.RefactorRewrite,
		languages: ["javascript", "typescript", "python", "shellscript"]
	},
	{
		id: "moveFunction",
		title: "Move Function",
		kind: vscode.CodeActionKind.RefactorMove,
		languages: ["javascript", "typescript"]
	},
	{
		id: "extractVariable",
		title: "Extract Variable",
		kind: vscode.CodeActionKind.RefactorExtract,
		languages: ["javascript", "typescript", "python"]
	},
	{
		id: "removeDeadCode",
		title: "Remove Dead Code",
		kind: vscode.CodeActionKind.RefactorRewrite,
		languages: ["javascript", "typescript", "python", "shellscript"]
	},
	{
		id: "replaceMagicNumber",
		title: "Replace Magic Number",
		kind: vscode.CodeActionKind.RefactorRewrite,
		languages: ["javascript", "typescript", "python"]
	},
	{
		id: "introduceParameterObject",
		title: "Introduce Parameter Object",
		kind: vscode.CodeActionKind.RefactorRewrite,
		languages: ["javascript", "typescript"]
	},
	{
		id: "encapsulateVariable",
		title: "Encapsulate Variable",
		kind: vscode.CodeActionKind.RefactorRewrite,
		languages: ["javascript", "typescript"]
	},
	{
		id: "replaceConditionalWithPolymorphism",
		title: "Replace Conditional with Polymorphism",
		kind: vscode.CodeActionKind.RefactorRewrite,
		languages: ["javascript", "typescript"]
	},

	{
		id: "extractScript",
		title: "Extract Script Section",
		kind: vscode.CodeActionKind.RefactorExtract,
		languages: ["shellscript"]
	},
	{
		id: "inlineEnvVar",
		title: "Inline Environment Variable",
		kind: vscode.CodeActionKind.RefactorInline,
		languages: ["shellscript"]
	}
];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "custom-refactor-extension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	const provider = new CustomRefactorProvider();

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			["javascript", "typescript", "python", "shellscript"],
			provider,
			{
				providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
			}
		)
	);
	const executeCommand = vscode.commands.registerCommand(
		"custom-refactor-extension.executeRefactor",
		(refactorId: string) => {
			switch (refactorId) {
				case "extractFunction":
					vscode.window.showInformationMessage("Executing: Extract Function (Placeholder)");
					// Actual implementation for Extract Function would go here
					break;
				case "inlineVariable":
					vscode.window.showInformationMessage("Executing: Inline Variable (Placeholder)");
					// Actual implementation for Inline Variable would go here
					break;
				case "renameVariable":
					vscode.window.showInformationMessage("Executing: Rename Variable (Placeholder)");
					// Actual implementation for Rename Variable would go here
					break;
				case "moveFunction":
					vscode.window.showInformationMessage("Executing: Move Function (Placeholder)");
					// Actual implementation for Move Function would go here
					break;
				case "extractVariable":
					vscode.window.showInformationMessage("Executing: Extract Variable (Placeholder)");
					// Actual implementation for Extract Variable would go here
					break;
				case "removeDeadCode":
					vscode.window.showInformationMessage("Executing: Remove Dead Code (Placeholder)");
					// Actual implementation for Remove Dead Code would go here
					break;
				case "replaceMagicNumber":
					vscode.window.showInformationMessage("Executing: Replace Magic Number (Placeholder)");
					// Actual implementation for Replace Magic Number would go here
					break;
				case "introduceParameterObject":
					vscode.window.showInformationMessage("Executing: Introduce Parameter Object (Placeholder)");
					// Actual implementation for Introduce Parameter Object would go here
					break;
				case "encapsulateVariable":
					vscode.window.showInformationMessage("Executing: Encapsulate Variable (Placeholder)");
					// Actual implementation for Encapsulate Variable would go here
					break;
				case "replaceConditionalWithPolymorphism":
					vscode.window.showInformationMessage("Executing: Replace Conditional with Polymorphism (Placeholder)");
					// Actual implementation for Replace Conditional with Polymorphism would go here
					break;
				case "extractScript":
					vscode.window.showInformationMessage("Executing: Extract Script Section (Placeholder)");
					// Actual implementation for Extract Script Section would go here
					break;
				case "inlineEnvVar":
					vscode.window.showInformationMessage("Executing: Inline Environment Variable (Placeholder)");
					// Actual implementation for Inline Environment Variable would go here
					break;
				default:
					vscode.window.showInformationMessage(`Unknown refactoring: ${refactorId}`);
					break;
			}
		}
	);

	context.subscriptions.push(executeCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }


class CustomRefactorProvider implements vscode.CodeActionProvider {

	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext
	): vscode.CodeAction[] {

		if (range.isEmpty) {
			return [];
		}

		console.log("Custom provider called");
		console.log("Language:", document.languageId);

		const currentLanguage = document.languageId;

		return REFACTOR_CATALOG
			.filter(r => r.languages.includes(currentLanguage))
			.map(r => {
				const action = new vscode.CodeAction(
					`Custom: ${r.title}`,
					r.kind
				);

				action.command = {
					command: "custom-refactor-extension.executeRefactor",
					title: r.title,
					arguments: [r.id]
				};

				return action;
			});
	}
}