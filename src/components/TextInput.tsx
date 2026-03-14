import { Trash2, Copy } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export default function TextInput({ value, onChange, onClear }: Props) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(value + (value ? '\\n\\n' : '') + text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-600">Input Teks AI:</span>
        <div className="flex gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Paste
          </button>
          <button
            onClick={onClear}
            disabled={!value}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Semua
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste teks hasil generate dari ChatGPT, Claude, Gemini, dll di sini..."
        className="flex-1 w-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg bg-gray-50 text-gray-800"
      />
    </div>
  );
}