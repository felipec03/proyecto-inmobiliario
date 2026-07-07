import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, MapPin, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendsSkeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { api } from '@/services/api';
import type { MarketTrend } from '@/types';

const DEFAULT_TREND: MarketTrend = {
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

const CITIES = ['Santiago', 'Ciudad de México', 'Medellín', 'Buenos Aires', 'Lima', 'Bogotá'];

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
      setTrend(DEFAULT_TREND);
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

  const displayTrend = trend || DEFAULT_TREND;

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
              placeholder="Buscar ciudad..."
              aria-label="Buscar ciudad"
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
          {CITIES.map((c) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <TrendingUp className="text-[#FBB03B] mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Precio Promedio m²</p>
          <h3 className="text-4xl font-black text-slate-900">${displayTrend.avgPriceSqm.toFixed(2)} UF</h3>
          <p className="text-sm text-slate-400 font-bold mt-3">En {displayTrend.city}</p>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <MapPin className="text-[#FBB03B] mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nivel de Demanda</p>
          <h3 className="text-4xl font-black text-[#FBB03B]">{displayTrend.demandLevel}</h3>
          <p className="text-sm text-slate-400 font-bold mt-3">Proyectado Q3 2025</p>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl">
          <p className="text-[10px] font-black text-[#FBB03B] uppercase tracking-[0.2em] mb-4">Insight MiLocal</p>
          <p className="text-lg font-medium leading-relaxed italic border-l-4 border-[#FBB03B] pl-6">
            {displayTrend.summary}
          </p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 mb-8">Evolución Mensual - {displayTrend.city}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={displayTrend.trends}>
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
    </div>
  );
};
