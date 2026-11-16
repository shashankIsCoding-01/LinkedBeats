const STORAGE_KEY = 'linkedbeats-playlist-v1';
const DELETED_KEY = 'linkedbeats-deleted-v1';
const DB_NAME = 'linkedbeats-audio-db';
const STORE_NAME = 'audio-files';

export function serializePlaylist(list) {
  return list.traverseForward().map((node) => ({
    id: node.id,
    title: node.title,
    artist: node.artist,
    duration: Number(node.duration) || 0,
    audioUrl: node.audioFileId ? '' : node.audioUrl || '',
    audioFileId: node.audioFileId || null,
  }));
}

export function savePlaylist(list) {
  if (!globalThis.localStorage) {
    return;
  }

  const songs = serializePlaylist(list);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

export function loadPlaylist() {
  if (!globalThis.localStorage) {
    return [];
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to load saved playlist', error);
    return [];
  }
}

export function clearSavedPlaylist() {
  if (!globalThis.localStorage) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function saveRecentlyDeleted(records) {
  if (!globalThis.localStorage) {
    return;
  }

  localStorage.setItem(DELETED_KEY, JSON.stringify(records));
}

export function loadRecentlyDeleted() {
  if (!globalThis.localStorage) {
    return [];
  }

  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to load deleted records', error);
    return [];
  }
}

export function openAudioDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('IndexedDB is unavailable in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open IndexedDB.'));
  });
}

export async function saveAudioBlob(songId, blob) {
  try {
    const db = await openAudioDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.put({ id: songId, blob });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error('Could not store audio file.'));
    });
    return true;
  } catch (error) {
    console.warn('Audio persistence failed:', error);
    return false;
  }
}

export async function loadAudioBlob(songId) {
  try {
    const db = await openAudioDatabase();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const result = await new Promise((resolve, reject) => {
      const request = store.get(songId);
      request.onsuccess = () => resolve(request.result ? request.result.blob : null);
      request.onerror = () => reject(request.error || new Error('Could not load audio file.'));
    });
    return result;
  } catch (error) {
    console.warn('Audio recovery failed:', error);
    return null;
  }
}

export async function deleteAudioBlob(songId) {
  try {
    const db = await openAudioDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const request = store.delete(songId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error('Could not delete audio file.'));
    });
    return true;
  } catch (error) {
    console.warn('Audio deletion failed:', error);
    return false;
  }
}
