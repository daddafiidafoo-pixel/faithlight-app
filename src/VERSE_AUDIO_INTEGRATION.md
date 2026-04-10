# Bible Brain Verse Audio Streaming Integration

## Overview

The app now includes native Bible Brain verse audio streaming with a reusable `VerseAudioPlayer` component that allows users to listen to specific verses in their chosen language.

## Components

### 1. **VerseAudioPlayer** (`components/verse/VerseAudioPlayer.jsx`)

Main audio player component for verse playback.

**Props:**
- `bookId` (string) - Bible book ID (e.g., 'PSA', 'JHN')
- `chapter` (number) - Chapter number
- `verseStart` (number) - Starting verse number
- `verseEnd` (number, optional) - Ending verse number for ranges (defaults to verseStart)
- `referenceText` (string) - Display text (e.g., 'John 3:16')
- `audioFilesetId` (string) - Bible Brain audio fileset ID from BibleLanguage entity
- `language` (string, optional) - Language code (default: 'en')
- `compact` (boolean, optional) - Use compact single-line mode (default: false)
- `onError` (function, optional) - Error callback handler

**Compact Mode (single-line):**
```jsx
<VerseAudioPlayer
  bookId="JHN"
  chapter={3}
  verseStart={16}
  referenceText="John 3:16"
  audioFilesetId="ENGESVN2DA"
  language="en"
  compact={true}
/>
```

**Full Mode (expanded player):**
```jsx
<VerseAudioPlayer
  bookId="PSA"
  chapter={23}
  verseStart={1}
  verseEnd={6}
  referenceText="Psalm 23:1-6"
  audioFilesetId="ENGESVN2DA"
  language="en"
/>
```

## Backend Function

### `bibleBrainVerseAudio.js`

Fetches audio URLs from the Bible Brain API for specific verses.

**Endpoint Parameters:**
```javascript
{
  fileset_id: "ENGESVN2DA",  // Audio fileset ID
  book_id: "PSA",             // Book ID
  chapter: 23,                // Chapter number
  verse_start: 1,             // Starting verse
  verse_end: 6,               // Ending verse (optional)
  language: "en"              // Language code
}
```

**Response:**
```javascript
{
  url: "https://..../PSA_23_001.m4a",  // Audio stream URL
  duration: 45.2,                       // Duration in seconds
  fileset_id: "ENGESVN2DA",
  book_id: "PSA",
  chapter: 23,
  verse_start: 1,
  verse_end: 6
}
```

## Integration Examples

### 1. Prayer Detail Page (Attached Verses)

Used in `components/bible/AttachedVerseCard.jsx` for displaying verses linked to prayers:

```jsx
<VerseAudioPlayer
  bookId={verse.book_id}
  chapter={verse.chapter}
  verseStart={verse.verse_start}
  verseEnd={verse.verse_end}
  referenceText={verse.reference_text}
  audioFilesetId={verse.audio_fileset_id}
  language={verse.language_code}
  compact={true}
/>
```

### 2. Sermon Preparation

Integrate into sermon notes to listen while writing:

```jsx
<VerseAudioPlayer
  bookId={selectedVerse.book_id}
  chapter={selectedVerse.chapter}
  verseStart={selectedVerse.verse_start}
  referenceText={selectedVerse.reference}
  audioFilesetId={languageConfig.audio_fileset_id}
  language={languageConfig.language_code}
/>
```

### 3. Study Groups / Discussion

For shared verse study:

```jsx
{verses.map(v => (
  <div key={v.id} className="mb-4">
    <h4>{v.reference_text}</h4>
    <p>{v.verse_text}</p>
    <VerseAudioPlayer
      bookId={v.book_id}
      chapter={v.chapter}
      verseStart={v.verse_start}
      referenceText={v.reference_text}
      audioFilesetId={audioFilesetId}
      language={language}
      compact={true}
    />
  </div>
))}
```

## Audio Fileset IDs

Audio filesets are configured per language in the `BibleLanguage` entity.

**Current Configured Languages:**
- English: `ENGESVN2DA` (ESV)
- Afaan Oromoo: `OROWBTN2DA` (Oromoo Bible)
- Amharic: (None currently configured)
- Arabic: (None currently configured)

**To Add New Audio:**

1. Find the fileset ID on Bible Brain (https://api.dbt.io)
2. Update `seedBibleLanguages.js`:

```javascript
{
  language_code: 'am',
  language_name: 'Amharic',
  native_name: 'አማርኛ',
  bible_id: 'ETHAAA',
  audio_fileset_id: 'ETHAAA2DA',  // Add this line
  ui_locale: 'am',
  is_rtl: false,
  is_active: true,
  sort_order: 3,
}
```

3. Run the seed function to populate the database

## Features

- **Multi-language Support**: Audio streams in any configured language
- **Verse Ranges**: Supports single verses and verse ranges
- **Playback Controls**:
  - Play/Pause
  - Seek (progress bar)
  - Speed adjustment (0.75x–2x)
  - Mute/Volume
  - Stop/Reset
- **Adaptive UI**: Compact mode for inline use, full mode for detailed playback
- **Error Handling**: Graceful fallback with user-friendly error messages
- **Performance**: Metadata preloading, efficient DOM cleanup

## Technical Details

### Audio URL Handling

Bible Brain returns `m4a` (MPEG-4 Audio) streams. These are supported natively by:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers (iOS/Android)

### Fileset ID Resolution

If not explicitly provided, the component:
1. Uses the provided `audioFilesetId` prop directly
2. Falls back to empty if unavailable

### Error Recovery

On audio fetch failure:
- Error state is displayed to the user
- Error callback is triggered (if provided)
- User can attempt retry via UI

## Browser Support

Tested on:
- Chrome 90+
- Safari 14+
- Firefox 88+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 9+)

## Performance Considerations

- Audio streams are fetched on-demand (only when user clicks play)
- Metadata preloading is enabled (`preload="metadata"`)
- Audio elements are cleaned up on component unmount
- Seeking is optimized with efficient range requests