import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, X } from 'lucide-react';

export default function CertificatePreviewModal({
  track,
  studentName,
  completionDate,
  onClose,
  onDownload,
  onShare,
}) {
  const getCertificateTitle = () => {
    switch (track) {
      case 'foundation':
        return 'Certificate of Completion in Biblical Foundations';
      case 'leadership':
        return 'Certificate of Completion in Christian Leadership';
      case 'advanced':
        return 'Certificate of Completion in Theological Studies';
      default:
        return 'Certificate of Completion';
    }
  };

  const getCertificateColor = () => {
    switch (track) {
      case 'foundation':
        return 'from-blue-500 to-indigo-600';
      case 'leadership':
        return 'from-amber-500 to-orange-600';
      case 'advanced':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-indigo-500 to-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certificate Preview</CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Certificate Visual */}
            <div className={`bg-gradient-to-br ${getCertificateColor()} rounded-lg p-12 text-white shadow-lg`}>
              <div className="text-center space-y-6">
                {/* Header */}
                <div className="border-2 border-white/30 pb-6 space-y-2">
                  <p className="text-sm font-semibold tracking-widest uppercase opacity-90">
                    FaithLight School of Biblical Leadership
                  </p>
                  <h2 className="text-xl font-bold">{getCertificateTitle()}</h2>
                </div>

                {/* Student Name */}
                <div className="py-6 border-b border-white/30">
                  <p className="text-sm opacity-90 mb-2">This certificate is proudly presented to</p>
                  <p className="text-3xl font-bold">{studentName}</p>
                </div>

                {/* Achievement Text */}
                <div className="text-sm opacity-90 max-w-md mx-auto">
                  <p>For successfully completing the rigorous requirements of this training program in Biblical leadership and Christian discipleship.</p>
                </div>

                {/* Date */}
                <div className="pt-6 border-t border-white/30">
                  <p className="text-xs opacity-75 mb-1">Awarded on</p>
                  <p className="font-semibold">
                    {new Date(completionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Seal */}
                <div className="pt-4">
                  <div className="inline-block w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center text-2xl">
                    ✓
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">CERTIFICATE ID</p>
                <p className="text-sm font-mono mt-1">
                  {Math.random().toString(36).substring(2, 10).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">TRACK LEVEL</p>
                <p className="text-sm capitalize mt-1">{track}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">ISSUED BY</p>
                <p className="text-sm mt-1">FaithLight Ministry</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">COMPLETION DATE</p>
                <p className="text-sm mt-1">
                  {new Date(completionDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Certificate of Completion:</strong> This certificate recognizes successful completion of the FaithLight training program. It demonstrates your commitment to biblical education and Christian leadership development.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={onShare}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4" />
                Share Certificate
              </Button>
              <Button
                onClick={onDownload}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}