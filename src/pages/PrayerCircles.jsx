import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Heart, Lock, Copy, Check, Send, Crown, X, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function CreateCircleModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Please enter a circle name');
    setSaving(true);
    const circle = await base44.entities.PrayerCircle.create({
      name: name.trim(),
      description: desc.trim(),
      ownerEmail: user.email,
      memberEmails: [user.email],
      inviteCode: generateInviteCode(),
      isPrivate: true,
    });
    setSaving(false);
    toast.success('Circle created!');
    onCreated(circle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">New Prayer Circle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Circle Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Family Prayer, Small Group..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this circle for?" rows={3} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleCreate} disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700">
            {saving ? 'Creating…' : 'Create Circle'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function JoinCircleModal({ onClose, onJoined }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);
    const circles = await base44.entities.PrayerCircle.filter({ inviteCode: code.trim().toUpperCase() });
    if (!circles.length) { toast.error('Invalid invite code'); setJoining(false); return; }
    const circle = circles[0];
    if (circle.memberEmails?.includes(user.email)) {
      toast.info('You are already in this circle');
      setJoining(false);
      return;
    }
    await base44.entities.PrayerCircle.update(circle.id, {
      memberEmails: [...(circle.memberEmails || []), user.email],
    });
    toast.success(`Joined "${circle.name}"!`);
    onJoined();
    onClose();
    setJoining(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Join a Circle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <Input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code (e.g. ABC123)"
          className="mb-4 font-mono text-center text-lg tracking-widest"
          maxLength={6}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleJoin} disabled={joining || !code.trim()} className="flex-1 bg-purple-600 hover:bg-purple-700">
            {joining ? 'Joining…' : 'Join'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CircleDetail({ circle, userEmail, onBack }) {
  const queryClient = useQueryClient();
  const [newRequest, setNewRequest] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['circleRequests', circle.id],
    queryFn: () => base44.entities.CirclePrayerRequest.filter({ circleId: circle.id }, '-created_date'),
  });

  const addRequestMutation = useMutation({
    mutationFn: () => base44.entities.CirclePrayerRequest.create({
      circleId: circle.id,
      authorEmail: userEmail,
      authorName: userEmail.split('@')[0],
      requestText: newRequest.trim(),
      prayedByEmails: [],
      prayedCount: 0,
      isAnswered: false,
    }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['circleRequests', circle.id] });
      const prev = queryClient.getQueryData(['circleRequests', circle.id]);
      const optimistic = {
        id: `temp-${Date.now()}`,
        circleId: circle.id,
        authorEmail: userEmail,
        authorName: userEmail.split('@')[0],
        requestText: newRequest.trim(),
        prayedByEmails: [],
        prayedCount: 0,
        isAnswered: false,
        created_date: new Date().toISOString(),
      };
      queryClient.setQueryData(['circleRequests', circle.id], old => [optimistic, ...(old || [])]);
      setNewRequest('');
      return { prev };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['circleRequests', circle.id] }); },
    onError: (e, v, ctx) => {
      queryClient.setQueryData(['circleRequests', circle.id], ctx.prev);
      toast.error('Failed to post request');
    },
  });

  const prayMutation = useMutation({
    mutationFn: async (req) => {
      const alreadyPrayed = req.prayedByEmails?.includes(userEmail);
      const newList = alreadyPrayed
        ? req.prayedByEmails.filter(e => e !== userEmail)
        : [...(req.prayedByEmails || []), userEmail];
      return base44.entities.CirclePrayerRequest.update(req.id, {
        prayedByEmails: newList,
        prayedCount: newList.length,
      });
    },
    onMutate: async (req) => {
      await queryClient.cancelQueries({ queryKey: ['circleRequests', circle.id] });
      const prev = queryClient.getQueryData(['circleRequests', circle.id]);
      const alreadyPrayed = req.prayedByEmails?.includes(userEmail);
      queryClient.setQueryData(['circleRequests', circle.id], old =>
        (old || []).map(r => r.id !== req.id ? r : {
          ...r,
          prayedByEmails: alreadyPrayed
            ? r.prayedByEmails.filter(e => e !== userEmail)
            : [...(r.prayedByEmails || []), userEmail],
          prayedCount: alreadyPrayed ? (r.prayedCount || 1) - 1 : (r.prayedCount || 0) + 1,
        })
      );
      return { prev };
    },
    onError: (e, v, ctx) => queryClient.setQueryData(['circleRequests', circle.id], ctx.prev),
  });

  const copyCode = () => {
    navigator.clipboard.writeText(circle.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = circle.ownerEmail === userEmail;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b px-5 py-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="text-sm text-indigo-600 mb-2 flex items-center gap-1">← All Circles</button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 text-xl">{circle.name}</h2>
                {isOwner && <Crown size={14} className="text-amber-500" />}
              </div>
              {circle.description && <p className="text-sm text-gray-500 mt-0.5">{circle.description}</p>}
              <p className="text-xs text-gray-400 mt-1">{circle.memberEmails?.length || 1} members</p>
            </div>
            <button onClick={copyCode} className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-2 rounded-xl border border-purple-200 font-mono font-bold">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {circle.inviteCode}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Add request */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">Share a Prayer Request</p>
          <Textarea
            value={newRequest}
            onChange={e => setNewRequest(e.target.value)}
            placeholder="What would you like the circle to pray for?"
            rows={3}
            className="text-sm mb-3"
          />
          <Button
            onClick={() => addRequestMutation.mutate()}
            disabled={!newRequest.trim() || addRequestMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Send size={14} /> Share Request
          </Button>
        </div>

        {/* Requests list */}
        {isLoading && <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}</div>}

        {!isLoading && requests.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <HandHeart size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No requests yet. Be the first to share!</p>
          </div>
        )}

        {requests.map(req => {
          const hasPrayed = req.prayedByEmails?.includes(userEmail);
          return (
            <div key={req.id} className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                  {req.authorName?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs font-semibold text-gray-700">{req.authorName || req.authorEmail.split('@')[0]}</span>
                {req.isAnswered && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold ml-auto">✓ Answered</span>}
              </div>
              <p className="text-sm text-gray-800 leading-relaxed mb-3">{req.requestText}</p>
              <button
                onClick={() => prayMutation.mutate(req)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  hasPrayed
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
                }`}
              >
                <Heart size={14} fill={hasPrayed ? 'currentColor' : 'none'} />
                {hasPrayed ? 'Praying' : 'I\'ll Pray'}
                {(req.prayedCount > 0) && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${hasPrayed ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
                    {req.prayedCount}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PrayerCirclesPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);

  const { data: circles = [], isLoading } = useQuery({
    queryKey: ['prayerCircles', user?.email],
    queryFn: async () => {
      const owned = await base44.entities.PrayerCircle.filter({ ownerEmail: user.email });
      const all = await base44.entities.PrayerCircle.list('-created_date', 100);
      const joined = all.filter(c => c.memberEmails?.includes(user.email) && c.ownerEmail !== user.email);
      return [...owned, ...joined];
    },
    enabled: isAuthenticated && !!user?.email,
  });

  if (selectedCircle) {
    return <CircleDetail circle={selectedCircle} userEmail={user.email} onBack={() => setSelectedCircle(null)} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Users size={40} className="text-purple-400 mx-auto" />
          <p className="text-gray-600">Sign in to access Prayer Circles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {showCreate && <CreateCircleModal onClose={() => setShowCreate(false)} onCreated={() => queryClient.invalidateQueries({ queryKey: ['prayerCircles', user.email] })} />}
      {showJoin && <JoinCircleModal onClose={() => setShowJoin(false)} onJoined={() => queryClient.invalidateQueries({ queryKey: ['prayerCircles', user.email] })} />}

      {/* Header */}
      <div className="bg-white border-b px-5 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-purple-600" /> Prayer Circles
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Private groups for shared prayer</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => setShowCreate(true)} className="bg-purple-600 hover:bg-purple-700 gap-1.5 flex-1">
              <Plus size={14} /> New Circle
            </Button>
            <Button onClick={() => setShowJoin(true)} variant="outline" className="gap-1.5 flex-1">
              <Lock size={14} /> Join with Code
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {isLoading && [1,2].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}

        {!isLoading && circles.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
              <Users size={28} className="text-purple-500" />
            </div>
            <h3 className="font-semibold text-gray-800">No circles yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Create a private prayer circle or join one with an invite code.</p>
          </div>
        )}

        {circles.map(circle => {
          const isOwner = circle.ownerEmail === user.email;
          return (
            <button
              key={circle.id}
              onClick={() => setSelectedCircle(circle)}
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 text-left hover:border-purple-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-900">{circle.name}</p>
                      {isOwner && <Crown size={12} className="text-amber-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{circle.memberEmails?.length || 1} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {circle.isPrivate && <Lock size={12} className="text-gray-400" />}
                  <span className="text-gray-400 text-xs">›</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}