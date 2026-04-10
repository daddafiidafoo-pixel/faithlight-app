import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DB_NAME = 'faithlight_notes';
const STORE_NAME = 'notes';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveNoteOffline(note) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ ...note, offline_saved_at: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeNoteOffline(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllOfflineNotes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function checkExistsOffline(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
}

export default function NoteOfflineSave({ note, size = 'sm' }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!note?.id) return;
    checkExistsOffline(note.id)
      .then(exists => { setIsSaved(exists); setChecked(true); })
      .catch(() => setChecked(true));
  }, [note?.id]);

  const handleSave = async () => {
    if (!note) return;
    setLoading(true);
    try {
      await saveNoteOffline(note);
      setIsSaved(true);
      toast.success('Note saved offline!');
    } catch (e) {
      toast.error('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!note?.id) return;
    setLoading(true);
    try {
      await removeNoteOffline(note.id);
      setIsSaved(false);
      toast.success('Removed from offline');
    } catch (e) {
      toast.error('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  if (isSaved) {
    return (
      <Button
        size={size}
        variant="outline"
        onClick={handleRemove}
        disabled={loading}
        className="gap-1.5 text-green-700 border-green-300 bg-green-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        Offline
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={handleSave}
      disabled={loading}
      className="gap-1.5 text-gray-600 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <WifiOff className="w-3.5 h-3.5" />}
      Save Offline
    </Button>
  );
}