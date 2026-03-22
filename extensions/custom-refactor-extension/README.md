# Custom Refactor Extension

This VS Code extension provides a menu with a list of custom refactorings, currently offering placeholder implementations for various refactoring types across JavaScript, TypeScript, Python, and Shell Script file types.

## Features

*   **Refactoring Catalogue:** Offers a predefined list of refactorings, including:
    *   Extract Function
    *   Inline Variable
    *   Rename Variable
    *   Move Function
    *   Extract Variable
    *   Remove Dead Code
    *   Replace Magic Number
    *   Introduce Parameter Object
    *   Encapsulate Variable
    *   Replace Conditional with Polymorphism
    *   Extract Script Section (for Shell Script)
    *   Inline Environment Variable (for Shell Script)
*   **Multi-language Support:** Provides refactoring options tailored to JavaScript, TypeScript, Python, and Shell Script files.
*   **Code Actions Integration:** Integrates seamlessly with VS Code's Code Actions menu, accessible via a lightbulb icon or right-click context menu.
*   **Context-aware activation:** Refactorings are only shown when a code selection is present.

## Installation and Testing

To get started with the Custom Refactor Extension, follow these steps:

1.  **Clone the Repository:**

    ```bash
    git clone <repository-url>
    cd custom-refactor-extension
    ```

2.  **Install Dependencies:**

    Navigate to the extension's root directory and install the necessary Node.js dependencies.

    ```bash
    npm install
    ```

3.  **Compile the Extension:**

    Compile the TypeScript source code into JavaScript.

    ```bash
    npm run compile
    ```

4.  **Open in VS Code:**

    Open the extension project in Visual Studio Code.

    ```bash
    code .
    ```

5.  **Run the Extension in Development Host:**

    From within VS Code, press `F5`. This will open a new VS Code window (Extension Development Host) with your extension activated.

6.  **Test the Refactorings:**

    *   Open a JavaScript, TypeScript, Python, or Shell Script file in the Extension Development Host window.
    *   Select a piece of code (e.g., a variable, a function).
    *   Right-click on the selected code or click on the lightbulb icon that appears, and choose "Refactor..." or "Code Actions...".
    *   You should see a list of "Custom:" refactorings (e.g., "Custom: Extract Function").
    *   Select one of the custom refactorings. An information message will appear indicating the execution of the placeholder logic (e.g., "Executing: Extract Function (Placeholder)").

## Extension Settings

This extension does not contribute any specific VS Code settings at this time.

## Known Issues

*   Currently, all refactoring options provide placeholder functionality only. Actual refactoring logic needs to be implemented for each item in the `REFACTOR_CATALOG`.

## Release Notes

### 0.0.1

*   Initial release with a catalog of refactoring options and placeholder execution logic. Multi-language support for JavaScript, TypeScript, Python, and Shell Script. Initial setup for extension development and testing.
