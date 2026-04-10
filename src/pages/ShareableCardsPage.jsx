import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VerseCardGenerator from '@/components/cards/VerseCardGenerator';
import PrayerCardGenerator from '@/components/cards/PrayerCardGenerator';
import DevotionalCardGenerator from '@/components/cards/DevotionalCardGenerator';
import { BookOpen, Heart, Sun, Sparkles, Zap } from 'lucide-react';
import AIVerseImageCard from '@/components/verse/AIVerseImageCard';
import VerseStoryCreator from '@/components/verse/VerseStoryCreator';

const DEFAULT_VERSE = 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.';
const DEFAULT_REF = 'John 3:16';

export default function ShareableCardsPage() {
  const [aiVerse, setAiVerse] = React.useState(DEFAULT_VERSE);
  const [aiRef, setAiRef] = React.useState(DEFAULT_REF);

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-4 pb-24">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="pt-6 pb-5 text-center">
          <h1 className="text-2xl font-bold text-[#1F2937]">Share Your Faith</h1>
          <p className="text-sm text-[#6B7280] mt-1">Create beautiful cards to inspire others ✨</p>
        </div>

        <Tabs defaultValue="story">
          <TabsList className="w-full mb-6 bg-white border border-[#E0E4E9] rounded-2xl p-1 h-auto grid grid-cols-5">
            <TabsTrigger value="story" className="flex items-center justify-center gap-1 py-2 rounded-xl data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white text-xs">
              <Zap className="w-3.5 h-3.5" /> Story
            </TabsTrigger>
            <TabsTrigger value="verse" className="flex items-center justify-center gap-1 py-2 rounded-xl data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white text-xs">
              <BookOpen className="w-3.5 h-3.5" /> Card
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center justify-center gap-1 py-2 rounded-xl data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white text-xs">
              <Sparkles className="w-3.5 h-3.5" /> AI Art
            </TabsTrigger>
            <TabsTrigger value="prayer" className="flex items-center justify-center gap-1 py-2 rounded-xl data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white text-xs">
              <Heart className="w-3.5 h-3.5" /> Prayer
            </TabsTrigger>
            <TabsTrigger value="devotional" className="flex items-center justify-center gap-1 py-2 rounded-xl data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white text-xs">
              <Sun className="w-3.5 h-3.5" /> Daily
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story">
            <div className="bg-white rounded-2xl border border-[#E0E4E9] p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#6C5CE7] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Verse Story Creator</p>
                  <p className="text-xs text-gray-500">Instagram · WhatsApp Status · TikTok</p>
                </div>
              </div>
              <VerseStoryCreator />
            </div>
          </TabsContent>

          <TabsContent value="verse">
            <VerseCardGenerator />
          </TabsContent>

          <TabsContent value="ai">
            <div className="bg-white rounded-2xl border border-[#E0E4E9] p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verse Reference</label>
                <input
                  value={aiRef}
                  onChange={e => setAiRef(e.target.value)}
                  placeholder="e.g. John 3:16"
                  className="w-full px-3 py-2 rounded-lg border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verse Text</label>
                <textarea
                  value={aiVerse}
                  onChange={e => setAiVerse(e.target.value)}
                  rows={3}
                  placeholder="Paste your verse text here…"
                  className="w-full px-3 py-2 rounded-lg border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none"
                />
              </div>
              <AIVerseImageCard verse={aiVerse} reference={aiRef} />
            </div>
          </TabsContent>

          <TabsContent value="prayer">
            <PrayerCardGenerator />
          </TabsContent>
          <TabsContent value="devotional">
            <DevotionalCardGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}