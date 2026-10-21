// Work-sample files attached to local submissions, kept in this browser's IndexedDB.
// (There is no server storage yet; files never leave the device.)
export type WorkSample = {
  name: string;
  type: string;
  size: number;
  blob: Blob;
};

const DB = "echopath-files";
const STORE = "samples";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined")
      return reject(new Error("File storage is unavailable in this browser."));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () =>
      reject(req.error ?? new Error("Could not open file storage."));
  });
}

export async function saveSample(id: string, file: File) {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(
      {
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
      } satisfies WorkSample,
      id,
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not save the file."));
  });
  db.close();
}

export async function loadSample(id: string): Promise<WorkSample | null> {
  try {
    const db = await open();
    const value = await new Promise<WorkSample | undefined>(
      (resolve, reject) => {
        const req = db.transaction(STORE).objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result as WorkSample | undefined);
        req.onerror = () => reject(req.error);
      },
    );
    db.close();
    return value ?? null;
  } catch {
    return null;
  }
}

export const formatBytes = (n: number) =>
  n < 1024 * 1024
    ? `${Math.max(1, Math.round(n / 1024))} KB`
    : `${(n / 1024 / 1024).toFixed(1)} MB`;
