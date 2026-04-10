import React from 'react';
import { Download, CheckCircle2, Loader2, Trash2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioOfflineDownload } from './useAudioOfflineDownload';

/**
 * OfflineDownloadButton
 * 
 * Drop-in button for any audio chapter download.
 * 
 * Props:
 *   chapterId  - unique key e.g. "ENGKJVO1DA-JHN-3"
 *   audioUrl   - the audio file URL to cache
 *   label      - optional label (defaults to "Download")
 *   size       - button size (sm | default | lg)
 *   variant    - button variant
 *   iconOnly   - show only icon, no label
 */
export default function OfflineDownloadButton({
  chapterId,
  audioUrl,
  label,
  size = 'sm',
  variant = 'outline',
  iconOnly = false,
}) {
  const { isDownloaded, status, download, remove } = useAudioOfflineDownload(chapterId, audioUrl);

  if (!('serviceWorker' in navigator)) return null;

  if (status === 'downloading') {
    return (
      <Button size={size} variant={variant} disabled className="gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {!iconOnly && <span>Downloading…</span>}
      </Button>
    );
  }

  if (isDownloaded) {
    return (
      <Button
        size={size}
        variant={variant}
        onClick={remove}
        className="gap-1.5 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
        title="Downloaded — click to remove"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {!iconOnly && <span>{label || 'Downloaded'}</span>}
      </Button>
    );
  }

  if (status === 'error') {
    return (
      <Button size={size} variant={variant} onClick={download} className="gap-1.5 text-red-600 border-red-200">
        <WifiOff className="w-3.5 h-3.5" />
        {!iconOnly && <span>Retry</span>}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={download}
      disabled={!audioUrl}
      className="gap-1.5"
      title="Download for offline"
    >
      <Download className="w-3.5 h-3.5" />
      {!iconOnly && <span>{label || 'Download'}</span>}
    </Button>
  );
}