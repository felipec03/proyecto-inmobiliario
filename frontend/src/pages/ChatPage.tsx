import { Target, MessageCircle } from 'lucide-react';
import type { BusinessRubro } from '@/types';

interface Props {
  selectedRubro: BusinessRubro;
}

export const ChatPage: React.FC<Props> = ({ selectedRubro }) => {
  return (
    <div className="max-w-4xl mx-auto flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden p-16 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="text-slate-400" size={32} />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#FBB03B] rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100">
            <Target className="text-slate-900" size={24} />
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-3">
          Consultor Estratégico
        </h3>
        <div className="inline-block px-5 py-2 bg-[#FBB03B]/10 border border-[#FBB03B]/20 rounded-2xl text-[#FBB03B] font-black text-xs uppercase tracking-widest mb-6">
          Próximamente
        </div>
        <p className="text-slate-500 font-medium text-sm leading-relaxed">
          Estamos entrenando a nuestro asistente experto en expansión comercial para {selectedRubro}.
          Muy pronto podrás hacer consultas estratégicas sobre zonas, normativas y viabilidad de tu negocio.
        </p>
      </div>
    </div>
  );
};
