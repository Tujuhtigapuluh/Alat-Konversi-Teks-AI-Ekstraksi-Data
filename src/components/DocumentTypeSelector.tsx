import { DocumentType } from '../utils/textFormatter';
import {
  GraduationCap,
  FileText,
  BookOpen,
  ClipboardList,
  PenTool,
} from 'lucide-react';

interface Props {
  selected: DocumentType;
  onChange: (type: DocumentType) => void;
}

const DOC_TYPES: { value: DocumentType; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'skripsi',
    label: 'Skripsi/Tesis',
    desc: 'Times New Roman 12pt, spasi 2',
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    value: 'makalah',
    label: 'Makalah',
    desc: 'Times New Roman 12pt, spasi 1.5',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    value: 'jurnal',
    label: 'Jurnal',
    desc: 'Times New Roman 11pt, spasi 1.15',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    value: 'laporan',
    label: 'Laporan',
    desc: 'Arial 11pt, spasi 1.5',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    value: 'essay',
    label: 'Essay',
    desc: 'Times New Roman 12pt, spasi 2',
    icon: <PenTool className="w-5 h-5" />,
  },
];

export default function DocumentTypeSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {DOC_TYPES.map((doc) => {
        const isActive = selected === doc.value;
        return (
          <button
            key={doc.value}
            onClick={() => onChange(doc.value)}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <div
              className={`p-2 rounded-lg ${
                isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {doc.icon}
            </div>
            <div className="text-center">
              <p className={`text-sm font-semibold ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                {doc.label}
              </p>
              <p className={`text-xs mt-0.5 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>
                {doc.desc}
              </p>
            </div>
            {isActive && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
