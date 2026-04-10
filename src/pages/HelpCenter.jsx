import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  HelpCircle, Search, BookOpen, Users, Sparkles, CreditCard,
  Settings, WifiOff, MessageCircle, Shield, ChevronRight, ArrowLeft, Bot
} from 'lucide-react';
import { OnboardingRestartButton } from '../components/onboarding/OnboardingWalkthrough';
import HelpAgentChat from '../components/help/HelpAgentChat';

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: HelpCircle, color: 'gray' },
  { id: 'getting_started', label: 'Getting Started', icon: BookOpen, color: 'indigo' },
  { id: 'bible', label: 'Bible & Study', icon: BookOpen, color: 'blue' },
  { id: 'ai', label: 'AI Features', icon: Sparkles, color: 'amber' },
  { id: 'community', label: 'Community', icon: Users, color: 'green' },
  { id: 'account', label: 'Account & Settings', icon: Settings, color: 'purple' },
  { id: 'billing', label: 'Plans & Billing', icon: CreditCard, color: 'rose' },
  { id: 'offline', label: 'Offline Access', icon: WifiOff, color: 'teal' },
  { id: 'safety', label: 'Safety & Privacy', icon: Shield, color: 'slate' },
];

const FAQS = [
  // Getting Started
  {
    cat: 'getting_started',
    q: 'How do I get started with FaithLight?',
    a: 'After signing in, you\'ll see a guided tour that walks you through the key features. You can also restart this tour anytime from the Help Center.',
  },
  {
    cat: 'getting_started',
    q: 'What is the AI Welcome tour?',
    a: 'The AI Welcome tour helps us personalise your experience. You\'ll choose your language, your role (pastor, learner, believer, etc.), and your main spiritual goal. This helps FaithLight surface the right content for you.',
  },
  {
    cat: 'getting_started',
    q: 'Can I use FaithLight without creating an account?',
    a: 'Yes — many features like reading the Bible, browsing community posts, and exploring courses are available without signing in. An account unlocks saving bookmarks, joining groups, tracking progress, and using AI features.',
  },
  // Bible & Study
  {
    cat: 'bible',
    q: 'How do I search for specific Bible verses?',
    a: 'Press ⌘K (Mac) or Ctrl+K (Windows) anywhere in the app to open the Bible search. You can search by book name, verse reference (e.g. "John 3:16"), or keywords.',
  },
  {
    cat: 'bible',
    q: 'What translations are available?',
    a: 'FaithLight supports multiple translations including KJV, NIV, ESV, NLT, and the World English Bible (WEB). You can switch translations from the Bible reader or your profile settings.',
  },
  {
    cat: 'bible',
    q: 'How do I create a study plan?',
    a: 'Go to Study Plans from the navigation. Click "New Plan", add a title and reading items (book/chapter/verse), set a duration, and start reading. You can also use the AI Study Plan Generator to create one automatically.',
  },
  {
    cat: 'bible',
    q: 'What is the AI Bible Tutor?',
    a: 'The AI Bible Tutor provides verse-by-verse explanations, theological context, cross-references, and answers to biblical questions. It is trained to stay within orthodox biblical teaching.',
  },
  // AI Features
  {
    cat: 'ai',
    q: 'What can the AI Content Assistant do?',
    a: 'The AI Content Assistant has four modes: (1) Draft — generates devotionals, sermons, prayers, and forum posts; (2) Titles — suggests engaging titles and taglines; (3) Improve — rewrites and strengthens your existing content; (4) Metadata — auto-generates tags, keywords, scripture references, and reading time.',
  },
  {
    cat: 'ai',
    q: 'Is the AI theologically reliable?',
    a: 'FaithLight\'s AI is designed to stay within orthodox Christian doctrine and always references Scripture. However, AI is a tool — always verify important theological conclusions against Scripture and trusted teachers.',
  },
  {
    cat: 'ai',
    q: 'How does the global search work?',
    a: 'Click the "All" button in the navigation bar (or press ⌘F) to open the Global Advanced Search. You can filter results by keyword, category, status, creation date, sort order, and custom tags. Filters can be saved for reuse.',
  },
  {
    cat: 'ai',
    q: 'How do I generate tags for my post?',
    a: 'In the AI Content Assistant, switch to "Metadata" mode, paste your content or type a topic, and click "Generate Metadata & Keywords". You\'ll receive tags, keywords, and relevant scripture references.',
  },
  // Community
  {
    cat: 'community',
    q: 'How do I post in the Community?',
    a: 'Go to the Community page and click "Post". Write a title and body, choose a category, and submit. Posts go through a brief moderation review before appearing publicly.',
  },
  {
    cat: 'community',
    q: 'How do I join a study group?',
    a: 'Go to Groups in the navigation. Browse available groups by type, size, or activity level. Click "Join" on any public group. Private groups require an invitation.',
  },
  {
    cat: 'community',
    q: 'How do I report inappropriate content?',
    a: 'Every post has a three-dot menu with a "Report" option. Choose the reason and submit. Our moderation team reviews all reports promptly.',
  },
  // Account
  {
    cat: 'account',
    q: 'How do I update my profile?',
    a: 'Go to Profile from the top navigation, then click "Edit Profile". You can update your display name, bio, avatar, location, and areas of interest.',
  },
  {
    cat: 'account',
    q: 'How do I change my language?',
    a: 'Click the 🌐 globe icon in the top navigation bar and select your preferred language. The UI will switch immediately.',
  },
  {
    cat: 'account',
    q: 'How do I customise my dashboard?',
    a: 'On the Home dashboard, click the "Customise" button. You can rearrange, add, or remove widgets to personalise your experience.',
  },
  // Billing
  {
    cat: 'billing',
    q: 'Is FaithLight free to use?',
    a: 'Yes. FaithLight offers a Free plan with access to selected Bible lessons, quizzes, and limited AI usage. Premium plans unlock advanced AI tools, sermon prep, offline downloads, and more.',
  },
  {
    cat: 'billing',
    q: 'How does the free trial work?',
    a: 'The Teacher/Pastor plan includes a 30-day free trial. A payment method is required to start. You can cancel anytime before the trial ends and will not be charged.',
  },
  {
    cat: 'billing',
    q: 'Is pricing different by country?',
    a: 'Yes. FaithLight uses region-based pricing to stay accessible globally, including special pricing for users in Africa and other developing regions.',
  },
  // Offline
  {
    cat: 'offline',
    q: 'How does offline Bible access work?',
    a: 'Go to Offline Access in the navigation and download your preferred Bible translation(s) and books. Once downloaded, the Bible is available even without an internet connection.',
  },
  {
    cat: 'offline',
    q: 'How much storage does an offline download use?',
    a: 'A full Bible translation typically requires 5–15 MB of storage. Individual books are much smaller. You can manage and delete downloads from the Offline Manager page.',
  },
  // Safety
  {
    cat: 'safety',
    q: 'Is my data private?',
    a: 'Yes. FaithLight does not sell your data. Your profile can be set to private in Settings. See our Privacy Policy for full details.',
  },
  {
    cat: 'safety',
    q: 'How do I block another user?',
    a: 'Go to that user\'s profile, click the three-dot menu, and select "Block". Blocked users cannot see your profile or send you messages.',
  },
];

const QUICK_LINKS = [
  { label: 'Bible Reader', page: 'BibleReader', icon: BookOpen },
  { label: 'Ask AI', page: 'AskAI', icon: Sparkles },
  { label: 'Community', page: 'Community', icon: Users },
  { label: 'FAQ', page: 'FAQ', icon: HelpCircle },
  { label: 'Contact Support', href: 'mailto:support@faithlight.com', icon: MessageCircle },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAIChat, setShowAIChat] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQS.filter(faq => {
      const matchCat = activeCategory === 'all' || faq.cat === activeCategory;
      const matchQ = !q || faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [searchQuery, activeCategory]);

  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back link */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Help Center</h1>
          <p className="text-lg text-gray-600 mb-6">Find answers, tutorials, and support resources</p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search the help center..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 h-12 text-base rounded-xl border-gray-200 shadow-sm"
            />
          </div>
        </div>

        {/* AI Support Assistant Banner */}
        {showAIChat ? (
          <div className="mb-8 rounded-2xl border border-indigo-200 overflow-hidden shadow-md h-[500px] flex flex-col">
            <HelpAgentChat onClose={() => setShowAIChat(false)} />
          </div>
        ) : (
          <div
            onClick={() => setShowAIChat(true)}
            className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base">Ask AI Support Assistant</p>
                <p className="text-indigo-200 text-sm mt-0.5">Get instant help with any app issue</p>
              </div>
            </div>
            <div className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
              Start Chat →
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {QUICK_LINKS.map(({ label, page, href, icon: Icon }) => (
            href
              ? <a key={label} href={href}
                  className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center group">
                  <Icon className="w-5 h-5 text-indigo-500 group-hover:text-indigo-700" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </a>
              : <Link key={label} to={createPageUrl(page)}
                  className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center group">
                  <Icon className="w-5 h-5 text-indigo-500 group-hover:text-indigo-700" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </Link>
          ))}
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  active ? colorMap[cat.color] + ' shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
                {active && activeCategory !== 'all' && (
                  <Badge className="ml-1 bg-white/80 text-current border-0 text-xs px-1 h-4">
                    {filtered.length}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {(searchQuery || activeCategory !== 'all') && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {searchQuery && <> for "<span className="font-medium text-gray-700">{searchQuery}</span>"</>}
          </p>
        )}

        {/* FAQ Accordion */}
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium mb-1">No articles found</p>
              <p className="text-sm text-gray-400">Try a different search or browse all categories</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {filtered.map((faq, i) => {
                  const catInfo = CATEGORIES.find(c => c.id === faq.cat);
                  return (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left font-medium hover:text-indigo-700 transition-colors">
                        <div className="flex items-start gap-3 pr-4">
                          {catInfo && activeCategory === 'all' && (
                            <Badge className={`mt-0.5 text-xs border flex-shrink-0 ${colorMap[catInfo.color]}`}>
                              {catInfo.label}
                            </Badge>
                          )}
                          <span>{faq.q}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed pl-2">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Guided tour restart */}
        <div className="mt-8 p-5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-indigo-900 text-sm">New here? Take the guided tour</p>
            <p className="text-xs text-indigo-700 mt-0.5">A 7-step walkthrough of all key features</p>
          </div>
          <OnboardingRestartButton />
        </div>

        {/* Contact support */}
        <div className="mt-4 p-5 bg-white border border-gray-200 rounded-xl text-center">
          <p className="text-sm text-gray-700 font-medium mb-1">Still need help?</p>
          <p className="text-sm text-gray-500">
            Email us at{' '}
            <a href="mailto:support@faithlight.com" className="text-indigo-600 hover:underline font-medium">
              support@faithlight.com
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-2 italic">"Your word is a lamp to my feet." — Psalm 119:105</p>
        </div>
      </div>
    </div>
  );
}