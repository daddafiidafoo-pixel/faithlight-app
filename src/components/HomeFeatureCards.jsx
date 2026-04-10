import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BookOpen, Headphones, Sun, Sparkles } from 'lucide-react';

export default function HomeFeatureCards() {
  const features = [
    {
      icon: BookOpen,
      title: 'Bible Reader',
      description: 'Browse and read Scripture with a clean, fast reader.',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      link: '/BibleReader',
    },
    {
      icon: Headphones,
      title: 'Audio Bible',
      description: 'Listen to God\'s Word with smooth playback.',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      link: '/AudioBible',
    },
    {
      icon: Sun,
      title: 'Daily Devotional',
      description: 'Start each day with short devotionals and prayers.',
      color: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      link: '/StudyPlans',
    },
    {
      icon: Sparkles,
      title: 'Ask AI',
      description: 'Get simple Bible explanations and verse meanings.',
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100',
      link: '/BibleTutor',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore Our Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read, listen, and grow—anytime, anywhere.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link
                key={idx}
                to={createPageUrl(feature.link.replace('/', ''))}
                className="group"
              >
                <div className="h-full bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  {/* Icon Circle */}
                  <div className={`${feature.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-gray-900" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Learn more
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            New to FaithLight?{' '}
            <span className="font-semibold text-gray-900">
              Start with the Bible Reader or join our community to grow together.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}