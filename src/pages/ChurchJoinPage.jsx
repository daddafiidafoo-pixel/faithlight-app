import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Church, BookOpen, Heart, Users, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

// Visited via QR code: /ChurchJoinPage?code=XXXXXX
// Auto-joins the session without requiring an account.

export default function ChurchJoinPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [joined, setJoined] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code') || urlParams.get('c') || '';

  useEffect(() => {
    if (code) {
      lookupSession(code);
    } else {
      setError('No session code found. Please scan the QR code again.');
      setLoading(false);
    }
  }, [code]);

  // Poll for live verse updates once joined
  useEffect(() => {
    if (!joined || !session?.id) return;
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 8000);
    return () => clearInterval(interval);
  }, [joined, session?.id]);

  const lookupSession = async (sessionCode) => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('churchmode_getSession', { code: sessionCode });
      const data = res?.data;
      if (!data || data.error) {
        setError('Session not found. The service may have ended.');
      } else {
        setSession(data);
        // Fetch church welcome message
        if (data.churchId) {
          try {
            const churches = await base44.entities.Church.filter({ id: data.churchId });
            if (churches?.[0]?.welcomeMessage) setWelcomeMsg(churches[0].welcomeMessage);
          } catch {}
        }
      }
    } catch {
      setError('Could not connect. Please check your internet and try again.');
    }
    setLoading(false);
  };

  const fetchLiveData = async () => {
    if (!session?.id) return;
    try {
      const res = await base44.functions.invoke('churchmode_getSession', { sessionId: session.id });
      const data = res?.data;
      if (data?.currentVerseRef) {
        setCurrentVerse({ ref: data.currentVerseRef, text: data.currentVerseText });
      }
      if (data?.prayerRequests) setPrayerRequests(data.prayerRequests);
    } catch {}
  };

  const handleJoin = async () => {
    if (!session?.id) return;
    setJoining(true);
    try {
      await base44.functions.invoke('churchmode_join', { sessionId: session.id, isGuest: true });
      setJoined(true);
      await fetchLiveData();
    } catch {
      // Still let them in even if tracking fails
      setJoined(true);
      await fetchLiveData();
    }
    setJoining(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-300 mx-auto" />
          <p className="text-indigo-300 text-sm">Looking up session…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(createPageUrl('ChurchMode'))}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
          >
            Open Church Mode
          </button>
        </div>
      </div>
    );
  }

  // Pre-join landing screen
  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-6">
          {/* Church badge */}
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Church className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{session.churchName || 'Live Service'}</h1>
            <p className="text-indigo-300 text-sm mt-1">You have been invited to follow along</p>
          </div>

          {/* Sermon info */}
          <div className="bg-white/10 rounded-2xl p-5 border border-white/15 space-y-3">
            <div>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-1">Today's Sermon</p>
              <p className="text-white font-bold text-lg">{session.title}</p>
            </div>
            {session.verseRefs?.length > 0 && (
              <div>
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-1">Scripture</p>
                <div className="flex flex-wrap gap-1.5">
                  {session.verseRefs.map((ref, i) => (
                    <span key={i} className="text-xs bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full font-medium">{ref}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-300 font-semibold">LIVE NOW</span>
            </div>
          </div>

          {/* Welcome message */}
          {welcomeMsg && (
            <div className="bg-amber-500/15 border border-amber-400/30 rounded-2xl p-4">
              <p className="text-amber-200 text-sm leading-relaxed">💬 {welcomeMsg}</p>
            </div>
          )}

          {/* What you'll get */}
          <div className="space-y-2">
            {[
              { icon: '📖', text: 'See verses in real-time as the pastor preaches' },
              { icon: '✏️', text: 'Take personal sermon notes' },
              { icon: '🙏', text: 'View and pray for congregation prayer requests' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-indigo-200">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-bold text-base shadow-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            {joining ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Joining…</>
            ) : (
              <>Join Service <ArrowRight className="w-5 h-5" /></>
            )}
          </button>

          <p className="text-center text-xs text-indigo-500">No account required to follow along</p>
        </div>
      </div>
    );
  }

  // Live session view (joined, no account)
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 text-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-indigo-800">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-wide font-medium">Church Mode</p>
              {session.churchName && <p className="text-xs text-indigo-200">{session.churchName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-300 font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Sermon title */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">{session.title}</h1>
        </div>

        {/* Live verse */}
        <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-xs text-green-300 font-semibold uppercase tracking-wide">Current Verse</p>
          </div>
          {currentVerse ? (
            <div className="space-y-2">
              <p className="text-white font-bold text-lg">{currentVerse.ref}</p>
              {currentVerse.text && (
                <p className="text-indigo-100 text-base leading-relaxed italic">"{currentVerse.text}"</p>
              )}
            </div>
          ) : (
            <p className="text-indigo-400 text-sm">Waiting for the pastor to share a verse…</p>
          )}
        </div>

        {/* All scripture references */}
        {session.verseRefs?.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <p className="text-sm font-semibold text-indigo-100">Today's Scripture</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {session.verseRefs.map((ref, i) => (
                <span key={i} className="text-xs bg-white/15 text-white px-3 py-1.5 rounded-full font-medium">{ref}</span>
              ))}
            </div>
          </div>
        )}

        {/* Prayer requests */}
        {prayerRequests.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-rose-400" />
              <p className="text-sm font-semibold text-indigo-100">Prayer Requests</p>
            </div>
            <div className="space-y-2">
              {prayerRequests.slice(0, 5).map((pr, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-indigo-200">
                  <span className="text-rose-400 mt-0.5">🙏</span>
                  <span>{pr.content || pr.request}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join FaithLight CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 border border-white/10 text-center">
          <p className="text-white font-bold text-base mb-1">Enjoying Church Mode?</p>
          <p className="text-indigo-200 text-xs mb-4">Create a free account to take notes, access the AI Bible guide, and continue studying after the service.</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
          >
            Create Free Account
          </button>
        </div>

        <p className="text-center text-xs text-indigo-600">
          This page updates automatically · Refreshes every 8 seconds
        </p>
      </div>
    </div>
  );
}