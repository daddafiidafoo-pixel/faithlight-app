import React from 'react';
import { AlertCircle, Download, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAvailabilityMessage } from '../lib/providerRouter';

/**
 * Friendly UI component showing Kiswahili Bible availability
 */
export default function KiswahiliBibleNote({ versionId = 'sw_primary', onDownload }) {
  const textMsg = getAvailabilityMessage(versionId, 'text');
  const audioMsg = getAvailabilityMessage(versionId, 'audio');

  if (!textMsg && !audioMsg) {
    return null; // Both available, no message needed
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          {textMsg && (
            <div>
              <p className="text-sm font-semibold text-amber-900">📖 {textMsg}</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Unabeza kubofya "Pakua" ili kukariri sura bila mtandao.
              </p>
            </div>
          )}
          
          {audioMsg && (
            <div>
              <p className="text-sm font-semibold text-amber-900">🎧 {audioMsg}</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Kwa sasa, tumia sauti ya kifaa au soma offline.
              </p>
            </div>
          )}

          {(textMsg || audioMsg) && onDownload && (
            <Button
              onClick={onDownload}
              size="sm"
              variant="outline"
              className="gap-2 mt-2"
            >
              <Download className="w-3 h-3" />
              Download Offline
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}