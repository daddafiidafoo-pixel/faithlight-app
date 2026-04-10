import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VerseTemplatePreview from '@/components/verse/VerseTemplatePreview';
import TemplateSelector from '@/components/verse/TemplateSelector';
import SocialShareButtons from '@/components/verse/SocialShareButtons';

export default function VerseShareBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
  const [loading, setLoading] = useState(true);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadVerse = async () => {
      try {
        const verseId = searchParams.get('verseId');
        const bookId = searchParams.get('bookId');
        const chapter = searchParams.get('chapter');
        const verseNum = searchParams.get('verse');

        if (verseId) {
          // Load from entity
          const verseData = await base44.entities.BibleVerseText.filter(
            { id: verseId },
            null,
            1
          );
          if (verseData?.[0]) {
            setVerse(verseData[0].text);
            setReference(verseData[0].reference);
          }
        } else if (bookId && chapter && verseNum) {
          // Load from API
          const verseData = await base44.entities.BibleVerseText.filter(
            { book_id: bookId, chapter: parseInt(chapter), verse: parseInt(verseNum) },
            null,
            1
          );
          if (verseData?.[0]) {
            setVerse(verseData[0].text);
            setReference(verseData[0].reference);
          }
        }
      } catch (error) {
        console.error('Error loading verse:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVerse();
  }, [searchParams]);

  const handleDownload = () => {
    // Download happens in VerseTemplatePreview
  };

  const handleShare = (imageUrl) => {
    setGeneratedImageUrl(imageUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No verse selected</p>
          <button
            onClick={() => navigate('/BibleSearch')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search Verses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Verse</h1>
        <p className="text-gray-600 mb-8">Create a beautiful image and share it on social media</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Preview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            <VerseTemplatePreview
              verse={verse}
              reference={reference}
              template={selectedTemplate}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          </div>

          {/* Right: Controls */}
          <div className="space-y-8">
            {/* Template Selector */}
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />

            {/* Social Share Buttons */}
            <SocialShareButtons
              verse={verse}
              reference={reference}
              imageUrl={generatedImageUrl}
              isLoading={isGenerating}
            />

            {/* Verse Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Selected Verse</h3>
              <p className="text-gray-600 italic mb-2">"{verse}"</p>
              <p className="text-sm text-gray-500">— {reference}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}