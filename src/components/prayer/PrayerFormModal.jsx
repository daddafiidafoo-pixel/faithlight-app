import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const UI = {
  en: {
    prayerTitle: 'Prayer Title',
    writeYourPrayer: 'Write your prayer...',
    category: 'Category',
    privacy: 'Privacy',
    savePrayer: 'Save Prayer',
    cancel: 'Cancel',
  },
  om: {
    prayerTitle: 'Mata-duree Kadhataa',
    writeYourPrayer: 'Kadhata kee barreessi...',
    category: 'Ramaddii',
    privacy: 'Icciitii',
    savePrayer: 'Kadhata Kuusi',
    cancel: 'Haqi',
  },
};

export default function PrayerFormModal({ prayer, categories, onSave, onClose }) {
  const uiLanguage = 'en';
  const L = UI[uiLanguage] || UI.en;
  const [formData, setFormData] = useState(
    prayer || {
      title: '',
      body: '',
      category: categories[0]?.category_key || '',
      status: 'active',
      privacy_level: 'private',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body) return;
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-2xl p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{prayer ? 'Edit Prayer' : 'New Prayer'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">{L.prayerTitle}</label>
            <input
              type="text"
              placeholder={L.prayerTitle}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Prayer</label>
            <textarea
              placeholder={L.writeYourPrayer}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full p-3 border rounded-lg min-h-40"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{L.category}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.category_key}>
                    {cat.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{L.privacy}</label>
              <select
                value={formData.privacy_level}
                onChange={(e) => setFormData({ ...formData, privacy_level: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              {L.cancel}
            </Button>
            <Button type="submit">{L.savePrayer}</Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}