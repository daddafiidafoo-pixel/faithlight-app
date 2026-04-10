import React from 'react';
import { templates } from './VerseTemplatePreview';
import { Check } from 'lucide-react';

export default function TemplateSelector({ selectedTemplate, onSelect }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(templates).map(([key, template]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`relative p-3 rounded-lg border-2 transition ${
              selectedTemplate === key
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Template Preview */}
            <div
              className="w-full aspect-square rounded mb-2 flex items-center justify-center relative overflow-hidden"
              style={{
                background: template.bg,
              }}
            >
              <p
                className="text-xs text-center leading-tight px-1"
                style={{ color: template.textColor }}
              >
                Verse
              </p>
              {selectedTemplate === key && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Template Name */}
            <p className="text-sm font-medium text-gray-900">{template.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}