import React, { useState } from 'react';
import { Radio, Copy, Check, Info, AlertCircle, Mic, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LiveBroadcastSetup({ onStartBroadcast, onClose }) {
  const [step, setStep] = useState('setup'); // setup | preview | live
  const [formData, setFormData] = useState({
    platform: 'youtube',
    streamKey: '',
    streamTitle: 'Sunday Sermon Service',
  });
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      logo: '▶️',
      desc: 'Live stream to your YouTube channel',
      howTo: 'Go to YouTube Studio > Create > Go live > Copy stream key'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      logo: 'f',
      desc: 'Stream to Facebook Live',
      howTo: 'Go to Facebook > Create Video > Copy stream key from settings'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      logo: '♪',
      desc: 'Go live on TikTok',
      howTo: 'Open TikTok > Create > Go Live > Copy stream key'
    },
  ];

  const copyStreamKey = () => {
    navigator.clipboard.writeText(formData.streamKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartBroadcast = async () => {
    if (!formData.streamKey.trim()) {
      alert('Please enter a stream key');
      return;
    }

    setIsStarting(true);
    try {
      // Call backend to initiate RTMP connection
      const response = await fetch('/api/live-broadcast/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: formData.platform,
          streamKey: formData.streamKey,
          streamTitle: formData.streamTitle,
        }),
      });

      if (!response.ok) throw new Error('Failed to start broadcast');

      setStep('live');
      onStartBroadcast?.({
        platform: formData.platform,
        title: formData.streamTitle,
        streamKey: formData.streamKey,
      });
    } catch (err) {
      console.error('Broadcast error:', err);
      alert('Failed to start broadcast. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  // Setup Screen
  if (step === 'setup') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">🎥 Go Live</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Stream Title
              </label>
              <input
                type="text"
                value={formData.streamTitle}
                onChange={(e) => setFormData({ ...formData, streamTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g., Sunday Sermon Service"
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Choose Platform
              </label>
              <div className="space-y-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setFormData({ ...formData, platform: p.id })}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      formData.platform === p.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          formData.platform === p.id
                            ? 'border-indigo-600 bg-indigo-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.platform === p.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.logo} {p.name}</p>
                        <p className="text-sm text-gray-600">{p.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Instructions */}
            <Card className="bg-blue-50 border-blue-200 p-4">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">How to get stream key:</p>
                  <p className="text-xs text-blue-800 mt-1">
                    {platforms.find((p) => p.id === formData.platform)?.howTo}
                  </p>
                </div>
              </div>
            </Card>

            {/* Stream Key Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Stream Key (paste here)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={formData.streamKey}
                  onChange={(e) => setFormData({ ...formData, streamKey: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none text-sm"
                  placeholder="rtmp://a.rtmp.youtube.com/live2/..."
                />
                <button
                  onClick={copyStreamKey}
                  className="px-3 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                🔒 Your stream key is private and encrypted
              </p>
            </div>

            {/* Warning */}
            <Card className="bg-amber-50 border-amber-200 p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Live streaming tips:</p>
                  <ul className="text-xs text-amber-800 mt-1 space-y-1">
                    <li>✓ Test audio/video before going live</li>
                    <li>✓ Ensure stable internet connection</li>
                    <li>✓ Have your sermon content ready</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartBroadcast}
                disabled={!formData.streamKey.trim() || isStarting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                {isStarting ? 'Starting...' : 'Start Live Broadcast'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live Screen
  if (step === 'live') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-300 animate-pulse" />
              <span className="font-bold text-sm">LIVE NOW</span>
            </div>
            <h2 className="text-2xl font-black">{formData.streamTitle}</h2>
            <p className="text-sm text-red-100 mt-2 flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Streaming to {formData.platform.charAt(0).toUpperCase() + formData.platform.slice(1)}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Stream Status</p>
              <p className="text-2xl font-black text-green-600">🟢 LIVE</p>
            </div>

            <Card className="bg-blue-50 border-blue-200 p-4">
              <p className="text-sm text-blue-900">
                ✓ Your stream is now live on {formData.platform}
              </p>
              <p className="text-xs text-blue-800 mt-2">
                Share your broadcast link with your congregation
              </p>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Stop broadcast
                  setStep('setup');
                  onClose?.();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Stop Broadcast
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}