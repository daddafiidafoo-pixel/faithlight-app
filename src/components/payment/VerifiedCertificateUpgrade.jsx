import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const VERIFIED_CERTIFICATE_PRICE_ID = 'price_1SzqvuCbIJ45iaAToJdhIIQO'; // From Stripe setup

export default function VerifiedCertificateUpgrade({ certificate, onUpgradeSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if running in iframe (published app required)
      if (window.self !== window.top) {
        alert('Certificate checkout must be completed from the published app. Please visit the full website.');
        setIsLoading(false);
        return;
      }

      // Create checkout session
      const response = await base44.functions.invoke('createCheckoutSession', {
        certificateId: certificate.id,
        priceId: VERIFIED_CERTIFICATE_PRICE_ID,
        itemType: 'certificate_upgrade',
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.message || 'Failed to start upgrade process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50">
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-600" />
          Upgrade to Verified Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Current Status */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-sm text-gray-600">Current Status:</p>
          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-100">
              Basic Certificate
            </Badge>
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Upgrade Benefits:</p>
          <ul className="space-y-2">
            {[
              'Official FaithLight Seal',
              'Unique Certificate ID',
              'QR Code Verification',
              'Resume & Portfolio Ready',
              'Ministry Credibility',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-gray-600">Investment:</p>
          <p className="text-3xl font-bold text-amber-900">$9.99</p>
          <p className="text-xs text-gray-600 mt-1">One-time payment. Lifetime access.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Upgrade Button */}
        <Button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-amber-600 hover:bg-amber-700 gap-2 text-white font-semibold py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Upgrade Now ($9.99)
            </>
          )}
        </Button>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 text-center">
          Secure payment processed by Stripe. Your certificate upgrade will be instant upon completion.
        </p>
      </CardContent>
    </Card>
  );
}