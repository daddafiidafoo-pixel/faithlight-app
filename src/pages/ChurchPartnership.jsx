import React from 'react';
import { Church, BookOpen, Users, Zap, CheckCircle, ArrowRight, Mic2, Globe, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const STEPS = [
  { num: '1', label: 'Sign up for free', desc: 'Create your pastor account in 60 seconds' },
  { num: '2', label: 'Create your church', desc: 'Add your church name — takes 10 seconds' },
  { num: '3', label: 'Start a sermon session', desc: 'Get a code like FAITH123 and share it' },
  { num: '4', label: 'Congregation joins', desc: 'Members enter the code and follow along' },
];

const FEATURES = [
  {
    icon: Mic2,
    title: 'Live Sermon Companion',
    desc: 'Share a session code. Members instantly see your scripture references and can take notes — all in real time.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: BookOpen,
    title: 'AI Sermon Builder',
    desc: 'Generate a complete sermon outline with scripture references, illustrations, and application points in minutes.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Users,
    title: 'Small Group Tools',
    desc: 'Create groups for youth, leadership, or Bible study. Share verses, discuss sermons, and coordinate prayer.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    desc: 'Full support for Oromo, Amharic, Arabic, Swahili, French, and English — perfect for diverse congregations.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BookOpen,
    title: 'Bible Courses & Quizzes',
    desc: 'Members learn through structured lessons, quizzes, and earn certificates — discipleship beyond Sunday.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Zap,
    title: 'Prayer Wall',
    desc: 'Members submit prayer requests during the service. Mark them as answered to celebrate God\'s faithfulness.',
    color: 'bg-rose-50 text-rose-600',
  },
];

const TESTIMONIALS = [
  {
    quote: "We used Church Mode on Sunday for the first time. Within a week, 80% of our congregation had downloaded FaithLight.",
    name: "Pastor Samuel",
    church: "Addis Ababa Community Church",
  },
  {
    quote: "The multilingual support is incredible. Our church has members who speak Oromo, Amharic, and English — FaithLight serves all of them.",
    name: "Pastor Biruk",
    church: "New Life Church, Nairobi",
  },
];

export default function ChurchPartnership() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-200">
            <Church className="w-4 h-4" />
            Built for churches, not just individuals
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Turn FaithLight into your<br />
            <span className="text-amber-400">Church Platform</span>
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            One code. Your entire congregation follows the sermon in real time — with scripture, notes, and AI study tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl('ChurchMode'))}
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-base h-12 px-8 gap-2"
            >
              <Church className="w-5 h-5" />
              Start Church Mode Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:partnerships@faithlight.com?subject=Church Partnership'}
              className="border-white/40 text-white hover:bg-white/10 font-semibold h-12 px-8"
            >
              Contact Us
            </Button>
          </div>
          <p className="text-indigo-300 text-sm">Free to start • No credit card required</p>
        </div>
      </div>

      {/* How it works */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Up and running in under 2 minutes</h2>
            <p className="text-gray-500 mt-2">No training required. No complex setup.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{step.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate(createPageUrl('ChurchMode'))}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-11 px-8"
            >
              Try it now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Everything your church needs</h2>
            <p className="text-gray-500 mt-2">FaithLight is more than a Bible app — it's a church platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">{f.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Network effect callout */}
      <div className="py-14 px-4 bg-indigo-50">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <p className="text-4xl font-extrabold text-indigo-900">50 churches × 200 members</p>
          <p className="text-xl text-indigo-600 font-semibold">= 10,000 users growing together in Scripture</p>
          <p className="text-gray-600">
            Churches grow through community. When a pastor recommends FaithLight, the whole congregation follows.
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">What pastors say</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.church}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold">Ready to bring FaithLight to your church?</h2>
          <p className="text-indigo-100">Start a sermon session this Sunday — free, no setup required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl('ChurchMode'))}
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold h-12 px-8 gap-2"
            >
              <Church className="w-5 h-5" /> Start Church Mode
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:partnerships@faithlight.com?subject=Church Partnership'}
              className="border-white/40 text-white hover:bg-white/10 h-12 px-8"
            >
              Talk to the team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}