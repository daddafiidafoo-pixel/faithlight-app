import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import ExportButton from '@/components/exports/ExportButton';
import { exportToCSV, exportToFormattedPDF, generateFilename } from '@/lib/exportUtils';

export default function DataExportCenter() {
  const [data, setData] = useState({
    prayers: [],
    journals: [],
    highlights: [],
    readingProgress: [],
    notes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        base44.entities.MyPrayer?.list?.() || Promise.resolve([]),
        base44.entities.PrayerJournalEntry?.list?.() || Promise.resolve([]),
        base44.entities.VerseHighlight?.list?.() || Promise.resolve([]),
        base44.entities.UserProgress?.list?.() || Promise.resolve([]),
        base44.entities.BibleNote?.list?.() || Promise.resolve([]),
      ]);

      setData({
        prayers: results[0].status === 'fulfilled' ? results[0].value : [],
        journals: results[1].status === 'fulfilled' ? results[1].value : [],
        highlights: results[2].status === 'fulfilled' ? results[2].value : [],
        readingProgress: results[3].status === 'fulfilled' ? results[3].value : [],
        notes: results[4].status === 'fulfilled' ? results[4].value : [],
      });
    } catch (err) {
      console.error('Failed to fetch export data:', err);
      setError('Failed to load data for export');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      const allData = {
        prayers: data.prayers,
        journals: data.journals,
        highlights: data.highlights,
        readingProgress: data.readingProgress,
        notes: data.notes,
      };

      const filename = generateFilename('faithlight_complete_export', 'csv');
      exportToCSV([allData], filename);
    } catch (err) {
      console.error('Export all failed:', err);
    }
  };

  const handleExportAllFormattedPDF = async () => {
    try {
      const sections = [
        {
          title: 'Prayers Summary',
          data: `Total Prayers: ${data.prayers.length}`,
        },
        {
          title: 'Prayer Records',
          data: data.prayers.slice(0, 10),
        },
        {
          title: 'Journal Entries Summary',
          data: `Total Entries: ${data.journals.length}`,
        },
        {
          title: 'Recent Journal Entries',
          data: data.journals.slice(0, 10),
        },
        {
          title: 'Highlights Summary',
          data: `Total Highlights: ${data.highlights.length}`,
        },
        {
          title: 'Reading Progress Summary',
          data: `Completed Days: ${data.readingProgress.filter(p => p.completed)?.length || 0}`,
        },
      ];

      const filename = generateFilename('faithlight_full_report', 'pdf');
      exportToFormattedPDF('FaithLight Complete Data Report', sections, filename);
    } catch (err) {
      console.error('Formatted PDF export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = [
    { key: 'prayers', label: 'Prayers', count: data.prayers.length, icon: '🙏' },
    { key: 'journals', label: 'Journal Entries', count: data.journals.length, icon: '📔' },
    { key: 'highlights', label: 'Verse Highlights', count: data.highlights.length, icon: '⭐' },
    { key: 'readingProgress', label: 'Reading Progress', count: data.readingProgress.length, icon: '📚' },
    { key: 'notes', label: 'Notes', count: data.notes.length, icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Data Export Center</h1>
          <p className="text-muted-foreground">
            Export your data and reports as CSV or PDF for offline use and record keeping
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Quick Export All */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Quick Export All Data</CardTitle>
            <CardDescription>Export all your data at once</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={handleExportAll} variant="default">
              Export All as CSV
            </Button>
            <Button onClick={handleExportAllFormattedPDF} variant="outline">
              Generate Complete Report (PDF)
            </Button>
          </CardContent>
        </Card>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Card key={category.key} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{category.label}</CardTitle>
                      <CardDescription>{category.count} items</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ExportButton
                  data={data[category.key]}
                  filename={`${category.key}_export`}
                  title={category.label}
                  label="Export"
                  variant="default"
                  showLabel={true}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Export Info */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Export Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>CSV Format:</strong> Ideal for spreadsheet applications and data analysis. Includes all fields and metadata.
            </p>
            <p>
              <strong>PDF Data Table:</strong> Simple tabular format showing all records in a printable layout.
            </p>
            <p>
              <strong>PDF Report:</strong> Formatted report with summaries, sections, and professional styling for record keeping.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Files are exported with a timestamp and saved to your device's Downloads folder.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}