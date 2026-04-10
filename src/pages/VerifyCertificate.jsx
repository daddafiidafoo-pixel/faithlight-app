import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react';
import { verifyCertificate } from '../functions/certificateGenerator';

export default function VerifyCertificate() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certificateNumber.trim() || !verificationCode.trim()) {
      setResult({ valid: false, message: 'Please fill in both fields' });
      return;
    }

    setIsVerifying(true);
    const verifyResult = await verifyCertificate(certificateNumber, verificationCode);
    setResult(verifyResult);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
          </div>
          <p className="text-gray-600">
            Enter the certificate details below to verify its authenticity
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Certificate Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Certificate Number
                </label>
                <Input
                  placeholder="e.g., FL-2026-ABC123"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  disabled={isVerifying}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Verification Code
                </label>
                <Input
                  placeholder="e.g., VERIFY-1234567890-ABC123"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isVerifying}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isVerifying}
                className="w-full gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <div className="space-y-4">
            {result.valid ? (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800 ml-2">
                    ✓ Certificate verified successfully
                  </AlertDescription>
                </Alert>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{result.tierInfo.subtitle}</span>
                      <Badge className="bg-green-600">Verified</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Student Name</p>
                      <p className="font-semibold text-lg text-gray-900">
                        {result.certificate.student_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Program</p>
                      <p className="font-semibold text-gray-900">{result.certificate.program_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Certificate ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-900">
                          {result.certificate.certificate_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Issued</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(result.certificate.awarded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Instructor</p>
                      <p className="font-semibold text-gray-900">{result.certificate.instructor_name}</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200 mt-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Certificate Details</p>
                      <p className="text-xs text-gray-700">
                        This certificate confirms that the holder has successfully completed the 
                        {result.tierInfo.subtitle} program and demonstrates commitment to biblical 
                        learning and Christian leadership.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">
                  ✗ {result.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">About FaithLight Certificates</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Each certificate has a unique ID and verification code</li>
              <li>✓ Certificates are awarded upon successful course completion</li>
              <li>✓ Three tiers available: Foundation, Leadership, and Theological</li>
              <li>✓ All certificates are digitally signed and verified by FaithLight</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}