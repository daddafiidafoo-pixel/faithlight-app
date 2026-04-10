import React, { useState } from 'react';
import { Mail, Send, AlertCircle } from 'lucide-react';

export default function AppSupportForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send to support email (configure your backend)
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          app_version: '1.0',
          submitted_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Support form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">Support & Feedback</h1>
          <p className="text-slate-600 mt-2">We're here to help. Send us your questions or feedback.</p>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">✅ Thank you! We received your message and will respond within 24 hours.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />

          <textarea
            placeholder="Your message..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-32"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send Message'}
          </button>

          <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              <strong>Alternative:</strong> Email us directly at <a href="mailto:support@faithlight.app" className="underline font-semibold">support@faithlight.app</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}