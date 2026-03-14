import { Eye, EyeOff } from 'lucide-react';
import { DocumentType } from '../utils/textFormatter';

interface Props {
  html: string;
  docType: DocumentType;
  visible: boolean;
  onToggle: () => void;
}

export default function Preview({ html, docType, visible, onToggle }: Props) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-800 font-medium">
          {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Preview Dokumen
        </div>
        <button
          onClick={onToggle}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {visible ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>
      
      {visible && (
        <div className="p-4 sm:p-8 overflow-auto max-h-[600px] flex justify-center bg-gray-100">
          <div 
            className="bg-white w-full max-w-[21cm] min-h-[29.7cm] shadow-md p-[2cm]"
            style={{ 
              fontFamily: docType === 'skripsi' || docType === 'makalah' ? '"Times New Roman", Times, serif' : 'Arial, sans-serif',
              lineHeight: docType === 'jurnal' ? '1' : docType === 'skripsi' ? '1.5' : '1.15'
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}