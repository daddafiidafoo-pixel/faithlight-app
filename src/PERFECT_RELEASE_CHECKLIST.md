# ✅ FaithLight Perfect Release Checklist

**Status**: Final QA Before Publishing  
**Date**: March 26, 2026  
**Standard**: 100% Pass Rate Required  

---

## 🧠 AI / SERMON GENERATION

### English Sermon Generation
- [ ] Opens without errors
- [ ] Generates complete sermon (intro + points + conclusion)
- [ ] Title is relevant to topic
- [ ] Tone matches selected style
- [ ] Takes < 30 seconds
- [ ] Can regenerate multiple times

### Afaan Oromoo Sermon Generation
- [ ] Outputs in pure Oromo (NO English mixing)
- [ ] Oromo is grammatically correct
- [ ] Verses referenced exist
- [ ] Language is readable (check for mojibake)
- [ ] Performs at same speed as English

### Amharic Sermon Generation
- [ ] Outputs in pure Amharic (NO English or Oromo)
- [ ] Character rendering correct (no boxes or corruption)
- [ ] Content is coherent
- [ ] Handles special characters properly

### Style Changes
- [ ] "Pastoral" tone = warm, personal
- [ ] "Academic" tone = scholarly, detailed
- [ ] "Simple" tone = accessible, basic
- [ ] Tone change produces different output

### Denomination Changes
- [ ] "Reformed" emphasis ≠ "Charismatic" emphasis
- [ ] Tone shifts with theology selection
- [ ] Different devotional styles output accordingly

---

## 🌍 LANGUAGE & LOCALIZATION

### No English on Oromo Pages
- [ ] Switch to Afaan Oromoo
- [ ] Home page → all text is Oromoo
- [ ] Prayer Board → all labels are Oromoo
- [ ] Settings → all menus are Oromoo
- [ ] No "Share", "Send", "Cancel" in English visible
- [ ] No "Home", "Settings", "About" in English

### No Raw Translation Keys
- [ ] No "common.share" visible to user
- [ ] No "prayer.newRequest" shown
- [ ] No untranslated keys appear on pages
- [ ] Console warning = missing key (acceptable, but check)

### Language Persistence
- [ ] Switch to Oromo → refresh page → still Oromo
- [ ] Switch to Amharic → close tab → reopen → still Amharic
- [ ] Language persists across all pages
- [ ] localStorage("faithlight_language") saves correctly

### AI Output Matches Selected Language
- [ ] Generate sermon in English
- [ ] Switch to Oromo
- [ ] Generate sermon → outputs in Oromo (not English)
- [ ] Same for Amharic
- [ ] AI respects current language preference

---

## 📱 MOBILE UX

### Tap Target Size (44×44px minimum — WCAG 2.1 AA)
- [ ] All buttons are clickable (not too small)
- [ ] Prayer board buttons are easy to tap
- [ ] Audio player controls all ≥44px
- [ ] Navigation buttons are large enough
- [ ] Spacing between buttons prevents misfires

### No Overlapping UI
- [ ] Bottom player doesn't cover content
- [ ] Modals don't overlap each other
- [ ] Text doesn't overflow card edges
- [ ] Images fit within container
- [ ] No horizontal scroll on small screens

### Smooth Scrolling
- [ ] No janky scrolling (60fps)
- [ ] Pull-to-refresh works smoothly
- [ ] Animations don't stutter
- [ ] Page transitions are fluid
- [ ] No lag when switching tabs

### Back Button Works Everywhere
- [ ] Android back gesture → previous page
- [ ] Modal close button works
- [ ] Navigation breadcrumb works
- [ ] Can navigate backwards through entire app
- [ ] No "stuck" pages

---

## 🎧 AUDIO PLAYBACK

### Play / Pause Works
- [ ] Click play → audio starts
- [ ] Click pause → audio stops
- [ ] Resume works (doesn't restart)
- [ ] Seek bar moves smoothly
- [ ] Volume controls respond

### No Crashes
- [ ] Play audio → no error in console
- [ ] Switch pages → audio continues
- [ ] Download audio → no crash
- [ ] Switch languages → audio still works
- [ ] Long audio (>1 hour) plays without issue

### Language Voice Matches
- [ ] English audio plays in English voice
- [ ] Oromo audio plays in Oromo voice
- [ ] Amharic audio plays in Amharic voice
- [ ] Voice selection is correct

### Handles Unsupported Oromo Voice Gracefully
- [ ] If Oromo voice unavailable → shows fallback message
- [ ] Message is in current language (not English)
- [ ] App doesn't crash
- [ ] User can still see verse/text
- [ ] Alternative (English) voice offers fallback

---

## 💾 OFFLINE PERSISTENCE

### Sermon Saves to Local DB
- [ ] Generate sermon → "Save" button works
- [ ] Sermon appears in "Saved Sermons" list
- [ ] Data shows after 30 seconds
- [ ] No network errors on save

### Reload → Sermon Still Exists
- [ ] Save sermon
- [ ] Refresh browser (Cmd+R / Ctrl+R)
- [ ] Sermon still in list
- [ ] Can view full content
- [ ] Delete works after reload

### Audio Download Works
- [ ] Click "Download Chapter"
- [ ] Progress indicator shows
- [ ] Download completes
- [ ] Can play offline (disable internet)
- [ ] Handles large files (>500MB)

---

## 📤 SHARING

### Copy Verse / Text Works
- [ ] Click "Copy Verse"
- [ ] Paste into Notes app → works
- [ ] Formatting preserved
- [ ] Reference included

### Native Share Works (if available)
- [ ] Click "Share"
- [ ] Native share sheet appears
- [ ] Can share to WhatsApp, Email, etc.
- [ ] Title/description pre-populated

### Image Generation Works
- [ ] Click "Generate Share Image"
- [ ] Beautiful card appears with sermon title
- [ ] Text is readable (not cut off)
- [ ] Can download as PNG
- [ ] Can share via native share
- [ ] Dimensions correct (1080×1080)

### PDF Download Works
- [ ] Click "Download PDF"
- [ ] File downloads (not stuck)
- [ ] PDF opens in viewer
- [ ] Formatting is readable
- [ ] All sections included (intro, points, conclusion)
- [ ] Page breaks work correctly

---

## 🧪 STABILITY & QUALITY

### No Console Errors
- [ ] Open DevTools (F12)
- [ ] Navigate app fully
- [ ] Console shows 0 red errors
- [ ] Only warnings acceptable (deprecations, etc.)
- [ ] No "useRef is null" errors

### No Blank Pages
- [ ] Every route loads content
- [ ] Loading state shows spinner/skeleton
- [ ] No white page after 5 seconds
- [ ] Error pages show helpful message
- [ ] Empty states are graceful (not broken)

### No Flickering UI
- [ ] Page loads smoothly (no flash)
- [ ] Language switch is instant
- [ ] Cards don't jump around
- [ ] Text doesn't resize mid-scroll
- [ ] Images load without layout shift

### No "useRef null" Errors
- [ ] Audio player initializes properly
- [ ] Canvas elements load
- [ ] Video doesn't cause crashes
- [ ] Ref-based components mount correctly

---

## 🚨 FINAL GATE: THE DECISION

### ✅ IF ALL CHECKS PASS:
```
✓ AI works in all 3 languages (no mixing)
✓ Language persists after refresh
✓ No English text on Oromo pages
✓ All buttons ≥ 44px (mobile-friendly)
✓ No overlapping UI
✓ Audio plays & downloads
✓ Sermons save offline
✓ Sharing (copy, image, PDF) works
✓ Zero console errors
✓ No crashes or blank pages
✓ Smooth scrolling & animations

→ **PUBLISH WITH CONFIDENCE** 🚀
```

### ❌ IF ANY CHECK FAILS:
```
❌ Mixed languages on any page
❌ Buttons smaller than 44px
❌ Audio crashes
❌ Offline save doesn't persist
❌ Sharing broken
❌ Console errors present
❌ Blank pages or crashes

→ **STOP — FIX IMMEDIATELY**
Do NOT publish until 100% pass.
```

---

## 📋 TESTING SEQUENCE

### Phase 1: Core Functionality (30 min)
1. Test sermon generation (English, Oromo, Amharic)
2. Test language switching (all 4 languages)
3. Test offline save & reload
4. Check audio playback

### Phase 2: Mobile & Accessibility (20 min)
1. Inspect all buttons (≥44px)
2. Test on 3 different phone sizes
3. Test back button flow
4. Verify no overlapping UI

### Phase 3: Sharing & Export (15 min)
1. Test copy verse
2. Generate share image
3. Download PDF
4. Test native share (if available)

### Phase 4: Stability (10 min)
1. Open DevTools → Console
2. Navigate entire app
3. Check for errors/crashes
4. Verify smooth performance

**Total**: ~75 minutes → Production-ready

---

## 🎯 SIGN-OFF

When you're 100% confident on this checklist:

1. **Check all boxes** (mark with ✅)
2. **Take a screenshot** of completed checklist
3. **Note any caveats** (e.g., "Oromo voice unavailable" with graceful fallback)
4. **Proceed to publish** with confidence

---

**Generated**: 2026-03-26  
**For**: FaithLight Production Release  
**Standard**: 100% Pass Required  

**Status**: Ready for Testing ✅

---

*Remember: This is your last checkpoint. Every item above is critical for a professional launch. Take the time to verify each one.*