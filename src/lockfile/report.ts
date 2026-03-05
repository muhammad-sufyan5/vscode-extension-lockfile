import * as vscode from 'vscode';
import { LockfileDiff } from './diff';
import { ExtensionLockfile } from './model';
import { LOCKFILE_RELATIVE_PATH } from './io';

function renderSection(title: string, lines: string[]): string[] {
	if (lines.length === 0) {
		return [title, '  - none', ''];
	}

	return [title, ...lines.map((line) => `  - ${line}`), ''];
}

export function renderValidationReport(
	diff: LockfileDiff,
	lockfile: ExtensionLockfile,
	installedCount: number
): string {
	const missingLines = diff.missing.map((extension) => `${extension.id}@${extension.version}`);
	const mismatchLines = diff.mismatched.map(
		(entry) => `${entry.id}: expected ${entry.expectedVersion}, found ${entry.actualVersion}`
	);
	const extraLines = diff.extra.map((extension) => `${extension.id}@${extension.version}`);

	const lines: string[] = [
		'Extension Lockfile Validation Report',
		'',
		`Lockfile: ${LOCKFILE_RELATIVE_PATH}`,
		`Schema version: ${lockfile.schemaVersion}`,
		`Generated at: ${lockfile.generatedAt}`,
		`VS Code (lockfile): ${lockfile.vscodeVersion}`,
		`Installed (current): ${vscode.version}`,
		`Lockfile extension count: ${lockfile.extensions.length}`,
		`Installed extension count (non built-in): ${installedCount}`,
		'',
		...renderSection('Missing extensions', missingLines),
		...renderSection('Version mismatches', mismatchLines),
		...renderSection('Extra installed extensions', extraLines),
		'Note: exact version installation is not guaranteed by VS Code APIs.',
	];

	return lines.join('\n');
}

export async function showReportDocument(content: string): Promise<void> {
	const document = await vscode.workspace.openTextDocument({
		content,
		language: 'text',
	});

	await vscode.window.showTextDocument(document, {
		preview: false,
	});
}
