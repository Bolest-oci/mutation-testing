#  Práca s `cosmic-ray dump` a formátovaním výstupu pomocou `jq`

Tento návod ukazuje, ako pracovať s výstupom príkazu `cosmic-ray dump` a ako ho previesť do čitateľného JSON-u pomocou nástroja `jq`.
---

##  Čo vlastne robí `cosmic-ray dump`?

Príkaz:
```bash
cosmic-ray dump path/to/db.sqlite
```

vypíše obsah Cosmic-Ray databázy v podobe newline-delimited JSON (NDJSON).

To znamená:
- každý riadok je samostatný JSON objekt,
- celé to nie je validný JSON dokument,
- každý riadok je dvojprvkové pole:
`[ WorkItem, WorkResult ]`

### WorkItem

Zahŕňa detaily o mutácii, ktorú Cosmic-Ray vytvoril:

- `job_id`
- `mutations` (modul, operátor, pozície v kóde…)
- `function_name`
- ďalšie metadáta mutácie

### WorkResult

Obsahuje výsledok testovania danej mutácie:

- `test_outcome` (`killed`, `survived`, `incompetent`, …)
- `worker_outcome`
- `output` (pytest výpis)
- `diff` (diff mutácie)
- môže byť `null`, ak test ešte nebol vykonaný
### Príklad jedného riadku:

```json
[
  {
    "job_id": 12,
    "mutations": [
      {
        "module_path": "app/example.py",
        "operator_name": "replace_boolean_literal",
        "occurrence": 0,
        "start_pos": [10, 4],
        "end_pos": [10, 9],
        "operator_args": {},
        "function_name": "foo"
      }
    ]
  },
  {
    "worker_outcome": "normal",
    "output" : "...",
    "test_outcome": "survived",
    "diff": "..."
  }
]
```

# Čo je jq?

`jq` je nástroj na prácu s JSON súbormi v termináli. Umožňuje filtrovať, formátovať, transformovať a analyzovať JSON veľmi jednoducho a elegantne.

---

## Inštalácia

Najjednoduchší spôsob je prejsť na oficiálnu stránku projektu a stiahnuť si najnovšiu verziu:

 **[https://jqlang.github.io/jq/](https://jqlang.github.io/jq/)**

Na stránke si vyberiete build pre svoj operačný systém.

### Windows

* Stiahnite si `.exe` súbor pre Windows.
* Odporúča sa dať ho do priečinka, ktorý máte v `PATH`, aby ste mohli používať príkaz `jq` odkiaľkoľvek.

### Linux / macOS

Väčšina distribúcií má jq dostupné priamo v balíčkoch:

* **Ubuntu / Debian:** `sudo apt install jq`
* **Fedora:** `sudo dnf install jq`
* **macOS (Homebrew):** `brew install jq`

---
## Prevod kompletného dumpu na čitateľný JSON
Tento príkaz vytvorí **validný JSON súbor** so všetkými objektmi uloženými v jednom poli (`-s = slurp`):
```bash
cosmic-ray dump path/to/db.sqlite | jq '.' -s > dump.json
```
`'.'` výstup sa zobrazí tak, ako je (celý JSON), a `-s` načíta všetky riadky a uloží ich do jedného poľa.

## Filtrovanie podľa výsledku + extrakcia vybraných polí
Príklad: vyfiltrujeme všetky mutácie, ktoré prežili (`test_outcome == "survived"`) a uložíme len dôležité údaje.

```bash
cosmic-ray dump path/to/db.sqlite | jq --arg outcome "survived" '
  select(.[1].test_outcome == $outcome)
  | {
      job_id: .[0].job_id,
      module_path: .[0].mutations[0].module_path,
      operator_name: .[0].mutations[0].operator_name,
      occurrence: .[0].mutations[0].occurrence,
      start_pos_row: .[0].mutations[0].start_pos[0],
      start_pos_col: .[0].mutations[0].start_pos[1],
      end_pos_row: .[0].mutations[0].end_pos[0],
      end_pos_col: .[0].mutations[0].end_pos[1],
      diff: .[1].diff,
      function_name: .[0].mutations[0].function_name
    }
' | jq -s '.' > report.json
```
Výsledný `report.json` bude mať peknú štruktúru:
```json
[
  {
    "job_id": 12,
    "module_path": "app/example.py",
    "operator_name": "replace_boolean_literal",
    "occurrence": 0,
    "start_pos_row": 10,
    "start_pos_col": 4,
    "end_pos_row": 10,
    "end_pos_col": 9,
    "diff": "...",
    "function_name": "foo"
  }
]

```
Takýto výstup je vhodný na ďalšiu analýzu mutácií.
