import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function CertificateCheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    };
    checkAuth();
  }, []);

  // Verify session with backend
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ['verify-checkout', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;

      try {
        const result = await base44.functions.invoke('verifyCheckoutSession', {
          sessionId,
        });
        return result.data;
      } catch (err) {
        console.error('Error verifying session:', err);
        throw err;
      }
    },
    enabled: !!sessionId && !!user,
    retry: 2,
  });

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <p className="text-gray-800 font-semibold">Invalid Link</p>
            <p className="text-sm text-gray-600">
              This link is missing payment information. Please try again.
            </p>
            <Link to={createPageUrl('Home')}>
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <p className="text-gray-800 font-semibold">Verification Failed</p>
            <p className="text-sm text-gray-600">
              We couldn't verify your payment. Please contact support if this persists.
            </p>
            <div className="flex gap-2">
              <Link to={createPageUrl('Home')}>
                <Button variant="outline">Go Home</Button>
              </Link>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentSuccess = sessionData?.paymentStatus === 'paid';

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
        isPaymentSuccess
          ? 'bg-gradient-to-br from-green-50 to-blue-50'
          : 'bg-gradient-to-br from-yellow-50 to-orange-50'
      }`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Header */}
        <Card
          className={`border-2 ${
            isPaymentSuccess ? 'border-green-400 bg-gradient-to-br from-green-50 to-white' : 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-white'
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2
                className={`w-8 h-8 ${isPaymentSuccess ? 'text-green-600' : 'text-yellow-600'}`}
              />
              <CardTitle className="text-2xl">
                {isPaymentSuccess ? 'Payment Successful!' : 'Payment Processing...'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {isPaymentSuccess
                ? 'Thank you for upgrading to a verified certificate. Your official FaithLight certificate is now ready!'
                : 'Your payment is being processed. Please check back in a moment.'}
            </p>

            {sessionData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-gray-900">{sessionId.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ${(sessionData.amountTotal / 100).toFixed(2)} {sessionData.currency?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{sessionData.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-semibold ${
                      isPaymentSuccess ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {sessionData.paymentStatus}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        {isPaymentSuccess && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Verified Certificate Now Includes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  '✓ Official FaithLight Seal',
                  '✓ Unique Certificate ID',
                  '✓ QR Code for instant verification',
                  '✓ Professional PDF design',
                  '✓ Lifetime access & downloads',
                  '✓ LinkedIn shareable format',
                ].map((item) => (
                  <li key={item} className="text-gray-700 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700">
              Your certificate will be available in your profile momentarily. You can:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Download your official verified certificate as PDF</li>
              <li>• Share on LinkedIn and social media</li>
              <li>• Add to your portfolio and resume</li>
              <li>• Share the QR code for instant verification</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link to={createPageUrl('MyCertificates')}>
            <Button className="w-full bg-green-600 hover:bg-green-700 py-3 font-semibold">
              View My Certificates
            </Button>
          </Link>

          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="w-full py-3 font-semibold">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Receipt Info */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">Payment Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-gray-600">
              A detailed receipt has been sent to <span className="font-semibold">{sessionData?.customerEmail}</span>
            </p>
            <p className="text-xs text-gray-500">
              Your payment is secure and processed by Stripe. For any questions, contact support@faithlight.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}