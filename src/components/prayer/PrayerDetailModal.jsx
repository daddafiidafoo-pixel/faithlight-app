import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit2, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
  active: 'bg-blue-100 text-blue-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  answered: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function PrayerDetailModal({ prayer, onClose, onEdit, onMarkAnswered }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{prayer.title}</h2>
            <div className="flex gap-2 flex-wrap">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[prayer.status]}`}>
                {prayer.status === 'active' && 'Active'}
                {prayer.status === 'waiting' && 'Waiting'}
                {prayer.status === 'answered' && 'Answered'}
                {prayer.status === 'archived' && 'Archived'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Prayer Body */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{prayer.body}</p>
        </div>

        {/* Metadata */}
        <div className="mb-6 text-sm text-muted-foreground">
          <p>Created {formatDistanceToNow(new Date(prayer.created_date), { addSuffix: true })}</p>
          {prayer.answered_at && (
            <p>Answered {formatDistanceToNow(new Date(prayer.answered_at), { addSuffix: true })}</p>
          )}
        </div>

        {/* Linked Verses Section */}
        {prayer.linked_verse_count > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Linked Verses ({prayer.linked_verse_count})</h3>
            <p className="text-sm text-muted-foreground">Linked verses will display here.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap pt-4 border-t">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-1" /> Edit Prayer
          </Button>
          {prayer.status !== 'answered' && (
            <Button size="sm" variant="outline" onClick={onMarkAnswered}>
              <CheckCircle className="w-4 h-4 mr-1" /> Mark Answered
            </Button>
          )}
          <Button size="sm" variant="outline">
            <LinkIcon className="w-4 h-4 mr-1" /> Link Verse
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}