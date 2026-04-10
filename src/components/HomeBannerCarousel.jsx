import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createPageUrl } from '../utils';

const banners = [
  {
    id: 1,
    title: 'Daily Verse',
    subtitle: 'Start your day with Scripture',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=300&fit=crop',
    cta: 'Read Now',
    href: 'BibleReader',
  },
  {
    id: 2,
    title: 'Prayer & Encouragement',
    subtitle: 'Find strength in faith',
    image: 'https://images.unsplash.com/photo-1551632440-42ca6f5cbf74?w=1200&h=300&fit=crop',
    cta: 'Explore',
    href: 'BibleTutor',
  },
  {
    id: 3,
    title: 'Ask AI About Scripture',
    subtitle: 'Get biblical explanations instantly',
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&h=300&fit=crop',
    cta: 'Ask Now',
    href: 'BibleTutor',
  },
];

export default function HomeBannerCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto-play every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToPrev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const goToNext = () => setCurrent((prev) => (prev + 1) % banners.length);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="relative group">
        {/* Carousel container */}
        <div className="relative w-full h-40 md:h-52 overflow-hidden rounded-xl shadow-lg">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                idx === current ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${banner.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-center items-start px-6 md:px-10 py-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {banner.title}
                </h3>
                <p className="text-base md:text-lg text-white/90 mb-4 max-w-md">
                  {banner.subtitle}
                </p>
                <Button
                  onClick={() => (window.location.href = createPageUrl(banner.href))}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold"
                  size="sm"
                >
                  {banner.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows (visible on hover/md+) */}
        <button
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity z-10"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity z-10"
        >
          <ChevronRight className="w-5 h-5 text-indigo-600" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === current ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}