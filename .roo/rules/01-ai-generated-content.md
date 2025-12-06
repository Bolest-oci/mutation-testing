# Rules for AI generated and modified content

## Rule: AI Generated or modified files 
Every file created or modified by roo code must mention this in comment. If file supports metadata this shall be included in file metadata as well (PDF, WORD, images etc...).  
Comment shall be dynamically generated as: "Generated/modified by AI RooCode {RooCode version}, used model {full-model-name}". If you cannot detect {RooCode version} from conversation and environment context, use `code --list-extensions --show-versions` or equivalent command for current tooling.

## Rule: Contributing to existing files
When adding content to existing files, always follow rule "Rule: AI Generated modified files".
Study style, format and sentiment of existing file, then add text matching already established document style.

