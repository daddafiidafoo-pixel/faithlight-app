import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const OROMO_HOOKS = [
  { emoji: '😳', type: 'Prayer', text: 'Appiin kun kadhannaa Afaan Oromoon siif uuma 😳', translation: 'This app creates prayers in Oromo 😳', hot: true },
  { emoji: '🙏', type: 'Emotional', text: 'Yeroo rakkoo keessa jirtu kana dhaggeeffadhu 🙏', translation: 'Listen to this when you are in trouble' },
  { emoji: '🙌', type: 'Identity', text: 'Dhumarratti… Appii Kiristaanaa Afaan Oromoon 🙌', translation: 'Finally… a Christian app in Oromo 🙌', hot: true },
  { emoji: '🤯', type: 'Sermon', text: 'Lallaba sekondii 30 keessatti qopheessi 🤯', translation: 'Prepare a sermon in 30 seconds 🤯' },
  { emoji: '📖', type: 'Bible', text: 'Barreeffama Macaafa Qulqulluu battalatti argadhu 📖', translation: 'Find Bible verses instantly' },
  { emoji: '✨', type: 'Curiosity', text: 'Appiin kun waan ajaa\'iba siif hojjeta…', translation: 'This app does something amazing…' },
  { emoji: '🙏', type: 'Testimony', text: 'Ani appii kana fayyadame… jireenyi koo jijjiirame 🙏', translation: 'I used this app… my life changed' },
  { emoji: '🙏', type: 'Daily', text: 'Guyyaa guyyaan kana fayyadamuu qabda 🙏', translation: 'You should use this every day' },
];

const AMHARIC_HOOKS = [
  { emoji: '😳', type: 'Prayer', text: 'ይህ አፕ በአማርኛ ጸሎት ይፈጥራል 😳', translation: 'This app creates prayers in Amharic 😳', hot: true },
  { emoji: '🙏', type: 'Emotional', text: 'ጭንቀት ካለብህ ይህን ተመልከት 🙏', translation: 'If you are anxious, watch this' },
  { emoji: '🙌', type: 'Identity', text: 'በመጨረሻ… በአማርኛ የሚሰራ ክርስቲያናዊ አፕ 🙌', translation: 'Finally… a Christian app in Amharic 🙌', hot: true },
  { emoji: '🤯', type: 'Sermon', text: 'ስብከት በ30 ሰከንድ ያዘጋጁ 🤯', translation: 'Prepare a sermon in 30 seconds 🤯' },
  { emoji: '📖', type: 'Bible', text: 'የመጽሐፍ ቅዱስ ቃል በፍጥነት ያግኙ 📖', translation: 'Find Bible verses instantly' },
  { emoji: '✨', type: 'Curiosity', text: 'ይህ አፕ አስገራሚ ነው…', translation: 'This app is amazing…' },
  { emoji: '🙏', type: 'Testimony', text: 'ይህን አፕ ከተጠቀምኩ በኋላ… 🙏', translation: 'After I used this app…' },
  { emoji: '🙏', type: 'Daily', text: 'በየቀኑ ይህን ይጠቀሙ 🙏', translation: 'Use this every day' },
];

function HookCard({ hook, onCopy, copied }) {
  const id = `hook-${hook.text}`;
  return (
    <div className={`relative rounded-xl border p-3 ${hook.hot ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
      {hook.hot && (
        <span className="absolute -top-2 -right-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">🔥 Start here</span>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block ${hook.hot ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
            {hook.type}
          </span>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{hook.text}</p>
          <p className="text-xs text-gray-500 mt-0.5 italic">{hook.translation}</p>
        </div>
        <button
          onClick={() => onCopy(hook.text, id)}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          aria-label="Copy hook"
        >
          {copied === id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
        </button>
      </div>
    </div>
  );
}

export default function NativeHooksSection({ onCopy, copied, onShare }) {
  const [activeTab, setActiveTab] = useState('om');

  const hooks = activeTab === 'om' ? OROMO_HOOKS : AMHARIC_HOOKS;
  const tabLabel = activeTab === 'om' ? 'Afaan Oromoo' : 'Amharic';

  const copyAll = () => {
    const allText = hooks.map(h => h.text).join('\n\n');
    navigator.clipboard.writeText(allText);
    toast.success(`All ${tabLabel} hooks copied!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇪🇹</span>
          <p className="font-bold text-gray-900 text-sm">Native Language Hooks</p>
        </div>
        <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Your #1 advantage</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">These hooks go viral in diaspora communities — use them as-is, don't translate</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('om')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${activeTab === 'om' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}
        >
          🌿 Afaan Oromoo
        </button>
        <button
          onClick={() => setActiveTab('am')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${activeTab === 'am' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500 hover:border-yellow-300'}`}
        >
          ⭐ Amharic
        </button>
      </div>

      {/* Video structure reminder */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4 text-xs text-indigo-800 leading-relaxed">
        <p className="font-bold mb-1">🎬 Video structure (7–15 sec)</p>
        <p>1. Hook text on screen (2 sec) → 2. Show app → 3. Show prayer/result → 4. <strong>"Search FaithLight"</strong></p>
      </div>

      {/* Hook cards */}
      <div className="space-y-2 mb-4">
        {hooks.map((hook, i) => (
          <HookCard key={i} hook={hook} onCopy={onCopy} copied={copied} />
        ))}
      </div>

      {/* Copy all */}
      <div className="flex gap-2">
        <button
          onClick={copyAll}
          className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
        >
          <Copy className="w-4 h-4" /> Copy All {tabLabel} Hooks
        </button>
        <button
          onClick={() => onShare('whatsapp', `FaithLight ${tabLabel} hooks 🔥\n\n${hooks.map(h => h.text).join('\n\n')}`)}
          className="px-4 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          💬
        </button>
      </div>

      {/* Pro tip */}
      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-800 font-bold">⚡ Pro tip</p>
        <p className="text-xs text-amber-700 mt-0.5">Don't translate English content — create directly in Oromo & Amharic. That's what makes it viral.</p>
      </div>
    </div>
  );
}