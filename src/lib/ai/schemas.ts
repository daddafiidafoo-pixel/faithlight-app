export const studyPlanSchema = {
  name: "study_plan",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      type: { type: "string", enum: ["studyPlans"] },
      title: { type: "string" },
      summary: { type: "string" },
      days: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            day: { type: "string" },
            title: { type: "string" },
            reading: { type: "string" },
            reflection: { type: "string" },
            prayer: { type: "string" },
          },
          required: ["day", "title", "reading", "reflection", "prayer"],
        },
      },
      keyVerses: { type: "array", items: { type: "string" } },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: ["type", "title", "summary", "days", "keyVerses"],
  },
};

export const passageSchema = {
  name: "passage_insight",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      type: { type: "string", enum: ["passages"] },
      title: { type: "string" },
      summary: { type: "string" },
      context: { type: "string" },
      keyThemes: { type: "array", items: { type: "string" } },
      application: { type: "array", items: { type: "string" } },
      prayer: { type: "string" },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: [
      "type",
      "title",
      "summary",
      "context",
      "keyThemes",
      "application",
      "prayer",
    ],
  },
};

export const theologySchema = {
  name: "theology_insight",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      type: { type: "string", enum: ["theology"] },
      title: { type: "string" },
      summary: { type: "string" },
      explanation: { type: "string" },
      supportingPassages: { type: "array", items: { type: "string" } },
      practicalApplication: { type: "array", items: { type: "string" } },
      cautions: { type: "array", items: { type: "string" } },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: [
      "type",
      "title",
      "summary",
      "explanation",
      "supportingPassages",
      "practicalApplication",
    ],
  },
};