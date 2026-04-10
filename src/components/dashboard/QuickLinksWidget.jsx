import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';

export default function QuickLinksWidget({ links = [] }) {
  if (!links.length) return null;
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-3">⚡ Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          {links.map(link => (
            <Link key={link.id} to={createPageUrl(link.page)}>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm transition-all text-sm font-medium text-gray-800 hover:text-indigo-700">
                <span className="text-base">{link.icon}</span>
                {link.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}