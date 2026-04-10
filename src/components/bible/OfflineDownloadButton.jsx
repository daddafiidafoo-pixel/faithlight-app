/**
 * OfflineDownloadButton
 * Shows a download button only if offlineAllowed=true for the version.
 * Enforces the license gate on both UI and backend.
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Lock, CheckCircle, Loader2 } from 'lucide-react';

export default function OfflineDownloadButton({ versionMeta, bookId, chapter, className = '' }) {
  const [status, setStatus] = useState('idle'); // idle | downloading | done | error
  const [message, setMessage] = useState('');

  if (!versionMeta) return null;

  const { offlineAllowed, license, title, attribution } = versionMeta;

  // Gate A: UI — hide download if not allowed
  if (!offlineAllowed) {
    const reason = license === 'fcbh-streaming-only'
      ? 'Licensed for streaming only — offline download not permitted.'
      : license === 'copyrighted'
        ? 'Copyrighted version — offline download not available.'
        : 'Offline download is not available for this version.';
    return (
      <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
        <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span>{reason}</span>
      </div>
    );
  }

  async function handleDownload() {
    setStatus('downloading');
    setMessage('');
    try {
      const res = await base44.functions.invoke('bibleOfflineDownload', {
        versionId: versionMeta.id,
        bookId,
        chapter,
      });
      if (res?.data?.error) {
        setStatus('error');
        setMessage(res.data.error);
      } else {
        setStatus('done');
        setMessage(`${title} — chapter saved for offline reading.`);
      }
    } catch (e) {
      setStatus('error');
      setMessage('Download failed. Please try again.');
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {status === 'done' ? (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      ) : (
        <Button
          onClick={handleDownload}
          disabled={status === 'downloading'}
          variant="outline"
          size="sm"
          className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
        >
          {status === 'downloading'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />
          }
          {status === 'downloading' ? 'Saving…' : 'Save for Offline'}
        </Button>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-500">{message}</p>
      )}
      {status === 'idle' && attribution && (
        <p className="text-xs text-gray-400">{attribution}</p>
      )}
    </div>
  );
}