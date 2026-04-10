import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Heart, Share2, Volume2, Bookmark } from 'lucide-react';

export default function VerseDetail() {
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [translation, setTranslation] = useState('NIV');

  useEffect(() => {
    loadVerseDetail();
  }, []);

  const loadVerseDetail = () => {
    // In real app, fetch from params/API
    const verseData = {
      reference: 'John 3:16',
      text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      kjv: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      theme: 'Hope & Redemption',
      explanation: `This verse stands at the heart of Christian theology. It expresses God's infinite love through the sacrifice of Jesus Christ. The message is simple yet profound: God's love is so great that He was willing to sacrifice His own Son so that humanity might be saved from sin and death.

The phrase "God so loved" emphasizes the nature and extent of God's love. It's not a casual or limited love, but an overwhelming, self-giving love. This love is directed toward "the world"—all of humanity, regardless of background, status, or past.

"Gave his one and only Son" points to the incarnation and crucifixion of Jesus. Christ's sacrifice is presented as the ultimate expression of this love and the means of salvation.

"Whoever believes in him shall not perish" emphasizes the inclusive nature of salvation. It's not based on works, status, or worthiness, but on faith and belief. Everyone who trusts in Christ receives salvation.`,
      crossReferences: [
        'Romans 5:8 - God demonstrates His love toward us',
        'John 1:1-14 - The Word became flesh',
        '1 John 4:9-10 - God sent His one and only Son into the world',
      ],
      relatedVerses: [
        'John 14:6',
        'Ephesians 2:8-9',
        'Romans 6:23',
      ],
    };
    setVerse(verseData);
  };

  const handleSaveVerse = () => {
    setIsSaved(!isSaved);
    // In real app, save to database
  };

  const handleShare = () => {
    navigate(createPageUrl('VerseImageGenerator') + `?verse=${verse.reference}`);
  };

  if (!verse) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-purple-500 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{verse.reference}</h1>
        </div>

        {/* Translation Selector */}
        <div className="flex gap-2">
          {['NIV', 'KJV', 'ESV'].map((trans) => (
            <button
              key={trans}
              onClick={() => setTranslation(trans)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                translation === trans
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-400 text-white hover:bg-purple-500'
              }`}
            >
              {trans}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-3xl mx-auto">
        {/* Main Verse */}
        <Card className="p-8 mb-8 bg-white border-2 border-purple-200">
          <p className="text-3xl font-bold text-gray-900 leading-relaxed mb-4 text-center">
            "{translation === 'KJV' ? verse.kjv : verse.text}"
          </p>
          <p className="text-center text-gray-600 text-sm">{verse.reference} ({translation})</p>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Button
            onClick={handleSaveVerse}
            variant={isSaved ? 'default' : 'outline'}
            className={`${isSaved ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          >
            <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            Save
          </Button>
          <Button onClick={handleShare} className="bg-purple-600 hover:bg-purple-700">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Volume2 className="w-4 h-4 mr-2" />
            Audio
          </Button>
        </div>

        {/* Theme Badge */}
        <div className="flex gap-2 mb-8">
          <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
            🎯 {verse.theme}
          </span>
        </div>

        {/* Full Explanation */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reflection</h2>
          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            {verse.explanation.split('\n\n').map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </Card>

        {/* Cross References */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cross References</h2>
          <div className="space-y-3">
            {verse.crossReferences.map((ref, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors border border-gray-200 hover:border-purple-300"
              >
                <p className="font-semibold text-gray-900 text-sm">{ref.split(' - ')[0]}</p>
                <p className="text-gray-600 text-xs mt-1">{ref.split(' - ')[1]}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Related Verses */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Verses</h2>
          <div className="space-y-2">
            {verse.relatedVerses.map((ref, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200 text-purple-900 font-medium text-sm"
              >
                {ref}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}