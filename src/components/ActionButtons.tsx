import { useState } from 'react';
import { Download, Check, FileText, Code } from 'lucide-react';
import { DocumentType, generateDocxBlob } from '../utils/textFormatter';

interface Props {
  sections: unknown[];
  docType: DocumentType;
  html: string;
}

export default function ActionButtons({ docType, html }: Props) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleDownloadDocx = () => {
    const blob = generateDocxBlob(html);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dokumen-${docType}-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ]);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      // Fallback
      await navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  const handleCopyPlainFormatted = async () => {
    try {
      // Copy as rich text so it pastes formatted in Word/Docs
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ]);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      await navigator.clipboard.writeText(html);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownloadDocx}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:shadow-lg cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Download .doc
      </button>

      <button
        onClick={handleCopyPlainFormatted}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
      >
        {copiedText ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Tersalin!</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Copy Formatted
          </>
        )}
      </button>

      <button
        onClick={handleCopyHtml}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
      >
        {copiedHtml ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Tersalin!</span>
          </>
        ) : (
          <>
            <Code className="w-4 h-4" />
            Copy HTML
          </>
        )}
      </button>
    </div>
  );
}
