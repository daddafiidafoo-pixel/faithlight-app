import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Send, Edit2, Trash2, MessageCircle, Calendar, User, BookOpen, Flag } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  low: 'text-gray-500', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-600',
};

export default function TaskDetailModal({ task, user, collaborators = [], canEdit, onClose, onUpdated, onDeleted }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, assignee_id: task.assignee_id || '', due_date: task.due_date ? task.due_date.split('T')[0] : '', bible_reference: task.bible_reference || '' });

  useEffect(() => {
    loadComments();
    const unsub = base44.entities.TaskComment.subscribe(ev => {
      if (ev.data?.task_id === task.id) loadComments();
    });
    return unsub;
  }, [task.id]);

  const loadComments = async () => {
    const data = await base44.entities.TaskComment.filter({ task_id: task.id }, 'created_date', 100).catch(() => []);
    setComments(data.filter(c => !c.is_deleted));
    setLoadingComments(false);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    // Extract @mentions
    const mentionMatches = newComment.match(/@(\w+)/g) || [];
    const mentions = collaborators
      .filter(c => mentionMatches.some(m => c.user_name?.toLowerCase().includes(m.slice(1).toLowerCase())))
      .map(c => c.user_id);

    await base44.entities.TaskComment.create({
      task_id: task.id,
      project_id: task.project_id,
      user_id: user.id,
      user_name: user.full_name,
      content: newComment.trim(),
      mentions,
    });
    setNewComment('');
    setSubmitting(false);
    await loadComments();

    // Notify mentioned users
    if (mentions.length > 0) {
      mentions.forEach(uid => {
        base44.entities.AppNotification?.create?.({
          user_id: uid,
          title: `${user.full_name} mentioned you`,
          body: `In task "${task.title}": ${newComment.slice(0, 80)}`,
          type: 'mention',
        }).catch(() => {});
      });
    }
  };

  const deleteComment = async (id) => {
    await base44.entities.TaskComment.update(id, { is_deleted: true });
    await loadComments();
  };

  const saveEdit = async () => {
    const assignee = collaborators.find(c => c.user_id === editData.assignee_id);
    await base44.entities.ProjectTask.update(task.id, {
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      status: editData.status,
      assignee_id: editData.assignee_id || null,
      assignee_name: assignee?.user_name || null,
      due_date: editData.due_date ? new Date(editData.due_date).toISOString() : null,
      bible_reference: editData.bible_reference || null,
    });
    setEditing(false);
    onUpdated();
  };

  const allMembers = [{ user_id: user?.id, user_name: user?.full_name }, ...collaborators];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {editing ? (
            <Input value={editData.title} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} className="font-semibold text-base flex-1 mr-4" />
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h2>
          )}
          <div className="flex items-center gap-2">
            {canEdit && !editing && <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Edit2 className="w-4 h-4" /></Button>}
            {canEdit && !editing && <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => { onDeleted(task.id); onClose(); }}><Trash2 className="w-4 h-4" /></Button>}
            {editing && <><Button size="sm" onClick={saveEdit}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></>}
            <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Meta fields */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {editing ? (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <Select value={editData.status} onValueChange={v => setEditData(d => ({ ...d, status: v }))}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['todo','in_progress','review','completed','blocked'].map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                  <Select value={editData.priority} onValueChange={v => setEditData(d => ({ ...d, priority: v }))}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['low','medium','high','urgent'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Assignee</label>
                  <Select value={editData.assignee_id} onValueChange={v => setEditData(d => ({ ...d, assignee_id: v }))}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Unassigned</SelectItem>
                      {allMembers.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.user_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                  <Input type="date" value={editData.due_date} onChange={e => setEditData(d => ({ ...d, due_date: e.target.value }))} className="h-8" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Bible Reference</label>
                  <Input placeholder="e.g. John 3:16" value={editData.bible_reference} onChange={e => setEditData(d => ({ ...d, bible_reference: e.target.value }))} className="h-8" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-600"><Flag className={`w-4 h-4 ${PRIORITY_COLORS[task.priority]}`} /><span className="capitalize">{task.priority} priority</span></div>
                <div className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4 text-gray-400" />{task.assignee_name || <span className="text-gray-400">Unassigned</span>}</div>
                {task.due_date && <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4 text-gray-400" />{format(new Date(task.due_date), 'MMM d, yyyy')}</div>}
                {task.bible_reference && <div className="flex items-center gap-2 text-indigo-600"><BookOpen className="w-4 h-4" />{task.bible_reference}</div>}
              </>
            )}
          </div>

          {/* Description */}
          {editing ? (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <Textarea value={editData.description} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} rows={3} placeholder="Task description..." />
            </div>
          ) : task.description ? (
            <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
          ) : null}

          {/* Comments */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4" /> Comments ({comments.length})
            </h4>
            {loadingComments ? (
              <p className="text-xs text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                      {c.user_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">{c.user_name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">{format(new Date(c.created_date), 'MMM d, h:mm a')}</span>
                          {c.user_id === user?.id && (
                            <button onClick={() => deleteComment(c.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.full_name?.[0] || '?'}
            </div>
            <Input
              placeholder="Add a comment... Use @name to mention"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
              className="flex-1 bg-white"
            />
            <Button size="icon" onClick={submitComment} disabled={submitting || !newComment.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}