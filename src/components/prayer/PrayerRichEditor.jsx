import React, { useRef } from 'react';
import { Bold, Italic, List } from 'lucide-react';

/**
 * Lightweight rich text editor without external dependencies.
 * Uses contentEditable + execCommand for bold/italic/bullet formatting.
 */
export default function PrayerRichEditor({ value, onChange, placeholder, className = '', minHeight = 96 }) {
  const editorRef = useRef(null);

  const exec = (command, val = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const isEmpty = !value || value === '<br>' || value === '';

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); exec('bold'); }}
          aria-label="Bold"
          title="Bold"
          className="min-h-[32px] min-w-[32px] rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Bold size={13} />
        </button>
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); exec('italic'); }}
          aria-label="Italic"
          title="Italic"
          className="min-h-[32px] min-w-[32px] rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Italic size={13} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }}
          aria-label="Bullet list"
          title="Bullet list"
          className="min-h-[32px] min-w-[32px] rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <List size={13} />
        </button>
      </div>

      {/* Editable area */}
      <div className="relative">
        {isEmpty && (
          <p className="absolute top-0 left-0 px-3 py-2.5 text-sm text-gray-400 pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          className="w-full px-3 py-2.5 text-sm text-gray-800 outline-none leading-relaxed prose prose-sm max-w-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value || '' }}
          aria-label={placeholder}
          aria-multiline="true"
          role="textbox"
        />
      </div>
    </div>
  );
}

/** Strip HTML tags to get plain text for validation */
export function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}