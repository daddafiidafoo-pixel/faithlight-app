import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Church, Calendar, Users, BarChart2, MessageSquare,
  Plus, Loader2, Settings, Clock, BookOpen, Heart, Edit3, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const TABS = ['Overview', 'Schedule', 'Analytics', 'Settings'];

export default function PastorAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [sessions, setSessions] = useState([]);
  const [churches, setChurches] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingWelcome, setSavingWelcome] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [welcomeSaved, setWelcomeSaved] = useState(false);

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({ title: '', verseRefs: '', scheduledAt: '', notes: '' });
  const [scheduling, setScheduling] = useState(false);
  const [scheduledSessions, setScheduledSessions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [churchList, sessionList] = await Promise.all([
        base44.entities.Church.list('-created_date', 20),
        base44.entities.SermonSession.list('-created_date', 50),
      ]);
      setChurches(churchList || []);
      setSessions(sessionList || []);
      if (churchList?.length > 0) {
        setSelectedChurch(churchList[0]);
        setWelcomeMsg(churchList[0].welcomeMessage || '');
      }
      // Scheduled = sessions with status 'scheduled'
      setScheduledSessions((sessionList || []).filter(s => s.status === 'scheduled'));
    } catch {}
    setLoading(false);
  };

  const handleSaveWelcome = async () => {
    if (!selectedChurch?.id) return;
    setSavingWelcome(true);
    try {
      await base44.entities.Church.update(selectedChurch.id, { welcomeMessage: welcomeMsg });
      setWelcomeSaved(true);
      setTimeout(() => setWelcomeSaved(false), 2500);
    } catch {}
    setSavingWelcome(false);
  };

  const handleSchedule = async () => {
    if (!selectedChurch?.id || !scheduleForm.title || !scheduleForm.scheduledAt) return;
    setScheduling(true);
    try {
      const refs = scheduleForm.verseRefs.split(',').map(v => v.trim()).filter(Boolean);
      const newSession = await base44.entities.SermonSession.create({
        churchId: selectedChurch.id,
        churchName: selectedChurch.name,
        title: scheduleForm.title,
        verseRefs: refs,
        notes: scheduleForm.notes,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        status: 'scheduled',
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
      setScheduledSessions(prev => [newSession, ...prev]);
      setScheduleForm({ title: '', verseRefs: '', scheduledAt: '', notes: '' });
    } catch {}
    setScheduling(false);
  };

  // Analytics calculations
  const liveSessions = sessions.filter(s => s.status === 'live' || s.status === 'ended');
  const totalEngagements = sessions.reduce((acc, s) => acc + (s.viewerCount || s.memberCount || 0), 0);
  const avgEngagement = liveSessions.length > 0 ? Math.round(totalEngagements / liveSessions.length) : 0;
  const recentSessions = liveSessions.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(createPageUrl('ChurchMode'))} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Church className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Pastor Dashboard</h1>
              {selectedChurch && <p className="text-xs text-gray-500">{selectedChurch.name}</p>}
            </div>
          </div>
          <button
            onClick={() => navigate(createPageUrl('ChurchMode'))}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start Session
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-0 border-t border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Users className="w-5 h-5 text-indigo-500" />, label: 'Total Sessions', value: liveSessions.length, bg: 'bg-indigo-50' },
                { icon: <Heart className="w-5 h-5 text-rose-500" />, label: 'Avg Members', value: avgEngagement, bg: 'bg-rose-50' },
                { icon: <BookOpen className="w-5 h-5 text-green-500" />, label: 'Upcoming', value: scheduledSessions.length, bg: 'bg-green-50' },
              ].map(({ icon, label, value, bg }) => (
                <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
                  <div className="flex justify-center mb-2">{icon}</div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Upcoming scheduled */}
            {scheduledSessions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h3>
                </div>
                <div className="space-y-2">
                  {scheduledSessions.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                        {s.scheduledAt && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(s.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 text-xs">Scheduled</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent sessions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Recent Sessions</h3>
              </div>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No sessions yet. Start your first one!</p>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(s.created_date).toLocaleDateString()} · {s.memberCount || s.viewerCount || 0} members
                        </p>
                      </div>
                      <Badge className={`text-xs ${s.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.status || 'ended'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {activeTab === 'Schedule' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-gray-900">Schedule a Session</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Sermon Title *</label>
                  <Input
                    placeholder="e.g., Walking by Faith"
                    value={scheduleForm.title}
                    onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={scheduleForm.scheduledAt}
                    onChange={e => setScheduleForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Scripture References <span className="text-gray-400 font-normal">(comma separated)</span></label>
                  <Input
                    placeholder="e.g., Hebrews 11:1, Romans 8:28"
                    value={scheduleForm.verseRefs}
                    onChange={e => setScheduleForm(f => ({ ...f, verseRefs: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Preparation Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Textarea
                    placeholder="Notes for yourself about this sermon..."
                    value={scheduleForm.notes}
                    onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))}
                    className="text-sm"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSchedule}
                  disabled={scheduling || !scheduleForm.title || !scheduleForm.scheduledAt}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {scheduling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Schedule Session
                </Button>
              </div>
            </div>

            {/* Scheduled list */}
            {scheduledSessions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Scheduled Sessions</h3>
                <div className="space-y-2">
                  {scheduledSessions.map(s => (
                    <div key={s.id} className="p-3 bg-indigo-50 rounded-xl">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                        <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{s.code}</span>
                      </div>
                      {s.scheduledAt && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(s.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {s.verseRefs?.length > 0 && (
                        <p className="text-xs text-indigo-600 mt-1">📖 {s.verseRefs.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'Analytics' && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Services', value: liveSessions.length, icon: '⛪', color: 'bg-indigo-50' },
                { label: 'Avg Congregation', value: avgEngagement, icon: '👥', color: 'bg-blue-50' },
                { label: 'Verses Pushed', value: sessions.reduce((a, s) => a + (s.verseRefs?.length || 0), 0), icon: '📖', color: 'bg-green-50' },
                { label: 'Scheduled', value: scheduledSessions.length, icon: '🗓️', color: 'bg-amber-50' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className={`${color} rounded-2xl p-4`}>
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Per-session engagement */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Session Engagement</h3>
              </div>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map(s => {
                    const members = s.memberCount || s.viewerCount || 0;
                    const maxMembers = Math.max(...recentSessions.map(x => x.memberCount || x.viewerCount || 1));
                    const pct = maxMembers > 0 ? Math.round((members / maxMembers) * 100) : 0;
                    return (
                      <div key={s.id}>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-medium text-gray-700 truncate flex-1 mr-2">{s.title}</p>
                          <span className="text-xs text-gray-500 flex-shrink-0">{members} members</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top verses */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-green-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Most Used Scriptures</h3>
              </div>
              {(() => {
                const verseCount = {};
                sessions.forEach(s => (s.verseRefs || []).forEach(v => { verseCount[v] = (verseCount[v] || 0) + 1; }));
                const sorted = Object.entries(verseCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
                return sorted.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {sorted.map(([ref, count]) => (
                      <div key={ref} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm font-medium text-gray-800">{ref}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{count}x</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'Settings' && (
          <div className="space-y-4">
            {/* Church selector */}
            {churches.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Active Church</label>
                <div className="space-y-2">
                  {churches.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedChurch(c); setWelcomeMsg(c.welcomeMessage || ''); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        selectedChurch?.id === c.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <Church className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Welcome message */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-gray-900">Welcome Message</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                This message is shown to congregation members when they first join a session via QR code or session code.
              </p>
              <Textarea
                placeholder={`e.g., Welcome to ${selectedChurch?.name || 'our service'}! Open your Bible to follow along. 🙏`}
                value={welcomeMsg}
                onChange={e => setWelcomeMsg(e.target.value)}
                rows={4}
                className="text-sm mb-3"
              />
              <Button
                onClick={handleSaveWelcome}
                disabled={savingWelcome}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {savingWelcome ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : welcomeSaved ? (
                  '✓ Saved!'
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Welcome Message</>
                )}
              </Button>
            </div>

            {/* QR tip */}
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <p className="text-sm font-semibold text-indigo-800 mb-1">💡 QR Code Tip</p>
              <p className="text-xs text-indigo-600">
                During a live session, a QR code is automatically generated. Print it or display it on a screen at your church entrance so members can join instantly — no account required.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}