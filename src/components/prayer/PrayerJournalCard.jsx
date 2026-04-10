import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function PrayerJournalCard({ prayer, onEdit, onDelete, onToggleAnswered }) {
  return (
    <Card className="p-4 border-l-4 border-l-indigo-600">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{prayer.title}</h3>
          <p className="text-xs text-gray-500">
            {format(new Date(prayer.createdAt), 'MMM d, yyyy')}
            {prayer.isAnswered && ' • ✓ Answered'}
          </p>
        </div>
        {prayer.isAnswered && (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        )}
      </div>

      <p className="text-gray-700 text-sm mb-3">{prayer.content}</p>

      {prayer.categories && prayer.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prayer.categories.map(cat => (
            <Badge key={cat} variant="outline" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleAnswered(prayer.id, !prayer.isAnswered)}
          className="text-xs"
        >
          {prayer.isAnswered ? 'Mark Unanswered' : 'Mark Answered'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(prayer)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(prayer.id)}>
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </Card>
  );
}