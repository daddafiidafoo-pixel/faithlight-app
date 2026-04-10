import React from 'react';
import ExportButton from './ExportButton';

/**
 * Pre-configured export button for prayer data
 */
export default function PrayerExportButton({ prayers = [], ...props }) {
  const pdfSections = [
    {
      title: 'Prayer Records',
      data: prayers.map(p => ({
        Title: p.title,
        Status: p.status,
        Category: p.category || 'General',
        'Created Date': p.created_date ? new Date(p.created_date).toLocaleDateString() : '',
      })),
    },
    {
      title: 'Statistics',
      data: `Total Prayers: ${prayers.length}\nActive: ${prayers.filter(p => p.status === 'active')?.length || 0}\nAnswered: ${prayers.filter(p => p.is_answered)?.length || 0}`,
    },
  ];

  return (
    <ExportButton
      data={prayers.map(p => ({
        title: p.title,
        body: p.body,
        status: p.status,
        category: p.category,
        isAnswered: p.is_answered,
        createdDate: p.created_date,
      }))}
      filename="prayers_export"
      title="Prayer Records"
      pdfSections={pdfSections}
      label="Export Prayers"
      {...props}
    />
  );
}