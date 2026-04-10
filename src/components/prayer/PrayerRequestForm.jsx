import React, { useState } from 'react';
import { Send, X, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PrayerRequestForm({ onSubmit, currentUser, uiLang }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error(uiLang === 'om' ? 'Yeroo guutuu' : 'Please fill all fields');
      return;
    }

    setSaving(true);
    try {
      const request = await base44.entities.CommunityPrayerPost.create({
        authorEmail: currentUser?.email || 'anonymous@faithlight.app',
        authorName: isAnonymous ? 'Anonymous' : (currentUser?.full_name || 'User'),
        title: title.trim(),
        body: description.trim(),
        category: 'prayer',
        isAnonymous: isAnonymous,
        prayedByEmails: [],
        prayedCount: 0,
        status: 'active',
      });

      toast.success(uiLang === 'om' ? 'Gaaffi fudhatame' : 'Prayer request posted!');
      setTitle('');
      setDescription('');
      setIsAnonymous(false);
      setShowForm(false);
      onSubmit?.(request);
    } catch (error) {
      console.error('Error:', error);
      toast.error(uiLang === 'om' ? 'Dogoggorra dhufe' : 'Failed to post');
    } finally {
      setSaving(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold py-3 transition-colors"
      >
        {uiLang === 'om' ? 'Gaaffii Koo Dabaluu' : 'Share Prayer Request'}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">{uiLang === 'om' ? 'Gaaffii Koo' : 'Your Prayer Request'}</h3>
        <button
          onClick={() => setShowForm(false)}
          aria-label="Close"
          className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={uiLang === 'om' ? 'Mata gaaffii' : 'Prayer title'}
          maxLength={100}
          className="w-full min-h-[44px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={uiLang === 'om' ? 'Caasima isaa ibsaa' : 'Describe your prayer request'}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          required
        />

        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <div
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
              isAnonymous ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'
            }`}
          >
            {isAnonymous && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-sm text-gray-700 flex items-center gap-2">
            {uiLang === 'om' ? 'Itti himanna yaalaa miti' : 'Post anonymously'}
            {isAnonymous && <Shield size={14} className="text-indigo-600" />}
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 min-h-[44px] px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            {uiLang === 'om' ? 'Dhiisi' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {saving ? '...' : (uiLang === 'om' ? 'Erga' : 'Post')}
          </button>
        </div>
      </form>
    </div>
  );
}