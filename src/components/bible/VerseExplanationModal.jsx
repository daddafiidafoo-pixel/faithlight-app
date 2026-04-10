import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VerseExplainerPanel from './VerseExplainerPanel';
import { X } from 'lucide-react';

export default function VerseExplanationModal({ open, onClose, verse_reference, verse_text }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <DialogTitle className="text-lg">
              Verse Explanation
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">{verse_reference}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        
        {verse_text && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <p className="text-gray-800 italic leading-relaxed">"{verse_text}"</p>
          </div>
        )}

        <VerseExplainerPanel
          verse_reference={verse_reference}
          verse_text={verse_text}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}