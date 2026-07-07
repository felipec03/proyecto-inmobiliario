import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store, MessageSquare, TrendingUp, Camera, User, Briefcase,
  Menu, X, LogOut, ChevronRight,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { SidebarLink } from '@/components/SidebarLink';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { HomePage } from '@/pages/HomePage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';
import { TrendsPage } from '@/pages/TrendsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import type { BusinessRubro, UserProfile } from '@/types';

// ------------------------------------------------------------------
// Public pages (login / register) — no sidebar
// ------------------------------------------------------------------
function PublicLayout() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LoginPage />
          </motion.div>
        } />
        <Route path="/register" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <RegisterPage />
          </motion.div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------
// Protected layout — with sidebar, toast, auth
// ------------------------------------------------------------------
function ProtectedLayout() {
  const { user, profile, isAuthenticated, isLoading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedRubro, setSelectedRubro] = useState<BusinessRubro>('Gastronomía');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const verifiedCount = profile?.documents?.filter((d) => d.status === 'verified').length ?? 0;
  const totalDocs = profile?.documents?.length ?? 0;
  const progressPercent = totalDocs > 0 ? (verifiedCount / totalDocs) * 100 : 0;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Loading auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="w-14 h-12 border-2 border-slate-900 rounded-2xl flex items-center justify-center bg-[#FBB03B] shadow-xl shadow-yellow-100 mx-auto mb-4 animate-pulse">
            <span className="text-xs font-black text-slate-900 tracking-tighter leading-none -mt-0.5">MI</span>
          </div>
          <p className="text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const renderContent = () => {
    if (activeTab === 'onboarding') {
      return (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <OnboardingPage onComplete={() => setActiveTab('home')} />
        </motion.div>
      );
    }

    if (selectedPropertyId) {
      return (
        <motion.div
          key={`prop-${selectedPropertyId}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <PropertyDetailPage
            propertyId={selectedPropertyId}
            selectedRubro={selectedRubro}
            userProfile={profile || {
              id: user?.id || 'u1',
              name: user?.name || '',
              email: user?.email || '',
              type: user?.type || 'entrepreneur',
              level: 0,
              subType: 'natural',
              documents: [],
            }}
            onBack={handleBack}
            onNavigate={(tab) => { setActiveTab(tab); setSelectedPropertyId(null); }}
          />
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onSelectProperty={handleSelectProperty}
            />
          )}
          {activeTab === 'chat' && <ChatPage selectedRubro={selectedRubro} />}
          {activeTab === 'trends' && <TrendsPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'visual' && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Camera size={64} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-slate-400">Visual Analyzer</h3>
                <p className="text-slate-300 mt-2">Próximamente</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // ---- Sidebar content (reused in desktop and mobile) ----
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-10">
        <BrandLogo />
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Cerrar menú"
        >
          <X size={24} className="text-slate-900" />
        </button>
      </div>

      {/* Trust Level */}
      <div className="mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel Inquilino</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${(profile?.level ?? 0) === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
            {(profile?.level ?? 0) === 0 ? 'LEVEL 0' : 'VERIFICADO'}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#FBB03B] transition-all duration-700 ease-out shadow-sm" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-900">{verifiedCount}/{totalDocs} Docs</p>
          <button onClick={() => { handleNavigate('profile'); }} className="text-[9px] font-black text-[#FBB03B] uppercase tracking-widest hover:underline">
            Completar
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <SidebarLink icon={<Store />} label="Explorar Locales" active={activeTab === 'home'} onClick={() => handleNavigate('home')} />
        <SidebarLink icon={<MessageSquare />} label="Consultor MiLocal" active={activeTab === 'chat'} onClick={() => handleNavigate('chat')} />
        <SidebarLink icon={<TrendingUp />} label="Pulso Comercial" active={activeTab === 'trends'} onClick={() => handleNavigate('trends')} />
        <SidebarLink icon={<User />} label="Mi Perfil" active={activeTab === 'profile'} onClick={() => handleNavigate('profile')} />
        <SidebarLink icon={<Camera />} label="Visual Analyzer" active={activeTab === 'visual'} onClick={() => handleNavigate('visual')} />
      </nav>

      {/* User info + logout */}
      <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
        {/* User type toggle */}
        <button
          onClick={() => {
            if (profile) {
              const newType = profile.type === 'entrepreneur' ? 'owner' : 'entrepreneur';
              updateProfile({ ...profile, type: newType as 'entrepreneur' | 'owner' });
            }
          }}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-900 text-white hover:bg-[#FBB03B] hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100"
          aria-label={`Cambiar a ${profile?.type === 'entrepreneur' ? 'Propietario' : 'Emprendedor'}`}
        >
          <Briefcase size={14} />
          {profile?.type === 'entrepreneur' ? 'Cambiar a Propietario' : 'Cambiar a Emprendedor'}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest"
          aria-label="Cerrar sesión"
        >
          <LogOut size={14} />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* ---- Desktop Sidebar ---- */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-gray-100 p-8 sticky top-0 h-screen shadow-sm z-30">
        {sidebarContent}
      </aside>

      {/* ---- Mobile Top Bar ---- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-9 border-2 border-slate-900 rounded-xl flex items-center justify-center bg-[#FBB03B] shadow-md">
            <span className="text-[10px] font-black text-slate-900 tracking-tighter leading-none -mt-0.5">MI</span>
          </div>
          <h1 className="text-lg font-black tracking-tighter text-slate-900">MiLocal</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={24} className="text-slate-900" />
        </button>
      </div>

      {/* ---- Mobile Sidebar Overlay ---- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Slide-in sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-100 p-8 z-50 overflow-y-auto shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---- Main Content ---- */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative">
        {renderContent()}
      </main>
    </div>
  );
}

// ------------------------------------------------------------------
// App root — providers + routing
// ------------------------------------------------------------------
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="w-14 h-12 border-2 border-slate-900 rounded-2xl flex items-center justify-center bg-[#FBB03B] shadow-xl shadow-yellow-100 mx-auto mb-4 animate-pulse">
            <span className="text-xs font-black text-slate-900 tracking-tighter leading-none -mt-0.5">MI</span>
          </div>
          <p className="text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <LoginPage />
              </motion.div>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <RegisterPage />
              </motion.div>
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <ProtectedLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
