# 🎨 FaithLight App Icon Specification

## Overview
**Goal:** Create a trustworthy, spiritual app icon that converts users in 5 seconds.

---

## Design Brief

### Core Concept
A **dark background** with a **glowing cross** or **open Bible** centered, radiating soft **golden light**. Minimalist, modern, inviting.

### Psychology
- **Dark background** = Trust, professionalism (tech/finance apps use this)
- **Glow/light** = Spirituality, hope, guidance
- **Cross/Bible** = Clear Christian identity
- **Minimal design** = Premium feel, not cluttered

---

## Technical Specs

### Sizes Required
| Size | Usage |
|------|-------|
| **1024×1024px** | Master design (highest quality) |
| **512×512px** | Large tile (Android) |
| **256×256px** | Medium tile |
| **192×192px** | App launcher (Android) |
| **180×180px** | App launcher (iOS) |
| **120×120px** | Spotlight search (iOS) |
| **60×60px** | iPhone 2x (smallest) |

**Rule:** Design at 1024px, then scale down. Never resize from small to large.

---

## Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Dark Slate | `#0f172a` | Background |
| Indigo | `#6c5ce7` | Primary glow/cross |
| Golden | `#f4b400` | Light rays/accent |
| White | `#ffffff` | Cross/Bible edge |

### Gradients
```
Background: Linear gradient from #0f172a → #1a2332 (dark to slightly lighter)
Glow: Radial gradient #f4b400 (center) → transparent (edges)
```

---

## Design Options (Choose 1)

### Option A: Glowing Cross ⛪
```
1. Dark slate background (full coverage)
2. Simple geometric cross in white (70% opacity)
3. Indigo glow behind cross (soft shadow)
4. Golden light rays radiating from center
5. Soft drop shadow at bottom (depth)
```

**Proportions:**
- Cross width: 35% of icon width
- Glow blur: 40px (at 1024px size)
- Light rays: 4-8 subtle rays, 50% opacity

### Option B: Open Bible 📖
```
1. Dark slate background
2. Open Bible pages in white (slight 3D angle)
3. Indigo glow inside pages
4. Golden light emanating from spine
5. Subtle page curl effect
```

**Proportions:**
- Bible width: 50% of icon width
- Page angle: ~15° perspective
- Light rays: From center, upward

---

## Design Process (Using Figma/Adobe XD)

### Step 1: Create Base
```
1. New file: 1024×1024px
2. Background: #0f172a
3. Add subtle gradient: → #1a2332 (10% darker at edges)
```

### Step 2: Add Main Element
```
Option A (Cross):
1. Rectangle tool: 100×350px (vertical)
2. Rectangle tool: 350×100px (horizontal)
3. Center both on canvas
4. Combine (union)
5. Color: #ffffff, opacity: 70%
6. Corners: 8px radius (rounded edges)

Option B (Bible):
1. Use open book shape
2. Or: 2 rectangles at 15° angle
3. Color: #ffffff
4. Add subtle shadow
```

### Step 3: Add Glow
```
1. Duplicate main element
2. Send behind original
3. Blur: 40px
4. Color: #6c5ce7
5. Opacity: 60%
6. Scale: 150% of original
```

### Step 4: Add Light Rays (Optional)
```
1. Thin lines radiating from center
2. Color: #f4b400
3. Opacity: 50%
4. Angle: 0°, 45°, 90°, 135°, etc.
5. Length: ~400px
6. Feather edges (fade out)
```

### Step 5: Final Polish
```
1. Add subtle drop shadow (dark)
2. Blur: 20px
3. Distance: 8px down
4. Color: #000000, opacity: 30%
5. Export at 1024×1024px (PNG with transparency)
```

---

## Export Settings

### Android (Google Play)
- **Format:** PNG with transparency
- **Size:** 512×512px (recommended)
- **No rounded corners** (Android applies automatically)
- **Safe area:** 96px padding from edges

### iOS (App Store)
- **Format:** PNG with transparency
- **Sizes:** Provide 180×180px (for @1x), 360×360px (for @2x), 540×540px (for @3x)
- **Rounded corners:** iOS applies automatically
- **Safe area:** 60px padding from edges

### Web (Favicon)
- **Format:** PNG or ICO
- **Size:** 512×512px (will auto-resize)
- **No transparency needed** (add white background if needed)

---

## Quality Checklist

- [ ] Icon looks good at 60×60px (tiny size test)
- [ ] Icon looks good at 512×512px (large size test)
- [ ] No pixelation when scaled
- [ ] Clear at small size (not too detailed)
- [ ] Stands out in app drawer (good contrast with system)
- [ ] Matches brand colors (#6c5ce7 indigo)
- [ ] Professional, not clipart-y
- [ ] Spiritual without being "churchy" (modern feel)

---

## Common Mistakes to Avoid

❌ **Too much detail** → Becomes mud at small sizes
❌ **Too thin lines** → Disappear when scaled down
❌ **Gradient background** → Looks cheap
❌ **Too bright** → Fatigues eyes, not trustworthy
❌ **Centered text** → Unreadable at small sizes
❌ **Complex shapes** → Confusing, not memorable
❌ **Too many colors** → Loses impact (stick to 2-3)

---

## Design Tools

### Free Options:
- **Figma** (web-based, collaborative)
- **Canva** (templates available)
- **Pixlr** (online editor)

### Premium:
- **Adobe XD**
- **Illustrator**
- **Photoshop**

### Recommended AI Generation:
If you want to generate an icon quickly:
- **DALL-E 3** with prompt: "Glowing spiritual cross icon, dark background, golden light rays, professional app icon, modern minimalist"
- **Midjourney** (higher quality)

---

## Next Steps

1. **Design the icon** (use this spec as guide)
2. **Test at all sizes** (60px, 120px, 512px)
3. **Get feedback** from users
4. **Export** at all required sizes
5. **Upload** to Play Store/App Store
6. **Monitor** download rates (CTR boost expected)

---

## Questions?

If icon doesn't look right at small sizes, increase:
- Contrast between glow and background
- Size of main element (cross/Bible)
- Opacity of glow (make brighter)

If too corporate-looking, add:
- Warmer golden tones
- More pronounced light rays
- Softer, rounded edges