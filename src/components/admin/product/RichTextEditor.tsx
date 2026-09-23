'use client';

import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung bài viết...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  const isInternalChange = useRef(false);

  // Khởi tạo nội dung lần đầu và đồng bộ khi value bên ngoài thay đổi
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value || '');
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      isInternalChange.current = true;
      setSourceCode(html);
      onChange(html);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setSourceCode(html);
    isInternalChange.current = true;
    onChange(html);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (isSourceMode) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      executeCommand('formatBlock', val);
      e.target.value = '';
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Nhập đường dẫn URL (ví dụ: https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs font-['Signika',sans-serif]">
      {/* THANH CÔNG CỤ (TOOLBAR) */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/90 border-b border-slate-200 text-xs">
        {/* Dropdown Heading */}
        <select
          onChange={handleHeadingChange}
          defaultValue=""
          disabled={isSourceMode}
          className="h-7 px-2 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 focus:outline-none focus:border-[#b80012] cursor-pointer disabled:opacity-50"
        >
          <option value="" disabled>Định dạng khối</option>
          <option value="<p>">Đoạn văn (Paragraph)</option>
          <option value="<h1>">Tiêu đề 1 (H1)</option>
          <option value="<h2>">Tiêu đề 2 (H2)</option>
          <option value="<h3>">Tiêu đề 3 (H3)</option>
          <option value="<blockquote>">Trích dẫn (Quote)</option>
        </select>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Nút In đậm [B] */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          disabled={isSourceMode}
          title="In đậm (Ctrl+B)"
          className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer disabled:opacity-50"
        >
          B
        </button>

        {/* Nút In nghiêng [I] */}
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          disabled={isSourceMode}
          title="In nghiêng (Ctrl+I)"
          className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-800 italic font-semibold hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer disabled:opacity-50"
        >
          I
        </button>

        {/* Nút Gạch chân [U] */}
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          disabled={isSourceMode}
          title="Gạch chân (Ctrl+U)"
          className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-800 underline font-semibold hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer disabled:opacity-50"
        >
          U
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Danh sách số [1.] */}
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          disabled={isSourceMode}
          title="Danh sách số"
          className="h-7 px-2 flex items-center gap-1 rounded bg-white border border-slate-200 text-slate-800 font-medium hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer disabled:opacity-50 text-[11px]"
        >
          <span>1.</span>
          <span>List</span>
        </button>

        {/* Danh sách chấm [•] */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          disabled={isSourceMode}
          title="Danh sách chấm"
          className="h-7 px-2 flex items-center gap-1 rounded bg-white border border-slate-200 text-slate-800 font-medium hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer disabled:opacity-50 text-[11px]"
        >
          <span className="text-sm leading-none">•</span>
          <span>Bullet</span>
        </button>

        {/* Trích dẫn ["] */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          disabled={isSourceMode}
          title="Khối trích dẫn"
          className="w-7 h-7 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-800 font-serif text-sm hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer disabled:opacity-50"
        >
          &ldquo;
        </button>

        {/* Chèn liên kết [Link] */}
        <button
          type="button"
          onClick={handleInsertLink}
          disabled={isSourceMode}
          title="Chèn liên kết"
          className="h-7 px-2 flex items-center gap-1 rounded bg-white border border-slate-200 text-slate-800 font-medium hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer disabled:opacity-50 text-[11px]"
        >
          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Link</span>
        </button>

        {/* Xóa định dạng */}
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          disabled={isSourceMode}
          title="Xóa định dạng"
          className="h-7 px-2 flex items-center gap-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-red-600 transition cursor-pointer disabled:opacity-50 text-[11px]"
        >
          <span>Tx</span>
        </button>

        <div className="ml-auto flex items-center gap-1">
          {/* Nút Chuyển đổi mã nguồn HTML */}
          <button
            type="button"
            onClick={() => {
              if (isSourceMode && editorRef.current) {
                editorRef.current.innerHTML = sourceCode;
              }
              setIsSourceMode(!isSourceMode);
            }}
            className={`h-7 px-2.5 rounded text-[11px] font-semibold transition cursor-pointer ${
              isSourceMode
                ? 'bg-[#b80012] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isSourceMode ? 'Xem trực quan' : '</> HTML Source'}
          </button>
        </div>
      </div>

      {/* KHUNG SOẠN THẢO VĂN BẢN */}
      {isSourceMode ? (
        <textarea
          value={sourceCode}
          onChange={handleSourceChange}
          rows={12}
          className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none resize-y"
          placeholder="<div>Nhập mã nguồn HTML...</div>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          className="w-full min-h-[280px] p-4 bg-white text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none rich-editor-content"
          style={{ minHeight: '280px' }}
        />
      )}
    </div>
  );
}
