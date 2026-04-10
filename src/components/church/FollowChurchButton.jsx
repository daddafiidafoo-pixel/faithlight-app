import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, BellOff, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FollowChurchButton({ churchId, churchName, compact = false }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followRecord, setFollowRecord] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) { setLoading(false); return; }
        const u = await base44.auth.me();
        setUser(u);
        const existing = await base44.entities.ChurchFollower.filter({ user_id: u.id, church_id: churchId });
        if (existing?.length > 0) { setFollowing(true); setFollowRecord(existing[0]); }
      } catch { /* guest */ }
      setLoading(false);
    };
    init();
  }, [churchId]);

  const handleToggle = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setLoading(true);
    try {
      if (following && followRecord) {
        await base44.entities.ChurchFollower.delete(followRecord.id);
        setFollowing(false);
        setFollowRecord(null);
      } else {
        const record = await base44.entities.ChurchFollower.create({
          user_id: user.id,
          church_id: churchId,
          notification_enabled: true,
        });
        setFollowing(true);
        setFollowRecord(record);
      }
    } catch (e) {
      console.error('Follow toggle error:', e);
    }
    setLoading(false);
  };

  if (compact) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '6px 14px', borderRadius: 20,
          border: following ? '1px solid #6C5CE7' : '1px solid #E5E7EB',
          background: following ? '#EEF2FF' : 'white',
          color: following ? '#6C5CE7' : '#6B7280',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {following ? <Bell size={13} /> : <BellOff size={13} />}
        {following ? 'Following' : 'Follow'}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handleToggle}
      disabled={loading}
      style={{
        width: '100%', height: 46, borderRadius: 12,
        border: following ? '1.5px solid #6C5CE7' : '1.5px solid #E5E7EB',
        background: following ? '#EEF2FF' : 'white',
        color: following ? '#6C5CE7' : '#374151',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.2s',
      }}
    >
      {following ? <><Check size={16} /> Following {churchName}</> : <><Bell size={16} /> Follow {churchName}</>}
    </motion.button>
  );
}