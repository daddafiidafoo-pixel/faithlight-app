import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import quizCategories from '@/components/quizCategories';
import { Sparkles, BookOpen } from 'lucide-react';

export default function QuizCategories() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const difficulties = {
    easy: {
      en: 'Easy',
      om: 'Falmaa',
      am: 'ቀላል',
      ar: 'سهل',
      sw: 'Rahisi',
      fr: 'Facile',
    },
    medium: {
      en: 'Medium',
      om: 'Giddu',
      am: 'መካከለኛ',
      ar: 'متوسط',
      sw: 'Wastani',
      fr: 'Moyen',
    },
    hard: {
      en: 'Hard',
      om: 'Caalu',
      am: 'ከባድ',
      ar: 'صعب',
      sw: 'Ngumu',
      fr: 'Difficile',
    },
  };

  const handleCategorySelect = (categoryKey) => {
    window.location.href = createPageUrl('QuizPlayer') +
      `?category=${categoryKey}&difficulty=${selectedDifficulty}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              {lang === 'en'
                ? 'Bible Quiz'
                : lang === 'om'
                ? 'Qormaataa Macaaba'
                : 'የመጽሐፍ ቅዱስ ሙከራ'}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {lang === 'en'
              ? 'Choose a category and test your biblical knowledge'
              : lang === 'om'
              ? 'Giddu filadhu fi qixa barbaaraa keetti yaali'
              : 'ምድብ ምረጡ እና ሃይማኖታዊ እውቀትዎን ይሞክሩ'}
          </p>
        </motion.div>

        {/* Difficulty Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex justify-center gap-3 mb-12 flex-wrap"
        >
          {Object.entries(difficulties).map(([key, labels]) => (
            <button
              key={key}
              onClick={() => setSelectedDifficulty(key)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedDifficulty === key
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {labels[lang] || labels.en}
            </button>
          ))}
        </motion.div>

        {/* Categories Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {quizCategories.categories.map((category, index) => (
            <motion.button
              key={category.categoryKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ translateY: -8 }}
              onClick={() => handleCategorySelect(category.categoryKey)}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-4 flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">
                  {category.categoryTitle[lang] || category.categoryTitle.en}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm text-left flex-grow mb-4">
                  {category.categoryDescription[lang] ||
                    category.categoryDescription.en}
                </p>

                {/* CTA */}
                <div className="text-indigo-600 font-semibold text-sm group-hover:text-indigo-700 flex items-center gap-2">
                  {lang === 'en'
                    ? 'Start Quiz'
                    : lang === 'om'
                    ? 'Qormaataa Jalqabi'
                    : 'ፈተናውን ይጀምሩ'}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}