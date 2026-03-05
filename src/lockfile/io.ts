import * as vscode from 'vscode';
import { ExtensionLockfile, isExtensionLockfile } from './model';

export const LOCKFILE_RELATIVE_PATH = '.vscode/extensions.lock.json';

export function getLockfileUri(workspaceFolder: vscode.WorkspaceFolder): vscode.Uri {
	return vscode.Uri.joinPath(workspaceFolder.uri, '.vscode', 'extensions.lock.json');
}

export async function writeLockfile(
	workspaceFolder: vscode.WorkspaceFolder,
	lockfile: ExtensionLockfile
): Promise<vscode.Uri> {
	const vscodeDirUri = vscode.Uri.joinPath(workspaceFolder.uri, '.vscode');
	await vscode.workspace.fs.createDirectory(vscodeDirUri);

	const lockfileUri = getLockfileUri(workspaceFolder);
	const sortedLockfile: ExtensionLockfile = {
		...lockfile,
		extensions: [...lockfile.extensions].sort((a, b) => a.id.localeCompare(b.id)),
	};

	const serialized = JSON.stringify(sortedLockfile, null, 2);
	await vscode.workspace.fs.writeFile(lockfileUri, Buffer.from(`${serialized}\n`, 'utf8'));
	return lockfileUri;
}

export async function readLockfile(workspaceFolder: vscode.WorkspaceFolder): Promise<ExtensionLockfile> {
	const lockfileUri = getLockfileUri(workspaceFolder);
	const raw = await vscode.workspace.fs.readFile(lockfileUri);
	const parsed = JSON.parse(Buffer.from(raw).toString('utf8')) as unknown;

	if (!isExtensionLockfile(parsed)) {
		throw new Error('Invalid lockfile format.');
	}

	return parsed;
}
