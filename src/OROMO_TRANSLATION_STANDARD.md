# 📘 Afaan Oromoo Translation Standard (NON-NEGOTIABLE)

This document ensures consistency across all Oromo translations in FaithLight.

---

## 🚨 GOLDEN RULE

**NEVER change wording randomly.** Use ONLY these standard terms. Consistency = professionalism.

---

## 📑 Standard Terms (Locked In)

### General UI
| English | Afaan Oromoo | Context | Notes |
|---------|--------------|---------|-------|
| Home | Mana | Main navigation | Main page label |
| Bible | Macaafa Qulqulluu | Bible reader | Sacred scripture |
| Search | Barbaadi | Search bar | Finding content |
| Settings | Qindaa'ina | Settings page | Configuration |
| Language | Afaan | Language selector | Choose language |
| Save | Kuusi | Save button | Store data |
| Cancel | Dhiisi | Cancel button | Exit action |
| Continue | Itti fufi | Next/proceed button | Move forward |
| Back | Duubatti deebi'i | Back button | Return |
| Loading | Fidaa jira | Loading spinner | In progress |
| Error | Dogoggora | Error message | Something went wrong |
| Retry | Deebi'ii yaali | Retry button | Try again |
| Close | Chuudhi | Close button | Dismiss |
| Share | Qoodi | Share action | Spread content |
| Delete | Balleessi | Delete action | Remove permanently |
| Edit | Gumaachi | Edit action | Modify content |
| Done | Xumame | Completion | Finished |
| Clear | Qulqulleessi | Clear action | Empty/reset |

### Spiritual / Core Features
| English | Afaan Oromoo | Context | Notes |
|---------|--------------|---------|-------|
| Prayer | Kadhannaa | Prayer feature | Talking to God |
| Prayer Journal | Galmee Kadhannaa | Journal section | Record prayers |
| Daily Verse | Ayaata Guyyaa | Daily content | One verse/day |
| Reading Plan | Karoora Dubbisaa | Reading schedule | Structured study |
| Highlights | Mallattoo | Marked text | Important verses |
| Bookmark | Mallattoo godhi | Save location | Quick reference |
| Explain | Ibsi | Understanding verse | Get meaning |
| Reflection | Yaada | Think/meditate | Personal thoughts |
| Scripture | Seera Qulqulluu | Bible text | Holy word |
| Devotional | Kadhannaa Guyyaa | Daily devotion | Spiritual practice |

### Audio Features
| English | Afaan Oromoo | Context | Notes |
|---------|--------------|---------|-------|
| Listen | Dhaggeeffadhu | Audio action | Hear content |
| Pause | Dhaabi | Stop playing | Audio control |
| Play | Taphachiisi | Start playing | Audio control |
| Download | Buusi | Save offline | Offline access |
| Downloaded | Buufame | Saved offline | Past tense |
| Play Offline | Offline taphachiisi | Play without internet | Offline feature |
| Speed | Saffisa | Playback speed | Audio adjustment |
| Audio Failed | Taphannaan sagalee hin milkoofne | Error message | Audio error |

### AI Features
| English | Afaan Oromoo | Context | Notes |
|---------|--------------|---------|-------|
| AI Bible Guide | Gorsa Macaafa Qulqulluu AI | AI explanation tool | Ask questions |
| Generate | Uumi | Create content | Make sermon |
| Regenerate | Deebi'ii uumi | Create again | Try new version |
| Translate | Hiiki | Convert to language | Multi-language |
| Summary | Gabaabina | Brief version | Condensed content |
| Ask AI | AI gafadhu | Query AI | Ask question |

### Community / Social
| English | Afaan Oromoo | Context | Notes |
|---------|--------------|---------|-------|
| Community | Hawaasa | User group | Social feature |
| Post | Maxxansi | Create update | Share news |
| Comment | Yaada kenni | Reply to post | Respond |
| Like | Jaalladhu | Show appreciation | Positive reaction |
| Reply | Deebii kenni | Answer comment | Respond directly |
| Friends | Hiriyoota | Connected users | Relationships |
| Follow | Duukaa buusi | Keep updated | Track user |

### Key Phrases (NEVER CHANGE)
| English | Afaan Oromoo | Use Case | Exact Match |
|---------|--------------|----------|------------|
| Good Afternoon | Akkam Oolte | Greeting | Must match exactly |
| Your daily walk with God | Haasaa kee guyyaa guyyaan Waaqayyo wajjiin godhu | Home greeting | Must match exactly |
| Current Streak | Itti fufuu kee | Streak display | Must match exactly |
| Verse of the Day | Ayaata Guyyaa | Daily verse title | Must match exactly |
| Explain this verse | Ayaata kana ibsi | AI button | Must match exactly |
| Grow your faith | Amantii kee guddisaa | Motivation | Must match exactly |
| Share the Word | Dubbii Waaqayyoo qoodi | Call to action | Must match exactly |

---

## ✅ Quality Assurance Checklist

Before deploying ANY Oromo content:

- [ ] Every term matches table above (EXACTLY)
- [ ] No English words mixed in
- [ ] No random variations of same term
- [ ] All buttons/labels use standard terms
- [ ] Error messages use standard Oromo
- [ ] Modal titles use standard terms
- [ ] Placeholders use standard terms
- [ ] Validation messages in Oromo

---

## 🚫 What NOT to Do

❌ **DO NOT:**
- Change "Kadhannaa" to "Walaala" (use Kadhannaa always)
- Use "Baruu" for Bible (use Macaafa Qulqulluu)
- Vary between "Dubbii" and "Seera" (pick one: Seera Qulqulluu)
- Add English: "Kadhannaa (Prayer Journal)" ← WRONG
- Translate mid-sentence: "Kadhannaa Guyyaa waa" ← BAD
- Create new words: "Sagalee AI" ← WRONG (use Gorsa Macaafa Qulqulluu AI)

✅ **DO:**
- Use table above for EVERY term
- Keep same term across entire app
- Use full phrase, not abbreviation
- Test in UI before deploying
- Document any NEW terms in this file

---

## 🔧 If You Need a New Term

1. **Document it here first** in this file
2. **Get pronunciation correct** (ask native speaker)
3. **Use it consistently** everywhere
4. **Add to translation file** (om-STANDARD.json)
5. **Test in UI** before pushing

---

## 📋 Translation Audit Template

Run this before every release:

```
Audit Date: ___________
Auditor: ___________

Pages Checked:
- [ ] Home page (all Oromo)
- [ ] Settings (all Oromo)
- [ ] Prayer Journal (all Oromo)
- [ ] Bible Reader (all Oromo)
- [ ] AI features (all Oromo)
- [ ] Community (all Oromo)
- [ ] Modals/pop-ups (all Oromo)
- [ ] Error messages (all Oromo)
- [ ] Buttons (all Oromo)

Quality Checks:
- [ ] No English text showing
- [ ] No mixed languages
- [ ] No "undefined" keys
- [ ] All terms match standard table
- [ ] Grammar is correct
- [ ] Spacing/formatting looks good

Issues Found:
1. _________________
2. _________________
3. _________________

Status: ✅ PASS / ❌ FAIL

Comments:
_________________________
```

---

## 🎯 Final Rule

> If you ever see Oromo text that's NOT in this document, it's WRONG.
> Check this file first. Always.

**Version:** 1.0  
**Last Updated:** 2026-03-26  
**Locked Until:** Release