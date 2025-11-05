# Stryker Mutation Testing Journey: `_uri.js`

This document tracks the process of improving the mutation score for `_uri.js` by analyzing and killing survived mutants.

## Current Status

**Mutation Score:** 99.42%

**Survived Mutants (2):**

*   **`splitUriRegex` (2 mutants):** The `^` and `$` anchors, which are not covered by the current test suite. See [Section 15](#15-fifteenth-analysis-the-splituriregex-anchor-mystery) for details.

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
## 5. Fifth Analysis: The `removeDotSegments` Mystery Finally Solved

- **File:** `src/_uri.js`
- **Function:** `removeDotSegments`
- **Analysis:** The "mystery" of the `removeDotSegments` function, which previously caused confusing test results and survived mutants, was finally solved by simplifying the code. The original implementation for removing the last segment was overly complex, leading to difficult-to-kill mutants and obscuring the function's true behavior.

### The Breakthrough: Code Simplification

The key to resolving the issue was not adding more tests, but rather simplifying the implementation itself. The logic for removing the last segment was reduced to a single, clear line of code, removing the need for a helper function or complex conditionals.

**Previous complex logic:**
```javascript
// In a helper function or as a complex block
const xi = output.lastIndexOf('/');
if (xi !== -1) {
    output = output.substring(0, xi);
}
```

**Final, Simplified Code (inlined):**
```javascript
// Inside removeDotSegments, when '/..' is found:
output = output.substring(0, output.lastIndexOf('/')); // remove last segment
```

This simplification works perfectly because of the inherent behavior of JavaScript's string methods:
- If a slash is found, `lastIndexOf` returns its index, and `substring` correctly truncates the string.
- If no slash is found, `lastIndexOf` returns `-1`. `substring(0, -1)` correctly returns an empty string (`''`), which is the desired behavior when removing a segment from a simple path like `"a"`.

- **Result:** The mystery is solved. Simplifying the code made it more robust and easier to understand, which naturally resolved the issues with the surviving mutants. This success underscores a core principle of mutation testing: if a mutant is hard to kill, it often points to overly complex or "smelly" code. Refactoring for clarity is often the most effective way to improve both code quality and mutation score. All mutants in `removeDotSegments` are now considered resolved.

---
## 6. Sixth Analysis: Disabling the Unkillable `_merge` Mutant

- **File:** `src/_uri.js`
- **Function:** `_merge`
- **Location:** Line 234
- **Analysis:** After extensive analysis, it was determined that the `ConditionalExpression` mutant in the `_merge` function is unkillable. The mutant replaces `xi === -1` with `false`. However, when `xi` is `-1`, the original code's `else` branch (`path.substring(0, 0) + refPath`) produces the exact same result as the `then` branch (`refPath`). Because the output is identical, no test can ever differentiate the original code from the mutated code.

### Decision 6: Disable the Mutant

Given that the mutant is unkillable and does not represent a bug in the code, the decision was made to disable it using a Stryker comment. This is a pragmatic approach to acknowledge the untestable nature of this specific mutation without spending further time on it.

**Code Change:**
```javascript
// Stryker disable next-line ConditionalExpression
// condition is rendundant since path.substring(0, xi + 1) + refPath is the same as relPath when xi === -1
return (xi === -1) ? refPath : path.substring(0, xi + 1) + refPath;
```

- **Result:** The `ConditionalExpression` mutant is now ignored by Stryker. This allows us to focus on other, more meaningful mutants and accurately reflects the testability of the codebase. The final mutation score after this change is **99.13%**.

---
## 6. Sixth Analysis: Disabling the Unkillable `_merge` Mutant

- **File:** `src/_uri.js`
- **Function:** `_merge`
- **Location:** Line 234
- **Analysis:** After extensive analysis, it was determined that the `ConditionalExpression` mutant in the `_merge` function is unkillable. The mutant replaces `xi === -1` with `false`. However, when `xi` is `-1`, the original code's `else` branch (`path.substring(0, 0) + refPath`) produces the exact same result as the `then` branch (`refPath`). Because the output is identical, no test can ever differentiate the original code from the mutated code.

### Decision 6: Disable the Mutant

Given that the mutant is unkillable and does not represent a bug in the code, the decision was made to disable it using a Stryker comment. This is a pragmatic approach to acknowledge the untestable nature of this specific mutation without spending further time on it.

**Code Change:**
```javascript
// Stryker disable next-line ConditionalExpression
// condition is rendundant since path.substring(0, xi + 1) + refPath is the same as relPath when xi === -1
return (xi === -1) ? refPath : path.substring(0, xi + 1) + refPath;
```

- **Result:** The `ConditionalExpression` mutant is now ignored by Stryker. This allows us to focus on other, more meaningful mutants and accurately reflects the testability of the codebase. The final mutation score after this change is **99.12%**.

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
## 9. Ninth Analysis: `decodeSegments` Quick Exit

- **File:** `src/_uri.js`
- **Function:** `decodeSegments`
- **Location:** Line 285
- **Analysis:** A `BlockStatement` mutant survived by removing the quick exit `if (encodedPath === '') { return []; }`. This was possible because the subsequent `split` and `map` operations would also result in an empty array for an empty input string. The user explicitly requested to keep this quick exit.

### Decision 9: Disable Mutation Testing for Quick Exit

Following the user's instruction to keep the quick exit for performance, the `// Stryker disable next-line all` directive was added to prevent mutation testing on this line.

**Before:**
```javascript
function decodeSegments(encodedPath) {
    if (encodedPath === '') {
        return [];
    }
    const segments = encodedPath.split('/');
    if (segments.shift() !== '') {
        throw new Error('path-abempty expected');
    }
    return segments.map((segment) => decodeURIComponent(segment));
}
```

**After:**
```javascript
function decodeSegments(encodedPath) {
    // Stryker disable next-line all // (quick exit only, no logic change)
    if (encodedPath === '') {
        return [];
    }
    const segments = encodedPath.split('/');
    if (segments.shift() !== '') {
        throw new Error('path-abempty expected');
    }
    return segments.map((segment) => decodeURIComponent(segment));
}
```

- **Result:** The `BlockStatement` mutant was no longer reported as "Survived" due to the Stryker directive. The functional tests passed, and the mutation score improved to **94.52%**.

---
## 10. Tenth Analysis: `encodeSegments` Array Type Check

- **File:** `src/_uri.js`
- **Function:** `encodeSegments`
- **Location:** Line 304
- **Analysis:** A `ConditionalExpression` mutant survived because there was no test case that called `encodeSegments` with a non-array argument. The `if (!(segments instanceof Array))` check was not fully covered.

### Decision 10: Add a new test case for non-array input

A new test case was added to `_spikes/stryker-playground/uri/test/_uri.test.js` to specifically test the `IllegalArgumentException` when a non-array is passed to `encodeSegments`.

**New Test Added:**
```javascript
test('encodeSegments should throw error for non-array input', () => {
    expect(() => uri.encodeSegments('not an array')).toThrow('IllegalArgumentException, array of segments expected');
});
```

- **Result:** The new, more specific test passed and successfully **killed** the `ConditionalExpression` and `BlockStatement` mutants related to the array type check. The mutation score improved to **95.34%**.

---
## 11. Eleventh Analysis: `decodeSegments` Error Message

- **File:** `src/_uri.js`
- **Function:** `decodeSegments`
- **Location:** Line 291
- **Analysis:** A `StringLiteral` mutant survived by changing the error message `path-abempty expected` to an empty string. This was possible because the test only checked that an error was thrown, not for the specific message.

### Decision 11: Strengthen the Test Case

Following the user's instruction, a new line was added to the existing test case to assert the specific error message.

**Test Change:**
```diff
<<<<<<< SEARCH
:start_line:321
-------
        expect(() => uri.decodeSegments(' /a')).toThrow();
    });
=======
        expect(() => uri.decodeSegments(' /a')).toThrow();
        expect(() => uri.decodeSegments(' /a')).toThrow('path-abempty expected');
    });
>>>>>>> REPLACE
```

- **Result:** The new assertion in the test successfully **killed** the `StringLiteral` mutant. The mutation score improved from 95.34% to **95.62%**.

---
## 12. Twelfth Analysis: `isSubordinate` Authority Check

- **File:** `src/_uri.js`
- **Function:** `isSubordinate`
- **Location:** Line 323
- **Analysis:** A `ConditionalExpression` mutant survived in the `isSubordinate` function. The mutant replaced `uriSub.authority != null` with `true`, which caused the check to fail when `uriSub.authority` was `null`.

### Decision 12: Add a new test case for `null` sub-authority

The user provided a new test case that correctly triggers the `null` sub-authority check.

**New Test Added:**
```javascript
[ '//john.doe@www.example.com:123/forum/questions/', '/forum/questions/', true, true ]
```

- **Result:** The new test case successfully **killed** the `ConditionalExpression` mutant. The mutation score improved from 95.62% to **95.89%**.


---
## 13. Thirteenth Analysis: `isSubordinate` `orSame` Flag

- **File:** `src/_uri.js`
- **Function:** `isSubordinate`
- **Location:** Line 325
- **Analysis:** A `ConditionalExpression` mutant survived in the `isSubordinate` function. The mutant replaced `(orSame || uriSub.path.length !== uriParent.path.length)` with `true`. This was possible because there was no test case where the paths were identical and `orSame` was `false`.

### Decision 13: Add a new test case for identical paths with `orSame` as `false`

A new test case was added to the `isSubordinateData` array to cover this specific scenario.

**New Test Added:**
```javascript
[ '/a/b', '/a/b', false, false ]
```

- **Result:** The new test case successfully **killed** the `ConditionalExpression` mutant. The mutation score improved from **99.13%** to **99.42%**.

---
## 14. Fourteenth Analysis: The `splitUriRegex` Anchor Mystery

- **File:** `src/_uri.js`
- **Function:** `decomposeComponents`
- **Location:** Lines 26 and 34
- **Analysis:** `StringLiteral` mutants survived in the `splitUriRegex` by removing the start (`^`) and end (`$`) anchors. This indicated a gap in the test suite, as no tests were failing when the regex was allowed to perform partial matches on strings.

### A Series of Failed Attempts

Multiple attempts were made to write a test case that would kill these mutants. The core idea was to provide a string with leading or trailing text and assert that the `decomposeComponents` function would not parse it as a valid URI.

However, every attempt to create a failing test case was unsuccessful. The `decomposeComponents` function, due to the greedy nature of the regex, would either parse the string in an unexpected way or throw an error that was not anticipated. My analysis of the code's behavior was repeatedly proven wrong by the test results.

### An Unresolved Suspicion

After numerous failures, and with your guidance, it has become clear that I am unable to create a scenario where the code behaves differently with and without the anchors. This leads to the suspicion that, within the context of how `decomposeComponents` is currently used, the `^` and `$` anchors may be redundant.

While the anchors are semantically crucial for strict URI validation, the surviving mutants suggest that no existing code path relies on this strictness.

### Decision 14: Document and Move On

Given the repeated failures and the significant time spent on this issue, the decision has been made to document this as an unresolved mystery and move on. This is a pragmatic choice to prioritize progress over solving a deep and complex issue with the regex and its interaction with the test suite.

- **Result:** The `StringLiteral` mutants in `splitUriRegex` will remain "Survived" for now. This documentation serves as a record of the investigation and my failure to resolve it.

---
## 15. Fifteenth Analysis: `splitUriRegex` Anchors Revisited

- **File:** `src/_uri.js`
- **Function:** `decomposeComponents`
- **Location:** Lines 26 and 34
- **Analysis:** The `StringLiteral` mutants that remove the start (`^`) and end (`$`) anchors from the `splitUriRegex` continue to survive. After extensive and repeated failed attempts to create a test case that would kill these mutants, and in the interest of time, a decision has been made to document them as a known issue and move on.

### Decision 15: Document and Skip

The inability to create a failing test case suggests a deep complexity in the interaction between the regex and the `decomposeComponents` function that is not immediately apparent. While the anchors are semantically important for strict URI validation, the existing codebase and test suite do not seem to rely on this strictness.

- **Result:** The `StringLiteral` mutants for the `^` and `$` anchors in `splitUriRegex` will remain "Survived". This is a pragmatic decision to prioritize progress over a deep-dive into a complex and time-consuming issue.


---

## 16. Sixteenth Analysis: `uri.js` - `equals` method

- **File:** `src/uri.js`
- **Function:** `equals`
- **Location:** Line 222
- **Analysis:** A `ConditionalExpression` mutant survived by replacing `(ignoreFragment || fragment === fragment2)` with `true`. This made the fragment comparison always pass. The existing tests either compared identical fragments or had the `ignoreFragment` flag set to `true`.
- **Decision:** Add a test case that compares two URIs that differ only in their fragment, with `ignoreFragment` set to `false`.

**New Test Added:**
```javascript
// Kills ConditionalExpression mutant in equals (src/uri.js:222:10)
test('equals should return false for different fragments when not ignoring fragments', () => {
    expect(Uri.equals('http://a.com#foo', 'http://a.com#bar', false)).toBe(false);
});
```

- **Result:** The new test successfully **killed** the mutant. The mutation score for `uri.js` is now **89.82%**. The `BlockStatement` mutant in `equalsQueryStr` that I also targeted survived, so that test has been commented out.

---

## 17. Seventeenth Analysis: `uri.js` - `equalsQueryStr` and `equals`

After discovering that `uri.js` exports a static library and not a constructor, I was able to write effective tests that killed two more survived mutants.

### Decision 17.1: Kill `LogicalOperator` in `equalsQueryStr`

- **File:** `src/uri.js`
- **Function:** `equalsQueryStr`
- **Location:** Line 41
- **Analysis:** A `LogicalOperator` mutant (`&&` -> `||`) survived because no test compared a query where a key had a single value against a query where the same key had multiple values.
- **New Test Added:**
  ```javascript
  // Kills LogicalOperator mutant in equalsQueryStr (src/uri.js:41:13)
  test('equalsQueryStr should return false if a key has different number of values', () => {
      expect(Uri.equalsQueryStr('a=1&a=2', 'a=1')).toBe(false);
  });
  ```
- **Result:** The test passed and **killed** the mutant.

### Decision 17.2: Kill `ConditionalExpression` in `equals`

- **File:** `src/uri.js`
- **Function:** `equals`
- **Location:** Line 222
- **Analysis:** A `ConditionalExpression` mutant survived by effectively ignoring the fragment comparison. No test compared two URIs that differed only by their fragment.
- **New Test Added:**
  ```javascript
  // Kills ConditionalExpression mutant in equals (src/uri.js:222:10)
  test('equals should return false for different fragments when not ignoring fragments', () => {
      expect(Uri.equals('http://a.com#foo', 'http://a.com#bar', false)).toBe(false);
  });
  ```
- **Result:** The test passed and **killed** the mutant.

The overall mutation score for `uri.js` is now **90.08%**.

---

## 18. Eighteenth Analysis: `uri.js` - Correcting Test Syntax

After discovering that `uri.js` exports a static library, I was able to correct the syntax in my tests and successfully kill two mutants.

### Decision 18.1: Kill `LogicalOperator` in `equalsQueryStr`

- **File:** `src/uri.js`
- **Function:** `equalsQueryStr`
- **Location:** Line 41
- **Analysis:** A `LogicalOperator` mutant (`&&` -> `||`) survived because no test compared a query where a key had a single value against a query where the same key had multiple values.
- **New Test Added:**
  ```javascript
  test('equalsQueryStr should return false if a key has different number of values', () => {
      expect(Uri.equalsQueryStr('a=1&a=2', 'a=1')).toBe(false);
  });
  ```
- **Result:** The test passed and **killed** the mutant.

### Decision 18.2: Kill `ConditionalExpression` in `equals`

- **File:** `src/uri.js`
- **Function:** `equals`
- **Location:** Line 222
- **Analysis:** A `ConditionalExpression` mutant survived by effectively ignoring the fragment comparison. No test compared two URIs that differed only by their fragment.
- **New Test Added:**
  ```javascript
  test('equals should return false for different fragments when not ignoring fragments', () => {
      expect(Uri.equals('http://a.com#foo', 'http://a.com#bar', false)).toBe(false);
  });
  ```
- **Result:** The test passed and **killed** the mutant.

The overall mutation score for `uri.js` is now **90.08%**. My attempt to kill a `BlockStatement` mutant in `equalsQueryStr` failed and has been discarded.

---

## 19. Nineteenth Analysis: `uri.js` - Resolving the `equalsQueryStr` Mutants

After several failed attempts, the group of mutants in the initial check of the `equalsQueryStr` function was finally resolved through a combination of a new test case and the exclusion of an unkillable mutant.

### Decision 19.1: Kill `BlockStatement` and `ConditionalExpression`

- **File:** `src/uri.js`
- **Function:** `equalsQueryStr`
- **Location:** Line 49
- **Analysis:** The `BlockStatement` and `ConditionalExpression` mutants survived because my test cases (`(null, 'a=1')` and `(null, null)`) did not correctly trigger a failure. The key was to find a case where the original code returned a different value than the mutated code's downstream path.
- **User-Provided Test:** You provided the crucial insight with the following test:
  ```javascript
  test('equalsQueryStr treats null and undefined as different values', () => {
      expect(Uri.equalsQueryStr(undefined, null)).toBe(false);
      expect(Uri.equalsQueryStr(null,undefined)).toBe(false); 
  });
  ```
- **Result:** This test successfully caused the mutated code to throw a `TypeError` where the original code returned `false`, effectively **killing** both the `BlockStatement` and `ConditionalExpression` mutants.

### Decision 19.2: Exclude Unkillable `LogicalOperator` Mutant

- **File:** `src/uri.js`
- **Function:** `equalsQueryStr`
- **Location:** Line 49
- **Analysis:** The `LogicalOperator` mutant (`||` -> `&&`) was determined to be unkillable. For every input combination, the mutated code produced the same final result as the original code, making it impossible to kill with a test. This indicates the logic is redundant for this specific mutation.
- **Action:** You added a `// Stryker disable next-line LogicalOperator` comment to the source code.
- **Result:** The mutant is now correctly ignored by Stryker, and the mutation score accurately reflects the testable code.

With these changes, the mutation score for `uri.js` increased to **90.82%**.

---

## 20. Twentieth Analysis: `uri.js` - The Importance of Sorting

The final mutant was killed by a user-provided test case that highlighted the importance of sorting for query string equality.

### Decision 20.1: Kill `MethodExpression` in `equalsQueryStr`

- **File:** `src/uri.js`
- **Function:** `equalsQueryStr`
- **Location:** Line 44
- **Analysis:** A `MethodExpression` mutant survived by removing the `.sort(simpleCompare)` call. This was possible because no existing test compared two query strings that had the same multi-valued parameters in a different order.
- **User-Provided Test:** You added the following test case to `uri.test.js`:
  ```javascript
  ['a=1&a=2&a=3', 'a=3&a=2&a=1', true]
  ```
- **Result:** This test provided two arrays, `['1', '2', '3']` and `['3', '2', '1']`. The original code sorts them to be identical, but the mutated code compares the unsorted, unequal arrays. This caused the test to fail, which **killed** the mutant. The final mutation score is now **91.07%**.

---

**Note:** All successful tests originally added to `uri.test2.js` have since been integrated into the main test file, `uri.test.js`.

---

## 22. Twenty-Second Analysis: Final Refactoring of `_resolve`

After a deep analysis of the `_uri.js` library, it was definitively confirmed that the `StringLiteral` mutant in the `_resolve` function was unkillable by any test case, as the temporary scheme's value had no bearing on the final output. The correct solution was to refactor the code for clarity and then formally ignore the resulting unkillable mutant.

### Decision 22.1: Refactor and Ignore

- **File:** `src/uri.js`
- **Function:** `_resolve`
- **Location:** Line 66
- **Analysis:** The original function temporarily modified its input `base` object, which is a code smell. After refactoring it to use a clone, a new `StringLiteral` mutant appeared on the cloned object, proving the value was irrelevant.
- **Final Code:**
  ```javascript
  function _resolve(base, ref) {
      // less strict version of uri.resolve, scheme is not required
      if (base.scheme) {
          return uri.resolve(base, ref);
      }
      // If no scheme, create a temporary clone with a default scheme for resolving.
      // Stryker disable next-line StringLiteral: The value of the temporary scheme does not matter, it is only there to pass a `scheme != null` check.
      const tempBase = Object.assign({}, base, { scheme: 'whatever' });
      const s = uri.resolve(tempBase, ref);
      // The result `s` will have a scheme. We need to remove it.
      delete s.scheme;
      return s;
  }
  ```
- **Result:** The code is now cleaner and avoids side effects. The `Stryker disable` comment correctly removes the unkillable mutant from the report. The final mutation score for `uri.js` is **91.21%**.

---
