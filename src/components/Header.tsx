import { FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg">AI Text Formatter</h1>
          <p className="text-xs text-gray-500">Rapikan teks AI untuk dokumen akademik</p>
        </div>
      </div>
    </header>
  );
}