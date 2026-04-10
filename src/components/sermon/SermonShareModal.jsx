import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Share2, Copy, Check, Globe, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SermonShareModal({ open, onClose, sermon, onShared }) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isShared = sermon?.is_shared;
  const shareUrl = sermon?.id ? `${window.location.origin}/app?page=AISermonBuilder&view=${sermon.id}` : '';

  const handleToggleShare = async () => {
    if (!sermon?.id) return;
    setSharing(true);
    try {
      const newShared = !isShared;
      await base44.entities.SermonOutline.update(sermon.id, { is_shared: newShared });
      toast.success(newShared ? 'Sermon is now publicly shared!' : 'Sermon is now private.');
      onShared?.(newShared);
    } catch (e) {
      toast.error('Failed to update sharing: ' + e.message);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportText = () => {
    if (!sermon) return;
    const lines = [];
    lines.push(`SERMON: ${sermon.title}`);
    lines.push(`Theme: ${sermon.theme || ''}`);
    lines.push(`Passages: ${(sermon.passages || []).join(', ')}`);
    lines.push('');
    if (sermon.big_idea) { lines.push(`BIG IDEA: ${sermon.big_idea}`); lines.push(''); }
    (sermon.outline_sections || []).forEach((s, i) => {
      lines.push(`--- ${s.title} ---`);
      if (s.content) lines.push(s.content);
      if (s.scriptures?.length) lines.push(`Scriptures: ${s.scriptures.join(', ')}`);
      if (s.illustration) lines.push(`Illustration: ${s.illustration}`);
      lines.push('');
    });
    if (sermon.application) { lines.push(`APPLICATION: ${sermon.application}`); lines.push(''); }
    if (sermon.closing_prayer) { lines.push(`CLOSING PRAYER: ${sermon.closing_prayer}`); }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sermon.title || 'sermon'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Sermon exported as text file!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Share Sermon
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sermon title */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Sermon</p>
            <p className="font-semibold text-gray-900 text-sm">{sermon?.title}</p>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              {isShared ? (
                <Globe className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {isShared ? 'Publicly Shared' : 'Private'}
                </p>
                <p className="text-xs text-gray-500">
                  {isShared ? 'Anyone with the link can view' : 'Only you can see this'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={isShared ? 'outline' : 'default'}
              onClick={handleToggleShare}
              disabled={sharing}
              className={isShared ? 'text-red-600 border-red-200 hover:bg-red-50' : 'bg-indigo-600 hover:bg-indigo-700'}
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : isShared ? 'Make Private' : 'Make Public'}
            </Button>
          </div>

          {/* Share link */}
          {isShared && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Share Link</p>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-xs text-gray-600 bg-gray-50" />
                <Button size="sm" variant="outline" onClick={handleCopyLink} className="flex-shrink-0 gap-1">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Export */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Export</p>
            <Button variant="outline" size="sm" onClick={handleExportText} className="w-full gap-2">
              📄 Export as Text File (.txt)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}