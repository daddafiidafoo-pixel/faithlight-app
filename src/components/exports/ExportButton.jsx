import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToFormattedPDF, exportToCSVPDF, generateFilename } from '@/lib/exportUtils';

/**
 * Reusable export button with CSV and PDF options
 * @param {Object} props
 * @param {Array} props.data - Data to export
 * @param {string} props.filename - Base filename (without extension)
 * @param {string} props.title - Report title (for PDF)
 * @param {Array} props.pdfSections - Sections for formatted PDF report
 * @param {string} props.label - Button label (default: "Export")
 * @param {string} props.variant - Button variant (default: "outline")
 * @param {boolean} props.showLabel - Show text label (default: true)
 */
export default function ExportButton({
  data,
  filename = 'export',
  title = 'Data Export',
  pdfSections = null,
  label = 'Export',
  variant = 'outline',
  showLabel = true,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsLoading(true);
      const csvFilename = generateFilename(filename, 'csv');
      exportToCSV(data, csvFilename);
    } catch (error) {
      console.error('CSV export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportRawPDF = async () => {
    try {
      setIsLoading(true);
      const pdfFilename = generateFilename(filename, 'pdf');
      exportToCSVPDF(data, title, pdfFilename);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFormattedPDF = async () => {
    try {
      setIsLoading(true);
      if (!pdfSections) {
        console.error('No PDF sections provided for formatted export');
        return;
      }
      const pdfFilename = generateFilename(`${filename}_report`, 'pdf');
      exportToFormattedPDF(title, pdfSections, pdfFilename);
    } catch (error) {
      console.error('Formatted PDF export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" disabled={isLoading || !data?.length}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {showLabel && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCSV}>
          📄 CSV Format
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportRawPDF}>
          📋 PDF (Data Table)
        </DropdownMenuItem>
        {pdfSections && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportFormattedPDF}>
              📑 PDF (Formatted Report)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}