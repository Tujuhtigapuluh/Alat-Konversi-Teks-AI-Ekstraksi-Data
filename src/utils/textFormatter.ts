export type DocumentType = 'skripsi' | 'makalah' | 'jurnal' | 'umum';

export interface TOCItem {
  level: number;
  text: string;
  page?: string;
}

export interface Section {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'numbered' | 'blockquote' | 'toc';
  content?: string;
  items?: string[];
  tocItems?: TOCItem[];
}

export function parseAIText(text: string): Section[] {
  const sections: Section[] = [];
  const lines = text.split('\n');
  
  let currentListType: 'bullet' | 'numbered' | null = null;
  let currentListItems: string[] = [];
  
  let currentTOCItems: TOCItem[] = [];
  
  let currentParagraph: string[] = [];

  const commitParagraph = () => {
    if (currentParagraph.length > 0) {
      sections.push({ type: 'paragraph', content: parseInlineStyles(currentParagraph.join(' ')) });
      currentParagraph = [];
    }
  };

  const commitList = () => {
    if (currentListType && currentListItems.length > 0) {
      sections.push({ type: currentListType, items: currentListItems });
      currentListItems = [];
      currentListType = null;
    }
  };

  const commitTOC = () => {
    if (currentTOCItems.length > 0) {
      sections.push({ type: 'toc', tocItems: currentTOCItems });
      currentTOCItems = [];
    }
  };

  const commitAll = () => {
    commitParagraph();
    commitList();
    commitTOC();
  };

  const parseInlineStyles = (content: string) => {
    return content
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')               // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')                           // Italic
      .replace(/`(.*?)`/g, '<code style="background:#f4f4f4;padding:2px 4px;border-radius:4px;font-family:monospace;">$1</code>'); // Code
  };

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const line = originalLine.trim();

    // Empty line means break in paragraph/lists/toc
    if (!line) {
      commitAll();
      continue;
    }

    // TOC matching: "1. Pendahuluan ................ 1"
    if (line.includes('....') || line.includes('. . .')) {
      commitParagraph();
      commitList();
      const parts = line.split(/\.{3,}/);
      const textPart = parts[0].trim();
      const page = parts.length > 1 ? parts[parts.length - 1].trim() : '';
      currentTOCItems.push({ level: 1, text: parseInlineStyles(textPart), page });
      continue;
    } else {
      commitTOC();
    }

    // Headings
    if (line.startsWith('# ')) {
      commitAll();
      sections.push({ type: 'h1', content: parseInlineStyles(line.slice(2).trim()) });
    } else if (line.startsWith('## ')) {
      commitAll();
      sections.push({ type: 'h2', content: parseInlineStyles(line.slice(3).trim()) });
    } else if (line.startsWith('### ')) {
      commitAll();
      sections.push({ type: 'h3', content: parseInlineStyles(line.slice(4).trim()) });
    } 
    // Blockquote
    else if (line.startsWith('> ')) {
      commitAll();
      sections.push({ type: 'blockquote', content: parseInlineStyles(line.slice(2).trim()) });
    } 
    // Bullet list
    else if (line.match(/^[-*]\s/)) {
      commitParagraph();
      if (currentListType !== 'bullet') commitList();
      currentListType = 'bullet';
      currentListItems.push(parseInlineStyles(line.replace(/^[-*]\s/, '').trim()));
    } 
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      commitParagraph();
      if (currentListType !== 'numbered') commitList();
      currentListType = 'numbered';
      currentListItems.push(parseInlineStyles(line.replace(/^\d+\.\s/, '').trim()));
    } 
    // Otherwise it's text. Let's append to current paragraph if not part of a list
    else {
      // If we are currently building a list, maybe this is a continuation of the previous list item?
      // Some AI outputs wrap lines within a list. Let's check indentation.
      if (currentListType && originalLine.startsWith('  ')) {
        // Append to last list item
        const lastIdx = currentListItems.length - 1;
        if (lastIdx >= 0) {
          currentListItems[lastIdx] += ' ' + parseInlineStyles(line);
        }
      } else {
        // Normal paragraph
        commitList();
        currentParagraph.push(line);
      }
    }
  }
  
  commitAll();

  return sections;
}

export function sectionsToHtml(sections: Section[], docType: DocumentType): string {
  const isAcademic = docType === 'skripsi' || docType === 'makalah';
  const fontFamily = isAcademic ? 'Times New Roman, Times, serif' : 'Arial, sans-serif';
  const fontSize = isAcademic ? '12pt' : '11pt';
  const lineHeight = docType === 'jurnal' ? '1' : docType === 'skripsi' ? '1.5' : '1.15';
  const textAlign = isAcademic ? 'justify' : 'left';
  
  // Base style object for the main container
  const baseStyle = `font-family: ${fontFamily}; font-size: ${fontSize}; line-height: ${lineHeight}; text-align: ${textAlign}; color: #000;`;

  let html = `<div style="${baseStyle}">`;
  
  for (const section of sections) {
    if (section.type === 'h1') {
      html += `<h1 style="font-size: 16pt; font-weight: bold; text-align: center; margin-top: 24pt; margin-bottom: 12pt; text-transform: uppercase;">${section.content}</h1>`;
    } else if (section.type === 'h2') {
      html += `<h2 style="font-size: 14pt; font-weight: bold; margin-top: 18pt; margin-bottom: 12pt;">${section.content}</h2>`;
    } else if (section.type === 'h3') {
      html += `<h3 style="font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt;">${section.content}</h3>`;
    } else if (section.type === 'paragraph') {
      const textIndent = (docType === 'skripsi' || docType === 'makalah') ? 'text-indent: 1.25cm;' : '';
      html += `<p style="margin-top: 0; margin-bottom: 12pt; ${textIndent}">${section.content}</p>`;
    } else if (section.type === 'blockquote') {
      html += `<blockquote style="margin: 12pt 40pt; font-style: italic; color: #333; border-left: 3px solid #ccc; padding-left: 12pt;">${section.content}</blockquote>`;
    } else if (section.type === 'bullet') {
      html += `<ul style="margin-top: 0; margin-bottom: 12pt; padding-left: ${isAcademic ? '1.25cm' : '20pt'}; list-style-type: disc;">`;
      for (const item of section.items || []) {
        html += `<li style="margin-bottom: 6pt; pl-1">${item}</li>`;
      }
      html += `</ul>`;
    } else if (section.type === 'numbered') {
      html += `<ol style="margin-top: 0; margin-bottom: 12pt; padding-left: ${isAcademic ? '1.25cm' : '20pt'}; list-style-type: decimal;">`;
      for (const item of section.items || []) {
        html += `<li style="margin-bottom: 6pt;">${item}</li>`;
      }
      html += `</ol>`;
    } else if (section.type === 'toc') {
      html += `<div style="margin-bottom: 12pt; display: flex; flex-direction: column; gap: 6pt;">`;
      for (const item of section.tocItems || []) {
        html += `<div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span>${item.text}</span>
          <span style="flex-grow: 1; border-bottom: 1px dotted #000; margin: 0 8px;"></span>
          <span>${item.page}</span>
        </div>`;
      }
      html += `</div>`;
    }
  }

  html += '</div>';
  return html;
}