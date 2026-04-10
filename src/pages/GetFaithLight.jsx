import React, { useState } from 'react';
import { QrCode, Download, Copy, Share2, Check, Smartphone, Apple } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '../components/I18nProvider';
import ShareAppModal from '../components/share/ShareAppModal';

const APP_LINK = 'https://faithlight.app/get';

export default function GetFaithLight() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(APP_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = t('share.appText', 'FaithLight — Bible, devotionals, prayer, and daily verse. Download:') + ' ' + APP_LINK;
    if (navigator.share) {
      await navigator.share({ title: 'FaithLight', text, url: APP_LINK }).catch(() => {});
    } else {
      setShowShare(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%)' }}>
            <span className="text-4xl">📖</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FaithLight</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {t('get.subtitle', 'Bible, Audio Bible & Daily Devotion')}
          </p>
        </div>

        {/* QR Code */}
        <Card className="mb-6 border-indigo-100 shadow-md">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {t('get.scanQr', 'Scan the QR code')}
            </p>
            <div className="flex justify-center mb-4">
              {/* QR placeholder — replace with real QR to faithlight.app/get */}
              <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-indigo-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">faithlight.app/get</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {t('get.orChooseBelow', 'or choose your store below')}
            </p>
          </CardContent>
        </Card>

        {/* Store Buttons */}
        <div className="space-y-3 mb-6">
          <a
            href="https://apps.apple.com/app/faithlight"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-black text-white rounded-xl py-3.5 px-6 font-semibold text-sm hover:bg-gray-900 transition-colors"
          >
            <Apple className="w-5 h-5" />
            {t('get.appStore', 'Download on the App Store')}
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=app.faithlight"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-green-600 text-white rounded-xl py-3.5 px-6 font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            <Smartphone className="w-5 h-5" />
            {t('get.playStore', 'Get it on Google Play')}
          </a>
        </div>

        {/* Copy / Share */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? t('get.copied', 'Copied!') : t('get.copyLink', 'Copy Link')}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            {t('get.share', 'Share')}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t('get.free', 'Free to download • Available worldwide')}
        </p>
      </div>

      <ShareAppModal open={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
}