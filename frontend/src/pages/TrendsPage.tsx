import { useState, useEffect } from 'react';
import { TrendingUp, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MarketTrend } from '@/types';

const DEMO_TREND: MarketTrend = {
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

export const TrendsPage = () => {
  const [city, setCity] = useState('Santiago');
  const [data, setData] = useState<MarketTrend | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(DEMO_TREND);
  }, [city]);

  const trend = data || DEMO_TREND;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-2 leading-none tracking-tight">Pulso Comercial</h2>
        <p className="text-slate-500 font-medium text-lg">Tendencias de mercado inmobiliario comercial en tiempo real.</p>
      </header>

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
    </div>
  );
};
