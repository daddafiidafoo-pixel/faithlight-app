# FaithLight Tidio Support Flow - Builder Reference
**Use this while building in Tidio Dashboard → Chatbot → Node Builder**

---

## QUICK BUILD CHECKLIST
- [ ] Create Welcome + Language Choice (Entry Node)
- [ ] Build English Menu Branch (6 sections)
- [ ] Duplicate for Oromo Branch
- [ ] Duplicate for Amharic Branch
- [ ] Add Support Handoff Buttons throughout
- [ ] Test: Language selection → Menu → All paths

---

## ENTRY NODE (Greeting)

**Node Name:** Welcome  
**Trigger:** Visitor opens chat

```
Message:
Hi! 👋 Welcome to FaithLight Support.

I can help with:
📖 Bible reading
🔊 Audio Bible
🙏 My Prayers
🌍 Language issues
🔍 Finding verses

Choose your language:

Buttons:
[English] → English Menu
[Afaan Oromoo] → Oromo Menu  
[አማርኛ] → Amharic Menu
```

---

## ENGLISH BRANCH (Nodes 2-2F)

### Node 2: English Main Menu
```
Message: Welcome! What do you need help with?

Buttons:
[Bible Reading] → Node 2A
[Audio Bible] → Node 2B
[Find a Verse] → Node 2C
[My Prayers] → Node 2D
[Language Problem] → Node 2E
[Talk to Support] → Node 2F
```

### Node 2A: Bible Reading Help
```
Message:
If Bible chapters are not loading, try:
1. Refresh the page
2. Check internet
3. Switch language and switch back
4. Open another chapter
5. If Bible is unavailable, a translated fallback should appear

Buttons:
[Chapter not loading] → Node 2A1
[Wrong language Bible] → Node 2A2
[Go back] → Node 2
[Talk to Support] → Node 2F
```

**Node 2A1: Chapter Not Loading**
```
Message:
Make sure the selected language has a configured Bible version.
Try another chapter, reopen Reader, or return Home and try again.
If it continues, contact support with:
- selected language
- page name
- screenshot

Buttons:
[Go back] → Node 2A
[Talk to Support] → Node 2F
```

**Node 2A2: Wrong Language Bible**
```
Message:
Open language settings, reselect your language, return to Home or Reader, and refresh.
If the language is not fully configured, the app should show a translated fallback instead of English Bible text.

Buttons:
[Go back] → Node 2A
[Talk to Support] → Node 2F
```

### Node 2B: Audio Bible Help
```
Message:
Audio may not be available for all languages or chapters.

Try:
1. Check internet
2. Open another chapter
3. Switch language
4. Return to Audio page and try again

Buttons:
[Audio not available] → Node 2B1
[Audio does not play] → Node 2B2
[Go back] → Node 2
[Talk to Support] → Node 2F
```

**Node 2B1: Audio Not Available**
```
Message:
Some languages or chapters may not have audio yet.
Try another chapter first.
If still missing, contact support with language and chapter.

Buttons:
[Go back] → Node 2B
[Talk to Support] → Node 2F
```

**Node 2B2: Audio Does Not Play**
```
Message:
Refresh the page, check internet, open another chapter, or restart the app.
If it continues, contact support with language and chapter.

Buttons:
[Go back] → Node 2B
[Talk to Support] → Node 2F
```

### Node 2C: Find a Verse
```
Message:
To find a verse:
1. Open Search
2. Type a keyword, theme, or reference
3. Select a result
4. You can also link a verse to a prayer

Examples:
John 3:16, Hope, Peace, Psalm 23:1

Buttons:
[Search not working] → Node 2C1
[Link verse to prayer] → Node 2C2
[Go back] → Node 2
[Talk to Support] → Node 2F
```

**Node 2C1: Search Not Working**
```
Message:
Check internet, try a shorter keyword, try a direct reference like John 3:16, or refresh the page.

Buttons:
[Go back] → Node 2C
[Talk to Support] → Node 2F
```

**Node 2C2: Link Verse to Prayer**
```
Message:
Open a verse from Search or Reader, tap Link to Prayer, choose a prayer, and save.

Buttons:
[Go back] → Node 2C
[Talk to Support] → Node 2F
```

### Node 2D: My Prayers
```
Message:
To save a prayer:
1. Open My Prayers
2. Tap Add New Prayer
3. Write your prayer
4. Save it
5. Optionally link a verse
6. Later you can mark it answered

Buttons:
[How to add prayer] → Node 2D1
[How to link verse] → Node 2D2
[How to mark answered] → Node 2D3
[Go back] → Node 2
[Talk to Support] → Node 2F
```

**Node 2D1: How to Add Prayer**
```
Message:
Open My Prayers, tap Add New Prayer, enter title and prayer text, then save.

Buttons:
[Go back] → Node 2D
[Talk to Support] → Node 2F
```

**Node 2D2: How to Link Verse**
```
Message:
Open a verse, tap Link to Prayer, choose a prayer, and confirm.

Buttons:
[Go back] → Node 2D
[Talk to Support] → Node 2F
```

**Node 2D3: How to Mark Answered**
```
Message:
Open the prayer, tap Mark Answered, add an optional note, and save.

Buttons:
[Go back] → Node 2D
[Talk to Support] → Node 2F
```

### Node 2E: Language Problem
```
Message:
If the app is showing the wrong language:
1. Open language settings
2. Select your language again
3. Refresh the page
4. Reopen Home or Reader

If a Bible version is unavailable, a translated fallback should appear.

Buttons:
[Wrong text showing] → Node 2E1
[Bible still English] → Node 2E2
[Go back] → Node 2
[Talk to Support] → Node 2F
```

**Node 2E1: Wrong Text Showing**
```
Message:
Reselect your language, refresh the page, and reopen the page.
If it continues, tell support which page you were on.

Buttons:
[Go back] → Node 2E
[Talk to Support] → Node 2F
```

**Node 2E2: Bible Still English**
```
Message:
This usually means the selected language Bible source is missing or not fully configured yet.
Please send:
- selected language
- page name
- screenshot

Buttons:
[Go back] → Node 2E
[Talk to Support] → Node 2F
```

### Node 2F: Support Handoff
```
Message:
I can connect you with support.

Please send:
- selected language
- page name
- what went wrong
- screenshot if possible

Buttons:
[Start Live Chat] → Node 2F1
[Go back] → Node 2
```

**Node 2F1: Live Chat Start**
```
Message:
A support agent will help you as soon as possible. Please send the details in your next message.

[Enable Live Chat Handoff in Tidio]
```

---

## OROMO BRANCH (Nodes 3-3F)

**Copy structure from English, replace with Oromo text:**

### Node 3: Oromo Main Menu
```
Message: Baga nagaan dhuftan! Maal irratti gargaarsa barbaaddu?

Buttons:
[Dubbisa Macaafa Qulqulluu] → Node 3A (Bible Reading)
[Sagalee Macaafa Qulqulluu] → Node 3B (Audio Bible)
[Aayata Barbaaduu] → Node 3C (Find Verse)
[Kadhata Koo] → Node 3D (My Prayers)
[Rakkoo Afaanii] → Node 3E (Language Problem)
[Deeggarsa Waliin Haasa'i] → Node 3F (Support)
```

*Continue pattern for 3A–3F with Oromo text from reference...*

---

## AMHARIC BRANCH (Nodes 4-4F)

**Copy structure from English, replace with Amharic text:**

### Node 4: Amharic Main Menu
```
Message: እንኳን ደህና መጡ! በምን ልንረዳዎት?

Buttons:
[የመጽሐፍ ቅዱስ ንባብ] → Node 4A (Bible Reading)
[የድምጽ መጽሐፍ ቅዱስ] → Node 4B (Audio Bible)
[ጥቅስ ፈልግ] → Node 4C (Find Verse)
[ጸሎቶቼ] → Node 4D (My Prayers)
[የቋንቋ ችግር] → Node 4E (Language Problem)
[ከድጋፍ ጋር ተነጋገር] → Node 4F (Support)
```

*Continue pattern for 4A–4F with Amharic text from reference...*

---

## GLOBAL RULES (Apply Everywhere)

✅ **Use buttons as much as possible** — minimize free text input  
✅ **Keep messages short** — 2-3 sentences max  
✅ **Always offer support handoff** — Every troubleshooting path has Talk to Support button  
✅ **Never invent Bible verses** — Defer to actual app behavior  
✅ **Never promise unsupported languages** — Show "not yet available"  
✅ **Never promise audio exists** — Say "may not be available for all chapters"  
✅ **Reply in chosen language** — Don't mix languages in a branch  
✅ **Every path leads back or to support** — No dead ends  

---

## BUILD NOTES

**Node Naming Convention:**
- `Welcome` — Entry
- `English Menu` → Main menu for English
- `English - Bible Reading` → Submenu
- `English - Bible Reading - Chapter Not Loading` → Leaf node
- Same pattern for Oromo (prefix `Oromo`) and Amharic (prefix `Amharic`)

**Button Routing:**
- Always include "Go back" to parent menu
- Support button goes to support handoff (same node for all languages)
- Live Chat node triggers Tidio handoff

**Testing Checklist:**
- [ ] Click Welcome → Language choice shows all 3 languages
- [ ] English choice → English Menu loads
- [ ] Oromo choice → Oromo Menu loads (all text in Oromo)
- [ ] Amharic choice → Amharic Menu loads (all text in Amharic)
- [ ] Every submenu has "Go back" and "Talk to Support"
- [ ] No grammatical errors in any language
- [ ] All buttons are clickable
- [ ] Live Chat handoff works

---

## QUICK REFERENCE: Full Node List

```
Welcome
├── English Menu (2)
│   ├── Bible Reading (2A)
│   │   ├── Chapter Not Loading (2A1)
│   │   └── Wrong Language Bible (2A2)
│   ├── Audio Bible (2B)
│   │   ├── Audio Not Available (2B1)
│   │   └── Audio Doesn't Play (2B2)
│   ├── Find Verse (2C)
│   │   ├── Search Not Working (2C1)
│   │   └── Link to Prayer (2C2)
│   ├── My Prayers (2D)
│   │   ├── How to Add (2D1)
│   │   ├── How to Link (2D2)
│   │   └── How to Mark Answered (2D3)
│   ├── Language Problem (2E)
│   │   ├── Wrong Text (2E1)
│   │   └── Bible Still English (2E2)
│   └── Support (2F → 2F1 Live Chat)
├── Oromo Menu (3) [Same structure as 2, Oromo text]
│   ├── 3A, 3B, 3C, 3D, 3E, 3F (→ Live Chat)
└── Amharic Menu (4) [Same structure as 2, Amharic text]
    ├── 4A, 4B, 4C, 4D, 4E, 4F (→ Live Chat)

Total: 1 Welcome + (3 menus × 22 nodes) = ~67 nodes
```

---

**Build tip:** Start with English fully, then duplicate & translate. Tidio may have bulk copy features.