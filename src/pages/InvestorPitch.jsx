import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, TrendingUp, Shield, Zap, Target } from 'lucide-react';

export default function InvestorPitch() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">Investor Overview</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">FaithLight</h1>
          <p className="text-2xl text-indigo-600 font-semibold">
            The World's First Structured Christian Growth Ecosystem
          </p>
        </div>

        {/* Elevator Pitch */}
        <Card className="mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold mb-4">🎤 The Pitch (60 Seconds)</h2>
            <p className="text-lg leading-relaxed">
              FaithLight is a structured, safety-first Christian discipleship platform that guides believers step-by-step from new faith to leadership using level-based growth, multilingual support, audio-centered learning, and verified community safeguards.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Unlike traditional Bible apps that offer content without structure, FaithLight delivers guided spiritual progression with built-in safety, accountability, and leadership qualification.
            </p>
            <p className="text-lg font-semibold mt-4 italic">
              We are building the world's first structured Christian growth ecosystem.
            </p>
          </CardContent>
        </Card>

        {/* Market Opportunity */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <Globe className="w-7 h-7 text-indigo-600" />
              Market Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">2.3+ Billion Christians</p>
              <p className="text-gray-700 mt-2">Global faith community with rapid digital adoption</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Market Drivers</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Explosive growth in digital faith tools</li>
                  <li>✓ High demand for safe Christian community</li>
                  <li>✓ Global shift to audio-based learning</li>
                  <li>✓ Desperate need for leadership development</li>
                </ul>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Market Gap</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Most apps = content libraries (no structure)</li>
                  <li>✓ Zero safety accountability systems</li>
                  <li>✓ No verified leadership qualification</li>
                  <li>✓ Few multilingual faith options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Advantage */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
              <Shield className="w-7 h-7 text-green-600" />
              Competitive Moat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Level-Based Discipleship System</h3>
                  <p className="text-gray-700 text-sm">Proprietary 4-level spiritual growth progression with real milestone requirements—not just content consumption.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Verified Leadership Control</h3>
                  <p className="text-gray-700 text-sm">First faith platform with approval-based leadership system—protects users from unqualified teachers.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Multilingual Contextual Growth</h3>
                  <p className="text-gray-700 text-sm">Doctrine-consistent but culturally contextualized teaching across languages and regions.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Audio-First Structured Training</h3>
                  <p className="text-gray-700 text-sm">Designed for global contexts—low bandwidth, high engagement, accessible to oral cultures.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Doctrinally-Grounded AI Tutor</h3>
                  <p className="text-gray-700 text-sm">AI with guardrails—never replaces church, always points to Scripture, prevents misinformation.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Model */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">💰 Revenue Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Diversified, Ethical Revenue Streams</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-600 pl-4">
                  <p className="font-semibold text-gray-900">Freemium Model</p>
                  <p className="text-sm text-gray-600">Core content always free. Premium advanced features = $6.99/mo or $59.99/yr</p>
                  <p className="text-xs text-gray-500 mt-1">Conservative conversion: 3–5% of users = $2M–5M ARR at scale</p>
                </div>

                <div className="border-l-4 border-indigo-600 pl-4">
                  <p className="font-semibold text-gray-900">Church Subscription Plans</p>
                  <p className="text-sm text-gray-600">$19–49/month per organization for unlimited members + admin tools</p>
                  <p className="text-xs text-gray-500 mt-1">1,000 churches @ avg $30/mo = $360K MRR = $4.3M ARR</p>
                </div>

                <div className="border-l-4 border-indigo-600 pl-4">
                  <p className="font-semibold text-gray-900">Ethical Donations</p>
                  <p className="text-sm text-gray-600">Optional mission support from individual donors and organizations</p>
                  <p className="text-xs text-gray-500 mt-1">Modest 1–2% opt-in = $200K–500K annually</p>
                </div>

                <div className="border-l-4 border-indigo-600 pl-4">
                  <p className="font-semibold text-gray-900">Enterprise/Denominations</p>
                  <p className="text-sm text-gray-600">White-label, custom integration for large faith networks</p>
                  <p className="text-xs text-gray-500 mt-1">Potential $500K–$2M+ contracts</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <p className="font-bold text-gray-900 text-lg">Projected 5-Year ARR: $8M–$15M+</p>
              <p className="text-gray-700 text-sm mt-2">Low infrastructure cost per user + strong unit economics = High margin business</p>
            </div>
          </CardContent>
        </Card>

        {/* Unit Economics */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">📊 Unit Economics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Freemium Individual</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">LTV:</span> $40–80 (2–3 years)</li>
                  <li><span className="font-semibold">CAC:</span> $5–10 (organic + social)</li>
                  <li><span className="font-semibold">Ratio:</span> 4:1 to 8:1 ✅</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Church Subscription</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><span className="font-semibold">LTV:</span> $5K–15K (5 years)</li>
                  <li><span className="font-semibold">CAC:</span> $500–1K (sales outreach)</li>
                  <li><span className="font-semibold">Ratio:</span> 10:1 to 15:1 ✅✅</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Timeline */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">🗓 Strategic Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="font-bold text-gray-900">Phase 1 (Now) – MVP & Early Adoption</p>
              <p className="text-sm text-gray-700 mt-1">Launch structured 4-level platform, verified leadership system, 2 languages (English + Afaan Oromoo)</p>
            </div>

            <div className="border-l-4 border-green-600 pl-4">
              <p className="font-bold text-gray-900">Phase 2 (6 Months) – Monetization & Scale</p>
              <p className="text-sm text-gray-700 mt-1">Launch Premium tier, church plans, reach 100K users, expand to 5 languages</p>
            </div>

            <div className="border-l-4 border-purple-600 pl-4">
              <p className="font-bold text-gray-900">Phase 3 (1–2 Years) – Regional Hubs</p>
              <p className="text-sm text-gray-700 mt-1">Establish geographic leadership centers, 20+ languages, 1M+ users, enterprise integrations</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <p className="font-bold text-gray-900">Phase 4 (3–5 Years) – Market Leadership</p>
              <p className="text-sm text-gray-700 mt-1">Global discipleship leader, 10M+ users, denominational partnerships, sustainable profitability</p>
            </div>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-bold mb-6">🌍 Long-Term Vision</h2>
            <div className="space-y-4 text-lg">
              <p>
                FaithLight becomes <strong>the global digital discipleship academy</strong> for the modern Church.
              </p>
              <p>
                A <strong>church-support platform</strong> that makes structured spiritual growth accessible everywhere.
              </p>
              <p>
                A <strong>leadership training ecosystem</strong> that qualifies and equips the next generation of Christian leaders.
              </p>
              <p>
                A <strong>safe alternative</strong> to unmoderated faith communities where misinformation thrives.
              </p>
              <p className="italic mt-6">
                We envision a world where every believer, regardless of geography or access, can grow in faith with clarity, safety, and community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}