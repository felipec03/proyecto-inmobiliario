import React from 'react';

interface Props {
  icon: React.ReactElement<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
}

export const TechBadge: React.FC<Props> = ({ icon, label, active }) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border transition-all ${
      active
        ? 'bg-white border-[#FBB03B] shadow-xl shadow-yellow-50 -translate-y-1'
        : 'bg-slate-50 border-transparent opacity-40'
    }`}
  >
    <div
      className={`p-3 rounded-2xl transition-all ${
        active ? 'bg-[#FBB03B] text-slate-900' : 'bg-white text-slate-300 shadow-sm'
      }`}
    >
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span
      className={`text-[10px] font-black uppercase tracking-widest text-center ${
        active ? 'text-slate-900' : 'text-slate-300'
      }`}
    >
      {label}
    </span>
  </div>
);
