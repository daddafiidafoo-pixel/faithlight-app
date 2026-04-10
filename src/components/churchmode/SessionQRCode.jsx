import React, { useEffect, useState } from 'react';
import { QrCode, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SessionQRCode({ code, sessionId, title }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate QR code using QR Server API (simple, no library needed)
    const joinUrl = `${window.location.origin}/#/ChurchJoinPage?code=${code}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`;
    setQrUrl(qrCodeUrl);
  }, [code]);

  const handleCopyCode = () => {
    const joinUrl = `${window.location.origin}/#/ChurchJoinPage?code=${code}`;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `church-session-${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-indigo-300" />
        <p className="text-sm font-semibold text-indigo-100">Quick Join with QR Code</p>
      </div>

      {/* QR Code */}
      {qrUrl && (
        <div className="flex justify-center">
          <img
            src={qrUrl}
            alt="Session QR Code"
            className="w-48 h-48 bg-white p-2 rounded-lg"
          />
        </div>
      )}

      {/* Join link display */}
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <p className="text-xs text-indigo-300 mb-2">Or share this link:</p>
        <p className="text-xs text-white break-all font-mono">
          {window.location.origin}/#/ChurchJoinPage?code={code}
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopyCode}
          className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2.5 text-white text-sm font-semibold transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>
        <button
          onClick={handleDownloadQR}
          className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2.5 text-white text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      <p className="text-xs text-indigo-300 text-center mt-3">
        Members can scan this QR code to instantly join your session
      </p>
    </div>
  );
}