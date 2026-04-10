import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share2, Loader2, Eye, Lock } from 'lucide-react';
import { getCertificateTierInfo } from '../../functions/certificateGenerator';
import CertificateBasicPreview from './CertificateBasicPreview';
import CertificateVerifiedPreview from './CertificateVerifiedPreview';
import VerifiedCertificateUpgrade from '../payment/VerifiedCertificateUpgrade';

export default function CertificateDisplay({ certificate, onUpgradeSuccess }) {
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const tierInfo = getCertificateTierInfo(certificate.certificate_tier);

  const claimMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.AwardedCertificate.update(certificate.id, {
        status: 'claimed',
        claimed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-certificates']);
    },
  });

  const handleDownload = async () => {
    try {
      const { generateCertificatePDF, downloadCertificatePDF } = await import('@/functions/pdfCertificateGenerator.js');
      const pdfUrl = await generateCertificatePDF(certificate, isBasic === false);
      downloadCertificatePDF(pdfUrl, certificate.certificate_number);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${tierInfo.title}`,
        text: `I just earned a ${tierInfo.subtitle} from FaithLight!`,
        url: window.location.href,
      });
    }
  };

  const isBasic = certificate.certificate_type === 'basic';
  const cardBorder = isBasic ? 'border-gray-300' : 'border-amber-400';

  return (
    <>
      <Card className={`border-2 ${cardBorder} bg-gradient-to-br ${tierInfo.color} bg-opacity-5`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{tierInfo.icon}</span>
              <div>
                <CardTitle className="text-lg">{tierInfo.subtitle}</CardTitle>
                <p className="text-sm text-gray-600">{certificate.program_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isBasic && (
                <Badge className="bg-amber-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              <Badge 
                variant="default" 
                className={certificate.status === 'earned' ? 'bg-yellow-600' : 'bg-green-600'}
              >
                {certificate.status === 'earned' ? 'Unclaimed' : 'Claimed'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Student</p>
            <p className="font-semibold text-gray-900">{certificate.student_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Certificate ID</p>
              <p className="font-mono text-sm font-semibold text-gray-900">
                {certificate.certificate_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Earned Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(certificate.awarded_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {certificate.final_quiz_score !== undefined && certificate.final_quiz_score > 0 && (
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">Quiz Score</p>
              <p className="text-lg font-bold text-amber-700">{certificate.final_quiz_score}%</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-700 italic">
              "Be diligent to present yourself approved to God..." — 2 Timothy 2:15
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            {certificate.status === 'earned' && (
              <Button
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending}
                className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
              >
                {claimMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Claim Certificate
                  </>
                )}
              </Button>
            )}

            {isBasic && !certificate.is_paid && (
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
                title="Upgrade to Verified Certificate"
              >
                <Lock className="w-4 h-4" />
                Upgrade ($9.99)
              </Button>
            )}

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowPreview(true)}
              title="View certificate"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleDownload}
              title="Download as PDF"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleShare}
              title="Share certificate"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPreview(false)}
        >
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Certificate Preview</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              {isBasic ? (
              <CertificateBasicPreview certificate={certificate} />
            ) : (
              <CertificateVerifiedPreview certificate={certificate} />
            )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowUpgradeModal(false)}
        >
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upgrade Certificate</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowUpgradeModal(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <VerifiedCertificateUpgrade 
                certificate={certificate}
                onUpgradeSuccess={() => {
                  setShowUpgradeModal(false);
                  queryClient.invalidateQueries(['user-certificates']);
                  onUpgradeSuccess?.();
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}