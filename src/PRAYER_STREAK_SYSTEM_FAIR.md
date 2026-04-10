# Fair Prayer Streak System — Calendar Day Tracking

## Core Principle
**One prayer streak credit per calendar day, per user's local timezone.** This prevents farming, backfilling, and inflating streaks.

## Data Model: UserStreak Entity

```json
{
  "userEmail": "user@example.com",
  "currentStreak": 7,
  "longestStreak": 30,
  "lastStreakDate": "2026-03-16",
  "lastPrayerDate": "2026-03-16T14:32:00Z",
  "totalPrayerDays": 45,
  "lastCelebrationStreak": 7
}
```

### Fields Explained
- **currentStreak**: Consecutive days of prayer (resets after 2+ day gap)
- **longestStreak**: Best streak ever achieved
- **lastStreakDate**: Last calendar date (YYYY-MM-DD) that earned credit
- **lastPrayerDate**: Timestamp of most recent prayer
- **totalPrayerDays**: Count of unique days with prayers
- **lastCelebrationStreak**: Last milestone celebrated (prevents duplicate modals)

## Streak Update Logic

### Trigger: `updatePrayerStreak` Backend Function

Called when user saves a prayer. Uses server time (not client time) for security.

#### Algorithm

```
INPUT: serverTimestamp, userTimezone
OUTPUT: streakUpdated, currentStreak, celebration

1. Convert server timestamp to user's local date (YYYY-MM-DD)
2. Fetch UserStreak record for user email
3. Compare local date to lastStreakDate

CASE 1: First prayer ever (no lastStreakDate)
  → Set currentStreak = 1, longestStreak = 1
  → Celebration = "started"
  → streakUpdated = true

CASE 2: Same day (local date == lastStreakDate)
  → Do NOT increment streak
  → Show encouragement: "You've already kept today's prayer streak alive"
  → streakUpdated = false
  → celebration = null

CASE 3: Next day (date == lastStreakDate + 1 day)
  → Increment currentStreak += 1
  → Update longestStreak if needed
  → Check milestone (3, 7, 14, 30, 50+)
  → streakUpdated = true
  → celebration = [milestone type or null]

CASE 4: Gap of 2+ days (date > lastStreakDate + 1 day)
  → Reset currentStreak = 1
  → Don't touch longestStreak
  → celebration = "restart"
  → streakUpdated = true
```

## Celebration Strategy

### Celebration Types

| Milestone | Celebration | Confetti |
|-----------|-------------|----------|
| Day 1     | "started"   | No       |
| Day 2-6   | None        | No       |
| Day 3     | "small"     | Yes      |
| Day 7     | "weekly"    | Yes      |
| Day 14    | "milestone" | Yes      |
| Day 30    | "monthly"   | Yes      |
| Day 50+   | "major"     | Yes      |
| Gap reset | "restart"   | No       |

### Celebration Display

- Each celebration type has unique:
  - Icon (Flame or Trophy)
  - Title & message
  - Background gradient
  - Confetti animation (if applicable)

### Duplicate Prevention

`lastCelebrationStreak` tracks the last milestone that triggered a modal:
- Only celebrate if `currentStreak !== lastCelebrationStreak`
- This prevents showing the same modal twice if user lands on Home multiple times

## Anti-Cheat Rules

### 1. Server-Side Timestamp
- Backend uses `new Date().toISOString()` (server time)
- Never trusts client device time
- Prevents users from changing device clock to backfill

### 2. One Credit Per Calendar Day
- Only one streak point earned per 24-hour local calendar period
- Multiple prayers on same day = 0 additional streak points
- User sees: "Keep praying. 🙏" (encouragement, not inflated)

### 3. No Retroactive Streak Edits
- Editing or deleting old prayer entries does NOT recalculate past streaks
- Past streaks are immutable once recorded
- Simplifies logic and prevents exploitation

### 4. Timezone Conversion
- User's timezone resolved via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Backend recalculates local date using provided timezone
- Prevents user manipulation of timezone to earn extra credits

## User Experience

### Saving a Prayer

**Scenario A: First prayer of the day**
```
User adds prayer at 10am
→ Backend calculates local date
→ Checks lastStreakDate
→ If new day: increment streak → SHOW CELEBRATION (if milestone)
→ Toast: "Prayer streak: 7 days! 🔥"
```

**Scenario B: Second prayer same day**
```
User adds prayer at 3pm (already prayed at 10am)
→ Backend calculates local date
→ Checks lastStreakDate (same date)
→ No increment
→ Toast: "You've already kept today's prayer streak alive. Keep praying. 🙏"
```

**Scenario C: Missing a day**
```
User prayed on March 14, skipped March 15, prays on March 16
→ Backend calculates: March 16
→ Checks lastStreakDate: March 14
→ Day diff = 2 (gap detected)
→ Reset currentStreak = 1
→ Toast: "Streak reset, but you're back on track! 💪"
```

### Celebration Modal

```
User hits 7-day streak
→ Modal shows: "🔥 7-Day Prayer Streak!"
→ "A week of devotion! Amazing!"
→ Confetti animation
→ "Keep the Streak Going! 🙏" button
```

## Technical Implementation

### Files

1. **entities/UserStreak.json** - Data model
2. **functions/updatePrayerStreak.js** - Backend streak calculation
3. **components/hooks/usePrayerStreak.js** - Frontend data fetcher
4. **components/gamification/PrayerStreakCelebration.jsx** - Celebration modal
5. **components/gamification/PrayerStreakBadge.jsx** - Badge display
6. **pages/MyPrayerJournal.jsx** - Triggers streak update on prayer save
7. **pages/Home.jsx** - Displays badge & triggers celebration modal

### Data Flow

```
User saves prayer in MyPrayerJournal
  ↓
Calls prayerCRUD function (creates prayer)
  ↓
Calls updatePrayerStreak (backend)
  ├─ Uses server timestamp
  ├─ Converts to user's local date
  ├─ Compares with lastStreakDate
  ├─ Updates UserStreak entity
  └─ Returns: { streakUpdated, currentStreak, celebration }
  ↓
Frontend gets response
  ├─ If celebration: show modal
  ├─ Else if streakUpdated: show toast with new streak
  ├─ Else (same day): show encouragement toast
  └─ Invalidate React Query cache
  ↓
Home page refetches UserStreak
  ├─ Badge updates with new streak
  ├─ If celebration returned: show modal
  └─ User sees visual feedback
```

## Edge Cases Handled

### Edge Case 1: Timezone Boundary
User in LA (PST) saves prayer at 11pm local time
- Server timestamp: 2026-03-17 07:00 UTC
- User's local date: 2026-03-16
- Correctly counted for March 16 streak

### Edge Case 2: Multiple Fast Saves
User saves 3 prayers within same minute
- First call: streak incremented
- Second & third calls: same `lastStreakDate` → no increment
- Only first call earns streak credit ✓

### Edge Case 3: Daylight Saving Time
Timezone shifts during DST transition
- Uses Intl.DateTimeFormat (handles DST automatically) ✓

### Edge Case 4: User Deletion
If user is deleted, streak record orphaned but harmless
- Future authentication prevents access
- No risk of streak reuse

## Future Enhancements (Post-Launch)

1. **Streak Freezes**: Buy freeze with credits to skip 1 missed day
2. **Leaderboard**: Top community streaks (anonymized or opt-in)
3. **Analytics**: "Your best streak time: Sundays"
4. **Export**: Download streak history
5. **Scheduled Reminders**: "You haven't prayed today" at 8pm (if missed)

## Testing Checklist

- [ ] First prayer creates UserStreak
- [ ] Same-day prayer doesn't increment
- [ ] Next-day prayer increments
- [ ] 2+ day gap resets to 1
- [ ] longestStreak updates correctly
- [ ] Celebrations trigger at 3, 7, 14, 30, 50
- [ ] No duplicate celebrations
- [ ] Timezone handling (LA, UTC, Asia)
- [ ] Server timestamp used (not client)
- [ ] Toast messages appear
- [ ] Modal confetti triggers
- [ ] React Query cache invalidates
- [ ] Badge updates on Home
- [ ] Mobile responsive

## Summary

This system is:
- ✅ **Fair**: One credit per calendar day max
- ✅ **Simple**: Straightforward logic, no edge cases
- ✅ **Anti-cheat**: Server-side, timezone-aware, immutable past
- ✅ **Motivating**: Celebrations at meaningful milestones
- ✅ **Mobile-friendly**: All responsive