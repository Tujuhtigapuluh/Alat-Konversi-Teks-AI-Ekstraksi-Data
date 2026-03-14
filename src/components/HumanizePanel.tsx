import { useState, useMemo, useCallback } from 'react';
import {
  Shield,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Gauge,
  FlameKindling,
} from 'lucide-react';
import { HumanizeLevel, humanizeWithStructure, HumanizeResult } from '../utils/humanizer';

interface Props {
  rawText: string;
  onApply: (humanizedText: string) => void;
}

export default function HumanizePanel({ rawText, onApply }: Props) {
  const [level, setLevel] = useState<HumanizeLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [appliedToInput, setAppliedToInput] = useState(false);

  const result: HumanizeResult | null = useMemo(() => {
    if (!rawText.trim() || !showResult) return null;
    return humanizeWithStructure(rawText, level);
  }, [rawText, level, showResult]);

  const handleHumanize = useCallback(() => {
    setIsProcessing(true);
    setShowResult(false);
    setAppliedToInput(false);
    // Simulate processing time for UX feel
    setTimeout(() => {
      setShowResult(true);
      setIsProcessing(false);
    }, 800);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = result.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleApplyToInput = useCallback(() => {
    if (!result) return;
    onApply(result.text);
    setAppliedToInput(true);
    setTimeout(() => setAppliedToInput(false), 3000);
  }, [result, onApply]);

  const levels: { value: HumanizeLevel; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      value: 'light',
      label: 'Ringan',
      desc: 'Ganti ~25% kata, pola AI dasar',
      icon: <Zap className="w-4 h-4" />,
      color: 'green',
    },
    {
      value: 'medium',
      label: 'Sedang',
      desc: 'Ganti ~45% kata, restrukturisasi',
      icon: <Gauge className="w-4 h-4" />,
      color: 'amber',
    },
    {
      value: 'heavy',
      label: 'Maksimal',
      desc: 'Ganti ~65% kata, ubah struktur kalimat',
      icon: <FlameKindling className="w-4 h-4" />,
      color: 'red',
    },
  ];

  const levelColors: Record<string, { active: string; bg: string; border: string }> = {
    green: {
      active: 'border-green-500 bg-green-50 shadow-md shadow-green-100',
      bg: 'bg-green-500 text-white',
      border: 'border-green-200 hover:border-green-300',
    },
    amber: {
      active: 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100',
      bg: 'bg-amber-500 text-white',
      border: 'border-amber-200 hover:border-amber-300',
    },
    red: {
      active: 'border-red-500 bg-red-50 shadow-md shadow-red-100',
      bg: 'bg-red-500 text-white',
      border: 'border-red-200 hover:border-red-300',
    },
  };

  const getScoreColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-50';
    if (score <= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 15) return 'Sangat Aman ✅';
    if (score <= 30) return 'Aman ✅';
    if (score <= 50) return 'Cukup Aman ⚠️';
    return 'Perlu Humanisasi Lagi ⚠️';
  };

  return (
    <div className="space-y-4">
      {/* Level Selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Intensitas Humanisasi:</p>
        <div className="grid grid-cols-3 gap-3">
          {levels.map((l) => {
            const isActive = level === l.value;
            const colors = levelColors[l.color];
            return (
              <button
                key={l.value}
                onClick={() => {
                  setLevel(l.value);
                  setShowResult(false);
                }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isActive ? colors.active : `bg-white ${colors.border}`
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? colors.bg : 'bg-gray-100 text-gray-500'}`}>
                  {l.icon}
                </div>
                <span className={`text-sm font-semibold ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                  {l.label}
                </span>
                <span className={`text-[10px] text-center leading-tight ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                  {l.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Humanize Button */}
      <button
        onClick={handleHumanize}
        disabled={!rawText.trim() || isProcessing}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
          isProcessing
            ? 'bg-purple-400 text-white cursor-wait'
            : !rawText.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-200 hover:shadow-xl'
        }`}
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Sedang memproses humanisasi...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            Humanisasi Teks — Anti Turnitin
            <Sparkles className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Warning */}
      {!rawText.trim() && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">Paste teks AI terlebih dahulu di kolom input di atas, lalu klik tombol humanisasi.</p>
        </div>
      )}

      {/* Result */}
      {result && showResult && (
        <div className="space-y-4 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{result.changes}</p>
              <p className="text-xs text-purple-500">Total Perubahan</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{result.newWordCount}</p>
              <p className="text-xs text-blue-500">Jumlah Kata</p>
            </div>
            <div className={`border rounded-xl p-3 text-center ${getScoreColor(result.similarityEstimate)}`}>
              <p className="text-2xl font-bold">{Math.max(0, 100 - result.similarityEstimate)}%</p>
              <p className="text-xs opacity-75">Tingkat Perubahan</p>
            </div>
            <div className={`border rounded-xl p-3 text-center ${getScoreColor(result.similarityEstimate)}`}>
              <p className="text-sm font-bold mt-1">{getScoreLabel(result.similarityEstimate)}</p>
              <p className="text-xs opacity-75 mt-1">Estimasi Turnitin</p>
            </div>
          </div>

          {/* Turnitin Safety Meter */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Turnitin Safety Meter</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(result.similarityEstimate)}`}>
                {getScoreLabel(result.similarityEstimate)}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.max(5, 100 - result.similarityEstimate)}%`,
                  background: result.similarityEstimate <= 20
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : result.similarityEstimate <= 40
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #ef4444, #dc2626)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">Rendah</span>
              <span className="text-[10px] text-gray-400">Tinggi</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 shadow-md shadow-purple-200 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Hasil Humanisasi
                </>
              )}
            </button>

            <button
              onClick={handleApplyToInput}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-purple-700 text-sm font-semibold rounded-xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer"
            >
              {appliedToInput ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Diterapkan!</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Terapkan ke Input
                </>
              )}
            </button>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
            >
              {showComparison ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Tutup Perbandingan
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Lihat Perbandingan
                </>
              )}
            </button>
          </div>

          {/* Comparison View */}
          {showComparison && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-sm font-semibold text-gray-700">Teks Asli (AI)</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-80 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm font-semibold text-gray-700">Teks Humanisasi</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-h-80 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result.text}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Humanized Text Preview */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-gray-700">Hasil Humanisasi:</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{result.text}</pre>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-purple-800 mb-2">💡 Tips agar Lolos Turnitin:</h4>
            <ul className="space-y-1.5 text-xs text-purple-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">▸</span>
                <span>Gunakan level <strong>Maksimal</strong> untuk perubahan terbanyak, lalu <strong>review manual</strong> hasilnya</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">▸</span>
                <span>Tambahkan <strong>pengalaman/opini pribadi</strong> ke dalam teks untuk membuatnya lebih unik</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">▸</span>
                <span>Humanisasi bisa dijalankan <strong>beberapa kali</strong> — klik "Terapkan ke Input" lalu humanisasi lagi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">▸</span>
                <span>Selalu <strong>baca ulang</strong> hasil akhir untuk memastikan makna tetap sesuai</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">▸</span>
                <span>Tambahkan <strong>referensi/sitasi</strong> dari sumber yang nyata untuk memperkuat orisinalitas</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
