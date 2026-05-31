import { registerRefactor, RefactorContext, BaseRefactor } from "../../refactorEngine";
import { extractConstantLsp } from "./lsp";
import { extractConstantNumberShell } from "./shellNumber";
import { extractConstantStringShell } from "./shellString";
import { treesitter_getNodeAt, treesitter_findParent } from "../../analyzers/shell/treeSitter";

const REFACTOR_ID = "extractConstant";

export class ExtractConstantRefactor extends BaseRefactor {
  readonly id = REFACTOR_ID;

  async isApplicable(context: RefactorContext): Promise<boolean> {
    const lang = context.language;

    if (lang === "shellscript") {
      const { document, selection, code } = context;
      const offset = document.offsetAt(selection.start);
      const info = treesitter_getNodeAt(code, offset);

      return !!(treesitter_findParent(info.node, "number") || treesitter_findParent(info.node, "string"));
    }

    return lang === "javascript" || lang === "typescript";
  }

  async run(context: RefactorContext): Promise<void> {
    const lang = context.language;

    if (lang === "shellscript") {
      const { document, selection, code } = context;
      const offset = document.offsetAt(selection.start);
      const info = treesitter_getNodeAt(code, offset);

      if (treesitter_findParent(info.node, "number")) {
        return extractConstantNumberShell(context);
      }

      if (treesitter_findParent(info.node, "string")) {
        return extractConstantStringShell(context);
      }
    }

    if (lang === "javascript" || lang === "typescript") {
      return extractConstantLsp(context);
    }
  }
}

registerRefactor(REFACTOR_ID, new ExtractConstantRefactor());