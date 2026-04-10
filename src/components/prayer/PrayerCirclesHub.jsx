import React, { useState, useEffect } from 'react';
import { Users, Plus, Copy, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import CreateCircleModal from './CreateCircleModal';
import PrayerCircleChat from './PrayerCircleChat';

export default function PrayerCirclesHub({ userEmail, userName, uiLang }) {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (userEmail) loadCircles();
  }, [userEmail]);

  const loadCircles = async () => {
    setLoading(true);
    try {
      const userCircles = await base44.entities.PrayerCircle.filter(
        { creatorEmail: userEmail },
        '-created_date',
        50
      ) || [];

      const joinedCircles = await base44.entities.PrayerCircle.filter(
        {},
        '-created_date',
        100
      ) || [];

      const memberCircles = joinedCircles.filter(c => c.memberEmails?.includes(userEmail));

      const allCircles = [...userCircles, ...memberCircles.filter(mc => !userCircles.find(uc => uc.id === mc.id))];
      setCircles(allCircles);
    } catch (err) {
      console.error('Failed to load circles:', err);
      toast.error(t(uiLang, 'circles.loadError') || 'Failed to load circles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCircle = async (circleData) => {
    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const created = await base44.entities.PrayerCircle.create({
        ...circleData,
        creatorEmail: userEmail,
        creatorName: userName,
        inviteCode,
        memberEmails: [userEmail],
        memberCount: 1,
      });
      setCircles(prev => [created, ...prev]);
      setShowCreateModal(false);
      toast.success(t(uiLang, 'circles.created') || 'Prayer circle created');
    } catch (err) {
      console.error('Failed to create circle:', err);
      toast.error(t(uiLang, 'circles.createError') || 'Failed to create circle');
    }
  };

  const handleJoinCircle = async () => {
    if (!joinCode.trim()) return;

    try {
      const circle = circles.find(c => c.inviteCode === joinCode.toUpperCase());
      if (!circle) {
        toast.error(t(uiLang, 'circles.invalidCode') || 'Invalid invite code');
        return;
      }

      if ((circle.memberEmails || []).includes(userEmail)) {
        toast.error(t(uiLang, 'circles.alreadyMember') || 'You\'re already a member');
        return;
      }

      if (circle.memberCount >= circle.maxMembers) {
        toast.error(t(uiLang, 'circles.full') || 'Circle is full');
        return;
      }

      const updated = {
        memberEmails: [...(circle.memberEmails || []), userEmail],
        memberCount: (circle.memberCount || 0) + 1,
      };

      await base44.entities.PrayerCircle.update(circle.id, updated);
      setCircles(prev => prev.map(c => c.id === circle.id ? { ...c, ...updated } : c));
      setJoinCode('');
      toast.success(t(uiLang, 'circles.joined') || 'Joined prayer circle');
    } catch (err) {
      console.error('Failed to join circle:', err);
      toast.error(t(uiLang, 'circles.joinError') || 'Failed to join circle');
    }
  };

  if (selectedCircle) {
    return (
      <PrayerCircleChat
        circle={selectedCircle}
        userEmail={userEmail}
        userName={userName}
        uiLang={uiLang}
        onBack={() => setSelectedCircle(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Users size={24} className="text-blue-600" />
            {t(uiLang, 'circles.title') || 'Prayer Circles'}
          </h1>
          <p className="text-sm text-gray-600">
            {t(uiLang, 'circles.subtitle') || 'Connect with others in prayer'}
          </p>
        </div>

        {/* Create Circle Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full min-h-[44px] mb-4 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          {t(uiLang, 'circles.createNew') || 'Create Circle'}
        </button>

        {/* Join Circle */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t(uiLang, 'circles.joinWithCode') || 'Join with Invite Code'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm font-semibold tracking-wider"
            />
            <button
              onClick={handleJoinCircle}
              className="px-4 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              {t(uiLang, 'common.join') || 'Join'}
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateCircleModal
            onCreate={handleCreateCircle}
            onClose={() => setShowCreateModal(false)}
            uiLang={uiLang}
          />
        )}

        {/* Circles List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : circles.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">{t(uiLang, 'circles.noCircles') || 'No prayer circles yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {circles.map(circle => (
              <div key={circle.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{circle.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{circle.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {circle.memberCount} / {circle.maxMembers} {t(uiLang, 'circles.members') || 'members'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(circle.inviteCode);
                      toast.success(t(uiLang, 'circles.codeCopied') || 'Code copied');
                    }}
                    className="p-2 min-h-[44px] min-w-[44px] text-gray-400 hover:text-gray-600"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <button
                  onClick={() => setSelectedCircle(circle)}
                  className="w-full min-h-[44px] bg-blue-50 text-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-100"
                >
                  <MessageCircle size={16} />
                  {t(uiLang, 'circles.viewChat') || 'View Chat'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}