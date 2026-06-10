
import React from 'react';
import { AGENTS } from '../constants';
import UserGroupIcon from './icons/UserGroupIcon';
import StarIcon from './icons/StarIcon';
import VerifiedIcon from './icons/VerifiedIcon';

const CommunityPortal: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 animate-slide-up space-y-12 pb-40">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20">
              <UserGroupIcon />
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Comunidades de IA</h2>
          </div>
          <p className="text-gray-400 text-lg max-w-xl font-light">
            Únete a redes de especialistas lideradas por mentores que aprenden de la práctica real. Crea tu propia comunidad de coaching automotriz.
          </p>
        </div>
        <button className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-xl">
          CREAR MI COMUNIDAD DE COACHING
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="glass-card border border-white/5 rounded-[3rem] p-8 space-y-8 group hover:border-cyan-500/50 transition-all">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img src={agent.avatar} alt={agent.name} className="w-20 h-20 rounded-[2rem] object-cover border-2 border-white/10" />
                <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white p-1.5 rounded-xl">
                  <VerifiedIcon className="w-3 h-3" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{agent.name}</h3>
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-1">Mentor de Comunidad</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-gray-800 border border-gray-900 overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${i+20}`} /></div>)}
                   </div>
                   <span className="text-[10px] text-gray-500 font-bold uppercase">+{agent.communitySize} Especialistas</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <p className="text-xs text-gray-400 leading-relaxed italic line-clamp-2">"Nuestra comunidad se especializa en {agent.expertise.join(', ')}. Cada caso resuelto es una lección compartida."</p>
               <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-white font-black text-lg">7</p>
                    <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Niveles de Mentoría</p>
                  </div>
                  <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-cyan-400 font-black text-lg">2</p>
                    <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Entrenamientos Gratis</p>
                  </div>
               </div>
            </div>

            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all group-hover:bg-cyan-600 group-hover:border-transparent group-hover:text-white">
              UNIRSE A LA COMUNIDAD
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPortal;
