# Use Case: 02 - Run Basic Mutation Test

## Description
This use case describes how to run a basic mutation test using Cosmic Ray on a project that has been set up according to "Use Case 01 - Project Setup".

## Actor
RooCode Agent

## Preconditions
- The project has been set up as a submodule in `repos/<project_name>`.
- The current branch in the submodule is `mutation-testing`.
- The project has a test suite that can be run.

## Flow
1.  **Navigate to Submodule and Install Cosmic Ray:**
    - Agent navigates into the submodule directory:
      ```bash
      cd repos/<project_name>
      ```
    - Agent follows the steps outlined in **Use Case 02.1 - Install Cosmic Ray** to install the framework.

2.  **Verify Project Test Suite:**
    - Before running mutations, the agent must confirm the project's own test suite is passing.
    - Agent runs the test command specified for the project (e.g., `pytest`, `python -m unittest discover`).
    - **Verification:** If any tests fail, the process stops and reports the failure to the user. Mutation testing cannot proceed with a broken test suite.

3.  **Create a Cosmic Ray Configuration:**
    - Agent creates a `cosmic-ray.toml` configuration file in the submodule's root directory.
    - The configuration will specify the module to be mutated, the test command, and other relevant options.
      ```toml
      [cosmic-ray]
      module-path = "src" # Or the appropriate source directory
      test-command = "pytest" # Or the command to run the tests
      timeout = 30
      excluded-modules = []

      [cosmic-ray.execution-engine]
      name = "local"
      ```

4.  **Commit Setup Changes:**
    - Agent stages all modified files, which include the dependency updates and the new Cosmic Ray configuration.
      ```bash
      git add .
      ```
    - Agent commits the changes:
      ```bash
      git commit -m "build: Add Cosmic Ray for mutation testing"
      ```

5.  **Run the Mutation Test:**
    - Agent runs Cosmic Ray:
      ```bash
      cosmic-ray run cosmic-ray.toml
      ```

6.  **Report the Results:**
    - Agent presents the results from the Cosmic Ray run to the user. This might involve parsing the output or pointing the user to the generated report.
      ```bash
      cosmic-ray report
      ```

7.  **Deactivate Environment and Return:**
    - If a virtual environment was activated during the installation process, the agent deactivates it.
      ```bash
      deactivate
      ```
    - Agent returns to the workspace root directory:
      ```bash
      cd ../..
      ```

## Postconditions
- Cosmic Ray is installed in a virtual environment within the submodule.
- A `cosmic-ray.toml` configuration file is created.
- A mutation test has been run.
- The results of the mutation test are available.

## Source
This use case was generated based on the user stories in `doc/user-stories`, specifically:
- `doc/user-stories/00-system.md`: #0.0
- `doc/user-stories/01-project-setup.md`: #1.1, #1.3

---
*Generated/modified by AI RooCode 3.36.2, used model google/gemini-2.5-pro*