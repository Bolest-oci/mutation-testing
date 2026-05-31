import * as vscode from "vscode";

/**
 * Refactoring catalog
 * Each refactor must be registered here to appear in the UI.
 * 
 * Source:
 * https://github.com/ainthek/cinderella/blob/master/docs/ADiT-2025/refactoring.xlsx
 */

export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "php"
  | "shellscript"

export interface RefactorDefinition {
  id: string
  name: string
  supportedLanguages: Language[]
  kind: vscode.CodeActionKind
  tags: string[]
}

export const REFACTOR_LIST: RefactorDefinition[] = [

  {
    id: "changeFunctionDeclaration", name: "Change Function Declaration",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["basic", "rename"]
  },

  {
    id: "changeReferenceToValue", name: "Change Reference to Value",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["organizing-data", "variables"]
  },

  {
    id: "changeValueToReference", name: "Change Value to Reference",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["organizing-data", "immutability", "variables"]
  },

  {
    id: "collapseHierarchy", name: "Collapse Hierarchy",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.Refactor,
    tags: ["inheritance"]
  },

  {
    id: "combineFunctionsIntoClass", name: "Combine Functions into Class",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.Refactor,
    tags: ["grouping-function"]
  },

  {
    id: "combineFunctionsIntoTransform", name: "Combine Functions into Transform",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.Refactor,
    tags: ["grouping-function", "split-phase"]
  },

  {
    id: "consolidateConditionalExpression", name: "Consolidate Conditional Expression",
    supportedLanguages: ["javascript", "typescript", "python", "php", "shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["conditional"]
  },

  {
    id: "decomposeConditional", name: "Decompose Conditional",
    supportedLanguages: ["javascript", "typescript", "python", "php", "shellscript"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["conditional"]
  },

  {
    id: "encapsulateCollection", name: "Encapsulate Collection",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["encapsulation"]
  },

  {
    id: "encapsulateRecord", name: "Encapsulate Record",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["encapsulation"]
  },

  {
    id: "encapsulateVariable", name: "Encapsulate Variable",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["encapsulation", "variables"]
  },

  {
    id: "extractClass", name: "Extract Class",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["extract"]
  },
  {
    id: "extractSuperclass", name: "Extract Superclass",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["inheritance", "extract"]
  },

  {
    id: "extractVariable",
    name: "Extract Variable",
    supportedLanguages: ["javascript", "typescript", "python"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["extract"]
  },

  {
    id: "extractVariableLsp", name: "Extract Variable (LSP)",
    supportedLanguages: ["javascript", "typescript", "python"],
    kind: vscode.CodeActionKind.RefactorExtract.append("variable.lsp"),
    tags: ["extract"]
  },

  {
    id: "extractFunction", name: "Extract Function",
    supportedLanguages: ["javascript", "typescript"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["extract"]
  },
  {
    id: "consolidateConditional",
    name: "Consolidate Conditional",
    supportedLanguages: ["shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["refactor"]
  },
  {
    id: "extractConstantStringShell",
    name: "Extract Constant (String) [LLM]",
    supportedLanguages: ["shellscript"],
    kind: vscode.CodeActionKind.RefactorExtract.append("constant"),
    tags: ["extract", "constant", "llm"]
  },

  {
    id: "inlineVariable", name: "Inline Variable",
    supportedLanguages: ["javascript", "typescript"],
    kind: vscode.CodeActionKind.RefactorInline.append("variable"),
    tags: ["inline"]
  },

  {
    id: "renameSymbol", name: "Rename Symbol",
    supportedLanguages: ["javascript", "typescript", "python"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["rename"]
  },

  {
    id: "hideDelegate", name: "Hide Delegate",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["delegation"]
  },

  {
    id: "inlineClass", name: "Inline Class",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorInline,
    tags: ["inline"]
  },

  {
    id: "inlineFunction", name: "Inline Function",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorInline,
    tags: ["inline"]
  },
  {
    id: "introduceAssertion", name: "Introduce Assertion",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["errors"]
  },

  {
    id: "introduceParameterObject", name: "Introduce Parameter Object",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["parameters"]
  },

  {
    id: "introduceSpecialCase", name: "Introduce Special Case",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["conditional"]
  },

  {
    id: "moveField", name: "Move Field",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["moving-features"]
  },

  {
    id: "moveFunction", name: "Move Function",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["moving-features"]
  },

  {
    id: "moveStatementsIntoFunction", name: "Move Statements into Function",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["moving-features"]
  },

  {
    id: "moveStatementsToCallers", name: "Move Statements to Callers",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["moving-features"]
  },

  {
    id: "parameterizeFunction", name: "Parameterize Function",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["api"]
  },

  {
    id: "preserveWholeObject", name: "Preserve Whole Object",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["parameters"]
  },

  {
    id: "removeDeadCode", name: "Remove Dead Code",
    supportedLanguages: ["javascript", "typescript", "python", "php", "shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["cleanup"]
  },

  {
    id: "renameField", name: "Rename Field",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["rename"]
  },

  {
    id: "renameVariable", name: "Rename Variable",
    supportedLanguages: ["javascript", "typescript", "python", "php", "shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["rename", "variables"]
  },

  {
    id: "replaceConditionalWithPolymorphism", name: "Replace Conditional with Polymorphism",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["conditional"]
  },

  {
    id: "replaceConstructorWithFactoryFunction", name: "Replace Constructor with Factory Function",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["creation"]
  },

  {
    id: "replaceLoopWithPipeline", name: "Replace Loop with Pipeline",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorExtract,
    tags: ["collections"]
  },

  {
    id: "extractConstant",
    name: "Extract Constant",
    supportedLanguages: ["javascript", "typescript", "shellscript"],
    kind: vscode.CodeActionKind.RefactorExtract.append("constant"),
    tags: ["extract", "constant"]
  },

  {
    id: "replaceNestedConditionalWithGuardClauses",
    name: "Replace Nested Conditional With Guard Clauses",
    supportedLanguages: ["shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["conditionals", "llm", "runtime"]
  },
  {
    id: "removeFlagArgument",
    name: "Remove Flag Argument",
    supportedLanguages: ["shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["functions", "llm", "runtime"]
  },

  {
    id: "replacePrimitiveWithObject", name: "Replace Primitive with Object",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["data"]
  },

  {
    id: "replaceTempWithQuery", name: "Replace Temp with Query",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["variables"]
  },

  {
    id: "splitLoop", name: "Split Loop",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["loop"]
  },

  {
    id: "splitPhase", name: "Split Phase",
    supportedLanguages: ["javascript", "typescript", "python", "php"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["phase"]
  },

  {
    id: "splitVariable",
    name: "Split Variable",
    supportedLanguages: ["shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["variables", "llm", "runtime"]
  },

  {
    id: "substituteAlgorithm", name: "Substitute Algorithm",
    supportedLanguages: ["javascript", "typescript", "python", "php", "shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["algorithm"]
  },
  {
    id: "convertIfToCase",
    name: "Convert if to case",
    supportedLanguages: ["shellscript"],
    kind: vscode.CodeActionKind.RefactorRewrite,
    tags: ["control-flow"]
  }

];

export const REFACTOR_MAP = Object.fromEntries(
  REFACTOR_LIST.map(r => [r.id, r])
);

/**
 * Mapping from code smell comments to suitable refactor IDs.
 */
export const CODE_SMELL_MAPPING: Record<string, string[]> = {
  "duplicatedcode": ["extractFunction", "consolidateConditional"],

  "longmethod": ["extractFunction", "replaceNestedConditionalWithGuardClauses"],

  "primitiveobsession": [
    "extractConstant",
    "extractConstantStringShell",
    "extractConstantStringShellLlm",
    "splitVariable",
  ],

  "switchstatements": ["convertIfToCase", "replaceNestedConditionalWithGuardClauses"],

  "longparameterlist": [
    "removeFlagArgument"
  ],
};