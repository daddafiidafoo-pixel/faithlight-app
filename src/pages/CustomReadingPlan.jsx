import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { t } from '@/components/i18n/translations';
import { useAppStore } from '@/components/store/appStore';

const BIBLE_BOOKS = [
  { code: 'GEN', name: 'Genesis', chapters: 50 },
  { code: 'EXO', name: 'Exodus', chapters: 40 },
  { code: 'LEV', name: 'Leviticus', chapters: 27 },
  { code: 'NUM', name: 'Numbers', chapters: 36 },
  { code: 'DEU', name: 'Deuteronomy', chapters: 34 },
  { code: 'JOS', name: 'Joshua', chapters: 24 },
  { code: 'JDG', name: 'Judges', chapters: 21 },
  { code: 'RUT', name: 'Ruth', chapters: 4 },
  { code: '1SA', name: '1 Samuel', chapters: 31 },
  { code: '2SA', name: '2 Samuel', chapters: 24 },
  { code: '1KI', name: '1 Kings', chapters: 22 },
  { code: '2KI', name: '2 Kings', chapters: 25 },
  { code: 'PSA', name: 'Psalms', chapters: 150 },
  { code: 'PRO', name: 'Proverbs', chapters: 31 },
  { code: 'ISA', name: 'Isaiah', chapters: 66 },
  { code: 'JER', name: 'Jeremiah', chapters: 52 },
  { code: 'LAM', name: 'Lamentations', chapters: 5 },
  { code: 'EZK', name: 'Ezekiel', chapters: 48 },
  { code: 'DAN', name: 'Daniel', chapters: 12 },
  { code: 'HOS', name: 'Hosea', chapters: 14 },
  { code: 'JOL', name: 'Joel', chapters: 3 },
  { code: 'AMO', name: 'Amos', chapters: 9 },
  { code: 'OBA', name: 'Obadiah', chapters: 1 },
  { code: 'JON', name: 'Jonah', chapters: 4 },
  { code: 'MIC', name: 'Micah', chapters: 7 },
  { code: 'NAH', name: 'Nahum', chapters: 3 },
  { code: 'HAB', name: 'Habakkuk', chapters: 3 },
  { code: 'ZEP', name: 'Zephaniah', chapters: 3 },
  { code: 'HAG', name: 'Haggai', chapters: 2 },
  { code: 'ZEC', name: 'Zechariah', chapters: 14 },
  { code: 'MAL', name: 'Malachi', chapters: 4 },
  { code: 'MAT', name: 'Matthew', chapters: 28 },
  { code: 'MRK', name: 'Mark', chapters: 16 },
  { code: 'LUK', name: 'Luke', chapters: 24 },
  { code: 'JHN', name: 'John', chapters: 21 },
  { code: 'ACT', name: 'Acts', chapters: 28 },
  { code: 'ROM', name: 'Romans', chapters: 16 },
  { code: '1CO', name: '1 Corinthians', chapters: 16 },
  { code: '2CO', name: '2 Corinthians', chapters: 13 },
  { code: 'GAL', name: 'Galatians', chapters: 6 },
  { code: 'EPH', name: 'Ephesians', chapters: 6 },
  { code: 'PHP', name: 'Philippians', chapters: 4 },
  { code: 'COL', name: 'Colossians', chapters: 4 },
  { code: '1TH', name: '1 Thessalonians', chapters: 5 },
  { code: '2TH', name: '2 Thessalonians', chapters: 3 },
  { code: '1TI', name: '1 Timothy', chapters: 6 },
  { code: '2TI', name: '2 Timothy', chapters: 4 },
  { code: 'TIT', name: 'Titus', chapters: 3 },
  { code: 'PHM', name: 'Philemon', chapters: 1 },
  { code: 'HEB', name: 'Hebrews', chapters: 13 },
  { code: 'JAS', name: 'James', chapters: 5 },
  { code: '1PE', name: '1 Peter', chapters: 5 },
  { code: '2PE', name: '2 Peter', chapters: 3 },
  { code: '1JN', name: '1 John', chapters: 5 },
  { code: '2JN', name: '2 John', chapters: 1 },
  { code: '3JN', name: '3 John', chapters: 1 },
  { code: 'JUD', name: 'Jude', chapters: 1 },
  { code: 'REV', name: 'Revelation', chapters: 22 },
];

const DURATIONS = [
  { id: '7', label: '7 days', days: 7 },
  { id: '14', label: '2 weeks', days: 14 },
  { id: '21', label: '3 weeks', days: 21 },
  { id: '30', label: '30 days', days: 30 },
  { id: '60', label: '60 days', days: 60 },
  { id: '90', label: '90 days', days: 90 },
];

export default function CustomReadingPlan() {
  const navigate = useNavigate();
  const { uiLanguage } = useAppStore();
  const [step, setStep] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [planName, setPlanName] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (!selectedBook || !selectedDuration) {
      alert('Please select a book and duration');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateReadingPlan', {
        bookCode: selectedBook.code,
        bookName: selectedBook.name,
        totalChapters: selectedBook.chapters,
        durationDays: selectedDuration.days,
        planName: planName || `${selectedBook.name} in ${selectedDuration.days} days`,
      });

      if (response.data?.success) {
        setGeneratedPlan(response.data.plan);
        setStep(3);
      } else {
        alert('Failed to generate plan');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Error generating plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        alert('Please log in to save your reading plan');
        return;
      }

      const planData = {
        title: generatedPlan.planName,
        description: `Read ${generatedPlan.bookName} in ${generatedPlan.durationDays} days`,
        duration: generatedPlan.durationDays,
        theme: `reading-${generatedPlan.bookCode.toLowerCase()}`,
        verses: generatedPlan.dailyReadings.map((reading, index) => ({
          day: index + 1,
          bookCode: generatedPlan.bookCode,
          chapter: reading.startChapter,
          verse: reading.startVerse || 1,
          reflection: `Read ${reading.chapterRange} (${reading.verseCount} verses)`,
        })),
        isActive: true,
      };

      await base44.entities.ReadingPlan.create(planData);

      // Set up reading plan progress for user
      const progress = await base44.entities.ReadingPlanProgress.create({
        userId: user.email,
        planId: generatedPlan.id,
        currentDay: 1,
        completedDays: [],
        startDate: new Date().toISOString(),
        isCompleted: false,
      });

      alert('Reading plan saved! Check your dashboard for reminders.');
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="hover:bg-purple-500 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Create Reading Plan</h1>
        </div>
        <div className="text-purple-100 text-sm">Step {step} of 3</div>
      </div>

      <div className="px-6 py-8 max-w-3xl mx-auto">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Book</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {BIBLE_BOOKS.map((book) => (
                <Card
                  key={book.code}
                  onClick={() => setSelectedBook(book)}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedBook?.code === book.code
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300'
                      : 'border-gray-200 hover:border-purple-400'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">{book.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{book.chapters} chapters</p>
                </Card>
              ))}
            </div>
            <Button
              onClick={() => selectedBook && setStep(2)}
              disabled={!selectedBook}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Duration & Details</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-4">Reading Duration</p>
                <div className="grid grid-cols-3 gap-3">
                  {DURATIONS.map((duration) => (
                    <Card
                      key={duration.id}
                      onClick={() => setSelectedDuration(duration)}
                      className={`p-4 cursor-pointer transition-all border-2 text-center ${
                        selectedDuration?.id === duration.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-400'
                      }`}
                    >
                      <Calendar className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                      <p className="font-semibold text-gray-900">{duration.label}</p>
                      {selectedBook && (
                        <p className="text-xs text-gray-600 mt-1">
                          ~{Math.ceil(selectedBook.chapters / duration.days)} chap/day
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Plan Name (Optional)</label>
                <Input
                  type="text"
                  placeholder={`${selectedBook?.name} Reading Plan`}
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>

              <div className="border-t pt-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={remindersEnabled}
                    onChange={(e) => setRemindersEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-semibold text-gray-900">Set daily reminders</span>
                </label>
                {remindersEnabled && (
                  <div className="mt-4 ml-8">
                    <label className="block text-sm text-gray-700 mb-2">Reminder Time</label>
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleGeneratePlan}
                  disabled={!selectedDuration || loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Generating...' : 'Generate Plan'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 3 && generatedPlan && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Plan</h2>
            <Card className="p-6 mb-6 bg-purple-50 border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-2">{generatedPlan.planName}</h3>
              <p className="text-gray-700 mb-4">{generatedPlan.bookName}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">{generatedPlan.durationDays} days</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Chapters</p>
                  <p className="font-semibold text-gray-900">{generatedPlan.totalChapters}</p>
                </div>
                <div>
                  <p className="text-gray-600">Per Day</p>
                  <p className="font-semibold text-gray-900">
                    {Math.ceil(generatedPlan.totalChapters / generatedPlan.durationDays)}
                  </p>
                </div>
              </div>
            </Card>

            <div className="mb-6 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 mb-3">Daily Breakdown</h4>
              <div className="space-y-2">
                {generatedPlan.dailyReadings.slice(0, 10).map((reading, idx) => (
                  <Card key={idx} className="p-3 border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Day {idx + 1}</p>
                        <p className="text-xs text-gray-600">{reading.chapterRange}</p>
                      </div>
                      <p className="text-xs text-gray-500">{reading.verseCount} verses</p>
                    </div>
                  </Card>
                ))}
                {generatedPlan.dailyReadings.length > 10 && (
                  <p className="text-sm text-gray-600 p-3 text-center">
                    ... and {generatedPlan.dailyReadings.length - 10} more days
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSavePlan}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Save to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}