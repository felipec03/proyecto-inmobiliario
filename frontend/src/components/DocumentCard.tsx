import React from 'react';
import { CheckCircle, FileText, Upload } from 'lucide-react';
import type { Document } from '@/types';

interface Props {
  doc: Document;
  onVerify: (docId: string) => void;
}

export const DocumentCard: React.FC<Props> = ({ doc, onVerify }) => (
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
      </div>
    </div>
    {doc.status !== 'verified' ? (
      <button
        onClick={() => onVerify(doc.id)}
        className="px-8 py-4 bg-white border-2 border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-md flex items-center gap-2"
      >
        <Upload size={14} /> Subir Archivo
      </button>
    ) : (
      <div className="px-6 py-2 bg-green-50 text-green-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-green-100">
        Validado
      </div>
    )}
  </div>
);
