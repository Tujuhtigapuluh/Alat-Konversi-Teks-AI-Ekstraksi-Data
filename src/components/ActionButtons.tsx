import { Download, FileCode2 } from 'lucide-react';
import { Section, DocumentType } from '../utils/textFormatter';

interface Props {
  sections: Section[];
  docType: DocumentType;
  html: string;
}

export default function ActionButtons({ docType, html }: Props) {
  const handleDownloadDocx = () => {
    // Skripsi usually requires: Left: 4cm, Right: 3cm, Top: 3cm, Bottom: 3cm
    const margin = docType === 'skripsi' || docType === 'makalah' 
      ? 'margin: 3.0cm 3.0cm 3.0cm 4.0cm;' 
      : 'margin: 2.54cm 2.54cm 2.54cm 2.54cm;';

    const preHtml = `<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<title>Export HTML To Doc</title>
<style>
@page WordSection1 {
  size: 21.0cm 29.7cm; /* A4 */
  ${margin}
  mso-header-margin: 36.0pt;
  mso-footer-margin: 36.0pt;
  mso-paper-source: 0;
}
div.WordSection1 {
  page: WordSection1;
}
</style>
</head>
<body>
<div class="WordSection1">`;
    const postHtml = "</div></body></html>";
    const htmlContent = preHtml + html + postHtml;

    // Word needs BOM to recognize UTF-8 properly
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document_${docType}_${new Date().getTime()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    alert('HTML disalin ke clipboard!');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownloadDocx}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
      >
        <Download className="w-5 h-5" />
        Download .doc
      </button>
      <button
        onClick={handleCopyHtml}
        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors shadow-sm"
      >
        <FileCode2 className="w-5 h-5" />
        Copy HTML
      </button>
    </div>
  );
}