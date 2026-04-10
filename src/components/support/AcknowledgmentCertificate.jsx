import React, { useRef } from 'react';
import { Download, Share2, BookOpen, Award } from 'lucide-react';
import { useI18n } from '../I18nProvider';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export default function AcknowledgmentCertificate({ donation, onClose }) {
  const { t } = useI18n();
  const certRef = useRef(null);

  const {
    donor_name,
    amount,
    support_type,
    created_date,
    certificate_id,
  } = donation;

  const typeLabel =
    support_type === 'monthly' ? t('support.monthly', 'Monthly') :
    support_type === 'yearly' ? t('support.yearly', 'Yearly') :
    t('support.custom', 'One-Time');

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `FaithLight-Certificate-${certificate_id || Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleShare = async () => {
    const text = `I'm supporting FaithLight's mission! Certificate ID: ${certificate_id}. Join me at faithlight.app`;
    if (navigator.share) {
      await navigator.share({ title: 'FaithLight Certificate of Appreciation', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Certificate details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Certificate */}
      <div
        ref={certRef}
        className="relative rounded-2xl overflow-hidden border-4 border-indigo-200 dark:border-indigo-700"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)' }}
      >
        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-yellow-400 rounded-br-lg" />

        <div className="px-8 py-10 text-center text-white">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
          <p className="text-yellow-300 font-bold text-sm tracking-[0.25em] uppercase mb-1">FaithLight</p>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="h-px w-12 bg-yellow-400/60" />
            <Award className="w-5 h-5 text-yellow-400" />
            <div className="h-px w-12 bg-yellow-400/60" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-1 tracking-wide">
            {t('support.certTitle', 'Certificate of Appreciation')}
          </h2>
          <div className="h-px w-24 bg-yellow-400/40 mx-auto mb-6" />

          {/* Donor */}
          <p className="text-white/70 text-sm mb-1">{t('support.certPresented', 'Presented to')}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-6">{donor_name}</p>

          {/* Details */}
          <div className="bg-white/10 rounded-xl px-6 py-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">{t('support.certType', 'Support Type')}</span>
              <span className="font-semibold text-yellow-300">{typeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">{t('support.certAmount', 'Amount')}</span>
              <span className="font-semibold text-yellow-300">
                ${amount}{support_type === 'monthly' ? '/mo' : support_type === 'yearly' ? '/yr' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">{t('support.certDate', 'Date')}</span>
              <span className="font-semibold text-white">{formatDate(created_date || new Date())}</span>
            </div>
          </div>

          {/* Thank-you message */}
          <p className="text-white/80 text-sm leading-relaxed mb-6 italic">
            "{t('support.certMessage', "Thank you for supporting FaithLight and helping us bring God's Word to more people around the world.")}"
          </p>

          {/* Signature line */}
          <div className="border-t border-white/20 pt-4">
            <p className="text-yellow-300 font-bold text-sm">— {t('support.certSignature', 'The FaithLight Team')}</p>
            {certificate_id && (
              <p className="text-white/40 text-xs mt-1">ID: {certificate_id}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('support.download', 'Download')}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {t('support.share', 'Share')}
        </button>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 transition-colors"
        >
          {t('support.close', 'Close')}
        </button>
      )}
    </div>
  );
}