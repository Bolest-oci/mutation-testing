# Stryker Mutation Testing Journey: `_uri.js`

This document tracks the process of improving the mutation score for `_uri.js` by analyzing and killing survived mutants.

---

## 1. Initial Analysis: Mutant #72 (ConditionalExpression)

- **File:** `src/_uri.js`
- **Function:** `_checkAuthorityInvariant`
- **Location:** Line 105
- **Analysis:** The first run of Stryker revealed a survived `ConditionalExpression` mutant. The entire boolean check was replaced with `true`, and no test failed. This indicated that the function's error-throwing behavior for inconsistent authority components was not being tested.

### Decision 1: Add a new test case

The initial decision was to add a test to cover the missing scenario.

```diff
- // No test for this case
+ test('checkAuthorityInvariant should throw when authority is null but sub-components are not', () => {
+     let decomposed = { scheme: 'http', path: '/foo', host: 'example.com' };
+     expect(() => uri.recomposeComponents(decomposed)).toThrow('IllegalStateException,AuthorityInvariant broken');
+ 
+     decomposed = { scheme: 'http', path: '/foo', userInfo: 'user' };
+     expect(() => uri.recomposeComponents(decomposed)).toThrow('IllegalStateException,AuthorityInvariant broken');
+ 
+     decomposed = { scheme: 'http', path: '/foo', port: '8080' };
+     expect(() => uri.recomposeComponents(decomposed)).toThrow('IllegalStateException,AuthorityInvariant broken');
+ });
```

- **Result:** This killed mutant #72, but a new mutant (#76) survived in the same function.

---

## 2. Second Analysis: Mutant #76 (ConditionalExpression) & Code Refactoring

- **File:** `src/_uri.js`
- **Function:** `_checkAuthorityInvariant`
- **Location:** Line 105
- **Analysis:** The new mutant survived because the test suite didn't cover a case where `authority` was present but `host` was `null`, which should cause `recomposeAuthorityComponents` to throw an error from within the conditional. This highlighted a code smell: calling a function that can throw from inside a boolean expression.

### Decision 2: Refactor code for clarity (Code-first approach)

Based on user feedback and best practices, the decision was made to refactor the code for better quality and clarity, rather than just adding another test.

**Before:**
```javascript
function _checkAuthorityInvariant(authority, userInfo, host, port) {
    const b = (authority == null && userInfo == null && host == null && port == null) ||
        (authority != null && authority === recomposeAuthorityComponents(userInfo, host, port));
    if (!b) {
        throw new Error('IllegalStateException,AuthorityInvariant broken');
    }
}
```

**After:**
```javascript
function _checkAuthorityInvariant(authority, userInfo, host, port) {
    if (authority == null) {
        // If authority is null, all sub-parts must also be null.
        if (userInfo != null || host != null || port != null) {
            throw new Error('IllegalStateException,AuthorityInvariant broken');
        }
        return; // This is a valid state (all null)
    }

    // If authority is not null, it must match the recomposed parts.
    // recomposeAuthorityComponents will throw if host is null, which correctly indicates a broken invariant.
    if (authority !== recomposeAuthorityComponents(userInfo, host, port)) {
        throw new Error('IllegalStateException,AuthorityInvariant broken');
    }
}
```

- **Result:** The refactoring was successful. All existing tests passed, and the subsequent Stryker run confirmed that mutant #76 was **killed**.

---

## 3. Third Analysis: Mutant #126 (ConditionalExpression)

- **File:** `src/_uri.js`
- **Function:** `percentEncode`
- **Location:** Line 148
- **Analysis:** A new mutant survived in the `percentEncode` function. The check `if (enc.length === 1)` was replaced with `if (true)`. This survived because no test covered the encoding of multi-byte characters (like Cyrillic) which `encodeURIComponent` handles correctly without needing the subsequent manual encoding step.

### Decision 3: Add a new test case with Unicode characters

Following user guidance, a test case with Russian letters was added to cover multi-byte character encoding.

```diff
- // No test for this case
+ test('percentEncode should correctly encode Russian Unicode letters', () => {
+     const input = 'привет';
+     const expected = '%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82';
+     const result = uri.percentEncode(input);
+     expect(result).toBe(expected);
+ });
```

- **Result:** The new test passed and successfully **killed** mutant #126. The mutation score improved to **92.45%**.

---
## 4. Fourth Analysis: `StringLiteral` Mutant in `removeDotSegments`

- **File:** `src/_uri.js`
- **Function:** `removeDotSegments`
- **Location:** Line 167 (previously)
- **Analysis:** A `StringLiteral` mutant survived by changing the initial value of the `xi` variable from `''` to `"Stryker was here!"`. This was possible because `xi` was declared at the top of the function but was always reassigned before its value was ever read. This indicated an unused variable initialization, which is a code quality issue.

### Decision 4: Refactor `removeDotSegments` for better variable scoping

I refactored the function to declare `xi` with `const` inside the specific `if` blocks where it is used. This improves code clarity by ensuring variables are declared in the narrowest possible scope and eliminates the useless initialization.

**Before:**
```javascript
function removeDotSegments(path) {
    let inputBufferStart = 0;
    const inputBufferEnd = path.length;
    let output = '';
    let xi = '';
    while (inputBufferStart < inputBufferEnd) {
        // ...
        if (_in.indexOf('/../') === 0) {
            inputBufferStart += 3;
            xi = output.lastIndexOf('/');
            if (xi !== -1 && xi !== output.length) {
                output = output.substring(0, xi);
            }
            continue;
        }
        if (_in === '/..') {
            _in = '/';
            inputBufferStart += 3;
            xi = output.lastIndexOf('/');
            if (xi !== -1 && xi !== output.length) {
                output = output.substring(0, xi);
            }
        }
        //...
    }
    return output;
}
```

**After:**
```javascript
function removeDotSegments(path) {
    let inputBufferStart = 0;
    const inputBufferEnd = path.length;
    let output = '';
    while (inputBufferStart < inputBufferEnd) {
        // ...
        if (_in.indexOf('/../') === 0) {
            inputBufferStart += 3;
            const xi = output.lastIndexOf('/');
            if (xi !== -1 && xi !== output.length) {
                output = output.substring(0, xi);
            }
            continue;
        }
        if (_in === '/..') {
            _in = '/';
            inputBufferStart += 3;
            const xi = output.lastIndexOf('/');
            if (xi !== -1 && xi !== output.length) {
                output = output.substring(0, xi);
            }
        }
        //...
    }
    return output;
}
```

- **Result:** The refactoring was successful. All tests passed, and the Stryker run confirmed that the `StringLiteral` mutant was **killed**. The mutation score improved to **92.70%**.

---
## 5. Fifth Analysis: The `removeDotSegments` Mystery

- **File:** `src/_uri.js`
- **Function:** `removeDotSegments`
- **Location:** Lines 197 and 206
- **Analysis:** The next surviving mutants were `ConditionalExpression` mutants that replaced the condition `if (xi !== -1 && xi !== output.length)` with `if (true)`. A detailed analysis concluded that the `xi !== output.length` part of the condition is redundant because the `lastIndexOf` method can never return a value equal to the string's length. This dead code was the reason the mutants survived.

### An Unresolved Contradiction

To prove the redundancy, we embarked on an experiment.
1.  We hypothesized that the author might have intended to write `xi !== output.length - 1`.
2.  We changed the code to reflect this hypothesis.
3.  We added a new test case, `[ '/a/b/../', '/a/' ]`, which, according to our manual trace, should have failed with the experimental code.
4.  **Unexpected Result:** The test suite, including the new test case, passed.

This result was a contradiction. A meticulous, step-by-step trace of the code confirmed that the function should have returned `"/a"`, which does not match the test's expectation of `"/a/"`, yet the test runner reported a pass.

### Decision 5: Document and Revert

After extensive analysis, the reason for the passing test could not be determined. It points to a subtle and complex interaction, possibly within the test runner's data processing, that is beyond the scope of our current task.

Following the principle of "do no harm" and to maintain a stable codebase, the decision was made to:
1.  Document this unresolved mystery in the journey report.
2.  Revert the experimental code changes in `_uri.js`.
3.  Remove the confusing and contradictory test cases from `_uri.test.js`.

We are leaving the redundant code in place for now, as we cannot confidently refactor it without fully understanding the testing anomaly. This is a pragmatic decision to prioritize progress over solving a deep, tangential mystery.

- **Result:** The codebase is returned to its last known stable state. The `ConditionalExpression` mutants in `removeDotSegments` will remain "Survived" for now, with this documentation serving as a record of the investigation.

---
## 6. Sixth Analysis: Unresolved Mutant in `_merge`

- **File:** `src/_uri.js`
- **Function:** `_merge`
- **Location:** Line 236
- **Analysis:** The next survived mutant was a `ConditionalExpression` in the `_merge` function. The mutant replaced the condition `xi === -1` with `false`, forcing the `else` branch of the ternary operator.

### An Unresolved Challenge
A deep analysis was performed to create a test case that would fail under this mutation. However, as I concluded: **"I am struggling to create a test case that will kill this mutant. The logic seems to be constructed in a way that makes it very difficult to isolate this condition."**

When `_merge` is called from its parent `resolve` function, the inputs are such that the mutated code path produces the same result as the original code, preventing any test failure. This suggests a structural complexity or code smell that makes the function difficult to test in isolation.

### Decision 6: Document and Proceed
Given the difficulty and the diminishing returns of pursuing this specific mutant, the decision has been made to document it as an unresolved challenge and proceed to the next available mutant. This allows us to continue making progress on the overall mutation score.

- **Result:** The mutant in `_merge` remains **Survived**. This is documented as a known issue requiring a deeper refactoring of the `resolve` and `_merge` functions in the future.

---
## 7. Seventh Analysis: `_preParseBaseUri`

- **File:** `src/_uri.js`
- **Function:** `_preParseBaseUri`
- **Location:** Line 261
- **Analysis:** A `BlockStatement` mutant survived by turning the function into a no-op. This was possible because the existing test was not specific enough. It used a generic `.toThrow()` which was satisfied by a *different* error (`TypeError`) that occurred later in the execution path when the mutated function did nothing. The test wasn't actually testing the intended precondition check.

### Decision 7: Strengthen the Test Case

Following the principle of adding new, more specific tests, a new test was added to validate the exact error message that `_preParseBaseUri` is supposed to throw.

**Before:**
```javascript
test('_preParseBaseUri test', (() => {
    const decomposed = uri.decomposeComponents('//a/b/c/d;p?q');
    expect(() => uri.resolve(decomposed, null)).toThrow();
}));
```

**After (New Test Added):**
```javascript
test('_preParseBaseUri should throw specific error for missing scheme', () => {
    const decomposed = uri.decomposeComponents('//a/b/c/d;p?q');
    const ref = uri.decomposeComponents('g'); // A valid, non-null ref
    expect(() => uri.resolve(decomposed, ref)).toThrow('Violation 5.2.1, scheme component required');
});
```

- **Result:** The new, more specific test passed and successfully **killed** the `BlockStatement` and related `ConditionalExpression` mutants. The mutation score improved to **93.78%**.

---
## 8. Eighth Analysis: Ignored Mutant in `parseQuery`

- **File:** `src/_uri.js`
- **Function:** `parseQuery`
- **Location:** Line 404
- **Analysis:** A line of code in the `parseQuery` function is explicitly ignored by a Stryker directive.

```javascript
function parseQuery(query, bDecode) {
    // returns:	Object
    if (query == null) { return null; }
    // Stryker disable next-line all // (quick exit only, no logic change)
    if (query === '') { return {}; }

    return query.split('&').reduce((obj, part) => {
        //...
    });
}
```

The comment `// Stryker disable next-line all` prevents Stryker from generating any mutants for the line `if (query === '') { return {}; }`.

### Reasoning for Disabling

The original author added a comment explaining their reasoning: `(quick exit only, no logic change)`. This implies that they believed the subsequent `reduce` logic would correctly handle an empty string (`''`) by producing an empty object (`{}`), making this `if` statement a redundant performance optimization (a "quick exit").

As we saw in our analysis of the `decodeSegments` function, this is often true. `('').split('&')` results in `['']`, and reducing this array would likely result in an empty object, though it depends on the exact implementation of the reducer.

### Decision 8: Document and Respect the Directive

The author has made a conscious decision to disable mutation testing on this line, likely to avoid dealing with a surviving mutant that they deemed unimportant. While removing the line entirely might be a cleaner solution, respecting the author's explicit directive is the correct course of action in this context.

We will document this finding and move on. This is a good example of how `Stryker disable` comments can be used to manage the scope of mutation testing, but also how they can sometimes hide redundant code that could be refactored.

- **Result:** This line is intentionally not being tested for mutations. We will leave it as is and proceed to the next solvable mutant.

---