import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Palette, Type, Zap } from 'lucide-react';

export default function BrandGuide() {
  const [copiedColor, setCopiedColor] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(id);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colors = [
    {
      name: 'Primary Blue',
      description: 'Trust, Stability, Spiritual Depth',
      hex: '#1E3A8A',
      rgb: '30, 58, 138',
      usage: 'Main buttons, headers, primary elements'
    },
    {
      name: 'Primary Blue Light',
      description: 'Hover states, secondary emphasis',
      hex: '#3B82F6',
      rgb: '59, 130, 246',
      usage: 'Hover effects, active states'
    },
    {
      name: 'Accent Gold',
      description: 'Divine Light, Growth, Value',
      hex: '#FBBF24',
      rgb: '251, 191, 36',
      usage: 'Premium badges, level highlights, CTAs'
    },
    {
      name: 'Growth Green',
      description: 'Progress, Level Advancement',
      hex: '#16A34A',
      rgb: '22, 163, 74',
      usage: 'Progress bars, success states, growth indicators'
    },
    {
      name: 'Level 1 - Emerald',
      description: 'New Believer',
      hex: '#10B981',
      rgb: '16, 185, 129',
      usage: 'Level 1 cards and badges'
    },
    {
      name: 'Level 2 - Amber',
      description: 'Growing Believer',
      hex: '#F59E0B',
      rgb: '245, 158, 11',
      usage: 'Level 2 cards and badges'
    },
    {
      name: 'Level 3 - Purple',
      description: 'Mature Believer',
      hex: '#8B5CF6',
      rgb: '139, 92, 246',
      usage: 'Level 3 cards and badges'
    },
    {
      name: 'Level 4 - Pink',
      description: 'Leader/Teacher',
      hex: '#EC4899',
      rgb: '236, 72, 153',
      usage: 'Level 4 cards and badges'
    }
  ];

  const typography = [
    { name: 'Display H1', size: '48px', weight: '700', usage: 'Page titles, hero headlines' },
    { name: 'Display H2', size: '36px', weight: '700', usage: 'Section headers' },
    { name: 'Heading H3', size: '24px', weight: '600', usage: 'Card titles, subsection headers' },
    { name: 'Heading H4', size: '20px', weight: '600', usage: 'Sub-headings' },
    { name: 'Body', size: '16px', weight: '400', usage: 'Main text content' },
    { name: 'Body Small', size: '14px', weight: '400', usage: 'Secondary text, descriptions' },
    { name: 'Caption', size: '12px', weight: '400', usage: 'Helper text, labels' }
  ];

  const brandValues = [
    {
      icon: '✨',
      title: 'Trust',
      description: 'Transparent, reliable, Scripture-centered design decisions'
    },
    {
      icon: '📈',
      title: 'Growth',
      description: 'Clear progression paths from new believer to leader'
    },
    {
      icon: '🛡️',
      title: 'Safety',
      description: 'Moderated, verified, secure community environment'
    },
    {
      icon: '📖',
      title: 'Guidance',
      description: 'Clear direction through Scripture and discipleship pathways'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">FaithLight Brand System</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our visual identity communicates trust, growth, clarity, and spiritual guidance. Every color, typeface, and spacing choice reflects our commitment to Scripture-centered discipleship.
          </p>
        </div>

        {/* Brand Values */}
        <Card className="border-2 border-indigo-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Brand Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {brandValues.map((value, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl mb-3">{value.icon}</div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            Color Palette
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {colors.map((color, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-24" style={{ backgroundColor: color.hex }} />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{color.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{color.description}</p>
                  <div className="space-y-2 text-xs">
                    <button
                      onClick={() => copyToClipboard(color.hex, `hex-${idx}`)}
                      className="w-full p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-left font-mono"
                    >
                      HEX: {color.hex}
                      {copiedColor === `hex-${idx}` && ' ✓'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(color.rgb, `rgb-${idx}`)}
                      className="w-full p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-left font-mono"
                    >
                      RGB: {color.rgb}
                      {copiedColor === `rgb-${idx}` && ' ✓'}
                    </button>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-xs">{color.usage}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Typography Scale */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Type className="w-6 h-6 text-indigo-600" />
            Typography Scale
          </h2>
          <Card>
            <CardContent className="p-6 space-y-6">
              {typography.map((typo, idx) => (
                <div key={idx} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div
                    style={{
                      fontSize: typo.size,
                      fontWeight: typo.weight,
                      lineHeight: '1.5'
                    }}
                    className="text-gray-900 mb-2"
                  >
                    {typo.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-mono">{typo.size}</span> •{' '}
                    <span className="font-mono">Weight {typo.weight}</span>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">{typo.usage}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Spacing System */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Spacing Scale</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6">8px base unit. All spacing derives from multiples of 8.</p>
              <div className="space-y-4">
                {[
                  { label: '4px', var: '--space-1', width: '4px' },
                  { label: '8px', var: '--space-2', width: '8px' },
                  { label: '12px', var: '--space-3', width: '12px' },
                  { label: '16px', var: '--space-4', width: '16px' },
                  { label: '24px', var: '--space-6', width: '24px' },
                  { label: '32px', var: '--space-8', width: '32px' },
                  { label: '48px', var: '--space-12', width: '48px' },
                  { label: '64px', var: '--space-16', width: '64px' }
                ].map((space, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16">
                      <span className="text-sm font-mono text-gray-600">{space.label}</span>
                    </div>
                    <div
                      style={{ width: space.width }}
                      className="bg-indigo-600 rounded"
                    />
                    <span className="text-xs text-gray-500 font-mono">{space.var}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand Voice */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle>Brand Voice & Tone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✓ FaithLight Sounds Like:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Calm and reassuring</li>
                  <li>✓ Encouraging but honest</li>
                  <li>✓ Structured and clear</li>
                  <li>✓ Theologically grounded</li>
                  <li>✓ Respectful of pastoral authority</li>
                  <li>✓ Humble about AI limitations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">✗ NOT:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✗ Hype-driven or sensational</li>
                  <li>✗ Emotionally manipulative</li>
                  <li>✗ "Breakthrough now" messaging</li>
                  <li>✗ Prosperity-focused language</li>
                  <li>✗ Overly casual or irreverent</li>
                  <li>✗ Claiming to replace the Church</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Use CSS Variables</h4>
              <code className="block bg-gray-100 p-3 rounded text-xs font-mono mb-2">
                background-color: var(--faith-light-primary);<br />
                color: var(--faith-light-accent);
              </code>
              <p>Never use hardcoded colors. This ensures consistency and enables future theme variations.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Contrast Standards</h4>
              <p>Maintain WCAG AAA contrast ratios (7:1 for normal text, 4.5:1 minimum). Test with accessibility tools.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Spacing & Rhythm</h4>
              <p>Use spacing variables consistently. Never use arbitrary spacing. This creates visual rhythm and professionalism.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Typography Hierarchy</h4>
              <p>Follow the scale precisely. Deviating from the scale breaks visual coherence. Use sizes, weights, and colors to establish hierarchy.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-gray-600">
            FaithLight Brand System v1.0 — Built on trust, clarity, and Scripture
          </p>
        </div>
      </div>
    </div>
  );
}