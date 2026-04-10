import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Camera, Plus, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const MAX_BIO = 300;
const MAX_LINKS = 6;

// Normalize and validate links — blocks dangerous schemes, auto-adds https://
function normalizeLinks(links) {
  return (links || [])
    .map(l => ({ label: String(l.label || '').trim(), url: String(l.url || '').trim() }))
    .filter(l => l.label && l.url)
    .map(l => {
      let url = l.url;
      // Auto-prepend https:// if no scheme
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      // Block anything that's not http/https after normalization
      if (!/^https?:\/\//i.test(url)) return null;
      return { ...l, url };
    })
    .filter(Boolean);
}

function isDisplayableUrl(url) {
  try { const u = new URL(url); return u.protocol === 'https:' || u.protocol === 'http:'; }
  catch { return false; }
}

export default function ProfileCustomizationSection({ user, onSaved }) {
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBio(user?.bio || '');
    setLinks(user?.profile_links || []);
    // Never restore a blob: URL — only real uploaded URLs
    const stored = user?.profile_photo_url || user?.avatar_url || '';
    setAvatarUrl(stored.startsWith('blob:') ? '' : stored);
  }, [user?.id]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP allowed'); return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file }).catch(e => {
      toast.error('Upload failed'); return {};
    });
    setUploading(false);
    if (file_url) {
      setAvatarUrl(file_url); // always the public permanent URL, never blob
      toast.success('Photo uploaded — save to apply');
    }
  };

  const addLink = () => {
    if (links.length >= MAX_LINKS) { toast.error(`Maximum ${MAX_LINKS} links`); return; }
    setLinks(prev => [...prev, { label: '', url: '' }]);
  };

  const updateLink = (idx, field, val) => {
    setLinks(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l));
  };

  const removeLink = (idx) => setLinks(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const cleanLinks = normalizeLinks(links);

    setSaving(true);
    await base44.auth.updateMe({
      bio: bio.trim().slice(0, MAX_BIO),
      profile_photo_url: avatarUrl || null,
      profile_links: cleanLinks,
    }).catch(e => { toast.error('Save failed: ' + e.message); });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success('Profile saved!');
    onSaved?.();
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="space-y-6">

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow"
              onError={() => setAvatarUrl('')} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold border-2 border-indigo-200">
              {initials}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 shadow transition-colors">
            {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.full_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · max 5MB</p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
        <Textarea
          value={bio}
          onChange={e => setBio(e.target.value.slice(0, MAX_BIO))}
          placeholder="Write a short bio about yourself…"
          rows={3}
          className="resize-none"
        />
        <p className={`text-xs mt-1 text-right ${bio.length >= MAX_BIO ? 'text-red-500' : 'text-gray-400'}`}>
          {bio.length}/{MAX_BIO}
        </p>
      </div>

      {/* Links */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Links</label>
          <Button type="button" variant="ghost" size="sm" onClick={addLink}
            className="gap-1 text-xs text-indigo-600 h-7 px-2">
            <Plus className="w-3 h-3" /> Add link
          </Button>
        </div>

        {links.length === 0 && (
          <p className="text-xs text-gray-400 py-2">No links yet. Add your website, social profiles, etc.</p>
        )}

        <div className="space-y-2">
          {links.map((link, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input value={link.label} onChange={e => updateLink(idx, 'label', e.target.value)}
                placeholder="Label" className="w-28 flex-shrink-0 text-sm h-8" />
              <Input value={link.url} onChange={e => updateLink(idx, 'url', e.target.value)}
                placeholder="https://…" className="flex-1 text-sm h-8" />
              {link.url && isDisplayableUrl(link.url.startsWith('http') ? link.url : 'https://' + link.url) && (
                <a href={link.url.startsWith('http') ? link.url : 'https://' + link.url}
                  target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-600 flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        {links.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">https:// auto-added if missing · javascript: links are blocked</p>
        )}
      </div>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving || uploading} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
          : 'Save Profile'}
      </Button>
    </div>
  );
}