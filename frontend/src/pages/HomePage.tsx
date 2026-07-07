import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Zap, ArrowRight, Target, Key, ChevronRight,
  Grid, MapIcon, MapPin, Flame, Droplets, Store,
  TrendingUp, Briefcase, Users, RefreshCw, PackageOpen,
} from 'lucide-react';
import { CommercialCard } from '@/components/CommercialCard';
import { PropertyCardSkeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { api } from '@/services/api';
import type { Property, BusinessRubro, RubroOption } from '@/types';

const RUBROS: RubroOption[] = [
  { label: 'Gastronomía', icon: <Flame />, color: '#FBB03B', description: 'Restaurantes, Cafés, Dark Kitchens' },
  { label: 'Belleza / estética', icon: <Users />, color: '#FBB03B', description: 'Peluquerías, Spa, Centros de Estética' },
  { label: 'Retail', icon: <Store />, color: '#FBB03B', description: 'Tiendas, Showrooms, Comercio' },
  { label: 'Servicios', icon: <Briefcase />, color: '#FBB03B', description: 'Talleres, Consultorios, Agencias' },
  { label: 'Bodega / logística', icon: <TrendingUp />, color: '#FBB03B', description: 'Bodegas, Distribución, Last Mile' },
  { label: 'Otro', icon: <Grid />, color: '#FBB03B', description: 'Cualquier otro rubro comercial' },
];

interface Props {
  onNavigate: (tab: string, params?: Record<string, string>) => void;
  onSelectProperty: (id: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate, onSelectProperty }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedRubro, setSelectedRubro] = useState<BusinessRubro>('Gastronomía');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchProperties = useCallback(async (rubro?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProperties(rubro || undefined);
      setProperties(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar propiedades';
      setError(msg);
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProperties(selectedRubro);
  }, [selectedRubro, fetchProperties]);

  const handleRetry = () => {
    fetchProperties(selectedRubro);
  };

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
                aria-label="Empezar el assessment"
              >
                Empezar Assessment <ArrowRight size={24} />
              </button>
              <div className="flex -space-x-4 items-center ml-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    className="w-12 h-12 rounded-full border-4 border-slate-900 shadow-xl"
                    alt="Usuario de MiLocal"
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
              aria-label="Vista en grilla"
            >
              <Grid size={16} /> Grilla
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-slate-900'}`}
              aria-label="Vista en mapa"
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
              aria-label={`Filtrar por ${rubro.label}`}
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
          {/* Loading skeletons */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PropertyCardSkeleton />
              </motion.div>
            ))}

          {/* Error state */}
          {!isLoading && error && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw size={32} className="text-red-400" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Error al cargar propiedades</h4>
              <p className="text-slate-500 font-medium mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#FBB03B] hover:text-slate-900 transition-all inline-flex items-center gap-2 shadow-lg"
                aria-label="Reintentar carga de propiedades"
              >
                <RefreshCw size={16} /> Reintentar
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && properties.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageOpen size={32} className="text-slate-400" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">No se encontraron propiedades</h4>
              <p className="text-slate-500 font-medium">
                No hay locales disponibles para <span className="font-black text-slate-700">{selectedRubro}</span> en este momento.
              </p>
            </div>
          )}

          {/* Property cards */}
          {!isLoading &&
            !error &&
            properties.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <CommercialCard
                  property={property}
                  userRubro={selectedRubro}
                  onClick={() => onSelectProperty(property.id)}
                />
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};
