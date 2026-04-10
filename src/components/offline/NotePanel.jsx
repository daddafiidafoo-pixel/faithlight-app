import React, { useState, useEffect } from 'react';
import { BookMarked, X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';

export default function NotePanel({ reference, onSave, onClose, initialNote, isSaving }) {
  const { t } = useI18n();
  const [content, setContent] = useState(initialNote?.text || '');

  useEffect(() => {
    if (initialNote?.text) setContent(initialNote.text);
  }, [initialNote]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl shadow-lg p-6 space-y-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-800">{t('common.notes', 'Note')}</p>
              <p className="text-xs text-gray-500">{reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t('offline.note.placeholder', 'Add your thoughts, reflections, or insights...')}
          className="flex-1 w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 resize-none"
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('common.save', 'Save')}
          </Button>
        </div>
      </div>
    </div>
  );
}