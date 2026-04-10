import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useFeatureGate } from '@/components/hooks/useFeatureGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Award, Download, Share2, Eye, QrCode } from 'lucide-react';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';
import CertificateDownloadButton from '@/components/certificates/CertificateDownloadButton';
import PremiumGateModal from '@/components/premium/PremiumGateModal';

export default function MyCertificates() {
  const [user, setUser] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const { allowed: downloadAllowed, showUpgradeModal: showCertGate, closeUpgradeModal: closeCertGate } = useFeatureGate('certificates.download');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  // Fetch certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['user-certificates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const result = await base44.entities.AwardedCertificate.filter(
        { user_id: user.id },
        '-awarded_at',
        100
      );
      return result || [];
    },
    enabled: !!user,
  });

  const basicCerts = certificates.filter((c) => c.certificate_type === 'basic');
  const verifiedCerts = certificates.filter((c) => c.certificate_type === 'verified');

  const handleGenerateQR = async (certificate) => {
    setQrLoading(true);
    setQrData(null);
    try {
      const res = await base44.functions.invoke('generateCertificateQR', { certificate_id: certificate.id });
      setQrData(res.data);
    } catch (e) {
      console.error('QR error:', e);
    } finally {
      setQrLoading(false);
    }
  };

  const handleShare = async (certificate) => {
    const verifyUrl = `${window.location.origin}/VerifyCertificate?code=${certificate.verification_code}`;
    
    if (navigator.share) {
      await navigator.share({
        title: 'My Course Certificate',
        text: `I just completed ${certificate.program_name} on FaithLight Academy!`,
        url: verifyUrl,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(verifyUrl);
      alert('Certificate link copied to clipboard');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-amber-600" />
            My Certificates
          </h1>
          <p className="text-gray-600">View and manage your earned certificates</p>
        </div>

        {/* Selected Certificate Preview */}
        {selectedCertificate && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Certificate Preview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCertificate(null)}
              >
                Close Preview
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <CertificateTemplate certificate={selectedCertificate} size="display" />

              <div className="flex flex-wrap gap-3 justify-center pt-6 border-t">
                {downloadAllowed === false ? (
                  <Button disabled variant="outline" className="gap-2 opacity-50">
                    <Download className="w-4 h-4" />
                    Download (Premium)
                  </Button>
                ) : (
                  <CertificateDownloadButton certificate={selectedCertificate} />
                )}
                <Button
                  onClick={() => {
                    if (downloadAllowed === false) {
                      showCertGate();
                    } else {
                      handleShare(selectedCertificate);
                    }
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Certificate
                </Button>
                <Button
                  onClick={() => {
                    if (downloadAllowed === false) {
                      showCertGate();
                    } else {
                      handleGenerateQR(selectedCertificate);
                    }
                  }}
                  variant="outline"
                  className="gap-2"
                  disabled={qrLoading}
                >
                  {qrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  Generate QR Code
                </Button>
              </div>
              {qrData?.qr_data_url && (
                <div className="flex flex-col items-center gap-2 pt-4 border-t">
                  <p className="text-xs text-gray-500 font-medium">Scan to verify this certificate</p>
                  <img src={qrData.qr_data_url} alt="Certificate QR Code" className="w-36 h-36 border-2 border-gray-200 rounded-xl" />
                  <a
                    href={qrData.verify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 underline"
                  >
                    Open verification page
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Certificates List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading certificates...</span>
            </CardContent>
          </Card>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                You haven't earned any certificates yet. Complete a course to earn one!
              </p>
              <Button onClick={() => window.location.href = '/ExploreCourses'}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({certificates.length})
              </TabsTrigger>
              <TabsTrigger value="basic">
                Basic ({basicCerts.length})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({verifiedCerts.length})
              </TabsTrigger>
            </TabsList>

            {/* All Certificates */}
            <TabsContent value="all" className="space-y-4">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  onPreview={setSelectedCertificate}
                  onShare={handleShare}
                />
              ))}
            </TabsContent>

            {/* Basic Certificates */}
            <TabsContent value="basic" className="space-y-4">
              {basicCerts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-600">
                    No basic certificates yet
                  </CardContent>
                </Card>
              ) : (
                basicCerts.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    onPreview={setSelectedCertificate}
                    onShare={handleShare}
                  />
                ))
              )}
            </TabsContent>

            {/* Verified Certificates */}
            <TabsContent value="verified" className="space-y-4">
              {verifiedCerts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-600">
                    No verified certificates yet. Upgrade a certificate to verified status!
                  </CardContent>
                </Card>
              ) : (
                verifiedCerts.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    onPreview={setSelectedCertificate}
                    onShare={handleShare}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
        </div>

        {/* Premium Gate Modal (Certificates) */}
        <PremiumGateModal
        open={showCertGate}
        onClose={closeCertGate}
        featureName="Certificate Download"
        reason="premium_required"
        />
        </div>
        );
        }

function CertificateCard({ certificate, onPreview, onShare }) {
  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'theological':
        return 'bg-amber-100 text-amber-800';
      case 'leadership':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-indigo-100 text-indigo-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'verified'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Certificate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={getTierBadgeColor(certificate.certificate_tier)}>
                {certificate.certificate_tier.charAt(0).toUpperCase() + certificate.certificate_tier.slice(1)}
              </Badge>
              <Badge className={getTypeColor(certificate.certificate_type)}>
                {certificate.certificate_type === 'verified' ? '✓ Verified' : 'Basic'}
              </Badge>
            </div>

            <h3 className="font-semibold text-gray-900 text-lg">
              {certificate.program_name}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Earned on {new Date(certificate.awarded_at).toLocaleDateString()}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Certificate #{certificate.certificate_number}
            </p>

            {certificate.certificate_type === 'verified' && (
              <p className="text-xs text-green-700 font-semibold mt-1">
                Verification Code: {certificate.verification_code}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap sm:flex-col w-full sm:w-auto">
            <Button
              onClick={() => onPreview(certificate)}
              variant="outline"
              size="sm"
              className="gap-2 flex-1 sm:flex-none"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <CertificateDownloadButton certificate={certificate} variant="outline" />
            <Button
              onClick={() => onShare(certificate)}
              variant="ghost"
              size="sm"
              className="gap-2 flex-1 sm:flex-none"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}