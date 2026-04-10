# Data Export Feature Guide

## Overview
Complete data export system for prayers, journals, highlights, reading progress, and notes in CSV and PDF formats.

## Components Created

### 1. **lib/exportUtils.js**
Core export utilities:
- `exportToCSV(data, filename)` - Export data as CSV file
- `exportToFormattedPDF(title, sections, filename)` - Export formatted PDF report
- `exportToCSVPDF(data, title, filename)` - Export simple PDF table
- `generateFilename(prefix, extension)` - Generate timestamped filenames

### 2. **components/exports/ExportButton.jsx**
Reusable export dropdown button component:
- Dropdown menu with CSV and PDF options
- Shows raw data PDF and formatted report PDF
- Loading states and error handling
- Props:
  - `data` (required) - Array of objects to export
  - `filename` - Base filename without extension
  - `title` - Report title for PDFs
  - `pdfSections` - Sections for formatted PDF report
  - `label` - Button text (default: "Export")
  - `variant` - Button style
  - `showLabel` - Show text label

### 3. **pages/DataExportCenter.jsx**
Full export center page at `/DataExportCenter`:
- Displays all data types with counts
- Quick export all data button
- Category cards for individual exports
- Information panel about export formats
- Fetches data from all relevant entities

### 4. **Pre-configured Export Buttons**
Ready-to-use components for specific data types:
- `PrayerExportButton.jsx` - For prayers with statistics
- `JournalExportButton.jsx` - For journal entries with mood summary

## Usage Examples

### In Export Center Page
```jsx
<Route path="/DataExportCenter" element={<DataExportCenter />} />
```

### In Individual Pages
```jsx
import ExportButton from '@/components/exports/ExportButton';

// Basic usage
<ExportButton
  data={prayersData}
  filename="my_prayers"
  title="My Prayer Records"
/>

// With formatted PDF sections
<ExportButton
  data={journalEntries}
  filename="my_journal"
  title="Journal Entries"
  pdfSections={[
    { title: "All Entries", data: journalEntries },
    { title: "Summary", data: summaryText }
  ]}
/>
```

### Using Pre-configured Buttons
```jsx
import PrayerExportButton from '@/components/exports/PrayerExportButton';

<PrayerExportButton prayers={allPrayers} variant="outline" />
```

### Direct Export Utility Usage
```jsx
import { exportToCSV, exportToFormattedPDF } from '@/lib/exportUtils';

// CSV export
exportToCSV(data, 'my_data.csv');

// Formatted PDF report
exportToFormattedPDF('My Report', sections, 'report.pdf');
```

## Export Formats

### CSV Format
- Ideal for spreadsheets and data analysis
- All fields included
- UTF-8 encoded
- Proper escaping for special characters

### PDF - Data Table
- Simple tabular format
- All records in printable layout
- Grid theme with colored headers
- Sortable and filterable in PDF readers

### PDF - Formatted Report
- Professional styled report
- Section-based layout
- Includes summaries and statistics
- Multiple pages as needed
- Title and generation date

## File Naming
All exports include timestamp: `filename_YYYY-MM-DD.ext`
Example: `prayers_export_2026-03-28.csv`

## Entity Support
Currently configured for:
- `MyPrayer` - Prayer records
- `PrayerJournalEntry` - Journal entries
- `VerseHighlight` - Highlighted verses
- `UserProgress` - Reading progress
- `BibleNote` - Notes

## Integration Points
Add export buttons to:
1. Prayer management pages (MyPrayers, PrayerJournalPage)
2. Journal pages (MyJournal, BibleJournal)
3. Reading pages (BibleReaderPage, ReadingPlans)
4. Individual record detail modals
5. Navigation menu (link to DataExportCenter)

## Future Enhancements
- Scheduled automatic exports
- Cloud storage integration (Google Drive, Dropbox)
- Email export delivery
- Custom export templates
- Encryption for sensitive data
- Batch export scheduling