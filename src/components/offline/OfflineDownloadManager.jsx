import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function OfflineDownloadManager() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDownloads = async () => {
      try {
        const me = await base44.auth.me();
        if (!isMounted) return;
        setUser(me);

        const items = await base44.entities.OfflineDownload.filter({ user_email: me.email });
        if (isMounted) {
          setDownloads(items);
        }
      } catch (error) {
        console.error('Failed to load downloads:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDownloads();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (downloadId) => {
    try {
      await base44.entities.OfflineDownload.delete(downloadId);
      setDownloads(downloads.filter(d => d.id !== downloadId));
    } catch (error) {
      console.error('Failed to delete download:', error);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading downloads...</div>;

  const totalSize = downloads.reduce((sum, d) => sum + (d.file_size_mb || 0), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Offline Downloads</h2>
        <span className="text-sm text-slate-600">{totalSize.toFixed(1)} MB used</span>
      </div>

      {downloads.length === 0 ? (
        <div className="bg-slate-50 rounded-xl p-8 text-center">
          <Download className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No downloads yet. Download Bible books for offline reading.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((download) => (
            <div key={download.id} className="bg-white rounded-lg p-4 flex items-center justify-between border border-slate-200">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{download.book_name}</p>
                <p className="text-xs text-slate-500">
                  {download.chapters_downloaded.length} chapters • {download.file_size_mb || 0} MB
                </p>
              </div>
              <div className="flex items-center gap-3">
                {download.download_status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {download.download_status === 'failed' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <button
                  onClick={() => handleDelete(download.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}