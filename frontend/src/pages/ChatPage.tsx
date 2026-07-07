import { useState, useRef, useEffect } from 'react';
import { Target, MessageCircle, ArrowRight } from 'lucide-react';
import { chatWithGemini } from '@/services/gemini';
import type { ChatMessage, BusinessRubro } from '@/types';

interface Props {
  selectedRubro: BusinessRubro;
}

export const ChatPage: React.FC<Props> = ({ selectedRubro }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(
        input,
        messages.map((m) => ({ role: m.role, content: m.content })),
        selectedRubro
      );
      setMessages((prev) => [...prev, { role: 'model', content: response.text, sources: response.sources as any }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', content: 'Error de conexión con MiLocal Advisor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white rounded-[4rem] border border-slate-100 flex-1 flex flex-col shadow-2xl overflow-hidden p-10 relative">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-50 pb-8">
          <div className="w-16 h-16 bg-[#FBB03B] rounded-3xl flex items-center justify-center shadow-xl shadow-yellow-100">
            <Target className="text-slate-900" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-none">MiLocal strategic advisor</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Asistente experto en expansión comercial</p>
          </div>
        </div>

        <div className="flex-1 bg-slate-50/50 rounded-[3rem] p-10 overflow-y-auto mb-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100">
                <MessageCircle className="text-[#FBB03B]" size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900">¿Cómo puedo ayudarte hoy?</h4>
              <p className="text-slate-400 font-medium text-sm mt-2 max-w-xs mx-auto italic">
                Analicemos zonas, flujos de gente o requisitos legales para tu {selectedRubro}.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-6 rounded-[2.5rem] shadow-sm ${
                  m.role === 'user' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-800'
                }`}
              >
                <p className="text-base font-medium leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 p-4 justify-start">
              <div className="w-2 h-2 bg-[#FBB03B] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#FBB03B] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-[#FBB03B] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-4 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-50 border-2 border-transparent rounded-[2rem] px-8 py-5 outline-none font-bold text-slate-900 focus:bg-white focus:border-[#FBB03B] transition-all"
            placeholder="Escribe tu consulta estratégica..."
          />
          <button
            onClick={handleSend}
            className="p-6 bg-slate-900 text-[#FBB03B] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-100"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
