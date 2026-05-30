import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, Heading3, AlignLeft, AlignCenter, AlignRight, Link2, RotateCcw, RotateCw } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Describe details, specifications, features...' }) => {
  const editorRef = useRef(null);

  // Keep content synchronized when changed from outside
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, argument = '') => {
    document.execCommand(command, false, argument);
    handleInput();
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40 transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500">
      {/* Rich Editor Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Large Heading"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter hyperlink URL (EX: https://example.com):');
            if (url) executeCommand('createLink', url);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-brand-600 transition-colors"
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
        </button>

        <div className="flex-grow" />

        <button
          type="button"
          onClick={() => executeCommand('undo')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-brand-600 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('redo')}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-brand-600 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Editable Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[220px] max-h-[360px] overflow-y-auto text-xs text-slate-800 dark:text-white outline-none prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-dark-850/20"
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
