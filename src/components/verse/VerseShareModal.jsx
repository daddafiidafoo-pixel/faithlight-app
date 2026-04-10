import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Square, MessageCircle, Image, Type, Palette, Download, Share2, Copy, Check } from 'lucide-react';
import VerseSharePreview from './VerseSharePreview';
import { base44 } from '@/api/base44Client';

const FORMATS = [
  { id: 'square', label: 'Square', icon: Square, size: 512 },
  { id: 'story', label: 'Story (9:16)', icon: MessageCircle, size: 1080 },
  { id: 'portrait', label: 'Portrait (4:5)', icon: Image, size: 1080 },
];

const TEMPLATES = [
  { id: 'clean-light', label: 'Clean Light', bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)' },
  { id: 'faithlight-blue', label: 'FaithLight Blue', bgGradient: 'linear-gradient(135deg, #6C5CE7 0%, #8B7EEF 100%)' },
  { id: 'soft-scripture', label: 'Soft Scripture', bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #f5e8d2 100%)' },
];

const FONTS = [
  { id: 'modern', label: 'Modern', family: 'Inter, sans-serif' },
  { id: 'serif', label: 'Serif', family: 'Georgia, serif' },
  { id: 'bold', label: 'Bold', family: 'system-ui, sans-serif' },
];

export default function VerseShareModal({ open, onClose, verse, reference, language = 'en' }) {
  const [format, setFormat] = useState('story');
  const [template, setTemplate] = useState('faithlight-blue');
  const [fontStyle, setFontStyle] = useState('modern');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const canvas = document.getElementById('verse-share-preview');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const imageData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `faithlight-verse-${Date.now()}.png`;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    const text = `"${verse}" — ${reference}\n\nShared via FaithLight 🙏`;
    if (navigator.share) {
      navigator.share({ title: 'FaithLight Verse', text });
    }
  };

  const handleCopyText = () => {
    const text = `"${verse}" — ${reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templateData = TEMPLATES.find(t => t.id === template);
  const fontData = FONTS.find(f => f.id === fontStyle);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Verse</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
            <VerseSharePreview
              verse={verse}
              reference={reference}
              format={format}
              template={templateData}
              fontStyle={fontData}
              language={selectedLanguage}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Format */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map(fmt => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        format === fmt.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Template</label>
              <div className="space-y-2">
                {TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplate(tmpl.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      template === tmpl.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded"
                      style={{ background: tmpl.bgGradient }}
                    />
                    <span className="text-sm font-medium">{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Typography</label>
              <div className="grid grid-cols-3 gap-2">
                {FONTS.map(fnt => (
                  <button
                    key={fnt.id}
                    onClick={() => setFontStyle(fnt.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      fontStyle === fnt.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                    style={{ fontFamily: fnt.family }}
                  >
                    {fnt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="en">English</option>
                <option value="om">Afaan Oromoo</option>
                <option value="am">Amharic</option>
                <option value="ar">Arabic</option>
                <option value="sw">Kiswahili</option>
                <option value="fr">French</option>
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Download Image'}
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share to X
              </button>

              <button
                onClick={handleCopyText}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Verse Text'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}