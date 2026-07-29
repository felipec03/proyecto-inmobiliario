import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Briefcase, Target, Key, Building2, Flame, Store, Users, TrendingUp, Grid, Loader2 } from 'lucide-react';
import type { UserType, BusinessRubro, RubroOption } from '@/types';
import { api } from '@/services/api';
import { useToast } from '@/components/Toast';

const RUBROS: RubroOption[] = [
  { label: 'Gastronomía', icon: <Flame />, color: '#FBB03B', description: 'Restaurantes, Cafés, Dark Kitchens' },
  { label: 'Belleza / estética', icon: <Users />, color: '#FBB03B', description: 'Peluquerías, Spa, Centros de Estética' },
  { label: 'Retail', icon: <Store />, color: '#FBB03B', description: 'Tiendas, Showrooms, Comercio' },
  { label: 'Servicios', icon: <Briefcase />, color: '#FBB03B', description: 'Talleres, Consultorios, Agencias' },
  { label: 'Bodega / logística', icon: <TrendingUp />, color: '#FBB03B', description: 'Bodegas, Distribución, Last Mile' },
  { label: 'Otro', icon: <Grid />, color: '#FBB03B', description: 'Cualquier otro rubro comercial' },
];

const COMUNAS_RM: string[] = [
  'Buin',
  'Calera de Tango',
  'Cerrillos',
  'Cerro Navia',
  'Colina',
  'Conchalí',
  'Curacaví',
  'El Bosque',
  'El Monte',
  'Estación Central',
  'Huechuraba',
  'Independencia',
  'Isla de Maipo',
  'La Cisterna',
  'La Florida',
  'La Granja',
  'La Pintana',
  'La Reina',
  'Lampa',
  'Las Condes',
  'Lo Barnechea',
  'Lo Espejo',
  'Lo Prado',
  'Macul',
  'Maipú',
  'María Pinto',
  'Melipilla',
  'Ñuñoa',
  'Padre Hurtado',
  'Paine',
  'Pedro Aguirre Cerda',
  'Peñaflor',
  'Peñalolén',
  'Pirque',
  'Providencia',
  'Pudahuel',
  'Puente Alto',
  'Quilicura',
  'Quinta Normal',
  'Recoleta',
  'Renca',
  'San Bernardo',
  'San Joaquín',
  'San José de Maipo',
  'San Miguel',
  'San Ramón',
  'Santiago',
  'Talagante',
  'Vitacura',
];

interface Props {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<Props> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserType | null>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.submitAssessment({
        userType: profile!,
        step: getSteps().length,
        data,
      });
      addToast('success', '¡Perfil guardado!');
      setShowResult(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el perfil';
      addToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    onComplete();
  };

  if (showResult) {
    const isEntrepreneur = profile === 'entrepreneur';
    const rubro = (data.rubro as string) || 'Comercial';
    const formalization = data.formalization === 'Ya tengo empresa' ? 'Formalizado' : 'En proceso de formalización';

    const result = isEntrepreneur
      ? {
          title: `Perfil: Emprendedor ${rubro}`,
          level: data.formalization === 'Ya tengo empresa' ? 'Alto potencial / Listo para match' : 'Alto potencial / Requiere acompañamiento',
          advice: 'Te ayudamos a no equivocarte con tu primer local. Hemos analizado tu rubro y etapa para filtrar solo lo que realmente te sirve.',
        }
      : {
          title: `${data.propertyType || 'Propiedad'} con alto potencial comercial`,
          level: 'Listo para comercialización estratégica',
          advice: 'Te ayudamos a dejar de perder plata con tu propiedad. Vamos a conectar tu espacio con el arrendatario que realmente puede pagarlo.',
        };

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-slate-900 text-white border-2 border-slate-900 rounded-[3.5rem] p-16 shadow-[16px_16px_0px_0px_rgba(251,176,59,1)] text-center"
        >
          <div className="w-24 h-24 bg-[#FBB03B] rounded-3xl flex items-center justify-center mx-auto mb-10 rotate-3">
            <CheckCircle size={48} className="text-slate-900" />
          </div>

          <h2 className="text-4xl font-black tracking-tighter mb-6 leading-tight">{result.title}</h2>

          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-[#FBB03B] font-black text-sm uppercase tracking-widest mb-10">
            {result.level}
          </div>

          <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12 italic">"{result.advice}"</p>

          <button
            onClick={handleDone}
            className="w-full py-6 bg-[#FBB03B] text-slate-900 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-yellow-500/20"
          >
            Ver mi Dashboard Estratégico
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <h2 className="text-4xl font-black tracking-tighter mb-4">Bienvenido a MiLocal</h2>
          <p className="text-gray-500 mb-12 text-lg">Para darte el match perfecto, necesitamos conocerte. ¿Quién eres hoy?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setProfile('entrepreneur')}
              className="group p-8 border-2 border-slate-900 rounded-3xl hover:bg-[#FBB03B] transition-all text-left relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Soy Emprendedor</h3>
                <p className="text-sm text-gray-600 group-hover:text-slate-900">Busco el local ideal para mi próximo gran proyecto.</p>
              </div>
            </button>

            <button
              onClick={() => setProfile('owner')}
              className="group p-8 border-2 border-slate-900 rounded-3xl hover:bg-slate-900 hover:text-white transition-all text-left relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#FBB03B] text-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Key size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Soy Propietario</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-300">Tengo un espacio disponible y busco al mejor arrendatario.</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const getDynamicReqLabel = () => {
    const rubro = data.rubro as string;
    if (rubro === 'Gastronomía') return '¿Necesitas conexión a gas y salida de humos?';
    if (rubro === 'Belleza / estética') return '¿Necesitas puntos de agua y lavamanos?';
    if (rubro === 'Bodega / logística') return '¿Necesitas acceso para camiones?';
    return '¿Tienes algún requerimiento técnico crítico?';
  };

  const getSteps = () =>
    profile === 'entrepreneur'
      ? [
          {
            title: 'Tu Visión',
            questions: [
              { id: 'rubro', label: '¿Cuál es el rubro de tu negocio?', type: 'select', options: RUBROS.map((r) => r.label) },
              { id: 'stage', label: '¿En qué etapa estás?', type: 'select', options: ['Idea', 'Empezando', 'Ya operando'] },
            ],
          },
          {
            title: 'Viabilidad',
            questions: [
              { id: 'budgetRange', label: 'Presupuesto mensual aproximado', type: 'select', options: ['< 10 UF', '10 – 25 UF', '25 – 50 UF', '50 – 100 UF', '> 100 UF'] },
              { id: 'location', label: 'Ubicación preferida (Comuna o zona)', type: 'select', options: COMUNAS_RM },
            ],
          },
          {
            title: 'Espacio y Técnica',
            questions: [
              { id: 'sizeRange', label: 'Tamaño aproximado', type: 'select', options: ['<30 m2', '30–80 m2', '80–200 m2', '+200 m2'] },
              { id: 'criticalReq', label: getDynamicReqLabel(), type: 'boolean' },
            ],
          },
          {
            title: 'Formalización',
            questions: [
              { id: 'formalization', label: 'Nivel de formalización', type: 'select', options: ['No tengo empresa', 'En proceso', 'Ya tengo empresa'] },
            ],
          },
        ]
      : [
          {
            title: 'Tu Propiedad',
            questions: [
              { id: 'propertyType', label: 'Tipo de propiedad', type: 'select', options: ['Local comercial', 'Casa adaptable', 'Oficina', 'Terreno'] },
              { id: 'location', label: 'Ubicación (Comuna)', type: 'select', options: COMUNAS_RM },
            ],
          },
          {
            title: 'Estado e Inquilino',
            questions: [
              { id: 'propertyStatus', label: 'Estado del inmueble', type: 'select', options: ['Listo para uso', 'Requiere ajustes menores', 'Requiere inversión'] },
              { id: 'idealTenant', label: 'Tipo de arrendatario ideal', type: 'select', options: ['Cualquiera', 'Rubro específico'] },
            ],
          },
          {
            title: 'Gestión y Valor',
            questions: [
              { id: 'currentProblem', label: '¿Cuál es tu problema o dolor actual?', type: 'select', options: ['Vacante hace tiempo', 'Malos arrendatarios', 'No quiero administrarlo', 'No tengo tiempo', 'Otro'] },
              { id: 'expectedRent', label: 'Rango de arriendo esperado', type: 'text' },
              { id: 'dispositionToInvest', label: '¿Disposición a invertir/mejorar?', type: 'select', options: ['Sí', 'No', 'Depende'] },
            ],
          },
        ];

  const steps = getSteps();
  const currentStep = steps[step];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-xl bg-white border-2 border-slate-900 rounded-3xl p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
      >
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FBB03B]">
            Paso {step + 1} de {steps.length}
          </span>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 w-6 rounded-full ${i <= step ? 'bg-slate-900' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        <h2 className="text-3xl font-black tracking-tighter mb-8">{currentStep.title}</h2>

        <div className="space-y-6">
          {currentStep.questions.map((q: any) => (
            <div key={q.id} className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{q.label}</label>
              {q.type === 'select' ? (
                <select
                  className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-[#FBB03B] outline-none transition-colors bg-gray-50 font-medium"
                  onChange={(e) => setData({ ...data, [q.id]: e.target.value })}
                  value={(data[q.id] as string) || ''}
                >
                  <option value="">Selecciona una opción</option>
                  {q.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : q.type === 'boolean' ? (
                <div className="flex gap-4">
                  {['Sí', 'No'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setData({ ...data, [q.id]: opt === 'Sí' })}
                      className={`flex-1 p-4 border-2 rounded-xl font-bold transition-all ${
                        data[q.id] === (opt === 'Sí')
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-[#FBB03B] outline-none transition-colors bg-gray-50 font-medium"
                  placeholder={`Ingresa ${q.label.toLowerCase()}...`}
                  onChange={(e) => setData({ ...data, [q.id]: e.target.value })}
                  value={(data[q.id] as string) || ''}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-12">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 p-4 border-2 border-slate-900 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              Atrás
            </button>
          )}
          <button
            onClick={() => {
              if (step < steps.length - 1) setStep((s) => s + 1);
              else handleComplete();
            }}
            disabled={isSubmitting}
            className="flex-[2] p-4 bg-[#FBB03B] border-2 border-slate-900 rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-[0px] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Guardando...
              </>
            ) : (
              step === steps.length - 1 ? 'Finalizar Assessment' : 'Siguiente Paso'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
