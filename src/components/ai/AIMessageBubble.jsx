import React, { useState } from 'react';
import { Sparkles, Copy, Check, Flag, FileText, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import AIReportButton from './AIReportButton';

export default function AIMessageBubble({ msg, idx, sessionId, user, language, onSave }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const copyMessage = async (content) => {
    await navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success(language === 'om' ? 'Garagalche' : 'Copied');
  };

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end gap-2">
        <div className="max-w-[85%] bg-indigo-600 text-white rounded-2xl px-4 py-3">
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800">
          <ReactMarkdown
            className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              h1: ({ children }) => <h1 className="text-base font-bold my-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold my-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold my-1">{children}</h3>,
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 mt-1.5">
          <button onClick={() => copyMessage(msg.content)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            {copiedIdx === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copiedIdx === idx ? (language === 'om' ? 'Garagalche' : 'Copied') : (language === 'om' ? 'Garagalchi' : 'Copy')}
          </button>
          {msg.skill === 'sermon_outline' && (
            <button onClick={() => onSave?.(msg.content, 'sermon')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
              <FileText className="w-3 h-3" />
              {language === 'om' ? 'Olkaa\'i' : 'Save'}
            </button>
          )}
          {msg.skill === 'study_plan' && (
            <button onClick={() => onSave?.(msg.content, 'study_plan')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
              <BookOpen className="w-3 h-3" />
              {language === 'om' ? 'Olkaa\'i' : 'Save'}
            </button>
          )}
          <AIReportButton
            user={user}
            aiResponse={msg.content}
            prompt=""
            sessionId={sessionId}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}