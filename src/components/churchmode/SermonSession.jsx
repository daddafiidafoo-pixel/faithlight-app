import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Copy, Check, LogOut, Loader2, Church, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RichNotesEditor from './RichNotesEditor';
import SessionChat from './SessionChat';
import SermonEndShareModal from './SermonEndShareModal';
import ShareSermonModal from './ShareSermonModal';
import SessionQRCode from './SessionQRCode';
import { useRatingPrompt } from '../rating/RatingPromptManager';
import PastorVerseControl from './PastorVerseControl';
import LiveVerseDisplay from './LiveVerseDisplay';
import AISermonCompanion from './AISermonCompanion';
import SermonSummaryScreen from './SermonSummaryScreen';

export default function SermonSession({ session, onLeave }) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMemberShareNudge, setShowMemberShareNudge] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const { triggerRatingPrompt } = useRatingPrompt();

  const isPastor = session?.isPastor;
  const sessionId = session?.id || session?.sessionId;
  const code = session?.code;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || '');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(`🙏 Join our live church sermon on FaithLight!\n\nEnter code: *${code}*\n\nGo to: faithlight.app → Church Mode → Join Session`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join our Church Session on FaithLight',
        text: `Join our live sermon! Enter code: ${code} on FaithLight → Church Mode`,
      }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    setEnding(true);
    try {
      await base44.functions.invoke('churchmode_endSession', { sessionId });
    } catch {}
    setEnding(false);
    setShowSummary(true);
  };

  const handleMemberLeave = () => {
    triggerRatingPrompt();
    setShowSummary(true);
  };

  const handleMemberShareWhatsApp = () => {
    const appUrl = window.location.origin;
    const msg = encodeURIComponent(`🙏 I just attended "${title}" on FaithLight${churchName ? ` at ${churchName}` : ''}!\n\nFollow along with your church during sermons. Join us:\n👉 ${appUrl}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const verseRefs = session?.verseRefs || [];
  const title = session?.title || 'Live Sermon';
  const churchName = session?.churchName || '';
  const outline = session?.outlineJson;

  if (showSummary) {
    return <SermonSummaryScreen session={{ ...session, title, churchName, verseRefs }} onClose={onLeave} />;
  }

  if (showMemberShareNudge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl text-center">
          <div className="px-6 pt-8 pb-4">
            <div className="text-5xl mb-3">🙏</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Sermon Ended</h2>
            <p className="text-gray-500 text-sm mb-1">{title}</p>
            {churchName && <p className="text-xs text-indigo-600 font-semibold mb-4">{churchName}</p>}
            <p className="text-sm text-gray-600 mb-6">Invite your friends to experience FaithLight during your next service!</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleMemberShareWhatsApp}
                className="flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 rounded-2xl py-4 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-bold">WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  const appUrl = window.location.origin;
                  const msg = `🙏 I just attended "${title}" on FaithLight! Join your church on FaithLight: ${appUrl}`;
                  if (navigator.share) navigator.share({ title: 'FaithLight', text: msg }).catch(() => {});
                  else navigator.clipboard.writeText(msg);
                }}
                className="flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-2xl py-4 transition-colors"
              >
                <Share2 className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-bold">Share</span>
              </button>
            </div>
            <button onClick={onLeave} className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors">
              Skip — Leave Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-800 text-white">
      {showEndModal && (
        <ShareSermonModal
          session={{ ...session, title, churchName, verseRefs, code }}
          onClose={() => setShowEndModal(false)}
          onConfirmEnd={handleEndSession}
        />
      )}
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-indigo-700">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-300 font-medium uppercase tracking-wide">
                {isPastor ? 'Live Session' : 'Church Mode'}
              </p>
              {churchName && <p className="text-xs text-indigo-200">{churchName}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPastor ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEndModal(true)}
                disabled={ending}
                className="text-red-300 hover:text-red-200 hover:bg-red-900/30 text-xs"
              >
                {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'End Session'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMemberLeave}
                className="text-indigo-300 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Sermon title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-300 font-medium">LIVE</span>
          </div>
        </div>

        {/* Session code & QR (pastor view) */}
        {isPastor && code && (
         <>
           <div className="bg-white/10 rounded-2xl p-5 text-center border border-white/20">
             <p className="text-xs text-indigo-300 uppercase tracking-wide mb-2 font-medium">Share this code with your congregation</p>
             <p className="text-5xl font-bold tracking-widest text-white mb-4">{code}</p>
             <div className="grid grid-cols-3 gap-2">
               <button
                 onClick={handleWhatsAppShare}
                 className="flex flex-col items-center gap-1.5 bg-green-500/80 hover:bg-green-500 rounded-xl py-3 px-2 transition-colors"
               >
                 <MessageCircle className="w-4 h-4 text-white" />
                 <span className="text-white text-xs font-semibold">WhatsApp</span>
               </button>
               <button
                 onClick={handleNativeShare}
                 className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-xl py-3 px-2 transition-colors"
               >
                 <Share2 className="w-4 h-4 text-white" />
                 <span className="text-white text-xs font-semibold">Share</span>
               </button>
               <button
                 onClick={handleCopyCode}
                 className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-xl py-3 px-2 transition-colors"
               >
                 {codeCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                 <span className="text-white text-xs font-semibold">{codeCopied ? 'Copied!' : 'Copy'}</span>
               </button>
             </div>
           </div>

           {/* QR Code for instant joining */}
           <SessionQRCode code={code} sessionId={sessionId} title={title} />
         </>
        )}

        {/* Live Verse Display — for members (and visible to pastor too) */}
        <LiveVerseDisplay
          sessionId={sessionId}
          initialVerseRef={session?.currentVerseRef || null}
          initialVerseText={session?.currentVerseText || null}
          isHighContrast={isHighContrast}
          onToggleHighContrast={() => setIsHighContrast(v => !v)}
        />

        {/* Pastor: verse push control */}
        {isPastor && (
          <PastorVerseControl
            sessionId={sessionId}
            verseRefs={verseRefs}
            currentVerseRef={session?.currentVerseRef || null}
          />
        )}

        {/* Scripture references (non-live quick list) */}
        {verseRefs.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <p className="text-sm font-semibold text-indigo-100">All Scripture References</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {verseRefs.map((ref, i) => (
                <Badge key={i} className="bg-white/20 text-white border-0 text-sm font-medium px-3 py-1">
                  {ref}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sermon outline */}
        {outline && (outline.sections?.length > 0 || outline.points?.length > 0) && (
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20 space-y-3">
            <p className="text-sm font-semibold text-indigo-100">Sermon Outline</p>
            <div className="space-y-3">
              {(outline.sections || outline.points || []).map((section, i) => (
                <div key={i} className="border-l-2 border-indigo-400 pl-3">
                  <p className="text-sm font-semibold text-white">{section.title || section.heading || `Point ${i + 1}`}</p>
                  {section.content && <p className="text-xs text-indigo-200 mt-1 leading-relaxed">{section.content}</p>}
                  {section.verse && <p className="text-xs text-amber-300 mt-1">📖 {section.verse}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Sermon Companion */}
        <AISermonCompanion session={session} />

        {/* Rich notes editor */}
        <RichNotesEditor sessionId={sessionId} />

        {/* Live chat */}
        <SessionChat sessionId={sessionId} />
      </div>
    </div>
  );
}