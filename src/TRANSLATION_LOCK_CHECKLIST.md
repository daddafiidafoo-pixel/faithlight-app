# 🔒 TRANSLATION LOCK CHECKLIST (DO NOT PUBLISH WITHOUT THIS)

**Status:** Pre-Launch Verification  
**Created:** 2026-03-26  
**Purpose:** Ensure zero mixed languages before publishing

---

## ⚠️ CRITICAL RULE

**If even ONE page has mixed English/Oromo/Amharic, STOP. Do not publish.**

---

## TEST 1: Home Page Language Check

### English Mode
1. Go to Home page
2. Verify **every** element is in English:
   - [ ] Page title
   - [ ] Daily verse section
   - [ ] Prayer journal link
   - [ ] Bible reader link
   - [ ] All buttons
   - [ ] All labels

### Afaan Oromoo Mode
1. Go to Language selector → Oromo
2. Reload Home page
3. Verify **every** element is in Oromo:
   - [ ] Page title = "Mana"
   - [ ] All buttons use OROMO_TRANSLATION_STANDARD terms
   - [ ] NO English words visible
   - [ ] NO undefined keys (like `common.something`)

**Result:** ✅ PASS / ❌ FAIL

---

## TEST 2: Settings Page Language Check

### English Mode
1. Go to Settings
2. Verify all text in English:
   - [ ] Language selector label
   - [ ] Theme toggle label
   - [ ] Notification settings label
   - [ ] All button labels
   - [ ] All descriptions

### Afaan Oromoo Mode
1. Switch to Oromo
2. Verify Settings page updates to Oromo:
   - [ ] Language label = "Afaan"
   - [ ] Settings title = "Qindaa'ina"
   - [ ] All options in Oromo
   - [ ] NO English text

**Result:** ✅ PASS / ❌ FAIL

---

## TEST 3: Prayer Journal Page Check

### English Mode
1. Open Prayer Journal
2. Verify all text in English:
   - [ ] "My Prayers" or equivalent
   - [ ] "Add Prayer" button
   - [ ] Prayer list labels
   - [ ] Filter buttons (Answered, Pending)
   - [ ] All instructions

### Afaan Oromoo Mode
1. Switch to Oromo
2. Verify Prayer Journal in Oromo:
   - [ ] Title = "Kadhannaa Koo" OR "Galmee Kadhannaa"
   - [ ] "Add" button = "Dabaluu"
   - [ ] Filter = "Deegame" / "Eegaa jira"
   - [ ] NO English words
   - [ ] NO undefined keys

**Result:** ✅ PASS / ❌ FAIL

---

## TEST 4: Bible Reader Page Check

### English Mode
1. Open Bible Reader
2. Check all text in English:
   - [ ] Book selector
   - [ ] Chapter selector
   - [ ] Bible text itself (should be same language)
   - [ ] Navigation buttons
   - [ ] Action buttons (bookmark, share, explain)

### Afaan Oromoo Mode
1. Switch to Oromo
2. Verify Bible Reader UI in Oromo:
   - [ ] "Bible" = "Macaafa Qulqulluu"
   - [ ] Search = "Barbaadi"
   - [ ] Bookmark = "Mallattoo godhi"
   - [ ] Share = "Qoodi"
   - [ ] Explain = "Ibsi"
   - [ ] Bible text stays in original language (English)
   - [ ] UI buttons only = Oromo

**Result:** ✅ PASS / ❌ FAIL

---

## TEST 5: Sermon Generator Page Check

### English Mode
1. Open Sermon Preparation
2. Verify all form labels in English:
   - [ ] Theme input label
   - [ ] Passage input label
   - [ ] Audience selector label
   - [ ] Style selector label
   - [ ] Generate button text
   - [ ] All instructions

### Afaan Oromoo Mode
1. Switch to Oromo
2. Verify form labels in Oromo:
   - [ ] Generate = "Uumi"
   - [ ] Regenerate = "Deebi'ii uumi"
   - [ ] NO English labels
   - [ ] Form inputs work in Oromo

**Result:** ✅ PASS / ❌ FAIL

---

## TEST 6: Error & Validation Messages Check

### English Mode
1. Try to submit empty form
2. Check error message is in English
3. Try invalid email
4. Check error message is in English

### Afaan Oromoo Mode
1. Switch to Oromo
2. Try to submit empty form
3. Error should be: "Kana barbaachisaa dha" (required field)
4. Try invalid email
5. Error should be: "Email dogoggora"
6. All validation in Oromo

**Result:** ✅ PASS / ❌ FAIL

---

## TEST 7: Buttons & Labels Consistency Check

### Oromo Mode - Verify ALL buttons use STANDARD terms:

| Page | Expected Term | Expected Text | Actual | ✅/❌ |
|------|---|---|---|---|
| Home | Back button | Duubatti deebi'i | | |
| Settings | Save | Kuusi | | |
| Prayer | Continue | Itti fufi | | |
| Bible | Share | Qoodi | | |
| Sermon | Cancel | Dhiisi | | |
| Community | Comment | Yaada kenni | | |

**Result:** ✅ ALL MATCH / ❌ MISMATCH FOUND

---

## TEST 8: Console Check (NO ERRORS)

### English Mode
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors/warnings
4. Should be CLEAN

### Afaan Oromoo Mode
1. Switch to Oromo
2. Reload page
3. Check Console again
4. Should be CLEAN (no undefined key errors)

**Expected:** No red errors  
**Check for:** No `undefined.something` messages

**Result:** ✅ CLEAN / ❌ ERRORS FOUND

---

## TEST 9: Key Phrases Check (EXACT MATCHES)

### Verify these key phrases are EXACT:

| Expected Phrase (Oromo) | Where it appears | Actual Text | ✅/❌ |
|---|---|---|---|
| Akkam Oolte | Home greeting | | |
| Haasaa kee guyyaa guyyaan Waaqayyo wajjiin godhu | Home subtitle | | |
| Itti fufuu kee | Streak display | | |
| Ayaata Guyyaa | Daily verse title | | |
| Amantii kee guddisaa | Motivation text | | |

**Result:** ✅ ALL EXACT / ❌ VARIATION FOUND

---

## TEST 10: Amharic Mode Check (SPOT CHECK)

1. Switch to Amharic
2. Spot check 3 random pages:
   - [ ] Home (no English text)
   - [ ] Settings (no English text)
   - [ ] Prayer (no English text)
3. No mixed languages

**Result:** ✅ CLEAN / ❌ MIXED FOUND

---

## FINAL GO/NO-GO DECISION

### ✅ PUBLISH IF:
- [ ] Test 1 PASS (Home page)
- [ ] Test 2 PASS (Settings)
- [ ] Test 3 PASS (Prayer)
- [ ] Test 4 PASS (Bible)
- [ ] Test 5 PASS (Sermon)
- [ ] Test 6 PASS (Errors)
- [ ] Test 7 PASS (Button terms)
- [ ] Test 8 PASS (Console clean)
- [ ] Test 9 PASS (Key phrases exact)
- [ ] Test 10 PASS (Amharic spot check)

### ❌ DO NOT PUBLISH IF:
- Any test shows ❌
- Any mixed languages found
- Any undefined keys in console
- Any button terms don't match STANDARD
- Any key phrase is worded differently

---

## Signature

**Tester Name:** ___________________  
**Date:** ___________________  
**Result:** ✅ APPROVED / ❌ NOT APPROVED  
**Issues Found:** _____________________  

**Comments:**
```
_________________________________
_________________________________
_________________________________
```

---

## If NOT Approved:

1. Document exact issue (page, text, expected)
2. Fix translation in code
3. Run checklist again
4. Get approval before publishing