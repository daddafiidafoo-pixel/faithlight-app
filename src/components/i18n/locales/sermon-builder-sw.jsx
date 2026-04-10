export const sermonBuilderSw = {
  header: {
    title: 'Muumba Mahubiri AI',
    subtitle: 'Tengeneza, hifadhi na pakua majedwali ya mahubiri',
  },
  
  form: {
    settings: 'Mipango ya Mahubiri',
    topic: 'Mada au Neno Kuu',
    topicPlaceholder: 'Kwa mfano: "Imani katika Wakati wa Dhiki", "Samahi", "Tumaini katika Kristo"',
    
    passages: 'Sehemu za Biblia',
    passagesPlaceholder: 'Kwa mfano: Roma 8:28, Yakobo 1:2-4',
    
    passageText: 'Maandishi ya Sehemu (Ikhtiyari)',
    passageTextPlaceholder: 'Ambatanisha maandishi ya sehemu ili kuzuia AI hallucinations...',
    
    audienceLabel: 'Hadhira',
    audience: {
      general: 'Kanisa Kuu',
      youth: 'Vijana / Watu Wanaume Juu',
      leaders: 'Viongozi wa Kanisa',
      beginners: 'Wanaminifu Wapya',
      mature: 'Wanaminifu Wenye Uzamili',
    },
    
    lengthLabel: 'Urefu wa Mahubiri',
    length: {
      short: '10-15 min',
      shortSub: '~10 dakika',
      medium: '20-30 min',
      mediumSub: '~20 dakika',
      long: '35-45 min',
      longSub: '~35 dakika',
    },
    
    styleLabel: 'Mtindo wa Mahubiri',
    style: {
      expository: 'Tafsiri',
      topical: 'Kwa Mada',
      narrative: 'Hadithi',
      apologetics: 'Utetezi',
      threePoint: 'Pointi 3',
    },
    
    themesLabel: 'Mada',
    themes: {
      grace: 'Neema',
      faith: 'Imani',
      repentance: 'Toba',
      forgiveness: 'Samahi',
      prayer: 'Dua',
      hope: 'Tumaini',
      love: 'Upendo',
      redemption: 'Faradhi',
      holiness: 'Utakatifu',
      kingdomOfGod: 'Ufaume wa Mungu',
      salvation: 'Wokfu',
      evangelism: 'Ubashiri',
    },
    
    toneLabel: 'Sauti',
    tone: {
      teaching: 'Kufundisha',
      evangelistic: 'Ubashiri',
      devotional: 'Ombi',
      prophetic: 'Unabii',
    },
  },
  
  generation: {
    generate: 'Tengeneza Mahubiri',
    regenerate: 'Tengeneza Upya',
    generatingOutline: 'Muundo wa mahubiri yangu unaundwa…',
    generatingText: 'Hii inachukua takriban 10–15 sekunde',
  },
  
  output: {
    ready: 'Tayari kujenga',
    readyText: 'Ingiza mada na uchague mapendeleo yako kuanza',
  },
  
  tabs: {
    build: 'Jenga',
    saved: 'Ilibaki',
    offline: 'Bila Mtandao',
  },
  
  buttons: {
    generate: 'Tengeneza',
    save: 'Hifadhi',
    update: 'Sasisha',
    share: 'Shiriki',
    download: 'Pakua',
    refresh: 'Onyesha Upya',
    signIn: 'Ingia',
    buildFirst: 'Tengeneza Mahubiri',
    open: 'Fungua',
    view: 'Angalia',
  },
  
  saved: {
    title: 'Mahubiri Yaliyohifadhiwa',
    noSaved: 'Hakuna mahubiri yaliyohifadhiwa',
    signInPrompt: 'Ingia ili kuangalia mahubiri yako yaliyohifadhiwa',
    offlineLibrary: 'Maktaba Bila Mtandao',
    saveSuccess: 'Mahubiri yalihifadhiwa!',
    updateSuccess: 'Mahubiri yasasiswa!',
    deleteSuccess: 'Mahubiri yafutwa',
    deletePrompt: 'Futa mahubiri haya?',
  },
  
  messages: {
    signInToSave: 'Ingia ili hifadhi na pakua mahubiri yako',
    shared: 'Kutumia',
    offlineLabel: 'Bila Mtandao',
  },
  
  errors: {
    enterTopic: 'Tafadhali ingiza mada au neno kuu.',
    generationFailed: 'Ujenzi ulishindwa: ',
    saveFailed: 'Akiba ilishindwa: ',
    deleteFailed: 'Kufuta hakufanikiwa',
  },
};