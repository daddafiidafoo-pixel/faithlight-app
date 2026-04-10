# Language-Aware Bible Configuration

## Overview
FaithLight now separates UI language from Bible content language. When users select a language, both the interface AND Bible content switch to that language (when available).

## Current Language Support

### UI Languages (7 total)
All these languages have UI/chat support:
- **English** (en) - UI ✓ | Bible ✓
- **Afaan Oromoo** (om) - UI ✓ | Bible ✓
- **Amharic** (am) - UI ✓ | Bible ✓
- **Tigrinya** (ti) - UI ✓ | Bible ✗ (fallback to English)
- **Arabic** (ar) - UI ✓ | Bible ✓
- **Swahili** (sw) - UI ✓ | Bible ✓
- **French** (fr) - UI ✓ | Bible ✓

### Bible Support Matrix
| Language | Code | UI Available | Bible Available | Bible ID | Fallback |
|----------|------|--------------|-----------------|----------|----------|
| English | en | ✓ | ✓ | ENGESV | none |
| Afaan Oromoo | om | ✓ | ✓ | GAZGAZ | en |
| Amharic | am | ✓ | ✓ | AMHENTA | en |
| Tigrinya | ti | ✓ | ✗ | - | en |
| Arabic | ar | ✓ | ✓ | ARBNAV | en |
| Swahili | sw | ✓ | ✓ | SWAHILI | en |
| French | fr | ✓ | ✓ | FREFBJ | en |

## Architecture

### 1. Core Configuration (`lib/languageConfig.js`)
Centralized language metadata:
```javascript
LANGUAGE_CONFIG = {
  [languageCode]: {
    code,
    displayName,
    nativeName,
    uiAvailable: boolean,
    bibleAvailable: boolean,
    bibleId: string | null,
    bibleAudioFileset: string | null,
    fallbackLanguage: string | null,
  }
}
```

**Key Functions:**
- `isBibleAvailable(code)` - Check if Bible exists for language
- `getBibleIdForLanguage(code)` - Get Bible ID with fallback
- `getActualBibleLanguage(code)` - Determine which language will be used
- `getBibleLanguages()` - Get all languages with Bible support

### 2. Language Provider (`components/i18n/LanguageProvider.jsx`)
Enhanced context tracking:
- **language** - UI language (set by user)
- **bibleLanguage** - Bible language (may differ if unavailable)
- **isBibleAvailable** - Boolean flag
- **languageConfig** - Config for selected UI language
- **bibleLanguageConfig** - Config for Bible language being used

**Behavior:**
When `setLanguage(newLanguage)` is called:
1. Set UI language to newLanguage
2. Check if Bible available for newLanguage
3. If available: set Bible language to newLanguage
4. If unavailable: set Bible language to fallback (usually English)
5. Persist both to localStorage

### 3. Language Selector with Bible Status
Component: `components/LanguageSelectorWithBibleStatus.jsx`

Shows each language with a status badge:
- ✓ Bible available (green)
- UI only (amber)

### 4. Bible Language Fallback Modal
Component: `components/bible/BibleLanguageFallbackModal.jsx`

When a language without Bible support is encountered:
- Shows message in the selected language
- Offers to continue with English Bible
- User can cancel or proceed

**Fallback messages included for:** en, om, am, ti, ar, sw, fr

### 5. Hook for Fallback Handling
Hook: `components/hooks/useBibleLanguageWithFallback.js`

```javascript
const {
  bibleLanguage,
  showFallback,
  pendingLanguage,
  handleLanguageChangeWithBibleCheck,
  handleConfirmEnglishFallback,
  handleCancelFallback,
} = useBibleLanguageWithFallback();
```

## Implementation Details

### User Flow: Language Selection

1. **User clicks language selector**
2. **Shows available languages with Bible status tags**
3. **User selects language (e.g., Tigrinya)**
4. **System checks: Is Bible available for Tigrinya?**
   - **No** → Show fallback modal in Tigrinya
   - **Yes** → Switch UI + Bible to Tigrinya
5. **If fallback modal shown:**
   - User can "Continue with English" or "Cancel"
   - If confirmed: UI = Tigrinya, Bible = English
   - If cancelled: No change

### AI Bible Companion Integration

AIBibleCompanion now:
1. Detects selected language and Bible availability
2. Includes Bible context in AI prompt:
   ```
   "Note: Bible text is not available in Tigrinya. 
    Provide faith guidance and prayer support in Tigrinya, 
    and reference Scripture in the closest available translation."
   ```
3. Shows inline notice when Bible unavailable:
   > "Bible content is not yet available in your language, 
   >  but prayer and guidance will be provided in your selected language."
4. Responds in selected language regardless of Bible availability

## Storage & Persistence

LocalStorage keys:
- `faithlight_language` - Current UI language
- `faithlight_bible_language` - Current Bible language

Both are restored on app load. If stored language is unavailable, defaults to English.

## Adding New Languages

To add a new language to FaithLight:

1. **Update `LANGUAGE_CONFIG` in `lib/languageConfig.js`:**
   ```javascript
   pt: {
     code: 'pt',
     displayName: 'Portuguese',
     nativeName: 'Português',
     uiAvailable: true,          // Add UI translations
     bibleAvailable: true,       // If Bible source available
     bibleId: 'PORTUGUESE_BIBLE_ID',
     bibleAudioFileset: null,
     fallbackLanguage: 'en',
   }
   ```

2. **Add translations to `components/i18n/coreTranslations.js`:**
   ```javascript
   pt: {
     // UI strings in Portuguese
   }
   ```

3. **If adding Bible support:**
   - Verify Bible ID with Bible Brain or API
   - Add fallback message to `BibleLanguageFallbackModal.jsx`
   - Test verse display and AI responses

4. **Update language selector/dropdown** if needed

## Testing Checklist

- [ ] Selecting English: UI + Bible both English
- [ ] Selecting Oromo: UI + Bible both Oromo
- [ ] Selecting Tigrinya: UI Tigrinya, Bible English (fallback)
- [ ] Fallback modal shows correct language/message
- [ ] AI responses in selected language
- [ ] Bible unavailable notice appears
- [ ] Language persists after page reload
- [ ] No console errors or crashes

## Edge Cases Handled

✓ **No Bible for language:** Shows fallback modal, option to use English
✓ **Language change on chat:** AI continues in new language
✓ **Bible language mismatch:** System tracks separately
✓ **Page reload:** Restores both UI and Bible language
✓ **Unsupported language code:** Defaults to English

## Files Modified/Created

**New:**
- `lib/languageConfig.js` - Central config
- `components/bible/BibleLanguageFallbackModal.jsx` - Fallback UI
- `components/LanguageSelectorWithBibleStatus.jsx` - Enhanced selector
- `components/hooks/useBibleLanguageWithFallback.js` - Fallback hook

**Modified:**
- `components/i18n/LanguageProvider.jsx` - Track Bible language
- `pages/AIBibleCompanion.jsx` - Use language-aware system

## Future Enhancements

- [ ] Admin panel to configure Bible sources per language
- [ ] Automatic Bible availability detection from API
- [ ] Per-language Scripture reference formatting
- [ ] Language-specific Bible commentary/notes
- [ ] User preference: always use native Bible vs English fallback