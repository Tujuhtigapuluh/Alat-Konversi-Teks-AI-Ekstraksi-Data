export type DocumentType = 'skripsi' | 'makalah' | 'jurnal' | 'laporan' | 'essay';

export interface TocItem {
  title: string;
  page?: string;
  level: number;
}

export interface Section {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'numbered' | 'blockquote' | 'toc' | 'code' | 'table';
  content: string;
  items?: string[];
  tocItems?: TocItem[];
  rows?: string[][];
}

function formatInlineMarkdown(text: string): string {
  // Bold + italic
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:0.9em;">$1</code>');
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#4f46e5;text-decoration:underline;">$1</a>');
  return text;
}

function detectTocLine(line: string): TocItem | null {
  // Patterns like: "BAB I PENDAHULUAN ..... 1" or "1.1 Latar Belakang ... 3"
  const tocPattern = /^(\s*)([\w\d].*?)\s*[.…·]{3,}\s*(\d+)\s*$/;
  const match = line.match(tocPattern);
  if (match) {
    const indent = match[1].length;
    const level = indent >= 4 ? 2 : indent >= 2 ? 1 : 0;
    return { title: match[2].trim(), page: match[3], level };
  }
  return null;
}

export function parseAIText(text: string): Section[] {
  const lines = text.split('\n');
  const sections: Section[] = [];
  let i = 0;

  // Check for TOC block
  let tocItems: TocItem[] = [];
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      // If we were collecting TOC items, flush them
      if (tocItems.length > 0) {
        sections.push({ type: 'toc', content: '', tocItems: [...tocItems] });
        tocItems = [];
      }
      i++;
      continue;
    }

    // Check for TOC lines
    const tocItem = detectTocLine(line);
    if (tocItem) {
      tocItems.push(tocItem);
      i++;
      continue;
    }

    // Flush any pending TOC items
    if (tocItems.length > 0) {
      sections.push({ type: 'toc', content: '', tocItems: [...tocItems] });
      tocItems = [];
    }

    // Headings (Markdown)
    if (trimmed.startsWith('### ')) {
      sections.push({ type: 'h3', content: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      sections.push({ type: 'h2', content: trimmed.slice(3).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      sections.push({ type: 'h1', content: trimmed.slice(2).trim() });
      i++;
      continue;
    }

    // Detect headings by pattern (all caps or "BAB" prefix or short lines with no period)
    if (/^(BAB\s+[IVXLC]+|BAB\s+\d+)/i.test(trimmed)) {
      sections.push({ type: 'h1', content: trimmed });
      i++;
      continue;
    }

    if (/^(DAFTAR\s+ISI|DAFTAR\s+PUSTAKA|DAFTAR\s+GAMBAR|DAFTAR\s+TABEL|KATA\s+PENGANTAR|ABSTRAK|ABSTRACT|LAMPIRAN|KESIMPULAN|SARAN|PENDAHULUAN|TINJAUAN\s+PUSTAKA|METODOLOGI|HASIL|PEMBAHASAN)/i.test(trimmed)) {
      sections.push({ type: 'h1', content: trimmed });
      i++;
      continue;
    }

    // Numbered sub-headings like "1.1", "1.1.1", "2.3"
    if (/^\d+\.\d+(\.\d+)?\s+[A-Z]/.test(trimmed) && trimmed.length < 100 && !trimmed.endsWith('.')) {
      sections.push({ type: 'h2', content: trimmed });
      i++;
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      sections.push({ type: 'blockquote', content: quoteLines.join(' ') });
      continue;
    }

    // Code blocks
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      sections.push({ type: 'code', content: codeLines.join('\n') });
      continue;
    }

    // Table detection (markdown tables with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const row = lines[i].trim();
        // Skip separator rows like |---|---|
        if (!/^\|[\s\-:]+\|/.test(row) || row.replace(/[\|\s\-:]/g, '').length > 0) {
          if (!/^[\|\s\-:]+$/.test(row)) {
            const cells = row.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
            tableRows.push(cells);
          }
        }
        i++;
      }
      if (tableRows.length > 0) {
        sections.push({ type: 'table', content: '', rows: tableRows });
      }
      continue;
    }

    // Bullet lists
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      sections.push({ type: 'bullet', content: '', items });
      continue;
    }

    // Numbered lists
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      sections.push({ type: 'numbered', content: '', items });
      continue;
    }

    // Lettered lists (a., b., c.)
    if (/^[a-z][.)]\s+/i.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[a-z][.)]\s+/i.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[a-z][.)]\s+/i, ''));
        i++;
      }
      sections.push({ type: 'numbered', content: '', items });
      continue;
    }

    // Regular paragraph - collect consecutive non-empty lines
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() && 
           !lines[i].trim().startsWith('#') && 
           !lines[i].trim().startsWith('> ') &&
           !lines[i].trim().startsWith('```') &&
           !/^[-*•]\s+/.test(lines[i].trim()) &&
           !/^\d+[.)]\s+/.test(lines[i].trim()) &&
           !detectTocLine(lines[i])) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      sections.push({ type: 'paragraph', content: paraLines.join(' ') });
    }
  }

  // Flush remaining TOC items
  if (tocItems.length > 0) {
    sections.push({ type: 'toc', content: '', tocItems: [...tocItems] });
  }

  return sections;
}

const DOC_STYLES: Record<DocumentType, {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  textAlign: string;
  indent: string;
}> = {
  skripsi: {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '12pt',
    lineHeight: '2',
    h1Size: '14pt',
    h2Size: '13pt',
    h3Size: '12pt',
    textAlign: 'justify',
    indent: '1.27cm',
  },
  makalah: {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '12pt',
    lineHeight: '1.5',
    h1Size: '14pt',
    h2Size: '13pt',
    h3Size: '12pt',
    textAlign: 'justify',
    indent: '1.27cm',
  },
  jurnal: {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '11pt',
    lineHeight: '1.15',
    h1Size: '13pt',
    h2Size: '12pt',
    h3Size: '11pt',
    textAlign: 'justify',
    indent: '0.75cm',
  },
  laporan: {
    fontFamily: "'Arial', Helvetica, sans-serif",
    fontSize: '11pt',
    lineHeight: '1.5',
    h1Size: '14pt',
    h2Size: '12pt',
    h3Size: '11pt',
    textAlign: 'left',
    indent: '1cm',
  },
  essay: {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: '12pt',
    lineHeight: '2',
    h1Size: '14pt',
    h2Size: '13pt',
    h3Size: '12pt',
    textAlign: 'left',
    indent: '1.27cm',
  },
};

export function sectionsToHtml(sections: Section[], docType: DocumentType): string {
  const style = DOC_STYLES[docType];
  
  let html = `<div style="font-family:${style.fontFamily};font-size:${style.fontSize};line-height:${style.lineHeight};color:#1a1a1a;max-width:210mm;margin:0 auto;padding:2cm;">`;

  for (const section of sections) {
    switch (section.type) {
      case 'h1':
        html += `<h1 style="font-family:${style.fontFamily};font-size:${style.h1Size};font-weight:bold;text-align:center;margin:24pt 0 12pt 0;text-transform:uppercase;line-height:1.5;">${formatInlineMarkdown(section.content)}</h1>`;
        break;

      case 'h2':
        html += `<h2 style="font-family:${style.fontFamily};font-size:${style.h2Size};font-weight:bold;margin:18pt 0 8pt 0;line-height:1.5;">${formatInlineMarkdown(section.content)}</h2>`;
        break;

      case 'h3':
        html += `<h3 style="font-family:${style.fontFamily};font-size:${style.h3Size};font-weight:bold;font-style:italic;margin:14pt 0 6pt 0;line-height:1.5;">${formatInlineMarkdown(section.content)}</h3>`;
        break;

      case 'paragraph':
        html += `<p style="font-family:${style.fontFamily};font-size:${style.fontSize};text-align:${style.textAlign};text-indent:${style.indent};margin:0 0 6pt 0;line-height:${style.lineHeight};">${formatInlineMarkdown(section.content)}</p>`;
        break;

      case 'bullet':
        html += `<ul style="font-family:${style.fontFamily};font-size:${style.fontSize};margin:6pt 0 6pt 1.5cm;padding:0;line-height:${style.lineHeight};">`;
        for (const item of section.items || []) {
          html += `<li style="margin:2pt 0;">${formatInlineMarkdown(item)}</li>`;
        }
        html += '</ul>';
        break;

      case 'numbered':
        html += `<ol style="font-family:${style.fontFamily};font-size:${style.fontSize};margin:6pt 0 6pt 1.5cm;padding:0;line-height:${style.lineHeight};">`;
        for (const item of section.items || []) {
          html += `<li style="margin:2pt 0;">${formatInlineMarkdown(item)}</li>`;
        }
        html += '</ol>';
        break;

      case 'blockquote':
        html += `<blockquote style="font-family:${style.fontFamily};font-size:${style.fontSize};margin:12pt 1cm 12pt 2cm;padding:8pt 12pt;border-left:3pt solid #6366f1;background:#f8f7ff;font-style:italic;line-height:${style.lineHeight};">${formatInlineMarkdown(section.content)}</blockquote>`;
        break;

      case 'code':
        html += `<pre style="font-family:'Courier New',Courier,monospace;font-size:10pt;background:#1e293b;color:#e2e8f0;padding:16pt;border-radius:8pt;margin:12pt 0;overflow-x:auto;line-height:1.5;white-space:pre-wrap;">${section.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        break;

      case 'toc':
        html += `<div style="font-family:${style.fontFamily};font-size:${style.fontSize};margin:12pt 0;">`;
        for (const item of section.tocItems || []) {
          const paddingLeft = item.level * 1.5;
          html += `<div style="display:flex;align-items:baseline;margin:4pt 0;padding-left:${paddingLeft}cm;">`;
          html += `<span style="flex-shrink:0;">${formatInlineMarkdown(item.title)}</span>`;
          html += `<span style="flex:1;border-bottom:1pt dotted #999;margin:0 4pt;min-width:20pt;"></span>`;
          html += `<span style="flex-shrink:0;">${item.page || ''}</span>`;
          html += '</div>';
        }
        html += '</div>';
        break;

      case 'table':
        html += `<table style="font-family:${style.fontFamily};font-size:${style.fontSize};border-collapse:collapse;width:100%;margin:12pt 0;">`;
        if (section.rows && section.rows.length > 0) {
          // First row as header
          html += '<thead><tr>';
          for (const cell of section.rows[0]) {
            html += `<th style="border:1pt solid #333;padding:6pt 8pt;background:#f1f5f9;font-weight:bold;text-align:left;">${formatInlineMarkdown(cell)}</th>`;
          }
          html += '</tr></thead><tbody>';
          for (let r = 1; r < section.rows.length; r++) {
            html += '<tr>';
            for (const cell of section.rows[r]) {
              html += `<td style="border:1pt solid #333;padding:6pt 8pt;">${formatInlineMarkdown(cell)}</td>`;
            }
            html += '</tr>';
          }
          html += '</tbody>';
        }
        html += '</table>';
        break;
    }
  }

  html += '</div>';
  return html;
}

export function generateDocxBlob(html: string): Blob {
  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;
  return new Blob(['\ufeff', fullHtml], {
    type: 'application/msword',
  });
}
