<!-- Generated/modified by AI RooCode, used model gemini-2.5-pro -->
# Use Case: 02.1 - Automated custom mutator integration and execution

## Description
This use case automates the process of setting up a virtual environment, installing dependencies, integrating a custom mutator, running mutation testing with Cosmic Ray, and generating an HTML report. The commands are optimized to be run in a single, chained sequence for efficiency.

## Actor
RooCode Agent

## Preconditions
- Python 3.x is installed and available in the system's PATH.
- The custom mutator source code is available.
- A Cosmic Ray configuration file exists (e.g., `cosmic-ray.toml`).

## Flow
> **Note on Command Chaining:** The following steps are designed to be executed in a single terminal session. Chaining commands with `&&` (for Windows, macOS, and Linux) ensures that the subsequent command only runs if the previous one succeeds. This is crucial for maintaining the active virtual environment across steps.

1.  **Create, Activate, and Install Dependencies in One Step:**
    - This single command chain creates the virtual environment, activates it, installs Cosmic Ray, and installs the custom mutator in editable mode.
    - **On Windows (Command Prompt):**
    - ```bash
      python -m venv .venv && .\.venv\Scripts\activate && pip install cosmic-ray && pip install -e <path\to\your\custom-mutator>
      ```
    - **On Windows (bash) and similar environments:**
    - ```bash
      python -m venv .venv && source .venv/Scripts/activate && pip install cosmic-ray && pip install -e <path/to/your/custom-mutator>
      ```
    - **On macOS and Linux:**
    - ```bash
      python -m venv .venv && source .venv/bin/activate && pip install cosmic-ray && pip install -e <path/to/your/custom-mutator>
      ```
    - **Verification:** 
        - The shell prompt will indicate the virtual environment is active.
        - `pip list` should show `cosmic-ray` and your custom mutator in the list of installed packages.

2.  **Configure Cosmic Ray to Use a Custom Mutator:**
    - Open your Cosmic Ray configuration file.
    - Add or modify the `[cosmic-ray.filters.operators-filter]` section. To use *only* your custom mutator, use a negative lookahead regex in `exclude-operators`.
    - ```toml
      [cosmic-ray.filters.operators-filter]
      exclude-operators = [
        "^(?!<module_name>/<operator_key>).*$",
      ]
      ```
    - Replace `<module_name>` and `<operator_key>` with the correct values for your mutator. See the "Finding Module Name and Operator Key" section in Troubleshooting for details.

3.  **Run Mutation Testing and Generate Report:**
    - This single command chain initializes a new Cosmic Ray session (overwriting any old one), applies the operator filter, executes the tests, and generates an HTML report.
    - **On Windows (Command Prompt):**
    - ```bash
      .\.venv\Scripts\activate && cosmic-ray init <path\to\your\config.toml> session.sqlite --force && cr-filter-operators session.sqlite <path\to\your\config.toml> && cosmic-ray exec <path\to\your\config.toml> session.sqlite && cr-html session.sqlite > <report-name>.html
      ```
    - **On Windows (bash), macOS, and Linux:**
    - ```bash
      source .venv/Scripts/activate && cosmic-ray init <path/to/your/config.toml> session.sqlite --force && cr-filter-operators session.sqlite <path/to/your/config.toml> && cosmic-ray exec <path/to/your/config.toml> session.sqlite && cr-html session.sqlite > <report-name>.html
      ```
    - **Verification:** An HTML report file with your specified name will be created in the root directory. Open it in a browser to see the mutation testing results.

4.  **Deactivate Virtual Environment:**
    - ```bash
      deactivate
      ```

## Postconditions
- A virtual environment with all necessary dependencies is created.
- The Cosmic Ray configuration file is configured for the custom mutator.
- Mutation testing has been executed, with results stored in `session.sqlite`.
- An HTML report is generated.
- The virtual environment is deactivated.

## Troubleshooting

### `pip install -e` fails with "is not a valid editable requirement"
-   **Problem:** The command `pip install -e <path>` fails, stating the path is not a valid requirement.
-   **Cause:** This often happens on Windows if the path contains forward slashes (`/`) instead of backslashes (`\`), or if the path itself is incorrect. It can also occur if a directory name in the path starts with a special character (e.g., `_spikes`).
-   **Solution:**
    1.  **Verify the path:** Ensure the path to the mutator's `setup.py` file is correct.
    2.  **Use correct slashes:** On Windows, use backslashes (`\`).
    3.  **Use relative paths:** For paths in the current workspace, start with `.\` on Windows (e.g., `pip install -e .\your\path`).

### Cosmic Ray Configuration Not Found
-   **Problem:** The `cosmic-ray init` command fails because it cannot find the configuration file.
-   **Solution:** Ensure you are providing the correct path to your configuration file.

### Finding Module Name and Operator Key
-   **Problem:** You need to find the correct module name and operator key for your custom mutator to configure Cosmic Ray.
-   **Solution:**
    1.  **Module Name:** The module name is typically the name of the directory containing your custom mutator's source code, and it's also specified in the `setup.py` file (e.g., in `name='tuple_shortener'`).
    2.  **Operator Key:** The operator key is defined in the `_operators` dictionary within your mutator's `provider.py` file. For example: `_operators = {"shorten-tuple": ShortenTuple}`. In this case, the operator key is `shorten-tuple`.
    3.  **Combine them in the configuration file:** `exclude-operators = ["^(?!tuple_shortener/shorten-tuple).*$"]`.

### `deactivate` or other commands not found
-   **Problem:** A command like `deactivate` or `cosmic-ray` is not recognized.
-   **Cause:** The virtual environment is not active in the current terminal session. This happens if you open a new terminal or if a previous command in a chain failed, preventing the `activate` command from running.
-   **Solution:**
    1.  **Use Chained Commands:** Run all related commands in a single chain using `&&` to ensure the environment remains active.
    2.  **Re-activate:** If you are in a new terminal, manually activate the environment again.

---
*Generated/modified by AI RooCode, used model google/gemini-2.5-pro*
