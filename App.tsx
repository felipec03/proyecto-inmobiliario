
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  MessageSquare, 
  TrendingUp, 
  Camera, 
  MapPin, 
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Building2,
  Zap,
  Droplets,
  Flame,
  Users,
  Target,
  Briefcase,
  Key,
  User,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Lock,
  Search,
  Map as MapIcon,
  Grid,
  ArrowLeft,
  Info,
  History,
  Hammer,
  MessageCircle,
  TrainFront,
  School,
  ShoppingBag,
  Handshake,
  Clock
} from 'lucide-react';
import { chatWithGemini, analyzeLocalPotential, getCommercialMarketTrends } from './geminiService';
import { Property, ChatMessage, BusinessRubro, UserProfile, UserLevel, UserType, Document } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COMMERCIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Local Premium con Salida a Calle',
    price: 1200000,
    currency: 'CLP',
    sqm: 45,
    location: 'Lastarria, Santiago',
    lat: -33.4385,
    lng: -70.6397,
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
    description: 'Local ideal para heladería o cafetería pequeña. Cuenta con conexión de agua reforzada y trifásica.',
    specs: {
      hasGas: false,
      powerCapacity: 'Trifásica',
      waterConnection: true,
      greaseTrap: true,
      frontageSize: 4,
      footTraffic: 'Alto',
      permittedUses: ['Gastronomía', 'Retail']
    },
    nearbyPOIs: ['Metro Univ. Católica (200m)', 'Centro GAM', 'Barrio Universitario'],
    pastBusiness: 'Fue una boutique de ropa de diseño independiente por 4 años.',
    renovationNeeded: 'Pintura general y mantenimiento menor de sistema eléctrico.',
    ownerNotes: 'Dispuesto a dar 1 mes de gracia por remodelación.',
    negotiable: true,
    neighborhoodInsights: 'Zona de alto flujo turístico y estudiantil. Demanda constante los fines de semana.'
  },
  {
    id: '2',
    title: 'Bodega Urbana / Dark Store',
    price: 35000,
    currency: 'MXN',
    sqm: 120,
    location: 'Colonia Roma, CDMX',
    lat: 19.4149,
    lng: -99.1623,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    description: 'Espacio optimizado para logística de última milla o taller de servicios técnicos.',
    specs: {
      hasGas: false,
      powerCapacity: 'Básica',
      waterConnection: true,
      greaseTrap: false,
      frontageSize: 2,
      footTraffic: 'Bajo',
      permittedUses: ['Bodega / logística', 'Servicios']
    },
    nearbyPOIs: ['Av. Insurgentes (300m)', 'Metro Insurgentes', 'Área Residencial'],
    pastBusiness: 'Distribuidora de insumos médicos.',
    renovationNeeded: 'Nivelación de piso en zona de carga.',
    ownerNotes: 'Precio firme, pero incluye gastos comunes por el primer año.',
    negotiable: false,
    neighborhoodInsights: 'Ubicación estratégica para delivery. Zona segura con control de acceso.'
  },
  {
    id: '3',
    title: 'Local Esquina Gran Visibilidad',
    price: 9500000,
    currency: 'COP',
    sqm: 85,
    location: 'Vía Primavera, Medellín',
    lat: 6.2084,
    lng: -75.5663,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    description: 'Local de alto impacto visual. Ideal para marca de retail o salón de belleza de lujo.',
    specs: {
      hasGas: true,
      powerCapacity: 'Trifásica',
      waterConnection: true,
      greaseTrap: false,
      frontageSize: 12,
      footTraffic: 'Alto',
      permittedUses: ['Retail', 'Servicios', 'Otro']
    },
    nearbyPOIs: ['Parque Lleras', 'Hotel Click Clack', 'Zona Rosa'],
    pastBusiness: 'Restaurante-Bar de autor.',
    renovationNeeded: 'Remodelación de fachada requerida por reglamento de la zona.',
    ownerNotes: 'Interesado en contratos a largo plazo (3+ años).',
    negotiable: true,
    neighborhoodInsights: 'Zona comercial más exclusiva de la ciudad. Alto poder adquisitivo.'
  }
];

const RUBROS: { label: BusinessRubro; icon: any; color: string; description: string }[] = [
  { label: 'Gastronomía', icon: <Flame />, color: '#FBB03B', description: 'Restaurantes, Cafés, Dark Kitchens' },
  { label: 'Belleza / estética', icon: <Users />, color: '#FBB03B', description: 'Peluquerías, Spa, Centros de Estética' },
  { label: 'Retail', icon: <Store />, color: '#FBB03B', description: 'Tiendas, Showrooms, Comercio' },
  { label: 'Servicios', icon: <Briefcase />, color: '#FBB03B', description: 'Talleres, Consultorios, Agencias' },
  { label: 'Bodega / logística', icon: <TrendingUp />, color: '#FBB03B', description: 'Bodegas, Distribución, Last Mile' },
  { label: 'Otro', icon: <Grid />, color: '#FBB03B', description: 'Cualquier otro rubro comercial' },
];

const BrandLogo = () => (
  <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => window.location.reload()}>
    <div className="relative">
      <div className="w-14 h-12 border-2 border-slate-900 rounded-2xl flex items-center justify-center bg-[#FBB03B] shadow-xl shadow-yellow-100 transition-transform group-hover:rotate-2">
        <span className="text-xs font-black text-slate-900 tracking-tighter leading-none -mt-0.5">MI</span>
      </div>
      <div className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 transform group-hover:-rotate-12 transition-transform">
        <Key className="text-slate-900 w-5 h-5" />
      </div>
    </div>
    <div className="flex flex-col">
      <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">MiLocal</h1>
      <span className="text-[9px] font-bold text-[#FBB03B] uppercase tracking-[0.2em] mt-1">Trust & Match</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'trends' | 'visual' | 'profile' | 'onboarding'>('home');
  const [onboardingProfile, setOnboardingProfile] = useState<UserType | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<any>({});
  const [showOnboardingResult, setShowOnboardingResult] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedRubro, setSelectedRubro] = useState<BusinessRubro>('Gastronomía');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Carlos Emprendedor',
    email: 'carlos@startup.cl',
    type: 'entrepreneur',
    level: 0,
    subType: 'juridica',
    documents: [
      { id: '1', name: 'Identidad Representante', type: 'identity', status: 'pending' },
      { id: '2', name: 'Carpeta Tributaria', type: 'income', status: 'empty' },
      { id: '3', name: 'Escritura Constitución', type: 'legal', status: 'empty' }
    ]
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);

  const calculateMatch = (property: Property, rubro: BusinessRubro) => {
    let score = 0;
    if (property.specs.permittedUses.includes(rubro)) score += 50;
    if (rubro === 'Gastronomía') {
      if (property.specs.greaseTrap) score += 20;
      if (property.specs.hasGas) score += 20;
      if (property.specs.footTraffic === 'Alto') score += 10;
    } else if (rubro === 'Retail') {
      if (property.specs.frontageSize > 5) score += 30;
      if (property.specs.footTraffic === 'Alto') score += 20;
    } else score += 30;
    return Math.min(score, 99);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await chatWithGemini(input, messages.map(m => ({ role: m.role, content: m.content })), selectedRubro);
      setMessages(prev => [...prev, { role: 'model', content: response.text, sources: response.sources as any }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Error de conexión con MiLocal Advisor." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboardingResult(true);
  };

  const renderOnboardingResult = () => {
    const isEntrepreneur = onboardingProfile === 'entrepreneur';
    
    const getEntrepreneurProfile = () => {
      const rubro = assessmentData.rubro || 'Comercial';
      const stage = assessmentData.stage || 'en etapa inicial';
      const formalization = assessmentData.formalization === 'Ya tengo empresa' ? 'Formalizado' : 'En proceso de formalización';
      
      return {
        title: `Perfil: Emprendedor ${rubro} ${stage}`,
        level: assessmentData.formalization === 'Ya tengo empresa' ? 'Alto potencial / Listo para match' : 'Alto potencial / Requiere acompañamiento',
        advice: isEntrepreneur 
          ? "Te ayudamos a no equivocarte con tu primer local. Hemos analizado tu rubro y etapa para filtrar solo lo que realmente te sirve."
          : "Te ayudamos a dejar de perder plata con tu propiedad. Tu activo tiene un potencial que vamos a optimizar."
      };
    };

    const getOwnerProfile = () => {
      const type = assessmentData.propertyType || 'Propiedad';
      const status = assessmentData.propertyStatus || 'en estado actual';
      
      return {
        title: `${type} con alto potencial comercial no optimizado`,
        level: assessmentData.propertyStatus === 'Requiere inversión' ? 'Requiere reconversión / Buen fit gastronómico' : 'Listo para comercialización estratégica',
        advice: "Te ayudamos a dejar de perder plata con tu propiedad. Vamos a conectar tu espacio con el arrendatario que realmente puede pagarlo."
      };
    };

    const result = isEntrepreneur ? getEntrepreneurProfile() : getOwnerProfile();

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
          
          <h2 className="text-4xl font-black tracking-tighter mb-6 leading-tight">
            {result.title}
          </h2>
          
          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-[#FBB03B] font-black text-sm uppercase tracking-widest mb-10">
            {result.level}
          </div>

          <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12 italic">
            "{result.advice}"
          </p>

          <button 
            onClick={() => {
              setActiveTab('home');
              setShowOnboardingResult(false);
              setOnboardingProfile(null);
              setOnboardingStep(0);
              setAssessmentData({});
            }}
            className="w-full py-6 bg-[#FBB03B] text-slate-900 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-yellow-500/20"
          >
            Ver mi Dashboard Estratégico
          </button>
        </motion.div>
      </div>
    );
  };

  const renderOnboarding = () => {
    if (showOnboardingResult) return renderOnboardingResult();
    if (!onboardingProfile) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl font-black tracking-tighter mb-4">Bienvenido a MiLocal</h2>
            <p className="text-gray-500 mb-12 text-lg">Para darte el match perfecto, necesitamos conocerte. ¿Quién eres hoy?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => setOnboardingProfile('entrepreneur')}
                className="group p-8 border-2 border-slate-900 rounded-3xl hover:bg-[#FBB03B] transition-all text-left relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Soy Emprendedor</h3>
                  <p className="text-sm text-gray-600 group-hover:text-slate-900">Busco el local ideal para mi próximo gran proyecto.</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target size={120} />
                </div>
              </button>

              <button 
                onClick={() => setOnboardingProfile('owner')}
                className="group p-8 border-2 border-slate-900 rounded-3xl hover:bg-slate-900 hover:text-white transition-all text-left relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#FBB03B] text-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Key size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Soy Propietario</h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-300">Tengo un espacio disponible y busco al mejor arrendatario.</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Building2 size={120} />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    const getDynamicReqLabel = () => {
      const rubro = assessmentData.rubro;
      if (rubro === 'Gastronomía') return '¿Necesitas conexión a gas y salida de humos?';
      if (rubro === 'Belleza / estética') return '¿Necesitas puntos de agua y lavamanos?';
      if (rubro === 'Bodega / logística') return '¿Necesitas acceso para camiones?';
      return '¿Tienes algún requerimiento técnico crítico?';
    };

    const steps = onboardingProfile === 'entrepreneur' ? [
      {
        title: 'Tu Visión',
        questions: [
          { id: 'rubro', label: '¿Cuál es el rubro de tu negocio?', type: 'select', options: RUBROS.map(r => r.label) },
          { id: 'stage', label: '¿En qué etapa estás?', type: 'select', options: ['Idea', 'Empezando', 'Ya operando'] }
        ]
      },
      {
        title: 'Viabilidad',
        questions: [
          { id: 'budgetRange', label: 'Presupuesto mensual aproximado', type: 'select', options: ['< $300k', '$300k – $700k', '$700k – $1.5M', '> $1.5M'] },
          { id: 'location', label: 'Ubicación preferida (Comuna o zona)', type: 'text' }
        ]
      },
      {
        title: 'Espacio y Técnica',
        questions: [
          { id: 'sizeRange', label: 'Tamaño aproximado', type: 'select', options: ['<30 m2', '30–80 m2', '80–200 m2', '+200 m2'] },
          { id: 'criticalReq', label: getDynamicReqLabel(), type: 'boolean' }
        ]
      },
      {
        title: 'Formalización',
        questions: [
          { id: 'formalization', label: 'Nivel de formalización', type: 'select', options: ['No tengo empresa', 'En proceso', 'Ya tengo empresa'] }
        ]
      }
    ] : [
      {
        title: 'Tu Propiedad',
        questions: [
          { id: 'propertyType', label: 'Tipo de propiedad', type: 'select', options: ['Local comercial', 'Casa adaptable', 'Oficina', 'Terreno'] },
          { id: 'location', label: 'Ubicación (Comuna)', type: 'text' }
        ]
      },
      {
        title: 'Estado e Inquilino',
        questions: [
          { id: 'propertyStatus', label: 'Estado del inmueble', type: 'select', options: ['Listo para uso', 'Requiere ajustes menores', 'Requiere inversión'] },
          { id: 'idealTenant', label: 'Tipo de arrendatario ideal', type: 'select', options: ['Cualquiera', 'Rubro específico'] }
        ]
      },
      {
        title: 'Gestión y Valor',
        questions: [
          { id: 'currentProblem', label: '¿Cuál es tu problema o dolor actual?', type: 'select', options: ['Vacante hace tiempo', 'Malos arrendatarios', 'No quiero administrarlo', 'No tengo tiempo', 'Otro'] },
          { id: 'expectedRent', label: 'Rango de arriendo esperado', type: 'text' },
          { id: 'dispositionToInvest', label: '¿Disposición a invertir/mejorar?', type: 'select', options: ['Sí', 'No', 'Depende'] }
        ]
      }
    ];

    const currentStepData = steps[onboardingStep];

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <motion.div 
          key={onboardingStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-xl bg-white border-2 border-slate-900 rounded-3xl p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
        >
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FBB03B]">Paso {onboardingStep + 1} de {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 w-6 rounded-full ${i <= onboardingStep ? 'bg-slate-900' : 'bg-gray-100'}`} />
              ))}
            </div>
          </div>

          <h2 className="text-3xl font-black tracking-tighter mb-8">{currentStepData.title}</h2>

          <div className="space-y-6">
            {currentStepData.questions.map((q: any) => (
              <div key={q.id} className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{q.label}</label>
                {q.type === 'select' ? (
                  <select 
                    className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-[#FBB03B] outline-none transition-colors bg-gray-50 font-medium"
                    onChange={(e) => setAssessmentData({ ...assessmentData, [q.id]: e.target.value })}
                    value={assessmentData[q.id] || ''}
                  >
                    <option value="">Selecciona una opción</option>
                    {q.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : q.type === 'boolean' ? (
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAssessmentData({ ...assessmentData, [q.id]: opt === 'Sí' })}
                        className={`flex-1 p-4 border-2 rounded-xl font-bold transition-all ${assessmentData[q.id] === (opt === 'Sí') ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input 
                    type={q.type}
                    className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-[#FBB03B] outline-none transition-colors bg-gray-50 font-medium"
                    placeholder={`Ingresa ${q.label.toLowerCase()}...`}
                    onChange={(e) => setAssessmentData({ ...assessmentData, [q.id]: e.target.value })}
                    value={assessmentData[q.id] || ''}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-12">
            {onboardingStep > 0 && (
              <button 
                onClick={() => setOnboardingStep(s => s - 1)}
                className="flex-1 p-4 border-2 border-slate-900 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Atrás
              </button>
            )}
            <button 
              onClick={() => {
                if (onboardingStep < steps.length - 1) {
                  setOnboardingStep(s => s + 1);
                } else {
                  handleOnboardingComplete();
                }
              }}
              className="flex-[2] p-4 bg-[#FBB03B] border-2 border-slate-900 rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-[0px] transition-all"
            >
              {onboardingStep === steps.length - 1 ? 'Finalizar Assessment' : 'Siguiente Paso'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const updateDocumentStatus = (docId: string) => {
    const newDocs = userProfile.documents.map(doc => 
      doc.id === docId ? { ...doc, status: 'verified' as const } : doc
    );
    const allVerified = newDocs.every(d => d.status === 'verified');
    setUserProfile({ ...userProfile, documents: newDocs, level: allVerified ? 1 : 0 });
  };

  useEffect(() => {
    if (activeTab === 'trends' && !marketData) {
      getCommercialMarketTrends("Santiago").then(setMarketData);
    }
  }, [activeTab]);

  const selectedProperty = useMemo(() => 
    COMMERCIAL_PROPERTIES.find(p => p.id === selectedPropertyId), 
  [selectedPropertyId]);

  const verifiedDocsCount = userProfile.documents.filter(d => d.status === 'verified').length;
  const progressPercent = (verifiedDocsCount / userProfile.documents.length) * 100;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-gray-100 p-8 sticky top-0 h-screen shadow-sm z-30">
        <BrandLogo />
        
        {/* Trust Progress */}
        <div className="mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
           <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel Inquilino</span>
             <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${userProfile.level === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                {userProfile.level === 0 ? 'LEVEL 0' : 'VERIFICADO'}
             </span>
           </div>
           <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
             <div className="h-full bg-[#FBB03B] transition-all duration-700 ease-out shadow-sm" style={{ width: `${progressPercent}%` }}></div>
           </div>
           <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-900">{verifiedDocsCount}/{userProfile.documents.length} Docs</p>
              <button onClick={() => { setActiveTab('profile'); setSelectedPropertyId(null); }} className="text-[9px] font-black text-[#FBB03B] uppercase tracking-widest hover:underline">Completar</button>
           </div>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink icon={<Store />} label="Explorar Locales" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedPropertyId(null); }} />
          <SidebarLink icon={<MessageSquare />} label="Consultor MiLocal" active={activeTab === 'chat'} onClick={() => { setActiveTab('chat'); setSelectedPropertyId(null); }} />
          <SidebarLink icon={<TrendingUp />} label="Pulso Comercial" active={activeTab === 'trends'} onClick={() => { setActiveTab('trends'); setSelectedPropertyId(null); }} />
          <SidebarLink icon={<User />} label="Mi Perfil" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setSelectedPropertyId(null); }} />
          <SidebarLink icon={<Camera />} label="Visual Analyzer" active={activeTab === 'visual'} onClick={() => { setActiveTab('visual'); setSelectedPropertyId(null); }} />
        </nav>

        <div className="mt-6 pt-6 border-t border-slate-50">
          <button 
            onClick={() => setUserProfile({...userProfile, type: userProfile.type === 'entrepreneur' ? 'owner' : 'entrepreneur'})}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 text-white hover:bg-[#FBB03B] hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100"
          >
            <Briefcase size={14} /> 
            {userProfile.type === 'entrepreneur' ? 'Cambiar a Propietario' : 'Cambiar a Emprendedor'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative">
        {activeTab === 'onboarding' ? renderOnboarding() : selectedPropertyId && selectedProperty ? (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
             <button 
                onClick={() => setSelectedPropertyId(null)}
                className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors group"
             >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al listado
             </button>

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Left Column: Image & Basic Info */}
                <div className="lg:col-span-3 space-y-8">
                   <div className="relative h-[450px] rounded-[3.5rem] overflow-hidden shadow-2xl">
                      <img src={selectedProperty.image} className="w-full h-full object-cover" alt={selectedProperty.title} />
                      <div className="absolute top-8 left-8 flex gap-3">
                         <div className="bg-slate-900 text-[#FBB03B] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                           {calculateMatch(selectedProperty, selectedRubro)}% Match {selectedRubro}
                         </div>
                         <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                           <Users size={14} className="text-[#FBB03B]" /> {selectedProperty.specs.footTraffic} Tráfico
                         </div>
                      </div>
                      <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] flex justify-between items-center text-white">
                         <div>
                            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Ubicación Estratégica</p>
                            <h4 className="text-2xl font-black">{selectedProperty.location}</h4>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Canon Mensual</p>
                            <p className="text-3xl font-black text-[#FBB03B]">{selectedProperty.currency} {selectedProperty.price.toLocaleString()}</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                           <Info className="text-[#FBB03B]" /> Potencial Comercial
                        </h3>
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedProperty.negotiable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                           {selectedProperty.negotiable ? 'Propietario Abierto a Negociar' : 'Precio Final'}
                        </div>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed text-lg mb-10 italic">
                         "{selectedProperty.description}"
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <History size={14} className="text-[#FBB03B]" /> Historial de éxito
                            </h5>
                            <p className="text-sm font-bold text-slate-900 mb-2 leading-relaxed">{selectedProperty.pastBusiness}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Conocer el rubro anterior ayuda a predecir la adecuación de patente.</p>
                         </div>
                         <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <Hammer size={14} className="text-[#FBB03B]" /> Estado de adecuación
                            </h5>
                            <p className="text-sm font-bold text-slate-900 mb-2 leading-relaxed">{selectedProperty.renovationNeeded}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Evaluación técnica preliminar MiLocal Shield.</p>
                         </div>
                      </div>
                   </div>

                   {/* Neighborhood Insights Card */}
                   <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FBB03B]/10 rounded-bl-full group-hover:scale-110 transition-transform duration-1000"></div>
                      <h3 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10">
                         <MapPin className="text-[#FBB03B]" /> Radiografía del Barrio
                      </h3>
                      <div className="space-y-8 relative z-10">
                         <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <p className="text-base opacity-90 font-medium leading-relaxed italic border-l-4 border-[#FBB03B] pl-6">
                               {selectedProperty.neighborhoodInsights}
                            </p>
                         </div>
                         
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-[#FBB03B] uppercase tracking-widest">Puntos de Interés Cercanos</p>
                            <div className="flex flex-wrap gap-3">
                               {selectedProperty.nearbyPOIs.map((poi, idx) => (
                                  <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#FBB03B] hover:text-slate-900 transition-colors">
                                     {poi.toLowerCase().includes('metro') ? <TrainFront size={16} /> : 
                                      poi.toLowerCase().includes('univ') || poi.toLowerCase().includes('colegio') ? <School size={16} /> : 
                                      <ShoppingBag size={16} />}
                                     {poi}
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right Column: Actions & Technical Summary */}
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm sticky top-12">
                      <div className="mb-10">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2">Score de Viabilidad MiLocal</h4>
                         <div className="space-y-4">
                            <ViabilityItem 
                               label={`Match para ${selectedRubro}`} 
                               value={selectedProperty.specs.permittedUses.includes(selectedRubro) ? 'COMPATIBLE' : 'LIMITADO'} 
                               status={selectedProperty.specs.permittedUses.includes(selectedRubro) ? 'success' : 'error'}
                               icon={<Target size={14} />}
                            />
                            <ViabilityItem 
                               label="Negociación" 
                               value={selectedProperty.negotiable ? 'OPORTUNIDAD' : 'PRECIO BASE'} 
                               status={selectedProperty.negotiable ? 'success' : 'neutral'}
                               icon={<Handshake size={14} />}
                            />
                            <ViabilityItem 
                               label="Disponibilidad" 
                               value="INMEDIATA" 
                               status="success"
                               icon={<Clock size={14} />}
                            />
                         </div>
                      </div>

                      <div className="space-y-6 mb-10">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Especificaciones Técnicas</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <TechBadge icon={<Flame />} label="Gas" active={selectedProperty.specs.hasGas} />
                            <TechBadge icon={<Zap />} label="Trifásica" active={selectedProperty.specs.powerCapacity === 'Trifásica'} />
                            <TechBadge icon={<Droplets />} label="Agua" active={selectedProperty.specs.waterConnection} />
                            <TechBadge icon={<Grid />} label="Grasas" active={selectedProperty.specs.greaseTrap} />
                         </div>
                      </div>

                      <div className="p-8 bg-[#FBB03B]/5 rounded-[2.5rem] border border-[#FBB03B]/20 mb-10 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-16 h-16 bg-[#FBB03B]/10 rounded-bl-full"></div>
                         <h5 className="text-[10px] font-black text-[#FBB03B] uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageCircle size={14} /> Recomendación del Owner
                         </h5>
                         <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{selectedProperty.ownerNotes}"</p>
                      </div>

                      <div className="space-y-4">
                         {userProfile.level === 0 ? (
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-center relative">
                               <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                 <Lock className="text-slate-300" size={24} />
                               </div>
                               <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Evaluación LEVEL 0</p>
                               <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">Tu perfil actual no permite agendar visitas. Sube tus liquidaciones o carpeta tributaria para desbloquear el contacto directo.</p>
                               <button 
                                  onClick={() => { setActiveTab('profile'); setSelectedPropertyId(null); }}
                                  className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-[#FBB03B] hover:text-slate-900 transition-all shadow-2xl shadow-slate-200"
                               >
                                  Actualizar a LEVEL 1
                               </button>
                            </div>
                         ) : (
                            <div className="space-y-4">
                               <button className="w-full py-6 bg-slate-900 text-[#FBB03B] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3">
                                  Solicitar Visita <ArrowRight size={20} />
                               </button>
                               <button className="w-full py-6 bg-white text-slate-900 border-2 border-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                                  Enviar Propuesta Formal
                               </button>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : activeTab === 'home' ? (
          <div className="space-y-12 max-w-7xl mx-auto">
            {/* Hero Section - Landing Style */}
            <section className="relative py-24 overflow-hidden rounded-[4rem] bg-slate-900 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#FBB03B_0%,transparent_70%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#FBB03B_0%,transparent_50%)]" />
              </div>
              <div className="relative z-10 px-16 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[#FBB03B] text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                    <Zap size={14} /> AI-Powered Real Estate Matchmaking
                  </div>
                  <h2 className="text-7xl font-black tracking-tighter leading-[0.85] mb-10">
                    Tu próximo local <br />
                    <span className="text-[#FBB03B]">no es azar, es data.</span>
                  </h2>
                  <p className="text-2xl text-gray-400 mb-12 font-medium leading-relaxed max-w-2xl">
                    Te ayudamos a no equivocarte con tu primer local y a dejar de perder plata con tu propiedad.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <button 
                      onClick={() => setActiveTab('onboarding')}
                      className="px-10 py-6 bg-[#FBB03B] text-slate-900 rounded-[2rem] font-black text-lg flex items-center gap-3 hover:scale-105 hover:rotate-1 transition-all shadow-[0_20px_50px_rgba(251,176,59,0.3)]"
                    >
                      Empezar Assessment <ArrowRight size={24} />
                    </button>
                    <div className="flex -space-x-4 items-center ml-4">
                      {[1, 2, 3, 4].map(i => (
                        <img 
                          key={i}
                          src={`https://i.pravatar.cc/100?img=${i+10}`} 
                          className="w-12 h-12 rounded-full border-4 border-slate-900 shadow-xl"
                          alt="User"
                        />
                      ))}
                      <div className="pl-8">
                        <p className="text-sm font-bold text-white leading-none">500+ Emprendedores</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Buscando local hoy</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Assessment Teaser */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-12 bg-[#FBB03B] border-2 border-slate-900 rounded-[3.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] group hover:translate-y-[-4px] transition-all">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                  <Target size={32} />
                </div>
                <h3 className="text-3xl font-black tracking-tighter mb-4 text-slate-900">¿Buscas local?</h3>
                <p className="text-slate-800 font-bold text-lg mb-8 leading-relaxed">
                  Te ayudamos a no equivocarte con tu primer local. Análisis de flujo y normativa técnica en un solo lugar.
                </p>
                <button onClick={() => { setOnboardingProfile('entrepreneur'); setActiveTab('onboarding'); }} className="flex items-center gap-2 font-black text-sm uppercase tracking-widest border-b-4 border-slate-900 pb-1">
                  Hacer Assessment Emprendedor <ChevronRight size={18} />
                </button>
              </div>
              <div className="p-12 bg-white border-2 border-slate-900 rounded-[3.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] group hover:translate-y-[-4px] transition-all">
                <div className="w-16 h-16 bg-[#FBB03B] text-slate-900 rounded-2xl flex items-center justify-center mb-8 group-hover:-rotate-6 transition-transform">
                  <Key size={32} />
                </div>
                <h3 className="text-3xl font-black tracking-tighter mb-4">¿Tienes un local?</h3>
                <p className="text-gray-500 font-bold text-lg mb-8 leading-relaxed">
                  Te ayudamos a dejar de perder plata con tu propiedad. Conectamos tu espacio con el arrendatario ideal.
                </p>
                <button onClick={() => { setOnboardingProfile('owner'); setActiveTab('onboarding'); }} className="flex items-center gap-2 font-black text-sm uppercase tracking-widest border-b-4 border-[#FBB03B] pb-1">
                  Hacer Assessment Propietario <ChevronRight size={18} />
                </button>
              </div>
            </section>

            {/* Explorer Header */}
            <div className="pt-12 border-t border-gray-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                  <h3 className="text-5xl font-black tracking-tighter mb-4">Explora Oportunidades</h3>
                  <p className="text-gray-500 text-xl font-medium">Locales validados técnicamente por MiLocal Shield.</p>
                </div>
                <div className="flex bg-white p-2 rounded-[2rem] border-2 border-slate-900 shadow-lg">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-slate-900'}`}
                  >
                    <Grid size={16} /> Grilla
                  </button>
                  <button 
                    onClick={() => setViewMode('map')}
                    className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-slate-900'}`}
                  >
                    <MapIcon size={16} /> Mapa
                  </button>
                </div>
              </div>

              {/* Rubro Selector */}
              <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
                {RUBROS.map((rubro) => (
                  <button
                    key={rubro.label}
                    onClick={() => setSelectedRubro(rubro.label)}
                    className={`flex-shrink-0 px-10 py-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-4 ${selectedRubro === rubro.label ? 'bg-[#FBB03B] border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] translate-y-[-4px]' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    <div className={`${selectedRubro === rubro.label ? 'text-slate-900 scale-125' : 'text-gray-300'} transition-transform`}>
                      {rubro.icon}
                    </div>
                    <div className="text-left">
                      <span className="block font-black tracking-tight text-lg leading-none mb-1">{rubro.label}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedRubro === rubro.label ? 'text-slate-700' : 'text-gray-300'}`}>Ver Locales</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {COMMERCIAL_PROPERTIES.map((property) => (
                  <motion.div
                    key={property.id}
                    layoutId={property.id}
                    onClick={() => setSelectedPropertyId(property.id)}
                    className="group bg-white border-2 border-slate-900 rounded-[3rem] overflow-hidden cursor-pointer hover:shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px]"
                  >
                    <div className="relative h-72 overflow-hidden">
                      <img 
                        src={property.image} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-6 left-6 flex gap-2">
                        <div className="px-5 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                          {property.sqm} m²
                        </div>
                        <div className="px-5 py-2 bg-[#FBB03B] text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                          Match {calculateMatch(property, selectedRubro)}%
                        </div>
                      </div>
                    </div>
                    <div className="p-10">
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-2xl font-black tracking-tighter leading-tight group-hover:text-[#FBB03B] transition-colors">{property.title}</h4>
                        <div className="text-right">
                          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{property.currency}</span>
                          <span className="text-xl font-black text-slate-900 leading-none">{property.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 mb-8">
                        <MapPin size={16} />
                        <span className="text-sm font-bold">{property.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex gap-2">
                          {property.specs.hasGas && <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Flame size={18} /></div>}
                          {property.specs.powerCapacity === 'Trifásica' && <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center"><Zap size={18} /></div>}
                          {property.specs.waterConnection && <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Droplets size={18} /></div>}
                        </div>
                        <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                          Ver Detalle <ArrowRight size={14} className="text-[#FBB03B]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          <div className="max-w-5xl mx-auto">
             <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-2 leading-none tracking-tight">Mi Perfil Verificado</h2>
                <p className="text-slate-500 font-medium text-lg">Aumenta tu Trust Level para interactuar con propietarios Premium.</p>
              </div>
              <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-5">
                 <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="text-[#FBB03B]" size={28} />
                 </div>
                 <div>
                    <p className="text-sm font-black text-slate-900 leading-none">{userProfile.name}</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> MiLocal Verified
                    </p>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
               <div className="xl:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Visitas Disponibles</p>
                        <div className="flex items-center justify-between relative z-10">
                           <h3 className="text-4xl font-black text-slate-900">{userProfile.level === 1 ? 'Ilimitadas' : '0'}</h3>
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                              <MapPin className="text-[#FBB03B]" size={24} />
                           </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">{userProfile.level === 0 ? 'Sube documentos para agendar' : '¡Explora sin límites!'}</p>
                     </div>
                     <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBB03B]/5 rounded-bl-full -z-0"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Match Index Promedio</p>
                        <div className="flex items-center justify-between relative z-10">
                           <h3 className="text-4xl font-black text-[#FBB03B]">84%</h3>
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                              <Target className="text-[#FBB03B]" size={24} />
                           </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Basado en {selectedRubro}</p>
                     </div>
                  </div>

                  <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                     <div className="flex items-center justify-between mb-10">
                        <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                           <ShieldCheck className="text-[#FBB03B]" /> Carpeta Digital MiLocal
                        </h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{userProfile.subType === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'}</span>
                     </div>
                     <div className="space-y-4">
                        {userProfile.documents.map(doc => (
                           <div key={doc.id} className="flex items-center justify-between p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] group hover:bg-white hover:shadow-2xl transition-all duration-500">
                              <div className="flex items-center gap-8">
                                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${doc.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-white text-slate-300 shadow-inner'}`}>
                                    {doc.status === 'verified' ? <CheckCircle size={40} /> : <FileText size={40} />}
                                 </div>
                                 <div>
                                    <h5 className="text-lg font-black text-slate-900 mb-1">{doc.name}</h5>
                                    <div className="flex items-center gap-2">
                                       <div className={`w-2 h-2 rounded-full ${doc.status === 'verified' ? 'bg-green-500' : doc.status === 'pending' ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          {doc.status === 'empty' ? 'Pendiente Carga' : doc.status === 'pending' ? 'En Revisión' : 'Documento Validado'}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              {doc.status !== 'verified' ? (
                                 <button onClick={() => updateDocumentStatus(doc.id)} className="px-8 py-4 bg-white border-2 border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-md">Subir Archivo</button>
                              ) : (
                                 <div className="px-6 py-2 bg-green-50 text-green-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-green-100">Validado</div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        ) : activeTab === 'chat' ? (
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
                         <p className="text-slate-400 font-medium text-sm mt-2 max-w-xs mx-auto italic">Analicemos zonas, flujos de gente o requisitos legales para tu {selectedRubro}.</p>
                      </div>
                   )}
                   {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] p-6 rounded-[2.5rem] shadow-sm ${m.role === 'user' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-800'}`}>
                            <p className="text-base font-medium leading-relaxed">{m.content}</p>
                         </div>
                      </div>
                   ))}
                   {isLoading && <div className="flex gap-2 p-4 justify-start"><div className="w-2 h-2 bg-[#FBB03B] rounded-full animate-bounce"></div><div className="w-2 h-2 bg-[#FBB03B] rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-[#FBB03B] rounded-full animate-bounce [animation-delay:0.4s]"></div></div>}
                </div>
                
                <div className="flex gap-4 p-2">
                   <input 
                    type="text" value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-slate-50 border-2 border-transparent rounded-[2rem] px-8 py-5 outline-none font-bold text-slate-900 focus:bg-white focus:border-[#FBB03B] transition-all"
                    placeholder="Escribe tu consulta estratégica..."
                   />
                   <button onClick={handleSendMessage} className="p-6 bg-slate-900 text-[#FBB03B] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-100">
                      <ArrowRight size={24} />
                   </button>
                </div>
             </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

// Components
const SidebarLink: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black transition-all ${
    active ? 'bg-slate-900 text-[#FBB03B] shadow-2xl shadow-slate-200 translate-x-1' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
  }`}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[11px] uppercase tracking-[0.1em]">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </button>
);

const CommercialCard: React.FC<{ property: Property, matchScore: number, userLevel: number, userRubro: BusinessRubro, onClick: () => void }> = ({ property, matchScore, userLevel, userRubro, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border-b-8 border-b-transparent hover:border-b-[#FBB03B] cursor-pointer relative">
    <div className="relative h-72 overflow-hidden">
      <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
      <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
        <div className={`w-2.5 h-2.5 rounded-full ${matchScore > 80 ? 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'bg-[#FBB03B] shadow-[0_0_15px_rgba(251,176,59,0.5)]'} animate-pulse`}></div>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">{matchScore}% Match {userRubro}</span>
      </div>
      {property.negotiable && (
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20">
           <Handshake className="text-slate-900" size={18} />
        </div>
      )}
    </div>
    
    <div className="p-10">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
        <MapPin size={12} className="text-[#FBB03B]" /> {property.location}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-[#FBB03B] transition-colors leading-tight line-clamp-1">{property.title}</h3>
      
      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between px-2">
           <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Canon Mensual</p>
              <p className="text-3xl font-black text-slate-900">{property.currency === 'CLP' ? '$' : property.currency} {property.price.toLocaleString()}</p>
           </div>
           <div className="w-14 h-14 bg-slate-900 text-[#FBB03B] rounded-[1.25rem] flex items-center justify-center group-hover:bg-[#FBB03B] group-hover:text-slate-900 transition-all shadow-xl shadow-slate-200">
              <ChevronRight size={28} />
           </div>
        </div>
      </div>
    </div>
  </div>
);

const ViabilityItem: React.FC<{ label: string, value: string, status: 'success' | 'error' | 'neutral', icon: any }> = ({ label, value, status, icon }) => (
   <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
      <div className="flex items-center gap-3">
         <div className={`p-2 rounded-xl bg-white shadow-sm ${status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-slate-400'}`}>
            {icon}
         </div>
         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
         status === 'success' ? 'bg-green-100 text-green-700' : 
         status === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
      }`}>
         {value}
      </div>
   </div>
);

const TechBadge: React.FC<{ icon: any, label: string, active: boolean }> = ({ icon, label, active }) => (
   <div className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border transition-all ${active ? 'bg-white border-[#FBB03B] shadow-xl shadow-yellow-50 -translate-y-1' : 'bg-slate-50 border-transparent opacity-40'}`}>
      <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-[#FBB03B] text-slate-900' : 'bg-white text-slate-300 shadow-sm'}`}>
         {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest text-center ${active ? 'text-slate-900' : 'text-slate-300'}`}>{label}</span>
   </div>
);

export default App;
