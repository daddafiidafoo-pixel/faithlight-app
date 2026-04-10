export type AITab = "studyPlans" | "passages" | "theology";
export type AIProvider = "openai" | "claude";
export type UILanguage = "en" | "om" | "am" | "fr" | "sw" | "ar";

export type AIStudyRequest = {
  provider: AIProvider;
  language: UILanguage;
  tab: AITab;
  query: string;
  topic?: string;
};

export type StudyPlanDay = {
  day: string;
  title: string;
  reading: string;
  reflection: string;
  prayer: string;
};

export type AIStudyResponse =
  | {
      type: "studyPlans";
      title: string;
      summary: string;
      days: StudyPlanDay[];
      keyVerses: string[];
      warnings?: string[];
    }
  | {
      type: "passages";
      title: string;
      summary: string;
      context: string;
      keyThemes: string[];
      application: string[];
      prayer: string;
      warnings?: string[];
    }
  | {
      type: "theology";
      title: string;
      summary: string;
      explanation: string;
      supportingPassages: string[];
      practicalApplication: string[];
      cautions?: string[];
      warnings?: string[];
    };