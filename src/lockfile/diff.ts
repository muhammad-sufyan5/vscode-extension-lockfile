import { ExtensionLockfile, LockfileExtensionEntry } from './model';

export interface VersionMismatch {
	id: string;
	expectedVersion: string;
	actualVersion: string;
}

export interface LockfileDiff {
	missing: LockfileExtensionEntry[];
	mismatched: VersionMismatch[];
	extra: LockfileExtensionEntry[];
}

function normalizeId(id: string): string {
	return id.toLowerCase();
}

export function diffExtensions(
	lockfile: ExtensionLockfile,
	installedExtensions: LockfileExtensionEntry[]
): LockfileDiff {
	const expectedById = new Map(
		lockfile.extensions.map((extension) => [normalizeId(extension.id), extension])
	);
	const installedById = new Map(
		installedExtensions.map((extension) => [normalizeId(extension.id), extension])
	);

	const missing: LockfileExtensionEntry[] = [];
	const mismatched: VersionMismatch[] = [];
	const extra: LockfileExtensionEntry[] = [];

	for (const [id, expected] of expectedById.entries()) {
		const actual = installedById.get(id);
		if (!actual) {
			missing.push(expected);
			continue;
		}

		if (actual.version !== expected.version) {
			mismatched.push({
				id: expected.id,
				expectedVersion: expected.version,
				actualVersion: actual.version,
			});
		}
	}

	for (const [id, actual] of installedById.entries()) {
		if (!expectedById.has(id)) {
			extra.push(actual);
		}
	}

	missing.sort((a, b) => a.id.localeCompare(b.id));
	mismatched.sort((a, b) => a.id.localeCompare(b.id));
	extra.sort((a, b) => a.id.localeCompare(b.id));

	return { missing, mismatched, extra };
}

export function hasDifferences(diff: LockfileDiff): boolean {
	return diff.missing.length > 0 || diff.mismatched.length > 0 || diff.extra.length > 0;
}
