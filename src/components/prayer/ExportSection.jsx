import React from "react";
import { Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";

export default function ExportSection({ journal }) {
  const handleExportCSV = () => {
    if (journal.length === 0) return;
    exportToCSV(journal, 'prayer-journal.csv');
  };

  const handleExportPDF = () => {
    if (journal.length === 0) return;
    exportToPDF(journal, 'prayer-journal.pdf');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportCSV}
        disabled={journal.length === 0}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        CSV
      </button>
      <button
        onClick={handleExportPDF}
        disabled={journal.length === 0}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        PDF
      </button>
    </div>
  );
}