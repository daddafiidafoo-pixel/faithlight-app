# Native-Like Feel Improvements

## Overview
This update enhances FaithLight with smooth page transitions, mobile-first Bottom Sheet selects, and comprehensive accessibility improvements.

## 1. Page Slide Transitions

### Implementation
- **Component:** `PageTransition.jsx`
- **Technology:** Framer Motion
- **Behavior:** Slides pages in from the right (x: 20) and out to the left (x: -20) with a smooth 0.3s easing transition

### Usage
All routes now automatically wrap with `<PageTransition>` in `App.jsx`. No additional setup required.

```jsx
<PageTransition>
  <YourPage />
</PageTransition>
```

## 2. Bottom Sheet Mobile Select Component

### Components
- **`BottomSheet.jsx`** - Animated bottom sheet modal with smooth slide-up/slide-down
- **`AccessibleSelect.jsx`** - Smart mobile/desktop wrapper around native select

### Features
- **Mobile (< 768px):** Shows Bottom Sheet with full-height options
- **Desktop (≥ 768px):** Uses native HTML `<select>` for better desktop UX
- **Responsive:** Auto-detects viewport and switches on resize
- **Accessible:** 44px+ min-height, full keyboard support, proper ARIA labels

### Usage
```jsx
import { AccessibleSelect } from '@/components/ui/accessible-select';

<AccessibleSelect
  value={value}
  onValueChange={setValue}
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ]}
  label="Select something"
  placeholder="Choose..."
/>
```

### Migration Example
**Before (Native Select):**
```jsx
<select value={lang} onChange={(e) => setLang(e.target.value)}>
  <option value="en">English</option>
  <option value="om">Oromo</option>
</select>
```

**After (Accessible Mobile-First):**
```jsx
<AccessibleSelect
  value={lang}
  onValueChange={setLang}
  options={[
    { value: 'en', label: 'English' },
    { value: 'om', label: 'Oromo' },
  ]}
  label="Language"
/>
```

## 3. Accessibility Improvements

### A11y Wrapper (`A11yWrapper.jsx`)
Wraps the entire app with accessibility enhancements:

#### Skip to Content Link
- **What it does:** Allows keyboard users to jump directly to main content, bypassing navigation
- **Behavior:** Hidden by default, visible on Tab key focus
- **CSS:** `.skip-to-content` in `globals.css`
- **Focus state:** Bold white outline with clear visual feedback

#### Main Content Focus Management
- Ensures main content is properly focused after skip link activation
- Smooth scroll to content area
- Proper tabindex management

### Focus Indicators
All interactive elements now have clear focus-visible states:
- **Outline:** 2px or 3px solid blue (#3B82F6)
- **Offset:** 2-3px for visual clarity
- **Consistency:** Applied to buttons, links, inputs, and custom components

### Minimum Touch Targets
All interactive elements enforce 44px minimum height/width:
- Buttons
- Links
- Form inputs (select, text, etc.)
- Custom components (BottomSheet triggers)

### Nested Interactive Element Fixes
- ✅ Removed nested `<button>` inside `<a>` tags
- ✅ Proper semantic HTML structure
- ✅ Role attributes where needed
- ✅ ARIA labels on all custom controls

## 4. Implementation Checklist for Migration

When updating existing components to use new features:

### For any `<select>` element:
- [ ] Replace with `<AccessibleSelect />`
- [ ] Convert options array format
- [ ] Test on mobile and desktop

### For page routes:
- [ ] Verify PageTransition wrapping (should be automatic in App.jsx)
- [ ] Test transition animations

### For interactive elements:
- [ ] Check min-height is 44px
- [ ] Verify focus-visible styling
- [ ] Test keyboard navigation

### For skip link:
- [ ] Tab to page and verify link appears
- [ ] Click/Enter should jump to main content
- [ ] No further setup needed (automatic)

## 5. Browser & Device Testing

### Keyboard Navigation
- Press `Tab` to navigate
- Press `Enter/Space` on buttons
- Press `Escape` to close modals
- `Skip to content` should appear on first Tab

### Mobile Testing
- Test on actual devices (iOS Safari, Chrome Android)
- Verify Bottom Sheet touch interactions
- Check safe area padding (env(safe-area-inset-*))

### Accessibility Tools
- WAVE browser extension
- axe DevTools
- NVDA (Windows) / JAWS (Windows) / VoiceOver (Mac)

## 6. CSS Variables & Styling

### Accessibility CSS
```css
/* 44px minimum touch target */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Clear focus state */
:focus-visible {
  outline: 3px solid #3B82F6;
  outline-offset: 3px;
  border-radius: 6px;
}

/* Skip link */
.skip-to-content:focus {
  top: 1rem;
}
```

## 7. Performance Notes

- **Page Transitions:** Hardware-accelerated with CSS transforms (x, opacity)
- **Bottom Sheet:** Uses CSS containment for smooth animations
- **Accessibility:** Zero performance impact—semantic HTML only
- **Bundle Size:** ~2KB gzipped for new components

## 8. Future Enhancements

- Haptic feedback on mobile (vibration on tap)
- Gesture support (swipe to close Bottom Sheet)
- Voice navigation support
- Dark mode bottom sheet styling
- More animated transitions (scale, rotate, etc.)