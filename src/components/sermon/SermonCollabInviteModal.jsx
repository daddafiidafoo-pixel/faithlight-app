import React, { useState, useEffect } from 'react';
import { Mail, UserPlus, Loader2, Link, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SermonCollabInviteModal({ sermon, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [sending, setSending] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loadingCollabs, setLoadingCollabs] = useState(true);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (!sermon?.id) return;
    base44.entities.SermonCollaborator.filter({ sermon_id: sermon.id })
      .then(setCollaborators)
      .catch(() => {})
      .finally(() => setLoadingCollabs(false));
  }, [sermon?.id]);

  const handleInvite = async () => {
    if (!email.trim()) { toast.error('Enter an email address'); return; }
    setSending(true);
    try {
      await base44.functions.invoke('sermonInviteCollaborator', {
        sermon_id: sermon.id,
        invited_email: email.trim().toLowerCase(),
        role,
      });
      toast.success(`Invite sent to ${email}`);
      setEmail('');
      // Refresh list
      const updated = await base44.entities.SermonCollaborator.filter({ sermon_id: sermon.id });
      setCollaborators(updated);
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      toast.error('Failed to invite: ' + msg);
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (collabId) => {
    try {
      await base44.entities.SermonCollaborator.delete(collabId);
      setCollaborators(prev => prev.filter(c => c.id !== collabId));
      toast.success('Collaborator removed');
    } catch {
      toast.error('Could not remove collaborator');
    }
  };

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/SharedSermonView?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <UserPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Invite Collaborators</h2>
              <p className="text-xs text-gray-500 truncate max-w-56">{sermon?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invite form */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Invite by email</label>
            <div className="flex gap-2 mb-3">
              <Input
                type="email"
                placeholder="colleague@church.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                className="flex-1 text-sm"
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <Button
              onClick={handleInvite}
              disabled={sending || !email.trim()}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending invite...</>
              ) : (
                <><Mail className="w-4 h-4" /> Send Invite</>
              )}
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              <strong>Viewer</strong> — read-only. <strong>Editor</strong> — can comment & suggest edits.
            </p>
          </div>

          {/* Existing collaborators */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Collaborators {collaborators.length > 0 && `(${collaborators.length})`}
            </h3>

            {loadingCollabs ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : collaborators.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No collaborators yet</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {collaborators.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">{c.invited_email[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.invited_email}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.role}
                        </span>
                        <span className={`text-xs ${c.accepted ? 'text-green-600' : 'text-amber-600'}`}>
                          {c.accepted ? '✓ Accepted' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleCopyLink(c.token)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy invite link"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button
                        onClick={() => handleRemove(c.id)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}