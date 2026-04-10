import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguageStore } from '@/components/languageStore';
import { ArrowLeft } from 'lucide-react';

const LABELS = {
  en: {
    addTitle: 'Create New Prayer',
    editTitle: 'Edit Prayer',
    prayerTitle: 'Prayer Title',
    writeYourPrayer: 'Write your prayer...',
    category: 'Category',
    privacy: 'Privacy',
    savePrayer: 'Save Prayer',
    cancel: 'Cancel',
    selectCategory: 'Select a category...',
    selectPrivacy: 'Select privacy...',
  },
  om: {
    addTitle: 'Kadhata Haaraa Uumi',
    editTitle: 'Kadhata Fooyyeessi',
    prayerTitle: 'Mata-duree Kadhataa',
    writeYourPrayer: 'Kadhata kee barreessi...',
    category: 'Ramaddii',
    privacy: 'Icciitii',
    savePrayer: 'Kadhata Kuusi',
    cancel: 'Haqi',
    selectCategory: 'Ramaddii filadhu...',
    selectPrivacy: 'Icciitii filadhu...',
  },
};

export default function AddPrayer() {
  const navigate = useNavigate();
  const { prayerId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: '',
    privacy_level: 'private',
    status: 'active',
  });

  const L = LABELS[uiLanguage] || LABELS.en;
  const isEditing = !!prayerId;

  // Fetch prayer if editing
  const { data: prayer, isLoading: prayerLoading } = useQuery({
    queryKey: ['prayer', prayerId],
    queryFn: async () => {
      if (!prayerId) return null;
      const result = await base44.entities.MyPrayer.filter({ id: prayerId });
      return result?.[0] || null;
    },
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['prayerCategories'],
    queryFn: async () => {
      const results = await base44.entities.PrayerCategory.filter(
        { is_active: true },
        'sort_order',
        50
      );
      return results || [];
    },
  });

  // Populate form when prayer loads
  useEffect(() => {
    if (prayer) {
      setFormData({
        title: prayer.title,
        body: prayer.body,
        category: prayer.category || '',
        privacy_level: prayer.privacy_level,
        status: prayer.status,
      });
    }
  }, [prayer]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        await base44.entities.MyPrayer.update(prayerId, data);
      } else {
        await base44.entities.MyPrayer.create({
          ...data,
          user_id: user.email,
          linked_verse_count: 0,
          is_answered: false,
          favorite: false,
          archived: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPrayers'] });
      navigate('/MyPrayers');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      alert(uiLanguage === 'om' ? 'Mata-duree fi kadhata guutuu.' : 'Please fill in title and prayer.');
      return;
    }
    mutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <p className="text-gray-600">{uiLanguage === 'om' ? 'Barannoo loofaa roga\'ee kanaaf barbaada.' : 'Please log in.'}</p>
      </div>
    );
  }

  if (isEditing && prayerLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? L.editTitle : L.addTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{L.prayerTitle}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={L.prayerTitle}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{uiLanguage === 'om' ? 'Kadhata' : 'Prayer'}</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder={L.writeYourPrayer}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{L.category}</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{L.selectCategory}</option>
            {categories.map(cat => (
              <option key={cat.category_key} value={cat.category_key}>
                {uiLanguage === 'om' ? cat.name_om : cat.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">{L.privacy}</label>
          <select
            value={formData.privacy_level}
            onChange={(e) => setFormData({ ...formData, privacy_level: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="private">{uiLanguage === 'om' ? 'Dhuunfaa' : 'Private'}</option>
            <option value="shared">{uiLanguage === 'om' ? 'Qoodame' : 'Shared'}</option>
            <option value="community">{uiLanguage === 'om' ? 'Hawaasa' : 'Community'}</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 h-[44px] border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {L.cancel}
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 h-[44px] bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : L.savePrayer}
          </button>
        </div>
      </form>
    </div>
  );
}