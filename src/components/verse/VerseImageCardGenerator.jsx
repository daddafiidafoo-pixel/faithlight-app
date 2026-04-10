import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Share2, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const VERSE_STYLES = [
  { name: 'Classic Purple', bg: 'bg-gradient-to-br from-purple-900 to-purple-700', text: 'text-white' },
  { name: 'Ocean Blue', bg: 'bg-gradient-to-br from-blue-900 to-blue-600', text: 'text-white' },
  { name: 'Sunrise Gold', bg: 'bg-gradient-to-br from-amber-700 to-orange-600', text: 'text-white' },
  { name: 'Forest Green', bg: 'bg-gradient-to-br from-emerald-900 to-emerald-700', text: 'text-white' },
  { name: 'Minimal Light', bg: 'bg-white', text: 'text-gray-900' },
];

export default function VerseImageCardGenerator() {
  const [verse, setVerse] = useState('John 3:16');
  const [verseText, setVerseText] = useState(
    'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'
  );
  const [style, setStyle] = useState('Classic Purple');
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef(null);

  const selectedStyle = VERSE_STYLES.find((s) => s.name === style) || VERSE_STYLES[0];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `verse-${verse.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
      toast.success('Image downloaded!');
    } catch (err) {
      toast.error('Failed to download image');
    } finally {
      setGenerating(false);
    }
  };

  const shareToInstagram = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const image = canvas.toDataURL('image/png');

      // Copy to clipboard for manual sharing
      navigator.clipboard.writeText(verse);
      toast.success('Verse copied. Open Instagram and paste in caption!');

      // Try native share if available
      if (navigator.share) {
        navigator.share({
          title: 'FaithLight Verse',
          text: verseText,
        });
      }
    } catch (err) {
      toast.error('Failed to prepare for sharing');
    }
  };

  const shareToWhatsApp = () => {
    const text = `${verse}\n\n"${verseText}"\n\n✨ Shared from FaithLight`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Input Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Create Verse Card</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bible Reference
            </label>
            <Input
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="e.g., John 3:16"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verse Text
            </label>
            <textarea
              value={verseText}
              onChange={(e) => setVerseText(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm resize-none"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERSE_STYLES.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <div
        ref={cardRef}
        className={`${selectedStyle.bg} ${selectedStyle.text} p-12 rounded-2xl aspect-square flex flex-col justify-center items-center text-center shadow-2xl`}
        style={{ minHeight: '400px' }}
      >
        <div className="mb-6">
          <p className="text-sm opacity-80 font-light">Bible Verse</p>
          <p className="text-2xl font-bold my-2">{verse}</p>
        </div>

        <p className="text-lg leading-relaxed mb-8 max-w-sm italic">
          "{verseText}"
        </p>

        <div className="mt-auto pt-6 border-t border-current border-opacity-30">
          <p className="text-sm font-light">✨ FaithLight</p>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={handleDownload}
          disabled={generating}
          variant="outline"
          className="flex items-center gap-2"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download
        </Button>

        <Button
          onClick={shareToWhatsApp}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          WhatsApp
        </Button>

        <Button
          onClick={shareToInstagram}
          className="bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Instagram
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Share your faith. Spread the word. 🙏
      </p>
    </div>
  );
}