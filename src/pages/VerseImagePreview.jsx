import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Download, Share2 } from 'lucide-react';

const TEMPLATE_BACKGROUNDS = {
  sunrise: 'linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FFF 100%)',
  mountains: 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #95A5A6 100%)',
  cross: 'linear-gradient(135deg, #8B4513 0%, #D2B48C 50%, #FFF 100%)',
  church: 'linear-gradient(135deg, #4A235A 0%, #6A4C93 50%, #1EE0C6 100%)',
  dark: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
  light: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
};

const FONT_FAMILIES = {
  serif: 'Georgia, serif',
  sans: 'Arial, sans-serif',
  script: 'Brush Script MT, cursive',
};

const TEXT_SIZES = {
  sm: 28,
  md: 36,
  lg: 48,
};

const TEXT_COLORS_MAP = {
  white: '#FFFFFF',
  gold: '#FFD700',
  cream: '#F5E6D3',
  light: '#E8E8E8',
};

export default function VerseImagePreview() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [params, setParams] = useState({});
  const [verseText, setVerseText] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const p = {
      verse: searchParams.get('verse') || 'John 3:16',
      template: searchParams.get('template') || 'sunrise',
      font: searchParams.get('font') || 'serif',
      size: searchParams.get('size') || 'md',
      color: searchParams.get('color') || 'white',
      watermark: searchParams.get('watermark') === 'true',
    };
    setParams(p);

    // Simulate loading verse text
    const verseMap = {
      'John 3:16': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      'Philippians 4:6': 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
      'John 14:27': 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    };
    setVerseText(verseMap[p.verse] || verseMap['John 3:16']);
  }, []);

  const handleShare = () => {
    navigate(
      createPageUrl('VerseImageShare') +
        `?verse=${params.verse}&template=${params.template}&font=${params.font}&size=${params.size}&color=${params.color}&watermark=${params.watermark}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-purple-500 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Preview Card</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Full Preview */}
          <div className="flex items-center justify-center">
            <Card
              className="w-full aspect-square flex flex-col items-center justify-center p-8 text-center rounded-2xl shadow-2xl"
              style={{
                background: TEMPLATE_BACKGROUNDS[params.template],
                minHeight: '500px',
              }}
              ref={canvasRef}
            >
              <p
                className="mb-12 leading-relaxed max-w-sm"
                style={{
                  fontFamily: FONT_FAMILIES[params.font],
                  fontSize: `${TEXT_SIZES[params.size]}px`,
                  color: TEXT_COLORS_MAP[params.color],
                }}
              >
                "{verseText}"
              </p>

              <p
                className="text-xl font-semibold"
                style={{
                  fontFamily: FONT_FAMILIES[params.font],
                  color: TEXT_COLORS_MAP[params.color],
                }}
              >
                {params.verse}
              </p>

              {params.watermark && (
                <p
                  className="mt-auto text-xs"
                  style={{ color: TEXT_COLORS_MAP[params.color] }}
                >
                  Created with FaithLight ✨
                </p>
              )}
            </Card>
          </div>

          {/* Settings Summary & Actions */}
          <div className="space-y-6">
            <Card className="p-6 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-4">Card Settings</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Verse</p>
                  <p className="font-semibold text-gray-900">{params.verse}</p>
                </div>
                <div>
                  <p className="text-gray-600">Template</p>
                  <p className="font-semibold text-gray-900 capitalize">{params.template}</p>
                </div>
                <div>
                  <p className="text-gray-600">Font</p>
                  <p className="font-semibold text-gray-900 capitalize">{params.font}</p>
                </div>
                <div>
                  <p className="text-gray-600">Text Size</p>
                  <p className="font-semibold text-gray-900 capitalize">{params.size}</p>
                </div>
                <div>
                  <p className="text-gray-600">Text Color</p>
                  <p className="font-semibold text-gray-900 capitalize">{params.color}</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleShare}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share & Download
              </Button>

              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full h-12 text-base"
              >
                Edit Style
              </Button>

              <Button
                onClick={() => navigate(createPageUrl('VerseImageGenerator'))}
                variant="ghost"
                className="w-full h-12 text-base"
              >
                Start Over
              </Button>
            </div>

            {/* Tips */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">💡 Pro Tip</p>
              <p className="text-xs text-blue-800">
                Share this verse card on Instagram, Facebook, or WhatsApp to inspire your community!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}