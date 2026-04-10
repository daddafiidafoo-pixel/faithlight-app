import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';

const OT_BOOKS = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI',
  '1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
  'LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAH','HAB','ZEP',
  'HAG','ZEC','MAL'
];
const NT_BOOKS = [
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL',
  '1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JO','2JO',
  '3JO','JUD','REV'
];

const BOOK_NAMES = {
  GEN:'Genesis',EXO:'Exodus',LEV:'Leviticus',NUM:'Numbers',DEU:'Deuteronomy',
  JOS:'Joshua',JDG:'Judges',RUT:'Ruth','1SA':'1 Samuel','2SA':'2 Samuel',
  '1KI':'1 Kings','2KI':'2 Kings','1CH':'1 Chronicles','2CH':'2 Chronicles',
  EZR:'Ezra',NEH:'Nehemiah',EST:'Esther',JOB:'Job',PSA:'Psalms',PRO:'Proverbs',
  ECC:'Ecclesiastes',SNG:'Song of Songs',ISA:'Isaiah',JER:'Jeremiah',
  LAM:'Lamentations',EZK:'Ezekiel',DAN:'Daniel',HOS:'Hosea',JOL:'Joel',
  AMO:'Amos',OBA:'Obadiah',JON:'Jonah',MIC:'Micah',NAH:'Nahum',HAB:'Habakkuk',
  ZEP:'Zephaniah',HAG:'Haggai',ZEC:'Zechariah',MAL:'Malachi',
  MAT:'Matthew',MRK:'Mark',LUK:'Luke',JHN:'John',ACT:'Acts',ROM:'Romans',
  '1CO':'1 Corinthians','2CO':'2 Corinthians',GAL:'Galatians',EPH:'Ephesians',
  PHP:'Philippians',COL:'Colossians','1TH':'1 Thessalonians','2TH':'2 Thessalonians',
  '1TI':'1 Timothy','2TI':'2 Timothy',TIT:'Titus',PHM:'Philemon',HEB:'Hebrews',
  JAS:'James','1PE':'1 Peter','2PE':'2 Peter','1JO':'1 John','2JO':'2 John',
  '3JO':'3 John',JUD:'Jude',REV:'Revelation'
};

const CHAPTER_COUNTS = {
  GEN:50,EXO:40,LEV:27,NUM:36,DEU:34,JOS:24,JDG:21,RUT:4,'1SA':31,'2SA':24,
  '1KI':22,'2KI':25,'1CH':29,'2CH':36,EZR:10,NEH:13,EST:10,JOB:42,PSA:150,PRO:31,
  ECC:12,SNG:8,ISA:66,JER:52,LAM:5,EZK:48,DAN:12,HOS:14,JOL:3,AMO:9,OBA:1,
  JON:4,MIC:7,NAH:3,HAB:3,ZEP:3,HAG:2,ZEC:14,MAL:4,
  MAT:28,MRK:16,LUK:24,JHN:21,ACT:28,ROM:16,'1CO':16,'2CO':13,GAL:6,EPH:6,
  PHP:4,COL:4,'1TH':5,'2TH':3,'1TI':6,'2TI':4,TIT:3,PHM:1,HEB:13,JAS:5,
  '1PE':5,'2PE':3,'1JO':5,'2JO':1,'3JO':1,JUD:1,REV:22
};

export { BOOK_NAMES, CHAPTER_COUNTS };

export default function BookChapterNav({ bookId, chapter, onBookChange, onChapterChange, availableBooks }) {
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [testament, setTestament] = useState('OT');

  const books = availableBooks?.length > 0
    ? availableBooks.map(b => b.book_id || b.id)
    : [...OT_BOOKS, ...NT_BOOKS];

  const chapterCount = CHAPTER_COUNTS[bookId] || 1;
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  const displayBooks = (testament === 'OT' ? OT_BOOKS : NT_BOOKS).filter(b => books.includes(b));

  return (
    <div className="relative">
      {/* Current selection pill */}
      <button
        onClick={() => setShowBookPicker(v => !v)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:border-indigo-300 transition-colors w-full"
      >
        <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        <span className="font-semibold text-gray-800">{BOOK_NAMES[bookId] || bookId}</span>
        <span className="text-gray-400 mx-1">·</span>
        <span className="text-gray-600">Chapter {chapter}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
      </button>

      {showBookPicker && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-h-96 overflow-hidden flex flex-col">
          {/* Testament toggle */}
          <div className="flex gap-2 mb-3">
            {['OT', 'NT'].map(t => (
              <button
                key={t}
                onClick={() => setTestament(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  testament === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t === 'OT' ? 'Old Testament' : 'New Testament'}
              </button>
            ))}
          </div>

          {/* Books grid */}
          <div className="overflow-y-auto flex-1 grid grid-cols-3 gap-1.5 mb-3">
            {displayBooks.map(b => (
              <button
                key={b}
                onClick={() => {
                  onBookChange(b);
                  onChapterChange(1);
                  setShowBookPicker(false);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-colors ${
                  bookId === b
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {BOOK_NAMES[b] || b}
              </button>
            ))}
          </div>

          {/* Chapter grid */}
          {bookId && (
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Chapter</p>
              <div className="grid grid-cols-8 gap-1 max-h-24 overflow-y-auto">
                {chapters.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      onChapterChange(c);
                      setShowBookPicker(false);
                    }}
                    className={`py-1 rounded-md text-xs font-medium transition-colors ${
                      chapter === c
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}