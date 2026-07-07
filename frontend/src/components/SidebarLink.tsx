import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Props {
  icon: React.ReactElement<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

export const SidebarLink: React.FC<Props> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black transition-all ${
      active
        ? 'bg-slate-900 text-[#FBB03B] shadow-2xl shadow-slate-200 translate-x-1'
        : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[11px] uppercase tracking-[0.1em]">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </button>
);
