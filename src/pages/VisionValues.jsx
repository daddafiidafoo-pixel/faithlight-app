import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function VisionValues() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vision & Values</h1>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🌟 Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To build a global, safe, and structured discipleship platform that guides believers from spiritual infancy to mature Christian leadership.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              FaithLight exists to:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Provide clear, step-by-step spiritual growth pathways</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Protect believers through verified leadership and community safeguards</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Deliver multilingual, accessible Christian teaching</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Equip and raise biblically grounded leaders</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Foster authentic Christian fellowship in a safe digital space</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🕊 Core Values</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="text-3xl">📖</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Biblical Integrity</h3>
                  <p className="text-gray-700">Scripture is the foundation of all teaching. We never compromise God's Word for convenience or profit.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-3xl">📈</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Spiritual Maturity</h3>
                  <p className="text-gray-700">We guide believers toward deepening faith, biblical understanding, and mature leadership.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-3xl">🛡️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Safety & Accountability</h3>
                  <p className="text-gray-700">Verified leaders, reporting systems, and community standards protect believers from misinformation and harm.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-3xl">🌍</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Global Accessibility</h3>
                  <p className="text-gray-700">Multilingual support, fair pricing, and inclusive design for believers everywhere.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-3xl">🙏</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Servant Leadership</h3>
                  <p className="text-gray-700">We serve the local Church and equip leaders with humility and integrity.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}