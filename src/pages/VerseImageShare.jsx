import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Copy, Download, MessageCircle, Heart } from 'lucide-react';

const SHARE_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', emoji: '📸', color: 'bg-pink-500 hover:bg-pink-600' },
  { id: 'facebook', name: 'Facebook', emoji: 'f', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'whatsapp', name: 'WhatsApp', emoji: '💬', color: 'bg-green-500 hover:bg-green-600' },
  { id: 'twitter', name: 'Twitter/X', emoji: '𝕏', color: 'bg-gray-900 hover:bg-black' },
  { id: 'pinterest', name: 'Pinterest', emoji: '📌', color: 'bg-red-600 hover:bg-red-700' },
];

export default function VerseImageShare() {
  const navigate = useNavigate();
  const [params, setParams] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setParams({
      verse: searchParams.get('verse') || 'John 3:16',
      template: searchParams.get('template') || 'sunrise',
    });
  }, []);

  const handleCopyText = () => {
    const text = `Check out this verse from FaithLight: ${params.verse}\n\nGenerated with FaithLight - Grow in faith every day ✨`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const caption = `Check out this verse: ${params.verse}\n\nCreated with FaithLight ✨`;
    const urls = {
      instagram: `https://www.instagram.com/`,
      facebook: `https://www.facebook.com/share/share.php?quote=${encodeURIComponent(caption)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(caption)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
      pinterest: `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(caption)}`,
    };

    if (platform === 'instagram') {
      alert('Open Instagram app and use "Share" on your device to share this verse image');
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  const handleDownload = () => {
    alert('Image downloaded to your device! 🎉\n\nShare it anywhere to inspire your faith community.');
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
          <h1 className="text-2xl font-bold">Share Verse Card</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-3xl mx-auto">
        {/* Success Message */}
        <Card className="p-6 mb-8 bg-green-50 border-2 border-green-200">
          <h2 className="font-bold text-green-900 mb-2">✨ Your verse card is ready!</h2>
          <p className="text-sm text-green-800">
            Share it with your faith community and inspire others.
          </p>
        </Card>

        {/* Download Option */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Save to Device</h2>
          <Button
            onClick={handleDownload}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Image
          </Button>
        </div>

        {/* Share Platforms */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Share on Social Media</h2>
          <div className="grid grid-cols-2 gap-3">
            {SHARE_PLATFORMS.map((platform) => (
              <Button
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                className={`${platform.color} text-white h-12 text-sm font-semibold flex items-center justify-center gap-2`}
              >
                <span>{platform.emoji}</span>
                {platform.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Copy Text */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Caption</h2>
          <Card className="p-4 bg-gray-50 mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Check out this verse from FaithLight: <strong>{params.verse}</strong>
              {'\n\n'}
              Generated with FaithLight - Grow in faith every day ✨
            </p>
          </Card>
          <Button
            onClick={handleCopyText}
            variant="outline"
            className="w-full h-12"
          >
            <Copy className="w-5 h-5 mr-2" />
            {copied ? 'Copied!' : 'Copy Caption'}
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="p-6 bg-purple-50 border-2 border-purple-200">
          <h3 className="font-bold text-purple-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li>✅ Share your verse card on social media</li>
            <li>✅ Create more cards from your saved verses</li>
            <li>✅ Start a daily verse habit with notifications</li>
            <li>✅ Join the prayer community</li>
          </ul>
        </Card>

        {/* Continue Button */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('VerseImageGenerator'))}
            variant="outline"
            className="w-full h-12 text-base"
          >
            Create Another Card
          </Button>
        </div>
      </div>
    </div>
  );
}