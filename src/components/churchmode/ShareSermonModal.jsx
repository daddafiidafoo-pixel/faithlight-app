import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Share2, Copy, Check, X, Loader2, ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function ShareSermonModal({ session, onClose, onConfirmEnd }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  const title = session?.title || 'Today\'s Sermon';
  const churchName = session?.churchName || 'Our Church';
  const verseRefs = session?.verseRefs || [];
  const code = session?.code;

  const appUrl = window.location.origin;

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createSermonShare', {
        sessionId: session.id || session.sessionId,
        title,
        churchName,
        verseRefs,
        notesSummary: session.notesSummary || '',
        outlineJson: session.outlineJson || {},
        isPublic
      });

      if (res?.data?.shareUrl) {
        setShareUrl(res.data.shareUrl);
      }
    } catch (error) {
      console.error('Share creation error:', error);
      alert('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const shareMessage = `🙏 *${churchName}* shared today's sermon: "${title}"\n\n${verseRefs.length > 0 ? `📖 Verses: ${verseRefs.join(', ')}\n\n` : ''}Learn more: ${shareUrl || 'creating link...'}`;

  const handleWhatsApp = () => {
    if (!shareUrl) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (!shareUrl) return;
    if (navigator.share) {
      navigator.share({ title: `${churchName} - ${title}`, text: shareMessage }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }} className="px-6 pt-8 pb-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">📢</span>
          </div>
          <h2 className="text-xl font-bold text-white">Share This Sermon</h2>
          <p className="text-indigo-200 text-sm mt-1">{title}</p>
          {churchName && <p className="text-indigo-300 text-xs mt-1">{churchName}</p>}
        </div>

        {/* Public toggle */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              {isPublic ? <Eye className="w-5 h-5 text-indigo-600" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
              <div>
                <p className="font-semibold text-gray-900">{isPublic ? 'Public Share' : 'Private'}</p>
                <p className="text-xs text-gray-500">{isPublic ? 'Anyone can view' : 'Link only'}</p>
              </div>
            </label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {!shareUrl ? (
            <>
              <p className="text-sm text-gray-600 mb-4">Create a shareable link to invite others to discover FaithLight</p>
              
              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                {loading ? 'Creating link...' : 'Create Share Link'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">Share this link with your community:</p>
              
              {/* Share buttons */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <button
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 rounded-2xl py-4 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-bold">WhatsApp</span>
                </button>
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-2xl py-4 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-bold">Share</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 bg-gray-700 hover:bg-gray-800 rounded-2xl py-4 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                  <span className="text-white text-xs font-bold">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* URL preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-5">
                <p className="text-xs text-gray-600 mb-1 font-semibold">Share URL:</p>
                <p className="text-xs text-indigo-600 break-all font-mono">{shareUrl}</p>
              </div>

              <button
                onClick={onConfirmEnd}
                className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                End Session <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}