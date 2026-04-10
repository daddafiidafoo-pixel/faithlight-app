import React, { useState, useRef } from 'react';
import { Share2, Image as ImageIcon, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const VERSE_TEMPLATES = [
  { id: 'elegant', name: 'Elegant', bg: 'from-indigo-600 to-purple-700', text: 'white' },
  { id: 'sunrise', name: 'Sunrise', bg: 'from-orange-400 to-red-500', text: 'white' },
  { id: 'nature', name: 'Nature', bg: 'from-green-400 to-emerald-600', text: 'white' },
  { id: 'calm', name: 'Calm', bg: 'from-blue-300 to-cyan-400', text: 'white' },
];

export default function VerseShareBuilder({ userEmail, userName, uiLang, onShare }) {
  const [step, setStep] = useState('input'); // input, preview, posting
  const [verseData, setVerseData] = useState({
    reference: '',
    text: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('elegant');
  const [shareMessage, setShareMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const previewRef = useRef(null);

  const handlePostToCommunity = async () => {
    if (!verseData.reference || !verseData.text) {
      toast.error(t(uiLang, 'verse.selectVerseFirst') || 'Select a verse first');
      return;
    }

    setPosting(true);
    try {
      // Generate image from preview
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
      });
      const imageUrl = canvas.toDataURL('image/png');

      // Upload image
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: imageUrl,
      });

      // Post to Community Prayer Board
      await base44.entities.CommunityPrayerPost?.create?.({
        title: `Shared Verse: ${verseData.reference}`,
        content: verseData.text,
        authorEmail: userEmail,
        authorName: userName,
        category: 'inspiration',
        imageUrl: uploadResponse.file_url,
        prayedCount: 0,
        status: 'active',
      });

      toast.success(t(uiLang, 'verse.sharedToCommunity') || 'Verse shared to community');
      onShare?.();
      resetForm();
    } catch (err) {
      console.error('Failed to share verse:', err);
      toast.error(t(uiLang, 'verse.shareError') || 'Failed to share verse');
    } finally {
      setPosting(false);
    }
  };

  const resetForm = () => {
    setVerseData({ reference: '', text: '' });
    setShareMessage('');
    setStep('input');
  };

  if (step === 'input') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Share2 size={18} />
          {t(uiLang, 'verse.shareVerse') || 'Share a Verse'}
        </h3>

        <div className="space-y-3">
          <input
            type="text"
            placeholder={t(uiLang, 'verse.verseReference') || 'e.g., John 3:16'}
            value={verseData.reference}
            onChange={(e) => setVerseData(prev => ({ ...prev, reference: e.target.value }))}
            className="w-full px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm font-semibold"
          />

          <textarea
            placeholder={t(uiLang, 'verse.verseText') || 'Paste the verse text...'}
            value={verseData.text}
            onChange={(e) => setVerseData(prev => ({ ...prev, text: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm h-24"
          />

          <button
            onClick={() => setStep('preview')}
            disabled={!verseData.reference || !verseData.text}
            className="w-full min-h-[44px] bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(uiLang, 'verse.preview') || 'Preview & Share'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    const template = VERSE_TEMPLATES.find(t => t.id === selectedTemplate);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{t(uiLang, 'verse.shareVerse') || 'Share Verse'}</h3>
            <button onClick={() => setStep('input')} className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px]">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Preview */}
            <div
              ref={previewRef}
              className={`bg-gradient-to-br ${template.bg} rounded-2xl p-6 text-center text-${template.text} aspect-square flex flex-col items-center justify-center`}
            >
              <p className="text-sm font-bold mb-3 opacity-90">{verseData.reference}</p>
              <p className="text-lg leading-relaxed font-serif italic">{verseData.text}</p>
            </div>

            {/* Template Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                {t(uiLang, 'verse.template') || 'Template'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {VERSE_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      selectedTemplate === t.id
                        ? 'border-indigo-600 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={t.name}
                  >
                    <div className={`w-full h-full rounded-md bg-gradient-to-br ${t.bg}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <textarea
              placeholder={t(uiLang, 'verse.shareMessage') || 'Add a message (optional)...'}
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm h-16"
            />

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep('input')}
                className="flex-1 min-h-[44px] border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
              >
                {t(uiLang, 'common.back') || 'Back'}
              </button>
              <button
                onClick={handlePostToCommunity}
                disabled={posting}
                className="flex-1 min-h-[44px] bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                {posting ? t(uiLang, 'common.posting') || 'Posting...' : t(uiLang, 'verse.shareToBoard') || 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}