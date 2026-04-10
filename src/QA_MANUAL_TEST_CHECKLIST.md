# FaithLight Google Play / Apple Store - Manual QA Checklist

## Pre-Publish Verification (8 Critical Paths)

### 1. **Home Page**
- [ ] Page loads without errors
- [ ] Pull-to-refresh works (swipe down at top)
- [ ] Verse of Day displays correctly in current language
- [ ] Language switching works (Settings → Language → select)
- [ ] Reading streak widget shows correct progress
- [ ] Daily devotional card appears
- [ ] All quick action buttons navigate correctly
- [ ] Featured cards section loads and displays
- [ ] Continue reading section shows last read Bible chapter

### 2. **Bible Reader Page**
- [ ] Page loads without errors
- [ ] Chapter loads and displays verses
- [ ] Pull-to-refresh works (swipe down to reload chapter)
- [ ] Book picker modal opens/closes smoothly
- [ ] Chapter picker modal opens/closes smoothly
- [ ] Language selector changes verse text
- [ ] Previous/Next chapter navigation works
- [ ] Audio button toggles (if audio available)
- [ ] Favorite button works (heart icon)
- [ ] Highlight feature works (tap verse → highlight color)
- [ ] Share verse card opens
- [ ] "Mark Chapter Read" button records progress
- [ ] Offline save button works (download icon)

### 3. **Audio Bible Page**
- [ ] Page loads without errors
- [ ] Pull-to-refresh works (swipe down to re-check audio)
- [ ] Book/Chapter picker opens and closes
- [ ] Play button triggers audio (if available)
- [ ] Pause button stops audio
- [ ] Skip back/forward 15s buttons work
- [ ] Previous/Next chapter buttons work
- [ ] Speed selector (0.75x to 2x) works
- [ ] Volume slider works
- [ ] Audio language dropdown (English/Oromo) changes language
- [ ] "Coming Soon" message for unsupported languages displays correctly
- [ ] Now Playing card shows current track

### 4. **Prayer/Devotional Feeds** (MyPrayerJournal or Prayer pages)
- [ ] Page loads without errors
- [ ] Pull-to-refresh works (swipe down to reload feed)
- [ ] Add prayer button opens form
- [ ] Prayer list displays
- [ ] Prayer cards show summary info
- [ ] Tap prayer opens detail view

### 5. **AI Study Pages** (AI Bible Companion or AI Sermon Builder)
- [ ] Page loads without errors
- [ ] No "Coming Soon" placeholders visible
- [ ] Form/input fields work
- [ ] Submit button triggers AI response
- [ ] AI response displays without errors
- [ ] Language of response matches selected language

### 6. **Settings Page**
- [ ] Page loads without errors
- [ ] Language selector works (English/Oromo/Amharic)
- [ ] Switching language updates UI in real-time
- [ ] Account deletion option visible and clickable
- [ ] Account deletion flow completes successfully
- [ ] Notifications preferences show (if available)
- [ ] Theme selector works (if dark mode available)

### 7. **Account Deletion Path** (Critical for App Store)
- [ ] "Delete Account" button visible in Settings
- [ ] Confirmation dialog appears
- [ ] Final delete confirms account is removed
- [ ] After deletion, logged-out redirect works
- [ ] Can re-login or sign up after deletion

### 8. **Language Switching (Global)** (Critical for App Store)
- [ ] Home → Change language → Home text updates
- [ ] Bible Reader → Change language → Verses text/UI updates
- [ ] Audio Bible → Change audio language → Audio language changes
- [ ] Settings page all labels update
- [ ] Prayer page labels update
- [ ] AI pages prompts/responses update
- [ ] Navigation tabs display correct language
- [ ] RTL support works for Arabic (if applicable)

---

## Cross-Platform Naming Consistency

### Button Labels - Check Consistency
- [ ] "Previous" vs "Prev" — standardize across all pages
- [ ] "Next" vs "Fwd" — standardize across all pages
- [ ] "Back" vs "Return" — standardize across all pages
- [ ] "Save" vs "Save Offline" vs "Download" — use consistent term
- [ ] "Create" vs "Add" — standardize across all pages
- [ ] "Delete" vs "Remove" — use consistent term

### Tab/Feature Names - Check Consistency
- [ ] "Saved" vs "Bookmarks" vs "Favorites" — pick one term globally
- [ ] "Offline" vs "Downloaded" — pick one term globally
- [ ] "Highlights" vs "Marked verses" — pick one term globally
- [ ] "Notes" vs "Study Notes" — pick one term globally
- [ ] "Prayers" vs "Prayer Journal" — pick one term globally
- [ ] "AI Tools" vs "AI Assistant" vs "AI Companion" — pick one term globally

### Error/Status Messages - Check Consistency
- [ ] "Audio not available" messaging is same across Bible Reader & Audio Bible
- [ ] "Chapter unavailable" messaging is consistent
- [ ] "Loading..." vs "Checking..." — pick one term globally
- [ ] Offline banners say same thing on all pages

---

## Performance & Build Verification

- [ ] App builds cleanly from exported package (`npm install` && `npm run build`)
- [ ] No console errors on cold start
- [ ] No console warnings on critical paths (Home, Bible Reader, Settings)
- [ ] Page transitions are smooth (no janky animations)
- [ ] Buttons respond within 300ms
- [ ] Data loads within 2 seconds on decent network

---

## Final Sign-Off

**Tested by:** ________________  
**Date:** ________________  
**Build Version:** ________________  
**Go/No-Go for Publishing:** ☐ GO ☐ NO-GO

**Notes:**
```
[Add any issues found or special notes here]
``