import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, Users, MessageCircle, BookOpen, Heart, PlayCircle, 
  CheckCircle, ArrowRight, Loader2, Mail, MapPin, User, Building2, Send
} from 'lucide-react';
import { createPageUrl } from '../utils';

export default function ForChurches() {
  const navigate = useNavigate();
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    church_name: '',
    email: '',
    city: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDemo = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.church_name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // In production, this would send to a backend service or email
      // For now, we'll just show success
      console.log('Demo request:', formData);
      
      // Send email notification if available
      try {
        await base44.integrations.Core.SendEmail({
          to: 'support@faithlight.com',
          subject: `FaithLight Demo Request from ${formData.church_name}`,
          body: `
Name: ${formData.name}
Church: ${formData.church_name}
Email: ${formData.email}
City: ${formData.city}

Message:
${formData.message}
          `
        });
      } catch {}

      setSubmitted(true);
      setTimeout(() => {
        setShowDemoForm(false);
        setSubmitted(false);
        setFormData({ name: '', church_name: '', email: '', city: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Demo request error:', error);
      alert('Failed to submit demo request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Bring Your Church Into the Digital Age
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto">
            Engage your congregation with live sermon sessions, shared Bible verses, prayer requests, and interactive church tools—all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate(createPageUrl('ChurchMode'))}
              className="bg-white text-indigo-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-xl flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Start Church Mode
            </Button>
            <Button 
              onClick={() => setShowDemoForm(true)}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl"
            >
              Request Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: PlayCircle, step: '1', title: 'Pastor Starts Session', desc: 'Launch Church Mode and your sermon goes live instantly' },
            { icon: Users, step: '2', title: 'Members Join with Code', desc: 'Congregation joins using a simple 7-character code (no login needed)' },
            { icon: Heart, step: '3', title: 'Everyone Follows Together', desc: 'Engage with sermon notes, verses, and interactive tools in real-time' }
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <item.icon className="w-5 h-5 text-indigo-600" />
                {item.title}
              </h3>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-12 text-center">
          <div className="flex items-center justify-center gap-4 text-gray-600 font-medium flex-wrap">
            <span>Pastor launches session</span>
            <ArrowRight className="w-5 h-5 text-indigo-600" />
            <span>Members scan/enter code</span>
            <ArrowRight className="w-5 h-5 text-indigo-600" />
            <span>Live interaction begins</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Features for Your Church</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Zap, title: 'Live Sermon Sessions', desc: 'Real-time connection with your congregation' },
              { icon: BookOpen, title: 'Digital Sermon Notes', desc: 'Members take notes and share insights' },
              { icon: MessageCircle, title: 'Prayer Wall', desc: 'Community prayer requests and support' },
              { icon: Heart, title: 'AI Sermon Tools', desc: 'Generate outlines, illustrations, and study guides' },
              { icon: Users, title: 'Interactive Quizzes', desc: 'Engage your congregation with live Q&A' },
              { icon: BookOpen, title: 'Bible Reading Plans', desc: 'Encourage daily study with guided plans' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Form Modal */}
      {showDemoForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-8">
              <h2 className="text-2xl font-bold">Request a Demo</h2>
              <p className="text-indigo-100 text-sm mt-2">We'll show you how FaithLight transforms church engagement</p>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you! 🎉</h3>
                <p className="text-gray-600">We'll contact you within 24 hours to schedule your personalized demo.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDemo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name *</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    className="rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Church Name *</label>
                  <Input
                    type="text"
                    name="church_name"
                    value={formData.church_name}
                    onChange={handleInputChange}
                    placeholder="Grace Community Church"
                    className="rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@church.com"
                    className="rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Toronto, ON"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your church..."
                    className="rounded-lg h-24"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowDemoForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Sending...' : 'Request Demo'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Engage Your Congregation?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join churches across Canada transforming how they connect with their members.
          </p>
          <Button 
            onClick={() => navigate(createPageUrl('ChurchMode'))}
            className="bg-white text-indigo-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-xl"
          >
            Start Now — It's Free
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Common Questions</h2>

        <div className="space-y-6">
          {[
            { q: 'How much does it cost?', a: 'FaithLight is free to start. Pastors can launch unlimited sessions at no cost. Premium features are available for individual members.' },
            { q: 'Do members need to download an app?', a: 'No! Members join using a 7-character code from any web browser or mobile browser. No app download required.' },
            { q: 'Is my data secure?', a: 'Yes. We use industry-standard encryption and security practices to protect your church data.' },
            { q: 'Can we customize it for our church?', a: 'Absolutely. We offer customization options for larger churches. Request a demo to discuss your needs.' },
            { q: 'What if we need support?', a: 'Our support team is available to help. We provide onboarding assistance and ongoing support via email and chat.' }
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}