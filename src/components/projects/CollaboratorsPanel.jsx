import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, Shield, Eye, Edit2, Crown } from 'lucide-react';

const ROLE_ICONS = { viewer: Eye, commenter: Edit2, editor: Edit2, admin: Shield };
const ROLE_COLORS = { viewer: 'text-gray-500', commenter: 'text-blue-500', editor: 'text-green-600', admin: 'text-purple-600' };
const ROLE_LABELS = { viewer: 'Viewer', commenter: 'Commenter', editor: 'Editor', admin: 'Admin' };

export default function CollaboratorsPanel({ project, collaborators, user, isOwner, onUpdated }) {
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inviteCollaborator = async () => {
    if (!newEmail.trim()) return;
    setLoading(true);
    setError('');
    // Find user by email
    const users = await base44.entities.User.filter({ email: newEmail.trim() }, '-created_date', 1).catch(() => []);
    if (!users.length) { setError('User not found. They must have an account first.'); setLoading(false); return; }
    const target = users[0];

    if (target.id === user.id) { setError("That's you!"); setLoading(false); return; }
    if (collaborators.find(c => c.user_id === target.id)) { setError('Already a collaborator.'); setLoading(false); return; }

    await base44.entities.ProjectCollaborator.create({
      project_id: project.id,
      user_id: target.id,
      user_name: target.full_name,
      user_email: target.email,
      role: newRole,
      invited_by: user.id,
      status: 'accepted',
      joined_at: new Date().toISOString(),
    });

    // Update project collaborator_ids
    const ids = [...(project.collaborator_ids || []), target.id];
    await base44.entities.Project.update(project.id, { collaborator_ids: ids });

    // Send notification
    base44.entities.AppNotification?.create?.({
      user_id: target.id,
      title: `You've been invited to "${project.title}"`,
      body: `${user.full_name} added you as ${ROLE_LABELS[newRole]} on a project.`,
      type: 'project_invite',
    }).catch(() => {});

    setNewEmail('');
    setNewRole('editor');
    setAdding(false);
    onUpdated();
    setLoading(false);
  };

  const removeCollaborator = async (collab) => {
    await base44.entities.ProjectCollaborator.delete(collab.id);
    const ids = (project.collaborator_ids || []).filter(id => id !== collab.user_id);
    await base44.entities.Project.update(project.id, { collaborator_ids: ids });
    onUpdated();
  };

  const changeRole = async (collab, newRole) => {
    await base44.entities.ProjectCollaborator.update(collab.id, { role: newRole });
    onUpdated();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Team</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{collaborators.length + 1}</span>
        </div>
        {isOwner && (
          <Button size="sm" variant="outline" onClick={() => setAdding(v => !v)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Invite
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg space-y-2">
          <Input placeholder="Email address..." value={newEmail} onChange={e => setNewEmail(e.target.value)} className="h-8 text-sm bg-white" />
          <div className="flex gap-2">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="h-8 flex-1 bg-white text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer – read only</SelectItem>
                <SelectItem value="commenter">Commenter – can comment</SelectItem>
                <SelectItem value="editor">Editor – can edit tasks</SelectItem>
                <SelectItem value="admin">Admin – full access</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={inviteCollaborator} disabled={loading}>Invite</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setError(''); }}>Cancel</Button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      <div className="space-y-2">
        {/* Owner */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-50">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-white">
            {project.owner_name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{project.owner_name || 'Owner'}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <Crown className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Owner</span>
          </div>
        </div>

        {collaborators.map(c => {
          const RoleIcon = ROLE_ICONS[c.role] || Edit2;
          return (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                {c.user_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{c.user_name}</p>
                <p className="text-xs text-gray-400 truncate">{c.user_email}</p>
              </div>
              {isOwner ? (
                <Select value={c.role} onValueChange={v => changeRole(c, v)}>
                  <SelectTrigger className="h-7 w-28 text-xs border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="commenter">Commenter</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={`text-xs font-medium ${ROLE_COLORS[c.role]}`}>{ROLE_LABELS[c.role]}</span>
              )}
              {isOwner && (
                <button onClick={() => removeCollaborator(c)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}