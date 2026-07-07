import { useState, useEffect } from 'react';
import {
  ArrowLeft, Users, Info, History, Hammer, MapPin,
  MessageCircle, TrainFront, School, ShoppingBag,
  Target, Handshake, Clock, Lock, ArrowRight,
  Flame, Zap, Droplets, Grid, CheckCircle, AlertTriangle, MinusCircle,
  RefreshCw,
} from 'lucide-react';
import { TechBadge } from '@/components/TechBadge';
import { PropertyDetailSkeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { api } from '@/services/api';
import type { Property, BusinessRubro, UserProfile, MatchResponse } from '@/types';

interface Props {
  propertyId: string;
  selectedRubro: BusinessRubro;
  userProfile: UserProfile;
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const PropertyDetailPage: React.FC<Props> = ({
  propertyId,
  selectedRubro,
  userProfile,
  onBack,
  onNavigate,
}) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [matchData, setMatchData] = useState<MatchResponse | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Fetch property
  useEffect(() => {
    let cancelled = false;
    setIsLoadingProperty(true);
    setPropertyError(null);

    api
      .getProperty(propertyId)
      .then((data) => {
        if (!cancelled) {
          setProperty(data);
          setImgSrc(data.image);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Error al cargar la propiedad';
          setPropertyError(msg);
          addToast('error', msg);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProperty(false);
      });

    return () => { cancelled = true; };
  }, [propertyId, addToast]);

  // Fetch match
  useEffect(() => {
    if (!propertyId || !selectedRubro) return;

    let cancelled = false;
    setIsLoadingMatch(true);
    setMatchError(null);

    api
      .calculateMatch(propertyId, selectedRubro)
      .then((data) => {
        if (!cancelled) setMatchData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Error al calcular el match';
          setMatchError(msg);
          addToast('error', msg);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMatch(false);
      });

    return () => { cancelled = true; };
  }, [propertyId, selectedRubro, addToast]);

  // Loading state
  if (isLoadingProperty) {
    return <PropertyDetailSkeleton />;
  }

  // Error state
  if (propertyError || !property) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors group mx-auto"
          aria-label="Volver al listado"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al listado
        </button>
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Propiedad no encontrada</h3>
        <p className="text-slate-500 font-medium mb-6">{propertyError || 'Esta propiedad no existe o fue removida.'}</p>
        <button
          onClick={onBack}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#FBB03B] hover:text-slate-900 transition-all inline-flex items-center gap-2 shadow-lg"
          aria-label="Volver al listado de propiedades"
        >
          <ArrowLeft size={16} /> Volver al listado
        </button>
      </div>
    );
  }

  const matchScore = matchData ? Math.round(matchData.score * 100) : 0;
  const breakdown = matchData?.breakdown || [];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors group"
        aria-label="Volver al listado de propiedades"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al listado
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <div className="relative h-[450px] rounded-[3.5rem] overflow-hidden shadow-2xl">
            <img
              src={imgSrc || property.image}
              className="w-full h-full object-cover"
              alt={property.title}
              onError={() => setImgSrc(`https://placehold.co/800x600/FBB03B/1e293b?text=${encodeURIComponent(property.title.substring(0, 15))}`)}
            />
            <div className="absolute top-8 left-8 flex gap-3">
              {isLoadingMatch ? (
                <div className="bg-slate-900 text-[#FBB03B] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" /> Calculando...
                </div>
              ) : (
                <div className="bg-slate-900 text-[#FBB03B] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                  {matchScore}% Match {selectedRubro}
                </div>
              )}
              <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                <Users size={14} className="text-[#FBB03B]" /> {property.specs.footTraffic} Tráfico
              </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] flex justify-between items-center text-white">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Ubicación Estratégica</p>
                <h4 className="text-2xl font-black">{property.location}</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Canon Mensual</p>
                <p className="text-3xl font-black text-[#FBB03B]">
                  {property.currency} {property.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Info className="text-[#FBB03B]" /> Potencial Comercial
              </h3>
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${property.negotiable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {property.negotiable ? 'Propietario Abierto a Negociar' : 'Precio Final'}
              </div>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed text-lg mb-10 italic">"{property.description}"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History size={14} className="text-[#FBB03B]" /> Historial de éxito
                </h5>
                <p className="text-sm font-bold text-slate-900 mb-2 leading-relaxed">{property.pastBusiness}</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Hammer size={14} className="text-[#FBB03B]" /> Estado de adecuación
                </h5>
                <p className="text-sm font-bold text-slate-900 mb-2 leading-relaxed">{property.renovationNeeded}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FBB03B]/10 rounded-bl-full group-hover:scale-110 transition-transform duration-1000" />
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10">
              <MapPin className="text-[#FBB03B]" /> Radiografía del Barrio
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <p className="text-base opacity-90 font-medium leading-relaxed italic border-l-4 border-[#FBB03B] pl-6">
                  {property.neighborhoodInsights}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#FBB03B] uppercase tracking-widest">Puntos de Interés Cercanos</p>
                <div className="flex flex-wrap gap-3">
                  {property.nearbyPOIs.map((poi, idx) => (
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

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm sticky top-12">
            <div className="mb-10">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2">
                Score de Viabilidad MiLocal
              </h4>

              {/* Match loading */}
              {isLoadingMatch && (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-200 w-10 h-10" />
                        <div className="h-4 bg-slate-200 rounded w-24" />
                      </div>
                      <div className="h-6 bg-slate-200 rounded w-14" />
                    </div>
                  ))}
                </div>
              )}

              {/* Match error */}
              {!isLoadingMatch && matchError && (
                <div className="text-center py-6">
                  <AlertTriangle size={24} className="text-yellow-500 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-500">No se pudo calcular el match. Mostrando análisis básico.</p>
                </div>
              )}

              {/* Real breakdown from API */}
              {!isLoadingMatch && !matchError && breakdown.length > 0 && (
                <div className="space-y-4">
                  {breakdown.map((item) => {
                    const ratio = item.maxWeight > 0 ? item.score / item.maxWeight : 0;
                    const percentage = Math.round(ratio * 100);
                    const statusColor =
                      ratio > 0.7 ? 'text-green-500' :
                      ratio > 0.3 ? 'text-yellow-500' : 'text-red-500';
                    const bgBadge =
                      ratio > 0.7 ? 'bg-green-100 text-green-700' :
                      ratio > 0.3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                    const Icon =
                      ratio > 0.7 ? CheckCircle :
                      ratio > 0.3 ? MinusCircle : AlertTriangle;

                    return (
                      <div key={item.dimension} className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-white shadow-sm ${statusColor}`}>
                            <Icon size={14} />
                          </div>
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${bgBadge}`}>
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fallback when no match data */}
              {!isLoadingMatch && !matchError && breakdown.length === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-green-500">
                        <Target size={14} />
                      </div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Match para {selectedRubro}</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      property.specs.permittedUses.includes(selectedRubro) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {property.specs.permittedUses.includes(selectedRubro) ? 'COMPATIBLE' : 'LIMITADO'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-green-500">
                        <Handshake size={14} />
                      </div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Negociación</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      property.negotiable ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {property.negotiable ? 'OPORTUNIDAD' : 'PRECIO BASE'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-green-500">
                        <Clock size={14} />
                      </div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Disponibilidad</span>
                    </div>
                    <div className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                      INMEDIATA
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 mb-10">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Especificaciones Técnicas</h4>
              <div className="grid grid-cols-2 gap-4">
                <TechBadge icon={<Flame />} label="Gas" active={property.specs.hasGas} />
                <TechBadge icon={<Zap />} label="Trifásica" active={property.specs.powerCapacity === 'Trifásica'} />
                <TechBadge icon={<Droplets />} label="Agua" active={property.specs.waterConnection} />
                <TechBadge icon={<Grid />} label="Grasas" active={property.specs.greaseTrap} />
              </div>
            </div>

            <div className="p-8 bg-[#FBB03B]/5 rounded-[2.5rem] border border-[#FBB03B]/20 mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#FBB03B]/10 rounded-bl-full" />
              <h5 className="text-[10px] font-black text-[#FBB03B] uppercase tracking-widest mb-3 flex items-center gap-2">
                <MessageCircle size={14} /> Recomendación del Owner
              </h5>
              <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{property.ownerNotes}"</p>
            </div>

            <div className="space-y-4">
              {userProfile.level === 0 ? (
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-center relative">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Lock className="text-slate-300" size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Evaluación LEVEL 0</p>
                  <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">
                    Tu perfil actual no permite agendar visitas. Sube tus liquidaciones o carpeta tributaria para desbloquear el contacto directo.
                  </p>
                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-[#FBB03B] hover:text-slate-900 transition-all shadow-2xl shadow-slate-200"
                    aria-label="Ir al perfil para subir documentos"
                  >
                    Actualizar a LEVEL 1
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button className="w-full py-6 bg-slate-900 text-[#FBB03B] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3" aria-label="Solicitar visita a la propiedad">
                    Solicitar Visita <ArrowRight size={20} />
                  </button>
                  <button className="w-full py-6 bg-white text-slate-900 border-2 border-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3" aria-label="Enviar propuesta formal">
                    Enviar Propuesta Formal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
