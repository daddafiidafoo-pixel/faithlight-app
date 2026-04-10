import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Bookmark, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VerseUnderstandingModal({ isOpen, onClose, reference, verseText }) {
  const [understanding, setUnderstanding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

  useEffect(() => {
    if (isOpen && reference && verseText) {
      loadUnderstanding();
    }
  }, [isOpen, reference, verseText]);

  const loadUnderstanding = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('explainVerseContextually', {
        reference,
        verseText
      });
      setUnderstanding(response.data);
    } catch (err) {
      console.error('Error loading understanding:', err);
      toast.error('Failed to load verse understanding');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReflection = async () => {
    setSavingReflection(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        toast.error('Please log in to save reflections');
        return;
      }

      await base44.entities.PrayerJournal.create({
        userEmail: user.email,
        reference,
        verseText,
        title: `Understanding ${reference}`,
        body: `
Explanation: ${understanding.explanation}

Context: ${understanding.context}

Theme: ${understanding.theme}

Life Application: ${understanding.lifeApplication}

Prayer: ${understanding.prayer}
        `.trim(),
        reflection: understanding.lifeApplication,
        prayer: understanding.prayer,
        tags: ['understood', understanding.theme]
      });

      toast.success('Reflection saved to your journal');
    } catch (err) {
      console.error('Error saving reflection:', err);
      toast.error('Failed to save reflection');
    } finally {
      setSavingReflection(false);
    }
  };

  const handleShare = async () => {
    const shareText = `${reference}\n\n"${verseText}"\n\nApplication: ${understanding?.lifeApplication}\n\nShared from FaithLight`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="sticky top-0 bg-white pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-purple-700">
                Understand This Verse
              </DialogTitle>
              <p className="text-lg font-semibold text-gray-800 mt-2">{reference}</p>
              <p className="text-gray-700 italic mt-1">"{verseText}"</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading understanding...</span>
          </div>
        ) : understanding ? (
          <div className="space-y-6 pb-6">
            {/* Explanation */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Explanation</h3>
              <p className="text-gray-700 leading-relaxed">{understanding.explanation}</p>
            </div>

            {/* Context */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Biblical Context</h3>
              <p className="text-gray-700 leading-relaxed">{understanding.context}</p>
            </div>

            {/* Theme */}
            <div className="bg-purple-50 border-l-4 border-purple-600 pl-4 py-3">
              <h3 className="text-sm font-semibold text-purple-700 uppercase mb-1">Central Theme</h3>
              <p className="text-lg text-purple-900 font-medium">{understanding.theme}</p>
            </div>

            {/* Life Application */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Life Application</h3>
              <p className="text-gray-700 leading-relaxed bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                {understanding.lifeApplication}
              </p>
            </div>

            {/* Prayer */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Prayer</h3>
              <p className="text-gray-700 leading-relaxed italic bg-blue-50 p-4 rounded-lg border border-blue-200">
                "{understanding.prayer}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSaveReflection}
                disabled={savingReflection}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {savingReflection ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save Reflection
                  </>
                )}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}