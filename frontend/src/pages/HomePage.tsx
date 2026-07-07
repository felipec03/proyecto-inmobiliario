import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Zap, ArrowRight, Target, Key, ChevronRight,
  Grid, MapIcon, MapPin, Flame, Droplets, Store,
  TrendingUp, Briefcase, Users, MessageCircle, TrainFront, School, ShoppingBag
} from 'lucide-react';
import { CommercialCard } from '@/components/CommercialCard';
import type { Property, BusinessRubro, RubroOption } from '@/types';

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
      permittedUses: ['Gastronomía', 'Retail'],
    },
    nearbyPOIs: ['Metro Univ. Católica (200m)', 'Centro GAM', 'Barrio Universitario'],
    pastBusiness: 'Fue una boutique de ropa de diseño independiente por 4 años.',
    renovationNeeded: 'Pintura general y mantenimiento menor de sistema eléctrico.',
    ownerNotes: 'Dispuesto a dar 1 mes de gracia por remodelación.',
    negotiable: true,
    neighborhoodInsights: 'Zona de alto flujo turístico y estudiantil. Demanda constante los fines de semana.',
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
      permittedUses: ['Bodega / logística', 'Servicios'],
    },
    nearbyPOIs: ['Av. Insurgentes (300m)', 'Metro Insurgentes', 'Área Residencial'],
    pastBusiness: 'Distribuidora de insumos médicos.',
    renovationNeeded: 'Nivelación de piso en zona de carga.',
    ownerNotes: 'Precio firme, pero incluye gastos comunes por el primer año.',
    negotiable: false,
    neighborhoodInsights: 'Ubicación estratégica para delivery. Zona segura con control de acceso.',
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
      permittedUses: ['Retail', 'Servicios', 'Otro'],
    },
    nearbyPOIs: ['Parque Lleras', 'Hotel Click Clack', 'Zona Rosa'],
    pastBusiness: 'Restaurante-Bar de autor.',
    renovationNeeded: 'Remodelación de fachada requerida por reglamento de la zona.',
    ownerNotes: 'Interesado en contratos a largo plazo (3+ años).',
    negotiable: true,
    neighborhoodInsights: 'Zona comercial más exclusiva de la ciudad. Alto poder adquisitivo.',
  },
];

const RUBROS: RubroOption[] = [
  { label: 'Gastronomía', icon: <Flame />, color: '#FBB03B', description: 'Restaurantes, Cafés, Dark Kitchens' },
  { label: 'Belleza / estética', icon: <Users />, color: '#FBB03B', description: 'Peluquerías, Spa, Centros de Estética' },
  { label: 'Retail', icon: <Store />, color: '#FBB03B', description: 'Tiendas, Showrooms, Comercio' },
  { label: 'Servicios', icon: <Briefcase />, color: '#FBB03B', description: 'Talleres, Consultorios, Agencias' },
  { label: 'Bodega / logística', icon: <TrendingUp />, color: '#FBB03B', description: 'Bodegas, Distribución, Last Mile' },
  { label: 'Otro', icon: <Grid />, color: '#FBB03B', description: 'Cualquier otro rubro comercial' },
];

function calculateMatch(property: Property, rubro: BusinessRubro): number {
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
}

interface Props {
  onNavigate: (tab: string, params?: Record<string, string>) => void;
  onSelectProperty: (id: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate, onSelectProperty }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedRubro, setSelectedRubro] = useState<BusinessRubro>('Gastronomía');

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden rounded-[4rem] bg-slate-900 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#FBB03B_0%,transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#FBB03B_0%,transparent_50%)]" />
        </div>
        <div className="relative z-10 px-16 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
                onClick={() => onNavigate('onboarding')}
                className="px-10 py-6 bg-[#FBB03B] text-slate-900 rounded-[2rem] font-black text-lg flex items-center gap-3 hover:scale-105 hover:rotate-1 transition-all shadow-[0_20px_50px_rgba(251,176,59,0.3)]"
              >
                Empezar Assessment <ArrowRight size={24} />
              </button>
              <div className="flex -space-x-4 items-center ml-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
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
          <button onClick={() => onNavigate('onboarding')} className="flex items-center gap-2 font-black text-sm uppercase tracking-widest border-b-4 border-slate-900 pb-1">
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
          <button onClick={() => onNavigate('onboarding')} className="flex items-center gap-2 font-black text-sm uppercase tracking-widest border-b-4 border-[#FBB03B] pb-1">
            Hacer Assessment Propietario <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Explorer */}
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
              className={`flex-shrink-0 px-10 py-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-4 ${
                selectedRubro === rubro.label
                  ? 'bg-[#FBB03B] border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] translate-y-[-4px]'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              <div className={`${selectedRubro === rubro.label ? 'text-slate-900 scale-125' : 'text-gray-300'} transition-transform`}>
                {rubro.icon}
              </div>
              <div className="text-left">
                <span className="block font-black tracking-tight text-lg leading-none mb-1">{rubro.label}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedRubro === rubro.label ? 'text-slate-700' : 'text-gray-300'}`}>
                  Ver Locales
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {COMMERCIAL_PROPERTIES.map((property) => (
            <CommercialCard
              key={property.id}
              property={property}
              matchScore={calculateMatch(property, selectedRubro)}
              userRubro={selectedRubro}
              onClick={() => onSelectProperty(property.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
