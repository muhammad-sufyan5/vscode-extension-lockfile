# Extension Lockfile

Extension Lockfile helps teams reproduce a consistent VS Code extension setup per workspace.

It generates a lockfile at `.vscode/extensions.lock.json` containing installed extension IDs and versions (excluding built-in extensions), then validates current extensions against that file.

## Commands

- `Extension Lockfile: Generate Lockfile`
  - Collects installed non built-in extensions.
  - Writes `.vscode/extensions.lock.json`.

- `Extension Lockfile: Validate Against Lockfile`
  - Compares currently installed extensions to the lockfile.
  - Shows `All good` if they match.
  - Opens a report for missing extensions, version mismatches, and extra extensions.

- `Extension Lockfile: Install Missing Extensions`
  - Installs missing extension IDs using VS Code install command.
  - Re-validates after install attempts and opens a report.

## Lockfile Format

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO_STRING",
  "vscodeVersion": "vscode.version",
  "extensions": [
    {
      "id": "publisher.name",
      "version": "x.y.z",
      "enabled": true
    }
  ]
}
```

## Limitations

- Exact version installation is not guaranteed by VS Code install APIs.
- Missing extensions are installed at the latest available version.
- Version mismatches are reported if installed versions differ from lockfile versions.

## Publishing Notes

- Update `package.json` placeholder values before publishing:
  - `publisher`
  - `repository.url`
  - `homepage`
  - `bugs.url`
- Package locally:
  - `npx vsce package`
- Publish to Marketplace:
  - `npx vsce publish`
