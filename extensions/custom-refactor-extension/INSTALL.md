# Installation and Development

## Option 1: Install the Extension

The recommended way to use the extension is to install the packaged VSIX file.

1. Download the latest `custom-refactor-extension-0.0.1.vsix` file from the project repository release page.
2. Open Visual Studio Code.
3. Open the Extensions view (`Ctrl+Shift+X`).
4. Open the `...` menu in the top-right corner.
5. Select **Install from VSIX...**.
6. Choose the downloaded `.vsix` file.

The extension will be installed and available immediately through the standard VS Code refactoring menu.

---

## Option 2: Run from Source Code

This option is intended for development and experimentation.

Clone the repository:

```bash
git clone https://github.com/Bolest-oci/mutation-testing.git
```

Navigate to the extension directory:

```bash
cd mutation-testing/extensions/custom-refactor-extension
```

Install dependencies:

```bash
npm install
```

Compile the extension:

```bash
npm run compile
```

Open the project in Visual Studio Code:

```bash
code .
```

Launch an Extension Development Host instance by pressing:

```text
F5
```

A new VS Code window will open with the extension loaded directly from the source code.
