import { scoreResult } from "@/components/search/ranking";
import { base44 } from '@/api/base44Client';
import { applyPersonalizationBoost } from "@/components/search/personalize";

export const STATIC_RESULTS = [
  { group: "Features", type: "Feature", title: "Bible Reader", subtitle: "Read Scripture in multiple translations", path: "/BibleReader" },
  { group: "Features", type: "Feature", title: "AI Tools", subtitle: "Explanations, sermons, study tools", path: "/AskAI" },
  { group: "Features", type: "Feature", title: "Community Forum", subtitle: "Questions and discussions", path: "/BibleForum" },
  { group: "Features", type: "Feature", title: "Study Plans", subtitle: "Discover curated plans", path: "/StudyPlans" },
  { group: "Features", type: "Feature", title: "Offline Library", subtitle: "Downloads and offline access", path: "/OfflineLibrary" },
  { group: "Settings", type: "Settings", title: "Account Settings", subtitle: "Profile and preferences", path: "/UserSettings" },
  { group: "Legal", type: "Legal", title: "Privacy Policy", subtitle: "", path: "/PrivacyPolicy" },
  { group: "Legal", type: "Legal", title: "Terms of Service", subtitle: "", path: "/TermsOfService" },
];

function pack(query, item, signals = null) {
  const base = scoreResult(query, item);
  const boost = applyPersonalizationBoost(item, signals);
  return { ...item, score: base + boost };
}

export async function searchAllContent({ query, me, limits, signals = null }) {
  const q = query.trim();
  if (!q) {
    return groupAndSort(
      STATIC_RESULTS.slice(0, 8).map((x) => ({ ...x, score: 0 }))
    );
  }

  const out = [];

  // Static results
  for (const r of STATIC_RESULTS) out.push(pack(q, r, signals));

  // Forums
  try {
    const forums = await base44.entities.ForumTopic.filter({ status: "active" }, "-updated_date", 20).catch(() => []);
    for (const f of forums) {
      out.push(pack(q, {
        group: "Community",
        type: "Forum Topic",
        title: f.title,
        subtitle: f.category || "",
        body: f.content || "",
        tags: [],
        path: `/BibleForum?topic=${f.id}`,
      }, signals));
    }
  } catch (e) {}

  // Study Plans
  try {
    const plans = await base44.entities.StudyPlan.filter({}, "title", 20).catch(() => []);
    for (const p of plans) {
      out.push(pack(q, {
        group: "Study Plans",
        type: "Study Plan",
        title: p.title,
        subtitle: p.description || "",
        body: "",
        tags: p.topics || [],
        path: `/StudyPlanDetail?id=${p.id}`,
      }, signals));
    }
  } catch (e) {}

  // Courses
  try {
    const courses = await base44.entities.Course.filter({ is_published: true }, "-updated_date", 20).catch(() => []);
    for (const c of courses) {
      out.push(pack(q, {
        group: "Courses",
        type: "Course",
        title: c.title,
        subtitle: c.instructor_name || "",
        body: c.description || "",
        tags: c.tags || [],
        category: c.category,
        key: c.id,
        path: `/CourseDetail?id=${c.id}`,
      }, signals));
    }
  } catch (e) {}

  // Lessons
  try {
    const lessons = await base44.entities.Lesson.filter({ status: "approved" }, "-updated_date", 20).catch(() => []);
    for (const l of lessons) {
      out.push(pack(q, {
        group: "Lessons",
        type: "Lesson",
        title: l.title,
        subtitle: l.scripture_references || "",
        body: l.objectives || "",
        tags: [],
        key: l.id,
        path: `/LessonView?id=${l.id}`,
      }, signals));
    }
  } catch (e) {}

  // Saved AI Explanations (if authenticated)
  if (me?.id) {
    try {
      const threads = await base44.entities.AIExplanationThread.filter({ user_id: me.id, saved: true }, "-updated_date", 20).catch(() => []);
      for (const t of threads) {
        out.push(pack(q, {
          group: "AI Saved",
          type: "AI Explanation",
          title: t.reference,
          subtitle: (t.themes || []).join(', '),
          body: t.summary || "",
          tags: t.categories || [],
          path: `/MyAIExplanations?thread=${t.id}`,
        }, signals));
      }
    } catch (e) {}
  }

  // Filter & group
  const grouped = groupAndSort(out.filter((x) => x.score > 0));
  return capPerGroup(grouped, limits);
}

function groupAndSort(items) {
  const groups = {};
  for (const it of items) {
    groups[it.group] = groups[it.group] || [];
    groups[it.group].push(it);
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  return groups;
}

function capPerGroup(groups, lim) {
  const caps = { Features: 8, Settings: 5, Legal: 5, Community: 10, "Study Plans": 10, Courses: 8, Lessons: 8, "AI Saved": 6, ...(lim || {}) };
  const out = {};
  for (const [k, arr] of Object.entries(groups)) {
    out[k] = arr.slice(0, caps[k] || 10);
  }
  return out;
}