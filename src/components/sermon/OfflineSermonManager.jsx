import React, { useState, useEffect } from 'react';
import { Download, Trash2, FileDown, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  saveSermonOffline,
  getOfflineSermons,
  deleteOfflineSermon,
  exportSermonAsJSON,
  exportSermonAsPDF,
  getOfflineStorageInfo,
} from '@/lib/sermonOfflineStorage';

export default function OfflineSermonManager({ sermon, title, isDarkMode }) {
  const [offlineSermons, setOfflineSermons] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(null);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';

  // Load offline sermons on mount
  useEffect(() => {
    loadOfflineSermons();
  }, []);

  const loadOfflineSermons = async () => {
    try {
      const sermons = await getOfflineSermons();
      const info = await getOfflineStorageInfo();
      setOfflineSermons(sermons);
      setStorageInfo(info);
    } catch (error) {
      console.error('[OfflineSermonManager] Load failed:', error);
    }
  };

  const handleDownload = async () => {
    if (!sermon || !title) {
      toast.error('No sermon content to download');
      return;
    }

    setLoading(true);
    try {
      await saveSermonOffline({
        title,
        content: sermon,
        theme: title,
        savedAt: new Date().toISOString(),
      });

      await loadOfflineSermons();
      toast.success('Sermon saved for offline access');
    } catch (error) {
      console.error('[OfflineSermonManager] Download failed:', error);
      toast.error('Failed to save sermon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOfflineSermon(id);
      await loadOfflineSermons();
      toast.success('Sermon deleted');
    } catch (error) {
      console.error('[OfflineSermonManager] Delete failed:', error);
      toast.error('Failed to delete sermon');
    }
  };

  const handleExportJSON = (sermonData) => {
    try {
      exportSermonAsJSON(sermonData);
      toast.success('Exported as JSON');
    } catch (error) {
      console.error('[OfflineSermonManager] Export JSON failed:', error);
      toast.error('Failed to export');
    }
  };

  const handleExportPDF = async (sermonData) => {
    try {
      await exportSermonAsPDF(sermonData.content, sermonData.title);
      toast.success('Exported as PDF');
    } catch (error) {
      console.error('[OfflineSermonManager] Export PDF failed:', error);
      toast.error('Failed to export as PDF');
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4" style={{ backgroundColor: cardColor, borderColor }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download size={18} style={{ color: '#6C5CE7' }} />
          <h3 className="font-semibold" style={{ color: textColor }}>Offline Access</h3>
        </div>
        {storageInfo && (
          <span className="text-xs" style={{ color: mutedColor }}>
            {storageInfo.count} sermon{storageInfo.count !== 1 ? 's' : ''} ({storageInfo.sizeMB} MB)
          </span>
        )}
      </div>

      {/* Download current sermon */}
      {sermon && (
        <Button
          onClick={handleDownload}
          disabled={loading}
          className="w-full gap-2"
          style={{ backgroundColor: '#6C5CE7', color: '#FFFFFF' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Download size={16} />
              Save Sermon for Offline
            </>
          )}
        </Button>
      )}

      {/* List offline sermons */}
      {offlineSermons.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold" style={{ color: textColor }}>
            Saved Sermons
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {offlineSermons.map((saved) => (
              <div
                key={saved.id}
                className="p-3 rounded-lg border flex items-start justify-between"
                style={{ backgroundColor: bgColor, borderColor }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: textColor }}>
                    {saved.title}
                  </p>
                  <p className="text-xs" style={{ color: mutedColor }}>
                    {new Date(saved.savedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="relative ml-2">
                  <button
                    onClick={() => setShowMenu(showMenu === saved.id ? null : saved.id)}
                    className="p-1 hover:opacity-70 transition-opacity"
                    title="More options"
                  >
                    <MoreVertical size={16} style={{ color: mutedColor }} />
                  </button>

                  {showMenu === saved.id && (
                    <div
                      className="absolute right-0 mt-1 w-40 rounded-lg shadow-lg border z-10"
                      style={{ backgroundColor: cardColor, borderColor }}
                    >
                      <button
                        onClick={() => {
                          handleExportJSON(saved);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:opacity-70 flex items-center gap-2"
                        style={{ color: textColor }}
                      >
                        <FileDown size={14} />
                        Export JSON
                      </button>
                      <button
                        onClick={() => {
                          handleExportPDF(saved);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:opacity-70 flex items-center gap-2 border-t"
                        style={{ color: textColor, borderColor }}
                      >
                        <FileDown size={14} />
                        Export PDF
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(saved.id);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:opacity-70 flex items-center gap-2 border-t"
                        style={{ borderColor }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {offlineSermons.length === 0 && !sermon && (
        <p className="text-sm text-center" style={{ color: mutedColor }}>
          No offline sermons yet. Generate and save sermons to access them offline.
        </p>
      )}
    </div>
  );
}