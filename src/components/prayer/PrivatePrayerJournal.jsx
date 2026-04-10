import React, { useState, useEffect } from 'react';
import { Heart, Search, Filter, Plus, Calendar, Tag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import JournalEntryForm from './JournalEntryForm';
import JournalEntryCard from './JournalEntryCard';

export default function PrivatePrayerJournal({ userEmail, uiLang }) {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const moods = ['grateful', 'hopeful', 'struggling', 'peaceful', 'seeking', 'joyful', 'anxious', 'reflective'];
  const categories = ['personal', 'family', 'health', 'work', 'faith', 'gratitude', 'intercession', 'other'];

  useEffect(() => {
    if (userEmail) loadEntries();
  }, [userEmail]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, selectedMood, selectedCategory]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.PrivatePrayerJournal.filter(
        { userEmail },
        '-entryDate',
        100
      );
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
      toast.error(t(uiLang, 'journal.loadError') || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        e => e.title.toLowerCase().includes(lower) || e.content.toLowerCase().includes(lower)
      );
    }

    if (selectedMood !== 'all') {
      filtered = filtered.filter(e => e.mood === selectedMood);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    setFilteredEntries(filtered);
  };

  const handleSave = async (entryData) => {
    try {
      if (editingEntry) {
        await base44.entities.PrivatePrayerJournal.update(editingEntry.id, entryData);
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...entryData } : e));
        toast.success(t(uiLang, 'journal.entryUpdated') || 'Entry updated');
      } else {
        const created = await base44.entities.PrivatePrayerJournal.create({
          userEmail,
          ...entryData,
        });
        setEntries(prev => [created, ...prev]);
        toast.success(t(uiLang, 'journal.entrySaved') || 'Prayer saved');
      }
      setShowForm(false);
      setEditingEntry(null);
    } catch (err) {
      console.error('Failed to save entry:', err);
      toast.error(t(uiLang, 'journal.saveError') || 'Failed to save prayer');
    }
  };

  const handleDelete = async (entryId) => {
    if (!confirm(t(uiLang, 'journal.confirmDelete') || 'Delete this entry?')) return;
    try {
      await base44.entities.PrivatePrayerJournal.delete(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success(t(uiLang, 'journal.deleted') || 'Entry deleted');
    } catch (err) {
      console.error('Failed to delete entry:', err);
      toast.error(t(uiLang, 'journal.deleteError') || 'Failed to delete');
    }
  };

  const handleAddReflection = async (entryId, note) => {
    try {
      const entry = entries.find(e => e.id === entryId);
      const reflections = entry.reflections || [];
      reflections.push({
        date: new Date().toISOString().split('T')[0],
        note,
        answered: false,
      });
      await base44.entities.PrivatePrayerJournal.update(entryId, { reflections });
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, reflections } : e));
      toast.success(t(uiLang, 'journal.reflectionAdded') || 'Reflection added');
    } catch (err) {
      console.error('Failed to add reflection:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-4">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Heart size={24} className="text-indigo-600" />
            {t(uiLang, 'journal.title') || 'Prayer Journal'}
          </h1>
          <p className="text-sm text-gray-600">
            {t(uiLang, 'journal.subtitle') || 'Record your spiritual journey and reflect on answered prayers'}
          </p>
        </div>

        {/* New Entry Button */}
        <button
          onClick={() => {
            setEditingEntry(null);
            setShowForm(!showForm);
          }}
          className="w-full min-h-[44px] mb-4 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          {t(uiLang, 'journal.newEntry') || 'New Prayer Entry'}
        </button>

        {/* Form */}
        {showForm && (
          <JournalEntryForm
            initialData={editingEntry}
            onSubmit={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(null);
            }}
            uiLang={uiLang}
          />
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t(uiLang, 'journal.search') || 'Search entries...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm"
              />
            </div>

            {/* Mood Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {t(uiLang, 'journal.mood') || 'Mood'}
              </label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full mt-1 px-3 py-2 min-h-[44px] border border-gray-200 rounded-xl text-sm"
              >
                <option value="all">{t(uiLang, 'journal.allMoods') || 'All Moods'}</option>
                {moods.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {t(uiLang, 'journal.category') || 'Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 min-h-[44px] border border-gray-200 rounded-xl text-sm"
              >
                <option value="all">{t(uiLang, 'journal.allCategories') || 'All Categories'}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">{t(uiLang, 'journal.noEntries') || 'No prayer entries yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map(entry => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => {
                  setEditingEntry(entry);
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(entry.id)}
                onAddReflection={(note) => handleAddReflection(entry.id, note)}
                uiLang={uiLang}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}