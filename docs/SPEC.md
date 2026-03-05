# Extension Lockfile Specification

## Lockfile Path

- `.vscode/extensions.lock.json`

## Schema

Current schema version: `1`

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-03-04T10:00:00.000Z",
  "vscodeVersion": "1.109.5",
  "extensions": [
    {
      "id": "publisher.name",
      "version": "x.y.z",
      "enabled": true
    }
  ]
}
```

Rules:
- Built-in extensions are excluded (`packageJSON.isBuiltin === true`).
- Entries are sorted by `id` before writing.
- `enabled` is always `true` in MVP.
- Future changes must be additive; existing fields are not removed.

## Commands

- `extensionLockfile.generate`
  - Reads installed extensions from VS Code.
  - Excludes built-in extensions.
  - Writes lockfile to `.vscode/extensions.lock.json`.

- `extensionLockfile.validate`
  - Reads lockfile and compares with installed extensions.
  - Reports:
    - missing extensions
    - version mismatches
    - extra installed extensions (not in lockfile)
  - Shows `All good` when no differences exist.

- `extensionLockfile.installMissing`
  - Reads lockfile and installs missing extension IDs with:
    - `workbench.extensions.installExtension`
  - Re-validates after install attempts.
  - Shows report with missing/mismatch/extra results.

## Known Limitations

- Exact version installation is not guaranteed through VS Code extension install APIs.
- `installMissing` installs the latest available version for missing extension IDs.
- Version mismatches can remain after install and are reported explicitly.
