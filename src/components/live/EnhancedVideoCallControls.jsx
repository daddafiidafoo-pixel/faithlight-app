import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Mic, MicOff, Video, VideoOff, Share2, Monitor, Settings,
  Sun, Moon, Maximize2, Volume2, Zap
} from 'lucide-react';

export default function EnhancedVideoCallControls({
  isMuted,
  isVideoOn,
  onToggleMic,
  onToggleVideo,
  onScreenShare,
  user
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [videoQuality, setVideoQuality] = useState('medium');
  const [enableVirtualBg, setEnableVirtualBg] = useState(false);
  const [bgOption, setBgOption] = useState('blur');

  const qualitySettings = {
    low: { width: 320, height: 240, bitrate: 300 },
    medium: { width: 640, height: 480, bitrate: 800 },
    high: { width: 1280, height: 720, bitrate: 2500 }
  };

  const backgroundOptions = [
    { id: 'blur', label: 'Blur', icon: '✨' },
    { id: 'office', label: 'Office', icon: '🏢' },
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'none', label: 'None', icon: '✕' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <Card className="p-4 bg-gray-900 border-0 text-white">
        <div className="flex items-center gap-2">
          {/* Main Controls */}
          <Button
            size="sm"
            variant={isMuted ? 'destructive' : 'default'}
            onClick={onToggleMic}
            className="gap-2"
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isMuted ? 'Muted' : 'Mic'}
          </Button>

          <Button
            size="sm"
            variant={isVideoOn ? 'default' : 'destructive'}
            onClick={onToggleVideo}
            className="gap-2"
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            {isVideoOn ? 'Camera' : 'Off'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onScreenShare}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Screen
          </Button>

          {/* Settings Toggle */}
          <Button
            size="sm"
            variant={showSettings ? 'default' : 'outline'}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-full mb-2 left-0 w-80 bg-gray-800 rounded-lg p-4 space-y-4">
            {/* Video Quality */}
            <div>
              <label className="text-sm font-medium mb-2 block">Video Quality</label>
              <div className="flex gap-2">
                {Object.keys(qualitySettings).map((quality) => (
                  <Button
                    key={quality}
                    size="sm"
                    variant={videoQuality === quality ? 'default' : 'outline'}
                    onClick={() => setVideoQuality(quality)}
                    className="capitalize text-xs"
                  >
                    {quality}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {qualitySettings[videoQuality].width}x
                {qualitySettings[videoQuality].height} @ {qualitySettings[videoQuality].bitrate}kbps
              </p>
            </div>

            {/* Virtual Background */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={enableVirtualBg}
                  onChange={(e) => setEnableVirtualBg(e.target.checked)}
                />
                <span className="text-sm font-medium">Virtual Background</span>
              </label>
              {enableVirtualBg && (
                <div className="grid grid-cols-2 gap-2">
                  {backgroundOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setBgOption(opt.id)}
                      className={`p-2 rounded text-xs ${
                        bgOption === opt.id
                          ? 'bg-blue-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Input Level</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="80"
                className="w-full"
              />
            </div>

            {/* Network Stats */}
            <div className="bg-gray-900 rounded p-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className="text-green-400">Good</span>
              </div>
              <div className="flex justify-between">
                <span>Bitrate:</span>
                <span>~1.5 Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span>45ms</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}