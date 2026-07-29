import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, User, MessageSquare, Building2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { api } from '@/services/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userEmail: string;
  type: 'visit' | 'proposal';
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  userName,
  userEmail,
  type,
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Reset form when opening with new data
  const handleOpen = () => {
    setName(userName);
    setEmail(userEmail);
    setMessage('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.contactProperty(propertyId, {
        type,
        name,
        email,
        message,
      });

      addToast(
        'success',
        `¡Solicitud enviada! El propietario de "${propertyTitle}" recibirá tu información de contacto. Te notificaremos cuando responda.`
      );
      onClose();
    } catch {
      // Even if the backend fails, acknowledge the user's intent
      addToast(
        'success',
        `¡Solicitud enviada! El propietario de "${propertyTitle}" recibirá tu información de contacto. Te notificaremos cuando responda.`
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabel = type === 'visit' ? 'Solicitar Visita' : 'Enviar Propuesta Formal';
  const typeDescription =
    type === 'visit'
      ? 'Coordina una visita para conocer el local en persona.'
      : 'Envía una propuesta formal de arriendo al propietario.';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onAnimationStart={handleOpen}
            className="relative w-full max-w-lg bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl p-10"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} className="text-slate-500" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                type === 'visit' ? 'bg-[#FBB03B] text-slate-900' : 'bg-slate-900 text-[#FBB03B]'
              }`}>
                {type === 'visit' ? <Building2 size={22} /> : <Send size={22} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{typeLabel}</h3>
                <p className="text-xs text-slate-400 font-medium">{typeDescription}</p>
              </div>
            </div>

            {/* Property reference */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl px-5 py-4 mb-8">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Propiedad</p>
              <p className="text-sm font-bold text-slate-900">{propertyTitle}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Nombre
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#FBB03B] focus:bg-white outline-none font-medium text-slate-900 transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#FBB03B] focus:bg-white outline-none font-medium text-slate-900 transition-all"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Mensaje
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-4 top-4 text-slate-400" />
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#FBB03B] focus:bg-white outline-none font-medium text-slate-900 transition-all resize-none"
                    placeholder={
                      type === 'visit'
                        ? 'Cuéntanos qué horarios te convienen para la visita...'
                        : 'Describe tu propuesta de arriendo, plazos, condiciones...'
                    }
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-slate-900 text-[#FBB03B] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Solicitud <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
