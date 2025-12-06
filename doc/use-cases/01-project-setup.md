# Use Case: 01 - Project Setup

## Description
This use case describes how to set up a new Python project for mutation testing. It involves cloning the project's repository as a submodule into the `repos/` directory and creating a dedicated branch for mutation testing activities.

## Actor
RooCode Agent

## Preconditions
- The user has provided the URL of the git repository to be tested.
- The user can optionally provide a name for the project. If not provided, it will be inferred from the repository URL.

## Flow
1.  **Get Repository URL and Project Name:**
    - Agent asks the user for the git repository URL.
    - Agent asks for an optional local name for the project. If not provided, the name will be inferred from the repository URL (e.g., `my-project` from `https://github.com/user/my-project.git`).

2.  **Clone Repository as Submodule:**
    - Agent executes the following command:
      ```bash
      git submodule add <repository_url> repos/<project_name>
      ```
    - **Verification:** Agent checks if the directory `repos/<project_name>` exists and is not empty. If not, the process fails.

3.  **Create a Dedicated Branch:**
    - Agent navigates into the new submodule directory:
      ```bash
      cd repos/<project_name>
      ```
    - Agent creates a new branch for mutation testing:
      ```bash
      git checkout -b mutation-testing
      ```
    - **Verification:** Agent runs `git branch --show-current` and confirms the output is `mutation-testing`. If not, the process fails.
    - Agent returns to the workspace root directory:
      ```bash
      cd ../..
      ```

4.  **Commit the New Submodule:**
    - Agent stages the `.gitmodules` file and the new submodule directory.
      ```bash
      git add .gitmodules repos/<project_name>
      ```
    - Agent commits the changes:
      ```bash
      git commit -m "feat: Add <project_name> as a submodule for mutation testing"
      ```

## Postconditions
- The specified git repository is cloned as a submodule in `repos/<project_name>`.
- A new branch named `mutation-testing` is created and checked out within the submodule.
- The new submodule is committed to the main project's repository.

## Source
This use case was generated based on the user stories in `doc/user-stories`, specifically:
- `doc/user-stories/01-project-setup.md`: #1.0, #1.2

---
*Generated/modified by AI RooCode 3.36.2, used model google/gemini-2.5-pro*