import { useState, useMemo, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DocumentTypeSelector from './components/DocumentTypeSelector';
import TextInput from './components/TextInput';
import Preview from './components/Preview';
import ActionButtons from './components/ActionButtons';
import { DocumentType, parseAIText, sectionsToHtml } from './utils/textFormatter';
import {
  Wand2,
  ArrowDown,
  CheckCircle2,
  Lightbulb,
  Zap,
  Layout,
  Type,
  List,
  AlertCircle,
} from 'lucide-react';

const STORAGE_KEY = 'ai-text-formatter-data';

export default function App() {
  const [rawText, setRawText] = useState('');
  const [docType, setDocType] = useState<DocumentType>('skripsi');
  const [showPreview, setShowPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.rawText) setRawText(data.rawText);
        if (data.docType) setDocType(data.docType);
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      const data = { rawText, docType, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [rawText, docType, isLoaded]);

  const sections = useMemo(() => {
    try {
      setError(null);
      if (!rawText.trim()) return [];
      return parseAIText(rawText);
    } catch (err) {
      console.error('Parsing error:', err);
      setError('Terjadi kesalahan saat memparse teks. Pastikan format teks valid.');
      return [];
    }
  }, [rawText]);

  const html = useMemo(() => {
    try {
      if (sections.length === 0) return '';
      return sectionsToHtml(sections, docType);
    } catch (err) {
      console.error('HTML generation error:', err);
      return '';
    }
  }, [sections, docType]);

  const stats = useMemo(() => {
    let headings = 0;
    let paragraphs = 0;
    let lists = 0;
    let quotes = 0;
    let tocItems = 0;

    for (const s of sections) {
      if (s.type === 'h1' || s.type === 'h2' || s.type === 'h3') headings++;
      if (s.type === 'paragraph') paragraphs++;
      if (s.type === 'bullet' || s.type === 'numbered') lists++;
      if (s.type === 'blockquote') quotes++;
      if (s.type === 'toc') tocItems += s.tocItems?.length || 0;
    }

    return { headings, paragraphs, lists, quotes, tocItems, total: sections.length };
  }, [sections]);

  const handleClear = useCallback(() => {
    if (confirm('Yakin ingin menghapus semua teks?')) {
      setRawText('');
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-xs text-red-600 hover:text-red-800 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Step 1: Choose Document Type */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-7 h-7 bg-indigo-500 text-white rounded-full text-sm font-bold">
              1
            </div>
            <h2 className="text-lg font-bold text-gray-800">Pilih Jenis Dokumen</h2>
          </div>
          <DocumentTypeSelector selected={docType} onChange={setDocType} />
        </section>

        {/* Step 2: Input Text */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-7 h-7 bg-indigo-500 text-white rounded-full text-sm font-bold">
              2
            </div>
            <h2 className="text-lg font-bold text-gray-800">Paste Teks dari AI</h2>
            {rawText && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Auto-saved
              </span>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <TextInput value={rawText} onChange={setRawText} onClear={handleClear} />
          </div>
        </section>

        {/* Format indicator */}
        {rawText.trim() && !error && (
          <div className="flex justify-center animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
              <Wand2 className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span className="text-sm font-medium text-indigo-600">
                Otomatis diformat!
              </span>
              <ArrowDown className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        )}

        {/* Stats */}
        {sections.length > 0 && (
          <section className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Terdeteksi {stats.total} elemen
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard
                  icon={<Type className="w-4 h-4" />}
                  label="Heading"
                  value={stats.headings}
                  color="blue"
                />
                <StatCard
                  icon={<Layout className="w-4 h-4" />}
                  label="Paragraf"
                  value={stats.paragraphs}
                  color="purple"
                />
                <StatCard
                  icon={<List className="w-4 h-4" />}
                  label="List"
                  value={stats.lists}
                  color="emerald"
                />
                <StatCard
                  icon={<Zap className="w-4 h-4" />}
                  label="Kutipan"
                  value={stats.quotes}
                  color="amber"
                />
                {stats.tocItems > 0 && (
                  <StatCard
                    icon={<List className="w-4 h-4" />}
                    label="Daftar Isi"
                    value={stats.tocItems}
                    color="indigo"
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Actions */}
        {sections.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-7 h-7 bg-indigo-500 text-white rounded-full text-sm font-bold">
                3
              </div>
              <h2 className="text-lg font-bold text-gray-800">Hasil & Ekspor</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
              <ActionButtons sections={sections} docType={docType} html={html} />
              <Preview
                html={html}
                docType={docType}
                visible={showPreview}
                onToggle={() => setShowPreview(!showPreview)}
              />
            </div>
          </section>
        )}

        {/* Empty state with tips */}
        {!rawText.trim() && (
          <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">💡 Tips Penggunaan</h3>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▸</span>
                      <span>
                        Copy teks dari <strong>ChatGPT, Gemini, Claude, Copilot</strong> atau AI lainnya,
                        lalu paste di kolom input
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▸</span>
                      <span>
                        Format <strong>Daftar Isi</strong> dengan leader dots (.....) akan otomatis 
                        dikenali dan diformat rapi
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▸</span>
                      <span>
                        Format <strong>Markdown</strong> (heading #, bold **, italic *, list -, numbered 1.)
                        akan otomatis dikenali
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▸</span>
                      <span>
                        Pilih jenis dokumen yang sesuai untuk mendapatkan format yang tepat
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▸</span>
                      <span>
                        Download sebagai <strong>.docx</strong> untuk langsung buka di MS Word
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▸</span>
                      <span>
                        Teks akan <strong>auto-save</strong> ke browser, tidak akan hilang saat refresh
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <FeatureCard
                icon="🎯"
                title="Auto-Format"
                desc="Otomatis mengenali heading, paragraf, list, bold, italic, dan kutipan dari teks AI"
              />
              <FeatureCard
                icon="📑"
                title="Daftar Isi Otomatis"
                desc="Format daftar isi dengan leader dots akan tersusun rapi sesuai standar skripsi"
              />
              <FeatureCard
                icon="📄"
                title="Export .docx"
                desc="Download langsung sebagai file Word dengan format yang sesuai standar akademik"
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-indigo-600">AI Text Formatter</span> — Rapikan
            teks AI untuk dokumen akademik dengan mudah ✨
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Mendukung output dari ChatGPT, Gemini, Claude, Copilot, dan AI lainnya
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${colors[color]}`}>
      {icon}
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs opacity-75">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}