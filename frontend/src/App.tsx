import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useCallback } from 'react';
import {
  Store, MessageSquare, TrendingUp, Camera, User, Briefcase
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { SidebarLink } from '@/components/SidebarLink';
import { HomePage } from '@/pages/HomePage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';
import { TrendsPage } from '@/pages/TrendsPage';
import type { BusinessRubro, UserProfile, Document } from '@/types';

const DEFAULT_USER: UserProfile = {
  id: 'u1',
  name: 'Carlos Emprendedor',
  email: 'carlos@startup.cl',
  type: 'entrepreneur',
  level: 0,
  subType: 'juridica',
  documents: [
    { id: 'd1', userId: 'u1', name: 'Identidad Representante', type: 'identity', status: 'pending' },
    { id: 'd2', userId: 'u1', name: 'Carpeta Tributaria', type: 'income', status: 'empty' },
    { id: 'd3', userId: 'u1', name: 'Escritura Constitución', type: 'legal', status: 'empty' },
  ],
};

function AppLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedRubro, setSelectedRubro] = useState<BusinessRubro>('Gastronomía');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);

  const verifiedCount = userProfile.documents.filter((d) => d.status === 'verified').length;
  const progressPercent = (verifiedCount / userProfile.documents.length) * 100;

  const updateDocument = useCallback((docId: string) => {
    const newDocs = userProfile.documents.map((doc) =>
      doc.id === docId ? { ...doc, status: 'verified' as const } : doc
    );
    const allVerified = newDocs.every((d) => d.status === 'verified');
    setUserProfile({ ...userProfile, documents: newDocs, level: allVerified ? 1 : 0 });
  }, [userProfile]);

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab);
    setSelectedPropertyId(null);
  }, []);

  const handleSelectProperty = useCallback((id: string) => {
    setSelectedPropertyId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPropertyId(null);
  }, []);

  // Determine what to render in main area
  const renderContent = () => {
    if (activeTab === 'onboarding') {
      return <OnboardingPage onComplete={() => setActiveTab('home')} />;
    }

    if (selectedPropertyId) {
      return (
        <PropertyDetailPage
          propertyId={selectedPropertyId}
          selectedRubro={selectedRubro}
          userProfile={userProfile}
          onBack={handleBack}
          onNavigate={(tab) => { setActiveTab(tab); setSelectedPropertyId(null); }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
          />
        );
      case 'chat':
        return <ChatPage selectedRubro={selectedRubro} />;
      case 'trends':
        return <TrendsPage />;
      case 'profile':
        return (
          <ProfilePage
            userProfile={userProfile}
            selectedRubro={selectedRubro}
            onUpdateDocument={updateDocument}
          />
        );
      case 'visual':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Camera size={64} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-400">Visual Analyzer</h3>
              <p className="text-slate-300 mt-2">Próximamente</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-gray-100 p-8 sticky top-0 h-screen shadow-sm z-30">
        <BrandLogo />

        <div className="mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel Inquilino</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${userProfile.level === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
              {userProfile.level === 0 ? 'LEVEL 0' : 'VERIFICADO'}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#FBB03B] transition-all duration-700 ease-out shadow-sm" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-900">{verifiedCount}/{userProfile.documents.length} Docs</p>
            <button onClick={() => { setActiveTab('profile'); setSelectedPropertyId(null); }} className="text-[9px] font-black text-[#FBB03B] uppercase tracking-widest hover:underline">
              Completar
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink icon={<Store />} label="Explorar Locales" active={activeTab === 'home'} onClick={() => handleNavigate('home')} />
          <SidebarLink icon={<MessageSquare />} label="Consultor MiLocal" active={activeTab === 'chat'} onClick={() => handleNavigate('chat')} />
          <SidebarLink icon={<TrendingUp />} label="Pulso Comercial" active={activeTab === 'trends'} onClick={() => handleNavigate('trends')} />
          <SidebarLink icon={<User />} label="Mi Perfil" active={activeTab === 'profile'} onClick={() => handleNavigate('profile')} />
          <SidebarLink icon={<Camera />} label="Visual Analyzer" active={activeTab === 'visual'} onClick={() => handleNavigate('visual')} />
        </nav>

        <div className="mt-6 pt-6 border-t border-slate-50">
          <button
            onClick={() => setUserProfile({ ...userProfile, type: userProfile.type === 'entrepreneur' ? 'owner' : 'entrepreneur' })}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 text-white hover:bg-[#FBB03B] hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100"
          >
            <Briefcase size={14} />
            {userProfile.type === 'entrepreneur' ? 'Cambiar a Propietario' : 'Cambiar a Emprendedor'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
