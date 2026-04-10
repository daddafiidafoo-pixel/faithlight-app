import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Church, Users, BookOpen, MessageCircle, Share2, CheckCircle, ArrowRight, Zap, Globe, Heart } from 'lucide-react';

const STEPS = [
  { icon: Church, color: 'bg-indigo-100 text-indigo-600', num: '1', title: 'Start Church Mode', desc: 'Create your church and start a sermon session in under 2 minutes.' },
  { icon: Share2, color: 'bg-green-100 text-green-600', num: '2', title: 'Share the Join Code', desc: 'Share a simple code via WhatsApp or display it on screen for your congregation.' },
  { icon: Users, color: 'bg-amber-100 text-amber-700', num: '3', title: 'Congregation Joins Instantly', desc: 'Members enter the code and follow along in real time — no account required.' },
];

const FEATURES = [
  { icon: BookOpen, label: 'Live Bible Verses', desc: 'Display scripture references your congregation can tap to read' },
  { icon: MessageCircle, label: 'Sermon Notes', desc: 'Members take personal notes saved directly in the app' },
  { icon: Heart, label: 'Prayer Requests', desc: 'Members submit and pray for each other during the service' },
  { icon: Globe, label: '6 Languages', desc: 'Afaan Oromoo, English, Amharic, Swahili, Arabic, French' },
  { icon: Zap, label: 'Instant Setup', desc: 'Start a live session in under 2 minutes — no tech skills needed' },
  { icon: CheckCircle, label: 'Session History', desc: 'Review past sermons and notes anytime after the service' },
];

const TESTIMONIAL_VERSE = { ref: 'Matthew 18:20', text: '"For where two or three gather in my name, there am I with them."' };

export default function ChurchLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #312E81 50%, #7C3AED 100%)' }} className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, #FBBF24 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Church className="w-9 h-9 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/40 rounded-full px-4 py-1.5 mb-5">
            <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
            <span className="text-amber-200 text-sm font-semibold">Free for all churches</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Bring Your Church Service<br />Into the Digital World
          </h1>
          <p className="text-indigo-200 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
            FaithLight Church Mode lets your congregation follow along with scripture, take sermon notes, and pray together — right from their phones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(createPageUrl('ChurchMode'))}
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Church className="w-5 h-5" />
              Start Church Mode — Free
            </button>
            <button
              onClick={() => navigate(createPageUrl('ChurchMode'))}
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2 border border-white/20"
            >
              <Users className="w-5 h-5" />
              Join a Session
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-2">Simple Setup</p>
          <h2 className="text-3xl font-bold text-gray-900">Ready in Under 2 Minutes</h2>
        </div>
        <div className="space-y-5">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-5 p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Step {step.num}</span>
                </div>
                <p className="font-bold text-gray-900">{step.title}</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Everything Your Church Needs</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{f.label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 border border-indigo-100">
          <BookOpen className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-800 italic leading-relaxed mb-3">{TESTIMONIAL_VERSE.text}</p>
          <p className="text-indigo-600 font-semibold">{TESTIMONIAL_VERSE.ref}</p>
        </div>
      </section>

      {/* Languages */}
      <section className="bg-indigo-900 py-12">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wide mb-3">Supporting African Church Communities</p>
          <h2 className="text-2xl font-bold text-white mb-6">Available in 6 Languages</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['🇪🇹 Afaan Oromoo', '🇬🇧 English', '🇪🇹 Amharic', '🇰🇪 Swahili', '🇸🇦 Arabic', '🇫🇷 French'].map(lang => (
              <span key={lang} className="bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full">{lang}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Start Your First Session Today</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          It's completely free. No tech skills needed. Your congregation will be following along in minutes.
        </p>
        <button
          onClick={() => navigate(createPageUrl('ChurchMode'))}
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-10 py-4 rounded-2xl text-base transition-colors inline-flex items-center gap-2 shadow-lg"
        >
          Start Church Mode — It's Free
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-gray-400 mt-4">No account required for congregation members to join</p>
      </section>

    </div>
  );
}