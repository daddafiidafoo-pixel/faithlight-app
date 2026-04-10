import jsPDF from 'jspdf';

/**
 * Export array of objects to CSV
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export data to formatted PDF report
 */
export function exportToFormattedPDF(title, sections, filename = 'report.pdf') {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;

  // Add title
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 12;

  // Add date
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(100);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 10;

  pdf.setTextColor(0);

  // Add sections
  sections.forEach((section) => {
    // Check if we need new page
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }

    // Section title
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(section.title, margin, yPosition);
    yPosition += 8;

    // Section content
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');

    if (Array.isArray(section.data)) {
      // Table format
      const headers = Object.keys(section.data[0] || {});
      const rows = section.data.map(item => headers.map(h => String(item[h] || '')));

      pdf.autoTable({
        startY: yPosition,
        head: [headers],
        body: rows,
        margin: margin,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [108, 92, 231] },
      });

      yPosition = pdf.lastAutoTable.finalY + 10;
    } else if (typeof section.data === 'string') {
      // Text format
      const lines = pdf.splitTextToSize(section.data, maxWidth);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * 4 + 5;
    }

    yPosition += 5;
  });

  pdf.save(filename);
}

/**
 * Export data to simple CSV PDF
 */
export function exportToCSVPDF(data, title = 'Data Export', filename = 'export.pdf') {
  const pdf = new jsPDF();
  const headers = Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [];
  const rows = Array.isArray(data) ? data.map(item => headers.map(h => String(item[h] || ''))) : [];

  pdf.autoTable({
    head: [headers],
    body: rows,
    startY: 20,
    margin: 10,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [108, 92, 231] },
  });

  // Add title at top
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, 10, 10);

  pdf.save(filename);
}

/**
 * Download file to user's device
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix = 'export', extension = 'csv') {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${prefix}_${timestamp}.${extension}`;
}