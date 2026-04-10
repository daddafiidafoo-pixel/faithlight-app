import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";
import { Book, User } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
          <Book className="w-4 h-4 text-indigo-600" />
        </div>
      )}
      <Card className={`max-w-[80%] ${isUser ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
        <div className="p-4">
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown 
              className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold text-indigo-700">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-300 pl-4 my-2 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </Card>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}