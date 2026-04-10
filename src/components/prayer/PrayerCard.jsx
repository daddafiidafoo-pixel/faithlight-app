import React from 'react';
import { Trash2, Edit2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  waiting: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  answered: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function PrayerCard({
  prayer,
  categories,
  uiLanguage,
  onDelete,
  onEdit,
  onView,
}) {
  const category = categories?.find(c => c.category_key === prayer.category);
  const categoryName = uiLanguage === 'om' ? category?.name_om : category?.name_en;

  const getStatusLabel = (status) => {
    const labels = {
      en: { active: 'Active', waiting: 'Waiting', answered: 'Answered', archived: 'Archived' },
      om: { active: 'Hojii Irra Jira', waiting: 'Eegaa Jira', answered: 'Deebii Argateera', archived: 'Kuusame' },
    };
    return labels[uiLanguage]?.[status] || labels.en[status];
  };

  const preview = prayer.body?.substring(0, 80) + (prayer.body?.length > 80 ? '...' : '');
  const createdDate = new Date(prayer.created_date).toLocaleDateString(uiLanguage === 'om' ? 'om-ET' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1 pr-2">{prayer.title}</h3>
        <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Edit prayer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this prayer?')) onDelete();
            }}
            className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            aria-label="Delete prayer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{preview}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {categoryName && (
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
            {categoryName}
          </span>
        )}
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[prayer.status]}`}>
          {getStatusLabel(prayer.status)}
        </span>
        {prayer.linked_verse_count > 0 && (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
            {prayer.linked_verse_count} {uiLanguage === 'om' ? 'aayata' : 'verse'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{createdDate}</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </motion.div>
  );
}