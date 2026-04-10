import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share2, Loader2 } from 'lucide-react';
import { claimCertificate } from '../../functions/automationEngine';

export default function CertificateDisplay({ certificate, courseName }) {
  const queryClient = useQueryClient();
  const [showCertificate, setShowCertificate] = useState(false);

  const claimMutation = useMutation({
    mutationFn: () => claimCertificate(certificate.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-certificates']);
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Certificate: ${courseName}`,
        text: `I just earned a certificate for completing ${courseName}!`,
        url: window.location.href,
      });
    }
  };

  return (
    <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            <CardTitle>Certificate Earned!</CardTitle>
          </div>
          <Badge variant="default" className="bg-yellow-600">
            {certificate.status === 'earned' ? 'Unclaimed' : 'Claimed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Course</p>
          <p className="font-semibold text-gray-900">{courseName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Progress</p>
            <p className="font-semibold text-lg">{certificate.progress_percentage}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Certificate #</p>
            <p className="font-mono text-sm font-semibold">
              {certificate.certificate_number.substring(0, 12)}...
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-yellow-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Earned</p>
          <p className="text-sm text-gray-900">
            {new Date(certificate.awarded_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-2">
          {certificate.status === 'earned' && (
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="flex-1 gap-2"
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

          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}