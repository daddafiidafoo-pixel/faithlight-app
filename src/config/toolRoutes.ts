export const toolRoutes = {
  explainScripture: "/ai-bible-study?tab=passages",
  sermonAssistant: "/sermon-assistant",
  studyPlans: "/ai-bible-study?tab=studyPlans",
  bibleStructure: "/bible-structure-overview",
} as const;

export const toolsData = [
  {
    title: "Explain Scripture",
    description: "Understand any Bible verse clearly with context and application.",
    route: toolRoutes.explainScripture,
  },
  {
    title: "Sermon Assistant",
    description: "Create sermon outlines, teaching points, and prayer guidance.",
    route: toolRoutes.sermonAssistant,
  },
  {
    title: "Study Plans",
    description: "Generate practical daily Bible study plans.",
    route: toolRoutes.studyPlans,
  },
  {
    title: "Bible Structure",
    description: "Learn the classes and organization of the Bible.",
    route: toolRoutes.bibleStructure,
  },
];