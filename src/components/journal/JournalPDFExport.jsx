import { jsPDF } from 'jspdf';

export function exportJournalToPDF(journals, title = 'My Prayer Journal') {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 20;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkY = (needed = 10) => {
    if (y + needed > 278) addPage();
  };

  // Cover header
  doc.setFillColor(59, 91, 219);
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exported ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  ·  ${journals.length} entr${journals.length === 1 ? 'y' : 'ies'}`, margin, 31);

  y = 48;

  journals.forEach((entry, idx) => {
    checkY(30);

    // Entry number + date bar
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    doc.setTextColor(59, 91, 219);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const dateStr = entry.created_date
      ? new Date(entry.created_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '';
    doc.text(`Entry ${idx + 1}`, margin + 3, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, pageW - margin - 3, y + 7, { align: 'right' });
    y += 14;

    // Verse reference
    const verseRef = entry.verse_id || entry.related_verse || entry.reference || '';
    if (verseRef) {
      checkY(8);
      doc.setTextColor(180, 120, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bolditalic');
      doc.text(`📖 ${verseRef}`, margin, y);
      y += 7;
    }

    // Verse text
    const verseText = entry.verse_text || '';
    if (verseText) {
      checkY(12);
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const lines = doc.splitTextToSize(`"${verseText}"`, contentW);
      lines.forEach(line => {
        checkY(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 2;
    }

    // Reflection / content
    const reflection = entry.reflection || entry.content || '';
    if (reflection) {
      checkY(10);
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(reflection, contentW);
      lines.forEach(line => {
        checkY(6);
        doc.text(line, margin, y);
        y += 5.8;
      });
    }

    // Mood tag
    if (entry.mood) {
      checkY(8);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text(`Mood: ${entry.mood}`, margin, y);
      y += 6;
    }

    y += 6;

    // Divider (except last)
    if (idx < journals.length - 1) {
      checkY(4);
      doc.setDrawColor(220, 220, 230);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
    }
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('FaithLight — Your word is a lamp to my feet and a light to my path. Psalm 119:105', margin, 290);
    doc.text(`Page ${i} / ${totalPages}`, pageW - margin, 290, { align: 'right' });
  }

  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}