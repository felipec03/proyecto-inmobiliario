import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, ChevronRight, Handshake } from 'lucide-react';
import type { Property, BusinessRubro } from '@/types';

interface Props {
  property: Property;
  matchScore?: number;
  userRubro: BusinessRubro;
  onClick: () => void;
}

export const CommercialCard: React.FC<Props> = ({ property, matchScore, userRubro, onClick }) => {
  const [imgSrc, setImgSrc] = useState(property.image);
  const showScore = typeof matchScore === 'number' && matchScore > 0;

  return (
    <motion.div
      onClick={onClick}
      className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border-b-8 border-b-transparent hover:border-b-[#FBB03B] cursor-pointer relative"
    >
      <div className="relative h-72 overflow-hidden">
        <img
          src={imgSrc}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          onError={() => setImgSrc(`https://placehold.co/800x600/FBB03B/1e293b?text=${encodeURIComponent(property.title.substring(0, 15))}`)}
          referrerPolicy="no-referrer"
        />
        {showScore && (
          <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                matchScore! > 80
                  ? 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                  : 'bg-[#FBB03B] shadow-[0_0_15px_rgba(251,176,59,0.5)]'
              } animate-pulse`}
            />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">
              {matchScore}% Match {userRubro}
            </span>
          </div>
        )}
        {property.negotiable && (
          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20">
            <Handshake className="text-slate-900" size={18} />
          </div>
        )}
      </div>

      <div className="p-10">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
          <MapPin size={12} className="text-[#FBB03B]" /> {property.location}
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-[#FBB03B] transition-colors leading-tight line-clamp-1">
          {property.title}
        </h3>

        <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between px-2">
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Canon Mensual</p>
              <p className="text-3xl font-black text-slate-900">
                {property.currency === 'CLP' ? '$' : property.currency} {property.price.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-slate-900 text-[#FBB03B] rounded-[1.25rem] flex items-center justify-center group-hover:bg-[#FBB03B] group-hover:text-slate-900 transition-all shadow-xl shadow-slate-200">
              <ChevronRight size={28} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
