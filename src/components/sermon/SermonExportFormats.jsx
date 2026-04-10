import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function SermonExportFormats({ outline, title = 'Sermon' }) {
  const [exporting, setExporting] = useState(null);

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(outline.title, margin, yPosition);
      yPosition += 10;

      // Big Idea
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      const bigIdea = doc.splitTextToSize(`Big Idea: ${outline.big_idea}`, pageWidth - margin * 2);
      doc.text(bigIdea, margin, yPosition);
      yPosition += bigIdea.length * 6 + 5;

      // Sections
      doc.setTextColor(0, 0, 0);
      (outline.outline_sections || []).forEach((section) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text(`${section.title}`, margin, yPosition);
        yPosition += 7;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const content = doc.splitTextToSize(section.content, pageWidth - margin * 2);
        doc.text(content, margin, yPosition);
        yPosition += content.length * 5 + 5;
      });

      // Application
      if (yPosition > pageHeight - margin * 5) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFont(undefined, 'bold');
      doc.text('Application', margin, yPosition);
      yPosition += 7;
      doc.setFont(undefined, 'normal');
      const appText = doc.splitTextToSize(outline.application, pageWidth - margin * 2);
      doc.text(appText, margin, yPosition);
      yPosition += appText.length * 5 + 5;

      // Closing Prayer
      if (yPosition > pageHeight - margin * 5) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFont(undefined, 'bold');
      doc.text('Closing Prayer', margin, yPosition);
      yPosition += 7;
      doc.setFont(undefined, 'normal');
      const prayerText = doc.splitTextToSize(outline.closing_prayer, pageWidth - margin * 2);
      doc.text(prayerText, margin, yPosition);

      doc.save(`${outline.title || 'sermon'}.pdf`);
      toast.success('Sermon exported to PDF');
    } catch (e) {
      toast.error('PDF export failed: ' + e.message);
    } finally {
      setExporting(null);
    }
  };

  const exportToMarkdown = () => {
    setExporting('markdown');
    try {
      let markdown = `# ${outline.title}\n\n`;
      markdown += `**Big Idea:** ${outline.big_idea}\n\n`;
      markdown += `## Outline\n\n`;

      (outline.outline_sections || []).forEach((section) => {
        markdown += `### ${section.title}\n\n${section.content}\n\n`;
      });

      markdown += `## Application\n\n${outline.application}\n\n`;
      markdown += `## Closing Prayer\n\n${outline.closing_prayer}\n\n`;

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(markdown));
      element.setAttribute('download', `${outline.title || 'sermon'}.md`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Sermon exported to Markdown');
    } catch (e) {
      toast.error('Markdown export failed: ' + e.message);
    } finally {
      setExporting(null);
    }
  };

  const exportToPowerPoint = () => {
    setExporting('powerpoint');
    try {
      // Basic PPTX generation - would require better library for production
      toast.info('PowerPoint export requires backend service integration');
      // In production, use pptxgenjs library
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-gray-900">Export Sermon</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={exportToPDF}
          disabled={exporting !== null}
          variant="outline"
          className="gap-2 justify-center"
        >
          {exporting === 'pdf' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              PDF
            </>
          )}
        </Button>

        <Button
          onClick={exportToMarkdown}
          disabled={exporting !== null}
          variant="outline"
          className="gap-2 justify-center"
        >
          {exporting === 'markdown' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Markdown
            </>
          )}
        </Button>

        <Button
          onClick={exportToPowerPoint}
          disabled={exporting !== null}
          variant="outline"
          className="gap-2 justify-center"
        >
          {exporting === 'powerpoint' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              PowerPoint
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Export your sermon in your preferred format for easy sharing and presentation.
      </p>
    </div>
  );
}