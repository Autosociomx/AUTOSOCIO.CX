
import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import VerifiedIcon from './icons/VerifiedIcon';
import SparklesIcon from './icons/SparklesIcon';
import type { UserProfile, SubscriptionTier, UserIntent } from '../types';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserUpdate: (user: UserProfile | null) => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, currentUser, onUserUpdate }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'checkout'>('login');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end overflow-hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl" />
      
      <div 
        className="relative w-full max-w-xl bg-[#020617] border-l border-white/5 shadow-2xl h-full flex flex-col animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg">A</div>
            <div>
              <h3 className="text-white font-black uppercase tracking-tighter">Panel de Revisión</h3>
              <p className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.4em]">Estatus: Editor Accredited</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white transition-colors"><CloseIcon /></button>
        </div>

        <div className="flex-grow overflow-y-auto p-10 space-y-12">
          {currentUser && (
            <div className="space-y-10">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <img src={currentUser.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-white/5 mx-auto object-cover" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-full shadow-xl">Acceso Total Editor</div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{currentUser.name}</h2>
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">TITAN ELITE BYPASS ACTIVE</span>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-3xl space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                   <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-1 italic">Nota de Sistema</p>
                   <p className="text-xs text-gray-300 font-light leading-relaxed">
                     Usted está visualizando la plataforma con privilegios de **Titán Élite**. Todas las maestrías, herramientas de diagnóstico y hubs de datos están abiertos para su análisis.
                   </p>
                </div>
                <DetailRow label="ID de Sesión" value={currentUser.id} />
                <DetailRow label="Privilegio" value="REVISOR_MAESTRO" />
                <DetailRow label="Estatus de Red" value="SINCRONIZADA" />
              </div>

              <button 
                onClick={onClose} 
                className="w-full py-6 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-500 shadow-xl shadow-cyan-900/40"
              >
                Continuar Navegación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5">
    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    <span className="text-[10px] font-black text-white uppercase tracking-tighter">{value}</span>
  </div>
);

export default ProfileDrawer;
