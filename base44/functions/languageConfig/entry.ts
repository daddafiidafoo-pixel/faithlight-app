export const RTL_LANGUAGES = ['ar', 'fa', 'ur', 'ps', 'dv', 'he', 'yi', 'syr', 'ckb', 'sd', 'ug', 'bal', 'chg'];

export const LANGUAGES = [
  // Top priority languages (most used in Christian communities)
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', rtl: false },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', rtl: false },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  { code: 'ru', name: 'Russian', nativeName: 'русский', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false },
  { code: 'pl', name: 'Polish', nativeName: 'polski', rtl: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', rtl: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', rtl: true },
  { code: 'ckb', name: 'Kurdish (Sorani)', nativeName: 'کوردیی ناوەندی', rtl: true },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', rtl: false },
  
  // Extended list (100+ more languages)
  { code: 'aa', name: 'Afar', nativeName: 'Afaraf', rtl: false },
  { code: 'ab', name: 'Abkhazian', nativeName: 'Аԥсуа', rtl: false },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', rtl: false },
  { code: 'ak', name: 'Akan', nativeName: 'Akan', rtl: false },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', rtl: false },
  { code: 'az', name: 'Azerbaijani', nativeName: 'azərbaycan dili', rtl: false },
  { code: 'be', name: 'Belarusian', nativeName: 'беларуская', rtl: false },
  { code: 'bg', name: 'Bulgarian', nativeName: 'български', rtl: false },
  { code: 'bi', name: 'Bislama', nativeName: 'Bislama', rtl: false },
  { code: 'bm', name: 'Bambara', nativeName: 'bamanankan', rtl: false },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་ཡིག', rtl: false },
  { code: 'br', name: 'Breton', nativeName: 'brezhoneg', rtl: false },
  { code: 'bs', name: 'Bosnian', nativeName: 'bosanski', rtl: false },
  { code: 'ca', name: 'Catalan', nativeName: 'català', rtl: false },
  { code: 'ce', name: 'Chechen', nativeName: 'нохчийн мотт', rtl: false },
  { code: 'ch', name: 'Chamorro', nativeName: 'Chamoru', rtl: false },
  { code: 'co', name: 'Corsican', nativeName: 'corsu', rtl: false },
  { code: 'cr', name: 'Cree', nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ', rtl: false },
  { code: 'cs', name: 'Czech', nativeName: 'čeština', rtl: false },
  { code: 'cv', name: 'Chuvash', nativeName: 'чӑваш чӗлхи', rtl: false },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', rtl: false },
  { code: 'da', name: 'Danish', nativeName: 'dansk', rtl: false },
  { code: 'dv', name: 'Divehi', nativeName: 'ދިވެހި', rtl: true },
  { code: 'dz', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', rtl: false },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', rtl: false },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto', rtl: false },
  { code: 'et', name: 'Estonian', nativeName: 'eesti', rtl: false },
  { code: 'eu', name: 'Basque', nativeName: 'euskara', rtl: false },
  { code: 'ff', name: 'Fula', nativeName: 'Fulfulde', rtl: false },
  { code: 'fi', name: 'Finnish', nativeName: 'suomi', rtl: false },
  { code: 'fj', name: 'Fijian', nativeName: 'vosa Vakaviti', rtl: false },
  { code: 'fo', name: 'Faroese', nativeName: 'føroyskt', rtl: false },
  { code: 'fy', name: 'Western Frisian', nativeName: 'Frysk', rtl: false },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', rtl: false },
  { code: 'gd', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', rtl: false },
  { code: 'gl', name: 'Galician', nativeName: 'galego', rtl: false },
  { code: 'gn', name: 'Guarani', nativeName: 'Avañe'ẽ', rtl: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', rtl: false },
  { code: 'gv', name: 'Manx', nativeName: 'Gaelg', rtl: false },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', rtl: false },
  { code: 'ho', name: 'Hiri Motu', nativeName: 'Hiri Motu', rtl: false },
  { code: 'hr', name: 'Croatian', nativeName: 'hrvatski', rtl: false },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl ayisyen', rtl: false },
  { code: 'hu', name: 'Hungarian', nativeName: 'magyar', rtl: false },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', rtl: false },
  { code: 'hz', name: 'Herero', nativeName: 'Otjiherero', rtl: false },
  { code: 'ia', name: 'Interlingua', nativeName: 'Interlingua', rtl: false },
  { code: 'ie', name: 'Interlingue', nativeName: 'Interlingue', rtl: false },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', rtl: false },
  { code: 'ii', name: 'Sichuan Yi', nativeName: 'ꆈꌠꉙ', rtl: false },
  { code: 'ik', name: 'Inupiaq', nativeName: 'Iñupiaq', rtl: false },
  { code: 'io', name: 'Ido', nativeName: 'Ido', rtl: false },
  { code: 'is', name: 'Icelandic', nativeName: 'íslenska', rtl: false },
  { code: 'iu', name: 'Inuktitut', nativeName: 'ᐃᓄᒃᑎᑐᑦ', rtl: false },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', rtl: false },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', rtl: false },
  { code: 'kg', name: 'Kongo', nativeName: 'Kikongo', rtl: false },
  { code: 'ki', name: 'Kikuyu', nativeName: 'Gĩkũyũ', rtl: false },
  { code: 'kj', name: 'Kwanyama', nativeName: 'Kuanyama', rtl: false },
  { code: 'kk', name: 'Kazakh', nativeName: 'қазақ тілі', rtl: false },
  { code: 'kl', name: 'Kalaallisut', nativeName: 'kalaallisut', rtl: false },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', rtl: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', rtl: false },
  { code: 'kr', name: 'Kanuri', nativeName: 'Kanuri', rtl: false },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', rtl: false },
  { code: 'ku', name: 'Kurdish (Kurmanji)', nativeName: 'Kurdî', rtl: false },
  { code: 'kv', name: 'Komi', nativeName: 'коми кыв', rtl: false },
  { code: 'kw', name: 'Cornish', nativeName: 'Kernewek', rtl: false },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', rtl: false },
  { code: 'la', name: 'Latin', nativeName: 'latina', rtl: false },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', rtl: false },
  { code: 'lg', name: 'Ganda', nativeName: 'Luganda', rtl: false },
  { code: 'li', name: 'Limburgish', nativeName: 'Limburgs', rtl: false },
  { code: 'ln', name: 'Lingala', nativeName: 'Lingála', rtl: false },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', rtl: false },
  { code: 'lt', name: 'Lithuanian', nativeName: 'lietuvių', rtl: false },
  { code: 'lu', name: 'Luba-Katanga', nativeName: 'Tshiluba', rtl: false },
  { code: 'lv', name: 'Latvian', nativeName: 'latviešu', rtl: false },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', rtl: false },
  { code: 'mh', name: 'Marshallese', nativeName: 'Kajin M̧ajeļ', rtl: false },
  { code: 'mi', name: 'Māori', nativeName: 'te reo Māori', rtl: false },
  { code: 'mk', name: 'Macedonian', nativeName: 'македонски', rtl: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', rtl: false },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', rtl: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', rtl: false },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', rtl: false },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', rtl: false },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ', rtl: false },
  { code: 'na', name: 'Nauru', nativeName: 'Dorerin Naoero', rtl: false },
  { code: 'nb', name: 'Norwegian Bokmål', nativeName: 'Norsk Bokmål', rtl: false },
  { code: 'nd', name: 'North Ndebele', nativeName: 'isiNdebele', rtl: false },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', rtl: false },
  { code: 'ng', name: 'Ndonga', nativeName: 'Oshiwambo', rtl: false },
  { code: 'nn', name: 'Norwegian Nynorsk', nativeName: 'Norsk Nynorsk', rtl: false },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', rtl: false },
  { code: 'nr', name: 'South Ndebele', nativeName: 'isiNdebele', rtl: false },
  { code: 'nv', name: 'Navajo', nativeName: 'Diné bizaad', rtl: false },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa', rtl: false },
  { code: 'oc', name: 'Occitan', nativeName: 'occitan', rtl: false },
  { code: 'oj', name: 'Ojibwe', nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ', rtl: false },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', rtl: false },
  { code: 'os', name: 'Ossetian', nativeName: 'ирон æвзаг', rtl: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', rtl: false },
  { code: 'pi', name: 'Pāli', nativeName: 'पालि', rtl: false },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', rtl: true },
  { code: 'qu', name: 'Quechua', nativeName: 'Runa Simi', rtl: false },
  { code: 'rm', name: 'Romansh', nativeName: 'rumantsch', rtl: false },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', rtl: false },
  { code: 'ro', name: 'Romanian', nativeName: 'română', rtl: false },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', rtl: false },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', rtl: false },
  { code: 'sc', name: 'Sardinian', nativeName: 'sardu', rtl: false },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', rtl: true },
  { code: 'se', name: 'Northern Sami', nativeName: 'davvisámegiella', rtl: false },
  { code: 'sg', name: 'Sango', nativeName: 'yângâ tî sängö', rtl: false },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', rtl: false },
  { code: 'sk', name: 'Slovak', nativeName: 'slovenčina', rtl: false },
  { code: 'sl', name: 'Slovenian', nativeName: 'slovenščina', rtl: false },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa', rtl: false },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', rtl: false },
  { code: 'so', name: 'Somali', nativeName: 'Soomaaliga', rtl: false },
  { code: 'sq', name: 'Albanian', nativeName: 'shqip', rtl: false },
  { code: 'sr', name: 'Serbian', nativeName: 'српски', rtl: false },
  { code: 'ss', name: 'Swati', nativeName: 'SiSwati', rtl: false },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho', rtl: false },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', rtl: false },
  { code: 'sv', name: 'Swedish', nativeName: 'svenska', rtl: false },
  { code: 'syr', name: 'Syriac', nativeName: 'ܣܘܪܝܝܐ', rtl: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', rtl: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', rtl: false },
  { code: 'tg', name: 'Tajik', nativeName: 'тоҷикӣ', rtl: false },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmen', rtl: false },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', rtl: false },
  { code: 'to', name: 'Tonga', nativeName: 'lea faka-Tonga', rtl: false },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', rtl: false },
  { code: 'tt', name: 'Tatar', nativeName: 'татар теле', rtl: false },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', rtl: false },
  { code: 'ty', name: 'Tahitian', nativeName: 'Reo Tahiti', rtl: false },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇرچە', rtl: true },
  { code: 'uk', name: 'Ukrainian', nativeName: 'українська', rtl: false },
  { code: 'uz', name: 'Uzbek', nativeName: "o'zbek", rtl: false },
  { code: 've', name: 'Venda', nativeName: 'Tshivenḓa', rtl: false },
  { code: 'vo', name: 'Volapük', nativeName: 'Volapük', rtl: false },
  { code: 'wa', name: 'Walloon', nativeName: 'walon', rtl: false },
  { code: 'wo', name: 'Wolof', nativeName: 'Wollof', rtl: false },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', rtl: false },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', rtl: true },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', rtl: false },
  { code: 'za', name: 'Zhuang', nativeName: 'Saɯ cueŋƅ', rtl: false },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', rtl: false },
];

export function getLanguage({ code } = {}) {
  return LANGUAGES.find((l) => l.code === code);
}

export function isRTLLanguage(input) {
  // Accept both { code: 'en' } and { languageCode: 'en' } patterns
  let code = null;
  
  if (typeof input === 'string') {
    // Fallback: accept bare strings for compatibility
    code = input;
  } else if (typeof input === 'object' && input !== null) {
    code = input.code || input.languageCode;
  }
  
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Normalize: "en-US" -> "en"
  const base = code.toLowerCase().split('-')[0];
  return RTL_LANGUAGES.includes(base);
}

export function detectDeviceLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Check exact match
  if (LANGUAGES.find((l) => l.code === langCode)) {
    return langCode;
  }
  
  // Default to English
  return 'en';
}