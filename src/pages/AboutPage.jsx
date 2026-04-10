import React from 'react';
import { ArrowLeft, BookOpen, Headphones, Search, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => window.history.back()}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#F3F4F6' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: '#1F2937' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#1F2937' }}>About FaithLight</h1>
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto space-y-4 pb-24">
        {/* Logo / Mission */}
        <div className="rounded-3xl p-6 flex flex-col items-center text-center"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)', boxShadow: '0 8px 32px rgba(139,92,246,0.3)' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">FaithLight</h2>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">
            Read, listen, and experience the Bible in your language.
          </p>
        </div>

        {/* Features */}
        <div className="rounded-3xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: '#1F2937' }}>What We Offer</h2>
          {[
            { icon: BookOpen, label: 'Read the Bible in English and Afaan Oromoo' },
            { icon: Headphones, label: 'Listen to audio Bible' },
            { icon: Search, label: 'Search verses instantly' },
            { icon: Globe, label: 'Multi-language support' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EDE9FE' }}>
                <Icon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="rounded-3xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-bold mb-2" style={{ color: '#8B5CF6' }}>Our Mission</h2>
          <p className="text-sm leading-7" style={{ color: '#374151' }}>
            FaithLight exists to make God's Word accessible to every person in their heart language. We believe the Bible should be easy to read, hear, and share — wherever you are in the world.
          </p>
        </div>

        {/* Contact */}
        <div className="rounded-3xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: '#1F2937' }}>Contact</h2>
          <p className="text-sm" style={{ color: '#374151' }}>📧 support@faithlight.app</p>
        </div>

        {/* Legal links */}
        <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Link to="/PrivacyPolicy" className="text-sm font-semibold" style={{ color: '#8B5CF6' }}>Privacy Policy →</Link>
          <Link to="/TermsOfService" className="text-sm font-semibold" style={{ color: '#8B5CF6' }}>Terms of Service →</Link>
        </div>

        <p className="text-center text-xs" style={{ color: '#9CA3AF' }}>Version 1.0.0 · © 2026 FaithLight</p>
        
        <Footer />
      </div>
    </div>
  );
}