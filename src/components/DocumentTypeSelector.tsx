import { DocumentType } from '../utils/textFormatter';

interface Props {
  selected: DocumentType;
  onChange: (type: DocumentType) => void;
}

export default function DocumentTypeSelector({ selected, onChange }: Props) {
  const types: { id: DocumentType; label: string; desc: string }[] = [
    { id: 'skripsi', label: 'Skripsi/Tesis', desc: 'Format standar akademik (Times New Roman 12, Spasi 1.5)' },
    { id: 'makalah', label: 'Makalah', desc: 'Format tugas makalah standar' },
    { id: 'jurnal', label: 'Jurnal', desc: 'Format artikel jurnal (1 spasi)' },
    { id: 'umum', label: 'Umum', desc: 'Format dokumen umum' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {types.map((type) => (
        <button
          key={type.id}
          onClick={() => onChange(type.id)}
          className={`text-left p-4 rounded-xl border-2 transition-all ${
            selected === type.id
              ? 'border-indigo-600 bg-indigo-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selected === type.id ? 'border-indigo-600' : 'border-gray-300'
            }`}>
              {selected === type.id && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
            </div>
            <span className={`font-semibold ${selected === type.id ? 'text-indigo-900' : 'text-gray-700'}`}>
              {type.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 ml-6">{type.desc}</p>
        </button>
      ))}
    </div>
  );
}