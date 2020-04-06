Aeon's End - Randomizer - Data Generator
===

Data generator for https://aeons-end-randomizer.de/

# Usage

## Data source

Aeon's End expansions are read from a Google Sheet ([default](https://docs.google.com/spreadsheets/d/1yxFwi77V6qzQ9xEKKIXkAWe9R7oBgnpphvoBRfpLcnA/edit?usp=sharing)). All sheets share common properties:

* First column is original name. It's not used and only serve as reference.
* Second column is translated name.
* Third column is an internal database identifier.

### Expansions sheet

First sheet describe expansion list. Code is used as prefix for other expansion data (nemesis, mages, starters, cards).

Columns:

1. Original name
2. Translated name
3. Internal identifier
4. Expansion type (one of: `standalone` or `mini`)

### Nemesis sheets

They are named `<Code> - Nemesis`.

Columns:

1. Original name
2. Translated name
3. Internal identifier
4. Health
5. Difficulty
6. Expedition rating
7. Additional information

### Mages sheets

They are named `<Code> - Mages`.

Columns:

1. Original name
2. Translated name
3. Internal identifier
4. Title
5. Ability
Text has special format. Each line have different purpose:

    1. Ability name
    2. Activation condition
    3. Description
    4. (Optional) Special notes

6. Number of charges required to use ability
7. Internal identifiers for special starter cards

### Starter cards sheets

They are named `<Code> - Départ`.

Columns:

1. Original name
2. Translated name
3. Internal identifier
4. Card type. One of `Gem`, `Spell` or `Relic`
5. Cost
6. Effect
Text has special format for `Spell` type. By default content describe cast effect, but other effect can be described as follows:
```text
---
<Other effect>
---
<Cast effect>
```

### Market cards sheets

They are named `<Code> - Cartes`.

Columns are exactly the same as "Starter cards sheets".
