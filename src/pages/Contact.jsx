import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'support@faithlight.app',
        subject: `New Contact Form Submission from ${formData.name}`,
        body: `
Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}
        `,
        from_name: 'FaithLight Support'
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert('Error sending message. Please try again or email support@faithlight.app directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 mb-4">
            <Mail className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Support</h1>
          <p className="text-gray-600">We're here to help. Get in touch with the FaithLight team.</p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Email Support</p>
                  <a href="mailto:support@faithlight.app" className="text-indigo-600 hover:underline text-sm">
                    support@faithlight.app
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Response Time</p>
                  <p className="text-gray-600 text-sm">24–48 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues We Help With */}
        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              Common Issues We Help With
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Bible downloads and offline access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Audio playback issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Account access problems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>AI feature errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Subscription and billing questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Feature requests and feedback</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Send us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Message sent!</p>
                  <p className="text-sm text-green-700">We'll get back to you within 24–48 hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    placeholder="Describe your issue or feedback..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={loading}
                    required
                    className="min-h-24"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}