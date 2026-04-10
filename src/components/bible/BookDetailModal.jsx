import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2, Tag, Clock, Users, ExternalLink, ChevronRight, Volume2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const BOOK_DATA = {
  Genesis: { summary: "The book of beginnings — creation, the fall, the flood, and the founding of the patriarchs Abraham, Isaac, Jacob, and Joseph.", themes: ["Creation", "Sin & Fall", "Covenant", "God's Faithfulness", "Redemption"], keyVerses: ["Gen 1:1", "Gen 3:15", "Gen 12:1-3", "Gen 50:20"] },
  Exodus: { summary: "God delivers Israel from Egyptian slavery through Moses, gives the Law at Sinai, and establishes the Tabernacle.", themes: ["Deliverance", "The Law", "God's Presence", "Covenant", "Worship"], keyVerses: ["Exod 3:14", "Exod 20:1-17", "Exod 14:14"] },
  Leviticus: { summary: "Laws for worship, sacrifice, and holiness given to Israel at Sinai, emphasizing God's holiness and the need for atonement.", themes: ["Holiness", "Sacrifice", "Atonement", "Purity", "Worship"], keyVerses: ["Lev 11:44", "Lev 19:18"] },
  Numbers: { summary: "Israel's 40-year wilderness journey — census, rebellion, and God's continued provision despite unfaithfulness.", themes: ["Faithfulness", "Rebellion", "God's Provision", "Holiness", "Community"], keyVerses: ["Num 6:24-26", "Num 23:19"] },
  Deuteronomy: { summary: "Moses' farewell speeches, renewing the covenant with the new generation before they enter Canaan.", themes: ["Covenant Renewal", "Love for God", "Obedience", "Blessings & Curses"], keyVerses: ["Deut 6:4-5", "Deut 30:19"] },
  Joshua: { summary: "God fulfills His promise as Israel conquers and settles Canaan under Joshua's leadership.", themes: ["Faithfulness", "Conquest", "Promise Fulfillment", "Courage"], keyVerses: ["Josh 1:9", "Josh 24:15"] },
  Judges: { summary: "A cycle of Israel's sin, oppression, crying out to God, and deliverance through raised-up judges.", themes: ["Apostasy Cycle", "Deliverance", "God's Patience", "Leadership"], keyVerses: ["Judg 2:16", "Judg 21:25"] },
  Ruth: { summary: "A beautiful story of loyalty and redemption — the Moabite Ruth follows her mother-in-law Naomi and finds a kinsman-redeemer in Boaz.", themes: ["Loyalty", "Redemption", "Providence", "Inclusion", "Faithfulness"], keyVerses: ["Ruth 1:16-17", "Ruth 4:14"] },
  "1 Samuel": { summary: "Israel's transition from judges to monarchy — Samuel, Saul's rise and fall, and David's emergence.", themes: ["Leadership", "Obedience", "God's Sovereignty", "Heart vs. Appearance"], keyVerses: ["1 Sam 16:7", "1 Sam 3:10"] },
  "2 Samuel": { summary: "David's reign — his victories, his sin with Bathsheba, and the resulting consequences for his dynasty.", themes: ["Covenant with David", "Sin & Consequences", "Grace", "God's Faithfulness"], keyVerses: ["2 Sam 7:12-16", "2 Sam 12:13"] },
  "1 Kings": { summary: "Solomon's glory and the divided kingdom — Israel's split into north and south, and the ministry of Elijah.", themes: ["Wisdom", "Apostasy", "True Prophecy", "Judgment"], keyVerses: ["1 Kgs 3:9", "1 Kgs 18:21"] },
  "2 Kings": { summary: "The decline and fall of both kingdoms — Israel exiled to Assyria, Judah to Babylon.", themes: ["Judgment", "Exile", "Prophecy", "God's Patience"], keyVerses: ["2 Kgs 17:7-8", "2 Kgs 22:8"] },
  "1 Chronicles": { summary: "A retelling of Israel's history from Adam to David, with focus on worship and the Davidic covenant.", themes: ["Worship", "Davidic Line", "God's Plan", "Temple"], keyVerses: ["1 Chr 16:23", "1 Chr 29:11"] },
  "2 Chronicles": { summary: "From Solomon's temple to the exile — emphasizing spiritual revival and the importance of seeking God.", themes: ["Temple Worship", "Revival", "Seeking God", "Covenant"], keyVerses: ["2 Chr 7:14", "2 Chr 20:12"] },
  Ezra: { summary: "The return of Jewish exiles from Babylon and the rebuilding of the Temple under Ezra's spiritual leadership.", themes: ["Restoration", "Worship", "God's Word", "Repentance"], keyVerses: ["Ezra 7:10", "Ezra 9:6"] },
  Nehemiah: { summary: "Nehemiah leads the rebuilding of Jerusalem's walls and spiritual renewal of the returned community.", themes: ["Leadership", "Prayer", "Rebuilding", "Community"], keyVerses: ["Neh 1:6", "Neh 8:10"] },
  Esther: { summary: "Esther risks her life to save the Jewish people from Haman's genocide in the Persian court.", themes: ["Providence", "Courage", "Deliverance", "Identity"], keyVerses: ["Esth 4:14", "Esth 9:22"] },
  Job: { summary: "A righteous man suffers and wrestles with the mystery of pain, ultimately encountering God's majesty.", themes: ["Suffering", "Faith", "God's Sovereignty", "Wisdom", "Restoration"], keyVerses: ["Job 1:21", "Job 19:25", "Job 38:4"] },
  Psalms: { summary: "150 songs and prayers covering the full range of human emotion — praise, lament, thanksgiving, and trust in God.", themes: ["Praise", "Lament", "Messianic Hope", "Trust", "God's Word"], keyVerses: ["Ps 23:1", "Ps 119:105", "Ps 46:10"] },
  Proverbs: { summary: "Practical wisdom for godly living — hundreds of short sayings on work, relationships, speech, and character.", themes: ["Wisdom", "Fear of God", "Character", "Practical Living"], keyVerses: ["Prov 1:7", "Prov 3:5-6", "Prov 31:30"] },
  Ecclesiastes: { summary: "Reflections on life's apparent futility 'under the sun,' concluding that fearing God and keeping His commands is the whole duty of man.", themes: ["Meaning of Life", "Vanity", "Wisdom", "Fear of God"], keyVerses: ["Eccl 1:2", "Eccl 3:1", "Eccl 12:13"] },
  "Song of Solomon": { summary: "A poetic celebration of love between a bride and groom, often interpreted as depicting God's love for His people.", themes: ["Love", "Marriage", "Devotion", "God's Love"], keyVerses: ["Song 2:16", "Song 8:7"] },
  Isaiah: { summary: "The great prophet of salvation — judgment on Israel, promises of restoration, and sweeping prophecies of the coming Messiah.", themes: ["Judgment", "Salvation", "Messianic Prophecy", "Holy God", "Comfort"], keyVerses: ["Isa 9:6", "Isa 40:31", "Isa 53:5", "Isa 55:6"] },
  Jeremiah: { summary: "The 'weeping prophet' calls Judah to repentance before Babylon's inevitable judgment, and promises a New Covenant.", themes: ["Judgment", "New Covenant", "Repentance", "God's Heart", "Suffering"], keyVerses: ["Jer 29:11", "Jer 31:31-34"] },
  Lamentations: { summary: "Poetic laments over the destruction of Jerusalem by Babylon — sorrow and hope amid ruin.", themes: ["Grief", "Judgment", "Hope", "Faithfulness"], keyVerses: ["Lam 3:22-23", "Lam 3:40"] },
  Ezekiel: { summary: "Visions, parables, and prophecies to the exiles in Babylon — God's glory departing and returning, the dry bones, and the new temple.", themes: ["God's Glory", "Judgment", "Restoration", "New Life"], keyVerses: ["Ezek 36:26", "Ezek 37:1-14"] },
  Daniel: { summary: "Daniel's faithfulness in Babylon, prophetic visions of world empires, and God's ultimate kingdom that will never be destroyed.", themes: ["Faithfulness", "God's Sovereignty", "End Times", "Kingdom of God"], keyVerses: ["Dan 3:17-18", "Dan 7:13-14"] },
  Hosea: { summary: "God commands Hosea to marry an unfaithful wife as a living parable of Israel's spiritual adultery and God's persistent love.", themes: ["God's Love", "Unfaithfulness", "Restoration", "Marriage"], keyVerses: ["Hos 6:6", "Hos 11:1"] },
  Joel: { summary: "A locust plague serves as a call to repentance and foreshadows the Day of the Lord and the outpouring of God's Spirit.", themes: ["Repentance", "Day of the Lord", "Holy Spirit", "Restoration"], keyVerses: ["Joel 2:13", "Joel 2:28-29"] },
  Amos: { summary: "A shepherd prophet rebukes the prosperous but unjust northern kingdom, emphasizing God's demand for justice over empty ritual.", themes: ["Justice", "Judgment", "Social Ethics", "True Worship"], keyVerses: ["Amos 5:24"] },
  Obadiah: { summary: "A short prophecy against Edom for gloating over Judah's destruction, promising judgment and Israel's restoration.", themes: ["Judgment", "Pride", "God's Justice"], keyVerses: ["Obad 1:15"] },
  Jonah: { summary: "A reluctant prophet, a great fish, and God's mercy extended to the Assyrian city of Nineveh — showing God's compassion for all people.", themes: ["God's Mercy", "Repentance", "Missions", "Obedience"], keyVerses: ["Jonah 4:2"] },
  Micah: { summary: "Judgment against corrupt leaders and false prophets, with promises of future restoration and a coming ruler from Bethlehem.", themes: ["Justice", "Messianic Hope", "Judgment", "Restoration"], keyVerses: ["Mic 5:2", "Mic 6:8"] },
  Nahum: { summary: "Nineveh's doom is declared — God's vengeance against Assyria for its cruelty is sure and total.", themes: ["God's Justice", "Judgment", "God's Power"], keyVerses: ["Nah 1:7"] },
  Habakkuk: { summary: "A prophet wrestles honestly with why God allows evil, and comes to trust in God's sovereign purposes.", themes: ["Faith", "God's Sovereignty", "Justice", "Trust"], keyVerses: ["Hab 2:4", "Hab 3:17-18"] },
  Zephaniah: { summary: "The coming Day of the Lord brings judgment on Judah and surrounding nations, but ends with a joyful song of restoration.", themes: ["Judgment", "Day of the Lord", "Restoration", "Humility"], keyVerses: ["Zeph 3:17"] },
  Haggai: { summary: "The returned exiles are called to prioritize rebuilding God's temple rather than their own comfortable homes.", themes: ["Priorities", "Worship", "God's Presence", "Obedience"], keyVerses: ["Hag 1:7", "Hag 2:9"] },
  Zechariah: { summary: "Eight night visions and messianic prophecies encouraging the returned exiles and pointing to Christ's first and second coming.", themes: ["Messianic Prophecy", "Restoration", "God's Kingdom", "Repentance"], keyVerses: ["Zech 9:9", "Zech 13:1"] },
  Malachi: { summary: "God's final Old Testament message — rebuking priests and people for corrupt worship and calling them to return to Him.", themes: ["Covenant Faithfulness", "True Worship", "Tithing", "Elijah's Coming"], keyVerses: ["Mal 3:10", "Mal 4:2"] },
  Matthew: { summary: "Written for a Jewish audience, Matthew presents Jesus as the fulfillment of Old Testament prophecy — the promised Messiah and King.", themes: ["Jesus as Messiah", "Kingdom of Heaven", "Discipleship", "Fulfillment"], keyVerses: ["Matt 5:3-12", "Matt 28:18-20", "Matt 6:33"] },
  Mark: { summary: "The shortest Gospel, written with urgency — emphasizing Jesus as the suffering Servant who acts with authority.", themes: ["Service", "Miracles", "Suffering Servant", "Faith"], keyVerses: ["Mark 10:45", "Mark 1:15"] },
  Luke: { summary: "Written by a physician, Luke emphasizes Jesus' compassion for the outcast, women, the poor, and Gentiles.", themes: ["Compassion", "Salvation for All", "Prayer", "Holy Spirit", "Joy"], keyVerses: ["Luke 15:7", "Luke 19:10", "Luke 4:18"] },
  John: { summary: "The most theological Gospel — John presents Jesus as the eternal Word of God through seven signs and the 'I Am' declarations.", themes: ["Jesus as God", "Eternal Life", "Belief", "Love", "Light vs. Darkness"], keyVerses: ["John 3:16", "John 14:6", "John 1:1"] },
  Acts: { summary: "Luke's sequel — the birth of the Church, the spread of the gospel from Jerusalem to Rome, powered by the Holy Spirit.", themes: ["Holy Spirit", "Church", "Missions", "Apostolic Ministry"], keyVerses: ["Acts 1:8", "Acts 2:42", "Acts 4:12"] },
  Romans: { summary: "Paul's most systematic letter — the gospel of righteousness by faith, humanity's sin, justification, sanctification, and God's plan for Israel.", themes: ["Justification by Faith", "Sin", "Grace", "Election", "Practical Holiness"], keyVerses: ["Rom 1:16", "Rom 3:23", "Rom 8:28", "Rom 12:1-2"] },
  "1 Corinthians": { summary: "Paul corrects divisions, immorality, and abuses of spiritual gifts in the Corinthian church, and teaches on the resurrection.", themes: ["Unity", "Spiritual Gifts", "Love", "Resurrection", "Ethics"], keyVerses: ["1 Cor 13:4-7", "1 Cor 15:55"] },
  "2 Corinthians": { summary: "Paul defends his apostleship and ministry of suffering, and urges the church to give generously.", themes: ["Suffering", "Ministry", "Giving", "New Creation"], keyVerses: ["2 Cor 5:17", "2 Cor 12:9"] },
  Galatians: { summary: "Paul passionately defends justification by faith alone against those who added works of the law.", themes: ["Grace", "Justification", "Freedom", "Fruit of the Spirit"], keyVerses: ["Gal 2:20", "Gal 5:22-23"] },
  Ephesians: { summary: "Paul presents the mystery of the Church as the body of Christ, saved by grace, and called to unity and spiritual warfare.", themes: ["Grace", "Unity", "Spiritual Warfare", "Church", "Marriage"], keyVerses: ["Eph 2:8-9", "Eph 6:11", "Eph 3:20"] },
  Philippians: { summary: "A joyful letter from prison — Paul urges contentment, humility, and fixing the mind on what is true.", themes: ["Joy", "Humility", "Contentment", "Unity", "Peace"], keyVerses: ["Phil 4:13", "Phil 4:6-7", "Phil 2:5-8"] },
  Colossians: { summary: "Christ is supreme over all creation and powers — Paul counters false teaching by exalting the sufficiency of Christ.", themes: ["Supremacy of Christ", "False Teaching", "New Life", "Holiness"], keyVerses: ["Col 1:15-20", "Col 3:1-2"] },
  "1 Thessalonians": { summary: "Paul encourages a young church under persecution and instructs them about Christ's second coming.", themes: ["Encouragement", "Second Coming", "Holiness", "Work"], keyVerses: ["1 Thes 5:16-18", "1 Thes 4:16-17"] },
  "2 Thessalonians": { summary: "Paul clarifies misconceptions about the Day of the Lord and urges faithful, disciplined waiting.", themes: ["Second Coming", "Perseverance", "Work", "Judgment"], keyVerses: ["2 Thes 3:10"] },
  "1 Timothy": { summary: "Paul instructs young Timothy on church order, leadership qualifications, sound doctrine, and worship.", themes: ["Church Leadership", "Sound Doctrine", "Godliness", "Prayer"], keyVerses: ["1 Tim 2:5", "1 Tim 6:12"] },
  "2 Timothy": { summary: "Paul's final letter — his last words to Timothy, urging faithfulness in ministry despite suffering.", themes: ["Endurance", "Scripture", "Faithfulness", "Ministry"], keyVerses: ["2 Tim 3:16-17", "2 Tim 4:7"] },
  Titus: { summary: "Instructions for church order in Crete — qualified elders, sound teaching, and godly living that reflects the gospel.", themes: ["Sound Doctrine", "Good Works", "Grace", "Church Order"], keyVerses: ["Titus 2:11-12"] },
  Philemon: { summary: "Paul appeals to Philemon to receive back his runaway slave Onesimus as a brother in Christ.", themes: ["Forgiveness", "Reconciliation", "Brotherhood", "Grace"], keyVerses: ["Phlm 1:16"] },
  Hebrews: { summary: "Christ is superior to angels, Moses, the priesthood, and the old covenant — an extended argument for persevering faith.", themes: ["Supremacy of Christ", "Faith", "Priesthood", "New Covenant", "Perseverance"], keyVerses: ["Heb 11:1", "Heb 4:12", "Heb 12:1-2"] },
  James: { summary: "Practical Christianity — faith without works is dead; wisdom, speech, and social justice all matter.", themes: ["Faith and Works", "Wisdom", "Prayer", "Social Justice", "Patience"], keyVerses: ["Jas 1:22", "Jas 2:17", "Jas 5:16"] },
  "1 Peter": { summary: "Encouragement to scattered Christians suffering persecution — a call to holy living and hope in Christ's return.", themes: ["Suffering", "Hope", "Holiness", "Submission", "Witness"], keyVerses: ["1 Pet 3:15", "1 Pet 5:7"] },
  "2 Peter": { summary: "Warnings against false teachers and a call to grow in knowledge and virtue while awaiting the Day of the Lord.", themes: ["False Teaching", "Growth", "Second Coming", "Judgment"], keyVerses: ["2 Pet 1:20-21", "2 Pet 3:9"] },
  "1 John": { summary: "Tests of true Christianity — loving one another, keeping His commands, and believing in the Incarnation.", themes: ["Love", "Assurance", "Light vs. Darkness", "Abiding in Christ"], keyVerses: ["1 Jn 4:8", "1 Jn 1:9", "1 Jn 5:13"] },
  "2 John": { summary: "A brief letter urging the elect lady to continue in love and truth while guarding against false teachers.", themes: ["Love", "Truth", "Discernment"], keyVerses: ["2 Jn 1:6"] },
  "3 John": { summary: "Personal praise for Gaius' hospitality toward traveling ministers and rebuke of Diotrephes' pride.", themes: ["Hospitality", "Leadership", "Truth"], keyVerses: ["3 Jn 1:4"] },
  Jude: { summary: "A short but fierce warning about false teachers who have crept into the church — a call to contend for the faith.", themes: ["False Teaching", "Contending for Faith", "Judgment", "Mercy"], keyVerses: ["Jude 1:3", "Jude 1:24-25"] },
  Revelation: { summary: "A vision given to John — the ultimate triumph of Christ over Satan, judgment, and the new heaven and new earth.", themes: ["Triumph of Christ", "Judgment", "Worship", "New Creation", "End Times"], keyVerses: ["Rev 1:8", "Rev 21:4", "Rev 22:20"] },
};

const CATEGORY_COLORS = {
  'Law': 'bg-yellow-100 text-yellow-800',
  'History': 'bg-orange-100 text-orange-800',
  'Poetry': 'bg-pink-100 text-pink-800',
  'Major Prophets': 'bg-purple-100 text-purple-800',
  'Minor Prophets': 'bg-violet-100 text-violet-800',
  'Gospels': 'bg-blue-100 text-blue-800',
  'NT History': 'bg-cyan-100 text-cyan-800',
  'Pauline Epistles': 'bg-green-100 text-green-800',
  'General Epistles': 'bg-teal-100 text-teal-800',
  'Prophecy': 'bg-red-100 text-red-800',
};

export default function BookDetailModal({ book, open, onClose }) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDetails, setAiDetails] = useState(null);

  if (!book) return null;

  const staticData = BOOK_DATA[book.name] || {};

  const loadAIInsights = async () => {
    if (aiDetails) return;
    setLoadingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Give me a historical and authorship overview for the Bible book of ${book.name}.
Include: who wrote it, when (approximate date), historical context, audience it was written to, and 1-2 interesting facts.
Keep it to 3-4 sentences total. Be accurate and scholarly but accessible.`,
        response_json_schema: {
          type: 'object',
          properties: {
            authorship: { type: 'string' },
            historical_context: { type: 'string' },
            interesting_fact: { type: 'string' }
          }
        }
      });
      setAiDetails(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Use normalized _testament if available, fallback to raw */}
            {(() => {
              const t = book._testament || (book.testament?.toLowerCase().includes('haaraa') || book.testament === 'NT' ? 'NT' : 'OT');
              return (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${t === 'NT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {book._order || book.order_number || book.canonical_order}
              </div>
            );})()}
            <div>
              <DialogTitle className="text-xl">{book._name || book.name_en || book.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                {(() => {
                  const t = book._testament || (book.testament?.toLowerCase().includes('haaraa') || book.testament === 'NT' ? 'NT' : 'OT');
                  return (
                    <Badge className={`text-xs ${t === 'NT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                      {t === 'NT' ? 'New Testament' : 'Old Testament'}
                    </Badge>
                  );
                })()}
                <Badge className={`text-xs ${CATEGORY_COLORS[book.category] || 'bg-gray-100 text-gray-800'}`}>
                  {book.category}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{book._chapters || book.chapters_count || book.chapter_count || '—'}</p>
              <p className="text-xs text-gray-500">Chapters</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-gray-800 leading-tight">{book.author || 'Unknown'}</p>
              <p className="text-xs text-gray-500">Author</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs font-bold text-gray-800 leading-tight">{book.period || '—'}</p>
              <p className="text-xs text-gray-500">Period</p>
            </div>
          </div>

          {/* Summary */}
          {staticData.summary && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Overview
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{staticData.summary}</p>
            </div>
          )}

          {/* Key Themes */}
          {staticData.themes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-500" /> Key Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {staticData.themes.map(t => (
                  <span key={t} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-200">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Key Verses */}
          {staticData.keyVerses && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-green-500" /> Key Verses
              </h3>
              <div className="flex flex-wrap gap-2">
                {staticData.keyVerses.map(v => (
                  <Link
                    key={v}
                    to={createPageUrl(`BibleReader?verse=${encodeURIComponent(v)}`)}
                    onClick={onClose}
                    className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    {v} <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI Historical Context */}
          <div className="border border-dashed border-indigo-200 rounded-lg p-4 bg-indigo-50/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-indigo-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Historical & Authorship Context
              </h3>
              {!aiDetails && (
                <Button size="sm" variant="outline" onClick={loadAIInsights} disabled={loadingAI} className="text-xs h-7 border-indigo-300 text-indigo-700">
                  {loadingAI ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  {loadingAI ? 'Loading...' : 'Load AI Insights'}
                </Button>
              )}
            </div>
            {book.period && book.author && !aiDetails && (
              <p className="text-xs text-indigo-700">
                <strong>Author:</strong> {book.author} &nbsp;|&nbsp; <strong>Period:</strong> {book.period}
              </p>
            )}
            {aiDetails && (
              <div className="space-y-2 text-xs text-indigo-800">
                {aiDetails.authorship && <p><strong>Authorship:</strong> {aiDetails.authorship}</p>}
                {aiDetails.historical_context && <p><strong>Context:</strong> {aiDetails.historical_context}</p>}
                {aiDetails.interesting_fact && <p><strong>Interesting Fact:</strong> {aiDetails.interesting_fact}</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Link to="/BibleReaderPage" onClick={onClose} className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                <BookOpen className="w-4 h-4" /> Read
              </Button>
            </Link>
            <Link to="/AudioBiblePage" onClick={onClose} className="flex-1">
              <Button variant="outline" className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Volume2 className="w-4 h-4" /> Listen
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}