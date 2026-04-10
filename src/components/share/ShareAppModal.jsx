import React, { useState } from 'react';
import { Copy, Share2, Check, X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';

const APP_LINK = 'https://faithlight.app/get';

export default function ShareAppModal({ open, onClose }) {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const shareText = lang === 'om'
    ? `FaithLight — Macaafa Qulqulluu, kadhannaa, barumsa amantii fi kutaa guyyaa. Buufadhu: ${APP_LINK}`
    : `FaithLight app — Bible, devotionals, prayer, and daily verse. Download: ${APP_LINK}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(APP_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'FaithLight', text: shareText, url: APP_LINK }).catch(() => {});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">
            {lang === 'om' ? 'FaithLight Qoodi' : t('share.modalTitle', 'Share FaithLight')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            {lang === 'om'
              ? 'Hiriyoota keetiif FaithLight akka buufatan qoodi.'
              : t('share.modalDesc', 'Invite friends to download FaithLight.')}
          </p>

          {/* Share text preview */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">{shareText}</p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            {navigator.share && (
              <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleNativeShare}>
                <Share2 className="w-4 h-4" />
                {t('share.shareLink', 'Share Link')}
              </Button>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? t('get.copied', 'Copied!') : t('share.copyLink', 'Copy Link')}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400">{APP_LINK}</p>
        </div>
      </div>
    </div>
  );
}