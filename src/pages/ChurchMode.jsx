import React, { useState, useEffect } from 'react';
import { Church, Users, Zap, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '../components/I18nProvider';
import { createPageUrl } from '../utils';
import PastorDashboard from '../components/churchmode/PastorDashboard';
import PastorQuickStart from '../components/churchmode/PastorQuickStart.jsx';
import MemberJoin from '../components/churchmode/MemberJoin';
import SermonSession from '../components/churchmode/SermonSession';

export default function ChurchMode() {
  const { t } = useI18n();
  const [mode, setMode] = useState(null); // 'quickstart' | 'pastor' | 'member'
  const [session, setSession] = useState(null);

  // Handle deep-link auto-join (from ChurchJoin page)
  useEffect(() => {
    const stored = sessionStorage.getItem('church_auto_join');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        sessionStorage.removeItem('church_auto_join');
        setSession(s);
      } catch {}
    }
  }, []);

  if (session) {
    return <SermonSession session={session} onLeave={() => { setSession(null); setMode(null); }} />;
  }

  if (mode === 'quickstart') {
    return <PastorQuickStart onSessionCreated={setSession} onBack={() => setMode(null)} />;
  }

  if (mode === 'pastor') {
    return <PastorDashboard onSessionCreated={setSession} onBack={() => setMode(null)} />;
  }

  if (mode === 'member') {
    return <MemberJoin onJoined={setSession} onBack={() => setMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="space-y-2 mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Church className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('churchmode.pageTitle', 'Church Mode')}</h1>
          <p className="text-gray-500 text-sm">{t('churchmode.pageSubtitle', 'Follow along with your sermon in real-time')}</p>
        </div>

        {/* Quick Start — primary CTA */}
        <div
          onClick={() => setMode('quickstart')}
          className="cursor-pointer rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-6 flex items-start gap-4 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 transition-colors">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-gray-900">Sunday Quick Start</p>
              <span className="text-xs bg-amber-400 text-white font-bold px-2 py-0.5 rounded-full">FASTEST</span>
            </div>
            <p className="text-sm text-gray-500">10-second setup. Name, title, verse → instant session code. Perfect for busy pastors.</p>
          </div>
        </div>

        <Card
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-indigo-400 group"
          onClick={() => setMode('pastor')}
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors flex-shrink-0">
              <Church className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">{t('churchmode.pastorLabel', 'Pastor / Leader Setup')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('churchmode.pastorDesc', 'Full setup: church profile, sermon details, language, session history')}</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-400 group"
          onClick={() => setMode('member')}
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">{t('churchmode.memberLabel', "I'm a Church Member")}</p>
              <p className="text-sm text-gray-500 mt-1">{t('churchmode.memberDesc', 'Enter the session code your pastor shared to follow along')}</p>
            </div>
          </CardContent>
        </Card>

        <Link to={createPageUrl('PastorAdminDashboard')} className="block">
          <div className="flex items-center justify-center gap-2 py-2.5 text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Pastor Admin Dashboard →
          </div>
        </Link>
      </div>
    </div>
  );
}