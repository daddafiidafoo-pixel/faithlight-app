import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Star, Send, BookOpen, Heart, Sparkles, ChevronRight, Check, MessageCircle, Globe, Target } from 'lucide-react';

const LANGUAGES = ['English', 'Afaan Oromoo', 'Amharic (አማርኛ)', 'Kiswahili', 'Français', 'Arabic'];
const INTERESTS = ['Prayer', 'Bible Study', 'Evangelism', 'Youth Ministry', 'Theology', 'Worship', 'Discipleship', 'Family'];
const XP_KEY = 'fl_xp_data';

// Mock mentor profiles
const MOCK_MENTORS = [
  { id: 'm1', name: 'Elder Samuel Tadesse', lang: 'Amharic (አማርኛ)', specialty: 'Prayer & Intercession', interests: ['Prayer', 'Discipleship'], xp: 2400, rating: 4.9, bio: 'Over 15 years of ministry experience in Addis Ababa. I guide believers in deep prayer life and spiritual formation.', available: true, avatar: '🙏' },
  { id: 'm2', name: 'Pastor Grace Muluneh', lang: 'Afaan Oromoo', specialty: 'Bible Study & Theology', interests: ['Bible Study', 'Theology'], xp: 1800, rating: 4.8, bio: 'Oromoo pastor with a passion for expository teaching and mentoring new believers.', available: true, avatar: '📖' },
  { id: 'm3', name: 'Rev. James Okwuosa', lang: 'English', specialty: 'Evangelism & Youth', interests: ['Evangelism', 'Youth Ministry'], xp: 3100, rating: 5.0, bio: 'Youth pastor focused on equipping the next generation for global mission.', available: true, avatar: '✝️' },
  { id: 'm4', name: 'Sister Marie Dubois', lang: 'Français', specialty: 'Worship & Spiritual Growth', interests: ['Worship', 'Discipleship'], xp: 990, rating: 4.7, bio: 'Worship leader and spiritual director from Lyon with a heart for holistic discipleship.', available: false, avatar: '🎵' },
];

const MSG_KEY = 'fl_mentorship_msgs';
const PAIR_KEY = 'fl_mentorship_pair';
const PROFILE_KEY = 'fl_mentorship_profile';

function getMsgs() { try { return JSON.parse(localStorage.getItem(MSG_KEY) || '[]'); } catch { return []; } }
function getPair() { try { return JSON.parse(localStorage.getItem(PAIR_KEY) || 'null'); } catch { return null; } }
function getProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; } }

function addXP(amount, label) {
  const d = JSON.parse(localStorage.getItem(XP_KEY) || '{}');
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(XP_KEY, JSON.stringify({ ...d, totalXP: (d.totalXP || 0) + amount, log: [{ action: 'mentorship', xp: amount, label, at: today }, ...(d.log || [])].slice(0, 30) }));
}

function StarRating({ val }) {
  return <span className="text-amber-400 text-xs">{'★'.repeat(Math.round(val))}{'☆'.repeat(5 - Math.round(val))}</span>;
}

function MentorCard({ mentor, onConnect, connected }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${connected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100 hover:border-indigo-100'}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">{mentor.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{mentor.name}</p>
            {connected && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">Your Mentor</span>}
            {!mentor.available && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Unavailable</span>}
          </div>
          <p className="text-xs text-indigo-600 font-semibold">{mentor.specialty}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating val={mentor.rating} />
            <span className="text-xs text-gray-400">{mentor.rating}</span>
            <span className="text-xs text-gray-300">·</span>
            <Globe size={10} className="text-gray-400" />
            <span className="text-xs text-gray-500">{mentor.lang}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-3">{mentor.bio}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {mentor.interests.map(i => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{i}</span>)}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-indigo-500 font-semibold">⭐ {mentor.xp.toLocaleString()} XP</span>
        {connected ? (
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold" onClick={() => onConnect(mentor, true)}>
            <MessageCircle size={12} /> Message
          </button>
        ) : (
          <button disabled={!mentor.available}
            onClick={() => onConnect(mentor, false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default function MentorshipHub() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('find'); // find | chat | offer
  const [profile, setProfile] = useState(getProfile);
  const [pair, setPair] = useState(getPair);
  const [messages, setMessages] = useState(getMsgs);
  const [input, setInput] = useState('');
  const [shareType, setShareType] = useState(null); // 'prayer' | 'verse' | 'note'
  const [shareText, setShareText] = useState('');
  const [sharedPrayers, setSharedPrayers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_shared_prayers') || '[]'); } catch { return []; }
  });
  const [xpToast, setXpToast] = useState(null);
  const [offerForm, setOfferForm] = useState({ lang: 'English', interests: [], bio: '' });
  const [offered, setOffered] = useState(() => !!localStorage.getItem('fl_mentor_offer'));
  const [aiMatches, setAiMatches] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [profileForm, setProfileForm] = useState({ lang: 'English', interests: [], goals: '' });
  const [profileSaved, setProfileSaved] = useState(!!getProfile());
  const bottomRef = useRef(null);

  useEffect(() => { base44.auth.me().then(u => setUser(u)).catch(() => {}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const showXP = (msg) => { setXpToast(msg); setTimeout(() => setXpToast(null), 2500); };

  const saveProfile = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileForm));
    setProfile(profileForm);
    setProfileSaved(true);
  };

  const findAIMatches = async () => {
    setLoadingMatch(true);
    try {
      const p = profile || profileForm;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a spiritual mentorship matcher. A user has the following profile:
Language: ${p.lang}
Interests: ${(p.interests || []).join(', ')}
Goals: ${p.goals}

Available mentors: ${JSON.stringify(MOCK_MENTORS.map(m => ({ id: m.id, name: m.name, lang: m.lang, specialty: m.specialty, interests: m.interests, bio: m.bio })))}

Return a JSON object with "matches" (array of mentor IDs ordered by best match) and "reasons" (object mapping mentor ID to a 1-sentence reason why they match). Be concise.`,
        response_json_schema: {
          type: 'object',
          properties: {
            matches: { type: 'array', items: { type: 'string' } },
            reasons: { type: 'object' },
          }
        }
      });
      setAiMatches(res);
    } catch (e) {
      setAiMatches({ matches: MOCK_MENTORS.map(m => m.id), reasons: {} });
    } finally {
      setLoadingMatch(false);
    }
  };

  const connectMentor = (mentor, openChat) => {
    const newPair = { mentor, connectedAt: new Date().toISOString() };
    localStorage.setItem(PAIR_KEY, JSON.stringify(newPair));
    setPair(newPair);
    addXP(25, 'Connected with a mentor');
    showXP('+25 XP — Mentorship connection! 🙌');
    setTab('chat');
  };

  const sendMessage = (content, type = 'text') => {
    const text = (content || input).trim();
    if (!text) return;
    const msg = { id: Date.now(), from: 'me', text, type, timestamp: new Date().toISOString() };
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem(MSG_KEY, JSON.stringify(updated));
    setInput('');
    setShareText('');
    setShareType(null);
    addXP(5, 'Mentor message sent');
  };

  const addSharedPrayer = () => {
    if (!shareText.trim()) return;
    const p = { id: Date.now(), text: shareText.trim(), addedAt: new Date().toISOString() };
    const updated = [p, ...sharedPrayers];
    setSharedPrayers(updated);
    localStorage.setItem('fl_shared_prayers', JSON.stringify(updated));
    sendMessage(`🙏 Shared a prayer: "${shareText.trim()}"`, 'prayer');
    addXP(10, 'Shared a prayer with mentor');
    showXP('+10 XP — Prayer shared! 🙏');
  };

  const orderedMentors = aiMatches
    ? aiMatches.matches.map(id => MOCK_MENTORS.find(m => m.id === id)).filter(Boolean)
    : MOCK_MENTORS;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {xpToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm">{xpToast}</div>
      )}

      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users size={20} className="text-indigo-500" /> Mentorship Hub</h1>
          <p className="text-xs text-gray-500 mt-0.5">Find a mentor, offer mentorship, and grow together in faith</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-4">
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-5 gap-1">
          {[['find', '🔍 Find Mentor'], ['chat', '💬 My Mentor'], ['offer', '🌱 Offer Mentorship']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>{label}</button>
          ))}
        </div>

        {/* Find Mentor Tab */}
        {tab === 'find' && (
          <div className="space-y-4">
            {/* Profile setup */}
            {!profileSaved && (
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" /> Set your profile for AI matching</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Language Preference</label>
                    <select value={profileForm.lang} onChange={e => setProfileForm(f => ({ ...f, lang: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Interests</label>
                    <div className="flex flex-wrap gap-1.5">
                      {INTERESTS.map(i => (
                        <button key={i} type="button"
                          onClick={() => setProfileForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] }))}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${profileForm.interests.includes(i) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Study Goals</label>
                    <textarea value={profileForm.goals} onChange={e => setProfileForm(f => ({ ...f, goals: e.target.value }))}
                      placeholder="What are you hoping to grow in?"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="flex-1 py-2.5 rounded-xl bg-gray-800 text-white font-semibold text-sm">Save Profile</button>
                    <button onClick={() => { saveProfile(); findAIMatches(); }} disabled={loadingMatch}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-60">
                      {loadingMatch ? <span className="animate-spin">⟳</span> : <Sparkles size={13} />} AI Match
                    </button>
                  </div>
                </div>
              </div>
            )}
            {profileSaved && (
              <button onClick={findAIMatches} disabled={loadingMatch}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {loadingMatch ? <><span className="animate-spin">⟳</span> Finding best matches…</> : <><Sparkles size={15} /> Re-run AI Matching</>}
              </button>
            )}

            {aiMatches && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 text-xs text-indigo-700 font-semibold">
                ✨ AI matched {aiMatches.matches?.length} mentors based on your language, interests, and goals
              </div>
            )}

            {orderedMentors.map(mentor => (
              <div key={mentor.id}>
                {aiMatches?.reasons?.[mentor.id] && (
                  <p className="text-xs text-indigo-500 font-medium px-1 mb-1">💡 {aiMatches.reasons[mentor.id]}</p>
                )}
                <MentorCard mentor={mentor} connected={pair?.mentor?.id === mentor.id} onConnect={connectMentor} />
              </div>
            ))}
          </div>
        )}

        {/* Chat Tab */}
        {tab === 'chat' && (
          <div>
            {!pair ? (
              <div className="text-center py-16 text-gray-400">
                <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No mentor connected yet.</p>
                <button onClick={() => setTab('find')} className="mt-3 text-indigo-600 text-sm font-semibold">Find a Mentor →</button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mentor info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-2xl flex items-center justify-center">{pair.mentor.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{pair.mentor.name}</p>
                    <p className="text-xs text-indigo-600">{pair.mentor.specialty}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Connected</span>
                </div>

                {/* Shared prayer log */}
                {sharedPrayers.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-rose-700 mb-2">🙏 Shared Prayer Log</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {sharedPrayers.map(p => (
                        <p key={p.id} className="text-xs text-rose-700 bg-white rounded-xl px-3 py-2">🙏 {p.text}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="bg-white rounded-2xl border border-gray-100 min-h-64 max-h-80 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-8">Start a conversation with your mentor</p>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.from === 'me' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Share tools */}
                {shareType && (
                  <div className="bg-white rounded-2xl border border-indigo-100 p-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      {shareType === 'prayer' ? '🙏 Add to shared prayer log' : shareType === 'verse' ? '📖 Share a scripture' : '📝 Share a study note'}
                    </p>
                    <textarea value={shareText} onChange={e => setShareText(e.target.value)}
                      placeholder={shareType === 'prayer' ? 'Write a prayer…' : shareType === 'verse' ? 'Verse reference or text…' : 'Note or reflection…'}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => shareType === 'prayer' ? addSharedPrayer() : sendMessage(`${shareType === 'verse' ? '📖' : '📝'} ${shareText}`, shareType)}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs">Share</button>
                      <button onClick={() => { setShareType(null); setShareText(''); }}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Quick share buttons */}
                <div className="flex gap-2">
                  {[['prayer', '🙏 Prayer', 'bg-rose-50 text-rose-600 border-rose-100'], ['verse', '📖 Verse', 'bg-blue-50 text-blue-600 border-blue-100'], ['note', '📝 Note', 'bg-amber-50 text-amber-600 border-amber-100']].map(([type, label, cls]) => (
                    <button key={type} onClick={() => setShareType(t => t === type ? null : type)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold ${cls} ${shareType === type ? 'ring-1 ring-offset-1 ring-indigo-400' : ''}`}>{label}</button>
                  ))}
                </div>

                {/* Text input */}
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  <button onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Offer Mentorship Tab */}
        {tab === 'offer' && (
          <div>
            {offered ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                <h3 className="font-bold text-gray-900 mb-2">You're listed as a mentor!</h3>
                <p className="text-sm text-gray-500 mb-4">Other users can find and connect with you based on your profile.</p>
                <button onClick={() => { localStorage.removeItem('fl_mentor_offer'); setOffered(false); }}
                  className="text-xs text-gray-400 underline">Remove my listing</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">Offer to Mentor Others</h3>
                <p className="text-sm text-gray-500">Share your faith journey to guide others. You'll earn XP for each mentorship session.</p>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Language</label>
                  <select value={offerForm.lang} onChange={e => setOfferForm(f => ({ ...f, lang: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Your Strengths</label>
                  <div className="flex flex-wrap gap-1.5">
                    {INTERESTS.map(i => (
                      <button key={i} type="button"
                        onClick={() => setOfferForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] }))}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${offerForm.interests.includes(i) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Short Bio</label>
                  <textarea value={offerForm.bio} onChange={e => setOfferForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell potential mentees about your faith journey…"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
                <button onClick={() => { localStorage.setItem('fl_mentor_offer', JSON.stringify(offerForm)); setOffered(true); addXP(50, 'Offered to be a mentor'); showXP('+50 XP — Mentor listing created! 🌱'); }}
                  className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm">
                  🌱 Become a Mentor
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}