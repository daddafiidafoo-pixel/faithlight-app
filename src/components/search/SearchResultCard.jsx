import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function buildHighlightedText(text, parsed) {
  if (!text) return '';
  let result = text;

  const toMark = [];
  if (parsed?.phrase) toMark.push(parsed.phrase);
  if (parsed?.terms?.length > 0) toMark.push(...parsed.terms);

  toMark
    .filter(Boolean)
    .sort((a, b) => b.length - a.length) // longest first to avoid overlapping
    .forEach(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
    });

  return result;
}

export default function SearchResultCard({ result, query, parsed, isAi = false, note }) {
  const highlighted = buildHighlightedText(result.text, parsed);
  const verseRef = `${result.book} ${result.chapter}:${result.verse}`;
  const url = createPageUrl(`BibleReader?book=${encodeURIComponent(result.book)}&chapter=${result.chapter}&translation=${(result.translation || 'WEB').replace(' (AI)', '').replace('AI ', '')}`);

  const inner = (
    <Card className={`transition-all border hover:shadow-md cursor-pointer ${
      isAi
        ? 'border-indigo-100 hover:border-indigo-300 bg-indigo-50/30'
        : 'border-gray-200 hover:border-indigo-300'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold text-indigo-700 text-sm">{verseRef}</span>
              <Badge variant="outline" className="text-xs py-0 h-5">
                {isAi ? <><Sparkles className="w-2.5 h-2.5 mr-1 text-indigo-500" />AI · WEB</> : result.translation}
              </Badge>
            </div>
            <p
              className="text-sm text-gray-800 leading-relaxed italic [&_mark]:bg-yellow-200 [&_mark]:text-gray-900 [&_mark]:rounded-sm [&_mark]:px-0.5 [&_mark]:not-italic"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
            {note && (
              <p className="text-xs text-indigo-500 mt-1.5 not-italic">
                <Sparkles className="w-3 h-3 inline mr-1" />{note}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isAi) return <Link to={url}>{inner}</Link>;
  return <Link to={url}>{inner}</Link>;
}