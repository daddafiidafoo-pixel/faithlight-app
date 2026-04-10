import React from 'react';
import { Button } from '@/components/ui/button';
import { Apple, Smartphone, Download as DownloadIcon } from 'lucide-react';

export default function Download() {
  const detectPlatform = () => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'web';
  };

  const platform = detectPlatform();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <DownloadIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Get FaithLight</h1>
          <p className="text-xl text-gray-600">
            Read Scripture, join live church sessions, and grow your faith with the community.
          </p>
        </div>

        {/* Download buttons */}
        <div className="space-y-4 mb-12">
          {/* iOS */}
          {(platform === 'web' || platform === 'ios') && (
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-black hover:bg-gray-900 text-white h-16 rounded-xl gap-3 text-lg font-semibold">
                <Apple className="w-6 h-6" />
                Download on App Store
              </Button>
            </a>
          )}

          {/* Android */}
          {(platform === 'web' || platform === 'android') && (
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-16 rounded-xl gap-3 text-lg font-semibold">
                <Smartphone className="w-6 h-6" />
                Get on Google Play
              </Button>
            </a>
          )}
        </div>

        {/* Features list */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why FaithLight?</h2>
          <div className="space-y-4">
            {[
              { title: '📖 Read Anywhere', desc: 'Access Scripture offline, anytime' },
              { title: '⛪ Live Church Sessions', desc: 'Join your church service with real-time sermons' },
              { title: '💬 Community Prayer', desc: 'Share prayer requests and encourage others' },
              { title: '✍️ Study Tools', desc: 'AI-powered explanations and study plans' }
            ].map((feature, i) => (
              <div key={i} className="text-left">
                <p className="font-semibold text-gray-900">{feature.title}</p>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Note about store links */}
        <p className="text-sm text-gray-500">
          Links above are placeholders. They will redirect to the actual App Store and Google Play once FaithLight is published.
        </p>
      </div>
    </div>
  );
}