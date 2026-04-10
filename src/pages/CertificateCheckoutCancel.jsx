import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function CertificateCheckoutCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cancellation Notice */}
        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Your certificate upgrade payment was cancelled. Your basic certificate remains valid and available in your profile.
            </p>
            <p className="text-gray-600 text-sm">
              You can upgrade to a verified certificate anytime from your certificates page.
            </p>
          </CardContent>
        </Card>

        {/* Why Upgrade? */}
        <Card>
          <CardHeader>
            <CardTitle>Why Upgrade to Verified Certificate?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                '📜 Official FaithLight Seal - Professional recognition',
                '🔐 QR Code Verification - Instant authentication',
                '💼 Resume Ready - Impress employers and organizations',
                '🏆 Ministry Credibility - Build leadership authority',
                '⏰ Lifetime Access - Never expires',
              ].map((item) => (
                <li key={item} className="text-gray-700 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>Just $9.99</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              One-time payment for lifetime verified certificate access. Your investment in professional ministry credentials.
            </p>
            <Link to={createPageUrl('MyCertificates')}>
              <Button className="w-full bg-green-600 hover:bg-green-700 py-3 font-semibold">
                Return to Certificates
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 text-sm">
              If you have any questions about verified certificates or need assistance, please reach out to our support team.
            </p>
            <a href="mailto:support@faithlight.com" className="text-blue-600 hover:underline text-sm font-semibold">
              support@faithlight.com
            </a>
          </CardContent>
        </Card>

        {/* Return Button */}
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="w-full py-3 font-semibold">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}