import { useState, useCallback, useEffect } from 'react';
import { User, MapPin, Target, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DocumentCard } from '@/components/DocumentCard';
import { ProfileSkeleton } from '@/components/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { api } from '@/services/api';
import type { UserProfile, BusinessRubro, Document } from '@/types';

export function ProfilePage() {
  const { profile, updateProfile, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingDocs, setVerifyingDocs] = useState<Set<string>>(new Set());

  // Use auth profile if available, otherwise fallback
  const defaultProfile = profile;

  useEffect(() => {
    if (!profile) {
      setIsLoading(true);
      // Allow a brief loading state for the fallback
      const t = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(t);
    }
  }, [profile]);

  const handleDocumentUpload = useCallback(
    async (docId: string, file: File) => {
      if (!profile) {
        addToast('error', 'Debes iniciar sesión para subir documentos');
        return;
      }

      try {
        const result = await api.uploadDocument(profile.id, file);
        addToast('success', 'Documento subido exitosamente');

        const newDocs = profile.documents.map((doc) =>
          doc.id === docId ? { ...doc, status: 'pending' as const } : doc
        );
        updateProfile({ ...profile, documents: newDocs });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al subir el documento';
        addToast('error', msg);
        throw err;
      }
    },
    [profile, updateProfile, addToast]
  );

  const handleVerifyDocument = useCallback(
    async (docId: string) => {
      if (!profile) {
        addToast('error', 'Debes iniciar sesión para verificar documentos');
        return;
      }

      setVerifyingDocs((prev) => new Set(prev).add(docId));

      try {
        await api.verifyDocument(profile.id, docId);
        const newDocs = profile.documents.map((doc) =>
          doc.id === docId ? { ...doc, status: 'verified' as const } : doc
        );
        updateProfile({ ...profile, documents: newDocs });
        addToast('success', 'Documento verificado exitosamente');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al verificar el documento';
        addToast('error', msg);
      } finally {
        setVerifyingDocs((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      }
    },
    [profile, updateProfile, addToast]
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!defaultProfile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-slate-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Perfil no disponible</h3>
        <p className="text-slate-500 font-medium">
          Inicia sesión para ver tu perfil y gestionar tus documentos.
        </p>
      </div>
    );
  }

  const verifiedCount = defaultProfile.documents.filter((d) => d.status === 'verified').length;
  const progressPercent = defaultProfile.documents.length > 0
    ? (verifiedCount / defaultProfile.documents.length) * 100
    : 0;

  const hasDocuments = defaultProfile.documents.length > 0;

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
            <p className="text-sm font-black text-slate-900 leading-none">{defaultProfile.name}</p>
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
                <h3 className="text-4xl font-black text-slate-900">{defaultProfile.level === 1 ? 'Ilimitadas' : '0'}</h3>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <MapPin className="text-[#FBB03B]" size={24} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">
                {defaultProfile.level === 0 ? 'Sube documentos para agendar' : '¡Explora sin límites!'}
              </p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBB03B]/5 rounded-bl-full -z-0" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Match Index Promedio</p>
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-4xl font-black text-[#FBB03B]">—</h3>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <Target className="text-[#FBB03B]" size={24} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">Basado en tu perfil</p>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck className="text-[#FBB03B]" /> Carpeta Digital MiLocal
              </h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {defaultProfile.subType === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'}
              </span>
            </div>

            <div className="space-y-4">
              {hasDocuments ? (
                defaultProfile.documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    isVerifying={verifyingDocs.has(doc.id)}
                    onVerify={handleVerifyDocument}
                    onUpload={handleDocumentUpload}
                  />
                ))
              ) : (
                <div className="text-center py-16">
                  <FileTextPlaceholder />
                  <h5 className="text-lg font-black text-slate-400 mt-4">No tienes documentos aún</h5>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Sube tus documentos para aumentar tu Trust Level.
                  </p>
                </div>
              )}
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
              <span className={`text-[9px] font-black px-3 py-1.5 rounded-full ${defaultProfile.level === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                {defaultProfile.level === 0 ? 'LEVEL 0' : 'VERIFICADO'}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#FBB03B] transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] font-black text-slate-900">
              {verifiedCount}/{defaultProfile.documents.length} Documentos verificados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileTextPlaceholder() {
  return (
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    </div>
  );
}
