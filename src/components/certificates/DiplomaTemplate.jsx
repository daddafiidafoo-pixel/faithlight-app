import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function DiplomaTemplate({ studentName, completionDate, certificateId }) {
  const handleDownloadPDF = async () => {
    const element = document.getElementById('diploma-content');
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`FaithLight_Diploma_${studentName?.replace(/\s+/g, '_')}.pdf`);
  };

  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="space-y-4">
      {/* Download Button */}
      <div className="flex justify-center">
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Download as PDF
        </Button>
      </div>

      {/* Certificate Preview */}
      <div
        id="diploma-content"
        className="bg-white border-8 border-indigo-900 p-12 rounded-lg"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(67,56,202,0.02) 0%, rgba(139,92,246,0.02) 100%)',
          minWidth: '1000px',
          minHeight: '700px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Header */}
        <div className="space-y-3">
          <div className="text-4xl font-bold text-indigo-900">FaithLight</div>
          <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-4 py-8">
          <p className="text-lg text-gray-600 tracking-wide">This certifies that</p>
          <div className="border-b-2 border-indigo-900 py-2 px-8 min-w-96">
            <p className="text-4xl font-bold text-indigo-900">{studentName || 'Full Name'}</p>
          </div>
          <p className="text-lg text-gray-600 tracking-wide mt-8">has successfully completed the</p>
        </div>

        {/* Program Name */}
        <div className="space-y-2">
          <p className="text-3xl font-bold text-indigo-900">
            FaithLight Advanced Biblical Leadership Diploma
          </p>
          <p className="text-base text-gray-600">
            A structured religious training program focused on biblical study and ministry leadership development
          </p>
        </div>

        {/* Date and ID */}
        <div className="space-y-2 text-gray-700">
          <p>Issued by FaithLight</p>
          <p>Date: {formattedDate}</p>
          {certificateId && <p className="text-xs text-gray-500">Certificate ID: {certificateId}</p>}
        </div>

        {/* Footer Disclaimer */}
        <div className="border-t-2 border-gray-300 pt-4 w-full">
          <p className="text-xs text-gray-600 leading-relaxed max-w-xl mx-auto">
            This is a non-accredited religious training certificate intended for personal and ministry development.
            It does not represent an academic degree or professional qualification.
          </p>
        </div>
      </div>
    </div>
  );
}