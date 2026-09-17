export const learningRules = {
  weeklyTargetExercises: 5,
  weakMasteryThreshold: 70,
  recommendation: {
    lowScore: 65,
    highScore: 85,
    staleWeakDays: 7,
  },
  unlocks: {
    technologyReview: {
      prerequisiteLevel: 'literacy',
      completion: 30,
      mastery: 65,
    },
    softwareEngineeringReview: {
      prerequisiteLevel: 'technology-review',
      completion: 35,
      mastery: 70,
    },
    bossReview: {
      curriculumCompletion: 50,
      mastery: 70,
    },
  },
  diagnosis: {
    minimumMeaningfulCharacters: 3,
  },
  answerModes: {
    languageAssistMasteryMultiplier: 0.85,
    shortAnswerTargetTokens: 3,
  },
} as const
