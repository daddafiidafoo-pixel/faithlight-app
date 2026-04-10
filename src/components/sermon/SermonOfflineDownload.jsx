import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Trash2, WifiOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DB_NAME = 'faithlight_sermons';
const STORE_NAME = 'outlines';
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

async function saveToIndexedDB(sermon) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ ...sermon, offline_saved_at: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function removeFromIndexedDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function checkExistsInIndexedDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllOfflineSermons() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.debug('IndexedDB offline sermons unavailable:', e.message);
    return [];
  }
}

export default function SermonOfflineDownload({ sermon, onStatusChange }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!sermon?.id) return;
    checkExistsInIndexedDB(sermon.id)
      .then(exists => { setIsSaved(exists); setChecked(true); })
      .catch(() => setChecked(true));
  }, [sermon?.id]);

  const handleSave = async () => {
    if (!sermon) return;
    setLoading(true);
    try {
      await saveToIndexedDB(sermon);
      setIsSaved(true);
      toast.success('Saved for offline use!');
      onStatusChange?.(true);
    } catch (e) {
      toast.error('Failed to save offline: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!sermon?.id) return;
    setLoading(true);
    try {
      await removeFromIndexedDB(sermon.id);
      setIsSaved(false);
      toast.success('Removed from offline library');
      onStatusChange?.(false);
    } catch (e) {
      toast.error('Failed to remove: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  if (isSaved) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRemove}
        disabled={loading}
        className="gap-2 text-green-700 border-green-300 bg-green-50 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Saved Offline
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      disabled={loading}
      className="gap-2 text-gray-700 border-gray-300 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WifiOff className="w-4 h-4" />}
      Save Offline
    </Button>
  );
}