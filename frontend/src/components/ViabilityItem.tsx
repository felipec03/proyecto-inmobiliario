import React from 'react';

interface Props {
  label: string;
  value: string;
  status: 'success' | 'error' | 'neutral';
  icon: React.ReactElement<{ size?: number; className?: string }>;
}

export const ViabilityItem: React.FC<Props> = ({ label, value, status, icon }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-xl bg-white shadow-sm ${
          status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-slate-400'
        }`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div
      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
        status === 'success'
          ? 'bg-green-100 text-green-700'
          : status === 'error'
            ? 'bg-red-100 text-red-700'
            : 'bg-slate-200 text-slate-600'
      }`}
    >
      {value}
    </div>
  </div>
);
