import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users, AlertCircle, Church } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Deep link handler: /ChurchJoin?code=GRACE104
// Tapping a shared link auto-joins the session and redirects to ChurchMode
export default function ChurchJoin() {
  const [status, setStatus] = useState('joining'); // joining | error | success
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('code')?.trim().toUpperCase() || '';
    setCode(c);

    if (!c) {
      setStatus('error');
      setError('No session code found in the link. Please ask your pastor for the current code.');
      return;
    }

    joinSession(c);
  }, []);

  const joinSession = async (c) => {
    setStatus('joining');
    try {
      const res = await base44.functions.invoke('churchmode_join', { code: c });
      if (res.data?.session) {
        // Store session in sessionStorage so ChurchMode page can pick it up
        sessionStorage.setItem('church_auto_join', JSON.stringify({ ...res.data.session, isPastor: false }));
        setStatus('success');
        setTimeout(() => navigate(createPageUrl('ChurchMode')), 800);
      } else {
        setStatus('error');
        setError('Session not found. It may have ended or the code is incorrect.');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || '';
      setStatus('error');
      if (msg.includes('ended')) {
        setError('This sermon session has already ended.');
      } else {
        setError('Session not found. Check with your pastor for the latest code.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Church className="w-8 h-8 text-indigo-600" />
        </div>

        {status === 'joining' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Joining Session</h2>
            {code && <p className="text-3xl font-mono font-bold text-indigo-600 mb-4 tracking-widest">{code}</p>}
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
            <p className="text-gray-500 text-sm mt-4">Connecting to live sermon…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">🙏</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Joined!</h2>
            <p className="text-gray-500 text-sm">Redirecting to the live session…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn't Join</h2>
            <p className="text-red-600 text-sm mb-6">{error}</p>
            <Button onClick={() => navigate(createPageUrl('ChurchMode'))} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Users className="w-4 h-4 mr-2" /> Enter Code Manually
            </Button>
          </>
        )}
      </div>
    </div>
  );
}