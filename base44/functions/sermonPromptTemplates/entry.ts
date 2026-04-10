/**
 * Oromo Church-Safe AI Sermon Prompt Templates
 * These system instructions ensure AI sermon generation is theologically sound
 * and culturally appropriate for Ethiopian/East African churches
 */

const SERMON_PROMPT_TEMPLATES = {
  // Standard Sermon Outline in Oromo
  SERMON_OUTLINE_OM: `Sagantaa barsiisuu uumi mata-duree kana irratti: {topic}.
Deebii kee Afan Oromoo (Latin script) irratti barreessi.
Kutaa Kitaaba Qulqulluu ragaa ta'u kaa'i.
Yaada siyaasaa ykn nama biroo miidhu hin dabalin.
Xumura irratti 'Kitaaba Qulqulluu irratti mirkaneessi' jechuun yaadachiisi.`,

  // Standard Sermon Outline in English
  SERMON_OUTLINE_EN: `Create a sermon outline on this topic: {topic}.
Provide 3-4 main points with Scripture references.
Include practical applications for believers.
Ensure theological accuracy aligned with Scripture.
End with a reminder to verify all teaching with Scripture.`,

  // Devotional in Oromo
  DEVOTIONAL_OM: `Cimsannaa amantii gabaabaa uumi kutaa kana irratti: {bible_reference}.
Afaan salphaa fi ifa ta'e fayyadami.
Yaada kadhannaa gabaabaa dabaluu dandeessa.
Yaadannoo xumuraa kennuu jechuun itti qaba.`,

  // Devotional in English
  DEVOTIONAL_EN: `Create a short devotional reflection on this Scripture: {bible_reference}.
Use simple, clear language.
Include a brief prayer or personal reflection.
Keep it encouraging and hope-filled.
End with one key takeaway for the reader.`,

  // Leadership Teaching in Oromo
  LEADERSHIP_OM: `Barnoota hoggansa kiristaanaa uumi.
Fakkeenya Kitaaba Qulqulluu fayyadami.
Gorsa hojii irratti hojiirra oolu dabaluu.
Afan Oromoo irratti barreessi.
Hoggansa mara Kristos irratti hundaa'a.`,

  // Leadership Teaching in English
  LEADERSHIP_EN: `Create a leadership teaching on Christian stewardship.
Use biblical examples from Scripture.
Include practical application for church leaders.
Focus on servant leadership modeled by Christ.
Ensure cultural sensitivity for East African context.`,

  // Children's Bible Story in Oromo
  CHILDREN_STORY_OM: `Seera barnoota ijoollee uumi {story_reference} irratti.
Afaan salphaa fi itmaalsa qabu fayyadami.
Fedhii barsiisaa amantii dabaluu.
Yaada ijoollee biraa hordofuu qabu kennuu.`,

  // Children's Bible Story in English
  CHILDREN_STORY_EN: `Create a Bible story lesson for children about {story_reference}.
Use simple words and engaging language.
Include a lesson about faith or obedience.
End with a fun activity or reflection question.`,

  // Youth Discipleship in Oromo
  YOUTH_DISCIPLESHIP_OM: `Barnoota ijaarraa kiristaanaa uumi tema: {theme}.
Haasawa waamuun wallaalchuu dandeessa.
Jidduu ijaarraa jira keessatti nif tajaajila.
Afan Oromoo irratti barreessi.`,

  // Women's Bible Study in Oramo
  WOMEN_STUDY_OM: `Barnoota dubartoota akka waliin barumsaa uumi: {topic}.
Seenaa dubartoota Kitaaba Qulqulluu keessaa fayyadami.
Guddina amantii fi jaalala waliin walqabsiisi.
Yaadannoo Oromo keessatti barreessi.`,

  // Sunday School Lesson in Oromo
  SUNDAY_SCHOOL_OM: `Barnoota mana barnoota Seenaa inaasaa uumi {passage}.
Seensa hedduu fayyadami.
Gaaffii waajjiiraa kennuu.
Taphaataa kennuu.`,
};

/**
 * Helper function to generate system instruction for sermon creation
 * Ensures safe, theologically sound AI responses
 */
function getSermonSystemInstruction(lang = 'om') {
  const instructions = {
    om: `Ati barsiisaa cufaa kiristaanaa dha.
Seera kana kabajuu qabda:
1. Kitaaba Qulqulluu hunda irratti miirkanessuu
2. Amantii hedduu (Orthodoksi, Protestant, Kaatoolikii) kabajuu
3. Yaada siyaasaa ykn nama biroo miidhu hin dabalin
4. Yaada fayyaa ykn seeraa hin kennin
5. Deebiin kee dogoggora qabaachuu danda'a — Kitaaba Qulqulluu irratti mirkaneessi

Sagalee kee xumuruu:
"Omni barsiisaa AI dha. Kitaaba Qulqulluu irratti mirkaneessi."`,

    en: `You are a Christian Bible teacher.
Follow these rules:
1. Always ground teaching in Scripture
2. Respect all Christian traditions (Orthodox, Protestant, Catholic)
3. Avoid political or controversial opinions
4. Do not provide medical or legal advice
5. Your responses may contain errors — always verify with Scripture

Always end responses with:
"This is AI-generated teaching. Verify all teaching with Scripture."`,
  };

  return instructions[lang] || instructions['en'];
}

/**
 * Export for backend function use
 */
export { SERMON_PROMPT_TEMPLATES, getSermonSystemInstruction };