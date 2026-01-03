
import { GenerationResult } from "../types/generation";

const DB_NAME = 'BenLab_Vault_v1';
const STORE_NAME = 'generated_images';
const DB_VERSION = 3; // Bumped version for Unified Asset Management schema

// Cached database connection for reuse
let cachedDB: IDBDatabase | null = null;

/**
 * Gets the cached database connection or creates a new one.
 * Handles connection lifecycle and automatic reconnection if closed.
 */
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Return cached connection if valid
    if (cachedDB) {
      try {
        // Test if connection is still open by checking objectStoreNames
        cachedDB.objectStoreNames;
        resolve(cachedDB);
        return;
      } catch {
        // Connection was closed, clear cache and reconnect
        cachedDB = null;
      }
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      reject(new Error(`Vault Access Denied: ${error?.message || 'Unknown error'}`));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Handle unexpected connection close
      db.onclose = () => {
        cachedDB = null;
      };

      db.onerror = (event) => {
        console.error("IndexedDB error:", (event.target as IDBRequest).error);
      };

      cachedDB = db;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('source', 'source', { unique: false });
        objectStore.createIndex('uploadType', 'uploadType', { unique: false });
      } else {
        // Upgrade existing store
        const store = (event.target as IDBOpenDBRequest).transaction?.objectStore(STORE_NAME);
        if (store) {
            if (!store.indexNames.contains('source')) {
                store.createIndex('source', 'source', { unique: false });
            }
            if (!store.indexNames.contains('uploadType')) {
                store.createIndex('uploadType', 'uploadType', { unique: false });
            }
        }
      }
    };
  });
};

/**
 * Initializes the IndexedDB connection.
 * @deprecated Use getDB() internally. Kept for backwards compatibility.
 */
export const initDB = (): Promise<IDBDatabase> => getDB();

/**
 * Saves a generated image (or upload) to the vault.
 * @throws Error if the database operation fails
 */
export const saveImage = async (image: GenerationResult): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // Ensure we are saving a valid object
  const record = { ...image };

  // Data normalization
  if (!record.base64 && record.url.startsWith('data:')) {
      record.base64 = record.url.split(',')[1];
  }

  // Default fields for Unified Asset Management
  if (!record.prompt) record.prompt = "Unknown Asset";
  if (!record.source) record.source = 'generated'; // Default fallback

  store.put(record);

  return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(`Vault Write Error: ${tx.error?.message || 'Unknown error'}`));
  });
};

/**
 * Retrieves history, sorted by newest first.
 * @throws Error if the database operation fails
 */
export const getHistory = async (limit: number = 100): Promise<GenerationResult[]> => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('timestamp');

  return new Promise((resolve, reject) => {
    const results: GenerationResult[] = [];
    // Open cursor in direction 'prev' (descending)
    const request = index.openCursor(null, 'prev');

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(new Error(`Vault Read Error: ${request.error?.message || 'Unknown error'}`));
    tx.onerror = () => reject(new Error(`Vault Transaction Error: ${tx.error?.message || 'Unknown error'}`));
  });
};

/**
 * Deletes an image from the vault.
 * @throws Error if the database operation fails
 */
export const deleteImage = async (id: string): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);

  return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(`Vault Delete Error: ${tx.error?.message || 'Unknown error'}`));
  });
};

/**
 * Wipes the entire history.
 * @throws Error if the database operation fails
 */
export const clearHistory = async (): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();

  return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(`Vault Clear Error: ${tx.error?.message || 'Unknown error'}`));
  });
};
