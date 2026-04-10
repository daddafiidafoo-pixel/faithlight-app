import React, { useState } from 'react';
import { X, Share2, Copy, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';

export default function AIExplanationPanel({ explanation, onClose }) {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `${explanation.verseRef}\n\n${explanation.explanation}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] animate-in slide-in-from-bottom">
        <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={onClose}
              className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              ✨ {t('bible.aiExplanation', 'AI Explanation')}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Verse Reference */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t('bible.verse', 'Verse')}
              </p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {explanation.verseRef}
              </p>
            </div>

            {/* Verse Text */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "{explanation.verseText}"
              </p>
            </div>

            {/* AI Explanation */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t('bible.explanation', 'Explanation')}
              </p>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {explanation.explanation}
                </p>
              </div>
            </div>

            {/* Generated At */}
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('bible.generatedWith', 'Generated with AI')} •{' '}
              {new Date(explanation.generatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">
                {copied ? t('actions.copied', 'Copied') : t('actions.copy', 'Copy')}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t('actions.save', 'Save')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t('actions.share', 'Share')}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}