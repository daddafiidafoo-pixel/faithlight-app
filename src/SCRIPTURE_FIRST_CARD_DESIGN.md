# Scripture-First Card Design System

## Overview

FaithLight uses a **Scripture-First Card Layout** across all screens to create a premium, calm, focused experience. This design pattern is the core visual identity of the app.

Instead of list-based layouts, every major piece of content appears in elegant cards with generous spacing and clear hierarchy.

---

## Core Components

### 1. **ScriptureCard** (`components/cards/ScriptureCard.jsx`)
For individual verses with explanation, reflection, and prayer.

**Usage:**
```jsx
<ScriptureCard
  reference="John 3:16"
  verseText="For God so loved the world..."
  explanation="God's love is shown through Jesus."
  reflection="Where have you seen God's love today?"
  prayer="Lord, help me remember your love."
  onBookmark={() => {}}
  onShare={() => {}}
  onUnderstand={() => {}}
/>
```

**Features:**
- Large, readable verse text (20–22px)
- Clear section dividers
- Minimal action icons
- "Understand" button for contextual learning

---

### 2. **DailyDevotionCardPremium** (`components/cards/DailyDevotionCardPremium.jsx`)
For daily devotionals with gradient header and reflection prompts.

**Usage:**
```jsx
<DailyDevotionCardPremium
  verse="1 John 4:7"
  title="Love One Another"
  explanation="Jesus teaches us to love as He loves us."
  reflectionQuestion="How can you show love to someone today?"
  prayer="Help me love with Your heart, Lord."
  onShare={() => {}}
  onBookmark={() => {}}
  onReadMore={() => {}}
/>
```

**Features:**
- Gradient header with verse context
- Yellow reflection section (stands out)
- Blue prayer section (calming)
- Clear call-to-action button

---

### 3. **ScriptureCenteredLayout** (`components/home/ScriptureCenteredLayout.jsx`)
Wrapper that applies premium spacing and background across entire screen.

**Usage:**
```jsx
<ScriptureCenteredLayout>
  <ScriptureCard ... />
  <DailyDevotionCardPremium ... />
  <ScriptureCard ... />
</ScriptureCenteredLayout>
```

**Features:**
- Gradient background (gray to blue)
- Max-width container (centered)
- Consistent spacing between cards
- Mobile-responsive padding

---

## Design Principles

### Spacing System
```
Card padding (internal):        24px–32px
Spacing between cards:           24px–32px
Top/bottom screen padding:       32px–48px
Section dividers inside cards:   24px
```

### Typography Hierarchy
```
Verse text:           20–22px, italic, centered
Card titles:          20px–24px, bold
Section headings:     14–16px, uppercase, bold
Body text:            16px, regular, centered line-height 1.6
```

### Colors & Contrast
```
Card background:      White (#FFFFFF)
Screen background:    Warm light gray → Blue gradient
Section highlights:   Yellow (reflection), Blue (prayer)
Text primary:         Dark gray (#1F2937)
Text secondary:       Medium gray (#6B7280)
Action buttons:       Purple (#6C5CE7)
```

### Shadows & Elevation
```
Card shadow:          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
Card hover shadow:    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1)
Subtle lift on hover: transform: translateY(-2px)
```

---

## Where to Apply This Pattern

### ✅ Home Screen
- Verse of the Day Card
- Daily AI Devotion Card
- Continue Reading Card
- Prayer Reminder Card

### ✅ Bible Reader
- Verse explanation cards
- "Understand This Verse" modal (clean card design)

### ✅ Prayer Journal
- Prayer entry cards
- Reflection history cards

### ✅ Verse Cards
- Shareable verse image cards
- Styled with same design system

### ✅ AI Hub
- AI explanation results
- Prayer suggestions

---

## Implementation Steps

### Step 1: Wrap Screen in Layout
```jsx
import ScriptureCenteredLayout from '@/components/home/ScriptureCenteredLayout';

export default function Home() {
  return (
    <ScriptureCenteredLayout>
      {/* Card content goes here */}
    </ScriptureCenteredLayout>
  );
}
```

### Step 2: Replace List Items with Cards
**Before (list):**
```jsx
<div className="list">
  <div>John 3:16</div>
  <p>Verse text here</p>
</div>
```

**After (card):**
```jsx
<ScriptureCard
  reference="John 3:16"
  verseText="Verse text here"
  explanation="..."
  onUnderstand={handleUnderstand}
/>
```

### Step 3: Customize as Needed
Cards are fully composable. Mix and match sections:

```jsx
<ScriptureCard
  reference="Romans 8:28"
  verseText="And we know that in all things..."
  explanation="God works through all circumstances."
  // Skip reflection, add prayer instead:
  prayer="Help me trust Your plan, Lord."
  onBookmark={handleBookmark}
  // No explain button needed for this card
/>
```

---

## Premium Details (Optional But Recommended)

### Smooth Transitions
Cards use `transition: box-shadow 200ms ease, transform 200ms ease` for smooth hover effects.

### Gradient Backgrounds
Home screen uses `bg-gradient-to-b from-gray-50 via-white to-blue-50` for a calm, flowing feel.

### Animations
- Cards fade in smoothly when page loads
- Hover lift (2px up) on desktop
- No animation on mobile (respects reduced motion)

### Accent Colors
- Yellow (#FCD34D) for reflection prompts
- Blue (#60A5FA) for prayer sections
- Purple (#6C5CE7) for action buttons

---

## Mobile Responsiveness

All cards are fully responsive:
- **Mobile:** Single column, 16px padding
- **Tablet:** Single column, 24px padding
- **Desktop:** Single column (max 768px), centered

Card text scales gracefully:
- Verse text: 18px on mobile → 22px on desktop
- Section text: 14px on mobile → 16px on desktop

---

## Quick Checklist for New Screens

- [ ] Wrap content in `<ScriptureCenteredLayout>`
- [ ] Replace list items with `<ScriptureCard>` or `<DailyDevotionCardPremium>`
- [ ] Ensure verse text is the visual centerpiece
- [ ] Include only necessary action buttons (Bookmark, Share, Understand)
- [ ] Add section highlights (yellow for reflection, blue for prayer)
- [ ] Test on mobile for readability

---

## Why This Approach Works for FaithLight

1. **Calm Experience:** Generous spacing = peaceful reading
2. **Focused Content:** Cards isolate content = less cognitive load
3. **Premium Feel:** Premium apps use cards (Apple, Calm, Headspace)
4. **Accessibility:** Large text, clear contrast, good spacing
5. **Shareability:** Each card is a self-contained unit ready to share
6. **Consistency:** Same design across entire app = professional

This is the core identity of FaithLight: **Read → Understand → Reflect → Pray**

The card system makes that journey visual and intentional.