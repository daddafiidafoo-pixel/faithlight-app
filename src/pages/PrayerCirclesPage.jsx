import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, Users, Lock, Bell, BellOff, Send, Check, Heart, MessageCircle, ChevronRight, X, Loader2, Copy } from 'lucide-react';

export default function PrayerCirclesPage() {
  const [user, setUser] = useState(null);
  const [circles, setCircles] = useState([]);
  const [myCircles, setMyCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | detail | create
  const [activeCircle, setActiveCircle] = useState(null);
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('requests'); // requests | members

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    loadCircles();
  }, [user]);

  const loadCircles = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.PrayerCircle.filter({ memberEmails: user.email }, '-created_date', 20);
      setMyCircles(all);
    } catch {}
    setLoading(false);
  };

  const openCircle = async (circle) => {
    setActiveCircle(circle);
    setView('detail');
    loadRequests(circle.id);
  };

  const loadRequests = async (circleId) => {
    try {
      const reqs = await base44.entities.CirclePrayerRequest.filter({ circleId }, '-created_date', 50);
      setRequests(reqs);
    } catch {}
  };

  const handleCreate = async () => {
    if (!createForm.name.trim() || !user) return;
    setSubmitting(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const circle = await base44.entities.PrayerCircle.create({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        creatorEmail: user.email,
        creatorName: user.full_name || user.email,
        memberEmails: [user.email],
        memberCount: 1,
        inviteCode: code,
        isPrivate: true,
      });
      setMyCircles(prev => [circle, ...prev]);
      setCreateForm({ name: '', description: '' });
      setView('list');
    } catch {}
    setSubmitting(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !user) return;
    setSubmitting(true);
    try {
      const results = await base44.entities.PrayerCircle.filter({ inviteCode: joinCode.trim().toUpperCase() }, null, 1);
      if (!results.length) { alert('Circle not found. Check the invite code.'); setSubmitting(false); return; }
      const circle = results[0];
      if (circle.memberEmails?.includes(user.email)) { alert('You are already a member.'); setSubmitting(false); return; }
      const updatedEmails = [...(circle.memberEmails || []), user.email];
      await base44.entities.PrayerCircle.update(circle.id, {
        memberEmails: updatedEmails,
        memberCount: updatedEmails.length,
      });
      setMyCircles(prev => [{ ...circle, memberEmails: updatedEmails }, ...prev]);
      setJoinCode('');
      setShowJoin(false);
    } catch { alert('Unable to join. Try again.'); }
    setSubmitting(false);
  };

  const handlePostRequest = async () => {
    if (!newRequest.trim() || !user || !activeCircle) return;
    setSubmitting(true);
    try {
      const req = await base44.entities.CirclePrayerRequest.create({
        circleId: activeCircle.id,
        circleName: activeCircle.name,
        authorEmail: user.email,
        authorName: user.full_name || user.email,
        body: newRequest.trim(),
        prayedByEmails: [],
        prayedCount: 0,
        status: 'active',
      });
      setRequests(prev => [req, ...prev]);
      setNewRequest('');
    } catch {}
    setSubmitting(false);
  };

  const handlePray = async (req) => {
    if (!user) return;
    const already = req.prayedByEmails?.includes(user.email);
    const updatedEmails = already
      ? req.prayedByEmails.filter(e => e !== user.email)
      : [...(req.prayedByEmails || []), user.email];
    await base44.entities.CirclePrayerRequest.update(req.id, {
      prayedByEmails: updatedEmails,
      prayedCount: updatedEmails.length,
    });
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, prayedByEmails: updatedEmails, prayedCount: updatedEmails.length } : r));
  };

  const handleMarkAnswered = async (req) => {
    await base44.entities.CirclePrayerRequest.update(req.id, { status: 'answered' });
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'answered' } : r));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <Users className="w-14 h-14 text-purple-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-gray-800">Sign in to access Prayer Circles</p>
          <p className="text-sm text-gray-500 mt-2">Connect with others and pray together</p>
          <button onClick={() => base44.auth.redirectToLogin()} className="mt-5 px-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Create View ────────────────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => setView('list')} className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Create Prayer Circle</h1>
        </div>
        <div className="px-5 py-6 max-w-md mx-auto space-y-4">
          <input
            value={createForm.name}
            onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Circle name (e.g. Family Prayer)"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:border-purple-400 bg-white"
          />
          <textarea
            value={createForm.description}
            onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What is this circle about? (optional)"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:border-purple-400 bg-white min-h-24"
          />
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-sm text-purple-700">
            <Lock className="w-4 h-4 inline mr-1" />
            Your circle is private. Share the invite code with members to join.
          </div>
          <button onClick={handleCreate} disabled={submitting || !createForm.name.trim()}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Circle
          </button>
        </div>
      </div>
    );
  }

  // ── Detail View ────────────────────────────────────────────────────────────
  if (view === 'detail' && activeCircle) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white px-4 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => setView('list')} className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{activeCircle.name}</h1>
            <p className="text-xs text-gray-400">{activeCircle.memberCount || 1} members</p>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText(activeCircle.inviteCode); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold"
            title="Copy invite code">
            <Copy className="w-3 h-3" />
            {activeCircle.inviteCode}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-gray-100">
          {['requests', 'members'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm font-semibold capitalize transition-colors"
              style={{ color: tab === t ? '#7C3AED' : '#9CA3AF', borderBottom: tab === t ? '2px solid #7C3AED' : '2px solid transparent' }}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
          {tab === 'requests' && (
            <>
              {requests.length === 0 && (
                <div className="text-center py-16">
                  <Heart className="w-12 h-12 text-purple-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No prayer requests yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to share a prayer</p>
                </div>
              )}
              {requests.map(req => {
                const hasPrayed = req.prayedByEmails?.includes(user.email);
                const isAnswered = req.status === 'answered';
                const isOwn = req.authorEmail === user.email;
                return (
                  <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs font-bold text-purple-600">{req.authorName}</p>
                        {isAnswered && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-0.5">
                            <Check className="w-3 h-3" /> Answered
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 shrink-0">{new Date(req.created_date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-gray-800 leading-6 mb-3">{req.body}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handlePray(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{ backgroundColor: hasPrayed ? '#EDE9FE' : '#F3F4F6', color: hasPrayed ? '#7C3AED' : '#6B7280' }}>
                        <Heart className="w-3.5 h-3.5" fill={hasPrayed ? '#7C3AED' : 'none'} />
                        Praying ({req.prayedCount || 0})
                      </button>
                      {isOwn && !isAnswered && (
                        <button onClick={() => handleMarkAnswered(req)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-600">
                          <Check className="w-3 h-3" /> Mark Answered
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {tab === 'members' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Members</p>
              {(activeCircle.memberEmails || []).map((email, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    {email[0].toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-700 flex-1 truncate">{email}</p>
                  {email === activeCircle.creatorEmail && (
                    <span className="text-xs text-purple-500 font-semibold">Host</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post request bar */}
        {tab === 'requests' && (
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <input
                value={newRequest}
                onChange={e => setNewRequest(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePostRequest()}
                placeholder="Share a prayer request..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm outline-none focus:border-purple-400"
              />
              <button onClick={handlePostRequest} disabled={submitting || !newRequest.trim()}
                className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center disabled:opacity-40">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List View ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Prayer Circles</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(v => !v)}
            className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold">
            Join
          </button>
          <button onClick={() => setView('create')}
            className="px-3 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      {showJoin && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex gap-2 max-w-md">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="Enter invite code (e.g. ABC123)"
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400"
            />
            <button onClick={handleJoin} disabled={submitting || !joinCode.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold disabled:opacity-40">
              {submitting ? '...' : 'Join'}
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-5 max-w-2xl mx-auto">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        )}

        {!loading && myCircles.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-purple-200 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-800">No circles yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-6">Create or join a private prayer circle</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setView('create')}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-semibold text-sm">
                Create a Circle
              </button>
              <button onClick={() => setShowJoin(true)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm">
                Join with Code
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {myCircles.map(circle => (
            <button key={circle.id} onClick={() => openCircle(circle)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 text-left hover:border-purple-200 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{circle.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{circle.memberCount || 1} members · <Lock className="w-3 h-3 inline" /> Private</p>
                {circle.description && <p className="text-xs text-gray-500 mt-1 truncate">{circle.description}</p>}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}