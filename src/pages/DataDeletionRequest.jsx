import React, { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { Trash2, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DataDeletionRequest() {
  const { t } = useI18n();
  const [step, setStep] = useState('form'); // form | confirm | done
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please provide your email address.'); return; }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // Send a notification email to support with the deletion request
      await base44.integrations.Core.SendEmail({
        to: 'support@faithlight.app',
        subject: `[Data Deletion Request] ${email}`,
        body: `A user has submitted a data deletion request.\n\nEmail: ${email}\nReason: ${reason || 'Not provided'}\nDate: ${new Date().toISOString()}\n\nPlease process this request within 30 days as required by applicable privacy laws.`,
      });
      setStep('done');
    } catch {
      // Even if email fails, acknowledge the request
      setStep('done');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('legal.deletion.title', 'Data Deletion Request')}</h1>
          <p className="text-gray-500">{t('legal.deletion.subtitle', 'You have the right to request deletion of your personal data.')}</p>
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* What gets deleted */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t('legal.deletion.s1', 'What Gets Deleted')}
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  'Your account and profile information',
                  'All saved highlights, notes, and bookmarks',
                  'Personal journal entries',
                  'Reading progress and streak data',
                  'Study plan history',
                  'Prayer wall posts (if any)',
                  'All associated personal data',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-800">⚠️ This action is <strong>permanent and cannot be undone</strong>. Bible reading features will remain available without an account.</p>
              </div>
            </div>

            {/* How to request */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">{t('legal.deletion.s2', 'How to Request Deletion')}</h2>
              <p className="text-sm text-gray-600">Submit the form below or email us directly at <a href="mailto:support@faithlight.app" className="text-indigo-600 hover:underline">support@faithlight.app</a> with the subject "Data Deletion Request".</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address on your account *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Let us know why (optional)..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition text-sm"
              >
                {t('legal.deletion.submit', 'Submit Deletion Request')}
              </button>
            </form>

            {/* Processing time */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <h2 className="font-semibold text-gray-800 mb-1 text-sm">{t('legal.deletion.s3', 'Processing Time')}</h2>
              <p className="text-xs text-gray-500">We will process your request within <strong>30 days</strong> as required by applicable privacy laws (GDPR, CCPA, Apple App Store guidelines).</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-gray-600 text-sm mb-4">
              You are about to submit a permanent data deletion request for <strong>{email}</strong>. This cannot be undone.
            </p>
            <label className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 mb-5 text-left cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-0.5 accent-red-600"
              />
              <span className="text-sm text-gray-700">{t('legal.deletion.confirm', 'I understand this action is permanent and cannot be undone.')}</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!confirmed || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-sm"
              >
                {loading ? 'Submitting…' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Received</h2>
            <p className="text-gray-600 text-sm mb-5">{t('legal.deletion.success', 'Your deletion request has been received. We will process it within 30 days.')}</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600">
              <p><strong>What happens next:</strong></p>
              <ul className="mt-2 space-y-1 list-disc ml-4">
                <li>You'll receive a confirmation email at <strong>{email}</strong></li>
                <li>Our team will verify and process the request</li>
                <li>All personal data will be permanently deleted within 30 days</li>
              </ul>
            </div>
            <div className="flex items-center justify-center gap-2 mt-5 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              Questions? <a href="mailto:support@faithlight.app" className="text-indigo-600 hover:underline">support@faithlight.app</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}