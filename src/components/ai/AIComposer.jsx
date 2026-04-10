import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, RotateCcw } from 'lucide-react';

export default function AIComposer({ input, setInput, onSend, loading, onReset, isEmpty, language }) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-gray-100 p-3 bg-white">
      <div className="flex gap-2 items-end">
        {!isEmpty && (
          <button onClick={onReset} className="text-gray-300 hover:text-gray-500 transition-colors mb-1" title={language === 'om' ? 'Haaraa' : 'New'}>
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'om' ? 'Kitaaba, kadhannaa, dandeettii…' : 'Ask about Scripture, prayers, plans…'}
          className="flex-1 min-h-[44px] max-h-[120px] resize-none text-sm border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
          rows={1}
        />
        <Button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 p-0 rounded-xl flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      {!isEmpty && (
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          {language === 'om' ? 'Enter ergaa keessa ~' : 'Press Enter to send'}
        </p>
      )}
    </div>
  );
}