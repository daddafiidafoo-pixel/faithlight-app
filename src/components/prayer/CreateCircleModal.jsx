import React, { useState } from 'react';
import { X } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function CreateCircleModal({ onCreate, onClose, uiLang }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: true,
    maxMembers: 20,
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t(uiLang, 'circles.createNew') || 'Create Prayer Circle'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder={t(uiLang, 'circles.circleName') || 'Circle name...'}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm font-semibold"
          />

          <textarea
            placeholder={t(uiLang, 'circles.description') || 'Describe the circle\'s purpose...'}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm h-24"
          />

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              {t(uiLang, 'circles.maxMembers') || 'Maximum Members'}
            </label>
            <input
              type="number"
              min="2"
              max="100"
              value={formData.maxMembers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
              className="w-full px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-xl text-sm"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">{t(uiLang, 'circles.privateCircle') || 'Private (invite only)'}</span>
          </label>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 min-h-[44px] border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50"
            >
              {t(uiLang, 'common.cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 min-h-[44px] bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              {t(uiLang, 'common.create') || 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}