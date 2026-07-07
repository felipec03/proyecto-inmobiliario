import { User, MapPin, Target, ShieldCheck } from 'lucide-react';
import { DocumentCard } from '@/components/DocumentCard';
import type { UserProfile, BusinessRubro } from '@/types';

interface Props {
  userProfile: UserProfile;
  selectedRubro: BusinessRubro;
  onUpdateDocument: (docId: string) => void;
}

export const ProfilePage: React.FC<Props> = ({ userProfile, selectedRubro, onUpdateDocument }) => {
  const verifiedCount = userProfile.documents.filter((d) => d.status === 'verified').length;
  const progressPercent = (verifiedCount / userProfile.documents.length) * 100;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2 leading-none tracking-tight">Mi Perfil Verificado</h2>
          <p className="text-slate-500 font-medium text-lg">Aumenta tu Trust Level para interactuar con propietarios Premium.</p>
        </div>
        <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="text-[#FBB03B]" size={28} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-none">{userProfile.name}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> MiLocal Verified
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Visitas Disponibles</p>
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-4xl font-black text-slate-900">{userProfile.level === 1 ? 'Ilimitadas' : '0'}</h3>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <MapPin className="text-[#FBB03B]" size={24} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">
                {userProfile.level === 0 ? 'Sube documentos para agendar' : '¡Explora sin límites!'}
              </p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBB03B]/5 rounded-bl-full -z-0" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Match Index Promedio</p>
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-4xl font-black text-[#FBB03B]">84%</h3>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <Target className="text-[#FBB03B]" size={24} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Basado en {selectedRubro}</p>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck className="text-[#FBB03B]" /> Carpeta Digital MiLocal
              </h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {userProfile.subType === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'}
              </span>
            </div>
            <div className="space-y-4">
              {userProfile.documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onVerify={onUpdateDocument} />
              ))}
            </div>
          </div>
        </div>

        {/* Trust Progress Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm sticky top-12">
            <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <ShieldCheck className="text-[#FBB03B]" /> Trust Level
            </h4>
            <div className="mb-6">
              <span className={`text-[9px] font-black px-3 py-1.5 rounded-full ${userProfile.level === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                {userProfile.level === 0 ? 'LEVEL 0' : 'VERIFICADO'}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#FBB03B] transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] font-black text-slate-900">
              {verifiedCount}/{userProfile.documents.length} Documentos verificados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
