import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useFeatureGate } from '../components/hooks/useFeatureGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumGateModal from '../components/premium/PremiumGateModal';
import {
  BookOpen, Award, Users, Globe, ChevronRight, CheckCircle,
  GraduationCap, BookMarked, Target, Clock, Shield,
  ArrowRight, Play, Star, Zap, Heart, MessageCircle, Lock
} from 'lucide-react';

// ─── Static Data ─────────────────────────────────────────────────────────────

const CURRICULUM = [
  { icon: '📖', title: 'Biblical Theology', free: true },
  { icon: '🔍', title: 'Hermeneutics', free: false },
  { icon: '🏛️', title: 'Systematic Theology', free: false },
  { icon: '🤲', title: 'Servant Leadership', free: true },
  { icon: '🎙️', title: 'Preaching & Teaching', free: false },
  { icon: '⛪', title: 'Church Administration', free: false },
  { icon: '💬', title: 'Biblical Counseling', free: false },
  { icon: '🌱', title: 'Spiritual Formation', free: true },
];

const HOW_IT_WORKS = [
  { step: '01', icon: GraduationCap, title: 'Enroll', desc: 'Create your account and choose your learning track — free or advanced.' },
  { step: '02', icon: BookOpen, title: 'Complete Lessons', desc: 'Work through structured video lessons and readings at your own pace.' },
  { step: '03', icon: Target, title: 'Pass Assessments', desc: 'Demonstrate mastery with quizzes, written reflections, and projects.' },
  { step: '04', icon: Award, title: 'Receive Certificate', desc: 'Earn your verified certificate or diploma recognized globally.' },
];

const TESTIMONIALS = [
  {
    name: 'Pastor Emmanuel K.',
    country: 'Ghana',
    flag: '🇬🇭',
    text: 'FaithLight training transformed my understanding of Scripture. The hermeneutics course alone changed how I preach every Sunday.',
    track: 'Advanced Diploma',
  },
  {
    name: 'Sister Maria L.',
    country: 'Philippines',
    flag: '🇵🇭',
    text: 'As a youth leader, I needed structured theology — GBLI gave me exactly that. Accessible, biblical, and practical.',
    track: 'Foundations Certificate',
  },
  {
    name: 'Rev. James O.',
    country: 'Nigeria',
    flag: '🇳🇬',
    text: 'The leadership and counseling modules helped me build a healthier, more disciplined church community.',
    track: 'Advanced Diploma',
  },
];

const WHY_GBLI = [
  {
    icon: BookOpen,
    color: 'from-indigo-500 to-indigo-700',
    title: 'Biblical Authority',
    desc: 'Every course is grounded in Scripture and Christ-centered teaching. No cultural compromise.',
  },
  {
    icon: Globe,
    color: 'from-emerald-500 to-emerald-700',
    title: 'Global Accessibility',
    desc: 'Study anywhere in the world. Learn at your pace, in your language, from any device.',
  },
  {
    icon: GraduationCap,
    color: 'from-amber-500 to-amber-700',
    title: 'Structured Leadership Training',
    desc: 'Clear modules, assessments, and certification — built for serious ministry preparation.',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeroSection({ user, onStartFree, onExploreDiploma }) {
  return (
    <section className="relative min-h-[92vh] bg-[#0F0D2E] flex items-center overflow-hidden">
      {/* Globe watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="w-[700px] h-[700px] rounded-full border border-white/5" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-white/5" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-white/5" />
        <Globe className="absolute w-96 h-96 text-white/3" />
      </div>

      {/* gradient accents */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24 text-center z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-white/80 text-sm font-medium tracking-wide">Global Biblical Leadership Institute</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-4xl mx-auto">
          Raise Christ-Centered Leaders<br />
          <span className="text-amber-400">for a Global Generation</span>
        </h1>

        <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Structured Biblical theology and leadership training designed for pastors, teachers, and emerging leaders worldwide.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onStartFree}
            size="lg"
            className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Free Program
          </Button>
          <Button
            onClick={onExploreDiploma}
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-6 rounded-xl"
          >
            Explore Diploma Track
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Trust bar */}
        <div className="mt-14 flex flex-wrap justify-center gap-8 text-white/50 text-sm">
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> 40+ Nations</div>
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> 8 Core Courses</div>
          <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Verified Certificates</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Scripture-Based</div>
        </div>
      </div>
    </section>
  );
}

function WhyGBLI() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge className="bg-indigo-100 text-indigo-700 mb-4">Why GBLI?</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Biblical Depth. Practical Leadership.<br />Global Impact.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WHY_GBLI.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center hover:shadow-lg transition-shadow">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-md`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramOverview({ onStartFree, onExploreDiploma }) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge className="bg-amber-100 text-amber-700 mb-4">Program Overview</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Choose Your Learning Path</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Begin free and advance at your own pace — or commit to the full diploma for professional ministry preparation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="rounded-2xl border-2 border-green-300 bg-white shadow-lg shadow-green-100 overflow-hidden">
            <div className="bg-green-600 px-8 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Level 1</p>
                  <h3 className="text-lg font-bold">Foundations Certificate</h3>
                </div>
              </div>
              <p className="text-3xl font-extrabold mt-4">$0 <span className="text-base font-normal text-white/70">— Free Forever</span></p>
            </div>
            <div className="p-8 space-y-3">
              {['3 Core Courses', 'Interactive Quizzes', 'Certificate of Completion', 'Lifetime Access', 'Basic AI Study Assistance'].map(f => (
                <div key={f} className="flex items-center gap-3 text-gray-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
              <Button onClick={onStartFree} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-5 rounded-xl text-base">
                Start Free Today
              </Button>
            </div>
          </div>

          {/* Paid */}
          <div className="rounded-2xl border-2 border-indigo-400 bg-white shadow-xl shadow-indigo-100 overflow-hidden relative">
            <div className="absolute top-4 right-4">
              <span className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
            </div>
            <div className="bg-[#1E1B4B] px-8 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Level 2</p>
                  <h3 className="text-lg font-bold">Advanced Diploma</h3>
                </div>
              </div>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-3xl font-extrabold">$19<span className="text-base font-normal text-white/70">/month</span></p>
                <p className="text-white/50 text-sm mb-1">or $149 one-time</p>
              </div>
            </div>
            <div className="p-8 space-y-3">
              {['All 8 Advanced Courses', 'Downloadable Diploma Certificate', 'Sermon Evaluation', 'Leadership Case Study Review', 'Priority AI Support', 'Certificate Verification ID'].map(f => (
                <div key={f} className="flex items-center gap-3 text-gray-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
              <Button onClick={onExploreDiploma} className="w-full mt-6 bg-[#1E1B4B] hover:bg-indigo-900 text-white font-bold py-5 rounded-xl text-base">
                View Diploma Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CurriculumGrid() {
  return (
    <section className="py-20 bg-[#0F0D2E]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge className="bg-white/10 text-white border-white/20 mb-4">Full Curriculum</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What You'll Study</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">
            A complete theological and leadership curriculum designed for real-world ministry.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CURRICULUM.map((item) => (
            <Link
              key={item.title}
              to={createPageUrl('GlobalBiblicalLeadershipInstitute')}
              className={`group rounded-xl p-5 border transition-all hover:scale-105 cursor-pointer
                ${item.free
                  ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <p className="text-white font-semibold text-sm leading-snug">{item.title}</p>
              <div className="mt-2">
                {item.free
                  ? <span className="text-xs text-green-400 font-semibold">Free</span>
                  : <span className="text-xs text-amber-400 font-semibold flex items-center gap-1"><Lock className="w-3 h-3" /> Diploma</span>
                }
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge className="bg-indigo-100 text-indigo-700 mb-4">Simple Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How It Works</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Four steps to a verified biblical leadership credential.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-px border-t-2 border-dashed border-gray-200" />
              )}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
                <step.icon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-gray-900">
                  {step.step}
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge className="bg-amber-100 text-amber-700 mb-4">Student Stories</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Transforming Leaders Globally</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">{t.flag}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-indigo-600">{t.track} · {t.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MentorTrack({ onContact }) {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Badge className="bg-purple-400/20 text-purple-200 border-purple-400/30 mb-6">Coming Soon</Badge>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">🌟 Leadership Mentor Track</h2>
        <p className="text-white/70 text-base max-w-xl mx-auto mb-8">
          Live 1-on-1 mentoring, practical ministry review, and leadership coaching from experienced pastors and scholars.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-white/60 text-sm mb-8">
          <div className="flex items-center gap-2"><Heart className="w-4 h-4" /> Live Mentoring Session</div>
          <div className="flex items-center gap-2"><Target className="w-4 h-4" /> Ministry Evaluation</div>
          <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Leadership Coaching</div>
        </div>
        <Button onClick={onContact} className="bg-white text-purple-900 hover:bg-purple-50 font-bold px-8 py-5 rounded-xl text-base">
          Join Waitlist — $299 One-time
        </Button>
      </div>
    </section>
  );
}

function FinalCTA({ onStartFree }) {
  return (
    <section className="py-24 bg-[#1E1B4B] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white" />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="text-5xl mb-6">✝️</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
          Ready to Begin Your<br />Leadership Journey?
        </h2>
        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
          Join thousands of leaders worldwide who are growing in biblical knowledge, ministry skills, and Christ-centered leadership.
        </p>
        <Button
          onClick={onStartFree}
          size="lg"
          className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold text-lg px-12 py-6 rounded-xl shadow-2xl shadow-amber-500/25 transition-all hover:scale-105"
        >
          Start Free Today
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-white/40 text-sm mt-5">No credit card required · Free forever · Cancel anytime</p>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GlobalBiblicalLeadershipInstitute() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const diplomaRef = useRef(null);
  const { allowed: diplomaAllowed, isPending: diplomaChecking, showUpgradeModal: showDiplomaGate, closeUpgradeModal: closeDiplomaGate } = useFeatureGate('academy.diploma');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Deep-link guard: if user lands here but not premium, redirect
  useEffect(() => {
    if (diplomaAllowed === false) {
      // Not allowed — redirect to Home
      setTimeout(() => navigate(createPageUrl('Home')), 1000);
    }
  }, [diplomaAllowed, navigate]);

  const handleStartFree = () => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('GlobalBiblicalLeadershipInstitute'));
    } else {
      window.location.href = createPageUrl('ExploreCourses');
    }
  };

  const handleExploreDiploma = () => {
    if (diplomaAllowed === false) {
      // Show gate modal
      showDiplomaGate?.();
      return;
    }
    diplomaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContact = () => {
    window.location.href = 'mailto:support@faithlight.com?subject=GBLI Mentor Track Waitlist';
  };

  return (
    <div className="min-h-screen bg-white">

      {/* GBLI Nav Banner */}
      <div className="bg-[#1E1B4B] border-b border-white/10 py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">GBLI</p>
              <p className="text-white/50 text-xs">Powered by FaithLight</p>
            </div>
          </div>
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-xs">
              ← Back to FaithLight
            </Button>
          </Link>
        </div>
      </div>

      <HeroSection user={user} onStartFree={handleStartFree} onExploreDiploma={handleExploreDiploma} />
      <WhyGBLI />

      <div ref={diplomaRef}>
        <ProgramOverview onStartFree={handleStartFree} onExploreDiploma={() => {}} />
      </div>

      <CurriculumGrid />
      <HowItWorks />
      <Testimonials />
      <MentorTrack onContact={handleContact} />

      {/* Marketing copy strip */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-indigo-100 text-indigo-700 mb-5">Who It's For</Badge>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Built for Every Christian Leader</h2>
              <div className="space-y-3">
                {['Pastors & church planters', 'Youth & young adult leaders', 'Bible teachers & disciplers', 'Ministry volunteers', 'Emerging church leaders', 'Serious Bible students'].map(who => (
                  <div key={who} className="flex items-center gap-3 text-gray-700 text-sm">
                    <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    {who}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-amber-50 rounded-2xl p-8 border border-gray-100">
              <blockquote className="text-lg font-semibold text-gray-800 leading-relaxed italic mb-5">
                "The Church needs leaders who understand Scripture deeply and lead with integrity. GBLI provides the structured, accessible training to make that possible."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">FaithLight GBLI</p>
                  <p className="text-xs text-gray-500">Global Biblical Leadership Institute</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA onStartFree={handleStartFree} />

      {/* Premium Gate Modal (Diploma) */}
      <PremiumGateModal
        open={showDiplomaGate}
        onClose={closeDiplomaGate}
        featureName="Advanced Diploma"
        reason="premium_required"
      />

      {/* Footer */}
      <div className="bg-[#0F0D2E] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs">
          <p>© 2026 Global Biblical Leadership Institute · Powered by FaithLight</p>
          <p className="italic">"Your word is a lamp to my feet and a light to my path." — Psalm 119:105</p>
        </div>
      </div>
    </div>
  );
}