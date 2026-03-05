export const LOCKFILE_SCHEMA_VERSION = 1;

export interface LockfileExtensionEntry {
	id: string;
	version: string;
	enabled: boolean;
}

export interface ExtensionLockfile {
	schemaVersion: number;
	generatedAt: string;
	vscodeVersion: string;
	extensions: LockfileExtensionEntry[];
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function isLockfileExtensionEntry(value: unknown): value is LockfileExtensionEntry {
	if (!isObject(value)) {
		return false;
	}

	return (
		typeof value.id === 'string'
		&& typeof value.version === 'string'
		&& typeof value.enabled === 'boolean'
	);
}

export function isExtensionLockfile(value: unknown): value is ExtensionLockfile {
	if (!isObject(value)) {
		return false;
	}

	const extensions = value.extensions;
	if (!Array.isArray(extensions)) {
		return false;
	}

	return (
		typeof value.schemaVersion === 'number'
		&& typeof value.generatedAt === 'string'
		&& typeof value.vscodeVersion === 'string'
		&& extensions.every(isLockfileExtensionEntry)
	);
}
