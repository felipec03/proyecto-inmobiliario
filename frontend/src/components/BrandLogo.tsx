import { Key } from 'lucide-react';

export const BrandLogo = () => (
  <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => window.location.href = '/'}>
    <div className="relative">
      <div className="w-14 h-12 border-2 border-slate-900 rounded-2xl flex items-center justify-center bg-[#FBB03B] shadow-xl shadow-yellow-100 transition-transform group-hover:rotate-2">
        <span className="text-xs font-black text-slate-900 tracking-tighter leading-none -mt-0.5">MI</span>
      </div>
      <div className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 transform group-hover:-rotate-12 transition-transform">
        <Key className="text-slate-900 w-5 h-5" />
      </div>
    </div>
    <div className="flex flex-col">
      <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">MiLocal</h1>
      <span className="text-[9px] font-bold text-[#FBB03B] uppercase tracking-[0.2em] mt-1">Trust & Match</span>
    </div>
  </div>
);
