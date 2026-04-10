export default {
  quizzes: [
    {
      id: "genesis-101",
      category: "genesis",
      difficulty: "beginner",
      title: {
        en: "Creation Basics",
        om: "Jalqaba Uumamaa",
        am: "ስለ ፍጥረት",
        ar: "أساسيات الخلق",
        sw: "Msingi wa Uumbaji",
        fr: "Fondamentaux de la Création"
      },
      questions: [
        {
          id: "q1",
          text: {
            en: "On which day did God create humans?",
            om: "Waaqni guyyaa kamiitti nama uume?",
            am: "ሰው በየ ቀን ተፈጠረ?",
            ar: "في أي يوم خلق الله البشر؟",
            sw: "Mungu aliumbua binadamu siku gani?",
            fr: "Quel jour Dieu a-t-il créé les humains?"
          },
          options: [
            {en: "Day 5", om: "Guyyaa 5", am: "ቀን 5", ar: "اليوم 5", sw: "Siku 5", fr: "Jour 5"},
            {en: "Day 6", om: "Guyyaa 6", am: "ቀን 6", ar: "اليوم 6", sw: "Siku 6", fr: "Jour 6"},
            {en: "Day 7", om: "Guyyaa 7", am: "ቀን 7", ar: "اليوم 7", sw: "Siku 7", fr: "Jour 7"},
            {en: "Day 8", om: "Guyyaa 8", am: "ቀን 8", ar: "اليوم 8", sw: "Siku 8", fr: "Jour 8"}
          ],
          correctAnswer: 1,
          explanation: {
            en: "Genesis 1:27 tells us humans were created on the sixth day",
            om: "Uumama 1:27 nama guyyaa jaaffaa keessa uumame jedha",
            am: "ዘፍጥረት 1:27 ሰው በስድስተ ቀን ተፈጠረ ይላል",
            ar: "تخبرنا التكوين 1:27 أن البشر خُلقوا في اليوم السادس",
            sw: "Mwanzo 1:27 inatuambia binadamu waliumbwa siku ya sita",
            fr: "Genèse 1:27 nous dit que les humains ont été créés le sixième jour"
          }
        }
      ]
    }
  ],
  categories: [
    {
      id: "genesis",
      title: {en: "Genesis & Creation", om: "Seera Uumamaa", am: "ዘፍጥረት", ar: "التكوين", sw: "Mwanzo", fr: "Genèse"}
    },
    {
      id: "jesus",
      title: {en: "Jesus & Gospel", om: "Yesuus", am: "ኢየሱስ", ar: "يسوع", sw: "Yesu", fr: "Jésus"}
    }
  ]
}