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