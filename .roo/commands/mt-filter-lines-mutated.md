---
description: Re-initializes Cosmic Ray and filters mutations to only those on changed lines.
argument-hint: <branch_to_compare>
---

Locate the Cosmic Ray config file (a `*.toml` matching `cosmic-ray` in its name)
and the Cosmic Ray database file (a `*.sqlite` in the same project).

Ensure that the config file contains EXACTLY this section:

[cosmic-ray.filters.git-filter]
branch = "<branch_to_compare>"

If it exists, replace the branch value. If missing, create the section.

Then perform:

1. Reinitialize the Cosmic Ray database:
   cosmic-ray init <config_file> <database_file> --force

2. Apply git-based filtering to skip all mutations not on changed lines:
   cr-filter-git <database_file>
