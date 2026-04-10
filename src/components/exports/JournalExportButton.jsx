import React from 'react';
import ExportButton from './ExportButton';

/**
 * Pre-configured export button for journal entries
 */
export default function JournalExportButton({ entries = [], ...props }) {
  const pdfSections = [
    {
      title: 'Journal Entries',
      data: entries.map(e => ({
        Title: e.title,
        Language: e.language || 'en',
        Mood: e.mood || 'neutral',
        'Created Date': e.created_date ? new Date(e.created_date).toLocaleDateString() : '',
      })),
    },
    {
      title: 'Summary',
      data: `Total Entries: ${entries.length}\nMood Distribution: ${getMoodSummary(entries)}`,
    },
  ];

  return (
    <ExportButton
      data={entries.map(e => ({
        title: e.title,
        content: e.content,
        language: e.language,
        mood: e.mood,
        isFavorite: e.isFavorite,
        createdDate: e.created_date,
      }))}
      filename="journal_export"
      title="Journal Entries"
      pdfSections={pdfSections}
      label="Export Journal"
      {...props}
    />
  );
}

function getMoodSummary(entries) {
  const moods = entries.reduce((acc, e) => {
    acc[e.mood || 'neutral'] = (acc[e.mood || 'neutral'] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(moods)
    .map(([mood, count]) => `${mood}: ${count}`)
    .join(', ');
}