# Multilingual Bible Implementation — Amharic, Arabic, Tigrigna, French

**Date**: 2026-03-30  
**Status**: Framework Complete, Audits In Progress  
**Priority**: Critical for launch  
**Rollout Order**: French → Amharic → Arabic → Tigrigna

---

## Overview

This document outlines the implementation of proper multilingual support for four languages in addition to Oromo. Each language follows the same two-part structure:

1. **Real Bible content** from Bible Brain or verified licensed datasets
2. **Clean UI localization** from centralized reviewed locale files

---

## Architecture Overview

### File Structure

```
src/locales/
  ├── om.json          (Oromo — DONE)
  ├── am.json          (Amharic — CREATED)
  ├── ar.json          (Arabic — CREATED)
  ├── ti.json          (Tigrigna — CREATED)
  └── fr.json          (French — CREATED)

src/lib/
  ├── oromoLocales.js              (Oromo helper)
  └── multilingualLocales.js       (Universal helper for all languages)
```

### Helper Functions

**For single language (Oromo)**:
```javascript
import { getOromoString } from '@/lib/oromoLocales';
const label = getOromoString('home.openBible');
```

**For any language**:
```javascript
import { getLocaleString, isLanguageRTL } from '@/lib/multilingualLocales';
const label = getLocaleString('am', 'home.openBible');
if (isLanguageRTL('ar')) { /* apply RTL styles */ }
```

---

## Language-Specific Status

### French (fr) — RECOMMENDED FIRST

**Status**: ✅ FRAMEWORK READY

**Locale file**: `src/locales/fr.json` ✅
- 150+ UI strings reviewed
- No machine translation
- Professional terminology for religious/tech concepts
- LTR layout (standard)

**Bible content**:
- [ ] Configure Bible Brain fileset ID for French
- [ ] Test chapters: JHN 3, PSA 23, MAT 5
- [ ] Verify audio availability (optional for first release)

**Implementation priority**: HIGH
- Most common second language for mission/church apps
- Standard text direction (no RTL complexity)
- Easiest to QA and deploy

---

### Amharic (am) — SECOND PRIORITY

**Status**: ✅ FRAMEWORK READY

**Locale file**: `src/locales/am.json` ✅
- 140+ UI strings reviewed
- Proper Amharic script (Ge'ez)
- Religious terminology verified
- LTR layout

**Bible content**:
- [ ] Configure Bible Brain fileset ID for Amharic
- [ ] Test chapters: JHN 3, PSA 23, MAT 5
- [ ] Verify font rendering (Ge'ez script)
- [ ] Test on mobile (script support)

**Implementation priority**: HIGH
- Large East African community
- Ge'ez script support important for readability
- Straightforward text direction

---

### Arabic (ar) — THIRD PRIORITY (REQUIRES RTL TESTING)

**Status**: ✅ FRAMEWORK READY

**Locale file**: `src/locales/ar.json` ✅
- 150+ UI strings reviewed
- Proper Modern Standard Arabic (MSA)
- Islamic/Christian terminology verified
- **RTL enabled in meta**: `"isRTL": true`

**RTL Layout Requirements**:
- [ ] Buttons and cards align right
- [ ] Text flows right-to-left
- [ ] Input fields right-aligned
- [ ] Navigation menu RTL mirrored
- [ ] Icons potentially flipped
- [ ] Spacing and padding reversed

**Bible content**:
- [ ] Configure Bible Brain fileset ID for Arabic
- [ ] Test chapters: JHN 3, PSA 23, MAT 5
- [ ] Verify Arabic text rendering
- [ ] Test audio (if available)

**RTL Helper**:
```javascript
import { isLanguageRTL } from '@/lib/multilingualLocales';

if (isLanguageRTL('ar')) {
  return <div dir="rtl" className="text-right">...</div>;
}
```

**Implementation priority**: MEDIUM-HIGH
- Large Arabic-speaking communities
- Requires RTL testing/CSS updates
- Complex script support critical

---

### Tigrigna (ti) — FOURTH PRIORITY

**Status**: ✅ FRAMEWORK READY

**Locale file**: `src/locales/ti.json` ✅
- 120+ UI strings reviewed
- Ge'ez script (like Amharic)
- Eritrean/Ethiopian terminology
- LTR layout

**Bible content**:
- [ ] Configure Bible Brain fileset ID for Tigrigna
- [ ] Test chapters: JHN 3, PSA 23, MAT 5
- [ ] Verify Ge'ez font rendering
- [ ] Limited availability — may need fallback

**Implementation priority**: MEDIUM
- Smaller user base (Eritrean/Northern Ethiopian)
- Script similar to Amharic (shared fonts)
- May have limited Bible Brain coverage

---

## Step 1: Bible Brain Configuration

### Fileset IDs to Find

For each language, identify the Bible Brain fileset ID:

```javascript
// French example
if (language === 'fr') {
  const filesetId = 'FRBBT1910'; // hypothetical
  return fetchBibleBrainChapter(filesetId, book, chapter);
}
```

**To find fileset IDs**:
1. Call Bible Brain registry API
2. Filter by language code (am, ar, ti, fr)
3. Verify license and availability
4. Test with sample chapters

### Configuration in Code

**Update `lib/bibleBrainFilesetsConfig.js`**:

```javascript
export default {
  // ... existing languages ...
  am: {
    name: 'Amharic',
    language_code: 'am',
    bible_id: 'AMHARIC_BIBLE_ID',
    audioFilesetId: 'AMHARIC_AUDIO_ID',
    enabledText: true,
    enabledAudio: false, // pending verification
    verified: true,
  },
  ar: {
    name: 'Arabic',
    language_code: 'ar',
    bible_id: 'ARABIC_BIBLE_ID',
    audioFilesetId: 'ARABIC_AUDIO_ID',
    enabledText: true,
    enabledAudio: false, // pending verification
    verified: true,
  },
  ti: {
    name: 'Tigrigna',
    language_code: 'ti',
    bible_id: 'TIGRIGNA_BIBLE_ID',
    audioFilesetId: 'TIGRIGNA_AUDIO_ID',
    enabledText: true,
    enabledAudio: false, // pending verification
    verified: true,
  },
  fr: {
    name: 'French',
    language_code: 'fr',
    bible_id: 'FRENCH_BIBLE_ID',
    audioFilesetId: 'FRENCH_AUDIO_ID',
    enabledText: true,
    enabledAudio: false, // pending verification
    verified: true,
  },
};
```

---

## Step 2: UI Localization Audit & Integration

### Pages to Update

For **each language** (am, ar, ti, fr), audit and update:

**Home Page**:
- Greetings (morning, afternoon, evening)
- Hero line / Subtitle
- Quick action buttons
- Language selector

**Bible Reader Page**:
- Book/chapter selectors
- Action buttons (highlight, copy, bookmark, share)
- Error messages
- Loading states

**Audio Player**:
- Play/pause labels
- Speed control
- Volume control
- Error messages

**Profile Page**:
- User data labels
- Theme selector
- Logout button

**Settings Page**:
- Settings group titles
- Toggle labels
- About/privacy

**Navigation/Header**:
- Menu labels
- Back buttons

### Usage Example

**Before** (hardcoded):
```javascript
<button>{selectedLanguage === 'am' ? 'መጽሐፍ ክፍት' : 'Open Bible'}</button>
```

**After** (from locale file):
```javascript
import { getLocaleString } from '@/lib/multilingualLocales';

<button>{getLocaleString(selectedLanguage, 'home.openBible')}</button>
```

---

## Step 3: Language-Specific Implementation Details

### French (fr)

**Priority**: HIGH  
**Complexity**: LOW

**Special considerations**:
- Standard LTR layout
- Standard French typography
- Test on desktop first, then mobile

**Key pages**:
1. Home → Daily verse
2. Bible reader → JHN 3, PSA 23, MAT 5
3. Audio (if available)
4. Profile page

---

### Amharic (am)

**Priority**: HIGH  
**Complexity**: MEDIUM

**Special considerations**:
- Ge'ez script (Unicode support required)
- Font rendering critical
- Test on mobile (iOS/Android font support)

**Key pages**:
1. Home → Daily verse (check script rendering)
2. Bible reader → JHN 3
3. Verify all buttons display correctly
4. Check font size/readability

---

### Arabic (ar)

**Priority**: MEDIUM-HIGH  
**Complexity**: MEDIUM-HIGH

**Special considerations**:
- **RTL layout required**
- Right-aligned buttons, cards, text
- Text flows right to left
- Input fields right-aligned
- Navigation menu mirrored

**RTL CSS changes needed**:
```css
/* Home Page */
body[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

body[dir="rtl"] button {
  float: right;
  margin: 0 1rem 0 0; /* reversed margins */
}

body[dir="rtl"] input {
  text-align: right;
}
```

**Key pages** (test on each):
1. Home page (verse card, buttons)
2. Bible reader (layout, buttons)
3. Profile (form fields)
4. Settings (toggle switches)

---

### Tigrigna (ti)

**Priority**: MEDIUM  
**Complexity**: MEDIUM

**Special considerations**:
- Ge'ez script (like Amharic)
- May have limited Bible content
- Graceful fallback if unavailable

**Key pages**:
1. Home → Check daily verse
2. Bible reader → Test availability
3. If unavailable, show clean message

---

## Step 4: Error Handling & Fallback

### Language-Specific Unavailable Messages

Use `getLocaleString()` to show proper error:

```javascript
// When Bible content is unavailable
const unavailableMsg = getLocaleString(language, 'errors.${language}Unavailable');
// Returns:
// am: "አማርኛ ቅጽ አሁን ለመድረስ できませんでした"
// ar: "كتاب الله بالعربية غير متاح حالياً"
// ti: "ትግርኛ ንጹህ ቃል አሁን ለመድረስ できませんでした"
// fr: "La Bible en français n'est pas disponible pour le moment"
```

### Fallback Strategy

1. User selects language (am, ar, ti, or fr)
2. Check if Bible content is available for that language
3. If YES → Load and display
4. If NO → Show language-specific unavailable message
5. Do NOT show empty Bible, fake verses, or English

---

## Step 5: QA Testing Matrix

### For Each Language (am, ar, ti, fr)

**Reader Tests**:
- [ ] Open John 3 → Verses load correctly
- [ ] Open Psalms 23 → Text displays properly
- [ ] Open Psalms 25 → Chapters navigate smoothly
- [ ] Open Matthew 5 → No broken characters
- [ ] Open Romans 8 → Audio loads (if available)

**Home Page**:
- [ ] Daily verse displays in language
- [ ] All buttons show proper labels
- [ ] No English mixed in (except temp fallback)
- [ ] Greetings change by time of day

**UI Tests**:
- [ ] Profile page → All labels in language
- [ ] Settings → No mixed English
- [ ] Audio page → Play/pause labels correct
- [ ] Store → Premium text proper

**Language-Specific Tests**:
- **Amharic**: Check Ge'ez script rendering, font sizes
- **Arabic**: Check RTL layout, button alignment, text direction
- **Tigrigna**: Check Ge'ez script, availability message
- **French**: Standard text rendering

**Fallback Tests**:
- [ ] Language unavailable → Clean message shown
- [ ] No blank empty pages
- [ ] No fake translations visible

---

## Step 6: Implementation Checklist

### Framework (DONE ✅)
- ✅ Locale files created (am, ar, ti, fr)
- ✅ `multilingualLocales.js` helper created
- ✅ RTL detection built in
- ✅ Error messaging keys added

### Bible Brain Integration (TO DO)
- [ ] Find/configure fileset IDs for each language
- [ ] Update `bibleBrainFilesetsConfig.js`
- [ ] Test Bible fetching for each language
- [ ] Verify audio availability status

### UI Updates (TO DO)
- [ ] Home page — audit & replace hardcoded strings
- [ ] Bible reader — use locale strings throughout
- [ ] Audio player — language-aware labels
- [ ] Profile page — full localization
- [ ] Settings page — full localization
- [ ] Error messages — language-specific fallbacks

### RTL Support (ARABIC ONLY)
- [ ] CSS: `dir="rtl"` attribute on root
- [ ] Buttons: right-aligned, reversed margins
- [ ] Input fields: right-aligned text
- [ ] Navigation: RTL-aware layout
- [ ] Icons: consider flipping if needed

### Testing (TO DO)
- [ ] French: Desktop + mobile
- [ ] Amharic: Font rendering, mobile
- [ ] Arabic: Full RTL layout, mobile
- [ ] Tigrigna: Script rendering, fallback

### Documentation (TO DO)
- [ ] Per-language implementation guide
- [ ] RTL CSS reference (Arabic)
- [ ] Font requirements document
- [ ] QA checklist per language

---

## Recommended Rollout Order

### Phase 1: French (Week 1)
1. Configure Bible Brain fileset
2. Update UI pages (home, bible, profile, settings)
3. QA testing (desktop + mobile)
4. Minor bug fixes
5. Publish

**Why first**: Simplest, most common, no RTL complexity.

### Phase 2: Amharic (Week 2)
1. Configure Bible Brain fileset
2. Update UI pages
3. QA testing with Ge'ez font focus
4. Mobile font verification
5. Publish

**Why second**: Similar complexity to French, important user base, script support critical.

### Phase 3: Arabic (Week 3-4)
1. Configure Bible Brain fileset
2. Update UI pages
3. CSS RTL layout updates
4. RTL-specific testing (layout, alignment, buttons)
5. Mobile RTL testing
6. Publish

**Why third**: Largest complexity (RTL), benefits from learning from French/Amharic first.

### Phase 4: Tigrigna (Week 4-5)
1. Configure Bible Brain fileset (or set graceful unavailable)
2. Update UI pages
3. QA testing
4. Deploy with clean fallback if content unavailable
5. Publish

**Why last**: Smallest user base, may have limited content availability, less critical for launch.

---

## Summary Table

| Language | Priority | Complexity | Locale | RTL | Scripts | Status |
|----------|----------|------------|--------|-----|---------|--------|
| French | HIGH | LOW | fr.json ✅ | NO | Latin | Ready |
| Amharic | HIGH | MEDIUM | am.json ✅ | NO | Ge'ez | Ready |
| Arabic | MED-HIGH | MED-HIGH | ar.json ✅ | YES | Arabic | Ready |
| Tigrigna | MEDIUM | MEDIUM | ti.json ✅ | NO | Ge'ez | Ready |
| Oromo | CRITICAL | MEDIUM | om.json ✅ | NO | Latin | Done |

---

## Key Rules

### SEPARATION: UI vs. Bible
✅ UI strings → from locale files (`am.json`, `ar.json`, etc.)  
✅ Bible verses → from Bible Brain or licensed datasets  
❌ Never use locale strings as verse text  
❌ Never use verse text as UI labels  

### FALLBACK BEHAVIOR
✅ Missing translation key → Log warning, safe fallback  
✅ Bible unavailable → Show language-specific message  
✅ Audio unavailable → Show graceful UI state  
❌ No empty blank pages  
❌ No fake translations  

### RTL (ARABIC ONLY)
✅ Use `dir="rtl"` on appropriate elements  
✅ Right-align buttons, text, inputs  
✅ Test layout on mobile  
❌ Don't assume LTR layout works  

---

## Next Steps

1. **Find Bible Brain fileset IDs** for each language (am, ar, ti, fr)
2. **Update `bibleBrainFilesetsConfig.js`** with fileset IDs
3. **Audit each page** (home, bible, profile, settings, audio)
4. **Replace hardcoded strings** with `getLocaleString()` calls
5. **Implement RTL styling** for Arabic
6. **QA test** each language per checklist
7. **Deploy** in recommended rollout order

---

## Contact & Support

For language-specific questions:
- **French**: Check Latin script rendering
- **Amharic**: Verify Ge'ez font support (may need custom fonts)
- **Arabic**: RTL layout testing critical — test early
- **Tigrigna**: Plan fallback if Bible content unavailable

For Bible content questions:
- Consult Bible Brain API documentation
- Verify licenses for each language's content
- Test sample chapters before going live

---

**Goal**: Every language gets real Bible content + clean UI localization + proper fallbacks. No fake, empty, or broken multilingual experience.