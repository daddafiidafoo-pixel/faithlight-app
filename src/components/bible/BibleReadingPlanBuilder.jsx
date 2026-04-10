import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Trash2, Plus, BookOpen } from 'lucide-react';

const THEMES = [
  { id: 'ot', label: 'Old Testament', color: 'bg-purple-100 text-purple-900', border: 'border-purple-300' },
  { id: 'nt', label: 'New Testament', color: 'bg-blue-100 text-blue-900', border: 'border-blue-300' },
  { id: 'gospels', label: 'The Gospels', color: 'bg-amber-100 text-amber-900', border: 'border-amber-300' },
  { id: 'psalms-proverbs', label: 'Psalms & Proverbs', color: 'bg-green-100 text-green-900', border: 'border-green-300' },
  { id: 'custom', label: 'Custom Plan', color: 'bg-gray-100 text-gray-900', border: 'border-gray-300' }
];

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark',
  'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
  '3 John', 'Jude', 'Revelation'
];

export default function BibleReadingPlanBuilder() {
  const [selectedTheme, setSelectedTheme] = useState('ot');
  const [planName, setPlanName] = useState('');
  const [readings, setReadings] = useState([]);
  const [newBook, setNewBook] = useState('Genesis');
  const [newChapters, setNewChapters] = useState('1-5');

  const generateDefaultPlan = (themeId) => {
    const plans = {
      ot: [
        { book: 'Genesis', chapters: '1-5' },
        { book: 'Genesis', chapters: '6-15' },
        { book: 'Exodus', chapters: '1-10' },
        { book: 'Psalm', chapters: '1-25' }
      ],
      nt: [
        { book: 'Matthew', chapters: '1-5' },
        { book: 'Matthew', chapters: '6-10' },
        { book: 'Mark', chapters: '1-5' },
        { book: 'Luke', chapters: '1-5' }
      ],
      gospels: [
        { book: 'Matthew', chapters: '1-10' },
        { book: 'Mark', chapters: '1-8' },
        { book: 'Luke', chapters: '1-10' },
        { book: 'John', chapters: '1-10' }
      ],
      'psalms-proverbs': [
        { book: 'Psalms', chapters: '1-20' },
        { book: 'Psalms', chapters: '21-40' },
        { book: 'Proverbs', chapters: '1-15' },
        { book: 'Proverbs', chapters: '16-31' }
      ]
    };
    return plans[themeId] || [];
  };

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    if (themeId !== 'custom') {
      setReadings(generateDefaultPlan(themeId));
    } else {
      setReadings([]);
    }
  };

  const addReading = () => {
    if (newBook && newChapters) {
      setReadings([...readings, { book: newBook, chapters: newChapters, completed: false }]);
      setNewBook('Genesis');
      setNewChapters('1-5');
    }
  };

  const toggleReading = (index) => {
    const updated = [...readings];
    updated[index].completed = !updated[index].completed;
    setReadings(updated);
  };

  const removeReading = (index) => {
    setReadings(readings.filter((_, i) => i !== index));
  };

  const savePlan = () => {
    if (!planName || readings.length === 0) {
      alert('Please enter a plan name and add readings');
      return;
    }
    const plan = { name: planName, theme: selectedTheme, readings, createdDate: new Date().toISOString() };
    localStorage.setItem(`bibleplan-${Date.now()}`, JSON.stringify(plan));
    alert('Reading plan saved!');
    setPlanName('');
    setReadings([]);
    setSelectedTheme('ot');
  };

  const themeInfo = THEMES.find(t => t.id === selectedTheme);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Plan Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
        <Input
          placeholder="e.g., My 30-Day Bible Journey"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
        />
      </div>

      {/* Theme Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Theme</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`p-3 rounded-lg font-medium text-sm transition-all border-2 ${
                selectedTheme === theme.id
                  ? `${theme.color} ${theme.border} ring-2 ring-offset-2 ring-indigo-600`
                  : `${theme.color} border-transparent hover:${theme.border}`
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Readings */}
      {selectedTheme === 'custom' && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-gray-900">Add Readings</h3>
          <div className="flex gap-2 flex-wrap">
            <select
              value={newBook}
              onChange={(e) => setNewBook(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            >
              {BIBLE_BOOKS.map((book) => (
                <option key={book} value={book}>{book}</option>
              ))}
            </select>
            <Input
              type="text"
              placeholder="e.g., 1-5 or 3"
              value={newChapters}
              onChange={(e) => setNewChapters(e.target.value)}
              className="w-32"
            />
            <Button onClick={addReading} size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>
      )}

      {/* Readings List */}
      {readings.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Reading Schedule ({readings.length} days)</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {readings.map((reading, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
              >
                <button
                  onClick={() => toggleReading(index)}
                  className="flex-shrink-0"
                >
                  {reading.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </button>
                <div className={`flex-1 ${reading.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  <p className="text-sm font-medium">
                    {reading.book} {reading.chapters}
                  </p>
                </div>
                <button
                  onClick={() => removeReading(index)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 pt-2">
            {readings.filter(r => r.completed).length} / {readings.length} completed
          </div>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={savePlan}
        disabled={!planName || readings.length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
      >
        <BookOpen className="w-4 h-4" /> Save Reading Plan
      </Button>
    </div>
  );
}