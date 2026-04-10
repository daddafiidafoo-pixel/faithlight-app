import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageSquare } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function HomeHeroBanner() {
  return (
    <div
      className="relative w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1507842217343-583f20270319?w=1600&h=600&fit=crop)',
        minHeight: '280px',
        height: 'clamp(220px, 50vh, 400px)',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center md:items-start px-6 md:px-12 py-8 md:py-16 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center md:text-left" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          Uniting believers through the light of Scripture.
        </h1>
        <p className="text-lg md:text-xl italic text-white/85 mb-3 text-center md:text-left" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
          "Go into all the world and preach the gospel to all creation."
        </p>
        <p className="text-sm md:text-base font-semibold text-amber-300 mb-6 tracking-wider text-center md:text-left" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
          — Mark 16:15
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => (window.location.href = createPageUrl('BibleReader'))}
            className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold flex-1 sm:flex-none"
            size="lg"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Read Bible
          </Button>
          <Button
            onClick={() => (window.location.href = createPageUrl('BibleTutor'))}
            variant="outline"
            className="border-white text-white hover:bg-white/20 font-semibold flex-1 sm:flex-none"
            size="lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>
    </div>
  );
}