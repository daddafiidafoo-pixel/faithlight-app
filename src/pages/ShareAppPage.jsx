import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../components/I18nProvider';
import { ChevronLeft, Copy, Share2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShareAppPage() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const [errorText, setErrorText] = useState('');

  const appLink = 'https://faithlight.app/get';

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  const SHARE_TEXTS = {
    en: {
      title: 'Share FaithLight',
      subtitle: 'Invite others to download and use FaithLight.',
      scanTitle: 'Scan to get FaithLight',
      scanDescription: 'Scan this QR code or use the link below to open the FaithLight download page.',
      copyLink: 'Copy Link',
      shareNow: 'Share Now',
      copied: 'Link copied to clipboard!',
      message: 'Download FaithLight — Bible, prayer, devotionals, and Christian resources in one app:',
      copyFailed: 'Could not copy the link. Please try again.',
      shareFailed: 'Could not share the app. Please try again.',
    },
    om: {
      title: 'FaithLight Qoodi',
      subtitle: 'Namoota biroos FaithLight akka buufatanii fi fayyadaman affeeri.',
      scanTitle: 'FaithLight argachuuf scan godhi',
      scanDescription: 'QR kana scan godhi yookaan linkii armaan gadii fayyadamuun fuula buufataa FaithLight bani.',
      copyLink: 'Linkii Koppii Godhi',
      shareNow: 'Amma Qoodi',
      copied: 'Linkiin clipboard gara koppii ta\'eera!',
      message: 'FaithLight buufadhu — Macaaba Qulqulluu, kadhannaa, devotionals fi qabeenya kiristaanaa app tokko keessatti:',
      copyFailed: 'Linkii koppii gochuu hin dandeenye. Itti deebi\'i foon.',
      shareFailed: 'App kana qooduu hin dandeenye. Itti deebi\'i foon.',
    },
  };

  const t = SHARE_TEXTS[lang] || SHARE_TEXTS.en;

  async function handleCopy() {
    try {
      setErrorText('');
      await navigator.clipboard.writeText(appLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setErrorText(t.copyFailed);
    }
  }

  async function handleShare() {
    try {
      setErrorText('');

      const text = `${t.message} ${appLink}`;

      if (navigator.share) {
        await navigator.share({
          title: 'FaithLight',
          text,
          url: appLink,
        });
      } else {
        await navigator.clipboard.writeText(appLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
      // Ignore user cancellation
      if (err.name !== 'AbortError') {
        setErrorText(t.shareFailed);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm py-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>
        </motion.div>

        {/* Share Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            borderRadius: 16,
            border: '1px solid #F3F4F6',
            padding: 28,
            background: 'white',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}
        >
          {/* QR Placeholder */}
          <div
            style={{
              width: 200,
              height: 200,
              border: '2px solid #111827',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(45deg, #111827 25%, transparent 25%), linear-gradient(-45deg, #111827 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111827 75%), linear-gradient(-45deg, transparent 75%, #111827 75%)',
              backgroundSize: '28px 28px',
              backgroundPosition: '0 0, 0 14px, 14px -14px, -14px 0px',
              margin: '0 auto 24px',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <div style={{ background: '#111827', padding: '8px 12px', borderRadius: 8 }}>
              QR Code
            </div>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>
            {t.scanTitle}
          </h3>

          <p style={{ color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px', fontSize: 14 }}>
            {t.scanDescription}
          </p>

          {/* Link Display */}
          <div
            style={{
              margin: '20px 0',
              padding: 14,
              borderRadius: 10,
              background: '#F3F4F6',
              wordBreak: 'break-all',
              fontSize: 13,
              color: '#374151',
              fontFamily: 'monospace',
            }}
          >
            {appLink}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '12px 18px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                background: 'white',
                color: '#374151',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 200ms',
              }}
              className="hover:bg-gray-50 hover:border-gray-300"
            >
              <Copy className="w-4 h-4" />
              {copied ? '✓ Copied' : t.copyLink}
            </button>

            <button
              onClick={handleShare}
              style={{
                padding: '12px 18px',
                borderRadius: 10,
                border: 'none',
                background: '#6C5CE7',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 200ms',
              }}
              className="hover:bg-indigo-700"
            >
              <Share2 className="w-4 h-4" />
              {t.shareNow}
            </button>
          </div>

          {/* Success/Error Messages */}
          {copied && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 8,
                background: '#ECFDF5',
                color: '#047857',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              ✓ {t.copied}
            </motion.div>
          )}

          {errorText && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 mt-4 text-red-700"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errorText}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}