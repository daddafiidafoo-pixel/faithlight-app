import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Volume2, Sparkles, Play, Languages, Mic2 } from 'lucide-react';

const AI_VOICES = [
  { id: 'nova', name: 'Nova', gender: 'female', style: 'Clear & Expressive', accent: 'American', description: 'Natural and articulate' },
  { id: 'alloy', name: 'Alloy', gender: 'neutral', style: 'Balanced & Warm', accent: 'Neutral', description: 'Versatile and clear' },
  { id: 'echo', name: 'Echo', gender: 'male', style: 'Deep & Resonant', accent: 'American', description: 'Rich and authoritative' },
  { id: 'fable', name: 'Fable', gender: 'male', style: 'Distinguished', accent: 'British', description: 'Refined and elegant' },
  { id: 'onyx', name: 'Onyx', gender: 'male', style: 'Powerful & Commanding', accent: 'American', description: 'Strong and confident' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', style: 'Gentle & Soothing', accent: 'American', description: 'Calm and peaceful' },
  { id: 'sage', name: 'Sage', gender: 'male', style: 'Wise & Reflective', accent: 'American', description: 'Thoughtful and deep' },
  { id: 'aria', name: 'Aria', gender: 'female', style: 'Melodic & Uplifting', accent: 'American', description: 'Inspiring and joyful' }
];

const ACCENT_OPTIONS = [
  { id: 'american', name: 'American', flag: '🇺🇸' },
  { id: 'british', name: 'British', flag: '🇬🇧' },
  { id: 'australian', name: 'Australian', flag: '🇦🇺' },
  { id: 'neutral', name: 'Neutral', flag: '🌐' }
];

const STYLE_OPTIONS = [
  { id: 'natural', name: 'Natural', description: 'Conversational and authentic' },
  { id: 'dramatic', name: 'Dramatic', description: 'Expressive and engaging' },
  { id: 'calm', name: 'Calm', description: 'Peaceful and meditative' },
  { id: 'authoritative', name: 'Authoritative', description: 'Strong and commanding' }
];

export default function AIVoiceSelector({ currentSettings, onSettingsChange, onPreview }) {
  const [previewVoice, setPreviewVoice] = useState(null);
  const [selectedAccent, setSelectedAccent] = useState(currentSettings.accent || 'american');
  const [selectedStyle, setSelectedStyle] = useState(currentSettings.style || 'natural');

  const handleVoiceChange = (voiceId) => {
    const voice = AI_VOICES.find(v => v.id === voiceId);
    onSettingsChange({ ...currentSettings, voice: voice, accent: selectedAccent, style: selectedStyle });
  };

  const handleAccentChange = (accent) => {
    setSelectedAccent(accent);
    onSettingsChange({ ...currentSettings, accent });
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
    onSettingsChange({ ...currentSettings, style });
  };

  const handlePreview = async (voice) => {
    setPreviewVoice(voice.id);
    const sampleText = "In the beginning, God created the heavens and the earth.";
    await onPreview(voice, sampleText);
    setPreviewVoice(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-3">
          <Label>Select Voice</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_VOICES.map(voice => (
              <div
                key={voice.id}
                onClick={() => handleVoiceChange(voice.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentSettings.voice?.id === voice.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{voice.name}</h4>
                    <p className="text-xs text-gray-600">{voice.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(voice);
                    }}
                    disabled={previewVoice === voice.id}
                    className="h-8 w-8"
                  >
                    {previewVoice === voice.id ? (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {voice.gender}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {voice.accent}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accent Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Accent
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ACCENT_OPTIONS.map(accent => (
              <button
                key={accent.id}
                onClick={() => handleAccentChange(accent.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedAccent === accent.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{accent.flag}</div>
                <div className="text-xs font-medium">{accent.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Speaking Style */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Mic2 className="w-4 h-4" />
            Speaking Style
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {STYLE_OPTIONS.map(style => (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedStyle === style.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{style.name}</div>
                <div className="text-xs text-gray-600">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Speed</Label>
            <span className="text-sm font-medium text-gray-700">
              {currentSettings.speed}x
            </span>
          </div>
          <Slider
            value={[currentSettings.speed]}
            onValueChange={([value]) => onSettingsChange({ ...currentSettings, speed: value })}
            min={0.5}
            max={2}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Slower (0.5x)</span>
            <span>Normal (1x)</span>
            <span>Faster (2x)</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Pitch</Label>
            <span className="text-sm font-medium text-gray-700">
              {currentSettings.pitch > 1 ? '+' : ''}{((currentSettings.pitch - 1) * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[currentSettings.pitch]}
            onValueChange={([value]) => onSettingsChange({ ...currentSettings, pitch: value })}
            min={0.75}
            max={1.25}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Lower</span>
            <span>Normal</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Volume
            </Label>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(currentSettings.volume * 100)}%
            </span>
          </div>
          <Slider
            value={[currentSettings.volume]}
            onValueChange={([value]) => onSettingsChange({ ...currentSettings, volume: value })}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Background Playback Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div>
            <Label className="cursor-pointer">Enable Background Playback</Label>
            <p className="text-xs text-gray-600">Continue playing when app is minimized</p>
          </div>
          <input
            type="checkbox"
            checked={currentSettings.backgroundPlayback}
            onChange={(e) => onSettingsChange({ ...currentSettings, backgroundPlayback: e.target.checked })}
            className="w-5 h-5 accent-purple-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}