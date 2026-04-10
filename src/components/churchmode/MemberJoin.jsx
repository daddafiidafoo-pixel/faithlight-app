import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MemberJoin({ onJoined, onBack }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('churchmode_join', { code: trimmed });
      if (res.data?.session) {
        onJoined({ ...res.data.session, isPastor: false });
      } else {
        setError('Session not found. Check the code and try again.');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || '';
      if (msg.includes('ended')) {
        setError('This sermon session has already ended.');
      } else if (msg.includes('not found') || e?.response?.status === 404) {
        setError('Session not found. Check the code and try again.');
      } else {
        setError('Could not join session. Try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join a Session</h1>
          <p className="text-gray-500 text-sm">Enter the code your pastor shared</p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Enter code (e.g. FAITH123)"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            className="text-center text-2xl tracking-widest font-bold h-14 uppercase"
            maxLength={9}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleJoin}
            disabled={!code.trim() || loading}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-base font-semibold"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Joining...</>
            ) : (
              'Join Sermon →'
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Ask your pastor for the session code shown on their screen
        </p>
      </div>
    </div>
  );
}