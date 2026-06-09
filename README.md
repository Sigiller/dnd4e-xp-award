# D&D 4e XP Award

Foundry VTT **13** module for **dnd4e**: award experience after combat or manually — enemy XP pool, optional skill challenge, bonus XP, and party distribution with a chat log card (revert supported).

Repository: https://github.com/Sigiller/dnd4e-xp-award

## Install

Manifest URL (always use **latest** for updates):

```
https://github.com/Sigiller/dnd4e-xp-award/releases/latest/download/module.json
```

## Setup

1. Enable the module on a **dnd4e** world (GM only for awarding XP).
2. **Auto mode:** end combat — the XP dialog opens for the GM when **Show XP Dialog on Combat End** is enabled.
3. **Manual mode:** use the **Award XP** scene control (tokens toolbar).
4. Party recipients come from the **Party** actor folder (same name as [dnd4e-party-sheet](https://github.com/Sigiller/dnd4e-party-sheet) when that module is active, or **Party Folder Name** in settings).

Drag actors from the sidebar or compendiums into the enemy list. Identical monsters (same name and per-monster XP) are grouped with a count multiplier.

## Development

- Install the module under `Data/modules/dnd4e-xp-award` (or symlink this repo there).

```bash
cd Data/modules/dnd4e-xp-award
npm install
npm run build      # outputs dist/main.js
npm run dev        # watch mode
npm test
```

## Versioning

The **`version`** field in **`module.json`** is what Foundry reads. Root **`package.json`** mirrors the same semver for tooling. Bump both together before tagging a release.

## Releases

Tag a commit with **`v*.*.*`** (e.g. `v0.1.0`). The tag **must** match `version` in `module.json` (without the leading `v`). The [Release workflow](.github/workflows/release.yml) builds `module.zip` (top-level folder `dnd4e-xp-award/`) and uploads **`module.json`** + **`module.zip`** to the GitHub Release; both files set `manifest` / `download` to that tag’s asset URLs (Foundry can install from the release `module.json` URL).

**Install from GitHub (after a release exists):** in Foundry, paste the manifest URL from the release page, e.g. `https://github.com/Sigiller/dnd4e-xp-award/releases/latest/download/module.json` (or the same path under a specific tag for a pinned version).

## Recommended modules

- [fox-4e-styling](https://github.com/EndlesNights/fox-4e-styling) — fonts and 4e sheet palette
- [dnd4e-party-sheet](https://github.com/Sigiller/dnd4e-party-sheet) — shared Party folder and party level for skill challenges
