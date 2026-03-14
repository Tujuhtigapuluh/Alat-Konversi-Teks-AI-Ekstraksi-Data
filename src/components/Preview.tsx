import { Eye, EyeOff } from 'lucide-react';
import { DocumentType } from '../utils/textFormatter';

interface Props {
  html: string;
  docType: DocumentType;
  visible: boolean;
  onToggle: () => void;
}

export default function Preview({ html, visible, onToggle }: Props) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors mb-3 cursor-pointer"
      >
        {visible ? (
          <>
            <EyeOff className="w-4 h-4" />
            Sembunyikan Preview
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Tampilkan Preview
          </>
        )}
      </button>

      {visible && html && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-500 ml-2">Preview Dokumen</span>
          </div>
          <div
            className="p-6 bg-white max-h-[600px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}
