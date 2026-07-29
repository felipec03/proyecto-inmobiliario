import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendsSkeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { api } from '@/services/api';
import type { MarketTrend } from '@/types';

// Static fallback — kept only for dev/testing purposes
const DEV_FALLBACK_TREND: MarketTrend = {
  city: 'Santiago',
  avgPriceSqm: 0.42,
  demandLevel: 'Alta',
  summary: 'El mercado comercial muestra una recuperación del 12% en vacancia. Zonas como Lastarria y Providencia lideran la demanda.',
  trends: [
    { month: 'Ene', growth: 2.1 },
    { month: 'Feb', growth: 2.8 },
    { month: 'Mar', growth: 1.5 },
    { month: 'Abr', growth: 3.2 },
    { month: 'May', growth: 2.9 },
    { month: 'Jun', growth: 4.1 },
  ],
};

const CHILEAN_COMMUNES = [
  'Santiago',
  'Providencia',
  'Las Condes',
  'Vitacura',
  'Ñuñoa',
  'La Florida',
  'Maipú',
  'Concepción',
  'Viña del Mar',
];

export const TrendsPage = () => {
  const [city, setCity] = useState('Santiago');
  const [searchCity, setSearchCity] = useState('Santiago');
  const [trend, setTrend] = useState<MarketTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchTrends = useCallback(async (cityName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTrends(cityName);
      setTrend(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar tendencias';
      setError(msg);
      addToast('error', msg);
      // Keep trend as null on error — do not show fake data
      setTrend(null);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTrends(city);
  }, [city, fetchTrends]);

  const handleCityChange = (newCity: string) => {
    setSearchCity(newCity);
    setCity(newCity);
  };

  const handleSearch = () => {
    if (searchCity.trim()) {
      setCity(searchCity.trim());
    }
  };

  if (isLoading) {
    return <TrendsSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-2 leading-none tracking-tight">Pulso Comercial</h2>
        <p className="text-slate-500 font-medium text-lg">Tendencias de mercado inmobiliario comercial en tiempo real.</p>
      </header>

      {/* City selector */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex bg-white p-2 rounded-[2rem] border-2 border-slate-100 shadow-sm">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="px-6 py-3 bg-transparent outline-none font-bold text-slate-900 text-sm"
              placeholder="Buscar comuna..."
              aria-label="Buscar comuna"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#FBB03B] hover:text-slate-900 transition-all"
              aria-label="Buscar tendencias"
            >
              Buscar
            </button>
          </div>
          {error && (
            <button
              onClick={() => fetchTrends(city)}
              className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
              aria-label="Reintentar carga de tendencias"
            >
              <RefreshCw size={14} /> Reintentar
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {CHILEAN_COMMUNES.map((c) => (
            <button
              key={c}
              onClick={() => handleCityChange(c)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                city === c
                  ? 'bg-[#FBB03B] text-slate-900 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]'
                  : 'bg-white text-slate-400 border-2 border-gray-100 hover:border-gray-200'
              }`}
              aria-label={`Ver tendencias para ${c}`}
            >
              <MapPin size={14} /> {c}
            </button>
          ))}
        </div>
      </div>

      {/* Error state — no trend data */}
      {error && !trend && (
        <div className="bg-white p-16 rounded-[3.5rem] border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={36} className="text-red-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Datos no disponibles</h3>
          <p className="text-slate-500 font-medium mb-2">{error}</p>
          <p className="text-xs text-slate-400 mb-8">Próximamente: El módulo de Pulso Comercial estará disponible con datos en tiempo real.</p>
          <button
            onClick={() => fetchTrends(city)}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#FBB03B] hover:text-slate-900 transition-all inline-flex items-center gap-2 shadow-lg"
            aria-label="Reintentar carga de tendencias"
          >
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      )}

      {/* Trend data display */}
      {trend && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <TrendingUp className="text-[#FBB03B] mb-4" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Precio Promedio m²</p>
              <h3 className="text-4xl font-black text-slate-900">${trend.avgPriceSqm.toFixed(2)} UF</h3>
              <p className="text-sm text-slate-400 font-bold mt-3">En {trend.city}</p>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <MapPin className="text-[#FBB03B] mb-4" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nivel de Demanda</p>
              <h3 className="text-4xl font-black text-[#FBB03B]">{trend.demandLevel}</h3>
              <p className="text-sm text-slate-400 font-bold mt-3">Proyectado Q3 2025</p>
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl">
              <p className="text-[10px] font-black text-[#FBB03B] uppercase tracking-[0.2em] mb-4">Insight MiLocal</p>
              <p className="text-lg font-medium leading-relaxed italic border-l-4 border-[#FBB03B] pl-6">
                {trend.summary}
              </p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-8">Evolución Mensual - {trend.city}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trend.trends}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBB03B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FBB03B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="growth" stroke="#FBB03B" strokeWidth={3} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
