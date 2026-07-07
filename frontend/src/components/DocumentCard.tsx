import React, { useRef, useState } from 'react';
import { CheckCircle, FileText, Upload, Loader2 } from 'lucide-react';
import type { Document } from '@/types';

interface Props {
  doc: Document;
  onVerify: (docId: string) => void;
  onUpload?: (docId: string, file: File) => Promise<void>;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const DocumentCard: React.FC<Props> = ({ doc, onVerify, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato no permitido. Usa JPG, PNG o PDF.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('El archivo excede el límite de 10 MB.');
      return;
    }

    if (onUpload) {
      setIsUploading(true);
      try {
        await onUpload(doc.id, file);
        onVerify(doc.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir el archivo');
      } finally {
        setIsUploading(false);
      }
    } else {
      onVerify(doc.id);
    }

    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (doc.status !== 'verified' && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex items-center justify-between p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] group hover:bg-white hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center gap-8">
        <div
          className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${
            doc.status === 'verified'
              ? 'bg-green-100 text-green-600'
              : 'bg-white text-slate-300 shadow-inner'
          }`}
        >
          {doc.status === 'verified' ? <CheckCircle size={40} /> : <FileText size={40} />}
        </div>
        <div>
          <h5 className="text-lg font-black text-slate-900 mb-1">{doc.name}</h5>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                doc.status === 'verified' ? 'bg-green-500' : doc.status === 'pending' ? 'bg-blue-400' : 'bg-slate-300'
              }`}
            />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {doc.status === 'empty' ? 'Pendiente Carga' : doc.status === 'pending' ? 'En Revisión' : 'Documento Validado'}
            </span>
          </div>
          {error && (
            <p className="text-xs font-bold text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleFileSelect}
        aria-label={`Subir archivo para ${doc.name}`}
      />

      {doc.status !== 'verified' ? (
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="px-8 py-4 bg-white border-2 border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FBB03B] focus:ring-offset-2"
          aria-label={`Subir archivo: ${doc.name}`}
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Subiendo...
            </>
          ) : (
            <>
              <Upload size={14} /> Subir Archivo
            </>
          )}
        </button>
      ) : (
        <div className="px-6 py-2 bg-green-50 text-green-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-green-100">
          Validado
        </div>
      )}
    </div>
  );
}
