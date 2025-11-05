# Executing Mutation testing in `uri` project

## 1. Run normal test
``` 
cd _spikes/stryker-playground/uri;
npm test
```

## 2. Run Mutation test on specified file
```
cd _spikes/stryker-playground/uri;
npx stryker run --mutate src/_uri.js --reporters json,html,clear-text
```

### 3. Read Generated report
3.1 Use JSON format report stored in _spikes/stryker-playground/uri/reports/mutation/mutation.json.
3.2 Filter the report for first "status": "Survived" mutant. 
Use `jq`,  avoid sending  full file repeatedly to LLM.
3.3 display info about the mutation, analyse reasons. Display clickable links to code witn problematic line.
Focus on code first, try to find useless code, quick exits, and other reasons to fix code.
Only when code analyses show no obvious bugs and possible improvements, ONLY then suggest that test should be added.
When adding tests, prefer adding new, more specific tests rather than modifying existing ones. This preserves the original test's intent.
3.4 display open test file and code file in editor

### 4. ask user if he wants to change CODE or TEST
act based on the answer.
### 5. Document the Journey
After each significant change (code refactoring or new test), update the `_spikes/stryker-playground/stryker-journey.md` report with a summary of the mutant, the decision made, and the result. Include diffs for clarity.
29 | After each significant change (code refactoring or new test), update the `_spikes/stryker-playground/stryker-journey.md` report with a summary of the mutant, the decision made, and the result. Include diffs for clarity.
30 | Always update the "Current Status" chapter with the new mutation score and the list of remaining survived mutants.



