import jsPDF from 'jspdf';

export function exportSermonOutlineToPDF(sermonData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper to add text with wrapping
  const addWrappedText = (text, fontSize = 12, bold = false) => {
    doc.setFontSize(fontSize);
    if (bold) doc.setFont(undefined, 'bold');
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length * fontSize) / 2.5 + 3;

    if (bold) doc.setFont(undefined, 'normal');
    return yPosition;
  };

  const checkPageBreak = (minSpace = 30) => {
    if (yPosition + minSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFillColor(107, 92, 231); // Violet color
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text(sermonData.title, margin, 25);
  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // Theme
  checkPageBreak();
  addWrappedText('Theme', 12, true);
  addWrappedText(sermonData.theme, 11);

  // Key Verse
  checkPageBreak();
  addWrappedText('Key Verse', 12, true);
  addWrappedText(sermonData.keyVerse, 11);

  // Introduction
  checkPageBreak(40);
  addWrappedText('Introduction', 12, true);
  addWrappedText(sermonData.introduction, 11);

  // Main Points
  checkPageBreak(50);
  addWrappedText('Main Points', 12, true);
  sermonData.mainPoints?.forEach((point, index) => {
    checkPageBreak(40);
    addWrappedText(`${index + 1}. ${point.title}`, 11, true);
    addWrappedText(point.explanation, 10);
    addWrappedText(`Supporting Verse: ${point.supportingVerse}`, 10);
    addWrappedText(`Application: ${point.application}`, 10);
  });

  // Conclusion
  checkPageBreak(50);
  addWrappedText('Conclusion', 12, true);
  addWrappedText(sermonData.conclusion, 11);

  // Closing Prayer
  checkPageBreak(40);
  addWrappedText('Closing Prayer', 12, true);
  addWrappedText(sermonData.closingPrayer, 11);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    margin,
    pageHeight - 10
  );

  return doc;
}

export function exportStudyPlanToPDF(planData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const addWrappedText = (text, fontSize = 12, bold = false) => {
    doc.setFontSize(fontSize);
    if (bold) doc.setFont(undefined, 'bold');
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length * fontSize) / 2.5 + 3;

    if (bold) doc.setFont(undefined, 'normal');
    return yPosition;
  };

  const checkPageBreak = (minSpace = 30) => {
    if (yPosition + minSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFillColor(107, 92, 231);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text(planData.title, margin, 25);
  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // Summary
  if (planData.summary) {
    checkPageBreak();
    addWrappedText('Summary', 12, true);
    addWrappedText(planData.summary, 11);
  }

  // Days
  planData.days?.forEach((day, index) => {
    checkPageBreak(50);
    addWrappedText(`${day.day}`, 12, true);
    addWrappedText(day.title, 11);
    addWrappedText(`Reading: ${day.reading}`, 10);
    addWrappedText(day.reflection, 10);
    addWrappedText(day.prayer, 10);
  });

  // Key Verses
  if (planData.keyVerses?.length) {
    checkPageBreak(40);
    addWrappedText('Key Verses', 12, true);
    addWrappedText(planData.keyVerses.join(', '), 11);
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    margin,
    pageHeight - 10
  );

  return doc;
}

export function downloadPDF(doc, filename) {
  doc.save(`${filename}.pdf`);
}