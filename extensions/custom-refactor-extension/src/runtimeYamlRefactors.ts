import {
    loadRuntimeRefactors,
    runRuntimeRefactorById
} from "./llmRefactorRunner";

import {
    registerRefactor
} from "./refactorEngine";

/**
 * Automatically registers all
 * runtime YAML refactors
 * into the refactor registry.
 */
export function registerRuntimeYamlRefactors():
    void {

    const runtimeRefactors =
        loadRuntimeRefactors();

    for (const runtimeRefactor of runtimeRefactors) {

        registerRefactor(

            runtimeRefactor.refactorId,

            async () => {

                await runRuntimeRefactorById(
                    runtimeRefactor.refactorId
                );
            }
        );
    }
}