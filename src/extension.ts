import * as vscode from 'vscode';
import { diffExtensions, hasDifferences, LockfileDiff } from './lockfile/diff';
import { getInstalledExtensions } from './lockfile/installed';
import { LOCKFILE_RELATIVE_PATH, readLockfile, writeLockfile } from './lockfile/io';
import { ExtensionLockfile, LOCKFILE_SCHEMA_VERSION } from './lockfile/model';
import { renderValidationReport, showReportDocument } from './lockfile/report';

const COMMANDS = {
	generate: 'extensionLockfile.generate',
	validate: 'extensionLockfile.validate',
	installMissing: 'extensionLockfile.installMissing',
} as const;

interface ValidationSnapshot {
	lockfile: ExtensionLockfile;
	diff: LockfileDiff;
	installedCount: number;
}

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
	return vscode.workspace.workspaceFolders?.[0];
}

function requireWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
	const workspaceFolder = getWorkspaceFolder();
	if (!workspaceFolder) {
		void vscode.window.showErrorMessage('Open a folder/workspace first.');
		return undefined;
	}

	return workspaceFolder;
}

function createLockfile(): ExtensionLockfile {
	return {
		schemaVersion: LOCKFILE_SCHEMA_VERSION,
		generatedAt: new Date().toISOString(),
		vscodeVersion: vscode.version,
		extensions: getInstalledExtensions(),
	};
}

async function getValidationSnapshot(
	workspaceFolder: vscode.WorkspaceFolder
): Promise<ValidationSnapshot> {
	const lockfile = await readLockfile(workspaceFolder);
	const installedExtensions = getInstalledExtensions();
	const diff = diffExtensions(lockfile, installedExtensions);

	return {
		lockfile,
		diff,
		installedCount: installedExtensions.length,
	};
}

async function showValidationResult(snapshot: ValidationSnapshot): Promise<void> {
	if (!hasDifferences(snapshot.diff)) {
		await vscode.window.showInformationMessage('All good');
		return;
	}

	const report = renderValidationReport(snapshot.diff, snapshot.lockfile, snapshot.installedCount);
	await showReportDocument(report);
}

async function runGenerateCommand(): Promise<void> {
	const workspaceFolder = requireWorkspaceFolder();
	if (!workspaceFolder) {
		return;
	}

	try {
		const lockfile = createLockfile();
		const lockfileUri = await writeLockfile(workspaceFolder, lockfile);
		const relativePath = vscode.workspace.asRelativePath(lockfileUri, false);
		await vscode.window.showInformationMessage(`Generated ${relativePath}`);
	} catch (error) {
		await vscode.window.showErrorMessage(`Failed to generate lockfile: ${getErrorMessage(error)}`);
	}
}

async function runValidateCommand(): Promise<void> {
	const workspaceFolder = requireWorkspaceFolder();
	if (!workspaceFolder) {
		return;
	}

	try {
		const snapshot = await getValidationSnapshot(workspaceFolder);
		await showValidationResult(snapshot);
	} catch (error) {
		await vscode.window.showErrorMessage(
			`Failed to validate lockfile at ${LOCKFILE_RELATIVE_PATH}: ${getErrorMessage(error)}`
		);
	}
}

async function runInstallMissingCommand(): Promise<void> {
	const workspaceFolder = requireWorkspaceFolder();
	if (!workspaceFolder) {
		return;
	}

	try {
		const initialSnapshot = await getValidationSnapshot(workspaceFolder);
		const missing = initialSnapshot.diff.missing;
		const failedInstalls: string[] = [];

		if (missing.length > 0) {
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'Extension Lockfile: Installing missing extensions',
					cancellable: false,
				},
				async (progress) => {
					for (let index = 0; index < missing.length; index += 1) {
						const extension = missing[index];
						progress.report({
							message: `${extension.id} (${index + 1}/${missing.length})`,
							increment: 100 / missing.length,
						});

						try {
							await vscode.commands.executeCommand(
								'workbench.extensions.installExtension',
								extension.id
							);
						} catch (error) {
							failedInstalls.push(`${extension.id}: ${getErrorMessage(error)}`);
						}
					}
				}
			);
		}

		const finalSnapshot = await getValidationSnapshot(workspaceFolder);
		const validationReport = renderValidationReport(
			finalSnapshot.diff,
			finalSnapshot.lockfile,
			finalSnapshot.installedCount
		);

		const installSummaryLines = [
			'Install Missing Summary',
			'',
			`Requested installs: ${missing.length}`,
			`Failed installs: ${failedInstalls.length}`,
			'Note: exact version installation is not guaranteed; latest available versions are installed.',
		];

		if (failedInstalls.length > 0) {
			installSummaryLines.push('', 'Install failures');
			installSummaryLines.push(...failedInstalls.map((line) => `  - ${line}`));
		}

		const combinedReport = `${installSummaryLines.join('\n')}\n\n${validationReport}`;
		await showReportDocument(combinedReport);
	} catch (error) {
		await vscode.window.showErrorMessage(
			`Failed to install missing extensions from ${LOCKFILE_RELATIVE_PATH}: ${getErrorMessage(error)}`
		);
	}
}

export function activate(context: vscode.ExtensionContext): void {
	const generateDisposable = vscode.commands.registerCommand(COMMANDS.generate, runGenerateCommand);
	const validateDisposable = vscode.commands.registerCommand(COMMANDS.validate, runValidateCommand);
	const installMissingDisposable = vscode.commands.registerCommand(
		COMMANDS.installMissing,
		runInstallMissingCommand
	);

	context.subscriptions.push(generateDisposable, validateDisposable, installMissingDisposable);
}

export function deactivate(): void {}
