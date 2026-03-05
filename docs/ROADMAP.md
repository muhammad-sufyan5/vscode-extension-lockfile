# Extension Lockfile Roadmap

## MVP

- Generate `.vscode/extensions.lock.json` with schema version `1`.
- Capture non built-in installed extensions (`id`, `version`, `enabled`).
- Validate installed extensions against lockfile.
- Report missing, mismatched, and extra extensions.
- Install missing extension IDs (latest available), then re-validate.

## Next Improvements

- Optional generation of `.vscode/extensions.json` recommendations.
- Workspace/user ignore list settings for extension IDs.
- Tree view UI for validation and install actions.
- Export devcontainer snippet that pins versions where supported.
- CI-friendly output mode (machine-readable report and non-zero exit signal strategy).
