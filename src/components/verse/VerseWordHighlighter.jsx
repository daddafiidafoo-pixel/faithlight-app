import React, { useState } from 'react';
import DictionaryPanel from './DictionaryPanel';

const LABELS = {
  en: { selectWord: 'Select a word to see definition' },
  om: { selectWord: 'Jecha tokko filadhu hiika argachuuf' },
};

export default function VerseWordHighlighter({ verseText, language = 'en' }) {
  const L = LABELS[language] || LABELS.en;
  const [selectedWord, setSelectedWord] = useState(null);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    // Extract single word (letters only, no punctuation)
    const word = text.replace(/[.,;:!?"\-()]/g, '').toLowerCase();

    if (word && word.length > 2) {
      setSelectedWord(word);
      setDictionaryOpen(true);
      selection.removeAllRanges();
    }
  };

  return (
    <>
      <div
        onMouseUp={handleMouseUp}
        className="text-base leading-relaxed italic cursor-text select-text p-4 rounded-lg"
        style={{
          backgroundColor: '#F9FAFB',
          color: '#1F2937',
          userSelect: 'text',
          WebkitUserSelect: 'text',
        }}
        title={L.selectWord}
      >
        "{verseText}"
      </div>

      {selectedWord && (
        <DictionaryPanel
          word={selectedWord}
          language={language}
          isOpen={dictionaryOpen}
          onClose={() => {
            setDictionaryOpen(false);
            setSelectedWord(null);
          }}
        />
      )}
    </>
  );
}