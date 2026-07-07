import { useState, useMemo } from 'react';
import {
  ArrowLeft, Users, Info, History, Hammer, MapPin,
  MessageCircle, TrainFront, School, ShoppingBag,
  Target, Handshake, Clock, Lock, ArrowRight,
  Flame, Zap, Droplets, Grid
} from 'lucide-react';
import { ViabilityItem } from '@/components/ViabilityItem';
import { TechBadge } from '@/components/TechBadge';
import type { Property, BusinessRubro, UserProfile } from '@/types';

const COMMERCIAL_PROPERTIES: Property[] = [
  {
    id: '1', title: 'Local Premium con Salida a Calle', price: 1200000, currency: 'CLP', sqm: 45,
    location: 'Lastarria, Santiago', lat: -33.4385, lng: -70.6397,
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
    description: 'Local ideal para heladería o cafetería pequeña. Cuenta con conexión de agua reforzada y trifásica.',
    specs: { hasGas: false, powerCapacity: 'Trifásica', waterConnection: true, greaseTrap: true, frontageSize: 4, footTraffic: 'Alto', permittedUses: ['Gastronomía', 'Retail'] },
    nearbyPOIs: ['Metro Univ. Católica (200m)', 'Centro GAM', 'Barrio Universitario'],
    pastBusiness: 'Fue una boutique de ropa de diseño independiente por 4 años.',
    renovationNeeded: 'Pintura general y mantenimiento menor de sistema eléctrico.',
    ownerNotes: 'Dispuesto a dar 1 mes de gracia por remodelación.',
    negotiable: true,
    neighborhoodInsights: 'Zona de alto flujo turístico y estudiantil. Demanda constante los fines de semana.',
  },
  {
    id: '2', title: 'Bodega Urbana / Dark Store', price: 35000, currency: 'MXN', sqm: 120,
    location: 'Colonia Roma, CDMX', lat: 19.4149, lng: -99.1623,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    description: 'Espacio optimizado para logística de última milla o taller de servicios técnicos.',
    specs: { hasGas: false, powerCapacity: 'Básica', waterConnection: true, greaseTrap: false, frontageSize: 2, footTraffic: 'Bajo', permittedUses: ['Bodega / logística', 'Servicios'] },
    nearbyPOIs: ['Av. Insurgentes (300m)', 'Metro Insurgentes', 'Área Residencial'],
    pastBusiness: 'Distribuidora de insumos médicos.',
    renovationNeeded: 'Nivelación de piso en zona de carga.',
    ownerNotes: 'Precio firme, pero incluye gastos comunes por el primer año.',
    negotiable: false,
    neighborhoodInsights: 'Ubicación estratégica para delivery. Zona segura con control de acceso.',
  },
  {
    id: '3', title: 'Local Esquina Gran Visibilidad', price: 9500000, currency: 'COP', sqm: 85,
    location: 'Vía Primavera, Medellín', lat: 6.2084, lng: -75.5663,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    description: 'Local de alto impacto visual. Ideal para marca de retail o salón de belleza de lujo.',
    specs: { hasGas: true, powerCapacity: 'Trifásica', waterConnection: true, greaseTrap: false, frontageSize: 12, footTraffic: 'Alto', permittedUses: ['Retail', 'Servicios', 'Otro'] },
    nearbyPOIs: ['Parque Lleras', 'Hotel Click Clack', 'Zona Rosa'],
    pastBusiness: 'Restaurante-Bar de autor.',
    renovationNeeded: 'Remodelación de fachada requerida por reglamento de la zona.',
    ownerNotes: 'Interesado en contratos a largo plazo (3+ años).',
    negotiable: true,
    neighborhoodInsights: 'Zona comercial más exclusiva de la ciudad. Alto poder adquisitivo.',
  },
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
  propertyId: string;
  selectedRubro: BusinessRubro;
  userProfile: UserProfile;
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const PropertyDetailPage: React.FC<Props> = ({ propertyId, selectedRubro, userProfile, onBack, onNavigate }) => {
  const [imgSrc, setImgSrc] = useState('');

  const property = useMemo(
    () => COMMERCIAL_PROPERTIES.find((p) => p.id === propertyId),
    [propertyId]
  );

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Propiedad no encontrada</p>
        <button onClick={onBack} className="mt-4 text-[#FBB03B] font-bold">Volver</button>
      </div>
    );
  }

  const matchScore = calculateMatch(property, selectedRubro);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors group"
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
              <div className="bg-slate-900 text-[#FBB03B] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                {matchScore}% Match {selectedRubro}
              </div>
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
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2">Score de Viabilidad MiLocal</h4>
              <div className="space-y-4">
                <ViabilityItem
                  label={`Match para ${selectedRubro}`}
                  value={property.specs.permittedUses.includes(selectedRubro) ? 'COMPATIBLE' : 'LIMITADO'}
                  status={property.specs.permittedUses.includes(selectedRubro) ? 'success' : 'error'}
                  icon={<Target size={14} />}
                />
                <ViabilityItem
                  label="Negociación"
                  value={property.negotiable ? 'OPORTUNIDAD' : 'PRECIO BASE'}
                  status={property.negotiable ? 'success' : 'neutral'}
                  icon={<Handshake size={14} />}
                />
                <ViabilityItem label="Disponibilidad" value="INMEDIATA" status="success" icon={<Clock size={14} />} />
              </div>
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
  );
};
