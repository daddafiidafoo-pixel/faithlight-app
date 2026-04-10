import React, { useState } from 'react';
import { MessageSquare, Lightbulb, Check, X, ChevronDown, ChevronUp, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function CommentBubble({ comment, isOwner, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    open: 'border-l-gray-300',
    resolved: 'border-l-green-400 opacity-60',
    accepted: 'border-l-blue-400',
    rejected: 'border-l-red-300 opacity-60',
  };

  return (
    <div className={`border-l-4 ${statusColors[comment.status] || 'border-l-gray-300'} pl-3 py-2 bg-white rounded-r-lg border border-l-0 border-gray-100`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo-600">{comment.author_name?.[0]?.toUpperCase() || '?'}</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">{comment.author_name}</span>
            {comment.type === 'suggestion' && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                <Lightbulb className="w-3 h-3" /> Suggestion
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {comment.section_title !== 'general' && <span className="text-indigo-500 mr-1">§ {comment.section_title}</span>}
              {new Date(comment.created_date).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.comment_text}</p>

          {comment.type === 'suggestion' && comment.suggested_text && (
            <div className="mt-2">
              <button
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Hide' : 'Show'} suggested text
              </button>
              {expanded && (
                <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-sm text-blue-900 italic">
                  "{comment.suggested_text}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Owner actions */}
      {isOwner && comment.status === 'open' && (
        <div className="flex gap-1.5 mt-2">
          <button
            onClick={() => onStatusChange(comment.id, 'resolved')}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors"
          >
            <Check className="w-3 h-3" /> Resolve
          </button>
          {comment.type === 'suggestion' && (
            <>
              <button
                onClick={() => onStatusChange(comment.id, 'accepted')}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
              >
                <Check className="w-3 h-3" /> Accept
              </button>
              <button
                onClick={() => onStatusChange(comment.id, 'rejected')}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors"
              >
                <X className="w-3 h-3" /> Reject
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SermonCommentPanel({
  sermonId,
  sections = [],
  collaborator = null, // { invited_email, role }
  isOwner = false,
  initialComments = [],
}) {
  const [comments, setComments] = useState(initialComments);
  const [selectedSection, setSelectedSection] = useState('general');
  const [commentText, setCommentText] = useState('');
  const [suggestedText, setSuggestedText] = useState('');
  const [type, setType] = useState('comment');
  const [submitting, setSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  const authorEmail = collaborator?.invited_email || 'owner';
  const authorName = collaborator?.invited_email?.split('@')[0] || 'Owner';
  const canComment = isOwner || collaborator?.role === 'editor';

  const handleSubmit = async () => {
    if (!commentText.trim()) { toast.error('Enter a comment'); return; }
    setSubmitting(true);
    try {
      const sectionTitle = selectedSection === 'general'
        ? 'General'
        : sections.find(s => s.id === selectedSection)?.title || selectedSection;

      const newComment = await base44.entities.SermonComment.create({
        sermon_id: sermonId,
        section_id: selectedSection,
        section_title: sectionTitle,
        author_email: authorEmail,
        author_name: authorName,
        comment_text: commentText.trim(),
        type,
        suggested_text: type === 'suggestion' ? suggestedText.trim() : '',
        status: 'open',
      });

      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setSuggestedText('');
      toast.success(type === 'suggestion' ? 'Suggestion submitted!' : 'Comment posted!');
    } catch (e) {
      toast.error('Failed to post: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (commentId, status) => {
    try {
      await base44.entities.SermonComment.update(commentId, { status });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, status } : c));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openComments = comments.filter(c => c.status === 'open');
  const resolvedComments = comments.filter(c => c.status !== 'open');

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-sm">Comments & Suggestions</h3>
          {openComments.length > 0 && (
            <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{openComments.length}</span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Add comment form */}
        {canComment && (
          <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex gap-2 flex-wrap">
              {/* Section picker */}
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="general">📝 General (whole sermon)</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>§ {s.title}</option>
                ))}
              </select>
              {/* Type toggle */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setType('comment')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${type === 'comment' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  💬 Comment
                </button>
                <button
                  onClick={() => setType('suggestion')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${type === 'suggestion' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  💡 Suggest Edit
                </button>
              </div>
            </div>

            <Textarea
              placeholder={type === 'suggestion' ? 'Describe your suggested change...' : 'Add a comment...'}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="text-sm resize-none h-20"
            />

            {type === 'suggestion' && (
              <Textarea
                placeholder="Paste your suggested replacement text (optional)..."
                value={suggestedText}
                onChange={e => setSuggestedText(e.target.value)}
                className="text-sm resize-none h-16 bg-blue-50 border-blue-200"
              />
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || !commentText.trim()}
              size="sm"
              className={`w-full gap-2 ${type === 'suggestion' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {type === 'suggestion' ? 'Submit Suggestion' : 'Post Comment'}
            </Button>
          </div>
        )}

        {/* Open comments */}
        {openComments.length === 0 && resolvedComments.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No comments yet.</p>
            {canComment && <p className="text-xs mt-1">Be the first to leave a comment or suggestion.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {openComments.map(c => (
              <CommentBubble key={c.id} comment={c} isOwner={isOwner} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}

        {/* Resolved */}
        {resolvedComments.length > 0 && (
          <div>
            <button
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setShowResolved(!showResolved)}
            >
              {showResolved ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showResolved ? 'Hide' : 'Show'} resolved ({resolvedComments.length})
            </button>
            {showResolved && (
              <div className="space-y-2 mt-2">
                {resolvedComments.map(c => (
                  <CommentBubble key={c.id} comment={c} isOwner={false} onStatusChange={() => {}} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}