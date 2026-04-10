import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, MessageCircle, Share2, Copy, Check, Loader2, Download, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function ShareSermon() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAppCTA, setShowAppCTA] = useState(false);

  useEffect(() => {
    const loadShare = async () => {
      try {
        const shares = await base44.entities.SermonShare.filter(
          { share_token: shareToken, is_public: true },
          '-created_date',
          1
        );

        if (shares.length > 0) {
          setShare(shares[0]);
          // Increment view count
          try {
            await base44.asServiceRole.entities.SermonShare.update(shares[0].id, {
              view_count: (shares[0].view_count || 0) + 1
            });
          } catch {}
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadShare();
  }, [shareToken]);

  const handleShareWhatsApp = () => {
    const msg = `🙏 Check out this sermon from ${share.church_name}: "${share.title}"\n\n${share.verse_refs?.length > 0 ? `📖 Verses: ${share.verse_refs.join(', ')}\n\n` : ''}Join FaithLight to follow along with live sermons: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: `${share.church_name} - ${share.title}`,
        text: `Check out this sermon and join FaithLight`
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const detectPlatform = () => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'web';
  };

  const handleOpenInApp = () => {
    const platform = detectPlatform();
    // Try to open the deep link — if app installed, it opens in app
    // If not, iOS/Android will handle fallback to store
    const deepLink = `faithlight://share/sermon/${shareToken}`;
    
    if (platform === 'ios' || platform === 'android') {
      // Use universal link / app link
      window.location.href = `${window.location.origin}/share/sermon/${shareToken}`;
      // Fallback: after 1.5s, if user is still on web, show app store options
      setTimeout(() => {
        setShowAppCTA(true);
      }, 1500);
    } else {
      // Desktop: show app store options
      setShowAppCTA(true);
    }
  };

  const handleDownloadApp = () => {
    const platform = detectPlatform();
    if (platform === 'ios') {
      // Placeholder — will be replaced with actual App Store ID
      window.open('https://apps.apple.com', '_blank');
    } else if (platform === 'android') {
      // Placeholder — will be replaced with actual Play Store URL
      window.open('https://play.google.com/store', '_blank');
    } else {
      // Desktop: show both
      navigate(createPageUrl('Download'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sermon Not Found</h1>
          <p className="text-gray-600 mb-6">This share link is either invalid, expired, or not public.</p>
          <Button onClick={() => navigate(createPageUrl('ChurchMode'))} className="bg-indigo-600 hover:bg-indigo-700">
            Back to Church Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{share.title}</h1>
          <p className="text-indigo-600 font-semibold text-lg">{share.church_name}</p>
          {share.created_date && (
            <p className="text-gray-500 text-sm mt-2">
              {new Date(share.created_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Scripture references */}
        {share.verse_refs?.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-4">Scripture References</h2>
            <div className="flex flex-wrap gap-2">
              {share.verse_refs.map((ref, i) => (
                <span key={i} className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sermon outline */}
        {share.outline_json && Object.keys(share.outline_json).length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-4">Sermon Outline</h2>
            <div className="space-y-4">
              {(share.outline_json.sections || share.outline_json.points || []).map((section, i) => (
                <div key={i} className="border-l-4 border-indigo-500 pl-4">
                  <p className="font-semibold text-gray-900">{section.title || section.heading || `Point ${i + 1}`}</p>
                  {section.content && <p className="text-gray-600 text-sm mt-2">{section.content}</p>}
                  {section.verse && <p className="text-amber-700 text-sm mt-2">📖 {section.verse}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {share.notes_summary && (
          <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-4">Key Notes</h2>
            <p className="text-gray-700 leading-relaxed">{share.notes_summary}</p>
          </div>
        )}

        {/* Share buttons */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8 border border-indigo-200">
          <h2 className="font-bold text-gray-900 mb-4 text-center">Share This Sermon</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 rounded-xl py-4 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="text-white text-xs font-bold">WhatsApp</span>
            </button>
            <button
              onClick={handleShareNative}
              className="flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl py-4 transition-colors"
            >
              <Share2 className="w-5 h-5 text-white" />
              <span className="text-white text-xs font-bold">Share</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 bg-gray-700 hover:bg-gray-800 rounded-xl py-4 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              <span className="text-white text-xs font-bold">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Deep linking CTA */}
        {!showAppCTA && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white mb-8">
            <h2 className="text-2xl font-bold mb-3">Get More from This Sermon</h2>
            <p className="mb-6 text-indigo-100">
              Open in FaithLight to interact with your church, take notes, and access full features.
            </p>
            <Button 
              onClick={handleOpenInApp} 
              className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Open in FaithLight
            </Button>
          </div>
        )}

        {/* Fallback CTA (shown if app not installed or user is on desktop) */}
        {showAppCTA && (
          <div className="bg-white rounded-2xl p-8 border-2 border-indigo-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Follow Along with Your Church</h2>
            <p className="text-gray-600 mb-6">
              Join FaithLight to participate in live sermons, take notes, and grow in faith with your community.
            </p>
            <Button 
              onClick={handleDownloadApp} 
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <Download className="w-4 h-4" />
              Get FaithLight
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              🙏 Helping churches and individuals grow together in faith
            </p>
          </div>
        )}

        {/* View count */}
        {share.view_count > 0 && (
          <p className="text-center text-sm text-gray-500 mt-8">
            This sermon has been viewed {share.view_count} time{share.view_count !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}