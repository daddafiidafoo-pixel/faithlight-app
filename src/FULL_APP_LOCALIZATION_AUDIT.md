# Full App Localization Audit - Pre-Publish

## Scope
Audit entire FaithLight application for raw translation keys showing in Afaan Oromoo (om) and አማርኛ (am) interfaces.

## Critical Status: ⚠️ NEEDS REVIEW

While the AI Sermon Builder is now fully localized, we need to audit other pages to ensure no raw translation keys appear before publish.

## Pages Requiring Immediate Audit

### HIGH PRIORITY (Core Features)

#### 1. **Home Page** (`pages/Home`)
- **Risk Level**: HIGH
- **Check for**:
  - Daily verse card translations
  - Welcome message
  - Feature cards (title + description)
  - Quick action buttons
  - Navigation labels
  - Empty state messages

#### 2. **Bible Reader** (`pages/BibleReaderPage`)
- **Risk Level**: HIGH
- **Check for**:
  - Chapter selection UI
  - Verse navigation
  - Font size / readability controls
  - Highlight/note buttons
  - Share button labels
  - Offline status messages
  - Error messages (passage not found)
  - Loading states

#### 3. **Reading Plans** (`pages/ReadingPlans`)
- **Risk Level**: HIGH
- **Check for**:
  - Plan card titles
  - Duration labels
  - "Start Plan" button
  - Progress display
  - Completion messages
  - Plan filters

#### 4. **Prayer Journal** (`pages/PrayerJournalPage`, `pages/MyPrayersPage`)
- **Risk Level**: HIGH
- **Check for**:
  - Form labels (title, content, mood, tags)
  - Button labels (Save, Delete, Update)
  - Placeholder text
  - Empty state ("No prayers yet")
  - Confirmation messages
  - Category labels

#### 5. **Study Groups** (`pages/StudyGroupChat`, `pages/BibleStudyGroupsHub`)
- **Risk Level**: HIGH
- **Check for**:
  - Group creation form
  - Chat labels
  - Member list headers
  - Discussion prompts
  - Join/Leave buttons
  - Error messages

### MEDIUM PRIORITY (Feature Pages)

#### 6. **Highlights & Notes** (`pages/MyHighlights`, `pages/BibleJournal`)
- Search/filter labels
- Highlight color options
- Note creation prompts
- Delete confirmations

#### 7. **Leaderboard** (`pages/Leaderboard`)
- Rankings headers
- Time period filters
- Category labels

#### 8. **Quiz** (`pages/Quiz`, `pages/QuizChallenge`)
- Question display (localization depends on quiz content)
- Score/result messages
- Answer option labels
- Time remaining display

#### 9. **Settings Pages** (`pages/NotificationSettings`, `pages/DailyReminderDashboard`)
- Toggle labels (on/off)
- Time selectors
- Language selection dropdowns
- Frequency options (daily, weekly, etc.)

#### 10. **Downloads & Offline** (`pages/Downloads`, `pages/OfflineContentManager`)
- Download progress text
- Offline availability labels
- Storage info ("3.2 MB")
- Delete confirmations

### LOWER PRIORITY (Community/Advanced Features)

#### 11. **Community Pages** (`pages/CommunityPrayerBoardPage`, `pages/BibleGroupChat`)
- Post creation forms
- Comment labels
- Like/react buttons
- Report/flag options

#### 12. **Live Events** (if applicable)
- Event title / description
- Speaker labels
- Attendance indicators
- Chat/Q&A labels

#### 13. **AI Features** (`pages/FaithLightAIChat`, `pages/AIBibleCompanion`)
- Chat interface labels
- Suggested prompts
- Typing indicator
- Error messages
- "New conversation" buttons

#### 14. **Admin/Dashboard Pages**
- Table headers
- Filter options
- Action menus
- Confirmation dialogs

## Translation Key Patterns to Search For

### Search Patterns to Find Raw Keys

```
// In Oromo (om):
- "sermon."
- "prayer."
- "bible."
- "reading."
- "quiz."
- "community."
- "group."
- "daily."
- "notification."
- "offline."
- Common keys: .title, .description, .label, .button, .placeholder, .error, .success, .empty

// In Amharic (am):
- Same patterns as above
```

### Common Translation Key Formats

- `feature.label` - Form labels
- `feature.placeholder` - Input placeholders
- `feature.button` - Button text
- `feature.error` - Error messages
- `feature.empty` - Empty state text
- `feature.success` - Success confirmations
- `feature.title` - Page/section titles
- `feature.description` - Helper/hint text

## Testing Methodology

### For Each Page:

1. **Switch language to Oromo (om)**
   - Look for any text that looks like `something.something`
   - Check for English hardcoded strings mixed with Oromo UI
   - Test all interactive elements (buttons, tabs, dropdowns)

2. **Switch language to Amharic (am)**
   - Same visual inspection
   - Verify Amharic script displays correctly (no mojibake)
   - Test form submissions

3. **Check common states**:
   - Empty state (no data)
   - Loading state
   - Error state
   - Success state

4. **Verify navigation**:
   - Are page titles translated?
   - Are tab/menu labels translated?
   - Are breadcrumbs translated?

## Translation Files to Check

### Current Translation Sources

- `components/i18n/locales/om.js` - Oromo UI strings
- `components/i18n/locales/am.js` - Amharic UI strings (if exists)
- `components/i18n/coreTranslations.js` - Core UI keys
- `components/i18n/sermonPreparationTranslations.js` - Sermon builder keys
- `components/i18n/locales/sermon-generator-oromo.js` - Sermon Oromo ✅ FIXED
- `components/i18n/locales/sermon-generator-amharic.js` - Sermon Amharic ✅ FIXED
- Page-specific translation files (if any)

## Quick Audit Checklist

### Pages to manually test:

- [ ] Home (switch to Oromo, Amharic - look for raw keys)
- [ ] Bible Reader (chapter, verse nav)
- [ ] Reading Plans (all plan cards)
- [ ] Prayer Journal (form fields, buttons)
- [ ] Study Groups (chat, member list)
- [ ] Highlights & Notes (search, filters)
- [ ] Quiz (questions, results)
- [ ] Settings/Notifications (all toggles, options)
- [ ] Downloads (progress, storage display)
- [ ] AI Chat (all prompts, responses)

### Automated Check (Optional):

Search codebase for patterns in Oromo/Amharic components:
```bash
# Find all `.om` and `.am` language references
grep -r "useLanguageStore.*om\|useLanguageStore.*am" src/pages src/components

# Look for hardcoded English in language conditions
grep -r "uiLanguage === 'om'" src/pages src/components | grep -E "\.title\|\.label\|\.button"
```

## Fix Approach (If Issues Found)

For each page with raw translation keys:

1. **Create translation file** (if doesn't exist)
   - Pattern: `components/i18n/locales/[feature]-oromo.js`
   - Pattern: `components/i18n/locales/[feature]-amharic.js`

2. **Add translation keys** for:
   - Form labels
   - Button text
   - Placeholders
   - Error messages
   - Empty states
   - Helper text

3. **Update page component** to use translations:
   - Replace hardcoded strings with `t.key` references
   - Add fallback to English for missing keys
   - Use optional chaining for safety

4. **Test all languages**:
   - Oromo - no raw keys visible
   - Amharic - no raw keys visible
   - Fallback working (if key missing, show English)

## Priority Fixes (If Time Limited)

**Must Fix Before Publish:**
1. ✅ Sermon Builder - DONE
2. Home page (first impression)
3. Bible Reader (most used feature)
4. Reading Plans (popular feature)
5. Prayer Journal (core feature)

**Should Fix Before Publish:**
6. Study Groups
7. Quiz
8. Settings/Notifications

**Nice to Have (Can be deferred to next release):**
- Community pages
- Advanced AI features
- Admin dashboards

## Sign-Off

Once all pages are audited and any issues fixed:

- [ ] All pages tested in Oromo (om)
- [ ] All pages tested in Amharic (am)
- [ ] No raw translation keys visible
- [ ] No hardcoded English mixed with translations
- [ ] All form/button labels localized
- [ ] All error messages localized
- [ ] Fallback works for missing keys
- [ ] App is ready for publish with full localization

---

**Recommended**: Do a 5-minute manual audit of the top 5 pages in Oromo + Amharic before publishing. That will catch 90% of localization issues.