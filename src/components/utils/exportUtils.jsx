export function exportToCSV(data, filename) {
  const headers = ['Topic', 'Prayer', 'Date'];
  const rows = data.map(entry => [
    entry.topic,
    entry.prayer.replace(/"/g, '""'),
    new Date(entry.createdAt).toLocaleDateString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function exportToPDF(data, filename) {
  const { jsPDF } = window.jsPDF || {};
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Prayer Journal', 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Exported: ${new Date().toLocaleDateString()}`, 20, 30);
  
  let yPosition = 45;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxWidth = 170;
  
  data.forEach((entry, index) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Entry ${index + 1}: ${entry.topic}`, margin, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(entry.prayer, maxWidth);
    doc.text(splitText, margin, yPosition);
    yPosition += (splitText.length * 5) + 10;
    
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(`Date: ${new Date(entry.createdAt).toLocaleDateString()}`, margin, yPosition);
    doc.setTextColor(0);
    yPosition += 8;
  });
  
  doc.save(filename);
}