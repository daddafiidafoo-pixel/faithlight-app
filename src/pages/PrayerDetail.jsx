import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguageStore } from '@/components/languageStore';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LABELS = {
  en: {
    linkedVerse: 'Linked Verses',
    prayerUpdates: 'Prayer Updates',
    addUpdate: 'Add Update',
    linkVerse: 'Link Verse',
    markAnswered: 'Mark Answered',
    editPrayer: 'Edit Prayer',
    archive: 'Archive',
    noUpdates: 'No updates yet',
    noVerses: 'No linked verses',
  },
  om: {
    linkedVerse: 'Aayata Walqabatan',
    prayerUpdates: 'Haaromsa Kadhataa',
    addUpdate: 'Haaromsa Dabali',
    linkVerse: 'Aayata Walqabsiisi',
    markAnswered: 'Deebii Argateera Jedhi',
    editPrayer: 'Kadhata Fooyyeessi',
    archive: 'Kuusi',
    noUpdates: 'Haaromsi hin jiru',
    noVerses: 'Aayanni hin walqabne',
  },
};

const STATUS_COLORS = {
  active: 'bg-blue-50 text-blue-700',
  waiting: 'bg-yellow-50 text-yellow-700',
  answered: 'bg-green-50 text-green-700',
  archived: 'bg-gray-50 text-gray-700',
};

export default function PrayerDetail() {
  const navigate = useNavigate();
  const { prayerId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const queryClient = useQueryClient();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const L = LABELS[uiLanguage] || LABELS.en;

  // Fetch prayer
  const { data: prayer, isLoading: prayerLoading } = useQuery({
    queryKey: ['prayer', prayerId],
    queryFn: async () => {
      const result = await base44.entities.MyPrayer.filter({ id: prayerId });
      return result?.[0] || null;
    },
    enabled: !!prayerId,
  });

  // Fetch linked verses
  const { data: linkedVerses = [] } = useQuery({
    queryKey: ['linkedVerses', prayerId],
    queryFn: async () => {
      const results = await base44.entities.PrayerVerseLink.filter({ prayer_id: prayerId });
      return results || [];
    },
    enabled: !!prayerId,
  });

  // Fetch updates
  const { data: updates = [] } = useQuery({
    queryKey: ['prayerUpdates', prayerId],
    queryFn: async () => {
      const results = await base44.entities.PrayerUpdate.filter({ prayer_id: prayerId }, '-created_date');
      return results || [];
    },
    enabled: !!prayerId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['prayerCategories'],
    queryFn: async () => {
      const results = await base44.entities.PrayerCategory.filter({ is_active: true }, 'sort_order', 50);
      return results || [];
    },
  });

  // Mark answered mutation
  const markAnsweredMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.MyPrayer.update(prayerId, {
        status: 'answered',
        is_answered: true,
        answered_at: new Date().toISOString(),
      });
      await base44.entities.PrayerUpdate.create({
        prayer_id: prayerId,
        user_id: user.email,
        status: 'answered',
        note: uiLanguage === 'om' ? 'Kadhaan deebii argateera. Galatoomi Waaqayyo.' : 'Prayer answered. Thank you Lord.',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer', prayerId] });
      queryClient.invalidateQueries({ queryKey: ['prayerUpdates', prayerId] });
    },
  });

  // Delete verse link mutation
  const deleteVerseMutation = useMutation({
    mutationFn: async (linkId) => {
      await base44.entities.PrayerVerseLink.delete(linkId);
      await base44.entities.MyPrayer.update(prayerId, {
        linked_verse_count: Math.max(0, (prayer?.linked_verse_count || 0) - 1),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedVerses', prayerId] });
      queryClient.invalidateQueries({ queryKey: ['prayer', prayerId] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <p className="text-gray-600">{uiLanguage === 'om' ? 'Barannoo loofaa roga\'ee kanaaf barbaada.' : 'Please log in.'}</p>
      </div>
    );
  }

  if (prayerLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!prayer) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <p className="text-gray-600">{uiLanguage === 'om' ? 'Kadhanni hin argamne.' : 'Prayer not found.'}</p>
      </div>
    );
  }

  const category = categories.find(c => c.category_key === prayer.category);
  const categoryName = uiLanguage === 'om' ? category?.name_om : category?.name_en;
  const createdDate = new Date(prayer.created_date).toLocaleDateString(uiLanguage === 'om' ? 'om-ET' : 'en-US');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/MyPrayers')}
          className="min-h-[44px] min-w-[44px] p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex-1">{prayer.title}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        
        {/* Prayer Meta */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {categoryName && (
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                {categoryName}
              </span>
            )}
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[prayer.status]}`}>
              {['active', 'waiting', 'answered', 'archived'].includes(prayer.status)
                ? { active: uiLanguage === 'om' ? 'Hojii Irra Jira' : 'Active', waiting: uiLanguage === 'om' ? 'Eegaa Jira' : 'Waiting', answered: uiLanguage === 'om' ? 'Deebii Argateera' : 'Answered', archived: uiLanguage === 'om' ? 'Kuusame' : 'Archived' }[prayer.status]
                : prayer.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{createdDate}</p>
        </div>

        {/* Prayer Body */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{prayer.body}</p>
        </div>

        {/* Linked Verses */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{L.linkedVerse}</h2>
          {linkedVerses.length === 0 ? (
            <p className="text-gray-500 text-sm">{L.noVerses}</p>
          ) : (
            <div className="space-y-3">
              {linkedVerses.map((verse) => (
                <motion.div
                  key={verse.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{verse.reference_text}</p>
                    <p className="text-sm text-blue-800 mt-2 italic">"{verse.verse_text}"</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {verse.language_code.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteVerseMutation.mutate(verse.id)}
                    className="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Remove verse"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Updates Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{L.prayerUpdates}</h2>
          {updates.length === 0 ? (
            <p className="text-gray-500 text-sm">{L.noUpdates}</p>
          ) : (
            <div className="space-y-3">
              {updates.map((update) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[update.status]}`}>
                      {update.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(update.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  {update.note && <p className="text-sm text-gray-700">{update.note}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-6">
          <button
            onClick={() => navigate(`/EditPrayer/${prayerId}`)}
            className="h-[44px] bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {L.editPrayer}
          </button>
          {prayer.status !== 'answered' && (
            <button
              onClick={() => markAnsweredMutation.mutate()}
              disabled={markAnsweredMutation.isPending}
              className="h-[44px] bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {L.markAnswered}
            </button>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">{L.addUpdate}</h2>
            <p className="text-sm text-gray-500">{uiLanguage === 'om' ? 'Feature turan ye\'a.' : 'Coming soon.'}</p>
            <button
              onClick={() => setShowUpdateModal(false)}
              className="mt-6 h-[44px] w-full bg-gray-200 text-gray-900 font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}