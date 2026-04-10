import React from 'react';
import { Copy, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TextToSpeechButton from '@/components/audio/TextToSpeechButton';

export default function AIResponseRenderer({ response, onShare, onSave }) {
  if (!response) return null;

  const handleCopy = () => {
    const text = `${response.explanation}\n\n${response.bible_verse_reference}\n${response.bible_verse_text}\n\n${response.reflection}\n\n${response.prayer}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Explanation */}
      <section>
        <h3 className="text-lg font-semibold text-purple-700 mb-2">Understanding</h3>
        <p className="text-gray-700 leading-relaxed">{response.explanation}</p>
      </section>

      {/* Bible Verse */}
      {response.bible_verse_reference && (
        <section className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
          <p className="text-sm text-purple-600 font-semibold mb-2">{response.bible_verse_reference}</p>
          {response.bible_verse_text && (
            <p className="text-lg italic text-gray-800 leading-relaxed">{response.bible_verse_text}</p>
          )}
        </section>
      )}

      {/* Reflection */}
      <section>
        <h3 className="text-lg font-semibold text-purple-700 mb-2">Reflection</h3>
        <p className="text-gray-700 leading-relaxed">{response.reflection}</p>
      </section>

      {/* Prayer */}
      <section className="bg-amber-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Prayer</h3>
        <p className="text-gray-800 leading-relaxed italic">{response.prayer}</p>
      </section>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center pt-4 border-t flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy
        </Button>
        <TextToSpeechButton
          text={`${response.explanation}. ${response.reflection}`}
          reference={response.bible_verse_reference}
          variant="outline"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="flex items-center gap-2"
        >
          <Bookmark className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
}