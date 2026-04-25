import Parser from "tree-sitter";
import Bash from "tree-sitter-bash";

// Initialize Tree-sitter parser for Bash
const parser = new Parser();
parser.setLanguage(Bash as unknown as Parser.Language);

/**
 * Result of querying AST at a given position
 */
export interface NodeInfo {
  node: Parser.SyntaxNode | null
  start: number | null
  end: number | null
  text: string | null
}

/**
 * Returns the smallest AST node at given offset (cursor position)
 */
export function treesitter_getNodeAt(code: string, offset: number): NodeInfo {
  const tree = parser.parse(code);
  const node = tree.rootNode.descendantForIndex(offset);

  if (!node) {
    return { node: null, start: null, end: null, text: null };
  }

  return {
    node,
    start: node.startIndex,
    end: node.endIndex,
    text: node.text
  };
}

/**
 * Walks up the AST to find first parent of given type (e.g. "number", "string")
 */
export function treesitter_findParent(
  node: Parser.SyntaxNode | null,
  type: string
) {
  let cur = node;

  while (cur && cur.type !== type) {
    cur = cur.parent!;
  }

  return cur;
}

/**
 * Returns range + text of a node (used for edits)
 */
export function treesitter_rangeOf(node: Parser.SyntaxNode) {
  return {
    start: node.startIndex,
    end: node.endIndex,
    text: node.text
  };
}