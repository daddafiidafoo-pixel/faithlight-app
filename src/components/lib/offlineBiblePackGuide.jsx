/**
 * Offline Bible Pack Structure Guide
 * 
 * Directory structure should be:
 * public/bibles/
 * ├── en_kjv/
 * │   ├── manifest.json
 * │   ├── genesis.json
 * │   ├── exodus.json
 * │   └── ... (other books)
 * ├── en_web/
 * ├── om_oromoo/
 * ├── sw_suv/
 * └── am_amharic/
 * 
 * Book JSON Format Example:
 * {
 *   "versionId": "en_kjv",
 *   "bookId": "GEN",
 *   "bookName": "Genesis",
 *   "chapters": {
 *     "1": {
 *       "chapterNum": 1,
 *       "verses": [
 *         {
 *           "verseNum": 1,
 *           "text": "In the beginning God created the heaven and the earth."
 *         },
 *         {
 *           "verseNum": 2,
 *           "text": "And the earth was without form..."
 *         }
 *       ]
 *     },
 *     "2": { ... }
 *   }
 * }
 * 
 * Manifest JSON Format:
 * {
 *   "versionId": "en_kjv",
 *   "versionName": "King James Version",
 *   "language": "en",
 *   "books": [
 *     {
 *       "id": "GEN",
 *       "name": "Genesis",
 *       "testament": "OT",
 *       "chapters": 50
 *     }
 *   ]
 * }
 */

/**
 * Supported offline Bible versions
 */
export const OFFLINE_BIBLE_VERSIONS = [
  {
    versionId: 'en_kjv',
    versionName: 'King James Version',
    language: 'en',
    languages: ['en'],
  },
  {
    versionId: 'en_web',
    versionName: 'World English Bible',
    language: 'en',
    languages: ['en'],
  },
  {
    versionId: 'om_oromoo',
    versionName: 'Oromo Bible (Oromoo)',
    language: 'om',
    languages: ['om'],
  },
  {
    versionId: 'sw_suv',
    versionName: 'Swahili Union Version',
    language: 'sw',
    languages: ['sw'],
  },
  {
    versionId: 'am_amharic',
    versionName: 'Amharic Bible',
    language: 'am',
    languages: ['am'],
  },
];

/**
 * Tools for generating Bible packs:
 * 1. Scripture.api.bible - Commercial, comprehensive
 * 2. Bible JSON API - https://github.com/bibles/bibles.com
 * 3. Open Bible API - https://openbible.info
 * 4. osis2json converter
 */
export const BIBLE_PACK_GENERATION_TOOLS = {
  'Scripture API Bible': {
    url: 'https://www.api.bible/',
    description: 'Commercial API with comprehensive Bible translations',
  },
  'Bible.com JSON': {
    url: 'https://github.com/bibles/bibles.com',
    description: 'Open-source Bible data in JSON format',
  },
  'Open Bible': {
    url: 'https://openbible.info',
    description: 'Free Bible data and tools',
  },
};