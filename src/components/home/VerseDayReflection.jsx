import React, { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function VerseDayReflection({ verse, reference }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Get today's reflection
  const { data: todayReflection } = useQuery({
    queryKey: ['reflection', user?.email, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      if (!user?.email) return null;
      const today = new Date().toISOString().split('T')[0];
      const notes = await base44.entities.VerseNote.filter({
        userEmail: user.email,
        reference: reference,
      });
      const todayNote = notes.find((n) => n.created_date.startsWith(today));
      return todayNote || null;
    },
    enabled: !!user?.email && !!reference,
  });

  useEffect(() => {
    if (todayReflection?.noteText) {
      setReflection(todayReflection.noteText);
    }
  }, [todayReflection]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!reflection.trim() || !user?.email) return;

      const [bookCode, chapterVerse] = reference.split(' ');
      const [chapter, verse] = chapterVerse.split(':');

      // Check if already exists
      if (todayReflection?.id) {
        await base44.entities.VerseNote.update(todayReflection.id, {
          noteText: reflection,
        });
      } else {
        await base44.entities.VerseNote.create({
          userEmail: user.email,
          reference,
          bookCode,
          bookName: reference.split(' ')[0],
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          verseText: verse,
          noteText: reflection,
          highlight: true,
          highlightColor: 'yellow',
        });
      }
    },
    onSuccess: () => {
      toast.success('Reflection saved! 💭');
      queryClient.invalidateQueries({
        queryKey: ['reflection', user?.email],
      });
      setIsExpanded(false);
    },
    onError: () => {
      toast.error('Failed to save reflection');
    },
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Your Daily Reflection</h3>
          <p className="text-sm text-gray-600 mt-0.5">What does this verse mean to you?</p>
        </div>
        <span className="text-2xl">✍️</span>
      </div>

      <div className={`transition-all ${isExpanded ? 'block' : ''}`}>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Share your thoughts, insights, and how this verse speaks to your life today..."
          className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm resize-none transition-all"
          rows={isExpanded ? 4 : 2}
        />

        {isExpanded && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !reflection.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saveMutation.isPending ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Reflection
            </button>
            <button
              onClick={() => {
                setIsExpanded(false);
                if (!todayReflection) setReflection('');
              }}
              className="px-4 border border-blue-300 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {todayReflection?.noteText && !isExpanded && (
        <p className="mt-3 text-sm text-gray-700 italic bg-white p-3 rounded-lg border border-blue-200">
          "{todayReflection.noteText}"
        </p>
      )}
    </div>
  );
}