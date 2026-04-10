/**
 * LiveSermonAlert
 * Shows a banner/card when a followed church has a live sermon session.
 * Polls every 60s for active sessions from followed churches.
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Radio, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function LiveSermonAlert() {
  const [liveSession, setLiveSession] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const u = await base44.auth.me();
        setUser(u);
        checkLiveSessions(u.id);
      } catch { /* guest */ }
    };
    init();
  }, []);

  // Poll every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => checkLiveSessions(user.id), 60000);
    return () => clearInterval(interval);
  }, [user]);

  const checkLiveSessions = async (userId) => {
    try {
      // Get churches this user follows
      const followed = await base44.entities.ChurchFollower.filter({ user_id: userId, notification_enabled: true });
      if (!followed?.length) return;
      const churchIds = followed.map(f => f.church_id);

      // Check for any active sermon sessions from followed churches
      const allSessions = await base44.entities.SermonSession.filter({ isActive: true });
      const live = allSessions?.find(s => churchIds.includes(s.churchId));
      if (live) setLiveSession(live);
    } catch { /* silently fail */ }
  };

  if (!liveSession || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{
          background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
          borderRadius: 16, padding: '14px 16px',
          marginBottom: 16,
          boxShadow: '0px 6px 18px rgba(220,38,38,0.25)',
          position: 'relative',
        }}
      >
        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}
        >
          <X size={16} />
        </button>

        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px' }}>
            <Radio size={12} color="white" />
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>LIVE NOW</span>
          </div>
        </div>

        <p style={{ color: 'white', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>
          {liveSession.churchName || 'Your Church'} is live
        </p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 12px' }}>
          {liveSession.title || 'Sermon session in progress'}
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(createPageUrl(`ChurchMode?session=${liveSession.id}`))}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'white', color: '#DC2626',
            border: 'none', borderRadius: 10, padding: '10px 18px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Join Session <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}