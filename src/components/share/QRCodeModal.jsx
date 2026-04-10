import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';

export default function QRCodeModal({ open, onClose, title = 'Scan to open', url }) {
  const [copied, setCopied] = React.useState(false);

  if (!open) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Could not copy link.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500 mt-1">Scan with phone camera or QR scanner.</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <QRCodeSVG value={url} size={200} level="H" includeMargin quietZone={1} />
            </div>

            <div className="text-xs text-gray-600 break-all text-center px-2 py-1 bg-gray-50 rounded-lg w-full">
              {url}
            </div>

            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={handleCopy}
                type="button"
                className="flex-1 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Link
                  </>
                )}
              </Button>
              <Button onClick={onClose} type="button" className="flex-1">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}