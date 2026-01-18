# core/ReplaceAndWithOr

- **File:** src\validators\card.py
- **Line:** 106
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -103,7 +103,7 @@
         (ValidationError): If `value` is an invalid American Express card number.
     """
     pattern = re.compile(r"^(34|37)")
-    return card_number(value) and len(value) == 15 and pattern.match(value)
+    return card_number(value) and len(value) == 15 or pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the `card_number` check will fail for an amex card with the wrong length. A test case with a card number that is a valid Luhn number but has a different length and does not start with the amex prefix is needed to kill this mutant.
- **Fix:** Add a test case with a valid Luhn number of length 15 that does not start with the amex prefix.

# core/ReplaceComparisonOperator_Eq_GtE

- **File:** src\validators\card.py
- **Line:** 106
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -103,7 +103,7 @@
         (ValidationError): If `value` is an invalid American Express card number.
     """
     pattern = re.compile(r"^(34|37)")
-    return card_number(value) and len(value) == 15 and pattern.match(value)
+    return card_number(value) and len(value) >= 15 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `amex` only check for a length of 15. A test case with a card number of a different length that is still a valid amex card is needed to kill this mutant.
- **Fix:** Add a test case with a valid amex card number that does not have a length of 15.

- **File:** src\validators\card.py
- **Line:** 194
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -191,7 +191,7 @@
         (ValidationError): If `value` is an invalid Discover card number.
     """
     pattern = re.compile(r"^(60|64|65)")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) >= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `discover` only check for a length of 16. A test case with a card number of a different length that is still a valid discover card is needed to kill this mutant.
- **Fix:** Add a test case with a valid discover card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 128
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -125,7 +125,7 @@
         (ValidationError): If `value` is an invalid UnionPay card number.
     """
     pattern = re.compile(r"^62")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) >= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `unionpay` only check for a length of 16. A test case with a card number of a different length that is still a valid unionpay card is needed to kill this mutant.
- **Fix:** Add a test case with a valid unionpay card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 62
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -59,7 +59,7 @@
         (ValidationError): If `value` is an invalid Visa card number.
     """
     pattern = re.compile(r"^4")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) >= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `visa` only check for a length of 16. A test case with a card number of a different length that is still a valid visa card is needed to kill this mutant.
- **Fix:** Add a test case with a valid visa card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 172
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -169,7 +169,7 @@
         (ValidationError): If `value` is an invalid JCB card number.
     """
     pattern = re.compile(r"^35")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) >= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `jcb` only check for a length of 16. A test case with a card number of a different length that is still a valid jcb card is needed to kill this mutant.
- **Fix:** Add a test case with a valid jcb card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 84
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -81,7 +81,7 @@
         (ValidationError): If `value` is an invalid Mastercard card number.
     """
     pattern = re.compile(r"^(51|52|53|54|55|22|23|24|25|26|27)")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) >= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `mastercard` only check for a length of 16. A test case with a card number of a different length that is still a valid mastercard is needed to kill this mutant.
- **Fix:** Add a test case with a valid mastercard card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 216
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -213,5 +213,5 @@
         (ValidationError): If `value` is an invalid Mir card number.
     """
     pattern = re.compile(r"^(220[0-4])")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
-
+    return card_number(value) and len(value) >= 16 and pattern.match(value)
+
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `mir` only check for a length of 16. A test case with a card number of a different length that is still a valid mir card is needed to kill this mutant.
- **Fix:** Add a test case with a valid mir card number that does not have a length of 16.

# core/ReplaceComparisonOperator_Eq_LtE

- **File:** src\validators\card.py
- **Line:** 172
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -169,7 +169,7 @@
         (ValidationError): If `value` is an invalid JCB card number.
     """
     pattern = re.compile(r"^35")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) <= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `jcb` only check for a length of 16. A test case with a card number of a different length that is still a valid jcb card is needed to kill this mutant.
- **Fix:** Add a test case with a valid jcb card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 84
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -81,7 +81,7 @@
         (ValidationError): If `value` is an invalid Mastercard card number.
     """
     pattern = re.compile(r"^(51|52|53|54|55|22|23|24|25|26|27)")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) <= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `mastercard` only check for a length of 16. A test case with a card number of a different length that is still a valid mastercard is needed to kill this mutant.
- **Fix:** Add a test case with a valid mastercard card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 106
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -103,7 +103,7 @@
         (ValidationError): If `value` is an invalid American Express card number.
     """
     pattern = re.compile(r"^(34|37)")
-    return card_number(value) and len(value) == 15 and pattern.match(value)
+    return card_number(value) and len(value) <= 15 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `amex` only check for a length of 15. A test case with a card number of a different length that is still a valid amex card is needed to kill this mutant.
- **Fix:** Add a test case with a valid amex card number that does not have a length of 15.

- **File:** src\validators\card.py
- **Line:** 62
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -59,7 +59,7 @@
         (ValidationError): If `value` is an invalid Visa card number.
     """
     pattern = re.compile(r"^4")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) <= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `visa` only check for a length of 16. A test case with a card number of a different length that is still a valid visa card is needed to kill this mutant.
- **Fix:** Add a test case with a valid visa card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 194
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -191,7 +191,7 @@
         (ValidationError): If `value` is an invalid Discover card number.
     """
     pattern = re.compile(r"^(60|64|65)")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) <= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `discover` only check for a length of 16. A test case with a card number of a different length that is still a valid discover card is needed to kill this mutant.
- **Fix:** Add a test case with a valid discover card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 38
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -35,7 +35,7 @@
         digits = list(map(int, value))
         odd_sum = sum(digits[-1::-2])
         even_sum = sum(sum(divmod(2 * d, 10)) for d in digits[-2::-2])
-        return (odd_sum + even_sum) % 10 == 0
+        return (odd_sum + even_sum) % 10 <= 0
     except ValueError:
         return False
 
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the Luhn algorithm check will fail for any input that is not a valid card number, so the result of the modulo operation is not relevant. The existing tests do not provide a card number that would pass the Luhn algorithm but fail this mutated check.
- **Fix:** Add a test case with a card number that passes the Luhn algorithm but has a sum that is a multiple of 10.

- **File:** src\validators\card.py
- **Line:** 216
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -213,5 +213,5 @@
         (ValidationError): If `value` is an invalid Mir card number.
     """
     pattern = re.compile(r"^(220[0-4])")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
-
+    return card_number(value) and len(value) <= 16 and pattern.match(value)
+
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `mir` only check for a length of 16. A test case with a card number of a different length that is still a valid mir card is needed to kill this mutant.
- **Fix:** Add a test case with a valid mir card number that does not have a length of 16.

- **File:** src\validators\card.py
- **Line:** 128
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -125,7 +125,7 @@
         (ValidationError): If `value` is an invalid UnionPay card number.
     """
     pattern = re.compile(r"^62")
-    return card_number(value) and len(value) == 16 and pattern.match(value)
+    return card_number(value) and len(value) <= 16 and pattern.match(value)
 
 
 @validator
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `unionpay` only check for a length of 16. A test case with a card number of a different length that is still a valid unionpay card is needed to kill this mutant.
- **Fix:** Add a test case with a valid unionpay card number that does not have a length of 16.

# core/ReplaceComparisonOperator_IsNot_NotEq

- **File:** src\validators\_extremes.py
- **Line:** 47
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\_extremes.py
+++ bsrc\validators\_extremes.py
@@ -44,5 +44,5 @@
 
     def __le__(self, other: Any):
         """LessThanOrEqual."""
-        return other is not AbsMin
+        return other != AbsMin
 
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because `is not` and `!=` are equivalent for singletons like `AbsMin`. The tests do not cover a scenario where a different instance of `AbsMin` is created, which would cause the `!=` operator to behave differently.
- **Fix:** Add a test case that creates a new instance of `AbsMin` and compares it to the original.
```python
def test_abs_min_is_not_equal_to_new_instance():
    assert AbsMin() != AbsMin()
```

- **File:** src\validators\_extremes.py
- **Line:** 26
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\_extremes.py
+++ bsrc\validators\_extremes.py
@@ -23,7 +23,7 @@
 
     def __ge__(self, other: Any):
         """GreaterThanOrEqual."""
-        return other is not AbsMax
+        return other != AbsMax
 
 
 @total_ordering
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because `is not` and `!=` are equivalent for singletons like `AbsMax`. The tests do not cover a scenario where a different instance of `AbsMax` is created, which would cause the `!=` operator to behave differently.
- **Fix:** Add a test case that creates a new instance of `AbsMax` and compares it to the original.
```python
def test_abs_max_is_not_equal_to_new_instance():
    assert AbsMax() != AbsMax()
```

# core/ReplaceFalseWithTrue

- **File:** src\validators\card.py
- **Line:** 33
- **Diff:**
```diff
--- mutation diff ---
--- asrc\validators\card.py
+++ bsrc\validators\card.py
@@ -30,7 +30,7 @@
         (ValidationError): If `value` is an invalid generic card number.
     """
     if not value:
-        return False
+        return True
     try:
         digits = list(map(int, value))
         odd_sum = sum(digits[-1::-2])
```
- **Classification:** Fix tests
- **Reasoning:** The mutant survived because the tests for `card_number` do not check for empty strings. A test case with an empty string is needed to kill this mutant.
- **Fix:** Add a test case with an empty string.
```python
def test_returns_failed_on_empty_card_number():
    assert isinstance(card_number(""), ValidationError)
```
