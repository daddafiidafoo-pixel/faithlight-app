import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Zap, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PastorQuickStart({ onSessionCreated, onBack }) {
  const [form, setForm] = useState({ churchName: '', title: '', mainVerse: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!form.churchName.trim() || !form.title.trim()) {
      setError('Please fill in your church name and sermon title.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Create church on-the-fly if needed
      let churchId;
      const churches = await base44.entities.Church.filter({ name: form.churchName.trim() }, '-created_date', 1);
      if (churches.length > 0) {
        churchId = churches[0].id;
      } else {
        const newChurch = await base44.entities.Church.create({ name: form.churchName.trim() });
        churchId = newChurch.id;
      }

      const verseRefs = form.mainVerse.trim() ? [form.mainVerse.trim()] : [];

      const res = await base44.functions.invoke('churchmode_createSession', {
        churchId,
        title: form.title.trim(),
        languageCode: 'en',
        verseRefs,
        date: new Date().toISOString(),
      });

      onSessionCreated({ ...res.data, isPastor: true, churchName: form.churchName.trim() });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to start. Please make sure you are signed in.');
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleStart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sunday Quick Start</h1>
          <p className="text-gray-500 text-sm mt-1">3 fields. 10 seconds. You're live.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Your Church Name</label>
            <Input
              placeholder="e.g., Grace Fellowship"
              value={form.churchName}
              onChange={e => setForm(f => ({ ...f, churchName: e.target.value }))}
              onKeyDown={handleKey}
              className="h-12 text-base"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Sermon Title</label>
            <Input
              placeholder="e.g., Walking by Faith"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={handleKey}
              className="h-12 text-base"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
              Main Verse <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <Input
              placeholder="e.g., Romans 8:28"
              value={form.mainVerse}
              onChange={e => setForm(f => ({ ...f, mainVerse: e.target.value }))}
              onKeyDown={handleKey}
              className="h-12 text-base"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={loading || !form.churchName.trim() || !form.title.trim()}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white text-base font-bold rounded-xl shadow-lg"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Starting…</>
              : '⚡ Go Live Now →'}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400">
          A session code + QR code will be generated instantly for your congregation.
        </p>
      </div>
    </div>
  );
}