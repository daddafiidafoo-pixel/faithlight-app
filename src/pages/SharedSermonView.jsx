import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, BookOpen, Lock, Eye, Edit3, Sparkles } from 'lucide-react';
import SermonOutlineViewer from '../components/sermon/SermonOutlineViewer';
import SermonCommentPanel from '../components/sermon/SermonCommentPanel';
import { Button } from '@/components/ui/button';

export default function SharedSermonView() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sermon, setSermon] = useState(null);
  const [collaborator, setCollaborator] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!token) { setError('No invite token found in this link.'); setLoading(false); return; }
    load();
  }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('sermonGetShared', { token });
      const data = res.data;
      setSermon(data.sermon);
      setCollaborator(data.collaborator);
      setComments(data.comments || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load sermon.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-gray-600 font-medium">Loading shared sermon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'} className="bg-indigo-600 hover:bg-indigo-700">
            Go to App
          </Button>
        </div>
      </div>
    );
  }

  const outline = {
    title: sermon.title,
    big_idea: sermon.big_idea,
    outline_sections: sermon.outline_sections || [],
    supporting_verses: sermon.supporting_verses || [],
    application: sermon.application,
    closing_prayer: sermon.closing_prayer,
  };

  const isEditor = collaborator?.role === 'editor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">{sermon.title}</h1>
              <p className="text-xs text-gray-500">Shared by {collaborator?.invited_by}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium border ${
              isEditor
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {isEditor ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {isEditor ? 'Editor' : 'Viewer'}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Viewer notice if read-only */}
        {!isEditor && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">You are viewing this sermon in <strong>read-only</strong> mode. Comments are disabled.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sermon content */}
          <div className="lg:col-span-2">
            {/* Big idea */}
            {outline.big_idea && (
              <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Big Idea</p>
                <p className="text-base font-medium text-indigo-900">{outline.big_idea}</p>
              </div>
            )}
            <SermonOutlineViewer outline={outline} voiceNotes={[]} onAddVoiceNote={() => {}} onDeleteVoiceNote={() => {}} />
          </div>

          {/* Comment panel */}
          <div className="lg:col-span-1">
            <SermonCommentPanel
              sermonId={sermon.id}
              sections={outline.outline_sections || []}
              collaborator={collaborator}
              isOwner={false}
              initialComments={comments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}