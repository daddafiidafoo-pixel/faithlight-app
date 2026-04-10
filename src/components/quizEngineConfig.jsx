export default {
  supportedLanguages: ["en", "om", "am", "ar", "sw", "fr"],
  defaultLanguage: "en",
  defaultCategory: "genesis",
  defaultDifficulty: "beginner",
  passingScore: 70,
  scoring: {
    pointsPerQuestion: 10,
    bonusPerSecond: 0.1
  },
  timer: {
    totalSeconds: 600,
    warningAtSeconds: 60,
    autoAdvanceAfterAnswerSeconds: 3
  },
  difficulties: ["beginner", "intermediate", "advanced"],
  resultLevels: {
    excellent: { min: 90, max: 100 },
    good: { min: 70, max: 89 },
    keepTrying: { min: 0, max: 69 }
  },
  features: {
    shuffleQuestions: true,
    shuffleOptions: true,
    showExplanations: true,
    allowReview: true
  }
}