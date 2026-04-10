import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export default function CertificateDownloadButton({ certificate, variant = 'default' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await base44.functions.invoke('generateCertificatePDF', {
        certificate_id: certificate.id,
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GBLI-Certificate-${certificate.certificate_number || 'cert'}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download certificate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant={variant}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download Certificate
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}