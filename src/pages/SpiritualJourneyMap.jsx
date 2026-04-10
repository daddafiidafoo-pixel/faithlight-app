import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocale } from '@/components/lib/useLocale';
import { Trophy, Lock, Star, MapPin, ChevronRight, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

// ── Map Nodes Definition ──────────────────────────────────────────
const MAP_NODES = [
  {
    id: 'garden_of_eden', label: 'Garden of Eden', emoji: '🌿', chaptersRequired: 0,
    description: 'Every journey begins here. Welcome to God\'s Word!',
    badge: 'Genesis Wanderer', color: '#16a34a', x: 15, y: 78,
    books: ['Genesis 1-2'],
  },
  {
    id: 'mount_ararat', label: 'Mount Ararat', emoji: '🏔️', chaptersRequired: 5,
    description: 'The resting place of Noah\'s ark after the great flood.',
    badge: 'Covenant Keeper', color: '#0891b2', x: 28, y: 65,
    books: ['Genesis 6-9'],
  },
  {
    id: 'babel', label: 'Tower of Babel', emoji: '🏗️', chaptersRequired: 12,
    description: 'Where languages were scattered across the earth.',
    badge: 'World Explorer', color: '#d97706', x: 40, y: 70,
    books: ['Genesis 11'],
  },
  {
    id: 'ur_of_chaldees', label: 'Ur of the Chaldees', emoji: '🏛️', chaptersRequired: 20,
    description: 'Abraham\'s birthplace — the start of God\'s covenant people.',
    badge: 'Father of Nations', color: '#7c3aed', x: 55, y: 75,
    books: ['Genesis 12'],
  },
  {
    id: 'canaan', label: 'Land of Canaan', emoji: '🌾', chaptersRequired: 40,
    description: 'The Promised Land — flowing with milk and honey.',
    badge: 'Promise Holder', color: '#059669', x: 30, y: 50,
    books: ['Genesis 12-50'],
  },
  {
    id: 'egypt', label: 'Egypt', emoji: '🛕', chaptersRequired: 60,
    description: 'Land of the Pharaohs, slavery, and miraculous deliverance.',
    badge: 'Delivered Soul', color: '#dc2626', x: 18, y: 55,
    books: ['Exodus 1-12'],
  },
  {
    id: 'mount_sinai', label: 'Mount Sinai', emoji: '⚡', chaptersRequired: 90,
    description: 'Where Moses received the Ten Commandments from God.',
    badge: 'Law Bearer', color: '#f59e0b', x: 22, y: 65,
    books: ['Exodus 20'],
  },
  {
    id: 'wilderness', label: 'Wilderness of Sinai', emoji: '🏜️', chaptersRequired: 130,
    description: '40 years of wandering — learning to trust God\'s provision.',
    badge: 'Desert Walker', color: '#a16207', x: 30, y: 70,
    books: ['Numbers'],
  },
  {
    id: 'jericho', label: 'Jericho', emoji: '🔱', chaptersRequired: 180,
    description: 'The walls fell! Israel\'s first conquest in the Promised Land.',
    badge: 'Wall Breaker', color: '#b45309', x: 35, y: 48,
    books: ['Joshua 6'],
  },
  {
    id: 'jerusalem', label: 'Jerusalem', emoji: '🕍', chaptersRequired: 260,
    description: 'The City of David — the heart of Israel\'s worship and history.',
    badge: 'Zion Pilgrim', color: '#4f46e5', x: 32, y: 44,
    books: ['2 Samuel 5', 'Psalms'],
  },
  {
    id: 'babylon', label: 'Babylon', emoji: '🏰', chaptersRequired: 400,
    description: 'The exile — where Daniel and others kept faith in captivity.',
    badge: 'Faithful Exile', color: '#7e22ce', x: 58, y: 68,
    books: ['Daniel', 'Ezekiel'],
  },
  {
    id: 'bethlehem', label: 'Bethlehem', emoji: '⭐', chaptersRequired: 500,
    description: 'City of David — birthplace of Jesus Christ, Savior of the world.',
    badge: 'Star Follower', color: '#fbbf24', x: 33, y: 47,
    books: ['Luke 2', 'Matthew 2'],
  },
  {
    id: 'galilee', label: 'Sea of Galilee', emoji: '🌊', chaptersRequired: 600,
    description: 'Jesus walked on water here and called his first disciples.',
    badge: 'Disciple Called', color: '#0ea5e9', x: 36, y: 40,
    books: ['Matthew 4', 'John 6'],
  },
  {
    id: 'calvary', label: 'Calvary (Golgotha)', emoji: '✝️', chaptersRequired: 800,
    description: 'The hill where Jesus gave his life for the sins of the world.',
    badge: 'Cross Bearer', color: '#dc2626', x: 31, y: 43,
    books: ['John 19', 'Luke 23'],
  },
  {
    id: 'empty_tomb', label: 'Garden Tomb', emoji: '🌅', chaptersRequired: 900,
    description: 'He is risen! The empty tomb — foundation of Christian hope.',
    badge: 'Resurrection Witness', color: '#f59e0b', x: 31, y: 42,
    books: ['John 20', 'Matthew 28'],
  },
  {
    id: 'road_to_damascus', label: 'Road to Damascus', emoji: '✨', chaptersRequired: 1000,
    description: 'Paul\'s dramatic encounter with the risen Christ.',
    badge: 'Damascus Transformed', color: '#8b5cf6', x: 40, y: 36,
    books: ['Acts 9'],
  },
  {
    id: 'rome', label: 'Rome', emoji: '🏛️', chaptersRequired: 1100,
    description: 'The Gospel reaches the capital of the known world.',
    badge: 'Gospel to the Nations', color: '#dc2626', x: 15, y: 30,
    books: ['Romans', 'Acts 28'],
  },
  {
    id: 'patmos', label: 'Island of Patmos', emoji: '🌋', chaptersRequired: 1189,
    description: 'John\'s exile — where Revelation was written. The full journey complete!',
    badge: 'Bible Finisher 🎉', color: '#312e81', x: 20, y: 38,
    books: ['Revelation'],
  },
];

// ── Connection lines (simplified) ────────────────────────────────
const CONNECTIONS = [
  ['garden_of_eden', 'mount_ararat'], ['mount_ararat', 'babel'], ['babel', 'ur_of_chaldees'],
  ['ur_of_chaldees', 'canaan'], ['canaan', 'egypt'], ['egypt', 'mount_sinai'],
  ['mount_sinai', 'wilderness'], ['wilderness', 'jericho'], ['jericho', 'jerusalem'],
  ['jerusalem', 'babylon'], ['babylon', 'bethlehem'], ['bethlehem', 'galilee'],
  ['galilee', 'calvary'], ['calvary', 'empty_tomb'], ['empty_tomb', 'road_to_damascus'],
  ['road_to_damascus', 'rome'], ['rome', 'patmos'],
];

function BadgeCard({ node, unlocked }) {
  return (
    <div className={`rounded-2xl p-3 border transition-all ${unlocked ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${unlocked ? 'shadow-sm' : 'grayscale'}`}
          style={{ background: unlocked ? `${node.color}20` : '#f3f4f6' }}>
          {node.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-xs font-extrabold truncate ${unlocked ? 'text-gray-900' : 'text-gray-400'}`}>{node.label}</p>
            {!unlocked && <Lock className="w-3 h-3 text-gray-300 flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-400 truncate">{node.badge}</p>
        </div>
        {unlocked && <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SpiritualJourneyMap() {
  const { safeT, bookName, ref } = useLocale();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [tab, setTab] = useState('map');

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated().catch(() => false);
      if (isAuth) {
        const u = await base44.auth.me().catch(() => null);
        setUser(u);
        const s = await base44.entities.ReadingSession.filter({ user_id: u?.id }, '-created_date', 500).catch(() => []);
        setSessions(s);
      }
      setLoading(false);
    };
    init();
  }, []);

  const totalChapters = sessions.length;
  const unlockedNodes = useMemo(() =>
    MAP_NODES.filter(n => totalChapters >= n.chaptersRequired),
    [totalChapters]
  );
  const nextNode = MAP_NODES.find(n => totalChapters < n.chaptersRequired);
  const progressPct = nextNode
    ? Math.round((totalChapters / nextNode.chaptersRequired) * 100)
    : 100;

  const shareProfile = () => {
    const earned = unlockedNodes.map(n => n.emoji).join('');
    const text = `I've read ${totalChapters} chapters and unlocked ${unlockedNodes.length} locations on my Biblical journey! ${earned} — FaithLight App`;
    if (navigator.share) navigator.share({ title: 'My Spiritual Journey', text });
    else { navigator.clipboard.writeText(text); toast.success('Copied to clipboard!'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Spiritual Journey Map</h2>
        <p className="text-gray-500 text-sm mb-5">Sign in to track your journey through biblical lands as you read.</p>
        <button onClick={() => base44.auth.redirectToLogin()}
          className="bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-800 transition-colors">
          Sign In to Start Journey
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🗺️</span> {safeT('journey.title', 'Spiritual Journey Map')}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{safeT('journey.subtitle', 'Walk through biblical lands as you read')}</p>
          </div>
          <button onClick={shareProfile} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Chapters Read', value: totalChapters, emoji: '📖' },
            { label: 'Lands Unlocked', value: unlockedNodes.length, emoji: '📍' },
            { label: 'Badges Earned', value: unlockedNodes.length, emoji: '🏆' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
              <div className="text-xl mb-0.5">{s.emoji}</div>
              <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Next unlock progress */}
        {nextNode && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{nextNode.emoji}</span>
                <div>
                  <p className="text-xs font-extrabold text-gray-900">Next: {nextNode.label}</p>
                  <p className="text-xs text-gray-500">{nextNode.chaptersRequired - totalChapters} more chapters to unlock</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-indigo-600">{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-5 shadow-sm">
          {[['map', '🗺️ Map View'], ['badges', '🏆 Badges'], ['profile', '👤 Profile Card']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${tab === v ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-indigo-600'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* MAP VIEW */}
        {tab === 'map' && (
          <div>
            <div className="relative bg-gradient-to-br from-sky-100 via-amber-50 to-green-100 rounded-3xl border border-amber-200 shadow-lg overflow-hidden"
              style={{ height: 420 }}>
              
              {/* Background decorative */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-24 bg-blue-300 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-32 bg-amber-300 rounded-full blur-3xl" />
              </div>

              <p className="absolute top-3 left-3 text-xs font-bold text-gray-500 opacity-70">Biblical Near East</p>

              {/* SVG Connections */}
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                {CONNECTIONS.map(([fromId, toId]) => {
                  const from = MAP_NODES.find(n => n.id === fromId);
                  const to = MAP_NODES.find(n => n.id === toId);
                  if (!from || !to) return null;
                  const unlocked = totalChapters >= to.chaptersRequired;
                  return (
                    <line key={`${fromId}-${toId}`}
                      x1={`${from.x}%`} y1={`${from.y}%`}
                      x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke={unlocked ? '#6366f1' : '#d1d5db'}
                      strokeWidth="1.5" strokeDasharray={unlocked ? '0' : '4 4'}
                      opacity={0.6} />
                  );
                })}
              </svg>

              {/* Nodes */}
              {MAP_NODES.map(node => {
                const unlocked = totalChapters >= node.chaptersRequired;
                const isCurrent = unlockedNodes[unlockedNodes.length - 1]?.id === node.id;
                return (
                  <button key={node.id}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                    <div className={`relative flex items-center justify-center rounded-full text-lg transition-all
                      ${unlocked ? 'shadow-md hover:scale-110' : 'grayscale opacity-40'}
                      ${isCurrent ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110' : ''}
                      w-9 h-9`}
                      style={{ background: unlocked ? `${node.color}25` : '#f3f4f6', border: `2px solid ${unlocked ? node.color : '#d1d5db'}` }}>
                      {unlocked ? node.emoji : <Lock className="w-3.5 h-3.5 text-gray-400" />}
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs font-extrabold leading-none max-w-16 text-center ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}
                      style={{ fontSize: '0.6rem' }}>
                      {node.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected node detail */}
            {selectedNode && (
              <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-md p-4"
                style={{ borderTop: `3px solid ${selectedNode.color}` }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{selectedNode.emoji}</span>
                    <div>
                      <p className="font-extrabold text-gray-900">{selectedNode.label}</p>
                      <p className="text-xs text-gray-500">{selectedNode.description}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-300 hover:text-gray-500 text-lg">×</button>
                </div>
                {totalChapters >= selectedNode.chaptersRequired ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700">Badge Earned: {selectedNode.badge}</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    🔒 Unlock at <span className="font-bold text-indigo-600">{selectedNode.chaptersRequired} chapters</span> ({selectedNode.chaptersRequired - totalChapters} more to go)
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* BADGES VIEW */}
        {tab === 'badges' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-bold mb-3">
              {unlockedNodes.length}/{MAP_NODES.length} badges earned · {totalChapters} chapters read
            </p>
            {MAP_NODES.map(node => (
              <BadgeCard key={node.id} node={node} unlocked={totalChapters >= node.chaptersRequired} />
            ))}
          </div>
        )}

        {/* PROFILE CARD */}
        {tab === 'profile' && (
          <div>
            <div className="rounded-3xl overflow-hidden shadow-xl border border-indigo-100"
              style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)' }}>
              {/* Card header */}
              <div className="p-5 pb-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                    {user.full_name?.[0] || '✝'}
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-lg">{user.full_name}</p>
                    <p className="text-indigo-300 text-xs">{user.email}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Chapters', value: totalChapters, emoji: '📖' },
                    { label: 'Locations', value: unlockedNodes.length, emoji: '📍' },
                    { label: 'Badges', value: unlockedNodes.length, emoji: '🏆' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
                      <p className="text-white font-extrabold text-lg">{s.value}</p>
                      <p className="text-indigo-300 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Current location */}
                {unlockedNodes.length > 0 && (
                  <div className="bg-white/10 rounded-2xl p-3 mb-3">
                    <p className="text-indigo-300 text-xs mb-1">📍 Current Location</p>
                    <p className="text-white font-extrabold">
                      {unlockedNodes[unlockedNodes.length - 1].emoji} {unlockedNodes[unlockedNodes.length - 1].label}
                    </p>
                    <p className="text-indigo-200 text-xs mt-0.5">{unlockedNodes[unlockedNodes.length - 1].description}</p>
                  </div>
                )}
              </div>

              {/* Badge grid */}
              <div className="px-5 pb-5">
                <p className="text-indigo-300 text-xs font-bold mb-2">Earned Badges</p>
                <div className="flex flex-wrap gap-2">
                  {unlockedNodes.map(n => (
                    <div key={n.id} title={n.badge}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm"
                      style={{ background: `${n.color}30`, border: `1.5px solid ${n.color}60` }}>
                      {n.emoji}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 8 - unlockedNodes.length) }).map((_, i) => (
                    <div key={i} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={shareProfile}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Share2 className="w-4 h-4" /> Share My Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
}