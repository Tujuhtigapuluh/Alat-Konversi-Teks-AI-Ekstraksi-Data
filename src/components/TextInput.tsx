import { useRef } from 'react';
import { Clipboard, Trash2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export default function TextInput({ value, onChange, onClear }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      // Fallback: focus textarea for manual paste
      textareaRef.current?.focus();
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePaste}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste dari Clipboard
          </button>
        </div>
        {value && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {wordCount} kata · {charCount} karakter
            </span>
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paste teks dari ChatGPT, Gemini, Claude, atau AI lainnya di sini...

Contoh format yang didukung:
# Judul Bab
## Sub Judul
Paragraf teks biasa akan diformat otomatis.

- Item list 1
- Item list 2

1. Numbered item 1
2. Numbered item 2

> Kutipan atau blockquote

**Teks bold** dan *teks italic*`}
        className="w-full h-64 sm:h-80 p-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400 font-mono"
        spellCheck={false}
      />
    </div>
  );
}
