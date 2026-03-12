export const LOCAL_PREFIX = "local:";

const DB_NAME = "iptv-local-files";
const STORE_NAME = "files";
const DB_VERSION = 1;
/** Old localStorage key prefix used before the IndexedDB migration */
const LS_PREFIX = "iptv-local:";

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function writeToDb(db: IDBDatabase, id: string, content: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).put(content, id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export function isLocalEntry(url: string): boolean {
	return url.startsWith(LOCAL_PREFIX);
}

/** Extract the storage ID (timestamp) from a local: URL */
export function getLocalId(url: string): string {
	// format: local:{id}:{filename}
	return url.split(":")[1];
}

/** Extract the display filename from a local: URL */
export function getLocalDisplayName(url: string): string {
	// everything after "local:{id}:"
	const idx = url.indexOf(":", LOCAL_PREFIX.length);
	return idx === -1 ? url : url.slice(idx + 1);
}

/** Persist M3U text to IndexedDB and return the pseudo-URL to store in the urls list */
export async function saveLocalFile(filename: string, content: string): Promise<string> {
	const id = String(Date.now());
	const db = await openDb();
	await writeToDb(db, id, content);
	db.close();
	return `${LOCAL_PREFIX}${id}:${filename}`;
}

/** Read M3U text from IndexedDB by pseudo-URL. Falls back to old localStorage and migrates automatically. */
export async function readLocalFile(url: string): Promise<string | null> {
	const id = getLocalId(url);
	const db = await openDb();

	const content = await new Promise<string | null>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const req = tx.objectStore(STORE_NAME).get(id);
		req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
		req.onerror = () => reject(req.error);
	});

	if (content !== null) {
		db.close();
		return content;
	}

	// Transparent migration from old localStorage format
	const oldContent = localStorage.getItem(LS_PREFIX + id);
	if (oldContent !== null) {
		await writeToDb(db, id, oldContent);
		localStorage.removeItem(LS_PREFIX + id);
		db.close();
		return oldContent;
	}

	db.close();
	return null;
}

/** Remove M3U text from IndexedDB */
export async function deleteLocalFile(url: string): Promise<void> {
	const id = getLocalId(url);
	// Also clean up any leftover localStorage entry
	localStorage.removeItem(LS_PREFIX + id);
	const db = await openDb();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
