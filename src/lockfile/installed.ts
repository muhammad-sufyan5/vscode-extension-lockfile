import * as vscode from 'vscode';
import { LockfileExtensionEntry } from './model';

interface ExtensionPackageJson {
	version?: string;
	isBuiltin?: boolean;
}

function normalizeExtensionId(id: string): string {
	return id.toLowerCase();
}

export function getInstalledExtensions(): LockfileExtensionEntry[] {
	return vscode.extensions.all
		.filter((extension) => {
			const packageJson = extension.packageJSON as ExtensionPackageJson;
			return packageJson.isBuiltin !== true;
		})
		.map((extension) => {
			const packageJson = extension.packageJSON as ExtensionPackageJson;
			return {
				id: normalizeExtensionId(extension.id),
				version: packageJson.version ?? '0.0.0',
				enabled: true,
			};
		})
		.sort((a, b) => a.id.localeCompare(b.id));
}
