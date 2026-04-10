import React, { useEffect, useRef, useState } from "react";
import { Bookmark, Link2 } from "lucide-react";
import VerseBookmarkPanel from "@/components/audio/VerseBookmarkPanel";
import CrossReferenceDrawer from "@/components/bible/CrossReferenceDrawer";

export default function SyncTextReader({ verses = [], activeVerse, onSeekToVerse, bookId, chapter, currentTime }) {
  const activeRef = useRef(null);
  const [bookmarking, setBookmarking] = useState(null); // verse item being bookmarked
  const [showReferences, setShowReferences] = useState(false);
  const [selectedVerseForReferences, setSelectedVerseForReferences] = useState(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeVerse]);

  if (!verses.length) return null;

  return (
    <>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Chapter Text</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {verses.map((item) => {
          const isActive = item.verse === activeVerse;
          return (
            <div
              key={item.verse}
              ref={isActive ? activeRef : null}
              className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-yellow-50 ring-1 ring-yellow-300"
                  : "hover:bg-gray-50"
              }`}
            >
              <button
                type="button"
                onClick={() => onSeekToVerse?.(item.verse)}
                className="flex-1 text-left"
              >
                <span className="font-semibold text-indigo-600 mr-2">{item.verse}</span>
                <span className="text-gray-700">{item.text}</span>
              </button>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => { setSelectedVerseForReferences(item); setShowReferences(true); }}
                  className="p-1 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex-shrink-0 mt-0.5"
                  title="Cross-references"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setBookmarking(item)}
                  className="p-1 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex-shrink-0 mt-0.5"
                  title="Bookmark this verse"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {bookmarking && (
      <VerseBookmarkPanel
        bookId={bookId}
        chapter={chapter}
        verseNumber={bookmarking.verse}
        verseText={bookmarking.text}
        currentTime={currentTime}
        onClose={() => setBookmarking(null)}
      />
    )}

    {selectedVerseForReferences && (
      <CrossReferenceDrawer
        verse={{ book: bookId, chapter, verse: selectedVerseForReferences.verse, text: selectedVerseForReferences.text }}
        isOpen={showReferences}
        onClose={() => setShowReferences(false)}
        onVerseSelect={(ref) => {
          setShowReferences(false);
          // Navigate to the selected reference
          console.log('Jump to:', ref);
        }}
      />
    )}
    </>
  );
}