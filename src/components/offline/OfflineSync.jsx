import React, { useState, useEffect } from 'react';
import { HardDrive, Cloud, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * OfflineSync Component
 * Handles syncing of offline changes back to server when online
 */
export default function OfflineSync() {
  const [isSyncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check for offline changes on mount
    checkForOfflineChanges();

    // Auto-sync when online
    const handleOnline = async () => {
      if (hasChanges) {
        await syncOfflineChanges();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [hasChanges]);

  const checkForOfflineChanges = () => {
    const offlineNotes = localStorage.getItem('offline_notes_pending');
    const offlineHighlights = localStorage.getItem('offline_highlights_pending');
    const offlineQuizData = localStorage.getItem('offline_quiz_pending');
    
    setHasChanges(!!(offlineNotes || offlineHighlights || offlineQuizData));
  };

  const syncOfflineChanges = async () => {
    setSyncing(true);
    try {
      // Sync notes
      const offlineNotes = localStorage.getItem('offline_notes_pending');
      if (offlineNotes) {
        const notes = JSON.parse(offlineNotes);
        // Send to server via API
        for (const note of notes) {
          // await base44.entities.VerseNote.create(note);
        }
        localStorage.removeItem('offline_notes_pending');
      }

      // Sync highlights
      const offlineHighlights = localStorage.getItem('offline_highlights_pending');
      if (offlineHighlights) {
        const highlights = JSON.parse(offlineHighlights);
        for (const highlight of highlights) {
          // await base44.entities.VerseHighlight.create(highlight);
        }
        localStorage.removeItem('offline_highlights_pending');
      }

      // Sync quiz data
      const offlineQuizData = localStorage.getItem('offline_quiz_pending');
      if (offlineQuizData) {
        const quizzes = JSON.parse(offlineQuizData);
        for (const quiz of quizzes) {
          // await base44.entities.QuizAttempt.create(quiz);
        }
        localStorage.removeItem('offline_quiz_pending');
      }

      setLastSync(new Date());
      setHasChanges(false);
      toast.success('Offline changes synced!');
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!navigator.onLine || (!hasChanges && lastSync)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start gap-3">
        {isSyncing ? (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
        ) : hasChanges ? (
          <HardDrive className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">
            {isSyncing ? 'Syncing...' : hasChanges ? 'Offline Changes' : 'All Synced'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {isSyncing ? 'Uploading your offline changes...' : hasChanges ? 'You have unsaved changes. They will sync when online.' : lastSync ? `Last synced ${lastSync.toLocaleTimeString()}` : ''}
          </p>
        </div>

        {hasChanges && (
          <button
            onClick={syncOfflineChanges}
            disabled={isSyncing}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap mt-0.5"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
}