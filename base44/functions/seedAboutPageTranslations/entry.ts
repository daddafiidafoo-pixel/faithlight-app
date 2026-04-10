import { base44 } from '@/api/base44Client';

/**
 * Seed About page translations (English and Afaan Oromo)
 */
export async function seedAboutPageTranslations() {
  const englishTranslations = {
    'about.title': 'About FaithLight',
    'about.missionTitle': 'Our Mission',
    'about.missionText1': 'FaithLight helps believers understand the Bible clearly and teach with confidence.',
    'about.missionText2': 'We provide structured Bible lessons, quizzes, and teaching tools supported by responsible AI—always grounded in Scripture. FaithLight is built to serve students, pastors, and Bible teachers around the world with integrity, clarity, and accessibility.',
    'about.scriptureQuote': 'Your word is a lamp to my feet and a light to my path.',
    'about.scriptureRef': 'Psalm 119:105',
    'about.founderTitle': "Founder's Message",
    'about.founderIntro': 'From the heart',
    'about.founderText1': 'FaithLight was created out of a simple burden: many believers want to understand God\'s Word deeply but lack clear, accessible tools.',
    'about.founderText2': 'As the Church grows globally, pastors and teachers are carrying heavy responsibilities—often with limited time and resources. FaithLight exists to support them, not replace them. Scripture remains central. Prayer remains essential. The local church remains God\'s design.',
    'about.founderText3': 'We use technology carefully and responsibly, believing it can serve learning when kept in its proper place. Our commitment is to biblical integrity, global accessibility, and humility before God\'s Word.',
    'about.founderPrayer': 'My prayer is that FaithLight becomes a blessing—helping believers grow in faith and helping teachers prepare with clarity and confidence.',
    'about.founderSignature': '— Founder, FaithLight',
  };

  const oromoTranslations = {
    'about.title': 'Waa\'ee FaithLight',
    'about.missionTitle': 'Ergama Keenya',
    'about.missionText1': 'FaithLight amantoota Kitaaba Qulqulluu sirriitti hubachuu fi amantaa guutuun barsiisuu akka danda\'an gargaara.',
    'about.missionText2': 'Barnoota Kitaaba Qulqulluu sirnaan qindaa\'e, gaaffilee qormaataa, fi meeshaalee barsiisuu AI itti gaafatamummaa qabuun deeggaraman ni dhiyeessina — yeroo hunda Kitaaba Qulqulluu irratti hundaa\'uun. FaithLight barattoota, luba, fi barsiisota Kitaaba Qulqulluu addunyaa guutuu tajaajiluuf amanamummaa, iftoomina, fi salphina fayyadamaa qabaachuuf ijaarameera.',
    'about.scriptureQuote': 'Dubbiin kee miila koo ibsa, karaa koo immoo ifa.',
    'about.scriptureRef': 'Faarfannaa 119:105',
    'about.founderTitle': 'Ergaa Hundeeffamaa',
    'about.founderIntro': 'Garaa koo keessaa',
    'about.founderText1': 'FaithLight yaada salphaa tokko irraa dhalate: amantoonni hedduun Dubbiin Waaqayyoo gadi fageenyaan hubachuu barbaadu, garuu meeshaalee ifa ta\'anii fi salphaa hin argatan.',
    'about.founderText2': 'Akka Mana Amantaa addunyaa guutuu keessatti guddachaa jiruutti, luba fi barsiisotni itti gaafatamummaa guddaa baachaa jiru — yeroo fi qabeenya muraasa qabaachuun. FaithLight isaan deeggaruuf jira, bakka isaanii bu\'uuf miti. Kitaabni Qulqulluun iddoo isaa giddugalaatti itti fufa. Kadhannaanis bu\'uura amantii keenya ta\'ee itti fufa. Mana Amantaa naannoo ammoo karoora Waaqayyoo ta\'ee itti fufa.',
    'about.founderText3': 'Teknoolojii of eeggannoo fi itti gaafatamummaan fayyadamna; barnoota tajaajiluu akka danda\'u amanna, garuu iddoo isaa sirriitti qabachuun. Waadaa keenya amanamummaa Kitaaba Qulqulluu, ga\'umsa addunyaa guutuu, fi gad of qabuu fuula Waaqayyoo duratti dha.',
    'about.founderPrayer': 'Kadhannaan koo FaithLight eebbifama ta\'ee akka tajaajiluudha — amantoota akka amantii keessatti guddatan gargaaruu fi barsiisota akka iftoomina fi amantaa guutuun qophaa\'an deeggaruu.',
    'about.founderSignature': '— Hundeeffamaa, FaithLight',
  };

  const amharicTranslations = {
    'about.title': 'ስለ FaithLight',
    'about.missionTitle': 'ተልእኮአችን',
    'about.missionText1': 'FaithLight አማኞች መጽሐፍ ቅዱስን በግልጽ እንዲረዱ እና በተማማኝ መንገድ እንዲያስተምሩ ይረዳቸዋል።',
    'about.missionText2': 'በመጽሐፍ ቅዱስ ላይ የተመሠረቱ የተዋቀሩ የመጽሐፍ ቅዱስ ትምህርቶች፣ ጥያቄ-መልስ ፈተናዎች (Quizzes) እና የማስተማር መሳሪያዎችን በተጠያቂ ኤ.አይ. ድጋፍ እንዲጠቀሙ እናቀርባለን—ሁልጊዜም በመጽሐፍ ቅዱስ ላይ ተመስርተን። FaithLight ተማሪዎችን፣ ፓስተሮችን እና የመጽሐፍ ቅዱስ አስተማሪዎችን በዓለም አቀፍ ደረጃ በታማኝነት፣ በግልጽነት እና በቀላል ተደራሽነት ለመገልገል ተገንብቷል።',
    'about.scriptureQuote': 'ቃልህ ለእግሬ መብራት ለመንገዴም ብርሃን ነው።',
    'about.scriptureRef': 'መዝሙር 119:105',
    'about.founderTitle': 'የመሠረታች መልዕክት',
    'about.founderIntro': 'ከልብ',
    'about.founderText1': 'FaithLight ከቀላል ጭንቀት ተነስቶ ተፈጠረ፤ ብዙ አማኞች የእግዚአብሔርን ቃል በጥልቀት ማስተዋል ይፈልጋሉ፣ ነገር ግን ግልጽና ቀላል የሆኑ መሳሪያዎች እጥረት አለ።',
    'about.founderText2': 'ቤተክርስቲያን በዓለም አቀፍ ሲያድግ ፓስተሮችና አስተማሪዎች ከብዙ ጊዜ እና ሀብት ጉድለት ጋር ከባድ ተግባራትን ይሸከማሉ። FaithLight እነሱን ለመደገፍ ነው ያለው—መተካት አይደለም። መጽሐፍ ቅዱስ ማዕከል ሆኖ ይቆያል፤ ጸሎት አስፈላጊ ነው፤ አካባቢያዊ ቤተክርስቲያንም የእግዚአብሔር እቅድ ነው።',
    'about.founderText3': 'ቴክኖሎጂን በጥንቃቄና በተጠያቂነት እንጠቀማለን፤ በተገቢው ቦታ ሲቆም መማርን ሊያገለግል እንደሚችል እናምናለን። ቁርጠኝነታችን የመጽሐፍ ቅዱስ ታማኝነት፣ ዓለም አቀፍ ተደራሽነት እና በእግዚአብሔር ቃል ፊት ትሕትና ነው።',
    'about.founderPrayer': 'ጸሎቴ FaithLight በረከት እንዲሆን—አማኞች በእምነት እንዲያድጉ እና አስተማሪዎች በግልጽነትና በተማማኝነት እንዲዘጋጁ እንዲረዳ ነው።',
    'about.founderSignature': '— መሠረታች፣ FaithLight',
  };

  const arabicTranslations = {
    'about.title': 'حول FaithLight',
    'about.missionTitle': 'رسالتنا',
    'about.missionText1': 'يساعد FaithLight المؤمنين على فهم الكتاب المقدّس بوضوح والتعليم بثقة.',
    'about.missionText2': 'نقدّم دروسًا منظّمة في الكتاب المقدّس، واختبارات قصيرة (Quizzes)، وأدوات تعليم مدعومة بذكاء اصطناعي مسؤول—دائمًا مرتكزة على الكتاب المقدّس. تم بناء FaithLight لخدمة الطلاب، والقساوسة، ومعلّمي الكتاب المقدّس حول العالم بنزاهة ووضوح وسهولة وصول.',
    'about.scriptureQuote': 'سِرَاجٌ لِرِجْلِي كَلَامُكَ وَنُورٌ لِسَبِيلِي.',
    'about.scriptureRef': 'مزمور 119:105',
    'about.founderTitle': 'رسالة المؤسِّس',
    'about.founderIntro': 'من القلب',
    'about.founderText1': 'تم إنشاء FaithLight بدافع بسيط: كثير من المؤمنين يرغبون في فهم كلمة الله بعمق، لكنهم يفتقرون إلى أدوات واضحة وسهلة الوصول.',
    'about.founderText2': 'ومع نمو الكنيسة عالميًا، يتحمّل القساوسة والمعلّمون مسؤوليات كبيرة—وغالبًا بوقت وموارد محدودة. وُجد FaithLight ليدعمهم لا ليحلّ محلّهم. تبقى الكتابات المقدّسة في المركز. وتبقى الصلاة أساسية. وتبقى الكنيسة المحلية تصميم الله.',
    'about.founderText3': 'نستخدم التكنولوجيا بحذر ومسؤولية، مؤمنين أنها يمكن أن تخدم التعلّم عندما تُوضع في مكانها الصحيح. التزامنا هو النزاهة الكتابية، وسهولة الوصول عالميًا، والتواضع أمام كلمة الله.',
    'about.founderPrayer': 'صلاتي أن يكون FaithLight بركة—يساعد المؤمنين على النمو في الإيمان ويساعد المعلّمين على التحضير بوضوح وثقة.',
    'about.founderSignature': '— المؤسِّس، FaithLight',
  };

  try {
    // Seed English translations
    const enBatch = Object.entries(englishTranslations).map(([key, value]) => ({
      key,
      language_code: 'en',
      value,
      category: 'ui',
      status: 'published',
    }));

    // Seed Oromo translations
    const omBatch = Object.entries(oromoTranslations).map(([key, value]) => ({
      key,
      language_code: 'om',
      value,
      category: 'ui',
      status: 'published',
    }));

    // Seed Amharic translations
    const amBatch = Object.entries(amharicTranslations).map(([key, value]) => ({
      key,
      language_code: 'am',
      value,
      category: 'ui',
      status: 'published',
    }));

    // Seed Arabic translations
    const arBatch = Object.entries(arabicTranslations).map(([key, value]) => ({
      key,
      language_code: 'ar',
      value,
      category: 'ui',
      status: 'published',
    }));

    await base44.entities.Translation.bulkCreate([...enBatch, ...omBatch, ...amBatch, ...arBatch]);
    return true;
  } catch (error) {
    console.error('Error seeding translations:', error);
    return false;
  }
}