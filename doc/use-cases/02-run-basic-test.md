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

3. **Create a Minimal Cosmic Ray Configuration:**
   - To ensure the setup is working correctly, the agent first creates a minimal configuration
     that targets a single, small module.
   - Agent lists the files in the project's source directory to identify a suitable small file
     (e.g., `ls -1 src/my_project`).

   - The agent creates a Cosmic Ray configuration file using one of the following approaches:

     **a, Interactive configuration (if supported):**
     - The agent runs:
       ```bash
       cosmic-ray new-config cosmic-ray.toml
       ```
     - During the interactive setup, the agent selects the execution variant defined in one of:
       - **Use Case 02.a – Run Basic Test Local**
       - **Use Case 02.b – Run Basic Test Http**

     **b, Manual configuration (if interactive prompting is not supported by the agent):**
     - The agent creates a `cosmic-ray.toml` file manually.
     - The content of the configuration file corresponds to the selected execution variant:
       - **Use Case 02.a – Run Basic Test Local**
       - **Use Case 02.b – Run Basic Test Http**
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
    - Agent initializes the session, creating a session file and overwriting any existing session.
      ```bash
      cosmic-ray init --force cosmic-ray.toml session.sqlite
      ```
    - Agent executes the mutation tests using the config and session files:
      ```bash
      cosmic-ray exec cosmic-ray.toml session.sqlite
      ```

6.  **Report the Results:**
    - Agent presents the results from the Cosmic Ray run to the user.
      ```bash
      cr-report session.sqlite
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