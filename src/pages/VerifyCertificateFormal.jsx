import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, Award, ShieldCheck, Search } from 'lucide-react';
import GBLISeal from '@/components/gbli/GBLISeal';

export default function VerifyCertificateFormal() {
  const [certId, setCertId] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [autoSearched, setAutoSearched] = useState(false);

  // Support QR code deep-link: ?cert=XXX&code=YYY
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const certParam = params.get('cert');
    const codeParam = params.get('code');
    if (certParam) setCertId(certParam);
    if (codeParam) setCode(codeParam);
    if (certParam && codeParam && !autoSearched) {
      setAutoSearched(true);
      verifyCertificate(certParam, codeParam);
    }
  }, []);

  const verifyCertificate = async (certIdVal, codeVal) => {
    const c = certIdVal || certId;
    const v = codeVal || code;
    if (!c.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      const query = { certificate_number: c.trim() };
      if (v.trim()) query.verification_code = v.trim();

      const results = await base44.entities.AwardedCertificate.filter(query, null, 1);

      if (!results?.length) {
        setResult({ valid: false, message: 'Certificate not found. Please check the certificate ID and try again.' });
      } else {
        setResult({ valid: true, certificate: results[0] });
      }
    } catch (e) {
      setResult({ valid: false, message: 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCertificate();
  };

  const cert = result?.certificate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-indigo-900 to-[#1E1B4B] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <GBLISeal size={80} dark={true} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Certificate Verification</h1>
          <p className="text-indigo-300 text-sm">Global Biblical Leadership Institute — Official Verification Portal</p>
        </div>

        {/* Search form */}
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Verify Authenticity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Certificate ID</label>
                <Input
                  placeholder="e.g., GBLI-2026-000123"
                  value={certId}
                  onChange={e => setCertId(e.target.value.toUpperCase())}
                  className="font-mono"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Verification Code <span className="text-gray-400 font-normal normal-case">(optional — found on the certificate)</span>
                </label>
                <Input
                  placeholder="Enter the verification code if available"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={!certId.trim() || isLoading}
                className="w-full bg-[#1E1B4B] hover:bg-indigo-900 gap-2"
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  : <><Search className="w-4 h-4" /> Verify Certificate</>
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          result.valid && cert ? (
            <div className="space-y-4">
              {/* Valid banner */}
              <div className="bg-green-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white flex-shrink-0" />
                <div>
                  <p className="text-white font-bold text-lg">Certificate Verified ✓</p>
                  <p className="text-green-100 text-sm">This is an authentic Global Biblical Leadership Institute certificate.</p>
                </div>
              </div>

              {/* Certificate details */}
              <Card className="border-2 border-amber-300 shadow-xl">
                <div className="h-2 bg-amber-400 rounded-t-xl" />
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <GBLISeal size={80} dark={false} />
                    <div>
                      <p className="text-xs font-bold text-[#1E1B4B] uppercase tracking-widest mb-1">Global Biblical Leadership Institute</p>
                      <p className="text-xl font-bold text-gray-900">{cert.program_name}</p>
                      <Badge className="bg-[#1E1B4B] text-amber-400 mt-1 capitalize">{cert.certificate_tier || 'Foundations'} Track</Badge>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 border-t border-amber-100 pt-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Student Name</p>
                      <p className="text-lg font-bold text-gray-900">{cert.student_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Certificate ID</p>
                      <p className="text-lg font-mono font-bold text-[#1E1B4B]">{cert.certificate_number}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Date Issued</p>
                      <p className="font-semibold text-gray-900">
                        {cert.awarded_at
                          ? new Date(cert.awarded_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Status</p>
                      <Badge className="bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Valid & Authentic
                      </Badge>
                    </div>
                    {cert.instructor_name && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Instructor</p>
                        <p className="font-semibold text-gray-900">{cert.instructor_name}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    This certificate confirms the holder has successfully completed the stated program under the Global Biblical Leadership Institute (GBLI), a ministry of FaithLight.
                  </div>
                </CardContent>
                <div className="h-2 bg-amber-400 rounded-b-xl" />
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-red-200 bg-red-50 shadow-lg">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">Verification Failed</p>
                  <p className="text-sm text-red-700 mt-1">{result.message}</p>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Info */}
        <p className="text-center text-indigo-400 text-xs">
          Powered by FaithLight · All certificates are digitally recorded and verifiable
        </p>
      </div>
    </div>
  );
}