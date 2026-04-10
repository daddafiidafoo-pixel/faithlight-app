import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, Church, Loader2, AlertCircle, History, Calendar, Hash, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const LANGS = [
  { code: 'om', label: '🇪🇹 Afaan Oromoo' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'am', label: '🇪🇹 Amharic' },
  { code: 'sw', label: '🇰🇪 Kiswahili' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'fr', label: '🇫🇷 French' },
];

// Step 1: Church setup; Step 2: Session details
export default function PastorDashboard({ onSessionCreated, onBack }) {
  const [step, setStep] = useState(1); // 1 = church, 2 = sermon
  const [churches, setChurches] = useState([]);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [form, setForm] = useState({ title: '', verseRefs: '', languageCode: 'en' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newChurchName, setNewChurchName] = useState('');
  const [creatingChurch, setCreatingChurch] = useState(false);

  useEffect(() => { loadChurches(); }, []);

  const loadChurches = async () => {
    setLoadingChurches(true);
    try {
      const list = await base44.entities.Church.list('-created_date', 50);
      setChurches(list || []);
      if (list?.length > 0) setSelectedChurch(list[0]);
    } catch { setChurches([]); }
    setLoadingChurches(false);
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const sessions = await base44.entities.SermonSession.list('-created_date', 20);
      setPastSessions(sessions || []);
    } catch { setPastSessions([]); }
    setLoadingHistory(false);
  };

  const handleCreateChurch = async () => {
    if (!newChurchName.trim()) return;
    setCreatingChurch(true);
    setError('');
    try {
      const church = await base44.entities.Church.create({ name: newChurchName.trim() });
      setChurches(prev => [church, ...prev]);
      setSelectedChurch(church);
      setNewChurchName('');
    } catch { setError('Failed to create church. Please try again.'); }
    setCreatingChurch(false);
  };

  const handleStart = async () => {
    if (!selectedChurch?.id || !form.title) { setError('Please fill in the sermon title.'); return; }
    setCreating(true);
    setError('');
    try {
      const refs = form.verseRefs.split(',').map(v => v.trim()).filter(Boolean);
      const res = await base44.functions.invoke('churchmode_createSession', {
        churchId: selectedChurch.id,
        title: form.title,
        languageCode: form.languageCode,
        verseRefs: refs,
        date: new Date().toISOString(),
      });
      onSessionCreated({ ...res.data, isPastor: true, churchName: selectedChurch.name });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to start session. Make sure you are signed in.');
    }
    setCreating(false);
  };

  // --- History view ---
  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
        <button onClick={() => setShowHistory(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Past Sessions</h2>
        {loadingHistory ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : pastSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No sessions yet.</p>
          </div>
        ) : pastSessions.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{s.title}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(s.date || s.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Hash className="w-3 h-3" />{s.code}
                  </span>
                </div>
              </div>
              <Badge className={`text-xs flex-shrink-0 ${s.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- Step 1: Church selection ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Church className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pastor Setup</h1>
          <p className="text-gray-500 text-sm mt-1">Step 1 of 2 — Your Church</p>
        </div>

        {loadingChurches ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : (
          <div className="space-y-4">
            {/* Existing churches */}
            {churches.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Your Church</p>
                {churches.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChurch(c)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      selectedChurch?.id === c.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Church className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-gray-900">{c.name}</span>
                    </div>
                    {selectedChurch?.id === c.id && (
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Add new church */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {churches.length === 0 ? 'Register Your Church' : 'Or Add Another Church'}
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Church name (e.g., Grace Fellowship)"
                  value={newChurchName}
                  onChange={e => setNewChurchName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateChurch()}
                  className="text-sm"
                />
                <Button
                  onClick={handleCreateChurch}
                  disabled={!newChurchName.trim() || creatingChurch}
                  className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                >
                  {creatingChurch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <Button
              onClick={() => { setError(''); setStep(2); }}
              disabled={!selectedChurch?.id}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
            >
              Continue to Sermon Details <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            <button
              onClick={() => { setShowHistory(true); loadHistory(); }}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 py-2"
            >
              View past sessions →
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Step 2: Sermon details ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
      <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Church className="w-7 h-7 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Today's Sermon</h1>
        <p className="text-gray-500 text-sm mt-1">Step 2 of 2 — <span className="font-semibold text-indigo-600">{selectedChurch?.name}</span></p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Sermon Title *</label>
          <Input
            placeholder="e.g., Walking by Faith"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="h-12 text-base"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Scripture References <span className="text-gray-400 font-normal">(optional, comma separated)</span></label>
          <Input
            placeholder="e.g., Hebrews 11:1, Romans 8:28"
            value={form.verseRefs}
            onChange={e => setForm(f => ({ ...f, verseRefs: e.target.value }))}
            className="h-11"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Service Language</label>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setForm(f => ({ ...f, languageCode: l.code }))}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.languageCode === l.code
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <Button
          onClick={handleStart}
          disabled={creating || !form.title}
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-base font-bold rounded-xl shadow-lg"
        >
          {creating ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Starting your session...</>
          ) : (
            '🎙️ Start Live Session →'
          )}
        </Button>

        <p className="text-center text-xs text-gray-400">A join code will be generated instantly for your congregation</p>
      </div>
    </div>
  );
}