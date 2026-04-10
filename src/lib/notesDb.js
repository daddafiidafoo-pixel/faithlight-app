// IndexedDB for Bible verse/chapter notes
const DB_NAME = 'FaithLightNotes';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('reference', 'reference', { unique: false });
        store.createIndex('userEmail', 'userEmail', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

export async function saveNote(userEmail, reference, content, chapterOrVerse = 'verse') {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const note = {
      id: `${userEmail}:${reference}:${Date.now()}`,
      userEmail,
      reference,
      content,
      chapterOrVerse,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const request = store.add(note);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(note);
  });
}

export async function updateNote(noteId, content) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(noteId);
    request.onsuccess = () => {
      const note = request.result;
      if (note) {
        note.content = content;
        note.updatedAt = Date.now();
        const updateRequest = store.put(note);
        updateRequest.onsuccess = () => resolve(note);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Note not found'));
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteNote(noteId) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(noteId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getNotesByReference(userEmail, reference) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('reference');
    const request = index.getAll(reference);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result.filter(n => n.userEmail === userEmail).sort((a, b) => b.createdAt - a.createdAt));
    };
  });
}

export async function getNotesByUser(userEmail) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userEmail');
    const request = index.getAll(userEmail);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => b.createdAt - a.createdAt));
    };
  });
}