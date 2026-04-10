# Quick Reference: New Components

## PageTransition
**File:** `components/PageTransition.jsx`

Automatically wraps pages for smooth slide animations between routes.

```jsx
// Already applied in App.jsx routes
// No manual setup needed!
```

---

## AccessibleSelect
**File:** `components/ui/accessible-select.jsx`

Replace all HTML `<select>` with this for mobile-first experience.

```jsx
import { AccessibleSelect } from '@/components/ui/accessible-select';

<AccessibleSelect
  value={selectedValue}
  onValueChange={(newValue) => setSelectedValue(newValue)}
  options={[
    { value: 'en', label: 'English' },
    { value: 'om', label: 'Oromo' },
    { value: 'am', label: 'Amharic' },
  ]}
  label="Choose Language"
  placeholder="Select a language"
  disabled={false}
  name="language"
/>
```

**Props:**
- `value` (string) - Current selected value
- `onValueChange` (function) - Called when selection changes
- `options` (array) - Array of `{ value, label }` objects
- `label` (string, optional) - Input label
- `placeholder` (string, optional) - Placeholder text
- `disabled` (boolean, optional) - Disable select
- `name` (string, optional) - Form field name
- `className` (string, optional) - Container classes

---

## BottomSheet
**File:** `components/ui/bottom-sheet.jsx`

Low-level modal component. Use `AccessibleSelect` unless you need custom content.

```jsx
import { BottomSheet, BottomSheetTrigger } from '@/components/ui/bottom-sheet';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <BottomSheetTrigger onClick={() => setIsOpen(true)}>
        Open Sheet
      </BottomSheetTrigger>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Sheet Title"
      >
        <div>Your custom content here</div>
      </BottomSheet>
    </>
  );
}
```

**Props:**
- `isOpen` (boolean) - Control visibility
- `onClose` (function) - Called when user closes
- `title` (string) - Header title
- `children` (ReactNode) - Sheet content
- `className` (string, optional) - Custom classes

---

## A11yWrapper
**File:** `components/A11yWrapper.jsx`

Already applied in `App.jsx`. Provides:
- Skip to content link (visible on Tab)
- Main content focus management
- Semantic structure

No manual setup needed!

---

## Focus Styling

All interactive elements have automatic focus styles:

```css
:focus-visible {
  outline: 3px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 6px;
}
```

Applies to:
- ✅ Buttons
- ✅ Links
- ✅ Text inputs
- ✅ Selects
- ✅ Custom components

---

## Touch Target Sizing

Minimum 44×44px for all interactive elements. Automatically enforced on:
- Buttons (button, [role="button"])
- Links (a)
- Form inputs
- BottomSheet triggers

---

## Migration Checklist

### Find all `<select>` tags:
```bash
grep -r "<select" src/
```

### Replace with:
```jsx
import { AccessibleSelect } from '@/components/ui/accessible-select';

// Change this:
// <select value={x} onChange={(e) => setX(e.target.value)}>
//   <option value="a">A</option>
// </select>

// To this:
<AccessibleSelect
  value={x}
  onValueChange={setX}
  options={[{ value: 'a', label: 'A' }]}
/>
```

### Test on:
- [ ] Desktop Chrome/Firefox
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android
- [ ] Keyboard navigation (Tab)
- [ ] Screen reader (VoiceOver/NVDA)

---

## Accessibility Features Summary

| Feature | Implementation | Status |
|---------|-----------------|--------|
| Skip to Content | `.skip-to-content` link | ✅ Auto |
| Focus Indicators | `:focus-visible` styling | ✅ Auto |
| Touch Targets | 44px min-height/width | ✅ Enforced |
| Semantic HTML | Main role, proper nesting | ✅ Auto |
| ARIA Labels | All custom controls | ✅ Included |
| Keyboard Navigation | Tab, Enter, Escape | ✅ Full support |
| Motion Preferences | Page transitions smooth | ✅ Uses transform/opacity |

---

## Troubleshooting

**Bottom Sheet not appearing?**
- Check `isOpen` state is true
- Verify `onClose` handler resets state

**Select not responsive?**
- Check viewport width detection
- Try forcing mobile: `window.innerWidth = 400` in dev tools

**Focus outline not visible?**
- Ensure `outline: none` isn't being overridden
- Check for conflicting focus styles

**Skip link not appearing?**
- Press Tab key from page start
- Check z-index layering if hidden

---

## Files Modified

1. `App.jsx` - Added PageTransition & A11yWrapper wrapping
2. `globals.css` - Enhanced skip-to-content styling
3. Created: `components/PageTransition.jsx`
4. Created: `components/A11yWrapper.jsx`
5. Created: `components/ui/bottom-sheet.jsx`
6. Created: `components/ui/accessible-select.jsx