
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AGENTS, SUPPORTED_LANGUAGES, getLabels } from './constants';
import type { Agent, UserProfile, Language } from './types';
import AgentCard from './components/AgentCard';
import AgentDetailModal from './components/AgentDetailModal';
import AffiliateMarketplace from './components/AffiliateMarketplace';
import AcademyPortal from './components/AcademyPortal';
import ProfileDrawer from './components/ProfileDrawer';
import VINAdvisor from './components/VINAdvisor';
import AcademicIcon from './components/icons/AcademicIcon';
import SearchIcon from './components/icons/SearchIcon';
import UserGroupIcon from './components/icons/UserGroupIcon';

type View = 'advisor' | 'marketplace' | 'consulting' | 'academy';

const App: React.FC = () => {
  const [isSystemInitializing, setIsSystemInitializing] = useState(true);
  const [activeView, setActiveView] = useState<View>('advisor');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Inicializar idioma desde localStorage o defecto 'es'
  const getSavedLanguage = (): Language => {
    const saved = localStorage.getItem('autosocio_lang');
    return (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) ? (saved as Language) : 'es';
  };

  // Usuario básico para sesión, sin dashboard complejo
  const [user, setUser] = useState<UserProfile>({
    id: 'GUEST-001',
    name: 'Usuario Técnico',
    email: 'user@autosocio.com',
    phone: '',
    birthDate: '',
    residence: 'Latam',
    intent: 'Personal_Curiosity',
    tier: 'FREE',
    avatar: 'https://i.pravatar.cc/150?u=tech',
    joinedDate: new Date().toISOString(),
    trialExpiresAt: new Date().toISOString(),
    isTrialActive: false,
    language: getSavedLanguage(), // Cargar idioma guardado
    stats: { errorsAvoided: 0, sessionsCompleted: 0, roiGenerated: 0 }
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSystemInitializing(false);
    }, 1500);

    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const labels = useMemo(() => getLabels(user.language), [user.language]);

  const menuItems = useMemo(() => [
    { id: 'advisor', label: 'Asesor', icon: <span className="text-base">🤖</span> },
    { id: 'marketplace', label: labels.nav.marketplace, icon: <SearchIcon /> },
    { id: 'consulting', label: labels.nav.experts, icon: <UserGroupIcon /> },
    { id: 'academy', label: labels.nav.courses, icon: <AcademicIcon /> },
  ], [labels]);

  const handleViewChange = useCallback((view: View) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const currentLang = useMemo(() => 
    SUPPORTED_LANGUAGES.find(l => l.code === user.language) || SUPPORTED_LANGUAGES[0]
  , [user.language]);

  const handleLanguageChange = (lang: Language) => {
    localStorage.setItem('autosocio_lang', lang); // Guardar preferencia
    setUser(prev => ({ ...prev, language: lang }));
    setShowLangMenu(false);
  };

  if (isSystemInitializing) {
    return (
      <div className="fixed inset-0 bg-[#020617] z-[999] flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center gap-8 animate-fade-in">
          <div className="w-20 h-20 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-bounce">
            <span className="font-heading font-black text-4xl text-white italic">A</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-white font-black uppercase tracking-[0.4em] text-xs">AutoSocio</h2>
            <p className="text-[8px] text-cyan-500 font-bold uppercase tracking-[0.3em] animate-pulse">Cargando ADN Técnico...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-cyan-500/40 pb-32 lg:pb-0 relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#0f172a,transparent)] opacity-60 z-0"></div>
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleViewChange('marketplace')}>
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-black italic shadow-lg">A</div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white uppercase tracking-tighter leading-none">AutoSocio</span>
              <span className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.3em]">Plataforma Técnica</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id as View)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === item.id 
                    ? 'bg-cyan-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Language / User (Minimal) */}
          <div className="flex items-center gap-4">
             <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white transition-all"
              >
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.label}</span>
              </button>
              {showLangMenu && (
                <div className="absolute top-full mt-2 right-0 w-40 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-up z-[200]">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[120] bg-[#020617]/95 backdrop-blur-3xl border-t border-white/5 pb-safe pt-2">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id as View)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                activeView === item.id ? 'text-cyan-400' : 'text-gray-600'
              }`}
            >
              <div className="w-5 h-5">{item.icon}</div>
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="pt-32 px-6 max-w-7xl mx-auto relative z-10">
        
        {/* VISTA 0: ASESOR VIN (Principal) */}
        {activeView === 'advisor' && (
          <VINAdvisor
            userLanguage={user.language}
            onSearchPart={(query) => {
              handleViewChange('marketplace');
            }}
            onCallExpert={() => {
              handleViewChange('consulting');
            }}
          />
        )}

        {/* VISTA 1: MARKETPLACE (ADN) */}
        {activeView === 'marketplace' && (
             <AffiliateMarketplace userLanguage={user.language} />
        )}

        {/* VISTA 2: EXPERTOS */}
        {activeView === 'consulting' && (
          <div className="space-y-12 animate-slide-up">
            <header className="text-center space-y-4 mb-16">
               <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  {labels.hero_experts_title || "Red de Expertos"}
               </h1>
               <p className="text-gray-500 text-sm font-light max-w-xl mx-auto italic">
                 "{labels.hero_experts_subtitle || "Ingenieros y especialistas validados."}"
               </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {AGENTS.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onSelect={(a) => setSelectedAgent(a)} language={user.language} />
              ))}
            </div>
          </div>
        )}

        {/* VISTA 3: CURSOS */}
        {activeView === 'academy' && (
           <AcademyPortal user={user} onSelectAgent={(agentId) => {
              const agent = AGENTS.find(a => a.id === agentId);
              if (agent) {
                setSelectedAgent(agent);
              }
           }} />
        )}

      </main>

      {/* Modals */}
      {selectedAgent && (
        <AgentDetailModal 
          agent={selectedAgent} 
          isOpen={!!selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
          uploadedImage={null} 
          initialScenario="" 
          onSearchInMarketplace={(query) => {
             setActiveView('marketplace');
             window.scrollTo(0,0);
          }} 
          userLanguage={user.language} 
        />
      )}
    </div>
  );
};

export default App;
