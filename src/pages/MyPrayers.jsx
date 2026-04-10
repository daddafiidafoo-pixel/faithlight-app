import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguageStore } from '@/components/languageStore';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import PrayerCard from '@/components/prayer/PrayerCard';

const LABELS = {
  en: {
    title: 'My Prayers',
    subtitle: 'A personal space to bring your heart before God',
    active: 'Active',
    answered: 'Answered',
    total: 'Total',
    addNew: 'Add New Prayer',
    search: 'Search prayers...',
    allCategories: 'All Categories',
    allStatus: 'All Status',
    newestFirst: 'Newest First',
    oldestFirst: 'Oldest First',
    recentlyUpdated: 'Recently Updated',
    noPrayers: 'No prayers yet. Add your first one!',
  },
  om: {
    title: 'Kadhata Koo',
    subtitle: 'Bakka dhuunfaa garaa kee Waaqayyo duratti fiddu',
    active: 'Hojii Irra Jira',
    answered: 'Deebii Argateera',
    total: 'Waliigala',
    addNew: 'Kadhata Haaraa Dabali',
    search: 'Kadhata barbaadi...',
    allCategories: 'Ramaddii Hunda',
    allStatus: 'Haala Hunda',
    newestFirst: 'Isa Haaraa Duraa',
    oldestFirst: 'Isa Moofaa Duraa',
    recentlyUpdated: 'Isa Dhiheenya Fooyya\'e',
    noPrayers: 'Ammaaf kadhanni hin jiru. Kadhata kee isa jalqabaa dabali!',
  },
};

const STATUS_COLORS = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  waiting: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  answered: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function MyPrayers() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const L = LABELS[uiLanguage] || LABELS.en;
  const queryClient = useQueryClient();

  // Fetch user's prayers (non-archived)
  const { data: prayers = [], isLoading: prayersLoading } = useQuery({
    queryKey: ['myPrayers', user?.email],
    queryFn: async () => {
      if (!isAuthenticated || !user?.email) return [];
      const results = await base44.entities.MyPrayer.filter(
        { user_id: user.email, archived: false },
        '-created_date',
        100
      );
      return results || [];
    },
    enabled: isAuthenticated && !!user?.email,
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (prayerId) => base44.entities.MyPrayer.delete(prayerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPrayers'] });
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    const active = prayers.filter(p => p.status === 'active').length;
    const answered = prayers.filter(p => p.is_answered).length;
    const total = prayers.length;
    return { active, answered, total };
  }, [prayers]);

  // Filter and sort
  const filteredPrayers = useMemo(() => {
    let filtered = prayers;

    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        p => p.title?.toLowerCase().includes(lower) || p.body?.toLowerCase().includes(lower)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    } else if (sortBy === 'updated') {
      filtered.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    }

    return filtered;
  }, [prayers, searchText, selectedCategory, selectedStatus, sortBy]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{uiLanguage === 'om' ? 'Barannoo loofaa roga\'ee kanaaf barbaada.' : 'Please log in to view your prayers.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-8">
        <h1 className="text-3xl font-bold">{L.title}</h1>
        <p className="mt-2 text-indigo-100">{L.subtitle}</p>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: L.active, value: stats.active },
            { label: L.answered, value: stats.answered },
            { label: L.total, value: stats.total },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200"
            >
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Add New Button */}
        <Link
          to="/AddPrayer"
          className="flex items-center justify-center gap-2 h-[52px] bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {L.addNew}
        </Link>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={L.search}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{L.allCategories}</option>
              {categories.map(cat => (
                <option key={cat.category_key} value={cat.category_key}>
                  {uiLanguage === 'om' ? cat.name_om : cat.name_en}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{L.allStatus}</option>
              <option value="active">{L.active}</option>
              <option value="waiting">{uiLanguage === 'om' ? 'Eegaa Jira' : 'Waiting'}</option>
              <option value="answered">{L.answered}</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">{L.newestFirst}</option>
              <option value="oldest">{L.oldestFirst}</option>
              <option value="updated">{L.recentlyUpdated}</option>
            </select>
          </div>
        </div>

        {/* Prayer List */}
        {prayersLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredPrayers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{L.noPrayers}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPrayers.map((prayer, idx) => (
              <motion.div
                key={prayer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PrayerCard
                  prayer={prayer}
                  categories={categories}
                  uiLanguage={uiLanguage}
                  onDelete={() => deleteMutation.mutate(prayer.id)}
                  onEdit={() => navigate(`/EditPrayer/${prayer.id}`)}
                  onView={() => navigate(`/PrayerDetail/${prayer.id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}