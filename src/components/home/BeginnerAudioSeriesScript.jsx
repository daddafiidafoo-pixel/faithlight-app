import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Copy, Play } from 'lucide-react';

const AUDIO_SERIES = [
  {
    day: 1,
    enTitle: 'Who is Jesus?',
    omTitle: 'Yesus Kiristoos Eenyu?',
    duration: '5-7 min',
    script: `Baga gara FaithLight dhuftan. Har'a imala haaraa hafuuraa jalqabna.

Gaaffiin jalqabaa keenya: Yesus Kiristoos eenyu?

Yesus nama seenaa qofa miti. Inni Ilma Waaqaati. Kitaabni Qulqulluun nutti hima, 'Jalqaba irraa Dubbiin ture… Dubbiin sunis Waaqa ture.' Yesus Dubbiidha.

Yesus gara biyya lafaa dhufe sababa tokkoof – nu jaallachuuf. Inni cubbuu hin qabne ture, garuu cubbuu keenyaaf fannoo irratti du'e.

Maaliif? Sababni isaa, Waaqa fi nama gidduutti addaan ba'iinsi jira. Addaan ba'iinsi sun cubbuu dha.

Yesus gara keenya dhufe, bakka keenya du'e, karaa Waaqa bira ga'uu bane.

Har'a, Yesus akka Gooftaa fi Fayyisaa kee simachuu dandeessa.

Kadhannaa:

'Gooftaa Yesus, si beekuu barbaada. Cubbuu koo naaf dhiisi. Gara jireenya koo kotti kottu. Na jijjiiri. Ameen.'

Har'a jalqabni kee jalqabameera. Itti fufi.`
  },
  {
    day: 2,
    enTitle: 'What is Salvation?',
    omTitle: 'Fayyinni Maali?',
    duration: '5-7 min',
    script: `Har'a waa'ee fayyina haa ilaallu.

Namni hundi cubbuu qaba. Cubbuu jechuun fedhii Waaqa faallessu dha. Kanaaf namni ofiin fayyuu hin danda'u.

Garuu oduu gaarii tokko jira – Waaqa nu jaallata.

'Ayyaanaatiin fayyine' jechuun, nuti hojii keenyaan miti, ayyaana Waaqaatiin fayyine.

Fayyinni:

Kennaa dha
Amantiin fudhatama
Hojii mitii

Har'a murteessi: hojii koo irratti hin hirkadhu; Yesus irratti hirkadha.`
  },
  {
    day: 3,
    enTitle: 'How to Pray',
    omTitle: 'Akkamitti Kadhannaa Jalqabna?',
    duration: '5-7 min',
    script: `Kadhannaa jechuun Waaqa waliin haasa'uu dha.

Si dhaga'a.
Si beeka.
Si jaallata.

Kadhannaa keessatti:

Galateeffadhu
Cubbuu kee himadhu
Gargaarsa gaafadhu
Warra kaaniif kadhadhu

Yaadadhu – kadhannaa sirna qofa miti. Hariiroo dha.`
  },
  {
    day: 4,
    enTitle: 'How to Read the Bible',
    omTitle: 'Akkamitti Kitaaba Qulqulluu Dubbisna?',
    duration: '5-7 min',
    script: `Kitaabni Qulqulluun dubbii Waaqaati.

Dubbisuu dura:
'Gooftaa, naaf bani' jedhi.

Dubbisi suuta.
Gaaffii of gaafadhu:

Waaqa waa'ee maali na barsiisa?
Anatti akkamitti hojjetti?

Dubbii baratte hojiitti hiiki.`
  },
  {
    day: 5,
    enTitle: 'The Holy Spirit',
    omTitle: 'Hafuura Qulqulluu',
    duration: '5-7 min',
    script: `Yeroo Yesus gara samiitti deeme, Hafuura Qulqulluu nuuf erge.

Hafuuri Qulqulluun:

Nu jabeessa
Nu gorsa
Nu sirreessa
Nu barsiisa

Yoo shakkii qabaatte, kadhadhu:
'Hafuura Qulqulluu, na qajeelchi.'`
  },
  {
    day: 6,
    enTitle: 'Community & Support',
    omTitle: 'Waldaa fi Waliif Deeggarsa',
    duration: '5-7 min',
    script: `Kiristaanonni kophaa hin jiraatan.

Waldaan:

Maatii hafuuraa dha
Iddoo guddinaa dha
Iddoo eebbifamaa dha

FaithLight keessatti garee barbaadi.
Gaaffii gaafadhu.
Baradhu.
Hirmaadhu.`
  },
  {
    day: 7,
    enTitle: 'Continue Your Journey',
    omTitle: 'Imala Kee Itti Fufi',
    duration: '5-7 min',
    script: `Amantiin kee har'a qofa miti. Imala dheeraa dha.

Yeroo kufte:
Hin abdatiin.
Waaqa gara kee jira.

Guyyaa guyyaan:

Kadhadhu
Dubbisi
Waliin jiraadhu
Guddadhu

FaithLight si waliin imala kana keessa deema.

Jabaadhu. Itti fufi. Ati jalqabdeetta.`
  }
];

export default function BeginnerAudioSeriesScript({ language = 'en' }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [copied, setCopied] = useState(false);

  const currentDay = AUDIO_SERIES.find(d => d.day === selectedDay);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDay.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="border-b border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Mic className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-semibold text-orange-700">7-Day Beginner Audio Series</span>
        </div>
        <CardTitle className="text-2xl">
          {language === 'om' ? '🎧 Hidda Gad Fageeffadhu' : '🎧 FaithLight 7-Day Journey'}
        </CardTitle>
        <CardDescription className="text-base">
          {language === 'om' 
            ? 'Seenaa Haaraa Jalqabdeetta – Hiika Buufa, Walaloo Gaaffii'
            : 'Full word-for-word script ready to record • 5-7 minutes per episode'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Day Selector Tabs */}
        <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
          <TabsList className="grid grid-cols-7 w-full mb-6 bg-white border border-amber-200">
            {AUDIO_SERIES.map(day => (
              <TabsTrigger 
                key={day.day} 
                value={day.day.toString()}
                className="text-xs sm:text-sm"
              >
                Day {day.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {AUDIO_SERIES.map(day => (
            <TabsContent key={day.day} value={day.day.toString()} className="space-y-4">
              {/* Title and Metadata */}
              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{day.enTitle}</h3>
                    <p className="text-sm text-orange-700 font-medium">{day.omTitle}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                    {day.duration}
                  </span>
                </div>
              </div>

              {/* Script */}
              <div className="bg-white rounded-lg p-6 border border-amber-100 min-h-80">
                <div className="space-y-3 text-gray-700 leading-relaxed whitespace-pre-wrap font-medium text-base">
                  {day.script}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 gap-2 border-amber-200 hover:bg-amber-50"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Script'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-orange-200 hover:bg-orange-50"
                >
                  <Play className="w-4 h-4" />
                  Play & Follow
                </Button>
              </div>

              {/* Recording Notes */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-sm text-gray-700">
                <p className="font-semibold text-orange-900 mb-2">💡 Recording Tips:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• <strong>Tone:</strong> Warm, encouraging, like a trusted mentor</li>
                  <li>• <strong>Background:</strong> Soft worship instrumental (60-70 BPM)</li>
                  <li>• <strong>Pace:</strong> Slow and clear for new believers</li>
                  <li>• <strong>Voice:</strong> Gentle, reflective tone at the end</li>
                </ul>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}