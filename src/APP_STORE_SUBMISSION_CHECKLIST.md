# FaithLight App Store Submission Checklist

**Target:** First-try approval on Apple App Store  
**Current Date:** March 28, 2026  
**Estimated Timeline:** 2-3 weeks if all blockers fixed now

---

## PHASE 1: Fix Critical Blockers (Target: This Week)

### ❌ BLOCKER 1: VerseImageGenerator Refresh Crash
**Status:** CRITICAL  
**Issue:** App crashes when user refreshes VerseImageGenerator page  
**File:** `pages/VerseImageGenerator`  
**Action:** Debug and fix refresh state management  
**Verification:** Test on device — refresh multiple times, no crash

**Acceptance Criteria:**
- ✅ Refresh doesn't crash
- ✅ Image generation still works
- ✅ Can switch languages without crash

---

### ❌ BLOCKER 2: Mixed-Language Pages
**Status:** CRITICAL  
**Issue:** Wrong language text appears on same screen (e.g., English label + Oromo button)  
**Affected Pages:** Multiple (identify via testing)  
**Action:** Audit all pages for language mismatch in labels/buttons/messages  
**Root Cause:** Likely missing i18n wrapper or partial translation  

**Verification:** Switch to Oromo, walk through each page, confirm ALL text is Oromo  

**Acceptance Criteria:**
- ✅ Home: All Oromo
- ✅ Reader: All Oromo
- ✅ Audio: All Oromo
- ✅ Search: All Oromo
- ✅ My Prayers: All Oromo
- ✅ Same for Amharic

---

### ❌ BLOCKER 3: English Bible Showing When Another Language Selected
**Status:** CRITICAL  
**Issue:** User selects Oromo, but Bible text shows English scripture  
**File:** `pages/BibleReaderPage`, `lib/bibleService.js`  
**Action:** Verify language parameter passed to Bible API, check fallback logic  
**Root Cause:** Likely incorrect language code sent to Bible Brain or fallback triggered incorrectly

**Verification:** Select language → Open Reader → Confirm Bible text matches language  

**Acceptance Criteria:**
- ✅ Oromo selected → Oromo Bible loads
- ✅ Amharic selected → Amharic Bible loads
- ✅ English selected → English Bible loads
- ✅ No English fallback unless necessary

---

### ❌ BLOCKER 4: "Chapter Not Found" on Supported Languages
**Status:** CRITICAL  
**Issue:** Supported languages show error instead of loading chapter  
**File:** `pages/BibleReaderPage`, Bible API error handling  
**Action:** Check if Bible data exists in backend for that language/chapter combo  

**Verification:** 
- Oromo Genesis 1 loads
- Amharic John 3 loads
- All major books available in each language

**Acceptance Criteria:**
- ✅ No "Chapter not found" for supported languages
- ✅ Graceful message only for truly unsupported combos

---

### ❌ BLOCKER 5: Oromo Text Spelling Errors
**Status:** MEDIUM (Can block if Apple tester notices)  
**Issue:** "Caraa kee..." instead of "Imala kee..." and similar  
**Files:** All files with Oromo strings  
**Action:** Native speaker review of all Oromo translations  
**Root Cause:** Translation mistakes, likely copy-paste errors

**Verification:** Have Oromo speaker audit:
- Navigation labels
- Button text
- Message content
- All i18n files

**Acceptance Criteria:**
- ✅ All Oromo reviewed by native speaker
- ✅ No obvious misspellings
- ✅ Consistent terminology

---

### ❌ BLOCKER 6: Broken Audio or Blank Sections
**Status:** CRITICAL  
**Issue:** Audio chapters don't play or sections show blank  
**Files:** `pages/AudioBiblePage`, audio player components  
**Action:** Test every supported language's audio on device  

**Verification:**
- English audio plays without lag
- Oromo audio plays without lag
- Amharic audio (if available) plays
- No blank sections

**Acceptance Criteria:**
- ✅ All audio plays without hanging
- ✅ No silent failures
- ✅ Progress tracking works

---

## PHASE 2: Build & Device Testing (Timeline: Week 2)

### Build Eligibility Checklist

- [ ] Building with Xcode 15+ or latest available
- [ ] Target iOS 14+ (Apple's 2026 minimum)
- [ ] Archive builds successfully
- [ ] Build installs on real iPhone without errors
- [ ] No warnings that would concern reviewer

**Commands to verify:**
```bash
xcodebuild -version  # Check Xcode version
xcodebuild build-for-testing  # Test build
xcodebuild test  # Run unit tests
```

### Device Testing Checklist

Test on a real iPhone (not simulator). Script:

```
1. Cold launch (app not in memory)
   - App opens without crash
   - Home screen shows
   - All tabs load

2. Language switching (3x each language)
   - Change to English → All English
   - Change to Oromo → All Oromo
   - Change to Amharic → All Amharic
   - No mixed languages anywhere
   - No crashes on switch

3. Bible Reader
   - Open Genesis 1
   - Can scroll verse text
   - Can switch chapters
   - Can tap verses (highlight, etc.)
   - Can switch languages in Reader
   - No crashes on navigation

4. Audio Bible
   - Open English audio
   - Play button works
   - Audio actually plays
   - Progress bar updates
   - Can pause/resume
   - Can skip ahead
   - Language switching in audio works

5. Search
   - Type "John"
   - Results appear
   - Can tap result
   - Can link to prayer
   - Works in multiple languages

6. My Prayers
   - Add new prayer
   - Save prayer
   - Link verse to prayer
   - Mark as answered
   - Works in multiple languages

7. Community Prayer (if enabled)
   - Can view posts
   - Can create post
   - Moderation features visible

8. Refresh (critical for crashes)
   - On Home: Refresh → no crash
   - On Reader: Refresh → no crash
   - On Audio: Refresh → no crash
   - On Search: Refresh → no crash
   - On Prayers: Refresh → no crash

9. Weak internet
   - Close wifi
   - Try to load chapter
   - Error message shows (not crash)
   - Restore wifi
   - Retry works

10. No internet
    - Turn on airplane mode
    - Offline content works (if any)
    - Clear error shown for online content
    - No crash
```

**Result Log:**
```
Device: iPhone 13, iOS 17.3
Date: [date]
Tester: [name]

✅ Cold launch - PASS
✅ Language switching - PASS
✅ Bible Reader - PASS
✅ Audio - PASS
✅ Search - PASS
✅ My Prayers - PASS
✅ Refresh - PASS
✅ Weak internet - PASS

Status: READY FOR TESTFLIGHT
```

---

## PHASE 3: App Store Connect Setup (Timeline: Week 2)

### App Record in App Store Connect

- [ ] App name: "FaithLight"
- [ ] Subtitle: "Bible, Audio & Prayer" (max 30 chars)
- [ ] Category: Reference or Education (pick one)
- [ ] Age Rating: 4+ (no profanity, violence, etc.)
- [ ] Support URL: https://faithlight.app/help
- [ ] Privacy Policy URL: https://faithlight.app/privacy
- [ ] Languages: English, Oromo, Amharic

### App Privacy

In App Store Connect → App Privacy:

**Questions to answer:**

1. **Does your app use or collect user data?**  
   YES (prayer entries, reading progress)

2. **Account info?**  
   NO (unless login added)

3. **User content (prayers, journal)?**  
   YES - NOT linked to user identity (private)

4. **Analytics?**  
   YES - Event tracking (launch, page views)

5. **Crash data?**  
   YES - Standard crash reporting

6. **Performance data?**  
   Optional - Only if you collect it

7. **Health/fitness?**  
   NO

8. **Financial info?**  
   NO (unless premium features added)

9. **Location?**  
   NO

10. **Sensitive info (contacts, photos, calendar)?**  
    NO

**Actions:**
- [ ] Answer all questions accurately
- [ ] Click "Publish"
- [ ] Verify Apple displays correct Privacy Nutrition Label on product page

---

### Accessibility Nutrition Labels

In App Store Connect → Product Page Information:

Mark as supported (if true):

- [ ] VoiceOver: YES (text-heavy app)
- [ ] Voice Control: YES
- [ ] Switch Control: YES (button-based navigation)
- [ ] Larger Text: YES (all text respects system size)
- [ ] Reduce Motion: YES (animations can be disabled)
- [ ] Dark Interface: YES
- [ ] High Contrast: YES
- [ ] On-screen keyboard: YES

**Minimum acceptable:** VoiceOver, Larger Text, Dark Interface

---

## PHASE 4: Screenshots & Marketing Materials (Timeline: Week 2)

### Required Screenshots

Upload 5 screenshots showing best features. Format: 1290×2796px (iPhone Pro Max).

**Screenshot 1: Home / Launch**
```
Shows:
- Welcome message
- Daily verse visible
- Language selector working
- Clean, inviting design

Checklist:
☐ No errors
☐ All English
☐ Latest build
```

**Screenshot 2: Bible Reader**
```
Shows:
- Chapter open
- Verse visible
- Navigation buttons
- Book/chapter selector

Checklist:
☐ Chapter actually displayed
☐ Real scripture text
☐ No placeholder
```

**Screenshot 3: Audio Bible**
```
Shows:
- Play controls
- Progress bar
- Chapter info
- Speed/volume controls

Checklist:
☐ Audio buttons visible
☐ Settings accessible
☐ No grayed-out controls
```

**Screenshot 4: Search**
```
Shows:
- Search bar
- Results displayed
- Verse preview
- Link to prayer option

Checklist:
☐ Real search results
☐ No empty state
☐ Buttons working
```

**Screenshot 5: Language Support**
```
Shows:
- Language selector
- App in multiple languages (EN/OM/AM tabs)
- Consistent UI across languages
- No mixed text

Checklist:
☐ All languages visible
☐ No English fallback
☐ Professional look
```

### Marketing Content

**App Description (max 4000 chars):**

```
FaithLight is a multilingual Bible and prayer app that brings Scripture to life in your language.

Core Features:
📖 Bible Reading – Access Bible text in English, Afaan Oromoo, and አማርኛ
🔊 Audio Bible – Listen to entire books with language-specific playback settings
🙏 Personal Prayers – Write, save, and track your prayers
🔍 Verse Search – Find Scripture by keyword, theme, or reference
🌍 Multilingual Support – UI and content in multiple African languages
💙 Community Prayers – Share prayer requests with a supportive community
📱 Offline Support – Access downloaded content without internet

Perfect for:
- Daily Scripture reading and reflection
- Prayer journaling and tracking answered prayers
- Bible study and verse research
- Listening to Scripture while commuting or exercising
- Praying together with community

FaithLight is designed for simplicity, accessibility, and spiritual growth in your native language.

Download now and start your faith journey.
```

**Keywords (comma-separated):**
```
Bible, prayer, Scripture, Oromo, Amharic, faith, Christianity, audio Bible, devotional, Bible study
```

---

## PHASE 5: App Review Notes

**In App Store Connect → Version Information → App Review Notes:**

```
FaithLight is a multilingual Bible and prayer application that enables users 
to read Scripture, listen to audio Bible, search for verses, and maintain a 
personal prayer journal in their preferred language.

FEATURES TO TEST:
1. Open app and verify Home screen loads
2. Use language selector to switch between English, Oromo, and Amharic
3. Open Bible Reader and load a chapter in each language
4. Open Audio Bible and verify playback works
5. Use Search to find a verse
6. Open My Prayers to add a new prayer entry
7. Switch languages multiple times — UI and content should follow selection
8. Refresh/relaunch to confirm no crashes on any feature

SUPPORTED LANGUAGES:
- English: Full support (Bible text, UI, audio)
- Afaan Oromoo: Full support (Bible text, UI, audio)
- አማርኛ (Amharic): UI translations, Bible text where available

If a Bible translation is unavailable for a language, the app displays 
a localized fallback message instead of showing English or crashing.

NO LOGIN REQUIRED
No demo account needed. App is fully functional as-is.

SPECIAL NOTES:
- Community Prayer feature includes user-generated content with report/block options
- Offline Bible content can be downloaded for each language
- Audio playback includes language-aware speed settings

For technical questions, contact: support@faithlight.app

Thank you for reviewing FaithLight.
```

---

## PHASE 6: TestFlight Pre-Submission (Timeline: Week 2)

### Create TestFlight Build

1. Archive app in Xcode
2. Upload to App Store Connect
3. Wait for processing (~5-10 min)
4. Invite 10-25 testers (friends, team, community)
5. Gather feedback for 3-5 days
6. Fix any critical issues
7. Upload new build if needed

### TestFlight Testing Script

Send to testers:

```
Hi! Please test FaithLight on your iPhone.

Steps:
1. Install via TestFlight
2. Open app
3. Walk through these tests:

[ ] App opens without crashing
[ ] Home screen loads
[ ] Can switch languages (English → Oromo → Amharic)
[ ] Bible Reader loads Genesis 1
[ ] Can tap verses in Bible
[ ] Audio Bible plays
[ ] Search finds "John"
[ ] Can save a prayer
[ ] Refresh doesn't crash

Issues found:
[Text field]

Thank you!
```

---

## PHASE 7: Final Submission (Timeline: Week 3)

### Pre-Submit Checklist

- [ ] All blockers fixed
- [ ] Device testing passed
- [ ] TestFlight tested (all green)
- [ ] App Store Connect record complete
- [ ] App Privacy published
- [ ] Accessibility labels set
- [ ] Screenshots uploaded and approved
- [ ] Review notes written
- [ ] Build version: 1.0 (1)
- [ ] Release notes: "Welcome to FaithLight"

### Submission Steps

1. In App Store Connect, click "Ready for Submission"
2. Verify all info is complete
3. Choose release option:
   - **Recommended for first launch:** Manual Release
   - Alternative: Automatic after Apple approval (riskier)
4. Click "Submit for Review"
5. Wait for email confirmation

### Expected Timeline

- **Submitted:** [Date]
- **Apple Review:** 24-48 hours typically
- **Expected Decision:** Within 3 business days
- **If approved:** Manually release from App Store Connect
- **Time to live:** ~30 minutes after manual release

---

## PHASE 8: Post-Submission

### If Approved ✅

1. Go to App Store Connect
2. Click "Release"
3. Monitor App Store listings (30 min - 2 hours to propagate)
4. Celebrate! 🎉
5. Monitor crash reports and reviews daily for first week

### If Rejected ❌

1. Read Apple's rejection reason carefully
2. Respond with explanation or fix
3. Most common rejections for apps like yours:
   - Guideline 2.1 (performance issues, crashes)
   - Guideline 1.2 (UGC moderation — if applicable)
   - Guideline 5.1 (legal — privacy mismatch)
4. Fix and resubmit
5. Usually approved on second try

---

## Critical Risk Mitigation

### Top Rejection Risks for FaithLight

**RISK 1: Language Switching Crashes**  
**Mitigation:** Test 10x on device before submit  
**Owner:** [Dev name]  
**Status:** [ ] Complete

**RISK 2: English Bible When Oromo Selected**  
**Mitigation:** Verify Bible API language parameter  
**Owner:** [Dev name]  
**Status:** [ ] Complete

**RISK 3: Community Prayer Content Policy**  
**Mitigation:** Ensure report/block/moderation visible  
**Owner:** [Dev name]  
**Status:** [ ] Complete

**RISK 4: Missing Privacy Policy**  
**Mitigation:** Publish valid privacy policy URL  
**Owner:** [Dev name]  
**Status:** [ ] Complete

**RISK 5: Wrong Accessibility Claims**  
**Mitigation:** Actually support VoiceOver, Larger Text  
**Owner:** [Dev name]  
**Status:** [ ] Complete

---

## Success Criteria

App is ready to submit when:

- ✅ All 6 blockers fixed
- ✅ Device testing passed
- ✅ TestFlight 100% pass
- ✅ App Store Connect complete
- ✅ No warnings or errors in Xcode
- ✅ Privacy policy URL works
- ✅ Screenshots look professional
- ✅ Review notes are clear and helpful
- ✅ Built with latest Xcode version
- ✅ Zero crashes on any test scenario

---

## Action Items (Today)

**Priority 1 (Fix This Week):**
1. [ ] Fix VerseImageGenerator crash (test on device)
2. [ ] Audit all pages for mixed-language text
3. [ ] Verify Oromo Bible loads correctly
4. [ ] Verify Amharic Bible loads correctly
5. [ ] Test audio playback on device
6. [ ] Oromo spelling review

**Priority 2 (Next Week):**
7. [ ] Device testing script (full pass)
8. [ ] App Store Connect setup
9. [ ] App Privacy completion
10. [ ] Screenshots + marketing copy

**Priority 3 (Week 3):**
11. [ ] TestFlight build + testing
12. [ ] Final checklist
13. [ ] Submit for review

---

**Estimated Total Time to Launch:** 2-3 weeks if all blockers addressed now.

**Next Step:** Start with BLOCKER 1 (VerseImageGenerator crash).