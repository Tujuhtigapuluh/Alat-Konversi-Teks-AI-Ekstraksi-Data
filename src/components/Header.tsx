import { FileText, Sparkles, Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              AI Text Formatter
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h1>
            <p className="text-xs text-gray-500 -mt-0.5">Rapikan & humanisasi teks AI → Dokumen akademik</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            Anti-Turnitin
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            v2.0
          </span>
        </div>
      </div>
    </header>
  );
}
