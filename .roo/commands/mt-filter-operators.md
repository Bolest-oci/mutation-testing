---
description: Optimizes Cosmic Ray configuration by filtering irrelevant mutation operators based on the current git diff.
argument-hint: <branch_to_compare>
---

Automate Cosmic Ray mutation testing optimization. 
First, read the branch from 'branch_to_compare' in cosmic-ray-config.toml.
Then, execute git diff <branch_to_compare>..HEAD to get the current code changes.
Next, execute 'cosmic-ray operators' to retrieve the full list of available mutation operators.
Based on the code changes identified in the diff, 
determine all operators which are not relevant and update the exclude-operators 
list in cosmic-ray-config.toml to exclude them.